const mongoose = require('mongoose');

const InvoiceSchema = new mongoose.Schema({
  invoiceNumber: { type: Number, required: true },
  organizationName: { type: String, required: true },
  date: { type: String, required: true },
  time: { type: String, required: true },
  customerName: { type: String, required: true },
  customerMobile: { type: String, required: true },
  items: [
    {
      srNo: Number,
      itemName: String,
      itemQuantity: Number,
      itemPrice: Number,
      itemTotalPrice: Number,
    },
  ],
  totalAmount: { type: Number, required: true },
});

module.exports = mongoose.model('Invoice', InvoiceSchema);
