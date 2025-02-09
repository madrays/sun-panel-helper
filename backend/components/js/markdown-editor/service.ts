import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import { deploy, undeploy, isDeployed } from './deploy';
import type { MarkdownEditorParams } from './types';

const CONFIG_PATH = join(process.cwd(), 'data/markdown-editor.json');

// 读取配置
export function readConfig(): MarkdownEditorParams {
  try {
    if (existsSync(CONFIG_PATH)) {
      const content = readFileSync(CONFIG_PATH, 'utf-8');
      return JSON.parse(content);
    }
  } catch (error) {
    console.error('读取配置失败:', error);
  }
  return { 
    users: [],
    apiPrefix: '' // 添加默认值
  };
}

// 保存配置
export function saveConfig(params: MarkdownEditorParams): void {
  try {
    writeFileSync(CONFIG_PATH, JSON.stringify(params, null, 2));
  } catch (error) {
    console.error('保存配置失败:', error);
    throw error;
  }
}

// 验证参数
export function validateParams(params: MarkdownEditorParams): string[] {
  const errors: string[] = [];
  
  if (!Array.isArray(params.users)) {
    errors.push('users 必须是数组');
  }
  
  if (!params.apiPrefix) {
    errors.push('apiPrefix 不能为空');
  }
  
  params.users.forEach((user, index) => {
    if (!user.username) {
      errors.push(`第 ${index + 1} 个用户的用户名不能为空`);
    }
    if (!user.password) {
      errors.push(`第 ${index + 1} 个用户的密码不能为空`);
    }
  });
  
  return errors;
}

// 生成JS代码
export function generateJS(params: MarkdownEditorParams): string {
  const template = readFileSync(join(__dirname, 'template.js'), 'utf-8');
  
  // 读取最新配置，而不是使用传入的参数
  const config = readConfig();
  
  // 使用最新配置替换模板
  return template
    .replace('{USERS_CONFIG}', JSON.stringify(config.users))
    .replace('{API_PREFIX}', config.apiPrefix || 'http://localhost:3000');
}

export { deploy, undeploy, isDeployed }; 