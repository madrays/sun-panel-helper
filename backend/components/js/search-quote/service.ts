import { readFileSync } from 'fs';
import { join } from 'path';
import { deploy, undeploy, isDeployed } from './deploy';

// 读取模板文件
const template = readFileSync(join(__dirname, 'template.js'), 'utf-8');

// 生成JS代码
function generateJS(): string {
  return template;
}

export { generateJS, deploy, undeploy, isDeployed }; 