<template>
  <div class="widget-card" @click="$emit('click')">
    <div class="third-party-badge">
      <div class="badge-content">
        <el-icon><Link /></el-icon>
        第三方组件库
      </div>
      <div class="badge-corner"></div>
    </div>
    
    <div class="preview-section">
      <div class="preview-area">
        <div class="widgets-preview">
          <img src="https://www.widgets.link/favicon.svg" alt="Logo" class="logo">
          <div class="widgets-grid">
            <div class="widget-item">⏰</div>
            <div class="widget-item">🌤</div>
            <div class="widget-item">📅</div>
            <div class="widget-item">📊</div>
            <div class="widget-item">🎵</div>
            <div class="widget-item">📝</div>
          </div>
        </div>
      </div>
    </div>

    <div class="info-section">
      <h3>轻轻小组件</h3>
      <p>海量精美组件，在线调参，一键获取链接使用</p>
      <div class="tags">
        <span class="tag">组件库</span>
        <span class="tag">可定制</span>
        <span class="tag">即用即得</span>
      </div>
      <div class="author">
        <span class="author-tag">作者：轻轻小组件</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Link } from '@element-plus/icons-vue'
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
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
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
  position: relative;
  z-index: 1;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.widgets-preview {
  text-align: center;
}

.logo {
  width: 48px;
  height: 48px;
  margin-bottom: 16px;
  filter: drop-shadow(0 0 12px rgba(255,255,255,0.3));
  animation: float 3s ease-in-out infinite;
}

.widgets-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  max-width: 200px;
  margin: 0 auto;
}

.widget-item {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(4px);
  border-radius: 8px;
  padding: 8px;
  font-size: 20px;
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
}

.widget-item:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: scale(1.05);
}

.third-party-badge {
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
  color: #6366f1;
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
  color: #6366f1;
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-6px); }
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
</style> 