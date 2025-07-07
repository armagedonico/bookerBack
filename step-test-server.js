import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

console.log("Step 1: Basic Express setup...");

// Step 1: Basic route
app.get('/api/health', (req, res) => {
  res.json({ message: 'Health check OK' });
});

console.log("Step 2: Testing guest routes...");

// Step 2: Guest routes
app.get('/api/guests', (req, res) => {
  res.json({ message: 'Guests route OK' });
});

app.get('/api/guests/search', (req, res) => {
  res.json({ message: 'Search route OK' });
});

app.get('/api/guests/:id', (req, res) => {
  res.json({ message: 'Guest by ID OK', id: req.params.id });
});

console.log("Step 3: Testing room routes...");

// Step 3: Room routes
app.get('/api/rooms', (req, res) => {
  res.json({ message: 'Rooms route OK' });
});

app.get('/api/rooms/available', (req, res) => {
  res.json({ message: 'Available rooms OK' });
});

console.log("Step 4: Testing room availability route...");

// Step 4: Room availability route (this might be the problematic one)
app.get('/api/rooms/:id/availability', (req, res) => {
  res.json({ message: 'Room availability OK', id: req.params.id });
});

console.log("Step 5: Testing room by ID route...");

// Step 5: Room by ID route
app.get('/api/rooms/:id', (req, res) => {
  res.json({ message: 'Room by ID OK', id: req.params.id });
});

console.log("Step 6: Testing reservation routes...");

// Step 6: Reservation routes
app.get('/api/reservations', (req, res) => {
  res.json({ message: 'Reservations route OK' });
});

app.get('/api/reservations/check-availability', (req, res) => {
  res.json({ message: 'Check availability OK' });
});

app.get('/api/reservations/:id', (req, res) => {
  res.json({ message: 'Reservation by ID OK', id: req.params.id });
});

console.log("All routes added successfully!");

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Step test server running on http://localhost:${PORT}`);
}); 