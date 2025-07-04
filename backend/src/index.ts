import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { ClerkExpressWithAuth } from '@clerk/clerk-sdk-node';
import tracesRouter from './routes/traces';
import apiKeysRouter from './routes/apikeys';
import contactRouter from './routes/contact';

dotenv.config();

const app = express();

// CORS configuration
app.use(cors({
  origin: [
    'http://localhost:5173', 
    'http://localhost:3000',
    'http://137.184.85.124',
    'https://137.184.85.124',
    'https://etalesystems.com',
    'https://www.etalesystems.com'
  ],
  credentials: true,
}));

app.use(express.json());

// API info endpoint (before Clerk middleware to allow unauthenticated access)
app.get('/', (req, res) => {
  res.json({ 
    name: 'Etale Systems MCP Observability API',
    version: '1.0.0',
    status: 'ok',
    timestamp: new Date().toISOString(),
    endpoints: {
      health: '/health',
      contact: '/contact',
      traces: '/traces',
      apikeys: '/apikeys',
      user: '/user'
    },
    documentation: 'https://etalesystems.com'
  });
});

// Health check endpoint (before Clerk middleware to allow unauthenticated access)
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Contact form endpoint (before Clerk middleware to allow unauthenticated access)
app.use('/contact', contactRouter);

// Apply Clerk middleware
app.use(ClerkExpressWithAuth());

// Routes
app.use('/traces', tracesRouter);
app.use('/apikeys', apiKeysRouter);

// User management routes
app.get('/user', (req: any, res) => {
  if (req.auth?.userId) {
    res.json({ userId: req.auth.userId, authenticated: true });
  } else {
    res.json({ authenticated: false });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 MCP Observability SaaS backend running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
});
