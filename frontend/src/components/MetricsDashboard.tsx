import React, { useEffect, useState } from 'react';
import { fetchTraces } from '../api';

interface Metrics {
  totalTraces: number;
  successRate: number;
  totalTools: number;
  avgExecutionTime: number;
  errorCount: number;
  toolStats: { [key: string]: { count: number; avgTime: number; errors: number } };
}

function MetricsDashboard() {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const calculateMetrics = async () => {
      try {
        const traces = await fetchTraces();
        
        const toolStats: { [key: string]: { count: number; totalTime: number; errors: number } } = {};
        let totalExecutionTime = 0;
        let totalErrors = 0;
        let totalSuccess = 0;

        traces.forEach((trace: any) => {
          const toolName = trace.metadata?.tool_name || 'Unknown';
          const executionTime = trace.metadata?.execution_time_ms || 0;
          const isSuccess = trace.metadata?.success !== false;
          
          if (!toolStats[toolName]) {
            toolStats[toolName] = { count: 0, totalTime: 0, errors: 0 };
          }
          
          toolStats[toolName].count++;
          toolStats[toolName].totalTime += executionTime;
          
          if (!isSuccess) {
            toolStats[toolName].errors++;
            totalErrors++;
          } else {
            totalSuccess++;
          }
          
          totalExecutionTime += executionTime;
        });

        const processedToolStats: { [key: string]: { count: number; avgTime: number; errors: number } } = {};
        Object.keys(toolStats).forEach(tool => {
          processedToolStats[tool] = {
            count: toolStats[tool].count,
            avgTime: toolStats[tool].totalTime / toolStats[tool].count,
            errors: toolStats[tool].errors
          };
        });

        setMetrics({
          totalTraces: traces.length,
          successRate: traces.length > 0 ? (totalSuccess / traces.length) * 100 : 0,
          totalTools: Object.keys(toolStats).length,
          avgExecutionTime: traces.length > 0 ? totalExecutionTime / traces.length : 0,
          errorCount: totalErrors,
          toolStats: processedToolStats
        });
      } catch (error) {
        console.error('Failed to calculate metrics:', error);
      } finally {
        setLoading(false);
      }
    };

    calculateMetrics();
    
    // Refresh metrics every 10 seconds
    const interval = setInterval(calculateMetrics, 10000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div style={{ padding: '24px', textAlign: 'center' }}>
        <div>Loading metrics...</div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div style={{ padding: '24px', textAlign: 'center' }}>
        <div>Failed to load metrics</div>
      </div>
    );
  }

  const cardStyle = {
    background: 'white',
    border: '1px solid #dee2e6',
    borderRadius: '8px',
    padding: '24px',
    margin: '16px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  };

  const statCardStyle = {
    ...cardStyle,
    textAlign: 'center' as const,
    minWidth: '200px'
  };

  return (
    <div style={{ padding: '24px', background: '#f8f9fa', minHeight: 'calc(100vh - 80px)' }}>
      {/* Summary Cards */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '32px' }}>
        <div style={statCardStyle}>
          <h3 style={{ margin: '0 0 16px 0', color: '#007bff' }}>Total Traces</h3>
          <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#333' }}>{metrics.totalTraces}</div>
        </div>
        
        <div style={statCardStyle}>
          <h3 style={{ margin: '0 0 16px 0', color: '#28a745' }}>Success Rate</h3>
          <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#333' }}>
            {metrics.successRate.toFixed(1)}%
          </div>
        </div>
        
        <div style={statCardStyle}>
          <h3 style={{ margin: '0 0 16px 0', color: '#17a2b8' }}>Total Tools</h3>
          <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#333' }}>{metrics.totalTools}</div>
        </div>
        
        <div style={statCardStyle}>
          <h3 style={{ margin: '0 0 16px 0', color: '#ffc107' }}>Avg Time</h3>
          <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#333' }}>
            {metrics.avgExecutionTime.toFixed(0)}ms
          </div>
        </div>
        
        <div style={statCardStyle}>
          <h3 style={{ margin: '0 0 16px 0', color: '#dc3545' }}>Errors</h3>
          <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#333' }}>{metrics.errorCount}</div>
        </div>
      </div>

      {/* Tool Statistics */}
      <div style={cardStyle}>
        <h2 style={{ marginTop: 0, color: '#333' }}>Tool Performance</h2>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8f9fa' }}>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Tool Name</th>
                <th style={{ padding: '12px', textAlign: 'right', borderBottom: '2px solid #dee2e6' }}>Calls</th>
                <th style={{ padding: '12px', textAlign: 'right', borderBottom: '2px solid #dee2e6' }}>Avg Time (ms)</th>
                <th style={{ padding: '12px', textAlign: 'right', borderBottom: '2px solid #dee2e6' }}>Errors</th>
                <th style={{ padding: '12px', textAlign: 'right', borderBottom: '2px solid #dee2e6' }}>Success Rate</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(metrics.toolStats).map(([toolName, stats]) => (
                <tr key={toolName} style={{ borderBottom: '1px solid #dee2e6' }}>
                  <td style={{ padding: '12px', fontWeight: 'bold' }}>{toolName}</td>
                  <td style={{ padding: '12px', textAlign: 'right' }}>{stats.count}</td>
                  <td style={{ padding: '12px', textAlign: 'right' }}>{stats.avgTime.toFixed(1)}</td>
                  <td style={{ padding: '12px', textAlign: 'right', color: stats.errors > 0 ? '#dc3545' : '#28a745' }}>
                    {stats.errors}
                  </td>
                  <td style={{ padding: '12px', textAlign: 'right' }}>
                    {((stats.count - stats.errors) / stats.count * 100).toFixed(1)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default MetricsDashboard; 