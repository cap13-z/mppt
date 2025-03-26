// 导入必要的模块
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

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
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// 基本路由
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 模拟数据生成函数
function generateSimulatedData() {
    const now = new Date();
    
    // 模拟电池数据
    const batteryData = {
        voltage: 12 + Math.random() * 2, // 12-14V
        capacity: 50 + Math.random() * 50, // 50-100%
        temperature: 25 + Math.random() * 10, // 25-35°C
        current: 1 + Math.random() * 2, // 1-3A
        status: ['充电中', '放电中', '满电状态'][Math.floor(Math.random() * 3)],
        timestamp: now
    };
    
    // 模拟太阳能数据
    const solarData = {
        voltage: 18 + Math.random() * 4, // 18-22V
        current: 0.5 + Math.random() * 2.5, // 0.5-3A
        power: 0,
        efficiency: 70 + Math.random() * 20, // 70-90%
        timestamp: now
    };
    solarData.power = solarData.voltage * solarData.current;
    
    // 模拟系统供电状态
    const powerStatus = {
        source: Math.random() > 0.5 ? '太阳能' : '电网',
        load_power: 50 + Math.random() * 150, // 50-200W
        solar_status: Math.random() > 0.3 ? '正常' : '离线',
        grid_status: Math.random() > 0.2 ? '正常' : '断电',
        timestamp: now
    };
    
    // 模拟天气数据
    const weatherData = {
        temperature: 20 + Math.random() * 15, // 20-35°C
        humidity: 40 + Math.random() * 40, // 40-80%
        weather_condition: ['晴朗', '多云', '阴天', '小雨'][Math.floor(Math.random() * 4)],
        solar_radiation: 200 + Math.random() * 600, // 200-800 W/m²
        timestamp: now
    };
    
    // 模拟电价数据
    const priceData = {
        price: 0.5 + Math.random() * 0.3, // 0.5-0.8 元/kWh
        price_level: ['峰值', '平值', '谷值'][Math.floor(Math.random() * 3)],
        next_change_time: new Date(now.getTime() + 3600000 + Math.random() * 3600000), // 1-2小时后
        timestamp: now
    };
    
    // 发送模拟数据到客户端
    io.emit('data-update', {
        battery: batteryData,
        solar: solarData,
        powerStatus: powerStatus,
        weather: weatherData,
        price: priceData
    });
    
    console.log('已发送模拟数据');
}

// 定义API路由 - 返回模拟数据
app.get('/api/battery-data', (req, res) => {
    const mockData = [];
    const now = new Date();
    for (let i = 0; i < 10; i++) {
        const timestamp = new Date(now.getTime() - i * 60000); // 每条数据间隔1分钟
        mockData.push({
            id: i + 1,
            voltage: 12 + Math.random() * 2,
            capacity: 50 + Math.random() * 50,
            temperature: 25 + Math.random() * 10,
            current: 1 + Math.random() * 2,
            status: ['充电中', '放电中', '满电状态'][Math.floor(Math.random() * 3)],
            timestamp: timestamp
        });
    }
    res.json(mockData);
});

app.get('/api/solar-data', (req, res) => {
    const mockData = [];
    const now = new Date();
    for (let i = 0; i < 10; i++) {
        const timestamp = new Date(now.getTime() - i * 60000); // 每条数据间隔1分钟
        const voltage = 18 + Math.random() * 4;
        const current = 0.5 + Math.random() * 2.5;
        mockData.push({
            id: i + 1,
            voltage: voltage,
            current: current,
            power: voltage * current,
            efficiency: 70 + Math.random() * 20,
            timestamp: timestamp
        });
    }
    res.json(mockData);
});

app.get('/api/power-status', (req, res) => {
    const mockData = [];
    const now = new Date();
    for (let i = 0; i < 10; i++) {
        const timestamp = new Date(now.getTime() - i * 60000); // 每条数据间隔1分钟
        mockData.push({
            id: i + 1,
            source: Math.random() > 0.5 ? '太阳能' : '电网',
            load_power: 50 + Math.random() * 150,
            solar_status: Math.random() > 0.3 ? '正常' : '离线',
            grid_status: Math.random() > 0.2 ? '正常' : '断电',
            timestamp: timestamp
        });
    }
    res.json(mockData);
});

app.get('/api/weather-data', (req, res) => {
    const mockData = [];
    const now = new Date();
    for (let i = 0; i < 10; i++) {
        const timestamp = new Date(now.getTime() - i * 60000); // 每条数据间隔1分钟
        mockData.push({
            id: i + 1,
            temperature: 20 + Math.random() * 15,
            humidity: 40 + Math.random() * 40,
            weather_condition: ['晴朗', '多云', '阴天', '小雨'][Math.floor(Math.random() * 4)],
            solar_radiation: 200 + Math.random() * 600,
            timestamp: timestamp
        });
    }
    res.json(mockData);
});

app.get('/api/electricity-price', (req, res) => {
    const mockData = [];
    const now = new Date();
    for (let i = 0; i < 10; i++) {
        const timestamp = new Date(now.getTime() - i * 60000); // 每条数据间隔1分钟
        mockData.push({
            id: i + 1,
            price: 0.5 + Math.random() * 0.3,
            price_level: ['峰值', '平值', '谷值'][Math.floor(Math.random() * 3)],
            next_change_time: new Date(now.getTime() + 3600000 + Math.random() * 3600000),
            timestamp: timestamp
        });
    }
    res.json(mockData);
});

app.get('/api/energy-data', (req, res) => {
    const mockData = [];
    const now = new Date();
    for (let i = 0; i < 10; i++) {
        const timestamp = new Date(now.getTime() - i * 60000); // 每条数据间隔1分钟
        mockData.push({
            id: i + 1,
            battery_voltage: 12 + Math.random() * 2,
            solar_power: (18 + Math.random() * 4) * (0.5 + Math.random() * 2.5),
            load_power: 50 + Math.random() * 150,
            timestamp: timestamp
        });
    }
    res.json(mockData);
});

app.get('/api/all-latest-data', (req, res) => {
    const now = new Date();
    
    const batteryData = {
        id: 1,
        voltage: 12 + Math.random() * 2,
        capacity: 50 + Math.random() * 50,
        temperature: 25 + Math.random() * 10,
        current: 1 + Math.random() * 2,
        status: ['充电中', '放电中', '满电状态'][Math.floor(Math.random() * 3)],
        timestamp: now
    };
    
    const voltage = 18 + Math.random() * 4;
    const current = 0.5 + Math.random() * 2.5;
    const solarData = {
        id: 1,
        voltage: voltage,
        current: current,
        power: voltage * current,
        efficiency: 70 + Math.random() * 20,
        timestamp: now
    };
    
    const powerStatus = {
        id: 1,
        source: Math.random() > 0.5 ? '太阳能' : '电网',
        load_power: 50 + Math.random() * 150,
        solar_status: Math.random() > 0.3 ? '正常' : '离线',
        grid_status: Math.random() > 0.2 ? '正常' : '断电',
        timestamp: now
    };
    
    const weatherData = {
        id: 1,
        temperature: 20 + Math.random() * 15,
        humidity: 40 + Math.random() * 40,
        weather_condition: ['晴朗', '多云', '阴天', '小雨'][Math.floor(Math.random() * 4)],
        solar_radiation: 200 + Math.random() * 600,
        timestamp: now
    };
    
    const priceData = {
        id: 1,
        price: 0.5 + Math.random() * 0.3,
        price_level: ['峰值', '平值', '谷值'][Math.floor(Math.random() * 3)],
        next_change_time: new Date(now.getTime() + 3600000 + Math.random() * 3600000),
        timestamp: now
    };
    
    res.json({
        battery: batteryData,
        solar: solarData,
        powerStatus: powerStatus,
        weather: weatherData,
        price: priceData
    });
});

// Socket.IO 连接处理
io.on('connection', (socket) => {
    console.log('客户端已连接');
    
    // 立即发送一次模拟数据
    generateSimulatedData();
    
    // 当客户端断开连接时
    socket.on('disconnect', () => {
        console.log('客户端断开连接');
    });
});

// 启动模拟数据定时器
const simulationInterval = 10000; // 10秒发送一次模拟数据
const simulationTimer = setInterval(generateSimulatedData, simulationInterval);

// 设置进程退出时的清理操作
process.on('SIGINT', () => {
    console.log('正在关闭服务器...');
    
    // 清理定时器
    if (simulationTimer) {
        clearInterval(simulationTimer);
        console.log('模拟数据定时器已清理');
    }
    
    // 关闭服务器
    server.close(() => {
        console.log('服务器已关闭');
        process.exit(0);
    });
});

// 启动服务器
const PORT = 3002;
server.listen(PORT, '0.0.0.0', () => {
    console.log(`服务器运行在端口 ${PORT}`);
    console.log(`访问地址: http://localhost:${PORT}`);
}); 