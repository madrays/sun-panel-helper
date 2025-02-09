import { deploy, undeploy, isDeployed } from './deploy';

export function generateJS(): string {
  return `setInterval(function() {
    // 检查页面是否存在具有指定标题的按钮元素
    const buttons = document.querySelectorAll('.fixed-element .float-btn[title="前往登录"]');
    buttons.forEach(function(button) {
        // 删除具有指定标题的按钮的父级元素
        const parent = button.parentElement;
        if (parent) {
            parent.remove();
        }
    });
}, 100);`;
}

export async function deployHideLogin(): Promise<void> {
  const code = generateJS();
  await deploy(code);
}

export { undeploy, isDeployed }; 