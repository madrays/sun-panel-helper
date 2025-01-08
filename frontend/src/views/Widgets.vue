<template>
  <div class="widgets-view">
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

    <main class="main-content">
      <!-- 组件列表视图 -->
      <div v-if="!selectedWidget" class="widgets-grid">
        <h2 class="page-title">{{ getCurrentTypeName }} 组件库</h2>
        <div class="widgets-container">
          <widget-card
            v-for="widget in currentWidgets"
            :key="widget.id"
            :widget="widget"
            @click="selectWidget(widget)"
          />
        </div>
      </div>

      <!-- 组件编辑视图 -->
      <div v-else class="widget-editor">
        <div class="editor-header">
          <button class="back-btn" @click="selectedWidget = null">
            <span class="back-icon">←</span>
            返回列表
          </button>
          <h2>{{ selectedWidget.name }}</h2>
          <button class="deploy-btn">
            <i class="fas fa-rocket"></i>
            部署
          </button>
        </div>
        
        <div class="editor-content">
          <div class="editor-grid">
            <div class="params-panel">
              <h3 class="panel-title">参数设置</h3>
              <param-editor
                v-model="widgetParams"
                :param-defs="selectedWidget.params"
                :widget="selectedWidget"
                @change="updatePreview"
              />
            </div>
            
            <div class="preview-panel">
              <h3 class="panel-title">预览效果</h3>
              <widget-preview 
                :widget="selectedWidget"
                :template="widgetTemplate"
                :params="widgetParams"
              />
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script>
import WidgetCard from '../components/WidgetCard.vue'
import WidgetPreview from '../components/WidgetPreview.vue'
import ParamEditor from '../components/ParamEditor.vue'

export default {
  name: 'Widgets',
  components: {
    WidgetCard,
    WidgetPreview,
    ParamEditor
  },
  data() {
    return {
      types: [
        { id: 'css', name: 'CSS 样式', icon: '🎨' },
        { id: 'js', name: 'JS 脚本', icon: '📜' }
      ],
      currentType: 'css',
      widgets: [],
      selectedWidget: null,
      widgetTemplate: '',
      widgetParams: {}
    }
  },
  computed: {
    getCurrentTypeName() {
      const type = this.types.find(t => t.id === this.currentType)
      return type ? type.name : ''
    },
    currentWidgets() {
      return this.widgets.filter(w => w.type === this.currentType)
    }
  },
  methods: {
    selectType(typeId) {
      this.currentType = typeId
      this.selectedWidget = null
    },
    async selectWidget(widget) {
      try {
        this.selectedWidget = widget;
        
        // 根据不同的组件ID加载不同的配置
        const configPath = widget.id === 'xiantiao' 
          ? '/api/widgets/xiantiao/config'
          : `/api/widgets/${widget.id}/config`;
          
        const response = await fetch(configPath);
        const config = await response.json();
        
        this.widgetTemplate = config.template;
        this.widgetParams = {};
        
        // 初始化参数默认值
        if (config.params) {
          config.params.forEach(param => {
            this.widgetParams[param.name] = param.default;
          });
        }
        
        this.updatePreview();
      } catch (error) {
        console.error('Error loading widget:', error);
      }
    },
    updatePreview() {
      console.log('Updated params:', this.widgetParams)
    }
  },
  async created() {
    try {
      const response = await fetch('http://localhost:3000/api/widgets')
      this.widgets = await response.json()
    } catch (error) {
      console.error('Failed to fetch widgets:', error)
    }
  }
}
</script>

<style>
.widgets-view {
  display: flex;
  height: 100vh;
}

.sidebar {
  width: 240px;
  background: white;
  border-right: 1px solid #eee;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.logo {
  text-align: center;
}

.logo h1 {
  font-size: 1.2rem;
  color: #2c3e50;
  margin-bottom: 0.5rem;
}

.subtitle {
  font-size: 0.9rem;
  color: #666;
}

.nav-items {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.nav-item {
  padding: 0.75rem 1rem;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
}

.nav-item:hover {
  background: #f5f7fa;
}

.nav-item.active {
  background: var(--primary-color);
  color: white;
}

.nav-icon {
  margin-right: 0.75rem;
  font-size: 1.2rem;
}

.main-content {
  flex: 1;
  padding: 2rem;
  overflow-y: auto;
  background: #f8f9fa;
}

.page-title {
  margin-bottom: 2rem;
  font-size: 1.5rem;
  color: #2c3e50;
}

.widgets-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2rem;
}

.editor-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
}

.back-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border: none;
  background: none;
  color: #666;
  cursor: pointer;
  font-size: 0.9rem;
}

.back-btn:hover {
  color: var(--primary-color);
}

.back-icon {
  font-size: 1.2rem;
}

.editor-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  align-items: start;
}

.widget-editor {
  background: white;
  border-radius: 12px;
  padding: 2rem;
}
</style> 