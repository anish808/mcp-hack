import React, { useEffect, useState } from 'react';
import { fetchTraces } from '../api';

interface ToolMetrics {
  name: string;
  totalCalls: number;
  successCalls: number;
  errorCalls: number;
  avgExecutionTime: number;
  minExecutionTime: number;
  maxExecutionTime: number;
  recentActivity: { timestamp: string; success: boolean; time: number }[];
  errorTypes: { [key: string]: number };
}

function ToolAnalytics() {
  const [toolMetrics, setToolMetrics] = useState<ToolMetrics[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTool, setSelectedTool] = useState<string | null>(null);

  useEffect(() => {
    const calculateAnalytics = async () => {
      try {
        const traces = await fetchTraces();
        
        const toolData: { [key: string]: any } = {};

        traces.forEach((trace: any) => {
          const toolName = trace.metadata?.tool_name || 'Unknown';
          const executionTime = trace.metadata?.execution_time_ms || 0;
          const isSuccess = trace.metadata?.success !== false;
          const errorType = trace.metadata?.error_type || 'Unknown Error';
          
          if (!toolData[toolName]) {
            toolData[toolName] = {
              name: toolName,
              calls: [],
              executionTimes: [],
              errors: {},
              successCount: 0,
              errorCount: 0
            };
          }
          
          toolData[toolName].calls.push({
            timestamp: trace.timestamp,
            success: isSuccess,
            time: executionTime
          });
          
          toolData[toolName].executionTimes.push(executionTime);
          
          if (isSuccess) {
            toolData[toolName].successCount++;
          } else {
            toolData[toolName].errorCount++;
            toolData[toolName].errors[errorType] = (toolData[toolName].errors[errorType] || 0) + 1;
          }
        });

        const analytics: ToolMetrics[] = Object.values(toolData).map((tool: any) => ({
          name: tool.name,
          totalCalls: tool.calls.length,
          successCalls: tool.successCount,
          errorCalls: tool.errorCount,
          avgExecutionTime: tool.executionTimes.reduce((sum: number, time: number) => sum + time, 0) / tool.executionTimes.length,
          minExecutionTime: Math.min(...tool.executionTimes),
          maxExecutionTime: Math.max(...tool.executionTimes),
          recentActivity: tool.calls.slice(-10).sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()),
          errorTypes: tool.errors
        }));

        setToolMetrics(analytics.sort((a, b) => b.totalCalls - a.totalCalls));
        if (analytics.length > 0 && !selectedTool) {
          setSelectedTool(analytics[0].name);
        }
      } catch (error) {
        console.error('Failed to calculate analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    calculateAnalytics();
    const interval = setInterval(calculateAnalytics, 15000);
    return () => clearInterval(interval);
  }, [selectedTool]);

  if (loading) {
    return (
      <div style={{ padding: '24px', textAlign: 'center' }}>
        <div>Loading analytics...</div>
      </div>
    );
  }

  const selectedToolData = toolMetrics.find(tool => tool.name === selectedTool);

  const cardStyle = {
    background: 'white',
    border: '1px solid #dee2e6',
    borderRadius: '8px',
    padding: '24px',
    margin: '16px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  };

  return (
    <div style={{ padding: '24px', background: '#f8f9fa', minHeight: 'calc(100vh - 80px)' }}>
      <div style={{ display: 'flex', gap: '24px' }}>
        {/* Tool List */}
        <div style={{ ...cardStyle, width: '300px', margin: '0' }}>
          <h2 style={{ marginTop: 0, color: '#333' }}>Tools</h2>
          <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
            {toolMetrics.map(tool => (
              <div
                key={tool.name}
                style={{
                  padding: '12px',
                  margin: '8px 0',
                  background: selectedTool === tool.name ? '#007bff' : '#f8f9fa',
                  color: selectedTool === tool.name ? 'white' : '#333',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  border: selectedTool === tool.name ? 'none' : '1px solid #dee2e6'
                }}
                onClick={() => setSelectedTool(tool.name)}
              >
                <div style={{ fontWeight: 'bold' }}>{tool.name}</div>
                <div style={{ fontSize: '12px', opacity: 0.8 }}>
                  {tool.totalCalls} calls • {((tool.successCalls / tool.totalCalls) * 100).toFixed(1)}% success
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tool Details */}
        <div style={{ flex: 1 }}>
          {selectedToolData ? (
            <>
              {/* Tool Overview */}
              <div style={cardStyle}>
                <h2 style={{ marginTop: 0, color: '#333' }}>{selectedToolData.name} Analytics</h2>
                <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#007bff' }}>
                      {selectedToolData.totalCalls}
                    </div>
                    <div style={{ fontSize: '12px', color: '#666' }}>Total Calls</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#28a745' }}>
                      {((selectedToolData.successCalls / selectedToolData.totalCalls) * 100).toFixed(1)}%
                    </div>
                    <div style={{ fontSize: '12px', color: '#666' }}>Success Rate</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#ffc107' }}>
                      {selectedToolData.avgExecutionTime.toFixed(1)}ms
                    </div>
                    <div style={{ fontSize: '12px', color: '#666' }}>Avg Time</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#17a2b8' }}>
                      {selectedToolData.minExecutionTime.toFixed(1)}ms
                    </div>
                    <div style={{ fontSize: '12px', color: '#666' }}>Min Time</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#6f42c1' }}>
                      {selectedToolData.maxExecutionTime.toFixed(1)}ms
                    </div>
                    <div style={{ fontSize: '12px', color: '#666' }}>Max Time</div>
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div style={cardStyle}>
                <h3 style={{ marginTop: 0, color: '#333' }}>Recent Activity</h3>
                <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                  {selectedToolData.recentActivity.map((activity, index) => (
                    <div
                      key={index}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '8px 12px',
                        margin: '4px 0',
                        background: activity.success ? '#d4edda' : '#f8d7da',
                        borderRadius: '4px',
                        border: `1px solid ${activity.success ? '#c3e6cb' : '#f5c6cb'}`
                      }}
                    >
                      <div>
                        <span style={{ 
                          color: activity.success ? '#155724' : '#721c24',
                          marginRight: '8px'
                        }}>
                          {activity.success ? '✅' : '❌'}
                        </span>
                        {new Date(activity.timestamp).toLocaleString()}
                      </div>
                      <div style={{ 
                        color: activity.success ? '#155724' : '#721c24',
                        fontWeight: 'bold'
                      }}>
                        {activity.time.toFixed(1)}ms
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Error Analysis */}
              {selectedToolData.errorCalls > 0 && (
                <div style={cardStyle}>
                  <h3 style={{ marginTop: 0, color: '#333' }}>Error Analysis</h3>
                  <div>
                    {Object.entries(selectedToolData.errorTypes).map(([errorType, count]) => (
                      <div
                        key={errorType}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          padding: '8px 0',
                          borderBottom: '1px solid #dee2e6'
                        }}
                      >
                        <span>{errorType}</span>
                        <span style={{ fontWeight: 'bold', color: '#dc3545' }}>{count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div style={cardStyle}>
              <div style={{ textAlign: 'center', color: '#666' }}>
                Select a tool to view detailed analytics
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ToolAnalytics; 