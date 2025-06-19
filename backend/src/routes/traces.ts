import { Router } from 'express';
import { prisma } from '../db';

const router = Router();

// Create a new trace
router.post('/', async (req, res) => {
  try {
    const { id, timestamp, task, context, model_output, metadata } = req.body;
    const trace = await prisma.trace.create({
      data: { id, timestamp: new Date(timestamp), task, context, model_output, metadata }
    });
    res.json(trace);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// List traces (optionally filter by task, user, date)
router.get('/', async (req, res) => {
  try {
    const { task, userId, from, to } = req.query;
    const where: any = {};
    if (task) where.task = task;
    if (userId) where['metadata'] = { path: ['userId'], equals: userId };
    if (from || to) where.timestamp = {};
    if (from) where.timestamp.gte = new Date(from as string);
    if (to) where.timestamp.lte = new Date(to as string);
    const traces = await prisma.trace.findMany({
      where,
      orderBy: { timestamp: 'desc' },
      take: 100
    });
    res.json(traces);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
