import requests
import uuid
import datetime
import time
import functools
import threading
from typing import Dict, Any, Callable, Optional
import logging

logger = logging.getLogger(__name__)

class MCPObservability:
    def __init__(self, api_url: str, api_key: Optional[str] = None):
        self.api_url = api_url.rstrip('/')
        self.api_key = api_key
        self.metrics = {
            'tool_calls': {},
            'total_calls': 0,
            'total_errors': 0
        }
        self._lock = threading.Lock()
        
        if not self.api_key:
            logger.warning("No API key provided. Traces will not be sent to the backend.")

    def trace(self, task: str, context: Dict[str, Any], model_output: str, metadata: Optional[Dict[str, Any]] = None):
        """Send a trace to the observability backend"""
        if not self.api_key:
            logger.debug("No API key configured, skipping trace submission")
            return None
            
        trace_id = str(uuid.uuid4())
        payload = {
            'id': trace_id,
            'timestamp': datetime.datetime.utcnow().isoformat() + 'Z',
            'task': task,
            'context': context,
            'model_output': model_output,
            'metadata': metadata or {}
        }
        
        headers = {
            'Content-Type': 'application/json',
            'X-API-Key': self.api_key
        }
        
        try:
            resp = requests.post(f'{self.api_url}/traces', json=payload, headers=headers, timeout=5)
            resp.raise_for_status()
            return resp.json()
        except Exception as e:
            logger.error(f"Failed to send trace: {e}")
            return None

    def _update_metrics(self, tool_name: str, execution_time: float, success: bool, error: Optional[str] = None):
        """Update internal metrics for a tool call"""
        with self._lock:
            if tool_name not in self.metrics['tool_calls']:
                self.metrics['tool_calls'][tool_name] = {
                    'count': 0,
                    'total_time': 0.0,
                    'avg_time': 0.0,
                    'min_time': float('inf'),
                    'max_time': 0.0,
                    'success_count': 0,
                    'error_count': 0,
                    'last_called': None,
                    'errors': []
                }
            
            tool_metrics = self.metrics['tool_calls'][tool_name]
            tool_metrics['count'] += 1
            tool_metrics['total_time'] += execution_time
            tool_metrics['avg_time'] = tool_metrics['total_time'] / tool_metrics['count']
            tool_metrics['min_time'] = min(tool_metrics['min_time'], execution_time)
            tool_metrics['max_time'] = max(tool_metrics['max_time'], execution_time)
            tool_metrics['last_called'] = datetime.datetime.utcnow().isoformat() + 'Z'
            
            if success:
                tool_metrics['success_count'] += 1
            else:
                tool_metrics['error_count'] += 1
                if error and len(tool_metrics['errors']) < 10:  # Keep last 10 errors
                    tool_metrics['errors'].append({
                        'error': str(error),
                        'timestamp': datetime.datetime.utcnow().isoformat() + 'Z'
                    })
            
            self.metrics['total_calls'] += 1
            if not success:
                self.metrics['total_errors'] += 1

    def tool_observer(self, tool_name: Optional[str] = None):
        """Decorator to observe MCP tool calls"""
        def decorator(func: Callable) -> Callable:
            actual_tool_name = tool_name or func.__name__
            
            @functools.wraps(func)
            def wrapper(*args, **kwargs):
                start_time = time.time()
                success = True
                error = None
                result = None
                
                try:
                    result = func(*args, **kwargs)
                    return result
                except Exception as e:
                    success = False
                    error = e
                    raise
                finally:
                    execution_time = time.time() - start_time
                    
                    # Update metrics
                    self._update_metrics(actual_tool_name, execution_time, success, error)
                    
                    # Send trace to backend (async to not block tool execution)
                    try:
                        context = {
                            'tool_name': actual_tool_name,
                            'args': str(args) if args else '',
                            'kwargs': str(kwargs) if kwargs else '',
                            'execution_time_ms': round(execution_time * 1000, 2)
                        }
                        
                        if success:
                            output = f"Tool '{actual_tool_name}' executed successfully"
                            if result is not None:
                                output += f" with result: {str(result)[:200]}..."  # Truncate long results
                        else:
                            output = f"Tool '{actual_tool_name}' failed with error: {str(error)}"
                        
                        metadata = {
                            'success': success,
                            'execution_time_ms': round(execution_time * 1000, 2),
                            'tool_name': actual_tool_name
                        }
                        
                        if error:
                            metadata['error'] = str(error)
                            metadata['error_type'] = type(error).__name__
                            
                        # Send trace in background (don't block on this)
                        import threading
                        threading.Thread(
                            target=self.trace,
                            args=(f"MCP Tool Call: {actual_tool_name}", context, output, metadata),
                            daemon=True
                        ).start()
                        
                    except Exception as trace_error:
                        logger.error(f"Failed to send tool trace: {trace_error}")
            
            return wrapper
        return decorator

    def get_metrics(self) -> Dict[str, Any]:
        """Get current metrics snapshot"""
        with self._lock:
            return {
                'summary': {
                    'total_calls': self.metrics['total_calls'],
                    'total_errors': self.metrics['total_errors'],
                    'success_rate': (
                        (self.metrics['total_calls'] - self.metrics['total_errors']) / self.metrics['total_calls'] 
                        if self.metrics['total_calls'] > 0 else 0
                    ) * 100,
                    'total_tools': len(self.metrics['tool_calls'])
                },
                'tools': dict(self.metrics['tool_calls'])
            }

    def print_metrics(self):
        """Print formatted metrics to console"""
        metrics = self.get_metrics()
        print("\n=== MCP Tool Observability Metrics ===")
        print(f"Total Tool Calls: {metrics['summary']['total_calls']}")
        print(f"Total Errors: {metrics['summary']['total_errors']}")
        print(f"Success Rate: {metrics['summary']['success_rate']:.1f}%")
        print(f"Total Tools: {metrics['summary']['total_tools']}")
        
        if metrics['tools']:
            print("\n--- Tool Details ---")
            for tool_name, tool_metrics in metrics['tools'].items():
                print(f"\n{tool_name}:")
                print(f"  Calls: {tool_metrics['count']}")
                print(f"  Success: {tool_metrics['success_count']}")
                print(f"  Errors: {tool_metrics['error_count']}")
                print(f"  Avg Time: {tool_metrics['avg_time']:.3f}s")
                print(f"  Min Time: {tool_metrics['min_time']:.3f}s")
                print(f"  Max Time: {tool_metrics['max_time']:.3f}s")
                print(f"  Last Called: {tool_metrics['last_called']}")
                
                if tool_metrics['errors']:
                    print(f"  Recent Errors:")
                    for error in tool_metrics['errors'][-3:]:  # Show last 3 errors
                        print(f"    - {error['error']} ({error['timestamp']})")

# Example usage:
# obs = MCPObservability(
#     api_url='http://localhost:3001',
#     api_key='mcp_your_api_key_here'  # Get this from your dashboard
# )
# 
# @obs.tool_observer("add_numbers")
# def add(a: int, b: int) -> int:
#     """Add two numbers"""
#     return a + b
#
# # Or use with existing MCP decorator:
# @mcp.tool()
# @obs.tool_observer()
# def multiply(a: int, b: int) -> int:
#     """Multiply two numbers"""  
#     return a * b

