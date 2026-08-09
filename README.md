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
<div align="center">
  <h2><a href="https://helper.madrays.de" target="_blank">📚 官方文档 | Official Documentation</a></h2>
  <p>详细的安装指南、使用教程和最佳实践，尽在官方文档！<br>Visit our official documentation for detailed installation guides, tutorials, and best practices!</p>
</div>


## 🌟 在线体验

我们提供了完整的演示环境，让你在部署前可以充分体验：

### 🎨 Sun-Panel-Helper Demo
- 地址：[Helper演示站](http://demo.iuio.de:7878)
- 功能：
  - 体验完整的样式编辑功能
  - 预览各种美化效果
  - 测试部署流程

### 🎯 Sun-Panel 演示站
- 地址：[Sun-Panel 演示站](http://home.iuio.de:7878)
- 特点：
  - 展示实际应用效果
  - 体验优化后的界面
  - 感受流畅的交互体验

> 💡 提示：你可以在 Helper Demo 中编辑样式，然后在演示站中查看效果，体验完整的美化流程！

## 🎉 更新内容 (v2.1.0) - 安全性更新

> ⚠️ **重要安全更新**：本次更新将敏感信息（API Key、账号密码等）从前端迁移至后端安全存储，强烈建议使用天气组件或 Markdown 编辑器的用户升级！

### 🔒 安全性改进
- 🌤️ **天气组件安全升级**：两个天气组件的 API Key（和风天气、高德地图、AI 服务）已迁移至后端存储，前端通过代理 API 请求数据，避免密钥泄露。
- 📝 **Markdown 编辑器安全升级**：修复账号密码无法保存的 Bug，同时将认证信息迁移至后端安全存储。

### ✨ 其他改进
- 🔄 **API 代理机制**：新增后端代理层，所有敏感 API 请求均通过后端转发，前端不再暴露任何密钥信息。

## 🎉 更新内容 (v2.0.9)

> 📢 **写在最后**：这可能是本项目的最后一个版本了。由于近期更新内容较少，且项目维护精力有限（也没收到啥打赏 😂），决定在此完结撒花！感谢大家一路的陪伴与支持！🎉虽然说是最后一个版本，但代码依然是开源和自由的，祝您使用愉快！ 🎉

### ✨ 更新亮点
- � **天气组件个性化**：新增字体/图标颜色配置，优化透明度设置，完美适配深色背景。
- 🐛 **UI 细节修复**：修复了滚动条溢出问题，优化了移动端遮罩层体验。

## 🎉 更新内容 (v2.0.8)

### ✨ 更新亮点
- 🌤️ **新增天气组件**：全新UI设计，支持和风天气最新 API Host。
- 🛠️ **修复旧天气组件**：修复了旧版天气组件无法获取数据的问题。
- ⚡️ **优化 JS 部署逻辑**：重构了 JS 组件的部署方式，提升稳定性和安全性。

## 🎉 更新内容 (v2.0.7)

### ✨ 功能亮点
- 🧰 **全新百宝箱模块**
  - 引入强大的"百宝箱"功能，集中管理和部署各种页面增强特效。
  - 提供统一的界面来配置和预览效果。
- ✨ **一键部署多种特效**
  - 支持在百宝箱中轻松部署：
    - **页脚效果**：例如 ICP备案页脚、生命线页脚 (Lifeline Footer) 等。
    - **点击特效**：例如 社会主义核心价值观鼠标点击效果。
    - **背景特效**：例如 动态星空背景等。
  - 可视化配置参数，实时预览，一键应用到 Sun-Panel。

### 🔧 重要修复与优化
- 🐞 **修复 QB/TR 组件问题**
  - 解决了 QBittorrent 和 Transmission 状态组件在特定场景下的连接和显示问题。
  - 优化了错误处理和提示信息。
- 🌤️ **修复天气组件问题**
  - 适配和风天气新API系统。
  - 修复了天气组件在特定配置或网络下的数据获取失败问题。
  - 进一步提升了 Key/Host 切换逻辑的健壮性。
- 💪 **提升系统稳定性**
  - 优化了后端代码，提升了整体性能和稳定性。

## 🎉 更新内容 (v2.0.6)

### 📢 致歉信息
- 非常抱歉在v2.0.5版本中引入的数据目录变更给大家带来的不便
- 由于没有充分说明数据迁移方法，导致部分用户数据丢失
- 我们已在v2.0.6版本中修复相关问题并提供完整的数据迁移指南

### 🔧 重要修复
- 🐞 **修复TR组件域名前缀问题**
  - 修复了Transmission组件域名前缀无法保存的问题
  - 添加了域名前缀变更监听器，与QB组件保持一致
  - 确保设置的前缀能正确应用和保存

- 💾 **备份系统优化**
  - 修复了备份清理逻辑，现在手动创建的备份将永久保留
  - 只有自动备份会受到100个数量限制的清理
  - 即使创建大量手动备份，也不会影响自动备份功能

### ⚠️ 重要注意提醒
- 请确保正确挂载三个必要目录，尤其是从旧版本升级的用户
- 如未正确挂载，可能导致数据丢失或功能异常
- 使用`docker cp`命令可从旧容器导出现有数据再重新部署

### 📋 数据导出教程
如果您从旧版本升级且之前未挂载数据目录，请按以下步骤操作：

1. **创建必要的挂载目录**
```bash
# 创建数据目录
mkdir -p /your/path/to/helper/data
mkdir -p /your/path/to/helper/backups
```

2. **从旧容器导出数据**
```bash
# 导出用户数据
docker cp sun-panel-helper:/app/backend/data/. /your/path/to/helper/data/

# 导出现有备份文件（仅适用于v2.0.5及更高版本，v2.0.5之前的版本没有备份功能）
docker cp sun-panel-helper:/app/backend/backups/. /your/path/to/helper/backups/
```

3. **停止并删除旧容器**
```bash
docker stop sun-panel-helper
docker rm sun-panel-helper
```

4. **使用正确的挂载目录重新部署**
```bash
docker run -d \
  --name sun-panel-helper \
  -p 33002:80 \
  -e BACKEND_PORT=3001 \
  -v /path/to/sunpanel/conf/custom:/app/backend/custom \
  -v /your/path/to/helper/data:/app/backend/data \
  -v /your/path/to/helper/backups:/app/backend/backups \
  madrays/sun-panel-helper:latest
```

> ⚠️ **重要提示**：务必在更新前备份您的数据，确保安全迁移！对于v2.0.5之前的版本，只需导出data目录即可，因为旧版本没有备份功能。

## 🎉 更新内容 (v2.0.5)

### ✨ 功能增强
- 🎨 **TR/QB状态组件自定义主题**
  - 支持完全自定义TR/QB状态组件主题颜色
  - 更丰富的配色选项，打造专属个性化效果
  - 可随时切换明暗色调，适应不同时段使用
  - 自动保存主题配置，便于多处复用

- 🌤️ **天气组件主题定制**
  - 新增自定义背景色和文字颜色设置
  - 支持翻转动画背景透明化
  - 优化圆角显示效果，视觉体验更加统一
  - 提升天气图标清晰度和显示质量

- 💾 **新增备份功能**
  - 增加备份功能
  - 新增备份添加备注功能，方便管理和识别
  - 优化备份列表分页和搜索功能
  - 完善备份还原流程，提高操作便捷性

- 📤 **上传限制优化**
  - 修复文件上传限制
  - 字体文件上传上限从10MB提升至50MB
  - 自定义Logo上传上限从2MB提升至15MB
  - 优化Nginx配置，支持大文件上传

### 🔧 其他优化
- ⚡️ 优化组件加载速度和性能
- 🛠️ 修复多个已知的小问题
- 📝 完善代码注释和文档说明
- 💪 提升系统整体稳定性

## 🎉 更新内容 (v2.0.4)

### ✨ 重磅更新
- 🚀 **全新TR/QB状态小组件终于来了**
  - 支持qBittorrent和Transmission下载器状态监控
  - 精美紧凑的UI设计
  - 实时显示下载/上传速度、活动任务数等自定义参数
  - 可添加为自由/固定组件，灵活布局
  - 支持自定义刷新间隔，确保信息实时准确
  
### 🔧 重要功能修复
- 📝 修复MD笔记本导致的浏览器密码错误填充搜索栏问题
  - 解决浏览器自动填充功能与搜索栏冲突的问题
  - 优化表单结构，避免误识别为密码输入框
  - 提升整体用户体验
- 🧩 修复自由组件布局删除功能的错乱问题
  - 解决删除组件后布局错位的问题
  - 优化组件删除交互逻辑
  - 提高操作体验与直观性

### 🔧 IPv6兼容性优化
- ⚡️ 支持自定义前端监听端口，解决IPv6兼容性问题
  - 通过环境变量`FRONTEND_PORT`灵活设置监听端口
  - 支持Host网络模式部署，彻底解决IPv6连接问题
  - 向后兼容保证现有用户无需修改配置
- 🌈 优化组件IPv6兼容性提示
  - 为TR/QB组件添加清晰的IPv6提示信息
  - 引导用户正确配置IPv6环境下的下载器
  - 美观直观的用户界面优化

  ### 📝 其他说明
- 🎯 项目已趋于稳定，后续将以优化和修复为主
- 🌟 欢迎大佬们投稿优质组件
- 💼 由于作者已开始上班，更新节奏会相对放缓
- 📮 如有好的创意和建议，欢迎通过QQ群或邮箱联系,期待大佬们投稿

## 🎉 更新内容 (v2.0.3)

### 🔧 功能优化
- 🌤️ 天气组件显示效果优化
  - 改进天气显示布局
  - 优化温度和天气状态展示
  - 提升整体视觉效果
- 🐟 小鱼页脚组件优化
  - 增加速度和层级控制参数
  - 优化水面波动效果
  - 提高动画流畅度和稳定性
  - 修复鼠标交互动画
- 🛠️ 组件兼容性提升
  - 进一步优化组件间的协同工作
  - 减少样式冲突可能性


## 🎉 更新内容 (v2.0.2)

### 🔧 功能优化
- ✨ 新增轻轻小组件入口
  - 提供快捷访问轻轻小组件官网的入口
  - 支持获取组件链接添加到固定/自由组件
- 🔄 新增版本检测功能
  - 支持自动检查新版本
  - 提供详细的更新指南
  - 优化版本信息展示



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
  - Helper前端端口: 
    - 普通模式: `33002:80` (33002为访问端口,可自定义修改)
    - 自定义内部端口: `FRONTEND_PORT=8080` (可选,默认80)
    - Host模式: `FRONTEND_PORT=33002` (必须设置)
  - Helper后端端口: `BACKEND_PORT=3001`
    - 默认3001,可通过环境变量修改
    - 注意避免与其他服务冲突
- 数据目录:
  - 必须挂载三个重要目录:
    - `/app/backend/custom`: Sun-Panel的custom目录(必需)
    - `/app/backend/data`: Helper的数据目录(必需)
    - `/app/backend/backups`: 备份文件存储目录(必需)
  - 确保目录权限正确(需要读写权限)

### 重要变更通知 (v2.0.5+)
⚠️ **v2.0.5版本新增两个重要数据目录挂载，请务必添加以下挂载点：**
- `/app/backend/data`：用户数据目录，存储重要配置信息
- `/app/backend/backups`：备份文件存储目录，保存系统备份

### 1. 命令行部署

#### Docker命令部署
```bash
# 标准模式
docker run -d \
  --name sun-panel-helper \
  -p 33002:80 \
  -e BACKEND_PORT=3001 \
  -v /path/to/sunpanel/conf/custom:/app/backend/custom \
  -v /path/to/helper/data:/app/backend/data \
  -v /path/to/helper/backups:/app/backend/backups \
  madrays/sun-panel-helper:latest

# Host网络模式 (解决IPv6问题)
docker run -d \
  --name sun-panel-helper \
  --network host \
  -e BACKEND_PORT=3001 \
  -e FRONTEND_PORT=33002 \
  -v /path/to/sunpanel/conf/custom:/app/backend/custom \
  -v /path/to/helper/data:/app/backend/data \
  -v /path/to/helper/backups:/app/backend/backups \
  madrays/sun-panel-helper:latest
```

#### Docker Compose部署
创建docker-compose.yml文件:

```yaml
# 标准模式
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
      - /path/to/helper/data:/app/backend/data
      - /path/to/helper/backups:/app/backend/backups
    restart: unless-stopped
```

```yaml
# Host网络模式 (解决IPv6问题)
version: '3'
services:
  sun-panel-helper:
    image: madrays/sun-panel-helper:latest
    container_name: sun-panel-helper
    network_mode: host    # 使用Host网络模式
    environment:
      - BACKEND_PORT=3001     # 后端服务端口
      - FRONTEND_PORT=33002   # 前端页面访问端口(Host模式必须设置)
    volumes:
      - /path/to/sunpanel/conf/custom:/app/backend/custom
      - /path/to/helper/data:/app/backend/data
      - /path/to/helper/backups:/app/backend/backups
    restart: unless-stopped
```

运行命令:
```bash
docker-compose up -d
```

### 🔧 更新注意事项
- **数据目录挂载**：
  - 必须挂载三个目录：custom, data, backups
  - 如从旧版升级，请创建新的data和backups目录
  - 备份目录需要足够空间存储100份备份
- **文件上传限制**：
  - 已增大Nginx上传限制至60MB
  - 支持更大的字体和Logo文件上传
- **备份功能**：
  - 系统最多保留100份备份，自动清理旧备份
  - 建议定期手动清理不需要的备份释放空间
- **镜像更新**：
  - 请删除旧版容器后重新部署，不建议直接更新
  - 更新前请先备份重要数据

### IPv6兼容性说明

如果您需要管理位于纯IPv6网络的TR/QB下载器，请使用Host网络模式部署Helper:

1. **为什么需要Host模式?**
   - Docker默认网络模式下容器无法直接访问IPv6网络
   - Host模式让容器直接使用宿主机网络，支持IPv6连接
   - 解决TR/QB组件无法连接IPv6下载器的问题

2. **如何使用Host模式部署?**
   - 设置`network_mode: host`
   - 必须设置`FRONTEND_PORT`指定前端监听端口
   - 确保指定的端口未被占用

3. **注意事项**
   - Host模式下端口映射(-p)参数无效
   - 使用环境变量`FRONTEND_PORT`指定前端访问端口
   - 多个容器端口不能冲突

### 2. 图形化界面部署

#### Portainer部署

##### 标准模式
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
     - host: /path/to/helper/data
     - container: /app/backend/data
     - host: /path/to/helper/backups
     - container: /app/backend/backups
4. 点击"Deploy the container"完成部署

##### Host网络模式 (解决IPv6问题)
1. 打开Portainer界面
2. 进入"Containers" > "Add Container"
3. 填写以下信息:
   - Name: sun-panel-helper
   - Image: madrays/sun-panel-helper:latest
   - Network: Host
   - 不需要设置端口映射
   - Environment variables: 
     - BACKEND_PORT=3001
     - FRONTEND_PORT=33002
   - Volumes: 
     - host: /path/to/sunpanel/conf/custom
     - container: /app/backend/custom
     - host: /path/to/helper/data
     - container: /app/backend/data
     - host: /path/to/helper/backups
     - container: /app/backend/backups
4. 点击"Deploy the container"完成部署

#### 群晖Docker部署

##### 标准模式
1. 打开Docker套件
2. 下载镜像madrays/sun-panel-helper:latest
3. 创建容器时配置:
   - 端口设置: 33002:80
   - 环境变量: BACKEND_PORT=3001
   - 卷: 选择Sun-Panel的custom目录映射到/app/backend/custom
   - 卷: 选择Helper的数据目录映射到/app/backend/data
   - 卷: 选择Helper的备份目录映射到/app/backend/backups
4. 应用设置并启动容器

##### Host网络模式 (解决IPv6问题)
1. 打开Docker套件
2. 下载镜像madrays/sun-panel-helper:latest
3. 创建容器时配置:
   - 高级设置 > 网络 > 使用与Docker Host相同的网络
   - 环境变量: 
     - BACKEND_PORT=3001
     - FRONTEND_PORT=33002
   - 卷: 选择Sun-Panel的custom目录映射到/app/backend/custom
   - 卷: 选择Helper的数据目录映射到/app/backend/data
   - 卷: 选择Helper的备份目录映射到/app/backend/backups
4. 应用设置并启动容器

### Sun-Panel + Helper 一键部署（以飞牛OS为例）

#### 标准模式
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
      - /vol1/@appshare/helper/data:/app/backend/data
      - /vol1/@appshare/helper/backups:/app/backend/backups
    restart: always
```

#### Host网络模式 (解决IPv6问题)
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

  # Sun-Panel-Helper 服务 (Host网络模式)
  sun-panel-helper:
    image: madrays/sun-panel-helper:latest
    container_name: sun-panel-helper
    network_mode: host
    environment:
      - BACKEND_PORT=3001  # 后端服务端口
      - FRONTEND_PORT=33002  # 前端页面访问端口
    volumes:
      - /vol1/@appshare/sunpanel/conf/custom:/app/backend/custom  # Sun-Panel的custom目录
      - /vol1/@appshare/helper/data:/app/backend/data
      - /vol1/@appshare/helper/backups:/app/backend/backups
    restart: always
```

启动命令：
```bash
docker-compose up -d
```

注意事项：
- 端口说明:
  - Sun-Panel默认端口3002可修改
  - Helper前端默认端口33002:
    - 标准模式: 通过映射到容器内部80端口实现
    - Host模式: 通过FRONTEND_PORT环境变量设置
  - Helper后端默认端口3001可通过环境变量修改
  - 所有端口请避免冲突
- IPv6支持:
  - 如需管理IPv6下载器，建议使用Host网络模式
  - Host模式需要明确设置FRONTEND_PORT环境变量
  - 使用Host模式后，不需要设置端口映射
- 首次启动可能需要拉取镜像，请耐心等待
- Helper的数据目录必须正确挂载到Sun-Panel的custom目录
- 路径说明:
  - 飞牛OS默认路径: `/vol1/@appshare/sunpanel/conf/custom`
  - 其他环境请根据实际情况调整
- 建议先启动Sun-Panel,确认运行正常后再部署Helper
- 端口冲突解决方案:
  - Sun-Panel端口: 修改compose中的3002:3002
  - Helper前端端口: 修改compose中的33002:80或设置FRONTEND_PORT
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
  - Helper前端默认端口33002:
    - 标准模式: 通过映射到容器内部80端口实现
    - Host模式: 通过FRONTEND_PORT环境变量设置
  - Helper后端默认端口3001可通过环境变量修改
  - 所有端口请避免冲突
- IPv6支持:
  - 如需管理IPv6下载器，建议使用Host网络模式
  - Host模式需要明确设置FRONTEND_PORT环境变量
  - 使用Host模式后，不需要设置端口映射
- 首次启动可能需要拉取镜像，请耐心等待
- Helper的数据目录必须正确挂载到Sun-Panel的custom目录
- 路径说明:
  - 飞牛OS默认路径: `/vol1/@appshare/sunpanel/conf/custom`
  - 其他环境请根据实际情况调整
  - 如无custom目录,请自行创建
- 建议先启动Sun-Panel,确认运行正常后再部署Helper
- 端口冲突解决方案:
  - Sun-Panel端口: 修改compose中的3002:3002
  - Helper前端端口: 修改compose中的33002:80或设置FRONTEND_PORT
  - Helper后端端口: 修改环境变量BACKEND_PORT

## 🎨 效果展示

<div align="center">
  <p><strong>🏠 主页面</strong></p>
  <img src="https://pic2.ziyuan.wang/user/madrays/2025/02/A_75f5f43bbdc0a.png" width="100%" alt="主界面" />
  
  <p><strong>🎨 CSS 样式库</strong></p>
  <img src="https://pic2.ziyuan.wang/user/madrays/2025/03/css_2590b28a29b11.png" width="100%" alt="CSS 样式" />
  
  <p><strong>⚡ JS 功能库</strong></p>
  <img src="https://pic2.ziyuan.wang/user/madrays/2025/03/js_3e0ac321875b3.png" width="100%" alt="JS 功能" />
  
  <p><strong>🛍️ 组件市场</strong></p>
  <img src="https://pic2.ziyuan.wang/user/madrays/2025/03/mk_4c42feec033a9.png" width="100%" alt="组件市场" />

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
    <img src="https://pic2.ziyuan.wang/user/madrays/2025/03/wechat-qr_3b12b18852890.jpg" alt="微信赞赏码" width="200"/>
    <p style="margin: 10px 0; font-size: 16px;">
      <span style="background: #07c160; color: white; padding: 4px 12px; border-radius: 4px;">微信赞赏</span>
    </p>
    <p style="color: #666; font-size: 14px;">感谢支持💗</p>
  </div>
  <div style="display: inline-block; text-align: center; margin: 0 20px;">
    <img src="https://pic2.ziyuan.wang/user/madrays/2025/03/alipay-qr_053c36d2fe096.jpg" alt="支付宝赞赏码" width="200"/>
    <p style="margin: 10px 0; font-size: 16px;">
      <span style="background: #1677ff; color: white; padding: 4px 12px; border-radius: 4px;">支付宝赞赏</span>
    </p>
    <p style="color: #666; font-size: 14px;">加大电力⚡️</p>
  </div>
</div>

## 🤝 技术支持

<div align="center">
  <div style="display: inline-block; text-align: center; margin: 20px;">
    <img src="https://pic2.ziyuan.wang/user/madrays/2025/02/qrcode_29172b7553992.jpg" width="200" alt="QQ群二维码"/>
    <p style="margin: 10px 0; font-size: 16px;">
      <span style="background: #12b7f5; color: white; padding: 4px 12px; border-radius: 4px;">QQ交流群</span>
    </p>
    <p style="color: #666; font-size: 14px;">1019956856</p>
  </div>
</div>

- 作者：Madrays
- 投稿邮箱：2826910520@qq.com
- 项目指导：感谢 Sun-Panel 作者红烧猎人的技术支持

## 📈 项目统计

[![Star History Chart](https://star-history.dera.page/svg?repos=madrays/sun-panel-helper&type=Date)](https://star-history.dera.page/#madrays/sun-panel-helper&Date)
