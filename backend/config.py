import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'dev'
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))
    WIDGET_DATA_PATH = os.path.join(BASE_DIR, 'data', 'widgets')
    CUSTOM_WIDGETS_PATH = os.path.join(BASE_DIR, 'custom') 