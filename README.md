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

## 微信小程序

为了扩展系统的可用性和移动端体验，我们开发了配套的微信小程序，用户可以随时随地查看能源系统的实时状态和历史数据。

### 小程序功能

- **实时监控**：与web版一致的实时数据监控，包括电池、太阳能、天气和电价信息
- **历史数据**：查看各类数据的历史记录，支持日期范围选择
- **数据趋势**：图表化展示各类数据的变化趋势
- **系统控制**：远程控制系统功能（需授权）
- **消息通知**：重要事件推送和告警通知

### 技术架构

- **前端框架**：微信小程序原生开发框架
- **通信方式**：RESTful API + WebSocket
- **数据可视化**：微信小程序内置canvas组件
- **状态管理**：全局状态统一管理

### 项目结构

```
energy-monitor-miniprogram/
├── app.js                # 小程序入口文件
├── app.json              # 小程序全局配置
├── app.wxss              # 小程序全局样式
├── components/           # 自定义组件
│   ├── battery-status/   # 电池状态组件
│   ├── solar-status/     # 太阳能状态组件
│   ├── weather-status/   # 天气状态组件
│   └── ...
├── pages/                # 小程序页面
│   ├── index/            # 首页（实时监控）
│   ├── history/          # 历史数据页面
│   ├── trends/           # 数据趋势页面
│   ├── settings/         # 设置页面
│   └── ...
├── services/             # 服务层
│   ├── api-service.js    # API服务
│   ├── battery.js        # 电池数据服务
│   ├── solar.js          # 太阳能数据服务
│   └── ...
├── utils/                # 工具类
│   ├── date-util.js      # 日期工具
│   ├── websocket.js      # WebSocket工具
│   └── ...
└── config.js             # 全局配置
```

### 页面说明

1. **首页**：展示设备的实时状态，包括电池电量、太阳能发电情况、当前天气和电价等信息
2. **历史数据页**：查询和展示历史数据记录，支持按日期筛选，可查看电池、太阳能、天气、电价和系统各类型数据
3. **趋势页**：以图表形式展示数据变化趋势，直观了解系统运行情况
4. **设置页**：用户偏好设置，如通知开关、数据刷新频率、主题切换等

### 使用方式

1. 微信搜索"能源演示系统"小程序
2. 或扫描下方二维码进入小程序（待发布）

### 开发说明

小程序开发需要微信开发者工具，请按照以下步骤进行开发：

1. 下载并安装[微信开发者工具](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html)
2. 克隆项目代码到本地
3. 在微信开发者工具中导入项目
4. 在`config.js`中配置API服务器地址
5. 进行开发和调试

### 接口对接

小程序与后端服务器的对接主要通过以下方式：

1. RESTful API：用于获取历史数据、趋势数据和系统设置等
2. WebSocket：用于接收实时数据更新

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
- 2024-03-25: 开发配套微信小程序，实现移动端监控能力 