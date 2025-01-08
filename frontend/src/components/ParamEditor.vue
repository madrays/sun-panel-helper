<template>
  <div class="param-editor">
    <!-- 装饰线条的两列布局 -->
    <template v-if="widget?.id === 'xiantiao'">
      <div class="columns-layout">
        <div class="left-column">
          <!-- 预览设置 -->
          <div class="param-group preview-group" v-if="previewParams.length">
            <h3 class="group-title">预览设置</h3>
            <div class="preview-content">
              <div class="param-header">
                <label class="preview-label">卡片背景色</label>
                <div class="param-desc">(仅预览使用)</div>
              </div>
              <div class="color-picker">
                <input 
                  type="color" 
                  :id="previewParams[0].name"
                  :value="convertToHex6(localValue[previewParams[0].name])"
                  @input="updateColorValue($event, previewParams[0].name)"
                >
                <div class="color-controls">
                  <input 
                    type="text"
                    :value="localValue[previewParams[0].name]"
                    @input="updateColorText($event, previewParams[0].name)"
                    class="color-text"
                  >
                  <div class="opacity-control">
                    <i class="opacity-icon" title="调整透明度">▒</i>
                    <input 
                      type="range"
                      :value="getColorOpacity(localValue[previewParams[0].name])"
                      @input="updateColorOpacity($event, previewParams[0].name)"
                      min="0"
                      max="1"
                      step="0.01"
                      class="opacity-slider"
                    >
                    <span class="opacity-value">{{ Math.round(getColorOpacity(localValue[previewParams[0].name]) * 100) }}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 颜色设置 -->
          <div class="param-group" v-if="colorParams.length">
            <h3 class="group-title">颜色设置</h3>
            <div class="param-items">
              <div v-for="param in colorParams" :key="param.name" class="param-item">
                <div class="param-header">
                  <label :for="param.name">{{ param.label }}</label>
                  <div class="param-desc">{{ param.description }}</div>
                </div>
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
                      <i class="opacity-icon" title="调整透明度">▒</i>
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
        </div>

        <div class="right-column">
          <!-- 尺寸设置 -->
          <div class="param-group" v-if="sizeParams.length">
            <h3 class="group-title">尺寸设置</h3>
            <div class="param-items">
              <div v-for="param in sizeParams" :key="param.name" class="param-item">
                <div class="param-header">
                  <label :for="param.name">{{ param.label }}</label>
                  <div class="param-desc">{{ param.description }}</div>
                  <div class="param-value">当前值: {{ localValue[param.name] }}px</div>
                </div>
                <div class="number-input" v-if="param.type === 'number'">
                  <input 
                    type="range"
                    :id="param.name"
                    :value="localValue[param.name]"
                    :min="param.min"
                    :max="param.max"
                    :step="param.step"
                    @input="updateValue($event, param.name)"
                    class="slider"
                  >
                  <span class="slider-value">{{ localValue[param.name] }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 位置设置 -->
          <div class="param-group" v-if="positionParams.length">
            <h3 class="group-title">位置设置</h3>
            <div class="param-items">
              <div v-for="param in positionParams" :key="param.name" class="param-item">
                <div class="param-header">
                  <label :for="param.name">{{ param.label }}</label>
                  <div class="param-desc">{{ param.description }}</div>
                </div>
                <div class="number-input" v-if="param.type === 'number'">
                  <input 
                    type="range"
                    :id="param.name"
                    :value="localValue[param.name]"
                    :min="param.min"
                    :max="param.max"
                    :step="param.step"
                    @input="updateValue($event, param.name)"
                    class="slider"
                  >
                  <span class="slider-value">{{ localValue[param.name] }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- 悬停动画的单列布局 -->
    <template v-else-if="widget?.id === 'cardHover'">
      <!-- 预览设置 -->
      <div class="param-group preview-group" v-if="previewParams.length">
        <h3 class="group-title">预览设置</h3>
        <div class="preview-content">
          <div class="param-header">
            <label class="preview-label">卡片背景色</label>
            <div class="param-desc">(仅预览使用)</div>
          </div>
          <div class="color-picker">
            <input 
              type="color" 
              :id="previewParams[0].name"
              :value="convertToHex6(localValue[previewParams[0].name])"
              @input="updateColorValue($event, previewParams[0].name)"
            >
            <div class="color-controls">
              <input 
                type="text"
                :value="localValue[previewParams[0].name]"
                @input="updateColorText($event, previewParams[0].name)"
                class="color-text"
              >
              <div class="opacity-control">
                <i class="opacity-icon" title="调整透明度">▒</i>
                <input 
                  type="range"
                  :value="getColorOpacity(localValue[previewParams[0].name])"
                  @input="updateColorOpacity($event, previewParams[0].name)"
                  min="0"
                  max="1"
                  step="0.01"
                  class="opacity-slider"
                >
                <span class="opacity-value">{{ Math.round(getColorOpacity(localValue[previewParams[0].name]) * 100) }}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 动画基础设置 -->
      <div class="param-group">
        <h3 class="group-title">动画基础设置</h3>
        <div class="param-items">
          <!-- 放大开关 -->
          <div class="param-item">
            <div class="param-header">
              <label for="enableScale">启用放大效果</label>
              <div class="param-desc">是否启用鼠标悬停时的放大效果</div>
            </div>
            <div class="switch-input">
              <input 
                type="checkbox"
                id="enableScale"
                :checked="localValue.enableScale"
                @change="updateBooleanValue($event, 'enableScale')"
              >
            </div>
          </div>

          <!-- 放大倍数 -->
          <div class="param-item" v-if="localValue.enableScale">
            <div class="param-header">
              <label for="scaleSize">放大倍数</label>
              <div class="param-desc">鼠标悬停时卡片放大的倍数</div>
              <div class="param-value">当前值: {{ localValue.scaleSize }}</div>
            </div>
            <div class="number-input">
              <input 
                type="range"
                id="scaleSize"
                :value="localValue.scaleSize"
                :min="1"
                :max="1.2"
                :step="0.01"
                @input="updateValue($event, 'scaleSize')"
                class="slider"
              >
              <span class="slider-value">{{ localValue.scaleSize }}</span>
            </div>
          </div>

          <!-- 动画间隔 -->
          <div class="param-item" v-if="localValue.enableScale">
            <div class="param-header">
              <label for="scaleDelay">动画间隔</label>
              <div class="param-desc">放大到晃动之间的间隔时间（秒）</div>
            </div>
            <div class="number-input">
              <input 
                type="range"
                id="scaleDelay"
                :value="localValue.scaleDelay"
                :min="0"
                :max="1"
                :step="0.1"
                @input="updateValue($event, 'scaleDelay')"
                class="slider"
              >
              <span class="slider-value">{{ localValue.scaleDelay }}s</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 晃动设置 -->
      <div class="param-group">
        <h3 class="group-title">晃动设置</h3>
        <div class="param-items">
          <!-- 晃动幅度 -->
          <div class="param-item">
            <div class="param-header">
              <label for="shakeDegree">晃动幅度</label>
              <div class="param-desc">卡片晃动的最大角度</div>
            </div>
            <div class="number-input">
              <input 
                type="range"
                id="shakeDegree"
                :value="localValue.shakeDegree"
                :min="0"
                :max="15"
                :step="0.5"
                @input="updateValue($event, 'shakeDegree')"
                class="slider"
              >
              <span class="slider-value">{{ localValue.shakeDegree }}°</span>
            </div>
          </div>

          <!-- 晃动速度 -->
          <div class="param-item">
            <div class="param-header">
              <label for="shakeSpeed">晃动速度</label>
              <div class="param-desc">晃动动画的速度（秒）</div>
            </div>
            <div class="number-input">
              <input 
                type="range"
                id="shakeSpeed"
                :value="localValue.shakeSpeed"
                :min="0.2"
                :max="1"
                :step="0.1"
                @input="updateValue($event, 'shakeSpeed')"
                class="slider"
              >
              <span class="slider-value">{{ localValue.shakeSpeed }}s</span>
            </div>
          </div>
        </div>
      </div>
    </template>
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
    },
    widget: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      localValue: { ...this.value }
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
        (p.name.includes('Size') || p.name === 'afterCircleBorderWidth')
      );
    },
    positionParams() {
      return this.paramDefs.filter(p => 
        p.type === 'number' && 
        (p.name.includes('Top') || p.name.includes('Right'))
      );
    }
  },
  methods: {
    updateValue(event, name) {
      if (!event || !name) return;
      this.localValue[name] = event.target.value;
      this.$emit('input', { ...this.localValue });
      this.$emit('change');
    },
    convertToHex6(color) {
      if (!color) return '#000000';
      return color.slice(0, 7);
    },
    updateColorValue(event, name) {
      if (!event || !name) return;
      const hex6 = event.target.value;
      const currentAlpha = this.getColorOpacity(this.localValue[name]);
      const alpha = Math.round(currentAlpha * 255).toString(16).padStart(2, '0');
      this.localValue[name] = hex6 + alpha;
      this.$emit('input', { ...this.localValue });
      this.$emit('change');
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
      if (!event || !name) return;
      const opacity = event.target.value;
      const color = this.localValue[name].slice(0, 7);
      const alpha = Math.round(opacity * 255).toString(16).padStart(2, '0');
      this.localValue[name] = color + alpha;
      this.$emit('input', { ...this.localValue });
      this.$emit('change');
    },
    updateBooleanValue(event, name) {
      this.localValue[name] = event.target.checked;
      this.$emit('input', { ...this.localValue });
      this.$emit('change');
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
  padding: 0.6rem;
  height: calc(100vh - 120px);
  overflow-y: auto;
}

/* 装饰线条的两列布局样式 */
.columns-layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.left-column,
.right-column {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.param-group {
  width: 100%;
  background: #f8f9fa;
  border-radius: 8px;
  padding: 0.8rem;
  border: 1px solid #eee;
}

/* 预览设置组样式 */
.preview-group {
  height: auto;  /* 让高度自适应内容 */
  padding: 0.4rem;
}

.preview-content {
  display: flex;
  align-items: flex-start;  /* 改为顶部对齐 */
  gap: 0.5rem;
}

.preview-content .param-header {
  width: 100px;
  margin-top: 4px;  /* 微调对齐 */
}

.preview-content .param-desc {
  color: #999;
  font-size: 0.75rem;
}

/* 其他分组样式 */
.param-items {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.group-title {
  font-size: 0.85rem;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 0.2rem;
  padding-bottom: 0.2rem;
  border-bottom: 1px solid #eee;
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
  margin-top: 0.1rem;
}

.opacity-icon {
  font-size: 1.2rem;
  color: #666;
  cursor: help;
  opacity: 0.9;
  font-family: "Courier New", monospace;
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

.opacity-value {
  min-width: 40px;
  font-size: 0.8rem;
  color: #666;
  text-align: right;
}

.param-header {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
  margin-bottom: 0.2rem;
}

.param-desc {
  font-size: 0.75rem;
  color: #999;
  line-height: 1.2;
}

.param-value {
  font-size: 0.75rem;
  color: #666;
  margin-top: 0.1rem;
}

.number-input {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.slider {
  width: 100%;
  height: 8px;
  appearance: none;
  -webkit-appearance: none;
  background: linear-gradient(to right, transparent, #666);
  border-radius: 4px;
  outline: none;
}

.slider-value {
  min-width: 40px;
  font-size: 0.8rem;
  color: #666;
  text-align: right;
}

/* 预览设置标签样式 */
.preview-label {
  font-size: 0.8rem;
  color: #666;
}

.switch-input {
  display: flex;
  align-items: center;
}

.switch-input input[type="checkbox"] {
  width: 40px;
  height: 20px;
  appearance: none;
  background: #eee;
  border-radius: 10px;
  position: relative;
  cursor: pointer;
  transition: all 0.3s;
}

.switch-input input[type="checkbox"]:checked {
  background: var(--primary-color, #409eff);
}

.switch-input input[type="checkbox"]::before {
  content: "";
  position: absolute;
  width: 16px;
  height: 16px;
  background: white;
  border-radius: 50%;
  top: 2px;
  left: 2px;
  transition: all 0.3s;
}

.switch-input input[type="checkbox"]:checked::before {
  left: 22px;
}
</style> 