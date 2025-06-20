FROM python:3.12-slim

# Install uv
COPY --from=ghcr.io/astral-sh/uv:latest /uv /bin/uv

# Set working directory
WORKDIR /app

# Copy project files
COPY examples/hello-world/pyproject.toml examples/hello-world/uv.lock ./
COPY examples/hello-world/minimal-server.py ./
COPY sdk ./sdk

# Install dependencies
RUN uv sync

# Set environment variables
ENV PYTHONPATH=/app/sdk/python
ENV PATH="/app/.venv/bin:$PATH"

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000/ || exit 1

CMD ["uv", "run", "python", "minimal-server.py"] 