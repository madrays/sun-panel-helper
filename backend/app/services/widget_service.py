import os
import json
from config import Config
import re
from datetime import datetime

class WidgetService:
    def __init__(self):
        self.data_path = Config.WIDGET_DATA_PATH
        self.custom_path = Config.CUSTOM_WIDGETS_PATH
        print(f"Current working directory: {os.getcwd()}")
        print(f"Custom path (absolute): {os.path.abspath(self.custom_path)}")
        os.makedirs(self.data_path, exist_ok=True)
        os.makedirs(self.custom_path, exist_ok=True)
        
    def load_widget_template(self, widget_id):
        """加载小组件模板"""
        try:
            file_path = os.path.join(self.custom_path, f"{widget_id}/template.html")
            print(f"Loading template from: {file_path}")
            
            if not os.path.exists(file_path):
                print(f"Template file not found: {file_path}")
                # 如果模板文件不存在，尝试从配置中获取
                config = self.load_widget_config(widget_id)
                if config and 'template' in config:
                    return config['template']
                return None
                
            with open(file_path, 'r', encoding='utf-8') as f:
                template = f.read()
                print(f"Loaded template length: {len(template)}")
                return template
        except Exception as e:
            print(f"Error loading template: {str(e)}")
            return None
        
    def load_widget_config(self, widget_id):
        """加载小组件配置"""
        try:
            file_path = os.path.join(self.custom_path, f"{widget_id}/config.json")
            print(f"Loading config from: {file_path}")
            
            if not os.path.exists(file_path):
                print(f"Config file not found: {file_path}")
                return None
            
            with open(file_path, 'r', encoding='utf-8-sig') as f:
                config = json.load(f)
                print(f"Loaded config: {config}")
                return config
        except Exception as e:
            print(f"Error loading config: {str(e)}")
            return None
        
    def get_widgets_by_type(self, widget_type):
        """按类型获取小组件列表"""
        widgets = []
        try:
            print("\n=== Debug Info ===")
            print(f"Current working directory: {os.getcwd()}")
            print(f"Custom path: {self.custom_path}")
            print(f"Custom path (absolute): {os.path.abspath(self.custom_path)}")
            print(f"Looking for type: {widget_type}")
            
            # 检查目录是否存在
            if not os.path.exists(self.custom_path):
                print(f"ERROR: Custom path does not exist: {self.custom_path}")
                return widgets
            
            # 列出所有目录和文件
            print("\nDirectory contents:")
            for root, dirs, files in os.walk(self.custom_path):
                print(f"\nDirectory: {root}")
                print(f"Subdirectories: {dirs}")
                print(f"Files: {files}")
                
            # 列出所有目录
            dirs = os.listdir(self.custom_path)
            print(f"\nFound directories: {dirs}")
            
            for widget_dir in dirs:
                dir_path = os.path.join(self.custom_path, widget_dir)
                config_path = os.path.join(dir_path, 'config.json')
                print(f"\nChecking widget: {widget_dir}")
                print(f"Config path: {config_path}")
                print(f"Config exists: {os.path.exists(config_path)}")
                
                if not os.path.exists(config_path):
                    print(f"Config file not found: {config_path}")
                    continue
                
                try:
                    with open(config_path, 'r', encoding='utf-8-sig') as f:
                        config = json.load(f)
                        print(f"Successfully loaded config: {config.get('name')}")
                        print(f"Widget type: {config.get('type')}")
                        
                        if config.get('type') == widget_type:
                            print(f"Adding widget: {config['name']}")
                            widgets.append(config)
                        else:
                            print(f"Type mismatch: {config.get('type')} != {widget_type}")
                except Exception as e:
                    print(f"Error loading config file: {str(e)}")
                    import traceback
                    traceback.print_exc()
                
            print(f"\nReturning widgets: {len(widgets)} found")
            return widgets
        except Exception as e:
            print(f"Error in get_widgets_by_type: {str(e)}")
            import traceback
            traceback.print_exc()
            return []
        
    def update_widget_params(self, widget_id, params):
        """更新小组件参数"""
        config = self.load_widget_config(widget_id)
        if config:
            config['params'] = params
            file_path = os.path.join(self.custom_path, f"{widget_id}/config.json")
            with open(file_path, 'w', encoding='utf-8') as f:
                json.dump(config, f, indent=2, ensure_ascii=False)
        return config 
        
    def deploy_widget(self, widget_id, params):
        """部署小组件"""
        try:
            deploy_file = os.path.join(Config.DEPLOY_PATH, 'index.css')
            print(f"\n=== Deploy Debug Info ===")
            print(f"Deploy path: {Config.DEPLOY_PATH}")
            print(f"Deploy file: {deploy_file}")
            
            # 确保部署目录存在
            os.makedirs(Config.DEPLOY_PATH, exist_ok=True)
            
            # 读取现有内容
            existing_content = ''
            header_comment = '''/* Sun-Panel-Helper CSS */
/* 此文件由系统自动管理，请勿手动修改 */
/* 警告：手动修改可能导致样式冲突或程序异常 */
/* 上次更新：{} */

'''.format(datetime.now().strftime("%Y-%m-%d %H:%M:%S"))

            if os.path.exists(deploy_file):
                with open(deploy_file, 'r', encoding='utf-8') as f:
                    existing_content = f.read()
                    # 如果文件存在但没有头部注释，添加它
                    if not existing_content.startswith('/* Sun-Panel-Helper CSS */'):
                        existing_content = header_comment + existing_content
            
            # 部署文件路径 - 直接使用 index.css
            deploy_file = os.path.join(Config.DEPLOY_PATH, 'index.css')
            
            print(f"Deploying widget {widget_id} with params: {params}")
            
            # 1. 加载组件配置
            config = self.load_widget_config(widget_id)
            if not config:
                print(f"Widget config not found for {widget_id}")
                return {'success': False, 'error': '组件配置不存在'}
            
            # 2. 获取模板
            template = config.get('template')
            if not template:
                print(f"Template not found in config for {widget_id}")
                return {'success': False, 'error': '模板不存在'}
            
            # 3. 处理模板中的条件语句
            css_code = template
            
            # 处理条件语句
            def replace_condition(match):
                condition, if_block, else_block = match.groups()
                value = params.get(condition)
                # 确保布尔值正确处理
                if isinstance(value, str):
                    value = value.lower() == 'true'
                elif isinstance(value, bool):
                    value = bool(value)
                else:
                    value = False
                    
                print(f"Condition {condition}: {value} (type: {type(value)})")
                return if_block.strip() if value else (else_block.strip() if else_block else '')
            
            # 首先处理条件语句
            css_code = re.sub(
                r'{{#if\s+(\w+)}}([\s\S]*?)(?:{{else}}([\s\S]*?))?{{/if}}',
                replace_condition,
                css_code
            )
            
            # 然后处理数学表达式
            def replace_math(match):
                param, divisor = match.groups()
                value = params.get(param)
                if value is None:
                    return '0'
                try:
                    return str(float(value) / float(divisor))
                except (ValueError, TypeError):
                    return '0'
            
            css_code = re.sub(r'{{(\w+)/(\d+)}}', replace_math, css_code)
            
            # 最后处理普通变量
            for key, value in params.items():
                if isinstance(value, bool):
                    value = str(value).lower()
                css_code = css_code.replace('{{' + key + '}}', str(value))
            
            print(f"Final CSS code:\n{css_code}")
            
            # 构建新的样式块
            style_block = f"""
/* Sun-Panel-Helper CSS Start: {widget_id} */
{css_code}
/* Sun-Panel-Helper CSS End: {widget_id} */
"""
            
            # 写入文件
            with open(deploy_file, 'w', encoding='utf-8') as f:
                if existing_content.strip():
                    # 确保头部注释存在且是最新的
                    if '/* Sun-Panel-Helper CSS */' in existing_content:
                        # 替换旧的头部注释
                        pattern = r'/\* Sun-Panel-Helper CSS \*/.*?/\* 上次更新：.*?\*/\n*'
                        existing_content = re.sub(pattern, '', existing_content, flags=re.DOTALL)
                    f.write(header_comment + existing_content.strip() + '\n\n' + style_block)
                else:
                    f.write(header_comment + style_block)
                
            print(f"Successfully deployed to {deploy_file}")
            
            # 写入文件后再次检查
            if os.path.exists(deploy_file):
                with open(deploy_file, 'r', encoding='utf-8') as f:
                    new_content = f.read()
                    print(f"\nAfter deployment:")
                    print(f"New file content length: {len(new_content)}")
                    print(f"New file content preview: \n{new_content[:200]}...")
            
            return {'success': True, 'message': '部署成功'}
            
        except Exception as e:
            print(f"Error deploying widget: {str(e)}")
            import traceback
            traceback.print_exc()
            return {'success': False, 'error': str(e)} 
        
    def check_widget_deployed(self, widget_id):
        """检查组件是否已部署"""
        try:
            # 修正部署文件路径
            deploy_file = os.path.join(Config.DEPLOY_PATH, 'index.css')
            if not os.path.exists(deploy_file):
                return False
            
            with open(deploy_file, 'r', encoding='utf-8') as f:
                content = f.read()
            
            start_tag = f"/* Sun-Panel-Helper CSS Start: {widget_id} */"
            return start_tag in content
        except:
            return False
        
    def undeploy_widget(self, widget_id):
        """取消部署组件"""
        try:
            # 修正部署文件路径
            deploy_file = os.path.join(Config.DEPLOY_PATH, 'index.css')
            if not os.path.exists(deploy_file):
                return {'success': True, 'message': '组件未部署'}
            
            with open(deploy_file, 'r', encoding='utf-8') as f:
                content = f.read()
            
            start_tag = f"/* Sun-Panel-Helper CSS Start: {widget_id} */"
            end_tag = f"/* Sun-Panel-Helper CSS End: {widget_id} */"
            
            # 检查是否包含要删除的内容
            if start_tag not in content:
                return {'success': True, 'message': '组件未部署'}
            
            # 构建正则表达式模式，使用原始字符串避免转义问题
            pattern = fr"\n*{re.escape(start_tag)}[\s\S]*?{re.escape(end_tag)}\n*"
            
            # 删除匹配的内容及其前后的空行
            new_content = re.sub(pattern, '\n', content).strip()
            
            # 如果文件变空了，添加头部注释
            if not new_content:
                new_content = '/* Sun-Panel-Helper CSS */\n/* 此文件由系统自动管理，请勿手动修改 */\n'
            
            # 写入文件
            with open(deploy_file, 'w', encoding='utf-8') as f:
                f.write(new_content)
            
            print(f"Successfully undeployed widget {widget_id}")
            return {'success': True, 'message': '取消部署成功'}
        except Exception as e:
            print(f"Error undeploying widget: {str(e)}")
            import traceback
            traceback.print_exc()
            return {'success': False, 'error': str(e)} 