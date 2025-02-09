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

## 🎉 更新内容 (v2.0.1)

### 🔧 功能优化
- ⚡️ 支持自定义后端端口,避免端口冲突
- 🌤️ 优化天气组件404问题
- 🛠️ 优化JS组件加载顺序,解决组件冲突
- 🌟 Markdown编辑器配置保存和部署功能优化
- 📝 修复部分描述文案错误
- 🔗 尝试支持arm64架构（因手头没有arm64架构的设备，故未测试，请自行测试）

### ✨ 新增组件
- 🎵 音乐播放器组件 (by: MYHK/与末)
  - 支持自定义播放列表
  - 界面美观,操作流畅
- 🔒 公开模式隐藏登录按钮CSS组件 (by: 与末)
  - 适用于公开访问场景
  - 提升界面简洁度

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

### 重要参数说明
- 端口配置:
  - Sun-Panel端口: `3002:3002`
    - 3002为访问端口,可自定义修改
    - 3002为容器内端口(勿改)
  - Helper前端端口: `33002:80`
    - 33002为访问端口,可自定义修改
    - 注意避免与其他服务冲突
    - 80为容器内端口(勿改)
  - Helper后端端口: `BACKEND_PORT=3001`
    - 默认3001,可通过环境变量修改
    - 注意避免与其他服务冲突
- 数据目录:
  - 必须挂载Sun-Panel的custom目录
  - 确保目录权限正确(读写权限)

### 1. 命令行部署

#### Docker命令部署
```bash
docker run -d \
  --name sun-panel-helper \
  -p 33002:80 \
  -e BACKEND_PORT=3001 \
  -v /path/to/sunpanel/conf/custom:/app/backend/custom \
  madrays/sun-panel-helper:latest
```

#### Docker Compose部署
创建docker-compose.yml文件:
```yaml
version: '3'
services:
  sun-panel-helper:
    image: madrays/sun-panel-helper:latest
    container_name: sun-panel-helper
    environment:
      - BACKEND_PORT=3001  # 后端服务端口,可自定义修改避免冲突
    ports:
      - "33002:80"        # 前端页面访问端口,可自定义修改避免冲突
    volumes:
      - /path/to/sunpanel/conf/custom:/app/backend/custom
    restart: unless-stopped
```

运行命令:
```bash
docker-compose up -d
```

### 2. 图形化界面部署

#### Portainer部署
1. 打开Portainer界面
2. 进入"Containers" > "Add Container"
3. 填写以下信息:
   - Name: sun-panel-helper
   - Image: madrays/sun-panel-helper:latest
   - Port mapping: 33002:80
   - Environment variables: 
     - BACKEND_PORT=3001
   - Volumes: 
     - host: /path/to/sunpanel/conf/custom
     - container: /app/backend/custom
4. 点击"Deploy the container"完成部署

#### 群晖Docker部署
1. 打开Docker套件
2. 下载镜像madrays/sun-panel-helper:latest
3. 创建容器时配置:
   - 端口设置: 33002:80
   - 环境变量: BACKEND_PORT=3001
   - 卷: 选择Sun-Panel的custom目录映射到/app/backend/custom
4. 应用设置并启动容器

### Sun-Panel + Helper 一键部署（以飞牛OS为例）

```yaml
version: "3.2"
services:
  # Sun-Panel 服务
  sun-panel:
    image: "hslr/sun-panel:latest"
    container_name: sun-panel
    volumes:
      - /vol1/@appshare/sunpanel/conf:/app/conf
      - /var/run/docker.sock:/var/run/docker.sock # 挂载docker.sock
      - /vol1:/os # 硬盘挂载点（根据自己需求修改）
    ports:
      - 3002:3002
    restart: always

  # Sun-Panel-Helper 服务
  sun-panel-helper:
    image: madrays/sun-panel-helper:latest
    container_name: sun-panel-helper
    environment:
      - BACKEND_PORT=3001  # 后端服务端口,可自定义修改避免冲突
    ports:
      - "33002:80"        # 前端页面访问端口
    volumes:
      - /vol1/@appshare/sunpanel/conf/custom:/app/backend/custom  # Sun-Panel的custom目录
    restart: always
```

启动命令：
```bash
docker-compose up -d
```

注意事项：
- 端口说明:
  - Sun-Panel默认端口3002可修改
  - Helper前端默认端口33002可修改
  - Helper后端默认端口3001可通过环境变量修改
  - 所有端口请避免冲突
- 首次启动可能需要拉取镜像，请耐心等待
- Helper的数据目录必须正确挂载到Sun-Panel的custom目录
- 路径说明:
  - 飞牛OS默认路径: `/vol1/@appshare/sunpanel/conf/custom`
  - 其他环境请根据实际情况调整
- 建议先启动Sun-Panel,确认运行正常后再部署Helper
- 端口冲突解决方案:
  - Sun-Panel端口: 修改compose中的3002:3002
  - Helper前端端口: 修改compose中的33002:80
  - Helper后端端口: 修改环境变量BACKEND_PORT

### 📝 初始登录信息

<div align="center" style="border: 1px solid #1677ff; padding: 20px; border-radius: 8px; background-color: #f0f5ff; margin: 20px 0; display: inline-block; min-width: 300px; box-shadow: 0 2px 12px rgba(0,0,0,0.1);">
  <details open>
    <summary style="font-weight: bold; color: #1677ff; margin-bottom: 10px; font-size: 16px;">Sun-Panel 登录信息</summary>
    <p style="margin: 5px 0; background: #fff; padding: 10px; border-radius: 6px;">
      账号：<code style="background: #e6f4ff; padding: 2px 6px; border-radius: 4px; color: #1677ff;">admin@sun.cc</code><br>
      密码：<code style="background: #e6f4ff; padding: 2px 6px; border-radius: 4px; color: #1677ff;">12345678</code>
    </p>
  </details>
  
  <details open>
    <summary style="font-weight: bold; color: #1677ff; margin: 15px 0 10px 0; font-size: 16px;">Sun-Panel-Helper 登录信息</summary>
    <p style="margin: 5px 0; background: #fff; padding: 10px; border-radius: 6px;">
      账号：<code style="background: #e6f4ff; padding: 2px 6px; border-radius: 4px; color: #1677ff;">helper</code><br>
      密码：<code style="background: #e6f4ff; padding: 2px 6px; border-radius: 4px; color: #1677ff;">helper123</code>
    </p>
  </details>
</div>

🔧注意事项：
- 端口说明:
  - Sun-Panel默认端口3002可修改
  - Helper前端默认端口33002可修改
  - Helper后端默认端口3001可通过环境变量修改
  - 所有端口请避免冲突
- 首次启动可能需要拉取镜像，请耐心等待
- Helper的数据目录必须正确挂载到Sun-Panel的custom目录
- 路径说明:
  - 飞牛OS默认路径: `/vol1/@appshare/sunpanel/conf/custom`
  - 其他环境请根据实际情况调整
  - 如无custom目录,请自行创建
- 建议先启动Sun-Panel,确认运行正常后再部署Helper
- 端口冲突解决方案:
  - Sun-Panel端口: 修改compose中的3002:3002
  - Helper前端端口: 修改compose中的33002:80
  - Helper后端端口: 修改环境变量BACKEND_PORT

## 🎨 效果展示

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

  <p><strong>🚀 自由组件</strong></p>
  <img src="https://pic2.ziyuan.wang/user/madrays/2025/02/F_306d0091e3254.png" width="100%" alt="自由组件" />

  <p><strong>🔧 实时预览与部署</strong></p>
  <img src="https://pic2.ziyuan.wang/user/madrays/2025/02/G_93fd756963097.png" width="100%" alt="实时预览调参部署" />
</div>

## 🔑 初始账号
- 账号：helper
- 密码：helper123

## ⚠️ 已知问题

<div style="border: 1px solid #ff4d4f; padding: 20px; border-radius: 8px; background-color: #fff2f0; margin: 20px 0; box-shadow: 0 2px 12px rgba(0,0,0,0.1);">
  <details open>
    <summary style="font-weight: bold; color: #ff4d4f; margin-bottom: 15px; font-size: 16px;">1. 样式冲突</summary>
    <ul style="margin: 0; padding-left: 20px; color: #434343;">
      <li>部分组件样式存在冲突</li>
      <li>对于必然冲突的项目，已在详情页面中标注说明</li>
      <li>目前需要用户自行调整以达到最佳显示效果</li>
    </ul>
  </details>

  <details open>
    <summary style="font-weight: bold; color: #ff4d4f; margin: 15px 0; font-size: 16px;">2. 组件加载顺序</summary>
    <ul style="margin: 0; padding-left: 20px; color: #434343;">
      <li>已通过固定加载顺序解决组件间冲突问题</li>
      <li>如MaxKB浮窗和小鱼页脚等组件现可正常共存</li>
      <li style="color: #389e0d; font-weight: bold;">状态：已修复 ✅</li>
    </ul>
  </details>

  <details open>
    <summary style="font-weight: bold; color: #ff4d4f; margin: 15px 0; font-size: 16px;">3. Markdown编辑器配置</summary>
    <ul style="margin: 0; padding-left: 20px; color: #434343;">
      <li>配置保存和部署功能已优化</li>
      <li>现可正常保存并即时生效</li>
      <li style="color: #389e0d; font-weight: bold;">状态：已修复 ✅</li>
    </ul>
  </details>

  <details open>
    <summary style="font-weight: bold; color: #ff4d4f; margin: 15px 0; font-size: 16px;">4. 天气组件安全性 🔧</summary>
    <ul style="margin: 0; padding-left: 20px; color: #434343;">
      <li>组件功能已修复并可正常使用</li>
      <li>API密钥泄露风险仍然存在</li>
      <li>建议：请谨慎在公网环境使用</li>
      <li style="color: #ff4d4f; font-weight: bold;">状态：安全性优化中</li>
    </ul>
  </details>
</div>

## 🎯 项目介绍
Sun Panel Helper 是一个专注于增强 Sun-Panel 功能的辅助工具。我们致力于为您的 Sun-Panel 带来更多精彩的功能和更好的使用体验。

作为一个热爱折腾的 AI 爱好者，我希望通过这个项目展示 AI 辅助开发的无限可能。本项目由 Sun-Panel 作者红烧猎人技术指导，全程使用 AI 辅助开发。如果你也对 AI 开发或 Sun-Panel 美化感兴趣，欢迎加入交流群一起探讨！

## ☕ 请作者喝杯奶茶
如果这个项目对你有帮助，可以请作者喝杯奶茶，您的支持是我持续创作的动力 ❤️

<div align="center">
  <div style="display: inline-block; text-align: center; margin: 0 20px;">
    <img src="https://pic2.ziyuan.wang/user/madrays/2025/02/1_dd096325eadb7.jpg" alt="微信赞赏码" width="200"/>
    <p style="margin: 10px 0; font-size: 16px;">
      <span style="background: #07c160; color: white; padding: 4px 12px; border-radius: 4px;">微信赞赏</span>
    </p>
    <p style="color: #666; font-size: 14px;">感谢支持💗</p>
  </div>
  <div style="display: inline-block; text-align: center; margin: 0 20px;">
    <img src="https://pic2.ziyuan.wang/user/madrays/2025/02/2_0c5298607b84c.jpg" alt="支付宝赞赏码" width="200"/>
    <p style="margin: 10px 0; font-size: 16px;">
      <span style="background: #1677ff; color: white; padding: 4px 12px; border-radius: 4px;">支付宝赞赏</span>
    </p>
    <p style="color: #666; font-size: 14px;">加大电力⚡️</p>
  </div>
</div>

## 🤝 技术支持

- 作者：Madrays
- QQ 交流群：1019956856
- 投稿邮箱：2826910520@qq.com
- 项目指导：感谢 Sun-Panel 作者红烧猎人的技术支持

## 📈 项目统计

[![Star History Chart](https://api.star-history.com/svg?repos=madrays/sun-panel-helper&type=Date)](https://star-history.com/#madrays/sun-panel-helper&Date)
