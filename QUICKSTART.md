# Quick Start Guide - AILocalFileManager

Get up and running in 5 minutes!

## Prerequisites

- Python 3.11+
- Node.js 18+
- Ollama installed
- 4GB+ RAM

## Installation (5 minutes)

### Step 1: Clone & Setup (1 min)
```bash
git clone https://github.com/yourusername/AILocalFileManager.git
cd AILocalFileManager

# Backend setup
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Frontend setup
cd frontend
npm install
cd ..
```

### Step 2: Configure (1 min)
```bash
cp .env.example .env
# Edit .env with your settings (optional - defaults work fine)
```

### Step 3: Start Ollama (1 min)
```bash
# Install Ollama from https://ollama.ai
# Pull the model:
ollama pull neural-chat:latest

# Start Ollama server (runs in background on port 11434)
ollama serve
```

### Step 4: Start Backend (1 min)
```bash
# In a new terminal
python -m uvicorn backend.app.main:app --reload --port 8000
# ✅ Backend running on http://localhost:8000
```

### Step 5: Start Frontend (1 min)
```bash
# In another terminal
cd frontend
npm run dev
# ✅ Frontend running on http://localhost:5173
```

**You're done!** 🎉

## First Use

1. **Open UI**: Go to http://localhost:5173
2. **Select Directory**: Click "Select Directory" in Explorer tab
3. **Choose Folder**: Pick any folder (start small like ~/Documents)
4. **Analyze**: Click "Analyze Files"
5. **Review**: Check suggestions with confidence scores
6. **Preview**: See what changes would be made
7. **Apply**: Click "Apply Organization"
8. **Undo if needed**: Use history to revert changes

## Common Tasks

### Analyze Downloads Folder
```bash
curl -X POST http://localhost:8000/api/v1/analyze \
  -H "Content-Type: application/json" \
  -d '{"path": "~/Downloads", "recursive": true}'
```

### Check AI Health
```bash
curl http://localhost:8000/api/v1/analysis/health
```

### Build for Production
```bash
# Backend
python -m PyInstaller --onefile backend/app/main.py

# Frontend (Electron)
cd frontend
npm run electron-build
```

## Troubleshooting

### Issue: "Ollama connection refused"
```bash
# Make sure Ollama is running
ollama serve

# Or check if it's already running
curl http://localhost:11434/api/tags
```

### Issue: "Model not found"
```bash
# Pull the model
ollama pull neural-chat:latest
```

### Issue: "Port already in use"
```bash
# Change port in .env
BACKEND_PORT=8001
```

### Issue: Analysis is slow
- Normal! First file takes time
- Ollama is running on your CPU
- Get a GPU for faster processing

## Next Steps

1. **Read the docs**: Check out ARCHITECTURE.md
2. **Create rules**: Define custom organization rules
3. **Explore insights**: See organization statistics
4. **Check settings**: Customize behavior in .env
5. **Join community**: Star the project, contribute!

## Getting Help

- 📚 [Full Documentation](README.md)
- 🏗️ [Architecture Guide](ARCHITECTURE.md)
- 🔄 [Comparison with LlamaFS](COMPARISON.md)
- 📝 [Contributing Guide](CONTRIBUTING.md)
- 🐛 [Report Issues](https://github.com/yourusername/AILocalFileManager/issues)

## Key Differences from Other Tools

✅ **100% Local** - Everything runs on your machine
✅ **Confidence Scores** - See how certain the AI is
✅ **Relationship Detection** - Understands file connections
✅ **Full Undo Support** - Revert any changes
✅ **Rule Engine** - Create custom organization rules
✅ **No Cloud** - Your files, your data

## Performance Tips

1. **Use smaller directories first** - Start with a few files
2. **Increase BATCH_SIZE** - Process more files in parallel (in .env)
3. **Close other apps** - Free up RAM for analysis
4. **SSD recommended** - Much faster than HDD
5. **GPU optional** - Set up Ollama with GPU for 10x faster

## File Organization Tips

1. **Organize by category, not date** - Easier to find
2. **Use consistent naming** - AI learns your style
3. **Create rules** - Automate future organizing
4. **Review suggestions** - Check confidence scores
5. **Start small** - Organize one directory first

## Need More Help?

```bash
# Run test analysis
python -c "
import asyncio
from backend.app.services.analyzer import FileAnalyzer

async def test():
    analyzer = FileAnalyzer()
    analysis = await analyzer.analyze_file('README.md')
    print(f'Analysis complete: {analysis.suggested_name}')

asyncio.run(test())
"
```

**Happy organizing!** 🚀

---

Made with ❤️ by the AILocalFileManager Community
