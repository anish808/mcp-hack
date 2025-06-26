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
  Play,
  Loader
} from 'lucide-react';
import { SignIn, SignUp, useAuth } from '@clerk/clerk-react';
import { submitContactForm } from '../api';

// Video Modal Component
interface VideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoUrl: string;
}

const VideoModal: React.FC<VideoModalProps> = ({ isOpen, onClose, videoUrl }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // Handle escape key press
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden'; // Prevent background scrolling
      setIsLoading(true);
      setHasError(false);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
      onClick={onClose} // Close when clicking backdrop
    >
      <div 
        className="relative bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden animate-fade-in-up"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking modal content
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 bg-black bg-opacity-50 text-white rounded-full p-2 hover:bg-opacity-70 transition-all duration-200"
          aria-label="Close video modal"
        >
          <X size={20} />
        </button>
        
        {/* Video container */}
        <div className="relative bg-black rounded-t-2xl overflow-hidden">
          {/* Loading indicator */}
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
              <div className="flex flex-col items-center text-white">
                <Loader className="w-8 h-8 animate-spin mb-3" />
                <p className="text-sm">Loading demo video...</p>
              </div>
            </div>
          )}

          {/* Error state */}
          {hasError && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
              <div className="flex flex-col items-center text-white text-center p-8">
                <X className="w-8 h-8 mb-3 text-red-400" />
                <h3 className="text-lg font-semibold mb-2">Video Unavailable</h3>
                <p className="text-sm text-gray-300 mb-4">
                  The demo video couldn't be loaded. Please make sure the video file is placed in the public folder.
                </p>
                <button
                  onClick={onClose}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          )}

          {/* No Audio Indicator */}
          {!isLoading && !hasError && (
            <div className="absolute top-4 left-4 z-10">
              <div className="bg-black bg-opacity-70 text-white px-3 py-2 rounded-lg flex items-center space-x-2 text-sm">
                <svg className="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" clipRule="evenodd" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                </svg>
                <span>No Audio</span>
              </div>
            </div>
          )}

          <video
            className="w-full h-auto max-h-[80vh] object-contain"
            controls
            autoPlay
            muted
            preload="metadata"
            onLoadedData={() => setIsLoading(false)}
            onError={() => {
              setIsLoading(false);
              setHasError(true);
            }}
            poster="/demo-thumbnail.jpg" // Optional: add a thumbnail
          >
            <source src={videoUrl} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
        
        {/* Video info */}
        <div className="p-6 bg-gradient-to-r from-blue-50 to-purple-50">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            MCP Observability Platform Demo
          </h3>
          <p className="text-gray-600 text-sm">
            See how easy it is to monitor your MCP tools, debug issues with stack traces, 
            and replay failed requests to understand what went wrong.
          </p>
          <div className="mt-3 flex items-center text-xs text-gray-500">
            <span className="bg-gray-200 px-2 py-1 rounded-md mr-2">Duration: 1:44</span>
            <span>HD Quality</span>
          </div>
        </div>
      </div>
    </div>
  );
};

interface LandingPageProps {
  onGetStarted: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted }) => {
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signup');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const { isSignedIn } = useAuth();
  
  // INSTRUCTIONS: Place your demo video file in the frontend/public/ folder 
  // and update this URL to match your filename (e.g., "/my-demo-video.mp4")
  const demoVideoUrl = "/demo-video.mp4";
  
  // Contact form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    interest: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email) {
      setErrorMessage('Please fill in all required fields.');
      setSubmitStatus('error');
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus('idle');
    setErrorMessage('');

    try {
      await submitContactForm(formData);
      setSubmitStatus('success');
      setFormData({ name: '', email: '', interest: '' });
    } catch (error) {
      console.error('Error submitting form:', error);
      setSubmitStatus('error');
      setErrorMessage('Failed to submit form. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const features = [
    {
      icon: Activity,
      title: "Stack Trace Inspection",
      description: "Debug your MCP tools with detailed stack traces and execution context when things go wrong.",
      color: "from-blue-500 to-blue-600"
    },
    {
      icon: BarChart3,
      title: "Success Rate & Throughput",
      description: "Track the basics that matter: how often your tools succeed and how fast they respond.",
      color: "from-green-500 to-green-600"
    },
    {
      icon: Zap,
      title: "Request Replay",
      description: "Replay failed requests to understand what went wrong and test your fixes.",
      color: "from-yellow-500 to-yellow-600"
    },
    {
      icon: Shield,
      title: "Simple Filtering",
      description: "Filter through your traces by success/failure, tool name, or time period.",
      color: "from-purple-500 to-purple-600"
    },
    {
      icon: Globe,
      title: "Easy Onboarding",
      description: "Get started quickly with minimal setup - we know your time is valuable.",
      color: "from-indigo-500 to-indigo-600"
    },
    {
      icon: Rocket,
      title: "Python SDK (Ready)",
      description: "Drop-in Python SDK that just works. TypeScript coming soon based on your feedback.",
      color: "from-pink-500 to-pink-600"
    }
  ];

  const stats = [
    { label: "Building for Early Adopters", value: "", suffix: "" },
    { label: "Community Driven Development", value: "", suffix: "" },
    { label: "Your Feedback Needed", value: "", suffix: "" }
  ];

  if (showAuth && !isSignedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Activity className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Join Etale Systems</h1>
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
              <div>
                <span className="text-xl font-bold text-gray-900">Etale Systems</span>
                <div className="text-xs text-gray-500 -mt-0.5">MCP Observability</div>
              </div>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-600 hover:text-gray-900 transition-colors">Features</a>
              <a href="#sdk" className="text-gray-600 hover:text-gray-900 transition-colors">SDK</a>
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
                  Try Demo
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
              <a href="#sdk" className="block py-2 text-gray-600 hover:text-gray-900">SDK</a>
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
                    Try Demo
                  </button>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Column - Main Content */}
            <div className="text-center lg:text-left">
              <div className="animate-fade-in-up">
                <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6">
                  MCP Observability
                  <span className="bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
                    {" "}Built by Developers
                  </span>
                </h1>
                <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-2xl lg:max-w-none">
                  We were building an MCP server and ran into reliability issues and slow response times. This led us to create an observability platform we actually wanted to use. We see a future in a platform that can expand and deliver more insights—we hope you do too!
                </p>
              </div>
              
              <div className="animate-fade-in-up animation-delay-200 mb-12">
                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
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
                      <span>Try the Demo</span>
                      <ArrowRight size={20} />
                    </button>
                  )}
                  <button 
                    onClick={() => setShowVideoModal(true)}
                    className="border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-xl font-semibold text-lg hover:border-gray-400 transition-all duration-200 flex items-center justify-center space-x-2 hover:bg-gray-50"
                  >
                    <Play size={20} />
                    <span>Watch Demo</span>
                  </button>
                </div>
              </div>

              {/* Stats */}
              <div className="animate-fade-in-up animation-delay-400 grid grid-cols-1 md:grid-cols-3 gap-6">
                {stats.map((stat, index) => (
                  <div key={index} className="text-center lg:text-left">
                    <div className="text-base font-medium text-gray-700 px-3 py-2 bg-gray-100 rounded-lg">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column - Interest Form */}
            <div className="animate-fade-in-up animation-delay-300">
              <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    Join the Early Wave
                  </h3>
                  <p className="text-gray-600">
                    Help us build the observability platform MCP developers actually want
                  </p>
                </div>
                
                <form onSubmit={handleFormSubmit} className="space-y-4">
                  <div>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                      placeholder="Full Name"
                      disabled={isSubmitting}
                    />
                  </div>
                  
                  <div>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                      placeholder="Email Address"
                      disabled={isSubmitting}
                    />
                  </div>
                  
                  <div>
                    <select
                      name="interest"
                      value={formData.interest}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                      disabled={isSubmitting}
                    >
                      <option value="">What interests you most?</option>
                      <option value="typescript-sdk">TypeScript SDK Release</option>
                      <option value="new-features">New Features & Updates</option>
                      <option value="enterprise">Enterprise Solutions</option>
                      <option value="integrations">Third-party Integrations</option>
                      <option value="community">Community & Support</option>
                    </select>
                  </div>
                  
                  {submitStatus === 'error' && errorMessage && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-red-600 text-sm">{errorMessage}</p>
                    </div>
                  )}
                  
                  {submitStatus === 'success' && (
                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-green-600 text-sm flex items-center">
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Thank you for your interest! We'll be in touch soon.
                      </p>
                    </div>
                  )}
                  
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-gradient-to-r from-green-500 to-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader className="w-4 h-4 mr-2 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      'Join Waitlist'
                    )}
                  </button>
                  
                  <p className="text-xs text-gray-500 text-center">
                    No spam. Updates only. Unsubscribe anytime.
                  </p>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              What we're building
              <span className="bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
                {" "}for MCP developers
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              The platform currently focuses on ease of onboarding and captures the essentials: stack trace inspection, success rates, throughput, replay, and filtering. We're building this with early MCP developers like you.
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
          
          {/* Getting Started Steps */}
          <div className="mt-16 max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold text-gray-900 text-center mb-8">Get started in 3 steps</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 text-white font-bold text-lg">1</div>
                <h4 className="font-semibold text-gray-900 mb-2">Sign Up & Get API Key</h4>
                <p className="text-gray-600">Create your account and grab your API key from the dashboard</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 text-white font-bold text-lg">2</div>
                <h4 className="font-semibold text-gray-900 mb-2">Install Python SDK</h4>
                <p className="text-gray-600">pip install mcp-observability and wrap your tools</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 text-white font-bold text-lg">3</div>
                <h4 className="font-semibold text-gray-900 mb-2">Start Debugging</h4>
                <p className="text-gray-600">See stack traces, success rates, and replay failed requests</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SDK Section */}
      <section id="sdk" className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Start monitoring with our
              <span className="bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
                {" "}SDKs
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Drop-in SDKs for Python and TypeScript. Get started in minutes with zero configuration.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {/* Python SDK */}
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M14.25.18l.9.2.73.26.59.3.45.32.34.34.25.34.16.33.1.3.04.26.02.2-.01.13V8.5l-.05.63-.13.55-.21.46-.26.38-.3.31-.33.25-.35.19-.35.14-.33.1-.3.07-.26.04-.21.02H8.77l-.69.05-.59.14-.5.22-.41.27-.33.32-.27.35-.2.36-.15.37-.1.35-.07.32-.04.27-.02.21v3.06H3.17l-.21-.03-.28-.07-.32-.12-.35-.18-.36-.26-.36-.36-.35-.46-.32-.59-.28-.73-.21-.88-.14-1.05-.05-1.23.06-1.22.16-1.04.24-.87.32-.71.36-.57.4-.44.42-.33.42-.24.4-.16.36-.1.32-.05.26-.02.21-.01H20.83l.69-.05.59-.14.5-.21.41-.28.33-.32.27-.35.2-.36.15-.36.1-.35.07-.32.04-.28.02-.21V3.23l-.06-.76-.11-.73-.16-.69-.21-.64-.24-.58-.26-.52-.26-.45-.24-.39-.21-.32-.17-.25-.13-.18-.09-.11L22.26.48l-.04-.06-.07-.17-.09-.23-.06-.22-.02-.16.01-.13.03-.08.05-.06.07-.04.08-.02.07-.01L23.05 0l.02.01h.02l.02.01.02.01.02.01.01.01v.01l.01.01v.01L23.14.07v.02l-.01.01v.01h-.01v.01L23.1.13H23.08v.01L23.05.15l-.02.01-.03.01-.03.01-.04.01-.04.01-.05.01h-.05l-.05.01h-.05l-.05.01-.04.01-.05.01-.04.02-.04.01-.04.02-.03.02-.04.02-.03.02-.03.02-.03.03-.02.03-.03.03-.02.03-.02.04-.02.04-.01.04-.01.04-.01.05v.05l-.01.05v.06l.01.06.01.06.02.06.02.05.03.05.03.05.04.04.04.04.05.04.05.03.05.03.06.02.06.02.06.01.06.01h.06l.06-.01.06-.01.06-.02.05-.02.05-.03.05-.03.04-.04.04-.04.03-.05.03-.05.02-.05.02-.06.01-.06.01-.06v-.06l-.01-.05-.01-.04-.01-.04-.02-.04-.02-.03-.02-.03-.03-.03-.03-.02-.03-.02-.04-.02-.03-.02-.04-.01-.04-.02-.04-.01-.05-.01-.04-.01-.05-.01h-.05l-.05-.01h-.05l-.04-.01-.04-.01-.03-.01-.03-.01-.02-.01L23.14.07zm-9.09 6.54H8.77l-.69.05-.59.14-.5.21-.41.28-.33.32-.27.35-.2.36-.15.36-.1.35-.07.32-.04.28-.02.21v3.06h6.29l.21-.02.26-.04.3-.07.33-.1.35-.14.35-.19.33-.25.3-.31.26-.38.21-.46.13-.55.05-.63V3.23l-.02-.2-.04-.26-.1-.3-.16-.33-.25-.34-.34-.34-.45-.32-.59-.3-.73-.26-.9-.2H14.25z"/>
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">Python SDK</h3>
                  <p className="text-sm text-gray-500">mcp-observability</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="bg-gray-900 rounded-lg p-4 text-sm font-mono">
                  <div className="text-green-400 mb-2"># Install</div>
                  <div className="text-white">pip install mcp-observability</div>
                </div>
                
                <div className="bg-gray-900 rounded-lg p-4 text-sm font-mono">
                  <div className="text-green-400 mb-2"># Quick Start</div>
                  <div className="text-white space-y-1">
                    <div><span className="text-purple-400">from</span> <span className="text-white">mcp_observability</span> <span className="text-purple-400">import</span> <span className="text-yellow-300">MCPObservability</span></div>
                    <div className="h-3"></div>
                    <div><span className="text-white">obs</span> <span className="text-purple-400">=</span> <span className="text-yellow-300">MCPObservability</span><span className="text-white">(</span></div>
                    <div>&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-blue-300">api_url</span><span className="text-purple-400">=</span><span className="text-green-300">"https://etalesystems.com/api"</span><span className="text-white">,</span></div>
                    <div>&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-blue-300">api_key</span><span className="text-purple-400">=</span><span className="text-green-300">"your_api_key"</span></div>
                    <div><span className="text-white">)</span></div>
                    <div className="h-3"></div>
                    <div><span className="text-yellow-300">@mcp.tool()</span></div>
                    <div className="bg-blue-900/30 px-2 py-1 rounded border-l-4 border-blue-400">
                      <span className="text-yellow-300 font-semibold">@obs.tool_observer("my_tool")</span>
                      <span className="text-blue-200 text-xs ml-2">← Just add this line!</span>
                    </div>
                    <div><span className="text-purple-400">def</span> <span className="text-blue-300">my_tool</span><span className="text-white">():</span></div>
                    <div>&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-gray-400"># Your tool logic here</span></div>
                    <div>&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-purple-400">return</span> <span className="text-green-300">"success"</span></div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between pt-4">
                  <a 
                    href="https://pypi.org/project/mcp-observability/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-700 font-medium flex items-center space-x-1"
                  >
                    <span>View on PyPI</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                  <div className="flex space-x-2">
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-md">v0.1.2</span>
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md">Python 3.8+</span>
                  </div>
                </div>
              </div>
            </div>

                         {/* TypeScript SDK - Coming Soon */}
             <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100 relative">
               {/* Coming Soon Badge */}
               <div className="absolute top-4 right-4">
                 <span className="px-3 py-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-semibold rounded-full">
                   Coming Soon
                 </span>
               </div>
               
               <div className="flex items-center space-x-3 mb-6">
                 <div className="w-12 h-12 bg-gradient-to-r from-gray-400 to-gray-500 rounded-xl flex items-center justify-center">
                   <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                     <path d="M1.125 0C.502 0 0 .502 0 1.125v21.75C0 23.498.502 24 1.125 24h21.75c.623 0 1.125-.502 1.125-1.125V1.125C24 .502 23.498 0 22.875 0zm17.363 9.75c.612 0 1.154.037 1.627.111a6.38 6.38 0 0 1 1.306.34v2.458a3.95 3.95 0 0 0-.643-.361 5.093 5.093 0 0 0-.717-.26 5.453 5.453 0 0 0-.748-.108 5.446 5.446 0 0 0-.689-.044c-.656 0-1.155.138-1.498.414-.343.276-.515.653-.515 1.13 0 .426.13.758.388.996.26.238.6.434 1.021.588.42.154.905.308 1.455.462.55.154 1.035.368 1.455.642.42.274.761.616 1.021.996.26.38.39.849.39 1.407 0 .612-.148 1.14-.443 1.583-.295.443-.716.784-1.263 1.021-.547.237-1.203.355-1.968.355-.615 0-1.246-.077-1.892-.231-.647-.154-1.255-.382-1.824-.684v-2.683c.218.133.459.252.724.355.264.103.556.185.875.246.32.061.651.092.993.092.717 0 1.264-.148 1.641-.443.378-.295.566-.686.566-1.173 0-.4-.13-.712-.39-.938-.26-.225-.6-.414-1.021-.566-.42-.152-.905-.304-1.455-.456-.55-.152-1.035-.334-1.455-.546-.42-.212-.761-.486-1.021-.822-.26-.336-.39-.753-.39-1.25 0-.581.148-1.085.443-1.512.295-.427.716-.751 1.263-.972.547-.221 1.203-.331 1.968-.331z"/>
                   </svg>
                 </div>
                 <div>
                   <h3 className="text-xl font-semibold text-gray-900">TypeScript SDK</h3>
                   <p className="text-sm text-gray-500">@mcp-hack/typescript</p>
                 </div>
               </div>
               
               <div className="space-y-4 opacity-60">
                 <div className="bg-gray-900 rounded-lg p-4 text-sm font-mono">
                   <div className="text-green-400 mb-2"># Install (Preview)</div>
                   <div className="text-white">npm install @mcp-hack/typescript</div>
                 </div>
                 
                 <div className="bg-gray-900 rounded-lg p-4 text-sm font-mono">
                   <div className="text-green-400 mb-2">// Quick Start (Preview)</div>
                   <div className="text-white">
                     <div className="text-blue-300">import</div> &#123; trace &#125; <div className="text-blue-300">from</div> <div className="text-orange-300">'@mcp-hack/typescript'</div>;<br/>
                     <br/>
                     <div className="text-blue-300">await</div> trace(&#123;<br/>
                     &nbsp;&nbsp;apiUrl: <div className="text-orange-300">'https://etalesystems.com/api'</div>,<br/>
                     &nbsp;&nbsp;apiKey: process.env.MCP_API_KEY,<br/>
                     &nbsp;&nbsp;task: <div className="text-orange-300">'My Task'</div>,<br/>
                     &nbsp;&nbsp;context: &#123; input: <div className="text-orange-300">'data'</div> &#125;,<br/>
                     &nbsp;&nbsp;modelOutput: <div className="text-orange-300">'result'</div><br/>
                     &#125;);
                   </div>
                 </div>
                 
                 <div className="pt-4">
                   <div className="text-center">
                     <p className="text-gray-600 mb-4">Get notified when the TypeScript SDK is ready</p>
                     <button 
                       onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                       className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-medium hover:shadow-lg transition-all duration-200"
                     >
                       <span>Join Waitlist</span>
                       <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 17l5-5 5 5M7 7l5 5 5 5" />
                       </svg>
                     </button>
                   </div>
                 </div>
               </div>
             </div>
          </div>


        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 to-purple-700">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to help us build this?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Check out the demo and let us know what features you'd like to see. Your feedback shapes what we build next.
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
              <span>Try the Demo</span>
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
            <div className="text-center">
              <span className="text-xl font-bold text-white">Etale Systems</span>
              <div className="text-sm text-blue-100">MCP Observability</div>
            </div>
          </div>
          <p className="text-gray-400 mb-4">
            Built with ❤️ for the MCP community
          </p>
          <div className="flex flex-col items-center space-y-4">
            <a href="mailto:etalesystemsteam@gmail.com" className="text-blue-400 hover:text-blue-300 transition-colors">
              etalesystemsteam@gmail.com
            </a>
            <div className="flex justify-center space-x-6 text-sm text-gray-400">
              <a href="#" className="hover:text-white transition-colors">Privacy</a>
              <a href="#" className="hover:text-white transition-colors">Terms</a>
              <a href="mailto:etalesystemsteam@gmail.com" className="hover:text-white transition-colors">Contact</a>
            </div>
          </div>
        </div>
      </footer>

      {/* Video Modal */}
      <VideoModal
        isOpen={showVideoModal}
        onClose={() => setShowVideoModal(false)}
        videoUrl={demoVideoUrl}
      />
    </div>
  );
};

export default LandingPage; 