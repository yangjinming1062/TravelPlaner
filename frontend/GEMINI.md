# 智能旅游规划系统前端

## 项目概述

这是一个基于 React + TypeScript + Vite 构建的现代化旅游规划网页应用。该应用采用前后端分离架构，支持多种不同的旅游规划模式，为用户提供个性化的出行建议和完整的旅游方案。

核心特性：
- 🎯 **智能化**: 集成大模型AI，提供智能化的旅游规划建议
- 🌍 **多模式**: 支持单一目的地、沿途游玩、多节点、智能推荐四种规划模式
- 💻 **现代化**: 使用 React 18 + TypeScript + TailwindCSS + ShadCN UI 构建
- 🔧 **可扩展**: 建立了可扩展的系统架构，支持未来功能迭代

## 技术栈

- **框架**: React 18 + TypeScript
- **构建工具**: Vite
- **状态管理**: React Query (@tanstack/react-query)
- **路由**: React Router v6
- **UI库**: ShadCN UI (基于 Radix UI 和 TailwindCSS)
- **样式**: TailwindCSS
- **表单处理**: React Hook Form + Zod 验证
- **图标**: Lucide React

## 项目结构

```
frontend/
├── public/                 # 静态资源文件
├── src/
│   ├── assets/             # 图片资源
│   ├── components/         # 可复用组件
│   │   ├── shared/         # 共享组件（如偏好设置）
│   │   └── ui/             # UI组件（ShadCN UI组件）
│   ├── hooks/              # 自定义Hooks
│   ├── lib/                # 工具函数
│   ├── pages/              # 页面组件
│   ├── App.tsx             # 应用根组件
│   ├── main.tsx            # 应用入口
│   └── vite-env.d.ts       # Vite环境声明
├── package.json            # 依赖和脚本配置
├── tsconfig.json           # TypeScript配置
├── vite.config.ts          # Vite配置
├── tailwind.config.ts      # Tailwind配置
└── components.json         # ShadCN UI配置
```

## 规划模式

### 1. 单一目的地模式 (`/single-destination`)
专注于单个目的地的深度游玩，提供目的地内部景点推荐。

### 2. 沿途游玩模式 (`/route-planning`)
侧重在目的地的游玩和推荐，同时发现并推荐沿途有价值的景点。

### 3. 多节点模式 (`/multi-node`)
规划多个目的地，针对每个目的地的抵达和离开时间推荐游玩内容。

### 4. 智能推荐模式 (`/ai-recommend`)
基于预算、时间、出行方式等参数由AI分析用户需求，推荐最适合的旅游目的地。

## 开发约定

### 组件规范
- 使用 TypeScript 进行类型安全检查
- 使用 ShadCN UI 组件作为基础UI组件
- 共享组件放在 `src/components/shared/` 目录下
- 页面组件放在 `src/pages/` 目录下

### 样式规范
- 使用 TailwindCSS 进行样式开发
- 颜色变量定义在 `src/index.css` 中
- 响应式设计遵循移动优先原则

### 路由规范
- 使用 React Router v6 进行路由管理
- 所有页面路由在 `src/App.tsx` 中统一配置

## 构建与运行

### 安装依赖
```bash
npm install
```

### 启动开发服务器
```bash
npm run dev
```

### 构建生产版本
```bash
npm run build
```

### 预览生产构建
```bash
npm run preview
```

### 代码检查
```bash
npm run lint
```

## 环境配置

开发服务器运行在 `http://localhost:8000` 端口。

Vite 配置文件位于 `vite.config.ts`，其中包含了路径别名配置：
```typescript
"@": path.resolve(__dirname, "./src")
```

这意味着可以从 `@/components/ui/button` 这样导入组件。