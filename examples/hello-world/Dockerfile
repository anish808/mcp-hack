# Use official Python slim image for smaller footprint
FROM python:3.12-slim

# Set working directory
WORKDIR /app

# Install uv
RUN pip install uv

# Copy project files
COPY . /app

# Install dependencies using uv
RUN uv sync

# Set environment variables
ENV PYTHONPATH=/app/src
ENV PYTHONUNBUFFERED=1

# Command to run the application
CMD ["uv", "run", "python", "-m", "mcp_hello_world"]
