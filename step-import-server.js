import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

console.log("Step 1: Basic Express setup...");

// Basic test route
app.get('/test', (req, res) => {
  res.json({ message: 'Test route working' });
});

console.log("Step 2: Testing guestRoutes import...");
try {
  const guestRoutes = await import('./src/routes/guestRoutes.js');
  console.log("✓ guestRoutes imported successfully");
  app.use('/api/guests', guestRoutes.default);
  console.log("✓ guestRoutes mounted successfully");
} catch (error) {
  console.error("✗ Error with guestRoutes:", error.message);
}

console.log("Step 3: Testing roomRoutes import...");
try {
  const roomRoutes = await import('./src/routes/roomRoutes.js');
  console.log("✓ roomRoutes imported successfully");
  app.use('/api/rooms', roomRoutes.default);
  console.log("✓ roomRoutes mounted successfully");
} catch (error) {
  console.error("✗ Error with roomRoutes:", error.message);
}

console.log("Step 4: Testing reservationRoutes import...");
try {
  const reservationRoutes = await import('./src/routes/reservationRoutes.js');
  console.log("✓ reservationRoutes imported successfully");
  app.use('/api/reservations', reservationRoutes.default);
  console.log("✓ reservationRoutes mounted successfully");
} catch (error) {
  console.error("✗ Error with reservationRoutes:", error.message);
}

console.log("Step 5: Testing main routes import...");
try {
  const routes = await import('./src/routes/index.js');
  console.log("✓ Main routes imported successfully");
  app.use('/api', routes.default);
  console.log("✓ Main routes mounted successfully");
} catch (error) {
  console.error("✗ Error with main routes:", error.message);
}

console.log("Step 6: Testing Prisma connection...");
try {
  const { connect } = await import('./src/prismaClient.js');
  console.log("✓ Prisma client imported successfully");
  await connect();
  console.log("✓ Prisma connected successfully");
} catch (error) {
  console.error("✗ Error with Prisma connection:", error.message);
  console.error("Stack:", error.stack);
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
    error: err.message
  });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Step import server running on http://localhost:${PORT}`);
}); 