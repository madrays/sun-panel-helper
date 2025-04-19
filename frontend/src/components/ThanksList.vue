<template>
  <div class="cosmos-container">
    <!-- 缓慢旋转的行星背景 -->
    <div class="planet planet1"></div>
    <div class="planet planet2"></div>
    <div class="nebula nebula1"></div>
    
    <!-- 主标题与按钮 -->
    <div class="hero-section">
      <div class="title-container">
        <h1 class="main-title">感谢有你</h1>
        <div class="glowing-line"></div>
        <p class="subtitle">你们的支持是我们最宝贵的财富</p>
      </div>
      
      <div class="action-container">
        <el-button type="primary" class="support-button" @click="goToSupportPage">
          <div class="button-content">
            <el-icon class="button-icon"><Coffee /></el-icon>
            <span>我要支持</span>
          </div>
          <div class="button-glow"></div>
        </el-button>
      </div>
    </div>

    <!-- 炫酷的信息展示 -->
    <div class="info-banner">
      <div class="info-item">
        <div class="number">{{ supporters.length }}</div>
        <div class="label">支持者</div>
      </div>
      <div class="divider"></div>
      <div class="info-item">
        <div class="number">{{ new Date().getFullYear() }}</div>
        <div class="label">持续发展</div>
      </div>
      <div class="divider"></div>
      <div class="info-item">
        <div class="number">∞</div>
        <div class="label">无限可能</div>
      </div>
    </div>

    <!-- 支持者卡片网格 -->
    <div class="supporters-galaxy" ref="galaxyRef">
      <div class="galaxy-wrapper" :style="{ transform: `rotateY(${galaxyRotation}deg)` }">
        <div 
          v-for="(supporter, index) in displayedSupporters" 
          :key="index"
          class="supporter-star" 
          :class="{ active: activeSupporter === supporter }"
          :data-index="index"
          @mouseenter="showSupporterMessage(supporter)"
          @mouseleave="hideMessage"
        >
          <div class="supporter-avatar-container">
            <div class="avatar-glow" :style="{ 'animation-delay': `${index * 0.2}s` }"></div>
            <el-avatar :size="60" :src="supporter.avatar" class="supporter-avatar" />
            <div class="supporter-name">{{ supporter.id }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 悬浮的留言卡片 -->
    <transition name="message-fade">
      <div class="floating-message" v-if="activeSupporter">
        <div class="message-card">
          <div class="message-header">
            <el-avatar :size="48" :src="activeSupporter.avatar" />
            <div class="message-author">{{ activeSupporter.id }}</div>
          </div>
          <div class="message-content">
            <div class="quote-mark">"</div>
            {{ activeSupporter.message }}
            <div class="quote-mark closing">"</div>
          </div>
        </div>
      </div>
    </transition>

    <!-- 地平线渐变线 -->
    <div class="horizon-gradient"></div>

    <!-- 如果支持者过多，显示查看全部按钮 -->
    <div class="view-all-container" v-if="supporters.length > 12 && !showAll">
      <el-button class="view-all-button" type="primary" @click="toggleShowAll">
        <el-icon><View /></el-icon>
        查看全部 {{ supporters.length }} 位支持者
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Coffee, View } from '@element-plus/icons-vue'
import supportersData from '@/data/supporters.json'

// 定义支持者类型
interface Supporter {
  id: string;
  avatar: string;
  message: string;
}

const router = useRouter()
const supporters = computed(() => supportersData.supporters as Supporter[])
const activeSupporter = ref<Supporter | null>(null)
const showAll = ref(false)
const galaxyRef = ref<HTMLElement | null>(null)
const galaxyRotation = ref(0)

// 根据showAll状态决定显示哪些支持者
const displayedSupporters = computed(() => {
  return showAll.value ? supporters.value : supporters.value.slice(0, 12)
})

// 显示支持者留言
const showSupporterMessage = (supporter: Supporter) => {
  activeSupporter.value = supporter
}

// 隐藏留言
const hideMessage = () => {
  activeSupporter.value = null
}

// 切换显示全部
const toggleShowAll = () => {
  showAll.value = !showAll.value
}

// 跳转到支持作者页面
const goToSupportPage = () => {
  router.push('/dashboard/support')
}

// 3D视差效果处理
const handleMouseMove = (e: MouseEvent) => {
  if (!galaxyRef.value) return
  
  const rect = galaxyRef.value.getBoundingClientRect()
  const x = e.clientX - rect.left - rect.width / 2
  
  // 根据鼠标位置轻微旋转星系
  galaxyRotation.value = x * 0.02
}

// 随机显示留言的功能
let messageInterval: ReturnType<typeof setInterval>
onMounted(() => {
  window.addEventListener('mousemove', handleMouseMove)
  
  // 设置星星的位置
  const stars = document.querySelectorAll('.supporter-star')
  stars.forEach((star, index) => {
    const total = supporters.value.length
    const maxRows = Math.ceil(total / 4)
    const row = Math.floor(index / 4) 
    const col = index % 4
  
    // 为每行添加一点随机偏移，创造不规则的分布感
    const randomOffsetX = Math.sin(index * 0.5) * 3
    const randomOffsetY = Math.cos(index * 0.7) * 3
    const randomOffsetZ = (Math.random() - 0.5) * 50
  
    // 计算3D位置
    const x = col * 25 + randomOffsetX
    const y = row * 25 + randomOffsetY
    const z = randomOffsetZ
    
    star.setAttribute('style', `transform: translate3d(${x}%, ${y}%, ${z}px); transition-delay: ${index * 0.05}s;`)
  })
  
  // 每20秒随机显示一位支持者的留言
  messageInterval = setInterval(() => {
    if (!activeSupporter.value) {
      const randomIndex = Math.floor(Math.random() * supporters.value.length)
      activeSupporter.value = supporters.value[randomIndex]
      
      setTimeout(() => {
        if (activeSupporter.value === supporters.value[randomIndex]) {
          activeSupporter.value = null
        }
      }, 5000)
    }
  }, 20000)
})

onUnmounted(() => {
  window.removeEventListener('mousemove', handleMouseMove)
  clearInterval(messageInterval)
})
</script>

<style scoped lang="scss">
.cosmos-container {
  position: relative;
  width: 100%;
  min-height: 700px;
  padding: 30px;
  overflow: hidden;
  perspective: 1000px;
}

/* 行星背景 */
.planet {
  position: absolute;
  border-radius: 50%;
  opacity: 0.15;
  filter: blur(10px);
  z-index: -1;
}

.planet1 {
  width: 300px;
  height: 300px;
  background: radial-gradient(circle at 30% 40%, #4285f4, #050a27);
  top: -100px;
  right: -50px;
  animation: float 40s linear infinite;
}

.planet2 {
  width: 200px;
  height: 200px;
  background: radial-gradient(circle at 70% 30%, #ea4335, #050a27);
  bottom: -70px;
  left: -50px;
  animation: float 50s linear reverse infinite;
}

.nebula {
  position: absolute;
  filter: blur(30px);
  opacity: 0.1;
  z-index: -2;
}

.nebula1 {
  width: 600px;
  height: 200px;
  background: radial-gradient(ellipse at center, #4285f4 0%, transparent 70%);
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  animation: pulse 15s ease-in-out infinite;
}

/* 主标题区 */
.hero-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 50px;
  position: relative;
  z-index: 2;
  
  .title-container {
    .main-title {
      font-size: 3rem;
      font-weight: 700;
      margin: 0 0 10px 0;
      background: linear-gradient(to right, #4285f4, #34a853, #fbbc05, #ea4335);
      -webkit-background-clip: text;
      background-clip: text;
      color: transparent;
      letter-spacing: 2px;
      transform: skew(-5deg);
      text-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
    }
    
    .glowing-line {
      width: 80px;
      height: 3px;
      background: linear-gradient(90deg, #4285f4, #34a853);
      margin: 15px 0;
      position: relative;
      border-radius: 3px;
      
      &::after {
        content: '';
        position: absolute;
        top: -2px;
        left: 0;
        right: 0;
        bottom: -2px;
        background: inherit;
        filter: blur(4px);
        opacity: 0.6;
        border-radius: inherit;
      }
    }
    
    .subtitle {
      font-size: 1.2rem;
      color: rgba(255, 255, 255, 0.8);
      margin: 0;
      font-weight: 300;
    }
  }
  
  .action-container {
    .support-button {
      position: relative;
      overflow: hidden;
      padding: 0;
      background: linear-gradient(135deg, #4285f4, #34a853);
      border: none;
      border-radius: 50px;
      box-shadow: 0 4px 15px rgba(66, 133, 244, 0.4);
      transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
      isolation: isolate;
      
      .button-content {
        position: relative;
        z-index: 2;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 10px;
        padding: 12px 30px;
        font-size: 1.1rem;
        font-weight: 600;
      }
      
      .button-glow {
        position: absolute;
        inset: 0;
        background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
        transform: translateX(-100%);
        z-index: 1;
      }
      
      &:hover {
        transform: translateY(-3px) scale(1.05);
        box-shadow: 0 8px 25px rgba(66, 133, 244, 0.6);
        
        .button-glow {
          animation: shine 1.5s ease-in-out infinite;
        }
      }
      
      &:active {
        transform: translateY(0);
      }
      
      .button-icon {
        font-size: 18px;
      }
    }
  }
}

/* 信息横幅 */
.info-banner {
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 40px auto;
  padding: 20px;
  max-width: 700px;
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(10px);
  border-radius: 15px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  position: relative;
  z-index: 2;
  
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: inherit;
    padding: 1px;
    background: linear-gradient(90deg, #4285f4, #34a853, #fbbc05, #ea4335);
    -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    -webkit-mask-composite: xor;
    mask-composite: exclude;
    opacity: 0.5;
  }
  
  .info-item {
    text-align: center;
    flex: 1;
    
    .number {
      font-size: 2.5rem;
      font-weight: 700;
      background: linear-gradient(to right, #4285f4, #34a853);
      -webkit-background-clip: text;
      background-clip: text;
      color: transparent;
      margin-bottom: 5px;
    }
    
    .label {
      font-size: 0.9rem;
      color: rgba(255, 255, 255, 0.6);
      text-transform: uppercase;
      letter-spacing: 1px;
    }
  }
  
  .divider {
    width: 1px;
    height: 40px;
    background: rgba(255, 255, 255, 0.1);
    margin: 0 20px;
  }
}

/* 3D支持者星系 */
.supporters-galaxy {
  position: relative;
  width: 100%;
  height: 500px;
  margin: 40px 0;
  perspective: 1000px;
  
  .galaxy-wrapper {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    transform-style: preserve-3d;
    transition: transform 0.8s ease-out;
  }
  
  .supporter-star {
    position: absolute;
    top: 0;
    left: 0;
    transform-style: preserve-3d;
    transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
    opacity: 1;
    
    &.active {
      z-index: 10;
      transform: scale(1.2) translateZ(50px) !important;
      
      .avatar-glow {
        opacity: 1;
      }
    }
    
    .supporter-avatar-container {
      position: relative;
      display: flex;
      flex-direction: column;
      align-items: center;
      
      .avatar-glow {
        position: absolute;
        width: 70px;
        height: 70px;
        border-radius: 50%;
        background: radial-gradient(circle, #4285f4 0%, transparent 70%);
        filter: blur(8px);
        opacity: 0;
        transition: opacity 0.3s ease;
      }
      
      .supporter-avatar {
        border: 2px solid rgba(255, 255, 255, 0.3);
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
        transition: all 0.3s ease;
        z-index: 1;
        animation: pulse 2s infinite alternate;
      }
      
      .supporter-name {
        margin-top: 10px;
        font-weight: 500;
        font-size: 0.9rem;
        color: rgba(255, 255, 255, 0.9);
        text-shadow: 0 2px 5px rgba(0, 0, 0, 0.5);
        text-align: center;
        background: rgba(0, 0, 0, 0.3);
        padding: 4px 12px;
        border-radius: 20px;
      }
    }
  }
}

/* 悬浮留言 */
.floating-message {
  position: fixed;
  bottom: 30px;
  right: 30px;
  max-width: 350px;
  z-index: 100;
  
  .message-card {
    background: rgba(30, 34, 51, 0.8);
    backdrop-filter: blur(10px);
    border-radius: 15px;
    padding: 20px;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
    border: 1px solid rgba(255, 255, 255, 0.1);
    
    &::before {
      content: '';
      position: absolute;
      inset: 0;
      border-radius: inherit;
      padding: 1px;
      background: linear-gradient(90deg, #4285f4, #34a853);
      -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
      mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
      -webkit-mask-composite: xor;
      mask-composite: exclude;
    }
    
    .message-header {
      display: flex;
      align-items: center;
      margin-bottom: 15px;
      
      .message-author {
        margin-left: 15px;
        font-weight: 600;
        font-size: 1.1rem;
        color: rgba(255, 255, 255, 0.9);
      }
    }
    
    .message-content {
      position: relative;
      color: rgba(255, 255, 255, 0.8);
      font-size: 1rem;
      line-height: 1.6;
      padding: 0 18px;
      
      .quote-mark {
        position: absolute;
        top: -10px;
        left: -5px;
        font-size: 36px;
        color: rgba(66, 133, 244, 0.4);
        font-family: serif;
        
        &.closing {
          top: auto;
          left: auto;
          right: -5px;
          bottom: -30px;
        }
      }
    }
  }
}

/* 地平线效果 */
.horizon-gradient {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 150px;
  background: linear-gradient(to top, rgba(5, 10, 39, 0.9), transparent);
  z-index: 1;
  pointer-events: none;
}

/* 查看全部按钮 */
.view-all-container {
  text-align: center;
  margin-top: 20px;
  position: relative;
  z-index: 5;
  
  .view-all-button {
    padding: 10px 24px;
    background: rgba(66, 133, 244, 0.2);
    border: 1px solid rgba(66, 133, 244, 0.3);
    color: rgba(255, 255, 255, 0.9);
    border-radius: 30px;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    gap: 8px;
    margin: 0 auto;
    
    &:hover {
      background: rgba(66, 133, 244, 0.3);
      border-color: rgba(66, 133, 244, 0.5);
      transform: translateY(-2px);
    }
  }
}

/* 动画效果 */
@keyframes float {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  50% { transform: translateY(-20px) rotate(5deg); }
}

@keyframes pulse {
  0%, 100% { opacity: 0.8; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.05); }
}

@keyframes shine {
  0% { transform: translateX(-100%); }
  20%, 100% { transform: translateX(100%); }
}

.message-fade-enter-active,
.message-fade-leave-active {
  transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.message-fade-enter-from,
.message-fade-leave-to {
  opacity: 0;
  transform: translateY(30px);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .cosmos-container {
    padding: 20px 15px;
  }
  
  .hero-section {
    flex-direction: column;
    text-align: center;
    gap: 20px;
    
    .title-container {
      .main-title {
        font-size: 2.2rem;
      }
      
      .glowing-line {
        margin: 15px auto;
      }
    }
  }
  
  .info-banner {
    flex-direction: column;
    gap: 20px;
    
    .divider {
      width: 50px;
      height: 1px;
      margin: 0;
    }
  }
  
  .supporters-galaxy {
    height: 600px;
  }
  
  .floating-message {
    bottom: 20px;
    right: 20px;
    left: 20px;
    max-width: none;
  }
}
</style> 