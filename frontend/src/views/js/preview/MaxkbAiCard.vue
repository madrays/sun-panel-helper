<template>
  <div class="widget-card" data-widget-id="maxkb-ai" @click="$emit('click')">
    <!-- 部署状态标签 -->
    <div class="deploy-badge" v-if="isDeployed">已部署</div>
    
    <!-- 预览区域 -->
    <div class="preview-section">
      <div class="preview-area">
        <div class="preview-container">
          <!-- 模拟聊天窗口 -->
          <div class="chat-window">
            <div class="chat-header">
              <div class="header-title">MaxKB AI助手</div>
              <div class="header-buttons">
                <span class="btn">□</span>
                <span class="btn">×</span>
              </div>
            </div>
            <div class="chat-content">
              <div class="message">
                <div class="avatar">AI</div>
                <div class="text">您好！我是MaxKB AI助手，有什么可以帮您？</div>
              </div>
            </div>
          </div>
          <!-- 模拟悬浮按钮 -->
          <div class="float-button">
            <img src="@/assets/logo.gif" alt="AI助手">
          </div>
        </div>
      </div>
    </div>

    <!-- 信息区域 -->
    <div class="info-section">
      <h3>MaxKB AI助手</h3>
      <p>集成MaxKB聊天窗口，支持自定义样式和位置</p>
      <div class="tags">
        <span class="tag">AI助手</span>
        <span class="tag">聊天窗口</span>
        <span class="tag">MaxKB</span>
        <span class="tag">自定义</span>
      </div>
      <div class="author">
        <span class="author-tag">作者：madrays</span>
        <span class="author-tag">优化适配：madrays</span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'MaxkbAiCard',
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
  height: 160px;  /* 固定预览区域高度 */
}

.preview-area {
  width: 280px;  /* 固定预览区域宽度 */
  height: 140px;  /* 固定预览区域高度 */
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
}

/* 聊天窗口样式 */
.chat-window {
  position: absolute;
  right: 16px;
  bottom: 16px;
  width: 160px;  /* 缩小聊天窗口尺寸 */
  height: 120px;  /* 缩小聊天窗口尺寸 */
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.1);
  display: flex;
  flex-direction: column;
  animation: slideIn 0.5s ease-out;
}

.chat-header {
  height: 24px;  /* 缩小头部高度 */
  background: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 8px;
  border-radius: 8px 8px 0 0;
}

.header-title {
  font-size: 11px;
  color: #666;
}

.header-buttons {
  display: flex;
  gap: 6px;
}

.btn {
  font-size: 10px;
  color: #999;
  cursor: pointer;
}

.chat-content {
  flex: 1;
  padding: 8px;
  overflow: hidden;
}

.message {
  display: flex;
  gap: 6px;
  margin-bottom: 6px;
  animation: fadeIn 0.5s ease-out 0.3s both;
}

.avatar {
  width: 20px;
  height: 20px;
  background: #409eff;
  color: white;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
}

.text {
  background: #f5f5f5;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 10px;
  color: #666;
  max-width: 70%;
}

/* 悬浮按钮样式 */
.float-button {
  position: absolute;
  right: 8px;
  bottom: 8px;
  width: 32px;  /* 缩小按钮尺寸 */
  height: 32px;  /* 缩小按钮尺寸 */
  border-radius: 16px;
  overflow: hidden;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  transition: transform 0.3s;
  animation: bounce 2s infinite;
}

.float-button:hover {
  transform: scale(1.1);
}

.float-button img {
  width: 100%;
  height: 100%;
  object-fit: cover;
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
  background: var(--primary-color-light, #ecf5ff);
  border: 1px solid var(--primary-color-light-2, #d9ecff);
  color: var(--primary-color, #409eff);
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

/* 部署状态标签 */
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

/* 动画效果 */
@keyframes slideIn {
  from {
    transform: translateY(100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes bounce {
  0%, 20%, 50%, 80%, 100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-10px);
  }
  60% {
    transform: translateY(-5px);
  }
}
</style> 