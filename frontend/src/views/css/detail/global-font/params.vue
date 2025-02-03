<template>
  <div class="params-container">
    <!-- 字体选择 -->
    <div class="param-section">
      <div class="param-header">
        <div class="param-label">
          字体选择
          <el-tooltip
            content="查看使用指南"
            placement="top"
          >
            <el-button
              type="info"
              text
              @click="showGuide = true"
            >
              <el-icon><Warning /></el-icon>
              使用指南
            </el-button>
          </el-tooltip>
        </div>
      </div>
      
      <!-- 预设字体 -->
      <div class="font-list">
        <div 
          v-for="font in presetFonts" 
          :key="font.value"
          class="font-item"
          :class="{ active: localParams.fontFamily === font.value }"
          @click="selectFont(font.value)"
        >
          <div class="preview" :style="{ fontFamily: font.value }">
            <div class="preview-text">
              <div class="text-lg">春风得意马蹄疾</div>
              <div class="text-md">The quick brown fox</div>
              <div class="text-sm">0123456789</div>
            </div>
          </div>
          <div class="font-name">{{ font.label }}</div>
        </div>
      </div>

      <!-- 已上传字体 -->
      <template v-if="filteredUploadedFonts.length > 0">
        <div class="divider"></div>
        <div class="font-list">
          <div 
            v-for="font in filteredUploadedFonts" 
            :key="font.id"
            class="font-item"
            :class="{ active: localParams.fontFamily === font.name }"
            @click="selectFont(font.name)"
          >
            <div class="preview" :style="{ fontFamily: font.name }">
              <div class="preview-text">
                <div class="text-lg">春风得意马蹄疾</div>
                <div class="text-md">The quick brown fox</div>
                <div class="text-sm">0123456789</div>
              </div>
            </div>
            <div class="font-name">
              {{ font.name }}
              <el-button 
                type="danger" 
                text
                size="small"
                @click.stop="deleteFont(font.id)"
              >
                <el-icon><Delete /></el-icon>
              </el-button>
            </div>
          </div>
        </div>
      </template>
    </div>

    <!-- 上传字体 -->
    <div class="param-section">
      <div class="param-title">上传字体</div>
      <el-upload
        class="uploader"
        action="/api/css/global-font/upload"
        :show-file-list="false"
        :on-success="handleUploadSuccess"
        :before-upload="beforeUpload"
        accept=".ttf,.otf"
      >
        <el-button type="primary">
          <el-icon><Plus /></el-icon>
          上传字体文件
        </el-button>
        <template #tip>
          <div class="upload-tip">支持 TTF、OTF 格式，单个文件不超过 10MB</div>
        </template>
      </el-upload>
    </div>

    <!-- 使用指南弹窗 -->
    <el-dialog
      v-model="showGuide"
      title="全局字体使用指南"
      width="500px"
    >
      <div class="guide-content">
        <div class="guide-section">
          <h4>重要提示</h4>
          <ul class="guide-list">
            <li>支持格式：TTF、OTF 字体文件</li>
            <li>文件大小：单个文件不超过 10MB</li>
            <li>字体版权：请确保使用的字体拥有合法授权</li>
            <li>中文支持：建议使用包含完整中文字符的字体</li>
          </ul>
        </div>
        <div class="guide-section">
          <h4>操作步骤</h4>
          <ol class="guide-list">
            <li>从预设字体中选择，或上传自定义字体文件</li>
            <li>在已上传字体列表中选择要使用的字体</li>
            <li>点击部署按钮应用字体设置</li>
          </ol>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Delete, Warning, Plus } from '@element-plus/icons-vue'

interface GlobalFontParams {
  fontFamily: string
}

interface FontFile {
  id: string
  name: string
  createdAt: string
}

const props = defineProps<{
  modelValue: GlobalFontParams
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: GlobalFontParams): void
}>()

const presetFonts = [
  { label: '江湖风古体', value: '江湖风古体' },
  { label: '马赛克MC风', value: '马赛克MC风' },
  { label: '猫啃圆珠体', value: '猫啃圆珠体' }
]

const localParams = ref<GlobalFontParams>({ ...props.modelValue })
const uploadedFonts = ref<FontFile[]>([])
const showGuide = ref(false)

// 过滤掉预设字体
const filteredUploadedFonts = computed(() => {
  const presetNames = presetFonts.map(font => font.value)
  return uploadedFonts.value.filter(font => !presetNames.includes(font.name))
})

// 加载已上传字体
const loadUploadedFonts = async () => {
  try {
    const response = await fetch('/api/css/global-font/fonts')
    const data = await response.json()
    if (data.success) {
      uploadedFonts.value = data.fonts
      
      // 为每个字体创建并加载 FontFace
      const loadFontPromises = data.fonts.map(async (font: FontFile) => {
        try {
          const fontFace = new FontFace(font.name, `url("/custom/helper/font/${font.id}")`)
          await fontFace.load()
          document.fonts.add(fontFace)
        } catch (error) {
          console.error(`加载字体失败: ${font.name}`, error)
        }
      })
      
      await Promise.all(loadFontPromises)
    }
  } catch (error) {
    console.error('加载字体列表失败:', error)
    ElMessage.error('加载字体列表失败')
  }
}

// 选择字体
const selectFont = (fontName: string) => {
  localParams.value.fontFamily = fontName
  emit('update:modelValue', { ...localParams.value })
}

// 删除字体
const deleteFont = async (id: string) => {
  try {
    const response = await fetch(`/api/css/global-font/fonts/${id}`, {
      method: 'DELETE'
    })
    const data = await response.json()
    if (data.success) {
      loadUploadedFonts()
      ElMessage.success('删除成功')
    } else {
      ElMessage.error(data.error || '删除失败')
    }
  } catch (error) {
    console.error('删除字体失败:', error)
    ElMessage.error('删除字体失败')
  }
}

// 上传前检查
const beforeUpload = (file: File) => {
  const isFontFile = file.name.match(/\.(ttf|otf)$/)
  const isLt10M = file.size / 1024 / 1024 < 10

  if (!isFontFile) {
    ElMessage.error('只能上传 TTF/OTF 格式的字体文件!')
    return false
  }
  if (!isLt10M) {
    ElMessage.error('字体文件大小不能超过 10MB!')
    return false
  }
  return true
}

// 上传成功处理
const handleUploadSuccess = async (response: any) => {
  if (response.success) {
    try {
      // 1. 获取字体文件的实际名称（去除扩展名）
      const fontName = response.originalName.replace(/\.(ttf|otf)$/i, '')
      
      // 2. 立即加载字体文件
      const fontFace = new FontFace(fontName, `url("/custom/helper/font/${response.id}")`)
      
      // 3. 等待字体加载完成
      await fontFace.load()
      
      // 4. 添加到 document.fonts
      document.fonts.add(fontFace)
      
      // 5. 刷新字体列表
      await loadUploadedFonts()
      
      // 6. 自动选择新上传的字体
      selectFont(fontName)
      
      ElMessage.success('上传成功')
    } catch (error) {
      console.error('加载字体失败:', error)
      ElMessage.error('字体加载失败')
    }
  } else {
    ElMessage.error(response.error || '上传失败')
  }
}

onMounted(() => {
  loadUploadedFonts()
})

watch(() => props.modelValue, (newValue) => {
  if (newValue) {
    localParams.value = { ...newValue }
  }
}, { deep: true })
</script>

<style scoped>
.params-container {
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.param-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.param-header {
  margin-bottom: 8px;
}

.param-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #2c3e50;
  font-weight: 500;
}

.param-label .el-button {
  padding: 2px 8px;
  font-size: 13px;
  height: 24px;
  color: var(--el-text-color-regular);
  font-weight: normal;
}

.param-label .el-button:hover {
  color: var(--el-color-primary);
  background: var(--el-fill-color-light);
}

.param-label .el-icon {
  margin-right: 4px;
  font-size: 14px;
}

.param-title {
  font-size: 14px;
  font-weight: 500;
  color: #2c3e50;
}

.font-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 12px;
}

.font-item {
  background: #f5f7fa;
  border-radius: 8px;
  padding: 12px;
  cursor: pointer;
  border: 2px solid transparent;
  transition: all 0.2s;
}

.font-item:hover {
  background: #edf2fc;
}

.font-item.active {
  border-color: var(--el-color-primary);
}

.preview {
  height: 120px;
  background: white;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 8px;
  padding: 12px;
}

.preview-text {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.text-lg {
  font-size: 24px;
  color: #2c3e50;
}

.text-md {
  font-size: 16px;
  color: #606266;
}

.text-sm {
  font-size: 20px;
  color: #409eff;
}

.font-name {
  font-size: 13px;
  color: #606266;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.divider {
  height: 1px;
  background: #dcdfe6;
  margin: 8px 0;
}

.upload-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 8px;
}

.guide-content {
  padding: 0 20px;
}

.guide-section {
  margin-bottom: 24px;
}

.guide-section:last-child {
  margin-bottom: 0;
}

.guide-section h4 {
  margin: 0 0 12px;
  font-size: 15px;
  color: #2c3e50;
  font-weight: 600;
}

.guide-list {
  margin: 0;
  padding-left: 20px;
}

.guide-list li {
  margin: 8px 0;
  line-height: 1.6;
  font-size: 14px;
  color: #606266;
}

@media (max-width: 768px) {
  .params-container {
    padding: 16px;
  }

  .font-list {
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 8px;
  }

  .preview {
    height: 100px;
  }

  .text-lg {
    font-size: 20px;
  }

  .text-md {
    font-size: 14px;
  }

  .text-sm {
    font-size: 16px;
  }
}
</style> 