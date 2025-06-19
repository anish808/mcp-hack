import requests
import uuid
import datetime

class MCPObservability:
    def __init__(self, api_url: str):
        self.api_url = api_url.rstrip('/')

    def trace(self, task, context, model_output, metadata=None):
        trace_id = str(uuid.uuid4())
        payload = {
            'id': trace_id,
            'timestamp': datetime.datetime.utcnow().isoformat() + 'Z',
            'task': task,
            'context': context,
            'model_output': model_output,
            'metadata': metadata or {}
        }
        resp = requests.post(f'{self.api_url}/traces', json=payload)
        resp.raise_for_status()
        return resp.json()

# Example usage:
# obs = MCPObservability(api_url='http://localhost:3001')
# obs.trace('Summarize', {'userMessage': 'Summarize the last 5 emails'}, 'Here is the summary...', {'runtimeMs': 314, 'model': 'gpt-4', 'retries': 0})
