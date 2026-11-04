const PDFDocument = require("pdfkit");

const BRAND = "#6d28d9", BRAND_DARK = "#4c1d95", TINT = "#f5f3ff";
const INK = "#111827", MUTED = "#6b7280", RULE = "#e5e7eb";
const PAGE_W = 595.28, PAGE_H = 841.89, M = 40;
const CONTENT_W = PAGE_W - M * 2, FOOTER_H = 44;
const TZ = "Asia/Colombo";

const money = (n) =>
  "LKR " +
  Number(n || 0).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

// 'YYYY-MM-DD' string -> "Mon, 02 Nov 2026" without timezone shifts
const fmtYmd = (v) => {
  if (!v) return "N/A";
  const [y, m, d] = String(v).slice(0, 10).split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("en-GB", {
    weekday: "short", day: "2-digit", month: "short", year: "numeric",
    timeZone: "UTC",
  });
};
const fmtDateSL = (v) =>
  v
    ? new Date(v).toLocaleDateString("en-GB", {
        day: "2-digit", month: "short", year: "numeric", timeZone: TZ,
      })
    : "N/A";
const fmtDateTimeSL = (v) =>
  v
    ? new Date(v).toLocaleString("en-GB", {
        day: "2-digit", month: "short", year: "numeric",
        hour: "2-digit", minute: "2-digit", hour12: true, timeZone: TZ,
      }) + " (SLST)"
    : "N/A";
const titleCase = (s) =>
  String(s || "N/A").replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

// One invoice per room booking group (all rooms booked together).
// rooms: [{ room_name, nights, total_amount }]
const generateRoomInvoicePdf = ({
  invoiceNumber, groupRef, customer, rooms, checkIn, checkOut, guests,
  payment, // { method, transactionId, note, paidAt, amount }
}) =>
  new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: "A4", margin: 0 });
    const chunks = [];
    doc.on("data", (c) => chunks.push(c));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    const text = (s, x, y, o = {}) => doc.text(String(s), x, y, { lineBreak: true, ...o });

    // Header band
    doc.rect(0, 0, PAGE_W, 112).fill(BRAND);
    doc.fillColor("#ffffff").font("Helvetica-Bold").fontSize(26);
    text("Aazath Plaza", M, 32, { width: 300, lineBreak: false });
    doc.font("Helvetica").fontSize(9).fillColor("#ddd6fe");
    text("Reception Hall & Events", M, 64, { width: 300, lineBreak: false });
    text("Colombo - Batticaloa Hwy, Kalmunai 32300", M, 77, { width: 300, lineBreak: false });
    text("Sri Lanka", M, 90, { width: 300, lineBreak: false });
    doc.fillColor("#ffffff").font("Helvetica-Bold").fontSize(28);
    text("INVOICE", PAGE_W - M - 240, 28, { width: 240, align: "right", lineBreak: false });
    doc.font("Helvetica").fontSize(10).fillColor("#ede9fe");
    text(`Invoice #  ${invoiceNumber}`, PAGE_W - M - 240, 66, { width: 240, align: "right", lineBreak: false });
    text(`Issued  ${fmtDateSL(payment.paidAt)}`, PAGE_W - M - 240, 82, { width: 240, align: "right", lineBreak: false });
    doc.fillColor("#ffffff").font("Helvetica-Bold").fontSize(9);
    text("ACCOMMODATION", PAGE_W - M - 240, 100, { width: 240, align: "right", lineBreak: false });

    // Info cards
    const GAP = 16, CARD_W = (CONTENT_W - GAP) / 2, LABEL_W = 74;
    const isCash = payment.method === "cash";
    const leftRows = [
      ["Name", customer.full_name],
      ["Email", customer.email],
      ["Phone", customer.phone || "-"],
      ["Method", titleCase(payment.method)],
      [isCash ? "Receipt note" : "Transaction", isCash ? payment.note || "Cash at front desk" : payment.transactionId || "N/A"],
      ["Paid at", fmtDateTimeSL(payment.paidAt)],
    ];
    const nights = rooms.length ? rooms[0].nights : 0;
    const rightRows = [
      ["Reference", groupRef],
      ["Check-in", fmtYmd(checkIn)],
      ["Check-out", fmtYmd(checkOut)],
      ["Nights", nights],
      ["Rooms", rooms.length],
      ["Guests", guests],
    ];
    const rowsHeight = (rows) => {
      doc.font("Helvetica-Bold").fontSize(9.5);
      return rows.reduce(
        (h, [, v]) => h + Math.max(14, doc.heightOfString(String(v ?? "-"), { width: CARD_W - LABEL_W - 28 })) + 5,
        0
      );
    };
    const cardTop = 134;
    const cardH = 34 + Math.max(rowsHeight(leftRows), rowsHeight(rightRows)) + 8;
    const drawCard = (x, title, rows) => {
      doc.roundedRect(x, cardTop, CARD_W, cardH, 8).fill(TINT);
      doc.rect(x, cardTop + 10, 3, 16).fill(BRAND);
      doc.fillColor(BRAND_DARK).font("Helvetica-Bold").fontSize(10);
      text(title.toUpperCase(), x + 14, cardTop + 13, { width: CARD_W - 28, lineBreak: false });
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
    drawCard(M + CARD_W + GAP, "Stay details", rightRows);

    // Items table
    const AMT = { x: M + CONTENT_W - 12 - 100, w: 100 };
    const RATE = { x: AMT.x - 120, w: 110 };
    const NIGHTS = { x: RATE.x - 70, w: 60 };
    const ROOM = { x: M + 12, w: NIGHTS.x - (M + 12) - 8 };

    let y = cardTop + cardH + 22;
    doc.roundedRect(M, y, CONTENT_W, 24, 5).fill(BRAND_DARK);
    doc.fillColor("#ffffff").font("Helvetica-Bold").fontSize(8.5);
    text("ROOM", ROOM.x, y + 8, { width: ROOM.w, lineBreak: false });
    text("NIGHTS", NIGHTS.x, y + 8, { width: NIGHTS.w, align: "right", lineBreak: false });
    text("RATE / NIGHT", RATE.x, y + 8, { width: RATE.w, align: "right", lineBreak: false });
    text("AMOUNT", AMT.x, y + 8, { width: AMT.w, align: "right", lineBreak: false });
    y += 24;

    rooms.forEach((r, i) => {
      const h = 22;
      if (i % 2) doc.rect(M, y, CONTENT_W, h).fill("#fafafa");
      const total = Number(r.total_amount) || 0;
      const rate = r.nights ? total / r.nights : total;
      doc.fillColor(INK).font("Helvetica").fontSize(9.5);
      text(r.room_name, ROOM.x, y + 6, { width: ROOM.w, lineBreak: false });
      text(r.nights, NIGHTS.x, y + 6, { width: NIGHTS.w, align: "right", lineBreak: false });
      doc.fillColor(MUTED);
      text(money(rate), RATE.x, y + 6, { width: RATE.w, align: "right", lineBreak: false });
      doc.fillColor(INK).font("Helvetica-Bold");
      text(money(total), AMT.x, y + 6, { width: AMT.w, align: "right", lineBreak: false });
      doc.moveTo(M, y + h).lineTo(M + CONTENT_W, y + h).lineWidth(0.5).strokeColor(RULE).stroke();
      y += h;
    });

    // Totals
    y += 20;
    const boxW = CONTENT_W * 0.48, boxX = M + CONTENT_W - boxW;
    doc.font("Helvetica").fontSize(9.5).fillColor(MUTED);
    text("Subtotal", boxX + 12, y, { width: boxW / 2, lineBreak: false });
    doc.font("Helvetica-Bold").fillColor(INK);
    text(money(payment.amount), boxX + boxW / 2, y, { width: boxW / 2 - 12, align: "right", lineBreak: false });
    y += 20;
    doc.roundedRect(boxX, y + 2, boxW, 40, 6).fill(BRAND);
    doc.fillColor("#ffffff").font("Helvetica-Bold").fontSize(11);
    text("TOTAL PAID", boxX + 12, y + 15, { width: boxW / 2, lineBreak: false });
    doc.fontSize(14);
    text(money(payment.amount), boxX + boxW / 2, y + 13, { width: boxW / 2 - 12, align: "right", lineBreak: false });

    // PAID badge + note
    const top = y - 20;
    doc.roundedRect(M, top, 84, 28, 6).lineWidth(1.5).strokeColor("#15803d").stroke();
    doc.fillColor("#15803d").font("Helvetica-Bold").fontSize(15);
    text("PAID", M, top + 7, { width: 84, align: "center", lineBreak: false });
    doc.font("Helvetica").fontSize(8.5).fillColor(MUTED);
    text(
      `Payment received in full via ${titleCase(payment.method)}.\nThis is a computer-generated invoice and does not require a signature.`,
      M, top + 38, { width: CONTENT_W * 0.48 }
    );

    // Footer
    doc.rect(0, PAGE_H - FOOTER_H, PAGE_W, FOOTER_H).fill(BRAND);
    doc.fillColor("#ffffff").font("Helvetica-Bold").fontSize(10);
    text("Thank you for choosing Aazath Plaza", M, PAGE_H - FOOTER_H + 12, { width: CONTENT_W, lineBreak: false });
    doc.font("Helvetica").fontSize(8).fillColor("#ddd6fe");
    text("Colombo - Batticaloa Hwy, Kalmunai 32300, Sri Lanka  |  All times in Sri Lanka Standard Time (UTC+05:30)",
      M, PAGE_H - FOOTER_H + 27, { width: CONTENT_W, lineBreak: false });

    doc.end();
  });

module.exports = { generateRoomInvoicePdf };