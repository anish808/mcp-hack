# MCP Observability SDK for TypeScript/JavaScript

Open, vendor-agnostic observability SDK for Model Context Protocol (MCP) applications. No vendor lock-in, plug-and-play integration, and extensible for rate limiting, tool filtering, auth, and traceability.

## Installation

```bash
npm install @mcp-hack/typescript
# or
yarn add @mcp-hack/typescript
```

## Quick Start

### 1. Get an API Key

1. Visit [https://etalesystems.com](https://etalesystems.com)
2. Sign in with your Google account
3. Create a new API key from the dashboard
4. Set your API key as an environment variable:

```bash
export MCP_API_KEY="your_api_key_here"
```

### 2. Use in Your Code

```typescript
import { trace } from '@mcp-hack/typescript';

// Send a trace to your observability backend
await trace({
  apiUrl: 'https://etalesystems.com/api',
  apiKey: process.env.MCP_API_KEY!, // Your API key from etalesystems.com
  task: 'Summarize',
  context: { userMessage: 'Summarize the last 5 emails' },
  modelOutput: 'Here is the summary...',
  metadata: { 
    runtimeMs: 314, 
    model: 'gpt-4', 
    retries: 0 
  }
});
```

## Features

- 🔍 **Simple Trace API**: Send traces to your observability backend
- 📊 **Rich Metadata**: Include custom metadata with each trace
- 🚀 **Async/Await**: Modern JavaScript async/await support
- 🔒 **Secure**: API key authentication
- 📈 **Dashboard Integration**: Real-time visualization of your traces
- 🎯 **TypeScript Support**: Full TypeScript definitions included

## API Reference

### trace(options)

Send a trace to the observability backend.

#### Parameters

- `apiUrl` (string): URL of your observability backend
- `apiKey` (string): API key for authentication
- `task` (string): Name/description of the task being traced
- `context` (any): Context data for the trace
- `modelOutput` (string): Output from the model/tool
- `metadata` (TraceMetadata, optional): Additional metadata

#### Returns

Promise that resolves to the response data or null if the request fails.

#### Example

```typescript
import { trace } from '@mcp-hack/typescript';

const result = await trace({
  apiUrl: 'https://etalesystems.com/api',
  apiKey: process.env.MCP_API_KEY!,
  task: 'Document Analysis',
  context: {
    documentId: '12345',
    analysisType: 'summary'
  },
  modelOutput: 'This document contains...',
  metadata: {
    processingTimeMs: 1250,
    model: 'gpt-4',
    confidence: 0.95
  }
});
```

## Environment Variables

- `MCP_API_KEY`: Your API key from https://etalesystems.com

## TypeScript Support

This package includes full TypeScript definitions. The main interfaces are:

```typescript
interface TraceMetadata {
  [key: string]: any;
}
```

## Error Handling

The SDK handles errors gracefully:
- Network errors are caught and logged
- Missing API keys trigger warnings
- Failed requests return `null` instead of throwing

## License

MIT License. See LICENSE file for details.

## Contributing

Contributions are welcome! Please see our [Contributing Guide](https://github.com/anish808/mcp-hack/blob/main/CONTRIBUTING.md).

## Links

- [Documentation](https://github.com/anish808/mcp-hack#readme)
- [GitHub Repository](https://github.com/anish808/mcp-hack)
- [Issue Tracker](https://github.com/anish808/mcp-hack/issues)
- [Python SDK](https://pypi.org/project/mcp-hack/)
- [Dashboard](https://etalesystems.com) - Generate API keys and view traces 