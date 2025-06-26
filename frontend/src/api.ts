import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export async function fetchTraces(params = {}, token?: string) {
  const headers: any = {};
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  
  const res = await axios.get(`${API_URL}/traces`, { 
    params,
    headers 
  });
  return res.data;
}

export async function replayTrace(trace) {
  // This is a placeholder: in a real app, you'd call the model again
  // For now, just return the same trace with a new timestamp
  return { ...trace, id: undefined, timestamp: new Date().toISOString() };
}

export async function submitContactForm(formData: { name: string; email: string; interest: string }) {
  const res = await axios.post(`${API_URL}/contact/contact`, formData, {
    headers: {
      'Content-Type': 'application/json',
    },
  });
  return res.data;
}
