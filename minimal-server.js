import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

console.log("Testing basic setup...");

// Test 1: Import guestRoutes
try {
  console.log("Importing guestRoutes...");
  const guestRoutes = await import('./src/routes/guestRoutes.js');
  console.log("guestRoutes imported successfully");
  app.use('/api/guests', guestRoutes.default);
} catch (error) {
  console.error("Error importing guestRoutes:", error.message);
}

// Test 2: Import roomRoutes
try {
  console.log("Importing roomRoutes...");
  const roomRoutes = await import('./src/routes/roomRoutes.js');
  console.log("roomRoutes imported successfully");
  app.use('/api/rooms', roomRoutes.default);
} catch (error) {
  console.error("Error importing roomRoutes:", error.message);
}

// Test 3: Import reservationRoutes
try {
  console.log("Importing reservationRoutes...");
  const reservationRoutes = await import('./src/routes/reservationRoutes.js');
  console.log("reservationRoutes imported successfully");
  app.use('/api/reservations', reservationRoutes.default);
} catch (error) {
  console.error("Error importing reservationRoutes:", error.message);
}

// Test 4: Import main routes
try {
  console.log("Importing main routes...");
  const routes = await import('./src/routes/index.js');
  console.log("Main routes imported successfully");
  app.use('/api', routes.default);
} catch (error) {
  console.error("Error importing main routes:", error.message);
}

console.log("All imports completed!");

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Minimal server running on http://localhost:${PORT}`);
}); 