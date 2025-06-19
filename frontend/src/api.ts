import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export async function fetchTraces(params = {}) {
  const res = await axios.get(`${API_URL}/traces`, { params });
  return res.data;
}

export async function replayTrace(trace) {
  // This is a placeholder: in a real app, you'd call the model again
  // For now, just return the same trace with a new timestamp
  return { ...trace, id: undefined, timestamp: new Date().toISOString() };
}
