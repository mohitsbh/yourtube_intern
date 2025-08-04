import path from "path";
import fs from "fs";

export const downloadInvoice = async (req, res) => {
  try {
    const { invoiceId } = req.params;
    if (!invoiceId) {
      return res.status(400).json({ message: "Invoice ID is required" });
    }

    const invoicePath = path.resolve("invoices", `${invoiceId}.pdf`);

    if (!fs.existsSync(invoicePath)) {
      return res.status(404).json({ message: "Invoice not found" });
    }

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=Invoice-${invoiceId}.pdf`);

    fs.createReadStream(invoicePath).pipe(res);
  } catch (error) {
    console.error("❌ Failed to serve invoice:", error.message);
    res.status(500).json({ message: "Unable to download invoice" });
  }
};
