<template>
  <div class="tr-preview" :style="previewStyle">
    <!-- 添加渐变背景层 -->
    <div v-if="hasGradientBg" class="gradient-bg" :style="gradientBgStyle"></div>
    <div class="tr-preview-card">
      <div class="tr-header" :style="headerStyle">
        <div class="tr-logo">
          <img src="/tr.png" alt="Transmission" />
          <span :style="{ color: themeSettings.headerTextColor }">{{ previewData.name || 'Transmission' }}</span>
        </div>
        <div class="tr-status" :class="{ 'is-online': previewData.isOnline }" :style="statusStyle">
          {{ previewData.isOnline ? '在线' : '离线' }}
        </div>
      </div>

      <div class="tr-content" :style="contentStyle">
        <template v-if="previewData.isOnline">
          <!-- 下载/上传速度 -->
          <div v-if="shouldShow('downloadSpeed') || shouldShow('uploadSpeed')" class="tr-speeds">
            <div v-if="shouldShow('downloadSpeed')" class="tr-speed download" :style="getItemStyle('downloadSpeed')">
              <el-icon><Download /></el-icon>
              <span :style="{ color: themeSettings.downloadSpeedTextColor }">{{ formatSpeed(previewData.downloadSpeed) }}</span>
            </div>
            <div v-if="shouldShow('uploadSpeed')" class="tr-speed upload" :style="getItemStyle('uploadSpeed')">
              <el-icon><Upload /></el-icon>
              <span :style="{ color: themeSettings.uploadSpeedTextColor }">{{ formatSpeed(previewData.uploadSpeed) }}</span>
            </div>
          </div>

          <!-- 任务统计 -->
          <div class="tr-stats">
            <template v-for="(label, key) in displayItemLabels" :key="key">
              <div v-if="shouldShow(key) && key !== 'downloadSpeed' && key !== 'uploadSpeed' && key !== 'globalDownloaded' && key !== 'globalUploaded'" 
                   class="tr-stat-item"
                   :style="getItemStyle(key)">
                <span class="stat-label" :style="{ color: themeSettings.labelTextColor || 'var(--el-text-color-secondary)' }">{{ label }}:</span>
                <span class="stat-value" :style="{ color: themeSettings[`${key}TextColor`] || themeSettings.valueTextColor }">
                  {{ formatItemValue(key, previewData[key]) }}
                </span>
              </div>
            </template>
          </div>

          <!-- 总计数据 -->
          <div v-if="shouldShow('globalDownloaded') || shouldShow('globalUploaded')" class="tr-totals">
            <div v-if="shouldShow('globalDownloaded')" class="tr-total-item" :style="getItemStyle('globalDownloaded')">
              <span class="total-label" :style="{ color: themeSettings.labelTextColor || 'var(--el-text-color-secondary)' }">已下载:</span>
              <span class="total-value" :style="{ color: themeSettings.globalDownloadedTextColor || themeSettings.valueTextColor }">
                {{ formatSize(previewData.globalDownloaded) }}
              </span>
            </div>
            <div v-if="shouldShow('globalUploaded')" class="tr-total-item" :style="getItemStyle('globalUploaded')">
              <span class="total-label" :style="{ color: themeSettings.labelTextColor || 'var(--el-text-color-secondary)' }">已上传:</span>
              <span class="total-value" :style="{ color: themeSettings.globalUploadedTextColor || themeSettings.valueTextColor }">
                {{ formatSize(previewData.globalUploaded) }}
              </span>
            </div>
          </div>
        </template>
        
        <div v-else class="tr-offline">
          <el-icon><WarningFilled /></el-icon>
          <span>无法连接到Transmission</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Download, Upload, WarningFilled } from '@element-plus/icons-vue'
import { ref, computed } from 'vue'

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
  
  // 标签和值通用设置
  labelTextColor: string
  valueTextColor: string
  
  borderRadius: string
  wallpaper: {
    style: string
    backgroundColor?: string
    backgroundColor2?: string
    gradientDirection?: string
    animation?: boolean
  }
  [key: string]: any
}

const props = defineProps<{
  previewData: PreviewData
  displayItems: DisplayItems
  themeSettings: ThemeSettings
}>()

// 显示项目标签映射
const displayItemLabels = {
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
  errorTorrents: '错误任务',
  uploadLimit: '上传限制',
  downloadLimit: '下载限制'
}

// 计算样式
const previewStyle = computed(() => {
  // 如果是渐变壁纸，返回透明背景
  if (props.themeSettings.wallpaper && props.themeSettings.wallpaper.style === 'gradient') {
    return {
      backgroundColor: 'transparent', // 使用透明背景，让渐变层显示
      opacity: props.themeSettings.backgroundOpacity || 1,
      borderRadius: props.themeSettings.borderRadius || '8px',
      position: 'relative' as const,
      overflow: 'hidden' as const
    };
  }
  
  return {
    backgroundColor: props.themeSettings.backgroundColor || '#2d3436',
    opacity: props.themeSettings.backgroundOpacity || 1,
    borderRadius: props.themeSettings.borderRadius || '8px'
  };
})

const headerStyle = computed(() => ({
  backgroundColor: props.themeSettings.headerBackgroundColor || '#2980b9'
}))

const contentStyle = computed(() => ({
  backgroundColor: 'transparent'
}))

const statusStyle = computed(() => {
  if (props.previewData.isOnline) {
    return {
      backgroundColor: props.themeSettings.onlineStatusColor || 'rgba(46, 204, 113, 0.8)'
    }
  } else {
    return {
      backgroundColor: props.themeSettings.offlineStatusColor || 'rgba(231, 76, 60, 0.8)'
    }
  }
})

// 添加渐变背景样式计算
const gradientBgStyle = computed(() => {
  if (!props.themeSettings.wallpaper || props.themeSettings.wallpaper.style !== 'gradient') {
    return null;
  }
  
  const wallpaper = props.themeSettings.wallpaper;
  const direction = wallpaper.gradientDirection || '45deg';
  const color1 = wallpaper.backgroundColor || '#2d3436';
  const color2 = wallpaper.backgroundColor2 || '#34495e';
  const animation = wallpaper.animation ? 'gradient-move 8s ease infinite' : 'none';
  
  return {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: `linear-gradient(${direction}, ${color1}, ${color2})`,
    animation: animation,
    zIndex: -1
  };
});

// 是否有渐变背景
const hasGradientBg = computed(() => {
  return props.themeSettings.wallpaper && props.themeSettings.wallpaper.style === 'gradient';
});

// 检查是否应该显示某个项目
const shouldShow = (key: string) => {
  return props.displayItems[key] === true
}

// 获取项目样式
const getItemStyle = (key: string) => {
  const bgColorKey = `${key}BgColor`
  return {
    backgroundColor: props.themeSettings[bgColorKey] || 'rgba(0, 0, 0, 0.1)'
  }
}

// 格式化速度
const formatSpeed = (speed: number) => {
  if (typeof speed !== 'number') return '0 KB/s'
  
  if (speed < 1024) {
    return `${speed.toFixed(1)} KB/s`
  } else if (speed < 1024 * 1024) {
    return `${(speed / 1024).toFixed(1)} MB/s`
  } else {
    return `${(speed / (1024 * 1024)).toFixed(1)} GB/s`
  }
}

// 格式化大小
const formatSize = (size: number) => {
  if (typeof size !== 'number') return '0 KB'
  
  if (size < 1024) {
    return `${size.toFixed(1)} KB`
  } else if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(1)} MB`
  } else if (size < 1024 * 1024 * 1024) {
    return `${(size / (1024 * 1024)).toFixed(1)} GB`
  } else {
    return `${(size / (1024 * 1024 * 1024)).toFixed(1)} TB`
  }
}

// 格式化项目值
const formatItemValue = (key: string, value: any) => {
  if (key === 'globalRatio' || key === 'averageRatio') {
    return typeof value === 'number' ? value.toFixed(2) : '0.00'
  } else if (key === 'freeSpace' || key === 'totalSize') {
    return formatSize(value)
  } else if (key === 'uploadLimit' || key === 'downloadLimit') {
    return value > 0 ? formatSpeed(value) : '无限制'
  } else {
    return value
  }
}
</script>

<style lang="scss" scoped>
.tr-preview {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 16px;
  border-radius: 8px;
  position: relative;
  overflow: hidden;
  
  /* 添加渐变背景样式 */
  .gradient-bg {
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    z-index: -1;
    pointer-events: none;
    background-size: 400% 400%;
  }
  
  @keyframes gradient-move {
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
  
  .tr-preview-card {
    width: 100%;
    max-width: 360px;
    border-radius: 8px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
    overflow: hidden;
    
    .tr-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 16px;
      color: white;
      
      .tr-logo {
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
      
      .tr-status {
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 12px;
        background-color: rgba(255, 255, 255, 0.2);
      }
    }
    
    .tr-content {
      padding: 16px;
      
      .tr-speeds {
        display: flex;
        justify-content: space-between;
        margin-bottom: 16px;
        
        .tr-speed {
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 600;
          padding: 6px 8px;
          border-radius: 4px;
        }
      }
      
      .tr-stats {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 8px;
        margin-bottom: 16px;
        
        .tr-stat-item {
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
      
      .tr-totals {
        border-top: 1px solid var(--el-border-color-light);
        padding-top: 12px;
        
        .tr-total-item {
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
      
      .tr-offline {
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
</style> 