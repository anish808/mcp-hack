#!/usr/bin/env python3
"""
Test script to demonstrate MCP observability functionality.
This script shows how the tool_observer decorator tracks metrics.
"""

import sys
import os
import time
import random

# Add SDK to path
sys.path.append(os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 'sdk', 'python'))

from mcp_observability import MCPObservability

# Initialize observability (in real usage, this would point to your backend)
obs = MCPObservability(api_url='https://etalesystems.com/api', api_key='mcp_25abf53b3ba1036df400b6eeca8a3f819583c97f13cce59ce781271f33b50576')

# Define some test functions with observability
@obs.tool_observer("add_function")
def add_numbers(a: int, b: int) -> int:
    """Add two numbers with some artificial delay"""
    time.sleep(random.uniform(0.01, 0.1))  # Simulate work
    return a + b

@obs.tool_observer("divide_function")  
def divide_numbers(a: int, b: int) -> float:
    """Divide two numbers - might fail with division by zero"""
    time.sleep(random.uniform(0.01, 0.05))  # Simulate work
    if b == 0:
        raise ValueError("Division by zero!")
    return a / b

@obs.tool_observer("slow_function")
def slow_computation(n: int) -> int:
    """A deliberately slow function to test timing metrics"""
    time.sleep(random.uniform(0.1, 0.3))
    return sum(range(n))

def run_test():
    """Run a series of test calls to generate metrics"""
    print("Running observability test...")
    
    # Make successful calls
    for i in range(10):
        result = add_numbers(i, i + 1)
        print(f"add_numbers({i}, {i+1}) = {result}")
    
    # Make some division calls (some will fail)
    divisors = [1, 2, 0, 3, 0, 4, 5]  # Include zeros to test error handling
    for i, divisor in enumerate(divisors):
        try:
            result = divide_numbers(10, divisor)
            print(f"divide_numbers(10, {divisor}) = {result}")
        except ValueError as e:
            print(f"divide_numbers(10, {divisor}) failed: {e}")
    
    # Make some slow calls
    for n in [5, 10, 15]:
        result = slow_computation(n)
        print(f"slow_computation({n}) = {result}")
    
    # Print final metrics
    print("\n" + "="*50)
    obs.print_metrics()
    
    # Also show raw metrics data
    print("\n" + "="*50)
    print("Raw metrics data:")
    import json
    print(json.dumps(obs.get_metrics(), indent=2))

if __name__ == "__main__":
    run_test() 