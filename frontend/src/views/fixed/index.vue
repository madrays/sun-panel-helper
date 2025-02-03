<template>
  <div class="fixed-widgets" id="fixed-widgets">
    <!-- 顶部操作区 -->
    <el-card class="operation-card">
      <div class="operations">
        <div class="left">
          <el-button type="primary" @click="showAddDialog">
            <el-icon><Plus /></el-icon>添加自定义组件
          </el-button>
          <el-button 
            type="warning"
            plain
            @click="addBreak"
          >
            <el-icon><Bottom /></el-icon>添加换行标记
          </el-button>
          <el-button 
            type="info"
            plain
            @click="showGuide"
          >
            <el-icon><QuestionFilled /></el-icon>使用指南
          </el-button>
        </div>
        <div class="right">
          <template v-if="!isDeployed">
            <el-button type="success" @click="deployConfig">
              <el-icon><Upload /></el-icon>部署配置
            </el-button>
          </template>
          <template v-else>
            <el-button type="success" @click="deployConfig">
              <el-icon><Upload /></el-icon>重新部署
            </el-button>
            <el-button type="danger" plain @click="undeployConfig">
              <el-icon><Delete /></el-icon>取消部署
            </el-button>
          </template>
        </div>
      </div>
    </el-card>

    <!-- 组件池 -->
    <el-card class="pool-card">
      <template #header>
        <div class="section-header">
          <span class="title">组件池</span>
          <el-tag>{{ poolWidgets.length }}</el-tag>
        </div>
      </template>
      
      <el-empty v-if="!poolWidgets.length" description="暂无组件，请从组件市场应用或添加自定义组件" />
      
      <div v-else class="pool-list">
        <el-card 
          v-for="widget in poolWidgets" 
          :key="widget.id"
          class="pool-item"
          shadow="hover"
        >
          <div class="pool-item-content">
            <div class="item-info">
              <span class="item-name">{{ widget.name }}</span>
              <el-tag size="small" :type="widget.source === 'market' ? 'success' : 'info'">
                {{ widget.source === 'market' ? '组件市场' : '自定义' }}
              </el-tag>
            </div>
            <div class="item-actions">
              <el-button 
                type="primary" 
                size="small"
                @click="addToLayout(widget)"
              >
                <template #icon>
                  <el-icon><Plus /></el-icon>
                </template>
                添加到布局
              </el-button>
              <el-button 
                type="danger" 
                size="small"
                plain
                @click="removeFromPool(widget)"
              >
                <template #icon>
                  <el-icon><Delete /></el-icon>
                </template>
                移除
              </el-button>
            </div>
          </div>
        </el-card>
      </div>
    </el-card>

    <!-- 布局区域 -->
    <el-card class="layout-card">
      <template #header>
        <div class="section-header">
          <span class="title">组件布局</span>
          <el-tooltip content="组件将按照此处的顺序和配置进行展示">
            <el-icon><QuestionFilled /></el-icon>
          </el-tooltip>
        </div>
      </template>

      <el-empty v-if="!layoutWidgets.length" description="从组件池中选择组件添加到这里">
        <template #extra>
          <el-button type="primary" @click="showGuide">查看使用指南</el-button>
        </template>
      </el-empty>
      
      <template v-else>
        <VueDraggable 
          v-model="layoutWidgets"
          item-key="id"
          handle=".drag-handle"
          class="layout-container"
          @end="handleDragEnd"
        >
          <template #item="{ element: widget }">
            <div class="widget-wrapper" :class="{ 'is-break': widget.type === 'break' }">
              <!-- 换行标记 -->
              <div v-if="widget.type === 'break'" class="break-card">
                <el-icon class="drag-handle"><Rank /></el-icon>
                <span>换行</span>
                <el-button type="danger" link @click="removeFromLayout(widget)">
                  <el-icon><Delete /></el-icon>
                </el-button>
              </div>

              <!-- 组件卡片 -->
              <el-card v-else class="widget-card" shadow="hover">
                <template #header>
                  <div class="card-header">
                    <el-icon class="drag-handle"><Rank /></el-icon>
                    <span class="widget-title">{{ widget.name }}</span>
                    <el-tag size="small" :type="widget.source === 'market' ? 'success' : 'info'">
                      {{ widget.source === 'market' ? '组件市场' : '自定义' }}
                    </el-tag>
                    <el-button type="danger" link @click="removeFromLayout(widget)">
                      <el-icon><Delete /></el-icon>
                    </el-button>
                  </div>
                </template>
                
                <div class="card-content">
                  <el-form :inline="true" size="small">
                    <el-form-item label="宽度">
                      <el-input-number 
                        v-model="widget.width" 
                        :min="200"
                        :max="1500"
                        :step="50"
                        @change="updateConfig"
                      />
                    </el-form-item>
                    <el-form-item label="高度">
                      <el-input-number 
                        v-model="widget.height" 
                        :min="100"
                        :max="1000"
                        :step="50"
                        @change="updateConfig"
                      />
                    </el-form-item>
                    <el-form-item label="移动端">
                      <el-switch 
                        v-model="widget.mobileShow"
                        @change="updateConfig"
                      />
                    </el-form-item>
                  </el-form>
                </div>
              </el-card>
            </div>
          </template>
        </VueDraggable>
      </template>
    </el-card>

    <!-- 自定义页脚 -->
    <el-card class="footer-card">
      <template #header>
        <div class="section-header">
          <span class="title">自定义页脚代码</span>
          <el-tooltip>
            <template #content>
              <div class="tooltip-content">
                可以在这里添加自定义的 HTML、CSS 或 JavaScript 代码，这些代码将被注入到页面中。<br>
                常见用途：添加自定义样式、引入第三方库、添加统计代码等。
              </div>
            </template>
            <el-icon><QuestionFilled /></el-icon>
          </el-tooltip>
        </div>
      </template>
      
      <el-input
        v-model="customCode"
        type="textarea"
        :rows="6"
        placeholder="在这里输入自定义代码，支持 HTML、CSS 和 JavaScript..."
        @change="updateLayoutConfig"
      />
    </el-card>

    <!-- 添加自定义组件对话框 -->
    <el-dialog
      v-model="dialogVisible"
      title="添加自定义组件"
      width="500px"
    >
      <el-form ref="formRef" :model="form" :rules="rules">
        <el-form-item label="组件名称" prop="name">
          <el-input v-model="form.name" />
        </el-form-item>
        <el-form-item label="组件URL" prop="url">
          <el-input v-model="form.url" type="textarea" :rows="3" />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleAdd">确定</el-button>
      </template>
    </el-dialog>

    <!-- 使用指南对话框 -->
    <el-dialog
      v-model="guideVisible"
      title="使用指南"
      width="600px"
    >
      <div class="guide-content">
        <h4>基本步骤</h4>
        <ol>
          <li>从组件市场应用组件或添加自定义组件到组件池</li>
          <li>从组件池中选择需要的组件添加到布局区域</li>
          <li>调整组件的顺序（拖拽）和参数</li>
          <li>需要换行时可以添加换行标记</li>
          <li>编写自定义页脚代码（可选）</li>
          <li>点击部署配置使配置生效</li>
        </ol>

        <h4>注意事项</h4>
        <ul>
          <li>组件池中的组件可以重复添加到布局中</li>
          <li>布局中的组件顺序将影响最终显示效果</li>
          <li>所有配置都会自动保存到服务器</li>
        </ul>

        <h4 class="warning-title">⚠️ 自定义代码说明</h4>
        <div class="warning-content">
          <p>固定组件的自定义代码功能与 Sun Panel 的自定义页脚功能互斥：</p>
          <ul>
            <li>这里可以添加任何自定义的 HTML、CSS 或 JavaScript 代码</li>
            <li>添加的代码将被注入到所有用户的页面中，全局生效</li>
            <li>使用此功能时，需要清空 Sun Panel 的自定义页脚内容，避免代码冲突</li>
            <li>如果需要为每个用户配置不同的自定义代码，请使用 Sun Panel 的自定义页脚功能（此时不要使用固定组件）</li>
          </ul>
          <p class="warning-tip">注意：请谨慎添加代码，确保代码的安全性和兼容性，避免影响页面正常功能。</p>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Delete, Rank, Plus, Bottom, Upload, QuestionFilled } from '@element-plus/icons-vue'
import type { FormInstance } from 'element-plus'
import VueDraggable from 'vuedraggable'
import request from '@/utils/request'
import { eventBus } from '@/utils/eventBus'

interface Widget {
  id: number
  name: string
  url: string
  type: string
  width: number
  height: number
  mobileShow: boolean
  source?: 'market' | 'custom'
}

// 组件列表
const poolWidgets = ref<Widget[]>([])  // 组件池
const layoutWidgets = ref<Widget[]>([]) // 布局中的组件
const customCode = ref('')  // 自定义页脚代码

// 对话框控制
const dialogVisible = ref(false)
const guideVisible = ref(false)
const formRef = ref<FormInstance>()
const form = ref({ name: '', url: '' })

// 表单验证规则
const rules = {
  name: [{ required: true, message: '请输入组件名称', trigger: 'blur' }],
  url: [{ required: true, message: '请输入组件URL', trigger: 'blur' }]
}

// 部署状态
const isDeployed = ref(false)

// 检查部署状态
const checkDeployStatus = async () => {
  try {
    const res = await request({
      url: '/api/fixed/status',
      method: 'GET'
    })
    isDeployed.value = res?.deployed ?? false
  } catch (error) {
    console.error('检查部署状态失败:', error)
  }
}

// 初始化数据
onMounted(async () => {
  await loadConfig()
  checkDeployStatus()
})

// 加载配置
const loadConfig = async () => {
  try {
    // 加载组件池配置
    const poolRes = await request({
      url: '/api/fixed/pool',
      method: 'GET'
    })
    
    console.log('加载到的组件池配置:', poolRes)
    
    if (poolRes.widgets) {
      poolWidgets.value = [...poolRes.widgets]
    }
    
    // 加载布局配置
    const layoutRes = await request({
      url: '/api/fixed/layout', 
      method: 'GET'
    })
    if (layoutRes.widgets) {
      layoutWidgets.value = [...layoutRes.widgets]
      customCode.value = layoutRes.customCode || ''
    }
  } catch (error) {
    console.error('加载配置失败:', error)
    ElMessage.error('加载配置失败')
  }
}

// 更新布局配置
const updateLayoutConfig = async () => {
  try {
    await request({
      url: '/api/fixed/layout',
      method: 'POST',
      data: {
        widgets: layoutWidgets.value,
        customCode: customCode.value
      }
    })
  } catch (error) {
    console.error('保存布局配置失败:', error)
    ElMessage.error('保存布局配置失败')
  }
}

// 显示添加对话框
const showAddDialog = () => {
  form.value = { name: '', url: '' }
  dialogVisible.value = true
}

// 添加自定义组件
const handleAdd = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (valid) {
      // 检查名称是否已存在
      const exists = poolWidgets.value.some(w => w.name === form.value.name)
      if (exists) {
        ElMessage.warning('组件名称已存在，请使用其他名称')
        return
      }

      const newWidget: Widget = {
        id: Date.now(),
        name: form.value.name,
        url: form.value.url,
        type: 'widget',
        width: 400,
        height: 200,
        mobileShow: true,
        source: 'custom'
      }
      
      try {
        // 使用 action: 'add' 方式添加
        await request({
          url: '/api/fixed/pool',
          method: 'POST',
          data: {
            action: 'add',
            widget: newWidget
          }
        })
        
        poolWidgets.value.push(newWidget)
        dialogVisible.value = false
        ElMessage.success('添加成功')
      } catch (error) {
        console.error('添加自定义组件失败:', error)
        ElMessage.error('添加失败')
      }
    }
  })
}

// 添加换行
const addBreak = () => {
  layoutWidgets.value.push({
    id: Date.now(),
    name: '换行',
    url: '',
    type: 'break',
    width: 0,
    height: 0,
    mobileShow: true
  })
  updateLayoutConfig()
}

// 添加到布局
const addToLayout = (widget: Widget) => {
  const newWidget = {
    ...widget,
    id: Date.now()
  }
  layoutWidgets.value.push(newWidget)
  updateLayoutConfig()
}

// 从布局中移除
const removeFromLayout = (widget: Widget) => {
  const index = layoutWidgets.value.findIndex(w => w.id === widget.id)
  if (index > -1) {
    layoutWidgets.value.splice(index, 1)
    updateLayoutConfig()
  }
}

// 从池中移除
const removeFromPool = async (widget: Widget) => {
  try {
    console.log('移除组件:', widget.name)
    
    // 发送删除请求
    await request({
      url: '/api/fixed/pool',
      method: 'POST',
      data: {
        action: 'remove',
        name: widget.name
      }
    })
    
    // 更新本地状态
    const index = poolWidgets.value.findIndex(w => w.id === widget.id)
    if (index > -1) {
      poolWidgets.value.splice(index, 1)
    }
    
    // 通知组件市场
    if (widget.source === 'market') {
      console.log('发送移除事件:', widget.name)
      eventBus.emit('fixed:widget-removed', widget.name)
    }
    
    ElMessage.success('已从组件池移除')
  } catch (error) {
    console.error('从组件池移除失败:', error)
    ElMessage.error('移除失败')
  }
}

// 更新配置
const updateConfig = async () => {
  try {
    // 更新布局配置
    await request({
      url: '/api/fixed/layout',
      method: 'POST',
      data: {
        widgets: layoutWidgets.value,
        customCode: customCode.value
      }
    })
  } catch (error) {
    console.error('保存配置失败:', error)
    ElMessage.error('保存配置失败')
  }
}

// 部署配置
const deployConfig = async () => {
  try {
    await request({
      url: '/api/fixed/deploy',
      method: 'POST'
    })
    ElMessage.success(isDeployed.value ? '配置已重新部署' : '配置已部署')
    isDeployed.value = true
  } catch (error) {
    ElMessage.error(isDeployed.value ? '重新部署失败' : '部署失败')
  }
}

// 取消部署
const undeployConfig = async () => {
  try {
    await request({
      url: '/api/fixed/undeploy',
      method: 'POST'
    })
    ElMessage.success('已取消部署')
    isDeployed.value = false
  } catch (error) {
    ElMessage.error('取消部署失败')
  }
}

// 显示使用指南
const showGuide = () => {
  guideVisible.value = true
}

// 从组件市场添加组件
const addMarketWidget = async (widget: Widget) => {
  try {
    // 检查名称是否已存在
    const exists = poolWidgets.value.some(w => w.name === widget.name)
    if (exists) {
      ElMessage.warning('组件名称已存在，请先从组件池移除')
      throw new Error('组件名称已存在')
    }

    const newWidget = {
      ...widget,
      id: Date.now(),
      source: 'market' as const
    }

    // 使用 action: 'add' 方式添加
    await request({
      url: '/api/fixed/pool',
      method: 'POST',
      data: {
        action: 'add',
        widget: newWidget
      }
    })
    
    poolWidgets.value.push(newWidget)
    eventBus.emit('fixed:widget-added', widget.name) // 改用 name 而不是 url
    ElMessage.success('已添加到组件池')
  } catch (error) {
    console.error('添加到组件池失败:', error)
    if (!(error instanceof Error && error.message === '组件名称已存在')) {
      ElMessage.error('添加失败')
    }
    throw error
  }
}

// 监听拖拽结束事件
const handleDragEnd = async () => {
  try {
    // 获取当前布局配置
    const res = await request({
      url: '/api/fixed/layout',
      method: 'GET'
    })
    
    const currentConfig = res.data
    
    // 更新组件列表，保持其他配置不变
    await request({
      url: '/api/fixed/layout',
      method: 'POST',
      data: {
        ...currentConfig,
        widgets: layoutWidgets.value  // 更新后的组件列表
      }
    })
    
    ElMessage.success('布局已更新')
  } catch (error) {
    console.error('更新布局失败:', error)
    ElMessage.error('更新布局失败')
  }
}

defineExpose({
  addMarketWidget
})
</script>

<style scoped>
.fixed-widgets {
  padding: 20px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.widget-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.widget-container {
  display: flex;
  flex-wrap: nowrap;  /* 不换行 */
  gap: 20px;
  overflow-x: auto;  /* 超出显示滚动条 */
  padding: 10px 0;
}

.widget-wrapper {
  flex: 0 0 auto;  /* 不伸缩 */
}

.widget-wrapper.is-break {
  flex: 0 0 100%;  /* 换行占满一行 */
}

.widget-card {
  width: 400px;
  margin: 0;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 12px;
}

.break-card {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border: 1px dashed var(--el-color-primary);
  border-radius: 4px;
  background: var(--el-color-primary-light-9);
}

.drag-handle {
  cursor: move;
  color: var(--el-text-color-secondary);
}

.card-content {
  padding: 12px 0;
}

.footer-code {
  margin-top: 30px;
}

.footer-code h3 {
  margin-bottom: 12px;
  font-size: 16px;
  font-weight: 500;
}

.actions {
  margin-top: 20px;
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

.operation-card {
  margin-bottom: 20px;
}

.operations {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.left {
  display: flex;
  gap: 12px;
  align-items: center;
}

.pool-card {
  margin-bottom: 20px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.title {
  font-size: 16px;
  font-weight: 500;
}

.pool-list {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
}

.pool-item {
  width: calc(33.33% - 20px);
}

.pool-item-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 0;
}

.item-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.item-name {
  font-size: 14px;
  font-weight: 500;
  color: var(--el-text-color-primary);
}

.item-actions {
  display: flex;
  gap: 8px;
  align-items: center;
}

/* 确保图标可见 */
.el-button [class*='el-icon'] {
  font-size: 16px;
}

.layout-card {
  margin-bottom: 20px;
}

.layout-container {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
}

.widget-wrapper {
  flex: 0 0 auto;
}

.widget-wrapper.is-break {
  flex: 0 0 100%;
}

.widget-card {
  width: 400px;
  margin: 0;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 12px;
}

.widget-title {
  font-size: 14px;
  font-weight: 500;
}

.card-content {
  padding: 12px 0;
}

.footer-card {
  margin-top: 20px;
}

.guide-content {
  padding: 20px;
}

/* 让按钮文字更清晰 */
.el-button {
  font-weight: 500;
}

.warning-title {
  color: var(--el-color-danger);
  margin-top: 20px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.warning-content {
  background: var(--el-color-danger-light-9);
  border: 1px solid var(--el-color-danger-light-5);
  border-radius: 4px;
  padding: 12px;
  margin-top: 8px;
}

.warning-content p {
  color: var(--el-color-danger);
  font-weight: 500;
  margin: 0 0 8px;
}

.warning-content ul {
  margin: 0;
  padding-left: 20px;
}

.warning-content li {
  color: var(--el-text-color-regular);
  margin-bottom: 4px;
}

.guide-content h4 {
  margin: 16px 0 8px;
  font-size: 16px;
  font-weight: 500;
}

.guide-content h4:first-child {
  margin-top: 0;
}

.tooltip-content {
  font-size: 13px;
  line-height: 1.4;
}

.warning-content .warning-tip {
  margin-top: 12px;
  font-size: 13px;
  color: var(--el-color-danger);
}
</style> 