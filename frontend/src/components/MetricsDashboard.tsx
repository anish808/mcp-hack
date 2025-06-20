import React, { useEffect, useState } from 'react';
import { BarChart3, TrendingUp, Clock, AlertTriangle, CheckCircle, Activity } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { fetchTraces } from '../api';
import clsx from 'clsx';

interface Metrics {
  totalTraces: number;
  successRate: number;
  totalTools: number;
  avgExecutionTime: number;
  errorCount: number;
  toolStats: { [key: string]: { count: number; avgTime: number; errors: number } };
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

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
      <div className="h-full flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading metrics...</p>
        </div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-500">Failed to load metrics</p>
        </div>
      </div>
    );
  }

  // Prepare chart data
  const toolChartData = Object.entries(metrics.toolStats).map(([name, stats]) => ({
    name: name.length > 15 ? name.substring(0, 15) + '...' : name,
    calls: stats.count,
    avgTime: parseFloat(stats.avgTime.toFixed(1)),
    errors: stats.errors
  }));

  const pieChartData = [
    { name: 'Success', value: metrics.totalTraces - metrics.errorCount, color: '#10b981' },
    { name: 'Errors', value: metrics.errorCount, color: '#ef4444' }
  ];

  return (
    <div className="h-full bg-gray-50 overflow-y-auto">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-br from-success-500 to-success-700 rounded-lg flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Performance Metrics</h1>
            <p className="text-sm text-gray-500">Real-time system performance overview</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <div className="metric-card">
            <div className="flex items-center justify-between mb-4">
              <Activity className="w-8 h-8 text-primary-600" />
              <div className="text-2xl font-bold text-gray-900">{metrics.totalTraces}</div>
            </div>
            <div className="metric-label">Total Traces</div>
          </div>
          
          <div className="metric-card">
            <div className="flex items-center justify-between mb-4">
              <CheckCircle className="w-8 h-8 text-success-600" />
              <div className="text-2xl font-bold text-gray-900">{metrics.successRate.toFixed(1)}%</div>
            </div>
            <div className="metric-label">Success Rate</div>
          </div>
          
          <div className="metric-card">
            <div className="flex items-center justify-between mb-4">
              <BarChart3 className="w-8 h-8 text-blue-600" />
              <div className="text-2xl font-bold text-gray-900">{metrics.totalTools}</div>
            </div>
            <div className="metric-label">Total Tools</div>
          </div>
          
          <div className="metric-card">
            <div className="flex items-center justify-between mb-4">
              <Clock className="w-8 h-8 text-warning-600" />
              <div className="text-2xl font-bold text-gray-900">{metrics.avgExecutionTime.toFixed(0)}ms</div>
            </div>
            <div className="metric-label">Avg Response Time</div>
          </div>
          
          <div className="metric-card">
            <div className="flex items-center justify-between mb-4">
              <AlertTriangle className="w-8 h-8 text-danger-600" />
              <div className="text-2xl font-bold text-gray-900">{metrics.errorCount}</div>
            </div>
            <div className="metric-label">Total Errors</div>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Success/Error Distribution */}
          <div className="card">
            <div className="flex items-center space-x-2 mb-6">
              <TrendingUp className="w-5 h-5 text-success-600" />
              <h2 className="text-lg font-semibold text-gray-900">Success Distribution</h2>
            </div>
            
            <div className="flex items-center justify-center h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number) => [`${value} traces`, 'Count']}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            <div className="flex justify-center space-x-6 mt-4">
              {pieChartData.map((entry, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: entry.color }}
                  ></div>
                  <span className="text-sm text-gray-600">{entry.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Tool Performance Chart */}
          <div className="card">
            <div className="flex items-center space-x-2 mb-6">
              <BarChart3 className="w-5 h-5 text-primary-600" />
              <h2 className="text-lg font-semibold text-gray-900">Tool Performance</h2>
            </div>
            
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={toolChartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="name" 
                    angle={-45}
                    textAnchor="end"
                    height={80}
                    fontSize={12}
                  />
                  <YAxis />
                  <Tooltip 
                    formatter={(value: number, name: string) => [
                      name === 'calls' ? `${value} calls` : `${value}ms`,
                      name === 'calls' ? 'Total Calls' : 'Avg Time'
                    ]}
                  />
                  <Bar dataKey="calls" fill="#3b82f6" name="calls" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Tool Statistics Table */}
        <div className="card">
          <div className="flex items-center space-x-2 mb-6">
            <BarChart3 className="w-5 h-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">Detailed Tool Statistics</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tool Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Calls
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Avg Time (ms)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Errors
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Success Rate
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {Object.entries(metrics.toolStats).map(([toolName, stats]) => {
                  const successRate = ((stats.count - stats.errors) / stats.count * 100);
                  const isHealthy = successRate >= 95 && stats.avgTime < 1000;
                  
                  return (
                    <tr key={toolName} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900">{toolName}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {stats.count}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <span className={clsx(
                          'px-2 py-1 rounded-md text-xs font-medium',
                          stats.avgTime < 100 ? 'bg-success-100 text-success-800' :
                          stats.avgTime < 500 ? 'bg-warning-100 text-warning-800' :
                          'bg-danger-100 text-danger-800'
                        )}>
                          {stats.avgTime.toFixed(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={clsx(
                          'font-medium',
                          stats.errors > 0 ? 'text-danger-600' : 'text-success-600'
                        )}>
                          {stats.errors}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex items-center">
                          <div className="flex-1 bg-gray-200 rounded-full h-2 mr-2">
                            <div
                              className={clsx(
                                'h-2 rounded-full',
                                successRate >= 95 ? 'bg-success-500' :
                                successRate >= 80 ? 'bg-warning-500' :
                                'bg-danger-500'
                              )}
                              style={{ width: `${successRate}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium">
                            {successRate.toFixed(1)}%
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={clsx(
                          'inline-flex px-2 py-1 text-xs font-semibold rounded-full',
                          isHealthy 
                            ? 'bg-success-100 text-success-800' 
                            : 'bg-warning-100 text-warning-800'
                        )}>
                          {isHealthy ? 'Healthy' : 'Needs Attention'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MetricsDashboard; 