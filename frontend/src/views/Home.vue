<template>
  <div class="home">
    <header class="hero">
      <div class="hero-content">
        <h1>SUN-PANEL-HELPER</h1>
        <p class="subtitle">让面板更美好</p>
        <div class="hero-actions">
          <button class="start-btn" @click="goToWidgets">
            开始使用
            <span class="arrow">→</span>
          </button>
        </div>
      </div>
      <div class="hero-bg"></div>
    </header>

    <section class="features">
      <div class="feature-card">
        <div class="feature-icon">🎨</div>
        <h3>CSS 样式库</h3>
        <p>精美的样式模板，一键应用</p>
      </div>
      <div class="feature-card">
        <div class="feature-icon">⚡</div>
        <h3>JS 功能库</h3>
        <p>强大的功能扩展，轻松集成</p>
      </div>
      <div class="feature-card">
        <div class="feature-icon">🧩</div>
        <h3>组件库</h3>
        <p>丰富的组件模板，快速部署</p>
      </div>
    </section>
  </div>
</template>

<script>
export default {
  name: 'Home',
  methods: {
    goToWidgets() {
      this.$router.push({
        path: '/widgets',
        query: { type: 'css' }
      })
    }
  }
}
</script>

<style scoped>
.home {
  min-height: 100vh;
  width: 100%;
  background: #fff;
  display: flex;
  flex-direction: column;
}

.hero {
  height: 60vh;
  min-height: 500px;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  padding: 2rem;
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
  font-weight: bold;
  margin-bottom: 1rem;
  background: linear-gradient(45deg, var(--primary-color), #2196F3);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.subtitle {
  font-size: clamp(1.2rem, 2vw, 1.5rem);
  color: #666;
  margin-bottom: 2rem;
}

.hero-actions {
  margin-top: 2rem;
}

.start-btn {
  padding: 1rem 2rem;
  font-size: 1.1rem;
  background: var(--primary-color);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.start-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(76, 175, 80, 0.2);
}

.arrow {
  transition: transform 0.3s;
}

.start-btn:hover .arrow {
  transform: translateX(4px);
}

.hero-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: 
    radial-gradient(circle at 20% 20%, rgba(76, 175, 80, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 80% 80%, rgba(33, 150, 243, 0.1) 0%, transparent 50%);
  z-index: 0;
}

.features {
  flex: 1;
  width: 100%;
  padding: 4rem max(2rem, calc((100% - 1200px) / 2));
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 2rem;
}

.feature-card {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  transition: all 0.3s;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.feature-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.12);
}

.feature-icon {
  font-size: 2.5rem;
  margin-bottom: 1rem;
}

.feature-card h3 {
  font-size: 1.3rem;
  color: #333;
  margin-bottom: 0.5rem;
}

.feature-card p {
  color: #666;
  line-height: 1.6;
}

@media (max-width: 768px) {
  .hero {
    height: 50vh;
    min-height: 400px;
  }

  .features {
    padding: 3rem 1.5rem;
  }

  .feature-card {
    padding: 1.5rem;
  }
}
</style> 