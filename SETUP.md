# 📖 AILocalFileManager - Complete Setup Guide

Complete step-by-step guide to get AILocalFileManager running on your system.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Installation](#installation)
3. [Configuration](#configuration)
4. [Running the Application](#running-the-application)
5. [First Run](#first-run)
6. [Common Issues](#common-issues)

---

## Prerequisites

### Required
- **Python** 3.8 or higher ([Download](https://www.python.org/downloads/))
- **Node.js** 16 or higher ([Download](https://nodejs.org/))
- **npm** or **yarn** (comes with Node.js)
- **Git** ([Download](https://git-scm.com/))

### Optional but Recommended
- **Ollama** for local AI ([Download](https://ollama.ai))
- **VS Code** for code editing ([Download](https://code.visualstudio.com/))

### System Requirements
- **Disk Space**: 2GB minimum
- **RAM**: 4GB minimum (8GB for multiple models)
- **Internet**: Required for cloud AI providers, optional for Ollama

---

## Installation

### Step 1: Clone Repository

```bash
# Clone the repository
git clone https://github.com/manojbarot1/AILocalFileManager.git

# Navigate to project
cd AILocalFileManager
```

### Step 2: Backend Setup

#### Option A: Using Python venv (Recommended)

```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
# On macOS/Linux:
source venv/bin/activate

# On Windows:
venv\Scripts\activate

# Verify activation (should show (venv) prefix)
which python  # or 'where python' on Windows
```

#### Option B: Using Conda

```bash
# Create conda environment
conda create -n ailocalfile python=3.11

# Activate environment
conda activate ailocalfile
```

#### Install Python Dependencies

```bash
# Make sure you're in the project root
cd AILocalFileManager

# Install dependencies
pip install -r requirements.txt

# Verify installation
python -c "import fastapi; print(fastapi.__version__)"
```

**Expected output:** `0.104.1` (or similar version)

### Step 3: Frontend Setup

```bash
# Navigate to frontend
cd frontend

# Install Node dependencies
npm install

# Verify installation
npm --version
node --version
```

**Expected:** npm 8+, node 16+

### Step 4: Optional - Install Ollama

For local AI without API keys:

```bash
# macOS (Intel)
brew install ollama

# macOS (Apple Silicon)
brew install ollama

# Linux
curl https://ollama.ai/install.sh | sh

# Windows
# Download from https://ollama.ai/download/windows
# Run installer
```

**Verify Ollama installation:**
```bash
ollama --version
```

---

## Configuration

### Backend Configuration

#### Step 1: Create Environment File

```bash
# From project root
touch app/.env
```

#### Step 2: Add Configuration (Optional)

Open `app/.env` and add:

```env
# AI Provider API Keys (only add what you use)
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
XAI_API_KEY=...
GOOGLE_API_KEY=...

# Server Configuration
DEBUG=False
LOG_LEVEL=INFO
CORS_ORIGINS=["http://localhost:5173","http://localhost:3000"]

# Backend Port (default: 8000)
BACKEND_PORT=8000
```

**Note:** You only need API keys for cloud providers you plan to use.

### Frontend Configuration

#### Step 1: Create Environment File

```bash
# From frontend directory
touch .env.local
```

#### Step 2: Add Configuration

Open `frontend/.env.local` and add:

```env
# Backend API URL
VITE_API_URL=http://localhost:8000

# Ollama URL (if using Ollama)
VITE_OLLAMA_URL=http://localhost:11434

# Environment
VITE_ENV=development
```

---

## Running the Application

### Terminal Setup

Open 3 separate terminals in the project directory:

```
Terminal 1: Backend
Terminal 2: Frontend
Terminal 3: Ollama (optional)
```

### Option A: Start Everything

#### Terminal 1: Backend

```bash
# From project root (with venv activated)
python -m uvicorn app.main:app --reload --port 8000

# Expected output:
# INFO:     Uvicorn running on http://127.0.0.1:8000
# INFO:     Application startup complete
```

#### Terminal 2: Frontend

```bash
# From project/frontend directory
npm run dev

# Expected output:
# VITE v4.x.x  ready in xxx ms
# ➜  Local:   http://localhost:5173/
```

#### Terminal 3: Ollama (Optional)

```bash
# Start Ollama (if using local AI)
ollama serve

# Expected output:
# time=... level=INFO msg="Listening on 127.0.0.1:11434 (version ...)"
```

### Option B: Using Docker (Alternative)

```bash
# Build images
docker-compose build

# Start all services
docker-compose up

# Services will be available at:
# Frontend: http://localhost:5173
# Backend: http://localhost:8000
# Ollama: http://localhost:11434 (if added to docker-compose.yml)
```

### Access the Application

Open your browser and go to:

```
http://localhost:5173
```

You should see the AILocalFileManager interface!

---

## First Run

### Step 1: Verify Backend

In your browser, open:
```
http://localhost:8000/docs
```

You should see the Swagger API documentation. This confirms the backend is running.

### Step 2: Verify Ollama (if using)

In terminal, run:
```bash
curl http://localhost:11434/api/tags
```

Should return available models in JSON format.

### Step 3: Pull Ollama Model

If using Ollama, pull a model first:

```bash
# In Terminal 3 (or new terminal)
ollama pull llama2

# Or other models:
ollama pull mistral
ollama pull neural-chat
ollama pull dolphin-mixtral
```

### Step 4: First Analysis

1. **Open** http://localhost:5173
2. **Select AI Provider**:
   - Choose "Ollama Local" if using Ollama
   - Or select cloud provider and add API key
3. **Select Model**: Should auto-detect for Ollama
4. **Select Folder**: Choose a folder with 10-20 files
5. **Run Analysis**: Click "Start Analysis"
6. **Watch Progress**: See real-time file analysis
7. **Review Results**: See all files categorized
8. **Create Custom Rule**: Click "Suggestions" → "Add Rule"
9. **Apply Organization**: Click "Apply" to move files

### Step 5: Create Your First Rule

1. **Go to Suggestions tab**
2. **Click "Add Rule"**
3. **Fill Form**:
   - Title: "Organize PowerShell"
   - Type: File Extensions
   - Extensions: `.ps1`
   - Target: `PowerShellScripts`
4. **Create Rule**
5. **Run Analysis Again**
6. **See Rule Suggestions**
7. **Click Apply** to organize

---

## Common Issues & Solutions

### Issue: "Backend Connection Refused"

```
Error: connect ECONNREFUSED 127.0.0.1:8000
```

**Solutions:**
```bash
# 1. Check if backend is running
curl http://localhost:8000/health

# 2. Start backend
python -m uvicorn app.main:app --reload

# 3. Check port is free
lsof -i :8000

# 4. Use different port
python -m uvicorn app.main:app --reload --port 8001
```

### Issue: "Ollama Not Found"

```
Error: Cannot connect to Ollama at http://localhost:11434
```

**Solutions:**
```bash
# 1. Verify Ollama is running
curl http://localhost:11434/api/tags

# 2. Start Ollama
ollama serve

# 3. Check Ollama installation
ollama --version

# 4. Reinstall Ollama (if needed)
# Download from https://ollama.ai
```

### Issue: "No Models Available"

```
Provider: Ollama - No models available
```

**Solutions:**
```bash
# 1. Pull a model
ollama pull llama2

# 2. Check available models
ollama list

# 3. Pull alternative model
ollama pull mistral

# Recommended models for file analysis:
# - llama2 (7B, good balance)
# - mistral (7B, faster)
# - neural-chat (7B, optimized)
```

### Issue: "API Key Invalid"

```
Error: Invalid API key for OpenAI
```

**Solutions:**
1. **Verify API Key Format**
   - OpenAI: Starts with `sk-`
   - Claude: Starts with `sk-ant-`
   - Grok: Starts with `xai-`
   - Gemini: Should be valid UUID

2. **Check API Key Permissions**
   - Log into provider dashboard
   - Verify key is active
   - Check usage limits

3. **Regenerate Key**
   - Delete old key
   - Create new key
   - Copy full key (don't share)

### Issue: "Modules Not Found"

```
ModuleNotFoundError: No module named 'fastapi'
```

**Solutions:**
```bash
# 1. Verify venv is activated
which python  # Should show venv path

# 2. Reinstall dependencies
pip install -r requirements.txt

# 3. Check requirements.txt exists
ls -la requirements.txt

# 4. Upgrade pip
pip install --upgrade pip
```

### Issue: "Port Already in Use"

```
ERROR: [Errno 48] Address already in use
```

**Solutions:**
```bash
# 1. Find process using port
lsof -i :8000

# 2. Kill process
kill -9 <PID>

# 3. Use different port
python -m uvicorn app.main:app --reload --port 8001

# 4. Check what's running
ps aux | grep python
```

### Issue: "Files Not Moving"

```
Files selected but don't move after Apply
```

**Solutions:**
```bash
# 1. Check folder permissions
ls -la /path/to/folder

# 2. Verify target folder
mkdir -p ~/Documents/Scripts

# 3. Check disk space
df -h

# 4. Check backend logs for errors
# Look at Terminal 1 output

# 5. Verify file paths
echo "Files exist:"
ls -la ~/Documents/*.sh
```

### Issue: "React Module Errors"

```
[plugin:vite:import-analysis] Failed to resolve import
```

**Solutions:**
```bash
# 1. Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install

# 2. Check Node version
node --version  # Should be 16+

# 3. Upgrade npm
npm install -g npm@latest

# 4. Clear npm cache
npm cache clean --force
```

---

## Environment Variables Reference

### Backend (.env)

| Variable | Default | Purpose |
|----------|---------|---------|
| `DEBUG` | False | Enable debug mode |
| `LOG_LEVEL` | INFO | Logging level |
| `BACKEND_PORT` | 8000 | Server port |
| `OPENAI_API_KEY` | - | OpenAI API key |
| `ANTHROPIC_API_KEY` | - | Claude API key |
| `XAI_API_KEY` | - | Grok API key |
| `GOOGLE_API_KEY` | - | Gemini API key |

### Frontend (.env.local)

| Variable | Default | Purpose |
|----------|---------|---------|
| `VITE_API_URL` | http://localhost:8000 | Backend URL |
| `VITE_OLLAMA_URL` | http://localhost:11434 | Ollama URL |
| `VITE_ENV` | development | Environment |

---

## Development Tips

### Frontend Development

```bash
# Install Tailwind (already included)
npm install -D tailwindcss

# Format code
npm run format

# Lint code
npm run lint

# Build for production
npm run build
```

### Backend Development

```bash
# Install dev dependencies
pip install pytest pytest-cov

# Run tests
pytest tests/

# Format code
black app/

# Lint code
flake8 app/
```

### Useful Commands

```bash
# View backend logs
tail -f /tmp/backend.log

# View frontend build
npm run build -- --outDir dist

# Test API endpoints
curl http://localhost:8000/api/v1/analyze \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"path":"/home/user/Documents","provider":"ollama","model":"llama2"}'

# Check all ports in use
lsof -i -P -n | grep LISTEN
```

---

## Performance Optimization

### Backend

```python
# app/config.py
ANALYSIS_BATCH_SIZE = 10
STREAM_CHUNK_SIZE = 5
MAX_WORKERS = 4
```

### Frontend

```javascript
// vite.config.js
export default {
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': ['react', 'framer-motion']
        }
      }
    }
  }
}
```

### Ollama

```bash
# Use GPU if available
export OLLAMA_NUM_GPU=1

# Increase context window
ollama run llama2 --context_size 4096

# Reduce model download size
ollama pull mistral  # 7B model (faster)
```

---

## Next Steps

1. ✅ Installation complete
2. ✅ Backend running on 8000
3. ✅ Frontend running on 5173
4. ✅ First analysis complete

**Now:**
- Create custom rules for your files
- Explore different AI providers
- Test on your real file folders
- Contribute improvements!

---

## Getting Help

### Documentation
- [Main README](./README.md)
- [API Docs](http://localhost:8000/docs)
- [GitHub Issues](https://github.com/manojbarot1/AILocalFileManager/issues)

### Community
- [Discussions](https://github.com/manojbarot1/AILocalFileManager/discussions)
- [Stack Overflow Tag](https://stackoverflow.com/questions/tagged/ailocalfilemanager)

### Support
- Check [Troubleshooting](#common-issues--solutions) section
- Search existing issues
- Create new issue with:
  - Error message
  - Steps to reproduce
  - System info (OS, Python, Node versions)

---

**Happy organizing with AI!** 🚀
