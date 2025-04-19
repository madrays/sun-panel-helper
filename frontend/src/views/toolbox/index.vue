<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

interface CategoryCard {
  title: string
  description: string
  path: string
  available: number
}

const categories = ref<CategoryCard[]>([
  {
    title: '自定义页脚',
    description: '为网站添加美观实用的自定义页脚，展示网站信息和社交链接',
    path: '/dashboard/toolbox/footer',
    available: 2
  },
  {
    title: '点击特效',
    description: '鼠标点击时的精美动画效果，提升用户交互体验',
    path: '/dashboard/toolbox/click-effect',
    available: 1
  },
  {
    title: '背景特效',
    description: '为页面背景添加动态效果，营造沉浸式浏览体验',
    path: '/dashboard/toolbox/background-effect',
    available: 1
  }
])

const navigateTo = (path: string) => {
  router.push(path)
}
</script>

<template>
  <div class="toolbox-container">
    <div class="header-section">
      <div class="title-container">
        <h1 class="main-title">百宝箱</h1>
        <p class="subtitle">精选实用工具，一键美化您的网站</p>
      </div>
      
      <!-- 自定义SVG装饰 -->
      <div class="svg-decoration">
        <svg width="160" height="160" viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg">
          <g class="treasure-box">
            <!-- 宝箱底部 -->
            <path d="M30 80H130V130C130 132.761 127.761 135 125 135H35C32.2386 135 30 132.761 30 130V80Z" fill="url(#boxGradient)" />
            
            <!-- 宝箱顶部 -->
            <path d="M35 45C35 42.2386 37.2386 40 40 40H120C122.761 40 125 42.2386 125 45V80H35V45Z" fill="url(#lidGradient)" />
            
            <!-- 宝箱锁 -->
            <rect x="75" y="75" width="10" height="15" rx="2" fill="#FFD700" />
            <rect x="72" y="65" width="16" height="10" rx="2" fill="#FFD700" />
            
            <!-- 发光效果 -->
            <circle class="sparkle" cx="60" cy="60" r="3" fill="white" />
            <circle class="sparkle" cx="100" cy="55" r="4" fill="white" />
            <circle class="sparkle" cx="80" cy="100" r="5" fill="white" />
          </g>
          
          <!-- 渐变定义 -->
          <defs>
            <linearGradient id="boxGradient" x1="80" y1="80" x2="80" y2="135" gradientUnits="userSpaceOnUse">
              <stop offset="0" stop-color="#8B4513" />
              <stop offset="1" stop-color="#5D2906" />
            </linearGradient>
            <linearGradient id="lidGradient" x1="80" y1="40" x2="80" y2="80" gradientUnits="userSpaceOnUse">
              <stop offset="0" stop-color="#A0522D" />
              <stop offset="1" stop-color="#8B4513" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    </div>
    
    <div class="tools-section">
      <div class="tools-header">
        <h2>可用工具</h2>
      </div>
      
      <div class="categories-grid">
        <div 
          v-for="(category, index) in categories" 
          :key="index"
          class="category-card"
          @click="navigateTo(category.path)"
        >
          <div class="card-icon">
            <!-- 自定义页脚SVG图标 -->
            <svg v-if="index === 0" class="icon-svg" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="6" y="28" width="36" height="14" rx="2" fill="url(#footerGradient)" />
              <path d="M10 32H24" stroke="white" stroke-width="2" stroke-linecap="round" />
              <path d="M10 36H20" stroke="white" stroke-width="2" stroke-linecap="round" />
              <circle cx="34" cy="34" r="2" fill="white" />
              <circle cx="38" cy="34" r="2" fill="white" />
              <path d="M10 6H38C39.1046 6 40 6.89543 40 8V20H8V8C8 6.89543 8.89543 6 10 6Z" fill="#e1e1e1" />
              <path d="M14 12H34" stroke="#555" stroke-width="2" stroke-linecap="round" />
              <path d="M14 16H28" stroke="#555" stroke-width="2" stroke-linecap="round" />
              <defs>
                <linearGradient id="footerGradient" x1="6" y1="35" x2="42" y2="35" gradientUnits="userSpaceOnUse">
                  <stop stop-color="#3498db" />
                  <stop offset="1" stop-color="#2980b9" />
                </linearGradient>
              </defs>
            </svg>
            
            <!-- 点击特效SVG图标 -->
            <svg v-if="index === 1" class="icon-svg" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="24" cy="24" r="18" fill="url(#clickGradient)" fill-opacity="0.2" />
              <circle cx="24" cy="24" r="14" fill="url(#clickGradient)" fill-opacity="0.4" />
              <circle cx="24" cy="24" r="10" fill="url(#clickGradient)" fill-opacity="0.6" />
              <circle cx="24" cy="24" r="6" fill="url(#clickGradient)" />
              <path d="M24 6V12" stroke="#555" stroke-width="2" stroke-linecap="round" />
              <path d="M24 36V42" stroke="#555" stroke-width="2" stroke-linecap="round" />
              <path d="M12 24L6 24" stroke="#555" stroke-width="2" stroke-linecap="round" />
              <path d="M42 24L36 24" stroke="#555" stroke-width="2" stroke-linecap="round" />
              <defs>
                <linearGradient id="clickGradient" x1="6" y1="24" x2="42" y2="24" gradientUnits="userSpaceOnUse">
                  <stop stop-color="#ff7eb8" />
                  <stop offset="1" stop-color="#e066a1" />
                </linearGradient>
              </defs>
            </svg>
            
            <!-- 背景特效SVG图标 -->
            <svg v-if="index === 2" class="icon-svg" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="6" y="6" width="36" height="36" rx="3" fill="#f1f1f1" />
              <path class="wave" d="M6 20C14 15 18 25 24 20C30 15 36 25 42 20" stroke="url(#bgGradient)" stroke-width="2" />
              <path class="wave" d="M6 28C14 23 18 33 24 28C30 23 36 33 42 28" stroke="url(#bgGradient)" stroke-width="2" />
              <path class="wave" d="M6 36C14 31 18 41 24 36C30 31 36 41 42 36" stroke="url(#bgGradient)" stroke-width="2" />
              <circle cx="14" cy="14" r="2" fill="#ddd" />
              <circle cx="32" cy="12" r="3" fill="#ddd" />
              <defs>
                <linearGradient id="bgGradient" x1="6" y1="28" x2="42" y2="28" gradientUnits="userSpaceOnUse">
                  <stop stop-color="#7ee7ff" />
                  <stop offset="1" stop-color="#4cdbf8" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          
          <div class="card-content">
            <div class="card-header">
              <h3 class="card-title">{{ category.title }}</h3>
              <span class="available-badge">{{ category.available }} 可用</span>
            </div>
            <p class="card-description">{{ category.description }}</p>
            <div class="card-footer">
              <button class="view-btn">查看详情</button>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <div class="info-section">
      <div class="info-icon">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="10" fill="rgba(64, 158, 255, 0.1)" />
          <circle cx="12" cy="8" r="1" fill="#409EFF" />
          <path d="M12 11V16" stroke="#409EFF" stroke-width="2" stroke-linecap="round" />
        </svg>
      </div>
      <div class="info-content">
        <h3>如何使用百宝箱？</h3>
        <p>百宝箱提供各种美化网站的实用工具。请注意，同一类别下只能启用一个工具，新部署的功能会自动替代旧功能。点击卡片进入详情页面进行配置和部署。</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.toolbox-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 30px;
  color: #333;
}

.header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 40px;
  position: relative;
}

.title-container {
  max-width: 60%;
}

.main-title {
  font-size: 2.5rem;
  font-weight: 700;
  margin: 0 0 16px 0;
  color: #333;
  position: relative;
}

.main-title::after {
  content: '';
  position: absolute;
  left: 0;
  bottom: -8px;
  width: 80px;
  height: 4px;
  background: linear-gradient(90deg, #409EFF, #53a8ff);
  border-radius: 2px;
}

.subtitle {
  font-size: 1.1rem;
  color: #666;
  margin: 0;
  line-height: 1.5;
}

.svg-decoration {
  position: relative;
}

.svg-decoration svg {
  width: 160px;
  height: 160px;
}

.sparkle {
  opacity: 0.8;
  animation: twinkle 2s infinite alternate ease-in-out;
}

.sparkle:nth-child(2) {
  animation-delay: 0.5s;
}

.sparkle:nth-child(3) {
  animation-delay: 1s;
}

.treasure-box {
  transform-origin: center bottom;
  animation: float 4s infinite ease-in-out;
}

.tools-section {
  margin-bottom: 40px;
}

.tools-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.tools-header h2 {
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0;
  color: #333;
}

.tools-filter {
  display: flex;
  gap: 16px;
}

.tools-filter span {
  padding: 6px 16px;
  border-radius: 20px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s ease;
  color: #666;
}

.tools-filter span.active {
  background-color: #f0f7ff;
  color: #409EFF;
  font-weight: 500;
}

.tools-filter span:hover:not(.active) {
  background-color: #f5f7fa;
}

.categories-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 24px;
}

.category-card {
  display: flex;
  background-color: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  cursor: pointer;
  border: 1px solid rgba(0, 0, 0, 0.05);
  height: 160px;
}

.category-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  border-color: rgba(64, 158, 255, 0.2);
}

.card-icon {
  width: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f7f9fc;
  padding: 20px;
  transition: background-color 0.3s ease;
}

.category-card:hover .card-icon {
  background-color: #f0f7ff;
}

.icon-svg {
  width: 48px;
  height: 48px;
  transition: transform 0.3s ease;
}

.category-card:hover .icon-svg {
  transform: scale(1.1);
}

.card-content {
  flex: 1;
  padding: 20px;
  display: flex;
  flex-direction: column;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 10px;
}

.card-title {
  font-size: 1.2rem;
  font-weight: 600;
  margin: 0;
  color: #333;
}

.available-badge {
  background-color: #f0f7ff;
  color: #409EFF;
  font-size: 0.8rem;
  padding: 2px 8px;
  border-radius: 12px;
  font-weight: 500;
}

.card-description {
  color: #666;
  font-size: 0.95rem;
  line-height: 1.5;
  margin: 0 0 auto;
}

.card-footer {
  margin-top: 15px;
}

.view-btn {
  background-color: transparent;
  color: #409EFF;
  border: 1px solid #409EFF;
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.category-card:hover .view-btn {
  background-color: #409EFF;
  color: white;
}

.info-section {
  background-color: #f7f9fc;
  border-radius: 12px;
  padding: 24px;
  display: flex;
  align-items: flex-start;
  gap: 16px;
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.info-icon {
  flex-shrink: 0;
}

.info-content h3 {
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0 0 10px 0;
  color: #333;
}

.info-content p {
  color: #666;
  line-height: 1.6;
  margin: 0;
}

/* 动画 */
@keyframes twinkle {
  0% { opacity: 0.4; }
  100% { opacity: 1; }
}

@keyframes float {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  50% { transform: translateY(-5px) rotate(1deg); }
}

.wave {
  animation: wave 4s infinite ease-in-out;
}

@keyframes wave {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-5px); }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .header-section {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
  
  .title-container {
    max-width: 100%;
    margin-bottom: 30px;
  }
  
  .main-title::after {
    left: 50%;
    transform: translateX(-50%);
  }
  
  .tools-header {
    flex-direction: column;
    gap: 16px;
  }
  
  .categories-grid {
    grid-template-columns: 1fr;
  }
  
  .category-card {
    height: auto;
  }
  
  .card-icon {
    width: 100px;
  }
}

@media (max-width: 480px) {
  .category-card {
    flex-direction: column;
    height: auto;
  }
  
  .card-icon {
    width: 100%;
    padding: 20px 0;
  }
  
  .tools-filter {
    width: 100%;
    justify-content: center;
  }
}
</style> 