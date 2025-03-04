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
            :key="index" 
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
              
              <div class="preview-actions">
                <el-button 
                  type="primary" 
                  size="small" 
                  @click="refreshPreview"
                >
                  刷新预览
                </el-button>
              </div>
            </div>
            
            <div class="preview-content">
              <!-- 主题设置区域 -->
              <el-collapse>
                <el-collapse-item name="theme">
                  <template #title>
                    <span class="highlight-title">
                      <el-icon style="margin-right: 6px;"><Brush /></el-icon>
                      主题设置
                    </span>
                  </template>
                  <el-tabs type="card" style="margin-bottom: 10px;">
                    <el-tab-pane label="基础主题">
                      <div class="theme-grid">
                        <!-- 基础颜色设置 -->
                        <el-form-item label="背景颜色" class="mini-form-item">
                          <el-color-picker v-model="themeSettings.backgroundColor" size="small" show-alpha @change="handleThemeChange" />
                        </el-form-item>
                        <el-form-item label="背景透明度" class="mini-form-item">
                          <el-slider v-model="themeSettings.backgroundOpacity" :min="0" :max="1" :step="0.1" @change="handleThemeChange" />
                        </el-form-item>
                        <el-form-item label="边框圆角" class="mini-form-item">
                          <el-input v-model="themeSettings.borderRadius" size="small" @change="handleThemeChange" />
                        </el-form-item>
                        
                        <!-- 头部设置 -->
                        <el-form-item label="头部背景" class="mini-form-item">
                          <el-color-picker v-model="themeSettings.headerBackgroundColor" size="small" @change="handleThemeChange" />
                        </el-form-item>
                        <el-form-item label="头部文本色" class="mini-form-item">
                          <el-color-picker v-model="themeSettings.headerTextColor" size="small" @change="handleThemeChange" />
                        </el-form-item>
                        
                        <!-- 状态颜色 -->
                        <el-form-item label="在线状态色" class="mini-form-item">
                          <el-color-picker v-model="themeSettings.onlineStatusColor" size="small" show-alpha @change="handleThemeChange" />
                        </el-form-item>
                        <el-form-item label="离线状态色" class="mini-form-item">
                          <el-color-picker v-model="themeSettings.offlineStatusColor" size="small" show-alpha @change="handleThemeChange" />
                        </el-form-item>
                      </div>
                    </el-tab-pane>
                    
                    <el-tab-pane label="项目颜色">
                      <el-collapse accordion style="width: 100%;">
                        <el-collapse-item title="下载速度">
                          <div class="theme-grid">
                            <el-form-item label="背景颜色" class="mini-form-item">
                              <el-color-picker v-model="themeSettings.downloadSpeedBgColor" size="small" show-alpha @change="handleThemeChange" />
                            </el-form-item>
                            <el-form-item label="值文本色" class="mini-form-item">
                              <el-color-picker v-model="themeSettings.downloadSpeedTextColor" size="small" @change="handleThemeChange" />
                            </el-form-item>
                            <el-form-item label="标签文本色" class="mini-form-item">
                              <el-color-picker v-model="themeSettings.downloadSpeedLabelColor" size="small" @change="handleThemeChange" />
                            </el-form-item>
                          </div>
                        </el-collapse-item>
                        
                        <el-collapse-item title="上传速度">
                          <div class="theme-grid">
                            <el-form-item label="背景颜色" class="mini-form-item">
                              <el-color-picker v-model="themeSettings.uploadSpeedBgColor" size="small" show-alpha @change="handleThemeChange" />
                            </el-form-item>
                            <el-form-item label="值文本色" class="mini-form-item">
                              <el-color-picker v-model="themeSettings.uploadSpeedTextColor" size="small" @change="handleThemeChange" />
                            </el-form-item>
                            <el-form-item label="标签文本色" class="mini-form-item">
                              <el-color-picker v-model="themeSettings.uploadSpeedLabelColor" size="small" @change="handleThemeChange" />
                            </el-form-item>
                          </div>
                        </el-collapse-item>
                        
                        <!-- 动态生成其他项目的颜色设置 -->
                        <template v-for="(label, key) in displayItemLabels" :key="key">
                          <el-collapse-item 
                            :title="label"
                            v-if="key !== 'downloadSpeed' && key !== 'uploadSpeed'"
                          >
                            <div class="theme-grid">
                              <el-form-item label="背景颜色" class="mini-form-item">
                                <el-color-picker v-model="themeSettings[`${key}BgColor`]" size="small" show-alpha @change="handleThemeChange" />
                              </el-form-item>
                              <el-form-item label="值文本色" class="mini-form-item">
                                <el-color-picker v-model="themeSettings[`${key}TextColor`]" size="small" @change="handleThemeChange" />
                              </el-form-item>
                              <el-form-item label="标签文本色" class="mini-form-item">
                                <el-color-picker v-model="themeSettings[`${key}LabelColor`]" size="small" @change="handleThemeChange" />
                              </el-form-item>
                            </div>
                          </el-collapse-item>
                        </template>
                      </el-collapse>
                    </el-tab-pane>
                    
                    <el-tab-pane label="预设主题">
                      <div class="preset-themes">
                        <div class="preset-theme-grid">
                          <div class="preset-theme-card" @click="applyPresetTheme('dark')">
                            <div class="preset-theme-preview dark-theme"></div>
                            <div class="preset-theme-name">暗色主题</div>
                          </div>
                          <div class="preset-theme-card" @click="applyPresetTheme('light')">
                            <div class="preset-theme-preview light-theme"></div>
                            <div class="preset-theme-name">亮色主题</div>
                          </div>
                          <div class="preset-theme-card" @click="applyPresetTheme('nord')">
                            <div class="preset-theme-preview nord-theme"></div>
                            <div class="preset-theme-name">Nord主题</div>
                          </div>
                          <div class="preset-theme-card" @click="applyPresetTheme('elegant')">
                            <div class="preset-theme-preview elegant-theme"></div>
                            <div class="preset-theme-name">优雅主题</div>
                          </div>
                          <div class="preset-theme-card" @click="applyPresetTheme('acrylic')">
                            <div class="preset-theme-preview acrylic-theme"></div>
                            <div class="preset-theme-name">亚克力主题</div>
                          </div>
                          <div class="preset-theme-card" @click="applyPresetTheme('minimal')">
                            <div class="preset-theme-preview minimal-theme"></div>
                            <div class="preset-theme-name">极简主题</div>
                          </div>
                          <div class="preset-theme-card" @click="applyPresetTheme('colorful')">
                            <div class="preset-theme-preview colorful-theme"></div>
                            <div class="preset-theme-name">多彩主题</div>
                          </div>
                        </div>
                      </div>
                    </el-tab-pane>
                  </el-tabs>
                  
                  <div class="action-buttons">
                    <el-button type="primary" size="small" @click="handleThemeUpdate(themeSettings)">应用主题</el-button>
                    <el-button size="small" @click="resetTheme">重置</el-button>
                  </div>
                </el-collapse-item>
              </el-collapse>
              
              <!-- 有效配置时显示iframe预览 -->
              <div v-if="currentQB && currentQB.isConfigValid" class="iframe-preview">
                <div class="gradient-bg" :style="gradientBgStyle"></div>
                <iframe 
                  :src="widgetUrl" 
                  frameborder="0" 
                  :style="iframeStyle"
                  @load="handleIframeLoaded"
                ></iframe>
                <div class="dimension-display">
                  {{ componentSize.width }} × {{ componentSize.height }}
                </div>
                <div v-if="!iframeLoaded" class="iframe-loading">
                  <el-icon class="is-loading"><Loading /></el-icon>
                  <span>加载预览中...</span>
                </div>
              </div>
              
              <!-- 壁纸背景和组件尺寸设置区域 -->
              <el-card v-if="currentQB && currentQB.isConfigValid" class="preview-settings-card">
                <template #header>
                  <div class="section-title">
                    <span>预览区域设置</span>
                  </div>
                </template>
                
                <el-tabs type="border-card">
                  <el-tab-pane label="壁纸背景设置">
                    <div class="theme-grid responsive-grid">
                      <el-form-item label="壁纸背景色" class="mini-form-item">
                        <el-color-picker v-model="wallpaperSettings.backgroundColor" size="small" show-alpha @change="handleWallpaperChange" />
                      </el-form-item>
                      <el-form-item label="壁纸样式" class="mini-form-item">
                        <el-select v-model="wallpaperSettings.style" size="small" @change="handleWallpaperChange">
                          <el-option label="渐变色" value="gradient" />
                          <el-option label="纯色" value="solid" />
                        </el-select>
                      </el-form-item>
                      <el-form-item v-if="wallpaperSettings.style === 'gradient'" label="渐变方向" class="mini-form-item">
                        <el-select v-model="wallpaperSettings.direction" size="small" @change="handleWallpaperChange">
                          <el-option label="左上到右下" value="135deg" />
                          <el-option label="左到右" value="90deg" />
                          <el-option label="上到下" value="180deg" />
                          <el-option label="右上到左下" value="225deg" />
                        </el-select>
                      </el-form-item>
                      <el-form-item v-if="wallpaperSettings.style === 'gradient'" label="第二背景色" class="mini-form-item">
                        <el-color-picker v-model="wallpaperSettings.backgroundColor2" size="small" show-alpha @change="handleWallpaperChange" />
                      </el-form-item>
                      <el-form-item v-if="wallpaperSettings.style === 'gradient'" label="动画效果" class="mini-form-item">
                        <el-switch v-model="wallpaperSettings.animation" @change="handleWallpaperChange" />
                      </el-form-item>
                    </div>
                    
                    <div class="preset-themes responsive-buttons">
                      <el-button type="primary" size="small" @click="applyWallpaperPreset('dark')">深色壁纸</el-button>
                      <el-button type="success" size="small" @click="applyWallpaperPreset('light')">亮色壁纸</el-button>
                      <el-button type="info" size="small" @click="applyWallpaperPreset('elegant')">优雅壁纸</el-button>
                      <el-button type="warning" size="small" @click="applyWallpaperPreset('modern')">现代壁纸</el-button>
                      <el-button type="danger" size="small" @click="applyWallpaperPreset('vibrant')">鲜艳壁纸</el-button>
                    </div>
                  </el-tab-pane>
                  
                  <el-tab-pane label="组件尺寸设置">
                    <div class="theme-grid responsive-grid">
                      <el-form-item label="宽度" class="mini-form-item">
                        <el-slider v-model="componentSize.width" :min="200" :max="800" style="width: 100%" @change="handleSizeChange" />
                        <span class="size-value">{{componentSize.width}}px</span>
                      </el-form-item>
                      <el-form-item label="高度" class="mini-form-item">
                        <el-slider v-model="componentSize.height" :min="200" :max="800" style="width: 100%" @change="handleSizeChange" />
                        <span class="size-value">{{componentSize.height}}px</span>
                      </el-form-item>
                    </div>
                    
                    <div class="preset-themes responsive-buttons">
                      <el-button type="primary" size="small" @click="applyComponentSize('small')">小尺寸</el-button>
                      <el-button type="success" size="small" @click="applyComponentSize('medium')">中尺寸</el-button>
                      <el-button type="warning" size="small" @click="applyComponentSize('large')">大尺寸</el-button>
                      <el-button type="danger" size="small" @click="applyComponentSize('mobile')">手机尺寸</el-button>
                      <el-button type="info" size="small" @click="applyComponentSize('reset')">重置尺寸</el-button>
                    </div>
                  </el-tab-pane>
                </el-tabs>
              </el-card>
              
              <div v-if="!currentQB" class="no-preview">
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
import { ref, computed, onMounted, watch, onUnmounted, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Delete, DocumentCopy, Loading, Brush } from '@element-plus/icons-vue'
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

// 定义主题设置接口
interface ThemeSettings {
  backgroundColor: string
  backgroundOpacity: number
  headerBackgroundColor: string
  headerTextColor: string
  onlineStatusColor: string
  offlineStatusColor: string
  
  // 下载速度
  downloadSpeedBgColor: string
  downloadSpeedTextColor: string
  downloadSpeedLabelColor: string
  
  // 上传速度
  uploadSpeedBgColor: string  
  uploadSpeedTextColor: string
  uploadSpeedLabelColor: string
  
  // 活跃下载
  activeDownloadsBgColor: string
  activeDownloadsTextColor: string
  activeDownloadsLabelColor: string
  
  // 活跃任务
  activeTorrentsBgColor: string
  activeTorrentsTextColor: string
  activeTorrentsLabelColor: string
  
  // 暂停任务
  pausedTorrentsBgColor: string
  pausedTorrentsTextColor: string
  pausedTorrentsLabelColor: string
  
  // 完成任务
  completedTorrentsBgColor: string
  completedTorrentsTextColor: string
  completedTorrentsLabelColor: string
  
  // 总任务数
  totalTorrentsBgColor: string
  totalTorrentsTextColor: string
  totalTorrentsLabelColor: string
  
  // 错误任务
  errorTorrentsBgColor: string
  errorTorrentsTextColor: string
  errorTorrentsLabelColor: string
  
  // 做种数
  seedingTorrentsBgColor: string
  seedingTorrentsTextColor: string
  seedingTorrentsLabelColor: string
  
  // I/O任务
  ioTasksBgColor: string
  ioTasksTextColor: string
  ioTasksLabelColor: string
  
  // 分享率
  globalRatioBgColor: string
  globalRatioTextColor: string
  globalRatioLabelColor: string
  
  // 平均分享率
  averageRatioBgColor: string
  averageRatioTextColor: string
  averageRatioLabelColor: string
  
  // 已下载
  globalDownloadedBgColor: string
  globalDownloadedTextColor: string
  globalDownloadedLabelColor: string
  
  // 已上传
  globalUploadedBgColor: string
  globalUploadedTextColor: string
  globalUploadedLabelColor: string
  
  // 上传限制
  uploadLimitBgColor: string
  uploadLimitTextColor: string
  uploadLimitLabelColor: string
  
  // 下载限制
  downloadLimitBgColor: string
  downloadLimitTextColor: string
  downloadLimitLabelColor: string
  
  // 可用空间
  freeSpaceBgColor: string
  freeSpaceTextColor: string
  freeSpaceLabelColor: string
  
  // 总体积
  totalSizeBgColor: string
  totalSizeTextColor: string
  totalSizeLabelColor: string
  
  borderRadius: string
  [key: string]: any
}

// 定义壁纸设置接口
interface WallpaperSettings {
  backgroundColor: string
  backgroundColor2: string
  style: 'gradient' | 'solid'
  direction: string
  animation: boolean
}

// 定义组件尺寸接口
interface ComponentSize {
  width: number
  height: number
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

      // 只包含已勾选的项目
      config.displayOrder = Object.keys(config.displayItems)
        .filter(key => config.displayItems[key] === true);
    } else {
      // 只保留用户选择的显示项
      config.displayOrder = config.displayOrder.filter(item => 
        config.displayItems[item] === true
      );
    }
    
    
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
        
        
        const addResponse = await request({
          url: '/api/fixed/pool',
          method: 'POST',
          data: {
            action: 'add',
            widget: newWidget
          }
        })
        
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
        
        ElMessage.success('已更新自由组件')
      } else {
        // 如果不存在，则添加新组件
        const newWidget = {
          id: Date.now().toString(),
          name: currentQB.value.name,
          url: widgetUrl,
          source: 'market'
        }
        
        
        const addResponse = await request({
          url: '/api/free/pool',
          method: 'POST',
          data: {
            action: 'add',
            widget: newWidget
          }
        })
        
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
  
  // 加载已保存的尺寸设置
  const savedComponentSize = localStorage.getItem('qb-status-component-size');
  if (savedComponentSize) {
    try {
      componentSize.value = JSON.parse(savedComponentSize);
    } catch (e) {
      console.error('Error parsing saved component size', e);
    }
  }
  
  // 设置默认为极简主题
  nextTick(() => {
    // 等待组件加载完成后应用默认主题
    setTimeout(() => {
      if (currentQB.value && (!currentQB.value.theme || Object.keys(currentQB.value.theme).length === 0)) {
        applyPresetTheme('minimal');
      }
      
      // 确保iframe能够立即应用响应式布局
      forceApplySize();
      
      // 模拟尺寸调整以确保响应式布局生效
      setTimeout(() => {
        const originalWidth = componentSize.value.width;
        const originalHeight = componentSize.value.height;
        
        // 稍微改变尺寸触发更新
        componentSize.value.width = originalWidth + 1;
        componentSize.value.height = originalHeight + 1;
        forceApplySize();
        
        // 恢复原来的尺寸
        setTimeout(() => {
          componentSize.value.width = originalWidth;
          componentSize.value.height = originalHeight;
          forceApplySize();
        }, 100);
      }, 200);
    }, 300);
  });
  
  // 加载已保存的壁纸设置
  const savedWallpaperSettings = localStorage.getItem('qb-status-wallpaper-settings');
  if (savedWallpaperSettings) {
    try {
      wallpaperSettings.value = JSON.parse(savedWallpaperSettings);
    } catch (e) {
      console.error('Error parsing saved wallpaper settings', e);
    }
  }
  
  // 加载已保存的主题设置
  if (currentQB.value && currentQB.value.theme) {
    // 从配置加载主题设置
    try {
      // 这里我们载入保存的主题
      const savedTheme = currentQB.value.theme;
      
      // 应用默认的预设主题作为起点
      applyPresetTheme('colorful');
      
      // 如果存在已保存的主题，则覆盖默认设置
      if (savedTheme) {
        Object.keys(savedTheme).forEach(key => {
          if (key in themeSettings.value) {
            themeSettings.value[key] = savedTheme[key];
          }
        });
      }
    } catch (e) {
      console.error('Error loading theme settings', e);
    }
  } else {
    // 如果没有保存的主题，使用"colorful"作为默认主题
    applyPresetTheme('colorful');
  }
  
  // 我们不再在onMounted中自动调用handleSizeChange，
  // 而是依赖iframe的onload事件通过handleIframeLoaded来处理
  
  // 尝试立即应用一次尺寸，不等待iframe.onload事件
  setTimeout(() => {
    const iframe = document.querySelector('.iframe-preview iframe') as HTMLIFrameElement | null;
    if (iframe) {
      iframe.style.width = `${componentSize.value.width}px`;
      iframe.style.height = `${componentSize.value.height}px`;
      // 尝试通过修改src来强制iframe刷新以应用尺寸
      if (iframe.src) {
        const currentSrc = iframe.src;
        if (!currentSrc.includes('w=') && !currentSrc.includes('h=')) {
          const separator = currentSrc.includes('?') ? '&' : '?';
          iframe.src = `${currentSrc}${separator}w=${componentSize.value.width}&h=${componentSize.value.height}`;
        }
      }
    }
  }, 100);
  
  // 创建一个监听iframe创建和替换的MutationObserver
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'childList') {
        const iframe = document.querySelector('.iframe-preview iframe') as HTMLIFrameElement | null;
        if (iframe && !iframe.style.width) {
          // 发现新的iframe元素，立即应用尺寸

          setTimeout(() => {
            forceApplySize();
          }, 50);
        }
      }
    });
  });
  
  // 监听iframe容器的变化
  const iframeContainer = document.querySelector('.iframe-preview');
  if (iframeContainer) {
    observer.observe(iframeContainer, { childList: true, subtree: true });
  }
  
  // 在组件卸载时停止监听
  onUnmounted(() => {
    observer.disconnect();
  });
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
  

  
  // 更新displayOrder，只保留用户选择的项目
  if (currentQB.value.displayOrder) {
    currentQB.value.displayOrder = currentQB.value.displayOrder.filter(key => 
      newDisplayItems[key as keyof typeof newDisplayItems] === true
    );
  }
}, { deep: true })

// 添加主题设置
const themeSettings = ref<ThemeSettings>({
  backgroundColor: '#2d3436',
  backgroundOpacity: 1,
  headerBackgroundColor: 'rgba(45, 45, 50, 0.8)',
  headerTextColor: '#ffffff',
  onlineStatusColor: 'rgba(46, 204, 113, 0.8)',
  offlineStatusColor: 'rgba(231, 76, 60, 0.8)',
  
  // 下载速度
  downloadSpeedBgColor: 'rgba(33, 150, 243, 0.15)',
  downloadSpeedTextColor: '#3498db',
  downloadSpeedLabelColor: 'rgba(255, 255, 255, 0.7)',
  
  // 上传速度
  uploadSpeedBgColor: 'rgba(76, 175, 80, 0.15)',  
  uploadSpeedTextColor: '#27ae60',
  uploadSpeedLabelColor: 'rgba(255, 255, 255, 0.7)',
  
  // 活跃下载
  activeDownloadsBgColor: 'rgba(33, 150, 243, 0.1)',
  activeDownloadsTextColor: '#4fc3f7',
  activeDownloadsLabelColor: 'rgba(255, 255, 255, 0.7)',
  
  // 活跃任务
  activeTorrentsBgColor: 'rgba(156, 39, 176, 0.1)',
  activeTorrentsTextColor: '#9c27b0',
  activeTorrentsLabelColor: 'rgba(255, 255, 255, 0.7)',
  
  // 暂停任务
  pausedTorrentsBgColor: 'rgba(255, 152, 0, 0.1)',
  pausedTorrentsTextColor: '#ff9800',
  pausedTorrentsLabelColor: 'rgba(255, 255, 255, 0.7)',
  
  // 完成任务
  completedTorrentsBgColor: 'rgba(76, 175, 80, 0.1)',
  completedTorrentsTextColor: '#4caf50',
  completedTorrentsLabelColor: 'rgba(255, 255, 255, 0.7)',
  
  // 总任务数
  totalTorrentsBgColor: 'rgba(158, 158, 158, 0.1)',
  totalTorrentsTextColor: '#9e9e9e',
  totalTorrentsLabelColor: 'rgba(255, 255, 255, 0.7)',
  
  // 错误任务
  errorTorrentsBgColor: 'rgba(244, 67, 54, 0.1)',
  errorTorrentsTextColor: '#f44336',
  errorTorrentsLabelColor: 'rgba(255, 255, 255, 0.7)',
  
  // 做种数
  seedingTorrentsBgColor: 'rgba(0, 188, 212, 0.1)',
  seedingTorrentsTextColor: '#00bcd4',
  seedingTorrentsLabelColor: 'rgba(255, 255, 255, 0.7)',
  
  // I/O任务
  ioTasksBgColor: 'rgba(0, 150, 136, 0.1)',
  ioTasksTextColor: '#009688',
  ioTasksLabelColor: 'rgba(255, 255, 255, 0.7)',
  
  // 分享率
  globalRatioBgColor: 'rgba(3, 169, 244, 0.1)',
  globalRatioTextColor: '#03a9f4',
  globalRatioLabelColor: 'rgba(255, 255, 255, 0.7)',
  
  // 平均分享率
  averageRatioBgColor: 'rgba(63, 81, 181, 0.1)',
  averageRatioTextColor: '#3f51b5',
  averageRatioLabelColor: 'rgba(255, 255, 255, 0.7)',
  
  // 已下载
  globalDownloadedBgColor: 'rgba(0, 188, 212, 0.1)',
  globalDownloadedTextColor: '#00bcd4',
  globalDownloadedLabelColor: 'rgba(255, 255, 255, 0.7)',
  
  // 已上传
  globalUploadedBgColor: 'rgba(233, 30, 99, 0.1)',
  globalUploadedTextColor: '#e91e63',
  globalUploadedLabelColor: 'rgba(255, 255, 255, 0.7)',
  
  // 上传限制
  uploadLimitBgColor: 'rgba(255, 87, 34, 0.1)',
  uploadLimitTextColor: '#ff5722',
  uploadLimitLabelColor: 'rgba(255, 255, 255, 0.7)',
  
  // 下载限制
  downloadLimitBgColor: 'rgba(121, 85, 72, 0.1)',
  downloadLimitTextColor: '#795548',
  downloadLimitLabelColor: 'rgba(255, 255, 255, 0.7)',
  
  // 可用空间
  freeSpaceBgColor: 'rgba(96, 125, 139, 0.1)',
  freeSpaceTextColor: '#607d8b',
  freeSpaceLabelColor: 'rgba(255, 255, 255, 0.7)',
  
  // 总体积
  totalSizeBgColor: 'rgba(97, 97, 97, 0.1)',
  totalSizeTextColor: '#616161',
  totalSizeLabelColor: 'rgba(255, 255, 255, 0.7)',
  
  borderRadius: '8px'
})

// 实时处理主题变化
const handleThemeChange = () => {
  // 更新iframe预览的背景
  if (!currentQB.value) return;
  
  // 确保theme对象存在
  if (!currentQB.value.theme) {
    currentQB.value.theme = {} as any;
  }
  
  // 将当前主题设置应用到currentQB.theme
  Object.keys(themeSettings.value).forEach(key => {
    currentQB.value!.theme![key] = themeSettings.value[key];
  });
  
  // 保存设置
  saveQBList();
  
  // 如果iframe已加载，则刷新iframe以应用最新主题
  if (iframeLoaded.value && currentQB.value.isConfigValid) {
    // 短暂延迟后刷新iframe，确保主题设置已保存
    setTimeout(() => {
      const iframe = document.querySelector('.iframe-preview iframe') as HTMLIFrameElement;
      if (iframe) {
        iframeLoaded.value = false;
        iframe.src = iframe.src;
      }
    }, 300);
  }
};

// 应用预设主题
const applyPresetTheme = (theme: string) => {
  if (!currentQB.value) return;

  // 设置基础主题
  themeSettings.value = {
    ...themeSettings.value,
    backgroundColor: theme === 'dark' ? 'rgba(30, 30, 30, 0.95)' : 
                    theme === 'light' ? 'rgba(255, 255, 255, 0.95)' : 
                    theme === 'nord' ? 'rgba(46, 52, 64, 0.95)' :
                    theme === 'elegant' ? 'rgba(25, 25, 35, 0.98)' :
                    theme === 'acrylic' ? 'rgba(245, 245, 247, 0.85)' :
                    theme === 'minimal' ? 'rgba(35, 35, 40, 0.92)' :
                    theme === 'colorful' ? 'rgba(14, 22, 40, 0.95)' :
                    'rgba(35, 35, 40, 0.92)',
    headerBackgroundColor: theme === 'dark' ? 'rgba(40, 40, 40, 0.8)' : 
                          theme === 'light' ? 'rgba(240, 240, 240, 0.8)' : 
                          theme === 'nord' ? 'rgba(59, 66, 82, 0.8)' :
                          theme === 'elegant' ? 'rgba(35, 35, 50, 0.8)' :
                          theme === 'acrylic' ? 'rgba(235, 235, 240, 0.8)' :
                          theme === 'minimal' ? 'rgba(45, 45, 50, 0.8)' : // 修正为默认蓝色
                          theme === 'colorful' ? 'rgba(20, 30, 50, 0.8)' :
                          'rgba(45, 45, 50, 0.8)', // 默认蓝色
    headerTextColor: theme === 'dark' ? '#ffffff' : 
                     theme === 'light' ? '#000000' : // 变更为纯黑色
                     theme === 'nord' ? '#eceff4' :
                     theme === 'elegant' ? '#ffffff' :
                     theme === 'acrylic' ? '#000000' : // 变更为纯黑色
                     theme === 'minimal' ? '#ffffff' :
                     theme === 'colorful' ? '#ffffff' :
                     '#ffffff',
    borderRadius: theme === 'minimal' ? '0px' : '8px',
    borderColor: theme === 'dark' ? 'rgba(60, 60, 60, 0.5)' : 
                theme === 'light' ? 'rgba(210, 210, 210, 0.5)' : 
                theme === 'nord' ? 'rgba(76, 86, 106, 0.5)' :
                theme === 'elegant' ? 'rgba(60, 60, 80, 0.5)' :
                theme === 'acrylic' ? 'rgba(210, 210, 220, 0.5)' :
                theme === 'minimal' ? 'transparent' :
                theme === 'colorful' ? 'rgba(30, 40, 70, 0.5)' :
                'transparent',
    borderWidth: theme === 'minimal' ? '0px' : '1px',
    itemSpacing: theme === 'minimal' ? '0px' : '8px',
  };

  // 设置不同状态的颜色
  themeSettings.value.onlineColor = theme === 'dark' ? '#10b981' : 
                                    theme === 'light' ? '#047857' : 
                                    theme === 'nord' ? '#a3be8c' :
                                    theme === 'elegant' ? '#10b981' :
                                    theme === 'acrylic' ? '#047857' :
                                    theme === 'minimal' ? '#10b981' :
                                    theme === 'colorful' ? '#00cc66' :
                                    '#10b981';
  
  themeSettings.value.offlineColor = theme === 'dark' ? '#ef4444' : 
                                    theme === 'light' ? '#b91c1c' : 
                                    theme === 'nord' ? '#bf616a' :
                                    theme === 'elegant' ? '#ef4444' :
                                    theme === 'acrylic' ? '#b91c1c' :
                                    theme === 'minimal' ? '#ef4444' :
                                    theme === 'colorful' ? '#ff5555' :
                                    '#ef4444';
  
  themeSettings.value.warningColor = theme === 'dark' ? '#f59e0b' : 
                                    theme === 'light' ? '#b45309' : 
                                    theme === 'nord' ? '#ebcb8b' :
                                    theme === 'elegant' ? '#f59e0b' :
                                    theme === 'acrylic' ? '#b45309' :
                                    theme === 'minimal' ? '#f59e0b' :
                                    theme === 'colorful' ? '#ffaa33' :
                                    '#f59e0b';

  // 为每个显示项设置颜色
  const displayItems = ['cpu', 'memory', 'disk', 'network', 'time', 'version', 'license'];
  
  displayItems.forEach(item => {
    // 设置项目背景颜色
    themeSettings.value[`${item}BgColor`] = theme === 'dark' ? 'rgba(50, 50, 50, 0.7)' : 
                                          theme === 'light' ? 'rgba(240, 240, 240, 0.7)' : 
                                          theme === 'nord' ? 'rgba(67, 76, 94, 0.7)' :
                                          theme === 'elegant' ? 'rgba(45, 45, 60, 0.7)' :
                                          theme === 'acrylic' ? 'rgba(230, 230, 235, 0.7)' :
                                          theme === 'minimal' ? 'rgba(50, 50, 55, 0.7)' :
                                          theme === 'colorful' ? getUniqueColor(item, 0.7) :
                                          'rgba(50, 50, 55, 0.7)';
    
    // 设置文本颜色 - 提高对比度
    themeSettings.value[`${item}TextColor`] = theme === 'dark' ? '#ffffff' : 
                                            theme === 'light' ? '#000000' : // 变更为纯黑色
                                            theme === 'nord' ? '#eceff4' :
                                            theme === 'elegant' ? '#ffffff' :
                                            theme === 'acrylic' ? '#000000' : // 变更为纯黑色
                                            theme === 'minimal' ? '#ffffff' :
                                            theme === 'colorful' ? '#ffffff' :
                                            '#ffffff';
    
    // 设置标签颜色 - 提高对比度
    themeSettings.value[`${item}LabelColor`] = theme === 'dark' ? '#9ca3af' : 
                                             theme === 'light' ? '#000000' : // 变更为纯黑色 
                                             theme === 'nord' ? '#d8dee9' :
                                             theme === 'elegant' ? '#9ca3af' :
                                             theme === 'acrylic' ? '#000000' : // 变更为纯黑色
                                             theme === 'minimal' ? '#e5e7eb' : // 提高对比度
                                             theme === 'colorful' ? '#a5b4fc' :
                                             '#e5e7eb';
  });

  // 保存主题设置
  handleThemeChange();
};

// 重置主题
const resetTheme = () => {
  // 重置为默认主题
  themeSettings.value = {
    backgroundColor: '#2d3436',
    backgroundOpacity: 1,
    headerBackgroundColor: 'rgba(45, 45, 50, 0.8)',
    headerTextColor: '#ffffff',
    onlineStatusColor: 'rgba(46, 204, 113, 0.8)',
    offlineStatusColor: 'rgba(231, 76, 60, 0.8)',
    
    // 下载速度
    downloadSpeedBgColor: 'rgba(33, 150, 243, 0.15)',
    downloadSpeedTextColor: '#3498db',
    downloadSpeedLabelColor: 'rgba(255, 255, 255, 0.7)',
    
    // 上传速度
    uploadSpeedBgColor: 'rgba(76, 175, 80, 0.15)',  
    uploadSpeedTextColor: '#27ae60',
    uploadSpeedLabelColor: 'rgba(255, 255, 255, 0.7)',
    
    // 活跃下载
    activeDownloadsBgColor: 'rgba(33, 150, 243, 0.1)',
    activeDownloadsTextColor: '#4fc3f7',
    activeDownloadsLabelColor: 'rgba(255, 255, 255, 0.7)',
    
    // 活跃任务
    activeTorrentsBgColor: 'rgba(156, 39, 176, 0.1)',
    activeTorrentsTextColor: '#9c27b0',
    activeTorrentsLabelColor: 'rgba(255, 255, 255, 0.7)',
    
    // 暂停任务
    pausedTorrentsBgColor: 'rgba(255, 152, 0, 0.1)',
    pausedTorrentsTextColor: '#ff9800',
    pausedTorrentsLabelColor: 'rgba(255, 255, 255, 0.7)',
    
    // 完成任务
    completedTorrentsBgColor: 'rgba(76, 175, 80, 0.1)',
    completedTorrentsTextColor: '#4caf50',
    completedTorrentsLabelColor: 'rgba(255, 255, 255, 0.7)',
    
    // 总任务数
    totalTorrentsBgColor: 'rgba(158, 158, 158, 0.1)',
    totalTorrentsTextColor: '#9e9e9e',
    totalTorrentsLabelColor: 'rgba(255, 255, 255, 0.7)',
    
    // 错误任务
    errorTorrentsBgColor: 'rgba(244, 67, 54, 0.1)',
    errorTorrentsTextColor: '#f44336',
    errorTorrentsLabelColor: 'rgba(255, 255, 255, 0.7)',
    
    // 做种数
    seedingTorrentsBgColor: 'rgba(0, 188, 212, 0.1)',
    seedingTorrentsTextColor: '#00bcd4',
    seedingTorrentsLabelColor: 'rgba(255, 255, 255, 0.7)',
    
    // I/O任务
    ioTasksBgColor: 'rgba(0, 150, 136, 0.1)',
    ioTasksTextColor: '#009688',
    ioTasksLabelColor: 'rgba(255, 255, 255, 0.7)',
    
    // 分享率
    globalRatioBgColor: 'rgba(3, 169, 244, 0.1)',
    globalRatioTextColor: '#03a9f4',
    globalRatioLabelColor: 'rgba(255, 255, 255, 0.7)',
    
    // 平均分享率
    averageRatioBgColor: 'rgba(63, 81, 181, 0.1)',
    averageRatioTextColor: '#3f51b5',
    averageRatioLabelColor: 'rgba(255, 255, 255, 0.7)',
    
    // 已下载
    globalDownloadedBgColor: 'rgba(0, 188, 212, 0.1)',
    globalDownloadedTextColor: '#00bcd4',
    globalDownloadedLabelColor: 'rgba(255, 255, 255, 0.7)',
    
    // 已上传
    globalUploadedBgColor: 'rgba(233, 30, 99, 0.1)',
    globalUploadedTextColor: '#e91e63',
    globalUploadedLabelColor: 'rgba(255, 255, 255, 0.7)',
    
    // 上传限制
    uploadLimitBgColor: 'rgba(255, 87, 34, 0.1)',
    uploadLimitTextColor: '#ff5722',
    uploadLimitLabelColor: 'rgba(255, 255, 255, 0.7)',
    
    // 下载限制
    downloadLimitBgColor: 'rgba(121, 85, 72, 0.1)',
    downloadLimitTextColor: '#795548',
    downloadLimitLabelColor: 'rgba(255, 255, 255, 0.7)',
    
    // 可用空间
    freeSpaceBgColor: 'rgba(96, 125, 139, 0.1)',
    freeSpaceTextColor: '#607d8b',
    freeSpaceLabelColor: 'rgba(255, 255, 255, 0.7)',
    
    // 总体积
    totalSizeBgColor: 'rgba(97, 97, 97, 0.1)',
    totalSizeTextColor: '#616161',
    totalSizeLabelColor: 'rgba(255, 255, 255, 0.7)',
    
    borderRadius: '8px'
  };
  handleThemeChange();
};

// 计算渐变背景样式
const gradientBgStyle = computed(() => {
  if (wallpaperSettings.value.style === 'gradient') {
    let style = {
      background: `linear-gradient(${wallpaperSettings.value.direction}, ${wallpaperSettings.value.backgroundColor}, ${wallpaperSettings.value.backgroundColor2})`,
      backgroundSize: wallpaperSettings.value.animation ? '400% 400%' : '100% 100%'
    };
    
    return style;
  } else {
    // 纯色背景
    return {
      background: wallpaperSettings.value.backgroundColor,
      backgroundSize: '100% 100%'
    };
  }
});

// 处理主题更新
const handleThemeUpdate = (updatedTheme: ThemeSettings) => {
  themeSettings.value = { ...updatedTheme }
  
  // 确保currentQB不为null
  if (!currentQB.value) return
  
  // 更新配置对象中的主题设置
  if (!currentQB.value.theme) {
    currentQB.value.theme = {} as any
  }
  
  try {
    // 创建包含所有必要属性的主题对象
    const newTheme = {
      backgroundColor: updatedTheme.backgroundColor || '#2d3436',
      backgroundOpacity: updatedTheme.backgroundOpacity || 1,
      headerBackgroundColor: updatedTheme.headerBackgroundColor || 'rgba(45, 45, 50, 0.8)',
      headerTextColor: updatedTheme.headerTextColor || '#ffffff',
      onlineStatusColor: updatedTheme.onlineStatusColor || 'rgba(46, 204, 113, 0.8)',
      offlineStatusColor: updatedTheme.offlineStatusColor || 'rgba(231, 76, 60, 0.8)',
      downloadSpeedBgColor: updatedTheme.downloadSpeedBgColor || 'rgba(33, 150, 243, 0.15)',
      downloadSpeedTextColor: updatedTheme.downloadSpeedTextColor || '#3498db',
      uploadSpeedBgColor: updatedTheme.uploadSpeedBgColor || 'rgba(76, 175, 80, 0.15)',
      uploadSpeedTextColor: updatedTheme.uploadSpeedTextColor || '#27ae60',
      labelTextColor: updatedTheme.labelTextColor || 'rgba(255, 255, 255, 0.7)',
      valueTextColor: updatedTheme.valueTextColor || '#ffffff',
      borderRadius: updatedTheme.borderRadius || '8px',
    } as any // 使用类型断言避免严格的类型检查
    
    // 添加各个项目的颜色设置
    Object.keys(displayItemLabels).forEach(key => {
      const bgColorKey = `${key}BgColor`;
      const textColorKey = `${key}TextColor`;
      
      if (updatedTheme[bgColorKey]) {
        newTheme[bgColorKey] = updatedTheme[bgColorKey];
      }
      
      if (updatedTheme[textColorKey]) {
        newTheme[textColorKey] = updatedTheme[textColorKey];
      }
    })
    
    // 使用断言将新主题分配给配置
    if (currentQB.value) {
      currentQB.value.theme = newTheme;
      
      // 标记配置已更改
      saveQBList()
    }
  } catch (error) {
    console.error('更新主题设置时发生错误:', error);
  }
}

// 显示项目标签映射
const displayItemLabels: Record<string, string> = {
  downloadSpeed: '下载速度',
  uploadSpeed: '上传速度',
  activeDownloads: '下载中',
  activeTorrents: '活跃',
  pausedTorrents: '暂停',
  completedTorrents: '完成',
  totalTorrents: '总数',
  globalRatio: '分享率',
  globalDownloaded: '已下载',
  globalUploaded: '已上传',
  freeSpace: '可用空间',
  seedingTorrents: '做种数',
  totalSize: '总体积',
  averageRatio: '平均分享率',
  ioTasks: 'I/O任务',
  errorTorrents: '错误任务',
  uploadLimit: '上传限制',
  downloadLimit: '下载限制'
}

// 在加载配置时初始化主题设置
onMounted(() => {
  // 加载QB配置
  loadQBList()
  fetchPoolData() // 获取组件池数据
  
  // 加载壁纸设置
  const savedWallpaper = localStorage.getItem('qb-status-wallpaper')
  if (savedWallpaper) {
    try {
      const parsed = JSON.parse(savedWallpaper)
      wallpaperSettings.value = parsed
    } catch (e) {
      console.error('加载壁纸设置失败:', e)
    }
  }
  
  // 加载组件尺寸设置
  const savedComponentSize = localStorage.getItem('qb-status-component-size')
  if (savedComponentSize) {
    try {
      const parsed = JSON.parse(savedComponentSize)
      componentSize.value = parsed
    } catch (e) {
      console.error('加载组件尺寸设置失败:', e)
    }
  }
  
  // 如果配置中有主题设置，则加载它
  if (currentQB.value && currentQB.value.theme) {
    themeSettings.value = {
      ...themeSettings.value,
      ...currentQB.value.theme
    }
  }
})

// 添加壁纸背景设置
const wallpaperSettings = ref<WallpaperSettings>({
  backgroundColor: '#1a1a2e',
  backgroundColor2: '#0f3460',
  style: 'gradient',
  direction: '135deg',
  animation: true
})

// 添加组件尺寸设置
const componentSize = ref<ComponentSize>({
  width: 500,
  height: 300
})

// 计算iframe样式，确保实时响应
const iframeStyle = computed(() => {
  return {
    width: `${componentSize.value.width}px`,
    height: `${componentSize.value.height}px`,
    maxWidth: '100%',
    transition: 'width 0.3s ease, height 0.3s ease'
  }
})

// 处理壁纸背景变化
const handleWallpaperChange = () => {
  // 保存设置到localStorage
  localStorage.setItem('qb-status-wallpaper', JSON.stringify(wallpaperSettings.value))
}

// 应用壁纸预设
const applyWallpaperPreset = (preset: string) => {
  switch(preset) {
    case 'dark':
      wallpaperSettings.value = {
        backgroundColor: '#1a1a2e',
        backgroundColor2: '#0f3460',
        style: 'gradient',
        direction: '135deg',
        animation: true
      }
      break;
    case 'light':
      wallpaperSettings.value = {
        backgroundColor: '#f5f5f5',
        backgroundColor2: '#e0e0e0',
        style: 'gradient',
        direction: '135deg',
        animation: true
      }
      break;
    case 'red':
      wallpaperSettings.value = {
        backgroundColor: '#8B0000',
        backgroundColor2: '#480000',
        style: 'gradient',
        direction: '135deg',
        animation: true
      }
      break;
    case 'blue':
      wallpaperSettings.value = {
        backgroundColor: '#0a2463',
        backgroundColor2: '#001845',
        style: 'gradient',
        direction: '135deg',
        animation: true
      }
      break;
  }
  handleWallpaperChange()
}

// 处理组件尺寸变化
const handleSizeChange = (shouldRefresh = true) => {
  if (isResizing.value) return;
  
  // 设置标记，表示正在进行尺寸调整
  isResizing.value = true;
  
  // 保存当前尺寸到localStorage
  localStorage.setItem('qb-status-component-size', JSON.stringify(componentSize.value));
  
  // 为iframe应用新尺寸
  const iframe = document.querySelector('.iframe-preview iframe') as HTMLIFrameElement | null;
  if (iframe) {
    iframe.style.width = `${componentSize.value.width}px`;
    iframe.style.height = `${componentSize.value.height}px`;
    
    // 只有在需要刷新时才刷新iframe
    if (shouldRefresh && iframeLoaded.value) {
      refreshIframePreview();
    }
  }
  
  // 重置标记
  setTimeout(() => {
    isResizing.value = false;
  }, 300);
}

// 添加新函数用于刷新iframe预览
const refreshIframePreview = () => {
  if (isResizing.value) return;
  
  // 设置iframe加载状态为false
  iframeLoaded.value = false;
  
  // 保存现有尺寸以便应用
  const currentWidth = componentSize.value.width;
  const currentHeight = componentSize.value.height;
  
  // 重新加载iframe
  const iframe = document.querySelector('.iframe-preview iframe') as HTMLIFrameElement | null;
  if (iframe && iframe.contentWindow) {
    try {
      // 先直接设置尺寸
      iframe.style.width = `${currentWidth}px`;
      iframe.style.height = `${currentHeight}px`;

      // 获取当前src
      const currentSrc = iframe.src;
      // 添加尺寸参数和时间戳强制刷新
      let newSrc = currentSrc;
      newSrc = newSrc.replace(/[?&]w=\d+/g, '').replace(/[?&]h=\d+/g, '');
      newSrc = newSrc.includes('?') 
        ? newSrc.replace(/(\?|&)t=\d+/, '') + `&t=${Date.now()}&w=${currentWidth}&h=${currentHeight}` 
        : newSrc + `?t=${Date.now()}&w=${currentWidth}&h=${currentHeight}`;
      iframe.src = newSrc;
      
      // 在iframe重新加载后再次强制应用尺寸
      iframe.onload = () => {
        setTimeout(() => {
          forceApplySize();
        }, 100);
      };
    } catch (e) {
      console.error('无法刷新iframe', e);
    }
  }
}

// 添加监听器确保组件尺寸变化时更新预览
watch([() => componentSize.value.width, () => componentSize.value.height], () => {
  // 延迟执行以避免频繁刷新
  if (debounceTimer) clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    refreshIframePreview()
  }, 300) as unknown as number
}, { immediate: false })

// 防抖定时器
let debounceTimer: number | null = null

// 应用组件尺寸预设
const applyComponentSize = (preset: string) => {
  switch(preset) {
    case 'small':
      componentSize.value = {
        width: 300,
        height: 200
      }
      break;
    case 'medium':
      componentSize.value = {
        width: 500,
        height: 300
      }
      break;
    case 'large':
      componentSize.value = {
        width: 800,
        height: 400
      }
      break;
    case 'mobile':
      componentSize.value = {
        width: 320,
        height: 480
      }
      break;
    case 'reset':
      componentSize.value = {
        width: 500,
        height: 300
      }
      break;
  }
  handleSizeChange()
}

// 监听iframe加载状态
const handleIframeLoaded = () => {
  iframeLoaded.value = true;
  
  // 强制应用尺寸设置，不管是否首次加载
  forceApplySize();
  
  // 额外逻辑：应用尺寸后短暂延迟再次应用，以确保响应式生效
  if (isInitialLoad.value) {
    isInitialLoad.value = false;
    setTimeout(() => {
      forceApplySize();
      // 发送强制布局更新的消息
      const iframe = document.querySelector('.iframe-preview iframe') as HTMLIFrameElement | null;
      if (iframe && iframe.contentWindow) {
        try {
          iframe.contentWindow.postMessage({
            type: 'forceLayout',
            width: componentSize.value.width,
            height: componentSize.value.height
          }, '*');
        } catch (e) {
          console.error('无法向iframe发送强制布局消息', e);
        }
      }
    }, 500);
  }
}

// 新增函数：强制应用尺寸
const forceApplySize = () => {
  if (isResizing.value) return;
  
  // 直接设置iframe尺寸
  const iframe = document.querySelector('.iframe-preview iframe') as HTMLIFrameElement | null;
  if (iframe) {
    iframe.style.width = `${componentSize.value.width}px`;
    iframe.style.height = `${componentSize.value.height}px`;
    
    // 发送消息到iframe通知尺寸变化
    if (iframe.contentWindow) {
      try {
        iframe.contentWindow.postMessage({
          type: 'resize',
          width: componentSize.value.width,
          height: componentSize.value.height
        }, '*');
      } catch (e) {
        console.error('无法向iframe发送消息', e);
      }
    }
  }
}

// 添加标志变量，防止无限刷新
const isInitialLoad = ref(true);
const isResizing = ref(false);

// 根据项目名生成唯一的颜色
const getUniqueColor = (itemName: string, alpha: number = 1) => {
  // 基础颜色映射
  const colorMap: Record<string, string> = {
    cpu: 'rgba(59, 130, 246, ' + alpha + ')', // 蓝色
    memory: 'rgba(139, 92, 246, ' + alpha + ')', // 紫色
    disk: 'rgba(16, 185, 129, ' + alpha + ')', // 绿色
    network: 'rgba(245, 158, 11, ' + alpha + ')', // 黄色
    time: 'rgba(236, 72, 153, ' + alpha + ')', // 粉色
    version: 'rgba(99, 102, 241, ' + alpha + ')', // 靛蓝色
    license: 'rgba(249, 115, 22, ' + alpha + ')' // 橙色
  };
  
  // 如果有特定映射则使用映射的颜色，否则生成随机颜色
  if (itemName in colorMap) {
    return colorMap[itemName];
  }
  
  // 为未知项目生成一个基于名称hash的颜色
  let hash = 0;
  for (let i = 0; i < itemName.length; i++) {
    hash = itemName.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  // 转换为RGB颜色
  const r = Math.abs(hash & 0xFF);
  const g = Math.abs((hash >> 8) & 0xFF);
  const b = Math.abs((hash >> 16) & 0xFF);
  
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};
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
    
    .preview-actions {
      display: flex;
      justify-content: flex-end;
    }
  }
}

.params-content, .preview-content {
  min-height: 300px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  
  .theme-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
    
    .mini-form-item {
      margin-bottom: 0;
      
      :deep(.el-form-item__label) {
        font-size: 13px;
      }
    }
  }
  
  .preset-themes {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin-bottom: 10px;
  }
  
  .action-buttons {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    margin-top: 10px;
  }
  
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
  height: auto;
  min-height: 300px;
  border: 1px solid var(--el-border-color-light);
  border-radius: 8px;
  overflow: hidden;
  margin: 0 auto;
  display: flex;
  justify-content: center;
  align-items: center;
  
  .dimension-display {
    position: absolute;
    bottom: 10px;
    left: 10px;
    background: rgba(0, 0, 0, 0.5);
    color: white;
    padding: 3px 8px;
    border-radius: 4px;
    font-size: 12px;
    z-index: 2;
    pointer-events: none;
  }
  
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
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    transition: all 0.3s ease;
    max-width: 100%; // 确保不超出容器
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

// 预览设置卡片样式
.preview-settings-card {
  margin-top: 20px;
  border-radius: 8px;
  overflow: hidden;
  
  :deep(.el-card__header) {
    padding: 12px 16px;
    background-color: #f5f7fa;
  }
  
  :deep(.el-tabs__header) {
    margin-bottom: 10px;
  }
  
  :deep(.el-tabs__content) {
    padding: 10px;
  }
  
  .size-settings {
    .size-item {
      margin-bottom: 20px;
      
      .size-label {
        display: block;
        margin-bottom: 8px;
        font-weight: 500;
      }
      
      :deep(.el-slider) {
        width: 100%;
      }
    }
    
    .size-presets {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      margin-top: 20px;
    }
  }
}

// 添加响应式辅助类
.responsive-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 16px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
}

.responsive-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin: 16px 0;
  
  .el-button {
    margin: 0; // 覆盖Element UI默认外边距
    flex-grow: 1;
    min-width: 120px;
    
    @media (max-width: 768px) {
      flex-basis: calc(50% - 5px);
      max-width: calc(50% - 5px);
    }
    
    @media (max-width: 480px) {
      flex-basis: 100%;
      max-width: 100%;
    }
  }
}

// 改进组件尺寸设置响应式
.size-settings {
  .size-item {
    margin-bottom: 20px;
    
    .size-label {
      display: block;
      margin-bottom: 8px;
      font-weight: 500;
    }
    
    :deep(.el-slider) {
      width: 100%;
      
      @media (max-width: 480px) {
        .el-slider__runway {
          margin: 10px 0;
        }
        
        .el-slider__input {
          width: 60px;
        }
      }
    }
  }
}

// 改进iframe预览区域在不同屏幕尺寸下的显示
.iframe-preview {
  iframe {
    @media (max-width: 768px) {
      max-width: calc(100% - 20px); // 给两侧留一点间距
      transform: scale(0.95); // 稍微缩小一点，避免溢出
      transform-origin: center top;
    }
    
    @media (max-width: 480px) {
      transform: scale(0.9);
      height: auto !important; // 确保在小屏幕上高度能自适应
    }
  }
}

// 改进主题设置区域响应式
.theme-settings-section {
  :deep(.el-tabs--card > .el-tabs__header .el-tabs__item) {
    @media (max-width: 768px) {
      padding: 0 10px;
      font-size: 13px;
    }
    
    @media (max-width: 480px) {
      padding: 0 5px;
      font-size: 12px;
    }
  }
}

// 改进预览设置卡片响应式
.preview-settings-card {
  :deep(.el-tabs__item) {
    @media (max-width: 768px) {
      padding: 0 10px;
      font-size: 13px;
    }
    
    @media (max-width: 480px) {
      padding: 0 5px;
      font-size: 12px;
    }
  }
  
  :deep(.el-tabs__content) {
    @media (max-width: 480px) {
      padding: 5px;
    }
  }
}

// 添加预设主题卡片样式
.preset-themes {
  padding: 16px 0;
}

.preset-theme-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.preset-theme-card {
  cursor: pointer;
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.3s;
  border: 1px solid #eee;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
}

.preset-theme-preview {
  height: 80px;
  
  &.dark-theme {
    background-color: #1e1e2e;
    position: relative;
    
    &::after {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 24px;
      background-color: #1e1e2e;
    }
    
    &::before {
      content: '';
      position: absolute;
      top: 30px;
      left: 10px;
      right: 10px;
      height: 20px;
      background-color: rgba(137, 180, 250, 0.15);
      border-radius: 4px;
    }
  }
  
  &.light-theme {
    background-color: #f9fafb;
    position: relative;
    
    &::after {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 24px;
      background-color: #f9fafb;
    }
    
    &::before {
      content: '';
      position: absolute;
      top: 30px;
      left: 10px;
      right: 10px;
      height: 20px;
      background-color: rgba(59, 130, 246, 0.1);
      border-radius: 4px;
    }
  }
  
  &.nord-theme {
    background-color: #2e3440;
    position: relative;
    
    &::after {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 24px;
      background-color: #2e3440;
    }
    
    &::before {
      content: '';
      position: absolute;
      top: 30px;
      left: 10px;
      right: 10px;
      height: 20px;
      background-color: rgba(129, 161, 193, 0.15);
      border-radius: 4px;
    }
  }
  
  &.elegant-theme {
    background-color: #353535;
    position: relative;
    
    &::after {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 24px;
      background-color: #353535;
    }
    
    &::before {
      content: '';
      position: absolute;
      top: 30px;
      left: 10px;
      right: 10px;
      height: 20px;
      background-color: rgba(66, 165, 245, 0.15);
      border-radius: 4px;
    }
  }
  
  &.acrylic-theme {
    background-color: rgba(28, 28, 30, 0.7);
    position: relative;
    
    &::after {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 24px;
      background-color: rgba(28, 28, 30, 0.7);
    }
    
    &::before {
      content: '';
      position: absolute;
      top: 30px;
      left: 10px;
      right: 10px;
      height: 20px;
      background-color: rgba(10, 132, 255, 0.25);
      border-radius: 6px;
    }
  }
  
  &.minimal-theme {
    background-color: #ffffff;
    position: relative;
    
    &::after {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 24px;
      background-color: #ffffff;
    }
    
    &::before {
      content: '';
      position: absolute;
      top: 30px;
      left: 10px;
      right: 10px;
      height: 20px;
      background-color: rgba(41, 128, 185, 0.05);
      border-radius: 4px;
    }
  }
  
  &.colorful-theme {
    background-color: #0f172a;
    position: relative;
    
    &::after {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 24px;
      background-color: #0f172a;
    }
    
    &::before {
      content: '';
      position: absolute;
      top: 30px;
      left: 10px;
      right: 10px;
      height: 20px;
      background-color: rgba(6, 182, 212, 0.2);
      border-radius: 4px;
    }
  }
}

.preset-theme-name {
  padding: 8px;
  text-align: center;
  font-size: 14px;
  background-color: #f5f5f5;
}

.highlight-title {
  color: #E6A23C;
  font-weight: 600;
  font-size: 16px;
  display: inline-flex;
  align-items: center;
  padding: 3px 6px;
  border-radius: 4px;
  background-color: rgba(230, 162, 60, 0.1);
  box-shadow: 0 2px 8px rgba(230, 162, 60, 0.2);
}

/* 修改折叠面板样式，使主题设置更突出 */
.preview-content {
  .el-collapse {
    border: 2px solid rgba(230, 162, 60, 0.2);
    border-radius: 8px;
    margin-bottom: 20px;
    box-shadow: 0 4px 12px rgba(230, 162, 60, 0.15);
    
    :deep(.el-collapse-item__header) {
      background-color: rgba(230, 162, 60, 0.05);
      padding: 8px 12px;
      height: auto;
      line-height: 1.5;
    }
    
    :deep(.el-collapse-item__content) {
      padding: 16px;
    }
  }
}
</style> 