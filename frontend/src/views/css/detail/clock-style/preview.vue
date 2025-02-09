<template>
  <div class="preview-container">
    <div class="preview-note">
      <el-alert
        type="warning"
        :closable="false"
        show-icon
      >
        <p>此组件暂无预览，调参部署后请自行观察调整，如时间位置不合适，请调整sunpanel顶部边距</p><p>此组件使用时，请勿在布局调整组件中关闭 “时钟显示” 选项</p>
      </el-alert>
    </div>
    <div class="preview-content">
      <img src="@/assets/timelogo.png" alt="时钟样式预览" class="preview-img" />
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  modelValue: {
    logoMarginTop: number
    logoMarginLeft: number
  }
}>()
</script>

<style scoped>
.preview-container {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.1);
}

.preview-note {
  margin-bottom: 20px;
}

.preview-content {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
  background: #f5f7fa;
  border-radius: 8px;
  padding: 20px;
  overflow: hidden;
}

.preview-img {
  max-width: 100%;
  max-height: 300px;
  width: auto;
  height: auto;
  object-fit: contain;
  border-radius: 8px;
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-10px);
  }
  100% {
    transform: translateY(0px);
  }
}
</style> 