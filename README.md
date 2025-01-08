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

1. 预览组件：
   - 位置：backend/custom/
   - 用途：提供组件模板和配置
   - 打包：包含在 Docker 镜像中

2. 部署目录：
   - 容器内：/app/deploy/
   - 宿主机：./custom/
   - 用途：存放生成的样式和脚本
   - 配置：通过 docker-compose volumes 挂载

## 📸 预览

> 项目开发中，预览图片将在功能完善后更新...

## 📈 项目统计

[![Star History Chart](https://api.star-history.com/svg?repos=madrays/sun-panel-helper&type=Date)](https://star-history.com/#madrays/sun-panel-helper&Date)
