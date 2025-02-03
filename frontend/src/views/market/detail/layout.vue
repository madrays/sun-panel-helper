<template>
  <div class="detail-layout">
    <!-- 头部信息 -->
    <div class="header-section">
      <div class="title-area">
        <h2>{{ title }}</h2>
        <p class="description">{{ description }}</p>
      </div>
      <div class="actions">
        <el-button @click="handleReset">重置参数</el-button>
      </div>
    </div>

    <!-- 主体内容 -->
    <div class="main-content">
      <!-- 左侧参数配置 -->
      <div class="params-section">
        <div class="section-title">参数配置</div>
        <div class="params-form">
          <slot name="params"></slot>
        </div>
      </div>

      <!-- 右侧内容 -->
      <div class="right-section">
        <!-- 应用设置 -->
        <div class="deploy-area">
          <div class="section-title">应用设置</div>
          <div class="deploy-options">
            <div class="deploy-group">
              <div class="deploy-row">
                <div class="deploy-title">
                  <span class="deploy-icon fixed-icon"></span>
                  应用到固定组件
                </div>
                <div class="deploy-actions">
                  <el-button 
                    v-if="!isInFixed"
                    type="primary" 
                    @click="addToFixed"
                  >
                    添加到固定组件池
                  </el-button>
                  <el-button 
                    v-else
                    type="success" 
                    @click="addToFixed"
                  >
                    重新添加
                  </el-button>
                  <el-button 
                    v-if="isInFixed"
                    type="warning"
                    plain
                    @click="showFixedTip"
                  >
                    已添加到固定组件池
                  </el-button>
                </div>
              </div>

              <div class="deploy-row">
                <div class="deploy-title">
                  <span class="deploy-icon free-icon"></span>
                  应用到自由组件
                </div>
                <div class="deploy-actions">
                  <el-button 
                    v-if="!isAppliedToFree"
                    type="primary" 
                    @click="handleApplyToFree"
                  >
                    添加到自由组件池
                  </el-button>
                  <el-button 
                    v-else
                    type="success" 
                    @click="handleApplyToFree"
                  >
                    重新添加
                  </el-button>
                  <el-button 
                    v-if="isAppliedToFree"
                    type="warning"
                    plain
                    @click="showFreeTip"
                  >
                    已添加到自由组件池
                  </el-button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 预览区域 -->
        <div class="preview-area">
          <div class="section-title">
            效果预览
            <div class="preview-controls">
              <span class="preview-tip">背景色：</span>
              <el-color-picker 
                v-model="previewBgColor"
                size="small"
                :show-alpha="false"
                :predefine="[
                  'var(--el-bg-color-page)',
                  '#000000',
                  '#1a1a1a',
                  '#242424',
                  '#ffffff'
                ]"
              />
            </div>
          </div>
          <div 
            class="preview-container" 
            :style="{ '--preview-bg': previewBgColor }"
          >
            <slot name="preview"></slot>
          </div>
        </div>

        <!-- 使用说明 -->
        <div class="guide-area">
          <div class="section-title">使用说明</div>
          <div class="guide-content">
            <p>本组件支持应用到以下两种场景：</p>
            <ul>
              <li>
                <span class="dot fixed-dot"></span>
                <strong>固定组件：</strong>
                应用后将在固定组件池显示，适合作为页面的固定展示内容，从组件池移除请在组件池操作
              </li>
              <li>
                <span class="dot free-dot"></span>
                <strong>自由组件：</strong>
                应用后可在自由组件池显示，支持自由拖拽位置和调整大小，从组件池移除请在组件池操作
              </li>
            </ul>
            <div class="tips">
              <el-icon><InfoFilled /></el-icon>
              <span>提示：两种应用方式可以同时使用，互不影响，组件池不影响已部署内容</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { InfoFilled } from '@element-plus/icons-vue'
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { ElMessage } from 'element-plus'
import request from '@/utils/request'
import { eventBus } from '@/utils/eventBus'
import type { Widget } from '@/types/market'  // 导入统一的 Widget 类型

// 组件池中的组件类型
interface PoolWidget {
  id: number
  name: string
  url: string
  type: string
  source: 'market' | 'custom'
  width: number
  height: number
  mobileShow: boolean
}

interface Props {
  title: string
  description: string
  widget: Widget
  isAppliedToFree: boolean
}

const props = defineProps<Props>()
const emit = defineEmits<{
  (e: 'reset'): void
  (e: 'update:isAppliedToFree', value: boolean): void
}>()

const handleReset = () => {
  emit('reset')
}

// 是否已添加到固定组件
const isInFixed = ref(false)

// 检查组件是否在固定组件池中
const checkFixedStatus = async () => {
  try {
    const res = await request({
      url: '/api/fixed/pool',
      method: 'GET'
    })
    
    console.log('获取到的完整响应:', res)
    
    // 直接使用 res.widgets
    const poolWidgets = res.widgets || []
    console.log('组件池列表:', poolWidgets)
    console.log('当前组件名称:', props.widget.name)
    
    // 检查是否存在相同名称的组件
    isInFixed.value = poolWidgets.some((w: PoolWidget) => w.name === props.widget.name)
    console.log('是否已应用:', isInFixed.value)
  } catch (error) {
    console.error('检查固定组件状态失败:', error)
  }
}

// 添加到固定组件
const addToFixed = async () => {
  try {
    const res = await request({
      url: '/api/fixed/pool',
      method: 'GET'
    })
    
    const poolWidgets = res.widgets || []
    console.log('当前组件池:', poolWidgets)
    
    // 检查是否已存在相同名称的组件
    const existingWidget = poolWidgets.find((w: PoolWidget) => w.name === props.widget.name)
    if (existingWidget) {
      console.log('更新已存在的组件:', {
        existing: existingWidget,
        new: props.widget
      })
      
      // 如果存在，则更新该组件的配置
      await request({
        url: '/api/fixed/pool',
        method: 'POST',
        data: {
          action: 'update',
          name: props.widget.name,
          widget: {
            ...existingWidget,
            url: props.widget.url // 更新为新的带参数的 URL
          }
        }
      })
      ElMessage.success('已更新组件配置')
    } else {
      // 如果不存在，则添加新组件
      const newWidget: PoolWidget = {
        id: Date.now(),
        name: props.widget.name,
        url: props.widget.url,
        type: 'widget',
        source: 'market',
        width: props.widget.width || 400,
        height: props.widget.height || 200,
        mobileShow: props.widget.mobileShow ?? true
      }
      
      console.log('添加新组件:', newWidget)
      
      await request({
        url: '/api/fixed/pool',
        method: 'POST',
        data: {
          action: 'add',
          widget: newWidget
        }
      })
      ElMessage.success('已添加到固定组件')
    }
    
    await checkFixedStatus()
  } catch (error) {
    console.error('添加到固定组件失败:', error)
    ElMessage.error('添加失败')
  }
}

// 显示提示
const showFixedTip = () => {
  ElMessage.info('请在固定组件页面的组件池中删除；如需更新配置，请点击重新添加')
}

// 显示自由组件提示
const showFreeTip = () => {
  ElMessage.info('请在自由组件页面的组件池中删除；如需更新配置，请点击重新添加')
}

// 监听事件
onMounted(() => {
  // 立即检查状态
  checkFixedStatus()
  checkFreeStatus()  // 添加自由组件状态检查
  
  // 监听组件移除事件
  eventBus.on('fixed:widget-removed', async (name: string) => {
    if (name === props.widget.name) {
      await checkFixedStatus()
    }
  })
})

// 在组件参数变化时重新检查状态
watch(() => props.widget.url, () => {
  checkFixedStatus()
  checkFreeStatus()  // 添加自由组件状态检查
})

onUnmounted(() => {
  eventBus.off('fixed:widget-removed')
})

// 检查组件是否在自由组件池中
const checkFreeStatus = async () => {
  try {
    const res = await request({
      url: '/api/free/pool',
      method: 'GET'
    })
    
    const poolWidgets = res.widgets || []
    // 添加类型标注
    emit('update:isAppliedToFree', poolWidgets.some((w: PoolWidget) => w.name === props.widget.name))
  } catch (error) {
    console.error('检查自由组件状态失败:', error)
  }
}

// 添加到自由组件
const handleApplyToFree = async () => {
  try {
    const res = await request({
      url: '/api/free/pool',
      method: 'GET'
    })
    
    const poolWidgets = res.widgets || []
    const existingWidget = poolWidgets.find((w: PoolWidget) => w.name === props.widget.name)
    
    if (existingWidget) {
      // 如果存在，则更新配置
      await request({
        url: '/api/free/pool',
        method: 'POST',
        data: {
          action: 'update',  // 添加 action 字段
          name: props.widget.name,
          widget: {
            ...existingWidget,
            url: props.widget.url // 更新为新的带参数的 URL
          }
        }
      })
      ElMessage.success('已更新组件配置')
    } else {
      // 如果不存在，则添加新组件
      await request({
        url: '/api/free/pool',
        method: 'POST',
        data: {
          action: 'add',  // 添加 action 字段
          widget: {
            id: Date.now(),
            name: props.widget.name,
            url: props.widget.url,
            source: 'market' as const
          }
        }
      })
      ElMessage.success('已添加到自由组件')
    }
    
    await checkFreeStatus()
  } catch (error) {
    console.error('添加到自由组件失败:', error)
  }
}

// 预览背景颜色控制
const previewBgColor = ref('#C6E7F5')
</script>

<style lang="scss" scoped>
.detail-layout {
  padding: 12px;
  height: calc(100vh - 84px); /* 减去顶部导航栏和tab栏的高度 */
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.header-section {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
  flex-shrink: 0;

  .title-area {
    h2 {
      margin: 0 0 4px;
      font-size: 20px;
      font-weight: 600 !important;
      color: var(--el-text-color-primary);
      line-height: 1.4;
    }
  }
}

.description {
  margin: 0;
  color: var(--el-text-color-secondary);
}

.main-content {
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 12px;
  flex: 1;
  min-height: 0;
}

.section-title {
  font-size: 15px;
  font-weight: 500;
  color: var(--el-text-color-primary);
  margin-bottom: 8px;
  padding-bottom: 6px;
  border-bottom: 1px solid var(--el-border-color-light);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.preview-controls {
  display: flex;
  gap: 8px;
  align-items: center;
}

.preview-tip {
  font-size: 13px;
  color: var(--el-text-color-secondary);
}

.params-section {
  background: var(--el-bg-color);
  border-radius: 8px;
  padding: 12px;
  overflow: auto;
}

.right-section {
  display: grid;
  grid-template-rows: auto minmax(160px, 1fr) auto;
  gap: 12px;
  overflow: hidden;
}

.preview-area {
  background: var(--el-bg-color);
  border-radius: 8px;
  padding: 12px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.preview-container {
  flex: 1;
  border-radius: 8px;
  overflow: hidden;
  transition: background-color 0.3s;
  --preview-bg: var(--el-bg-color-page);
  background-color: var(--preview-bg) !important;
}

/* 确保预览区域内的元素不受 Element Plus 主题影响 */
.preview-container :deep(*) {
  --el-bg-color: transparent;
  --el-bg-color-page: transparent;
}

.guide-area {
  background: var(--el-bg-color);
  border-radius: 8px;
  padding: 8px;
}

.guide-content {
  color: var(--el-text-color-regular);
  font-size: 13px;
  line-height: 1.3;
}

.guide-content ul {
  list-style: none;
  padding: 0;
  margin: 4px 0;
}

.guide-content li {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin-bottom: 4px;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-top: 6px;
  flex-shrink: 0;
}

.fixed-dot {
  background: var(--el-color-success);
}

.free-dot {
  background: var(--el-color-warning);
}

.tips {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  background: var(--el-color-primary-light-9);
  border-radius: 4px;
  color: var(--el-color-primary);
}

.deploy-area {
  background: var(--el-bg-color);
  border-radius: 8px;
  padding: 8px;
}

.deploy-options {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.deploy-group {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.deploy-row {
  background: var(--el-bg-color-page);
  border-radius: 8px;
  padding: 6px 8px;
}

.deploy-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: var(--el-text-color-primary);
  margin-bottom: 8px;
}

.deploy-icon {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.fixed-icon {
  background: var(--el-color-success);
}

.free-icon {
  background: var(--el-color-warning);
}

.deploy-actions {
  display: flex;
  gap: 8px;
}

@media (max-width: 1400px) {
  .deploy-group {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 1200px) {
  .main-content {
    grid-template-columns: 1fr;
  }
  
  .right-section {
    grid-template-rows: auto 200px auto;
  }
}

@media (max-width: 768px) {
  .detail-layout {
    padding: 8px;
    height: auto;
  }

  .header-section {
    flex-direction: column;
    gap: 8px;
  }

  .actions {
    width: 100%;
  }
}

// 全局标题样式
:deep(h2) {
  font-weight: 600 !important;
  font-size: 1.5rem;
  margin-bottom: 1rem;
  color: var(--el-text-color-primary);
}
</style> 