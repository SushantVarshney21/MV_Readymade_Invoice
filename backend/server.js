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
  origin: '*', // Allow only this origin
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Specify allowed HTTP methods
  allowedHeaders: ['Content-Type', 'Authorization'], // Specify allowed headers
};

app.use(cors(corsOptions)); // Use the configured CORS

// Connect to Database
connectDB();

// Routes
app.use('/invoices', invoiceRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
