<script setup lang="ts">
import { ref, reactive, onMounted, computed, watch, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox, ElInput, ElColorPicker } from 'element-plus'
import axios from 'axios'
import draggable from 'vuedraggable'

// API响应类型定义
interface ApiResponse<T> {
  success: boolean
  message?: string
  deployed?: boolean
  config?: FooterConfig
  [key: string]: any
}

// 页脚配置类型定义
interface FooterConfig {
  siteLaunchDate: string
  enableUptime: boolean
  enableSocialLinks: boolean
  enableCustomContent: boolean
  enableHelperAd: boolean
  enableTime: boolean; // 添加 enableTime
  // 新增运行时间前缀文字
  uptimePrefix: string
  socialLinks: SocialLink[]
  // 新增模块顺序配置
  moduleOrder: string[]
  // 自定义内容配置 (原核心价值观)
  customContent: {
    text: string
    enabled: boolean
  }
  // 新增颜色配置
  textColor: string
  accentColor: string
}

// 社交链接类型定义
interface SocialLink {
  title: string
  url: string
  icon: string
  enabled: boolean
  // 新增自定义图标支持
  isCustomIcon?: boolean
  customIconCode?: string
}

const router = useRouter()
const loading = ref(false)
const saving = ref(false)
const deployed = ref(false)
// 控制自定义图标输入框的显示
const showCustomIconInput = ref(false)

// 新增：追踪当前聚焦的输入元素
const focusedInput = ref<InstanceType<typeof ElInput> | null>(null)
const focusedTextarea = ref<HTMLTextAreaElement | null>(null)

const trackFocus = (event: FocusEvent) => {
  const target = event.target as HTMLInputElement | HTMLTextAreaElement;
  if (target.tagName === 'INPUT') {
    focusedInput.value = target as any; // 简化处理
    focusedTextarea.value = null;
  } else if (target.tagName === 'TEXTAREA') {
    focusedTextarea.value = target as HTMLTextAreaElement; // 使用 HTMLTextAreaElement
    focusedInput.value = null;
  }
}

const trackBlur = () => {
  // 延迟一点清除，以便点击选择器时仍能获取焦点
  // setTimeout(() => {
  //   focusedInput.value = null;
  //   focusedTextarea.value = null;
  // }, 100);
}

// 添加折叠状态变量的定义
const showLinkIcons = ref(false) // 用于链接图标选择器
const showContentIcons = ref(false) // 用于内容图标选择器
const showContentEmojis = ref(false) // 用于内容表情选择器 (替换 showEmojis)

// 页脚配置
const config = reactive<FooterConfig>({
  siteLaunchDate: new Date().toISOString().split('T')[0],
  enableUptime: true,
  enableSocialLinks: true,
  enableCustomContent: true,
  enableHelperAd: true,
  enableTime: true, // 初始化 enableTime
  // 默认运行时间前缀文字
  uptimePrefix: '本站已苟活',
  // 默认模块顺序
  moduleOrder: ['uptime', 'social', 'time', 'customContent', 'helper'],
  customContent: {
    text: '在这里添加您想展示的文字和表情',
    enabled: true
  },
  socialLinks: [
    {
      title: 'GitHub',
      url: 'https://github.com',
      icon: 'fab fa-github',
      enabled: true
    },
    {
      title: '博客',
      url: 'https://example.com',
      icon: 'fas fa-blog',
      enabled: true
    }
  ],
  // 初始化颜色配置
  textColor: '#FFFFFF', 
  accentColor: '#7ee7ff'
})

// 编辑链接的状态
const editingLink = ref<SocialLink | null>(null)
const editingLinkIndex = ref<number | null>(null)

// 新链接输入
const newLink = reactive({
  title: '',
  url: '',
  icon: 'fab fa-link', // 默认图标
  enabled: true
})

// 开始编辑链接
const startEditLink = (link: SocialLink, index: number) => {
  editingLink.value = { ...link } // 复制一份进行编辑
  editingLinkIndex.value = index
  // 将编辑信息填入 newLink 输入区域，方便复用表单
  newLink.title = link.title
  newLink.url = link.url
  newLink.icon = link.icon
  newLink.enabled = link.enabled
}

// 保存编辑
const saveEditLink = () => {
  if (editingLink.value && editingLinkIndex.value !== null) {
    // 验证输入
    if (!newLink.title.trim()) {
      ElMessage.warning('请输入标题')
      return
    }
    if (!newLink.url.trim()) {
      ElMessage.warning('请输入URL')
      return
    }
    // 更新原始链接
    config.socialLinks[editingLinkIndex.value] = {
      title: newLink.title,
      url: newLink.url,
      icon: newLink.icon,
      enabled: newLink.enabled
    }
    // 重置编辑状态
    cancelEditLink()
    ElMessage.success('链接修改成功')
  }
}

// 取消编辑
const cancelEditLink = () => {
  editingLink.value = null
  editingLinkIndex.value = null
  // 清空输入
  resetNewLinkInput()
}

// 重置新链接输入框
const resetNewLinkInput = () => {
  newLink.title = ''
  newLink.url = ''
  newLink.icon = 'fab fa-link'
  newLink.enabled = true
}

// 添加新链接
const addLink = () => {
  // 验证输入
  if (!newLink.title.trim()) {
    ElMessage.warning('请输入标题')
    return
  }
  if (!newLink.url.trim()) {
    ElMessage.warning('请输入URL')
    return
  }

  // 添加到列表
  config.socialLinks.push({
    title: newLink.title,
    url: newLink.url,
    icon: newLink.icon,
    enabled: true
  })

  // 清空输入
  resetNewLinkInput()
  ElMessage.success('链接添加成功')
}

// 删除链接
const deleteLink = (index: number) => {
  // 如果正在编辑这个链接，先取消编辑
  if (editingLinkIndex.value === index) {
    cancelEditLink()
  }
  config.socialLinks.splice(index, 1)
  ElMessage.success('链接删除成功')
}

// 检查部署状态
const checkDeployStatus = async () => {
  try {
    loading.value = true
    const res = await axios.get<ApiResponse<{ deployed: boolean, config: any }>>('/api/toolbox/footer/lifeline-footer/config')
    if (res.data.success) {
      deployed.value = res.data.deployed || false
      
      if (res.data.config) {
        const loadedConfig = res.data.config;
        // 使用 Object.assign 进行浅层合并
        Object.assign(config, loadedConfig);

        // ---- 加固处理 ----
        // 1. 确保 socialLinks 是数组，并过滤无效项
        if (Array.isArray(loadedConfig.socialLinks)) {
            config.socialLinks = loadedConfig.socialLinks.filter((link: any) => link && typeof link === 'object');
        } else {
            // 如果加载的不是数组，则使用默认值或空数组
            config.socialLinks = [
                { title: 'GitHub', url: 'https://github.com', icon: 'fab fa-github', enabled: true },
                { title: '博客', url: 'https://example.com', icon: 'fas fa-blog', enabled: true }
            ]; // 或者 config.socialLinks = [];
        }

        // 2. 确保 customContent 是对象
        if (typeof loadedConfig.customContent !== 'object' || loadedConfig.customContent === null) {
            config.customContent = {
                text: '在这里添加您想展示的文字和表情',
                enabled: true
            };
        }
        // 3. 确保 moduleOrder 是数组
         if (!Array.isArray(loadedConfig.moduleOrder)) {
            config.moduleOrder = ['uptime', 'social', 'time', 'customContent', 'helper'];
         }
        // 确保 enableTime 存在
        if (typeof loadedConfig.enableTime !== 'boolean') {
          config.enableTime = true; // 如果加载的配置没有此项，则默认为 true
        }
        // ---- 加固结束 ----

        // 确保计算属性更新
        moduleEnabledStates.value = getModuleEnabledStates()
      }
    }
  } catch (error) {
    console.error('获取状态失败:', error)
    ElMessage.error('获取部署状态失败')
  } finally {
    loading.value = false
  }
}

// 创建计算属性获取模块启用状态
const getModuleEnabledStates = () => {
  const states: Record<string, boolean> = {}
  config.moduleOrder.forEach(module => {
    switch (module) {
      case 'uptime':
        states[module] = config.enableUptime
        break
      case 'social':
        states[module] = config.enableSocialLinks
        break
      case 'time': // 处理 time 模块
        states[module] = config.enableTime 
        break
      case 'customContent':
        states[module] = config.enableCustomContent
        break
      case 'helper':
        states[module] = config.enableHelperAd
        break
      default:
        states[module] = true // 对于无法识别的模块，默认启用? 或者 false? 暂时保持 true
    }
  })
  return states
}

// 模块启用状态
const moduleEnabledStates = ref(getModuleEnabledStates())

// 更新模块启用状态
const updateModuleEnabled = (module: string, value: boolean) => {
  switch (module) {
    case 'uptime':
      config.enableUptime = value
      break
    case 'social':
      config.enableSocialLinks = value
      break
    case 'time': // 添加 time 模块处理
      config.enableTime = value
      break
    case 'customContent':
      config.enableCustomContent = value
      break
    case 'helper':
      config.enableHelperAd = value
      break
  }
  
  // 更新显示状态
  moduleEnabledStates.value = getModuleEnabledStates()
}

// 拖拽开始
const draggedItem = ref<string | null>(null)

// 拖拽开始事件处理
const dragStart = (event: DragEvent, module: string) => {
  if (event.dataTransfer) {
    event.dataTransfer.setData('text/plain', module)
    draggedItem.value = module
    
    // 添加拖拽中样式
    const element = event.target as HTMLElement
    element.classList.add('dragging')
  }
}

// 拖拽结束事件处理
const dragEnd = (event: DragEvent) => {
  // 移除拖拽中样式
  const element = event.target as HTMLElement
  element.classList.remove('dragging')
  draggedItem.value = null
}

// 拖拽放置事件处理
const drop = (event: DragEvent, targetModule: string) => {
  event.preventDefault()
  
  // 移除所有元素的拖拽样式
  document.querySelectorAll('.module-item').forEach(item => {
    item.classList.remove('dragging')
    item.classList.remove('drag-over')
  })
  
  if (event.dataTransfer) {
    const draggedModule = event.dataTransfer.getData('text/plain')
    if (draggedModule !== targetModule) {
      const newOrder = [...config.moduleOrder]
      const draggedIndex = newOrder.indexOf(draggedModule)
      const targetIndex = newOrder.indexOf(targetModule)
      
      // 移除拖拽的模块
      newOrder.splice(draggedIndex, 1)
      // 插入到目标位置
      newOrder.splice(targetIndex, 0, draggedModule)
      
      // 更新模块顺序
      config.moduleOrder = newOrder
      
      // 更新moduleEnabledStates
      moduleEnabledStates.value = getModuleEnabledStates()
    }
  }
}

// 拖拽经过事件处理
const dragOver = (event: DragEvent, module: string) => {
  event.preventDefault()
  // 添加拖拽目标样式
  const element = event.currentTarget as HTMLElement
  element.classList.add('drag-over')
}

// 拖拽离开事件处理
const dragLeave = (event: DragEvent) => {
  // 移除拖拽目标样式
  const element = event.currentTarget as HTMLElement
  element.classList.remove('drag-over')
}

// 自动保存配置的定时器
let saveConfigTimer: ReturnType<typeof setTimeout> | null = null

// 监听配置变化，实时保存
watch(
  () => config,
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

// 保存配置（不部署）
const saveConfig = async () => {
  try {
    console.log('自动保存配置')
    await axios.post<ApiResponse<{}>>('/api/toolbox/footer/lifeline-footer/save-config', config)
  } catch (error) {
    console.error('保存配置失败:', error)
  }
}

// 部署页脚
const deployFooter = async () => {
  try {
    saving.value = true
    const res = await axios.post<ApiResponse<{}>>('/api/toolbox/footer/lifeline-footer/deploy', config)
    if (res.data.success) {
      ElMessage.success('部署成功')
      deployed.value = true
    } else if (res.data.error === 'ANOTHER_FOOTER_DEPLOYED') {
      // 如果是互斥错误，提示用户先取消其他页脚
      ElMessageBox.confirm(
        '当前已有其他页脚部署，是否取消其他页脚部署并应用当前页脚？',
        '确认',
        {
          confirmButtonText: '确认',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).then(async () => {
        // 用户确认，先卸载其他页脚，再部署当前页脚
        try {
          saving.value = true
          // 假设其他页脚是 icp-footer
          await axios.post<ApiResponse<{}>>('/api/toolbox/footer/icp-footer/undeploy')
          // 部署当前页脚
          const deployRes = await axios.post<ApiResponse<{}>>('/api/toolbox/footer/lifeline-footer/deploy', config)
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
        // 用户取消，不做任何操作
      })
    } else {
      // 显示后端返回的详细错误信息
      ElMessage.error('部署失败: ' + (res.data.message || '未知错误'))
    }
  } catch (error: any) {
    console.error('部署失败:', error)
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
            await axios.post<ApiResponse<{}>>('/api/toolbox/footer/icp-footer/undeploy')
            const deployRes = await axios.post<ApiResponse<{}>>('/api/toolbox/footer/lifeline-footer/deploy', config)
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
      ElMessage.error('部署请求失败: ' + (error.message || ''));
    }
  } finally {
    saving.value = false
  }
}

// 取消部署
const undeployFooter = async () => {
  try {
    await ElMessageBox.confirm('确定要取消部署页脚吗？', '确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    saving.value = true
    const res = await axios.post<ApiResponse<{}>>('/api/toolbox/footer/lifeline-footer/undeploy')
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
const redeployFooter = async () => {
  try {
    saving.value = true
    // 先取消部署
    await axios.post<ApiResponse<{}>>('/api/toolbox/footer/lifeline-footer/undeploy')
    // 再重新部署
    const res = await axios.post<ApiResponse<{}>>('/api/toolbox/footer/lifeline-footer/deploy', config)
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

// 切换显示自定义图标输入框
const toggleCustomIconInput = () => {
  showCustomIconInput.value = !showCustomIconInput.value
}

// 获取模块名称
const getModuleName = (module: string) => {
  const moduleNames: Record<string, string> = {
    uptime: '运行时间',
    social: '社交链接',
    time: '时辰信息',
    customContent: '自定义内容',
    helper: 'Helper广告'
  }
  return moduleNames[module] || module
}

// 获取模块启用状态 (注意：此函数似乎与 getModuleEnabledStates 重复，可以考虑合并或移除)
// 暂时保留并修复 time 模块
const getModuleEnabled = (module: string) => {
  switch (module) {
    // ... cases for uptime, social, customContent, helper ...
    case 'time': // 添加 time 模块处理
       return computed({
         get: () => config.enableTime,
         set: (val) => config.enableTime = val
       })
    default:
      // 对于无法识别或不需要开关的模块（比如 time 之前被硬编码为 true）
      // 保持原样或返回一个不可变的 ref
      return ref(true) // 保持默认行为
  }
}

// 初始化配置
const initConfig = () => {
  config.moduleOrder = ['uptime', 'social', 'time', 'customContent', 'helper']
}

onMounted(() => {
  checkDeployStatus()
  // initConfig() // 这个函数似乎没用了
  // 监听全局的 focus 和 blur 事件来追踪焦点
  document.addEventListener('focusin', trackFocus);
  document.addEventListener('focusout', trackBlur);
})

// 组件卸载时移除监听器
onUnmounted(() => {
  document.removeEventListener('focusin', trackFocus);
  document.removeEventListener('focusout', trackBlur);
  // 清除定时器
  if (saveConfigTimer) {
    clearTimeout(saveConfigTimer)
  }
})

// --- 插入逻辑 ---
const insertAtCursor = (element: HTMLInputElement | HTMLTextAreaElement, textToInsert: string) => {
  const startPos = element.selectionStart ?? element.value.length;
  const endPos = element.selectionEnd ?? element.value.length;
  const text = element.value;
  element.value = text.substring(0, startPos) + textToInsert + text.substring(endPos, text.length);
  // 手动触发 input 事件，确保 v-model 更新
  element.dispatchEvent(new Event('input', { bubbles: true }));
  // 恢复焦点并设置光标位置
  element.focus();
  element.selectionStart = element.selectionEnd = startPos + textToInsert.length;
};

// 选择图标并插入 (修改后)
const selectIcon = (iconClass: string, target: 'link' | 'content') => {
  if (target === 'link') {
    newLink.icon = iconClass; // 直接更新链接图标模型
    showLinkIcons.value = false; // 选择后关闭链接图标选择器
  } else if (target === 'content') {
    if (focusedTextarea.value) {
      const iconHtml = `<i class="${iconClass}"></i>`;
      insertAtCursor(focusedTextarea.value, iconHtml);
      showContentIcons.value = false; // 选择后关闭内容图标选择器
    } else {
      ElMessage.warning('请先将光标置于自定义内容文本框内');
    }
  }
}

// 选择表情并插入 (修改后，确保只用于内容区)
const insertEmoji = (emoji: string) => {
  if (focusedTextarea.value) {
    insertAtCursor(focusedTextarea.value, emoji);
    // 可以选择在这里关闭表情选择器
    // showContentEmojis.value = false;
  } else {
     ElMessage.warning('请先将光标置于自定义内容文本框内');
  }
}

// --- 图标/表情数据 (保持不变) ---
const brandIcons = [
  // 社交 & 媒体
  'fab fa-github', 'fab fa-gitlab', 'fab fa-bitbucket', 'fab fa-stack-overflow', 'fab fa-dev', 'fab fa-medium', 'fab fa-twitter', 'fab fa-facebook', 'fab fa-linkedin', 'fab fa-instagram', 'fab fa-youtube', 'fab fa-twitch', 'fab fa-discord', 'fab fa-telegram', 'fab fa-whatsapp', 'fab fa-slack', 'fab fa-skype', 'fab fa-tiktok', 'fab fa-snapchat', 'fab fa-pinterest', 'fab fa-tumblr', 'fab fa-reddit', 'fab fa-quora', 'fab fa-weibo', 'fab fa-weixin', 'fab fa-qq', 'fab fa-zhihu', 'fab fa-bilibili',
  // 操作系统 & 浏览器
  'fab fa-apple', 'fab fa-windows', 'fab fa-linux', 'fab fa-android', 'fab fa-ubuntu', 'fab fa-fedora', 'fab fa-redhat', 'fab fa-suse', 'fab fa-chrome', 'fab fa-firefox-browser', 'fab fa-safari', 'fab fa-opera', 'fab fa-edge', 'fab fa-internet-explorer',
  // 开发 & 技术
  'fab fa-docker', 'fab fa-npm', 'fab fa-yarn', 'fab fa-node-js', 'fab fa-python', 'fab fa-java', 'fab fa-php', 'fab fa-js-square', 'fab fa-html5', 'fab fa-css3-alt', 'fab fa-react', 'fab fa-vuejs', 'fab fa-angular', 'fab fa-bootstrap', 'fab fa-git-alt', 'fab fa-aws', 'fab fa-google-cloud', 'fab fa-digital-ocean', 'fab fa-raspberry-pi',
  // 其他
  'fab fa-paypal', 'fab fa-amazon', 'fab fa-google', 'fab fa-microsoft', 'fab fa-wikipedia-w', 'fab fa-wordpress', 'fab fa-steam', 'fab fa-playstation', 'fab fa-xbox'
];

const commonIcons = [
  // 基础
  'fas fa-home', 'fas fa-user', 'fas fa-users', 'fas fa-user-circle', 'fas fa-user-shield', 'fas fa-user-astronaut', 'fas fa-envelope', 'fas fa-phone', 'fas fa-address-book', 'fas fa-id-card', 'fas fa-link', 'fas fa-unlink', 'fas fa-search', 'fas fa-cog', 'fas fa-cogs', 'fas fa-sliders-h', 'fas fa-filter', 'fas fa-tag', 'fas fa-tags', 'fas fa-bookmark', 'fas fa-flag', 'fas fa-bell', 'fas fa-calendar', 'fas fa-calendar-alt', 'fas fa-calendar-days', 'fas fa-calendar-check', 'fas fa-clock', 'fas fa-history', 'fas fa-hourglass-half',
  // 交互 & 状态
  'fas fa-heart', 'fas fa-star', 'fas fa-thumbs-up', 'fas fa-thumbs-down', 'fas fa-comment', 'fas fa-comments', 'fas fa-share', 'fas fa-share-alt', 'fas fa-retweet', 'fas fa-sync', 'fas fa-sync-alt', 'fas fa-redo', 'fas fa-undo', 'fas fa-spinner', 'fas fa-circle-notch', 'fas fa-check', 'fas fa-check-circle', 'fas fa-times', 'fas fa-times-circle', 'fas fa-plus', 'fas fa-plus-circle', 'fas fa-minus', 'fas fa-minus-circle', 'fas fa-info', 'fas fa-info-circle', 'fas fa-question', 'fas fa-question-circle', 'fas fa-exclamation', 'fas fa-exclamation-circle', 'fas fa-exclamation-triangle',
  // 内容 & 编辑
  'fas fa-blog', 'fas fa-book', 'fas fa-book-open', 'fas fa-newspaper', 'fas fa-file', 'fas fa-file-alt', 'fas fa-file-code', 'fas fa-file-image', 'fas fa-file-video', 'fas fa-file-audio', 'fas fa-file-pdf', 'fas fa-file-word', 'fas fa-file-excel', 'fas fa-file-powerpoint', 'fas fa-file-archive', 'fas fa-folder', 'fas fa-folder-open', 'fas fa-edit', 'fas fa-pen', 'fas fa-pen-square', 'fas fa-trash', 'fas fa-trash-alt', 'fas fa-copy', 'fas fa-paste', 'fas fa-cut', 'fas fa-save', 'fas fa-print',
  // 媒体 & 设备
  'fas fa-image', 'fas fa-images', 'fas fa-video', 'fas fa-film', 'fas fa-music', 'fas fa-headphones', 'fas fa-volume-up', 'fas fa-volume-down', 'fas fa-volume-mute', 'fas fa-camera', 'fas fa-microphone', 'fas fa-mobile-alt', 'fas fa-tablet-alt', 'fas fa-laptop', 'fas fa-desktop', 'fas fa-server', 'fas fa-database', 'fas fa-hdd', 'fas fa-memory', 'fas fa-microchip', 'fas fa-gamepad', 'fas fa-mouse', 'fas fa-keyboard',
  // 杂项
  'fas fa-globe', 'fas fa-map', 'fas fa-map-marker-alt', 'fas fa-compass', 'fas fa-location-dot', 'fas fa-lightbulb', 'fas fa-moon', 'fas fa-sun', 'fas fa-cloud', 'fas fa-cloud-sun', 'fas fa-cloud-moon', 'fas fa-cloud-showers-heavy', 'fas fa-snowflake', 'fas fa-fire', 'fas fa-leaf', 'fas fa-paw', 'fas fa-gift', 'fas fa-birthday-cake', 'fas fa-bomb', 'fas fa-trophy', 'fas fa-award', 'fas fa-medal', 'fas fa-key', 'fas fa-lock', 'fas fa-unlock', 'fas fa-shield-alt', 'fas fa-shield-halved', 'fas fa-wifi', 'fas fa-rss', 'fas fa-podcast', 'fas fa-broadcast-tower', 'fas fa-car', 'fas fa-bus', 'fas fa-train', 'fas fa-subway', 'fas fa-plane', 'fas fa-rocket', 'fas fa-anchor', 'fas fa-shopping-cart', 'fas fa-shopping-bag', 'fas fa-store', 'fas fa-money-bill-wave', 'fas fa-credit-card', 'fas fa-chart-bar', 'fas fa-chart-line', 'fas fa-chart-pie', 'fas fa-code-branch', 'fas fa-sitemap', 'fas fa-sign-language', 'fas fa-handshake'
];

const utilityIcons = [
  // 方向 & 导航
  'fas fa-arrow-up', 'fas fa-arrow-down', 'fas fa-arrow-left', 'fas fa-arrow-right', 'fas fa-arrows-alt', 'fas fa-expand', 'fas fa-compress', 'fas fa-chevron-up', 'fas fa-chevron-down', 'fas fa-chevron-left', 'fas fa-chevron-right', 'fas fa-angle-up', 'fas fa-angle-down', 'fas fa-angle-left', 'fas fa-angle-right', 'fas fa-angle-double-up', 'fas fa-angle-double-down', 'fas fa-angle-double-left', 'fas fa-angle-double-right', 'fas fa-external-link-alt', 'fas fa-sign-in-alt', 'fas fa-sign-out-alt', 'fas fa-door-closed', 'fas fa-door-open',
  // UI & 控件
  'fas fa-bars', 'fas fa-ellipsis-h', 'fas fa-ellipsis-v', 'fas fa-th', 'fas fa-th-large', 'fas fa-th-list', 'fas fa-grip-horizontal', 'fas fa-grip-vertical', 'fas fa-sort', 'fas fa-sort-up', 'fas fa-sort-down', 'fas fa-sort-alpha-down', 'fas fa-sort-alpha-up', 'fas fa-sort-numeric-down', 'fas fa-sort-numeric-up', 'fas fa-check-square', 'fas fa-square', 'far fa-check-square', 'far fa-square', 'fas fa-toggle-on', 'fas fa-toggle-off', 'fas fa-eye', 'fas fa-eye-slash', 'fas fa-ban', 'fas fa-power-off', 'fas fa-search-plus', 'fas fa-search-minus',
  // 文本编辑
  'fas fa-bold', 'fas fa-italic', 'fas fa-underline', 'fas fa-strikethrough', 'fas fa-list-ul', 'fas fa-list-ol', 'fas fa-indent', 'fas fa-outdent', 'fas fa-align-left', 'fas fa-align-center', 'fas fa-align-right', 'fas fa-align-justify', 'fas fa-link', 'fas fa-unlink', 'fas fa-paperclip', 'fas fa-quote-left', 'fas fa-quote-right', 'fas fa-code', 'fas fa-terminal', 'fas fa-font', 'fas fa-text-height', 'fas fa-text-width'
];

const commonEmojis = ['😀', '😂', '🥰', '😎', '🤔', '👍', '👎', '❤️', '💖', '🎉', '🥳', '💯', '👀', '🔥', '✨', '🌟', '🚀', '💡', '✅', '❌', '⚠️', '❓', '❗', '👋', '🙏'];
const allEmojis = [
  // Smileys & Emotion
  '😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', '🥰', '😍', '🤩', '😘', '😗', '😚', '😙', '😋', '😛', '😜', '🤪', '😝', '🤑', '🤗', '🤭', '🤫', '🤔', '🤐', '🤨', '😐', '😑', '😶', '😏', '😒', '🙄', '😬', '🤥', '😌', '😔', '😪', '🤤', '😴', '😷', '🤒', '🤕', '🤢', '🤮', '🤧', '🥵', '🥶', '🥴', '😵', '🤯', '🤠', '🥳', '🥸', '😎', '🤓', '🧐', '😕', '😟', '🙁', '☹️', '😮', '😯', '😲', '😳', '🥺', '😦', '😧', '😨', '😰', '😥', '😢', '😭', '😱', '😖', '😣', '😞', '😓', '😩', '😫', '🥱', '😤', '😡', '😠', '🤬', '😈', '👿', '💀', '☠️', '💩', '🤡', '👹', '👺', '👻', '👽', '👾', '🤖', '🎃', '😺', '😸', '😹', '😻', '😼', '😽', '🙀', '😿', '😾',
  // People & Body
  '👋', '🤚', '🖐️', '✋', '🖖', '👌', '🤌', '🤏', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '🖕', '👇', '☝️', '👍', '👎', '✊', '👊', '🤛', '🤜', '👏', '🙌', '👐', '🤲', '🤝', '🙏', '✍️', '💅', '🤳', '💪', '🦾', '🦵', '🦿', '🦶', '👂', '🦻', '👃', '🧠', '🫀', '🫁', '🦷', '🦴', '👀', '👁️', '👅', '👄', '👶', '👧', '🧒', '👦', '👩', '🧑', '👨', '👩‍🦱', '🧑‍🦱', '👨‍🦱', '👩‍🦰', '🧑‍🦰', '👨‍🦰', '👱‍♀️', '👱', '👱‍♂️', '👩‍🦳', '🧑‍🦳', '👨‍🦳', '👩‍🦲', '🧑‍🦲', '👨‍🦲', '🧔', '👵', '🧓', '👴', '👲', '👳‍♀️', '👳', '👳‍♂️', '🧕', '👮‍♀️', '👮', '👮‍♂️', '👷‍♀️', '👷', '👷‍♂️', '💂‍♀️', '💂', '💂‍♂️', '🕵️‍♀️', '🕵️', '🕵️‍♂️', '👩‍⚕️', '🧑‍⚕️', '👨‍⚕️', '👩‍🌾', '🧑‍🌾', '👨‍🌾', '👩‍🍳', '🧑‍🍳', '👨‍🍳', '👩‍🎓', '🧑‍🎓', '👨‍🎓', '👩‍🎤', '🧑‍🎤', '👨‍🎤', '👩‍🏫', '🧑‍🏫', '👨‍🏫', '👩‍🏭', '🧑‍🏭', '👨‍🏭', '👩‍💻', '🧑‍💻', '👨‍💻', '👩‍💼', '🧑‍💼', '👨‍💼', '👩‍🔧', '🧑‍🔧', '👨‍🔧', '👩‍🔬', '🧑‍🔬', '👨‍🔬', '👩‍🎨', '🧑‍🎨', '👨‍🎨', '👩‍🚒', '🧑‍🚒', '👨‍🚒', '👩‍✈️', '🧑‍✈️', '👨‍✈️', '👩‍🚀', '🧑‍🚀', '👨‍🚀', '👩‍⚖️', '🧑‍⚖️', '👨‍⚖️', '👰‍♀️', '👰', '👰‍♂️', '🤵‍♀️', '🤵', '🤵‍♂️', '👸', '🤴', '🦸‍♀️', '🦸', '🦸‍♂️', '🦹‍♀️', '🦹', '🦹‍♂️', '🤶', '🎅', '🧙‍♀️', '🧙', '🧙‍♂️', '🧝‍♀️', '🧝', '🧝‍♂️', '🧛‍♀️', '🧛', '🧛‍♂️', '🧟‍♀️', '🧟', '🧟‍♂️', '🧞‍♀️', '🧞', '🧞‍♂️', '🧜‍♀️', '🧜', '🧜‍♂️', '🧚‍♀️', '🧚', '🧚‍♂️', '👼', '🤰', '🤱', '👩‍🍼', '🧑‍🍼', '👨‍🍼', '🙇‍♀️', '🙇', '🙇‍♂️', '💁‍♀️', '💁', '💁‍♂️', '🙅‍♀️', '🙅', '🙅‍♂️', '🙆‍♀️', '🙆', '🙆‍♂️', '🙋‍♀️', '🙋', '🙋‍♂️', '🧏‍♀️', '🧏', '🧏‍♂️', '🤦‍♀️', '🤦', '🤦‍♂️', '🤷‍♀️', '🤷', '🤷‍♂️', '🙎‍♀️', '🙎', '🙎‍♂️', '🙍‍♀️', '🙍', '🙍‍♂️', '💇‍♀️', '💇', '💇‍♂️', '💆‍♀️', '💆', '💆‍♂️', '🧖‍♀️', '🧖', '🧖‍♂️', '🚶‍♀️', '🚶', '🚶‍♂️', '🧍‍♀️', '🧍', '🧍‍♂️', '🧎‍♀️', '🧎', '🧎‍♂️', '👩‍🦯', '🧑‍🦯', '👨‍🦯', '👩‍🦼', '🧑‍🦼', '👨‍🦼', '👩‍🦽', '🧑‍🦽', '👨‍🦽', '🏃‍♀️', '🏃', '🏃‍♂️', '💃', '🕺', '🕴️', '👯‍♀️', '👯', '👯‍♂️', '🧗‍♀️', '🧗', '🧗‍♂️', '🤺', '🏇', '⛷️', '🏂', '🏌️‍♀️', '🏌️', '🏌️‍♂️', '🏄‍♀️', '🏄', '🏄‍♂️', '🚣‍♀️', '🚣', '🚣‍♂️', '🏊‍♀️', '🏊', '🏊‍♂️', '⛹️‍♀️', '⛹️', '⛹️‍♂️', '🏋️‍♀️', '🏋️', '🏋️‍♂️', '🚴‍♀️', '🚴', '🚴‍♂️', '🚵‍♀️', '🚵', '🚵‍♂️', '🤸‍♀️', '🤸', '🤸‍♂️', '🤼‍♀️', '🤼', '🤼‍♂️', '🤽‍♀️', '🤽', '🤽‍♂️', '🤾‍♀️', '🤾', '🤾‍♂️', '🤹‍♀️', '🤹', '🤹‍♂️', '🧘‍♀️', '🧘', '🧘‍♂️', '🛀', '🛌', '👭', '👩‍❤️‍👩', '👫', '💑', '👬', '👨‍❤️‍👨', '👩‍❤️‍💋‍👩', '💏', '👨‍❤️‍💋‍👨', '👪', '👨‍👩‍👦', '👨‍👩‍👧', '👨‍👩‍👧‍👦', '👨‍👩‍👦‍👦', '👨‍👩‍👧‍👧', '👨‍👨‍👦', '👨‍👨‍👧', '👨‍👨‍👧‍👦', '👨‍👨‍👦‍👦', '👨‍👨‍👧‍👧', '👩‍👩‍👦', '👩‍👩‍👧', '👩‍👩‍👧‍👦', '👩‍👩‍👦‍👦', '👩‍👩‍👧‍👧', '👨‍👦', '👨‍👦‍👦', '👨‍👧', '👨‍👧‍👦', '👨‍👧‍👧', '👩‍👦', '👩‍👦‍👦', '👩‍👧', '👩‍👧‍👦', '👩‍👧‍👧', '🗣️', '👤', '👥', '🫂',
  // Animals & Nature
  '🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐻‍❄️', '🐨', '🐯', '🦁', '🐮', '🐷', '🐽', '🐸', '🐵', '🙈', '🙉', '🙊', '🐒', '🐔', '🐧', '🐦', '🐤', '🐣', '🐥', '🦆', '🦅', '🦉', '🦇', '🐺', '🐗', '🐴', '🦄', '🐝', '🐛', '🦋', '🐌', '🐞', '🐜', '🦟', '🦗', '🕷️', '🕸️', '🦂', '🐢', '🐍', '🦎', '🦖', '🦕', '🐙', '🦑', '🦐', '🦞', '🦀', '🐡', '🐠', '🐟', '🐬', '🐳', '🐋', '🦈', '🐊', '🐅', '🐆', '🦓', '🦍', '🦧', '🐘', '🦛', '🦏', '🐪', '🐫', '🦒', '🐃', '🐂', '🐄', '🐎', '🐖', '🐏', '🐑', '🐐', '🦌', '🐕', '🐩', '🦮', '🐕‍🦺', '🐈', '🐈‍⬛', '🐓', '🦃', '🦚', '🦜', '🦢', '🦩', '🕊️', '🐇', '🦝', '🦨', '🦡', '🦦', '🦥', '🐁', '🐀', '🐿️', '🦔', '🐾', '🐉', '🐲', '🌵', '🎄', '🌲', '🌳', '🌴', '🌱', '🌿', '☘️', '🍀', '🎍', '🎋', '🍃', '🍂', '🍁', '🍄', '🐚', '🌾', '💐', '🌷', '🌹', '🥀', '🌺', '🌸', '🌼', '🌻', '☀️', '🌕', '🌖', '🌗', '🌘', '🌑', '🌒', '🌓', '🌔', '🌙', '🌎', '🌍', '🌏', '💫', '⭐', '🌟', '✨', '⚡', '☄️', '💥', '🔥', '🌪️', '🌈', '☀️', '🌤️', '⛅', '🌥️', '☁️', '🌦️', '🌧️', '⛈️', '🌩️', '🌨️', '❄️', '☃️', '⛄', '🌬️', '💨', '💧', '💦', '☔', '☂️', '🌊', '🌫️',
  // Food & Drink
  '🍇', '🍈', '🍉', '🍊', '🍋', '🍌', '🍍', '🥭', '🍎', '🍏', '🍐', '🍑', '🍒', '🍓', '🥝', '🍅', '🥥', '🥑', '🍆', '🥔', '🥕', '🌽', '🌶️', '🥒', '🥬', '🥦', '🧄', '🧅', '🍄', '🥜', '🌰', '🍞', '🥐', '🥖', '🥨', '🥯', '🥞', '🧇', '🧀', '🍖', '🍗', '🥩', '🥓', '🍔', '🍟', '🍕', '🌭', '🥪', '🌮', '🌯', '🥙', '🧆', '🥚', '🍳', '🥘', '🍲', '🥣', '🥗', '🍿', '🧈', '🧂', '🥫', '🍱', '🍘', '🍙', '🍚', '🍛', '🍜', '🍝', '🍠', '🍢', '🍣', '🍤', '🍥', '🥮', '🍡', '🥟', '🥠', '🥡', '🦀', '🦞', '🦐', '🦑', '🦪', '🍦', '🍧', '🍨', '🍩', '🍪', '🎂', '🍰', '🧁', '🥧', '🍫', '🍬', '🍭', '🍮', '🍯', '🍼', '🥛', '☕', '🍵', '🍶', '🍾', '🍷', '🍸', '🍹', '🍺', '🍻', '🥂', '🥃', '🥤', '🧋', '🧃', '🧉', '🧊', '🥢', '🍽️', '🍴', '🥄', '🔪', '🏺',
  // ... (Add more categories like Travel, Activities, Objects, Symbols, Flags if needed)
];
</script>

<template>
  <div class="footer-detail-container">
    <div class="page-header">
      <div class="back-button" @click="router.push('/dashboard/toolbox/footer')">
        <i class="fas fa-arrow-left"></i> 返回
      </div>
      <h1 class="page-title">生命线页脚</h1>
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
        <el-card shadow="never" class="config-card">
          <template #header>
            <div class="card-header">
              <span>基本设置</span>
            </div>
          </template>
          
          <el-form label-position="top">
            <el-form-item label="网站上线日期">
              <el-date-picker
                v-model="config.siteLaunchDate"
                type="date"
                placeholder="选择日期"
                style="width: 100%"
              />
            </el-form-item>
            
            <el-form-item label="运行时间前缀文字">
              <el-input
                v-model="config.uptimePrefix"
                placeholder="例如：本站已运行、本站已苟活..."
              />
            </el-form-item>

            <!-- 新增颜色选择器 -->
            <el-form-item label="主要文本颜色">
              <el-color-picker v-model="config.textColor" show-alpha />
            </el-form-item>
            <el-form-item label="强调/高亮颜色">
              <el-color-picker v-model="config.accentColor" show-alpha />
            </el-form-item>

          </el-form>
        </el-card>
        
        <el-card shadow="never" class="config-card" v-if="config.enableSocialLinks">
          <template #header>
            <div class="card-header">
              <span>社交链接</span>
              <el-button v-if="editingLink" type="danger" link @click="cancelEditLink">取消编辑</el-button>
            </div>
          </template>
          
          <div class="links-container">
            <div class="link-list">
              <div
                v-for="(link, index) in config.socialLinks"
                :key="index"
                class="link-item"
                :class="{ 'editing': editingLinkIndex === index }"
              >
                <div class="link-info">
                  <i :class="link.icon"></i>
                  <span class="link-title">{{ link.title }}</span>
                  <span class="link-url">{{ link.url }}</span>
                </div>
                <div class="link-actions">
                  <el-switch
                    v-model="link.enabled"
                    :active-text="link.enabled ? '启用' : '禁用'"
                    style="margin-right: 10px;"
                  />
                  <el-button
                    type="primary"
                    size="small"
                    @click="startEditLink(link, index)"
                    :disabled="editingLinkIndex === index"
                    class="edit-btn-solid" 
                  >
                    <i class="fas fa-edit" style="margin-right: 4px;"></i> 编辑
                  </el-button>
                  <el-button
                    type="danger"
                    size="small"
                    @click="deleteLink(index)"
                    circle
                    class="delete-btn"
                    style="margin-left: 5px;"
                  >
                    <i class="fas fa-trash"></i>
                  </el-button>
                </div>
              </div>
              
              <div class="empty-state" v-if="config.socialLinks.length === 0 && !editingLink">
                <i class="fas fa-link"></i>
                <span>暂无社交链接，请添加</span>
              </div>
            </div>
            
            <div class="add-link-section">
              <h3>{{ editingLink ? '编辑链接' : '添加新链接' }}</h3>
              <div class="add-link-form">
                <div class="form-row">
                  <el-input
                    v-model="newLink.title"
                    placeholder="链接标题"
                    class="input-item"
                    @focus="trackFocus" @blur="trackBlur"
                  />
                  <el-input
                    v-model="newLink.url"
                    placeholder="链接地址 (https://...)"
                    class="input-item"
                    @focus="trackFocus" @blur="trackBlur"
                  />
                </div>
                
                <div class="form-row">
                  <el-input
                    ref="socialIconInput"
                    v-model="newLink.icon"
                    placeholder="图标类名 (例: fab fa-github)"
                    class="input-item"
                    @focus="trackFocus" @blur="trackBlur"
                  >
                    <template #prepend>
                      <el-tooltip content="当前图标预览" placement="top">
                        <i :class="newLink.icon || 'fas fa-question-circle'" style="font-size: 18px; width: 25px; text-align: center;"></i>
                      </el-tooltip>
                    </template>
                  </el-input>
                </div>
                
                <!-- 在这里为社交链接添加统一的图标选择器 -->
                <div class="unified-picker">
                   <!-- 使用 showLinkIcons -->
                   <el-button type="default" @click="showLinkIcons = !showLinkIcons">
                     {{ showLinkIcons ? '收起图标' : '选择图标' }} <i :class="showLinkIcons ? 'fas fa-chevron-up' : 'fas fa-chevron-down'" style="margin-left: 5px;"></i>
                   </el-button>
                   <transition name="el-fade-in-linear">
                     <!-- 使用 showLinkIcons -->
                     <div v-show="showLinkIcons" class="icons-grid picker-content">
                        <!-- 图标选择内容 (与自定义内容部分相同) -->
                        <div class="icons-category">
                           <div class="category-title">品牌图标</div>
                           <div class="icons-group">
                           <!-- 传递 target='link' -->
                           <div v-for="icon in brandIcons" :key="icon" class="icon-option" @click="selectIcon(icon, 'link')"> <i :class="icon"></i> </div>
                           </div>
                        </div>
                        <div class="icons-category">
                           <div class="category-title">常用图标</div>
                           <div class="icons-group">
                           <!-- 传递 target='link' -->
                           <div v-for="icon in commonIcons" :key="icon" class="icon-option" @click="selectIcon(icon, 'link')"> <i :class="icon"></i> </div>
                           </div>
                        </div>
                        <div class="icons-category">
                           <div class="category-title">实用图标</div>
                           <div class="icons-group">
                           <!-- 传递 target='link' -->
                           <div v-for="icon in utilityIcons" :key="icon" class="icon-option" @click="selectIcon(icon, 'link')"> <i :class="icon"></i> </div>
                           </div>
                        </div>
                     </div>
                   </transition>
                </div>
                
                <!-- 注意：通常不需要在编辑链接时选择表情，所以不在这里复制表情选择器 -->

                <div class="form-actions">
                  <el-button v-if="editingLink" @click="cancelEditLink">取消</el-button>
                  <el-button v-if="editingLink" type="primary" @click="saveEditLink">保存修改</el-button>
                  <el-button v-else type="primary" @click="addLink">添加链接</el-button>
                </div>
              </div>
            </div>
          </div>
        </el-card>
        
        <!-- 自定义内容配置 -->
        <el-card shadow="never" class="config-card" v-if="config.enableCustomContent">
          <template #header>
            <div class="card-header">
              <span>自定义内容</span>
            </div>
          </template>
          
          <div class="custom-content-config">
            <el-form label-position="top">
              <el-form-item label="文本内容 (可混合输入文字、图标、Emoji)">
                <el-input
                  ref="customContentTextareaInput"  class="custom-content-textarea" 
                  v-model="config.customContent.text"
                  type="textarea"
                  :rows="3"
                  placeholder="输入自定义内容，例如：Made with ❤️ by Me 😀"
                  @focus="trackFocus" @blur="trackBlur"
                />
              </el-form-item>

              <!-- 统一的图标选择器 (移除这一整块) -->
              <!-- 
              <div class="unified-picker">
                 <el-button type="default" @click="showContentIcons = !showContentIcons">
                   {{ showContentIcons ? '收起图标' : '选择图标 (用于内容)' }} <i :class="showContentIcons ? 'fas fa-chevron-up' : 'fas fa-chevron-down'" style="margin-left: 5px;"></i>
                 </el-button>
                 <transition name="el-fade-in-linear">
                   <div v-show="showContentIcons" class="icons-grid picker-content">
                      <div class="icons-category">
                         <div class="category-title">品牌图标</div>
                         <div class="icons-group">
                         <div v-for="icon in brandIcons" :key="icon" class="icon-option" @click="selectIcon(icon, 'content')"> <i :class="icon"></i> </div>
                         </div>
                      </div>
                      <div class="icons-category">
                         <div class="category-title">常用图标</div>
                         <div class="icons-group">
                         <div v-for="icon in commonIcons" :key="icon" class="icon-option" @click="selectIcon(icon, 'content')"> <i :class="icon"></i> </div>
                         </div>
                      </div>
                      <div class="icons-category">
                         <div class="category-title">实用图标</div>
                         <div class="icons-group">
                         <div v-for="icon in utilityIcons" :key="icon" class="icon-option" @click="selectIcon(icon, 'content')"> <i :class="icon"></i> </div>
                         </div>
                      </div>
                   </div>
                 </transition>
              </div>
              -->

              <!-- 统一的表情选择器 (保留) -->
               <div class="unified-picker">
                 <!-- 使用 showContentEmojis -->
                 <el-button type="default" @click="showContentEmojis = !showContentEmojis">
                   {{ showContentEmojis ? '收起表情' : '选择表情' }} <i :class="showContentEmojis ? 'fas fa-chevron-up' : 'fas fa-chevron-down'" style="margin-left: 5px;"></i>
                 </el-button>
                 <transition name="el-fade-in-linear">
                    <!-- 使用 showContentEmojis -->
                    <div v-show="showContentEmojis" class="emojis-grid picker-content">
                       <div class="category-title">常用表情</div>
                       <div class="emojis-group">
                         <span v-for="emoji in commonEmojis" :key="emoji" class="emoji-option" @click="insertEmoji(emoji)">{{ emoji }}</span>
                       </div>
                       <div class="category-title">所有表情</div>
                       <div class="emojis-group all-emojis">
                         <span v-for="emoji in allEmojis" :key="emoji" class="emoji-option" @click="insertEmoji(emoji)">{{ emoji }}</span>
                       </div> <!-- Correctly closing all-emojis div -->
                       
                       <!-- emoji-help should be after all-emojis group, but inside picker-content -->
                       <div class="emoji-help">
                         <p>您也可以直接复制粘贴其他地方的Emoji或图标代码到文本框中。</p>
                         <p>国内常用Emoji网站: <a href="https://emojixd.com/" target="_blank">EmojiXD</a>, <a href="https://www.emojiall.com/zh-hans" target="_blank">EmojiAll</a></p>
                       </div>
                    </div> <!-- Correctly closing picker-content div -->
                 </transition>
              </div>
            </el-form>
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
          
          <!-- Apply CSS variables for dynamic colors -->
          <div 
            class="footer-preview"
            :style="{
              '--footer-text-color': config.textColor,
              '--footer-accent-color': config.accentColor
            }"
          >
            <div class="footer-body">
              <div class="footer-content">
                <template v-for="module in config.moduleOrder" :key="module">
                  <div v-if="module === 'uptime' && moduleEnabledStates.uptime" class="top-row">
                    <div class="uptime-container">
                      <div class="uptime-title">
                        <i class="fas fa-heart-pulse"></i>
                        <span>{{ config.uptimePrefix }}</span>
                      </div>
                      <div class="time-blocks">
                        <div class="time-block">
                          <span class="time-value">999</span>
                          <span class="time-label">天</span>
                        </div>
                        <div class="time-block">
                          <span class="time-value">23</span>
                          <span class="time-label">时</span>
                        </div>
                        <div class="time-block">
                          <span class="time-value">59</span>
                          <span class="time-label">分</span>
                        </div>
                        <div class="time-block">
                          <span class="time-value">59</span>
                          <span class="time-label">秒</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div v-if="module === 'social' && moduleEnabledStates.social && config.socialLinks.some(link => link.enabled)" class="middle-row">
                    <div class="link-group">
                      <a 
                        v-for="(link, index) in config.socialLinks.filter(l => l.enabled)" 
                        :key="index"
                        href="javascript:void(0)"
                      >
                        <i :class="link.icon"></i>
                        {{ link.title }}
                      </a>
                    </div>
                  </div>
                  
                  <div v-if="module === 'time' && moduleEnabledStates.time" class="bottom-row">
                    <div class="runtime-block">
                      <i class="fas fa-clock"></i>
                      <span>当前时辰：</span>
                      <span class="time-number">午时</span>
                    </div>
                    
                    <div class="runtime-block">
                      <i class="fas fa-bolt"></i>
                      <span>载入耗时：</span>
                      <span class="time-number">123.45 ms</span>
                    </div>
                  </div>
                  
                  <div v-if="module === 'customContent' && moduleEnabledStates.customContent" class="custom-content-preview footer-values" v-html="config.customContent.text">
                  </div>
                  
                  <div v-if="module === 'helper' && moduleEnabledStates.helper" class="helper-ad">
                    <a href="javascript:void(0)" class="helper-content">
                      <i class="fas fa-rocket"></i>
                      <span>本站Sun-Panel美化增强 By-</span>
                      <span class="helper-name">Sun-Panel-Helper</span>
                      <span class="helper-tagline"> - 让您的Sun-Panel锦上添花~</span>
                      <!-- <span class="driver-info">驱动 By Sun-Panel</span> --> <!-- 移除或注释掉这个重复信息 -->
                    </a> <!-- 关闭 a 标签 -->
                  </div>
                </template>
              </div>
            </div>
          </div>
          
          <div class="action-notice">
            <el-alert
              title="以上为预览效果，部署后实际页脚将根据您的网站运行情况动态显示运行时间等信息。"
              type="info"
              :closable="false"
              show-icon
            />
          </div>
        </el-card>
        
        <!-- 模块顺序卡片 -->
        <el-card shadow="never" class="config-card module-order-card">
          <template #header>
            <div class="card-header">
              <span>模块顺序</span>
            </div>
          </template>
          
          <div class="module-order">
            <el-alert
              title="拖拽调整模块显示顺序"
              type="info"
              :closable="false"
              show-icon
              style="margin-bottom: 15px"
            />
            
            <div class="module-list">
              <div
                v-for="module in config.moduleOrder"
                :key="module"
                class="module-item"
                draggable="true"
                @dragstart="dragStart($event, module)"
                @dragend="dragEnd"
                @dragover="dragOver($event, module)"
                @dragleave="dragLeave"
                @drop="drop($event, module)"
              >
                <i class="fas fa-grip-vertical drag-handle"></i>
                <span class="module-name">{{ getModuleName(module) }}</span>
                <el-switch
                  :model-value="moduleEnabledStates[module]"
                  @update:model-value="(val) => updateModuleEnabled(module, val)"
                  :active-text="moduleEnabledStates[module] ? '显示' : '隐藏'"
                  :disabled="module === 'time' && !config.hasOwnProperty('enableTime')" 
                />
              </div>
            </div>
          </div>
        </el-card>
        
        <!-- 页脚信息卡片 -->
        <el-card shadow="never" class="footer-info-card">
          <div class="footer-info">
            <h3>生命线页脚</h3>
            <p class="footer-description">生命线页脚是一款优雅的页脚组件，展示网站运行时间、社交链接等信息，为访客提供更多互动可能。</p>
            
            <div class="author-tags">
              <div class="author-tag">
                <i class="fas fa-user"></i>
                <span>作者：KoWming</span>
              </div>
              <div class="author-tag">
                <i class="fas fa-code"></i>
                <span>开发：madrays</span>
              </div>
              <div class="author-tag">
                <i class="fas fa-calendar"></i>
                <span>更新：2025-03-24</span>
              </div>
            </div>
            
            <div class="footer-features">
              <h4>特性</h4>
              <ul>
                <li>优雅显示网站运行时间，精确到秒</li>
                <li>支持自定义社交媒体链接</li>
                <li>支持添加自定义内容和表情符号</li>
                <li>响应式设计，兼容各种设备</li>
                <li>优雅动画效果，提升用户体验</li>
                <li>模块位置可自由调整</li>
              </ul>
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

.links-container {
  padding: 10px 0;
}

.link-list {
  margin-bottom: 20px;
}

.link-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 15px;
  border-bottom: 1px solid #f0f0f0;
}

.link-item:last-child {
  border-bottom: none;
}

.link-info {
  display: flex;
  align-items: center;
  flex: 1;
  min-width: 0;
}

.link-info i {
  font-size: 16px;
  width: 20px;
  margin-right: 10px;
  color: #409EFF;
}

.link-title {
  font-weight: 500;
  margin-right: 10px;
  color: #303133;
  white-space: nowrap;
}

.link-url {
  color: #909399;
  font-size: 13px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
}

.link-actions {
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

.edit-btn {
  margin: 0 5px;
  background-color: #67c23a;
  color: white;
}

.edit-btn:hover {
  background-color: #85ce61;
}

.delete-btn {
  margin-left: 10px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 30px;
  color: #909399;
}

.empty-state i {
  font-size: 30px;
  margin-bottom: 10px;
}

.add-link-section {
  border-top: 1px solid #f0f0f0;
  padding-top: 20px;
}

.add-link-section h3 {
  font-size: 15px;
  margin: 0 0 15px;
  color: #303133;
}

.add-link-form {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.form-row {
  display: flex;
  gap: 10px;
}

.input-item {
  flex: 1;
}

.icons-section {
  width: 100%;
  margin-bottom: 10px;
}

.icons-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.icons-header span {
  font-weight: 500;
  color: #303133;
}

.custom-icon-input {
  margin-bottom: 15px;
}

.icon-help {
  margin-top: 8px;
  padding: 8px;
  background-color: #f9f9f9;
  border-radius: 4px;
  font-size: 12px;
  color: #606266;
}

.icon-help p {
  margin: 5px 0;
}

.icon-help a {
  color: #409EFF;
  text-decoration: none;
}

.icons-grid {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.icons-category {
  margin-bottom: 10px;
}

.category-title {
  font-size: 13px;
  color: #909399;
  margin-bottom: 8px;
}

.icons-group {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.icon-option {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  cursor: pointer;
  color: #606266;
  background-color: #f5f7fa;
  transition: all 0.3s;
}

.icon-option:hover {
  background-color: #e6f1fc;
  transform: translateY(-2px);
}

.icon-option.active {
  background-color: #409EFF;
  color: white;
}

.icon-option i {
  font-size: 18px;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 10px;
}

.footer-preview {
  /* Inherit colors from the style binding using CSS Variables */
  background-color: #1a1a1a; /* Keep dark background or make configurable? For now keep */
  border-radius: 6px;
  overflow: hidden;
  margin-bottom: 15px;
}

.footer-body {
  padding: 10px 0;
  color: var(--footer-text-color); /* Use CSS Variable for text color */
  font-size: 14px;
  line-height: 1.4;
  text-align: center;
}

.footer-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.top-row, .middle-row, .bottom-row {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
  width: 100%;
  gap: 15px;
  margin: 3px 0;
}

.uptime-container {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.uptime-title {
  display: inline-flex;
  align-items: center;
  font-weight: 500;
}

.uptime-title .fas {
  color: var(--footer-accent-color);
  margin-right: 5px;
  animation: heartbeat 1.3s infinite;
}

.time-blocks {
  display: flex;
  align-items: center;
  gap: 6px;
}

.time-block {
  display: flex;
  align-items: center;
  background: rgba(0, 0, 0, 0.2);
  padding: 2px 8px;
  border-radius: 4px;
}

.time-value {
  color: var(--footer-accent-color);
  font-weight: bold;
  font-size: 1.1em;
  margin-right: 2px;
}

.time-label {
  font-size: 0.8em;
  opacity: 0.85;
}

.link-group {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 3px;
  flex-wrap: wrap;
  justify-content: center;
}

.footer-preview a {
  color: var(--footer-accent-color);
  text-decoration: none;
  margin: 0 8px;
  display: inline-flex;
  align-items: center;
}

.footer-preview a:hover {
  color: var(--footer-accent-color);
  filter: brightness(1.2); /* Example: slightly brighten on hover */
}

.footer-preview a i {
  margin-right: 5px;
}

.runtime-block {
  display: flex;
  align-items: center;
}

.runtime-block i {
  margin-right: 5px;
}

.time-number {
  color: var(--footer-accent-color);
  font-weight: bold;
  margin: 0 2px;
}

.footer-custom-content {
  font-size: 0.95em;
  opacity: 0.9;
  padding: 2px 0;
}

.helper-ad {
  margin-top: 3px;
  padding: 2px 0;
  width: 100%;
  display: flex;
  justify-content: center;
}

.helper-content {
  display: inline-flex;
  align-items: center;
  background: rgba(0, 0, 0, 0.2);
  padding: 4px 12px;
  border-radius: 20px;
  flex-wrap: wrap;
  justify-content: center;
}

.helper-content i {
  margin-right: 5px;
}

.helper-name {
  color: var(--footer-accent-color);
  font-weight: bold;
  font-size: 1.1em;
  padding: 0 2px;
}

.helper-tagline {
  font-style: italic;
  margin-left: 5px;
  opacity: 0.95;
}

.action-notice {
  margin-top: 15px;
}

.footer-info {
  padding: 5px 0;
}

.footer-info h3 {
  font-size: 16px;
  margin: 0 0 10px;
  color: #303133;
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

@keyframes heartbeat {
  0% { transform: scale(1); }
  15% { transform: scale(1.15); }
  30% { transform: scale(1); }
  45% { transform: scale(1.15); }
  60% { transform: scale(1); }
  100% { transform: scale(1); }
}

@media (max-width: 992px) {
  .content-layout {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .form-row {
    flex-direction: column;
  }
  
  .icons-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }
}

.module-order {
  padding: 10px 0;
}

.module-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.module-item {
  display: flex;
  align-items: center;
  padding: 10px;
  background-color: #f5f7fa;
  border-radius: 4px;
  cursor: move;
  user-select: none;
  transition: background-color 0.3s;
  position: relative;
  margin-bottom: 8px;
}

.module-item:hover {
  background-color: #e6f1fc;
}

.module-item.dragging {
  opacity: 0.5;
  background-color: #e6f1fc;
}

.module-item.drag-over {
  border: 2px dashed #409EFF;
  transform: scale(1.01);
}

.drag-handle {
  margin-right: 10px;
  color: #909399;
  cursor: move;
}

.module-name {
  flex: 1;
  font-weight: 500;
  color: #303133;
}

.core-values-config {
  padding: 10px 0;
}

.icons-selection {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-bottom: 20px;
}

.selected-icon {
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px dashed #ebeef5;
}

.current-icon-display {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  background-color: #f5f7fa;
  border-radius: 4px;
  font-family: monospace;
}

.current-icon-display i {
  font-size: 22px;
  color: #409EFF;
}

/* 确保其他样式保留 */
.emoji-selector {
  margin: 10px 0;
}

.emoji-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.emoji-grid, .emoji-extended-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 15px;
}

.emoji-item {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  cursor: pointer;
  background-color: #f5f7fa;
  border-radius: 4px;
  transition: all 0.2s;
}

.emoji-item:hover {
  transform: scale(1.1);
  background-color: #e6f1fc;
}

.emoji-extended-grid {
  max-height: 220px;
  overflow-y: auto;
  padding: 5px;
  border: 1px solid #ebeef5;
  border-radius: 4px;
}

.emoji-guide {
  background-color: #f9f9f9;
  border-radius: 4px;
  padding: 10px;
  margin-top: 15px;
  font-size: 13px;
  color: #606266;
}

.emoji-guide p {
  margin: 0 0 5px 0;
  font-weight: 500;
}

.emoji-guide ul {
  margin: 0;
  padding-left: 15px;
}

.emoji-guide li {
  margin-bottom: 3px;
}

.emoji-guide a {
  color: #409EFF;
  text-decoration: none;
}

.emoji-guide a:hover {
  text-decoration: underline;
}

/* 确保页脚预览样式正确 */
.footer-preview .fas,
.footer-preview .fab {
  font-family: 'Font Awesome 5 Free', 'Font Awesome 5 Brands';
  font-weight: 900;
}

.footer-preview .fab {
  font-weight: 400;
}

/* 模块排序卡片样式 */
.module-order-card {
  margin-bottom: 20px;
  border-radius: 8px;
  background-color: #fff;
}

/* 自定义内容配置 */
.custom-content-config {
  padding: 10px 0;
}

/* 确保 .custom-content-textarea 类存在，如果之前没有的话 */
.custom-content-textarea textarea {
    min-height: 80px; /* 调整最小高度 */
}

/* 调整选择器按钮样式 */
/* .unified-picker .el-button--default {
    /* 如果需要，可以在这里微调默认按钮的样式 */
    /* 例如：确保有足够的对比度 */
/* }

/* 调整 Emoji 选择器样式 */
.emojis-grid .emoji-option {
  font-size: 22px; /* 增大 Emoji 尺寸 */
  padding: 4px;
}
.emojis-grid .all-emojis {
    max-height: 250px; /* 增加最大高度 */
}

/* 图标选择器样式调整 */
.icons-grid .picker-content {
    max-height: 300px; /* 增加最大高度 */
}
.icons-grid .icon-option {
    width: 34px; /* 微调大小 */
    height: 34px;
}
.icons-grid .icon-option i {
    font-size: 17px; /* 微调图标大小 */
}

/* 确保 unified-picker 样式对两个选择器都生效 */
.unified-picker {
  margin-top: 10px; /* 保持一致的间距 */
}

.picker-content {
  margin-top: 10px;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  padding: 15px;
  background-color: #fff;
  max-height: 300px; /* 统一最大高度 */
  overflow-y: auto;
}

/* Add specific style for emoji-help if needed */
.emoji-help {
  margin-top: 15px; /* Ensure some space above the help text */
  padding: 10px;
  background-color: #f9f9f9;
  border-radius: 4px;
  font-size: 13px;
  color: #606266;
}

.emoji-help p {
  margin: 0 0 5px 0;
}

.emoji-help a {
  color: #409EFF;
  text-decoration: none;
}
.emoji-help a:hover {
  text-decoration: underline;
}

/* Style for the modified edit button */
/* .edit-btn-solid {
  /* Default primary button style, no need for text/bg override */
/* }

/* You might want to adjust spacing if needed */
.link-actions .el-button + .el-button {
  margin-left: 8px; /* Adjust spacing between buttons */
}
</style>

<script lang="ts">
document.addEventListener('DOMContentLoaded', () => {
  if (!document.querySelector('link[href*="font-awesome"]')) {
    const fontAwesome = document.createElement('link')
    fontAwesome.rel = 'stylesheet'
    fontAwesome.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css'
    document.head.appendChild(fontAwesome)
  }
})
</script> 