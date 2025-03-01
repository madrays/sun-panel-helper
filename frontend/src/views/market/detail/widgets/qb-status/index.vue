<template>
  <div class="qb-status-detail">
    <div class="header-section">
      <div class="title-area">
        <h2>QB下载器状态</h2>
        <p class="description">实时监控qBittorrent下载器状态，支持多个下载器和自定义显示项</p>
      </div>
      <div class="actions">
        <el-button @click="showHelpDialog" type="info" icon="QuestionFilled">使用指南</el-button>
        <el-button @click="handleReset" type="danger">重置参数</el-button>
      </div>
    </div>

    <!-- 支持作者信息 -->
    <div class="support-author">
      <div class="support-text">
        <span>🌟 QB组件开发不易，感谢各位大佬的支持和使用~ </span>
        <span class="highlight">如果觉得好用，可以点击左下角「支持作者」按钮，给予一点小小的鼓励哦！💖</span>
      </div>
    </div>

    <div class="main-content">
      <!-- 左侧 - QB下载器列表 -->
      <el-card class="qb-list-section" shadow="hover">
        <template #header>
          <div class="section-title">
            <span>QB下载器列表</span>
            <el-button type="primary" size="small" @click="addNewQB">添加下载器</el-button>
          </div>
        </template>
        <div class="qb-list">
          <div 
            v-for="(qb, index) in qbList" 
            :key="qb.id" 
            class="qb-item"
            :class="{ active: currentQBIndex === index }"
            @click="selectQB(index)"
          >
            <div class="qb-item-content">
              <div class="qb-item-name">{{ qb.name }}</div>
              <div class="qb-item-status" :class="{ valid: qb.isConfigValid }">
                {{ qb.isConfigValid ? '已验证' : '未验证' }}
              </div>
            </div>
            <div class="qb-item-actions">
              <el-button 
                type="danger" 
                size="small" 
                circle 
                @click.stop="removeQB(index)"
              >
                <el-icon><Delete /></el-icon>
              </el-button>
            </div>
          </div>
          <div v-if="qbList.length === 0" class="no-qb">
            <el-empty description="暂无下载器配置" />
          </div>
        </div>
      </el-card>

      <div class="right-section">
        <!-- 域名前缀设置 -->
        <el-card class="domain-prefix-section" shadow="hover">
          <template #header>
            <div class="section-title">
              <span>全局设置</span>
            </div>
          </template>
          <div class="domain-prefix-content">
            <el-form-item label="域名前缀 (全局设置)">
              <el-input 
                v-model="domainPrefix" 
                placeholder="例如: https://your-domain.com" 
              />
              <div class="form-tip">此为全局设置，所有组件共享同一域名前缀，仅需设置一次</div>
            </el-form-item>
          </div>
        </el-card>

        <!-- 中间 - 参数配置和预览 -->
        <el-tabs type="border-card" class="config-preview-tabs">
          <el-tab-pane label="参数配置">
            <div class="params-content">
              <Params 
                v-if="currentQB" 
                v-model="currentQB" 
                :fixed-pool-widgets="fixedPoolWidgets"
                :free-pool-widgets="freePoolWidgets"
                @test-connection="testConnection" 
                @save-config="saveConfig"
                @apply-to-fixed="applyToFixed"
                @apply-to-free="applyToFree"
              />
              <div v-else class="no-qb-selected">
                <el-empty description="请选择或添加一个QB下载器" />
              </div>
            </div>
          </el-tab-pane>
          <el-tab-pane label="预览效果">
            <div class="preview-header" v-if="currentQB && currentQB.isConfigValid">
              <div class="preview-tips">
                <el-alert
                  type="info"
                  :closable="false"
                  show-icon
                >
                  <p>预览区域为响应式布局，实际部署后会根据最终部署环境自动调整大小和布局</p>
                </el-alert>
              </div>
              <el-button 
                type="primary" 
                size="small" 
                @click="refreshPreview"
              >
                刷新预览
              </el-button>
            </div>
            <div class="preview-content">
              <div v-if="currentQB && currentQB.isConfigValid" class="iframe-preview">
                <div class="gradient-bg"></div>
                <iframe 
                  :src="widgetUrl" 
                  frameborder="0" 
                  width="100%" 
                  height="300"
                  @load="iframeLoaded = true"
                ></iframe>
                <div v-if="!iframeLoaded" class="iframe-loading">
                  <el-icon class="is-loading"><Loading /></el-icon>
                  <span>加载预览中...</span>
                </div>
              </div>
              <Preview 
                v-else-if="currentQB" 
                :preview-data="previewData" 
                :display-items="currentQB.displayItems"
              />
              <div v-else class="no-preview">
                <el-empty description="请先配置QB下载器" />
              </div>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>
    </div>

    <!-- 使用新的帮助对话框组件 -->
    <HelpDialog v-model:visible="helpDialogVisible" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Delete, DocumentCopy, Loading } from '@element-plus/icons-vue'
import request from '@/utils/request'
import Params from './params.vue'
import Preview from './preview.vue'
import HelpDialog from './help-dialog.vue'
import { QBConfig, QBStatusData, QBService, createDefaultQBConfig, generateWidgetUrl } from './qb-service'
import axios from 'axios'

// 定义接口
interface SaveConfigResponse {
  success: boolean
  id?: string
  error?: string
}

interface ComponentPoolItem {
  type: string
  title: string
  name: string
  url?: string
  config: any
  source?: string
  [key: string]: any
}

interface ApiResponse<T> {
  code: number
  message: string
  data: T
}

interface PoolData {
  widgets: ComponentPoolItem[]
  [key: string]: any
}

// 域名前缀
const domainPrefix = ref('')

// 监听域名前缀变化，更新当前QB配置
watch(domainPrefix, (newPrefix) => {
  if (currentQB.value) {
    currentQB.value.domainPrefix = newPrefix
    saveQBList()
  }
})

// QB下载器列表
const qbList = ref<QBConfig[]>([])
// 当前选中的QB下载器索引
const currentQBIndex = ref(-1)
// 预览数据
const previewData = ref<QBStatusData>({
  name: '',
  isOnline: false,
  downloadSpeed: 0,
  uploadSpeed: 0,
  activeTorrents: 0,
  pausedTorrents: 0,
  completedTorrents: 0,
  totalTorrents: 0,
  activeDownloads: 0,
  globalRatio: 0,
  globalDownloaded: 0,
  globalUploaded: 0,
  freeSpace: 0,
  seedingTorrents: 0,
  totalSize: 0,
  averageRatio: 0,
  ioTasks: 0,
  errorTorrents: 0,
  uploadLimit: 0,
  downloadLimit: 0
})

// 当前选中的QB下载器
const currentQB = computed(() => {
  if (currentQBIndex.value >= 0 && currentQBIndex.value < qbList.value.length) {
    return qbList.value[currentQBIndex.value]
  }
  return null
})

// 组件URL
const widgetUrl = computed(() => {
  if (currentQB.value && currentQB.value.isConfigValid) {
    return generateWidgetUrl(currentQB.value)
  }
  return ''
})

// 组件池数据
const fixedPoolWidgets = ref<any[]>([])
const freePoolWidgets = ref<any[]>([])

// 获取组件池数据
const fetchPoolData = async () => {
  try {
    // 获取固定组件池
    const fixedResponse = await request({
      url: '/api/fixed/pool',
      method: 'GET'
    }).catch(() => ({ data: { widgets: [] } }))
    
    // 获取自由组件池
    const freeResponse = await request({
      url: '/api/free/pool',
      method: 'GET'
    }).catch(() => ({ data: { widgets: [] } }))
    
    fixedPoolWidgets.value = fixedResponse.data?.widgets || []
    freePoolWidgets.value = freeResponse.data?.widgets || []
    
    console.log('已获取组件池数据', {
      fixed: fixedPoolWidgets.value.length,
      free: freePoolWidgets.value.length
    })
  } catch (error) {
    console.error('获取组件池数据失败:', error)
    // 使用空数组作为默认值
    fixedPoolWidgets.value = []
    freePoolWidgets.value = []
  }
}

// 添加新的QB下载器
const addNewQB = () => {
  const newQB = createDefaultQBConfig()
  // 设置域名前缀
  newQB.domainPrefix = domainPrefix.value
  qbList.value.push(newQB)
  currentQBIndex.value = qbList.value.length - 1
  saveQBList()
}

// 选择QB下载器
const selectQB = (index: number) => {
  currentQBIndex.value = index
}

// 移除QB下载器
const removeQB = (index: number) => {
  ElMessageBox.confirm(
    '确定要删除这个QB下载器吗？',
    '删除确认',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    qbList.value.splice(index, 1)
    if (currentQBIndex.value === index) {
      currentQBIndex.value = qbList.value.length > 0 ? 0 : -1
    } else if (currentQBIndex.value > index) {
      currentQBIndex.value--
    }
    saveQBList()
    ElMessage.success('删除成功')
  }).catch(() => {
    // 取消删除
  })
}

// 测试连接
const testConnection = async () => {
  if (!currentQB.value) return
  
  try {
    ElMessage.info('正在测试连接...')
    
    const qbService = new QBService(currentQB.value)
    const isConnected = await qbService.testConnection()
    
    if (isConnected) {
      currentQB.value.isConfigValid = true
      currentQB.value.lastTested = Date.now()
      saveQBList()
      
      // 获取状态数据用于预览
      const statusData = await qbService.getStatus()
      previewData.value = statusData
      
      ElMessage.success('连接测试成功')
    } else {
      currentQB.value.isConfigValid = false
      saveQBList()
      ElMessage.error('连接测试失败')
    }
  } catch (error) {
    console.error('测试连接错误:', error)
    currentQB.value.isConfigValid = false
    saveQBList()
    ElMessage.error('连接测试失败: ' + (error instanceof Error ? error.message : '未知错误'))
  }
}

// 保存配置
const saveConfig = async () => {
  if (!currentQB.value) {
    ElMessage.warning('请先选择或添加一个QB下载器')
    return
  }
  
  if (!currentQB.value.isConfigValid) {
    ElMessage.warning('请先测试连接，确保配置有效')
    return
  }
  
  try {
    console.log('准备保存配置:', JSON.stringify(currentQB.value));
    
    // 确保displayItems包含所有必要的字段
    const allItems = [
      'downloadSpeed', 'uploadSpeed', 'activeDownloads', 'activeTorrents',
      'pausedTorrents', 'completedTorrents', 'totalTorrents', 'errorTorrents',
      'seedingTorrents', 'ioTasks', 'globalRatio', 'averageRatio',
      'globalDownloaded', 'globalUploaded', 'uploadLimit', 'downloadLimit',
      'freeSpace', 'totalSize'
    ];
    
    // 此时我们已经确认currentQB.value不为null
    const config = currentQB.value;
    
    if (!config.displayItems) {
      config.displayItems = {
        downloadSpeed: true,
        uploadSpeed: true,
        activeDownloads: false,
        activeTorrents: false,
        pausedTorrents: false,
        completedTorrents: false,
        totalTorrents: false,
        globalRatio: false,
        globalDownloaded: false,
        globalUploaded: false,
        freeSpace: false,
        seedingTorrents: false,
        totalSize: false,
        averageRatio: false,
        ioTasks: false,
        errorTorrents: false,
        uploadLimit: false,
        downloadLimit: false
      };
    } else {
      // 确保所有字段都存在，但不改变现有值
      allItems.forEach(item => {
        if (config.displayItems[item] === undefined) {
          console.log(`配置中缺少${item}项，设置为默认值false`);
          config.displayItems[item] = false;
        }
      });
    }
    
    // 确保displayOrder字段存在且只包含用户选择的项目
    if (!config.displayOrder || !Array.isArray(config.displayOrder)) {
      console.log('创建默认的displayOrder字段');
      // 只包含已勾选的项目
      config.displayOrder = Object.keys(config.displayItems)
        .filter(key => config.displayItems[key] === true);
    } else {
      // 只保留用户选择的显示项
      config.displayOrder = config.displayOrder.filter(item => 
        config.displayItems[item] === true
      );
    }
    
    console.log('保存前的最终配置:', JSON.stringify(config));
    
    // 使用QBService保存配置
    const qbService = new QBService(config)
    const saveResult = await qbService.saveConfigToServer()
    
    if (!saveResult) {
      throw new Error('保存配置到服务器失败')
    }
    
    // 保存到本地列表
    saveQBList()
    
    // 获取状态数据用于预览
    const statusData = await qbService.getStatus()
    
    // 更新预览数据
    previewData.value = statusData
    
    ElMessage.success('配置已保存')
  } catch (error) {
    console.error('保存配置出错:', error)
    ElMessage.error('保存配置出错: ' + (error instanceof Error ? error.message : String(error)))
  }
}

// 保存QB下载器列表到本地存储和后端
const saveQBList = async () => {
  // 保存到本地存储作为备份
  localStorage.setItem('qb-status-list', JSON.stringify(qbList.value))
  
  // 将数组转换为对象，以便与后端API格式匹配
  const configsObject: Record<string, any> = {}
  qbList.value.forEach(config => {
    if (config.id) {
      configsObject[config.id] = config
    }
  })
  
  try {
    // 保存到后端
    await axios.post('/api/widgets/qb-status/configs', configsObject)
    console.log('QB配置列表已保存到后端')
  } catch (error) {
    console.error('保存QB配置列表到后端失败:', error)
    ElMessage.error('保存配置到服务器失败，但已保存到本地')
  }
}

// 从本地存储加载QB下载器列表
const loadQBList = async () => {
  try {
    // 首先尝试从后端API获取配置列表
    const response = await axios.get('/api/widgets/qb-status/configs')
    
    if (response.data) {
      // 将对象转换为数组
      const configsArray = Object.values(response.data)
      
      // 迁移旧配置
      qbList.value = configsArray.map((item: any) => {
        // 确保displayItems字段符合当前的接口定义
        if (item.displayItems) {
          // 保留当前接口中定义的字段
          item.displayItems = {
            downloadSpeed: item.displayItems.downloadSpeed ?? true,
            uploadSpeed: item.displayItems.uploadSpeed ?? true,
            activeDownloads: item.displayItems.activeDownloads ?? false,
            activeTorrents: item.displayItems.activeTorrents ?? false,
            pausedTorrents: item.displayItems.pausedTorrents ?? false,
            completedTorrents: item.displayItems.completedTorrents ?? false,
            totalTorrents: item.displayItems.totalTorrents ?? false,
            globalRatio: item.displayItems.globalRatio ?? false,
            globalDownloaded: item.displayItems.globalDownloaded ?? false,
            globalUploaded: item.displayItems.globalUploaded ?? false,
            freeSpace: item.displayItems.freeSpace ?? false,
            seedingTorrents: item.displayItems.seedingTorrents ?? false,
            totalSize: item.displayItems.totalSize ?? false,
            averageRatio: item.displayItems.averageRatio ?? false,
            ioTasks: item.displayItems.ioTasks ?? false,
            errorTorrents: item.displayItems.errorTorrents ?? false,
            uploadLimit: item.displayItems.uploadLimit ?? false,
            downloadLimit: item.displayItems.downloadLimit ?? false
          }
        }
        
        // 确保应用状态字段存在
        item.isAppliedToFixed = item.isAppliedToFixed ?? false
        item.isAppliedToFree = item.isAppliedToFree ?? false
        
        return item
      })
      
      if (qbList.value.length > 0) {
        currentQBIndex.value = 0
        // 设置域名前缀
        if (currentQB.value && currentQB.value.domainPrefix) {
          domainPrefix.value = currentQB.value.domainPrefix
        }
      } else {
        // 如果没有配置，创建一个默认的
        addNewQB()
      }
      
      console.log('从后端API加载了QB配置列表:', qbList.value)
      return
    }
  } catch (error) {
    console.error('从后端API加载QB配置列表失败，尝试从本地存储加载:', error)
  }
  
  // 如果从API加载失败，尝试从本地存储加载
  const savedList = localStorage.getItem('qb-status-list')
  if (savedList) {
    try {
      // 解析保存的列表
      const parsedList = JSON.parse(savedList)
      
      // 迁移旧配置
      qbList.value = parsedList.map((item: any) => {
        // 确保displayItems字段符合当前的接口定义
        if (item.displayItems) {
          // 保留当前接口中定义的字段
          item.displayItems = {
            downloadSpeed: item.displayItems.downloadSpeed ?? true,
            uploadSpeed: item.displayItems.uploadSpeed ?? true,
            activeDownloads: item.displayItems.activeDownloads ?? false,
            activeTorrents: item.displayItems.activeTorrents ?? false,
            pausedTorrents: item.displayItems.pausedTorrents ?? false,
            completedTorrents: item.displayItems.completedTorrents ?? false,
            totalTorrents: item.displayItems.totalTorrents ?? false,
            globalRatio: item.displayItems.globalRatio ?? false,
            globalDownloaded: item.displayItems.globalDownloaded ?? false,
            globalUploaded: item.displayItems.globalUploaded ?? false,
            freeSpace: item.displayItems.freeSpace ?? false,
            seedingTorrents: item.displayItems.seedingTorrents ?? false,
            totalSize: item.displayItems.totalSize ?? false,
            averageRatio: item.displayItems.averageRatio ?? false,
            ioTasks: item.displayItems.ioTasks ?? false,
            errorTorrents: item.displayItems.errorTorrents ?? false,
            uploadLimit: item.displayItems.uploadLimit ?? false,
            downloadLimit: item.displayItems.downloadLimit ?? false
          }
        }
        
        // 确保应用状态字段存在
        item.isAppliedToFixed = item.isAppliedToFixed ?? false
        item.isAppliedToFree = item.isAppliedToFree ?? false
        
        return item
      })
      
      if (qbList.value.length > 0) {
        currentQBIndex.value = 0
        // 设置域名前缀
        if (currentQB.value && currentQB.value.domainPrefix) {
          domainPrefix.value = currentQB.value.domainPrefix
        }
      }
    } catch (error) {
      console.error('加载QB下载器列表失败:', error)
      qbList.value = []
    }
  } else {
    // 如果没有保存的列表，创建一个默认的
    addNewQB()
  }
}

// 重置参数
const handleReset = () => {
  ElMessageBox.confirm(
    '确定要重置所有参数吗？这将删除所有已配置的QB下载器。',
    '重置确认',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    qbList.value = []
    currentQBIndex.value = -1
    localStorage.removeItem('qb-status-list')
    addNewQB()
    ElMessage.success('参数已重置')
  }).catch(() => {
    // 取消重置
  })
}

// 刷新预览
const refreshPreview = async () => {
  if (!currentQB.value || !currentQB.value.isConfigValid) {
    ElMessage.warning('请先测试连接，确保配置有效')
    return
  }
  
  try {
    ElMessage.info('正在刷新预览...')
    const qbService = new QBService(currentQB.value)
    const statusData = await qbService.getStatus()
    previewData.value = statusData
    ElMessage.success('预览已刷新')
  } catch (error) {
    console.error('刷新预览失败:', error)
    ElMessage.error('刷新预览失败: ' + (error instanceof Error ? error.message : String(error)))
  }
}

// 应用到固定组件
const applyToFixed = async () => {
  if (!currentQB.value || !currentQB.value.isConfigValid) {
    ElMessage.warning('请先测试连接，确保配置有效')
    return
  }
  
  try {
    // 使用QBService保存配置
    const qbService = new QBService(currentQB.value)
    await qbService.getStatus() // 这会自动保存配置
    
    // 生成组件URL
    const widgetUrl = generateWidgetUrl(currentQB.value)
    
    // 获取当前固定组件池
    const response = await request({
      url: '/api/fixed/pool',
      method: 'GET'
    })
    
    console.log('获取到的固定组件池:', response)
    
    const poolData = response.data || {}
    const poolWidgets = poolData.widgets || []
    
    // 检查是否已存在相同URL的QB下载器组件（通过URL中的ID判断）
    const existingWidget = poolWidgets.find((w: any) => 
      w.url && w.url.includes(`id=${currentQB.value?.id}`)
    )
    
    // 检查是否存在同名但不同ID的组件
    const sameNameWidget = poolWidgets.find((w: any) => 
      w.name === currentQB.value?.name && 
      (!w.url || !w.url.includes(`id=${currentQB.value?.id}`))
    )
    
    try {
      // 如果存在同名但不同ID的组件，先删除它
      if (sameNameWidget) {
        console.log('删除同名组件:', sameNameWidget)
        await request({
          url: '/api/fixed/pool',
          method: 'POST',
          data: {
            action: 'remove',
            name: sameNameWidget.name
          }
        })
      }
      
      if (existingWidget) {
        console.log('更新已存在的组件:', existingWidget)
        
        // 如果存在，则更新该组件的配置
        const updateResponse = await request({
          url: '/api/fixed/pool',
          method: 'POST',
          data: {
            action: 'update',
            name: existingWidget.name,
            widget: {
              id: existingWidget.id,
              name: currentQB.value.name,
              url: widgetUrl,
              type: 'widget',
              source: 'market',
              width: 500,
              height: 300,
              mobileShow: true
            }
          }
        })
        
        console.log('更新组件响应:', updateResponse)
        ElMessage.success('已更新固定组件')
      } else {
        // 如果不存在，则添加新组件
        const newWidget = {
          id: Date.now().toString(),
          name: currentQB.value.name,
          url: widgetUrl,
          type: 'widget',
          source: 'market',
          width: 500,
          height: 300,
          mobileShow: true
        }
        
        console.log('添加新组件:', newWidget)
        
        const addResponse = await request({
          url: '/api/fixed/pool',
          method: 'POST',
          data: {
            action: 'add',
            widget: newWidget
          }
        })
        
        console.log('添加组件响应:', addResponse)
        ElMessage.success('已添加到固定组件')
      }
      
      // 标记为已应用
      currentQB.value.isAppliedToFixed = true
      saveQBList()
    } catch (apiError: any) {
      console.error('API请求错误:', apiError)
      
      // 尝试获取详细错误信息
      let errorMessage = '未知错误'
      if (apiError.response && apiError.response.data) {
        errorMessage = apiError.response.data.message || JSON.stringify(apiError.response.data)
      } else if (apiError.message) {
        errorMessage = apiError.message
      }
      
      ElMessage.error(`应用到固定组件失败: ${errorMessage}`)
      throw apiError // 重新抛出错误以便外层捕获
    }
  } catch (error) {
    console.error('应用到固定组件失败:', error)
    // 外层错误处理已在内层完成，这里不再显示错误消息
  }
}

// 应用到自由组件
const applyToFree = async () => {
  if (!currentQB.value || !currentQB.value.isConfigValid) {
    ElMessage.warning('请先测试连接，确保配置有效')
    return
  }
  
  try {
    // 使用QBService保存配置
    const qbService = new QBService(currentQB.value)
    await qbService.getStatus() // 这会自动保存配置
    
    // 生成组件URL
    const widgetUrl = generateWidgetUrl(currentQB.value)
    
    // 获取当前自由组件池
    const response = await request({
      url: '/api/free/pool',
      method: 'GET'
    })
    
    console.log('获取到的自由组件池:', response)
    
    const poolData = response.data || {}
    const poolWidgets = poolData.widgets || []
    
    // 检查是否已存在相同URL的QB下载器组件（通过URL中的ID判断）
    const existingWidget = poolWidgets.find((w: any) => 
      w.url && w.url.includes(`id=${currentQB.value?.id}`)
    )
    
    // 检查是否存在同名但不同ID的组件
    const sameNameWidget = poolWidgets.find((w: any) => 
      w.name === currentQB.value?.name && 
      (!w.url || !w.url.includes(`id=${currentQB.value?.id}`))
    )
    
    try {
      // 如果存在同名但不同ID的组件，先删除它
      if (sameNameWidget) {
        console.log('删除同名组件:', sameNameWidget)
        await request({
          url: '/api/free/pool',
          method: 'POST',
          data: {
            action: 'remove',
            name: sameNameWidget.name
          }
        })
      }
      
      if (existingWidget) {
        console.log('更新已存在的组件:', existingWidget)
        
        // 如果存在，则更新该组件的配置
        const updateResponse = await request({
          url: '/api/free/pool',
          method: 'POST',
          data: {
            action: 'update',
            name: existingWidget.name,
            widget: {
              id: existingWidget.id,
              name: currentQB.value.name,
              url: widgetUrl,
              source: 'market'
            }
          }
        })
        
        console.log('更新组件响应:', updateResponse)
        ElMessage.success('已更新自由组件')
      } else {
        // 如果不存在，则添加新组件
        const newWidget = {
          id: Date.now().toString(),
          name: currentQB.value.name,
          url: widgetUrl,
          source: 'market'
        }
        
        console.log('添加新组件:', newWidget)
        
        const addResponse = await request({
          url: '/api/free/pool',
          method: 'POST',
          data: {
            action: 'add',
            widget: newWidget
          }
        })
        
        console.log('添加组件响应:', addResponse)
        ElMessage.success('已添加到自由组件')
      }
      
      // 标记为已应用
      currentQB.value.isAppliedToFree = true
      saveQBList()
    } catch (apiError: any) {
      console.error('API请求错误:', apiError)
      
      // 尝试获取详细错误信息
      let errorMessage = '未知错误'
      if (apiError.response && apiError.response.data) {
        errorMessage = apiError.response.data.message || JSON.stringify(apiError.response.data)
      } else if (apiError.message) {
        errorMessage = apiError.message
      }
      
      ElMessage.error(`应用到自由组件失败: ${errorMessage}`)
      throw apiError // 重新抛出错误以便外层捕获
    }
  } catch (error) {
    console.error('应用到自由组件失败:', error)
    // 外层错误处理已在内层完成，这里不再显示错误消息
  }
}

// 组件加载时从本地存储加载配置
onMounted(() => {
  loadQBList()
  fetchPoolData() // 获取组件池数据
})

// 监听当前QB变化，更新预览数据和域名前缀
watch(currentQB, async (newQB) => {
  if (newQB) {
    // 更新域名前缀
    domainPrefix.value = newQB.domainPrefix || ''
    
    if (newQB.isConfigValid) {
      try {
        const qbService = new QBService(newQB)
        const statusData = await qbService.getStatus()
        previewData.value = statusData
      } catch (error) {
        console.error('获取预览数据失败:', error)
      }
    } else {
      // 重置预览数据
      previewData.value = {
        name: newQB?.name || '',
        isOnline: false,
        downloadSpeed: 0,
        uploadSpeed: 0,
        activeTorrents: 0,
        pausedTorrents: 0,
        completedTorrents: 0,
        totalTorrents: 0,
        activeDownloads: 0,
        globalRatio: 0,
        globalDownloaded: 0,
        globalUploaded: 0,
        freeSpace: 0,
        seedingTorrents: 0,
        totalSize: 0,
        averageRatio: 0,
        ioTasks: 0,
        errorTorrents: 0,
        uploadLimit: 0,
        downloadLimit: 0
      }
    }
  }
})

// 添加iframe加载状态
const iframeLoaded = ref(false)

// 监听当前QB变化，重置iframe加载状态
watch(currentQB, () => {
  iframeLoaded.value = false
})

// 监听widgetUrl变化，重置iframe加载状态
watch(widgetUrl, () => {
  iframeLoaded.value = false
})

// 使用指南弹窗
const helpDialogVisible = ref(false)

// 显示使用指南弹窗
const showHelpDialog = () => {
  helpDialogVisible.value = true
}

// 监听配置中displayItems的变化
watch(() => currentQB.value?.displayItems, (newDisplayItems) => {
  if (!currentQB.value || !newDisplayItems) return;
  
  console.log('显示项配置已更新:', newDisplayItems);
  
  // 更新displayOrder，只保留用户选择的项目
  if (currentQB.value.displayOrder) {
    currentQB.value.displayOrder = currentQB.value.displayOrder.filter(key => 
      newDisplayItems[key] === true
    );
    console.log('更新后的显示顺序:', currentQB.value.displayOrder);
  }
}, { deep: true })
</script>

<style lang="scss" scoped>
.qb-status-detail {
  padding: 24px;
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
  background-color: #fff;
  border-radius: 12px;
  box-sizing: border-box;
}

.header-section {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
  
  .title-area {
    h2 {
      margin: 0 0 8px;
      font-size: 24px;
      font-weight: 600;
      color: var(--el-color-primary);
    }
    
    .description {
      color: var(--el-text-color-secondary);
      margin: 0;
    }
  }
  
  .actions {
    display: flex;
    gap: 12px;
  }
}

.main-content {
  display: grid;
  grid-template-columns: minmax(250px, 280px) 1fr;
  gap: 24px;
  margin-bottom: 24px;
  
  @media (max-width: 1200px) {
    grid-template-columns: 1fr;
  }
}

.right-section {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.section-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0;
  font-weight: 600;
  font-size: 16px;
}

.qb-list-section {
  border-radius: 8px;
  overflow: hidden;
  
  :deep(.el-card__header) {
    padding: 12px 16px;
    border-top-left-radius: 8px;
    border-top-right-radius: 8px;
  }
  
  :deep(.el-card__body) {
    padding: 0;
    max-height: 500px;
    overflow-y: auto;
    border-bottom-left-radius: 8px;
    border-bottom-right-radius: 8px;
  }
  
  .qb-list {
    .qb-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 16px;
      border-bottom: 1px solid var(--el-border-color-lighter);
      cursor: pointer;
      transition: all 0.2s;
      
      &:last-child {
        border-bottom: none;
      }
      
      &:hover {
        background-color: var(--el-color-primary-light-9);
      }
      
      &.active {
        background-color: var(--el-color-primary-light-8);
        border-left: 3px solid var(--el-color-primary);
      }
      
      .qb-item-content {
        display: flex;
        align-items: center;
        flex: 1;
      }
      
      .qb-item-name {
        font-weight: 500;
        flex: 1;
        margin-right: 8px;
        word-break: break-word;
      }
      
      .qb-item-status {
        font-size: 12px;
        padding: 2px 6px;
        border-radius: 10px;
        background-color: var(--el-color-danger-light-9);
        color: var(--el-color-danger);
        
        &.valid {
          background-color: var(--el-color-success-light-9);
          color: var(--el-color-success);
        }
      }
    }
    
    .no-qb {
      padding: 40px 0;
    }
  }
}

.config-preview-tabs {
  border-radius: 8px;
  overflow: hidden;
  
  :deep(.el-tabs__header) {
    margin-bottom: 0;
    border-top-left-radius: 8px;
    border-top-right-radius: 8px;
  }
  
  :deep(.el-tabs__content) {
    padding: 16px;
    border-bottom-left-radius: 8px;
    border-bottom-right-radius: 8px;
  }
  
  .preview-header {
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin-bottom: 16px;
    
    .preview-tips {
      :deep(.el-alert) {
        border-radius: 6px;
        
        p {
          margin: 0;
          font-size: 12px;
        }
      }
    }
    
    .el-button {
      align-self: flex-end;
    }
  }
}

.params-content, .preview-content {
  min-height: 300px;
  
  .no-qb-selected, .no-preview {
    height: 200px;
    display: flex;
    justify-content: center;
    align-items: center;
  }
}

.domain-prefix-section {
  border-radius: 8px;
  overflow: hidden;
  
  :deep(.el-card__header) {
    padding: 12px 16px;
    border-top-left-radius: 8px;
    border-top-right-radius: 8px;
  }
  
  :deep(.el-card__body) {
    padding: 16px;
    border-bottom-left-radius: 8px;
    border-bottom-right-radius: 8px;
  }
  
  .domain-prefix-content {
    .el-form-item {
      margin-bottom: 0;
    }
    
    .form-tip {
      font-size: 12px;
      color: var(--el-text-color-secondary);
      margin-top: 4px;
    }
  }
}

.iframe-preview {
  position: relative;
  width: 100%;
  max-width: 100%;
  height: 300px;
  border: 1px solid var(--el-border-color-light);
  border-radius: 8px;
  overflow: hidden;
  margin: 0 auto;
  
  .gradient-bg {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(135deg, #1a1a2e, #16213e, #0f3460);
    background-size: 400% 400%;
    animation: gradient-animation 15s ease infinite;
    z-index: 0;
    pointer-events: none; /* 确保背景不会阻止iframe交互 */
  }
  
  iframe {
    position: relative;
    z-index: 1;
    background: transparent !important; /* 强制透明背景 */
    width: 100%;
    height: 100%;
    border-radius: 8px;
  }
  
  .iframe-loading {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    background-color: rgba(26, 26, 46, 0.8);
    color: white;
    z-index: 10;
    border-radius: 8px;
    
    .el-icon {
      font-size: 24px;
      margin-bottom: 8px;
    }
  }
}

@keyframes gradient-animation {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

.help-dialog {
  :deep(.el-dialog) {
    border-radius: 12px;
    overflow: hidden;
    
    .el-dialog__header {
      border-top-left-radius: 12px;
      border-top-right-radius: 12px;
    }
    
    .el-dialog__body {
      border-bottom-left-radius: 12px;
      border-bottom-right-radius: 12px;
    }
  }
  
  .help-content {
    max-height: 60vh;
    overflow-y: auto;
    padding: 0 16px;
    
    h3 {
      margin-top: 20px;
      margin-bottom: 12px;
      font-weight: 600;
      color: var(--el-color-primary);
    }
    
    ol, ul {
      padding-left: 20px;
      margin-bottom: 16px;
      
      li {
        margin-bottom: 8px;
        line-height: 1.6;
      }
    }
    
    strong {
      font-weight: 600;
    }
  }
}

@media (max-width: 768px) {
  .qb-status-detail {
    padding: 16px;
  }
  
  .header-section {
    flex-direction: column;
    
    .actions {
      margin-top: 16px;
      align-self: flex-end;
      flex-wrap: wrap;
      
      .el-button {
        flex: 1;
      }
    }
  }
  
  .iframe-preview {
    max-width: 100%;
  }
}

/* 支持作者样式 */
.support-author {
  margin: 0 0 20px;
  text-align: center;
  font-size: 14px;
  background: linear-gradient(to right, rgba(230, 162, 60, 0.05), rgba(230, 162, 60, 0.1), rgba(230, 162, 60, 0.05));
  padding: 10px 16px;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  
  &:hover {
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  }
  
  .support-text {
    color: #606266;
    
    .highlight {
      color: #E6A23C;
      font-weight: 500;
      margin-left: 4px;
    }
  }
}
</style> 