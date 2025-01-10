import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'dev'
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))
    WIDGET_DATA_PATH = os.path.join(BASE_DIR, 'data', 'widgets')
    CUSTOM_WIDGETS_PATH = os.path.join(BASE_DIR, 'custom')
    
    # 智能判断部署路径
    # 如果在 Docker 环境中（通过环境变量判断）
    if os.environ.get('DOCKER_ENV'):
        DEPLOY_PATH = '/app/deploy'
    else:
        # 本地开发环境
        DEPLOY_PATH = os.path.join(os.path.dirname(BASE_DIR), 'deploy') 