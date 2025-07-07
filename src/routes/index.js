import express from 'express';
import guestRoutes from './guestRoutes.js';
import roomRoutes from './roomRoutes.js';
import reservationRoutes from './reservationRoutes.js';

const router = express.Router();

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Hotel Booking API is running',
    timestamp: new Date().toISOString()
  });
});

// Mount route modules
router.use('/guests', guestRoutes);
router.use('/rooms', roomRoutes);
router.use('/reservations', reservationRoutes);

// Booking alias (for convenience) - removed to avoid conflicts
// router.use('/bookings', reservationRoutes);

export default router;