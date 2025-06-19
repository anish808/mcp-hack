import React, { useEffect, useState } from 'react';
import { fetchTraces } from '../api';

function TraceList({ onSelect }) {
  const [traces, setTraces] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTraces().then(data => {
      setTraces(data);
      setLoading(false);
    });
  }, []);

  if (loading) return <div>Loading traces...</div>;

  return (
    <div>
      <h2>Traces</h2>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {traces.map(trace => (
          <li key={trace.id} style={{ marginBottom: 12, cursor: 'pointer' }} onClick={() => onSelect(trace)}>
            <div><b>{trace.task}</b></div>
            <div style={{ fontSize: 12, color: '#888' }}>{new Date(trace.timestamp).toLocaleString()}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default TraceList;
