# Sun-Panel-Helper

<div align="center">
  <img src="https://pic2.ziyuan.wang/user/madrays/2025/02/logo _1__216e59a7de7ac.png" width="300" height="275" alt="Sun-Panel-Helper Logo" />

  [![Github](https://img.shields.io/badge/Github-123456?logo=github&labelColor=242424)](https://github.com/madrays/sun-panel-helper)
  [![Gitee](https://img.shields.io/badge/Gitee-123456?logo=gitee&labelColor=c71d23)](https://gitee.com/madrays/sun-panel-helper)
  [![docker](https://img.shields.io/badge/docker-123456?logo=docker&logoColor=fff&labelColor=1c7aed)](https://hub.docker.com/r/madrays/sun-panel-helper)

  [![GitHub stars](https://img.shields.io/github/stars/madrays/sun-panel-helper?style=flat&logo=github)](https://github.com/madrays/sun-panel-helper)
  [![Docker pulls](https://img.shields.io/docker/pulls/madrays/sun-panel-helper.svg?logo=docker)](https://hub.docker.com/r/madrays/sun-panel-helper)

  [Sun-Panel 项目](https://github.com/hslr-s/sun-panel)

  一款为 Sun-Panel 设计的可视化美化工具，让你的 Sun-Panel 锦上添花~
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

## ✨ 功能特点

- 🔗 中转服务
  - 连接 Sun-Panel 前端与 Helper 后端
  - 自动同步配置文件
  - 实时更新无需重启
  - 支持多实例部署

- 🎨 可视化配置
  - 所见即所得的编辑体验
  - 实时预览修改效果
  - 参数持久化存储
  - 一键应用到面板

- 🛠️ 扩展支持
  - CSS 样式扩展
  - JS 功能增强
  - 组件动态加载
  - 配置自动同步

- 🚀 便捷部署
  - Docker 一键部署
  - 自动挂载配置
  - 支持反向代理
  - 完整的部署文档

## 🚀 快速部署

使用 Docker Compose 一键部署:

```yaml
version: '3'
services:
  sun-panel-helper:
    image: madrays/sun-panel-helper:latest
    container_name: sun-panel-helper
    ports:
      - "33002:80"
    volumes:
      - /path/to/sunpanel/conf/custom:/app/backend/custom  # 替换为你的 Sun-Panel custom 目录路径
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
  <p><strong>🏠 主页面</strong></p>
  <img src="https://pic2.ziyuan.wang/user/madrays/2025/02/A_75f5f43bbdc0a.png" width="100%" alt="主界面" />
  
  <p><strong>🎨 CSS 样式库</strong></p>
  <img src="https://pic2.ziyuan.wang/user/madrays/2025/02/B_b7b4eb8d92320.png" width="100%" alt="CSS 样式" />
  
  <p><strong>⚡ JS 功能库</strong></p>
  <img src="https://pic2.ziyuan.wang/user/madrays/2025/02/C_589854676665c.png" width="100%" alt="JS 功能" />
  
  <p><strong>🛍️ 组件市场</strong></p>
  <img src="https://pic2.ziyuan.wang/user/madrays/2025/02/D_268df6470994e.png" width="100%" alt="组件市场" />

  <p><strong>📌 固定组件</strong></p>
  <img src="https://pic2.ziyuan.wang/user/madrays/2025/02/E_0766b65ab947c.png" width="100%" alt="固定组件" />

  <p><strong>🎯 自由组件</strong></p>
  <img src="https://pic2.ziyuan.wang/user/madrays/2025/02/F_306d0091e3254.png" width="100%" alt="自由组件" />

  <p><strong>🔧 实时预览与部署</strong></p>
  <img src="https://pic2.ziyuan.wang/user/madrays/2025/02/G_93fd756963097.png" width="100%" alt="实时预览调参部署" />
</div>

## 🤝 技术支持

- 作者：Madrays
- QQ 交流群：1019956856
- 项目指导：感谢 Sun-Panel 作者红烧猎人的技术支持

## 📈 项目统计

[![Star History Chart](https://api.star-history.com/svg?repos=madrays/sun-panel-helper&type=Date)](https://star-history.com/#madrays/sun-panel-helper&Date)
