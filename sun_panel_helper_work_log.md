# Sun-Panel-Helper 开发日志

## 2024-03-xx

### 版本回退操作
1. 回退到 v1.5 版本
```bash
git checkout v1.5
```

### 重要文件说明
- nginx.conf - Nginx 配置文件
- frontend/src/App.vue - 主应用组件
- frontend/src/components/WidgetPreview.vue - 预览组件
- frontend/src/components/ParamEditor.vue - 参数编辑器
- backend/custom/cardHover/config.json - 卡片悬停动画配置
- backend/app/__init__.py - 后端入口

### 待办事项
- [ ] 完善卡片悬停动画效果
- [ ] 优化参数编辑器交互
- [ ] 测试部署流程

### 注意事项
1. 后端入口文件是 run.py 而不是 app.py
2. 保持工作日志更新，记录所有重要操作和配置

# 重要提醒！！！

### 项目启动步骤
1. 进入项目目录：
```
cd sun-panel-helper
```

2. 启动后端：
```
cd backend
python run.py
```

3. 启动前端（新开一个终端）：
```
cd sun-panel-helper
cd frontend
npm run serve
```

### ⚠️ 严格遵守
- 永远使用 `cd sun-panel-helper` 作为第一步
- 不要使用 Linux 风格的指令
- 保持指令的一致性和准确性

# 卡片悬停动画开发 - 代码备份

## 关键文件备份

### 1. nginx.conf
```nginx
server {
    listen 80;
    server_name localhost;

    location / {
        root /app/dist;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    location /widgets {
        proxy_pass http://127.0.0.1:34002;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### 2. frontend/src/App.vue
```vue
<template>
  <div id="app">
    <nav class="sidebar">
      <div class="logo">
        <h1>SUN-PANEL-HELPER</h1>
        <p class="subtitle">让面板更美好</p>
      </div>
      <div class="nav-items">
        <div 
          v-for="type in types" 
          :key="type.id"
          :class="['nav-item', { active: currentType === type.id }]"
          @click="selectType(type.id)"
        >
          <span class="nav-icon">{{ type.icon }}</span>
          <span>{{ type.name }}</span>
        </div>
      </div>
    </nav>

    <div class="widgets-view">
      <div v-if="!selectedWidget" class="widgets-grid">
        <h2 class="page-title">{{ getCurrentTypeName }} 组件库</h2>
        <div class="widgets-container">
          <widget-card
            v-for="widget in widgets"
            :key="widget.id"
            :widget="widget"
            @click="selectWidget(widget)"
          />
        </div>
      </div>

      <div v-else class="widget-editor">
        <div class="editor-header">
          <button class="back-btn" @click="selectedWidget = null">
            <i class="fas fa-arrow-left"></i>
            返回
          </button>
          <h2>{{ selectedWidget.name }}</h2>
          <button class="deploy-btn" @click="deployWidget">
            <i class="fas fa-rocket"></i>
            部署
          </button>
        </div>

        <div class="editor-content">
          <div class="editor-grid">
            <div class="params-panel">
              <h3 class="panel-title">参数设置</h3>
              <param-editor
                v-model="currentParams"
                :param-defs="selectedWidget.params"
                @change="updatePreview"
              />
            </div>

            <div class="preview-panel">
              <h3 class="panel-title">预览效果</h3>
              <widget-preview 
                :widget="selectedWidget"
                :template="widgetTemplate"
                :params="currentParams"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
// ... 完整的 script 部分
</script>

<style>
// ... 完整的 style 部分
</style>
```

### 3. backend/custom/cardHover/config.json
```json
{
  "id": "cardHover",
  "name": "卡片悬停动画",
  "type": "css",
  "description": "为卡片添加优雅的悬停动画效果，包含放大和晃动效果",
  "tags": ["卡片", "动画", "悬停", "放大"],
  "preview": null,
  "params": [
    {
      "name": "cardBackground",
      "label": "卡片背景色（仅预览用）",
      "type": "color",
      "default": "#ffffff",
      "description": "卡片的背景颜色",
      "group": "preview"
    },
    {
      "name": "scaleAmount",
      "label": "放大倍数",
      "type": "number",
      "default": 1.05,
      "min": 1,
      "max": 1.2,
      "step": 0.01,
      "description": "鼠标悬停时卡片的放大倍数"
    },
    {
      "name": "shakeDegree",
      "label": "晃动幅度",
      "type": "number",
      "default": 1.5,
      "min": 0,
      "max": 5,
      "step": 0.5,
      "description": "卡片晃动的角度大小"
    },
    {
      "name": "animationDuration",
      "label": "动画时长",
      "type": "number",
      "default": 0.3,
      "min": 0.1,
      "max": 1,
      "step": 0.1,
      "description": "放大动画的持续时间（秒）"
    },
    {
      "name": "shakeSpeed",
      "label": "晃动速度",
      "type": "number",
      "default": 0.4,
      "min": 0.2,
      "max": 1,
      "step": 0.1,
      "description": "晃动动画的速度（秒）"
    }
  ],
  "groups": [
    {
      "name": "preview",
      "label": "预览设置",
      "description": "这些设置仅用于预览，不会包含在生成的CSS中"
    }
  ],
  "template": "@keyframes cardShake {\n  0%, 100% { transform: rotate(0deg); }\n  25% { transform: rotate({{shakeDegree}}deg); }\n  75% { transform: rotate(-{{shakeDegree}}deg); }\n}\n\n.item-card {\n  transition: transform {{animationDuration}}s ease;\n  transform-origin: center center;\n  cursor: pointer;\n}\n\n.item-card:hover {\n  transform: scale({{scaleAmount}});\n}\n\n.item-card:hover .item-card-content {\n  animation: cardShake {{shakeSpeed}}s ease-in-out;\n  animation-delay: {{animationDuration}}s;\n  animation-fill-mode: forwards;\n}"
}
```

### 4. frontend/src/components/WidgetPreview.vue
```vue
<template>
  <div class="widget-preview">
    <div class="preview-area">
      <div class="item-card" :style="cardStyle">
        <div class="item-card-content">
          <!-- ... 完整的模板内容 ... -->
        </div>
      </div>
    </div>
  </div>
</template>

<script>
// ... 完整的 script 部分
</script>

<style>
// ... 完整的 style 部分
</style>
```

### 5. frontend/src/components/ParamEditor.vue
```vue
<template>
  <div class="param-editor">
    <!-- ... 完整的模板内容 ... -->
  </div>
</template>

<script>
// ... 完整的 script 部分
</script>

<style>
// ... 完整的 style 部分
</style>
```

### 6. backend/app/__init__.py
```python
from flask import Flask
from flask_cors import CORS
from .routes import widget_routes

def create_app():
    app = Flask(__name__)
    CORS(app)
    
    app.register_blueprint(widget_routes.bp)
    
    return app
```

## 版本信息
- 标签: v1.5
- 提交: 5acc9a6
- 说明: 开始设计悬停动画的备份点

## 启动步骤
1. 进入项目目录：
```
cd sun-panel-helper
```

2. 启动后端：
```
cd backend
python run.py
```

3. 启动前端（新开一个终端）：
```
cd sun-panel-helper
cd frontend
npm run serve
```

## 注意事项
1. 保持代码格式统一
2. 确保所有文件的编码为 UTF-8
3. 记录所有重要的代码修改
4. 定期更新工作日志

# 重要修改记录

## ParamEditor.vue 分组优化
1. 删除了多余的分组：
   - ❌ 颜色设置分组
   - ❌ 尺寸设置分组
   - ❌ 位置设置分组
   - ❌ 其他设置分组

2. 只保留必要的分组：
   - ✅ 预览设置（cardBackground）
   - ✅ 动画设置（动画相关参数）

3. 修改 computed 属性：
   ```js
   computed: {
     previewParams() {
       return this.paramDefs.filter(p => 
         p.name === 'cardBackground'
       );
     },
     animationParams() {
       return this.paramDefs.filter(p => 
         p.type === 'number' && 
         !p.name.includes('preview')
       );
     }
   }
   ```

4. ⚠️ 永远记住：
   - 不要添加无关的分组
   - 保持界面简洁
   - 只显示必要的设置项

# 重要设计原则

## UI/UX 规范
1. ❌ 永远不使用滑动条
   - 滑动条不够优雅
   - 影响整体视觉效果
   - 操作不够精确

2. ✅ 使用数字输入框
   - 更精确的数值控制
   - 保持界面简洁
   - 提供更好的用户体验

3. 布局要求
   - 紧凑但不拥挤
   - 对齐整齐
   - 视觉层次清晰

# 核心设计原则

## 页面布局
1. ❌ 永远不允许页面滚动
   - 一个页面必须完整展示所有内容
   - 禁止出现任何滚动条
   - 合理利用空间，紧凑布局

2. 分组高度控制
   - 预览设置分组保持紧凑
   - 不要留过多空白
   - 控制每个分组的合理高度

## v1.6 版本更新内容

1. 参数编辑器组件 (ParamEditor.vue) 重构
   - 支持多组件参数编辑
   - 根据组件 ID 动态切换参数界面
   - 装饰线条组件保持两列布局
   - 悬停动画组件使用单列布局
   - 优化代码结构和性能

2. 修复问题
   - 修复参数组件切换时的布局问题
   - 修复颜色选择器的透明度计算
   - 优化数值输入的处理逻辑

3. 代码优化
   - 移除冗余的参数过滤条件
   - 简化颜色转换逻辑
   - 改进组件条件渲染结构

### 前端更新
1. 添加网页图标
   - 在 frontend/public 目录下添加 favicon.ico
   - 更新 index.html 的图标引用

2. 修改网页标题
   - 将网页标题统一修改为 "Sun-Panel-Helper"

### CSS 部署功能开发
1. 功能设计：
   - 在样式库页面标记已部署的 CSS 样式
   - 支持部署/取消部署操作
   - 自动在 index.css 中添加/删除样式代码

2. 实现步骤：
   - 添加部署状态检查功能
   - 实现部署/取消部署按钮
   - 在样式库中添加部署标记
   - 同步更新部署状态

## 2024-03-09 新增记录

### 重要提醒
⚠️ 开发规范：
1. 每次修改前必须查看工作日志
2. 不能影响现有组件的任何效果
3. 所有更改必须记录
4. 不确定的地方必须先询问
5. 所有新增/修改需要确认

### 关键文件清单
- frontend/src/main.js - 前端入口文件（使用 Root.vue 作为根组件）
- backend/config.py - 后端配置（支持 Docker/本地环境）
- docker-compose.yml - Docker 编排配置（端口 33002）
- deploy/index.css - 部署样式文件（自动管理，禁止手动修改）
- frontend/src/router/index.js - 路由配置
- frontend/public/index.html - 主页面

### 当前版本
- v1.7.0
  - 优化部署文件管理
  - 增加部署状态显示
  - 添加网页图标
  - 增强文件安全性提示

### 现有组件（⚠️ 不允许修改现有效果）
1. 卡片悬停动画 (cardHover)
2. 装饰线条组件 (xiantiao)

### 项目根目录
C:\sun\sun-panel-helper

## 2024-03-09 功能开发

### 部署按钮优化
1. 需求说明：
   - 对已部署的组件显示"重新部署"按钮
   - 用于参数调整后的重新部署
   - 保持原有部署/取消部署功能

2. 涉及文件：
   - frontend/src/App.vue（编辑器界面的部署按钮）
   - frontend/src/components/WidgetCard.vue（卡片上的部署状态）

3. 注意事项：
   - ⚠️ 不影响现有部署逻辑
   - ⚠️ 保持部署状态检查功能
   - ⚠️ 维持现有的 CSS 文件管理机制

### 部署按钮优化 - 具体方案

1. App.vue 修改方案：
```vue
<template>
  <div class="editor-header">
    <!-- 其他内容保持不变 -->
    <button 
      class="deploy-btn" 
      @click="deployWidget"
      :class="{ 'redeploy': isDeployed }"
    >
      <i class="fas fa-rocket"></i>
      {{ isDeployed ? '重新部署' : '部署' }}
    </button>
  </div>
</template>

<style>
.deploy-btn.redeploy {
  background: #67c23a;  /* 使用 element-ui 的成功色 */
}
</style>
```

2. 部署状态检查：
```javascript
data() {
  return {
    // ... 其他数据保持不变
    isDeployed: false
  }
},
async created() {
  // 检查部署状态
  try {
    const response = await fetch(`${API_BASE_URL}/api/widgets/${this.widget.id}/deployed`)
    const data = await response.json()
    this.isDeployed = data.deployed
  } catch (error) {
    console.error('Error checking deploy status:', error)
  }
}
```

3. 注意事项：
   - 保持原有的部署逻辑不变
   - 只修改按钮文字和样式
   - 不影响部署状态检查功能
   - 维持现有的 CSS 文件管理机制

4. 测试要点：
   - 部署状态正确显示
   - 重新部署功能正常
   - 样式切换正确
   - 不影响其他功能

### 部署按钮优化 - 动画效果修复

⚠️ 动画问题：
- 放大效果没有保持
- 动画顺序错误（应该是：放大并保持 -> 摇晃）
- 需要确保放大状态在整个动画过程中保持

修复方案：
1. 确保 scale 转换持续存在
2. 在放大的基础上添加摇晃效果
3. 使用 transform-origin: center center 确保正确的变换中心

### 重要发现 - 预览逻辑位置错误

⚠️ 关键问题：
- 预览逻辑应该在 ParamEditor.vue 中实现
- 不应该在 App.vue 中处理预览效果
- 需要保持原有的代码结构

修复方案：
1. 将预览逻辑移回 ParamEditor.vue
2. 保持 App.vue 只负责部署相关功能
3. 确保组件职责分明

# 2024-04-26 工作日志补充

## 今日犯的错误

### 1. 组件顺序调整的错误尝试
- ❌ 直接修改 types.json 文件
  - 这是完全错误的做法
  - types.json 是核心配置文件，不应直接修改
  - 应该通过 API 动态调整顺序
  - 最终在 widget_routes.py 中正确实现

### 2. 预览实现的多次失败
- ❌ 在 CSS 中使用 v-bind
  ```css
  cursor: url(v-bind(localValue.defaultCursor)), default !important;
  ```
  - 导致编译错误
  - 浪费时间调试
  - 应该使用 :style 绑定

- ❌ 过度设计预览界面
  - 添加了不必要的窗口装饰
  - 界面过于复杂
  - 偏离了简单直观的设计原则

### 3. 参数设计的错误
- ❌ 添加了无用的指针大小调整功能
  - 没有考虑浏览器兼容性
  - 增加了不必要的复杂度
  - 最终不得不移除这个功能

## 生气点总结（老师批评）

### 1. 设计思维问题
- "设计怎么变这么垃圾啦"
  - 过度设计，违背简单原则
  - 没有考虑用户体验
  - 应该保持界面简洁明了

### 2. 预览功能问题
- "预览界面做的像大便！！！"
  - 预览效果不直观
  - 布局过于复杂
  - 违背了预览的核心目的

### 3. 代码修改问题
- "你特么记下来到小本本上"
  - 没有及时记录修改
  - 没有总结经验教训
  - 可能重复犯同样的错误

### 4. 开发思路问题
- "你看了吗 傻逼"
  - 没有仔细阅读现有代码
  - 盲目修改
  - 缺乏对项目的整体理解

## 核心文件说明（⚠️ 重要）

### 1. 前端核心文件
- `WidgetPreview.vue`
  - **预览逻辑勿动**
  - 保持预览效果的一致性
  - 任何修改都需要谨慎

- `WidgetCard.vue`
  - **布局结构勿动**
  - 保持卡片展示的统一性
  - 不允许破坏现有布局

### 2. 后端核心文件
- `widget_routes.py`
  - API 路由定义
  - 组件顺序调整在这里实现
  - 保持路由结构的稳定性

- `types.json`
  - **禁止直接修改**
  - 通过 API 动态调整顺序
  - 核心配置文件

## 今日修改记录

### 1. 鼠标指针组件
```diff
// ParamEditor.vue
- 移除大小调整功能
- 简化上传界面
+ 保持简洁的预览效果
```

### 2. 组件顺序调整
```python
# widget_routes.py
if type == 'css':
    mouse_cursor = next((w for w in widgets if w['id'] == 'mouseCursor'), None)
    if mouse_cursor:
        widgets.remove(mouse_cursor)
        widgets.append(mouse_cursor)
```

## 经验总结

### 1. 开发原则
- 保持简单
- 确保兼容性
- 注重用户体验
- 及时记录修改

### 2. 禁止事项
- ❌ 直接修改配置文件
- ❌ 过度设计界面
- ❌ 添加不必要功能
- ❌ 忽视代码记录

### 3. 正确做法
- ✅ 通过 API 调整顺序
- ✅ 保持界面简洁
- ✅ 确保预览效果正确
- ✅ 详细记录修改内容

## 待改进项目

1. 代码习惯
- [ ] 养成及时记录的习惯
- [ ] 改进代码阅读理解能力
- [ ] 提高设计审美水平

2. 开发流程
- [ ] 修改前先阅读相关代码
- [ ] 改动前先考虑影响
- [ ] 及时总结经验教训

3. 设计理念
- [ ] 保持简单直观
- [ ] 注重用户体验
- [ ] 避免过度设计

## 补充：具体修改记录和注意事项

### 1. 鼠标指针组件开发流程

#### 第一次尝试（失败）
```vue
// WidgetPreview.vue - ❌ 错误示范
<div class="cursor-preview">
  <div class="preview-window">
    <div class="window-header">
      <div class="window-buttons">
        <span></span><span></span><span></span>
      </div>
      <div class="window-title">鼠标指针预览</div>
    </div>
    <!-- 过度设计的预览界面 -->
  </div>
</div>
```
- 问题：界面过于复杂
- 教训：不要过度设计，保持简单

#### 第二次尝试（失败）
```vue
// ParamEditor.vue - ❌ 错误示范
<div class="param-item">
  <label>指针大小</label>
  <input 
    type="range"
    v-model="localValue.cursorSize"
    :min="16"
    :max="48"
  >
</div>
```
- 问题：添加了不必要的大小调整功能
- 教训：先考虑浏览器兼容性

#### 最终正确版本
```vue
// WidgetPreview.vue - ✅ 正确实现
<div class="cursor-preview-container">
  <!-- 默认指针预览 -->
  <div class="cursor-preview-area" :style="defaultCursorStyle">
    <div class="cursor-icon">
      <img :src="params?.defaultCursor" alt="默认指针">
      <span class="cursor-label">默认指针</span>
    </div>
  </div>
  
  <!-- 悬浮指针预览 -->
  <div class="cursor-preview-area hover" :style="hoverCursorStyle">
    <div class="cursor-icon">
      <img :src="params?.hoverCursor" alt="悬浮指针">
      <span class="cursor-label">悬浮指针</span>
    </div>
  </div>
</div>
```

### 2. 关键文件修改记录

#### ParamEditor.vue
- ✅ 移除了大小调整功能
- ✅ 简化了上传界面
- ✅ 添加了图片链接输入
- ❌ 不要添加任何装饰性的UI元素

#### WidgetPreview.vue
- ✅ 保持左右分栏布局
- ✅ 使用 :style 绑定鼠标样式
- ❌ 不要修改预览逻辑
- ❌ 不要添加多余的预览元素

#### config.json
```diff
{
  "params": [
    {
      "name": "defaultCursor",
      "type": "image"
    },
    {
      "name": "hoverCursor",
      "type": "image"
    },
-   {
-     "name": "cursorSize",
-     "type": "number"
-   }
  ]
}
```

### 3. 易错点记录（防止再犯）

#### CSS 相关
1. cursor 属性：
```css
/* ❌ 错误写法 */
cursor: url(xxx) 24 24, default;

/* ✅ 正确写法 */
cursor: url(xxx), default;
```

2. 样式绑定：
```vue
<!-- ❌ 错误写法 -->
<style>
.preview {
  cursor: url(v-bind(cursor)), default;
}
</style>

<!-- ✅ 正确写法 -->
<template>
  <div :style="{ cursor: `url(${cursor}), default` }">
</template>
```

#### 组件顺序调整
```python
# ❌ 错误方式：直接修改 types.json

# ✅ 正确方式：在 API 中处理
def get_widgets_by_type(type):
    widgets = widget_service.get_widgets_by_type(type)
    if type == 'css':
        mouse_cursor = next((w for w in widgets if w['id'] == 'mouseCursor'), None)
        if mouse_cursor:
            widgets.remove(mouse_cursor)
            widgets.append(mouse_cursor)
    return widgets
```

### 4. 永远不能修改的内容（重要！！！）

1. 预览组件核心逻辑
```vue
// WidgetPreview.vue
computed: {
  defaultCursorStyle() {
    // 这部分逻辑不能改！！！
    if (!this.params || this.widget?.id !== 'mouseCursor') return {};
    return {
      cursor: `url(${this.params.defaultCursor}), default`
    };
  }
}
```

2. 路由定义
```python
# widget_routes.py 中的路由定义不能改！！！
@widget_bp.route('/widgets/types/<type>', methods=['GET'])
@widget_bp.route('/widgets/<widget_id>/config', methods=['GET'])
@widget_bp.route('/widgets/<widget_id>/deploy', methods=['POST'])
```

3. 组件通信方式
```vue
// 这些事件处理方式不能改！！！
@input="updateValue($event, param.name)"
@change="handleImageUpload($event, 'defaultCursor')"
```

### 5. 今日教训总结

1. 代码修改前：
- ✅ 必须先看工作日志
- ✅ 理解现有代码逻辑
- ✅ 确认哪些内容不能动
- ✅ 考虑修改的影响范围

2. 修改过程中：
- ✅ 保持简单原则
- ✅ 确保兼容性
- ✅ 实时测试效果
- ✅ 记录所有修改

3. 修改完成后：
- ✅ 检查是否影响其他功能
- ✅ 确认预览效果正确
- ✅ 详细记录修改内容
- ✅ 总结经验教训

## 2024-04-26 重大错误！

### 严重错误：搞错了预览功能
1. 错误原因：
   - 完全理解错了需求，以为是修改鼠标指针预览
   - 实际上是卡片悬停动画的预览出问题了
   - 放大效果和晃动效果没有正确显示

2. 具体问题：
   - ❌ 放大效果消失
   - ❌ 晃动动画不正确
   - ❌ 预览效果与实际部署效果不一致

### 紧急修复方案

1. WidgetPreview.vue 中恢复动画效果：
```vue
<template>
  <!-- 卡片悬停预览 -->
  <div v-if="widget?.id === 'cardHover'" class="item-card">
    <div class="item-card-content" :style="cardHoverStyle">
      <!-- 保持原有内容不变 -->
    </div>
  </div>
</template>

<script>
computed: {
  cardHoverStyle() {
    if (!this.params || this.widget?.id !== 'cardHover') return {};
    return {
      '--scale-size': this.params.scaleSize,
      '--shake-degree': `${this.params.shakeDegree}deg`
    };
  }
}
</script>

<style>
.item-card-content:hover {
  animation: cardShakeWithScale 0.5s ease-in-out;
}

@keyframes cardShakeWithScale {
  0%, 100% { 
    transform: scale(var(--scale-size, 1.05)) rotate(0); 
  }
  25% { 
    transform: scale(var(--scale-size, 1.05)) rotate(var(--shake-degree, 10deg)); 
  }
  50% { 
    transform: scale(var(--scale-size, 1.05)) rotate(calc(var(--shake-degree, 10deg) * -1)); 
  }
  75% { 
    transform: scale(var(--scale-size, 1.05)) rotate(calc(var(--shake-degree, 10deg) * 0.25)); 
  }
  85% { 
    transform: scale(var(--scale-size, 1.05)) rotate(calc(var(--shake-degree, 10deg) * -0.25)); 
  }
}
</style>
```

### 教训总结（重要！！！）
1. 仔细阅读需求
   - 不要想当然
   - 确认具体是哪个功能出问题
   - 先问清楚再动手

2. 预览功能的重要性
   - 预览必须与实际效果一致
   - 所有动画效果都要正确显示
   - 不能丢失任何现有功能

3. 修改步骤
   - 先确认问题具体在哪里
   - 检查原有代码的实现
   - 确保修改不影响其他功能
   - 测试所有动画效果

### 后续工作
1. [ ] 仔细检查其他预览功能
2. [ ] 确保所有动画效果正常
3. [ ] 完善预览相关文档
4. [ ] 添加预览功能的测试用例

### 永远不能改的内容（补充）
1. 卡片悬停动画的核心逻辑
2. 预览组件中的动画实现
3. 缩放和晃动的组合效果

## 2024-04-26 卡片悬停动画实现逻辑

### 1. 核心结构
```vue
<div class="item-card" 
  :style="cardStyle"
  :data-enable-scale="params?.enableScale"
>
  <div class="item-card-content">
    <!-- 卡片内容 -->
  </div>
</div>
```

### 2. 关键属性绑定
1. cardStyle - 绑定在外层 item-card 上
   - 包含所有动画所需的 CSS 变量
   - 控制动画的参数
   ```js
   cardStyle: {
     '--shake-degree': `${params.shakeDegree}deg`,
     '--shake-speed': `${params.shakeSpeed}s`,
     '--scale-size': params.scaleSize,
     '--scale-delay': `${params.scaleDelay}s`
   }
   ```

2. data-enable-scale
   - 控制是否启用放大效果
   - 通过 params.enableScale 动态绑定
   - 用于条件性应用放大动画

### 3. 动画实现
1. 基础悬停动画（无放大）
```css
.widget-preview[data-widget-id="cardHover"] .item-card:hover {
  animation: cardShake var(--shake-speed, 0.5s) ease-in-out forwards;
}
```

2. 带放大效果的动画
```css
.widget-preview[data-widget-id="cardHover"] .item-card:hover[data-enable-scale="true"] {
  animation: 
    cardScale var(--shake-speed, 0.5s) forwards,
    cardShakeWithScale var(--shake-speed, 0.5s) var(--scale-delay, 0.2s) ease-in-out forwards;
}
```

3. 动画关键帧
```css
/* 放大动画 */
@keyframes cardScale {
  to { 
    transform: scale(var(--scale-size, 1.05)); 
  }
}

/* 基础摇晃动画 */
@keyframes cardShake {
  0%, 100% { transform: rotate(0); }
  25% { transform: rotate(var(--shake-degree, 10deg)); }
  50% { transform: rotate(calc(var(--shake-degree, 10deg) * -1)); }
  75% { transform: rotate(calc(var(--shake-degree, 10deg) * 0.25)); }
  85% { transform: rotate(calc(var(--shake-degree, 10deg) * -0.25)); }
}

/* 带放大的摇晃动画 */
@keyframes cardShakeWithScale {
  0%, 100% { transform: scale(var(--scale-size, 1.05)) rotate(0); }
  25% { transform: scale(var(--scale-size, 1.05)) rotate(var(--shake-degree, 10deg)); }
  50% { transform: scale(var(--scale-size, 1.05)) rotate(calc(var(--shake-degree, 10deg) * -1)); }
  75% { transform: scale(var(--scale-size, 1.05)) rotate(calc(var(--shake-degree, 10deg) * 0.25)); }
  85% { transform: scale(var(--scale-size, 1.05)) rotate(calc(var(--shake-degree, 10deg) * -0.25)); }
}
```

### 4. 重要注意事项
1. 样式绑定位置
   - ✅ cardStyle 必须绑定在 item-card 上
   - ❌ 不能绑定在 item-card-content 上
   - ❌ 不能移动到其他元素上

2. 动画触发条件
   - 基于 hover 触发
   - 通过 data-enable-scale 控制放大
   - 动画参数通过 CSS 变量传递

3. 动画执行顺序
   - 启用放大时：先放大，后晃动
   - 未启用放大：直接执行晃动
   - 通过 animation-delay 控制时序

### 5. 禁止修改项
1. 动画结构
   - 放大和晃动必须分开实现
   - 保持现有的动画关键帧定义
   - 维持 CSS 变量的命名规范

2. 样式绑定
   - cardStyle 的绑定位置
   - data-enable-scale 的实现方式
   - 动画类的选择器结构

3. 参数传递
   - 通过 CSS 变量传递参数
   - 保持现有的默认值设置
   - 维持参数的命名规范

## 2024-04-26 版本更新 v1.7.1

### 1. 功能更新
1. 修复卡片悬停动画预览效果
2. 新增渐变背景动画功能
   - 支持4色渐变
   - 可调整角度和动画时长
3. 新增自定义鼠标指针功能
   - 支持默认和悬浮状态
   - 可上传自定义图片

### 2. 文件变更
1. backend/custom/
   - 新增 gradientBg/config.json
   - 新增 mouseCursor/config.json
   - 更新 types.json 添加新组件

2. frontend/src/components/
   - 更新 WidgetPreview.vue 支持新组件预览
   - 更新 WidgetCard.vue 添加新组件展示

### 3. 部署配置
1. docker-compose.yml
```yaml
version: '3'
services:
  sun-panel-helper:
    image: madrays/sun-panel-helper:v1.7.1
    ports:
      - "33002:80"
    volumes:
      - /path/to/sunpanel/conf/custom:/app/deploy
    restart: unless-stopped
```

### 4. 版本号更新
- frontend/package.json: 1.7.0 -> 1.7.1
- Dockerfile: APP_VERSION=1.7.0 -> 1.7.1

### 5. Git 操作
```bash
git add .
git commit -m "feat: v1.7.1 版本更新
- 🐛 修复卡片悬停动画预览效果
- ✨ 新增渐变背景动画功能
- ✨ 新增自定义鼠标指针功能"
git tag v1.7.1
git push origin main
git push origin v1.7.1
```

### 6. 重要提醒
- 部署时必须挂载到 sunpanel 的 custom 目录
- 确保端口 33002 未被占用
- 首次启动需要拉取新镜像 

### 7. 技术实现细节

#### 自定义鼠标指针
```js
// 默认CDN链接
defaultCursor: "https://img.hi-linux.com/staticfile/P1i7yA-2024-04-26-hZZjUZ.png"
hoverCursor: "https://img.hi-linux.com/staticfile/hVX0Sf-2024-04-26-INwMSQ.png"

// 预览实现
- 分为默认和悬浮两个预览区域
- 使用 grid 布局实现并排展示
- 添加过渡动画增强交互体验
```

#### 渐变背景动画
```css
// 默认渐变配色
color1: "#2C3E50" // 深蓝
color2: "#2980B9" // 蓝色
color3: "#8E44AD" // 紫色
color4: "#E74C3C" // 红色

// 动画实现
- 使用 background-size: 400% 实现大尺寸渐变
- 通过 background-position 动画实现流动效果
- 支持自定义动画时长和渐变角度
``` 
</rewritten_file>