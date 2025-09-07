# 多阶段构建 - 构建阶段
FROM node:22-alpine AS builder

WORKDIR /app

# 接收构建参数
ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

# 复制依赖文件
COPY package.json package-lock.json ./

# 安装依赖（包含开发依赖用于构建）
RUN npm ci --no-audit --no-fund && npm cache clean --force

# 复制源代码
COPY . .

# 构建应用
RUN npm run build

# 生产阶段 - 使用更轻量的镜像
FROM nginx:alpine

# 删除默认配置和文件，减少镜像大小
RUN rm -rf /usr/share/nginx/html/* /etc/nginx/conf.d/* && \
    # 安装curl用于健康检查，然后清理缓存
    apk add --no-cache curl && \
    # 创建nginx用户目录
    mkdir -p /var/cache/nginx && \
    chown -R nginx:nginx /var/cache/nginx

# 复制构建产物
COPY --from=builder /app/dist /usr/share/nginx/html

# 复制nginx配置文件
COPY nginx.conf /etc/nginx/nginx.conf

# 设置正确的文件权限
RUN chown -R nginx:nginx /usr/share/nginx/html

# 暴露端口
EXPOSE 80

# 健康检查
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost/ || exit 1

# 以非root用户运行
USER nginx

# 启动nginx
CMD ["nginx", "-g", "daemon off;"]
