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

const router = Router()
const CONFIG_DIR = join(__dirname, '../../data')
const SETTINGS_DIR = join(__dirname, '../../custom/helper/freewidgets/setting')
const POOL_PATH = join(CONFIG_DIR, 'free-pool.json')

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
      console.log('添加后的配置:', currentConfig)
    } else if (req.body.id && req.body.name && req.body.url) {
      // 直接添加组件
      const widget = {
        id: req.body.id,
        name: req.body.name,
        url: req.body.url,
        source: req.body.source || 'custom'
      }
      currentConfig.widgets.push(widget)
      console.log('直接添加组件后的配置:', currentConfig)
    } 
    // 如果是更新组件
    else if (req.body.action === 'update' && req.body.name && req.body.widget) {
      currentConfig.widgets = currentConfig.widgets.map((w: any) => 
        w.name === req.body.name ? req.body.widget : w
      )
    }
    // 如果是移除组件
    else if (req.body.action === 'remove' && req.body.name) {
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
    removeFromPool(id)
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