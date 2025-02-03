<template>
  <div class="widget-card" data-widget-id="card-hover" @click="$emit('click')">
    <div class="deploy-badge" v-if="isDeployed">已部署</div>
    
    <div class="preview-section">
      <div class="preview-area">
        <div class="item-card">
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
      <h3>卡片悬停动画</h3>
      <p>为卡片添加悬停时的晃动和放大效果，支持自定义晃动角度、速度和放大倍数</p>
      <div class="tags">
        <span class="tag">动画</span>
        <span class="tag">交互</span>
        <span class="tag">悬停</span>
        <span class="tag">晃动</span>
      </div>
      <div class="author">
        <span class="author-tag">作者：与末</span>
        <span class="author-tag">优化适配：madrays</span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CardHoverCard',
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
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 1;
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
  transform-origin: center center;
  animation: 
    previewScale 4s infinite,
    previewShake 4s 0.2s infinite ease-in-out;
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

.tag:nth-child(4) {
  background: #f5f7fa;
  border-color: #e4e7ed;
  color: #909399;
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
