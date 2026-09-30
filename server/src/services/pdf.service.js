const PDFDocument = require("pdfkit");

// ── Config ────────────────────────────────────────────────────────────────
const ROOM_RATE_PER_DAY = 5000; // LKR per room per day (same rate as pricing.service.js)
const TZ = "Asia/Colombo"; // Sri Lanka Standard Time, UTC+05:30

// Catering is paid separately to the restaurant. It is listed on the invoice for
// reference but is never part of the subtotal or "Total Paid".
const BRAND = "#6d28d9";
const BRAND_DARK = "#4c1d95";
const TINT = "#f5f3ff";
const INK = "#111827";
const MUTED = "#6b7280";
const RULE = "#e5e7eb";

const PAGE_W = 595.28;
const PAGE_H = 841.89;
const M = 40;
const CONTENT_W = PAGE_W - M * 2;
const FOOTER_H = 44;
const BOTTOM = PAGE_H - FOOTER_H - 18; // lowest y content may reach

// ── Formatters ────────────────────────────────────────────────────────────
const money = (n) =>
  "LKR " +
  Number(n || 0).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

// event_date is a DATE column; pg returns it as a Date at server-local
// midnight, so read its local parts instead of converting timezones.
const fmtEventDate = (v) => {
  if (!v) return "N/A";
  let y, m, d;
  if (v instanceof Date) {
    y = v.getFullYear();
    m = v.getMonth();
    d = v.getDate();
  } else {
    const p = String(v).slice(0, 10).split("-").map(Number);
    y = p[0];
    m = p[1] - 1;
    d = p[2];
  }
  return new Date(Date.UTC(y, m, d)).toLocaleDateString("en-GB", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
};

const fmtClock = (t) => {
  if (!t) return "";
  const [h, mi] = String(t).split(":").map(Number);
  return `${((h + 11) % 12) + 1}:${String(mi).padStart(2, "0")} ${
    h >= 12 ? "PM" : "AM"
  }`;
};

const fmtDateSL = (v) =>
  v
    ? new Date(v).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        timeZone: TZ,
      })
    : "N/A";

const fmtDateTimeSL = (v) =>
  v
    ? new Date(v).toLocaleString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
        timeZone: TZ,
      }) + " (SLST)"
    : "N/A";

const titleCase = (s) =>
  String(s || "N/A")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

// ── Catering lines: one row per distinct menu item ───────────────────────
const NO_PLURAL = new Set(["kg", "g", "l", "ml", "lb", "oz"]);
const plural = (unit, qty) => {
  const u = String(unit || "").trim();
  if (!u) return "";
  if (qty === 1 || NO_PLURAL.has(u.toLowerCase()) || /s$/i.test(u)) return u;
  return u + "s";
};

// itemInfo: { [item_id]: { unit: 'parcel', restaurant: 'Althaf Restaurant' } }
// (a plain string value is treated as just the unit)
const cateringLines = (orders = [], itemInfo = {}) => {
  const merged = new Map();
  orders.forEach((o) => {
    let items = o.menu_items;
    if (typeof items === "string") {
      try {
        items = JSON.parse(items);
      } catch {
        items = [];
      }
    }
    (Array.isArray(items) ? items : []).forEach((l) => {
      const qty = Number(l.quantity) || 0;
      const unitPrice = Number(l.unit_price) || 0;
      const amount =
        l.subtotal != null
          ? Number(l.subtotal)
          : qty * unitPrice - Number(l.discount || 0);
      const key = l.item_id != null ? `id:${l.item_id}` : `n:${l.item_name}`;
      const info = itemInfo[l.item_id];
      const row = merged.get(key) || {
        name: l.item_name || "Menu item",
        unitName: (typeof info === "string" ? info : info?.unit) || "",
        restaurant:
          (typeof info === "object" && info?.restaurant) || "the restaurant",
        qty: 0,
        amount: 0,
      };
      row.qty += qty;
      row.amount += amount;
      merged.set(key, row);
    });
  });
  return [...merged.values()].map((r) => ({
    ...r,
    // average unit price (equals the real price when it never changed)
    unit: r.qty ? r.amount / r.qty : 0,
    label: `${r.name} (${r.qty}${
      plural(r.unitName, r.qty) ? " " + plural(r.unitName, r.qty) : ""
    })`,
  }));
};

// ── Main ──────────────────────────────────────────────────────────────────
const generateInvoicePdf = ({
  booking,
  payment,
  customer,
  cateringOrders = [],
  itemInfo = {},
  organizers = [],
}) => {
  return new Promise((resolve, reject) => {
    // margin 0: we place everything ourselves, so pdfkit never auto-breaks.
    const doc = new PDFDocument({ size: "A4", margin: 0 });
    const chunks = [];
    doc.on("data", (c) => chunks.push(c));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    const text = (str, x, y, opts = {}) =>
      doc.text(String(str), x, y, { lineBreak: true, ...opts });

    // ── Footer (every page) ──
    const drawFooter = () => {
      doc.rect(0, PAGE_H - FOOTER_H, PAGE_W, FOOTER_H).fill(BRAND);
      doc.fillColor("#ffffff").font("Helvetica-Bold").fontSize(10);
      text("Thank you for choosing Aazath Plaza", M, PAGE_H - FOOTER_H + 12, {
        width: CONTENT_W,
        lineBreak: false,
      });
      doc.font("Helvetica").fontSize(8).fillColor("#ddd6fe");
      text(
        "Colombo - Batticaloa Hwy, Kalmunai 32300, Sri Lanka  |  All times in Sri Lanka Standard Time (UTC+05:30)",
        M,
        PAGE_H - FOOTER_H + 27,
        { width: CONTENT_W, lineBreak: false }
      );
    };

    // ── Header band (first page) ──
    doc.rect(0, 0, PAGE_W, 112).fill(BRAND);
    doc.fillColor("#ffffff").font("Helvetica-Bold").fontSize(26);
    text("Aazath Plaza", M, 32, { width: 300, lineBreak: false });
    doc.font("Helvetica").fontSize(9).fillColor("#ddd6fe");
    text("Reception Hall & Events", M, 64, { width: 300, lineBreak: false });
    text("Colombo - Batticaloa Hwy, Kalmunai 32300", M, 77, {
      width: 300,
      lineBreak: false,
    });
    text("Sri Lanka", M, 90, { width: 300, lineBreak: false });

    doc.fillColor("#ffffff").font("Helvetica-Bold").fontSize(28);
    text("INVOICE", PAGE_W - M - 240, 28, {
      width: 240,
      align: "right",
      lineBreak: false,
    });
    doc.font("Helvetica").fontSize(10).fillColor("#ede9fe");
    text(
      `Invoice #  ${payment.invoice_number || "N/A"}`,
      PAGE_W - M - 240,
      66,
      {
        width: 240,
        align: "right",
        lineBreak: false,
      }
    );
    text(`Issued  ${fmtDateSL(payment.paid_at)}`, PAGE_W - M - 240, 82, {
      width: 240,
      align: "right",
      lineBreak: false,
    });

    // ── Two info cards side by side ──
    const GAP = 16;
    const CARD_W = (CONTENT_W - GAP) / 2;
    const LABEL_W = 74;

    const leftRows = [
      ["Name", customer.full_name],
      ["Email", customer.email],
      ["Phone", customer.phone || "-"],
      ["Method", titleCase(payment.payment_method)],
      ["Transaction", payment.transaction_id || "N/A"],
      ["Paid at", fmtDateTimeSL(payment.paid_at)],
    ];
    const rightRows = [
      ["Reference", booking.booking_ref],
      [
        "Hall",
        booking.second_hall_name
          ? `${booking.hall_name} + ${booking.second_hall_name}`
          : booking.hall_name || "N/A",
      ],
      ["Event date", fmtEventDate(booking.event_date)],
      [
        "Time",
        `${fmtClock(booking.event_start_time)} - ${fmtClock(
          booking.event_end_time
        )}`,
      ],
      ["Event type", booking.event_type_label || titleCase(booking.event_type)],
      ["Guests", booking.guest_count],
    ];

    const rowsHeight = (rows) => {
      doc.font("Helvetica-Bold").fontSize(9.5);
      return rows.reduce(
        (h, [, v]) =>
          h +
          Math.max(
            14,
            doc.heightOfString(String(v ?? "-"), {
              width: CARD_W - LABEL_W - 28,
            })
          ) +
          5,
        0
      );
    };

    const cardTop = 134;
    const cardH =
      34 + Math.max(rowsHeight(leftRows), rowsHeight(rightRows)) + 8;

    const drawCard = (x, title, rows) => {
      doc.roundedRect(x, cardTop, CARD_W, cardH, 8).fill(TINT);
      doc.rect(x, cardTop + 10, 3, 16).fill(BRAND);
      doc.fillColor(BRAND_DARK).font("Helvetica-Bold").fontSize(10);
      text(title.toUpperCase(), x + 14, cardTop + 13, {
        width: CARD_W - 28,
        lineBreak: false,
      });
      let y = cardTop + 34;
      rows.forEach(([label, value]) => {
        const v = String(value ?? "-");
        doc.font("Helvetica").fontSize(8.5).fillColor(MUTED);
        text(label, x + 14, y + 1, { width: LABEL_W, lineBreak: false });
        doc.font("Helvetica-Bold").fontSize(9.5).fillColor(INK);
        const h = doc.heightOfString(v, { width: CARD_W - LABEL_W - 28 });
        text(v, x + 14 + LABEL_W, y, { width: CARD_W - LABEL_W - 28 });
        y += Math.max(14, h) + 5;
      });
    };
    drawCard(M, "Billed to & payment", leftRows);
    drawCard(M + CARD_W + GAP, "Booking details", rightRows);

    // ── Items table ──
    const COL = {
      desc: M + 12,
      descW: CONTENT_W - 12 - 130 - 110 - 12,
      unit: M + CONTENT_W - 12 - 230,
      amt: M + CONTENT_W - 12 - 100,
    };
    const NUM_W = { unit: 120, amt: 100 };

    const tableHeader = (y) => {
      doc.roundedRect(M, y, CONTENT_W, 24, 5).fill(BRAND_DARK);
      doc.fillColor("#ffffff").font("Helvetica-Bold").fontSize(8.5);
      text("DESCRIPTION", COL.desc, y + 8, {
        width: COL.descW,
        lineBreak: false,
      });
      text("UNIT PRICE", COL.unit, y + 8, {
        width: NUM_W.unit,
        align: "right",
        lineBreak: false,
      });
      text("AMOUNT", COL.amt, y + 8, {
        width: NUM_W.amt,
        align: "right",
        lineBreak: false,
      });
      return y + 24;
    };

    let bodyTop;
    const newPage = () => {
      drawFooter();
      doc.addPage({ size: "A4", margin: 0 });
      const ny = tableHeader(M);
      bodyTop = ny;
      return ny;
    };

    let y = cardTop + cardH + 22;
    y = tableHeader(y);
    bodyTop = y;

    const ensure = (h) => {
      if (y + h > BOTTOM) y = newPage();
    };

    let zebra = false;
    const groupRow = (label, muted = false) => {
      ensure(22);
      doc.rect(M, y, CONTENT_W, 20).fill(muted ? "#f3f4f6" : TINT);
      doc
        .fillColor(muted ? MUTED : BRAND_DARK)
        .font("Helvetica-Bold")
        .fontSize(8.5);
      text(label.toUpperCase(), COL.desc, y + 6, {
        width: CONTENT_W - 24,
        lineBreak: false,
      });
      y += 20;
      zebra = false;
    };

    const itemRow = (desc, unit, amount, muted = false) => {
      doc.font("Helvetica").fontSize(9.5);
      const h = Math.max(
        20,
        doc.heightOfString(desc, { width: COL.descW }) + 10
      );
      ensure(h);
      if (zebra) doc.rect(M, y, CONTENT_W, h).fill("#fafafa");
      zebra = !zebra;
      doc.fillColor(muted ? MUTED : INK).font("Helvetica").fontSize(9.5);
      text(desc, COL.desc, y + 5, { width: COL.descW });
      doc.fillColor(MUTED);
      text(unit, COL.unit, y + 5, {
        width: NUM_W.unit,
        align: "right",
        lineBreak: false,
      });
      doc.fillColor(muted ? MUTED : INK).font(muted ? "Helvetica" : "Helvetica-Bold");
      text(amount, COL.amt, y + 5, {
        width: NUM_W.amt,
        align: "right",
        lineBreak: false,
      });
      doc
        .moveTo(M, y + h)
        .lineTo(M + CONTENT_W, y + h)
        .lineWidth(0.5)
        .strokeColor(RULE)
        .stroke();
      y += h;
    };

    const base = Number(booking.base_amount) || 0;
    const addon = Number(booking.addon_amount) || 0;
    const discount = Number(booking.discount_amount) || 0;
    const tax = Number(booking.tax_amount) || 0;
    const lines = cateringLines(cateringOrders, itemInfo);
    // addon_amount is rooms/extras only; catering never enters it.
    const otherAddons = addon;
    const restaurantNames = [...new Set(lines.map((l) => l.restaurant))];

    groupRow("Venue");
    itemRow(
      `${booking.hall_name || "Hall"} - ${
        booking.event_type_label || titleCase(booking.event_type)
      } (${booking.guest_count} guests)`,
      money(base),
      money(base)
    );
    if (booking.second_hall_name) {
      itemRow(
        `${booking.second_hall_name} (second hall, complimentary)`,
        money(0),
        money(0)
      );
    }

    // Accommodation is provided by Aazath Plaza, so it is part of Total Paid.
    const rooms = Number(booking.room_count) || 0;
    const roomCost = rooms * ROOM_RATE_PER_DAY;
    const extras = Math.max(0, otherAddons - roomCost);
    if (rooms > 0) {
      groupRow("Accommodation");
      itemRow(
        `Accommodation - ${rooms} room${rooms > 1 ? "s" : ""}`,
        money(ROOM_RATE_PER_DAY) + " / room",
        money(roomCost)
      );
    }
    if (extras > 0) {
      groupRow("Additional services");
      itemRow("Add-ons", money(extras), money(extras));
    }

    // Extra organizing: agreed with the organizer, billed by them, NOT in Total Paid
    const organizerNames = [
      ...new Set(organizers.map((o) => o.business_name)),
    ];
    organizerNames.forEach((name) => {
      const mine = organizers.filter((o) => o.business_name === name);
      groupRow(
        `Event organizing - billed by ${name} (not included in Total Paid)`,
        true
      );
      mine.forEach((o) =>
        itemRow(
          o.role_in_event || "Event organizing",
          "",
          money(o.agreed_fee),
          true
        )
      );
      const organizerTotal = mine.reduce(
        (s, o) => s + (Number(o.agreed_fee) || 0),
        0
      );
      itemRow(
        `Organizing subtotal - pay directly to ${name}`,
        "",
        money(organizerTotal),
        true
      );
    });

    // Catering: listed for reference, billed by the restaurant, NOT in Total Paid
    restaurantNames.forEach((name) => {
      const mine = lines.filter((l) => l.restaurant === name);
      groupRow(
        `Catering - billed by ${name} (not included in Total Paid)`,
        true
      );
      mine.forEach((l) =>
        itemRow(l.label, money(l.unit), money(l.amount), true)
      );
      const restaurantTotal = mine.reduce((s, l) => s + l.amount, 0);
      itemRow(
        `Catering subtotal - pay directly to ${name}`,
        "",
        money(restaurantTotal),
        true
      );
    });

    // ── Totals (right) + status (left) ──
    const TOTALS_H =
      26 + (discount > 0 ? 20 : 0) + (tax > 0 ? 20 : 0) + 20 + 44;
    const BLOCK_H = Math.max(TOTALS_H, 110);
    y += 14;
    let framed = true;
    if (y + BLOCK_H > BOTTOM) {
      // Totals would not fit under the last row: give them a clean page.
      drawFooter();
      doc.addPage({ size: "A4", margin: 0 });
      y = M;
      framed = false;
    }
    // Pin the totals block to the bottom of the page so the sheet reads as full,
    // and frame the empty part of the table body down to it.
    if (framed) {
      y = Math.max(y, BOTTOM - BLOCK_H);
      doc
        .roundedRect(M, bodyTop, CONTENT_W, y - 10 - bodyTop, 4)
        .lineWidth(0.5)
        .strokeColor(RULE)
        .stroke();
    }

    const subtotal = base + otherAddons;
    const boxW = CONTENT_W * 0.48;
    const boxX = M + CONTENT_W - boxW;
    let ty = y;

    const totalRow = (label, value, color = INK) => {
      doc.font("Helvetica").fontSize(9.5).fillColor(MUTED);
      text(label, boxX + 12, ty, { width: boxW / 2, lineBreak: false });
      doc.font("Helvetica-Bold").fillColor(color);
      text(value, boxX + boxW / 2, ty, {
        width: boxW / 2 - 12,
        align: "right",
        lineBreak: false,
      });
      ty += 20;
    };
    totalRow("Subtotal", money(subtotal));
    if (discount > 0) totalRow("Discount", `- ${money(discount)}`, "#15803d");
    if (tax > 0) totalRow("Tax", money(tax));
    doc.roundedRect(boxX, ty + 2, boxW, 40, 6).fill(BRAND);
    doc.fillColor("#ffffff").font("Helvetica-Bold").fontSize(11);
    text("TOTAL PAID", boxX + 12, ty + 15, {
      width: boxW / 2,
      lineBreak: false,
    });
    doc.fontSize(14);
    text(money(payment.amount), boxX + boxW / 2, ty + 13, {
      width: boxW / 2 - 12,
      align: "right",
      lineBreak: false,
    });

    // Left: PAID badge and notes
    const leftW = CONTENT_W * 0.48;
    doc
      .roundedRect(M, y, 84, 28, 6)
      .lineWidth(1.5)
      .strokeColor("#15803d")
      .stroke();
    doc.fillColor("#15803d").font("Helvetica-Bold").fontSize(15);
    text("PAID", M, y + 7, { width: 84, align: "center", lineBreak: false });
    doc.font("Helvetica").fontSize(8.5).fillColor(MUTED);
    text(
      "Payment received in full via " +
        titleCase(payment.payment_method) +
        (restaurantNames.length || organizerNames.length
          ? ".\nEvent organizing and catering are billed separately by " +
            [...organizerNames, ...restaurantNames].join(" and ") +
            " and are not included in Total Paid."
          : ".") +
        "\nThis is a computer-generated invoice and does not require a signature.",
      M,
      y + 38,
      { width: leftW }
    );

    drawFooter();
    doc.end();
  });
};

module.exports = { generateInvoicePdf };