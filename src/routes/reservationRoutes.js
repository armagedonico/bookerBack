import express from 'express';
import {
  getAllReservations,
  getReservationById,
  createReservation,
  updateReservation,
  deleteReservation,
  checkAvailabilityEndpoint
} from '../controllers/reservationController.js';

const router = express.Router();

// GET /api/reservations - Get all reservations
router.get('/', getAllReservations);

// GET /api/reservations/check-availability - Check availability
router.get('/check-availability', checkAvailabilityEndpoint);

// GET /api/reservations/:id - Get reservation by ID
router.get('/:id', getReservationById);

// POST /api/reservations - Create new reservation (booking)
router.post('/', createReservation);

// PUT /api/reservations/:id - Update reservation
router.put('/:id', updateReservation);

// DELETE /api/reservations/:id - Cancel reservation
router.delete('/:id', deleteReservation);

export default router;