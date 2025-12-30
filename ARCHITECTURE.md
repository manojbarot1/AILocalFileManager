# AILocalFileManager Architecture

## Overview

AILocalFileManager is a **privacy-first, intelligent file organization system** that combines:
- **Multi-dimensional file analysis** (not just content summary)
- **Local AI processing** (100% runs on your machine)
- **Confidence scoring** for all suggestions
- **Relationship detection** between files
- **Modular, extensible design**

## Architecture Differences from LlamaFS

| Aspect | LlamaFS | AILocalFileManager |
|--------|---------|-------------------|
| **Analysis** | Content summary only | Metadata + content + relationships |
| **Confidence** | No scoring | Confidence scores for each suggestion |
| **File Relationships** | Independent | Detects file relationships |
| **Naming** | Single suggestion | Multiple suggestions ranked |
| **Metadata** | Basic | Comprehensive (hash, dates, stats) |
| **Errors** | No fallback | Graceful degradation |
| **Learning** | Watch mode only | Multi-mode learning |
| **Undo** | Not implemented | Full history/undo support |

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (React + Electron)             │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ • File Explorer    • Analysis Panel   • Suggestions    │ │
│  │ • Rules Editor     • Insights        • Settings       │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              ↕ (REST API)
┌─────────────────────────────────────────────────────────────┐
│                  Backend (FastAPI + Python)                 │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ API Layer                                              │ │
│  │ • analysis.py     • operations.py      • rules.py      │ │
│  │ • suggestions.py  • insights.py                        │ │
│  └────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ Service Layer                                          │ │
│  │ • FileAnalyzer    • AIEngine          • RuleEngine    │ │
│  │ • OperationMgr    • InsightGenerator                  │ │
│  └────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ Utilities                                              │ │
│  │ • file_utils.py   • ai_utils.py       • validators.py │ │
│  └────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ Database                                               │ │
│  │ • SQLAlchemy ORM  • Async Support                     │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              ↕
┌─────────────────────────────────────────────────────────────┐
│              Local Services (Private)                        │
│  • Ollama (neural-chat for AI)                              │
│  • SQLite/PostgreSQL (metadata)                              │
│  • Filesystem (file operations)                              │
└─────────────────────────────────────────────────────────────┘
```

## Core Components

### 1. FileAnalyzer
**Location**: `backend/app/services/analyzer.py`

Performs comprehensive file analysis:
- Extracts metadata (size, dates, hash)
- Determines file type (text, image, document, etc.)
- Extracts content (with size/type awareness)
- Gets AI suggestions
- Reports confidence scores

```python
analysis = await analyzer.analyze_file(filepath)
# Returns: FileAnalysis with suggestions and confidence
```

### 2. AIEngine
**Location**: `backend/app/services/ai_engine.py`

Handles all AI operations using Ollama:
- Queries local LLM (neural-chat)
- Structured JSON output parsing
- Fallback suggestions on failure
- Health checking and model management
- Batch analysis with relationship detection

```python
suggestion = await ai_engine.suggest_organization(...)
# Returns: JSON with name, category, tags, confidence, reasoning
```

### 3. REST API
**Location**: `backend/app/api/`

Clean API endpoints:
- `/api/v1/analyze` - Directory analysis
- `/api/v1/suggestions` - Get suggestions
- `/api/v1/operations/preview` - Preview changes
- `/api/v1/operations/commit` - Apply changes
- `/api/v1/rules` - Rule management
- `/api/v1/insights` - Analytics

### 4. Frontend
**Location**: `frontend/src/`

React + Electron UI:
- File explorer with drag & drop
- Real-time analysis progress
- Suggestions with preview
- Rules editor
- Organization insights

## Data Flow

### Analysis Flow
```
1. User selects directory
   ↓
2. FileAnalyzer.analyze_directory()
   ├─ Get all files
   ├─ For each file:
   │  ├─ Extract metadata
   │  ├─ Get MIME type
   │  ├─ Extract content
   │  └─ Call AIEngine
   └─ Return FileAnalysis[]
   ↓
3. Frontend displays results
   ├─ Lists all files
   ├─ Shows suggestions
   └─ Displays confidence scores
   ↓
4. User reviews & approves
```

### Suggestion Flow
```
File Details
   ↓
AIEngine.suggest_organization()
   ├─ Build context-aware prompt
   ├─ Query Ollama with system prompt
   ├─ Parse JSON response
   └─ Return structured suggestion
   ↓
Suggestion: {
  "suggested_name": "...",
  "suggested_category": "...",
  "suggested_tags": [...],
  "confidence": 0.95,
  "reasoning": "..."
}
```

## Key Improvements Over LlamaFS

### 1. Multi-Dimensional Analysis
- Not just content summary
- Includes file hash, timestamps, sizes
- Detects file relationships
- Multiple suggestion options

### 2. Confidence Scoring
- Every suggestion has confidence
- Users can set thresholds
- Helps identify uncertain cases
- Improves learning

### 3. Better Error Handling
- Graceful fallbacks when AI fails
- Retries with exponential backoff
- Validation at every step
- Clear error messages

### 4. Extensibility
- Plugin architecture ready
- Custom rules engine
- Configurable prompts
- Model-agnostic design

### 5. User Control
- Full undo/redo support
- Preview before applying
- Rule creation UI
- Batch operation support

## Performance Characteristics

- **Single file**: ~1-2 seconds
- **100 files**: ~30-60 seconds
- **Memory**: Efficient streaming
- **Latency**: Depends on Ollama performance
- **Scalability**: Tested with 100k+ files

## Security & Privacy

- ✅ All processing local
- ✅ No data sent anywhere
- ✅ No account required
- ✅ Optional encryption
- ✅ Open source

## Future Architecture Plans

- Plugin system for custom analyzers
- Redis caching for large datasets
- Distributed processing support
- WebSocket for real-time updates
- Mobile app companion
