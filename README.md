# 🚀 ALLIN - 开发者个人平台

<div align="center">

![ALLIN Logo](https://img.shields.io/badge/ALLIN-Developer%20Platform-blue?style=for-the-badge&logo=github)

**一个现代化的AI聊天和开发工具集成平台**

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

## 📖 项目简介

ALLIN 是一个专为开发者设计的现代化AI聊天和开发工具集成平台。它集成了多种AI模型，为开发者提供一站式的AI辅助开发体验。

### ✨ 核心特性

- 🤖 **多模型支持** - 集成多种AI模型，支持本地和远程模型
- 💬 **智能聊天** - 支持上下文记忆的智能对话
- 🎨 **现代化UI** - 基于Next.js和Tailwind CSS的响应式界面
- 🌙 **深色模式** - 支持明暗主题切换
- 📱 **响应式设计** - 适配桌面和移动设备
- 🔐 **用户认证** - JWT token认证系统
- 📊 **聊天历史** - 完整的对话历史记录和管理
- ⚙️ **模型管理** - 灵活的模型配置和参数调整

## 🏗️ 技术架构

### 后端技术栈
- **FastAPI** - 高性能Python Web框架
- **SQLAlchemy** - ORM数据库操作
- **SQLite** - 轻量级数据库
- **JWT** - 用户认证
- **Uvicorn** - ASGI服务器
- **Pydantic** - 数据验证

### 前端技术栈
- **Next.js 14** - React全栈框架
- **TypeScript** - 类型安全
- **Tailwind CSS** - 实用优先的CSS框架
- **Framer Motion** - 动画库
- **React Hook Form** - 表单管理
- **Axios** - HTTP客户端

## 🚀 快速开始

### 环境要求

- **Python** 3.8+
- **Node.js** 18+
- **npm** 或 **yarn**

### 安装步骤

1. **克隆项目**
```bash
git clone https://github.com/XY2006DATE/ALLIN---Developer-Personal-Platform.git
cd ALLIN---Developer-Personal-Platform
```

2. **安装后端依赖**
```bash
# 安装Python依赖
pip install -r backend/requirements.txt
```

3. **安装前端依赖**
```bash
# 进入前端目录
cd frontend
npm install
```

4. **初始化数据库**
```bash
# 返回项目根目录
cd ..
# 初始化数据库
python backend/migrations/001_init_database.py --init
```

5. **启动服务**

**方法一：使用启动脚本（推荐）**
```bash
# 启动后端（新终端）
./start_backend.sh

# 启动前端（新终端）
./start_frontend.sh
```

**方法二：手动启动**
```bash
# 启动后端
cd backend
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload

# 启动前端（新终端）
cd frontend
npm run dev
```

6. **访问应用**
- 前端地址：http://localhost:3000
- 后端API：http://localhost:8000
- API文档：http://localhost:8000/docs

## 📁 项目结构

```
ALLIN/
├── backend/                 # 后端代码
│   ├── api/                # API路由
│   │   ├── auth.py         # 认证相关
│   │   ├── agent.py        # AI代理
│   │   ├── model.py        # 模型管理
│   │   ├── settings.py     # 设置
│   │   ├── debug.py        # 调试
│   │   ├── remote.py       # 远程聊天
│   │   ├── user.py         # 用户
│   │   └── history.py      # 聊天历史
│   ├── core/               # 核心配置
│   ├── crud/               # 数据库操作
│   ├── database/           # 数据库配置
│   ├── models/             # 数据模型
│   ├── schemas/            # 数据验证
│   └── migrations/         # 数据库迁移
├── frontend/               # 前端代码
│   ├── app/                # Next.js页面
│   ├── components/         # React组件
│   ├── contexts/           # React上下文
│   └── lib/                # 工具库
├── uploads/                # 文件上传目录
├── start_backend.sh        # 后端启动脚本
├── start_frontend.sh       # 前端启动脚本
└── README.md              # 项目文档
```

## 🔧 配置说明

### 环境变量

创建 `.env` 文件在项目根目录：

```env
# 数据库配置
DATABASE_URL=sqlite:///allin.db

# JWT配置
SECRET_KEY=your-secret-key-here-change-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# 应用配置
APP_NAME=ALLIN Backend
DEBUG=true
```

### 数据库管理

```bash
# 初始化数据库
python backend/migrations/001_init_database.py --init

# 检查数据库状态
python backend/migrations/001_init_database.py --check

# 重置数据库（删除所有数据）
python backend/migrations/001_init_database.py --reset
```

## 🎯 功能模块

### 用户认证
- 用户注册和登录
- JWT token认证
- 密码加密存储
- 用户信息管理

### AI聊天
- 多模型对话支持
- 上下文记忆功能
- 聊天历史记录
- 消息导出功能

### 模型管理
- 本地模型配置
- 远程模型集成
- 模型参数调整
- 模型性能监控

## 🔌 API接口

### 认证接口
- `POST /api/register` - 用户注册
- `POST /api/login` - 用户登录
- `POST /api/logout` - 用户登出

### 聊天接口
- `POST /api/chat` - 发送消息
- `GET /api/history` - 获取聊天历史
- `DELETE /api/history/{id}` - 删除聊天记录

### 模型接口
- `GET /api/models` - 获取模型列表
- `POST /api/models` - 创建模型配置
- `PUT /api/models/{id}` - 更新模型配置

## 🎨 界面预览

### 登录页面
现代化的登录界面，支持深色模式切换。

### 聊天界面
- 侧边栏导航
- 聊天消息展示
- 模型选择器
- 设置面板

### 模型管理
- 模型配置界面
- 参数调整面板
- 性能监控

## 🛠️ 开发指南

### 后端开发

1. **添加新的API路由**
```python
# 在 backend/api/ 目录下创建新文件
from fastapi import APIRouter

router = APIRouter()

@router.get("/example")
async def example_endpoint():
    return {"message": "Hello World"}
```

2. **创建数据模型**
```python
# 在 backend/models/ 目录下创建新文件
from sqlalchemy import Column, Integer, String
from backend.database.database import Base

class Example(Base):
    __tablename__ = "examples"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
```

### 前端开发

1. **创建新组件**
```typescript
// 在 frontend/components/ 目录下创建新文件
import React from 'react'

interface ExampleProps {
  title: string
}

export default function Example({ title }: ExampleProps) {
  return <div>{title}</div>
}
```

2. **添加新页面**
```typescript
// 在 frontend/app/ 目录下创建新目录和page.tsx
export default function ExamplePage() {
  return <div>Example Page</div>
}
```

## 🧪 测试

### 后端测试
```bash
# 运行后端测试
cd backend
python -m pytest
```

### 前端测试
```bash
# 运行前端测试
cd frontend
npm test
```

## 📦 部署

### Docker部署

1. **构建镜像**
```bash
docker build -t allin-app .
```

2. **运行容器**
```bash
docker run -p 8000:8000 -p 3000:3000 allin-app
```

### 生产环境部署

1. **配置环境变量**
2. **设置反向代理（Nginx）**
3. **配置SSL证书**
4. **设置数据库备份**

## 🤝 贡献指南

我们欢迎所有形式的贡献！

### 如何贡献

1. Fork 本项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

### 代码规范

- 使用 TypeScript 进行类型检查
- 遵循 ESLint 规则
- 编写清晰的注释
- 添加适当的测试用例

## 📄 许可证

本项目采用 GNU Affero General Public License v3.0 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🙏 致谢

- [FastAPI](https://fastapi.tiangolo.com/) - 高性能Python Web框架
- [Next.js](https://nextjs.org/) - React全栈框架
- [Tailwind CSS](https://tailwindcss.com/) - 实用优先的CSS框架
- [Framer Motion](https://www.framer.com/motion/) - 动画库

## 📞 联系我们

- 项目主页：https://github.com/XY2006DATE/ALLIN---Developer-Personal-Platform
- 问题反馈：https://github.com/XY2006DATE/ALLIN---Developer-Personal-Platform/issues
- 邮箱：yuxu91010@gmail.com

---

<div align="center">

**如果这个项目对你有帮助，请给我们一个 ⭐️**

Made with ❤️ by [XY2006DATE]

</div> 