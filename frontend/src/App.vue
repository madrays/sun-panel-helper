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
            <!-- 参数面板 -->
            <div class="params-panel">
              <h3 class="panel-title">参数设置</h3>
              <param-editor
                v-model="widgetParams"
                :param-defs="selectedWidget.params"
                :widget="selectedWidget"
                @change="updatePreview"
              />
            </div>
            
            <!-- 预览面板 -->
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
import WidgetCard from './components/WidgetCard.vue'
import ParamEditor from './components/ParamEditor.vue'
import WidgetPreview from './components/WidgetPreview.vue'
import { API_BASE_URL } from './config'

export default {
  components: {
    WidgetCard,
    ParamEditor,
    WidgetPreview
  },
  data() {
    return {
      types: [
        { id: 'css', name: 'CSS 样式库', icon: '🎨' },
        { id: 'js', name: 'JS 功能库', icon: '⚡' },
        { id: 'widget', name: '组件库', icon: '🧩' }
      ],
      currentType: 'widget',
      currentWidgets: [],
      selectedWidget: null,
      widgetTemplate: '',
      widgetParams: {}
    }
  },
  computed: {
    getCurrentTypeName() {
      const currentType = this.types.find(function(t) {
        return t.id === this.currentType;
      }.bind(this));
      return currentType ? currentType.name : '';
    }
  },
  methods: {
    async selectType(type) {
      try {
        console.log(`Selecting type: ${type}`);
        this.currentType = type;
        this.selectedWidget = null;
        const response = await fetch(`${API_BASE_URL}/api/widgets/types/${type}`, {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log('Received widgets:', data);
        this.currentWidgets = data;
      } catch (error) {
        console.error('Error fetching widgets:', error);
      }
    },
    async selectWidget(widget) {
      try {
        this.selectedWidget = widget;
        const [templateRes, configRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/widgets/${widget.id}/template`),
          fetch(`${API_BASE_URL}/api/widgets/${widget.id}/config`)
        ]);
        
        if (!templateRes.ok || !configRes.ok) {
          throw new Error('Failed to load widget data');
        }
        
        const config = await configRes.json();
        this.widgetTemplate = await templateRes.text();
        
        // 初始化参数值
        this.widgetParams = Object.fromEntries(
          config.params.map(param => [param.name, param.default])
        );

        // 立即应用预览
        this.$nextTick(this.updatePreview);
      } catch (error) {
        console.error('Error loading widget:', error);
        this.$toast.error('加载组件失败');
      }
    },
    async deployWidget() {
      try {
        const response = await fetch(`${API_BASE_URL}/api/widgets/${this.selectedWidget.id}/deploy`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(this.widgetParams)
        });
        
        if (!response.ok) {
          throw new Error('部署失败');
        }
        
        const result = await response.json();
        if (result.success) {
          this.$toast.success('部署成功！');
        } else {
          this.$toast.error(result.message || '部署失败');
        }
      } catch (error) {
        console.error('Deploy error:', error);
        this.$toast.error('部署失败');
      }
    },
    updatePreview() {
      console.log('Updated params:', this.widgetParams);
    },
    async fetchWidgets() {
      try {
        const response = await fetch(`${API_BASE_URL}/api/widgets/types/css`);
        const data = await response.json();
        return data;
      } catch (error) {
        console.error('Failed to fetch widgets:', error);
        throw error;
      }
    }
  },
  mounted() {
    this.selectType(this.currentType)
  },
  created() {
    // 如果有查询参数，设置默认选中的类型
    if (this.$route.query.type) {
      this.currentType = this.$route.query.type;
    }
    
    // 获取组件列表
    this.fetchWidgets();
  }
}
</script>

<style>
:root {
  --primary-color: #4CAF50;
  --sidebar-width: 240px;
  --header-height: 60px;
}

#app {
  display: flex;
  min-height: 100vh;
}

.sidebar {
  width: var(--sidebar-width);
  background: #fff;
  border-right: 1px solid #eee;
  padding: 1rem;
}

.logo {
  text-align: center;
  padding: 1.5rem;
  margin-bottom: 2rem;
  border-bottom: 1px solid #eee;
}

.logo h1 {
  font-size: 1.4rem;
  font-weight: bold;
  background: linear-gradient(45deg, #4CAF50, #2196F3);
  background-clip: text;
  -webkit-background-clip: text;
  color: transparent;
  margin-bottom: 0.5rem;
}

.logo .subtitle {
  font-size: 0.9rem;
  color: #666;
}

.nav-items {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.nav-item {
  display: flex;
  align-items: center;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
}

.nav-item:hover {
  background: #f5f5f5;
}

.nav-item.active {
  background: var(--primary-color);
  color: white;
}

.nav-item i {
  margin-right: 0.75rem;
}

.main-content {
  flex: 1;
  padding: 2rem;
  background: #f9f9f9;
  width: 100%;
}

.widgets-grid {
  max-width: 1200px;
  margin: 0 auto;
}

.page-title {
  margin-bottom: 2rem;
  font-size: 1.5rem;
  color: #333;
}

.widgets-container {
  width: 100%;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
}

.widget-editor {
  height: 100%;
}

.editor-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
}

.back-btn, .deploy-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
}

.back-btn {
  background: #f5f5f5;
}

.deploy-btn {
  background: var(--primary-color);
  color: white;
}

.editor-content {
  height: auto;
}

.editor-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.6rem;
  height: calc(100% - 3rem);
  padding: 0.8rem;
}

.preview-panel, .params-panel {
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  display: flex;
  flex-direction: column;
}

.preview-panel {
  height: fit-content;
  min-height: 300px;
}

.params-panel {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  height: 750px;
  width: 100%;
  overflow: hidden;
}

.panel-title {
  font-size: 1rem;
  color: #2c3e50;
  margin: 0;
  padding: 0.5rem 0.8rem;
  border-bottom: 1px solid #eee;
}

.nav-icon {
  margin-right: 0.75rem;
  font-size: 1.2rem;
}

.widgets-view {
  display: flex;
  min-height: 100vh;
  width: 100%;
}
</style> 