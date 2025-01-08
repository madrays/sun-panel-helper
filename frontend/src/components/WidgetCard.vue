<template>
  <div class="widget-card" @click="$emit('click')">
    <div class="preview-section">
      <div class="preview-area">
        <div class="item-card">
          <div class="item-card-content">
            <div class="github-icon">
              <svg viewBox="0 0 24 24" width="24" height="24">
                <path fill="currentColor" d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
              </svg>
            </div>
            <div class="app-icon-info-text-box">
              <div class="app-icon-info-text-box-title">
                <span>App</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="info-section">
      <h3>{{ widget.name }}</h3>
      <p>{{ widget.description }}</p>
      <div class="tags">
        <span v-for="tag in widget.tags" :key="tag" class="tag">{{ tag }}</span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'WidgetCard',
  props: {
    widget: {
      type: Object,
      required: true
    }
  }
}
</script>

<style scoped>
.widget-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  transition: all 0.3s;
  cursor: pointer;
}

.widget-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.12);
}

.preview-section {
  padding: 1.5rem;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.preview-area {
  width: 100%;
  display: flex;
  justify-content: center;
}

.item-card {
  width: 220px;
  height: 60px;
  padding: 8px 12px;
  background: white;
  border-radius: 12px;
  position: relative;
  overflow: hidden;
}

.item-card-content {
  height: 100%;
  display: flex;
  align-items: center;
  gap: 1rem;
  position: relative;
  z-index: 1;
}

.github-icon {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f6f8fa;
  border-radius: 6px;
  padding: 5px;
  color: #24292f;
  flex-shrink: 0;
}

.github-icon svg {
  width: 100%;
  height: 100%;
}

.app-icon-info-text-box {
  flex: 1;
  min-width: 0;
}

.app-icon-info-text-box-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #333;
  padding: 0.25rem 0;
  position: relative;
}

.app-icon-info-text-box-title::before {
  content: "";
  position: absolute;
  width: 93px;
  height: 93px;
  border-radius: 60%;
  background: #efcece2f;
  box-shadow: -8px 21px 0 #ceefe132;
  z-index: -1;
  right: -27px;
  top: -35px;
  pointer-events: none;
}

.app-icon-info-text-box-title::after {
  content: "";
  position: absolute;
  width: 40px;
  height: 40px;
  border: 4px solid #ebece342;
  border-radius: 70%;
  z-index: -1;
  top: -19px;
  right: 48px;
  pointer-events: none;
}

.info-section {
  padding: 1rem;
}

.info-section h3 {
  margin: 0 0 0.5rem;
  font-size: 1.1rem;
  color: #2c3e50;
}

.info-section p {
  margin: 0 0 1rem;
  font-size: 0.9rem;
  color: #666;
  line-height: 1.4;
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.tag {
  padding: 0.25rem 0.75rem;
  background: #f0f2f5;
  border-radius: 12px;
  font-size: 0.8rem;
  color: #666;
}
</style> 