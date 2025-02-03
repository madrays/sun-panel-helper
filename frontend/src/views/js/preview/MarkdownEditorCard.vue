<template>
  <div class="widget-card" data-widget-id="markdown-editor" @click="$emit('click')">
    <div class="deploy-badge" v-if="isDeployed">已部署</div>
    
    <div class="preview-section">
      <div class="preview-area">
        <div class="editor-preview">
          <div class="preview-header">
            <div class="header-title">随手记</div>
            <div class="header-buttons">
              <span class="btn">□</span>
              <span class="btn">×</span>
            </div>
          </div>
          <div class="preview-content">
            <div class="file-list">
              <div class="file-item">
                <span class="mdi mdi-file-document-outline"></span>
                <div class="file-info">
                  <div class="file-title">示例笔记</div>
                  <div class="file-date">3月15日 14:30</div>
                </div>
              </div>
            </div>
            <div class="editor-area">
              <div class="editor-toolbar">
                <span class="mdi mdi-format-bold"></span>
                <span class="mdi mdi-format-italic"></span>
                <span class="mdi mdi-code-tags"></span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="info-section">
      <h3>Markdown编辑器</h3>
      <p>支持多用户的Markdown笔记编辑器,可在线编辑和预览</p>
      <div class="tags">
        <span class="tag">编辑器</span>
        <span class="tag">Markdown</span>
        <span class="tag">笔记</span>
        <span class="tag">多用户</span>
      </div>
      <div class="author">
        <span class="author-tag">作者：madrays</span>
        <span class="author-tag">优化适配：madrays</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';

const isDeployed = ref(false);

onMounted(async () => {
  try {
    const res = await fetch('/api/js/markdown-editor/deployed');
    if (!res.ok) throw new Error('请求失败');
    const { deployed } = await res.json();
    isDeployed.value = deployed;
  } catch (error) {
    console.error('检查部署状态失败:', error);
  }
});
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

.editor-preview {
  width: 100%;
  height: 100%;
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0,0,0,0.1);
  display: flex;
  flex-direction: column;
}

.preview-header {
  height: 24px;
  background: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 8px;
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
}

.preview-content {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.file-list {
  width: 80px;
  background: #f8f9fa;
  padding: 4px;
  border-right: 1px solid #eee;
}

.file-item {
  padding: 4px;
  background: white;
  border-radius: 4px;
  font-size: 10px;
  display: flex;
  gap: 4px;
  align-items: center;
}

.file-info {
  min-width: 0;
  overflow: hidden;
}

.file-title {
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.file-date {
  font-size: 8px;
  color: #999;
}

.editor-area {
  flex: 1;
  padding: 4px;
}

.editor-toolbar {
  display: flex;
  gap: 4px;
  padding: 2px;
  border-bottom: 1px solid #eee;
}

.editor-toolbar span {
  font-size: 12px;
  color: #666;
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