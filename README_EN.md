# 🚀 ALLIN - Developer Personal Platform

<div align="center">

![ALLIN Logo](https://img.shields.io/badge/ALLIN-Developer%20Platform-blue?style=for-the-badge&logo=github)

**A Modern AI Chat and Development Tools Integration Platform**

[![Python](https://img.shields.io/badge/Python-3.8+-blue.svg)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.104.1-green.svg)](https://fastapi.tiangolo.com)
[![Next.js](https://img.shields.io/badge/Next.js-14.0.0-black.svg)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-18-blue.svg)](https://reactjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue.svg)](https://typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-3.3.0-38B2AC.svg)](https://tailwindcss.com)
[![License: AGPL v3](https://img.shields.io/badge/License-AGPL%20v3-blue.svg)](https://www.gnu.org/licenses/agpl-3.0)

[English](./README_EN.md) | [中文](./README.md)

</div>

---

## 📖 Project Introduction

ALLIN is a modern AI chat and development tools integration platform designed specifically for developers. It integrates multiple AI models to provide developers with a one-stop AI-assisted development experience.

### ✨ Core Features

- 🤖 **Multi-Model Support** - Integrates various AI models, supporting local and remote models
- 💬 **Smart Chat** - Intelligent dialogue with context memory support
- 🎨 **Modern UI** - Responsive interface based on Next.js and Tailwind CSS
- 🌙 **Dark Mode** - Support for light/dark theme switching
- 📱 **Responsive Design** - Adapts to desktop and mobile devices
- 🔐 **User Authentication** - JWT token authentication system
- 📊 **Chat History** - Complete conversation history recording and management
- ⚙️ **Model Management** - Flexible model configuration and parameter adjustment

## 🏗️ Technical Architecture

### Backend Tech Stack
- **FastAPI** - High-performance Python web framework
- **SQLAlchemy** - ORM database operations
- **SQLite** - Lightweight database
- **JWT** - User authentication
- **Uvicorn** - ASGI server
- **Pydantic** - Data validation

### Frontend Tech Stack
- **Next.js 14** - React full-stack framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Animation library
- **React Hook Form** - Form management
- **Axios** - HTTP client

## 🚀 Quick Start

### Requirements

- **Python** 3.8+
- **Node.js** 18+
- **npm** or **yarn**

### Installation Steps

1. **Clone the project**
```bash
git clone https://github.com/XY2006DATE/ALLIN---Developer-Personal-Platform.git
cd ALLIN---Developer-Personal-Platform
```

2. **Install backend dependencies**
```bash
# Install Python dependencies
pip install -r backend/requirements.txt
```

3. **Install frontend dependencies**
```bash
# Enter frontend directory
cd frontend
npm install
```

4. **Initialize database**
```bash
# Return to project root
cd ..
# Initialize database
python backend/migrations/001_init_database.py --init
```

5. **Start services**

**Method 1: Using startup scripts (Recommended)**
```bash
# Start backend (new terminal)
./start_backend.sh

# Start frontend (new terminal)
./start_frontend.sh
```

**Method 2: Manual startup**
```bash
# Start backend
cd backend
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload

# Start frontend (new terminal)
cd frontend
npm run dev
```

6. **Access the application**
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Documentation: http://localhost:8000/docs

## 📁 Project Structure

```
ALLIN/
├── backend/                 # Backend code
│   ├── api/                # API routes
│   │   ├── auth.py         # Authentication
│   │   ├── agent.py        # AI agent
│   │   ├── model.py        # Model management
│   │   ├── settings.py     # Settings
│   │   ├── debug.py        # Debug
│   │   ├── remote.py       # Remote chat
│   │   ├── user.py         # User
│   │   └── history.py      # Chat history
│   ├── core/               # Core configuration
│   ├── crud/               # Database operations
│   ├── database/           # Database configuration
│   ├── models/             # Data models
│   ├── schemas/            # Data validation
│   └── migrations/         # Database migrations
├── frontend/               # Frontend code
│   ├── app/                # Next.js pages
│   ├── components/         # React components
│   ├── contexts/           # React contexts
│   └── lib/                # Utility libraries
├── uploads/                # File upload directory
├── start_backend.sh        # Backend startup script
├── start_frontend.sh       # Frontend startup script
└── README.md              # Project documentation
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the project root:

```env
# Database configuration
DATABASE_URL=sqlite:///allin.db

# JWT configuration
SECRET_KEY=your-secret-key-here-change-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Application configuration
APP_NAME=ALLIN Backend
DEBUG=true
```

### Database Management

```bash
# Initialize database
python backend/migrations/001_init_database.py --init

# Check database status
python backend/migrations/001_init_database.py --check

# Reset database (delete all data)
python backend/migrations/001_init_database.py --reset
```

## 🎯 Feature Modules

### User Authentication
- User registration and login
- JWT token authentication
- Password encryption storage
- User information management

### AI Chat
- Multi-model conversation support
- Context memory functionality
- Chat history recording
- Message export functionality

### Model Management
- Local model configuration
- Remote model integration
- Model parameter adjustment
- Model performance monitoring

## 🔌 API Endpoints

### Authentication Endpoints
- `POST /api/register` - User registration
- `POST /api/login` - User login
- `POST /api/logout` - User logout

### Chat Endpoints
- `POST /api/chat` - Send message
- `GET /api/history` - Get chat history
- `DELETE /api/history/{id}` - Delete chat record

### Model Endpoints
- `GET /api/models` - Get model list
- `POST /api/models` - Create model configuration
- `PUT /api/models/{id}` - Update model configuration

## 🎨 Interface Preview

### Login Page
Modern login interface with dark mode support.

### Chat Interface
- Sidebar navigation
- Chat message display
- Model selector
- Settings panel

### Model Management
- Model configuration interface
- Parameter adjustment panel
- Performance monitoring

## 🛠️ Development Guide

### Backend Development

1. **Add new API routes**
```python
# Create new file in backend/api/ directory
from fastapi import APIRouter

router = APIRouter()

@router.get("/example")
async def example_endpoint():
    return {"message": "Hello World"}
```

2. **Create data models**
```python
# Create new file in backend/models/ directory
from sqlalchemy import Column, Integer, String
from backend.database.database import Base

class Example(Base):
    __tablename__ = "examples"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
```

### Frontend Development

1. **Create new components**
```typescript
// Create new file in frontend/components/ directory
import React from 'react'

interface ExampleProps {
  title: string
}

export default function Example({ title }: ExampleProps) {
  return <div>{title}</div>
}
```

2. **Add new pages**
```typescript
// Create new directory and page.tsx in frontend/app/ directory
export default function ExamplePage() {
  return <div>Example Page</div>
}
```

## 🧪 Testing

### Backend Testing
```bash
# Run backend tests
cd backend
python -m pytest
```

### Frontend Testing
```bash
# Run frontend tests
cd frontend
npm test
```

## 📦 Deployment

### Docker Deployment

1. **Build image**
```bash
docker build -t allin-app .
```

2. **Run container**
```bash
docker run -p 8000:8000 -p 3000:3000 allin-app
```

### Production Deployment

1. **Configure environment variables**
2. **Set up reverse proxy (Nginx)**
3. **Configure SSL certificates**
4. **Set up database backups**

## 🤝 Contributing

We welcome all forms of contributions!

### How to Contribute

1. Fork this project
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Code Standards

- Use TypeScript for type checking
- Follow ESLint rules
- Write clear comments
- Add appropriate test cases

## 📄 License

This project is licensed under the GNU Affero General Public License v3.0 - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [FastAPI](https://fastapi.tiangolo.com/) - High-performance Python web framework
- [Next.js](https://nextjs.org/) - React full-stack framework
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [Framer Motion](https://www.framer.com/motion/) - Animation library

## 📞 Contact Us

- Project Homepage: https://github.com/XY2006DATE/ALLIN---Developer-Personal-Platform
- Issue Tracker: https://github.com/XY2006DATE/ALLIN---Developer-Personal-Platform/issues
- Email: yuxu91010@gmail.com

---

<div align="center">

**If this project helps you, please give us a ⭐️**

Made with ❤️ by [XY2006DATE]

</div> 