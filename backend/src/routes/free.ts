import { Router } from 'express'
import { readFile, writeFile, mkdir } from 'fs/promises'
import { join, dirname } from 'path'
import { 
  getPool, 
  addToPool, 
  removeFromPool,
  deployFreeWidgets,
  undeploy,
  isDeployed,
  updateApiPrefix,
  getLayout,
  updateLayout
} from '../../components/free-widgets/service'
import fs from 'fs'

const router = Router()
const CONFIG_DIR = join(__dirname, '../../data')
const SETTINGS_DIR = join(__dirname, '../../custom/helper/freewidgets/setting')
const POOL_PATH = join(CONFIG_DIR, 'free-pool.json')
const TR_CONFIG_FILE = join(CONFIG_DIR, 'tr-configs.json')
const QB_CONFIG_FILE = join(CONFIG_DIR, 'qb-configs.json')

// 确保配置目录存在
async function ensureConfigDir() {
  try {
    await mkdir(CONFIG_DIR, { recursive: true })
    await mkdir(dirname(SETTINGS_DIR), { recursive: true })
    await mkdir(SETTINGS_DIR, { recursive: true })
    // 确保 free-pool.json 文件存在
    try {
      await readFile(POOL_PATH, 'utf-8')
    } catch (error) {
      // 如果文件不存在，创建默认配置
      await writeFile(POOL_PATH, JSON.stringify({
        widgets: [],
        apiPrefix: ''
      }, null, 2))
    }
  } catch (error) {
    console.error('创建配置目录失败:', error)
  }
}

// 更新TR和QB配置中的isAppliedToFree字段
function updateConfigIsApplied(widgetUrl: string, isApplied: boolean) {
  try {
    // 更新TR配置
    if (fs.existsSync(TR_CONFIG_FILE)) {
      const trConfigsRaw = fs.readFileSync(TR_CONFIG_FILE, 'utf-8')
      const trConfigs = JSON.parse(trConfigsRaw || '{}')
      
      let updated = false
      // 遍历所有配置，如果URL包含配置ID，更新其isAppliedToFree字段
      Object.keys(trConfigs).forEach(configId => {
        // TR组件的URL通常包含id参数
        const idPattern = `tr-status.html?id=${configId}`
        if (widgetUrl.includes(idPattern)) {
          trConfigs[configId].isAppliedToFree = isApplied
          updated = true
          console.log(`已更新TR配置 ${configId} 的isAppliedToFree为 ${isApplied}`)
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
      // 遍历所有配置，如果URL包含配置ID，更新其isAppliedToFree字段
      Object.keys(qbConfigs).forEach(configId => {
        // QB组件的URL通常包含id参数
        const idPattern = `qb-status/widget?id=${configId}`
        if (widgetUrl.includes(idPattern)) {
          qbConfigs[configId].isAppliedToFree = isApplied
          updated = true
          console.log(`已更新QB配置 ${configId} 的isAppliedToFree为 ${isApplied}`)
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

// 获取组件池
router.get('/pool', async (req, res) => {
  try {
    await ensureConfigDir()
    
    const content = await readFile(POOL_PATH, 'utf-8')
    const pool = JSON.parse(content)
    res.json({
      code: 0,
      message: 'success',
      data: pool
    })
  } catch (error) {
    res.status(500).json({
      code: 500,
      message: '获取组件池失败',
      error: error instanceof Error ? error.message : '未知错误'
    })
  }
})

// 保存组件池配置
router.post('/pool', async (req, res) => {
  try {
    console.log('收到请求体:', req.body)
    await ensureConfigDir()
    
    // 读取现有配置
    let currentConfig
    try {
      const content = await readFile(POOL_PATH, 'utf-8')
      currentConfig = JSON.parse(content)
      console.log('读取到的现有配置:', currentConfig)
    } catch (error) {
      console.log('配置文件不存在，创建默认配置')
      currentConfig = { widgets: [], apiPrefix: '' }
    }
    
    // 如果是添加单个组件
    if (req.body.action === 'add' && req.body.widget) {
      console.log('添加组件:', req.body.widget)
      // 检查是否已存在相同名称的组件
      const exists = currentConfig.widgets.some((w: any) => w.name === req.body.widget.name)
      if (exists) {
        console.log('组件名称已存在:', req.body.widget.name)
        return res.json({
          code: 1,
          message: '组件名称已存在，请使用其他名称',
          data: null
        })
      }
      
      currentConfig.widgets.push(req.body.widget)
      // 更新配置文件中的isAppliedToFree为true
      updateConfigIsApplied(req.body.widget.url, true)
      console.log('添加后的配置:', currentConfig)
    } else if (req.body.id && req.body.name && req.body.url) {
      // 直接添加组件
      const widget = {
        id: req.body.id,
        name: req.body.name,
        url: req.body.url,
        source: req.body.source || 'custom'
      }
      // 检查是否已存在相同名称的组件
      const exists = currentConfig.widgets.some((w: any) => w.name === widget.name)
      if (exists) {
        console.log('组件名称已存在:', widget.name)
        return res.json({
          code: 1,
          message: '组件名称已存在，请使用其他名称',
          data: null
        })
      }
      
      currentConfig.widgets.push(widget)
      // 更新配置文件中的isAppliedToFree为true
      updateConfigIsApplied(widget.url, true)
      console.log('直接添加组件后的配置:', currentConfig)
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
        // 更新配置文件中的isAppliedToFree为false
        updateConfigIsApplied(widgetToRemove.url, false)
      }
      
      currentConfig.widgets = currentConfig.widgets.filter((w: any) => w.name !== req.body.name)
    }
    
    await writeFile(POOL_PATH, JSON.stringify(currentConfig, null, 2))
    console.log('保存配置成功，返回:', {
      code: 0,
      message: 'success',
      data: currentConfig
    })
    res.json({
      code: 0,
      message: 'success',
      data: currentConfig
    })
  } catch (error) {
    console.error('保存失败，完整错误:', error)
    res.status(500).json({
      code: 500,
      message: '保存配置失败',
      error: error instanceof Error ? error.message : '未知错误',
      data: null
    })
  }
})

// 从组件池移除
router.delete('/pool/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id)
    
    // 获取当前组件池配置
    const poolContent = fs.readFileSync(POOL_PATH, 'utf-8')
    const poolConfig = JSON.parse(poolContent)
    
    // 找到要删除的组件
    const widgetToRemove = poolConfig.widgets.find((w: any) => w.id === id || w.id === id.toString())
    
    if (widgetToRemove) {
      // 更新配置文件中的isAppliedToFree为false
      updateConfigIsApplied(widgetToRemove.url, false)
      
      // 从池中移除组件
      poolConfig.widgets = poolConfig.widgets.filter((w: any) => w.id !== id && w.id !== id.toString())
      
      // 保存更新后的池配置
      fs.writeFileSync(POOL_PATH, JSON.stringify(poolConfig, null, 2))
    }
    
    res.json({
      code: 0,
      message: 'success'
    })
  } catch (error) {
    res.status(500).json({
      code: 500,
      message: '移除失败',
      error: error instanceof Error ? error.message : '未知错误'
    })
  }
})

// 获取布局配置
router.get('/setting/:id', async (req, res) => {
  try {
    await ensureConfigDir()
    const id = parseInt(req.params.id)
    const layout = getLayout(id)
    res.json({
      code: 0,
      message: 'success',
      data: layout
    })
  } catch (error) {
    res.status(500).json({
      code: 500,
      message: '读取配置失败',
      error: error instanceof Error ? error.message : '未知错误'
    })
  }
})

// 保存布局配置
router.post('/setting/:id', async (req, res) => {
  try {
    await ensureConfigDir()
    const id = parseInt(req.params.id)
    updateLayout(id, req.body)
    res.json({
      code: 0,
      message: 'success'
    })
  } catch (error) {
    res.status(500).json({
      code: 500,
      message: '保存配置失败',
      error: error instanceof Error ? error.message : '未知错误'
    })
  }
})

// 部署配置
router.post('/deploy', async (req, res) => {
  try {
    const { widgets, apiPrefix } = req.body
    await deployFreeWidgets(widgets, apiPrefix)
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
router.post('/undeploy', async (req, res) => {
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

// 检查部署状态
router.get('/status', async (req, res) => {
  try {
    const deployed = await isDeployed()
    const pool = getPool()
    res.json({
      code: 0,
      message: 'success',
      data: {
        deployed,
        apiPrefix: pool.apiPrefix
      }
    })
  } catch (error) {
    res.status(500).json({
      code: 500,
      message: '获取状态失败',
      error: error instanceof Error ? error.message : '未知错误'
    })
  }
})

// 更新 API 前缀
router.post('/api-prefix', (req, res) => {
  try {
    const { apiPrefix } = req.body
    updateApiPrefix(apiPrefix)
    res.json({
      code: 0,
      message: 'success'
    })
  } catch (error) {
    res.status(500).json({
      code: 500,
      message: '更新 API 前缀失败',
      error: error instanceof Error ? error.message : '未知错误'
    })
  }
})

// 保存自由组件配置
router.post('/freewidgets/save-config', async (req, res) => {
  try {
    const { configIndex, config } = req.body;
    
    if (!configIndex || !config || !config.widgets) {
      return res.status(400).json({
        code: 400,
        message: '无效的配置数据'
      });
    }

    // 确保配置目录存在
    await ensureConfigDir();

    // 保存配置
    const configPath = join(SETTINGS_DIR, `setting${configIndex}.json`);
    await writeFile(configPath, JSON.stringify(config, null, 2));

    res.json({
      code: 0,
      message: 'success'
    });
  } catch (error) {
    console.error('保存配置失败:', error);
    res.status(500).json({
      code: 500,
      message: '保存配置失败',
      error: error instanceof Error ? error.message : '未知错误'
    });
  }
});

export default router 