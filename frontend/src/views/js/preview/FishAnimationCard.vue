<template>
  <div class="widget-card" @click="$emit('click')">
    <div class="deploy-badge" v-if="isDeployed">已部署</div>
    
    <div class="preview-section">
      <div class="preview-area">
        <div class="fish-preview">
          <div class="water-surface"></div>
          <div class="fish fish-1"></div>
          <div class="fish fish-2"></div>
          <div class="fish fish-3"></div>
          <div class="bubble bubble-1"></div>
          <div class="bubble bubble-2"></div>
          <div class="bubble bubble-3"></div>
        </div>
      </div>
    </div>

    <div class="info-section">
      <h3>鱼群动画</h3>
      <p>为面板添加底部鱼群动画效果，支持交互和自动游动</p>
      <div class="tags">
        <span class="tag">动画</span>
        <span class="tag">交互</span>
        <span class="tag">装饰</span>
      </div>
      <div class="author">
        <span class="author-tag">作者：madrays</span>
        <span class="author-tag">优化适配：madrays</span>
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

.fish-preview {
  width: 100%;
  height: 115px;
  background: linear-gradient(180deg, #e3f2fd 0%, #bbdefb 100%);
  border-radius: 8px;
  position: relative;
  overflow: hidden;
}

.water-surface {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 20px;
  background: rgba(255,255,255,0.3);
  animation: wave 3s ease-in-out infinite;
}

.fish {
  position: absolute;
  width: 30px;
  height: 15px;
  background: #1976d2;
  border-radius: 50%;
  transform-origin: 70% center;
}

.fish::before {
  content: '';
  position: absolute;
  right: -8px;
  top: 50%;
  transform: translateY(-50%);
  border-left: 15px solid #1976d2;
  border-top: 6px solid transparent;
  border-bottom: 6px solid transparent;
}

.fish-1 {
  top: 30%;
  left: 20%;
  animation: swim1 15s linear infinite;
}

.fish-2 {
  top: 50%;
  left: 40%;
  animation: swim2 12s linear infinite;
}

.fish-3 {
  top: 70%;
  left: 60%;
  animation: swim3 10s linear infinite;
}

.bubble {
  position: absolute;
  background: rgba(255,255,255,0.5);
  border-radius: 50%;
  animation: float 4s ease-in infinite;
}

.bubble-1 {
  width: 10px;
  height: 10px;
  left: 20%;
  bottom: 0;
}

.bubble-2 {
  width: 8px;
  height: 8px;
  left: 50%;
  bottom: 0;
  animation-delay: 1s;
}

.bubble-3 {
  width: 12px;
  height: 12px;
  left: 80%;
  bottom: 0;
  animation-delay: 2s;
}

.info-section {
  padding: 1.25rem;
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

@keyframes wave {
  0%, 100% { transform: translateY(-5px); }
  50% { transform: translateY(5px); }
}

@keyframes swim1 {
  from { transform: translateX(0) rotate(0deg); }
  to { transform: translateX(300px) rotate(10deg); }
}

@keyframes swim2 {
  from { transform: translateX(-100px) rotate(-5deg); }
  to { transform: translateX(400px) rotate(5deg); }
}

@keyframes swim3 {
  from { transform: translateX(-200px) rotate(5deg); }
  to { transform: translateX(300px) rotate(-5deg); }
}

@keyframes float {
  0% { transform: translateY(0); opacity: 0; }
  50% { opacity: 1; }
  100% { transform: translateY(-100px); opacity: 0; }
}
</style> 