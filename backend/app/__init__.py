from flask import Flask
from flask_cors import CORS
from config import Config

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    
    # 使用默认配置，允许所有跨域请求
    CORS(app)

    from app.routes import widget_bp
    app.register_blueprint(widget_bp, url_prefix='/api')

    return app 