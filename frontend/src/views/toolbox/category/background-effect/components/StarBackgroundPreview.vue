<script setup lang="ts">
import { onMounted, ref } from 'vue'

// 定义星星对象接口
interface Star {
  element: HTMLDivElement;
  x: number;
  y: number;
  size: number;
  color: string;
  opacity: number;
}

// 初始化状态
const previewContainer = ref<HTMLElement | null>(null)
const initialized = ref(false)

// 初始化预览组件
onMounted(() => {
  if (!initialized.value && previewContainer.value) {
    initStarBackground(previewContainer.value)
    initialized.value = true
  }
})

// 初始化星空背景
function initStarBackground(container: HTMLElement) {
  // 创建星星
  const stars: Star[] = []
  const starCount = 20
  const colors = ['255,255,255', '200,200,255', '255,255,200']

  // 创建样式
  const style = document.createElement('style')
  style.textContent = `
    @keyframes twinkle-star {
      0%, 100% { transform: scale(1); opacity: 0.7; }
      50% { transform: scale(1.2); opacity: 1; }
    }
  `
  container.appendChild(style)

  // 创建星星 DOM 元素
  for (let i = 0; i < starCount; i++) {
    const star = document.createElement('div')
    star.className = 'star-lite'
    star.style.cssText = `
      position: absolute;
      border-radius: 50%;
      pointer-events: none;
      animation: twinkle-star 1s ease-in-out infinite;
      animation-delay: ${Math.random() * 2}s;
    `
    container.appendChild(star)
    
    stars.push({
      element: star,
      x: Math.random() * container.offsetWidth,
      y: Math.random() * container.offsetHeight,
      size: Math.random() * 4 + 1,
      color: colors[Math.floor(Math.random() * colors.length)],
      opacity: Math.random() * 0.5 + 0.3
    })
  }

  // 更新星星位置和样式
  function updateStars() {
    stars.forEach(star => {
      star.element.style.left = star.x + 'px'
      star.element.style.top = star.y + 'px'
      star.element.style.width = star.size + 'px'
      star.element.style.height = star.size + 'px'
      star.element.style.backgroundColor = `rgba(${star.color},${star.opacity})`
      
      // 移动星星
      star.x += 0.5
      star.y -= 0.5

      // 如果星星超出视图，则重新定位
      if (star.x > container.offsetWidth || star.y < 0) {
        if (Math.random() < 0.5) {
          // 从左边缘进入
          star.x = 0
          star.y = Math.random() * container.offsetHeight
        } else {
          // 从底部边缘进入
          star.x = Math.random() * container.offsetWidth
          star.y = container.offsetHeight
        }
      }
    })
    
    requestAnimationFrame(updateStars)
  }
  
  // 处理窗口大小变化
  window.addEventListener('resize', () => {
    stars.forEach(star => {
      if (star.x > container.offsetWidth) star.x = Math.random() * container.offsetWidth
      if (star.y > container.offsetHeight) star.y = Math.random() * container.offsetHeight
    })
  })

  // 开始动画
  updateStars()
}
</script>

<template>
  <div ref="previewContainer" class="preview-container">
    <div class="instruction">星空背景特效预览</div>
  </div>
</template>

<style scoped>
.preview-container {
  position: relative;
  width: 100%;
  height: 100%;
  background-color: #1a1a1a;
  border-radius: 8px;
  overflow: hidden;
}

.instruction {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 14px;
  color: #fff;
  text-align: center;
  padding: 10px;
  border-radius: 4px;
  background-color: rgba(0, 0, 0, 0.6);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  pointer-events: none;
  z-index: 1;
}
</style> 