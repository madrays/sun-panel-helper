# 构建前端
FROM node:14 AS frontend-builder
WORKDIR /app

# 设置 npm 配置
RUN npm config set registry https://registry.npmmirror.com
RUN npm install -g npm@6.14.18

# 复制并安装依赖
COPY frontend/package*.json ./frontend/
WORKDIR /app/frontend
RUN npm install --legacy-peer-deps

# 构建前端
COPY frontend/ .
RUN npm run build

# 构建前端后检查
RUN ls -la dist/

# 最终镜像
FROM python:3.9-slim
WORKDIR /app

# 安装 nginx
RUN apt-get update && \
    apt-get install -y nginx && \
    rm -rf /var/lib/apt/lists/* && \
    rm /etc/nginx/sites-enabled/default

# 配置后端
COPY backend/requirements.txt .
RUN pip install -r requirements.txt
COPY backend/ .

# 复制前端构建产物
COPY --from=frontend-builder /app/frontend/dist /app/static

# 复制后检查
RUN ls -la /app/static/

# 配置 nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 启动脚本
COPY start.sh .
RUN chmod +x start.sh

# 创建部署目录
RUN mkdir -p /app/deploy

CMD ["./start.sh"] 