<template>
  <div class="free-widgets">
    <!-- 顶部操作区 -->
    <el-card class="card">
      <div class="operations">
        <div class="left">
          <el-button type="primary" @click="showAddDialog">
            <el-icon><Plus /></el-icon>添加自定义组件
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
    <el-card class="card">
      <template #header>
        <div class="card-header">
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

    <!-- 布局配置 -->
    <el-card class="card">
      <template #header>
        <div class="card-header">
          <div class="left">
            <span class="title">布局配置</span>
            <el-tag>{{ layoutWidgets.length }}</el-tag>
          </div>
          <div class="right">
            <div class="api-input-wrapper">
              <el-input 
                v-model="apiPrefix"
                placeholder="请输入可访问的地址"
                class="api-input"
              >
                <template #prepend>API 前缀</template>
              </el-input>
              <el-tooltip
                effect="dark"
                placement="top"
                :show-after="200"
              >
                <template #content>
                  <div class="api-tooltip">
                    <p>• 填写外部可访问的地址</p>
                    <p>• 如果使用反向代理，请填写反代后的完整地址</p>
                    <p>• 示例：https://helper.example.com</p>
                  </div>
                </template>
                <el-icon class="help-icon"><QuestionFilled /></el-icon>
              </el-tooltip>
            </div>
            <el-button type="warning" plain @click="showImportDialog">
              <el-icon><Upload /></el-icon>导入配置
            </el-button>
          </div>
        </div>
      </template>

      <el-tabs v-model="currentConfig" class="config-tabs">
        <el-tab-pane 
          v-for="i in 5" 
          :key="i"
          :name="i"
        >
          <template #label>
            <div class="config-label">
              <span>配置{{ i }}</span>
              <el-tag 
                size="small" 
                :type="i <= 2 ? 'warning' : 'success'"
                effect="light"
              >
                {{ i <= 2 ? '默认' : '在线' }}
              </el-tag>
            </div>
          </template>
          <el-empty v-if="!layoutWidgets.length" description="暂无组件，请从组件池添加" />

          <div v-else class="layout-list">
            <el-card 
              v-for="widget in layoutWidgets" 
              :key="widget.id"
              class="layout-item"
              shadow="hover"
            >
              <div class="layout-item-content">
                <div class="item-info">
                  <span class="item-name">{{ widget.name }}</span>
                </div>
                <div class="item-position">
                  <el-form :model="widget.position" label-width="80px" size="small">
                    <el-form-item label="位置">
                      <el-input-number v-model="widget.position.top" :min="0" placeholder="上" style="width: 100px" />
                      <el-input-number v-model="widget.position.left" :min="0" placeholder="左" style="width: 100px" />
                    </el-form-item>
                    <el-form-item label="尺寸">
                      <el-input v-model="widget.position.width" placeholder="宽" style="width: 100px" />
                      <el-input v-model="widget.position.height" placeholder="高" style="width: 100px" />
                    </el-form-item>
                    <el-form-item label="组件模式">
                      <el-radio-group 
                        :model-value="getWidgetMode(widget)"
                        @change="(val: WidgetMode) => handleModeChange(widget, val)"
                      >
                        <el-radio :value="'normal'">普通模式</el-radio>
                        <el-radio :value="'scroll'">滚动模式</el-radio>
                        <el-radio :value="'pinned'">固定模式</el-radio>
                      </el-radio-group>
                    </el-form-item>
                  </el-form>
                </div>
                <div class="item-actions">
                  <el-button 
                    type="danger" 
                    size="small"
                    plain
                    @click="removeFromLayout(widget)"
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
        </el-tab-pane>
      </el-tabs>
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

    <!-- 导入配置对话框 -->
    <el-dialog
      v-model="importDialogVisible"
      title="导入配置"
      width="600px"
    >
      <div class="import-tips">
        <el-alert
          title="配置说明"
          type="info"
          :closable="false"
        >
          <template #default>
            <p>• 配置1-2为默认配置，仅可通过导入配置来保存布局</p>
            <p>• 配置3-5为在线配置，可在 Sun-Panel 端实时保存布局</p>
            <p>• 导入配置将替换当前选中配置的所有内容</p>
          </template>
        </el-alert>
      </div>
      
      <el-form>
        <el-form-item label="配置内容">
          <el-input
            v-model="importConfig"
            type="textarea"
            :rows="10"
            placeholder="请粘贴配置JSON内容，格式如下：
{
  &quot;widgets&quot;: [
    {
      &quot;name&quot;: &quot;组件名称&quot;,
      &quot;url&quot;: &quot;组件URL&quot;,
      &quot;position&quot;: {
        &quot;top&quot;: 100,
        &quot;left&quot;: 100,
        &quot;width&quot;: &quot;300px&quot;,
        &quot;height&quot;: &quot;200px&quot;,
        &quot;isScrollMode&quot;: true,
        &quot;isPinned&quot;: false
      }
    }
  ]
}"
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="importDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleImport">确定</el-button>
      </template>
    </el-dialog>

    <!-- 使用指南对话框 -->
    <el-dialog
      v-model="guideVisible"
      title="使用指南"
      width="600px"
      destroy-on-close
      append-to-body
    >
      <div class="guide-content">
        <h4>基本步骤</h4>
        <ol>
          <li>从组件市场应用组件或添加自定义组件到组件池</li>
          <li>从组件池中选择需要的组件添加到布局区域</li>
          <li>调整组件的位置、尺寸和模式</li>
          <li>选择或切换配置（1-5）设计不同配置布局</li>
          <li>点击部署配置使配置生效</li>
        </ol>

        <h4>注意事项</h4>
        <ul>
          <li>新终端访问的初始配置为配置1，切换配置后会在浏览器本地保存</li>
          <li>组件池中的组件可以重复添加到布局中</li>
          <li>可以通过导入配置快速应用他人分享的布局</li>
          <li>所有配置都会自动保存到服务器</li>
          <li>配置1和配置2为默认配置，仅可通过手动添加初步确定，然后在Sun-Panel 端调整布局后导入配置来保存布局</li>
          <li>配置3-5为在线配置，可在 Sun-Panel 端实时保存布局</li>
        </ul>
    </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { Delete, Plus, Upload, QuestionFilled } from '@element-plus/icons-vue'
import type { FormInstance } from 'element-plus'
import request from '@/utils/request'

// 对话框控制
const dialogVisible = ref(false)
const importDialogVisible = ref(false)
const guideVisible = ref(false)

// 部署状态
const isDeployed = ref(false)

// 当前配置
const currentConfig = ref(1)

// 组件池
const poolWidgets = ref<any[]>([])

// 布局组件
const layoutWidgets = ref<any[]>([])

// 表单
const formRef = ref<FormInstance>()
const form = ref({
  name: '',
  url: ''
})

// 表单验证规则
const rules = {
  name: [
    { required: true, message: '请输入组件名称', trigger: 'blur' },
    { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  url: [
    { required: true, message: '请输入组件URL', trigger: 'blur' }
  ]
}

// 导入配置
const importConfig = ref('')

// API 前缀
const apiPrefix = ref('')

// 添加类型定义
type WidgetMode = 'normal' | 'scroll' | 'pinned'

// 方法
const showAddDialog = () => {
  dialogVisible.value = true
}

const showImportDialog = () => {
  importDialogVisible.value = true
}

const showGuide = () => {
  guideVisible.value = true
}

const handleAdd = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate()
  
  const widget = {
    id: Date.now(),
    name: form.value.name,
    url: form.value.url,
    source: 'custom' as const
  }
  
  try {
    const res = await request({
      url: '/api/free/pool',
      method: 'POST',
      data: widget
    })
    
    if (res.code === 1) {
      ElMessage.warning(res.message)
      return
    }
    
    poolWidgets.value.push(widget)
    dialogVisible.value = false
    form.value = { name: '', url: '' }
    ElMessage.success('添加成功')
  } catch (error) {
    // 只记录日志，不显示错误提示
    console.error('添加失败:', error)
  }
}

// 获取组件当前模式
const getWidgetMode = (widget: any): WidgetMode => {
  if (widget.position.isScrollMode) return 'scroll'
  if (widget.position.isPinned) return 'pinned'
  return 'normal'
}

// 处理模式切换
const handleModeChange = (widget: any, mode: WidgetMode) => {
  // 更新当前组件的模式
  widget.position.isScrollMode = mode === 'scroll'
  widget.position.isPinned = mode === 'pinned'
}

const addToLayout = (widget: any) => {
  const layoutWidget = {
    name: widget.name,
    url: widget.url,
    position: {
      top: 100,
      left: 100,
      width: '300px',
      height: '200px',
      isScrollMode: false,
      isPinned: false
    }
  }
  layoutWidgets.value.push(layoutWidget)
}

const removeFromPool = async (widget: any) => {
  try {
    await request({
      url: `/api/free/pool/${widget.id}`,
      method: 'DELETE'
    })
    const index = poolWidgets.value.findIndex(item => item.id === widget.id)
    if (index > -1) {
      poolWidgets.value.splice(index, 1)
    }
    ElMessage.success('移除成功')
  } catch (error) {
    console.error('移除失败:', error)
    ElMessage.warning('移除失败')
  }
}

const removeFromLayout = async (widget: any) => {
  const index = layoutWidgets.value.findIndex(item => item.id === widget.id)
  if (index > -1) {
    layoutWidgets.value.splice(index, 1)
    
    // 保存当前配置
    try {
      await request({
        url: `/api/free/setting/${currentConfig.value}`,
        method: 'POST',
        data: {
          widgets: layoutWidgets.value
        }
      })
    } catch (error) {
      console.error('保存布局失败:', error)
      ElMessage.warning('保存布局失败')
    }
  }
}

const deployConfig = async () => {
  try {
    await request({
      url: '/api/free/deploy',
      method: 'POST',
      data: {
        widgets: layoutWidgets.value,
        apiPrefix: apiPrefix.value
      }
    })
    isDeployed.value = true
    ElMessage.success('部署成功')
  } catch (error) {
    console.error('部署失败:', error)
    ElMessage.warning('部署失败')
  }
}

const undeployConfig = async () => {
  try {
    await request({
      url: '/api/free/undeploy',
      method: 'POST'
    })
    isDeployed.value = false
    ElMessage.success('取消部署成功')
  } catch (error) {
    console.error('取消部署失败:', error)
    ElMessage.warning('取消部署失败')
  }
}

// 导入配置
const handleImport = async () => {
  try {
    const config = JSON.parse(importConfig.value)
    if (config.widgets && Array.isArray(config.widgets)) {
      await request({
        url: `/api/free/setting/${currentConfig.value}`,
        method: 'POST',
        data: {
          widgets: config.widgets
        }
      })
      layoutWidgets.value = config.widgets
      importDialogVisible.value = false
      importConfig.value = ''
      ElMessage.success('导入成功')
    } else {
      throw new Error('配置格式错误')
    }
  } catch (error) {
    ElMessage.error('配置格式错误，请检查JSON格式是否正确')
  }
}

// 配置切换
watch(currentConfig, async (newConfig) => {
  try {
    const configData = await request({ 
      url: `/api/free/setting/${newConfig}`,
      method: 'GET' 
    })
    layoutWidgets.value = configData.widgets || []
  } catch (error) {
    console.error('加载配置失败:', error)
    ElMessage.warning('加载配置失败')
  }
})

// API 前缀更新
watch(apiPrefix, async (newPrefix) => {
  try {
    await request({
      url: '/api/free/api-prefix',
      method: 'POST',
      data: { apiPrefix: newPrefix }
    })
  } catch (error) {
    console.error('更新 API 前缀失败:', error)
    ElMessage.warning('更新 API 前缀失败')
  }
})

// 监听布局组件的位置变化
watch(
  () => layoutWidgets.value,
  async (newWidgets) => {
    // 保存当前配置
    try {
      await request({
        url: `/api/free/setting/${currentConfig.value}`,
        method: 'POST',
        data: {
          widgets: newWidgets
        }
      })
    } catch (error) {
      console.error('保存布局失败:', error)
      // 不显示错误提示，避免频繁弹窗
    }
  },
  { deep: true }
)

// 初始化
onMounted(async () => {
  try {
    // 检查部署状态
    const statusData = await request({ url: '/api/free/status', method: 'GET' })
    isDeployed.value = statusData.deployed
    apiPrefix.value = statusData.apiPrefix || ''
    
    // 加载组件池
    const poolData = await request({ url: '/api/free/pool', method: 'GET' })
    poolWidgets.value = poolData.widgets || []
    
    // 加载当前配置
    const configData = await request({ 
      url: `/api/free/setting/${currentConfig.value}`,
      method: 'GET' 
    })
    layoutWidgets.value = configData.widgets || []
  } catch (error) {
    ElMessage.warning('初始化失败')
  }
})
</script>

<style scoped>
.free-widgets {
  padding: 20px;
}

.card {
  margin-bottom: 20px;
}

.card:last-child {
  margin-bottom: 0;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header .left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.title {
  font-size: 16px;
  font-weight: bold;
}

.operations {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.config-tabs {
  margin-top: 0;
}

.config-tabs :deep(.el-tabs__header) {
  margin-bottom: 15px;
}

.config-tabs :deep(.el-tabs__nav-wrap::after) {
  height: 1px;
  background-color: var(--el-border-color-light);
  bottom: 0;
}

.config-tabs :deep(.el-tabs__item) {
  padding: 0 30px;
  height: 32px;
  line-height: 32px;
  font-size: 14px;
}

.config-label {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 32px;
}

.config-label .el-tag {
  transform: scale(0.9);
}

.import-tips {
  margin-bottom: 20px;
}

.import-tips .el-alert {
  margin-bottom: 0;
}

.import-tips p {
  margin: 8px 0;
  line-height: 1.5;
}

.import-tips p:first-child {
  margin-top: 0;
}

.import-tips p:last-child {
  margin-bottom: 0;
}

.pool-list,
.layout-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.pool-item,
.layout-item {
  height: 100%;
}

.pool-item-content,
.layout-item-content {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.item-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.item-name {
  font-weight: bold;
}

.item-position .el-form-item {
  margin-bottom: 12px;
}

.item-position .el-form-item:last-child {
  margin-bottom: 0;
}

.item-actions {
  display: flex;
  gap: 10px;
}

.guide-content {
  padding: 0 20px;
  line-height: 1.8;
}

.guide-content h4 {
  color: var(--el-color-primary);
  margin: 16px 0;
}

.guide-content h4:first-child {
  margin-top: 0;
}

.guide-content ol,
.guide-content ul {
  margin: 0;
  padding-left: 20px;
}

.guide-content li {
  margin-bottom: 8px;
}

.guide-content li:last-child {
  margin-bottom: 0;
}

.card-header .right {
  display: flex;
  align-items: center;
  gap: 10px;
}

.api-input {
  width: 360px;
}

.api-input :deep(.el-input-group__prepend) {
  padding: 0 12px;
  font-weight: bold;
  color: var(--el-text-color-regular);
  background-color: var(--el-fill-color-light);
}

.api-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  gap: 8px;
}

.help-icon {
  color: var(--el-text-color-secondary);
  font-size: 16px;
  cursor: help;
  transition: color 0.3s;
}

.help-icon:hover {
  color: var(--el-color-primary);
}

.api-tooltip {
  font-size: 12px;
  line-height: 1.6;
}

.api-tooltip p {
  margin: 0;
  white-space: nowrap;
}

.api-tooltip p:not(:last-child) {
  margin-bottom: 4px;
}

.layout-item-content {
  .item-name {
    font-size: 16px;
    font-weight: bold;
    margin-bottom: 10px;
  }
}
</style> 