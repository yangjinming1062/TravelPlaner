# 智能旅游规划系统前端

## 项目概述

这是一个基于 React + TypeScript + Vite 构建的现代化旅游规划网页应用。该应用采用前后端分离架构，支持四种不同的旅游规划模式：

1. 单一目的地模式
2. 沿途游玩模式
3. 多节点模式
4. 智能推荐模式

该系统集成了大模型AI能力，为用户提供个性化的出行建议和完整的旅游方案。

## 技术栈

- **框架**: React 18 + TypeScript
- **构建工具**: Vite
- **状态管理**: React Query (@tanstack/react-query)
- **路由**: React Router v6
- **UI库**: TailwindCSS + shadcn/ui 组件库
- **表单处理**: React Hook Form + Zod 验证
- **HTTP客户端**: Axios
- **图标库**: Lucide React

## 项目结构

```
src/
├── api/                 # API 请求封装
├── assets/              # 静态资源文件
├── components/          # 可复用组件
│   ├── auth/            # 认证相关组件
│   ├── shared/          # 规划模块共享组件
│   └── ui/              # UI 组件 (shadcn/ui)
├── hooks/               # 自定义 Hooks
├── lib/                 # 工具函数
├── pages/               # 页面组件
│   ├── multi/           # 多节点模式页面
│   ├── route/           # 沿途游玩模式页面
│   ├── single/          # 单一目的地模式页面
│   └── smart/           # 智能推荐模式页面
└── types/               # TypeScript 类型定义
```

## 核心功能模块

### 1. 用户认证系统

- 登录/注册页面
- 用户偏好设置
- 用户中心页面
- 规划历史记录

### 2. 四种规划模式

#### 单一目的地模式 (`/single/*`)

专注于单个目的地的深度游玩，提供目的地内部景点推荐。

#### 沿途游玩模式 (`/route/*`)

侧重在目的地的游玩和推荐，同时发现并推荐沿途有价值的景点。

#### 多节点模式 (`/multi/*`)

规划多个目的地，针对每个目的地的抵达和离开时间推荐游玩内容。

#### 智能推荐模式 (`/smart/*`)

基于预算、时间、出行方式等参数由AI分析用户需求，推荐最适合的旅游目的地。

### 3. 共享组件

- `CommonPlanningFields`: 规划基本信息输入组件
- `PreferencesSection`: 用户偏好设置组件
- `DailyPlan`: 日程计划展示组件
- `PlanSummary`: 规划结果摘要展示组件

## 开发约定

### 命名规范

- 组件文件使用 PascalCase 命名（如 `UserProfile.tsx`）
- 页面组件放在 `src/pages/` 目录下
- 可复用组件放在 `src/components/` 目录下
- 类型定义文件放在 `src/types/` 目录下

### 路由约定

- 所有页面通过 `src/App.tsx` 中的 `Routes` 进行统一管理
- 受保护页面需要通过 `ProtectedRoute` 组件包装

### 样式约定

- 使用 TailwindCSS 进行样式开发
- 使用 shadcn/ui 提供的组件库
- 颜色主题遵循系统默认配置

## 构建和运行命令

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览生产构建
npm run preview

# 代码检查
npm run lint
```

## 环境变量

项目使用 `.env` 文件来管理环境变量：

- `VITE_API_BASE_URL`: 后端API基础地址

## 类型定义

项目在 `src/types/` 目录下维护了完整的 TypeScript 类型定义，包括：

- 用户相关类型 (`user.ts`)
- 规划任务和结果类型 (`planning.ts`)

这些类型定义确保了整个项目的类型安全。
