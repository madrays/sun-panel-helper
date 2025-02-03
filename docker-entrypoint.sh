#!/bin/sh

echo "Starting services..."

# 确保目录存在
mkdir -p /app/backend/data
mkdir -p /app/backend/custom/helper  # 先创建父目录

# 创建 custom 目录结构
echo "Creating custom directory structure..."
cd /app/backend/custom/helper && \
mkdir -p font && \
mkdir -p freewidgets/setting && \
mkdir -p logo && \
mkdir -p maxkb && \
mkdir -p md/anonymous &&  # 预创建匿名用户目录
mkdir -p mouse && \
mkdir -p weather-widget

# 初始化匿名用户的笔记文件
echo "[]" > /app/backend/custom/helper/md/anonymous/notes.json

# 确保文件存在
echo "Creating custom files..."
touch /app/backend/custom/index.css
touch /app/backend/custom/index.js

# 设置权限
echo "Setting permissions..."
chmod -R 777 /app/backend/data
chmod -R 777 /app/backend/custom
chmod -R 777 /app/backend/custom/helper/freewidgets  # 特别确保这个目录有写权限
chmod -R 777 /app/backend/custom/helper/md  # 特别确保 md 目录有写权限

# 添加更多日志
echo "Starting server with configuration:"
echo "NODE_ENV: production"
echo "Data directory: $(ls -la /app/backend/data)"
echo "Custom directory structure:"
ls -R /app/backend/custom

# 复制资源文件到挂载的目录
echo "Copying resource files..."
cp /app/resources/maxkb/logo.gif /app/backend/custom/helper/maxkb/
cp /app/resources/font/江湖风古体.ttf /app/backend/custom/helper/font/
cp /app/resources/font/马赛克MC风.ttf /app/backend/custom/helper/font/
cp /app/resources/font/猫啃圆珠体.ttf /app/backend/custom/helper/font/

# 验证文件是否复制成功
ls -l /app/backend/custom/helper/maxkb/
ls -l /app/backend/custom/helper/font/

# 启动后端服务
echo "Starting backend service..."
cd /app/backend
node src/app.js &
BACKEND_PID=$!

# 等待后端启动
echo "Waiting for backend to start..."
sleep 5

# 检查后端是否正常运行
if ! kill -0 $BACKEND_PID 2>/dev/null; then
    echo "ERROR: Backend failed to start!"
    exit 1
fi

echo "Backend started successfully on port 3001"

# 检查 nginx 配置
echo "Checking nginx configuration..."
nginx -t

# 启动 nginx
echo "Starting nginx..."
nginx -g 'daemon off;'

# 启动服务
nginx
cd /app/backend && node dist/app.js 