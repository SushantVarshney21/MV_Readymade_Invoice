const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors'); // Import CORS
const connectDB = require('./db');
const invoiceRoutes = require('./routes/Invoice');

dotenv.config();

const app = express();

// Middleware
app.use(express.json());

// Configure CORS to allow only the specific origin
const corsOptions = {
  origin: "https://mv-readymade-invoicefrontend.vercel.app", // Frontend URL
  credentials: true, // Allow cookies and headers for authentication
};

app.use(cors(corsOptions));

// Connect to Database
connectDB();

// Routes
app.use('/invoices', invoiceRoutes);

app.get('/', (req,res)=>{
  res.send('Invoice API is running');
})

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
