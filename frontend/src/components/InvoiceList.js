import React, { useState, useEffect } from "react";
import axios from "axios";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { Link } from 'react-router-dom';

const InvoiceList = () => {
  const [invoices, setInvoices] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  useEffect(() => {
    axios
      .get(`${process.env.REACT_APP_BASE_URL}/invoices`)
      .then((response) => {
        setInvoices(response.data);
      })
      .catch((error) => {
        console.error("Error fetching invoices:", error);
      });
  }, []);

  const handleDownloadPDF = (invoice) => {
    const doc = new jsPDF();
    doc.text(`Invoice No: ${invoice.invoiceNumber}`, 14, 15);
    doc.text(`Date: ${invoice.date}  Time: ${invoice.time}`, 14, 25);
    doc.text(`Customer: ${invoice.customerName} (${invoice.customerMobile})`, 14, 35);

    const tableColumn = ["Sr No.", "Item", "Quantity", "Price", "Total"];
    const tableRows = invoice.items.map((item, index) => [
      index + 1,
      item.itemName,
      item.itemQuantity,
      `₹${item.itemPrice}`,
      `₹${item.itemTotalPrice}`,
    ]);

    doc.autoTable({
      startY: 45,
      head: [tableColumn],
      body: tableRows,
      theme: "striped",
      styles: { fontSize: 10 },
      headStyles: { fillColor: [40, 40, 40] },
    });

    doc.text(`Total Amount: ₹${invoice.totalAmount}`, 14, doc.autoTable.previous.finalY + 10);
    doc.save(`Invoice_${invoice.invoiceNumber}.pdf`);
  };

  const handleViewInvoice = (invoice) => {
    setSelectedInvoice(invoice);
  };

  const filteredInvoices = invoices.filter(
    (invoice) =>
      invoice.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.invoiceNumber.toString().includes(searchTerm)
  );

  return (
    <div className="invoice-container">
      <div style={{position:'fixed' , top:'20px', left:'10px' }}>
        <Link to='/' className="back">🔙</Link>
      </div>
      <h2>Invoices</h2>
      <input
        type="text"
        placeholder="Search by name or invoice number"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="search-input"
      />

      <table className="invoice-table">
        <thead>
          <tr>
            <th>Invoice No</th>
            <th>Date</th>
            <th>Customer</th>
            <th>Total Amount</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredInvoices.map((invoice) => (
            <tr key={invoice.invoiceNumber}>
              <td>{invoice.invoiceNumber}</td>
              <td>{invoice.date}</td>
              <td>{invoice.customerName}</td>
              <td>₹{invoice.totalAmount}</td>
              <td>
                <button className="view-btn" onClick={() => handleViewInvoice(invoice)}>
                  View
                </button>
                <button className="download-btn" onClick={() => handleDownloadPDF(invoice)}>
                  Download
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {selectedInvoice && (
        <div className="modal">
          <div className="modal-content">
            <h3>Invoice #{selectedInvoice.invoiceNumber}</h3>
            <p>
              <strong>Date:</strong> {selectedInvoice.date} <strong>Time:</strong> {selectedInvoice.time}
            </p>
            <p>
              <strong>Customer:</strong> {selectedInvoice.customerName} ({selectedInvoice.customerMobile})
            </p>

            <div className="modal-table-container">
              <table className="modal-table">
                <thead>
                  <tr>
                    <th>Sr No.</th>
                    <th>Item</th>
                    <th>Quantity</th>
                    <th>Price</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedInvoice.items.map((item, index) => (
                    <tr key={index}>
                      <td>{index + 1}</td>
                      <td>{item.itemName}</td>
                      <td>{item.itemQuantity}</td>
                      <td>₹{item.itemPrice}</td>
                      <td>₹{item.itemTotalPrice}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p className="total-amount">
              <strong>Total Amount: ₹{selectedInvoice.totalAmount}</strong>
            </p>
            <button className="close-btn" onClick={() => setSelectedInvoice(null)}>
              Close
            </button>
          </div>
        </div>
      )}

      <style>
        {`
        .invoice-container {
          padding: 20px;
          max-width: 900px;
          margin: 0 auto;
        }

        .search-input {
          width: 100%;
          padding: 10px;
          margin-bottom: 10px;
          border-radius: 5px;
          border: 1px solid #ccc;
        }

        .invoice-table {
          width: 100%;
          border-collapse: collapse;
        }

        .invoice-table th, .invoice-table td {
          padding: 8px;
          border: 1px solid #ddd;
          text-align: left;
        }

        .invoice-table th {
          background-color: #f4f4f4;
        }

        .view-btn, .download-btn {
          padding: 5px 10px;
          margin-right: 5px;
          border: none;
          cursor: pointer;
        }

        .view-btn {
          background-color: #007bff;
          color: white;
        }

        .download-btn {
          background-color: #28a745;
          color: white;
        }

        .modal {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-color: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .modal-content {
          background-color: white;
          padding: 20px;
          border-radius: 5px;
          width: 90%;
          max-width: 600px;
          max-height: 80vh;
          overflow-y: auto;
          box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.3);
        }

        .modal-table-container {
          max-height: 300px;
          overflow-y: auto;
        }

        .modal-table {
          width: 100%;
          border-collapse: collapse;
        }

        .modal-table th, .modal-table td {
          padding: 8px;
          border: 1px solid #ddd;
          text-align: left;
        }

        .modal-table th {
          background-color: #f4f4f4;
        }

        .close-btn {
          margin-top: 10px;
          padding: 5px 10px;
          background-color: red;
          color: white;
          border: none;
          cursor: pointer;
          float: right;
        }

        .total-amount {
          font-weight: bold;
          margin-top: 10px;
          text-align: right;
        }
          .back{
            padding: 10px 15px;
            background-color: #4CAF50;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            margin: 50px 0px;
            text-decoration: none;
            font-size: 30px;
          }
        `}
      </style>
    </div>
  );
};

export default InvoiceList;
