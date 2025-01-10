<template>
  <div class="widget-preview" :data-widget-id="widget?.id">
    <div class="preview-area">
      <div class="item-card" 
        :style="cardStyle" 
        :data-enable-scale="params?.enableScale"
      >
        <div class="item-card-content">
          <div class="github-icon">
            <svg viewBox="0 0 24 24" width="24" height="24">
              <path fill="currentColor" d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
            </svg>
          </div>
          <div class="app-icon-info-text-box">
            <div class="app-icon-info-text-box-title" :style="titleStyle">
              <span>Github</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    widget: Object,
    template: String,
    params: Object
  },
  computed: {
    processedTemplate() {
      if (!this.template) return ''
      let css = this.template
      
      // 处理条件语句
      const processCondition = (match, condition, if_block, else_block) => {
        const value = this.params[condition]
        // 确保布尔值正确处理
        const boolValue = typeof value === 'boolean' ? value : String(value).toLowerCase() === 'true'
        console.log(`Preview condition ${condition}: ${boolValue} (${typeof value})`)
        return boolValue ? if_block.trim() : (else_block ? else_block.trim() : '')
      }
      
      css = css.replace(
        /{{#if\s+(\w+)}}([\s\S]*?)(?:{{else}}([\s\S]*?))?{{\/if}}/g,
        processCondition
      )
      
      // 处理数学表达式
      css = css.replace(/{{(\w+)\/(\d+)}}/g, (match, param, divisor) => {
        const value = this.params[param]
        if (value == null) return '0'
        return String(Number(value) / Number(divisor))
      })
      
      // 处理普通变量
      Object.entries(this.params).forEach(([key, value]) => {
        const regex = new RegExp(`{{${key}}}`, 'g')
        css = css.replace(regex, value)
      })
      
      return css
    },
    cardStyle() {
      if (!this.params) return {};
      
      const baseStyle = {
        background: this.params.cardBackground || '#ffffff',
        opacity: this.params.cardOpacity || 0.8,
        backdropFilter: `blur(${this.params.blurAmount || 10}px)`,
        WebkitBackdropFilter: `blur(${this.params.blurAmount || 10}px)`
      };

      if (this.widget?.id === 'cardHover') {
        Object.assign(baseStyle, {
          '--shake-degree': `${this.params.shakeDegree}deg`,
          '--shake-speed': `${this.params.shakeSpeed}s`,
          '--scale-size': this.params.scaleSize,
          '--scale-delay': `${this.params.scaleDelay}s`
        });
      }

      return baseStyle;
    },
    titleStyle() {
      if (!this.params) return {};
      
      const beforeCircle = {
        '--before-circle-size': `${this.params.beforeCircleSize || 93}px`,
        '--before-circle-color': this.params.beforeCircleColor || '#efcece2f',
        '--before-circle-shadow': this.params.beforeCircleShadowColor || '#ceefe132',
        '--before-circle-right': `${this.params.beforeCircleRight || -27}px`,
        '--before-circle-top': `${this.params.beforeCircleTop || -35}px`
      };

      const afterCircle = {
        '--after-circle-size': `${this.params.afterCircleSize || 40}px`,
        '--after-circle-color': this.params.afterCircleColor || '#ebece342',
        '--after-circle-border': `${this.params.afterCircleBorderWidth || 4}px`,
        '--after-circle-right': `${this.params.afterCircleRight || 48}px`,
        '--after-circle-top': `${this.params.afterCircleTop || -19}px`
      };

      return {
        ...beforeCircle,
        ...afterCircle
      };
    }
  }
}
</script>

<style>
.widget-preview {
  height: 100%;
}

.preview-area {
  height: 100%;
  padding: 1.5rem;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
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
  width: var(--before-circle-size);
  height: var(--before-circle-size);
  border-radius: 60%;
  background: var(--before-circle-color);
  box-shadow: -8px 21px 0 var(--before-circle-shadow);
  z-index: -1;
  right: var(--before-circle-right);
  top: var(--before-circle-top);
  pointer-events: none;
}

.app-icon-info-text-box-title::after {
  content: "";
  position: absolute;
  width: var(--after-circle-size);
  height: var(--after-circle-size);
  border: var(--after-circle-border) solid var(--after-circle-color);
  border-radius: 70%;
  z-index: -1;
  top: var(--after-circle-top);
  right: var(--after-circle-right);
  pointer-events: none;
}

/* 只对卡片悬停动画的预览生效 */
.widget-preview[data-widget-id="cardHover"] .item-card {
  transform-origin: center center;
}

/* 基础悬停动画 */
.widget-preview[data-widget-id="cardHover"] .item-card:hover {
  animation: cardShake var(--shake-speed, 0.5s) ease-in-out forwards;
}

/* 启用放大时的动画 */
.widget-preview[data-widget-id="cardHover"] .item-card[data-enable-scale="true"]:hover {
  transform: scale(var(--scale-size, 1.05));
  animation: cardShake var(--shake-speed, 0.5s) var(--scale-delay, 0.2s) ease-in-out forwards;
}

@keyframes cardShake {
  0%, 100% { 
    transform: rotate(0); 
  }
  25% { 
    transform: rotate(var(--shake-degree, 10deg)); 
  }
  50% { 
    transform: rotate(calc(var(--shake-degree, 10deg) * -1)); 
  }
  75% { 
    transform: rotate(calc(var(--shake-degree, 10deg) * 0.25)); 
  }
  85% { 
    transform: rotate(calc(var(--shake-degree, 10deg) * -0.25)); 
  }
}
</style> 