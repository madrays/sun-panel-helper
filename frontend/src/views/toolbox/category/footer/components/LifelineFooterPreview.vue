<script setup lang="ts">
import { onMounted } from 'vue'

// 添加FontAwesome CDN链接
onMounted(() => {
  if (!document.querySelector('link[href*="font-awesome"]')) {
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css'
    document.head.appendChild(link)
  }
})
</script>

<template>
  <div class="footer-preview custom-footer">
    <div class="footer-body">
      <div class="footer-content">
        <!-- 顶部行：运行时间 -->
        <div class="top-row">
          <div class="uptime-container">
            <div class="uptime-title">
              <i class="fas fa-heart-pulse"></i>
              <span>本站已苟活</span>
            </div>
            <div class="time-blocks">
              <div class="time-block">
                <span class="time-value">999</span>
                <span class="time-label">天</span>
              </div>
              <div class="time-block">
                <span class="time-value">23</span>
                <span class="time-label">时</span>
              </div>
              <div class="time-block">
                <span class="time-value">59</span>
                <span class="time-label">分</span>
              </div>
              <div class="time-block">
                <span class="time-value">59</span>
                <span class="time-label">秒</span>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 中间行：个人链接 -->
        <div class="middle-row">
          <div class="link-group">
            <a href="javascript:void(0)">
              <i class="fas fa-user"></i>可可同学
            </a>
            <a href="javascript:void(0)">
              <i class="fab fa-github"></i>Madrays
            </a>
            <a href="javascript:void(0)">
              <i class="fas fa-code-branch"></i>驱动By-Sun-Panel
            </a>
          </div>
        </div>
        
        <!-- 下方行：时辰和载入时间 -->
        <div class="bottom-row">
          <div class="runtime-block">
            <i class="fas fa-clock"></i>
            <span>当前时辰：</span>
            <span class="time-number">午时</span>
          </div>
          
          <div class="runtime-block">
            <i class="fas fa-bolt"></i>
            <span>载入耗时：</span>
            <span class="time-number">123.45 ms</span>
          </div>
        </div>
        
        <!-- 核心价值观 -->
        <div class="footer-values">
          <i class="fas fa-heart"></i> 富强· 自由· 平等· 爱国· 民主· 文明· 和谐· 公正· 法治· 敬业· 诚信· 友善 <i class="fas fa-heart"></i>
        </div>
        
        <!-- Helper广告 -->
        <div class="helper-ad">
          <span class="helper-content">
            <i class="fas fa-rocket"></i>
            <span>本站Sun-Panel美化增强 By-</span>
            <span class="helper-name">Sun-Panel-Helper</span>
            <span class="helper-tagline"> - 让您的Sun-Panel锦上添花~</span>
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.footer-preview {
  color: #fff;
  padding: 10px 0;
  text-align: center;
  font-size: 14px;
  line-height: 1.4;
  width: 100%;
  box-sizing: border-box;
  background: linear-gradient(135deg, #1a1a1a, #2c2c2c);
}

.footer-body {
  max-width: 1000px;
  margin: 0 auto;
  padding: 0 12px;
  width: 100%;
}

.footer-body .fas, .footer-body .fab {
  margin-right: 4px;
  font-size: 16px;
  vertical-align: -1px;
  transition: transform 0.3s ease;
  font-family: 'Font Awesome 6 Free', 'Font Awesome 6 Brands' !important;
}

/* 页脚样式 */
.footer-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  width: 100%;
}

.top-row, .middle-row, .bottom-row {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
  width: 100%;
  gap: 15px;
  margin: 3px 0;
}

.uptime-container {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.uptime-title {
  display: inline-flex;
  align-items: center;
  font-weight: 500;
}

.uptime-title .fas {
  color: #7ee7ff;
  animation: heartbeat 1.3s infinite;
}

.time-blocks {
  display: flex;
  align-items: center;
  gap: 6px;
}

.time-block {
  display: flex;
  align-items: center;
  background: rgba(0, 0, 0, 0.2);
  padding: 2px 8px;
  border-radius: 4px;
  transition: all 0.3s;
}

.time-value {
  color: #7ee7ff;
  font-weight: bold;
  font-size: 1.1em;
  margin-right: 2px;
}

.time-label {
  font-size: 0.8em;
  opacity: 0.85;
}

.time-number {
  color: #7ee7ff;
  font-weight: bold;
  margin: 0 2px;
  font-size: 1em;
}

.link-group {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 3px;
  flex-wrap: wrap;
  justify-content: center;
}

.footer-preview a {
  color: #fff;
  text-decoration: none;
  transition: all 0.3s ease;
  margin: 0 8px;
  white-space: nowrap;
  display: inline-flex;
  align-items: center;
}

.footer-preview a:hover {
  color: #7ee7ff;
  transform: translateY(-2px);
}

.footer-preview a:hover .fas,
.footer-preview a:hover .fab {
  transform: scale(1.1);
}

.runtime-block {
  display: flex;
  align-items: center;
}

.footer-values {
  font-size: 0.95em;
  opacity: 0.9;
  padding: 2px 0;
  transition: opacity 0.3s ease;
  text-align: center;
  width: 100%;
}

.footer-body .fas.fa-heart {
  margin: 0 2px;
  color: #ff7eb8;
  animation: pulse 1.5s infinite;
}

.helper-ad {
  margin-top: 3px;
  padding: 2px 0;
  width: 100%;
  display: flex;
  justify-content: center;
}

.helper-content {
  display: inline-flex;
  align-items: center;
  background: rgba(0, 0, 0, 0.2);
  padding: 4px 12px;
  border-radius: 20px;
  transition: all 0.3s;
  flex-wrap: wrap;
  justify-content: center;
  max-width: 100%;
}

.helper-name {
  color: #7ee7ff;
  font-weight: bold;
  font-size: 1.1em;
  letter-spacing: 0.3px;
  position: relative;
  display: inline-block;
  padding: 0 2px;
}

.helper-tagline {
  font-style: italic;
  margin-left: 5px;
  opacity: 0.95;
}

/* 动画效果 */
@keyframes heartbeat {
  0% { transform: scale(1); }
  15% { transform: scale(1.15); }
  30% { transform: scale(1); }
  45% { transform: scale(1.15); }
  60% { transform: scale(1); }
  100% { transform: scale(1); }
}

@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .uptime-container {
    flex-direction: column;
    gap: 6px;
  }
  
  .link-group {
    flex-direction: column;
    gap: 8px;
  }
  
  .bottom-row {
    flex-direction: column;
    gap: 8px;
  }
  
  .helper-content {
    flex-direction: column;
    padding: 6px 10px;
  }
  
  .helper-tagline {
    margin: 3px 0 0;
  }
}
</style> 