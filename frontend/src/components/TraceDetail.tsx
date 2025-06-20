import React from 'react';
import { Play, CheckCircle, XCircle, Clock, Calendar, Settings, FileText, Code, AlertTriangle } from 'lucide-react';
import { replayTrace } from '../api';
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

interface TraceDetailProps {
  trace: Trace | null;
}

function TraceDetail({ trace }: TraceDetailProps) {
  if (!trace) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Select a trace</h3>
          <p className="text-gray-500">Choose a trace from the list to view detailed information</p>
        </div>
      </div>
    );
  }

  const isSuccess = trace.metadata?.success !== false;
  const executionTime = trace.metadata?.execution_time_ms;
  const toolName = trace.metadata?.tool_name;
  const hasError = trace.metadata?.error;

  const handleReplay = async () => {
    try {
      const replayed = await replayTrace(trace);
      alert('Replay initiated successfully!\n\nResult:\n' + JSON.stringify(replayed, null, 2));
    } catch (error) {
      alert('Failed to replay trace:\n' + error);
    }
  };

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={clsx(
              'w-10 h-10 rounded-full flex items-center justify-center',
              isSuccess ? 'bg-success-100' : 'bg-danger-100'
            )}>
              {isSuccess ? (
                <CheckCircle className="w-6 h-6 text-success-600" />
              ) : (
                <XCircle className="w-6 h-6 text-danger-600" />
              )}
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">{trace.task}</h1>
              <div className="flex items-center space-x-4 mt-1">
                <div className="flex items-center space-x-1 text-sm text-gray-500">
                  <Calendar className="w-4 h-4" />
                  <span>{new Date(trace.timestamp).toLocaleString()}</span>
                </div>
                {executionTime !== undefined && (
                  <div className="flex items-center space-x-1 text-sm text-gray-500">
                    <Clock className="w-4 h-4" />
                    <span>{executionTime.toFixed(1)}ms</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <button
            onClick={handleReplay}
            className="btn-primary flex items-center space-x-2"
          >
            <Play className="w-4 h-4" />
            <span>Replay</span>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Status Card */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Status</h2>
            <div className={clsx(
              'px-3 py-1 rounded-full text-sm font-medium',
              isSuccess
                ? 'bg-success-100 text-success-800'
                : 'bg-danger-100 text-danger-800'
            )}>
              {isSuccess ? 'Success' : 'Failed'}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Settings className="w-5 h-5 text-primary-600" />
                <span className="font-medium text-gray-900">Tool</span>
              </div>
              <p className="text-gray-600">{toolName || 'Unknown'}</p>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Clock className="w-5 h-5 text-warning-600" />
                <span className="font-medium text-gray-900">Execution Time</span>
              </div>
              <p className="text-gray-600">{executionTime ? `${executionTime.toFixed(1)}ms` : 'N/A'}</p>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <FileText className="w-5 h-5 text-gray-600" />
                <span className="font-medium text-gray-900">Trace ID</span>
              </div>
              <p className="text-gray-600 font-mono text-sm truncate">{trace.id}</p>
            </div>
          </div>
        </div>

        {/* Error Card */}
        {hasError && (
          <div className="card border-danger-200 bg-danger-50">
            <div className="flex items-center space-x-2 mb-4">
              <AlertTriangle className="w-5 h-5 text-danger-600" />
              <h2 className="text-lg font-semibold text-danger-900">Error Details</h2>
            </div>
            
            <div className="space-y-3">
              {trace.metadata?.error_type && (
                <div>
                  <label className="block text-sm font-medium text-danger-800 mb-1">Error Type</label>
                  <p className="text-danger-700 bg-white px-3 py-2 rounded-md border border-danger-200">
                    {trace.metadata.error_type}
                  </p>
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-danger-800 mb-1">Error Message</label>
                <div className="bg-white border border-danger-200 rounded-md">
                  <pre className="p-3 text-sm text-danger-700 whitespace-pre-wrap overflow-x-auto">
                    {trace.metadata?.error}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Context Card */}
        <div className="card">
          <div className="flex items-center space-x-2 mb-4">
            <Code className="w-5 h-5 text-primary-600" />
            <h2 className="text-lg font-semibold text-gray-900">Context</h2>
          </div>
          
          <div className="bg-gray-900 rounded-lg overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2 bg-gray-800">
              <span className="text-sm font-medium text-gray-300">JSON</span>
              <button
                onClick={() => navigator.clipboard.writeText(JSON.stringify(trace.context, null, 2))}
                className="text-xs text-gray-400 hover:text-gray-200 transition-colors"
              >
                Copy
              </button>
            </div>
            <pre className="p-4 text-sm text-gray-100 overflow-x-auto">
              {JSON.stringify(trace.context, null, 2)}
            </pre>
          </div>
        </div>

        {/* Model Output Card */}
        <div className="card">
          <div className="flex items-center space-x-2 mb-4">
            <FileText className="w-5 h-5 text-success-600" />
            <h2 className="text-lg font-semibold text-gray-900">Model Output</h2>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <pre className="whitespace-pre-wrap text-sm text-gray-800">
              {trace.model_output}
            </pre>
          </div>
        </div>

        {/* Metadata Card */}
        {trace.metadata && (
          <div className="card">
            <div className="flex items-center space-x-2 mb-4">
              <Code className="w-5 h-5 text-gray-600" />
              <h2 className="text-lg font-semibold text-gray-900">Metadata</h2>
            </div>
            
            <div className="bg-gray-900 rounded-lg overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2 bg-gray-800">
                <span className="text-sm font-medium text-gray-300">JSON</span>
                <button
                  onClick={() => navigator.clipboard.writeText(JSON.stringify(trace.metadata, null, 2))}
                  className="text-xs text-gray-400 hover:text-gray-200 transition-colors"
                >
                  Copy
                </button>
              </div>
              <pre className="p-4 text-sm text-gray-100 overflow-x-auto">
                {JSON.stringify(trace.metadata, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default TraceDetail;
