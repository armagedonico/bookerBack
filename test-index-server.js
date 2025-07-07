import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

console.log("Testing index router...");

try {
  console.log("Importing routes from index.js...");
  const routes = await import('./src/routes/index.js');
  console.log("Routes imported successfully");
  
  console.log("Mounting routes at /api...");
  app.use("/api", routes.default);
  console.log("Routes mounted successfully");
} catch (error) {
  console.error("Error:", error.message);
  console.error("Stack:", error.stack);
}

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Test index server running on http://localhost:${PORT}`);
}); 