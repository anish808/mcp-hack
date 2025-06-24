# MCP Observability SDK Publishing Guide

This guide covers how to officially package and publish both the Python and TypeScript SDKs for MCP Observability.

## 📋 Pre-Publishing Checklist

### 1. Update Repository Information

Before publishing, update the repository URLs in both SDKs:

```bash
# Update repository URLs (replace with your actual GitHub username and repo name)
./update-repo-urls.sh YOUR_GITHUB_USERNAME YOUR_REPO_NAME
```

### 2. Update Contact Information

Update email addresses in:
- `sdk/python/pyproject.toml` (author email)
- `sdk/typescript/package.json` (author email)

### 3. Version Management

Both SDKs are currently at version `0.1.0`. For subsequent releases:

**Python SDK** (`sdk/python/pyproject.toml`):
```toml
version = "0.1.1"  # Update this
```

**TypeScript SDK** (`sdk/typescript/package.json`):
```json
{
  "version": "0.1.1"  // Update this
}
```

## 🐍 Publishing Python SDK to PyPI

### Prerequisites

1. Create account on [PyPI](https://pypi.org) and [Test PyPI](https://test.pypi.org)
2. Install publishing tools:
   ```bash
   pip3 install build twine
   ```

### Publishing Process

#### Step 1: Test Publish

Always test first on Test PyPI:

```bash
# Test publish to Test PyPI
./publish-python-sdk.sh --test
```

#### Step 2: Verify Test Installation

```bash
# Create a virtual environment for testing
python -m venv test-env
source test-env/bin/activate

# Install from Test PyPI
pip3 install -i https://test.pypi.org/simple/ mcp-observability

# Test the installation
python3 -c "from mcp_observability import MCPObservability; print('✅ Import successful')"
```

#### Step 3: Production Publish

If everything works correctly:

```bash
# Publish to Production PyPI
./publish-python-sdk.sh
```

### Manual Publishing Steps

If you prefer manual control:

```bash
cd sdk/python

# Clean up
rm -rf dist/ build/ *.egg-info/

# Build
python3 -m build

# Check
twine check dist/*

# Upload to Test PyPI
twine upload --repository testpypi dist/*

# Upload to Production PyPI
twine upload dist/*
```

## 📦 Publishing TypeScript SDK to npm

### Prerequisites

1. Create account on [npm](https://npmjs.com)
2. Login to npm:
   ```bash
   npm login
   ```

### Publishing Process

#### Step 1: Test Build

First, ensure the package builds correctly:

```bash
cd sdk/typescript
npm install
npm run build
```

#### Step 2: Test Publish

Publish with beta tag for testing:

```bash
# Test publish with beta tag
./publish-typescript-sdk.sh --test
```

#### Step 3: Verify Test Installation

```bash
# Test installation
npm install @mcp-observability/typescript@beta

# Test in a Node.js script
node -e "const { trace } = require('@mcp-observability/typescript'); console.log('✅ Import successful');"
```

#### Step 4: Production Publish

If everything works correctly:

```bash
# Publish to Production npm
./publish-typescript-sdk.sh
```

### Manual Publishing Steps

If you prefer manual control:

```bash
cd sdk/typescript

# Install dependencies
npm install

# Build
npm run build

# Publish with beta tag
npm publish --tag beta

# Publish to production
npm publish
```

## 🔧 Automated Publishing with GitHub Actions

For automated publishing, create `.github/workflows/publish.yml`:

```yaml
name: Publish SDKs

on:
  release:
    types: [created]

jobs:
  publish-python:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-python@v4
        with:
          python-version: '3.x'
      - name: Install dependencies
        run: pip install build twine
      - name: Build and publish Python SDK
        run: |
          cd sdk/python
          python -m build
          twine upload dist/*
        env:
          TWINE_USERNAME: __token__
          TWINE_PASSWORD: ${{ secrets.PYPI_API_TOKEN }}

  publish-typescript:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          registry-url: 'https://registry.npmjs.org'
      - name: Install dependencies
        run: |
          cd sdk/typescript
          npm install
      - name: Build and publish TypeScript SDK
        run: |
          cd sdk/typescript
          npm run build
          npm publish
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

## 📝 Release Notes Template

For each release, create release notes:

```markdown
## v0.1.0 - Initial Release

### Features
- 🔍 Automatic tool tracing for Python MCP applications
- 📊 Rich metrics collection and reporting
- 🚀 Non-blocking async trace submission
- 📈 Dashboard integration for real-time monitoring

### Python SDK
- Complete decorator-based tool observability
- Comprehensive metrics tracking
- Thread-safe implementation

### TypeScript SDK
- Simple trace API for JavaScript/TypeScript applications
- Full TypeScript definitions
- Modern async/await support

### Installation
- Python: `pip install mcp-observability`
- TypeScript: `npm install @mcp-observability/typescript`
```

## 🔍 Post-Publishing Verification

After publishing, verify both packages:

### Python SDK
```bash
pip3 install mcp-observability
python3 -c "from mcp_observability import MCPObservability; print('✅ Python SDK working')"
```

### TypeScript SDK
```bash
npm install @mcp-observability/typescript
node -e "const { trace } = require('@mcp-observability/typescript'); console.log('✅ TypeScript SDK working');"
```

## 🎯 Best Practices

1. **Semantic Versioning**: Follow [semver](https://semver.org/) for version numbers
2. **Test First**: Always publish to test repositories first
3. **Release Notes**: Document changes in every release
4. **Security**: Use API tokens, never hardcode credentials
5. **Automation**: Set up CI/CD for consistent releases
6. **Documentation**: Keep README files updated with each release

## 🆘 Troubleshooting

### Common Issues

**Python SDK:**
- `twine: command not found` → Install twine: `pip install twine`
- `403 Forbidden` → Check API token permissions
- Import errors → Verify package structure

**TypeScript SDK:**
- `npm ERR! 403 Forbidden` → Check npm login status
- Build failures → Verify TypeScript configuration
- Missing types → Ensure `.d.ts` files are generated

### Getting Help

- Check package status on [PyPI](https://pypi.org/project/mcp-observability/) or [npm](https://npmjs.com/package/@mcp-observability/typescript)
- Review build logs for detailed error messages
- Test installations in clean environments 