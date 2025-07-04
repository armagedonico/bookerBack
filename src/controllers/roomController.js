import prisma from '../prismaClient.js';

// Get all rooms
export const getAllRooms = async (req, res) => {
  try {
    const rooms = await prisma.room.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    res.json({
      success: true,
      data: rooms
    });
  } catch (error) {
    console.error('Error fetching rooms:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching rooms',
      error: error.message
    });
  }
};

// Get room by ID
export const getRoomById = async (req, res) => {
  try {
    const { id } = req.params;
    const room = await prisma.room.findUnique({
      where: { id: parseInt(id) },
      include: {
        reservations: {
          include: {
            guest: true
          },
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    });

    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }

    res.json({
      success: true,
      data: room
    });
  } catch (error) {
    console.error('Error fetching room:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching room',
      error: error.message
    });
  }
};

// Create new room
export const createRoom = async (req, res) => {
  try {
    const { name, description, price, capacity, beds, airConditioning } = req.body;

    // Validate required fields
    if (!name || !price || !capacity || !beds) {
      return res.status(400).json({
        success: false,
        message: 'Name, price, capacity, and beds are required'
      });
    }

    const room = await prisma.room.create({
      data: {
        name,
        description,
        price: parseFloat(price),
        capacity: parseInt(capacity),
        beds: parseInt(beds),
        airConditioning: airConditioning || false
      }
    });

    res.status(201).json({
      success: true,
      data: room,
      message: 'Room created successfully'
    });
  } catch (error) {
    console.error('Error creating room:', error);
    
    // Handle unique constraint violations
    if (error.code === 'P2002') {
      return res.status(400).json({
        success: false,
        message: 'A room with this name already exists'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error creating room',
      error: error.message
    });
  }
};

// Update room
export const updateRoom = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, capacity, beds, airConditioning, status } = req.body;

    const room = await prisma.room.update({
      where: { id: parseInt(id) },
      data: {
        name,
        description,
        price: price ? parseFloat(price) : undefined,
        capacity: capacity ? parseInt(capacity) : undefined,
        beds: beds ? parseInt(beds) : undefined,
        airConditioning,
        status
      }
    });

    res.json({
      success: true,
      data: room,
      message: 'Room updated successfully'
    });
  } catch (error) {
    console.error('Error updating room:', error);
    
    if (error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }

    if (error.code === 'P2002') {
      return res.status(400).json({
        success: false,
        message: 'A room with this name already exists'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error updating room',
      error: error.message
    });
  }
};

// Delete room
export const deleteRoom = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if room has active reservations
    const activeReservations = await prisma.reservation.findMany({
      where: {
        roomId: parseInt(id),
        status: {
          in: ['RESERVED', 'CHECKED_IN']
        }
      }
    });

    if (activeReservations.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete room with active reservations'
      });
    }

    await prisma.room.delete({
      where: { id: parseInt(id) }
    });

    res.json({
      success: true,
      message: 'Room deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting room:', error);
    
    if (error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error deleting room',
      error: error.message
    });
  }
};

// Get available rooms
export const getAvailableRooms = async (req, res) => {
  try {
    const { startDate, endDate, capacity, beds, airConditioning } = req.query;
    
    let whereClause = {
      status: 'AVAILABLE'
    };

    // Add filters if provided
    if (capacity) {
      whereClause.capacity = {
        gte: parseInt(capacity)
      };
    }

    if (beds) {
      whereClause.beds = {
        gte: parseInt(beds)
      };
    }

    if (airConditioning === 'true') {
      whereClause.airConditioning = true;
    }

    const rooms = await prisma.room.findMany({
      where: whereClause,
      orderBy: {
        price: 'asc'
      }
    });

    // If dates are provided, filter out rooms with conflicting reservations
    if (startDate && endDate) {
      const availableRooms = [];
      
      for (const room of rooms) {
        const conflictingReservations = await prisma.reservation.findMany({
          where: {
            roomId: room.id,
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
          }
        });

        if (conflictingReservations.length === 0) {
          availableRooms.push(room);
        }
      }

      res.json({
        success: true,
        data: availableRooms
      });
    } else {
      res.json({
        success: true,
        data: rooms
      });
    }
  } catch (error) {
    console.error('Error fetching available rooms:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching available rooms',
      error: error.message
    });
  }
};

// Check room availability
export const checkRoomAvailability = async (req, res) => {
  try {
    const { roomId, startDate, endDate } = req.params;
    
    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Start date and end date are required'
      });
    }

    const conflictingReservations = await prisma.reservation.findMany({
      where: {
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
      }
    });

    const isAvailable = conflictingReservations.length === 0;

    res.json({
      success: true,
      data: {
        roomId: parseInt(roomId),
        startDate,
        endDate,
        isAvailable,
        conflictingReservations: isAvailable ? [] : conflictingReservations
      }
    });
  } catch (error) {
    console.error('Error checking room availability:', error);
    res.status(500).json({
      success: false,
      message: 'Error checking room availability',
      error: error.message
    });
  }
}; 