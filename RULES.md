# Sun-Panel-Helper 项目规范

## 零、路径规范 (最重要!)

### 1. 项目根目录
- 根目录: C:\sun\sun-panel-helper
- 禁止使用: C:\sun\sun-panel-helper\sun-panel-helper (错误的双重目录)

### 2. 核心目录结构
```
C:\sun\sun-panel-helper\          # 项目根目录
├── frontend\                     # 前端
│   ├── src\
│   │   ├── components\          # 组件目录
│   │   │   ├── WidgetPreview.vue  # 预览组件
│   │   │   ├── ParamEditor.vue    # 参数编辑器
│   │   │   └── WidgetCard.vue     # 组件卡片
│   │   ├── views\              # 页面
│   │   └── config.js           # 配置
│   ├── package.json            # 依赖配置
│   └── vue.config.js           # Vue配置
├── backend\                     # 后端
│   ├── app\
│   │   ├── services\           # 服务层
│   │   │   └── widget_service.py  # 组件服务
│   │   └── routes\            # 路由层
│   │       └── widget_routes.py   # 组件路由
│   ├── custom\                 # 自定义组件库
│   │   ├── styles\            # 样式组件
│   │   │   ├── xiantiao\      # 装饰线条
│   │   │   ├── cardHover\     # 卡片动画
│   │   │   ├── gradientBg\    # 渐变背景
│   │   │   └── mouseCursor\   # 鼠标指针
│   │   ├── scripts\           # 脚本组件(预留)
│   │   └── widgets\           # 完整组件(预留)
│   └── config.py              # 后端配置
├── RULES.md                    # 项目规范
├── README.md                   # 项目说明
└── sun_panel_helper_work_log.md # 开发日志
```

### 3. 组件类型划分
1. 样式组件 (styles)
   - 装饰线条 (xiantiao)
   - 卡片动画 (cardHover)
   - 渐变背景 (gradientBg)
   - 鼠标指针 (mouseCursor)

2. 脚本组件 (预留)
   - JS功能库
   - 工具函数
   - 动画效果

3. 完整组件 (预留)
   - Vue组件
   - React组件
   - 其他框架组件

## 一、项目结构规范

### 1. 前端模块命名 ("前端坊")
- 预览器(WidgetPreview.vue) -> "小部件预览间"
  - 职责: 实时预览各类组件效果
  - 特点: 支持多种预览模式(浏览器窗口、鼠标指针等)
  - 关联: 与"调整室"配合工作

- 参数编辑器(ParamEditor.vue) -> "调整室"
  - 职责: 参数实时调整与更新
  - 特点: 支持多种参数类型(颜色、数值、图片等)
  - 关联: 向"小部件预览间"提供参数

- 组件卡片(WidgetCard.vue) -> "展示柜"
  - 职责: 组件预览与展示
  - 特点: 包含预览、描述、部署状态
  - 关联: 在"控制台"中展示

### 2. 后端模块命名 ("后端阁")
- 组件服务(widget_service.py) -> "部件总管"
  - 职责: 组件生命周期管理
  - 特点: 处理加载、部署、更新等操作
  - 关联: 与"接口总控"配合

- 自定义组件目录(custom/) -> "百宝阁"
  - 线条坊(xiantiao/): 装饰线条组件
  - 悬浮坊(cardHover/): 卡片动画组件
  - 渐变坊(gradientBg/): 渐变背景组件
  - 指针坊(mouseCursor/): 鼠标指针组件

### 3. 配置模块命名 ("工具阁")
- Dockerfile -> "构建图纸"
- nginx.conf -> "网关守卫"
- vue.config.js -> "前端守卫"
- config.py -> "后端守卫"

## 二、开发规范

### 1. 代码风格
- 前端: Vue.js 最佳实践
  - 使用 Composition API
  - 组件化开发
  - TypeScript 类型检查
- 后端: PEP 8 规范
  - 清晰的函数命名
  - 详细的文档字符串
  - 适当的错误处理
- 注释: 必须清晰说明功能和规则

### 2. 文件组织
- 前端组件: frontend/src/components/
- 后端服务: backend/app/services/
- 配置文件: 项目根目录

### 3. 版本控制
- 提交信息格式:
```bash
feat: v{version} 版本更新
- 🐛 修复xxx
- ✨ 新增xxx功能
- 🚀 优化xxx
```

## 三、通信规范

### 1. 模块间通信
- 前端组件通信: Props/Events
- 前后端通信: RESTful API
- 配置文件通信: 文件读写

### 2. API 规范
- GET /api/widgets/types/{type}: 获取组件列表
- POST /api/widgets/{id}/deploy: 部署组件
- PUT /api/widgets/{id}/params: 更新参数

## 四、文档规范

### 1. 必要文档
- README.md: 项目说明书
- RULES.md: 本规范文档(规矩册)
- sun_panel_helper_work_log.md: 工作日志(进度册)

### 2. 日志格式
```markdown
## YYYY-MM-DD 版本更新 vX.Y.Z

### 1. 功能更新
### 2. 文件变更
### 3. 部署配置
### 4. 版本号更新
### 5. Git 操作
### 6. 重要提醒
### 7. 技术实现细节
```

## 五、注意事项

### 1. 每次开发前
- 查看本规范文档(规矩册)
- 检查工作日志(进度册)
- 确认开发环境

### 2. 开发过程中
- 遵循命名规范
- 保持代码整洁
- 及时更新日志

### 3. 开发完成后
- 更新版本号
- 补充文档
- 提交代码

### 4. 路径使用规范
1. 在代码中使用相对路径
```js
// 正确
import WidgetPreview from '@/components/WidgetPreview.vue'

// 错误
import WidgetPreview from 'C:/sun/sun-panel-helper/frontend/src/components/WidgetPreview.vue'
```

2. 在文档中使用相对路径
```markdown
// 正确
- 参考 `frontend/src/components/WidgetPreview.vue`

// 错误
- 参考 `C:/sun/sun-panel-helper/frontend/src/components/WidgetPreview.vue`
```

3. 在配置文件中使用相对路径
```js
// vue.config.js 示例
module.exports = {
  outputDir: 'dist',  // 正确
  outputDir: 'C:/sun/sun-panel-helper/dist'  // 错误
}