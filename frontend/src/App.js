import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

function App() {
  const [organizationName] = useState('JAI MATA DI');
  const [date] = useState(new Date().toLocaleDateString('en-GB')); // DD/MM/YYYY
  const [time] = useState(new Date().toLocaleTimeString('en-US', { hour12: true })); // 12-hour format
  const [invoiceNumber, setInvoiceNumber] = useState(1);
  const [customerName, setCustomerName] = useState('');
  const [customerMobile, setCustomerMobile] = useState('');
  const [items, setItems] = useState([{ srNo: 1, itemQuantity: '', itemPrice: '', itemTotalPrice: 0 }]); // Automatically generate first row
  const [totalAmount, setTotalAmount] = useState(0);

  const quantityRefs = useRef([]);
  const priceRefs = useRef([]);
  const focusIndex = useRef(0); // To keep track of the current row for focus control

  useEffect(() => {
    // Fetch invoice count to set invoice number
    axios.get(`${process.env.REACT_APP_BASE_URL}/invoices`).then((response) => {
      setInvoiceNumber(response.data.length + 1);
    });

    // Add keyboard event listener for adding rows and focusing
    const handleKeyPress = (e) => {
      if (e.key === 'Enter') {
        e.preventDefault(); // Prevent default form submission
        handleFocusAndAddRow();
      }
    };
    window.addEventListener('keypress', handleKeyPress);
    return () => {
      window.removeEventListener('keypress', handleKeyPress);
    };
  }, [items]);

  const handleFocusAndAddRow = () => {
    const currentRow = items[focusIndex.current];

    if (currentRow && currentRow.itemQuantity && !currentRow.itemPrice) {
      // If Item Quantity is filled, shift focus to Item Price
      priceRefs.current[focusIndex.current]?.focus();
    } else if (currentRow && currentRow.itemPrice) {
      // If Item Price is filled, add a new row and focus on Item Quantity of the new row
      setItems((prevItems) => {
        const newRow = { srNo: prevItems.length + 1, itemQuantity: '', itemPrice: '', itemTotalPrice: 0 };
        const updatedItems = [...prevItems, newRow];
        setTotalAmount(updatedItems.reduce((sum, item) => sum + item.itemTotalPrice, 0));
        return updatedItems;
      });

      // Move focus to the Item Quantity input of the newly added row
      focusIndex.current = items.length; // Move focus index to the next row
      setTimeout(() => {
        quantityRefs.current[focusIndex.current]?.focus();
      }, 100);
    }
  };

  const handleDeleteRow = (index) => {
    const updatedItems = items.filter((_, i) => i !== index);
    setItems(updatedItems.map((item, i) => ({ ...item, srNo: i + 1 }))); // Reassign Sr No
    setTotalAmount(updatedItems.reduce((sum, item) => sum + item.itemTotalPrice, 0));
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

    axios.post(`${process.env.REACT_APP_BASE_URL}/invoices/create`, invoice)
      .then(() => {
        alert('Invoice Saved Successfully');
        window.print(); // Print the invoice

        // Reset form fields
        setCustomerName('');
        setCustomerMobile('');
        setItems([{ srNo: 1, itemQuantity: '', itemPrice: '', itemTotalPrice: 0 }]); // Reset to first row
        setTotalAmount(0);
      })
      .catch(() => {
        alert('Error saving invoice');
      });
  };

  const handleMobileInput = (e) => {
    const value = e.target.value.replace(/\D/g, ''); // Allow only numbers
    setCustomerMobile(value.slice(0, 10)); // Limit to 10 digits
  };

  // Calculate total item quantity
  const totalItemQuantity = items.reduce((sum, item) => sum + (Number(item.itemQuantity) || 0), 0);

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
            margin: 0px 0;
            margin-bottom: 10px;
            text-decoration: underline;
          }
          .estimate {
            text-align: center;
            font-size: 18px;
            font-weight: bold;
            margin: 15px 0;
            margin-top: 0px;
            text-decoration: underline;
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
          .total-quantity {
            font-weight: bold;
            font-size: 16px;
            margin-right: 20px;
          }

          @media print {
          @page {
    size: A5 portrait; /* Adjust as needed */
    margin: 0; /* Remove default margins */
  }
  body {
    margin: 0;
    padding: 0;
  }
  .app {
    max-width: 100%;
    padding: 0;
    margin: 0;
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
    padding: 2px;
    margin:0;
  }
  td input {
    border: none; /* Remove input border when printing */
    width: 100%; /* Ensure input fields fill the cell */
    padding: 2px;
    margin:0;
  }
  .total-amount {
    display: block !important; /* Ensure total amount is visible on print */
    margin-top: 20px;
  }
  /* Hide the Actions column during print */
  th:nth-child(5),
  td:nth-child(5) {
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
      <div className="estimate">ESTIMATE</div>
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
              <td>
                <input
                  ref={(el) => quantityRefs.current[index] = el}
                  type="number"
                  value={item.itemQuantity}
                  onChange={(e) => handleItemChange(index, 'itemQuantity', Number(e.target.value))}
                />
              </td>
              <td>
                <input
                  ref={(el) => priceRefs.current[index] = el}
                  type="number"
                  value={item.itemPrice}
                  onChange={(e) => handleItemChange(index, 'itemPrice', Number(e.target.value))}
                />
              </td>
              <td>{item.itemTotalPrice}</td>
              <td><button onClick={() => handleDeleteRow(index)}>Delete</button></td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="actions" style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
        <div className="total-quantity">Total Item Quantity: {totalItemQuantity}</div>
        <div className="total-amount">Total Amount: {totalAmount}</div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <button onClick={handleSaveAndPrintInvoice}>Print & Save Invoice</button>
      </div>
    </div>
  );
}

export default App;
