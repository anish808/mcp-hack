import React, { useState } from 'react';
import { BarChart3, Activity, Zap, Menu, X } from 'lucide-react';
import TraceList from './components/TraceList';
import TraceDetail from './components/TraceDetail';
import MetricsDashboard from './components/MetricsDashboard';
import ToolAnalytics from './components/ToolAnalytics';

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

interface TabConfig {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
  color: string;
}

const tabs: TabConfig[] = [
  {
    id: 'traces',
    label: 'Traces',
    icon: Activity,
    color: 'text-primary-600'
  },
  {
    id: 'metrics',
    label: 'Metrics',
    icon: BarChart3,
    color: 'text-success-600'
  },
  {
    id: 'analytics',
    label: 'Analytics',
    icon: Zap,
    color: 'text-warning-600'
  }
];

function App() {
  const [selectedTrace, setSelectedTrace] = useState<Trace | null>(null);
  const [activeTab, setActiveTab] = useState('traces');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const renderContent = () => {
    switch (activeTab) {
      case 'traces':
        return (
          <div className="flex h-full">
            <div className="w-96 border-r border-gray-200 bg-white">
              <TraceList onSelect={setSelectedTrace} />
            </div>
            <div className="flex-1 bg-gray-50">
              <TraceDetail trace={selectedTrace} />
            </div>
          </div>
        );
      case 'metrics':
        return <MetricsDashboard />;
      case 'analytics':
        return <ToolAnalytics />;
      default:
        return (
          <div className="p-8">
            <h2 className="text-2xl font-bold text-gray-900">Welcome to MCP Observability</h2>
            <p className="text-gray-600 mt-2">Select a tab to get started.</p>
          </div>
        );
    }
  };

  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">MCP Observability</h1>
              <p className="text-sm text-gray-500">Real-time monitoring & analytics</p>
            </div>
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center space-x-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200
                  ${isActive 
                    ? 'tab-active' 
                    : 'tab-inactive'
                  }
                `}
              >
                <Icon size={18} className={isActive ? 'text-white' : tab.color} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Status Indicator */}
        <div className="hidden sm:flex items-center space-x-2">
          <div className="w-2 h-2 bg-success-500 rounded-full animate-pulse"></div>
          <span className="text-sm font-medium text-gray-600">Live</span>
        </div>
      </header>

      {/* Mobile Navigation Sidebar */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)}></div>
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white">
            <div className="absolute top-0 right-0 -mr-12 pt-2">
              <button
                onClick={() => setSidebarOpen(false)}
                className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              >
                <X className="h-6 w-6 text-white" />
              </button>
            </div>
            
            <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
              <nav className="mt-5 px-2 space-y-1">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  
                  return (
                    <button
                      key={tab.id}
                      onClick={() => {
                        setActiveTab(tab.id);
                        setSidebarOpen(false);
                      }}
                      className={`
                        w-full flex items-center space-x-3 px-3 py-3 rounded-lg font-medium transition-all duration-200
                        ${isActive 
                          ? 'bg-primary-600 text-white' 
                          : 'text-gray-700 hover:bg-gray-100'
                        }
                      `}
                    >
                      <Icon size={20} className={isActive ? 'text-white' : tab.color} />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-hidden">
        {renderContent()}
      </main>
    </div>
  );
}

export default App;
