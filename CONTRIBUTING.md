# 🤝 Contributing to AILocalFileManager

Thank you for your interest in contributing! This document provides guidelines and instructions for contributing.

## Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Welcome diverse perspectives
- Report inappropriate behavior to maintainers

## How to Contribute

### 1. Report Bugs

Found a bug? [Open an issue](https://github.com/manojbarot1/AILocalFileManager/issues/new)

**Include:**
- Clear description of the bug
- Steps to reproduce
- Expected vs actual behavior
- Screenshots if helpful
- System info (OS, Python, Node versions)
- Error messages/logs

### 2. Suggest Features

Have an idea? [Start a discussion](https://github.com/manojbarot1/AILocalFileManager/discussions)

**Include:**
- Clear description of feature
- Why you need it
- How it should work
- Any alternatives you've considered

### 3. Submit Code

#### Fork & Clone
```bash
# Fork on GitHub (click Fork button)
git clone https://github.com/YOUR-USERNAME/AILocalFileManager.git
cd AILocalFileManager
git remote add upstream https://github.com/manojbarot1/AILocalFileManager.git
```

#### Create Branch
```bash
# Update main
git fetch upstream
git checkout main
git merge upstream/main

# Create feature branch
git checkout -b feature/amazing-feature
# or
git checkout -b fix/bug-description
```

#### Make Changes
```bash
# Install dev dependencies
pip install -r requirements-dev.txt
npm install --save-dev eslint prettier

# Make your changes
# Write tests
# Update documentation

# Format code
black app/
npm run format

# Run tests
pytest tests/
npm run test

# Commit changes
git commit -m "Add amazing feature"
# or
git commit -m "Fix: description of bug fix"
```

#### Push & PR
```bash
# Push to your fork
git push origin feature/amazing-feature

# Open PR on GitHub
# Link related issues
# Describe changes
# Request review
```

## Development Setup

### Backend
```bash
# Create venv
python -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
pip install -r requirements-dev.txt

# Run tests
pytest tests/ -v

# Format code
black app/
flake8 app/
mypy app/
```

### Frontend
```bash
cd frontend

# Install dependencies
npm install

# Run dev server
npm run dev

# Run tests
npm run test

# Format code
npm run format
npm run lint
```

## Code Style

### Python
- Follow [PEP 8](https://pep8.org/)
- Use `black` for formatting
- Use `flake8` for linting
- Use type hints

```python
def analyze_files(path: str, recursive: bool = True) -> List[FileInfo]:
    """Analyze files in directory."""
    # Implementation
    pass
```

### JavaScript/React
- Follow [Airbnb Style Guide](https://github.com/airbnb/javascript)
- Use ESLint
- Use Prettier for formatting
- Use TypeScript when possible

```typescript
interface FileInfo {
  name: string
  size: number
  category: string
}

export const analyzeFiles = async (path: string): Promise<FileInfo[]> => {
  // Implementation
}
```

## Commit Messages

Use clear, descriptive commit messages:

```
feat: Add dark mode support
fix: Resolve file move issue on Windows
docs: Update setup instructions
style: Format code with prettier
refactor: Simplify analysis logic
test: Add tests for file scanning
chore: Update dependencies
```

Format:
```
<type>: <subject>

<body (optional)>

<footer (optional)>
Closes #123
```

## Pull Request Process

1. **Update main** - Sync with upstream
2. **Create feature branch** - Descriptive name
3. **Make changes** - Small, focused commits
4. **Write tests** - Test your changes
5. **Update docs** - Document features/changes
6. **Format code** - Use linters/formatters
7. **Open PR** - Clear description, reference issues
8. **Address feedback** - Respond to review comments
9. **Merge** - Maintainer will merge when approved

### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Related Issues
Closes #123

## How to Test
Steps to test the changes

## Screenshots (if applicable)
Before/after screenshots

## Checklist
- [ ] Code follows style guidelines
- [ ] Tests added/updated
- [ ] Documentation updated
- [ ] No breaking changes
- [ ] Tested locally
```

## Testing

### Backend Tests
```bash
# Run all tests
pytest tests/ -v

# Run specific test file
pytest tests/test_analysis.py -v

# Run with coverage
pytest tests/ --cov=app

# Coverage report
pytest tests/ --cov=app --cov-report=html
```

### Frontend Tests
```bash
# Run tests
npm run test

# Run with coverage
npm run test -- --coverage

# Watch mode
npm run test -- --watch
```

## Documentation

### Code Comments
```python
# Bad
x = file_size / 1024  # divide by 1024

# Good
# Convert bytes to kilobytes
size_kb = file_size / 1024
```

### Docstrings
```python
def move_files(files: List[FileInfo], target: str) -> int:
    """
    Move files to target directory.
    
    Args:
        files: List of files to move
        target: Target directory path
        
    Returns:
        Number of files successfully moved
        
    Raises:
        FileNotFoundError: If target directory doesn't exist
    """
```

### README Updates
- Update [README.md](./README.md) if adding features
- Update [SETUP.md](./SETUP.md) if changing setup
- Add examples for new features
- Update table of contents

## CI/CD

All PRs are checked for:
- ✅ Tests pass
- ✅ Code style compliant
- ✅ No breaking changes
- ✅ Documentation updated

## Release Process

Maintainers will handle releases:

1. Update version in `package.json` and `setup.py`
2. Update `CHANGELOG.md`
3. Tag release: `git tag v1.0.0`
4. Push tag: `git push origin v1.0.0`
5. Create GitHub release
6. Publish to PyPI/npm

## Questions?

- 📖 Check [README.md](./README.md)
- 📚 Read [SETUP.md](./SETUP.md)
- 💬 Join [Discussions](https://github.com/manojbarot1/AILocalFileManager/discussions)
- 🐛 Search [Issues](https://github.com/manojbarot1/AILocalFileManager/issues)

---

**Thank you for contributing to AILocalFileManager!** 🙌
