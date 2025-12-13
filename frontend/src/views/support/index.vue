<template>
  <div class="support-page">
    <div class="glass-container">
      <!-- 左侧区域: Logo + 项目链接 + 作者介绍 -->
      <div class="info-section">
        <!-- Logo区域 -->
        <div class="logo-section">
          <div class="logo-wrapper">
            <el-avatar :size="100" src="/logo.svg" class="logo" />
            <div class="logo-glow"></div>
          </div>
          <div class="title-wrapper">
            <h1>Sun Panel Helper</h1>
            <div class="typing-text">让你的 Sun-Panel 锦上添花</div>
          </div>
        </div>

        <!-- 项目链接 -->
        <div class="links-section">
          <a href="https://github.com/madrays/sun-panel-helper" target="_blank" class="link-card github">
            <el-icon><Platform /></el-icon>
            <span>GitHub</span>
          </a>
          <a href="https://madrays.de" target="_blank" class="link-card blog">
            <el-icon><Monitor /></el-icon>
            <span>博客</span>
          </a>
        </div>

        <!-- 作者介绍 -->
        <div class="author-section">
          <div class="author-card">
            <div class="author-avatar">
              <img src="/madrays-avatar.jpg" alt="Madrays" />
            </div>
            <div class="author-info">
              <h3>关于作者</h3>
              <div class="author-desc">
                <p>Hi，我是 Madrays，一个热爱折腾的 AI 爱好者。</p>
                <p>本项目由 Sun-Panel 作者红烧猎人技术指导，全程使用 AI 辅助开发。作为一个零基础的编程爱好者，希望通过这个项目展示 AI 辅助开发的无限可能。</p>
                <p>如果你也对 AI 开发或 Sun-Panel 美化感兴趣，欢迎加入交流群一起探讨！</p>
              </div>
              <div class="author-tags">
                <span class="tag">AI 爱好者</span>
                <span class="tag">Sun-Panel</span>
                <span class="tag">零基础开发</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧区域: 打赏 + 社区信息 + 项目说明 -->
      <div class="support-section">
        <!-- 右侧打赏区域 -->
        <div class="donate-section">
          <div class="donate-header">
            <div class="donate-icon">
              <el-icon><Coffee /></el-icon>
            </div>
            <h2>请作者喝杯奶茶</h2>
            <p>您的支持是我持续创作的动力 ❤️</p>
          </div>

          <div class="qr-container">
            <div class="qr-card">
              <div class="qr-inner">
                <img src="/wechat-qr.jpg" alt="微信支付" />
                <div class="qr-label">
                  <el-icon><Wallet /></el-icon>
                  <span>微信支付</span>
                </div>
              </div>
            </div>
            <div class="qr-card">
              <div class="qr-inner">
                <img src="/alipay-qr.jpg" alt="支付宝" />
                <div class="qr-label">
                  <el-icon><Money /></el-icon>
                  <span>支付宝</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 社区信息 -->
        <div class="community-section">
          <div class="info-card" @click="copyText('1019956856')">
            <div class="card-icon">
              <el-icon><ChatDotRound /></el-icon>
            </div>
            <div class="card-content">
              <div class="card-title">QQ交流群</div>
              <div class="card-value">
                1019956856
                <el-icon class="copy-icon"><CopyDocument /></el-icon>
              </div>
            </div>
          </div>
          <div class="info-card" @click="copyText('2826910520@qq.com')">
            <div class="card-icon">
              <el-icon><Message /></el-icon>
            </div>
            <div class="card-content">
              <div class="card-title">投稿邮箱</div>
              <div class="card-value">
                2826910520@qq.com
                <el-icon class="copy-icon"><CopyDocument /></el-icon>
              </div>
            </div>
          </div>
        </div>

        
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Platform, Monitor, Message, ChatDotRound, CopyDocument } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { ref } from 'vue'

// 添加复制状态
const justCopied = ref('')

const copyText = (text: string) => {
  navigator.clipboard.writeText(text).then(() => {
    justCopied.value = text
    ElMessage({
      message: '复制成功！',
      type: 'success',
      duration: 2000
    })
    setTimeout(() => {
      justCopied.value = ''
    }, 2000)
  }).catch(() => {
    ElMessage({
      message: '复制失败，请手动复制',
      type: 'error',
      duration: 2000
    })
  })
}
</script>

<style scoped>
.support-page {
  height: 100%;
  background: var(--el-bg-color);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 30px;
  position: relative;
  overflow: hidden;
}

.support-page::before {
  content: '';
  position: absolute;
  inset: 0;
  background: 
    radial-gradient(circle at 20% 20%, var(--el-color-primary-light-5) 0%, transparent 40%),
    radial-gradient(circle at 80% 80%, var(--el-color-success-light-5) 0%, transparent 40%);
  opacity: 0.1;
  filter: blur(60px);
}

.glass-container {
  width: 100%;
  max-width: 1400px;
  background: rgba(255, 255, 255, 0.02);
  backdrop-filter: blur(20px);
  border-radius: 30px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
  padding: 30px;
  position: relative;
  overflow: hidden;
}

/* Logo区域样式 */
.logo-section {
  text-align: center;
  margin-bottom: 30px;
}

.logo-wrapper {
  position: relative;
  display: inline-block;
  margin-bottom: 16px;
}

.logo {
  position: relative;
  z-index: 1;
  animation: float 3s ease-in-out infinite;
}

.logo-glow {
  position: absolute;
  inset: -20px;
  background: var(--el-color-primary);
  filter: blur(30px);
  opacity: 0.2;
  animation: glow 3s ease-in-out infinite;
}

.title-wrapper h1 {
  font-size: 2.8rem;
  margin: 0 0 10px;
  background: linear-gradient(135deg, var(--el-color-primary) 0%, var(--el-color-primary-light-5) 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.typing-text {
  font-size: 1.2rem;
  color: var(--el-text-color-secondary);
  overflow: hidden;
  border-right: 2px solid var(--el-color-primary);
  white-space: nowrap;
  animation: typing 4s steps(20) infinite;
}

/* 链接卡片样式 */
.links-section {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-bottom: 30px;
}

.link-card {
  position: relative;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.03);
  color: var(--el-text-color-primary);
  text-decoration: none;
  overflow: hidden;
  transition: all 0.3s;
}

.link-hover {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, var(--el-color-primary-light-8) 0%, transparent 100%);
  opacity: 0;
  transition: opacity 0.3s;
}

.link-card:hover .link-hover {
  opacity: 0.1;
}

.link-card:hover {
  transform: translateY(-3px);
}

/* 信息卡片样式 */
.info-card {
  cursor: pointer;
  position: relative;
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 16px;
  margin-bottom: 16px;
  overflow: hidden;
}

.card-icon {
  font-size: 28px;
  color: var(--el-color-primary);
}

.card-title {
  font-size: 0.9rem;
  color: var(--el-text-color-secondary);
  margin-bottom: 4px;
}

.card-value {
  display: flex;
  align-items: center;
  gap: 8px;
}

.card-glow {
  position: absolute;
  inset: 0;
  background: var(--el-color-primary);
  opacity: 0;
  filter: blur(20px);
  transition: opacity 0.3s;
}

.info-card:hover .card-glow {
  opacity: 0.05;
}

.copy-icon {
  font-size: 16px;
  opacity: 0;
  transition: all 0.3s;
  color: var(--el-color-primary);
}

.info-card:hover .copy-icon {
  opacity: 1;
  transform: translateX(4px);
}

/* 打赏区样式 */
.donate-header {
  text-align: center;
  margin-bottom: 24px;
}

.donate-icon {
  font-size: 40px;
  color: var(--el-color-primary);
  margin-bottom: 12px;
}

.qr-container {
  display: flex;
  gap: 40px;
  justify-content: center;
}

.qr-card {
  background: white;
  padding: 16px;
  border-radius: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s;
}

.qr-inner {
  text-align: center;
}

.qr-inner img {
  width: 200px;
  height: 200px;
  border-radius: 12px;
  margin-bottom: 12px;
}

.qr-label {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: var(--el-text-color-regular);
  font-size: 1rem;
}

.qr-card:hover {
  transform: translateY(-5px);
}

/* 动画 */
@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

@keyframes glow {
  0%, 100% { opacity: 0.2; transform: scale(1); }
  50% { opacity: 0.3; transform: scale(1.1); }
}

@keyframes typing {
  0%, 100% { width: 0; }
  50% { width: 100%; }
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .glass-container {
    grid-template-columns: 1fr;
    gap: 30px;
  }

  .qr-container {
    flex-direction: column;
    gap: 30px;
  }
}

@media (max-width: 768px) {
  .support-page {
    padding: 20px;
  }

  .glass-container {
    padding: 30px 20px;
  }

  .title-wrapper h1 {
    font-size: 2.2rem;
  }
}

/* 添加点击反馈效果 */
.info-card:active {
  transform: scale(0.98);
}

/* 添加复制提示 */
.info-card::after {
  content: '点击复制';
  position: absolute;
  right: 20px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 12px;
  color: var(--el-color-primary);
  opacity: 0;
  transition: all 0.3s;
}

.info-card:hover::after {
  opacity: 0.7;
  transform: translate(-4px, -50%);
}

/* Logo环形动画 */
.logo-glow {
  position: absolute;
  inset: -20px;
  background: var(--el-color-primary);
  filter: blur(30px);
  opacity: 0.2;
  animation: glow 3s ease-in-out infinite;
}

/* 作者介绍样式 */
.author-section {
  margin: 30px 0;
}

.author-card {
  background: rgba(255, 255, 255, 0.03);
  border-radius: 20px;
  padding: 24px;
  display: flex;
  gap: 24px;
  align-items: flex-start;
  border: 1px solid rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
}

.author-avatar img {
  width: 120px;
  height: 120px;
  border-radius: 60px;
  border: 4px solid rgba(var(--el-color-primary-rgb), 0.2);
}

.author-info h3 {
  font-size: 1.5rem;
  margin: 0 0 16px;
  background: linear-gradient(135deg, var(--el-color-primary) 0%, var(--el-color-primary-light-5) 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.author-desc {
  color: var(--el-text-color-regular);
  line-height: 1.6;
}

.author-desc p {
  margin: 6px 0;
}

.author-tags {
  margin-top: 12px;
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.tag {
  padding: 4px 12px;
  border-radius: 20px;
  background: rgba(var(--el-color-primary-rgb), 0.1);
  color: var(--el-color-primary);
  font-size: 0.9rem;
}

@media (max-width: 768px) {
  .author-card {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
  
  .author-tags {
    justify-content: center;
  }
}
</style> 