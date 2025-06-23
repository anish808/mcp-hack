import { Router } from 'express';
import { prisma } from '../db';

const router = Router();

// Middleware to validate API key for trace creation
const validateApiKey = async (req: any, res: any, next: any) => {
  const apiKey = req.headers['x-api-key'] || req.headers['authorization']?.replace('Bearer ', '');
  
  if (!apiKey) {
    return res.status(401).json({ error: 'API key required' });
  }

  try {
    const keyRecord = await prisma.apiKey.findUnique({
      where: { key: apiKey },
      include: { user: true }
    });

    if (!keyRecord || !keyRecord.isActive) {
      return res.status(401).json({ error: 'Invalid or inactive API key' });
    }

    // Update last used timestamp
    await prisma.apiKey.update({
      where: { id: keyRecord.id },
      data: { lastUsedAt: new Date() }
    });

    req.apiKey = keyRecord;
    req.userId = keyRecord.userId;
    next();
  } catch (err: any) {
    return res.status(500).json({ error: 'API key validation failed' });
  }
};

// Create a new trace (requires API key)
router.post('/', validateApiKey, async (req: any, res) => {
  try {
    const { id, timestamp, task, context, model_output, metadata } = req.body;
    const trace = await prisma.trace.create({
      data: { 
        id, 
        timestamp: new Date(timestamp), 
        task, 
        context, 
        model_output, 
        metadata,
        userId: req.userId,
        apiKeyId: req.apiKey.id
      }
    });
    res.json(trace);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// List traces for authenticated user
router.get('/', async (req: any, res) => {
  try {
    const userId = req.auth?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { task, from, to } = req.query;
    const where: any = { userId }; // Only show traces for the authenticated user
    
    if (task) where.task = task;
    if (from || to) where.timestamp = {};
    if (from) where.timestamp.gte = new Date(from as string);
    if (to) where.timestamp.lte = new Date(to as string);
    
    const traces = await prisma.trace.findMany({
      where,
      include: {
        apiKey: {
          select: {
            name: true,
            id: true
          }
        }
      },
      orderBy: { timestamp: 'desc' },
      take: 100
    });
    
    res.json(traces);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Get trace details for authenticated user
router.get('/:id', async (req: any, res) => {
  try {
    const userId = req.auth?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { id } = req.params;
    const trace = await prisma.trace.findFirst({
      where: { 
        id,
        userId // Ensure user can only access their own traces
      },
      include: {
        apiKey: {
          select: {
            name: true,
            id: true
          }
        }
      }
    });

    if (!trace) {
      return res.status(404).json({ error: 'Trace not found' });
    }

    res.json(trace);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
