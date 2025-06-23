import React, { useState } from 'react';
import { 
  Activity, 
  BarChart3, 
  Zap, 
  Shield, 
  Globe, 
  Rocket, 
  ArrowRight, 
  CheckCircle, 
  Star,
  Menu,
  X,
  Play
} from 'lucide-react';
import { SignIn, SignUp, useAuth } from '@clerk/clerk-react';

interface LandingPageProps {
  onGetStarted: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted }) => {
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signup');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isSignedIn } = useAuth();

  const features = [
    {
      icon: Activity,
      title: "Real-time Trace Monitoring",
      description: "Monitor your MCP tool executions in real-time with detailed traces and execution context.",
      color: "from-blue-500 to-blue-600"
    },
    {
      icon: BarChart3,
      title: "Advanced Analytics",
      description: "Get insights into tool performance, success rates, and usage patterns with beautiful dashboards.",
      color: "from-green-500 to-green-600"
    },
    {
      icon: Zap,
      title: "Performance Optimization",
      description: "Identify bottlenecks and optimize your MCP tool performance with detailed metrics.",
      color: "from-yellow-500 to-yellow-600"
    },
    {
      icon: Shield,
      title: "Secure API Keys",
      description: "Manage your API keys securely with usage tracking and access controls.",
      color: "from-purple-500 to-purple-600"
    },
    {
      icon: Globe,
      title: "Multi-tenant Architecture",
      description: "Isolated environments for teams with role-based access and data segregation.",
      color: "from-indigo-500 to-indigo-600"
    },
    {
      icon: Rocket,
      title: "Easy Integration",
      description: "Simple SDK integration with Python and TypeScript for seamless observability.",
      color: "from-pink-500 to-pink-600"
    }
  ];

  const stats = [
    { label: "API Calls Monitored", value: "10M+", suffix: "" },
    { label: "Tools Analyzed", value: "500", suffix: "+" },
    { label: "Uptime", value: "99.9", suffix: "%" },
    { label: "Response Time", value: "<50", suffix: "ms" }
  ];

  if (showAuth && !isSignedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Activity className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Join MCP Observability</h1>
            <p className="text-gray-600 mt-2">Start monitoring your MCP tools today</p>
          </div>
          
          <div className="bg-white rounded-2xl shadow-xl p-8 backdrop-blur-sm bg-white/95">
            <div className="flex space-x-1 mb-6">
              <button
                onClick={() => setAuthMode('signup')}
                className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all duration-200 ${
                  authMode === 'signup' 
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Sign Up
              </button>
              <button
                onClick={() => setAuthMode('signin')}
                className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all duration-200 ${
                  authMode === 'signin' 
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Sign In
              </button>
            </div>
            
            {authMode === 'signin' ? <SignIn /> : <SignUp />}
            
            <button
              onClick={() => setShowAuth(false)}
              className="w-full mt-4 text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              ← Back to landing page
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md border-b border-gray-200 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Activity className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">MCP Observability</span>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-600 hover:text-gray-900 transition-colors">Features</a>
              <a href="#pricing" className="text-gray-600 hover:text-gray-900 transition-colors">Pricing</a>
              <a href="#docs" className="text-gray-600 hover:text-gray-900 transition-colors">Docs</a>
              {isSignedIn ? (
                <a
                  href="/app"
                  className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-2 rounded-lg font-medium hover:shadow-lg transition-all duration-200 transform hover:scale-105"
                >
                  Go to Dashboard
                </a>
              ) : (
                <button
                  onClick={() => setShowAuth(true)}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-2 rounded-lg font-medium hover:shadow-lg transition-all duration-200 transform hover:scale-105"
                >
                  Get Started
                </button>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-200">
            <div className="px-4 py-4 space-y-2">
              <a href="#features" className="block py-2 text-gray-600 hover:text-gray-900">Features</a>
              <a href="#pricing" className="block py-2 text-gray-600 hover:text-gray-900">Pricing</a>
              <a href="#docs" className="block py-2 text-gray-600 hover:text-gray-900">Docs</a>
              {isSignedIn ? (
                <a
                  href="/app"
                  className="block w-full mt-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white py-2 rounded-lg font-medium text-center"
                >
                  Go to Dashboard
                </a>
              ) : (
                <button
                  onClick={() => setShowAuth(true)}
                  className="w-full mt-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white py-2 rounded-lg font-medium"
                >
                  Get Started
                </button>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <div className="animate-fade-in-up">
              <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6">
                Monitor Your
                <span className="bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
                  {" "}MCP Tools
                </span>
              </h1>
              <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
                Real-time observability, analytics, and performance monitoring for your Model Context Protocol integrations.
              </p>
            </div>
            
            <div className="animate-fade-in-up animation-delay-200 mb-12">
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                {isSignedIn ? (
                  <a
                    href="/app"
                    className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center justify-center space-x-2"
                  >
                    <span>Go to Dashboard</span>
                    <ArrowRight size={20} />
                  </a>
                ) : (
                  <button
                    onClick={() => setShowAuth(true)}
                    className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center justify-center space-x-2"
                  >
                    <span>Start Free Trial</span>
                    <ArrowRight size={20} />
                  </button>
                )}
                <button className="border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-xl font-semibold text-lg hover:border-gray-400 transition-all duration-200 flex items-center justify-center space-x-2">
                  <Play size={20} />
                  <span>Watch Demo</span>
                </button>
              </div>
            </div>

            {/* Stats */}
            <div className="animate-fade-in-up animation-delay-400 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                    {stat.value}{stat.suffix}
                  </div>
                  <div className="text-sm text-gray-600">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Everything you need to monitor
              <span className="bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
                {" "}MCP tools
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Comprehensive observability platform built specifically for Model Context Protocol integrations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="group p-8 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border border-gray-100"
                >
                  <div className={`w-12 h-12 bg-gradient-to-r ${feature.color} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 to-purple-700">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to get started?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of developers monitoring their MCP tools with our platform.
          </p>
          {isSignedIn ? (
            <a
              href="/app"
              className="bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold text-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 inline-flex items-center space-x-2"
            >
              <span>Go to Dashboard</span>
              <ArrowRight size={20} />
            </a>
          ) : (
            <button
              onClick={() => setShowAuth(true)}
              className="bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold text-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 inline-flex items-center space-x-2"
            >
              <span>Start Free Trial</span>
              <ArrowRight size={20} />
            </button>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 bg-gray-900">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center space-x-3 mb-8">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white">MCP Observability</span>
          </div>
          <p className="text-gray-400 mb-4">
            Built with ❤️ for the MCP community
          </p>
          <div className="flex justify-center space-x-6 text-sm text-gray-400">
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage; 