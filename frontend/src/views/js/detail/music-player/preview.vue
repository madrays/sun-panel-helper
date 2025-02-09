<template>
  <div class="preview-container">
    <div class="preview-content">
      <!-- 模拟网页内容 -->
      <div class="mock-content">
        <div class="mock-header">
          <div class="mock-logo">Sun-Panel</div>
          <div class="mock-nav">
            <div class="nav-item"></div>
            <div class="nav-item"></div>
            <div class="nav-item"></div>
          </div>
        </div>
        <div class="mock-body">
          <div class="mock-card"></div>
          <div class="mock-card"></div>
          <div class="mock-card"></div>
        </div>
      </div>

      <!-- 音乐播放器预览 -->
      <div 
        class="music-player"
        :class="params.position"
      >
        <div class="player-header">
          <i class="el-icon-headset"></i>
          <span>MYHK音乐</span>
        </div>
        <div class="player-content">
          <div class="cover">
            <div class="cover-inner">
              <i class="el-icon-headset"></i>
            </div>
          </div>
          <div class="info">
            <div class="title">正在播放的音乐</div>
            <div class="artist">演唱者</div>
            <div class="controls">
              <i class="el-icon-arrow-left"></i>
              <i class="el-icon-video-play"></i>
              <i class="el-icon-arrow-right"></i>
            </div>
          </div>
        </div>
      </div>

      <!-- 位置指示器 -->
      <div class="position-indicators">
        <div 
          v-for="pos in positions" 
          :key="pos"
          class="indicator"
          :class="[pos, { active: isPositionActive(pos) }]"
        ></div>
      </div>
    </div>

    <div class="preview-note">
      <el-alert
        type="info"
        :closable="false"
        show-icon
      >
        预览效果仅供参考，实际显示效果会根据网站布局自动调整
      </el-alert>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { MusicPlayerConfig } from '@/types/js/music-player';

const props = defineProps<{
  params: MusicPlayerConfig
}>();

const positions = ['left', 'right'];

// 判断当前位置是否激活
const isPositionActive = (position: string) => {
  return props.params.position === position;
};
</script>

<style scoped>
.preview-container {
  height: 100%;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.preview-content {
  height: 600px;
  background: white;
  border-radius: 8px;
  position: relative;
  overflow: hidden;
  border: 1px solid #dcdfe6;
}

.mock-content {
  height: 100%;
  background: #f5f7fa;
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 20px;
}

.mock-header {
  height: 60px;
  background: white;
  border-radius: 8px;
  padding: 0 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 2px 12px rgba(0,0,0,0.05);
}

.mock-logo {
  font-size: 20px;
  font-weight: bold;
  color: var(--el-color-primary);
}

.mock-nav {
  display: flex;
  gap: 16px;
}

.nav-item {
  width: 40px;
  height: 8px;
  background: #e4e7ed;
  border-radius: 4px;
}

.mock-body {
  flex: 1;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  padding: 20px;
}

.mock-card {
  height: 200px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.05);
}

.music-player {
  position: absolute;
  width: 240px;
  height: 100px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.1);
  overflow: hidden;
  transition: all 0.3s ease;
}

.music-player.left {
  left: 20px;
  bottom: 20px;
}

.music-player.right {
  right: 20px;
  bottom: 20px;
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
  display: flex;
  align-items: center;
  gap: 12px;
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
  gap: 4px;
}

.title {
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

.position-indicators {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.indicator {
  position: absolute;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #909399;
  opacity: 0.3;
}

.indicator.active {
  background: var(--el-color-primary);
  opacity: 1;
}

.indicator.left { left: 12px; bottom: 20px; }
.indicator.right { right: 12px; bottom: 20px; }

@keyframes pulse {
  0%, 100% { opacity: 0.7; transform: scale(0.95); }
  50% { opacity: 1; transform: scale(1.05); }
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.preview-note {
  flex-shrink: 0;
}
</style> 