import express from 'express';
import {
  getAllGuests,
  getGuestById,
  createGuest,
  updateGuest,
  deleteGuest,
  searchGuests
} from '../controllers/guestController.js';

const router = express.Router();

// GET /api/guests - Get all guests
router.get('/', getAllGuests);

// GET /api/guests/search - Search guests
router.get('/search', searchGuests);

// GET /api/guests/:id - Get guest by ID
router.get('/:id', getGuestById);

// POST /api/guests - Create new guest
router.post('/', createGuest);

// PUT /api/guests/:id - Update guest
router.put('/:id', updateGuest);

// DELETE /api/guests/:id - Delete guest
router.delete('/:id', deleteGuest);

export default router;