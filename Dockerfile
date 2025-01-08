# 构建前端
FROM node:14 AS frontend-builder
WORKDIR /app
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ .
RUN npm run build

# 最终镜像
FROM python:3.9-slim
WORKDIR /app

# 安装 nginx
RUN apt-get update && \
    apt-get install -y nginx && \
    rm -rf /var/lib/apt/lists/*

# 配置后端
COPY backend/requirements.txt .
RUN pip install -r requirements.txt
COPY backend/ .

# 复制前端构建产物
COPY --from=frontend-builder /app/dist /app/static

# 配置 nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 启动脚本
COPY start.sh .
RUN chmod +x start.sh

CMD ["./start.sh"] 