// ─────────────────────────────────────────────────────────────
//  server/src/utils/reportPdf.util.js
//  FR-022 — renders a report (from report.service.generateReport)
//  as an A4 PDF and resolves with a Buffer.
//  Uses pdfkit's built-in Helvetica, so Latin text only (names in
//  Tamil/Sinhala script would not render without embedding a font).
// ─────────────────────────────────────────────────────────────
const PDFDocument = require("pdfkit");

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];
const ROW_H = 18;

// ── Formatting helpers ─────────────────────────────────────────
const money = (n) =>
  Number(n || 0).toLocaleString("en-LK", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
const lkr = (n) => `LKR ${money(n)}`;

const label = (s) =>
  String(s || "")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

const parts = (s) => String(s).slice(0, 10).split("-");
const fmtDate = (s) => {
  const [y, m, d] = parts(s);
  return `${Number(d)} ${MONTHS[Number(m) - 1]} ${y}`;
};
const fmtShort = (s) => {
  const [y, m, d] = parts(s);
  return `${Number(d)} ${MONTHS[Number(m) - 1]} ${y.slice(2)}`;
};
const rangeText = (r) =>
  r.from === r.to ? fmtDate(r.from) : `${fmtDate(r.from)} - ${fmtDate(r.to)}`;

// ── Table drawing ──────────────────────────────────────────────
const drawRow = (doc, columns, values, y, { header = false, shade = false } = {}) => {
  const x0 = doc.page.margins.left;
  const totalW = columns.reduce((s, c) => s + c.width, 0);

  if (header) doc.rect(x0, y, totalW, ROW_H).fill("#f3f4f6");
  else if (shade) doc.rect(x0, y, totalW, ROW_H).fill("#fafafa");

  doc
    .fillColor(header ? "#374151" : "#111827")
    .font(header ? "Helvetica-Bold" : "Helvetica")
    .fontSize(header ? 8 : 8.5);

  let x = x0;
  columns.forEach((c, i) => {
    doc.text(String(values[i] ?? ""), x + 4, y + 5, {
      width: c.width - 8,
      align: c.align || "left",
      height: ROW_H - 8, // one line only; longer text is cut with "…"
      ellipsis: true,
    });
    x += c.width;
  });

  doc
    .moveTo(x0, y + ROW_H)
    .lineTo(x0 + totalW, y + ROW_H)
    .lineWidth(0.5)
    .strokeColor("#e5e7eb")
    .stroke();
};

const ensureSpace = (doc, needed) => {
  if (doc.y + needed > doc.page.height - doc.page.margins.bottom) {
    doc.addPage();
  }
};

const drawTable = (doc, title, columns, rows, emptyText = "No data for this period.") => {
  const x0 = doc.page.margins.left;
  ensureSpace(doc, 70);

  doc.font("Helvetica-Bold").fontSize(11).fillColor("#111827").text(title, x0, doc.y);
  doc.moveDown(0.4);

  let y = doc.y;
  drawRow(doc, columns, columns.map((c) => c.header), y, { header: true });
  y += ROW_H;

  if (rows.length === 0) {
    doc
      .font("Helvetica-Oblique")
      .fontSize(9)
      .fillColor("#9ca3af")
      .text(emptyText, x0 + 4, y + 5, { lineBreak: false });
    doc.x = x0;
    doc.y = y + ROW_H + 12;
    return;
  }

  rows.forEach((row, idx) => {
    if (y + ROW_H > doc.page.height - doc.page.margins.bottom) {
      doc.addPage();
      y = doc.page.margins.top;
      drawRow(doc, columns, columns.map((c) => c.header), y, { header: true });
      y += ROW_H;
    }
    const values = columns.map((c) =>
      c.format ? c.format(row[c.key], row) : row[c.key]
    );
    drawRow(doc, columns, values, y, { shade: idx % 2 === 1 });
    y += ROW_H;
  });

  doc.x = x0;
  doc.y = y + 14;
};

const note = (doc, text) => {
  doc
    .font("Helvetica-Oblique")
    .fontSize(8)
    .fillColor("#6b7280")
    .text(text, doc.page.margins.left, doc.y - 8, {
      width: doc.page.width - doc.page.margins.left - doc.page.margins.right,
    });
  doc.moveDown(1);
};

// ── Public ─────────────────────────────────────────────────────
const buildReportPdf = (report) =>
  new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: "A4",
        margin: 50,
        bufferPages: true,
        info: {
          Title: `Aazath Plaza ${label(report.period)} Report`,
          Author: "Aazath Plaza Events Management System",
        },
      });

      const chunks = [];
      doc.on("data", (c) => chunks.push(c));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", reject);

      const s = report.summary;
      const left = doc.page.margins.left;

      // Header
      doc.font("Helvetica-Bold").fontSize(18).fillColor("#111827").text("Aazath Plaza Reception Hall", left, 50);
      doc.font("Helvetica").fontSize(12).fillColor("#374151").text(`${label(report.period)} Report`);
      doc
        .fontSize(9)
        .fillColor("#6b7280")
        .text(`Period: ${rangeText(report.range)}`)
        .text(
          `Generated: ${new Date().toLocaleString("en-GB", { timeZone: "Asia/Colombo" })}`
        );
      doc.moveDown(1);

      // Summary
      const change =
        s.revenue_change_pct === null
          ? "n/a"
          : `${s.revenue_change_pct >= 0 ? "+" : ""}${s.revenue_change_pct}%`;

      drawTable(
        doc,
        "Summary",
        [
          { header: "Metric", key: "metric", width: 300 },
          { header: "Value", key: "value", width: 195, align: "right" },
        ],
        [
          { metric: "Total revenue (confirmed + completed)", value: lkr(s.total_revenue) },
          { metric: `Change vs previous period (${rangeText(report.previous_range)})`, value: change },
          { metric: "   Hall revenue", value: lkr(s.hall_revenue) },
          { metric: "   Room revenue", value: lkr(s.room_revenue) },
          { metric: "   Other add-ons", value: lkr(s.addon_other_revenue) },
          { metric: "   Tax", value: lkr(s.tax_total) },
          { metric: "   Discounts", value: `- ${lkr(s.discount_total)}` },
          { metric: "Confirmed + completed bookings", value: String(s.confirmed + s.completed) },
          { metric: "Pending bookings", value: String(s.pending) },
          { metric: "Cancelled bookings", value: String(s.cancelled) },
          { metric: "Total bookings (all statuses)", value: String(s.total_bookings) },
          {
            metric: "Guests (confirmed + completed)",
            value: Number(s.total_guests).toLocaleString("en-LK"),
          },
          { metric: "Rooms booked", value: String(s.rooms_booked) },
        ]
      );

      // Revenue breakdown over the period
      drawTable(
        doc,
        `Revenue by ${report.period === "annual" ? "month" : "day"}`,
        [
          { header: report.period === "annual" ? "Month" : "Date", key: "bucket", width: 175,
            format: (v) => {
              const [y, m] = parts(v);
              return report.period === "annual" ? `${MONTHS[Number(m) - 1]} ${y}` : fmtDate(v);
            } },
          { header: "Bookings", key: "total_bookings", width: 100, align: "right" },
          { header: "Confirmed", key: "confirmed_bookings", width: 100, align: "right" },
          { header: "Revenue (LKR)", key: "revenue", width: 120, align: "right", format: money },
        ],
        report.breakdown
      );

      // By event type
      drawTable(
        doc,
        "By event type",
        [
          { header: "Event type", key: "event_type", width: 195, format: label },
          { header: "Bookings", key: "bookings", width: 90, align: "right" },
          {
            header: "Guests",
            key: "guests",
            width: 90,
            align: "right",
            format: (v) => Number(v).toLocaleString("en-LK"),
          },
          { header: "Revenue (LKR)", key: "revenue", width: 120, align: "right", format: money },
        ],
        report.by_event_type
      );

      // Hall usage
      drawTable(
        doc,
        "Hall usage",
        [
          { header: "Hall", key: "hall_name", width: 215 },
          { header: "Bookings", key: "booking_count", width: 140, align: "right" },
          { header: "Complimentary", key: "complimentary_count", width: 140, align: "right" },
        ],
        report.by_hall
      );
      note(doc, "A booking that uses both halls is counted once for each hall.");

      // Rooms
      drawTable(
        doc,
        "Room accommodation",
        [
          { header: "Event type", key: "event_type", width: 165, format: label },
          { header: "Bookings with rooms", key: "bookings_with_rooms", width: 120, align: "right" },
          { header: "Rooms", key: "total_rooms", width: 90, align: "right" },
          { header: "Revenue (LKR)", key: "revenue", width: 120, align: "right", format: money },
        ],
        report.rooms.by_event_type,
        "No room reservations in this period."
      );
      note(
        doc,
        `Rooms x LKR ${Number(report.rooms.rate_per_day).toLocaleString("en-LK")} per room per day. Room revenue is part of total revenue.`
      );

      // Booking detail
      drawTable(
        doc,
        "Booking detail",
        [
          { header: "Ref", key: "booking_ref", width: 84 },
          { header: "Customer", key: "customer_name", width: 78 },
          {
            header: "Hall(s)",
            key: "halls",
            width: 76,
            // "Hall 1 - Grand + Hall 2 - Banquet" -> "Hall 1 + Hall 2"
            format: (v) =>
              String(v).includes(" + ")
                ? String(v).replace(/ - [A-Za-z]+/g, "")
                : v,
          },
          {
            header: "Type",
            key: "event_type",
            width: 56,
            // "Wedding Function" -> "Wedding" so it fits on one line
            format: (v) => label(v).replace(/ (Function|Event)$/, ""),
          },
          { header: "Date", key: "event_date", width: 50, format: fmtShort },
          {
            header: "Guests",
            key: "guest_count",
            width: 38,
            align: "right",
            format: (v) => Number(v).toLocaleString("en-LK"),
          },
          { header: "Status", key: "status", width: 52, format: label },
          { header: "Total (LKR)", key: "total_amount", width: 61, align: "right", format: money },
        ],
        report.bookings,
        "No bookings in this period."
      );
      if (report.bookings_truncated) {
        note(doc, "Only the first 500 bookings are listed.");
      }

      // Page numbers (bottom margin zeroed so the footer never adds a page)
      const range = doc.bufferedPageRange();
      for (let i = 0; i < range.count; i++) {
        doc.switchToPage(i);
        const savedBottom = doc.page.margins.bottom;
        doc.page.margins.bottom = 0;
        doc
          .font("Helvetica")
          .fontSize(8)
          .fillColor("#9ca3af")
          .text(
            `Aazath Plaza - ${label(report.period)} Report - Page ${i + 1} of ${range.count}`,
            left,
            doc.page.height - 30,
            { width: doc.page.width - left * 2, align: "center", lineBreak: false }
          );
        doc.page.margins.bottom = savedBottom;
      }

      doc.end();
    } catch (err) {
      reject(err);
    }
  });

module.exports = { buildReportPdf };