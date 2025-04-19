<script setup lang="ts">
import { onMounted, ref } from 'vue'

// 初始化状态
const previewContainer = ref<HTMLElement | null>(null)
const initialized = ref(false)

// 初始化预览组件
onMounted(() => {
  if (!initialized.value && previewContainer.value) {
    initClickEffect(previewContainer.value)
    initialized.value = true
  }
})

// 初始化点击特效
function initClickEffect(container: HTMLElement) {
  // 左键点击索引
  let a_idx = 0
  // 文本内容数组 - 社会主义核心价值观词汇
  const leftClickTexts = [
    "富强", "民主", "文明", "和谐", 
    "自由", "平等", "公正", "法治", 
    "爱国", "敬业", "诚信", "友善"
  ]
  // 左键点击符号数组
  const leftSymbols = ["✨", "🌟", "💫", "⭐", "🌠", "🌈"]
  // 文字颜色数组
  const textColors = [
    "#ff7eb9", "#ff65a3", "#7afcff", "#feff9c", 
    "#fff740", "#ff65a3", "#a2a2fb", "#96f7d2"
  ]

  // 添加鼠标跟随效果
  addMouseTrail(container)

  // 绑定点击事件
  container.addEventListener('click', (event) => {
    createClickEffect(event, leftClickTexts, a_idx, leftSymbols, textColors, "left", container)
    a_idx = (a_idx + 1) % leftClickTexts.length
  })

  // 绑定右键点击事件
  container.addEventListener('contextmenu', (event) => {
    event.preventDefault() // 阻止默认右键菜单
    createClickEffect(event, leftClickTexts, a_idx, leftSymbols, textColors, "right", container)
    a_idx = (a_idx + 1) % leftClickTexts.length
    return false
  })
}

// 创建点击效果
function createClickEffect(
  event: MouseEvent, 
  textArray: string[], 
  idx: number, 
  symbolArray: string[], 
  colorArray: string[], 
  clickType: string,
  container: HTMLElement
) {
  // 随机选择符号
  const symbol = symbolArray[Math.floor(Math.random() * symbolArray.length)]
  
  // 创建元素
  const element = document.createElement("div")
  element.className = "click-effect-" + clickType
  
  // 随机选择颜色
  const color = colorArray[Math.floor(Math.random() * colorArray.length)]
  
  // 设置内容
  const displayText = symbol + " " + textArray[idx] + " " + symbol
  
  // 添加到页面
  container.appendChild(element)
  element.innerHTML = displayText
  
  // 获取相对容器的位置
  const rect = container.getBoundingClientRect()
  const x = event.clientX - rect.left
  const y = event.clientY - rect.top
  
  // 随机配置
  const size = 14 + Math.floor(Math.random() * 8)
  const initialScale = 0.4 + Math.random() * 0.6
  const finalScale = 1.0 + Math.random() * 0.5
  const randomAngle = Math.random() * 40 - 20 // -20 到 20 度
  const moveDistance = 50 + Math.random() * 40 // 移动距离
  
  // 初始样式
  element.style.cssText = `
    position: absolute;
    z-index: 9999;
    left: ${x}px;
    top: ${y}px;
    font-size: ${size}px;
    font-weight: bold;
    color: ${color};
    pointer-events: none;
    transform: translate(-50%, -50%) scale(${initialScale}) rotate(0deg);
    opacity: 0;
    text-shadow: 0 2px 10px rgba(0,0,0,0.15);
    white-space: nowrap;
    user-select: none;
    transition: all 0.8s cubic-bezier(0.165, 0.84, 0.44, 1);
  `
  
  // 强制重排，确保动画生效
  void element.offsetWidth
  
  // 动画效果
  setTimeout(() => {
    element.style.opacity = "1"
    element.style.transform = `
      translate(-50%, calc(-50% - ${moveDistance}px)) 
      scale(${finalScale}) 
      rotate(${randomAngle}deg)
    `
    
    // 淡出并移除
    setTimeout(() => {
      element.style.opacity = "0"
      setTimeout(() => {
        if (element.parentNode) {
          container.removeChild(element)
        }
      }, 200)
    }, 600)
  }, 10)
}

// 添加鼠标跟随效果
function addMouseTrail(container: HTMLElement) {
  const trailContainer = document.createElement('div')
  trailContainer.className = 'mouse-trail-container'
  trailContainer.style.cssText = `
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 9998;
  `
  container.appendChild(trailContainer)
  
  const createTrailDot = () => {
    const dot = document.createElement('div')
    dot.className = 'trail-dot'
    dot.style.cssText = `
      position: absolute;
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.5);
      box-shadow: 0 0 10px rgba(100, 230, 255, 0.8);
      transform: translate(-50%, -50%);
      pointer-events: none;
      opacity: 0;
      transition: opacity 0.1s ease;
    `
    trailContainer.appendChild(dot)
    return dot
  }
  
  const dots = Array.from({ length: 12 }, createTrailDot)
  const positions = Array(dots.length).fill({ x: 0, y: 0 })
  let mouseX = 0, mouseY = 0
  let isMoving = false
  let timeout: number | null = null
  
  container.addEventListener('mousemove', e => {
    const rect = container.getBoundingClientRect()
    mouseX = e.clientX - rect.left
    mouseY = e.clientY - rect.top
    isMoving = true
    
    if (timeout) {
      clearTimeout(timeout)
    }
    
    dots.forEach(dot => {
      dot.style.opacity = '1'
    })
    
    timeout = window.setTimeout(() => {
      isMoving = false
      dots.forEach(dot => {
        dot.style.opacity = '0'
      })
    }, 100)
  })
  
  function updateTrail() {
    if (isMoving) {
      // 将新位置添加到数组开头
      positions.unshift({ x: mouseX, y: mouseY })
      // 移除最后一个位置以保持数组长度不变
      positions.pop()
    }
    
    // 更新每个点的位置
    dots.forEach((dot, i) => {
      const pos = positions[i] || positions[positions.length - 1]
      
      // 使颜色随索引变化
      const hue = (i * 30) % 360
      dot.style.background = `hsla(${hue}, 100%, 70%, ${0.7 - i * 0.05})`
      dot.style.width = `${Math.max(4, 12 - i)}px`
      dot.style.height = `${Math.max(4, 12 - i)}px`
      dot.style.boxShadow = `0 0 ${8 - i * 0.6}px hsla(${hue}, 100%, 70%, 0.8)`
      
      // 应用位置
      dot.style.transform = `translate(${pos.x}px, ${pos.y}px)`
    })
    
    requestAnimationFrame(updateTrail)
  }
  
  updateTrail()
}
</script>

<template>
  <div ref="previewContainer" class="preview-container">
    <div class="instruction">在此区域点击鼠标左键或右键查看效果</div>
  </div>
</template>

<style scoped>
.preview-container {
  position: relative;
  width: 100%;
  height: 100%;
  background-color: #f8f9fb;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
}

.instruction {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 14px;
  color: #666;
  text-align: center;
  padding: 10px;
  border-radius: 4px;
  background-color: rgba(255, 255, 255, 0.8);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  pointer-events: none;
  z-index: 1;
}

.click-effect-left, .click-effect-right {
  font-family: 'Noto Sans SC', 'Microsoft YaHei', sans-serif;
  text-shadow: 0 1px 3px rgba(0,0,0,0.3);
}
</style> 