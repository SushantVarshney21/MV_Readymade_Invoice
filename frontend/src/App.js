import React, { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
  const [organizationName] = useState('MV Readymade Atrauli (Aligarh)');
  const [date] = useState(new Date().toLocaleDateString('en-GB')); // DD/MM/YYYY
  const [time] = useState(new Date().toLocaleTimeString('en-US', { hour12: true })); // 12-hour format
  const [invoiceNumber, setInvoiceNumber] = useState(1);
  const [customerName, setCustomerName] = useState('');
  const [customerMobile, setCustomerMobile] = useState('');
  const [items, setItems] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);

  useEffect(() => {
    // Fetch invoice count to set invoice number
    axios.get('http://localhost:5000/invoices').then((response) => {
      setInvoiceNumber(response.data.length + 1);
    });

    // Add keyboard event listener for adding rows on Enter
    const handleKeyPress = (e) => {
      if (e.key === 'Enter') {
        e.preventDefault(); // Prevent default form submission
        handleAddRow();
      }
    };
    window.addEventListener('keypress', handleKeyPress);
    return () => {
      window.removeEventListener('keypress', handleKeyPress);
    };
  }, [items]);

  const handleAddRow = () => {
    setItems([...items, { srNo: items.length + 1, itemName: '', itemQuantity: null, itemPrice: null, itemTotalPrice: 0 }]);
  };

  const handleDeleteRow = (index) => {
    const updatedItems = items.filter((_, i) => i !== index); // Remove the row
    const updatedTotalAmount = updatedItems.reduce((sum, item) => sum + item.itemTotalPrice, 0); // Recalculate total amount
    setItems(updatedItems.map((item, i) => ({ ...item, srNo: i + 1 }))); // Reassign Sr No
    setTotalAmount(updatedTotalAmount); // Update the total amount
  };

  const handleItemChange = (index, key, value) => {
    const updatedItems = [...items];
    updatedItems[index][key] = value;

    if (key === 'itemQuantity' || key === 'itemPrice') {
      updatedItems[index].itemTotalPrice = updatedItems[index].itemQuantity * updatedItems[index].itemPrice;
    }

    setItems(updatedItems);
    setTotalAmount(updatedItems.reduce((sum, item) => sum + item.itemTotalPrice, 0));
  };

  const handleSaveAndPrintInvoice = () => {
    const invoice = {
      organizationName,
      date,
      time,
      invoiceNumber,
      customerName,
      customerMobile,
      items,
      totalAmount,
    };

    axios.post('http://localhost:5000/invoices/create', invoice)
      .then(() => {
        alert('Invoice Saved Successfully');
        window.print(); // Print the invoice

        // Reset form fields
        setCustomerName('');
        setCustomerMobile('');
        setItems([]);
        setTotalAmount(0);

        window.location.reload();
      })
      .catch(() => {
        alert('Error saving invoice');
      });
  };

  const handleMobileInput = (e) => {
    const value = e.target.value.replace(/\D/g, ''); // Allow only numbers
    setCustomerMobile(value.slice(0, 10)); // Limit to 10 digits
  };

  return (
    <div className="app">
      <style>
        {`
          .app {
            max-width: 900px;
            margin: 0 auto;
            padding: 20px;
            font-family: Arial, sans-serif;
          }
          h1 {
            text-align: center;
          }
          .organization {
            text-align: center;
            font-size: 18px;
            font-weight: bold;
            margin: 30px 0;
          }
          .details-line {
            display: flex;
            justify-content: space-between;
            margin: 10px 0;
          }
          label {
            font-weight: bold;
            margin-bottom: 5px;
            display: block;
          }
          input {
            width: 88%;
            padding: 10px;
            margin: 5px 0 20px 0;
            border: 1px solid #ccc;
            border-radius: 4px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
            table-layout: fixed;
          }
          table, th, td {
            border: 1px solid #ddd;
            padding: 0; /* Remove default padding from table cells */
          }
          th, td {
            text-align: center;
            vertical-align: middle; /* Vertically align content */
            word-wrap: break-word; /* Ensure content wraps inside the cells */
          }
          td input {
            width: 100%;
            padding: 5px; /* Adjust inner padding */
            box-sizing: border-box; /* Include padding in the width/height */
            font-size: 14px;
            text-align: center;
          }
          th {
            background-color: #f4f4f4;
          }
          .actions {
            display: flex;
            justify-content: flex-end;
            align-items: center;
          }
          button {
            padding: 10px 15px;
            background-color: #4CAF50;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            margin: 50px 0px;
          }
          button:hover {
            background-color: #45a049;
          }
          .total-amount {
            font-weight: bold;
            font-size: 16px;
          }

          /* Print-specific styles */
          @media print {
            body {
              font-size: 12px;
            }
            .app {
              max-width: 100%;
              padding: 0;
            }
            input{
            border:none;
            }
            button {
              display: none; /* Hide action buttons on print */
            }
            table,
            th,
            td {
              border: 1px solid #000;
              padding: 8px;
            }
            td input {
              border: none; /* Remove input border when printing */
              width: 100%; /* Ensure input fields fill the cell */
            }
            .total-amount {
              display: block !important; /* Ensure total amount is visible on print */
              margin-top: 20px;
            }
            /* Hide the Actions column during print */
            th:nth-child(6),
            td:nth-child(6) {
              display: none;
            }
            .cus-det{
              width:100%;
              display: flex;
              align-items:center;
              justify-content: space-between;
              margin:12px;
            }
          }
        `}
      </style>

      <h1>Invoice</h1>
      <div className="organization">{organizationName}</div>
      <div className="details-line">
        <div>Date: {date}</div>
        <div>Time: {time}</div>
        <div>Invoice No: {invoiceNumber}</div>
      </div>
      <div className='cus-det'>
      <div>
        <label>Customer Name</label>
        <input placeholder="Enter Customer Name" value={customerName} onChange={(e) => setCustomerName(e.target.value)} />
      </div>
      <div>
        <label>Phone Number</label>
        <input
          placeholder="Enter Customer Mobile"
          value={customerMobile}
          onInput={handleMobileInput}
          maxLength="10"
        />
      </div>
      </div>
      <table>
        <thead>
          <tr>
            <th>Sr No</th>
            <th>Item Name</th>
            <th>Item Quantity</th>
            <th>Item Price</th>
            <th>Item Total Price</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => (
            <tr key={index}>
              <td>{item.srNo}</td>
              <td><input value={item.itemName} onChange={(e) => handleItemChange(index, 'itemName', e.target.value)} /></td>
              <td><input type="number" value={item.itemQuantity} onChange={(e) => handleItemChange(index, 'itemQuantity', Number(e.target.value))} /></td>
              <td><input type="number" value={item.itemPrice} onChange={(e) => handleItemChange(index, 'itemPrice', Number(e.target.value))} /></td>
              <td>{item.itemTotalPrice}</td>
              <td><button onClick={() => handleDeleteRow(index)}>Delete</button></td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="actions">
        <div className="total-amount">Total Amount: {totalAmount}</div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <button style={{ textAlign: 'center' }} onClick={handleSaveAndPrintInvoice}>Print & Save Invoice</button>
      </div>
    </div>
  );
}

export default App;
