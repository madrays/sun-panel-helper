<template>
  <div class="widget-card" @click="$emit('click')">
    <!-- 应用状态标签 -->
    <div class="apply-badges">
      <el-tag 
        v-if="isAppliedToFixed" 
        class="status-badge fixed-badge"
        size="small"
      >
        <el-icon><Lock /></el-icon>
        固定池
      </el-tag>
      <el-tag 
        v-if="isAppliedToFree" 
        class="status-badge free-badge"
        size="small"
      >
        <el-icon><Position /></el-icon>
        自由池
      </el-tag>
    </div>
    
    <div class="preview-section">
      <div class="preview-area">
        <div class="typed-preview">
          <div class="typed-text">
            <span class="cursor">Hi，这里是Coco的导航页</span>
            <div class="sub-text">随意享用吧~~</div>
          </div>
        </div>
      </div>
    </div>

    <div class="info-section">
      <h3>打字机效果</h3>
      <p>支持自定义文本的打字机动画效果</p>
      <div class="tags">
        <span class="tag">动画</span>
        <span class="tag">文字</span>
        <span class="tag">特效</span>
      </div>
      <div class="author">
        <span class="author-tag">作者：轻轻小组件</span>
        <span class="author-tag">优化适配：madrays</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Lock, Position } from '@element-plus/icons-vue'
defineProps<{
  isAppliedToFixed?: boolean
  isAppliedToFree?: boolean
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

.typed-preview {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.typed-text {
  font-size: 20px;
  color: var(--el-text-color-primary);
  line-height: 1.4;
}

.cursor {
  border-right: 2px solid currentColor;
  animation: blink 0.7s step-end infinite;
}

.sub-text {
  font-size: 14px;
  color: var(--el-text-color-secondary);
  margin-top: 8px;
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

.apply-badges {
  position: absolute;
  top: 12px;
  right: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  z-index: 1;
  pointer-events: none;
}

.status-badge {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border: none;
  backdrop-filter: blur(8px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.fixed-badge {
  background: rgba(64, 158, 255, 0.9);
  color: #fff;
}

.free-badge {
  background: rgba(103, 194, 58, 0.9);
  color: #fff;
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

@keyframes blink {
  from, to {
    border-color: transparent;
  }
  50% {
    border-color: currentColor;
  }
}
</style> 