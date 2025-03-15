// 导入必要的模块
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mysql = require('mysql2');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// 创建 Express 应用
const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "*", // 允许所有来源的请求
        methods: ["GET", "POST"]
    }
});

// 中间件设置
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// 创建数据库连接
const db = mysql.createConnection({
    host: 'localhost',
    user: 'mpptuser',
    password: 'password',
    database: 'energy_system'
});

// 连接到数据库
db.connect(err => {
    if (err) {
        console.error('数据库连接失败:', err);
        return;
    }
    console.log('成功连接到 MySQL 数据库');
});

// 基本路由
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// API 路由 - 获取电池数据
app.get('/api/battery-data', (req, res) => {
    const query = 'SELECT * FROM battery_data ORDER BY timestamp DESC LIMIT 100';
    db.query(query, (err, results) => {
        if (err) {
            console.error('查询电池数据时出错:', err);
            return res.status(500).json({ error: '服务器错误' });
        }
        res.json(results);
    });
});

// API 路由 - 获取太阳能板数据
app.get('/api/solar-data', (req, res) => {
    const query = 'SELECT * FROM solar_data ORDER BY timestamp DESC LIMIT 100';
    db.query(query, (err, results) => {
        if (err) {
            console.error('查询太阳能板数据时出错:', err);
            return res.status(500).json({ error: '服务器错误' });
        }
        res.json(results);
    });
});

// API 路由 - 获取系统供电状态
app.get('/api/power-status', (req, res) => {
    const query = 'SELECT * FROM power_status ORDER BY timestamp DESC LIMIT 100';
    db.query(query, (err, results) => {
        if (err) {
            console.error('查询系统供电状态时出错:', err);
            return res.status(500).json({ error: '服务器错误' });
        }
        res.json(results);
    });
});

// API 路由 - 获取天气数据
app.get('/api/weather-data', (req, res) => {
    const query = 'SELECT * FROM weather_data ORDER BY timestamp DESC LIMIT 100';
    db.query(query, (err, results) => {
        if (err) {
            console.error('查询天气数据时出错:', err);
            return res.status(500).json({ error: '服务器错误' });
        }
        res.json(results);
    });
});

// API 路由 - 获取电价数据
app.get('/api/electricity-price', (req, res) => {
    const query = 'SELECT * FROM electricity_price ORDER BY timestamp DESC LIMIT 100';
    db.query(query, (err, results) => {
        if (err) {
            console.error('查询电价数据时出错:', err);
            return res.status(500).json({ error: '服务器错误' });
        }
        res.json(results);
    });
});

// API 路由 - 获取所有最新数据（综合数据）
app.get('/api/all-latest-data', (req, res) => {
    const batteryQuery = 'SELECT * FROM battery_data ORDER BY timestamp DESC LIMIT 1';
    const solarQuery = 'SELECT * FROM solar_data ORDER BY timestamp DESC LIMIT 1';
    const powerStatusQuery = 'SELECT * FROM power_status ORDER BY timestamp DESC LIMIT 1';
    const weatherQuery = 'SELECT * FROM weather_data ORDER BY timestamp DESC LIMIT 1';
    const priceQuery = 'SELECT * FROM electricity_price ORDER BY timestamp DESC LIMIT 1';
    
    Promise.all([
        new Promise((resolve, reject) => {
            db.query(batteryQuery, (err, results) => {
                if (err) reject(err);
                else resolve(results.length > 0 ? results[0] : null);
            });
        }),
        new Promise((resolve, reject) => {
            db.query(solarQuery, (err, results) => {
                if (err) reject(err);
                else resolve(results.length > 0 ? results[0] : null);
            });
        }),
        new Promise((resolve, reject) => {
            db.query(powerStatusQuery, (err, results) => {
                if (err) reject(err);
                else resolve(results.length > 0 ? results[0] : null);
            });
        }),
        new Promise((resolve, reject) => {
            db.query(weatherQuery, (err, results) => {
                if (err) reject(err);
                else resolve(results.length > 0 ? results[0] : null);
            });
        }),
        new Promise((resolve, reject) => {
            db.query(priceQuery, (err, results) => {
                if (err) reject(err);
                else resolve(results.length > 0 ? results[0] : null);
            });
        })
    ])
    .then(([battery, solar, powerStatus, weather, price]) => {
        res.json({
            battery,
            solar,
            powerStatus,
            weather,
            price,
            timestamp: new Date()
        });
    })
    .catch(error => {
        console.error('获取综合数据时出错:', error);
        res.status(500).json({ error: '服务器错误' });
    });
});

// 保留原有的能源数据API路由用于兼容性
app.get('/api/energy-data', (req, res) => {
    const query = 'SELECT * FROM energy_data ORDER BY timestamp DESC LIMIT 100';
    db.query(query, (err, results) => {
        if (err) {
            console.error('查询数据库时出错:', err);
            return res.status(500).json({ error: '服务器错误' });
        }
        res.json(results);
    });
});

// Socket.IO 连接处理
io.on('connection', (socket) => {
    console.log('新客户端连接，ID:', socket.id);
    
    // 每隔 5 秒发送最新综合数据
    const interval = setInterval(() => {
        const batteryQuery = 'SELECT * FROM battery_data ORDER BY timestamp DESC LIMIT 1';
        const solarQuery = 'SELECT * FROM solar_data ORDER BY timestamp DESC LIMIT 1';
        const powerStatusQuery = 'SELECT * FROM power_status ORDER BY timestamp DESC LIMIT 1';
        const weatherQuery = 'SELECT * FROM weather_data ORDER BY timestamp DESC LIMIT 1';
        const priceQuery = 'SELECT * FROM electricity_price ORDER BY timestamp DESC LIMIT 1';
        
        Promise.all([
            new Promise((resolve, reject) => {
                db.query(batteryQuery, (err, results) => {
                    if (err) reject(err);
                    else resolve(results.length > 0 ? results[0] : null);
                });
            }),
            new Promise((resolve, reject) => {
                db.query(solarQuery, (err, results) => {
                    if (err) reject(err);
                    else resolve(results.length > 0 ? results[0] : null);
                });
            }),
            new Promise((resolve, reject) => {
                db.query(powerStatusQuery, (err, results) => {
                    if (err) reject(err);
                    else resolve(results.length > 0 ? results[0] : null);
                });
            }),
            new Promise((resolve, reject) => {
                db.query(weatherQuery, (err, results) => {
                    if (err) reject(err);
                    else resolve(results.length > 0 ? results[0] : null);
                });
            }),
            new Promise((resolve, reject) => {
                db.query(priceQuery, (err, results) => {
                    if (err) reject(err);
                    else resolve(results.length > 0 ? results[0] : null);
                });
            })
        ])
        .then(([battery, solar, powerStatus, weather, price]) => {
            socket.emit('data-update', {
                battery,
                solar,
                powerStatus,
                weather,
                price,
                timestamp: new Date()
            });
        })
        .catch(error => {
            console.error('获取最新数据时出错:', error);
        });
    }, 5000);
    
    // 客户端断开连接时清除定时器
    socket.on('disconnect', () => {
        console.log('客户端断开连接，ID:', socket.id);
        clearInterval(interval);
    });
});

// 启动服务器
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
    console.log(`服务器运行在端口 ${PORT}`);
}); 