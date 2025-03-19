# 能源演示系统

## 项目简介
这是一个能源演示系统，集成了心知天气API，用于获取实时天气数据并展示在能源监控面板上。

## 项目结构

```
your_project/
├── app.js                # 主应用程序文件
├── public/               # 静态文件目录
│   └── index.html        # 前端页面
├── package.json          # 项目依赖配置
├── .env                  # 环境变量配置
└── README.md             # 项目说明文档
```

## 功能特点

- 实时监控电压、电流、功率和能量数据
- 使用 Socket.IO 实现实时数据更新
- 响应式设计，适配不同设备
- 数据可视化图表展示
- 历史数据查询和展示
- 实时获取武汉地区天气数据，包括温度、湿度、天气状况等
- 智能数据填充：当API返回数据不完整时，系统会根据已有数据进行合理补充
- 数据来源标记：清晰区分真实数据、部分模拟数据和完全模拟数据
- Socket.IO实时数据推送，确保前端界面及时更新
- 模拟能源数据生成，展示太阳能、电池等信息

## 技术栈

- **前端**：HTML5, CSS3, JavaScript, Chart.js
- **后端**：Node.js, Express.js, Socket.IO
- **数据库**：MySQL
- **硬件**：ESP32 微控制器
- **实时通信**：Socket.IO
- **消息队列**：AMQP

## 安装和运行

### 前提条件

- Node.js (v12.0.0 或更高版本)
- MySQL 数据库
- ESP32 开发板 (用于数据采集)

### 安装步骤

1. 克隆或下载项目到本地

2. 安装依赖
   ```
   npm install
   ```

3. 配置数据库
   ```sql
   CREATE DATABASE energy_system;
   USE energy_system;
   
   CREATE TABLE energy_data (
     id INT AUTO_INCREMENT PRIMARY KEY,
     voltage FLOAT NOT NULL,
     current FLOAT NOT NULL,
     power FLOAT NOT NULL,
     energy FLOAT NOT NULL,
     timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
   );
   
   CREATE USER 'mpptuser'@'localhost' IDENTIFIED WITH mysql_native_password BY 'password';
   GRANT ALL PRIVILEGES ON energy_system.* TO 'mpptuser'@'localhost';
   FLUSH PRIVILEGES;
   ```

4. 配置环境变量
   创建 `.env` 文件并设置以下变量：
   ```
   PORT=3001
   DB_HOST=localhost
   DB_USER=mpptuser
   DB_PASSWORD=password
   DB_NAME=energy_system
   WEATHER_API_KEY=心知天气API密钥
   ```

5. 启动服务器
   ```
   npm start
   ```

6. 访问应用
   打开浏览器，访问 `http://localhost:3001`

## ESP32 配置

ESP32 需要配置为定期发送能源数据到服务器。请参考 ESP32 目录下的代码和说明进行配置。

## 页面布局说明

- **仪表盘**：显示实时电压、电流、功率和能量数据
- **图表区域**：展示电压、电流和功率的历史变化趋势
- **历史数据表**：以表格形式展示历史数据记录

## 数据库表结构

### energy_data 表

| 字段名    | 类型      | 说明                 |
|-----------|-----------|---------------------|
| id        | INT       | 自增主键             |
| voltage   | FLOAT     | 电压值 (V)           |
| current   | FLOAT     | 电流值 (A)           |
| power     | FLOAT     | 功率值 (W)           |
| energy    | FLOAT     | 能量值 (kWh)         |
| timestamp | DATETIME  | 记录时间戳           |

## 维护和更新

- 定期备份数据库
- 检查 ESP32 连接状态
- 更新 Node.js 和依赖包版本

## 许可证

MIT 

## 注意事项

- AMQP连接可能存在断线重连问题，这在日志中会有所体现
- 数据库连接需要正确配置MySQL凭据

## 更新日志

- 2024-03-19: 集成心知天气API，添加实时天气数据展示功能 