<template>
  <div class="widget-card" :data-widget-id="widget.id" @click="$emit('click')">
    <div class="deploy-badge" v-if="isDeployed">已部署</div>
    
    <div class="preview-section">
      <div class="preview-area">
        <!-- 渐变背景预览 -->
        <div v-if="widget.id === 'gradientBg'" class="browser-preview">
          <div class="browser-header">
            <div class="browser-buttons">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
          <div class="browser-content">
            <!-- 自动播放的渐变背景预览 -->
          </div>
        </div>
        
        <!-- 鼠标指针卡片预览 -->
        <div v-if="widget.id === 'mouseCursor'" class="cursor-card">
          <div class="cursor-icons">
            <img class="default-cursor" :src="widget.params[0].default" alt="默认指针">
            <i class="fas fa-arrow-right"></i>
            <img class="hover-cursor" :src="widget.params[1].default" alt="悬浮指针">
          </div>
          <div class="cursor-info">
            <h3>自定义鼠标</h3>
            <p>个性化指针样式</p>
          </div>
        </div>
        
        <!-- 原有的卡片预览 -->
        <div v-else-if="['xiantiao', 'cardHover'].includes(widget.id)" class="item-card">
          <div class="item-card-content">
            <div class="github-icon">
              <svg viewBox="0 0 24 24" width="24" height="24">
                <path fill="currentColor" d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
              </svg>
            </div>
            <div class="app-icon-info-text-box">
              <div class="app-icon-info-text-box-title">
                <span>App</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="info-section">
      <h3>{{ widget.name }}</h3>
      <p>{{ widget.description }}</p>
      <div class="tags">
        <span v-for="tag in widget.tags" :key="tag" class="tag">{{ tag }}</span>
      </div>
    </div>
  </div>
</template>

<script>
import { API_BASE_URL } from '../config'

export default {
  name: 'WidgetCard',
  props: {
    widget: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      isDeployed: false
    }
  },
  async created() {
    // 检查部署状态
    try {
      const response = await fetch(`${API_BASE_URL}/api/widgets/${this.widget.id}/deployed`)
      const data = await response.json()
      this.isDeployed = data.deployed
    } catch (error) {
      console.error('Error checking deploy status:', error)
    }
  }
}
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
}

.widget-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.12);
}

.preview-section {
  padding: 1.5rem;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.preview-area {
  width: 100%;
  display: flex;
  justify-content: center;
}

.item-card {
  width: 220px;
  height: 60px;
  padding: 8px 12px;
  background: white;
  border-radius: 12px;
  position: relative;
  overflow: hidden;
}

.item-card-content {
  height: 100%;
  display: flex;
  align-items: center;
  gap: 1rem;
  position: relative;
  z-index: 1;
}

.github-icon {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f6f8fa;
  border-radius: 6px;
  padding: 5px;
  color: #24292f;
  flex-shrink: 0;
}

.github-icon svg {
  width: 100%;
  height: 100%;
}

.app-icon-info-text-box {
  flex: 1;
  min-width: 0;
}

.app-icon-info-text-box-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #333;
  padding: 0.25rem 0;
  position: relative;
}

.app-icon-info-text-box-title::before {
  content: "";
  position: absolute;
  width: 93px;
  height: 93px;
  border-radius: 60%;
  background: #efcece2f;
  box-shadow: -8px 21px 0 #ceefe132;
  z-index: -1;
  right: -27px;
  top: -35px;
  pointer-events: none;
}

.app-icon-info-text-box-title::after {
  content: "";
  position: absolute;
  width: 40px;
  height: 40px;
  border: 4px solid #ebece342;
  border-radius: 70%;
  z-index: -1;
  top: -19px;
  right: 48px;
  pointer-events: none;
}

.info-section {
  padding: 1rem;
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
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.tag {
  padding: 0.25rem 0.75rem;
  background: #f0f2f5;
  border-radius: 12px;
  font-size: 0.8rem;
  color: #666;
}

/* 浏览器预览样式 */
.browser-preview {
  width: 220px;
  height: 140px;
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.browser-header {
  height: 24px;
  background: #f1f3f4;
  display: flex;
  align-items: center;
  padding: 0 8px;
}

.browser-buttons {
  display: flex;
  gap: 4px;
}

.browser-buttons span {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #ff5f57;
}

.browser-buttons span:nth-child(2) {
  background: #ffbd2e;
}

.browser-buttons span:nth-child(3) {
  background: #28c940;
}

.browser-content {
  height: calc(100% - 24px);
  background: linear-gradient(45deg, #2C3E50, #2980B9, #8E44AD, #E74C3C);
  background-size: 400% 400%;
  animation: previewGradient 8s ease-in-out infinite;
}

@keyframes previewGradient {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

/* 卡片悬停动画的预览效果 - 只对特定卡片生效 */
.widget-card[data-widget-id="cardHover"] :deep(.item-card) {
  transform-origin: center center;
  animation: 
    previewScale 4s infinite,
    previewShake 4s 0.2s infinite ease-in-out;
}

@keyframes previewScale {
  0%, 100% {
    transform: scale(1);
  }
  5%, 25% {
    transform: scale(1.05);
  }
  30% {
    transform: scale(1);
  }
}

@keyframes previewShake {
  0%, 100% {
    transform: scale(1) rotate(0);
  }
  5% {
    transform: scale(1.05) rotate(0);
  }
  10% {
    transform: scale(1.05) rotate(10deg);
  }
  15% {
    transform: scale(1.05) rotate(-10deg);
  }
  20% {
    transform: scale(1.05) rotate(2.5deg);
  }
  25% {
    transform: scale(1.05) rotate(-2.5deg);
  }
  30% {
    transform: scale(1) rotate(0);
  }
}

.deploy-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  background: var(--primary-color, #409eff);
  color: white;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
  z-index: 10;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

/* 鼠标指针卡片样式 */
.cursor-card {
  width: 220px;
  height: 140px;
  background: white;
  border-radius: 12px;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

.cursor-icons {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.cursor-icons img {
  width: 32px;
  height: 32px;
  object-fit: contain;
}

.cursor-icons i {
  color: #666;
  font-size: 1rem;
}

.cursor-info {
  text-align: center;
}

.cursor-info h3 {
  font-size: 1.1rem;
  color: #333;
  margin: 0;
}

.cursor-info p {
  font-size: 0.9rem;
  color: #666;
  margin: 0.5rem 0 0;
}
</style> 