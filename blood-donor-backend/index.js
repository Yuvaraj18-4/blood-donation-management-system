const express = require('express');
const cors = require('cors');
const connectDB = require('./config');

// Import routes
const authRoutes = require('./routes/auth');
const donorRoutes = require('./routes/donors');
const campRoutes = require('./routes/camps');
const registrationRoutes = require('./routes/registrations');
const requestRoutes = require('./routes/requests');
const chatbotRoutes = require('./routes/chatbot');

const app = express();

// Connect to MongoDB
connectDB();

// Middlewares
app.use(cors({
  origin: '*', // Allows local React dev server and production builds
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-access-token']
}));
app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/donors', donorRoutes);
app.use('/api/camps', campRoutes);
app.use('/api/registrations', registrationRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/chatbot', chatbotRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    system: 'Blood Donation Management System API',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Default route
app.get('/', (req, res) => res.send('Blood Donor API running...'));

// 404 Handler for undefined routes
app.use((req, res) => {
  res.status(404).json({ msg: `Route ${req.method} ${req.url} not found on this server.` });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({ msg: 'Internal server error occurred.', error: err.message });
});

// Start server
const PORT = process.env.PORT || 5000;
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

module.exports = app;
