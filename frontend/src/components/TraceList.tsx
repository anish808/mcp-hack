import React, { useEffect, useState } from 'react';
import { Filter, RefreshCw, Clock, CheckCircle, XCircle, Wrench, Calendar, AlertTriangle } from 'lucide-react';
import { fetchTraces } from '../api';
import clsx from 'clsx';

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

interface TraceListProps {
  onSelect: (trace: Trace) => void;
}

const filterOptions = [
  { value: 'all', label: 'All Traces', color: 'text-gray-600' },
  { value: 'success', label: 'Success', color: 'text-success-600' },
  { value: 'error', label: 'Errors', color: 'text-danger-600' },
];

function TraceList({ onSelect }: TraceListProps) {
  const [traces, setTraces] = useState<Trace[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [refreshing, setRefreshing] = useState(false);

  const loadTraces = async (showRefreshing = false) => {
    try {
      if (showRefreshing) setRefreshing(true);
      const data = await fetchTraces();
      setTraces(data);
    } catch (error) {
      console.error('Failed to fetch traces:', error);
    } finally {
      setLoading(false);
      if (showRefreshing) setRefreshing(false);
    }
  };

  useEffect(() => {
    loadTraces();
    
    // Refresh every 5 seconds
    const interval = setInterval(() => loadTraces(), 5000);
    return () => clearInterval(interval);
  }, []);

  const filteredTraces = traces.filter(trace => {
    if (filter === 'success') return trace.metadata?.success !== false;
    if (filter === 'error') return trace.metadata?.success === false;
    return true;
  });

  const handleRefresh = () => {
    loadTraces(true);
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading traces...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Traces</h2>
            <p className="text-sm text-gray-500 mt-1">
              {filteredTraces.length} of {traces.length} traces
            </p>
          </div>
          
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="btn-secondary flex items-center space-x-2"
          >
            <RefreshCw className={clsx('w-4 h-4', refreshing && 'animate-spin')} />
            <span>Refresh</span>
          </button>
        </div>
        
        {/* Filter buttons */}
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <div className="flex space-x-1">
            {filterOptions.map(option => (
              <button
                key={option.value}
                onClick={() => setFilter(option.value)}
                className={clsx(
                  'px-3 py-1.5 text-xs font-medium rounded-md transition-colors duration-200',
                  filter === option.value
                    ? 'bg-primary-100 text-primary-700 border border-primary-200'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-200'
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Trace list */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {filteredTraces.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Wrench className="w-6 h-6 text-gray-400" />
            </div>
            <p className="text-gray-500">No traces found</p>
            <p className="text-sm text-gray-400 mt-1">
              {filter !== 'all' ? `Try changing the filter or ` : ''}
              traces will appear here as they're generated
            </p>
          </div>
        ) : (
          filteredTraces.map(trace => {
            const isSuccess = trace.metadata?.success !== false;
            const executionTime = trace.metadata?.execution_time_ms;
            const toolName = trace.metadata?.tool_name;
            const hasError = trace.metadata?.error;
            
            return (
              <div
                key={trace.id}
                onClick={() => onSelect(trace)}
                className="card card-hover cursor-pointer group"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 truncate group-hover:text-primary-600 transition-colors">
                      {trace.task}
                    </h3>
                    <div className="flex items-center space-x-2 mt-1">
                      <Calendar className="w-3 h-3 text-gray-400" />
                      <span className="text-xs text-gray-500">
                        {new Date(trace.timestamp).toLocaleString()}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {isSuccess ? (
                      <CheckCircle className="w-5 h-5 text-success-500" />
                    ) : (
                      <XCircle className="w-5 h-5 text-danger-500" />
                    )}
                  </div>
                </div>

                {/* Metadata */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {/* Tool name */}
                    {toolName && (
                      <div className="flex items-center space-x-1 bg-primary-50 text-primary-700 px-2 py-1 rounded-md text-xs font-medium">
                        <Wrench className="w-3 h-3" />
                        <span>{toolName}</span>
                      </div>
                    )}
                    
                    {/* Execution time */}
                    {executionTime !== undefined && (
                      <div className="flex items-center space-x-1 text-gray-500 text-xs">
                        <Clock className="w-3 h-3" />
                        <span>{executionTime.toFixed(1)}ms</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Status indicator */}
                  <div className={clsx(
                    'px-2 py-1 rounded-full text-xs font-medium',
                    isSuccess
                      ? 'bg-success-100 text-success-700'
                      : 'bg-danger-100 text-danger-700'
                  )}>
                    {isSuccess ? 'Success' : 'Error'}
                  </div>
                </div>

                {/* Error preview */}
                {hasError && (
                  <div className="mt-3 p-2 bg-danger-50 border border-danger-200 rounded-md">
                    <div className="flex items-center space-x-2">
                      <AlertTriangle className="w-4 h-4 text-danger-500 flex-shrink-0" />
                      <p className="text-xs text-danger-700 truncate">
                        {trace.metadata?.error?.substring(0, 80)}
                        {trace.metadata?.error && trace.metadata.error.length > 80 && '...'}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default TraceList;
