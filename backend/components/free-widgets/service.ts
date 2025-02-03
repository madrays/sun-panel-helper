import { readFileSync, writeFileSync } from 'fs'
import { join } from 'path'
import { deploy, undeploy, isDeployed } from './deploy'

// 读取模板文件
const jsTemplate = readFileSync(join(__dirname, 'template.js'), 'utf-8')

// 文件路径
const poolPath = join(__dirname, '../../data/free-pool.json')
const SETTINGS_DIR = join(__dirname, '../../custom/helper/freewidgets/setting')

// 类型定义
interface Position {
  top: number
  left: number
  width: string
  height: string
  isScrollMode: boolean
  isPinned: boolean
}

interface PoolWidget {
  id: number
  name: string
  url: string
  source: 'market' | 'custom'
}

interface Pool {
  widgets: PoolWidget[]
  apiPrefix: string
}

interface LayoutWidget {
  name: string
  url: string
  position: Position
}

interface Layout {
  widgets: LayoutWidget[]
}

/**
 * 读取组件池
 */
function readPool(): Pool {
  try {
    const content = readFileSync(poolPath, 'utf-8')
    return JSON.parse(content)
  } catch (error) {
    const defaultPool = { widgets: [], apiPrefix: '' }
    writeFileSync(poolPath, JSON.stringify(defaultPool, null, 2))
    return defaultPool
  }
}

/**
 * 保存组件池
 */
function savePool(pool: Pool): void {
  writeFileSync(poolPath, JSON.stringify(pool, null, 2))
}

/**
 * 读取布局配置
 */
function readLayout(id: number): Layout {
  try {
    const content = readFileSync(join(SETTINGS_DIR, `setting${id}.json`), 'utf-8')
    return JSON.parse(content)
  } catch (error) {
    const defaultLayout = { widgets: [] }
    writeFileSync(join(SETTINGS_DIR, `setting${id}.json`), JSON.stringify(defaultLayout, null, 2))
    return defaultLayout
  }
}

/**
 * 保存布局配置
 */
function saveLayout(id: number, layout: Layout): void {
  writeFileSync(join(SETTINGS_DIR, `setting${id}.json`), JSON.stringify(layout, null, 2))
}

/**
 * 获取组件池
 */
export function getPool(): Pool {
  return readPool()
}

/**
 * 添加组件到组件池
 */
export function addToPool(widget: PoolWidget): boolean {
  const pool = readPool()
  
  // 检查是否存在同名组件
  const exists = pool.widgets.some(w => w.name === widget.name)
  if (exists) {
    return false
  }
  
  pool.widgets.push(widget)
  savePool(pool)
  return true
}

/**
 * 从组件池移除组件
 */
export function removeFromPool(id: number): void {
  const pool = readPool()
  pool.widgets = pool.widgets.filter(w => w.id !== id)
  savePool(pool)
}

/**
 * 更新 API 前缀
 */
export function updateApiPrefix(apiPrefix: string): void {
  const pool = readPool()
  pool.apiPrefix = apiPrefix
  savePool(pool)
}

/**
 * 获取布局配置
 */
export function getLayout(id: number): Layout {
  return readLayout(id)
}

/**
 * 更新布局配置
 */
export function updateLayout(id: number, layout: Layout): void {
  saveLayout(id, layout)
}

/**
 * 生成组件代码
 */
function generateCode(widgets: LayoutWidget[], apiPrefix: string): { js: string } {
  const widgetsCode = widgets.map(widget => {
    return `    {
        name: '${widget.name}',
        url: '${widget.url}',
        position: {
            top: ${widget.position.top},
            left: ${widget.position.left},
            width: '${widget.position.width}',
            height: '${widget.position.height}',
            isScrollMode: ${widget.position.isScrollMode},
            isPinned: ${widget.position.isPinned}
        }
    }`
  }).join(',\n')

  // 替换API前缀和组件配置
  let code = jsTemplate
    .replace('window.FREEWIDGETS_API_PREFIX || \'/api\'', `'${apiPrefix}'`)
    .replace('const WIDGETS = []', `const WIDGETS = [\n${widgetsCode}\n]`);

  return { js: code };
}

/**
 * 部署自由组件
 */
export async function deployFreeWidgets(widgets: LayoutWidget[], apiPrefix: string): Promise<void> {
  updateApiPrefix(apiPrefix);
  const { js } = generateCode(widgets, apiPrefix);
  await deploy(js);
}

export { undeploy, isDeployed } 