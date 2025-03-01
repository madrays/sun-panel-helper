# 后端构建
FROM node:18-alpine as backend-builder
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm install
# 先复制非 custom 目录的文件
COPY backend/src ./src
COPY backend/components ./components
COPY backend/data ./data
COPY backend/tsconfig.json .
# 再复制需要的 custom 文件
COPY backend/custom/helper/font/江湖风古体.ttf ./custom/helper/font/
COPY backend/custom/helper/font/马赛克MC风.ttf ./custom/helper/font/
COPY backend/custom/helper/font/猫啃圆珠体.ttf ./custom/helper/font/
COPY backend/custom/helper/maxkb/logo.gif ./custom/helper/maxkb/
RUN npm run build

# 前端构建
FROM node:18-alpine as frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend .
# 设置生产环境变量
RUN echo "VITE_API_URL=/" > .env.production
RUN npm run build -- --mode production
# 添加调试命令
RUN echo "=== 编译后的文件 ===" && \
    ls -la dist && \
    echo "=== 检查 vendor 文件 ===" && \
    cat dist/assets/vendor-*.js | grep -i "localhost" || true && \
    echo "=== 检查 index 文件 ===" && \
    cat dist/assets/index-*.js | grep -i "localhost" || true

# 生产环境
FROM nginx:alpine
WORKDIR /app



# 复制前端构建产物
COPY --from=frontend-builder /app/frontend/dist/ /usr/share/nginx/html/

# 设置前端静态文件权限，确保 nginx 用户可以访问
RUN chmod -R 644 /usr/share/nginx/html/* \
    && chmod 755 /usr/share/nginx/html \
    && chmod 755 /usr/share/nginx/html/assets

# 复制后端文件
COPY --from=backend-builder /app/backend/dist/ ./backend/  
COPY --from=backend-builder /app/backend/components/ ./backend/components/  
COPY --from=backend-builder /app/backend/data/ ./backend/data/
COPY --from=backend-builder /app/backend/package*.json ./backend/

# 创建 custom 目录结构
RUN mkdir -p /app/backend/custom/helper && \
    cd /app/backend/custom/helper && \
    mkdir -p font freewidgets logo maxkb md mouse weather-widget && \
    touch /app/backend/custom/index.css && \
    touch /app/backend/custom/index.js && \
    chmod -R 777 /app/backend/custom

# 确保挂载点有正确权限
RUN mkdir -p /app/backend/custom && \
    chmod 777 /app/backend/custom && \
    # 设置 umask 确保新文件有正确权限
    echo "umask 000" >> /etc/profile

# 创建临时资源目录
RUN mkdir -p /app/resources/maxkb \
    && mkdir -p /app/resources/font

# 复制资源文件到临时目录
COPY backend/custom/helper/maxkb/logo.gif /app/resources/maxkb/
COPY backend/custom/helper/font/江湖风古体.ttf /app/resources/font/
COPY backend/custom/helper/font/马赛克MC风.ttf /app/resources/font/
COPY backend/custom/helper/font/猫啃圆珠体.ttf /app/resources/font/

# 设置权限
RUN chmod -R 777 /app/backend/custom

# 确保 data 目录存在并初始化用户数据
RUN mkdir -p /app/backend/data \
    && echo '[]' > /app/backend/data/users.json \
    && chmod -R 777 /app/backend/data

# 安装 Node.js
RUN apk add --no-cache nodejs npm

# 安装后端生产依赖
WORKDIR /app/backend
RUN npm install --production

# 复制 nginx 配置
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 启动脚本
COPY docker-entrypoint.sh /
RUN chmod +x /docker-entrypoint.sh

EXPOSE ${FRONTEND_PORT:-80}

ENTRYPOINT ["/docker-entrypoint.sh"]
