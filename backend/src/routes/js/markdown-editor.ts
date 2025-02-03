import { Router } from 'express';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { mkdir } from 'fs/promises';
import { validateParams, generateJS, deploy, undeploy, isDeployed } from '../../../components/js/markdown-editor/service';
import type { MarkdownEditorParams } from '../../../components/js/markdown-editor/types';

const router = Router();
const CONFIG_PATH = join(process.cwd(), 'data/markdown-editor.json');

// 修改存储路径到 custom/helper/md
const getNotesPath = (username: string) => join(__dirname, '../../../custom/helper/md', username, 'notes.json');
const getUserDir = (username: string) => join(__dirname, '../../../custom/helper/md', username);

// 读取配置
function readConfig(): MarkdownEditorParams {
  try {
    if (existsSync(CONFIG_PATH)) {
      const content = readFileSync(CONFIG_PATH, 'utf-8');
      return JSON.parse(content);
    }
  } catch (error) {
    console.error('读取配置失败:', error);
  }
  return { users: [], apiPrefix: '' };
}

// 验证 API 前缀
function validateApiPrefix(prefix: string): boolean {
  try {
    const url = new URL(prefix);
    // 确保是 http 或 https 协议
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

// 保存配置
function saveConfig(params: MarkdownEditorParams): void {
  try {
    writeFileSync(CONFIG_PATH, JSON.stringify(params, null, 2));
  } catch (error) {
    console.error('保存配置失败:', error);
    throw error;
  }
}

// 获取配置
router.get('/config', (req, res) => {
  try {
    const config = readConfig();
    res.json(config);
  } catch (error) {
    console.error('读取配置失败:', error);
    res.status(500).json({ 
      users: [],
      apiPrefix: '' // 添加默认值
    });
  }
});

// 保存配置
router.post('/config', (req, res) => {
  try {
    const params = req.body as MarkdownEditorParams;
    
    // 验证 API 前缀
    if (params.apiPrefix && !validateApiPrefix(params.apiPrefix)) {
      return res.status(400).json({
        success: false,
        errors: ['API 前缀必须是有效的 HTTP/HTTPS URL']
      });
    }

    // 验证参数
    const errors = validateParams(params);
    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        errors
      });
    }

    // 确保 apiPrefix 有值
    if (!params.apiPrefix) {
      params.apiPrefix = 'http://localhost:3000';
    }

    // 保存配置
    saveConfig(params);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : '保存配置失败'
    });
  }
});

// 检查部署状态
router.get('/deployed', async (_req, res) => {
  try {
    const deployed = await isDeployed();
    res.json({ deployed });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : '检查部署状态失败'
    });
  }
});

// 部署
router.post('/deploy', async (req, res) => {
  try {
    const params = req.body as MarkdownEditorParams;

    // 验证参数
    const errors = validateParams(params);
    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        errors
      });
    }

    // 生成并部署JS
    const js = generateJS(params);
    await deploy(js);

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : '部署失败'
    });
  }
});

// 取消部署
router.post('/undeploy', async (_req, res) => {
  try {
    await undeploy();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : '取消部署失败'
    });
  }
});

// 初始化用户目录
router.post('/init/:username', (req, res) => {
  try {
    const { username } = req.params;
    const userDir = getUserDir(username);
    
    if (!existsSync(userDir)) {
      mkdirSync(userDir, { recursive: true });
    }
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : '初始化失败'
    });
  }
});

// 获取笔记
router.get('/notes/:username', (req, res) => {
  try {
    const { username } = req.params;
    const notesFile = getNotesPath(username);
    
    if (!existsSync(notesFile)) {
      return res.json([]);
    }
    
    const notes = JSON.parse(readFileSync(notesFile, 'utf-8'));
    res.json(notes);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : '获取笔记失败'
    });
  }
});

// 保存笔记
router.post('/notes/:username', (req, res) => {
  try {
    const { username } = req.params;
    const notes = req.body;
    
    const userDir = getUserDir(username);
    const notesFile = getNotesPath(username);
    
    if (!existsSync(userDir)) {
      mkdirSync(userDir, { recursive: true });
    }
    
    writeFileSync(notesFile, JSON.stringify(notes, null, 2));
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : '保存笔记失败'
    });
  }
});

// 删除笔记
router.delete('/notes/:username/:id', async (req, res) => {
    try {
        const { username, id } = req.params;
        const notesFile = getNotesPath(username);
        
        if (!existsSync(notesFile)) {
            return res.status(404).json({ 
                success: false, 
                error: '笔记文件不存在' 
            });
        }

        // 读取现有笔记
        const notes = JSON.parse(readFileSync(notesFile, 'utf-8'));
        
        // 删除指定笔记
        const updatedNotes = notes.filter((note: any) => note.id !== id);
        
        // 保存更新后的笔记
        writeFileSync(notesFile, JSON.stringify(updatedNotes, null, 2));
        
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : '删除笔记失败'
        });
    }
});

export default router; 