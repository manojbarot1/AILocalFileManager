# 🧠 AILocalFileManager

**Intelligent Privacy-First File Organization with AI**

An advanced file management system that uses AI to automatically categorize, organize, and manage your local files. Supports multiple AI providers (Ollama, OpenAI, Claude, Grok, Gemini) with custom rules for personalized organization.

![Status](https://img.shields.io/badge/Status-Production%20Ready-brightgreen)
![License](https://img.shields.io/badge/License-MIT-blue)
![Python](https://img.shields.io/badge/Python-3.8%2B-blue)
![React](https://img.shields.io/badge/React-18%2B-blue)

---

## ✨ Features

### 🤖 Multi-AI Provider Support
- **Ollama Local** - Run models locally, no API keys needed
- **OpenAI** - Use GPT-4, GPT-3.5 Turbo
- **Claude** - Anthropic's Claude models
- **Grok** - xAI's Grok models
- **Google Gemini** - Free tier available
- **Custom API** - Any OpenAI-compatible endpoint

### 📁 Smart File Organization
- **Real-time Analysis** - Stream analysis with live progress
- **AI Categorization** - Automatically categorizes files
- **Confidence Scores** - Shows AI confidence for each file
- **Custom Rules** - Create rules for automatic organization:
  - **File Extensions** (.ps1, .bat, etc)
  - **Filename Patterns** (regex support)
  - **Folder Matching** (path-based)

### 💡 Intelligent Suggestions
- **AI Suggestions** - Smart organization recommendations
- **Custom Rules** - Apply your own organization rules
- **Matching Files** - Shows exact files that match rules
- **Direct Apply** - Move files immediately from suggestions
- **Export Plans** - Save action plans for reference

### 🔒 Privacy First
- **Local Analysis** - Choose local AI models
- **No Cloud Required** - Run everything locally
- **API Keys Optional** - Only for cloud providers you choose
- **Secure Storage** - Browser localStorage, no external uploads

### ⚡ Real-time Features
- **Live Progress** - See files being analyzed in real-time
- **File Streaming** - Process large directories efficiently
- **Status Updates** - Current file, progress percentage, file count
- **Error Handling** - Graceful error recovery

---

## 🚀 Quick Start

### Prerequisites
- **Python** 3.8+
- **Node.js** 16+
- **npm** or **yarn**
- **Ollama** (optional, for local AI) - [Download](https://ollama.ai)

### Installation

#### 1. Clone Repository
```bash
git clone https://github.com/manojbarot1/AILocalFileManager.git
cd AILocalFileManager
```

#### 2. Backend Setup
```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run backend
python -m uvicorn app.main:app --reload
```

Backend runs on: `http://localhost:8000`

#### 3. Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Run frontend
npm run dev
```

Frontend runs on: `http://localhost:5173`

#### 4. Start Ollama (Optional - For Local AI)
```bash
ollama serve
```

Ollama runs on: `http://localhost:11434`

### First Run
1. Open http://localhost:5173
2. Select an AI provider (Ollama recommended for local)
3. Select a model
4. Choose a folder to analyze
5. Click "Start Analysis"
6. Watch real-time progress
7. Go to Suggestions to see organization recommendations
8. Apply rules to move files

---

## 📖 Complete Setup Guide

### System Architecture

```
┌─────────────────────────────────────────────┐
│         React Frontend (5173)               │
│  - File browser & selection                 │
│  - Real-time progress display              │
│  - Suggestions & custom rules               │
│  - Direct file operations                   │
└────────────────┬────────────────────────────┘
                 │ API Calls
                 ▼
┌─────────────────────────────────────────────┐
│      FastAPI Backend (8000)                 │
│  - File scanning & analysis                 │
│  - AI provider integration                  │
│  - Move operations                          │
│  - Real-time streaming (SSE)                │
└────────────────┬────────────────────────────┘
                 │ Requests
                 ▼
┌─────────────────────────────────────────────┐
│          AI Providers                       │
│  ├── Ollama (Local)                        │
│  ├── OpenAI (Cloud)                        │
│  ├── Claude (Cloud)                        │
│  ├── Grok (Cloud)                          │
│  └── Gemini (Cloud)                        │
└─────────────────────────────────────────────┘
```

### Backend Setup Details

#### Requirements (requirements.txt)
```
fastapi==0.104.1
uvicorn==0.24.0
pydantic==2.5.0
python-multipart==0.0.6
aiohttp==3.9.1
requests==2.31.0
```

#### API Endpoints

**Analyze Files**
```
POST /api/v1/analyze
Body: {
  "path": "/path/to/folder",
  "recursive": true,
  "provider": "ollama",
  "model": "llama2"
}
Response: Server-Sent Events (real-time progress)
```

**Move Files**
```
POST /api/v1/move-files
Body: {
  "files": [
    {
      "path": "/path/to/file.sh",
      "suggested_category": "Scripts"
    }
  ],
  "base_path": "/path/to/folder"
}
Response: {
  "success": true,
  "moved": 4,
  "errors": []
}
```

### Frontend Setup Details

#### Key Components

**AnalysisPanel.tsx**
- File selection and analysis
- AI provider selection
- Model selection
- Real-time progress tracking
- File results display

**SuggestionsPanel.tsx**
- Custom rules management
- AI suggestions display
- Matching files listing
- Direct file operations (Apply/Export)

**AIProviderSelector.tsx**
- Multi-provider support
- Auto-detection (Ollama)
- API key management
- Model selection

**FileResultsTable.tsx**
- Sortable results
- Multi-select
- Category visualization
- Bulk operations

#### Data Flow

```
1. User selects folder
   ↓
2. User selects AI provider & model
   ↓
3. Click "Start Analysis"
   ↓
4. Backend scans files (recursive)
   ↓
5. For each file, send to AI provider
   ↓
6. Stream progress via SSE
   ↓
7. Store results in localStorage
   ↓
8. Display in FileResultsTable
   ↓
9. User creates custom rules
   ↓
10. Rules applied to results
    ↓
11. Show suggestions
    ↓
12. User clicks "Apply"
    ↓
13. Files move to target folders
    ↓
14. Success message
```

---

## 🎯 Usage Guide

### Basic Analysis

1. **Select AI Provider**
   - Choose from Ollama, OpenAI, Claude, Grok, Gemini
   - If local: no API key needed
   - If cloud: paste your API key

2. **Select Model**
   - Ollama: auto-detects available models
   - Cloud: shows available models for provider

3. **Select Folder**
   - Click "Select Folder"
   - Choose directory to analyze

4. **Run Analysis**
   - Click "Start Analysis"
   - Watch real-time progress
   - See current file, count, percentage

5. **Review Results**
   - See all files with AI categories
   - Expand rows for details
   - Sort by name, size, category

### Creating Custom Rules

1. **From Suggestions Tab**
   - Click "Add Rule" button

2. **Fill Form**
   - **Rule Type**: Choose from:
     - File Extensions (e.g., .ps1, .bat)
     - Filename Pattern (regex, e.g., .*backup.*)
     - Folder Contains (path, e.g., /Downloads/)
   - **Title**: Name your rule
   - **Description**: What it does
   - **Extensions/Pattern**: Match criteria
   - **Target Folder**: Where files move
   - **Priority**: High/Medium/Low

3. **Create Rule**
   - Click "Create Rule"
   - Rule saved to browser

### Applying Suggestions

1. **Run Analysis**
   - Analyze your folder

2. **Go to Suggestions**
   - Click "Suggestions" tab

3. **See Suggestions**
   - Your custom rules shown
   - Shows matched file count
   - Lists all matching files

4. **Select & Apply**
   - Check suggestion checkbox
   - Click "Apply 1 Selected"
   - Files move to target folder

5. **Success**
   - See confirmation message
   - Files organized!

### Example: Organize PowerShell Scripts

**Rule Setup:**
```
Title: Move PowerShell Scripts
Rule Type: File Extensions
Extensions: .ps1
Target Folder: PowerShellScripts
Priority: High
Time: 5 min
```

**After Analysis:**
- Rule finds all .ps1 files
- Shows as suggestion: "Move PowerShell Scripts (Found 4 files)"
- Lists matched files:
  - script.ps1
  - install.ps1
  - deploy.ps1
  - configure.ps1

**Apply:**
- Check checkbox
- Click "Apply"
- All 4 files move to PowerShellScripts folder

---

## 🔧 Configuration

### Backend Environment

Create `app/.env`:
```
# Optional: For cloud providers
OPENAI_API_KEY=your_key_here
ANTHROPIC_API_KEY=your_key_here
XAI_API_KEY=your_key_here
GOOGLE_API_KEY=your_key_here

# Backend settings
DEBUG=False
LOG_LEVEL=INFO
```

### Frontend Configuration

`.env.local` in frontend:
```
VITE_API_URL=http://localhost:8000
VITE_OLLAMA_URL=http://localhost:11434
```

---

## 🤖 AI Provider Setup

### Ollama (Recommended - Local & Free)

**Installation:**
```bash
# macOS
brew install ollama

# Linux
curl https://ollama.ai/install.sh | sh

# Windows
# Download from https://ollama.ai
```

**Run:**
```bash
ollama serve
```

**Pull Models:**
```bash
ollama pull llama2
ollama pull mistral
ollama pull neural-chat
```

**In App:**
- Provider: Ollama Local
- No API key needed
- Models auto-detected

### OpenAI

**Get API Key:**
1. Visit https://platform.openai.com/api-keys
2. Create new secret key
3. Copy key

**In App:**
- Provider: OpenAI
- Paste API key
- Select model (GPT-4, GPT-3.5)

### Claude (Anthropic)

**Get API Key:**
1. Visit https://console.anthropic.com/
2. Create API key
3. Copy key

**In App:**
- Provider: Claude
- Paste API key
- Select model (Opus, Sonnet, Haiku)

### Grok (xAI)

**Get API Key:**
1. Visit https://console.x.ai/
2. Create API key
3. Copy key

**In App:**
- Provider: Grok
- Paste API key
- Select model (Grok-2)

### Google Gemini

**Get API Key:**
1. Visit https://aistudio.google.com/app/apikey
2. Create API key
3. Copy key

**In App:**
- Provider: Google Gemini
- Paste API key
- Select model (Gemini Pro)

---

## 📊 Project Structure

```
AILocalFileManager/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI app setup
│   │   ├── api/
│   │   │   ├── routes.py        # API endpoints
│   │   │   └── analysis.py      # File analysis logic
│   │   ├── services/
│   │   │   ├── ai_provider.py   # AI provider integration
│   │   │   ├── file_scanner.py  # File scanning
│   │   │   └── file_operations.py # Move files
│   │   └── models/
│   │       └── schemas.py       # Data models
│   ├── requirements.txt
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── AnalysisPanel.tsx
│   │   │   ├── SuggestionsPanel.tsx
│   │   │   ├── AIProviderSelector.tsx
│   │   │   └── FileResultsTable.tsx
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css
│   ├── package.json
│   ├── vite.config.ts
│   └── .env.local
└── README.md
```

---

## 🧪 Testing

### Backend Tests
```bash
cd backend
pytest tests/
```

### Frontend Tests
```bash
cd frontend
npm run test
```

### Manual Testing

**Test 1: Local Analysis**
```
1. Start Ollama: ollama serve
2. App: Select Ollama provider
3. Select folder with 10-20 files
4. Analyze
5. Should see all files categorized
```

**Test 2: Custom Rules**
```
1. Create rule: .txt files → Documents
2. Run analysis
3. Go to Suggestions
4. Should see rule with matched .txt files
5. Apply
6. Files should move to Documents folder
```

**Test 3: Cloud Provider**
```
1. Add OpenAI API key
2. Select OpenAI provider
3. Run analysis
4. Should use OpenAI model
5. Results should be accurate
```

---

## 🐛 Troubleshooting

### Analysis Shows No Files

**Problem:** Analysis completes but shows 0 files

**Solutions:**
1. Check folder path is correct
2. Ensure folder has files
3. Check file permissions (readable)
4. Try smaller folder first
5. Check backend logs

### Custom Rules Not Matching

**Problem:** Created rule but "Found 0 matching files"

**Solutions:**
1. Verify file extensions: use `.ps1` not `ps1`
2. For patterns: test regex at regex101.com
3. Run analysis AFTER creating rule
4. Check Extensions field spelling
5. Files might not exist in folder

### AI Provider Connection Failed

**Problem:** "Cannot connect to provider"

**Solutions:**

**Ollama:**
- Verify running: `curl http://localhost:11434/api/tags`
- Start with: `ollama serve`
- Check port 11434 is open

**OpenAI:**
- Verify API key is correct
- Check key has permissions
- Ensure not expired

**Claude:**
- Verify API key format
- Check at console.anthropic.com
- Ensure account has credits

### Files Not Moving

**Problem:** Apply button doesn't move files

**Solutions:**
1. Check folder has write permissions
2. Ensure target folder exists or auto-create enabled
3. Check file paths are valid
4. Look at backend logs for errors
5. Try with small set of files first

### Backend Won't Start

**Problem:** `Connection refused` or `Port already in use`

**Solutions:**
```bash
# Check if port 8000 is in use
lsof -i :8000

# Kill process using port
kill -9 <PID>

# Or use different port
python -m uvicorn app.main:app --port 8001 --reload
```

### Frontend Won't Load

**Problem:** Blank page or CORS error

**Solutions:**
```bash
# Clear cache
rm -rf node_modules package-lock.json
npm install

# Hard refresh browser
Cmd+Shift+R (Mac)
Ctrl+Shift+R (Windows)

# Check API URL
echo $VITE_API_URL

# Check backend is running
curl http://localhost:8000/docs
```

---

## 📝 API Documentation

### Swagger UI
After backend starts, visit: `http://localhost:8000/docs`

### REST Endpoints

#### GET /health
Health check
```bash
curl http://localhost:8000/health
```

#### POST /api/v1/analyze
Analyze files with streaming
```bash
curl -X POST http://localhost:8000/api/v1/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "path": "/path/to/folder",
    "recursive": true,
    "provider": "ollama",
    "model": "llama2"
  }'
```

#### POST /api/v1/move-files
Move files to target folders
```bash
curl -X POST http://localhost:8000/api/v1/move-files \
  -H "Content-Type: application/json" \
  -d '{
    "files": [
      {"path": "/file.sh", "suggested_category": "Scripts"}
    ],
    "base_path": "/path"
  }'
```

---

## 🤝 Contributing

We welcome contributions! Please:

1. Fork repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Make changes
4. Test thoroughly
5. Commit: `git commit -m 'Add amazing feature'`
6. Push: `git push origin feature/amazing-feature`
7. Open Pull Request

---

## 📄 License

This project is licensed under the MIT License - see LICENSE file for details.

---

## 🙋 Support

### Issues
Found a bug? [Open an issue](https://github.com/manojbarot1/AILocalFileManager/issues)

### Questions
Have questions? Check:
- [Discussions](https://github.com/manojbarot1/AILocalFileManager/discussions)
- [Documentation](#-complete-setup-guide)
- [Troubleshooting](#-troubleshooting)

### Feature Requests
[Request a feature](https://github.com/manojbarot1/AILocalFileManager/issues)

---

## 🙏 Acknowledgments

- FastAPI for excellent async framework
- React for beautiful UI
- All AI providers (Ollama, OpenAI, Anthropic, xAI, Google)
- Community contributions

---

## 📚 Related

- [Ollama](https://ollama.ai) - Local LLMs
- [FastAPI](https://fastapi.tiangolo.com/) - Python framework
- [React](https://react.dev/) - UI library
- [Vite](https://vitejs.dev/) - Build tool

---

**Made with ❤️ by [Manoj Barot](https://github.com/manojbarot1)**

⭐ If you find this useful, please star the repository!
