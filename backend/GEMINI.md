# 智能旅游规划系统后端

## 项目概述

这是一个基于 Python/FastAPI 的旅游规划系统后端，采用模块化架构设计，支持多种旅游规划模式。系统集成了用户管理、偏好设置、以及四种不同的旅游规划模式（单一目的地、沿途游玩、多节点、智能推荐）。

## 技术栈

- **核心框架**: FastAPI 0.115.8
- **数据库**: PostgreSQL + SQLAlchemy 2.0
- **数据库迁移**: Alembic 1.13.1
- **认证**: JWT + OAuth2
- **加密**: cryptography 42.0.5
- **部署**: Docker
- **代码质量**: black, pre-commit

## 项目架构

```
backend/
├── api/                 # API 接口定义
│   └── v1/              # API v1 版本
├── common/              # 通用组件和基类
├── migrations/          # 数据库迁移脚本
├── modules/             # 业务模块
│   ├── geo/             # 地理信息服务
│   ├── llm/             # 大语言模型集成
│   ├── planning/        # 旅游规划核心逻辑
│   └── user/            # 用户管理
├── utils/               # 业务无关的工具封装
├── config.py            # 配置管理
├── main.py              # 应用入口
├── command.py           # 命令行工具入口
└── requirements.txt     # 依赖管理
```

## 核心模块

### 用户管理 (user)

实现了完整的用户认证和授权体系：
- 用户注册、登录、密码重置
- JWT Token 认证机制
- 用户偏好设置管理
- 用户信息维护

### 旅游规划 (planning)

支持四种规划模式：

1. **单一目的地模式**
   - 专注于单个目的地的深度游玩
   - 提供详细的每日行程安排

2. **沿途游玩模式**
   - 规划从出发地到目的地的沿途游玩路线
   - 支持设置停留点和路线偏好

3. **多节点模式**
   - 规划多个目的地的旅行路线
   - 支持复杂的多城市行程安排

4. **智能推荐模式**
   - 基于用户偏好和约束条件推荐目的地
   - 提供个性化旅游建议

## 数据库设计

使用 PostgreSQL 数据库，通过 SQLAlchemy ORM 进行数据访问：

- **用户表 (user)**: 存储用户基本信息和偏好设置
- **规划任务表**: 四种规划模式各自的任务表
- **规划结果表**: 四种规划模式各自的结果表

## 开发规范

### 代码风格

- 使用 black 进行代码格式化（120字符行宽）
- 使用 pre-commit 钩子确保代码质量
- 遵循 RESTful API 设计规范

### 项目结构约定

1. **config**: 所有配置参数集中管理
2. **common**: 业务无关的基础定义和封装
3. **utils**: 业务无关的功能封装
4. **modules**: 按业务功能划分的模块
   - constants.py: 业务相关常量
   - enums.py: 枚举类型定义
   - models.py: 数据库模型
   - schemas.py: 数据结构定义
   - controller.py: 业务逻辑封装
   - command.py: 后台任务命令

### API 设计规范

- 统一路由注册机制
- 标准化分页查询实现
- 统一错误处理和响应格式
- 自动文档生成 (OpenAPI/Swagger)

## 部署指南

### 本地开发

1. 安装依赖: `pip install -r requirements.txt`
2. 安装 pre-commit: `pip install pre-commit`
3. 初始化 pre-commit: `pre-commit install`
4. 启动服务: `python main.py`

### Docker 部署

```bash
# 构建镜像
docker build -t travel-planner-backend .

# 运行容器
docker run -p 8000:8000 travel-planner-backend
```

## 数据库迁移

使用 Alembic 进行数据库版本管理：

```bash
# 生成迁移脚本
alembic -c ./migrations/alembic.ini revision --autogenerate

# 执行迁移
alembic -c ./migrations/alembic.ini upgrade head
```

## 命令行工具

通过 `command.py` 提供后台管理命令：

```bash
# 创建管理员账户
python command.py user --username admin --password secret
```

## 环境配置

支持多层级配置加载（优先级从高到低）：
1. 环境变量
2. dev.env
3. .env
4. config.yaml
5. 参数默认值

## 日志系统

- 支持按模块和级别分割日志文件
- 可配置控制台输出
- 统一日志格式和时区设置