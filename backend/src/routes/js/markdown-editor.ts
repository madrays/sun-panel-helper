import { Router, Request, Response } from 'express';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { mkdir } from 'fs/promises';
import jwt from 'jsonwebtoken';
import { validateParams, generateJS, deploy, undeploy, isDeployed } from '../../../components/js/markdown-editor/service';
import type { MarkdownEditorParams } from '../../../components/js/markdown-editor/types';
import markdownEditorUserModel from '../../models/markdown-editor-user';
import { markdownEditorAuth } from '../../middleware/markdown-editor-auth';

const router = Router();

// CORS 由 nginx 统一处理，/api/ 路径已在 nginx 配置中添加 CORS 头
// /custom/helper/md/ 路径也在 nginx 中单独配置了 CORS

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
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

// ==================== 配置管理路由 ====================

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

    // 同步写入配置文件
    writeFileSync(CONFIG_PATH, JSON.stringify(params, null, 2));

    // 等待文件系统同步
    require('fs').fsyncSync(require('fs').openSync(CONFIG_PATH, 'r+'));

    // 同步更新用户列表到加密存储
    if (params.users && params.users.length > 0) {
      markdownEditorUserModel.setUsers(params.users);
    }

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : '保存配置失败'
    });
  }
});

// 获取配置
router.get('/config', (req, res) => {
  try {
    const config = readConfig();
    res.json(config);
  } catch (error) {
    console.error('读取配置失败:', error);
    res.status(500).json({
      users: [],
      apiPrefix: ''
    });
  }
});

// ==================== 部署相关路由 ====================

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
    // 从请求体获取配置，如果没有则读取配置文件
    let params = req.body && Object.keys(req.body).length > 0 ? req.body : readConfig();

    // 如果没有 users 或 apiPrefix，从配置文件读取
    if (!params.users || !params.apiPrefix) {
      params = readConfig();
    }

    // 验证参数
    const errors = validateParams(params);
    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        errors
      });
    }

    // 同步更新用户列表到加密存储
    if (params.users && params.users.length > 0) {
      await markdownEditorUserModel.setUsers(params.users);
    }

    // 生成并部署 JS（现在只包含用户名列表）
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

// ==================== 用户认证路由 ====================

// 用户登录
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: '用户名和密码不能为空'
      });
    }

    // 查找用户
    const user = markdownEditorUserModel.findByUsername(username);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: '用户名或密码错误'
      });
    }

    // 验证密码
    const isValid = await markdownEditorUserModel.validatePassword(user, password);
    if (!isValid) {
      return res.status(401).json({
        success: false,
        message: '用户名或密码错误'
      });
    }

    // 生成 JWT Token（有效期 30 天）
    const token = jwt.sign(
      { username: user.username },
      process.env.JWT_SECRET || 'your-super-secret-jwt-key',
      { expiresIn: '30d' }
    );

    res.json({
      success: true,
      data: {
        token,
        username: user.username,
        note: user.note
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
});

// 获取允许的用户列表（公开接口，用于前端显示用户选择器）
router.get('/allowed-users', async (req, res) => {
  try {
    const usernames = markdownEditorUserModel.getAllUsernames();
    res.json({
      success: true,
      data: usernames
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '获取用户列表失败'
    });
  }
});

// ==================== 笔记 API（需要认证） ====================

// 初始化用户目录（允许匿名访问，但只能初始化自己的目录）
router.post('/init/:username', markdownEditorAuth, (req, res) => {
  try {
    const { username } = req.params;

    // 如果已认证，验证用户只能访问自己的目录
    // 如果未认证（匿名），允许初始化目录（兼容旧版本）
    if (req.markdownEditorUser && req.markdownEditorUser.username !== username) {
      return res.status(403).json({
        success: false,
        message: '无权访问其他用户的目录'
      });
    }

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

// 获取笔记（允许匿名访问，但未认证用户只能使用本地存储）
router.get('/notes/:username', markdownEditorAuth, (req, res) => {
  try {
    // 如果已认证，验证用户只能访问自己的笔记
    // 如果未认证（匿名），允许访问（兼容旧版本，使用本地存储）
    if (req.markdownEditorUser && req.markdownEditorUser.username !== req.params.username) {
      return res.status(403).json({
        success: false,
        message: '无权访问其他用户的笔记'
      });
    }

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

// 保存笔记（允许匿名访问，但未认证用户数据只保存在本地）
router.post('/notes/:username', markdownEditorAuth, (req, res) => {
  try {
    // 如果已认证，验证用户只能保存自己的笔记
    // 如果未认证（匿名），允许保存（兼容旧版本）
    if (req.markdownEditorUser && req.markdownEditorUser.username !== req.params.username) {
      return res.status(403).json({
        success: false,
        message: '无权保存其他用户的笔记'
      });
    }

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

// 删除笔记（允许匿名访问，但未认证用户操作本地存储）
router.delete('/notes/:username/:id', markdownEditorAuth, async (req, res) => {
  try {
    // 如果已认证，验证用户只能删除自己的笔记
    // 如果未认证（匿名），允许删除（兼容旧版本）
    if (req.markdownEditorUser && req.markdownEditorUser.username !== req.params.username) {
      return res.status(403).json({
        success: false,
        message: '无权删除其他用户的笔记'
      });
    }

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
