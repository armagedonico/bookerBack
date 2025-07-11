import express from "express"; 
import cors from "cors"; 
import dotenv from "dotenv"; 

dotenv.config(); 
const app = express(); 

// Middleware
app.use(cors()); // Allows queries from other origins (ie: frontend) 
app.use(express.json()); // Allows JSON from frontend 

// Import and mount routes
console.log("Importing routes...");
const routes = await import("./routes/index.js");
console.log("Routes imported successfully");

app.use("/api", routes.default); // Prefix for our routes 
console.log("Routes mounted successfully");

// Error handling middleware
app.use((err, req, res, next) => {
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
console.log("Connecting to database...");
const { connect } = await import("./prismaClient.js");
await connect();
console.log("Database connected successfully");

const PORT = process.env.PORT || 3001; 
app.listen(PORT, () => { 
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
});