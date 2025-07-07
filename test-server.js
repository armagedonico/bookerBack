import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Test routes one by one
app.get('/api/health', (req, res) => {
  res.json({ message: 'Health check OK' });
});

app.get('/api/guests', (req, res) => {
  res.json({ message: 'Guests route OK' });
});

app.get('/api/guests/search', (req, res) => {
  res.json({ message: 'Search route OK' });
});

app.get('/api/guests/:id', (req, res) => {
  res.json({ message: 'Guest by ID OK', id: req.params.id });
});

app.get('/api/rooms', (req, res) => {
  res.json({ message: 'Rooms route OK' });
});

app.get('/api/rooms/available', (req, res) => {
  res.json({ message: 'Available rooms OK' });
});

app.get('/api/rooms/:id/availability', (req, res) => {
  res.json({ message: 'Room availability OK', id: req.params.id });
});

app.get('/api/rooms/:id', (req, res) => {
  res.json({ message: 'Room by ID OK', id: req.params.id });
});

app.get('/api/reservations', (req, res) => {
  res.json({ message: 'Reservations route OK' });
});

app.get('/api/reservations/check-availability', (req, res) => {
  res.json({ message: 'Check availability OK' });
});

app.get('/api/reservations/:id', (req, res) => {
  res.json({ message: 'Reservation by ID OK', id: req.params.id });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Test server running on http://localhost:${PORT}`);
}); 