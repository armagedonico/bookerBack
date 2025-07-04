import express from "express"; 
import cors from "cors"; 
import dotenv from "dotenv"; 
import reservationRoutes from "./routes/reservationRoutes.js"; 
import { connect } from "./prismaClient.js"; 

dotenv.config(); 
const app = express(); 

// Middleware
app.use(cors()); // Allows queries from other origins (ie: frontend) 
app.use(express.json()); // Allows JSON from frontend 

// Routes
app.use("/api", reservationRoutes); // Prefix for our routes 

// Error handling middleware
app.use((err, req, res) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Connect to database
connect(); 

const PORT = process.env.PORT || 3001; 
app.listen(PORT, () => { 
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
});