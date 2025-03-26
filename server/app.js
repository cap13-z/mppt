// 导入必要的模块
const express = require('express');
const cors = require('cors');
const WebSocket = require('ws');
const mysql = require('mysql2');
const http = require('http');

// 创建Express应用
const app = express();
const server = http.createServer(app);

// 创建WebSocket服务器
const wss = new WebSocket.Server({ server });

// 中间件配置
app.use(cors()); // 启用CORS
app.use(express.json()); // 解析JSON请求体
app.use(express.static('public')); // 提供静态文件服务

// 数据库连接配置
const db = mysql.createConnection({
    host: 'localhost',
    user: 'mpptuser',
    password: 'password',
    database: 'energy_system'
});

// 连接数据库
db.connect((err) => {
    if (err) {
        console.error('数据库连接失败:', err);
        return;
    }
    console.log('数据库连接成功');
});

// WebSocket连接处理
wss.on('connection', (ws) => {
    console.log('新的WebSocket连接已建立');

    // 处理接收到的消息
    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message);
            handleWebSocketMessage(data, ws);
        } catch (error) {
            console.error('消息处理错误:', error);
        }
    });

    // 处理连接关闭
    ws.on('close', () => {
        console.log('WebSocket连接已关闭');
    });
});

// 处理WebSocket消息
function handleWebSocketMessage(data, ws) {
    // 根据消息类型处理不同的数据
    switch (data.type) {
        case 'battery':
            handleBatteryData(data);
            break;
        case 'solar':
            handleSolarData(data);
            break;
        case 'system':
            handleSystemData(data);
            break;
        default:
            console.warn('未知的消息类型:', data.type);
    }
}

// 处理电池数据
function handleBatteryData(data) {
    const query = 'INSERT INTO battery_data (voltage, capacity, timestamp) VALUES (?, ?, NOW())';
    db.query(query, [data.voltage, data.capacity], (err, results) => {
        if (err) {
            console.error('保存电池数据失败:', err);
        }
    });
}

// 处理太阳能数据
function handleSolarData(data) {
    const query = 'INSERT INTO solar_data (voltage, power, timestamp) VALUES (?, ?, NOW())';
    db.query(query, [data.voltage, data.power], (err, results) => {
        if (err) {
            console.error('保存太阳能数据失败:', err);
        }
    });
}

// 处理系统数据
function handleSystemData(data) {
    const query = 'INSERT INTO system_data (power_mode, running_time, timestamp) VALUES (?, ?, NOW())';
    db.query(query, [data.mode, data.runningTime], (err, results) => {
        if (err) {
            console.error('保存系统数据失败:', err);
        }
    });
}

// API路由

// 获取历史数据
app.post('/api/historical-data', async (req, res) => {
    const { startTime, endTime } = req.body;
    try {
        const query = `
            SELECT 
                b.timestamp,
                b.voltage as battery_voltage,
                b.capacity as battery_capacity,
                s.voltage as solar_voltage,
                s.power as solar_power,
                sys.power_mode,
                sys.running_time
            FROM battery_data b
            LEFT JOIN solar_data s ON b.timestamp = s.timestamp
            LEFT JOIN system_data sys ON b.timestamp = sys.timestamp
            WHERE b.timestamp BETWEEN ? AND ?
            ORDER BY b.timestamp DESC
        `;
        
        db.query(query, [startTime, endTime], (err, results) => {
            if (err) {
                console.error('获取历史数据失败:', err);
                res.status(500).json({ error: '获取历史数据失败' });
                return;
            }
            res.json(results);
        });
    } catch (error) {
        console.error('处理历史数据请求失败:', error);
        res.status(500).json({ error: '处理请求失败' });
    }
});

// 获取最新数据
app.get('/api/latest-data', (req, res) => {
    const query = `
        SELECT 
            b.voltage as battery_voltage,
            b.capacity as battery_capacity,
            s.voltage as solar_voltage,
            s.power as solar_power,
            sys.power_mode,
            sys.running_time
        FROM battery_data b
        LEFT JOIN solar_data s ON b.timestamp = s.timestamp
        LEFT JOIN system_data sys ON b.timestamp = sys.timestamp
        ORDER BY b.timestamp DESC
        LIMIT 1
    `;
    
    db.query(query, (err, results) => {
        if (err) {
            console.error('获取最新数据失败:', err);
            res.status(500).json({ error: '获取最新数据失败' });
            return;
        }
        res.json(results[0]);
    });
});

// 启动服务器
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
    console.log(`服务器运行在端口 ${PORT}`);
}); 