# Contributing to AILocalFileManager

Thank you for your interest in contributing! Here's how you can help.

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/yourusername/AILocalFileManager.git`
3. Create a feature branch: `git checkout -b feature/your-feature`

## Development Setup

```bash
# Install backend dependencies
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Install frontend dependencies
cd frontend
npm install

# Set up Ollama
ollama pull neural-chat:latest
```

## Code Standards

### Python
- Format code with `black`
- Lint with `flake8`
- Type hints required
- Docstrings for all functions

### TypeScript/React
- Use functional components with hooks
- Type all props with TypeScript
- Follow ESLint rules
- Components in separate files

## Testing

```bash
# Backend
pytest tests/ -v --cov=app

# Frontend
npm test
```

## Submitting Changes

1. Commit with clear messages: `git commit -m "feat: description"`
2. Push to your fork
3. Open a Pull Request
4. Link related issues
5. Describe changes clearly

## Pull Request Checklist

- [ ] Tested locally
- [ ] Code follows style guidelines
- [ ] Tests pass
- [ ] Documentation updated
- [ ] No unnecessary dependencies added

## Bug Reports

Include:
- Steps to reproduce
- Expected behavior
- Actual behavior
- Environment details
- Relevant logs

## Feature Requests

Describe:
- Use case
- Expected behavior
- Why it's useful

## Questions?

- Open a discussion
- Check existing issues
- Join our community

Thanks for contributing! 🚀
