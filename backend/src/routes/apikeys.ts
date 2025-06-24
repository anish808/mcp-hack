import { Router } from 'express';
import { prisma } from '../db';
import crypto from 'crypto';

const router = Router();

// Get all API keys for the authenticated user
router.get('/', async (req: any, res) => {
  try {
    const userId = req.auth?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const apiKeys = await prisma.apiKey.findMany({
      where: { userId },
      select: {
        id: true,
        name: true,
        description: true,
        key: true, // In production, you might want to mask this
        isActive: true,
        createdAt: true,
        lastUsedAt: true,
        _count: {
          select: { traces: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(apiKeys);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Create a new API key
router.post('/', async (req: any, res) => {
  try {
    const userId = req.auth?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { name, description } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    // Ensure user exists in database (create if not exists)
    const userEmail = req.auth?.user?.primaryEmailAddress?.emailAddress || `${userId}@clerk.local`;
    
    // First try to find existing user by ID
    let user = await prisma.user.findUnique({
      where: { id: userId }
    });
    
    // If user doesn't exist, create them
    if (!user) {
      try {
        user = await prisma.user.create({
          data: {
            id: userId,
            email: userEmail
          }
        });
      } catch (error: any) {
        // If email already exists with different ID, try to find by email
        if (error.code === 'P2002' && error.meta?.target?.includes('email')) {
          // Check if there's already a user with this email but different Clerk ID
          const existingEmailUser = await prisma.user.findUnique({
            where: { email: userEmail }
          });
          
          if (existingEmailUser) {
            // Update the existing user with the new Clerk ID
            user = await prisma.user.update({
              where: { email: userEmail },
              data: { id: userId }
            });
          } else {
            throw error; // Re-throw if it's a different constraint error
          }
        } else {
          throw error; // Re-throw if it's not an email constraint error
        }
      }
    }

    // Generate a secure API key
    const apiKey = `mcp_${crypto.randomBytes(32).toString('hex')}`;

    const newApiKey = await prisma.apiKey.create({
      data: {
        key: apiKey,
        name,
        description: description || '',
        userId,
        isActive: true
      },
      select: {
        id: true,
        name: true,
        description: true,
        key: true,
        isActive: true,
        createdAt: true,
        lastUsedAt: true
      }
    });

    res.json(newApiKey);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Update an API key (toggle active status, update name/description)
router.put('/:id', async (req: any, res) => {
  try {
    const userId = req.auth?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { id } = req.params;
    const { name, description, isActive } = req.body;

    // Verify the API key belongs to the user
    const existingKey = await prisma.apiKey.findUnique({
      where: { id },
      select: { userId: true }
    });

    if (!existingKey || existingKey.userId !== userId) {
      return res.status(404).json({ error: 'API key not found' });
    }

    const updatedKey = await prisma.apiKey.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(isActive !== undefined && { isActive })
      },
      select: {
        id: true,
        name: true,
        description: true,
        key: true,
        isActive: true,
        createdAt: true,
        lastUsedAt: true
      }
    });

    res.json(updatedKey);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Delete an API key
router.delete('/:id', async (req: any, res) => {
  try {
    const userId = req.auth?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { id } = req.params;

    // Verify the API key belongs to the user
    const existingKey = await prisma.apiKey.findUnique({
      where: { id },
      select: { userId: true }
    });

    if (!existingKey || existingKey.userId !== userId) {
      return res.status(404).json({ error: 'API key not found' });
    }

    await prisma.apiKey.delete({
      where: { id }
    });

    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router; 