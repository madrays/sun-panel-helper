<template>
  <div class="widget-card" data-widget-id="music-player" @click="$emit('click')">
    <!-- 部署状态标签 -->
    <div class="deploy-badge" v-if="isDeployed">已部署</div>
    
    <!-- 预览区域 -->
    <div class="preview-section">
      <div class="preview-area">
        <div class="preview-container">
          <!-- 模拟音乐播放器 -->
          <div class="music-player">
            <div class="player-header">
              <i class="el-icon-headset"></i>
              <span>MYHK音乐</span>
            </div>
            <div class="player-content">
              <div class="player-row">
                <div class="cover">
                  <div class="cover-inner">
                    <i class="el-icon-headset"></i>
                  </div>
                </div>
                <div class="info">
                  <div class="song">正在播放的音乐</div>
                  <div class="artist">演唱者</div>
                  <div class="controls">
                    <i class="el-icon-arrow-left"></i>
                    <i class="el-icon-video-play"></i>
                    <i class="el-icon-arrow-right"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 信息区域 -->
    <div class="info-section">
      <h3>音乐播放器</h3>
      <p>优雅的MYHK音乐播放器，支持自定义播放列表</p>
      <div class="tags">
        <span class="tag">音乐播放</span>
        <span class="tag">MYHK</span>
        <span class="tag">自定义</span>
      </div>
      <div class="author">
        <span class="author-tag">作者：MYHK/与末</span>
        <span class="author-tag">优化适配：madrays</span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'MusicPlayerCard',
  props: {
    isDeployed: {
      type: Boolean,
      default: false
    }
  },
  emits: ['click']
}
</script>

<style scoped>
/* 卡片容器 */
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

/* 预览区域 */
.preview-section {
  padding: 1.5rem;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  height: 160px;
}

.preview-area {
  width: 280px;
  height: 140px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.preview-container {
  position: relative;
  width: 100%;
  height: 100%;
  background: #f5f7fa;
  border-radius: 8px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 音乐播放器样式 */
.music-player {
  width: 240px;
  height: 100px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.1);
  overflow: hidden;
  animation: slideIn 0.5s ease-out;
}

.player-header {
  height: 24px;
  padding: 0 12px;
  background: var(--el-color-primary);
  color: white;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
}

.player-content {
  padding: 8px;
  height: calc(100% - 24px);
}

.player-row {
  display: flex;
  gap: 12px;
  height: 100%;
}

.cover {
  width: 60px;
  height: 60px;
  flex-shrink: 0;
  border-radius: 50%;
  overflow: hidden;
  animation: rotate 6s linear infinite;
  background: linear-gradient(45deg, var(--el-color-primary) 0%, var(--el-color-primary-light-3) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(64,158,255,0.2);
}

.cover-inner {
  width: 90%;
  height: 90%;
  border-radius: 50%;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
}

.cover-inner i {
  font-size: 24px;
  color: var(--el-color-primary);
  animation: pulse 2s ease-in-out infinite;
}

.info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 4px;
}

.song {
  font-size: 13px;
  font-weight: bold;
  color: #303133;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.artist {
  font-size: 12px;
  color: #909399;
}

.controls {
  display: flex;
  gap: 16px;
  margin-top: 4px;
  color: var(--el-color-primary);
  font-size: 16px;
}

.controls i {
  cursor: pointer;
  transition: all 0.3s;
}

.controls i:hover {
  transform: scale(1.2);
}

/* 部署状态标签 */
.deploy-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  background: #409EFF;
  color: white;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
  z-index: 10;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

/* 信息区域 */
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

/* 标签样式 */
.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1rem;
  min-height: 28px;
}

.tag {
  padding: 0.25rem 0.75rem;
  background: #ecf5ff;
  border: 1px solid #d9ecff;
  color: #409EFF;
  border-radius: 12px;
  font-size: 0.8rem;
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

.tag:nth-child(4) {
  background: #f5f7fa;
  border-color: #e4e7ed;
  color: #909399;
}

/* 作者信息 */
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

/* 动画效果 */
@keyframes pulse {
  0%, 100% { opacity: 0.7; transform: scale(0.95); }
  50% { opacity: 1; transform: scale(1.05); }
}

@keyframes slideIn {
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style> 