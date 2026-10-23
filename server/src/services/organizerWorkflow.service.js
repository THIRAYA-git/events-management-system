const db = require("../config/db");

const httpError = (message, statusCode) => {
  const err = new Error(message);
  err.statusCode = statusCode;
  return err;
};

const CHECKLIST_CATEGORIES = ["decoration", "seating", "equipment", "other"];

// Shown to every organizer once they accept; they can add or delete items.
const DEFAULT_CHECKLIST = [
  ["decoration", "Stage and backdrop"],
  ["decoration", "Floral and table decorations"],
  ["seating", "Seating layout confirmed"],
  ["seating", "Tables and chairs arranged"],
  ["equipment", "Sound system and microphones"],
  ["equipment", "Lighting and projector"],
];

// Forward-only: Scheduled (confirmed) -> In Progress -> Completed
const NEXT_STATUS = { confirmed: "in_progress", in_progress: "completed" };

const WORKING = ["confirmed", "in_progress"]; // checklist is editable

/** Assignment must belong to this organizer user. Same 404 for "missing" and "not yours". */
const getOwnedAssignment = async (organizerUserId, assignmentId) => {
  const result = await db.query(
    `SELECT bo.id, bo.booking_id, bo.status::text AS status,
            b.status::text AS booking_status, b.event_date
       FROM booking_organizers bo
       JOIN organizers o ON o.organizer_id = bo.organizer_id
       JOIN bookings b ON b.booking_id = bo.booking_id
      WHERE bo.id = $1 AND o.user_id = $2`,
    [assignmentId, organizerUserId]
  );
  if (result.rows.length === 0) throw httpError("Assignment not found", 404);
  return result.rows[0];
};

const seedDefaultChecklist = async (assignmentId) => {
  const values = [];
  const params = [assignmentId];
  DEFAULT_CHECKLIST.forEach(([category, name], i) => {
    params.push(category, name);
    values.push(`($1, $${i * 2 + 2}, $${i * 2 + 3})`);
  });
  await db.query(
    `INSERT INTO organizer_checklist_items (assignment_id, category, item_name)
     VALUES ${values.join(", ")}
     ON CONFLICT DO NOTHING`,
    params
  );
};

/** Everything the organizer needs on one screen. Declined requests have no detail. */
const getAssignmentDetail = async (organizerUserId, assignmentId) => {
  const head = await db.query(
    `SELECT bo.id, bo.booking_id, bo.role_in_event, bo.agreed_fee, bo.notes,
            bo.status::text AS status, bo.assigned_at,
            b.booking_ref, b.event_type, b.custom_event_type, b.event_date,
            b.event_start_time, b.event_end_time, b.guest_count, b.room_count,
            b.special_requests, b.status::text AS booking_status,
            u.full_name AS customer_name, u.phone AS customer_phone
       FROM booking_organizers bo
       JOIN organizers o ON o.organizer_id = bo.organizer_id
       JOIN bookings b ON b.booking_id = bo.booking_id
       JOIN users u ON u.user_id = b.user_id
      WHERE bo.id = $1 AND o.user_id = $2`,
    [assignmentId, organizerUserId]
  );
  if (head.rows.length === 0) throw httpError("Assignment not found", 404);
  const a = head.rows[0];
  if (a.status === "declined") throw httpError("Assignment not found", 404);

  const accepted = a.status !== "assigned";
  const bookingId = a.booking_id;

  const [halls, catering, sponsors, timeline, checklist] = await Promise.all([
    db.query(
      `SELECT h.hall_id, h.hall_name, h.capacity
         FROM hall_bookings hb JOIN halls h ON h.hall_id = hb.hall_id
        WHERE hb.booking_id = $1 ORDER BY h.hall_name`,
      [bookingId]
    ),
    db.query(
      `SELECT order_id, status::text AS status, guest_count, delivery_time,
              special_notes, menu_items
         FROM catering_orders
        WHERE booking_id = $1 AND status::text <> 'cancelled'
        ORDER BY created_at`,
      [bookingId]
    ),
    db.query(
      `SELECT s.company_name, s.industry, bs.proposed_amount
         FROM booking_sponsors bs JOIN sponsors s ON s.sponsor_id = bs.sponsor_id
        WHERE bs.booking_id = $1 AND bs.status::text = 'accepted'
        ORDER BY s.company_name`,
      [bookingId]
    ),
    db.query(
      `SELECT timeline_id, activity_name, category, start_time, end_time, assigned_to, notes
         FROM event_timelines WHERE booking_id = $1
        ORDER BY start_time, sequence_order`,
      [bookingId]
    ),
    accepted
      ? db.query(
          `SELECT item_id, category, item_name, is_done, done_at
             FROM organizer_checklist_items WHERE assignment_id = $1
            ORDER BY category, item_id`,
          [assignmentId]
        )
      : Promise.resolve({ rows: [] }),
  ]);

  return {
    assignment: {
      id: a.id,
      booking_id: a.booking_id,
      role_in_event: a.role_in_event,
      agreed_fee: a.agreed_fee,
      notes: a.notes,
      status: a.status,
      assigned_at: a.assigned_at,
    },
    booking: {
      booking_ref: a.booking_ref,
      event_type: a.event_type === "Other" && a.custom_event_type ? a.custom_event_type : a.event_type,
      event_date: a.event_date,
      event_start_time: a.event_start_time,
      event_end_time: a.event_end_time,
      guest_count: a.guest_count,
      room_count: a.room_count,
      special_requests: a.special_requests,
      status: a.booking_status,
      customer_name: a.customer_name,
      // contact number is only shared once the organizer has accepted
      customer_phone: accepted ? a.customer_phone : null,
    },
    halls: halls.rows,
    catering: catering.rows,
    sponsors: sponsors.rows,
    timeline: timeline.rows,
    checklist: checklist.rows,
    canEditChecklist: WORKING.includes(a.status),
  };
};

/** Scheduled -> In Progress -> Completed. Atomic: the UPDATE only matches the expected current status. */
const updateProgress = async (organizerUserId, assignmentId, targetStatus) => {
  const a = await getOwnedAssignment(organizerUserId, assignmentId);

  if (a.status === "assigned") {
    throw httpError("Accept this request before updating progress.", 409);
  }
  if (!NEXT_STATUS[a.status]) {
    throw httpError(`This event is already ${a.status.replace("_", " ")}.`, 409);
  }
  if (NEXT_STATUS[a.status] !== targetStatus) {
    throw httpError(
      `Progress moves forward only: ${a.status.replace("_", " ")} → ${NEXT_STATUS[a.status].replace("_", " ")}.`,
      409
    );
  }
  if (a.booking_status === "cancelled") {
    throw httpError("This booking was cancelled.", 409);
  }

  // Completed means the event has happened (Sri Lanka calendar day)
  const completedGuard =
    targetStatus === "completed"
      ? `AND (SELECT event_date FROM bookings WHERE booking_id = bo.booking_id)
              <= (NOW() AT TIME ZONE 'Asia/Colombo')::date`
      : "";

  const result = await db.query(
    `UPDATE booking_organizers bo
        SET status = $1
      WHERE bo.id = $2 AND bo.status::text = $3 ${completedGuard}
      RETURNING bo.id, bo.status::text AS status`,
    [targetStatus, assignmentId, a.status]
  );
  if (result.rows.length === 0) {
    if (targetStatus === "completed") {
      throw httpError("An event can only be marked completed on or after its event date.", 409);
    }
    throw httpError("This event was already updated. Please refresh.", 409);
  }
  return result.rows[0];
};

// ── Checklist ───────────────────────────────────────────────────────────────
const assertEditable = (a) => {
  if (!WORKING.includes(a.status)) {
    throw httpError(
      a.status === "assigned"
        ? "Accept this request before editing the checklist."
        : "The checklist is locked once the event is completed.",
      409
    );
  }
};

const addChecklistItem = async (organizerUserId, assignmentId, category, itemName) => {
  const a = await getOwnedAssignment(organizerUserId, assignmentId);
  assertEditable(a);
  try {
    const result = await db.query(
      `INSERT INTO organizer_checklist_items (assignment_id, category, item_name)
       VALUES ($1, $2, $3)
       RETURNING item_id, category, item_name, is_done, done_at`,
      [assignmentId, category, itemName]
    );
    return result.rows[0];
  } catch (err) {
    if (err.code === "23505") throw httpError("That item is already on the checklist.", 409);
    throw err;
  }
};

const setChecklistItemDone = async (organizerUserId, assignmentId, itemId, isDone) => {
  const a = await getOwnedAssignment(organizerUserId, assignmentId);
  assertEditable(a);
  const result = await db.query(
    `UPDATE organizer_checklist_items
        SET is_done = $1, done_at = CASE WHEN $1 THEN NOW() ELSE NULL END
      WHERE item_id = $2 AND assignment_id = $3
      RETURNING item_id, category, item_name, is_done, done_at`,
    [isDone, itemId, assignmentId]
  );
  if (result.rows.length === 0) throw httpError("Checklist item not found", 404);
  return result.rows[0];
};

const deleteChecklistItem = async (organizerUserId, assignmentId, itemId) => {
  const a = await getOwnedAssignment(organizerUserId, assignmentId);
  assertEditable(a);
  const result = await db.query(
    `DELETE FROM organizer_checklist_items WHERE item_id = $1 AND assignment_id = $2`,
    [itemId, assignmentId]
  );
  if (result.rowCount === 0) throw httpError("Checklist item not found", 404);
};

module.exports = {
  CHECKLIST_CATEGORIES,
  seedDefaultChecklist,
  getAssignmentDetail,
  updateProgress,
  addChecklistItem,
  setChecklistItemDone,
  deleteChecklistItem,
};
