<template>
  <div class="widget-card" data-widget-id="toc-nav" @click="$emit('click')">
    <div class="deploy-badge" v-if="isDeployed">已部署</div>
    
    <div class="preview-section">
      <div class="preview-area">
        <div class="toc-preview">
          <div class="preview-header">
            <div class="header-title">目录导航</div>
          </div>
          <div class="preview-content">
            <div class="toc-item active">
              <div class="bar"></div>
              <span>标题 1</span>
            </div>
            <div class="toc-item">
              <div class="bar"></div>
              <span>标题 2</span>
            </div>
            <div class="toc-item">
              <div class="bar"></div>
              <span>标题 3</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="info-section">
      <h3>目录导航</h3>
      <p>为页面添加目录导航功能，支持自动识别标题并生成导航栏</p>
      <div class="tags">
        <span class="tag">导航</span>
        <span class="tag">目录</span>
        <span class="tag">交互</span>
      </div>
      <div class="author">
        <span class="author-tag">作者：红烧猎人</span>
        <span class="author-tag">优化适配：madrays</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
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
  height: 160px;
}

.preview-area {
  width: 280px;
  height: 140px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.toc-preview {
  width: 100%;
  height: 100%;
  background: rgba(42, 42, 42, 0.42);
  backdrop-filter: blur(2px);
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0,0,0,0.1);
  display: flex;
  flex-direction: column;
}

.preview-header {
  height: 24px;
  background: rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  padding: 0 12px;
}

.header-title {
  font-size: 11px;
  color: #ffffff;
}

.preview-content {
  flex: 1;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.toc-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.toc-item .bar {
  width: 20px;
  height: 4px;
  background: #ffffff;
  border-radius: 2px;
}

.toc-item span {
  font-size: 12px;
  color: #ffffff;
}

.toc-item.active .bar {
  width: 30px;
  background: rgba(255, 255, 255, 0.9);
}

.toc-item.active span {
  color: rgba(255, 255, 255, 0.9);
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