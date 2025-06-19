import React, { useState } from 'react';
import TraceList from './components/TraceList';
import TraceDetail from './components/TraceDetail';

function App() {
  const [selectedTrace, setSelectedTrace] = useState(null);

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <div style={{ width: 400, borderRight: '1px solid #eee', overflowY: 'auto' }}>
        <TraceList onSelect={setSelectedTrace} />
      </div>
      <div style={{ flex: 1, padding: 24, overflowY: 'auto' }}>
        <TraceDetail trace={selectedTrace} />
      </div>
    </div>
  );
}

export default App;
