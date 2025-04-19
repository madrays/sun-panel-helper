import { Router } from 'express'
import { deploy, undeploy, isDeployed } from './deploy'
import { readFile, writeFile, mkdir } from 'fs/promises'
import { join, dirname } from 'path'
import { existsSync } from 'fs'

// 配置存储路径
const CONFIG_PATH = 'data/toolbox/footer/lifeline-footer/config.json'

// 默认配置
const defaultConfig = {
  siteLaunchDate: new Date().toISOString().split('T')[0],
  enableUptime: true,
  enableSocialLinks: true,
  enableCustomContent: true,
  enableHelperAd: true,
  uptimePrefix: '本站已苟活',
  moduleOrder: ['uptime', 'social', 'time', 'customContent', 'helper'],
  customContent: {
    text: '富强· 自由· 平等· 爱国· 民主· 文明· 和谐· 公正· 法治· 敬业· 诚信· 友善',
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
  textColor: '#FFFFFF',
  accentColor: '#7ee7ff'
}

// 路由
const router = Router()

/**
 * 保存配置到文件
 */
async function saveConfig(config: any): Promise<void> {
  try {
    // 确保目录存在
    await mkdir(dirname(CONFIG_PATH), { recursive: true })
    // 保存配置
    await writeFile(CONFIG_PATH, JSON.stringify(config, null, 2), 'utf-8')
  } catch (error) {
    console.error('保存配置失败:', error)
    throw error
  }
}

/**
 * 获取页脚配置和部署状态
 */
router.get('/config', async (req, res) => {
  try {
    const deployed = await isDeployed()

    let finalConfig = { ...defaultConfig }; // 最终返回的、类型正确的配置
    let configChangedDueToMigration = false;

    try {
      await mkdir(dirname(CONFIG_PATH), { recursive: true })
      const configStr = await readFile(CONFIG_PATH, 'utf-8')
      let loadedConfig: any = JSON.parse(configStr) // 加载的配置，可以是任意结构

      // --- 向后兼容处理 (操作 loadedConfig) ---
      if (loadedConfig.coreValues && !loadedConfig.customContent) {
        console.log('发现旧版 coreValues 配置，进行迁移...');
        // 创建新的 customContent
        loadedConfig.customContent = {
            text: loadedConfig.coreValues.text || defaultConfig.customContent.text,
            enabled: loadedConfig.coreValues.enabled !== undefined ? loadedConfig.coreValues.enabled : defaultConfig.customContent.enabled
        };
        loadedConfig.enableCustomContent = loadedConfig.enableCoreValues !== undefined ? loadedConfig.enableCoreValues : defaultConfig.enableCustomContent;
        
        // 从 loadedConfig 中删除旧字段
        delete loadedConfig.coreValues;
        delete loadedConfig.enableCoreValues;
        configChangedDueToMigration = true;
      }
      if (loadedConfig.moduleOrder && loadedConfig.moduleOrder.includes('values')) {
          console.log('更新 loadedConfig 的 moduleOrder 中的 values 为 customContent');
          loadedConfig.moduleOrder = loadedConfig.moduleOrder.map((m: string) => m === 'values' ? 'customContent' : m);
          configChangedDueToMigration = true;
      }
      // --- 兼容处理结束 ---

      // 将处理过的 loadedConfig 合并到 finalConfig
      // 注意：这里只合并 defaultConfig 中存在的字段，防止意外引入旧字段
      for (const key in defaultConfig) {
        if (loadedConfig.hasOwnProperty(key)) {
          (finalConfig as any)[key] = loadedConfig[key];
        } else {
            // 如果加载的配置缺少某个默认字段，使用默认值
             (finalConfig as any)[key] = (defaultConfig as any)[key];
        }
      }
      // 确保 customContent 和 socialLinks 结构正确 (防止它们在 loadedConfig 中为 null 或 undefined)
      finalConfig.customContent = loadedConfig.customContent || { ...defaultConfig.customContent };
      finalConfig.socialLinks = Array.isArray(loadedConfig.socialLinks) ? loadedConfig.socialLinks : [...defaultConfig.socialLinks];
      finalConfig.moduleOrder = Array.isArray(loadedConfig.moduleOrder) ? loadedConfig.moduleOrder : [...defaultConfig.moduleOrder];


      // 如果因为兼容处理导致配置变更，则保存一次更新后的配置
      if (configChangedDueToMigration) {
          console.log('兼容性处理后，保存更新的配置。');
          // 保存的是处理和合并后的 finalConfig
          await saveConfig(finalConfig);
      }

    } catch (error) {
      // 文件不存在或解析错误，使用默认配置并保存
      console.log('配置文件不存在或解析失败，使用默认配置', error)
      finalConfig = { ...defaultConfig }; // 确保是默认配置
      await saveConfig(finalConfig)
    }

    res.json({
      success: true,
      deployed,
      config: finalConfig // 返回最终确定的配置
    })
  } catch (error) {
    console.error('获取状态失败:', error)
    res.status(500).json({
      success: false,
      message: '获取状态失败:' + (error as Error).message
    })
  }
})

/**
 * 实时保存配置（不部署）
 */
router.post('/save-config', async (req, res) => {
  try {
    // 获取配置
    const config = req.body
    
    // 保存配置
    await saveConfig(config)
    
    res.json({
      success: true,
      message: '配置保存成功'
    })
  } catch (error) {
    console.error('保存配置失败:', error)
    res.status(500).json({
      success: false,
      message: '保存配置失败:' + (error as Error).message
    })
  }
})

/**
 * 部署页脚
 */
router.post('/deploy', async (req, res) => {
  try {
    // 获取配置
    const config = req.body
    
    // 保存配置
    await saveConfig(config)
    
    // 部署页脚，传入新函数的返回值中已经包含互斥检查
    const deployResult = await deploy(config)
    
    if (!deployResult.success) {
      // 如果部署失败，返回错误信息
      return res.status(400).json({
        success: false,
        message: deployResult.message || '部署失败',
        error: deployResult.error
      })
    }
    
    res.json({
      success: true,
      message: '部署成功'
    })
  } catch (error) {
    console.error('部署失败:', error)
    res.status(500).json({
      success: false,
      message: '部署失败:' + (error as Error).message
    })
  }
})

/**
 * 取消部署页脚
 */
router.post('/undeploy', async (req, res) => {
  try {
    // 取消部署
    await undeploy()
    
    res.json({
      success: true,
      message: '取消部署成功'
    })
  } catch (error) {
    console.error('取消部署失败:', error)
    res.status(500).json({
      success: false,
      message: '取消部署失败:' + (error as Error).message
    })
  }
})

/**
 * 检查其他页脚是否已部署
 */
async function isOtherFooterDeployed(): Promise<boolean> {
  try {
    const outputPath = join('custom', 'index.js')
    
    // 检查文件是否存在
    if (!existsSync(outputPath)) {
      return false
    }
    
    // 检查内容
    const content = await readFile(outputPath, 'utf-8')
    return content.includes('/* Sun-Panel-Helper JS Start: fancy-footer */');
  } catch (error) {
    return false
  }
}

export default router 