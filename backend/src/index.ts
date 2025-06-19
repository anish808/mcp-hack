import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import tracesRouter from './routes/traces';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/traces', tracesRouter);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`MCP Observability backend running on port ${PORT}`);
});
