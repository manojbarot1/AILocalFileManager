# ⚡ Quick Start Guide

Get AILocalFileManager running in 5 minutes!

## Prerequisites
- Python 3.8+
- Node.js 16+
- Git
- (Optional) Ollama for local AI

## Installation (3 Steps)

### Step 1: Clone & Setup Backend
```bash
git clone https://github.com/manojbarot1/AILocalFileManager.git
cd AILocalFileManager

python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

pip install -r requirements.txt
python -m uvicorn app.main:app --reload
```

**Terminal output should show:**
```
INFO:     Uvicorn running on http://127.0.0.1:8000
```

### Step 2: Setup Frontend (New Terminal)
```bash
cd frontend
npm install
npm run dev
```

**Terminal output should show:**
```
➜  Local: http://localhost:5173/
```

### Step 3: Start Ollama (Optional - New Terminal)
```bash
# If using Ollama for local AI
ollama serve

# In another terminal, pull a model
ollama pull llama2
```

## First Run

1. **Open** http://localhost:5173 in browser
2. **Select AI Provider**: "Ollama Local" or your API key
3. **Select Model**: Auto-detected for Ollama
4. **Pick Folder**: Choose folder to analyze
5. **Click** "Start Analysis"
6. **Watch** real-time progress
7. **Go to** Suggestions tab
8. **Click** "Add Rule" to create organization rule
9. **Click** "Apply" to move files

## Example: Organize .sh Files

```bash
# Create test files
mkdir ~/test-folder
touch ~/test-folder/{script1,script2,script3}.sh

# In App:
# 1. Select ~/test-folder
# 2. Run Analysis
# 3. Go to Suggestions → Add Rule
# 4. Type: File Extensions
# 5. Extensions: .sh
# 6. Target: Scripts
# 7. Click Create Rule
# 8. Run analysis again
# 9. Click Apply
# 10. Files move to ~/test-folder/Scripts/
```

## Troubleshooting

### Backend won't start
```bash
# Check if port 8000 is free
lsof -i :8000

# Kill process if needed
kill -9 <PID>

# Or use different port
python -m uvicorn app.main:app --reload --port 8001
```

### Frontend won't load
```bash
# Clear cache
rm -rf node_modules package-lock.json
npm install
npm run dev

# Hard refresh: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)
```

### Ollama not found
```bash
# Start Ollama
ollama serve

# In new terminal, pull model
ollama pull llama2

# Verify
curl http://localhost:11434/api/tags
```

## Next Steps

- 📖 Read [Full Setup Guide](./SETUP.md)
- 📚 Check [Main README](./README.md)
- 🐛 Report [Issues](https://github.com/manojbarot1/AILocalFileManager/issues)
- 💬 Join [Discussions](https://github.com/manojbarot1/AILocalFileManager/discussions)

## Need Help?

```bash
# Check backend health
curl http://localhost:8000/health

# View API docs
open http://localhost:8000/docs

# Check logs
tail -f /tmp/backend.log
```

---

**🚀 Ready to organize your files with AI!**
