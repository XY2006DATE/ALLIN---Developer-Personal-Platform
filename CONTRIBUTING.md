# 🤝 Contributing to ALLIN

Thank you for your interest in contributing to ALLIN! This document provides guidelines and information for contributors.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How Can I Contribute?](#how-can-i-contribute)
- [Development Setup](#development-setup)
- [Coding Standards](#coding-standards)
- [Pull Request Process](#pull-request-process)
- [Reporting Bugs](#reporting-bugs)
- [Feature Requests](#feature-requests)

## 📜 Code of Conduct

This project and everyone participating in it is governed by our Code of Conduct. By participating, you are expected to uphold this code.

### Our Standards

- Use welcoming and inclusive language
- Be respectful of differing viewpoints and experiences
- Gracefully accept constructive criticism
- Focus on what is best for the community
- Show empathy towards other community members

## 🚀 How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check the issue list as you might find out that you don't need to create one. When you are creating a bug report, please include as many details as possible:

- **Use a clear and descriptive title**
- **Describe the exact steps which reproduce the problem**
- **Provide specific examples to demonstrate the steps**
- **Describe the behavior you observed after following the steps**
- **Explain which behavior you expected to see instead and why**
- **Include details about your configuration and environment**

### Suggesting Enhancements

If you have a suggestion for a new feature or enhancement, please:

- **Use a clear and descriptive title**
- **Provide a step-by-step description of the suggested enhancement**
- **Provide specific examples to demonstrate the steps**
- **Describe the current behavior and explain which behavior you expected to see instead**

### Pull Requests

- Fork the repo and create your branch from `main`
- If you've added code that should be tested, add tests
- If you've changed APIs, update the documentation
- Ensure the test suite passes
- Make sure your code lints
- Issue that pull request!

## 🛠️ Development Setup

### Prerequisites

- Python 3.8+
- Node.js 18+
- Git

### Local Development

1. **Fork and clone the repository**
```bash
git clone https://github.com/your-username/ALLIN.git
cd ALLIN
```

2. **Set up the backend**
```bash
# Install Python dependencies
pip install -r backend/requirements.txt

# Initialize database
python backend/migrations/001_init_database.py --init
```

3. **Set up the frontend**
```bash
cd frontend
npm install
```

4. **Start the development servers**
```bash
# Terminal 1: Start backend
cd backend
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload

# Terminal 2: Start frontend
cd frontend
npm run dev
```

5. **Access the application**
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Documentation: http://localhost:8000/docs

## 📝 Coding Standards

### Python (Backend)

- Follow [PEP 8](https://www.python.org/dev/peps/pep-0008/) style guidelines
- Use type hints where appropriate
- Write docstrings for all functions and classes
- Keep functions small and focused
- Use meaningful variable and function names

```python
def calculate_user_score(user_id: int, activity_data: dict) -> float:
    """
    Calculate user score based on activity data.
    
    Args:
        user_id: The user's unique identifier
        activity_data: Dictionary containing user activity metrics
        
    Returns:
        float: Calculated user score
        
    Raises:
        ValueError: If user_id is invalid
    """
    if user_id <= 0:
        raise ValueError("Invalid user_id")
    
    # Implementation here
    return score
```

### TypeScript/JavaScript (Frontend)

- Follow [Airbnb JavaScript Style Guide](https://github.com/airbnb/javascript)
- Use TypeScript for type safety
- Use meaningful component and variable names
- Keep components small and focused
- Use proper error handling

```typescript
interface UserProfile {
  id: number;
  name: string;
  email: string;
}

const UserProfileComponent: React.FC<{ user: UserProfile }> = ({ user }) => {
  const handleUpdate = async (data: Partial<UserProfile>) => {
    try {
      // Implementation
    } catch (error) {
      console.error('Failed to update user profile:', error);
    }
  };

  return (
    <div className="user-profile">
      {/* Component JSX */}
    </div>
  );
};
```

### Git Commit Messages

Use conventional commit format:

```
type(scope): description

[optional body]

[optional footer]
```

Types:
- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation only changes
- `style`: Changes that do not affect the meaning of the code
- `refactor`: A code change that neither fixes a bug nor adds a feature
- `perf`: A code change that improves performance
- `test`: Adding missing tests or correcting existing tests
- `chore`: Changes to the build process or auxiliary tools

Examples:
```
feat(auth): add JWT token refresh functionality
fix(chat): resolve message ordering issue
docs(readme): update installation instructions
```

## 🔄 Pull Request Process

1. **Update the README.md with details of changes** if applicable
2. **Update the CHANGELOG.md** with a note describing your changes
3. **The PR will be merged once you have the sign-off** of at least one other developer

### PR Checklist

- [ ] Code follows the style guidelines of this project
- [ ] Self-review of code has been performed
- [ ] Code has been commented, particularly in hard-to-understand areas
- [ ] Corresponding changes to the documentation have been made
- [ ] Changes generate no new warnings
- [ ] Tests have been added that prove the fix is effective or that the feature works
- [ ] New and existing unit tests pass locally with my changes

## 🐛 Reporting Bugs

### Before Submitting a Bug Report

- **Check the FAQ** - You might find an answer to your question
- **Check the existing issues** - The bug might already be reported
- **Check the documentation** - The answer might be in the docs

### How Do I Submit a Good Bug Report?

Bugs are tracked as GitHub issues. Create an issue and provide the following information:

1. **Use a clear and descriptive title**
2. **Describe the exact steps which reproduce the problem**
3. **Provide specific examples to demonstrate the steps**
4. **Describe the behavior you observed after following the steps**
5. **Explain which behavior you expected to see instead and why**
6. **Include details about your configuration and environment**

### Example Bug Report

```
Title: Chat messages not displaying in dark mode

Description:
When switching to dark mode, chat messages become invisible against the dark background.

Steps to reproduce:
1. Open the chat interface
2. Switch to dark mode using the theme toggle
3. Send or receive a message
4. Observe that the message text is not visible

Expected behavior:
Messages should be visible with appropriate contrast in dark mode.

Environment:
- OS: macOS 12.0
- Browser: Chrome 96.0.4664.110
- ALLIN Version: 1.0.0
```

## 💡 Feature Requests

### Before Submitting a Feature Request

- **Check the existing issues** - The feature might already be requested
- **Check the roadmap** - The feature might already be planned
- **Check the documentation** - The feature might already exist

### How Do I Submit a Good Feature Request?

1. **Use a clear and descriptive title**
2. **Provide a step-by-step description of the suggested enhancement**
3. **Provide specific examples to demonstrate the steps**
4. **Describe the current behavior and explain which behavior you expected to see instead**
5. **Include mockups or screenshots** if applicable

## 📞 Getting Help

If you need help with contributing:

- **Check the documentation** - Most questions are answered there
- **Search existing issues** - Your question might already be answered
- **Create a new issue** - If you can't find an answer

## 🎉 Recognition

Contributors will be recognized in the following ways:

- **Contributors list** in the README
- **Release notes** for significant contributions
- **Special thanks** for major contributions

## 📄 License

By contributing to ALLIN, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to ALLIN! 🚀 