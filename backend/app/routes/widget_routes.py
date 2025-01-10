from flask import Blueprint, jsonify, request
from app.services.widget_service import WidgetService

widget_bp = Blueprint('widgets', __name__)
widget_service = WidgetService()

@widget_bp.route('/widgets/types/<type>', methods=['GET'])
def get_widgets_by_type(type):
    """获取指定类型的小组件列表"""
    try:
        print(f"\n=== API Request ===")
        print(f"Requesting widgets of type: {type}")
        widgets = widget_service.get_widgets_by_type(type)
        print(f"Found widgets: {widgets}")
        return jsonify(widgets)
    except Exception as e:
        print(f"Error in get_widgets_by_type: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

@widget_bp.route('/widgets/<widget_id>/template', methods=['GET'])
def get_widget_template(widget_id):
    """获取小组件模板"""
    return jsonify(widget_service.load_widget_template(widget_id))

@widget_bp.route('/widgets/<widget_id>/params', methods=['PUT'])
def update_widget_params(widget_id):
    """更新小组件参数"""
    params = request.get_json()
    return jsonify(widget_service.update_widget_params(widget_id, params))

@widget_bp.route('/widgets/<widget_id>/deploy', methods=['POST'])
def deploy_widget(widget_id):
    """部署小组件"""
    params = request.get_json()
    return jsonify(widget_service.deploy_widget(widget_id, params))

@widget_bp.route('/widgets/<widget_id>/config', methods=['GET'])
def get_widget_config(widget_id):
    """获取小组件配置"""
    config = widget_service.load_widget_config(widget_id)
    if config:
        return jsonify(config)
    return jsonify({"error": "Widget not found"}), 404 

@widget_bp.route('/widgets/<widget_id>/deployed', methods=['GET'])
def check_widget_deployed(widget_id):
    """检查组件是否已部署"""
    is_deployed = widget_service.check_widget_deployed(widget_id)
    return jsonify({'deployed': is_deployed})

@widget_bp.route('/widgets/<widget_id>/undeploy', methods=['POST'])
def undeploy_widget(widget_id):
    """取消部署组件"""
    return jsonify(widget_service.undeploy_widget(widget_id)) 