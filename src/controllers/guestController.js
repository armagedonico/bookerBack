import prisma from '../prismaClient.js';

// Get all guests
export const getAllGuests = async (req, res) => {
  try {
    const guests = await prisma.guest.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    res.json({
      success: true,
      data: guests
    });
  } catch (error) {
    console.error('Error fetching guests:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching guests',
      error: error.message
    });
  }
};

// Get guest by ID
export const getGuestById = async (req, res) => {
  try {
    const { id } = req.params;
    const guest = await prisma.guest.findUnique({
      where: { id: parseInt(id) },
      include: {
        reservations: {
          include: {
            room: true
          },
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    });

    if (!guest) {
      return res.status(404).json({
        success: false,
        message: 'Guest not found'
      });
    }

    res.json({
      success: true,
      data: guest
    });
  } catch (error) {
    console.error('Error fetching guest:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching guest',
      error: error.message
    });
  }
};

// Create new guest
export const createGuest = async (req, res) => {
  try {
    const { firstName, lastName, email, telephone, idDocument, idDocumentType } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !telephone || !idDocument) {
      return res.status(400).json({
        success: false,
        message: 'First name, last name, telephone, and ID document are required'
      });
    }

    const guest = await prisma.guest.create({
      data: {
        firstName,
        lastName,
        email,
        telephone,
        idDocument,
        idDocumentType: idDocumentType || 'Passport'
      }
    });

    res.status(201).json({
      success: true,
      data: guest,
      message: 'Guest created successfully'
    });
  } catch (error) {
    console.error('Error creating guest:', error);
    
    // Handle unique constraint violations
    if (error.code === 'P2002') {
      return res.status(400).json({
        success: false,
        message: 'A guest with this email or ID document already exists'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error creating guest',
      error: error.message
    });
  }
};

// Update guest
export const updateGuest = async (req, res) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, email, telephone, idDocument, idDocumentType } = req.body;

    const guest = await prisma.guest.update({
      where: { id: parseInt(id) },
      data: {
        firstName,
        lastName,
        email,
        telephone,
        idDocument,
        idDocumentType
      }
    });

    res.json({
      success: true,
      data: guest,
      message: 'Guest updated successfully'
    });
  } catch (error) {
    console.error('Error updating guest:', error);
    
    if (error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        message: 'Guest not found'
      });
    }

    if (error.code === 'P2002') {
      return res.status(400).json({
        success: false,
        message: 'A guest with this email or ID document already exists'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error updating guest',
      error: error.message
    });
  }
};

// Delete guest
export const deleteGuest = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if guest has active reservations
    const activeReservations = await prisma.reservation.findMany({
      where: {
        guestId: parseInt(id),
        status: {
          in: ['RESERVED', 'CHECKED_IN']
        }
      }
    });

    if (activeReservations.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete guest with active reservations'
      });
    }

    await prisma.guest.delete({
      where: { id: parseInt(id) }
    });

    res.json({
      success: true,
      message: 'Guest deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting guest:', error);
    
    if (error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        message: 'Guest not found'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error deleting guest',
      error: error.message
    });
  }
};

// Search guests
export const searchGuests = async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    const guests = await prisma.guest.findMany({
      where: {
        OR: [
          { firstName: { contains: query, mode: 'insensitive' } },
          { lastName: { contains: query, mode: 'insensitive' } },
          { email: { contains: query, mode: 'insensitive' } },
          { telephone: { contains: query, mode: 'insensitive' } },
          { idDocument: { contains: query, mode: 'insensitive' } }
        ]
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json({
      success: true,
      data: guests
    });
  } catch (error) {
    console.error('Error searching guests:', error);
    res.status(500).json({
      success: false,
      message: 'Error searching guests',
      error: error.message
    });
  }
}; 