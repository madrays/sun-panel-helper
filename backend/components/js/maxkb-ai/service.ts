import { readFileSync } from 'fs';
import { join } from 'path';
import type { MaxkbAiParams } from './types';

export function validateParams(params: MaxkbAiParams): string[] {
  const errors: string[] = [];
  
  // 检查参数是否完整
  if (!params) {
    errors.push('参数不能为空');
    return errors;
  }

  // 检查必要字段
  if (!params.chatUrl) {
    errors.push('MaxKB链接不能为空');
  } else if (!params.chatUrl.startsWith('http')) {
    errors.push('MaxKB链接格式不正确');
  }

  // 检查PC配置
  if (!params.pc) {
    errors.push('PC端配置不能为空');
  } else {
    validatePositionConfig(params.pc, 'pc', errors);
  }
  
  // 检查移动端配置
  if (!params.mobile) {
    errors.push('移动端配置不能为空');
  } else {
    validatePositionConfig(params.mobile, 'mobile', errors);
  }
  
  return errors;
}

function validatePositionConfig(config: MaxkbAiParams['pc'] | MaxkbAiParams['mobile'], device: string, errors: string[]): void {
  if (!config.position || !['top-left', 'top-right', 'bottom-left', 'bottom-right'].includes(config.position)) {
    errors.push(`${device}端位置设置无效`);
  }

  if (!config.offset || typeof config.offset.x !== 'number' || config.offset.x < 0) {
    errors.push(`${device}端水平偏移必须是大于等于0的数字`);
  }

  if (!config.offset || typeof config.offset.y !== 'number' || config.offset.y < 0) {
    errors.push(`${device}端垂直偏移必须是大于等于0的数字`);
  }

  if (!config.size) {
    errors.push(`${device}端尺寸配置不能为空`);
    return;
  }

  const minSize = device === 'pc' ? 40 : 30;
  const maxSize = device === 'pc' ? 200 : 120;

  if (typeof config.size.width !== 'number' || config.size.width < minSize || config.size.width > maxSize) {
    errors.push(`${device}端图标宽度必须在${minSize}-${maxSize}px之间`);
  }

  if (typeof config.size.height !== 'number' || config.size.height < minSize || config.size.height > maxSize) {
    errors.push(`${device}端图标高度必须在${minSize}-${maxSize}px之间`);
  }
}

export function generateJS(params: MaxkbAiParams): string {
  const template = readFileSync(join(__dirname, 'template.js'), 'utf-8');
  
  return template
    .replace('{CHAT_URL}', JSON.stringify(params.chatUrl))
    .replace('{LOGO_PATH}', JSON.stringify(params.logoPath))
    .replace('{PC_CONFIG}', JSON.stringify(params.pc))
    .replace('{MOBILE_CONFIG}', JSON.stringify(params.mobile));
}

export { deploy, undeploy, isDeployed } from './deploy'; 