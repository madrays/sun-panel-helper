<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import StarBackgroundPreview from './components/StarBackgroundPreview.vue'

const router = useRouter()

// 背景特效列表
const backgroundEffects = ref([
  {
    id: 'star-background',
    title: '星空背景',
    description: '梦幻星空效果，为您的网站增添浩瀚宇宙氛围',
    path: '/dashboard/toolbox/detail/background-effect/star-background',
    isReady: true
  }
])

// 导航到详情页
const navigateToDetail = (path: string, isReady: boolean) => {
  if (isReady) {
    router.push(path)
  }
}
</script>

<template>
  <div class="background-effect-category">
    <div class="page-header">
      <div class="back-button" @click="router.push('/dashboard/toolbox')">
        <i class="el-icon-arrow-left"></i> 返回
      </div>
      <h1 class="page-title">背景特效</h1>
      <div class="page-subtitle">为您的网站添加动态背景效果，提升视觉体验</div>
    </div>
    
    <div class="effects-grid">
      <!-- 现有的效果 -->
      <div 
        v-for="effect in backgroundEffects" 
        :key="effect.id"
        class="effect-card"
        @click="navigateToDetail(effect.path, effect.isReady)"
      >
        <div class="effect-preview">
          <StarBackgroundPreview v-if="effect.id === 'star-background'" />
          <div v-if="!effect.isReady" class="coming-soon-overlay">
            <span>开发中</span>
          </div>
        </div>
        <div class="effect-info">
          <h3 class="effect-title">{{ effect.title }}</h3>
          <p class="effect-description">{{ effect.description }}</p>
        </div>
        <div class="effect-action">
          <el-button type="primary" size="small">查看详情</el-button>
        </div>
      </div>
      
      <!-- 未来更多效果的占位卡片 -->
      <div class="effect-card placeholder">
        <div class="effect-preview placeholder-preview">
          <i class="el-icon-plus"></i>
        </div>
        <div class="effect-info">
          <h3 class="effect-title">更多背景效果</h3>
          <p class="effect-description">即将推出更多精彩背景特效，敬请期待...</p>
        </div>
      </div>
    </div>
    
    <div class="notes-section">
      <div class="note-card">
        <div class="note-icon"><i class="el-icon-info-filled"></i></div>
        <div class="note-content">
          <h3>使用提示</h3>
          <p>背景特效一次只能激活一种，部署新的背景特效会自动取消之前的特效。某些背景特效可能会影响页面加载速度，请根据实际需要选择。</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.background-effect-category {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 30px;
}

.back-button {
  display: inline-flex;
  align-items: center;
  color: #666;
  cursor: pointer;
  margin-bottom: 10px;
  font-size: 14px;
}

.back-button:hover {
  color: var(--el-color-primary);
}

.page-title {
  font-size: 28px;
  margin: 0 0 10px;
  color: var(--el-color-primary);
}

.page-subtitle {
  color: #666;
  font-size: 16px;
}

.effects-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.effect-card {
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s, box-shadow 0.3s;
  background-color: #fff;
  cursor: pointer;
}

.effect-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.15);
}

.effect-preview {
  height: 180px;
  background-color: #f5f7fa;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.coming-soon-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  font-size: 18px;
}

.effect-info {
  padding: 15px;
}

.effect-title {
  margin: 0 0 10px;
  font-size: 18px;
}

.effect-description {
  margin: 0;
  color: #666;
  font-size: 14px;
  line-height: 1.4;
}

.effect-action {
  padding: 0 15px 15px;
  display: flex;
  justify-content: flex-end;
}

.placeholder-preview {
  background-color: #f0f2f5;
}

.placeholder-preview i {
  font-size: 40px;
  color: #ccc;
}

.placeholder {
  background-color: #f9f9f9;
  border: 2px dashed #ddd;
  box-shadow: none;
}

.placeholder:hover {
  transform: none;
  box-shadow: none;
  background-color: #f5f5f5;
}

.notes-section {
  margin-top: 30px;
}

.note-card {
  background-color: #f0f7ff;
  border-radius: 8px;
  padding: 15px;
  display: flex;
  align-items: flex-start;
}

.note-icon {
  margin-right: 15px;
  color: var(--el-color-primary);
  font-size: 24px;
}

.note-content h3 {
  margin: 0 0 10px;
  font-size: 16px;
}

.note-content p {
  margin: 0;
  color: #666;
  font-size: 14px;
}

@media (max-width: 768px) {
  .effects-grid {
    grid-template-columns: 1fr;
  }
}
</style> 