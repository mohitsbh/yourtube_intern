import express from "express";
import auth from "../middleware/auth.js";
import Invoice from "../Models/Invoice.js";
import PDFDocument from "pdfkit";

const router = express.Router();

// ✅ GET all invoices for logged-in user with optional filtering
router.get("/my-invoices", auth, async (req, res) => {
  try {
    const filter = { user: req.user.id };

    // 🔍 Optional filter by plan type (e.g., ?planType=gold)
    if (req.query.planType) {
      filter.planType = req.query.planType;
    }

    const invoices = await Invoice.find(filter)
      .populate("order")
      .sort({ issuedAt: -1 });

    res.status(200).json(invoices);
  } catch (err) {
    console.error("Invoice fetch error:", err);
    res.status(500).json({ message: "Failed to fetch invoices" });
  }
});

// ✅ GET a downloadable invoice PDF
router.get("/download/:id", auth, async (req, res) => {
  try {
    const invoice = await Invoice.findOne({
      _id: req.params.id,
      user: req.user.id,
    }).populate("order");

    if (!invoice) {
      return res.status(404).json({ message: "Invoice not found" });
    }

    const doc = new PDFDocument();

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=invoice-${invoice.invoiceNumber || invoice._id}.pdf`
    );

    doc.pipe(res);

    doc.fontSize(20).text("Invoice", { align: "center" });
    doc.moveDown();

    doc.fontSize(14).text(`Invoice ID: ${invoice.invoiceNumber || invoice._id}`);
    doc.text(`Plan: ${invoice.planType.toUpperCase()}`);
    doc.text(`Amount: ₹${invoice.amount}`);
    doc.text(`Status: ${invoice.status}`);
    doc.text(`Payment Method: ${invoice.paymentMethod}`);
    doc.text(`Order ID: ${invoice.order?.orderId || "N/A"}`);
    doc.text(`Issued At: ${invoice.issuedAt.toDateString()}`);
    doc.text(`User Email: ${req.user.email || "N/A"}`);
    doc.end();
  } catch (error) {
    console.error("PDF generation error:", error);
    res.status(500).json({ message: "Failed to generate invoice PDF" });
  }
});

export default router;
