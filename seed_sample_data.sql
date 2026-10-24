-- =====================================================================
-- OPTIONAL sample data for the Aazath Plaza EMS demonstration
--
-- Run on a CLEAN database (after cleanup_for_submission.sql):
--   psql -U postgres -d ems_db -v ON_ERROR_STOP=1 -f seed_sample_data.sql
--
-- What it adds (all dates are relative to the day you run it):
--   4 sample customers (no password, so they cannot sign in)
--   17 bookings: 8 completed, 5 confirmed (one is today), 3 pending, 1 cancelled
--   hall bookings, payments with invoice numbers, catering orders,
--   event timelines, organizer assignments and checklists, sponsorship
--   requests, feedback, room reservations, notifications and audit entries
-- Sample records are marked SAMPLE in transaction IDs.
-- To remove everything again, run cleanup_for_submission.sql.
-- =====================================================================

BEGIN;

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM bookings) THEN
        RAISE EXCEPTION 'bookings is not empty. Run cleanup_for_submission.sql first.';
    END IF;
END $$;

-- 1. Sample customers (password_hash is NULL, so these accounts cannot log in)
INSERT INTO users (full_name, email, password_hash, phone, role, is_active, is_verified)
VALUES
    ('Nimal Perera',   'sample.nimal@example.com', NULL, '+94770000001', 'customer', true, true),
    ('Aysha Rahman',   'sample.aysha@example.com', NULL, '+94770000002', 'customer', true, true),
    ('Kasun Fernando', 'sample.kasun@example.com', NULL, '+94770000003', 'customer', true, true),
    ('Fazil Mohamed',  'sample.fazil@example.com', NULL, '+94770000004', 'customer', true, true)
ON CONFLICT (email) DO NOTHING;

-- 2. Booking plan. off = days from today. hall: H1, H2 or BOTH (two halls).
CREATE TEMP TABLE tmp_b ON COMMIT DROP AS
SELECT v.n, u.user_id, v.off,
       v.st::time AS start_time, v.en::time AS end_time,
       v.etype, v.custom, v.guests,
       v.status::booking_status AS status,
       v.rooms, v.disc, v.hall, v.req, v.cancel_reason,
       (CURRENT_DATE + LEAST(v.off - 21, -1 - (v.n % 6)))::timestamp + time '10:15' AS created,
       NULL::text AS ref,
       NULL::int  AS booking_id
FROM (VALUES
 (1,  'sample.nimal@example.com',      -118, '09:00', '14:00', 'Wedding Function',         NULL::text,          350, 'completed', 0,    0, 'H1',   'Vegetarian menu preferred.',                 NULL::text),
 (2,  'thirayafathima@gmail.com',       -96, '09:00', '14:00', 'School Event',             NULL,                400, 'completed', 0,    0, 'H2',   'Annual prize giving.',                       NULL),
 (3,  'sample.aysha@example.com',       -81, '10:00', '15:00', 'Birthday Function',        NULL,                180, 'completed', 2,    0, 'H1',   'Balloon decoration. Two rooms for family.',  NULL),
 (4,  'sample.kasun@example.com',       -64, '09:00', '13:00', 'Political Event',          NULL,                450, 'completed', 0,    0, 'H2',   'Projector and microphones required.',        NULL),
 (5,  'thirayafathima@gmail.com',       -49, '10:00', '21:00', 'Wedding Function',         NULL,                900, 'completed', 3,    0, 'BOTH', 'Both halls. Separate seating arrangements.', NULL),
 (6,  'sample.nimal@example.com',       -35, '09:00', '14:00', 'School Event',             NULL,                250, 'completed', 0,    0, 'H1',   NULL,                                         NULL),
 (7,  'sample.fazil@example.com',       -20, '11:00', '16:00', 'Birthday Function',        NULL,                300, 'completed', 1, 2000, 'H2',   'Cake table near the stage.',                 NULL),
 (8,  'thirayafathima@gmail.com',        -9, '17:00', '22:00', 'Other',                    'Engagement Party',  200, 'completed', 0,    0, 'H1',   'Soft lighting.',                             NULL),
 (9,  'sample.aysha@example.com',         0, '09:00', '14:00', 'School Event',             NULL,                300, 'confirmed', 0,    0, 'H1',   'Sports day prize giving.',                   NULL),
 (10, 'thirayafathima@gmail.com',         3, '09:00', '14:00', 'Birthday Function',        NULL,                250, 'confirmed', 2,    0, 'H2',   'Stage decoration and cake table.',           NULL),
 (11, 'sample.aysha@example.com',         9, '09:00', '21:00', 'Wedding Function',         NULL,               1000, 'confirmed', 4,    0, 'BOTH', 'Both halls and four guest rooms.',           NULL),
 (12, 'sample.kasun@example.com',        16, '09:00', '14:00', 'Political Event (Large)',  NULL,                500, 'confirmed', 0,    0, 'H1',   NULL,                                         NULL),
 (13, 'sample.fazil@example.com',        27, '10:00', '15:00', 'Walima Event',             NULL,                500, 'confirmed', 0,    0, 'H2',   'Traditional setup.',                         NULL),
 (14, 'thirayafathima@gmail.com',        12, '09:00', '14:00', 'School Event',             NULL,                150, 'pending',   0,    0, 'H2',   NULL,                                         NULL),
 (15, 'sample.fazil@example.com',        20, '11:00', '16:00', 'Birthday Function',        NULL,                200, 'pending',   1,    0, 'H1',   'Need cake and juice bar.',                   NULL),
 (16, 'sample.nimal@example.com',        33, '10:00', '21:00', 'Wedding Function',         NULL,                700, 'pending',   2,    0, 'BOTH', NULL,                                         NULL),
 (17, 'sample.kasun@example.com',        14, '09:00', '14:00', 'School Event',             NULL,                120, 'cancelled', 0,    0, 'H2',   NULL,                                         'Customer changed the date.')
) AS v(n, email, off, st, en, etype, custom, guests, status, rooms, disc, hall, req, cancel_reason)
JOIN users u ON u.email = v.email;

UPDATE tmp_b
SET ref = 'AP-' || to_char(created, 'YYYYMMDD') || '-' || lpad(n::text, 4, '0');

-- 3. Bookings. Prices come from event_pricing, rooms are LKR 5,000 each.
INSERT INTO bookings
    (user_id, booking_ref, event_date, event_start_time, event_end_time, event_type,
     guest_count, status, base_amount, addon_amount, discount_amount, tax_amount, total_amount,
     special_requests, confirmed_by, confirmed_at, cancelled_at, cancel_reason,
     created_at, updated_at, room_count, custom_event_type)
SELECT t.user_id, t.ref, CURRENT_DATE + t.off, t.start_time, t.end_time, t.etype,
       t.guests, t.status, ep.base_price, t.rooms * 5000, t.disc, 0,
       ep.base_price + t.rooms * 5000 - t.disc,
       t.req,
       CASE WHEN t.status IN ('confirmed', 'completed')
            THEN (SELECT user_id FROM users WHERE email = 'admin@aazathplaza.lk') END,
       CASE WHEN t.status IN ('confirmed', 'completed') THEN t.created + interval '5 hours' END,
       CASE WHEN t.status = 'cancelled' THEN t.created + interval '2 days' END,
       t.cancel_reason,
       t.created, t.created, t.rooms, t.custom
FROM tmp_b t
JOIN event_pricing ep ON ep.event_type = t.etype
ORDER BY t.n;

UPDATE tmp_b t SET booking_id = b.booking_id
FROM bookings b WHERE b.booking_ref = t.ref;

-- 4. Hall bookings. A two-hall booking has one primary row and one complimentary row.
INSERT INTO hall_bookings
    (hall_id, booking_id, event_date, event_start_time, event_end_time, status, created_at, is_complimentary)
SELECT h.hall_id, t.booking_id, CURRENT_DATE + t.off, t.start_time, t.end_time, t.status, t.created, x.comp
FROM tmp_b t
JOIN (VALUES
        ('H1',   'Hall 1 - Grand',   false),
        ('H2',   'Hall 2 - Banquet', false),
        ('BOTH', 'Hall 1 - Grand',   false),
        ('BOTH', 'Hall 2 - Banquet', true)
     ) AS x(kind, hall_name, comp) ON x.kind = t.hall
JOIN halls h ON h.hall_name = x.hall_name
ORDER BY t.n, x.comp;

-- 5. Payments: paid for completed and confirmed events, one still pending,
--    and one refunded for the cancelled booking.
INSERT INTO payments
    (booking_id, amount, payment_method, transaction_id, payhere_order_id, status, currency,
     paid_at, refunded_at, refund_reason, created_at)
SELECT t.booking_id, b.total_amount,
       (ARRAY['credit_card', 'debit_card', 'mobile_wallet', 'bank_transfer'])[1 + t.n % 4]::payment_method,
       CASE WHEN t.n = 13 THEN NULL ELSE 'SAMPLE-TXN-' || lpad(t.n::text, 4, '0') END,
       'AZP-' || t.booking_id || '-SAMPLE',
       (CASE WHEN t.status = 'cancelled' THEN 'refunded'
             WHEN t.n = 13 THEN 'pending'
             ELSE 'completed' END)::payment_status,
       'LKR',
       CASE WHEN t.n = 13 THEN NULL ELSE t.created + interval '5 hours' END,
       CASE WHEN t.status = 'cancelled' THEN b.cancelled_at END,
       CASE WHEN t.status = 'cancelled' THEN 'Customer cancelled the booking.' END,
       t.created + interval '4 hours'
FROM tmp_b t
JOIN bookings b ON b.booking_id = t.booking_id
WHERE t.status IN ('completed', 'confirmed', 'cancelled')
ORDER BY t.n;

UPDATE payments
SET invoice_number = 'INV-' || to_char(paid_at, 'YYYYMMDD') || '-' || payment_id
WHERE status IN ('completed', 'refunded') AND invoice_number IS NULL;

-- 6. Catering orders from the Althab menu (per-guest items use the guest count).
CREATE TEMP TABLE tmp_cat (n int, item_id int, per_guest boolean) ON COMMIT DROP;
INSERT INTO tmp_cat VALUES
    (1, 1, true), (1, 10, true), (1, 14, true), (1, 17, false),
    (3, 2, true), (3, 15, true), (3, 18, false),
    (5, 1, true), (5, 7, true),  (5, 10, true), (5, 14, true), (5, 17, false),
    (7, 6, true), (7, 14, true), (7, 18, false),
    (9, 7, true), (9, 14, true),
    (10, 2, true), (10, 10, true), (10, 18, false),
    (11, 2, true), (11, 10, true), (11, 14, true), (11, 17, false),
    (12, 6, true), (12, 15, true),
    (14, 7, true), (14, 14, true),
    (15, 2, true), (15, 18, false);

INSERT INTO catering_orders
    (booking_id, menu_items, total_cost, guest_count, status, special_notes, delivery_time,
     confirmed_at, delivered_at, created_at, updated_at)
SELECT t.booking_id,
       jsonb_agg(jsonb_build_object(
           'item_id', m.item_id, 'discount', 0, 'quantity', q.qty,
           'subtotal', m.price * q.qty, 'item_name', m.item_name, 'unit_price', m.price)
           ORDER BY m.item_id),
       SUM(m.price * q.qty),
       t.guests,
       (CASE t.status
            WHEN 'completed' THEN 'delivered'
            WHEN 'confirmed' THEN CASE WHEN t.off = 0 THEN 'preparing' ELSE 'confirmed' END
            ELSE 'pending' END)::order_status,
       CASE t.n WHEN 1 THEN 'Vegetarian menu. No beef.'
                WHEN 10 THEN 'Cake delivered by 1:30 PM.'
                WHEN 15 THEN 'No nuts in the cake.' END,
       time '11:30',
       CASE WHEN t.status <> 'pending' THEN t.created + interval '6 hours' END,
       CASE WHEN t.status = 'completed' THEN (CURRENT_DATE + t.off)::timestamp + time '12:30' END,
       t.created + interval '10 minutes',
       t.created + interval '10 minutes'
FROM tmp_cat c
JOIN tmp_b t ON t.n = c.n
JOIN menu_items m ON m.item_id = c.item_id
CROSS JOIN LATERAL (SELECT CASE WHEN c.per_guest THEN t.guests ELSE 1 END AS qty) q
GROUP BY t.booking_id, t.guests, t.status, t.off, t.created, t.n
ORDER BY t.n;

-- 7. Event timelines for today and the next two confirmed events.
INSERT INTO event_timelines
    (booking_id, activity_name, start_time, end_time, assigned_to, notes, sequence_order, category)
SELECT t.booking_id, v.activity, v.st::time, v.en::time, v.assigned, v.notes, v.seq, v.category
FROM (VALUES
 (9,  'Chair and stage setup',        '07:00', '08:30', 'Event Coordinator',  'Arrange 300 chairs facing the stage.', 1, 'setup'),
 (9,  'Banner and decoration check',  '08:30', '09:00', 'Event Organizer',    NULL,                                   2, 'decoration'),
 (9,  'Lunch service',                '12:00', '13:00', 'Althab Restaurant',  'Short eats and soft drinks.',          3, 'catering'),
 (9,  'Floor cleanup',                '14:00', '15:30', 'Hall Staff',         NULL,                                   4, 'cleanup'),
 (10, 'Stage and balloon decoration', '07:00', '09:00', 'Event Organizer',    'Pink and gold theme.',                 1, 'decoration'),
 (10, 'Cake delivery',                '13:15', '13:30', 'Althab Restaurant',  NULL,                                   2, 'catering'),
 (10, 'Cleanup',                      '14:30', '16:00', 'Hall Staff',         NULL,                                   3, 'cleanup'),
 (11, 'Chair arrangement, both halls','06:00', '08:00', 'Event Coordinator',  'About 1,000 seats in total.',          1, 'setup'),
 (11, 'Wedding stage and decoration', '08:00', '12:00', 'Event Organizer',    NULL,                                   2, 'decoration'),
 (11, 'Dinner service',               '18:00', '20:00', 'Althab Restaurant',  NULL,                                   3, 'catering'),
 (11, 'Hall and floor cleanup',       '21:30', '23:30', 'Hall Staff',         NULL,                                   4, 'cleanup')
) AS v(n, activity, st, en, assigned, notes, seq, category)
JOIN tmp_b t ON t.n = v.n
ORDER BY v.n, v.seq;

-- 8. Organizer assignments and arrangement checklists.
INSERT INTO booking_organizers
    (booking_id, organizer_id, role_in_event, agreed_fee, status, notes, assigned_at, decline_reason, responded_at)
SELECT t.booking_id, o.organizer_id, v.role_in_event, v.fee, v.status, v.notes,
       t.created + interval '6 hours', v.decline,
       CASE WHEN v.status IN ('confirmed', 'completed', 'declined') THEN t.created + interval '12 hours' END
FROM (VALUES
 (1,  'riyaz@events.lk',         'Full Wedding Decoration and Stage Setup', 55000, 'completed', 'Traditional wedding decor.',   NULL::text),
 (3,  'fathima@decorations.lk',  'Balloon and Floral Decoration',           18000, 'completed', NULL,                          NULL),
 (5,  'riyaz@events.lk',         'Luxury Wedding Decoration',               75000, 'completed', 'Premium floral and lighting.', NULL),
 (9,  'fathima@decorations.lk',  'Stage and Banner Setup',                  12000, 'confirmed', NULL,                          NULL),
 (10, 'fathima@decorations.lk',  'Birthday Stage Decoration',               20000, 'confirmed', 'Pink and gold theme.',        NULL),
 (11, 'riyaz@events.lk',         'Decoration Lead',                         60000, 'confirmed', NULL,                          NULL),
 (11, 'fathima@decorations.lk',  'Floral Centrepieces',                     30000, 'assigned',  NULL,                          NULL),
 (12, 'riyaz@events.lk',         'Stage and Banner Setup',                  25000, 'assigned',  NULL,                          NULL),
 (12, 'fathima@decorations.lk',  'Stage and Banner Setup',                  25000, 'declined',  NULL,                          'Already booked on that day.')
) AS v(n, email, role_in_event, fee, status, notes, decline)
JOIN tmp_b t ON t.n = v.n
JOIN users u ON u.email = v.email
JOIN organizers o ON o.user_id = u.user_id
ORDER BY v.n;

INSERT INTO organizer_checklist_items (assignment_id, category, item_name, is_done, done_at)
SELECT bo.id, c.category, c.item_name, c.is_done,
       CASE WHEN c.is_done THEN (CURRENT_DATE - 1)::timestamp + time '15:00' END
FROM booking_organizers bo
JOIN tmp_b t ON t.booking_id = bo.booking_id AND t.n IN (9, 10, 11)
CROSS JOIN (VALUES
    ('decoration', 'Stage backdrop installed',  true),
    ('decoration', 'Flower arrangements ready', false),
    ('seating',    'Round tables arranged',     true),
    ('equipment',  'Sound system tested',       false),
    ('other',      'Welcome board placed',      false)
) AS c(category, item_name, is_done)
WHERE bo.status = 'confirmed';

-- 9. Sponsorship requests.
INSERT INTO booking_sponsors
    (booking_id, sponsor_id, proposed_amount, message, status, responded_by, responded_at, requested_at, direction)
SELECT t.booking_id, s.sponsor_id, v.amount, v.message, v.status::sponsor_request_status,
       CASE WHEN v.status = 'accepted' THEN t.user_id END,
       CASE WHEN v.status = 'accepted' THEN t.created + interval '12 hours' END,
       t.created + interval '8 hours',
       v.direction::sponsor_request_direction
FROM (VALUES
 (5,  'sponsor@zamzam.lk',        80000, 'Happy to sponsor the jewellery display.',  'accepted', 'sponsor_to_customer'),
 (11, 'sponsor@zamzam.lk',       100000, 'We would like to support this wedding.',   'accepted', 'sponsor_to_customer'),
 (12, 'sponsor@akbartraders.lk',  50000, 'Interested in banners at this event.',     'pending',  'sponsor_to_customer'),
 (10, 'sponsor@akbartraders.lk',  20000, 'Would you accept our sponsorship?',        'pending',  'customer_to_sponsor')
) AS v(n, email, amount, message, status, direction)
JOIN tmp_b t ON t.n = v.n
JOIN users u ON u.email = v.email
JOIN sponsors s ON s.user_id = u.user_id;

-- 10. Customer feedback for completed events (bookings 7 and 8 are left without feedback).
INSERT INTO feedback
    (booking_id, user_id, rating, title, comment, is_public, admin_reply, replied_at, created_at)
SELECT t.booking_id, t.user_id, v.rating, v.title, v.comment, v.is_public, v.reply,
       CASE WHEN v.reply IS NOT NULL THEN (CURRENT_DATE + t.off)::timestamp + interval '2 days' END,
       (CURRENT_DATE + t.off)::timestamp + interval '1 day'
FROM (VALUES
 (1, 5, 'Beautiful wedding day',        'The hall was decorated perfectly and the staff were very helpful throughout.', true,  'Thank you for your kind words.'),
 (2, 4, 'Well organised school event',  'Good seating for students and parents. The staff were polite.',                true,  'Thank you for your feedback.'),
 (3, 5, 'Perfect birthday venue',       'Easy booking, clean hall and great food from the restaurant partner.',         true,  'Glad you enjoyed the event.'),
 (4, 3, 'Good hall, sound system issue','The hall was large enough, but the microphones failed at the start.',          false, NULL),
 (5, 5, 'Grand wedding reception',      'Both halls worked well for our 900 guests. Highly recommended.',               true,  'Thank you very much.'),
 (6, 4, 'Smooth event',                 'Everything started on time. Parking was a little limited.',                    true,  NULL)
) AS v(n, rating, title, comment, is_public, reply)
JOIN tmp_b t ON t.n = v.n;

-- 11. Standalone room reservations (no hall booking).
INSERT INTO room_reservations
    (reservation_ref, user_id, room_id, check_in, check_out, guests, total_amount,
     status, payment_status, created_at, group_ref, transaction_id, payment_method, paid_at)
SELECT 'RM-' || to_char(CURRENT_DATE + v.ci - 2, 'YYMMDD') || '-' || upper(substr(md5('rm' || v.n), 1, 5)),
       u.user_id, r.room_id,
       CURRENT_DATE + v.ci, CURRENT_DATE + v.co, v.guests,
       (v.co - v.ci) * r.rate_per_day,
       v.status, v.pay,
       (CURRENT_DATE + LEAST(v.ci - 2, -1))::timestamp + time '09:30',
       'RG-' || to_char(CURRENT_DATE + v.ci - 2, 'YYMMDD') || '-' || upper(substr(md5('rg' || v.n), 1, 6)),
       CASE WHEN v.pay = 'paid' THEN 'SAMPLE-RM-' || lpad(v.n::text, 4, '0') END,
       CASE WHEN v.pay = 'paid' THEN 'VISA' END,
       CASE WHEN v.pay = 'paid' THEN (CURRENT_DATE + LEAST(v.ci - 2, -1))::timestamp + time '09:40' END
FROM (VALUES
 (1, 'thirayafathima@gmail.com',  'Room 1', -30, -28, 2, 'completed', 'paid'),
 (2, 'sample.nimal@example.com',  'Room 2', -14, -12, 1, 'completed', 'paid'),
 (3, 'thirayafathima@gmail.com',  'Room 3',   5,   8, 2, 'confirmed', 'paid'),
 (4, 'sample.aysha@example.com',  'Room 4',  10,  12, 3, 'confirmed', 'paid'),
 (5, 'thirayafathima@gmail.com',  'Room 2',  20,  22, 1, 'cancelled', 'unpaid')
) AS v(n, email, room_name, ci, co, guests, status, pay)
JOIN users u ON u.email = v.email
JOIN rooms r ON r.room_name = v.room_name
ORDER BY v.n;

-- 12. Notifications (in-app) for admin, front desk, restaurant and organizers.
INSERT INTO notifications (user_id, booking_id, type, channel, subject, message, is_sent, sent_at, created_at, is_read)
SELECT u.user_id, t.booking_id, 'booking_confirmation'::notification_type, 'in_app'::notification_channel,
       'New booking request - ' || t.ref,
       'A customer requested ' || t.etype || ' on ' || to_char(CURRENT_DATE + t.off, 'YYYY-MM-DD') ||
       ' (' || t.guests || ' guests).',
       true, t.created, t.created, false
FROM tmp_b t
JOIN users u ON u.email IN ('admin@aazathplaza.lk', 'staff@aazathplaza.lk')
WHERE t.status = 'pending';

INSERT INTO notifications (user_id, booking_id, type, channel, subject, message, is_sent, sent_at, created_at, is_read)
SELECT u.user_id, t.booking_id, 'catering_update'::notification_type, 'in_app'::notification_channel,
       'New catering order #' || co.order_id || ' - ' || t.ref,
       'A customer ordered catering for ' || co.guest_count || ' guests (LKR ' ||
       to_char(co.total_cost, 'FM999,999,990.00') || ').',
       true, co.created_at, co.created_at, false
FROM catering_orders co
JOIN tmp_b t ON t.booking_id = co.booking_id
JOIN users u ON u.email = 'althab@restaurant.lk'
WHERE co.status = 'pending';

INSERT INTO notifications (user_id, booking_id, type, channel, subject, message, is_sent, sent_at, created_at, is_read)
SELECT o.user_id, bo.booking_id, 'general'::notification_type, 'in_app'::notification_channel,
       'New assignment - ' || t.ref,
       'You were assigned to a ' || t.etype || ' on ' || to_char(CURRENT_DATE + t.off, 'YYYY-MM-DD') ||
       ' as ' || bo.role_in_event || '. Please review it in Event Requests.',
       true, bo.assigned_at, bo.assigned_at, false
FROM booking_organizers bo
JOIN organizers o ON o.organizer_id = bo.organizer_id
JOIN tmp_b t ON t.booking_id = bo.booking_id
WHERE bo.status = 'assigned';

-- 13. Audit trail for the sample bookings.
INSERT INTO audit_log (user_id, action, table_name, record_id, new_values, ip_address, created_at)
SELECT t.user_id, 'CREATE_BOOKING', 'bookings', t.booking_id,
       jsonb_build_object('booking_ref', t.ref, 'event_type', t.etype, 'event_date', CURRENT_DATE + t.off),
       '127.0.0.1', t.created
FROM tmp_b t
UNION ALL
SELECT (SELECT user_id FROM users WHERE email = 'admin@aazathplaza.lk'),
       'CONFIRM_BOOKING', 'bookings', t.booking_id,
       jsonb_build_object('booking_ref', t.ref, 'status', 'confirmed'),
       '127.0.0.1', t.created + interval '5 hours'
FROM tmp_b t
WHERE t.status IN ('confirmed', 'completed')
UNION ALL
SELECT t.user_id, 'CANCEL_BOOKING', 'bookings', t.booking_id,
       jsonb_build_object('booking_ref', t.ref, 'status', 'cancelled'),
       '127.0.0.1', t.created + interval '2 days'
FROM tmp_b t
WHERE t.status = 'cancelled'
ORDER BY 7;

COMMIT;

-- =====================================================================
-- Check (expected: bookings 17, hall_bookings 20, payments 14,
-- catering_orders 10, feedback 6, room_reservations 5)
-- =====================================================================
SELECT 'bookings' AS tbl, COUNT(*) FROM bookings
UNION ALL SELECT 'hall_bookings',     COUNT(*) FROM hall_bookings
UNION ALL SELECT 'payments',          COUNT(*) FROM payments
UNION ALL SELECT 'catering_orders',   COUNT(*) FROM catering_orders
UNION ALL SELECT 'event_timelines',   COUNT(*) FROM event_timelines
UNION ALL SELECT 'booking_organizers',COUNT(*) FROM booking_organizers
UNION ALL SELECT 'booking_sponsors',  COUNT(*) FROM booking_sponsors
UNION ALL SELECT 'feedback',          COUNT(*) FROM feedback
UNION ALL SELECT 'room_reservations', COUNT(*) FROM room_reservations
UNION ALL SELECT 'notifications',     COUNT(*) FROM notifications;

SELECT date_trunc('month', month)::date AS month, total_bookings, gross_revenue
FROM v_monthly_revenue ORDER BY month;
