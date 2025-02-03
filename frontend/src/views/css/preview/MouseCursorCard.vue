<template>
  <div class="widget-card" @click="$emit('click')">
    <div class="deploy-badge" v-if="isDeployed">已部署</div>
    
    <div class="preview-section">
      <div class="preview-area">
        <div class="cursor-preview">
          <div class="cursor-box default">
            <span>默认指针</span>
            <img src="https://img.hi-linux.com/staticfile/P1i7yA-2024-04-26-hZZjUZ.png" alt="默认指针" class="cursor-img" />
          </div>
          <div class="cursor-box hover">
            <span>悬浮指针</span>
            <img src="https://img.hi-linux.com/staticfile/hVX0Sf-2024-04-26-INwMSQ.png" alt="悬浮指针" class="cursor-img" />
          </div>
        </div>
      </div>
    </div>

    <div class="info-section">
      <h3>自定义鼠标指针</h3>
      <p>为页面添加个性化的鼠标指针样式</p>
      <div class="tags">
        <span class="tag">鼠标</span>
        <span class="tag">指针</span>
        <span class="tag">交互</span>
      </div>
      <div class="author">
        <span class="author-tag">作者：与末</span>
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

.cursor-preview {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  width: 100%;
}

.cursor-box {
  height: 120px;
  border-radius: 12px;
  background: white;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  font-size: 0.9rem;
  color: #666;
  transition: all 0.3s;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  padding: 12px;
}

.cursor-box.default {
  cursor: url('https://img.hi-linux.com/staticfile/P1i7yA-2024-04-26-hZZjUZ.png'), default;
}

.cursor-box.hover {
  cursor: url('https://img.hi-linux.com/staticfile/hVX0Sf-2024-04-26-INwMSQ.png'), pointer;
}

.cursor-box:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
}

.cursor-img {
  width: 32px;
  height: 32px;
  object-fit: contain;
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
</style>
