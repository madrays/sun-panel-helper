import { Router } from 'express'
import { readFile, writeFile, mkdir } from 'fs/promises'
import { join, dirname } from 'path'
import { deployFixedWidgets, undeploy, isDeployed } from '../../components/fixed-widgets/service'
import fs from 'fs'

// 定义配置对象的接口
interface WidgetConfig {
  name: string;
  url: string;
  [key: string]: any;
}

interface PoolConfig {
  widgets: WidgetConfig[];
  customCode?: string;
}

const router = Router()
const CONFIG_DIR = join(__dirname, '../../data')
const POOL_PATH = join(CONFIG_DIR, 'fixed-pool.json')
const LAYOUT_PATH = join(CONFIG_DIR, 'fixed-layout.json')
const TR_CONFIG_FILE = join(CONFIG_DIR, 'tr-configs.json')
const QB_CONFIG_FILE = join(CONFIG_DIR, 'qb-configs.json')

// 确保配置目录存在
async function ensureConfigDir() {
  try {
    await mkdir(CONFIG_DIR, { recursive: true })
  } catch (error) {
    console.error('创建配置目录失败:', error)
  }
}

// 获取组件池配置
router.get('/pool', async (_req, res) => {
  try {
    await ensureConfigDir()
    
    let content
    try {
      content = await readFile(POOL_PATH, 'utf-8')

    } catch (error) {
      content = JSON.stringify({
        widgets: []
      }, null, 2)
      await writeFile(POOL_PATH, content, 'utf-8')
    }
    
    const data = JSON.parse(content)
    
    res.json({
      code: 0,
      message: 'success',
      data
    })
  } catch (error) {
    console.error('读取组件池配置失败:', error)
    res.status(500).json({
      code: 500,
      message: '读取配置失败',
      error: error instanceof Error ? error.message : '未知错误'
    })
  }
})

// 更新TR和QB配置中的isAppliedToFixed字段
function updateConfigIsApplied(widgetName: string, isApplied: boolean) {
  try {
    // 更新TR配置
    if (fs.existsSync(TR_CONFIG_FILE)) {
      const trConfigsRaw = fs.readFileSync(TR_CONFIG_FILE, 'utf-8')
      const trConfigs = JSON.parse(trConfigsRaw || '{}')
      
      let updated = false
      // 遍历所有配置，如果名称包含在URL中，更新其isAppliedToFixed字段
      Object.keys(trConfigs).forEach(configId => {
        // TR组件的URL通常包含id参数
        const widgetUrl = `tr-status.html?id=${configId}`
        if (widgetName.includes(widgetUrl)) {
          trConfigs[configId].isAppliedToFixed = isApplied
          updated = true
        }
      })
      
      if (updated) {
        fs.writeFileSync(TR_CONFIG_FILE, JSON.stringify(trConfigs, null, 2))
      }
    }
    
    // 更新QB配置
    if (fs.existsSync(QB_CONFIG_FILE)) {
      const qbConfigsRaw = fs.readFileSync(QB_CONFIG_FILE, 'utf-8')
      const qbConfigs = JSON.parse(qbConfigsRaw || '{}')
      
      let updated = false
      // 遍历所有配置，如果名称包含在URL中，更新其isAppliedToFixed字段
      Object.keys(qbConfigs).forEach(configId => {
        // QB组件的URL通常包含id参数
        const widgetUrl = `qb-status/widget?id=${configId}`
        if (widgetName.includes(widgetUrl)) {
          qbConfigs[configId].isAppliedToFixed = isApplied
          updated = true
        }
      })
      
      if (updated) {
        fs.writeFileSync(QB_CONFIG_FILE, JSON.stringify(qbConfigs, null, 2))
      }
    }
  } catch (error) {
    console.error('更新配置时出错:', error)
  }
}

// 保存组件池配置
router.post('/pool', async (req, res) => {
  try {
    await ensureConfigDir()
    
    // 读取现有配置
    let currentConfig: PoolConfig
    try {
      const content = await readFile(POOL_PATH, 'utf-8')
      currentConfig = JSON.parse(content)
    } catch (error) {
      currentConfig = { widgets: [] }
    }
    
    // 如果是添加单个组件
    if (req.body.action === 'add' && req.body.widget) {
      // 检查是否已存在相同名称的组件
      const exists = currentConfig.widgets.some((w: any) => w.name === req.body.widget.name)
      if (exists) {
        return res.status(400).json({
          code: 400,
          message: '组件名称已存在',
          error: 'DUPLICATE_NAME'
        })
      }
      
      currentConfig.widgets.push(req.body.widget)
      // 更新配置文件中的isAppliedToFixed为true
      updateConfigIsApplied(req.body.widget.url, true)
    } 
    // 如果是更新组件
    else if (req.body.action === 'update' && req.body.name && req.body.widget) {
      // 找到要更新的组件
      const oldWidget = currentConfig.widgets.find((w: any) => w.name === req.body.name)
      if (oldWidget && oldWidget.url !== req.body.widget.url) {
        // 如果URL发生变化，更新旧URL对应的配置为false
        updateConfigIsApplied(oldWidget.url, false)
        // 更新新URL对应的配置为true
        updateConfigIsApplied(req.body.widget.url, true)
      }
      
      currentConfig.widgets = currentConfig.widgets.map((w: any) => 
        w.name === req.body.name ? req.body.widget : w
      )
    }
    // 如果是移除组件
    else if (req.body.action === 'remove' && req.body.name) {
      // 找到要删除的组件
      const widgetToRemove = currentConfig.widgets.find((w: any) => w.name === req.body.name)
      if (widgetToRemove) {
        // 更新配置文件中的isAppliedToFixed为false
        updateConfigIsApplied(widgetToRemove.url, false)
      }
      
      currentConfig.widgets = currentConfig.widgets.filter((w: any) => w.name !== req.body.name)
    }
    // 如果是完整更新
    else if (req.body.widgets) {
      // 检查是否有重复名称
      const names = new Set()
      for (const widget of req.body.widgets) {
        if (names.has(widget.name)) {
          return res.status(400).json({
            code: 400,
            message: '存在重复的组件名称',
            error: 'DUPLICATE_NAME'
          })
        }
        names.add(widget.name)
      }
      
      // 找到被删除的组件
      const removedWidgets = currentConfig.widgets.filter(
        (w: any) => !req.body.widgets.some((nw: any) => nw.name === w.name)
      )
      
      // 更新所有被删除组件的配置
      for (const widget of removedWidgets) {
        updateConfigIsApplied(widget.url, false)
      }
      
      // 找到新添加的组件
      const addedWidgets = req.body.widgets.filter(
        (w: any) => !currentConfig.widgets.some((cw: any) => cw.name === w.name)
      )
      
      // 更新所有新添加组件的配置
      for (const widget of addedWidgets) {
        updateConfigIsApplied(widget.url, true)
      }
      
      currentConfig.widgets = req.body.widgets
    }
    
    await writeFile(POOL_PATH, JSON.stringify(currentConfig, null, 2), 'utf-8')
    res.json({
      code: 0,
      message: 'success'
    })
  } catch (error) {
    console.error('保存组件池配置失败:', error)
    res.status(500).json({
      code: 500,
      message: '保存配置失败',
      error: error instanceof Error ? error.message : '未知错误'
    })
  }
})

// 获取布局配置
router.get('/layout', async (_req, res) => {
  try {
    await ensureConfigDir()
    
    let content
    try {
      content = await readFile(LAYOUT_PATH, 'utf-8')
    } catch (error) {
      content = JSON.stringify({
        widgets: [],
        customCode: ''
      }, null, 2)
      await writeFile(LAYOUT_PATH, content, 'utf-8')
    }
    
    res.json({
      code: 0,
      message: 'success',
      data: JSON.parse(content)
    })
  } catch (error) {
    console.error('读取布局配置失败:', error)
    res.status(500).json({
      code: 500,
      message: '读取配置失败',
      error: error instanceof Error ? error.message : '未知错误'
    })
  }
})

// 更新布局配置
router.post('/layout', async (req, res) => {
  try {
    const { widgets, customCode } = req.body

    
    // 读取当前配置
    const content = await readFile(LAYOUT_PATH, 'utf-8')
    
    // 更新组件列表
    const currentConfig: PoolConfig = JSON.parse(content)
    currentConfig.widgets = widgets
    currentConfig.customCode = customCode  // 确保保存页脚代码
    
    // 写入文件
    await writeFile(LAYOUT_PATH, JSON.stringify(currentConfig, null, 2))
    
    res.json({
      code: 0,
      message: 'success'
    })
  } catch (error) {
    console.error('更新布局失败:', error)
    res.status(500).json({
      code: 500,
      message: '更新布局失败',
      error: error instanceof Error ? error.message : '未知错误'
    })
  }
})

// 部署配置
router.post('/deploy', async (req, res) => {
  try {
    const content = await readFile(LAYOUT_PATH, 'utf-8')
    const config = JSON.parse(content)
    await deployFixedWidgets(config.widgets || [], config.customCode || '')
    res.json({
      code: 0,
      message: 'success'
    })
  } catch (error) {
    res.status(500).json({
      code: 500,
      message: '部署失败',
      error: error instanceof Error ? error.message : '未知错误'
    })
  }
})

// 取消部署
router.post('/undeploy', async (_req, res) => {
  try {
    await undeploy()
    res.json({
      code: 0,
      message: 'success'
    })
  } catch (error) {
    res.status(500).json({
      code: 500,
      message: '取消部署失败',
      error: error instanceof Error ? error.message : '未知错误'
    })
  }
})

// 获取部署状态
router.get('/status', async (_req, res) => {
  try {
    const deployed = await isDeployed()
    res.json({
      code: 0,
      message: 'success',
      data: {
        deployed
      }
    })
  } catch (error) {
    res.status(500).json({
      code: 500,
      message: '获取部署状态失败',
      error: error instanceof Error ? error.message : '未知错误'
    })
  }
})

export default router 