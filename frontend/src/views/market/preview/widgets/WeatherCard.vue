<template>
  <div class="widget-card" @click="handleClick">
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
        <div class="weather-preview">
          <div class="weather-icon">
            <el-icon class="sun-icon"><Sunny /></el-icon>
            <el-icon class="cloud-icon"><Cloudy /></el-icon>
          </div>
          <div class="weather-info">
            <div class="temp">23°C</div>
            <div class="desc">晴朗</div>
          </div>
        </div>
      </div>
    </div>

    <div class="info-section">
      <h3>天气预报</h3>
      <p>实时展示当前天气状况，支持自定义城市和样式</p>
      <div class="tags">
        <span class="tag">天气</span>
        <span class="tag">实时</span>
        <span class="tag">动态</span>
      </div>
      <div class="author">
        <span class="author-tag">作者：madrays</span>
        <span class="author-tag">优化适配：madrays</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Lock, Position, Sunny, Cloudy } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'

const router = useRouter()
defineProps<{
  isAppliedToFixed?: boolean
  isAppliedToFree?: boolean
}>()

const handleClick = () => {
  router.push({
    path: `/dashboard/market/weather`,
  })
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

.weather-preview {
  width: 180px;
  background: white;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.1);
}

.weather-icon {
  position: relative;
  width: 48px;
  height: 48px;
}

.sun-icon {
  position: absolute;
  font-size: 48px;
  color: #E6A23C;
  animation: sun-spin 8s linear infinite;
}

.cloud-icon {
  position: absolute;
  font-size: 32px;
  color: #909399;
  opacity: 0.8;
  animation: cloud-float 3s ease-in-out infinite;
  transform: translateX(10px);
}

@keyframes sun-spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@keyframes cloud-float {
  0%, 100% {
    transform: translateY(0) translateX(10px);
  }
  50% {
    transform: translateY(-5px) translateX(10px);
  }
}

.weather-info {
  text-align: center;
}

.temp {
  font-size: 32px;
  font-weight: bold;
  color: var(--el-text-color-primary);
  animation: temp-pulse 2s ease-in-out infinite;
}

@keyframes temp-pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

.desc {
  font-size: 16px;
  color: var(--el-text-color-secondary);
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
</style> 