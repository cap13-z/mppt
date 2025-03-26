from flask import Flask, jsonify, render_template
import random
import time

app = Flask(__name__)

# 首页路由
@app.route('/')
def index():
    return render_template('dashboard.html')

# 数据接口
@app.route('/api/data')
def get_data():
    # 随机选择供电状态
    power_status_choices = ["太阳能电池供电", "电网供电"]
    power_status = random.choice(power_status_choices)

    # 模拟实时数据
    return jsonify({
        "price": random.uniform(0.5, 1.0),  # 电价
        "solar": random.uniform(2.0, 5.0),  # 太阳能发电
        "powerStatus": power_status,  # 系统供电状态
        "table": [  # 实时数据表
            {
                "time": time.strftime("%H:%M"),  # 当前时间
                "voltage": random.uniform(220, 240),  # 电压
                "current": random.uniform(5, 10),  # 电流
                "power": random.uniform(1.0, 2.0)  # 功率
            } for _ in range(5)  # 生成 5 条数据
        ]
    })

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)