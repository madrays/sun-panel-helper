<template>
  <div class="qb-preview-container">
    <!-- 主题设置部分 -->
    <div class="theme-settings">
      <el-tabs type="card" style="margin-bottom: 10px;">
        <el-tab-pane label="基础主题">
          <div class="theme-grid">
            <!-- 基础颜色设置 -->
            <el-form-item label="背景颜色" class="mini-form-item">
              <el-color-picker v-model="themeSettings.backgroundColor" size="small" show-alpha @change="updateTheme" />
            </el-form-item>
            <el-form-item label="背景透明度" class="mini-form-item">
              <el-slider v-model="themeSettings.backgroundOpacity" :min="0" :max="1" :step="0.1" @change="updateTheme" />
            </el-form-item>
            <el-form-item label="边框圆角" class="mini-form-item">
              <el-input v-model="themeSettings.borderRadius" size="small" @change="updateTheme" />
            </el-form-item>
            
            <!-- 头部设置 -->
            <el-form-item label="头部背景" class="mini-form-item">
              <el-color-picker v-model="themeSettings.headerBackgroundColor" size="small" @change="updateTheme" />
            </el-form-item>
            <el-form-item label="头部文本色" class="mini-form-item">
              <el-color-picker v-model="themeSettings.headerTextColor" size="small" @change="updateTheme" />
            </el-form-item>
            
            <!-- 状态颜色 -->
            <el-form-item label="在线状态色" class="mini-form-item">
              <el-color-picker v-model="themeSettings.onlineStatusColor" size="small" show-alpha @change="updateTheme" />
            </el-form-item>
            <el-form-item label="离线状态色" class="mini-form-item">
              <el-color-picker v-model="themeSettings.offlineStatusColor" size="small" show-alpha @change="updateTheme" />
            </el-form-item>
            
            <!-- 标签值共用设置 -->
            <el-form-item label="标签文本色" class="mini-form-item">
              <el-color-picker v-model="themeSettings.labelTextColor" size="small" show-alpha @change="updateTheme" />
            </el-form-item>
            <el-form-item label="值文本色" class="mini-form-item">
              <el-color-picker v-model="themeSettings.valueTextColor" size="small" @change="updateTheme" />
            </el-form-item>
            
            <!-- 基础项目设置 -->
            <el-collapse accordion style="width: 100%; grid-column: span 2; margin-top: 8px;">
              <el-collapse-item title="下载/上传速度设置">
                <div class="theme-grid">
                  <el-form-item label="下载速度背景" class="mini-form-item">
                    <el-color-picker v-model="themeSettings.downloadSpeedBgColor" size="small" show-alpha @change="updateTheme" />
                  </el-form-item>
                  <el-form-item label="下载速度文本" class="mini-form-item">
                    <el-color-picker v-model="themeSettings.downloadSpeedTextColor" size="small" @change="updateTheme" />
                  </el-form-item>
                  <el-form-item label="上传速度背景" class="mini-form-item">
                    <el-color-picker v-model="themeSettings.uploadSpeedBgColor" size="small" show-alpha @change="updateTheme" />
                  </el-form-item>
                  <el-form-item label="上传速度文本" class="mini-form-item">
                    <el-color-picker v-model="themeSettings.uploadSpeedTextColor" size="small" @change="updateTheme" />
                  </el-form-item>
                </div>
              </el-collapse-item>
            </el-collapse>
          </div>
        </el-tab-pane>
        
        <el-tab-pane label="项目颜色">
          <el-collapse accordion style="width: 100%;">
            <!-- 任务统计项目 -->
            <el-collapse-item v-for="(label, key) in displayItemLabels" :key="key" :title="label">
              <div class="theme-grid">
                <el-form-item :label="`${label}背景`" class="mini-form-item">
                  <el-color-picker v-model="themeSettings[`${key}BgColor`]" size="small" show-alpha @change="updateTheme" />
                </el-form-item>
                <el-form-item :label="`${label}文本`" class="mini-form-item">
                  <el-color-picker v-model="themeSettings[`${key}TextColor`]" size="small" @change="updateTheme" />
                </el-form-item>
              </div>
            </el-collapse-item>
          </el-collapse>
        </el-tab-pane>
        
        <el-tab-pane label="预设主题">
          <div class="preset-themes">
            <el-button type="primary" size="small" @click="applyPreset('dark')">暗色主题</el-button>
            <el-button type="success" size="small" @click="applyPreset('light')">亮色主题</el-button>
            <el-button type="info" size="small" @click="applyPreset('colorful')">多彩主题</el-button>
            <el-button type="warning" size="small" @click="applyPreset('transparent')">透明主题</el-button>
          </div>
        </el-tab-pane>
      </el-tabs>
      
      <div class="action-buttons">
        <el-button type="primary" size="small" @click="applyTheme">应用主题</el-button>
        <el-button size="small" @click="resetTheme">重置</el-button>
      </div>
    </div>
    
    <!-- 预览卡片 -->
    <div class="qb-preview" :style="previewStyle">
      <div class="qb-preview-card">
        <div class="qb-header" :style="headerStyle">
          <div class="qb-logo">
            <img src="/qb.png" alt="qBittorrent" />
            <span :style="{ color: themeSettings.headerTextColor }">{{ previewData.name || 'qBittorrent' }}</span>
          </div>
          <div class="qb-status" :class="{ 'is-online': previewData.isOnline }" :style="statusStyle">
            {{ previewData.isOnline ? '在线' : '离线' }}
          </div>
        </div>

        <div class="qb-content" :style="contentStyle">
          <template v-if="previewData.isOnline">
            <!-- 下载/上传速度 -->
            <div v-if="shouldShow('downloadSpeed') || shouldShow('uploadSpeed')" class="qb-speeds">
              <div v-if="shouldShow('downloadSpeed')" class="qb-speed download" :style="getItemStyle('downloadSpeed')">
                <el-icon><Download /></el-icon>
                <span :style="{ color: themeSettings.downloadSpeedTextColor }">{{ formatSpeed(previewData.downloadSpeed) }}</span>
              </div>
              <div v-if="shouldShow('uploadSpeed')" class="qb-speed upload" :style="getItemStyle('uploadSpeed')">
                <el-icon><Upload /></el-icon>
                <span :style="{ color: themeSettings.uploadSpeedTextColor }">{{ formatSpeed(previewData.uploadSpeed) }}</span>
              </div>
            </div>

            <!-- 任务统计 -->
            <div class="qb-stats">
              <template v-for="(label, key) in displayItemLabels" :key="key">
                <div v-if="shouldShow(key) && key !== 'downloadSpeed' && key !== 'uploadSpeed' && key !== 'globalDownloaded' && key !== 'globalUploaded'" 
                     class="qb-stat-item"
                     :style="getItemStyle(key)">
                  <span class="stat-label" :style="{ color: themeSettings.labelTextColor || 'var(--el-text-color-secondary)' }">{{ label }}:</span>
                  <span class="stat-value" :style="{ color: themeSettings[`${key}TextColor`] || themeSettings.valueTextColor }">
                    {{ formatItemValue(key, previewData[key]) }}
                  </span>
                </div>
              </template>
            </div>

            <!-- 总计数据 -->
            <div v-if="shouldShow('globalDownloaded') || shouldShow('globalUploaded')" class="qb-totals">
              <div v-if="shouldShow('globalDownloaded')" class="qb-total-item" :style="getItemStyle('globalDownloaded')">
                <span class="total-label" :style="{ color: themeSettings.labelTextColor || 'var(--el-text-color-secondary)' }">总下载:</span>
                <span class="total-value" :style="{ color: themeSettings.globalDownloadedTextColor || themeSettings.valueTextColor }">
                  {{ formatSize(previewData.globalDownloaded) }}
                </span>
              </div>
              <div v-if="shouldShow('globalUploaded')" class="qb-total-item" :style="getItemStyle('globalUploaded')">
                <span class="total-label" :style="{ color: themeSettings.labelTextColor || 'var(--el-text-color-secondary)' }">总上传:</span>
                <span class="total-value" :style="{ color: themeSettings.globalUploadedTextColor || themeSettings.valueTextColor }">
                  {{ formatSize(previewData.globalUploaded) }}
                </span>
              </div>
            </div>
          </template>
          
          <div v-else class="qb-offline">
            <el-icon><WarningFilled /></el-icon>
            <span>无法连接到qBittorrent</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Download, Upload, WarningFilled } from '@element-plus/icons-vue'
import { ref, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'

// 预览数据类型
interface PreviewData {
  name: string
  isOnline: boolean
  downloadSpeed: number
  uploadSpeed: number
  activeTorrents: number
  pausedTorrents: number
  completedTorrents: number
  totalTorrents: number
  activeDownloads: number
  globalRatio: number
  globalDownloaded: number
  globalUploaded: number
  freeSpace: number
  seedingTorrents: number
  totalSize: number
  averageRatio: number
  ioTasks: number
  errorTorrents: number
  uploadLimit: number
  downloadLimit: number
  [key: string]: any
}

// 显示项目类型
interface DisplayItems {
  downloadSpeed: boolean
  uploadSpeed: boolean
  activeDownloads: boolean
  activeTorrents: boolean
  pausedTorrents: boolean
  completedTorrents: boolean
  totalTorrents: boolean
  globalRatio: boolean
  globalDownloaded: boolean
  globalUploaded: boolean
  freeSpace: boolean
  seedingTorrents: boolean
  totalSize: boolean
  averageRatio: boolean
  ioTasks: boolean
  errorTorrents: boolean
  uploadLimit: boolean
  downloadLimit: boolean
  [key: string]: boolean
}

// 主题设置接口
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
  
  // 上传速度
  uploadSpeedBgColor: string  
  uploadSpeedTextColor: string
  
  // 活跃下载
  activeDownloadsBgColor: string
  activeDownloadsTextColor: string
  
  // 活跃任务
  activeTorrentsBgColor: string
  activeTorrentsTextColor: string
  
  // 暂停任务
  pausedTorrentsBgColor: string
  pausedTorrentsTextColor: string
  
  // 完成任务
  completedTorrentsBgColor: string
  completedTorrentsTextColor: string
  
  // 总任务数
  totalTorrentsBgColor: string
  totalTorrentsTextColor: string
  
  // 错误任务
  errorTorrentsBgColor: string
  errorTorrentsTextColor: string
  
  // 做种数
  seedingTorrentsBgColor: string
  seedingTorrentsTextColor: string
  
  // I/O任务
  ioTasksBgColor: string
  ioTasksTextColor: string
  
  // 分享率
  globalRatioBgColor: string
  globalRatioTextColor: string
  
  // 平均分享率
  averageRatioBgColor: string
  averageRatioTextColor: string
  
  // 已下载
  globalDownloadedBgColor: string
  globalDownloadedTextColor: string
  
  // 已上传
  globalUploadedBgColor: string
  globalUploadedTextColor: string
  
  // 上传限制
  uploadLimitBgColor: string
  uploadLimitTextColor: string
  
  // 下载限制
  downloadLimitBgColor: string
  downloadLimitTextColor: string
  
  // 可用空间
  freeSpaceBgColor: string
  freeSpaceTextColor: string
  
  // 总体积
  totalSizeBgColor: string
  totalSizeTextColor: string
  
  // 通用
  labelTextColor: string
  valueTextColor: string
  
  borderRadius: string
  [key: string]: any
}

const props = defineProps<{
  previewData: PreviewData
  displayItems: DisplayItems
}>()

// 事件
const emit = defineEmits<{
  (e: 'update-theme', value: ThemeSettings): void
}>()

// 显示项目标签映射
const displayItemLabels = {
  downloadSpeed: '下载速度',
  uploadSpeed: '上传速度',
  activeDownloads: '活跃下载',
  activeTorrents: '活跃任务',
  pausedTorrents: '暂停任务',
  completedTorrents: '完成任务',
  totalTorrents: '总任务数',
  globalRatio: '分享率',
  globalDownloaded: '总下载',
  globalUploaded: '总上传',
  freeSpace: '剩余空间',
  seedingTorrents: '做种数量',
  totalSize: '总大小',
  averageRatio: '平均分享率',
  ioTasks: 'I/O任务',
  errorTorrents: '错误种子',
  uploadLimit: '上传限速',
  downloadLimit: '下载限速'
}

// 主题设置
const themeSettings = ref<ThemeSettings>({
  backgroundColor: '#2d3436',
  backgroundOpacity: 1,
  headerBackgroundColor: '#2d3436',
  headerTextColor: '#ffffff',
  onlineStatusColor: 'rgba(46, 204, 113, 0.8)',
  offlineStatusColor: 'rgba(231, 76, 60, 0.8)',
  
  // 下载速度
  downloadSpeedBgColor: 'rgba(33, 150, 243, 0.15)',
  downloadSpeedTextColor: '#3498db',
  
  // 上传速度
  uploadSpeedBgColor: 'rgba(76, 175, 80, 0.15)',
  uploadSpeedTextColor: '#27ae60',
  
  // 活跃下载
  activeDownloadsBgColor: 'rgba(33, 150, 243, 0.1)',
  activeDownloadsTextColor: '#4fc3f7',
  
  // 活跃任务
  activeTorrentsBgColor: 'rgba(156, 39, 176, 0.1)',
  activeTorrentsTextColor: '#9c27b0',
  
  // 暂停任务
  pausedTorrentsBgColor: 'rgba(255, 152, 0, 0.1)',
  pausedTorrentsTextColor: '#ff9800',
  
  // 完成任务
  completedTorrentsBgColor: 'rgba(76, 175, 80, 0.1)',
  completedTorrentsTextColor: '#4caf50',
  
  // 总任务数
  totalTorrentsBgColor: 'rgba(158, 158, 158, 0.1)',
  totalTorrentsTextColor: '#9e9e9e',
  
  // 错误任务
  errorTorrentsBgColor: 'rgba(244, 67, 54, 0.1)',
  errorTorrentsTextColor: '#f44336',
  
  // 做种数
  seedingTorrentsBgColor: 'rgba(0, 188, 212, 0.1)',
  seedingTorrentsTextColor: '#00bcd4',
  
  // I/O任务
  ioTasksBgColor: 'rgba(0, 150, 136, 0.1)',
  ioTasksTextColor: '#009688',
  
  // 分享率
  globalRatioBgColor: 'rgba(3, 169, 244, 0.1)',
  globalRatioTextColor: '#03a9f4',
  
  // 平均分享率
  averageRatioBgColor: 'rgba(63, 81, 181, 0.1)',
  averageRatioTextColor: '#3f51b5',
  
  // 已下载
  globalDownloadedBgColor: 'rgba(0, 188, 212, 0.1)',
  globalDownloadedTextColor: '#00bcd4',
  
  // 已上传
  globalUploadedBgColor: 'rgba(233, 30, 99, 0.1)',
  globalUploadedTextColor: '#e91e63',
  
  // 上传限制
  uploadLimitBgColor: 'rgba(255, 87, 34, 0.1)',
  uploadLimitTextColor: '#ff5722',
  
  // 下载限制
  downloadLimitBgColor: 'rgba(121, 85, 72, 0.1)',
  downloadLimitTextColor: '#795548',
  
  // 可用空间
  freeSpaceBgColor: 'rgba(96, 125, 139, 0.1)',
  freeSpaceTextColor: '#607d8b',
  
  // 总体积
  totalSizeBgColor: 'rgba(97, 97, 97, 0.1)',
  totalSizeTextColor: '#616161',
  
  // 标签和值通用设置
  labelTextColor: 'rgba(255, 255, 255, 0.7)',
  valueTextColor: '#ffffff',
  
  borderRadius: '8px'
})

// 计算样式
const previewStyle = computed(() => ({
  backgroundColor: themeSettings.value.backgroundColor || '#2d3436',
  opacity: themeSettings.value.backgroundOpacity || 1,
  borderRadius: themeSettings.value.borderRadius || '8px'
}))

const headerStyle = computed(() => ({
  backgroundColor: themeSettings.value.headerBackgroundColor || '#2980b9'
}))

const contentStyle = computed(() => ({
  backgroundColor: 'transparent'
}))

const statusStyle = computed(() => {
  if (props.previewData.isOnline) {
    return {
      backgroundColor: themeSettings.value.onlineStatusColor || 'rgba(46, 204, 113, 0.8)'
    }
  } else {
    return {
      backgroundColor: themeSettings.value.offlineStatusColor || 'rgba(231, 76, 60, 0.8)'
    }
  }
})

// 获取指定项目的样式
const getItemStyle = (item: string) => {
  return {
    backgroundColor: themeSettings.value[`${item}BgColor`] || 'transparent'
  }
}

// 检查是否应该显示特定项目
const shouldShow = (item: keyof DisplayItems) => {
  return props.displayItems[item]
}

// 格式化速度
const formatSpeed = (bytes: number) => {
  if (bytes === 0) return '0 B/s'
  
  // 如果是限速且为0，表示无限制
  if (bytes === 0 && (props.displayItems.uploadLimit || props.displayItems.downloadLimit)) {
    return '无限制'
  }
  
  const k = 1024
  const sizes = ['B/s', 'KB/s', 'MB/s', 'GB/s', 'TB/s']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// 格式化大小
const formatSize = (bytes: number): string => {
  if (!bytes) return '0 KB'
  
  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  let value = bytes
  let unitIndex = 0
  
  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024
    unitIndex++
  }
  
  return `${value.toFixed(2)} ${units[unitIndex]}`
}

// 格式化分享率
const formatRatio = (ratio: number): string => {
  if (!ratio) return '0'
  return ratio.toFixed(2)
}

// 根据项目类型格式化值
const formatItemValue = (key: string, value: any): string => {
  if (!value && value !== 0) return '0'
  
  if (key.includes('Speed') || key.includes('Limit')) {
    return formatSpeed(value)
  } else if (key.includes('Space') || key.includes('Size') || 
             key.includes('Downloaded') || key.includes('Uploaded')) {
    return formatSize(value)
  } else if (key.includes('Ratio')) {
    return formatRatio(value)
  }
  
  return value.toString()
}

// 更新主题
const updateTheme = () => {
  // 这里可以添加额外逻辑，比如在每次改变时实时更新预览
}

// 应用主题
const applyTheme = () => {
  emit('update-theme', themeSettings.value)
  ElMessage.success('主题设置已应用')
}

// 重置主题
const resetTheme = () => {
  // 重置为默认主题
  themeSettings.value = {
    backgroundColor: '#2d3436',
    backgroundOpacity: 1,
    headerBackgroundColor: '#2980b9',
    headerTextColor: '#ffffff',
    onlineStatusColor: 'rgba(46, 204, 113, 0.8)',
    offlineStatusColor: 'rgba(231, 76, 60, 0.8)',
    
    // 下载速度
    downloadSpeedBgColor: 'rgba(33, 150, 243, 0.15)',
    downloadSpeedTextColor: '#3498db',
    
    // 上传速度
    uploadSpeedBgColor: 'rgba(76, 175, 80, 0.15)',
    uploadSpeedTextColor: '#27ae60',
    
    // 活跃下载
    activeDownloadsBgColor: 'rgba(33, 150, 243, 0.1)',
    activeDownloadsTextColor: '#4fc3f7',
    
    // 活跃任务
    activeTorrentsBgColor: 'rgba(156, 39, 176, 0.1)',
    activeTorrentsTextColor: '#9c27b0',
    
    // 暂停任务
    pausedTorrentsBgColor: 'rgba(255, 152, 0, 0.1)',
    pausedTorrentsTextColor: '#ff9800',
    
    // 完成任务
    completedTorrentsBgColor: 'rgba(76, 175, 80, 0.1)',
    completedTorrentsTextColor: '#4caf50',
    
    // 总任务数
    totalTorrentsBgColor: 'rgba(158, 158, 158, 0.1)',
    totalTorrentsTextColor: '#9e9e9e',
    
    // 错误任务
    errorTorrentsBgColor: 'rgba(244, 67, 54, 0.1)',
    errorTorrentsTextColor: '#f44336',
    
    // 做种数
    seedingTorrentsBgColor: 'rgba(0, 188, 212, 0.1)',
    seedingTorrentsTextColor: '#00bcd4',
    
    // I/O任务
    ioTasksBgColor: 'rgba(0, 150, 136, 0.1)',
    ioTasksTextColor: '#009688',
    
    // 分享率
    globalRatioBgColor: 'rgba(3, 169, 244, 0.1)',
    globalRatioTextColor: '#03a9f4',
    
    // 平均分享率
    averageRatioBgColor: 'rgba(63, 81, 181, 0.1)',
    averageRatioTextColor: '#3f51b5',
    
    // 已下载
    globalDownloadedBgColor: 'rgba(0, 188, 212, 0.1)',
    globalDownloadedTextColor: '#00bcd4',
    
    // 已上传
    globalUploadedBgColor: 'rgba(233, 30, 99, 0.1)',
    globalUploadedTextColor: '#e91e63',
    
    // 上传限制
    uploadLimitBgColor: 'rgba(255, 87, 34, 0.1)',
    uploadLimitTextColor: '#ff5722',
    
    // 下载限制
    downloadLimitBgColor: 'rgba(121, 85, 72, 0.1)',
    downloadLimitTextColor: '#795548',
    
    // 可用空间
    freeSpaceBgColor: 'rgba(96, 125, 139, 0.1)',
    freeSpaceTextColor: '#607d8b',
    
    // 总体积
    totalSizeBgColor: 'rgba(97, 97, 97, 0.1)',
    totalSizeTextColor: '#616161',
    
    // 标签和值通用设置
    labelTextColor: 'rgba(255, 255, 255, 0.7)',
    valueTextColor: '#ffffff',
    
    borderRadius: '8px'
  }
  
  updateTheme()
  ElMessage.info('主题设置已重置为默认值')
}

// 应用预设主题
const applyPreset = (preset: string) => {
  switch (preset) {
    case 'dark':
      themeSettings.value = {
        ...themeSettings.value,
        backgroundColor: '#1a1a1a',
        headerBackgroundColor: '#333333',
        headerTextColor: '#ffffff',
        labelTextColor: 'rgba(255, 255, 255, 0.6)',
        valueTextColor: '#ffffff'
      }
      break
      
    case 'light':
      themeSettings.value = {
        ...themeSettings.value,
        backgroundColor: '#ffffff',
        headerBackgroundColor: '#f8f9fa',
        headerTextColor: '#333333',
        labelTextColor: 'rgba(0, 0, 0, 0.6)',
        valueTextColor: '#333333'
      }
      break
      
    case 'colorful':
      themeSettings.value = {
        ...themeSettings.value,
        backgroundColor: '#f5f5f5',
        headerBackgroundColor: '#8e44ad',
        onlineStatusColor: 'rgba(46, 204, 113, 0.9)',
        downloadSpeedBgColor: 'rgba(52, 152, 219, 0.2)',
        uploadSpeedBgColor: 'rgba(46, 204, 113, 0.2)'
      }
      break
      
    case 'transparent':
      themeSettings.value = {
        ...themeSettings.value,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        backgroundOpacity: 0.7,
        headerBackgroundColor: 'rgba(0, 0, 0, 0.6)',
      }
      break
  }
  
  updateTheme()
  ElMessage.success(`已应用${preset === 'dark' ? '暗色' : preset === 'light' ? '亮色' : preset === 'colorful' ? '多彩' : '透明'}主题`)
}
</script>

<style lang="scss" scoped>
.qb-preview-container {
  display: flex;
  flex-direction: column;
  padding: 0;
  gap: 10px;
  
  .theme-settings {
    padding: 0 0 10px 0;
    border-bottom: 1px solid var(--el-border-color-light);
    
    .theme-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 8px;
    }
    
    .mini-form-item {
      margin-bottom: 5px;
      
      :deep(.el-form-item__label) {
        font-size: 12px;
        line-height: 1.2;
        padding-bottom: 2px;
      }
      
      :deep(.el-form-item__content) {
        line-height: 1;
      }
      
      :deep(.el-slider) {
        margin-top: 0;
        margin-bottom: 0;
        height: 28px;
      }
    }
    
    .preset-themes {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-top: 8px;
    }
    
    .action-buttons {
      display: flex;
      justify-content: flex-end;
      margin-top: 8px;
      gap: 8px;
    }
  }
  
  .qb-preview {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 16px;
    border-radius: 8px;
    background-color: var(--el-bg-color-overlay);
    
    .qb-preview-card {
      width: 100%;
      max-width: 360px;
      border-radius: 8px;
      box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
      overflow: hidden;
      
      .qb-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 12px 16px;
        color: white;
        
        .qb-logo {
          display: flex;
          align-items: center;
          gap: 8px;
          
          img {
            width: 24px;
            height: 24px;
          }
          
          span {
            font-weight: 600;
            font-size: 16px;
          }
        }
        
        .qb-status {
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          background-color: rgba(255, 255, 255, 0.2);
        }
      }
      
      .qb-content {
        padding: 16px;
        
        .qb-speeds {
          display: flex;
          justify-content: space-between;
          margin-bottom: 16px;
          
          .qb-speed {
            display: flex;
            align-items: center;
            gap: 8px;
            font-weight: 600;
            padding: 6px 8px;
            border-radius: 4px;
          }
        }
        
        .qb-stats {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 8px;
          margin-bottom: 16px;
          
          .qb-stat-item {
            display: flex;
            justify-content: space-between;
            padding: 4px 8px;
            border-radius: 4px;
            
            .stat-label {
              font-size: 12px;
            }
            
            .stat-value {
              font-weight: 600;
              font-size: 12px;
            }
          }
        }
        
        .qb-totals {
          border-top: 1px solid var(--el-border-color-light);
          padding-top: 12px;
          
          .qb-total-item {
            display: flex;
            justify-content: space-between;
            margin-bottom: 4px;
            padding: 4px 8px;
            border-radius: 4px;
            
            .total-label {
              font-size: 12px;
            }
            
            .total-value {
              font-weight: 600;
              font-size: 12px;
            }
          }
        }
        
        .qb-offline {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 24px 0;
          color: var(--el-text-color-secondary);
          
          .el-icon {
            font-size: 32px;
            margin-bottom: 8px;
            color: var(--el-color-warning);
          }
        }
      }
    }
  }
}

:deep(.el-tabs__item) {
  height: 30px;
  line-height: 30px;
  padding: 0 12px;
  font-size: 13px;
}

:deep(.el-collapse-item__header) {
  padding: 0 8px;
  font-size: 13px;
  height: 32px;
  line-height: 32px;
}

:deep(.el-collapse-item__content) {
  padding: 8px;
}

:deep(.el-collapse) {
  border: none;
}

:deep(.el-collapse-item__wrap) {
  border-bottom: none;
}
</style> 