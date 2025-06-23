import React, { useState, useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';

interface ApiKey {
  id: string;
  name: string;
  description: string;
  key: string;
  isActive: boolean;
  createdAt: string;
  lastUsedAt?: string;
  _count?: { traces: number };
}

const ApiKeyManager: React.FC = () => {
  const { getToken } = useAuth();
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newKey, setNewKey] = useState({ name: '', description: '' });
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const fetchApiKeys = async () => {
    try {
      const token = await getToken();
      const response = await fetch('http://localhost:3001/api-keys', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const keys = await response.json();
        setApiKeys(keys);
      }
    } catch (error) {
      console.error('Failed to fetch API keys:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApiKeys();
  }, []);

  const createApiKey = async () => {
    if (!newKey.name.trim()) return;

    try {
      console.log('Creating API key...');
      const token = await getToken();
      console.log('Got token:', token ? 'Token received' : 'No token');
      
      const response = await fetch('http://localhost:3001/api-keys', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newKey),
      });

      console.log('Response status:', response.status);
      
      if (response.ok) {
        const createdKey = await response.json();
        console.log('Created key:', createdKey);
        setApiKeys([createdKey, ...apiKeys]);
        setNewKey({ name: '', description: '' });
        setShowCreateForm(false);
        setCopiedKey(createdKey.key);
      } else {
        const errorData = await response.text();
        console.error('API Error:', response.status, errorData);
        alert(`Failed to create API key: ${response.status} ${errorData}`);
      }
    } catch (error) {
      console.error('Failed to create API key:', error);
      alert(`Error creating API key: ${error.message}`);
    }
  };

  const toggleApiKey = async (id: string, isActive: boolean) => {
    try {
      const token = await getToken();
      const response = await fetch(`http://localhost:3001/api-keys/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isActive: !isActive }),
      });

      if (response.ok) {
        const updatedKey = await response.json();
        setApiKeys(apiKeys.map(key => key.id === id ? updatedKey : key));
      }
    } catch (error) {
      console.error('Failed to toggle API key:', error);
    }
  };

  const deleteApiKey = async (id: string) => {
    if (!confirm('Are you sure you want to delete this API key? This action cannot be undone.')) {
      return;
    }

    try {
      const token = await getToken();
      const response = await fetch(`http://localhost:3001/api-keys/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setApiKeys(apiKeys.filter(key => key.id !== id));
      }
    } catch (error) {
      console.error('Failed to delete API key:', error);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(text);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const maskApiKey = (key: string) => {
    return `${key.substring(0, 8)}...${key.substring(key.length - 8)}`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">API Keys</h2>
          <p className="text-gray-600">Manage your MCP server authentication keys</p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Create API Key
        </button>
      </div>

      {showCreateForm && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Create New API Key</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name *
              </label>
              <input
                type="text"
                value={newKey.name}
                onChange={(e) => setNewKey({ ...newKey, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="e.g., Production Server, Development"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <input
                type="text"
                value={newKey.description}
                onChange={(e) => setNewKey({ ...newKey, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="Optional description"
              />
            </div>
            <div className="flex space-x-3">
              <button
                onClick={createApiKey}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Create Key
              </button>
              <button
                onClick={() => setShowCreateForm(false)}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {apiKeys.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 text-lg">No API keys yet</div>
          <p className="text-gray-600 mt-2">Create your first API key to start logging MCP traces</p>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    API Key
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Traces
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Used
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {apiKeys.map((apiKey) => (
                  <tr key={apiKey.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{apiKey.name}</div>
                        {apiKey.description && (
                          <div className="text-sm text-gray-500">{apiKey.description}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-mono text-gray-600">
                          {maskApiKey(apiKey.key)}
                        </span>
                        <button
                          onClick={() => copyToClipboard(apiKey.key)}
                          className="text-blue-600 hover:text-blue-800"
                          title="Copy full API key"
                        >
                          {copiedKey === apiKey.key ? (
                            <span className="text-green-600">✓</span>
                          ) : (
                            <span>📋</span>
                          )}
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          apiKey.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {apiKey.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {apiKey._count?.traces || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {apiKey.lastUsedAt ? formatDate(apiKey.lastUsedAt) : 'Never'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => toggleApiKey(apiKey.id, apiKey.isActive)}
                        className={`${
                          apiKey.isActive ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'
                        }`}
                      >
                        {apiKey.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                      <button
                        onClick={() => deleteApiKey(apiKey.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-blue-900 mb-2">How to use your API key:</h3>
        <div className="text-sm text-blue-800 space-y-1">
          <p>1. Copy your API key from the table above</p>
          <p>2. Include it in your MCP server requests as a header:</p>
          <code className="block bg-white px-2 py-1 rounded text-xs mt-2">
            X-API-Key: your_api_key_here
          </code>
        </div>
      </div>
    </div>
  );
};

export default ApiKeyManager; 