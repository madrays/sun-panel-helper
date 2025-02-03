<template>
  <div class="js-detail">
    <!-- 头部区域 -->
    <div class="detail-header">
      <div class="title-section">
        <h2>目录导航</h2>
        <p class="description">为页面添加目录导航功能，支持自动识别标题并生成导航栏</p>
      </div>
      <div class="action-buttons">
        <el-button 
          :type="isDeployed ? 'success' : 'primary'"
          @click="handleDeploy"
          :loading="deploying"
        >
          {{ isDeployed ? '重新部署' : '部署' }}
        </el-button>
        <el-button 
          type="danger" 
          @click="handleUndeploy"
          :loading="undeploying"
          v-if="isDeployed"
        >
          取消部署
        </el-button>
        <el-button @click="handleReset">重置</el-button>
      </div>
    </div>

    <!-- 内容区域 -->
    <div class="detail-content">
      <!-- 左侧参数设置 -->
      <div class="params-section">
        <h3>参数设置</h3>
        <ParamsConfig v-model="params" />
      </div>

      <!-- 右侧预览和说明 -->
      <div class="right-section">
        <!-- 预览效果 -->
        <div class="preview-section">
          <h3>预览效果</h3>
          <div class="preview-content">
            <!-- 模拟目录导航 -->
            <div class="mock-toc" :style="{
              backgroundColor: params.theme.background,
              boxShadow: `1px 0 5px ${params.theme.hover}`
            }">
              <div class="mock-item" v-for="i in 3" :key="i">
                <div class="mock-bar" :style="{
                  backgroundColor: params.theme.text,
                  boxShadow: `1px 0 5px ${params.theme.hover}`
                }"></div>
                <span class="mock-text" :style="{ color: params.theme.text }">
                  标题 {{ i }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- 使用说明 -->
        <div class="docs-section">
          <h3>使用说明</h3>
          <div class="docs-content">
            <h4>基本功能</h4>
            <ul>
              <li>自动识别页面标题生成导航</li>
              <li>支持自动/移动端/侧栏三种显示模式</li>
              <li>点击导航自动滚动到对应位置</li>
              <li>支持自定义主题颜色</li>
              <li>调整后实时预览</li>
            </ul>

            <h4>使用方法</h4>
            <ul>
              
              <li>分组标题会自动提取为导航项</li>
              <li>导航栏会自动适应页面宽度</li>
              <li>可通过主题配置调整样式</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import type { TocNavParams } from '../../../../types/js/toc-nav'
import { defaultParams } from '../../../../types/js/toc-nav'
import ParamsConfig from './params.vue'

const params = ref<TocNavParams>(JSON.parse(JSON.stringify(defaultParams)))
const isDeployed = ref(false)
const deploying = ref(false)
const undeploying = ref(false)
let isInitialized = false

// 检查部署状态
const checkDeployment = async () => {
  try {
    const res = await fetch('/api/js/toc-nav/deployed')
    if (!res.ok) throw new Error('请求失败')
    const { deployed } = await res.json()
    isDeployed.value = deployed
  } catch (error) {
    console.error('检查部署状态失败:', error)
  }
}

// 部署
const handleDeploy = async () => {
  if (deploying.value) return
  try {
    deploying.value = true
    const res = await fetch('/api/js/toc-nav/deploy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params.value)
    })
    
    if (!res.ok) {
      const data = await res.json()
      throw new Error(data.error || '部署失败')
    }
    
    ElMessage.success('部署成功')
    await checkDeployment()
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : '部署失败')
  } finally {
    deploying.value = false
  }
}

// 取消部署
const handleUndeploy = async () => {
  if (undeploying.value) return
  try {
    undeploying.value = true
    const res = await fetch('/api/js/toc-nav/undeploy', {
      method: 'POST'
    })
    
    if (!res.ok) {
      const data = await res.json()
      throw new Error(data.error || '取消部署失败')
    }
    
    ElMessage.success('取消部署成功')
    await checkDeployment()
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : '取消部署失败')
  } finally {
    undeploying.value = false
  }
}

// 重置参数
const handleReset = () => {
  params.value = JSON.parse(JSON.stringify(defaultParams))
}

// 初始化
onMounted(async () => {
  if (isInitialized) return
  isInitialized = true
  await checkDeployment()
  try {
    const res = await fetch('/api/js/toc-nav/config')
    if (!res.ok) throw new Error('请求失败')
    const config = await res.json()
    params.value = config
  } catch (error) {
    console.error('初始化失败:', error)
  }
})
</script>

<style scoped>
.js-detail {
  padding: 20px;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.detail-header {
  margin-bottom: 20px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.title-section h2 {
  margin: 0 0 8px;
  font-size: 1.5rem;
  color: #2c3e50;
}

.description {
  margin: 0;
  color: #606266;
}

.action-buttons {
  display: flex;
  gap: 12px;
}

.detail-content {
  flex: 1;
  display: grid;
  grid-template-columns: 520px 1fr;
  gap: 20px;
  min-height: 0;
}

.params-section, .preview-section, .docs-section {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.right-section {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.params-section h3, .preview-section h3, .docs-section h3 {
  margin: 0;
  padding: 16px;
  font-size: 1rem;
  color: #2c3e50;
  border-bottom: 1px solid #ebeef5;
}

.preview-content {
  height: 240px;
  position: relative;
  padding: 20px;
  background: #f8fafc;
  display: flex;
  justify-content: center;
  align-items: center;
}

.docs-content {
  padding: 16px;
}

.docs-content h4 {
  font-size: 1rem;
  color: #2c3e50;
  margin: 0 0 12px;
}

.docs-content h4:not(:first-child) {
  margin-top: 20px;
}

.docs-content ul {
  margin: 0;
  padding-left: 20px;
}

.docs-content li {
  color: #606266;
  line-height: 1.6;
  margin-bottom: 8px;
}

/* 模拟目录导航样式 */
.mock-toc {
  width: 200px;
  padding: 16px;
  border-radius: 8px;
  transition: all 0.3s;
}

.mock-item {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 12px 0;
  cursor: pointer;
}

.mock-item:hover .mock-bar {
  width: 30px;
}

.mock-bar {
  width: 20px;
  height: 4px;
  border-radius: 2px;
  transition: all 0.3s;
}

.mock-text {
  font-size: 14px;
  transition: all 0.3s;
}

@media (max-width: 1200px) {
  .detail-content {
    grid-template-columns: 1fr;
  }
  
  .right-section {
    order: -1;
  }
}

@media (max-width: 768px) {
  .js-detail {
    padding: 16px;
  }
  
  .detail-header {
    flex-direction: column;
    gap: 16px;
  }
  
  .action-buttons {
    width: 100%;
    justify-content: flex-end;
  }
}
</style> 