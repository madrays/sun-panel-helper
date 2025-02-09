<template>
  <div class="preview-container">
    <div class="preview-content">
      <!-- 模拟网页内容 -->
      <div class="mock-content">
        <!-- 顶部导航 -->
        <div class="mock-header">
          <div class="mock-logo">Sun-Panel</div>
          <div class="mock-nav">
            <div class="nav-item"></div>
            <div class="nav-item"></div>
            <div class="nav-item"></div>
          </div>
        </div>

        <!-- 内容区域 -->
        <div class="mock-body">
          <!-- 左侧菜单 -->
          <div class="mock-sidebar">
            <div class="mock-menu-item active"></div>
            <div class="mock-menu-item"></div>
            <div class="mock-menu-item"></div>
          </div>

          <!-- 右侧内容 -->
          <div class="mock-content-area">
            <div class="mock-card">
              <div class="mock-card-header">
                <div class="mock-title"></div>
                <div class="mock-actions">
                  <div class="mock-btn"></div>
                  <div class="mock-btn"></div>
                </div>
              </div>
              <div class="mock-card-content">
                <div class="mock-line"></div>
                <div class="mock-line short"></div>
                <div class="mock-line"></div>
              </div>
            </div>
            <div class="mock-card">
              <div class="mock-card-header">
                <div class="mock-title"></div>
                <div class="mock-actions">
                  <div class="mock-btn"></div>
                </div>
              </div>
              <div class="mock-card-content">
                <div class="mock-line"></div>
                <div class="mock-line"></div>
                <div class="mock-line short"></div>
              </div>
            </div>
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

    <div class="preview-note">
      <el-alert type="info" :closable="false" show-icon>
        预览效果仅供参考，实际显示效果会根据网站布局自动调整
      </el-alert>
    </div>
  </div>
</template>

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
  position: relative;
}

/* 顶部导航 */
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

/* 内容区域 */
.mock-body {
  flex: 1;
  display: grid;
  grid-template-columns: 200px 1fr;
  gap: 20px;
  margin-top: 20px;
}

.mock-sidebar {
  background: white;
  border-radius: 8px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.mock-menu-item {
  height: 32px;
  background: #f5f7fa;
  border-radius: 6px;
  transition: all 0.3s;
}

.mock-menu-item.active {
  background: var(--el-color-primary-light-9);
  position: relative;
}

.mock-menu-item.active::before {
  content: '';
  position: absolute;
  left: -16px;
  top: 0;
  width: 4px;
  height: 100%;
  background: var(--el-color-primary);
  border-radius: 0 2px 2px 0;
}

.mock-content-area {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

.mock-card {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0,0,0,0.05);
}

.mock-card-header {
  height: 48px;
  padding: 0 16px;
  background: #fff;
  border-bottom: 1px solid #ebeef5;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.mock-title {
  width: 100px;
  height: 8px;
  background: #e4e7ed;
  border-radius: 4px;
}

.mock-actions {
  display: flex;
  gap: 8px;
}

.mock-btn {
  width: 24px;
  height: 24px;
  background: #f5f7fa;
  border-radius: 4px;
}

.mock-card-content {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.mock-line {
  height: 12px;
  background: #f5f7fa;
  border-radius: 6px;
  width: 100%;
}

.mock-line.short {
  width: 60%;
}

/* 登录按钮 */
.fixed-element {
  position: absolute;
  right: 20px;
  top: 20px;
  background: rgba(42, 42, 42, 0.42);
  border-radius: 8px;
  padding: 2px;
  display: flex;
  backdrop-filter: blur(2px);
  box-shadow: 0 0 10px 2px rgba(0, 0, 0, 0.2);
  animation: fadeIn 0.5s ease-out;
}

.float-btn {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  cursor: pointer;
  transition: all 0.3s;
}

.float-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 6px;
}

.svg-icon {
  width: 1.2em;
  height: 1.2em;
  fill: currentColor;
}

/* 隐藏效果动画 */
.hide-effect {
  position: absolute;
  right: 20px;
  top: 20px;
  width: 80px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
}

.hide-circle {
  position: absolute;
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: rgba(245, 108, 108, 0.1);
  animation: pulseCircle 2s infinite;
}

.hide-line {
  position: absolute;
  width: 48px;
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

.preview-note {
  flex-shrink: 0;
}
</style> 