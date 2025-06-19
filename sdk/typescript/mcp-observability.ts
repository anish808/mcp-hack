import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

export interface TraceMetadata {
  [key: string]: any;
}

export async function trace({
  apiUrl,
  task,
  context,
  modelOutput,
  metadata = {}
}: {
  apiUrl: string;
  task: string;
  context: any;
  modelOutput: string;
  metadata?: TraceMetadata;
}) {
  const traceId = uuidv4();
  const payload = {
    id: traceId,
    timestamp: new Date().toISOString(),
    task,
    context,
    model_output: modelOutput,
    metadata
  };
  const resp = await axios.post(`${apiUrl.replace(/\/$/, '')}/traces`, payload);
  return resp.data;
}

// Example usage:
// await trace({
//   apiUrl: 'http://localhost:3001',
//   task: 'Summarize',
//   context: { userMessage: 'Summarize the last 5 emails' },
//   modelOutput: 'Here is the summary...',
//   metadata: { runtimeMs: 314, model: 'gpt-4', retries: 0 }
// });
