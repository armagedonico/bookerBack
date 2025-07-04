import prisma from '../prismaClient.js';

// Helper function to calculate nights
const calculateNights = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end - start);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

// Helper function to validate dates
const validateDates = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (start < today) {
    return { isValid: false, error: 'Start date cannot be in the past' };
  }

  if (end <= start) {
    return { isValid: false, error: 'End date must be after start date' };
  }

  return { isValid: true };
};

// Helper function to check availability
const checkAvailability = async (roomId, startDate, endDate, excludeReservationId = null) => {
  const whereClause = {
    roomId: parseInt(roomId),
    status: {
      in: ['RESERVED', 'CHECKED_IN']
    },
    OR: [
      {
        startDate: {
          lt: new Date(endDate)
        },
        endDate: {
          gt: new Date(startDate)
        }
      }
    ]
  };

  if (excludeReservationId) {
    whereClause.id = {
      not: parseInt(excludeReservationId)
    };
  }

  const conflictingReservations = await prisma.reservation.findMany({
    where: whereClause
  });

  return {
    isAvailable: conflictingReservations.length === 0,
    conflictingReservations
  };
};

// Get all reservations
export const getAllReservations = async (req, res) => {
  try {
    const { status, guestName, startDate, endDate } = req.query;
    
    let whereClause = {};
    let includeClause = {
      guest: true,
      room: true
    };

    // Filter by status
    if (status) {
      whereClause.status = status;
    }

    // Filter by guest name
    if (guestName) {
      includeClause.guest = {
        where: {
          OR: [
            { firstName: { contains: guestName, mode: 'insensitive' } },
            { lastName: { contains: guestName, mode: 'insensitive' } }
          ]
        }
      };
    }

    // Filter by date range
    if (startDate && endDate) {
      whereClause.OR = [
        {
          startDate: {
            gte: new Date(startDate)
          },
          endDate: {
            lte: new Date(endDate)
          }
        },
        {
          startDate: {
            lte: new Date(startDate)
          },
          endDate: {
            gte: new Date(endDate)
          }
        }
      ];
    }

    const reservations = await prisma.reservation.findMany({
      where: whereClause,
      include: includeClause,
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json({
      success: true,
      data: reservations
    });
  } catch (error) {
    console.error('Error fetching reservations:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching reservations',
      error: error.message
    });
  }
};

// Get reservation by ID
export const getReservationById = async (req, res) => {
  try {
    const { id } = req.params;
    const reservation = await prisma.reservation.findUnique({
      where: { id: parseInt(id) },
      include: {
        guest: true,
        room: true
      }
    });

    if (!reservation) {
      return res.status(404).json({
        success: false,
        message: 'Reservation not found'
      });
    }

    res.json({
      success: true,
      data: reservation
    });
  } catch (error) {
    console.error('Error fetching reservation:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching reservation',
      error: error.message
    });
  }
};

// Create new reservation (booking)
export const createReservation = async (req, res) => {
  try {
    const { guestId, roomId, startDate, endDate, specialRequests } = req.body;

    // Validate required fields
    if (!guestId || !roomId || !startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Guest ID, room ID, start date, and end date are required'
      });
    }

    // Validate dates
    const dateValidation = validateDates(startDate, endDate);
    if (!dateValidation.isValid) {
      return res.status(400).json({
        success: false,
        message: dateValidation.error
      });
    }

    // Check availability
    const availability = await checkAvailability(roomId, startDate, endDate);
    if (!availability.isAvailable) {
      return res.status(400).json({
        success: false,
        message: 'Room is not available for the selected dates',
        conflictingReservations: availability.conflictingReservations
      });
    }

    // Get room details for price calculation
    const room = await prisma.room.findUnique({
      where: { id: parseInt(roomId) }
    });

    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }

    // Calculate nights and total amount
    const nights = calculateNights(startDate, endDate);
    const totalAmount = room.price * nights;

    // Create reservation
    const reservation = await prisma.reservation.create({
      data: {
        guestId: parseInt(guestId),
        roomId: parseInt(roomId),
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        totalAmount,
        nights,
        specialRequests
      },
      include: {
        guest: true,
        room: true
      }
    });

    res.status(201).json({
      success: true,
      data: reservation,
      message: 'Reservation created successfully'
    });
  } catch (error) {
    console.error('Error creating reservation:', error);
    
    if (error.code === 'P2003') {
      return res.status(400).json({
        success: false,
        message: 'Guest or room not found'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error creating reservation',
      error: error.message
    });
  }
};

// Update reservation
export const updateReservation = async (req, res) => {
  try {
    const { id } = req.params;
    const { guestId, roomId, startDate, endDate, status, specialRequests } = req.body;

    // Get existing reservation
    const existingReservation = await prisma.reservation.findUnique({
      where: { id: parseInt(id) },
      include: {
        room: true
      }
    });

    if (!existingReservation) {
      return res.status(404).json({
        success: false,
        message: 'Reservation not found'
      });
    }

    // If dates are being changed, validate them
    if (startDate && endDate) {
      const dateValidation = validateDates(startDate, endDate);
      if (!dateValidation.isValid) {
        return res.status(400).json({
          success: false,
          message: dateValidation.error
        });
      }

      // Check availability (excluding current reservation)
      const availability = await checkAvailability(
        roomId || existingReservation.roomId,
        startDate,
        endDate,
        id
      );
      
      if (!availability.isAvailable) {
        return res.status(400).json({
          success: false,
          message: 'Room is not available for the selected dates',
          conflictingReservations: availability.conflictingReservations
        });
      }
    }

    // Calculate new total if dates or room changed
    let totalAmount = existingReservation.totalAmount;
    let nights = existingReservation.nights;
    
    if (startDate && endDate) {
      nights = calculateNights(startDate, endDate);
      const room = roomId 
        ? await prisma.room.findUnique({ where: { id: parseInt(roomId) } })
        : existingReservation.room;
      totalAmount = room.price * nights;
    }

    // Update reservation
    const reservation = await prisma.reservation.update({
      where: { id: parseInt(id) },
      data: {
        guestId: guestId ? parseInt(guestId) : undefined,
        roomId: roomId ? parseInt(roomId) : undefined,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        status,
        totalAmount,
        nights,
        specialRequests
      },
      include: {
        guest: true,
        room: true
      }
    });

    res.json({
      success: true,
      data: reservation,
      message: 'Reservation updated successfully'
    });
  } catch (error) {
    console.error('Error updating reservation:', error);
    
    if (error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        message: 'Reservation not found'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error updating reservation',
      error: error.message
    });
  }
};

// Delete reservation (cancel)
export const deleteReservation = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if reservation exists and can be cancelled
    const reservation = await prisma.reservation.findUnique({
      where: { id: parseInt(id) }
    });

    if (!reservation) {
      return res.status(404).json({
        success: false,
        message: 'Reservation not found'
      });
    }

    // Check if reservation is already completed
    if (reservation.status === 'COMPLETED') {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel a completed reservation'
      });
    }

    await prisma.reservation.delete({
      where: { id: parseInt(id) }
    });

    res.json({
      success: true,
      message: 'Reservation cancelled successfully'
    });
  } catch (error) {
    console.error('Error cancelling reservation:', error);
    
    if (error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        message: 'Reservation not found'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error cancelling reservation',
      error: error.message
    });
  }
};

// Check availability for a date range
export const checkAvailabilityEndpoint = async (req, res) => {
  try {
    const { startDate, endDate, roomId } = req.query;
    
    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Start date and end date are required'
      });
    }

    // Validate dates
    const dateValidation = validateDates(startDate, endDate);
    if (!dateValidation.isValid) {
      return res.status(400).json({
        success: false,
        message: dateValidation.error
      });
    }

    let whereClause = {
      status: {
        in: ['RESERVED', 'CHECKED_IN']
      },
      OR: [
        {
          startDate: {
            lt: new Date(endDate)
          },
          endDate: {
            gt: new Date(startDate)
          }
        }
      ]
    };

    // If roomId is provided, check specific room
    if (roomId) {
      whereClause.roomId = parseInt(roomId);
    }

    const conflictingReservations = await prisma.reservation.findMany({
      where: whereClause,
      include: {
        room: true,
        guest: true
      }
    });

    const isAvailable = roomId ? conflictingReservations.length === 0 : true;

    res.json({
      success: true,
      data: {
        startDate,
        endDate,
        roomId: roomId ? parseInt(roomId) : null,
        isAvailable,
        conflictingReservations
      }
    });
  } catch (error) {
    console.error('Error checking availability:', error);
    res.status(500).json({
      success: false,
      message: 'Error checking availability',
      error: error.message
    });
  }
};