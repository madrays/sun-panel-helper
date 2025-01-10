# Sun-Panel-Helper

<div align="center">
  <img src="https://picture.agsv.top/123/2025/01/07/677c9648da6dc/logo.png" width="300" height="275" alt="Sun-Panel-Helper Logo" />

  [![Github](https://img.shields.io/badge/Github-123456?logo=github&labelColor=242424)](https://github.com/madrays/sun-panel-helper)
  [![Gitee](https://img.shields.io/badge/Gitee-123456?logo=gitee&labelColor=c71d23)](https://gitee.com/madrays/sun-panel-helper)
  [![docker](https://img.shields.io/badge/docker-123456?logo=docker&logoColor=fff&labelColor=1c7aed)](https://hub.docker.com/r/madrays/sun-panel-helper)

  [![GitHub stars](https://img.shields.io/github/stars/madrays/sun-panel-helper?style=flat&logo=github)](https://github.com/madrays/sun-panel-helper)
  [![GitHub downloads](https://img.shields.io/github/downloads/madrays/sun-panel-helper/total.svg?logo=github)](https://github.com/madrays/sun-panel-helper/releases)
  [![Docker pulls](https://img.shields.io/docker/pulls/madrays/sun-panel-helper.svg?logo=docker)](https://hub.docker.com/r/madrays/sun-panel-helper)

  [Sun-Panel 项目](https://github.com/hslr-s/sun-panel)

  一款为 Sun-Panel 设计的可视化美化工具，让你的面板更加精美~
</div>

## 🌟 在线体验

我们提供了完整的演示环境，让你在部署前可以充分体验：

### 🎨 Sun-Panel-Helper Demo
- 地址：[demo.cocoyoo.cn](http://demo.cocoyoo.cn)
- 功能：
  - 体验完整的样式编辑功能
  - 预览各种美化效果
  - 测试部署流程

### 🎯 Sun-Panel 演示站
- 地址：[home.cocoyoo.cn](http://home.cocoyoo.cn)
- 特点：
  - 展示实际应用效果
  - 体验优化后的界面
  - 感受流畅的交互体验

> 💡 提示：你可以在 Helper Demo 中编辑样式，然后在演示站中查看效果，体验完整的美化流程！

## ✨ 项目特点

- 🎨 可视化编辑
  - 所见即所得的编辑体验
  - 实时预览样式效果
  - 支持参数微调和实时更新

- 🚀 简单易用
  - 零代码操作，一键应用
  - 丰富的预设模板
  - 支持自定义配置

- 🎯 功能完善
  - CSS 样式美化
  - 磨砂玻璃效果
  - 动态边框装饰
  - 更多功能开发中...

## 📝 项目结构

- `backend/custom/`: 预览组件目录，包含组件模板和配置
- `deploy/`: 部署参考目录（实际部署时使用宿主机的 custom 目录）
- `frontend/`: 前端代码
- `Dockerfile`: 构建多阶段镜像
- `docker-compose.yml`: 容器编排配置
- `nginx.conf`: Nginx 反向代理配置
- `start.sh`: 容器启动脚本

## 🚀 部署说明



 Docker Compose 部署：
   ```yaml
   version: '3'
   services:
     sun-panel-helper:
       image: madrays/sun-panel-helper:latest
       ports:
         - "33002:80"
       volumes:
         - ./custom:/app/deploy  # 挂载宿主机部署的sunpanel的 custom 目录，一般为类似*/conf/custom/ 目录
       restart: unless-stopped
   ```

   启动命令：
   ```bash
   docker-compose up -d
   ```

   注意事项：
   - 确保端口 33002 未被占用
   - 首次启动可能需要拉取镜像，请耐心等待
   - 数据目录必须挂载到本地部署的sunpanel的 custom 目录，一般为类似*/conf/custom/ 目录

## 📸 效果展示

<div align="center">
  <p><strong>🎨 可视化编辑界面</strong></p>
  <img src="https://picture.agsv.top/123/2025/01/09/677f7af079188/AA.png" width="100%" alt="编辑界面" />
  
  <p><strong>✨ 实时预览效果</strong></p>
  <img src="https://picture.agsv.top/123/2025/01/09/677f7af005699/BB.png" width="100%" alt="预览效果" />
  
  <p><strong>🎯 参数调整面板</strong></p>
  <img src="https://picture.agsv.top/123/2025/01/09/677f7aefb74c4/CC.png" width="100%" alt="参数调整" />
  
  <p><strong>🚀 部署管理界面</strong></p>
  <img src="https://picture.agsv.top/123/2025/01/09/677f7af001bc7/DD.png" width="100%" alt="部署管理" />
</div>

## 📈 项目统计

[![Star History Chart](https://api.star-history.com/svg?repos=madrays/sun-panel-helper&type=Date)](https://star-history.com/#madrays/sun-panel-helper&Date)
