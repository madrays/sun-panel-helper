<template>
  <div class="home">
    <header class="hero">
      <div class="hero-content">
        <h1>SUN-PANEL-HELPER</h1>
        <p class="subtitle">让Sun-Panel更美好</p>
      </div>
      <div class="hero-bg"></div>
    </header>

    <section class="features">
      <div class="feature-card" @click="goToCSS">
        <div class="feature-icon">🎨</div>
        <div class="card-content">
          <h3>CSS 美化库</h3>
          <p>精美的样式模板，一键应用</p>
        </div>
        <div class="card-arrow">
          <el-icon><arrow-right /></el-icon>
        </div>
      </div>
      <div class="feature-card" @click="goToJS">
        <div class="feature-icon">⚡</div>
        <div class="card-content">
          <h3>JS 功能库</h3>
          <p>强大的功能扩展，轻松集成</p>
        </div>
        <div class="card-arrow">
          <el-icon><arrow-right /></el-icon>
        </div>
      </div>
      <div class="feature-card" @click="goToMarket">
        <div class="feature-icon">🧩</div>
        <div class="card-content">
          <h3>组件市场</h3>
          <p>丰富的组件模板，快速部署</p>
        </div>
        <div class="card-arrow">
          <el-icon><arrow-right /></el-icon>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { ArrowRight } from '@element-plus/icons-vue'

const router = useRouter()

const goToCSS = () => {
  router.push('/dashboard/css')
}

const goToJS = () => {
  router.push('/dashboard/js')
}

const goToMarket = () => {
  router.push('/dashboard/market')
}
</script>

<style scoped>
.home {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: transparent;
}

.hero {
  padding: 64px 24px;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  background: var(--bg-card);
  backdrop-filter: blur(12px);
  margin: 0;
}

.hero-content {
  text-align: center;
  z-index: 1;
  max-width: 800px;
  width: 100%;
  margin: 0 auto;
}

.hero h1 {
  font-size: clamp(2.5rem, 5vw, 3.5rem);
  font-weight: 800;
  margin-bottom: 1rem;
  background: var(--gradient-primary);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  letter-spacing: -0.02em;
  filter: drop-shadow(0 4px 8px rgba(59, 130, 246, 0.2));
}

.subtitle {
  font-size: clamp(1.2rem, 2vw, 1.6rem);
  color: var(--text-secondary);
  margin-bottom: 3rem;
  font-weight: 500;
  line-height: 1.6;
}

.hero-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: 
    radial-gradient(circle at 20% 20%, rgba(96, 165, 250, 0.15) 0%, transparent 70%),
    radial-gradient(circle at 80% 80%, rgba(59, 130, 246, 0.15) 0%, transparent 70%);
  z-index: 0;
  animation: pulse 8s ease-in-out infinite alternate;
}

@keyframes pulse {
  0% { opacity: 0.6; }
  100% { opacity: 1; }
}

.features {
  flex: 1;
  padding: 32px;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 32px;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}

.feature-card {
  background: var(--bg-card);
  backdrop-filter: blur(12px);
  padding: 32px;
  border-radius: var(--border-radius-lg);
  display: flex;
  align-items: flex-start;
  gap: 20px;
  cursor: pointer;
  transition: var(--transition-bounce);
  border: 2px solid transparent;
  width: 340px;
  position: relative;
  overflow: hidden;
}

.feature-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: var(--gradient-primary);
  opacity: 0;
  transition: var(--transition-bounce);
}

.feature-card:hover {
  transform: translateY(-8px) scale(1.02);
  border-color: var(--primary-light);
  background: white;
  box-shadow: var(--shadow-lg);
}

.feature-card:hover::before {
  opacity: 1;
}

.feature-icon {
  font-size: 2.5rem;
  background: var(--gradient-primary);
  width: 64px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--border-radius-base);
  flex-shrink: 0;
  transition: var(--transition-bounce);
  color: white;
  position: relative;
  overflow: hidden;
}

.feature-icon::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(45deg, transparent 0%, rgba(255, 255, 255, 0.2) 100%);
  transition: var(--transition-bounce);
}

.feature-card:hover .feature-icon {
  transform: scale(1.1) rotate(8deg);
}

.feature-card:hover .feature-icon::after {
  transform: translateX(100%);
}

.card-content {
  flex: 1;
}

.feature-card h3 {
  font-size: 1.4rem;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
  font-weight: 600;
}

.feature-card p {
  color: var(--text-secondary);
  line-height: 1.6;
  font-size: 1rem;
  margin: 0;
}

.card-arrow {
  color: var(--primary-light);
  font-size: 1.2rem;
  transition: var(--transition-bounce);
  margin-top: 4px;
}

.feature-card:hover .card-arrow {
  color: var(--primary-color);
  transform: translateX(6px);
}

@media (max-width: 1100px) {
  .features {
    flex-direction: column;
    padding: 32px;
  }

  .feature-card {
    width: 100%;
    max-width: 500px;
  }
}

@media (max-width: 480px) {
  .hero {
    padding: 64px 24px;
  }

  .feature-card {
    padding: 24px;
  }

  .feature-icon {
    width: 56px;
    height: 56px;
    font-size: 2rem;
  }

  .feature-card h3 {
    font-size: 1.2rem;
  }
}
</style> 