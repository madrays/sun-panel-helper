<script setup lang="ts">
import { ref, onMounted, computed, watch, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import axios from 'axios'

const router = useRouter()

// 定义API响应类型
interface ApiResponse<T = any> {
  success: boolean
  message?: string
  deployed?: boolean
  config?: IcpConfig
  error?: string
  [key: string]: any
}

interface IcpConfig {
  icpNumber: string
  gonganNumber: string
  gonganLink: string
  textColor: string
  linkColor: string
  separatorColor: string  // 新增分割线颜色配置
}

// 部署状态
const deployed = ref(false)
const loading = ref(true)
const saving = ref(false)  // 用于部署操作

// 自动保存定时器
let saveConfigTimer: ReturnType<typeof setTimeout> | null = null

// 配置
const config = ref<IcpConfig>({
  icpNumber: '',
  gonganNumber: '',
  gonganLink: 'http://www.beian.gov.cn',
  textColor: '#909399',
  linkColor: '#409EFF',
  separatorColor: '#DCDFE6'  // 默认分割线颜色
})

// 加载配置
async function loadConfig() {
  loading.value = true
  try {
    const res = await axios.get<ApiResponse<{ deployed: boolean, config: IcpConfig }>>('/api/toolbox/footer/icp-footer/config')
    if (res.data.success) {
      config.value = res.data.config || config.value
      deployed.value = res.data.deployed || false
    } else {
      ElMessage.error('加载配置失败：' + res.data.message)
    }
  } catch (error: any) {
    ElMessage.error('请求失败：' + (error.message || '未知错误'))
  } finally {
    loading.value = false
  }
}

// 监听配置变化，实时保存
watch(
  () => config.value,
  () => {
    // 防抖处理，避免频繁保存
    if (saveConfigTimer) {
      clearTimeout(saveConfigTimer)
    }
    
    saveConfigTimer = setTimeout(() => {
      saveConfig()
    }, 1000) // 1秒后保存
  },
  { deep: true }
)

// 保存配置但不部署 (静默保存)
async function saveConfig() {
  try {
    console.log('自动保存配置')
    await axios.post<ApiResponse>('/api/toolbox/footer/icp-footer/save-config', config.value)
  } catch (error: any) {
    console.error('保存配置失败：', error)
  }
}

// 部署页脚
async function deployFooter() {
  try {
    saving.value = true
    
    // 确保所有必要字段都有值，防止后端验证失败
    const deployConfig = {
      ...config.value,
      // 确保至少有默认值，但允许为空字符串，表示不显示
      gonganLink: config.value.gonganLink || 'http://www.beian.gov.cn',
      separatorColor: config.value.separatorColor || '#DCDFE6'
    }
    
    const res = await axios.post<ApiResponse>('/api/toolbox/footer/icp-footer/deploy', deployConfig)
    if (res.data.success) {
      ElMessage.success('部署成功')
      deployed.value = true
    } else if (res.data.error === 'ANOTHER_FOOTER_DEPLOYED') {
      ElMessageBox.confirm(
        '当前已有其他页脚部署，是否取消其他页脚部署并应用当前页脚？',
        '确认',
        {
          confirmButtonText: '确认',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).then(async () => {
        // 先取消其他页脚
        try {
          saving.value = true
          // 另一个页脚是 lifeline-footer
          await axios.post<ApiResponse>('/api/toolbox/footer/lifeline-footer/undeploy')
          // 然后部署当前页脚
          const deployRes = await axios.post<ApiResponse>('/api/toolbox/footer/icp-footer/deploy', deployConfig)
          if (deployRes.data.success) {
            ElMessage.success('部署成功')
            deployed.value = true
          } else {
            ElMessage.error('部署失败: ' + (deployRes.data.message || '未知错误'))
          }
        } catch (e: any) {
          console.error('处理其他页脚失败:', e)
          // 改进错误处理，显示响应中的错误信息（如果有）
          if (e.response && e.response.data) {
            ElMessage.error('操作失败: ' + (e.response.data.message || '请重试'))
          } else {
            ElMessage.error('操作失败，请重试')
          }
        } finally {
          saving.value = false
        }
      }).catch(() => {
        // 用户取消
      })
    } else {
      // 显示后端返回的具体错误信息
      ElMessage.error('部署失败：' + (res.data.message || '未知错误'))
    }
  } catch (error: any) {
    console.error('部署请求失败:', error)
    // 改进错误处理，尝试从错误响应中获取更多信息
    if (error.response && error.response.data) {
      // 检查是否有详细的错误信息
      const errorMessage = error.response.data.message || '未知错误';
      const errorCode = error.response.data.error;
      
      // 检查是否是互斥错误
      if (errorCode === 'ANOTHER_FOOTER_DEPLOYED') {
        ElMessageBox.confirm(
          '当前已有其他页脚部署，是否取消其他页脚部署并应用当前页脚？',
          '确认',
          {
            confirmButtonText: '确认',
            cancelButtonText: '取消',
            type: 'warning'
          }
        ).then(async () => {
          try {
            saving.value = true
            await axios.post<ApiResponse>('/api/toolbox/footer/lifeline-footer/undeploy')
            const deployConfig = {
              ...config.value,
              gonganLink: config.value.gonganLink || 'http://www.beian.gov.cn',
              separatorColor: config.value.separatorColor || '#DCDFE6'
            }
            const deployRes = await axios.post<ApiResponse>('/api/toolbox/footer/icp-footer/deploy', deployConfig)
            if (deployRes.data.success) {
              ElMessage.success('部署成功')
              deployed.value = true
            } else {
              ElMessage.error('部署失败: ' + (deployRes.data.message || '未知错误'))
            }
          } catch (e: any) {
            console.error('处理其他页脚失败:', e)
            ElMessage.error('操作失败，请重试')
          } finally {
            saving.value = false
          }
        }).catch(() => {
          // 用户取消
        });
        return;
      }
      
      // 显示详细错误信息
      ElMessage.error('部署失败: ' + errorMessage);
    } else {
      ElMessage.error('请求失败：' + (error.message || '未知错误'))
    }
  } finally {
    saving.value = false
  }
}

// 取消部署
async function undeployFooter() {
  try {
    await ElMessageBox.confirm('确定要取消部署页脚吗？', '确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    saving.value = true
    const res = await axios.post<ApiResponse>('/api/toolbox/footer/icp-footer/undeploy')
    if (res.data.success) {
      ElMessage.success('取消部署成功')
      deployed.value = false
    } else {
      ElMessage.error('取消部署失败: ' + (res.data.message || '未知错误'))
    }
  } catch (error) {
    console.error('取消部署失败:', error)
    if (error !== 'cancel' && error !== 'close') {
      ElMessage.error('取消部署请求失败')
    }
  } finally {
    saving.value = false
  }
}

// 重新部署
async function redeployFooter() {
  try {
    saving.value = true
    // 先取消部署
    await axios.post<ApiResponse>('/api/toolbox/footer/icp-footer/undeploy')
    // 再重新部署
    
    // 确保所有必要字段都有值，防止后端验证失败
    const deployConfig = {
      ...config.value,
      // 确保至少有默认值，但允许为空字符串
      gonganLink: config.value.gonganLink || 'http://www.beian.gov.cn',
      separatorColor: config.value.separatorColor || '#DCDFE6'
    }
    
    const res = await axios.post<ApiResponse>('/api/toolbox/footer/icp-footer/deploy', deployConfig)
    if (res.data.success) {
      ElMessage.success('重新部署成功')
      deployed.value = true
    } else {
      ElMessage.error('重新部署失败: ' + (res.data.message || '未知错误'))
    }
  } catch (error) {
    console.error('重新部署失败:', error)
    ElMessage.error('重新部署请求失败')
  } finally {
    saving.value = false
  }
}

// 渲染预览
const previewHtml = computed(() => {
  const icpNumber = config.value.icpNumber || ''
  const gonganNumber = config.value.gonganNumber || ''
  const textColor = config.value.textColor
  const separatorColor = config.value.separatorColor
  const linkHoverColor = config.value.linkColor
  
  // 修改ICP图标SVG - 直接添加fill属性
  const icpIconSvg = `<svg viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" width="20" height="20" style="vertical-align:-3px;margin-right:6px;"><path fill="currentColor" d="M511.427 965.399c170.24-67.637 283.732-164.508 340.479-283.733 73.37-142.153 90.565-306.087 56.746-499.254L511.427 58.028 114.774 188.144c-33.818 187.435-17.196 351.37 51.015 493.522C227.694 801.465 341.76 897.762 511.427 965.4zM216.23 659.312c-62.478-124.384-79.1-266.537-51.014-431.618l345.638-112.92 345.637 112.92c22.355 164.508 5.732 306.087-56.746 425.886C748.73 755.609 651.86 835.283 510.28 897.762c-146.165-56.747-243.035-142.153-294.05-238.45z"></path><path fill="currentColor" d="M279.282 620.334v-252.78h47.575v252.78h-47.575z m244.182-93.43l45.856 15.475c-6.879 27.514-18.916 47.576-34.965 61.906-16.623 13.183-37.258 20.062-63.052 20.062-31.526 0-57.32-11.464-77.382-34.392-20.062-22.355-30.38-53.88-30.38-94.578 0-42.416 10.318-75.089 30.38-98.016 20.062-23.502 47.003-34.965 79.675-34.965 28.66 0 52.16 9.17 70.503 27.513 10.89 10.89 18.916 26.367 24.074 46.429l-47.002 12.037c-2.293-13.183-8.598-23.501-17.769-30.953-8.598-7.451-19.489-11.463-32.099-11.463-17.77 0-31.526 6.878-42.99 20.061-10.89 13.184-16.622 34.965-16.622 65.345 0 32.099 5.731 54.454 16.622 68.784 10.891 13.756 24.648 20.061 41.27 20.061 12.61 0 23.501-4.585 32.673-13.183 10.317-7.452 17.196-21.208 21.208-40.124z m86.553 93.43v-252.78h76.235c28.66 0 47.575 1.147 56.746 4.013 13.184 4.012 24.648 12.037 33.82 24.647 8.597 12.61 13.756 28.66 13.756 49.295 0 15.476-2.293 28.087-8.025 38.978-5.159 10.89-12.037 18.915-20.062 25.22s-16.623 10.318-24.647 12.037c-11.464 2.293-27.514 4.013-49.868 4.013h-30.38v95.724l-47.575-1.147z m48.148-210.363v71.65h25.794c18.916 0 31.526-1.147 37.831-4.013 6.305-2.293 11.464-6.878 14.903-12.61 4.013-5.732 5.732-12.037 5.732-19.489 0-9.171-2.293-17.196-7.451-22.355-5.16-6.305-11.464-9.17-18.916-11.463-5.732-1.147-17.196-1.72-33.818-1.72h-24.075z"></path></svg>`
  
  // 修改公安图标SVG - 直接添加fill属性
  const gonganIconSvg = `<svg viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" width="20" height="20" style="vertical-align:-3px;margin-right:6px;"><path fill="currentColor" d="M524.8 1024h-26.112c-4.096 0-7.68-0.512-11.264-2.048l-4.608-1.536C1.536 836.096 61.952 281.6 62.464 275.968l2.56-22.528c2.048-15.36 14.848-27.648 30.72-28.16l22.528-1.024c9.216-0.512 58.88-6.656 66.56-73.728l2.048-16.384c1.536-11.776 9.216-22.016 20.48-26.112l15.36-5.632C417.28 30.72 470.016 11.264 484.864 5.632l1.024-0.512C491.008 2.048 496.64 0 502.784 0h8.192c12.8 0 12.8 0 289.792 101.888l15.36 5.632c11.264 4.096 19.456 14.336 20.992 26.624l2.048 16.384c7.68 67.072 56.832 73.216 66.56 73.728l22.528 1.024c15.872 0.512 28.672 12.8 30.72 28.16l2.56 22.528c0.512 5.632 60.928 560.64-420.352 744.448l-4.608 1.536c-3.584 1.536-7.68 2.048-11.776 2.048z m-19.968-64h13.824c179.2-69.12 297.472-202.24 351.744-395.776 37.376-134.144 29.696-252.416 27.648-276.48-39.936-3.584-110.592-33.28-122.88-126.464C589.824 93.184 524.8 69.12 509.952 64.512h-0.512l-0.512 0.512c-10.24 4.096-56.832 20.992-261.12 96.256-12.288 92.16-80.384 122.88-122.88 126.464-2.048 24.064-9.728 142.336 27.648 276.992C207.36 758.272 325.632 891.392 504.832 960z"></path><path fill="currentColor" d="M660.48 723.968c-4.096 0-8.704-1.024-12.288-3.072l-135.68-71.68-135.68 71.68c-9.216 4.608-19.968 4.096-28.16-2.048s-12.288-15.872-10.752-26.112l26.112-151.552L253.44 434.176c-7.168-7.168-9.728-17.92-6.656-27.136 3.072-9.728 11.264-16.896 21.504-17.92l152.064-22.016 68.096-137.728c4.608-9.216 13.824-14.848 24.064-14.848s19.456 5.632 24.064 14.848l68.096 137.728 152.064 22.016c10.24 1.536 18.432 8.704 21.504 17.92 3.072 9.728 0.512 20.48-6.656 27.136L660.48 541.184l26.112 151.552c1.536 10.24-2.56 19.968-10.752 26.112-4.608 3.072-9.728 5.12-15.36 5.12zM512 592.384c4.096 0 8.704 1.024 12.288 3.072l100.352 52.736-18.944-112.128c-1.536-8.704 1.536-17.408 7.68-23.552l81.408-79.36-112.128-16.384c-8.704-1.024-16.384-6.656-19.968-14.336L512 301.056l-50.176 101.888c-4.096 7.68-11.264 13.312-19.968 14.336l-112.128 16.384 81.408 79.36c6.144 6.144 9.216 14.848 7.68 23.552l-18.944 112.128 100.352-52.736c3.072-2.56 7.68-3.584 11.776-3.584z"></path></svg>`

  // 创建字符串数组来存储HTML部分
  const htmlParts: string[] = []
  
  // 备案号HTML - 只在icpNumber有值时显示
  if (icpNumber) {
    htmlParts.push(`<a href="https://beian.miit.gov.cn" target="_blank" rel="noopener noreferrer" class="icp-link" title="工信部备案信息" style="color:${textColor} !important">${icpIconSvg} ${icpNumber}</a>`)
  }
  
  // 公安备案HTML - 只在gonganNumber有值时显示
  if (gonganNumber) {
    htmlParts.push(`<a href="${config.value.gonganLink}" target="_blank" rel="noopener noreferrer" class="gongan-link" title="公安备案信息" style="color:${textColor} !important">${gonganIconSvg} ${gonganNumber}</a>`)
  }
  
  // 只有两个都显示时才添加分隔符，直接设置内联样式颜色
  if (htmlParts.length === 2) {
    const output = `${htmlParts[0]} <span class="separator" style="color:${separatorColor} !important">|</span> ${htmlParts[1]}`
    
    // 添加悬停效果预览（模拟）
    return `${output}<div style="margin-top:15px;"><span>悬停效果预览: </span><a href="#" class="hover-preview" style="color:${linkHoverColor} !important">${icpIconSvg} 链接悬停颜色效果</a></div>`;
  } else {
    // 否则直接返回单个元素或空字符串
    const output = htmlParts.join('')
    if (output) {
      // 添加悬停效果预览（模拟）
      return `${output}<div style="margin-top:15px;"><span>悬停效果预览: </span><a href="#" class="hover-preview" style="color:${linkHoverColor} !important">${icpIconSvg} 链接悬停颜色效果</a></div>`;
    }
    return output
  }
})

// 加载组件时获取配置
onMounted(() => {
  loadConfig()
})

// 组件卸载时清除定时器
onUnmounted(() => {
  if (saveConfigTimer) {
    clearTimeout(saveConfigTimer)
  }
})
</script>

<template>
  <div class="footer-detail-container">
    <div class="page-header">
      <div class="back-button" @click="router.push('/dashboard/toolbox/footer')">
        <i class="fas fa-arrow-left"></i> 返回
      </div>
      <h1 class="page-title">备案信息页脚</h1>
      <div class="deploy-actions">
        <el-button 
          v-if="!deployed" 
          type="primary" 
          :loading="saving" 
          @click="deployFooter"
        >
          部署页脚
        </el-button>
        <el-button-group v-else>
          <el-button 
            type="primary" 
            :loading="saving" 
            @click="redeployFooter"
          >
            重新部署
          </el-button>
          <el-button 
            type="danger" 
            :loading="saving" 
            @click="undeployFooter"
          >
            取消部署
          </el-button>
        </el-button-group>
      </div>
    </div>
    
    <div class="content-layout">
      <div class="config-section">
        <!-- 基本设置卡片 -->
        <el-card shadow="never" class="config-card">
          <template #header>
            <div class="card-header">
              <span>备案信息设置</span>
            </div>
          </template>
          
          <el-form label-position="top">
            <el-form-item label="ICP备案号">
              <el-input 
                v-model="config.icpNumber" 
                placeholder="例如：京ICP备xxxxxx号"
              />
              <div class="form-tip">
                <i class="fas fa-info-circle"></i>
                请填写完整的ICP备案号，如：京ICP备xxxxxx号或粤ICP备xxxxxx号-x
              </div>
            </el-form-item>
            
            <el-form-item label="公安备案号">
              <el-input 
                v-model="config.gonganNumber" 
                placeholder="例如：京公网安备 11010xxxxxxxxx号"
              />
            </el-form-item>
            
            <el-form-item label="公安备案链接">
              <el-input 
                v-model="config.gonganLink" 
                placeholder="例如：http://www.beian.gov.cn/portal/..."
              />
              <div class="form-tip">
                <i class="fas fa-info-circle"></i>
                请填写公安备案查询链接，默认为公安备案管理网站
              </div>
            </el-form-item>
          </el-form>
        </el-card>
        
        <!-- 样式设置卡片 -->
        <el-card shadow="never" class="config-card">
          <template #header>
            <div class="card-header">
              <span>样式设置</span>
            </div>
          </template>
          
          <el-form label-position="top">
            <div class="form-row">
              <el-form-item label="文字颜色">
                <el-color-picker v-model="config.textColor" show-alpha></el-color-picker>
              </el-form-item>
              
              <el-form-item label="链接悬停颜色">
                <el-color-picker v-model="config.linkColor" show-alpha></el-color-picker>
              </el-form-item>
            </div>
            
            <el-form-item label="分隔符颜色">
              <el-color-picker v-model="config.separatorColor" show-alpha></el-color-picker>
              <div class="form-tip">
                <i class="fas fa-info-circle"></i>
                分隔符显示在工信部备案和公安备案之间，仅当两者都显示时才会出现
              </div>
            </el-form-item>
          </el-form>
        </el-card>
        
        <!-- 页脚信息卡片 -->
        <el-card shadow="never" class="footer-info-card">
          <div class="footer-info">
            <h3>备案信息页脚</h3>
            <p class="footer-description">简洁美观的工信部备案与公安备案页脚，符合法律要求，让您的网站更加合规。</p>
            
            <div class="author-tags">
              <div class="author-tag">
                <i class="fas fa-user"></i>
                <span>作者：madrays</span>
              </div>
              <div class="author-tag">
                <i class="fas fa-code"></i>
                <span>开发：madrays</span>
              </div>
              <div class="author-tag">
                <i class="fas fa-calendar"></i>
                <span>更新：2025-04-19</span>
              </div>
            </div>
            
            <div class="footer-features">
              <h4>特性</h4>
              <ul>
                <li>支持ICP备案信息展示</li>
                <li>支持公安备案信息展示</li>
                <li>自定义文字颜色和链接悬停效果</li>
                <li>符合中国大陆网站备案要求</li>
                <li>简洁美观的设计风格</li>
              </ul>
            </div>
          </div>
        </el-card>
      </div>
      
      <div class="preview-module-section">
        <el-card shadow="never" class="preview-card">
          <template #header>
            <div class="card-header">
              <span>预览</span>
            </div>
          </template>
          
          <div class="preview-container">
            <!-- 预览区域 - 修复样式变量绑定 -->
            <div class="footer-preview" 
                :style="{
                  '--footer-text-color': config.textColor,
                  '--footer-link-hover-color': config.linkColor,
                  '--footer-separator-color': config.separatorColor
                }">
              <div class="footer-body">
                <div class="custom-footer" v-html="previewHtml"></div>
              </div>
            </div>
            
            <!-- 实际效果预览 - 修复样式变量绑定 -->
            <div class="site-preview" 
                :style="{
                  '--footer-text-color': config.textColor,
                  '--footer-link-hover-color': config.linkColor,
                  '--footer-separator-color': config.separatorColor
                }">
              <div class="site-content"></div>
              <div class="site-footer">
                <div class="custom-footer" v-html="previewHtml"></div>
              </div>
            </div>
            
            <div class="action-notice">
              <el-alert
                title="以上为预览效果，部署后备案信息将显示在您网站的底部"
                type="info"
                :closable="false"
                show-icon
              />
            </div>
          </div>
        </el-card>
      </div>
    </div>
  </div>
</template>

<style scoped>
.footer-detail-container {
  padding: 20px;
}

.page-header {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.back-button {
  font-size: 14px;
  color: #409EFF;
  cursor: pointer;
  display: flex;
  align-items: center;
  margin-right: 20px;
}

.back-button i {
  margin-right: 5px;
}

.page-title {
  flex: 1;
  font-size: 20px;
  font-weight: 600;
  margin: 0;
  color: #303133;
}

.content-layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.config-card, .preview-card, .footer-info-card {
  margin-bottom: 20px;
  border-radius: 8px;
  background-color: #fff;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header span {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.form-row {
  display: flex;
  gap: 20px;
}

.form-row .el-form-item {
  flex: 1;
}

.form-tip {
  margin-top: 5px;
  font-size: 12px;
  color: #909399;
}

.form-tip i {
  margin-right: 5px;
}

.preview-container {
  padding: 20px 0;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.footer-preview {
  background-color: #1a1a1a;
  border-radius: 6px;
  overflow: hidden;
  padding: 0;
  position: relative;
}

.footer-body {
  padding: 20px;
  text-align: center;
}

.site-preview {
  height: 300px;
  display: flex;
  flex-direction: column;
  border: 1px solid #e6e6e6;
  border-radius: 6px;
  overflow: hidden;
}

.site-content {
  flex: 1;
  background: linear-gradient(
    to bottom,
    rgba(245, 247, 250, 0.5) 10%,
    rgba(245, 247, 250, 0.3) 20%,
    rgba(245, 247, 250, 0.1) 30%
  );
}

.site-footer {
  padding: 20px;
  background-color: #f5f7fa;
  border-top: 1px solid #e6e6e6;
  text-align: center;
}

.action-notice {
  margin-top: 15px;
}

/* 页脚信息卡片样式 */
.footer-info {
  padding: 10px 0;
}

.footer-info h3 {
  font-size: 16px;
  margin: 0 0 10px;
  color: #303133;
  font-weight: 600;
}

.footer-description {
  color: #606266;
  margin-bottom: 15px;
  line-height: 1.5;
}

.author-tags {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin-bottom: 20px;
}

.author-tag {
  display: flex;
  align-items: center;
  background-color: #f5f7fa;
  padding: 5px 10px;
  border-radius: 4px;
  font-size: 13px;
  color: #606266;
}

.author-tag i {
  margin-right: 5px;
  color: #409EFF;
}

.footer-features h4 {
  font-size: 15px;
  margin: 0 0 10px;
  color: #303133;
}

.footer-features ul {
  margin: 0;
  padding-left: 20px;
  color: #606266;
  line-height: 1.6;
}

.footer-features li {
  margin-bottom: 5px;
}

@media (max-width: 992px) {
  .content-layout {
    grid-template-columns: 1fr;
  }
}

/* 自定义页脚预览样式 - 更新CSS变量和增强文本可读性 */
.custom-footer {
  color: var(--footer-text-color, #909399) !important;
  padding: 10px 0;
  text-align: center;
  font-family: 'Noto Sans SC', 'Microsoft YaHei', 'Segoe UI', sans-serif !important;
  font-size: 14px;
  line-height: 1.6;
  width: 100%;
}

.custom-footer a {
  color: var(--footer-text-color, #909399) !important;
  text-decoration: none !important;
  transition: color 0.3s ease, background-color 0.3s ease;
  margin: 0 5px;
  display: inline-flex;
  align-items: center;
  font-weight: 500;
  padding: 4px 8px;
  border-radius: 4px;
  background-color: rgba(255, 255, 255, 0.05);
}

.custom-footer a:hover,
.custom-footer a:active,
.custom-footer a:focus {
  color: var(--footer-link-hover-color, #409EFF) !important;
  background-color: rgba(255, 255, 255, 0.1);
  text-decoration: none !important;
}

.custom-footer .separator {
  margin: 0 10px;
  color: var(--footer-separator-color, #DCDFE6) !important;
  opacity: 0.8;
  font-weight: 300;
}

.custom-footer svg {
  display: inline-block;
  vertical-align: middle;
}

/* 关键修复：SVG路径颜色继承 */
.custom-footer svg path {
  fill: currentColor !important;
  transition: fill 0.3s ease;
}

.custom-footer a:hover svg path,
.custom-footer .hover-preview svg path {
  fill: var(--footer-link-hover-color, #409EFF) !important;
}

/* 强制样式 - 覆盖所有内部元素样式 */
.footer-preview .custom-footer a,
.site-preview .custom-footer a {
  color: var(--footer-text-color, #909399) !important;
  text-decoration: none !important;
}

.footer-preview .custom-footer a:hover,
.site-preview .custom-footer a:hover,
.footer-preview .custom-footer a:active,
.site-preview .custom-footer a:active,
.footer-preview .custom-footer a:focus,
.site-preview .custom-footer a:focus {
  color: var(--footer-link-hover-color, #409EFF) !important;
  text-decoration: none !important;
}

.footer-preview .custom-footer .separator,
.site-preview .custom-footer .separator {
  color: var(--footer-separator-color, #DCDFE6) !important;
}

/* 特殊样式用于悬停预览 */
.custom-footer .hover-preview {
  color: var(--footer-link-hover-color, #409EFF) !important;
  background-color: rgba(255, 255, 255, 0.1);
}

/* 强制覆盖预览区域的所有文本颜色 */
.footer-preview *, .site-preview * {
  font-family: 'Noto Sans SC', 'Microsoft YaHei', 'Segoe UI', sans-serif !important;
}
</style> 