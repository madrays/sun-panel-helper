<template>
  <div class="js-library">
    <div class="page-header">
      <h2>JS 功能库</h2>
      <p class="description">独立的JS功能组件，支持参数配置和实时预览</p>
    </div>

    <div class="widgets-grid">
      <div 
        v-for="id in cardOrder"
        :key="id"
        class="card-wrapper"
        draggable="true"
        @dragstart="handleDragStart($event, id)"
        @dragend="handleDragEnd"
        @dragover.prevent
        @drop="handleDrop($event, id)"
      >
        <MaxkbAiCard 
          v-if="id === 'maxkb-ai'"
          :is-deployed="deployedComponents.includes(id)"
          @click="handleCardClick(id)"
        />
        <SearchQuoteCard 
          v-if="id === 'search-quote'"
          :is-deployed="deployedComponents.includes(id)"
          @click="handleCardClick(id)"
        />
        <FishAnimationCard
          v-if="id === 'fish-animation'"
          :is-deployed="deployedComponents.includes(id)"
          @click="handleCardClick(id)"
        />
        <MarkdownEditorCard
          v-if="id === 'markdown-editor'"
          :is-deployed="deployedComponents.includes(id)"
          @click="handleCardClick(id)"
        />
        <TocNavCard
          v-if="id === 'toc-nav'"
          :is-deployed="deployedComponents.includes(id)"
          @click="handleCardClick(id)"
        />
        <MusicPlayerCard
          v-if="id === 'music-player'"
          :is-deployed="deployedComponents.includes(id)"
          @click="handleCardClick(id)"
        />
        <HideLoginCard
          v-if="id === 'hide-login'"
          :is-deployed="deployedComponents.includes(id)"
          @click="handleCardClick(id)"
        />
        <WeatherCard
          v-if="id === 'weather'"
          :is-deployed="deployedComponents.includes(id)"
          @click="handleCardClick(id)"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import MaxkbAiCard from './preview/MaxkbAiCard.vue'
import SearchQuoteCard from './preview/SearchQuoteCard.vue'
import FishAnimationCard from './preview/FishAnimationCard.vue'
import MarkdownEditorCard from './preview/MarkdownEditorCard.vue'
import TocNavCard from './preview/TocNavCard.vue'
import MusicPlayerCard from './preview/MusicPlayerCard.vue'
import HideLoginCard from './preview/HideLoginCard.vue'
import WeatherCard from './preview/WeatherCard.vue'

const router = useRouter()
const cardOrder = ref([
  'maxkb-ai', 
  'search-quote', 
  'fish-animation', 
  'markdown-editor', 
  'toc-nav', 
  'music-player',
  'hide-login',
  'weather'
])
const deployedComponents = ref<string[]>([])

// 检查部署状态
const checkDeployment = async () => {
  try {
    const promises = cardOrder.value.map(async (id) => {
      const res = await fetch(`/api/js/${id}/deployed`)
      const data = await res.json()
      return { id, deployed: data.deployed }
    })

    const results = await Promise.all(promises)
    deployedComponents.value = results
      .filter(r => r.deployed)
      .map(r => r.id)
  } catch (error) {
    console.error('Failed to check deployment status:', error)
  }
}

// 处理卡片点击
const handleCardClick = (id: string) => {
  router.push(`/dashboard/js/${id}`)
}

// 拖拽排序相关处理
let draggedId = ''

const handleDragStart = (e: DragEvent, id: string) => {
  draggedId = id
  if (e.dataTransfer) {
    e.dataTransfer.effectAllowed = 'move'
  }
}

const handleDragEnd = () => {
  draggedId = ''
}

const handleDrop = (e: DragEvent, id: string) => {
  e.preventDefault()
  if (draggedId && draggedId !== id) {
    const oldIndex = cardOrder.value.indexOf(draggedId)
    const newIndex = cardOrder.value.indexOf(id)
    
    const newOrder = [...cardOrder.value]
    newOrder.splice(oldIndex, 1)
    newOrder.splice(newIndex, 0, draggedId)
    
    cardOrder.value = newOrder
  }
}

onMounted(() => {
  checkDeployment()
})
</script>

<style scoped>
.js-library {
  padding: 20px;
}

.page-header {
  margin-bottom: 24px;
}

.page-header h2 {
  font-size: 1.5rem;
  color: #2c3e50;
  margin: 0 0 8px;
}

.page-header .description {
  color: #606266;
  font-size: 0.9rem;
  margin: 0;
}

.widgets-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  padding: 12px 0;
}

.card-wrapper {
  min-height: 340px;
  cursor: move;
  transition: transform 0.2s;
}

.card-wrapper.dragging {
  opacity: 0.5;
  transform: scale(1.02);
}

@media (max-width: 768px) {
  .widgets-grid {
    grid-template-columns: 1fr;
  }
}
</style> 