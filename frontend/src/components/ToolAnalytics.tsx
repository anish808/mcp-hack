import React, { useEffect, useState } from 'react';
import { Zap, TrendingUp, Clock, AlertTriangle, CheckCircle, XCircle, Activity, BarChart3 } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { fetchTraces } from '../api';
import clsx from 'clsx';

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
          recentActivity: tool.calls.slice(-20).sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()),
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
      <div className="h-full flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading analytics...</p>
        </div>
      </div>
    );
  }

  const selectedToolData = toolMetrics.find(tool => tool.name === selectedTool);

  return (
    <div className="h-full bg-gray-50 overflow-hidden flex">
      {/* Sidebar - Tool List */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-warning-500 to-warning-700 rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Tool Analytics</h2>
              <p className="text-sm text-gray-500">{toolMetrics.length} tools analyzed</p>
            </div>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {toolMetrics.map(tool => {
            const successRate = (tool.successCalls / tool.totalCalls) * 100;
            const isSelected = selectedTool === tool.name;
            
            return (
              <div
                key={tool.name}
                onClick={() => setSelectedTool(tool.name)}
                className={clsx(
                  'p-4 rounded-lg cursor-pointer transition-all duration-200',
                  isSelected 
                    ? 'bg-primary-50 border-2 border-primary-200' 
                    : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
                )}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className={clsx(
                    'font-medium truncate',
                    isSelected ? 'text-primary-900' : 'text-gray-900'
                  )}>
                    {tool.name}
                  </h3>
                  <div className={clsx(
                    'w-2 h-2 rounded-full',
                    successRate >= 95 ? 'bg-success-500' :
                    successRate >= 80 ? 'bg-warning-500' :
                    'bg-danger-500'
                  )}></div>
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                  <div>
                    <div className="font-medium text-gray-900">{tool.totalCalls}</div>
                    <div>Total Calls</div>
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{successRate.toFixed(1)}%</div>
                    <div>Success Rate</div>
                  </div>
                </div>
                
                <div className="mt-3 flex items-center text-xs text-gray-500">
                  <Clock className="w-3 h-3 mr-1" />
                  {tool.avgExecutionTime.toFixed(1)}ms avg
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {selectedToolData ? (
          <>
            {/* Header */}
            <div className="bg-white border-b border-gray-200 px-6 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-xl font-semibold text-gray-900">{selectedToolData.name}</h1>
                  <p className="text-sm text-gray-500 mt-1">Detailed performance analytics</p>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className={clsx(
                    'flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium',
                    selectedToolData.successCalls / selectedToolData.totalCalls >= 0.95
                      ? 'bg-success-100 text-success-800'
                      : selectedToolData.successCalls / selectedToolData.totalCalls >= 0.8
                      ? 'bg-warning-100 text-warning-800'
                      : 'bg-danger-100 text-danger-800'
                  )}>
                    {selectedToolData.successCalls / selectedToolData.totalCalls >= 0.95 ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : (
                      <AlertTriangle className="w-4 h-4" />
                    )}
                    <span>
                      {selectedToolData.successCalls / selectedToolData.totalCalls >= 0.95 ? 'Healthy' : 'Needs Attention'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Overview Cards */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div className="card text-center">
                  <Activity className="w-6 h-6 text-primary-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-900">{selectedToolData.totalCalls}</div>
                  <div className="text-sm text-gray-500">Total Calls</div>
                </div>
                
                <div className="card text-center">
                  <CheckCircle className="w-6 h-6 text-success-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-900">
                    {((selectedToolData.successCalls / selectedToolData.totalCalls) * 100).toFixed(1)}%
                  </div>
                  <div className="text-sm text-gray-500">Success Rate</div>
                </div>
                
                <div className="card text-center">
                  <Clock className="w-6 h-6 text-warning-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-900">{selectedToolData.avgExecutionTime.toFixed(1)}ms</div>
                  <div className="text-sm text-gray-500">Avg Time</div>
                </div>
                
                <div className="card text-center">
                  <TrendingUp className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-900">{selectedToolData.minExecutionTime.toFixed(1)}ms</div>
                  <div className="text-sm text-gray-500">Min Time</div>
                </div>
                
                <div className="card text-center">
                  <BarChart3 className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-900">{selectedToolData.maxExecutionTime.toFixed(1)}ms</div>
                  <div className="text-sm text-gray-500">Max Time</div>
                </div>
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Performance Timeline */}
                <div className="card">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Timeline</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={selectedToolData.recentActivity.reverse()}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="timestamp" 
                          tickFormatter={(value) => new Date(value).toLocaleDateString()}
                          fontSize={12}
                        />
                        <YAxis />
                        <Tooltip 
                          labelFormatter={(label) => new Date(label).toLocaleString()}
                          formatter={(value: number) => [`${value}ms`, 'Execution Time']}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="time" 
                          stroke="#3b82f6" 
                          strokeWidth={2}
                          dot={{ fill: '#3b82f6', strokeWidth: 2, r: 3 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Error Types */}
                <div className="card">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Error Types</h3>
                  {Object.keys(selectedToolData.errorTypes).length > 0 ? (
                    <div className="space-y-3">
                      {Object.entries(selectedToolData.errorTypes).map(([errorType, count]) => (
                        <div key={errorType} className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <XCircle className="w-4 h-4 text-danger-500" />
                            <span className="text-sm text-gray-700 truncate">{errorType}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="w-20 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-danger-500 h-2 rounded-full" 
                                style={{ width: `${(count / selectedToolData.errorCalls) * 100}%` }}
                              ></div>
                            </div>
                            <span className="text-sm font-medium text-gray-900 w-8">{count}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <CheckCircle className="w-12 h-12 text-success-500 mx-auto mb-2" />
                      <p className="text-gray-500">No errors recorded</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Recent Activity */}
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {selectedToolData.recentActivity.map((activity, index) => (
                    <div
                      key={index}
                      className={clsx(
                        'flex items-center justify-between p-3 rounded-lg',
                        activity.success 
                          ? 'bg-success-50 border border-success-200' 
                          : 'bg-danger-50 border border-danger-200'
                      )}
                    >
                      <div className="flex items-center space-x-3">
                        {activity.success ? (
                          <CheckCircle className="w-5 h-5 text-success-600" />
                        ) : (
                          <XCircle className="w-5 h-5 text-danger-600" />
                        )}
                        <div>
                          <div className={clsx(
                            'font-medium',
                            activity.success ? 'text-success-900' : 'text-danger-900'
                          )}>
                            {activity.success ? 'Successful execution' : 'Failed execution'}
                          </div>
                          <div className="text-xs text-gray-500">
                            {new Date(activity.timestamp).toLocaleString()}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span className="text-sm font-medium text-gray-700">
                          {activity.time.toFixed(1)}ms
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <Zap className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Tool Selected</h3>
              <p className="text-gray-500">Select a tool from the sidebar to view analytics</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ToolAnalytics; 