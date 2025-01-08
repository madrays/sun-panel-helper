import os
import json
from config import Config

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
        """部署小组件到自定义目录"""
        config = self.load_widget_config(widget_id)
        if not config:
            return None
        
        # 生成最终的CSS代码
        template = config['template']
        for key, value in params.items():
            template = template.replace('{{' + key + '}}', str(value))
        
        # 创建部署目录
        deploy_dir = os.path.join(self.custom_path, widget_id)
        os.makedirs(deploy_dir, exist_ok=True)
        
        # 保存部署文件
        with open(os.path.join(deploy_dir, 'style.css'), 'w', encoding='utf-8') as f:
            f.write(template)
        
        return {'success': True, 'message': '部署成功'} 
        
        return {'success': True, 'message': '部署成功'} 