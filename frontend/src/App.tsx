import React, { useState } from 'react';
import TraceList from './components/TraceList';
import TraceDetail from './components/TraceDetail';
import MetricsDashboard from './components/MetricsDashboard';
import ToolAnalytics from './components/ToolAnalytics';

function App() {
  const [selectedTrace, setSelectedTrace] = useState(null);
  const [activeTab, setActiveTab] = useState('traces');

  const tabStyle = (isActive) => ({
    padding: '8px 16px',
    background: isActive ? '#007bff' : '#f8f9fa',
    color: isActive ? 'white' : '#333',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    marginRight: '8px'
  });

  const renderContent = () => {
    switch (activeTab) {
      case 'traces':
        return (
          <div style={{ display: 'flex', height: 'calc(100vh - 80px)' }}>
            <div style={{ width: 400, borderRight: '1px solid #eee', overflowY: 'auto' }}>
              <TraceList onSelect={setSelectedTrace} />
            </div>
            <div style={{ flex: 1, padding: 24, overflowY: 'auto' }}>
              <TraceDetail trace={selectedTrace} />
            </div>
          </div>
        );
      case 'metrics':
        return <MetricsDashboard />;
      case 'analytics':
        return <ToolAnalytics />;
      default:
        return null;
    }
  };

  return (
    <div style={{ fontFamily: 'Arial, sans-serif' }}>
      {/* Header */}
      <div style={{ 
        background: '#f8f9fa', 
        borderBottom: '1px solid #dee2e6', 
        padding: '16px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <h1 style={{ margin: 0, color: '#333' }}>MCP Observability Dashboard</h1>
        <div>
          <button 
            style={tabStyle(activeTab === 'traces')}
            onClick={() => setActiveTab('traces')}
          >
            📋 Traces
          </button>
          <button 
            style={tabStyle(activeTab === 'metrics')}
            onClick={() => setActiveTab('metrics')}
          >
            📊 Metrics
          </button>
          <button 
            style={tabStyle(activeTab === 'analytics')}
            onClick={() => setActiveTab('analytics')}
          >
            📈 Analytics
          </button>
        </div>
      </div>

      {/* Content */}
      {renderContent()}
    </div>
  );
}

export default App;
