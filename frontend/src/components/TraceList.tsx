import React, { useEffect, useState } from 'react';
import { fetchTraces } from '../api';

interface Trace {
  id: string;
  timestamp: string;
  task: string;
  context: any;
  model_output: string;
  metadata?: {
    success?: boolean;
    execution_time_ms?: number;
    tool_name?: string;
    error?: string;
    error_type?: string;
  };
}

function TraceList({ onSelect }: { onSelect: (trace: Trace) => void }) {
  const [traces, setTraces] = useState<Trace[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const loadTraces = async () => {
      try {
        const data = await fetchTraces();
        setTraces(data);
      } catch (error) {
        console.error('Failed to fetch traces:', error);
      } finally {
        setLoading(false);
      }
    };

    loadTraces();
    
    // Refresh every 5 seconds
    const interval = setInterval(loadTraces, 5000);
    return () => clearInterval(interval);
  }, []);

  const filteredTraces = traces.filter(trace => {
    if (filter === 'success') return trace.metadata?.success !== false;
    if (filter === 'error') return trace.metadata?.success === false;
    return true;
  });

  if (loading) return (
    <div style={{ padding: '16px', textAlign: 'center' }}>
      <div>Loading traces...</div>
    </div>
  );

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ padding: '16px', borderBottom: '1px solid #eee' }}>
        <h2 style={{ margin: '0 0 12px 0' }}>Traces ({filteredTraces.length})</h2>
        
        {/* Filter buttons */}
        <div style={{ display: 'flex', gap: '4px' }}>
          {['all', 'success', 'error'].map(filterType => (
            <button
              key={filterType}
              style={{
                padding: '4px 8px',
                border: '1px solid #dee2e6',
                background: filter === filterType ? '#007bff' : 'white',
                color: filter === filterType ? 'white' : '#333',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px',
                textTransform: 'capitalize'
              }}
              onClick={() => setFilter(filterType)}
            >
              {filterType}
            </button>
          ))}
        </div>
      </div>

      {/* Trace list */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '8px' }}>
        {filteredTraces.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#666', padding: '24px' }}>
            No traces found
          </div>
        ) : (
          <div>
            {filteredTraces.map(trace => {
              const isSuccess = trace.metadata?.success !== false;
              const executionTime = trace.metadata?.execution_time_ms;
              const toolName = trace.metadata?.tool_name;
              
              return (
                <div
                  key={trace.id}
                  style={{
                    padding: '12px',
                    margin: '4px 0',
                    border: '1px solid #dee2e6',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    background: 'white',
                    transition: 'all 0.2s',
                    borderLeft: `4px solid ${isSuccess ? '#28a745' : '#dc3545'}`
                  }}
                  onClick={() => onSelect(trace)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = 'none';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  {/* Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <div style={{ fontWeight: 'bold', color: '#333', fontSize: '14px' }}>
                      {trace.task}
                    </div>
                    <div style={{ 
                      fontSize: '12px', 
                      color: isSuccess ? '#28a745' : '#dc3545',
                      fontWeight: 'bold'
                    }}>
                      {isSuccess ? '✅' : '❌'}
                    </div>
                  </div>

                  {/* Tool name */}
                  {toolName && (
                    <div style={{ 
                      fontSize: '12px', 
                      color: '#007bff', 
                      background: '#e3f2fd',
                      padding: '2px 6px',
                      borderRadius: '12px',
                      display: 'inline-block',
                      marginBottom: '6px'
                    }}>
                      🔧 {toolName}
                    </div>
                  )}

                  {/* Execution time */}
                  {executionTime !== undefined && (
                    <div style={{ fontSize: '12px', color: '#666', marginBottom: '6px' }}>
                      ⏱️ {executionTime.toFixed(1)}ms
                    </div>
                  )}

                  {/* Timestamp */}
                  <div style={{ fontSize: '11px', color: '#888' }}>
                    📅 {new Date(trace.timestamp).toLocaleString()}
                  </div>

                  {/* Error info */}
                  {!isSuccess && trace.metadata?.error && (
                    <div style={{ 
                      fontSize: '11px', 
                      color: '#dc3545', 
                      marginTop: '6px',
                      padding: '4px 6px',
                      background: '#f8d7da',
                      borderRadius: '4px',
                      border: '1px solid #f5c6cb'
                    }}>
                      ⚠️ {trace.metadata.error.substring(0, 50)}...
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default TraceList;
