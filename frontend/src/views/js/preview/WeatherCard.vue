<template>
  <div class="widget-card" data-widget-id="weather" @click="$emit('click')">
    <!-- 部署状态标签 -->
    <div class="deploy-badge" v-if="isDeployed">已部署</div>
    
    <!-- 预览区域 -->
    <div class="preview-section">
      <div class="preview-area">
        <div class="weather-preview">
          <!-- 模拟天气卡片 -->
          <div class="weather-scene">
            <div class="sun"></div>
            <div class="cloud"></div>
            <div class="temp-tag">26°C</div>
            <div class="forecast-dots">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 信息区域 -->
    <div class="info-section">
      <h3>智能天气助手</h3>
      <p>多源数据融合的AI智能天气助手</p>
      <div class="tags">
        <span class="tag">天气预报</span>
        <span class="tag">AI建议</span>
        <span class="tag">自动定位</span>
      </div>
      <div class="author">
        <span class="author-tag">作者：დ✎﹏浮生๓</span>
        <span class="author-tag">适配：madrays</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  isDeployed: boolean
}>()

defineEmits<{
  (e: 'click'): void
}>()
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
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.weather-preview {
  position: relative;
  width: 140px;
  height: 100px;
}

/* 天气场景 */
.weather-scene {
  position: relative;
  width: 100%;
  height: 100%;
  background: linear-gradient(to bottom, #4facfe 0%, #00f2fe 100%);
  border-radius: 12px;
  box-shadow: 0 8px 16px rgba(0,0,0,0.1);
  overflow: hidden;
}

.sun {
  position: absolute;
  top: -10px;
  right: -10px;
  width: 50px;
  height: 50px;
  background: #ffeb3b;
  border-radius: 50%;
  box-shadow: 0 0 20px rgba(255, 235, 59, 0.6);
  animation: sunPulse 3s infinite alternate;
}

.cloud {
  position: absolute;
  top: 40px;
  left: 20px;
  width: 60px;
  height: 25px;
  background: #fff;
  border-radius: 20px;
  opacity: 0.9;
  animation: cloudFloat 4s ease-in-out infinite;
}

.cloud::after {
  content: '';
  position: absolute;
  top: -15px;
  left: 10px;
  width: 25px;
  height: 25px;
  background: #fff;
  border-radius: 50%;
}

.temp-tag {
  position: absolute;
  bottom: 15px;
  left: 15px;
  font-size: 24px;
  font-weight: bold;
  color: white;
  text-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.forecast-dots {
  position: absolute;
  bottom: 15px;
  right: 15px;
  display: flex;
  gap: 4px;
}

.forecast-dots span {
  width: 6px;
  height: 6px;
  background: rgba(255,255,255,0.6);
  border-radius: 50%;
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
@keyframes sunPulse {
  from { transform: scale(1); opacity: 0.9; }
  to { transform: scale(1.1); opacity: 1; }
}

@keyframes cloudFloat {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-5px); }
}
</style>
