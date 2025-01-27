const express = require('express');
const Invoice = require('../models/Invoice');
const router = express.Router();

// Save Invoice
router.post('/create', async (req, res) => {
  try {
    const invoiceCount = await Invoice.countDocuments();
    const newInvoice = new Invoice({
      invoiceNumber: invoiceCount + 1,
      organizationName: req.body.organizationName,
      date: req.body.date,
      time: req.body.time,
      customerName: req.body.customerName,
      customerMobile: req.body.customerMobile,
      items: req.body.items,
      totalAmount: req.body.totalAmount,
    });
    await newInvoice.save();
    res.status(201).send(newInvoice);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// Get all invoices
router.get('/', async (req, res) => {
  try {
    const invoices = await Invoice.find();
    res.status(200).send(invoices);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

module.exports = router;
