<template>
  <div class="widget-card" @click="$emit('click')">
    <!-- Helper独占标签 -->
    <div class="helper-badge">
      <div class="badge-content">
        <el-icon><Star /></el-icon>
        helper独占
      </div>
      <div class="badge-corner"></div>
    </div>
    
    <!-- 应用状态标签 -->
    <div class="apply-badges">
      <el-tag 
        v-if="isAppliedToFixed" 
        class="status-badge fixed-badge"
        size="small"
      >
        <el-icon><Lock /></el-icon>
        固定池
      </el-tag>
      <el-tag 
        v-if="isAppliedToFree" 
        class="status-badge free-badge"
        size="small"
      >
        <el-icon><Position /></el-icon>
        自由池
      </el-tag>
    </div>
    
    <div class="preview-section">
      <div class="preview-area">
        <div class="qb-preview">
          <!-- 头部区域 -->
          <div class="qb-header">
            <img src="/qb.png" alt="QB" class="qb-logo">
            <span class="qb-title">QB下载器</span>
            <span class="qb-badge online">在线</span>
          </div>
          
          <!-- 内容区域 -->
          <div class="qb-content">
            <!-- 速度显示区域 -->
            <div class="qb-speed-row">
              <div class="qb-item download">
                <div class="qb-label">下载速度</div>
                <div class="qb-value download-value">3.5 MB/s</div>
              </div>
              
              <div class="qb-item upload">
                <div class="qb-label">上传速度</div>
                <div class="qb-value upload-value">1.2 MB/s</div>
              </div>
            </div>
            
            <!-- 状态网格 -->
            <div class="qb-stats-grid">
              <div class="qb-item">
                <div class="qb-label">下载中</div>
                <div class="qb-value">5</div>
              </div>
              <div class="qb-item">
                <div class="qb-label">活跃</div>
                <div class="qb-value">8</div>
              </div>
              <div class="qb-item">
                <div class="qb-label">暂停</div>
                <div class="qb-value">3</div>
              </div>
              <div class="qb-item">
                <div class="qb-label">总数</div>
                <div class="qb-value">12</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="info-section">
      <h3>QB下载器状态</h3>
      <p>实时监控qBittorrent下载器状态，支持多个下载器和自定义显示项</p>
      <div class="tags">
        <span class="tag">下载</span>
        <span class="tag">监控</span>
        <span class="tag">qBittorrent</span>
      </div>
      <div class="author">
        <span class="author-tag">作者：madrays</span>
        <span class="author-tag">优化适配：madrays</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Lock, Position, Star } from '@element-plus/icons-vue'
defineProps<{
  isAppliedToFixed?: boolean
  isAppliedToFree?: boolean
}>()
</script>

<style scoped>
.widget-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  transition: all 0.3s;
  cursor: pointer;
  position: relative;
  height: 340px;
  display: flex;
  flex-direction: column;
}

.widget-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.12);
}

.preview-section {
  padding: 1.5rem;
  background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 1;
  min-height: 0;
  position: relative;
  overflow: hidden;
}

.preview-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url('data:image/svg+xml,<svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><rect width="1" height="1" fill="rgba(255,255,255,0.05)"/></svg>') repeat;
  opacity: 0.5;
}

.preview-area {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  z-index: 1;
}

.qb-preview {
  width: 220px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(10px);
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-6px); }
}

.qb-header {
  padding: 6px 10px;
  background: rgba(0, 0, 0, 0.3);
  color: white;
  display: flex;
  align-items: center;
  height: 24px;
}

.qb-logo {
  width: 12px;
  height: 12px;
  margin-right: 6px;
  flex-shrink: 0;
}

.qb-title {
  flex: 1;
  font-weight: 500;
  font-size: 12px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.qb-badge {
  font-size: 9px;
  padding: 1px 4px;
  border-radius: 8px;
  margin-left: 6px;
  flex-shrink: 0;
  font-weight: normal;
}

.qb-badge.online {
  background-color: rgba(46, 204, 113, 0.8);
}

.qb-badge.offline {
  background-color: rgba(231, 76, 60, 0.8);
}

.qb-content {
  padding: 6px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.qb-speed-row {
  display: flex;
  gap: 6px;
  width: 100%;
}

.qb-stats-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.qb-item {
  min-width: 0;
  text-align: center;
  padding: 4px 2px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.1);
  box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.08);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  min-height: 36px;
  flex: 1 0 calc(50% - 3px);
}

.qb-item.download {
  background: rgba(33, 150, 243, 0.15);
}

.qb-item.upload {
  background: rgba(244, 67, 54, 0.15);
}

.qb-label {
  color: rgba(255, 255, 255, 0.8);
  font-size: 10px;
  margin-bottom: 2px;
  font-weight: normal;
  line-height: 1.2;
}

.qb-value {
  font-weight: 600;
  font-size: 13px;
  line-height: 1.2;
  color: white;
}

.download-value {
  animation: pulse-download 2s infinite;
}

.upload-value {
  animation: pulse-upload 3s infinite;
}

@keyframes pulse-download {
  0%, 100% { color: rgba(33, 150, 243, 1); }
  50% { color: rgba(33, 150, 243, 0.7); }
}

@keyframes pulse-upload {
  0%, 100% { color: rgba(244, 67, 54, 1); }
  50% { color: rgba(244, 67, 54, 0.7); }
}

.info-section {
  padding: 1rem;
  flex-shrink: 0;
  height: 180px;
  display: flex;
  flex-direction: column;
}

.info-section h3 {
  margin: 0 0 0.5rem;
  font-size: 1.1rem;
  color: #2c3e50;
}

.info-section p {
  margin: 0 0 1rem;
  font-size: 0.9rem;
  color: #666;
  line-height: 1.4;
  flex: 1;
  min-height: 40px;
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1rem;
  min-height: 28px;
}

.tag {
  padding: 0.25rem 0.75rem;
  background: var(--primary-color-light, #ecf5ff);
  border: 1px solid var(--primary-color-light-2, #d9ecff);
  color: var(--primary-color, #409eff);
  border-radius: 12px;
  font-size: 0.8rem;
  transition: all 0.3s;
}

.tag:nth-child(2) {
  background: #fdf6ec;
  border-color: #faecd8;
  color: #e6a23c;
}

.tag:nth-child(3) {
  background: #f0f9eb;
  border-color: #e1f3d8;
  color: #67c23a;
}

.apply-badges {
  position: absolute;
  top: 12px;
  right: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  z-index: 1;
  pointer-events: none;
}

.status-badge {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border: none;
  backdrop-filter: blur(8px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.fixed-badge {
  background: rgba(64, 158, 255, 0.9);
  color: #fff;
}

.free-badge {
  background: rgba(103, 194, 58, 0.9);
  color: #fff;
}

.author {
  margin-top: auto;
  padding-top: 0.75rem;
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  border-top: 1px dashed #ebeef5;
  font-size: 0.8rem;
  color: #909399;
}

.author-tag {
  position: relative;
  padding-left: 16px;
  color: inherit;
  white-space: nowrap;
}

.author-tag:first-child::before {
  content: "";
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 12px;
  height: 12px;
  background: #ff9999;
  border-radius: 50%;
  opacity: 0.7;
}

.author-tag:last-child::before {
  content: "";
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 12px;
  height: 12px;
  background: #67c23a;
  border-radius: 50%;
  opacity: 0.7;
}

/* Helper独占标签样式 */
.helper-badge {
  position: absolute;
  top: 0;
  right: 0;
  z-index: 2;
}

.badge-content {
  position: relative;
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 16px;
  background: white;
  color: #2980b9;
  font-size: 12px;
  font-weight: 500;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  clip-path: polygon(0 0, 100% 0, 100% 100%, 8px 100%);
}

.badge-corner {
  position: absolute;
  right: 0;
  bottom: -8px;
  width: 8px;
  height: 8px;
  background: #e2e8f0;
  clip-path: polygon(0 0, 100% 0, 100% 100%);
}

.badge-content .el-icon {
  font-size: 14px;
  color: #f39c12;
}
</style> 