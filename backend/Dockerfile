# 构建运行时环境
FROM python:3.12-slim
# 设置时区
ENV TZ=Asia/Shanghai
# 设置语言
ENV LANG=zh_CN.UTF-8
# 设置工作目录
WORKDIR /app
# 对外端口
EXPOSE 8000
# 安装python库
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
# 拷贝项目内容
COPY . .
# 启动命令
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "4"]
