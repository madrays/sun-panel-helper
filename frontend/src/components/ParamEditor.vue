<template>
  <div class="param-editor">
    <!-- 左列：预览设置和颜色设置 -->
    <div class="param-column">
      <!-- 预览设置 -->
      <div class="param-group" v-if="previewParams.length">
        <h3 class="group-title">预览设置</h3>
        <div class="param-items">
          <div v-for="param in previewParams" :key="param.name" class="param-item">
            <label :for="param.name" :title="param.description">卡片背景色（仅预览用）</label>
            <!-- 根据参数类型使用不同的输入控件 -->
            <div class="color-picker" v-if="param.type === 'color'">
              <input 
                type="color" 
                :id="param.name"
                :value="convertToHex6(localValue[param.name])"
                @input="updateColorValue($event, param.name)"
              >
              <div class="color-controls">
                <input 
                  type="text"
                  :value="localValue[param.name]"
                  @input="updateColorText($event, param.name)"
                  class="color-text"
                >
                <div class="opacity-control">
                  <i class="opacity-icon" title="调整透明度">⚪</i>
                  <input 
                    type="range"
                    :value="getColorOpacity(localValue[param.name])"
                    @input="updateColorOpacity($event, param.name)"
                    min="0"
                    max="1"
                    step="0.01"
                    class="opacity-slider"
                    :title="`调整透明度: ${Math.round(getColorOpacity(localValue[param.name]) * 100)}%`"
                  >
                  <span class="opacity-value" title="当前透明度">{{ Math.round(getColorOpacity(localValue[param.name]) * 100) }}%</span>
                </div>
              </div>
            </div>
            <div class="number-input" v-else>
            </div>
          </div>
        </div>
      </div>

      <!-- 颜色设置 -->
      <div class="param-group">
        <h3 class="group-title">颜色设置</h3>
        <div class="param-items">
          <div v-for="param in colorParams" :key="param.name" class="param-item">
            <label :for="param.name" :title="param.description">{{ param.label }}</label>
            <div class="color-picker">
              <input 
                type="color" 
                :id="param.name"
                :value="convertToHex6(localValue[param.name])"
                @input="updateColorValue($event, param.name)"
              >
              <div class="color-controls">
                <input 
                  type="text"
                  :value="localValue[param.name]"
                  @input="updateColorText($event, param.name)"
                  class="color-text"
                >
                <div class="opacity-control">
                  <i class="opacity-icon" title="调整透明度">⚪</i>
                  <input 
                    type="range"
                    :value="getColorOpacity(localValue[param.name])"
                    @input="updateColorOpacity($event, param.name)"
                    min="0"
                    max="1"
                    step="0.01"
                    class="opacity-slider"
                    :title="`调整透明度: ${Math.round(getColorOpacity(localValue[param.name]) * 100)}%`"
                  >
                  <span class="opacity-value" title="当前透明度">{{ Math.round(getColorOpacity(localValue[param.name]) * 100) }}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 尺寸设置 -->
      <div class="param-group">
        <h3 class="group-title">尺寸设置</h3>
        <div class="param-items">
          <div v-for="param in sizeParams" :key="param.name" class="param-item">
            <label :for="param.name" :title="param.description">{{
              param.name === 'beforeCircleSize' ? '前置圆形装饰大小' :
              param.name === 'afterCircleSize' ? '后置圆形装饰大小' :
              param.name === 'afterCircleBorderWidth' ? '后置圆形边框宽度' :
              param.label
            }}</label>
            <div class="number-input">
              <div class="slider-wrapper">
                <input 
                  type="range"
                  :id="`${param.name}-slider`"
                  v-model.number="localValue[param.name]"
                  :min="param.min"
                  :max="param.max"
                  :step="param.step"
                  @input="updateValue"
                  class="slider"
                >
                <div class="slider-value">{{ Math.round(localValue[param.name] * 100) }}%</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 右列：位置和其他设置 -->
    <div class="param-column">
      <!-- 位置设置 -->
      <div class="param-group">
        <h3 class="group-title">位置设置</h3>
        <div class="param-items">
          <div v-for="param in positionParams" :key="param.name" class="param-item">
            <label :for="param.name" :title="param.description">{{ 
              param.name.includes('beforeCircle') ? 
                (param.name.includes('Top') ? '前置圆形装饰上下偏移' : '前置圆形装饰左右偏移') :
                (param.name.includes('Top') ? '后置圆形装饰上下偏移' : '后置圆形装饰左右偏移')
            }}</label>
            <div class="number-input">
              <div class="slider-wrapper">
                <input 
                  type="range"
                  :id="`${param.name}-slider`"
                  v-model.number="localValue[param.name]"
                  :min="param.min"
                  :max="param.max"
                  :step="param.step"
                  @input="updateValue"
                  class="slider"
                >
                <div class="slider-value">{{ localValue[param.name] }}</div>
              </div>
              <input 
                type="number"
                :id="param.name"
                v-model.number="localValue[param.name]"
                :min="param.min"
                :max="param.max"
                :step="param.step"
                @change="updateValue"
                class="number-text"
              >
            </div>
          </div>
        </div>
      </div>

      <!-- 其他设置 -->
      <div class="param-group">
        <h3 class="group-title">其他设置</h3>
        <div class="param-items">
          <div v-for="param in otherParams" :key="param.name" class="param-item">
            <label :for="param.name" :title="param.description">{{ param.label }}</label>
            <div class="number-input">
              <div class="slider-wrapper">
                <input 
                  type="range"
                  :id="`${param.name}-slider`"
                  v-model.number="localValue[param.name]"
                  :min="param.min"
                  :max="param.max"
                  :step="param.step"
                  @input="updateValue"
                  class="slider"
                >
                <div class="slider-value">{{ localValue[param.name] }}</div>
              </div>
              <input 
                type="number"
                :id="param.name"
                v-model.number="localValue[param.name]"
                :min="param.min"
                :max="param.max"
                :step="param.step"
                @change="updateValue"
                class="number-text"
              >
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ParamEditor',
  props: {
    value: {
      type: Object,
      required: true
    },
    paramDefs: {
      type: Array,
      required: true
    }
  },
  computed: {
    previewParams() {
      return this.paramDefs.filter(p => 
        p.name === 'cardBackground'
      );
    },
    colorParams() {
      return this.paramDefs.filter(p => 
        p.type === 'color' && 
        !['cardBackground', 'cardOpacity'].includes(p.name)
      );
    },
    sizeParams() {
      return this.paramDefs.filter(p => 
        p.type === 'number' && 
        (p.name.includes('Size') || p.name === 'afterCircleBorderWidth') &&
        !['cardBackground', 'cardOpacity'].includes(p.name)
      );
    },
    positionParams() {
      return this.paramDefs.filter(p => 
        p.type === 'number' && 
        (p.name.includes('Top') || p.name.includes('Right')) &&
        !['cardBackground', 'cardOpacity'].includes(p.name)
      );
    },
    otherParams() {
      return this.paramDefs.filter(p => 
        !this.colorParams.includes(p) && 
        !this.sizeParams.includes(p) && 
        !this.positionParams.includes(p) &&
        !['cardBackground', 'cardOpacity', 'afterCircleBorderWidth'].includes(p.name)
      );
    }
  },
  data() {
    return {
      localValue: { ...this.value }
    }
  },
  methods: {
    updateValue() {
      this.$emit('input', { ...this.localValue });
      this.$emit('change');
    },
    convertToHex6(color) {
      if (!color) return '#000000';
      const hex = color.replace('#', '');
      if (hex.length === 8) {
        return '#' + hex.substring(0, 6);
      }
      return color;
    },
    updateColorValue(event, name) {
      const hex6 = event.target.value;
      const currentAlpha = this.localValue[name].slice(-2);
      this.localValue[name] = hex6 + currentAlpha;
      this.updateValue();
    },
    updateColorText(event, name) {
      this.localValue[name] = event.target.value;
      this.updateValue();
    },
    getColorOpacity(color) {
      if (!color) return 1;
      const opacity = color.slice(-2);
      return parseInt(opacity, 16) / 255;
    },
    updateColorOpacity(event, name) {
      const opacity = event.target.value;
      const color = this.localValue[name].slice(0, 7);
      const alpha = Math.round(opacity * 255).toString(16).padStart(2, '0');
      this.localValue[name] = color + alpha;
      this.updateValue();
    }
  },
  watch: {
    value: {
      handler(newVal) {
        this.localValue = { ...newVal };
      },
      deep: true
    }
  }
}
</script>

<style>
.param-editor {
  display: grid;
  grid-template-columns: 45% 55%;
  gap: 1.5rem;
  padding: 1rem;
  max-height: calc(100vh - 160px);
}

.param-column {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.param-group {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 0.5rem;
  border: 1px solid #eee;
}

.group-title {
  font-size: 0.85rem;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 0.3rem;
  padding-bottom: 0.2rem;
  border-bottom: 1px solid #eee;
}

.param-items {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.param-item {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
}

.param-item label {
  font-size: 0.8rem;
  color: #666;
}

.color-picker {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.color-picker input[type="color"] {
  width: 28px;
  height: 28px;
  padding: 2px;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
}

.color-text {
  flex: 1;
  padding: 0.4rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.85rem;
  font-family: monospace;
  color: #333;
}

input:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px rgba(76, 175, 80, 0.1);
}

.number-input {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.slider-wrapper {
  flex: 1;
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.slider {
  flex: 1;
  height: 4px;
  appearance: none;
  -webkit-appearance: none;
  background: #e9ecef;
  border-radius: 2px;
  outline: none;
}

.slider::-webkit-slider-thumb {
  appearance: none;
  -webkit-appearance: none;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: var(--primary-color);
  cursor: pointer;
  border: none;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  transition: all 0.2s;
}

.slider::-webkit-slider-thumb:hover {
  transform: scale(1.1);
  box-shadow: 0 2px 6px rgba(0,0,0,0.2);
}

.slider-value {
  min-width: 36px;
  font-size: 0.85rem;
  color: #666;
  text-align: center;
}

.number-text {
  width: 50px;
  padding: 0.3rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.85rem;
  color: #333;
  text-align: center;
}

.color-controls {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.opacity-control {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.2rem;
}

.opacity-icon {
  font-size: 0.9rem;
  color: #666;
  cursor: help;
  opacity: 0.6;
}

.opacity-slider {
  flex: 1;
  height: 4px;
  appearance: none;
  -webkit-appearance: none;
  background: linear-gradient(to right, transparent, #666);
  border-radius: 2px;
  outline: none;
}

.opacity-slider::-webkit-slider-thumb {
  appearance: none;
  -webkit-appearance: none;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: var(--primary-color);
  cursor: pointer;
  border: none;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.opacity-value {
  min-width: 40px;
  font-size: 0.8rem;
  color: #666;
  text-align: right;
}

.opacity-control:hover .opacity-icon {
  opacity: 1;
}
</style> 