<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import LifelineFooterPreview from './components/LifelineFooterPreview.vue'
import IcpFooterPreview from './components/IcpFooterPreview.vue'

const router = useRouter()

// 添加FontAwesome CDN链接
onMounted(() => {
  if (!document.querySelector('link[href*="font-awesome"]')) {
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css'
    document.head.appendChild(link)
  }
})

interface FooterItem {
  id: string
  title: string
  description: string
  path: string
}

const footerItems = ref<FooterItem[]>([
  {
    id: 'lifeline-footer',
    title: '生命线页脚',
    description: '包含运行时间、社交链接和社会主义核心价值观的现代页脚',
    path: '/dashboard/toolbox/footer/lifeline-footer'
  },
  {
    id: 'icp-footer',
    title: '备案信息页脚',
    description: '简洁美观的工信部备案与公安备案页脚，确保合规展示',
    path: '/dashboard/toolbox/footer/icp-footer'
  }
  // 未来可以添加更多页脚样式
])

const navigateToDetail = (path: string) => {
  router.push(path)
}
</script>

<template>
  <div class="footer-category">
    <div class="header">
      <button class="back-btn" @click="router.push('/dashboard/toolbox')">
        <i class="fas fa-arrow-left"></i>
        返回百宝箱
      </button>
      <div class="title-area">
        <h1>自定义页脚</h1>
        <p>选择一个精美的页脚样式应用到你的网站</p>
      </div>
    </div>
    
    <!-- 使用提示移至顶部 -->
    <div class="tips-section tips-section-top">
      <div class="tip-card">
        <div class="tip-icon">
          <i class="fas fa-info-circle"></i>
        </div>
        <div class="tip-content">
          <h3>使用提示</h3>
          <p>同一时间只能使用一种页脚样式，新部署的页脚会自动替换当前已有的页脚。点击"查看详情"可进入详情页面进行配置和部署。</p>
        </div>
      </div>
    </div>
    
    <div class="footer-gallery">
      <!-- 生命线页脚项 -->
      <div class="gallery-item" @click="navigateToDetail('/dashboard/toolbox/footer/lifeline-footer')">
        <div class="item-header">
          <h2>生命线页脚</h2>
        </div>
        <p class="item-desc">包含运行时间、社交链接和社会主义核心价值观的现代页脚</p>
        
        <!-- 作者标签 -->
        <div class="item-tags">
          <span class="author-tag">
            <i class="fas fa-user"></i> KoWming
          </span>
          <span class="author-tag">
            <i class="fas fa-code"></i> madrays
          </span>
        </div>
        
        <!-- 页脚预览组件 -->
        <div class="preview-container">
          <LifelineFooterPreview />
        </div>
        
        <div class="item-actions">
          <button class="detail-btn">查看详情</button>
        </div>
      </div>
      
      <!-- 备案信息页脚项 -->
      <div class="gallery-item" @click="navigateToDetail('/dashboard/toolbox/footer/icp-footer')">
        <div class="item-header">
          <h2>备案信息页脚</h2>
        </div>
        <p class="item-desc">简洁美观的工信部备案与公安备案页脚，确保合规展示</p>
        
        <!-- 作者标签 -->
        <div class="item-tags">
          <span class="author-tag">
            <i class="fas fa-code"></i> madrays
          </span>
        </div>
        
        <!-- 页脚预览组件 -->
        <div class="preview-container">
          <IcpFooterPreview />
        </div>
        
        <div class="item-actions">
          <button class="detail-btn">查看详情</button>
        </div>
      </div>
      
      <!-- 占位卡片 - 更多页脚样式 -->
      <div class="gallery-item coming-soon">
        <div class="item-header">
          <h2>更多页脚样式</h2>
        </div>
        <p class="item-desc">更多精美页脚样式正在开发中，敬请期待...</p>
        
        <div class="preview-container empty">
          <div class="empty-preview">
            <i class="fas fa-plus-circle fa-3x"></i>
            <span>敬请期待更多页脚样式</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 主容器样式 */
.footer-category {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  color: #303133;
  font-family: 'Segoe UI', 'Microsoft YaHei', sans-serif;
}

/* 头部区域 */
.header {
  margin-bottom: 25px;
}

.back-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: none;
  border: none;
  color: #409EFF;
  cursor: pointer;
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 0.9rem;
  font-weight: 500;
  background-color: rgba(64, 158, 255, 0.1);
  transition: all 0.3s;
}

.back-btn:hover {
  background-color: rgba(64, 158, 255, 0.2);
  transform: translateX(-5px);
}

.title-area {
  margin-top: 16px;
}

.title-area h1 {
  font-size: 1.6rem;
  margin: 0 0 8px;
  font-weight: 600;
  background: linear-gradient(to right, #409EFF, #53a8ff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.title-area p {
  font-size: 0.9rem;
  color: #606266;
  margin: 0;
}

/* 提示区域 */
.tips-section {
  margin-top: 25px;
}

.tips-section-top {
  margin-top: 0;
  margin-bottom: 25px;
}

.tip-card {
  background-color: #ecf8ff;
  border-radius: 8px;
  padding: 15px;
  display: flex;
  gap: 12px;
  align-items: flex-start;
  border-left: 4px solid #409EFF;
}

.tip-icon {
  color: #409EFF;
  flex-shrink: 0;
  font-size: 1.2rem;
}

.tip-content h3 {
  margin: 0 0 5px;
  font-size: 1rem;
  font-weight: 600;
  color: #303133;
}

.tip-content p {
  margin: 0;
  color: #606266;
  line-height: 1.5;
  font-size: 0.9rem;
}

/* 页脚画廊 */
.footer-gallery {
  display: grid;
  grid-template-columns: 1fr;
  gap: 25px;
  margin-bottom: 25px;
}

.gallery-item {
  border-radius: 10px;
  background: white;
  box-shadow: 0 0 15px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  transition: transform 0.3s, box-shadow 0.3s;
  display: flex;
  flex-direction: column;
  cursor: pointer;
  position: relative;
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.gallery-item:hover {
  transform: translateY(-6px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.08);
}

.item-header {
  padding: 16px 20px 5px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.item-header h2 {
  font-size: 1.3rem;
  margin: 0;
  font-weight: 600;
  color: #303133;
}

.item-desc {
  padding: 0 20px 5px;
  margin: 0;
  color: #606266;
  font-size: 0.95rem;
  line-height: 1.5;
}

/* 作者标签 */
.item-tags {
  padding: 0 20px 15px;
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.author-tag {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  background-color: #f2f6fc;
  border-radius: 4px;
  padding: 3px 8px;
  font-size: 0.8rem;
  color: #606266;
  transition: all 0.3s;
}

.author-tag i {
  color: #409EFF;
  font-size: 0.9rem;
}

.author-tag:hover {
  background-color: #ecf5ff;
  transform: translateY(-2px);
}

/* 预览容器 */
.preview-container {
  background-color: #1a1a1a;
  padding: 0;
  position: relative;
  overflow: hidden;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  margin-top: auto;
}

/* 空白预览 */
.empty-preview {
  height: 120px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #909399;
  gap: 10px;
}

.empty-preview span {
  font-size: 0.9rem;
}

/* 操作区 */
.item-actions {
  padding: 15px 20px;
  display: flex;
  justify-content: flex-end;
}

.detail-btn {
  background-color: #409EFF;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
}

.detail-btn:hover {
  background-color: #337ecc;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(64, 158, 255, 0.3);
}

/* 待加入项 */
.coming-soon {
  opacity: 0.7;
  cursor: default;
}

.coming-soon:hover {
  transform: none;
  box-shadow: 0 0 15px rgba(0, 0, 0, 0.05);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .footer-category {
    padding: 15px;
  }
  
  .title-area h1 {
    font-size: 1.4rem;
  }
  
  .item-header {
    padding: 15px 15px 5px;
  }
  
  .item-desc {
    padding: 0 15px 5px;
  }
  
  .item-tags {
    padding: 0 15px 10px;
  }
  
  .item-actions {
    padding: 12px 15px;
  }
}
</style>