
const express = require('express');
const cors = require('cors');
const verifyRoutes = require('./routes/verify');

require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: 'http://localhost:3000', // Your React app URL
  credentials: true
}));
app.use(express.json());

// Routes
app.use('/api', verifyRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'DhanSaathi API is running' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});