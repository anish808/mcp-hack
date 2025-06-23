import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

export interface TraceMetadata {
  [key: string]: any;
}

export async function trace({
  apiUrl,
  apiKey,
  task,
  context,
  modelOutput,
  metadata = {}
}: {
  apiUrl: string;
  apiKey: string;
  task: string;
  context: any;
  modelOutput: string;
  metadata?: TraceMetadata;
}) {
  if (!apiKey) {
    console.warn('No API key provided. Trace will not be sent.');
    return null;
  }

  const traceId = uuidv4();
  const payload = {
    id: traceId,
    timestamp: new Date().toISOString(),
    task,
    context,
    model_output: modelOutput,
    metadata
  };

  const headers = {
    'Content-Type': 'application/json',
    'X-API-Key': apiKey
  };

  try {
    const resp = await axios.post(`${apiUrl.replace(/\/$/, '')}/traces`, payload, { headers });
    return resp.data;
  } catch (error) {
    console.error('Failed to send trace:', error);
    return null;
  }
}

// Example usage:
// await trace({
//   apiUrl: 'http://localhost:3001',
//   apiKey: 'mcp_your_api_key_here', // Get this from your dashboard
//   task: 'Summarize',
//   context: { userMessage: 'Summarize the last 5 emails' },
//   modelOutput: 'Here is the summary...',
//   metadata: { runtimeMs: 314, model: 'gpt-4', retries: 0 }
// });
