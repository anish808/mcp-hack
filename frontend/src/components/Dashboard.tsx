import React, { useState } from 'react';
import { BarChart3, Activity, Zap, Menu, X, Key } from 'lucide-react';
import { useAuth, useUser, UserButton } from '@clerk/clerk-react';
import TraceList from './TraceList';
import TraceDetail from './TraceDetail';
import MetricsDashboard from './MetricsDashboard';
import ToolAnalytics from './ToolAnalytics';
import ApiKeyManager from './ApiKeyManager';

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
  },
  {
    id: 'api-keys',
    label: 'API Keys',
    icon: Key,
    color: 'text-purple-600'
  }
];

const Dashboard: React.FC = () => {
  const { user } = useUser();
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
      case 'api-keys':
        return (
          <div className="p-8">
            <div className="max-w-6xl mx-auto">
              <ApiKeyManager />
            </div>
          </div>
        );
      default:
        return (
          <div className="p-8">
            <h2 className="text-2xl font-bold text-gray-900">Welcome to Etale Systems</h2>
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
          
          <a href="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Etale Systems</h1>
              <p className="text-sm text-gray-500">MCP Observability Platform</p>
            </div>
          </a>
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
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg' 
                    : 'text-gray-600 hover:bg-gray-100'
                  }
                `}
              >
                <Icon size={18} className={isActive ? 'text-white' : tab.color} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {/* User Menu */}
        <div className="flex items-center space-x-4">
          <div className="hidden md:block text-right">
            <p className="text-sm font-medium text-gray-900">{user?.firstName} {user?.lastName}</p>
            <p className="text-xs text-gray-500">{user?.primaryEmailAddress?.emailAddress}</p>
          </div>
          <UserButton 
            appearance={{
              elements: {
                avatarBox: "w-10 h-10"
              }
            }}
          />
        </div>
      </header>

      {/* Mobile Navigation */}
      {sidebarOpen && (
        <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-4">
          <nav className="space-y-2">
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
                    w-full flex items-center space-x-3 px-4 py-3 rounded-lg font-medium transition-all duration-200 text-left
                    ${isActive 
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white' 
                      : 'text-gray-600 hover:bg-gray-100'
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
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-hidden">
        {renderContent()}
      </main>
    </div>
  );
};

export default Dashboard; 