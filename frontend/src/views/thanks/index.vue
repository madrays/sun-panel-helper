<template>
  <div class="thanks-container">
    <!-- 创意背景 -->
    <div class="creative-bg">
      <div class="bg-pattern"></div>
      <div class="circle-glow circle-1"></div>
      <div class="circle-glow circle-2"></div>
      <div class="circle-glow circle-3"></div>
      <div class="star-field">
        <div v-for="n in 30" :key="`star-${n}`" class="star" :style="{
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
          animationDelay: `${Math.random() * 5}s`
        }"></div>
      </div>
    </div>
    
    <!-- 横幅 -->
    <div class="ribbon">
      感谢您的每一份支持 ♥
    </div>
    
    <!-- 主内容区 -->
    <div class="content-wrapper">
      <div class="header">
        <h1 class="title">我们的支持者</h1>
        <div class="subtitle-container">
          <p class="subtitle">是你们让我们变得更好</p>
          <div class="heart-icon">❤️</div>
        </div>
      </div>
      
      <div class="stats-bar">
        <div class="stat-badge">
          <div class="badge-icon">👥</div>
          <div class="badge-content">
            <div class="badge-value">{{ supporters.length }}</div>
            <div class="badge-label">支持者</div>
          </div>
        </div>
        <div class="stat-badge">
          <div class="badge-icon">🌟</div>
          <div class="badge-content">
            <div class="badge-value">{{ new Date().getFullYear() }}</div>
            <div class="badge-label">成立年份</div>
          </div>
        </div>
        <div class="stat-badge">
          <div class="badge-icon">💌</div>
          <div class="badge-content">
            <div class="badge-value">∞</div>
            <div class="badge-label">感谢之情</div>
          </div>
        </div>
      </div>
      
      <!-- 创意支持者展示 -->
      <div class="supporters-showcase">
        <div 
          v-for="(supporter, index) in supporters" 
          :key="supporter.id"
          class="supporter-card"
          :style="{
            animationDelay: `${index * 0.1}s`
          }"
        >
          <div class="card-inner">
            <div class="card-front">
              <div class="avatar-frame">
                <div class="avatar-glow"></div>
                <div class="avatar-ring"></div>
                <img 
                  :src="supporter.avatar" 
                  :alt="supporter.id"
                  @error="() => handleAvatarError(supporter, index)"
                  class="avatar-img"
                />
                <div v-if="customAvatars[supporter.id]" class="custom-avatar" :style="{background: getAvatarColor(index)}">
                  {{ getInitials(supporter.id) }}
                </div>
              </div>
              <div class="supporter-info">
                <div class="supporter-name">{{ supporter.id }}</div>
                <div class="message-preview">{{ truncateMessage(supporter.message || '感谢支持！') }}</div>
              </div>
              
              <div class="hover-hint">
                <div class="hint-icon">
                  <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                </div>
                <span>查看留言</span>
              </div>
            </div>
            
            <div class="card-back">
              <div class="message-container">
                <div class="message-title">来自 {{ supporter.id }} 的留言</div>
                <div class="message-content-full">{{ supporter.message || '感谢支持！' }}</div>
                <div class="message-time">{{ getRandomTime() }}</div>
              </div>
              <div class="back-btn">
                <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none">
                  <path d="M19 12H5M12 19l-7-7 7-7"></path>
                </svg>
                <span>返回</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 支持按钮 -->
    <div class="support-button" @click="goToSupportPage">
      <div class="button-shine"></div>
      <div class="button-content">
        <el-icon class="button-icon"><Coffee /></el-icon>
        <span>支持我们</span>
      </div>
    </div>
    
    <!-- 彩带装饰 -->
    <div class="confetti">
      <div v-for="n in 20" :key="`confetti-${n}`" class="confetti-piece" :style="{
        '--delay': `${Math.random() * 5}s`,
        '--duration': `${Math.random() * 10 + 10}s`,
        '--size': `${Math.random() * 10 + 5}px`,
        '--color': `hsl(${Math.random() * 360}, 80%, 60%)`
      }"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { Coffee } from '@element-plus/icons-vue'
import supportersData from '@/data/supporters.json'

interface Supporter {
  id: string;
  avatar: string;
  message: string;
}

const router = useRouter()
const supporters = computed(() => supportersData.supporters as Supporter[])
const customAvatars = reactive<Record<string, boolean>>({})

// 获取头像颜色（根据索引生成不同颜色）
const getAvatarColor = (index: number) => {
  const colors = [
    'linear-gradient(45deg, #ff9a9e 0%, #fad0c4 99%, #fad0c4 100%)',
    'linear-gradient(120deg, #a1c4fd 0%, #c2e9fb 100%)',
    'linear-gradient(to top, #fdcbf1 0%, #fdcbf1 1%, #e6dee9 100%)',
    'linear-gradient(to top, #a8edea 0%, #fed6e3 100%)',
    'linear-gradient(to top, #d299c2 0%, #fef9d7 100%)',
    'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
    'linear-gradient(to top, #5ee7df 0%, #b490ca 100%)',
    'linear-gradient(to right, #eea2a2 0%, #bbc1bf 19%, #57c6e1 42%, #b49fda 79%, #7ac5d8 100%)'
  ]
  return colors[index % colors.length]
}

// 从用户ID提取首字母
const getInitials = (id: string) => {
  if (!id) return '?'
  return id.substring(0, 2).toUpperCase()
}

// 处理头像加载错误
const handleAvatarError = (supporter: Supporter, index: number) => {
  console.log('Avatar load error:', supporter.avatar)
  // 设置使用自定义头像
  customAvatars[supporter.id] = true
}

// 跳转到支持页面
const goToSupportPage = () => {
  router.push('/dashboard/support')
}

// 截断消息
const truncateMessage = (message: string) => {
  if (!message) return '感谢支持！'
  return message.length > 20 ? `${message.substring(0, 20)}...` : message
}

// 获取随机时间
const getRandomTime = () => {
  const months = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']
  const month = months[Math.floor(Math.random() * months.length)]
  const day = Math.floor(Math.random() * 28) + 1
  return `${month} ${day}日`
}
</script>

<style scoped lang="scss">
/* 全局样式 */
.thanks-container {
  position: relative;
  min-height: 100vh;
  background: #fafafa;
  overflow: hidden;
  font-family: "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif;
  color: #333;
  padding-bottom: 100px;
}

/* 创意背景 */
.creative-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  overflow: hidden;
}

.bg-pattern {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: 
    radial-gradient(circle at 30% 40%, rgba(252, 222, 234, 0.3) 0%, rgba(252, 222, 234, 0) 20%),
    radial-gradient(circle at 70% 60%, rgba(142, 197, 252, 0.3) 0%, rgba(142, 197, 252, 0) 20%);
  opacity: 0.8;
}

.circle-glow {
  position: absolute;
  border-radius: 50%;
  filter: blur(60px);
  opacity: 0.5;
}

.circle-1 {
  top: -10%;
  left: -10%;
  width: 40%;
  height: 40%;
  background: rgba(255, 204, 204, 0.5);
  animation: float-slow 20s ease-in-out infinite alternate;
}

.circle-2 {
  top: 60%;
  right: -10%;
  width: 35%;
  height: 35%;
  background: rgba(204, 204, 255, 0.5);
  animation: float-slow 25s ease-in-out infinite alternate-reverse;
}

.circle-3 {
  bottom: -10%;
  left: 40%;
  width: 25%;
  height: 25%;
  background: rgba(255, 230, 204, 0.5);
  animation: float-slow 22s ease-in-out infinite alternate;
}

.star-field {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
}

.star {
  position: absolute;
  width: 2px;
  height: 2px;
  background-color: white;
  border-radius: 50%;
  box-shadow: 0 0 4px 1px rgba(255, 255, 255, 0.7);
  animation: twinkle 4s infinite ease-in-out;
}

@keyframes twinkle {
  0%, 100% { opacity: 0.2; }
  50% { opacity: 1; }
}

@keyframes float-slow {
  0% { transform: translateY(0) translateX(0); }
  100% { transform: translateY(20px) translateX(20px); }
}

/* 横幅 */
.ribbon {
  position: absolute;
  top: 30px;
  right: -60px;
  background: #fb7299;
  color: white;
  padding: 8px 60px;
  font-size: 0.9rem;
  font-weight: bold;
  transform: rotate(45deg);
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1);
  z-index: 10;
  letter-spacing: 1px;
}

/* 主内容区 */
.content-wrapper {
  position: relative;
  max-width: 1200px;
  margin: 0 auto;
  padding: 60px 20px 20px;
  z-index: 2;
}

.header {
  text-align: center;
  margin-bottom: 40px;
}

.title {
  font-size: 3rem;
  font-weight: 800;
  background: linear-gradient(120deg, #ff7a7a, #5e72e4);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  margin-bottom: 10px;
  position: relative;
  display: inline-block;
  
  &::after {
    content: '';
    position: absolute;
    bottom: -5px;
    left: 10%;
    width: 80%;
    height: 4px;
    background: linear-gradient(90deg, transparent, #ff7a7a, #5e72e4, transparent);
    border-radius: 2px;
  }
}

.subtitle-container {
  display: flex;
  align-items: center;
  justify-content: center;
}

.subtitle {
  font-size: 1.2rem;
  color: #666;
  margin: 0;
}

.heart-icon {
  font-size: 1.3rem;
  margin-left: 6px;
  animation: heartbeat 1.5s ease infinite;
}

@keyframes heartbeat {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.15); }
}

/* 统计徽章 */
.stats-bar {
  display: flex;
  justify-content: center;
  gap: 30px;
  margin-bottom: 50px;
  flex-wrap: wrap;
}

.stat-badge {
  display: flex;
  align-items: center;
  background: white;
  padding: 10px 20px;
  border-radius: 50px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.badge-icon {
  font-size: 1.8rem;
  margin-right: 10px;
}

.badge-content {
  display: flex;
  flex-direction: column;
}

.badge-value {
  font-size: 1.2rem;
  font-weight: 700;
  color: #333;
}

.badge-label {
  font-size: 0.8rem;
  color: #666;
}

/* 创意支持者展示 */
.supporters-showcase {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 15px;
  padding: 20px 0;
  perspective: 1000px;
}

.supporter-card {
  width: 180px;
  height: 240px;
  perspective: 1000px;
  animation: float-in 0.6s ease-out forwards;
  opacity: 0;
  transform: translateY(30px);
  
  &:hover .card-inner {
    transform: rotateY(180deg);
  }
}

@keyframes float-in {
  0% {
    opacity: 0;
    transform: translateY(50px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

.card-inner {
  position: relative;
  width: 100%;
  height: 100%;
  text-align: center;
  transition: transform 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  transform-style: preserve-3d;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  border-radius: 16px;
}

.card-front, .card-back {
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  border-radius: 16px;
  overflow: hidden;
}

.card-front {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
  border: 1px solid rgba(255, 255, 255, 0.6);
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(135deg, 
      rgba(255, 255, 255, 0.5) 0%, 
      rgba(255, 255, 255, 0) 50%, 
      rgba(255, 255, 255, 0.2) 100%);
    z-index: 1;
    pointer-events: none;
  }
}

.card-back {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  transform: rotateY(180deg);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 25px;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: 
      radial-gradient(circle at 20% 20%, rgba(255, 255, 255, 0.3) 0%, rgba(255, 255, 255, 0) 50%),
      radial-gradient(circle at 80% 80%, rgba(255, 255, 255, 0.3) 0%, rgba(255, 255, 255, 0) 50%);
    z-index: 1;
    pointer-events: none;
  }
}

.avatar-frame {
  position: relative;
  width: 80px;
  height: 80px;
  margin-bottom: 12px;
}

.avatar-glow {
  position: absolute;
  top: -10px;
  left: -10px;
  width: calc(100% + 20px);
  height: calc(100% + 20px);
  border-radius: 50%;
  background: linear-gradient(45deg, rgba(255, 107, 129, 0.6), rgba(97, 118, 251, 0.6));
  filter: blur(10px);
  animation: pulse 2s infinite alternate;
}

@keyframes pulse {
  0% { opacity: 0.4; transform: scale(0.95); }
  100% { opacity: 0.8; transform: scale(1.05); }
}

.avatar-ring {
  position: absolute;
  top: -5px;
  left: -5px;
  width: calc(100% + 10px);
  height: calc(100% + 10px);
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.8);
  animation: spin 15s linear infinite;
  
  &::before, &::after {
    content: '';
    position: absolute;
    width: 10px;
    height: 10px;
    background: white;
    border-radius: 50%;
  }
  
  &::before {
    top: 10%;
    left: 50%;
    transform: translateX(-50%);
    box-shadow: 0 0 10px rgba(255, 255, 255, 0.8);
  }
  
  &::after {
    bottom: 10%;
    left: 50%;
    transform: translateX(-50%);
    box-shadow: 0 0 10px rgba(255, 255, 255, 0.8);
  }
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.avatar-img {
  position: relative;
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
  z-index: 2;
  transition: all 0.3s ease;
  border: 3px solid white;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.custom-avatar {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.8rem;
  font-weight: bold;
  color: white;
  z-index: 2;
  border-radius: 50%;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  border: 3px solid white;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.supporter-info {
  position: relative;
  z-index: 2;
  margin-top: 10px;
  width: 100%;
}

.supporter-name {
  font-size: 1rem;
  font-weight: 700;
  color: #333;
  margin-bottom: 4px;
}

.message-preview {
  font-size: 0.8rem;
  color: #666;
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.hover-hint {
  position: absolute;
  bottom: 10px;
  right: 10px;
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.7rem;
  color: #555;
  opacity: 0.7;
  z-index: 2;
  
  .hint-icon {
    display: flex;
    animation: blink 2s infinite;
  }
}

@keyframes blink {
  0%, 100% { opacity: 0.5; }
  50% { opacity: 1; }
}

.message-container {
  width: 100%;
  text-align: left;
}

.message-title {
  font-size: 0.95rem;
  font-weight: 700;
  margin-bottom: 12px;
  position: relative;
  display: inline-block;
  
  &::after {
    content: '';
    position: absolute;
    bottom: -4px;
    left: 0;
    width: 30px;
    height: 2px;
    background: rgba(255, 255, 255, 0.7);
    border-radius: 2px;
  }
}

.message-content-full {
  font-size: 0.85rem;
  line-height: 1.5;
  margin-bottom: 15px;
  max-height: 150px;
  overflow-y: auto;
  
  &::-webkit-scrollbar {
    width: 4px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.5);
    border-radius: 4px;
  }
}

.message-time {
  font-size: 0.7rem;
  opacity: 0.7;
  text-align: right;
}

.back-btn {
  position: absolute;
  bottom: 15px;
  left: 15px;
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.7rem;
  color: rgba(255, 255, 255, 0.8);
  cursor: pointer;
  z-index: 2;
  
  &:hover {
    color: white;
  }
}

/* 支持按钮 */
.support-button {
  position: fixed;
  bottom: 30px;
  right: 30px;
  width: 150px;
  height: 50px;
  background: linear-gradient(135deg, #ff7a7a, #5e72e4);
  border-radius: 50px;
  box-shadow: 0 10px 20px rgba(94, 114, 228, 0.3);
  cursor: pointer;
  overflow: hidden;
  z-index: 100;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 15px 30px rgba(94, 114, 228, 0.4);
    
    .button-shine {
      transform: skewX(-20deg) translateX(250px);
      transition: all 0.7s ease;
    }
  }
  
  &:active {
    transform: translateY(0);
    box-shadow: 0 5px 15px rgba(94, 114, 228, 0.3);
  }
}

.button-shine {
  position: absolute;
  top: 0;
  left: -150%;
  width: 100%;
  height: 100%;
  background: linear-gradient(to right, 
    rgba(255, 255, 255, 0) 0%,
    rgba(255, 255, 255, 0.8) 50%,
    rgba(255, 255, 255, 0) 100%
  );
  transform: skewX(-20deg);
  transition: all 0.3s ease;
}

.button-content {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 700;
  font-size: 1rem;
  letter-spacing: 0.5px;
  z-index: 1;
}

.button-icon {
  margin-right: 8px;
  font-size: 1.2rem;
}

/* 彩带装饰 */
.confetti {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1;
}

.confetti-piece {
  position: absolute;
  width: var(--size);
  height: calc(var(--size) * 0.4);
  background: var(--color);
  top: -20px;
  left: calc(var(--left, random(100)) * 1%);
  animation: confetti-fall var(--duration) var(--delay) linear infinite;
  transform-origin: center center;
  opacity: 0.8;
}

@keyframes confetti-fall {
  0% {
    top: -20px;
    transform: rotate(0deg);
  }
  100% {
    top: 100vh;
    transform: rotate(720deg);
  }
}

/* 响应式调整 */
@media (max-width: 768px) {
  .title {
    font-size: 2.2rem;
  }
  
  .stats-bar {
    gap: 15px;
  }
  
  .stat-badge {
    padding: 8px 15px;
  }
  
  .badge-icon {
    font-size: 1.5rem;
  }
  
  .ribbon {
    font-size: 0.8rem;
    padding: 6px 50px;
  }
  
  .supporter-card {
    width: 150px;
    height: 200px;
  }
  
  .avatar-frame {
    width: 60px;
    height: 60px;
  }
  
  .custom-avatar {
    font-size: 1.5rem;
  }
  
  .support-button {
    width: 120px;
    height: 45px;
    font-size: 0.9rem;
  }
}
</style>
 