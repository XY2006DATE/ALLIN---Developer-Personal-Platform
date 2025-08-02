# 数据库迁移脚本

这个文件夹包含了ALLIN项目的数据库迁移和初始化脚本。

## 命名规范

所有迁移脚本采用统一的命名规范：`{序号}_{操作类型}_{功能模块}_{具体功能}.py`

### 脚本执行顺序

| 序号 | 脚本名称 | 功能描述 |
|------|---------|---------|
| 001 | `001_init_database.py` | 数据库初始化（创建所有基础表） |
| 002 | `002_create_chat_tables.py` | 创建聊天历史相关表 |
| 003 | `003_add_context_enable_field.py` | 添加上下文启用字段 |
| 004 | `004_add_context_features.py` | 添加上下文功能相关字段 |
| 005 | `005_add_model_parameters.py` | 添加模型参数字段 |
| 006 | `006_fix_timezone_issue.py` | 修复时区问题 |
| 007 | `007_update_theme_preferences.py` | 更新主题偏好设置 |

## 文件说明

### `001_init_database.py`
主要的数据库初始化脚本，用于创建所有必要的数据库表。

**使用方法：**
```bash
# 初始化数据库（创建所有表）
python backend/migrations/001_init_database.py

# 检查数据库状态
python backend/migrations/001_init_database.py --check

# 重置数据库（删除所有数据并重新创建）
python backend/migrations/001_init_database.py --reset
```

### `002_create_chat_tables.py`
专门用于创建聊天历史相关表的脚本。

**使用方法：**
```bash
# 创建聊天历史表
python backend/migrations/002_create_chat_tables.py

# 删除聊天历史表
python backend/migrations/002_create_chat_tables.py --drop
```

### `003_add_context_enable_field.py`
为模型配置表和聊天历史表添加enable_context字段。

**使用方法：**
```bash
# 添加上下文启用字段
python backend/migrations/003_add_context_enable_field.py
```

### `004_add_context_features.py`
为聊天历史表添加上下文功能相关字段。

**使用方法：**
```bash
# 添加上下文功能字段
python backend/migrations/004_add_context_features.py
```

### `005_add_model_parameters.py`
为模型配置表添加模型参数字段。

**使用方法：**
```bash
# 添加模型参数字段
python backend/migrations/005_add_model_parameters.py
```

### `006_fix_timezone_issue.py`
修复用户注册时间的时区问题。

**使用方法：**
```bash
# 修复时区问题
python backend/migrations/006_fix_timezone_issue.py
```

### `007_update_theme_preferences.py`
更新现有用户的主题偏好设置。

**使用方法：**
```bash
# 更新主题偏好
python backend/migrations/007_update_theme_preferences.py
```

## 数据库表结构

### 核心表
- `users` - 用户表
- `model_configs` - 模型配置表
- `model_instances` - 模型实例表
- `user_model_preferences` - 用户模型偏好表

### 聊天历史表
- `chat_history` - 聊天历史表
  - `id` - 主键
  - `user_id` - 用户ID（外键）
  - `config_id` - 模型配置ID（外键）
  - `title` - 聊天标题
  - `url` - 聊天URL（唯一）
  - `created_at` - 创建时间
  - `updated_at` - 更新时间
  - `is_deleted` - 是否删除（软删除）
  - `enable_context` - 是否启用上下文
  - `context_window_size` - 上下文窗口大小
  - `enable_context_summary` - 是否启用上下文摘要
  - `context_summary` - 上下文摘要
  - `context_settings` - 上下文设置（JSON）

- `chat_messages` - 聊天消息表
  - `id` - 主键
  - `chat_history_id` - 聊天历史ID（外键）
  - `role` - 消息角色（user/assistant/system）
  - `content` - 消息内容
  - `created_at` - 创建时间
  - `message_metadata` - 额外元数据（JSON格式）
  - `context_relevance_score` - 上下文相关性评分
  - `context_keywords` - 上下文关键词（JSON）

## 执行指南

### 新环境初始化
```bash
# 1. 初始化数据库
python backend/migrations/001_init_database.py

# 2. 创建聊天表
python backend/migrations/002_create_chat_tables.py

# 3. 添加上下文功能
python backend/migrations/003_add_context_enable_field.py
python backend/migrations/004_add_context_features.py

# 4. 添加模型参数
python backend/migrations/005_add_model_parameters.py

# 5. 修复时区问题（如果有历史数据）
python backend/migrations/006_fix_timezone_issue.py

# 6. 更新主题偏好
python backend/migrations/007_update_theme_preferences.py
```

### 检查数据库状态
```bash
python backend/migrations/001_init_database.py --check
```

## 注意事项

1. **执行顺序**：请按照序号顺序执行迁移脚本
2. **备份数据**：在执行重置操作前，请确保备份重要数据
3. **权限检查**：确保脚本有足够的权限访问数据库文件
4. **依赖关系**：聊天历史表依赖于用户表和模型配置表，请确保这些表已存在

## 常见问题

### Q: 如何检查数据库是否正常？
A: 运行 `python backend/migrations/001_init_database.py --check`

### Q: 如何重新创建所有表？
A: 运行 `python backend/migrations/001_init_database.py --reset`

### Q: 如何只创建聊天历史表？
A: 运行 `python backend/migrations/002_create_chat_tables.py`

### Q: 数据库文件在哪里？
A: 默认在项目根目录的 `allin.db` 文件中

### Q: 如何添加新的迁移脚本？
A: 按照命名规范创建新文件，序号递增，例如：`008_add_new_feature.py` 