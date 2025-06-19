import React from 'react';
import { replayTrace } from '../api';

function TraceDetail({ trace }) {
  if (!trace) return <div>Select a trace to view details.</div>;

  const handleReplay = async () => {
    const replayed = await replayTrace(trace);
    alert('Replay result (mock):\n' + JSON.stringify(replayed, null, 2));
  };

  return (
    <div>
      <h2>Trace Detail</h2>
      <div><b>Task:</b> {trace.task}</div>
      <div><b>Timestamp:</b> {new Date(trace.timestamp).toLocaleString()}</div>
      <div><b>Context:</b>
        <pre>{JSON.stringify(trace.context, null, 2)}</pre>
      </div>
      <div><b>Model Output:</b>
        <pre>{trace.model_output}</pre>
      </div>
      <div><b>Metadata:</b>
        <pre>{JSON.stringify(trace.metadata, null, 2)}</pre>
      </div>
      <button onClick={handleReplay}>Replay</button>
    </div>
  );
}

export default TraceDetail;
