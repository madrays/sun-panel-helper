<template>
  <div class="qb-preview">
    <div class="qb-preview-card">
      <div class="qb-header">
        <div class="qb-logo">
          <img src="/qb.png" alt="qBittorrent" />
          <span>{{ previewData.name || 'qBittorrent' }}</span>
        </div>
        <div class="qb-status" :class="{ 'is-online': previewData.isOnline }">
          {{ previewData.isOnline ? '在线' : '离线' }}
        </div>
      </div>

      <div class="qb-content">
        <template v-if="previewData.isOnline">
          <!-- 下载/上传速度 -->
          <div v-if="shouldShow('downloadSpeed') || shouldShow('uploadSpeed')" class="qb-speeds">
            <div v-if="shouldShow('downloadSpeed')" class="qb-speed download">
              <el-icon><Download /></el-icon>
              <span>{{ formatSpeed(previewData.downloadSpeed) }}</span>
            </div>
            <div v-if="shouldShow('uploadSpeed')" class="qb-speed upload">
              <el-icon><Upload /></el-icon>
              <span>{{ formatSpeed(previewData.uploadSpeed) }}</span>
            </div>
          </div>

          <!-- 任务统计 -->
          <div class="qb-stats">
            <div v-if="shouldShow('activeTorrents')" class="qb-stat-item">
              <span class="stat-label">活跃任务:</span>
              <span class="stat-value">{{ previewData.activeTorrents || 0 }}</span>
            </div>
            <div v-if="shouldShow('pausedTorrents')" class="qb-stat-item">
              <span class="stat-label">暂停任务:</span>
              <span class="stat-value">{{ previewData.pausedTorrents || 0 }}</span>
            </div>
            <div v-if="shouldShow('completedTorrents')" class="qb-stat-item">
              <span class="stat-label">已完成:</span>
              <span class="stat-value">{{ previewData.completedTorrents || 0 }}</span>
            </div>
            <div v-if="shouldShow('totalTorrents')" class="qb-stat-item">
              <span class="stat-label">总任务数:</span>
              <span class="stat-value">{{ previewData.totalTorrents || 0 }}</span>
            </div>
            <div v-if="shouldShow('activeDownloads')" class="qb-stat-item">
              <span class="stat-label">活跃下载:</span>
              <span class="stat-value">{{ previewData.activeDownloads || 0 }}</span>
            </div>
            <div v-if="shouldShow('globalRatio')" class="qb-stat-item">
              <span class="stat-label">分享率:</span>
              <span class="stat-value">{{ formatRatio(previewData.globalRatio) }}</span>
            </div>
            <div v-if="shouldShow('freeSpace')" class="qb-stat-item">
              <span class="stat-label">剩余空间:</span>
              <span class="stat-value">{{ formatSize(previewData.freeSpace) }}</span>
            </div>
            <div v-if="shouldShow('seedingTorrents')" class="qb-stat-item">
              <span class="stat-label">做种数量:</span>
              <span class="stat-value">{{ previewData.seedingTorrents || 0 }}</span>
            </div>
            <div v-if="shouldShow('errorTorrents')" class="qb-stat-item">
              <span class="stat-label">错误种子:</span>
              <span class="stat-value">{{ previewData.errorTorrents || 0 }}</span>
            </div>
            <div v-if="shouldShow('ioTasks')" class="qb-stat-item">
              <span class="stat-label">I/O任务:</span>
              <span class="stat-value">{{ previewData.ioTasks || 0 }}</span>
            </div>
            <div v-if="shouldShow('uploadLimit')" class="qb-stat-item">
              <span class="stat-label">上传限速:</span>
              <span class="stat-value">{{ formatSpeed(previewData.uploadLimit) }}</span>
            </div>
            <div v-if="shouldShow('downloadLimit')" class="qb-stat-item">
              <span class="stat-label">下载限速:</span>
              <span class="stat-value">{{ formatSpeed(previewData.downloadLimit) }}</span>
            </div>
            <div v-if="shouldShow('averageRatio')" class="qb-stat-item">
              <span class="stat-label">平均分享率:</span>
              <span class="stat-value">{{ formatRatio(previewData.averageRatio) }}</span>
            </div>
            <div v-if="shouldShow('totalSize')" class="qb-stat-item">
              <span class="stat-label">总大小:</span>
              <span class="stat-value">{{ formatSize(previewData.totalSize) }}</span>
            </div>
          </div>

          <!-- 总计数据 -->
          <div v-if="shouldShow('globalDownloaded') || shouldShow('globalUploaded')" class="qb-totals">
            <div v-if="shouldShow('globalDownloaded')" class="qb-total-item">
              <span class="total-label">总下载:</span>
              <span class="total-value">{{ formatSize(previewData.globalDownloaded) }}</span>
            </div>
            <div v-if="shouldShow('globalUploaded')" class="qb-total-item">
              <span class="total-label">总上传:</span>
              <span class="total-value">{{ formatSize(previewData.globalUploaded) }}</span>
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
</template>

<script setup lang="ts">
import { Download, Upload, WarningFilled } from '@element-plus/icons-vue'

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
}

const props = defineProps<{
  previewData: PreviewData
  displayItems: DisplayItems
}>()

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
</script>

<style lang="scss" scoped>
.qb-preview {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 16px;
  
  .qb-preview-card {
    width: 100%;
    max-width: 360px;
    border-radius: 8px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
    overflow: hidden;
    background-color: var(--el-bg-color);
    
    .qb-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 16px;
      background-color: #2980b9;
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
        
        &.is-online {
          background-color: #27ae60;
        }
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
          
          &.download {
            color: #2980b9;
          }
          
          &.upload {
            color: #27ae60;
          }
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
          
          .stat-label {
            color: var(--el-text-color-secondary);
            font-size: 14px;
          }
          
          .stat-value {
            font-weight: 600;
            font-size: 14px;
          }
        }
      }
      
      .qb-totals {
        border-top: 1px solid var(--el-border-color-lighter);
        padding-top: 12px;
        
        .qb-total-item {
          display: flex;
          justify-content: space-between;
          margin-bottom: 4px;
          
          .total-label {
            color: var(--el-text-color-secondary);
            font-size: 14px;
          }
          
          .total-value {
            font-weight: 600;
            font-size: 14px;
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
</style> 