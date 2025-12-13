<template>
  <div class="widget-card" data-widget-id="hide-login" @click="$emit('click')">
    <!-- 部署状态标签 -->
    <div class="deploy-badge" v-if="isDeployed">已部署</div>
    
    <!-- 预览区域 -->
    <div class="preview-section">
      <div class="preview-area">
        <div class="preview-container">
          <!-- 模拟网页内容 -->
          <div class="mock-header">
            <div class="mock-logo">Sun-Panel</div>
            <div class="mock-nav">
              <div class="nav-item"></div>
              <div class="nav-item"></div>
            </div>
          </div>

          <!-- 登录按钮 -->
          <div class="fixed-element">
            <div class="float-btn" title="前往登录">
              <svg class="svg-icon" aria-hidden="true">
                <use href="#ph--user-switch-bold"></use>
              </svg>
            </div>
            <div class="float-btn">
              <svg class="svg-icon" aria-hidden="true">
                <use href="#majesticons-applications"></use>
              </svg>
            </div>
          </div>

          <!-- 隐藏效果动画 -->
          <div class="hide-effect">
            <div class="hide-circle"></div>
            <div class="hide-line"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- 信息区域 -->
    <div class="info-section">
      <h3>隐藏登录按钮</h3>
      <p>在公开模式下隐藏登录按钮，需要手动添加 /login 进入登录页面</p>
      <div class="tags">
        <span class="tag">安全</span>
        <span class="tag">公开模式</span>
        <span class="tag">无配置</span>
      </div>
      <div class="author">
        <span class="author-tag">作者：<a href="https://ym01.cn" target="_blank" class="author-tag">与末</a></span>
        <span class="author-tag">优化适配：madrays</span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'HideLoginCard',
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
/* 卡片容器样式保持一致 */
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

/* 模拟网页内容 */
.mock-header {
  height: 40px;
  background: white;
  border-radius: 6px;
  padding: 0 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  margin-bottom: 12px;
}

.mock-logo {
  width: 80px;
  height: 8px;
  background: #e4e7ed;
  border-radius: 4px;
}

.mock-nav {
  display: flex;
  gap: 12px;
}

.nav-item {
  width: 30px;
  height: 6px;
  background: #e4e7ed;
  border-radius: 3px;
}

/* 登录按钮 */
.fixed-element {
  position: absolute;
  right: 12px;
  top: 12px;
  background: rgba(42, 42, 42, 0.42);
  border-radius: 6px;
  padding: 2px;
  display: flex;
  backdrop-filter: blur(2px);
  box-shadow: 0 0 10px 2px rgba(0, 0, 0, 0.2);
  animation: fadeIn 0.5s ease-out;
}

.float-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  cursor: pointer;
  transition: all 0.3s;
}

.float-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
}

.svg-icon {
  width: 1.2em;
  height: 1.2em;
  fill: currentColor;
}

/* 隐藏效果动画 */
.hide-effect {
  position: absolute;
  right: 12px;
  top: 12px;
  width: 64px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
}

.hide-circle {
  position: absolute;
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: rgba(245, 108, 108, 0.1);
  animation: pulseCircle 2s infinite;
}

.hide-line {
  position: absolute;
  width: 40px;
  height: 4px;
  background: #f56c6c;
  border-radius: 2px;
  transform: rotate(45deg);
  animation: pulseLine 2s infinite;
}

.hide-line::after {
  content: '';
  position: absolute;
  width: 100%;
  height: 100%;
  background: inherit;
  border-radius: inherit;
  transform: rotate(90deg);
}

@keyframes pulseCircle {
  0% { transform: scale(0.8); opacity: 0.3; }
  50% { transform: scale(1.2); opacity: 0.6; }
  100% { transform: scale(0.8); opacity: 0.3; }
}

@keyframes pulseLine {
  0% { transform: rotate(45deg) scale(0.8); opacity: 0.5; }
  50% { transform: rotate(45deg) scale(1.1); opacity: 0.8; }
  100% { transform: rotate(45deg) scale(0.8); opacity: 0.5; }
}

/* 其他样式保持一致 */
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

.author-tag a {
  color: inherit;
  text-decoration: none;
  transition: color 0.3s;
}

.author-tag a:hover {
  color: #f56c6c;
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
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style> 