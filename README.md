## TravelPlanner 旅行规划系统

一个全栈旅行规划应用。支持单一目的地、沿途游玩、多节点与智能推荐四种规划模式，并提供用户注册登录、个人资料与旅行偏好管理、规划收藏与统计等功能。

### 功能特性
- **多种规划模式**: 单一目的地规划、沿途游玩规划、多节点规划、智能推荐规划
- **用户系统**: 注册/登录、资料与密码修改、旅行偏好管理
- **结果收藏与统计**: 规划结果收藏、个人规划统计数据
- **前后端分离**: 前端 Vite + React + Tailwind（shadcn/ui），后端 FastAPI
- **可选 Docker 部署**: 一条命令启动前后端

### 界面预览（来自 `resources/`）
> 以下截图位于仓库 `resources/` 目录，可直接在 GitHub 上查看大图。

![首页](resources/screenshot-index.png)

![偏好设置向导](resources/screenshot-perferences-setup.png)

![单一目的地规划](resources/screenshot-planning-single.png)

![沿途游玩规划](resources/screenshot-planning-route.png)

![多节点规划](resources/screenshot-planning-multi.png)

![智能推荐规划](resources/screenshot-planning-smart.png)

![用户中心](resources/screenshot-user-center.png)

## 技术栈
- **前端**: React 18, Vite 5, TypeScript, Tailwind CSS, shadcn/ui, React Router, TanStack Query, Axios
- **后端**: FastAPI, SQLAlchemy 2, Alembic
- **数据库**: PostgreSQL（需自备或通过 Docker 启动）
- **LLM（开发中）**: LangChain/LangGraph

## 目录结构（摘录）
```text
TravelPlaner/
  backend/
    api/v1/              # 规划与用户路由
    common/              # 通用 API 封装、异常、分页、鉴权
    modules/             # 业务模块：planning、user 等
    migrations/          # Alembic 数据库迁移
    main.py              # FastAPI 入口（app）
    requirements.txt
    config.yaml.example  # 后端配置示例
  frontend/
    src/                 # React 应用源码
    package.json
  resources/             # README 使用的截图
  docker-compose.yml     # 可选：一键启动（前后端）
```

## 快速开始

### 方式一：Docker（推荐）
1) 复制配置并按需修改
```bash
cp backend/config.yaml.example backend/config.yaml
```
请至少确认以下项：数据库连接 `db_uri`、JWT 密钥 `jwt_secret`、`secret_key` 等。

2) 启动
```bash
docker compose up -d --build
```
- 前端: `http://localhost`
- 后端: `http://localhost:8000`

注意：`docker-compose.yml` 中 PostgreSQL 服务默认被注释。如果你希望通过 Docker 启动数据库，请取消注释并根据需要调整 `db_uri`。

### 方式二：本地开发

前置：建议 Python 3.12+、Node.js 22+。

1) 后端
```bash
cd backend/
python -m venv .venv
source .venv/bin/activate  # Windows 使用 .venv\\Scripts\\activate
pip install -r requirements.txt

cp backend/config.yaml.example backend/config.yaml
# 按需编辑 backend/config.yaml：db_uri/jwt_secret/secret_key 等

# 初始化数据库（如使用 Alembic 迁移）
# 生成迁移脚本(修改了models才需要，默认已经准备好了和当前代码配套的迁移文件)
# alembic -c ./migrations/alembic.ini revision --autogenerate

# 执行迁移
alembic -c ./migrations/alembic.ini upgrade head

# 启动后端（开发模式）
uvicorn backend.main:app --reload --host 127.0.0.1 --port 8000
```

2) 前端
```bash
cd frontend
npm install

# 设置前端 API 基址（如果通过docker启动的后端可以不设置，默认访问本地的8000端口）
# echo "VITE_API_BASE_URL=http://localhost:8000/api/v1" > .env

npm run dev
```

## 配置说明（后端 `backend/config.yaml`）
- **debug**: 是否开启调试（开启时提供 `/openapi.json`）
- **log_dir/log_level/...**: 日志目录与格式
- **db_uri**: 数据库连接，例如 `postgresql+psycopg://user:password@localhost:5432/travel_planner`
- **jwt_token_expire_days/jwt_secret**: JWT 过期天数与密钥
- **secret_key**: 加密密钥（Fernet）。可用 `python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"` 生成

## API 概览（Base: `/api/v1`）

> 后端启动后访问 `http://localhost:8000/docs`可以直接查看接口文档，以下接口仅供参考。

### 用户相关（`/api/v1/user`）
- `POST /register` 注册
- `POST /login` 登录（返回 `token`）
- `GET /captcha` 获取重置验证码（示例逻辑）
- `POST /reset-password` 重置密码（示例逻辑）
- `GET /profile` 获取完整档案（需 `Authorization: Bearer <token>`）
- `GET /info` 获取基本信息
- `PUT /profile` 更新基本信息
- `POST /password` 修改密码
- `GET/PUT /preferences` 获取/更新旅行偏好

### 规划相关（`/api/v1/planning`）
- 单一目的地：`POST /single-tasks`、`POST /single-tasks/list`、`GET /single-tasks/{task_id}/result`
- 沿途游玩：`POST /route-tasks`、`POST /route-tasks/list`、`GET /route-tasks/{task_id}/result`
- 多节点：`POST /multi-tasks`、`POST /multi-tasks/list`、`GET /multi-tasks/{task_id}/result`
- 智能推荐：`POST /smart-tasks`、`POST /smart-tasks/list`、`GET /smart-tasks/{task_id}/result`
- 通用：`GET /tasks/{task_type}/{task_id}/status`（任务状态）、`PATCH /tasks/{task_type}/{task_id}/favorite`（收藏）
- 统计：`GET /stats` 用户规划统计

前端在开发模式下默认读取 `VITE_API_BASE_URL`（若未设置则回退 `http://localhost:8000/api/v1`）。

## 常见问题
- **数据库如何配置？** 若使用外部数据库，直接在 `backend/config.yaml` 中设置 `db_uri`；若使用 Docker，请启用 compose 中的数据库服务并保持 `db_uri` 指向容器服务名。
- **无法访问接口文档？** 仅在 `debug: true` 时提供 `/openapi.json`。

## 作者
- 作者：Jinming.Yang
- 邮箱：yjm1062@126.com
- 反馈与交流：欢迎提交 Issue 或 PR，共建更好用的旅行规划工具。
