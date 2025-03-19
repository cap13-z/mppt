// 导入必要的模块
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mysql = require('mysql2/promise');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// 导入湖北省电价模块
const hubeiElectricityPrice = require('./electricity-price');

// 导入武汉天气服务模块
const wuhanWeatherService = require('./weather-service');

// 添加全局错误处理
process.on('uncaughtException', (err) => {
    console.error('未捕获的异常:', err);
    // 不退出进程，让服务器继续运行
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('未处理的Promise拒绝:', reason);
    // 不退出进程，让服务器继续运行
});

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
app.use(express.static(path.join(__dirname, 'public')));

// 数据库配置
const dbConfig = {
    host: 'localhost',
    user: 'mpptuser',
    password: 'password',
    database: 'energy_system'
};

// 创建数据库连接池
let pool = null;
try {
    pool = mysql.createPool(dbConfig);
    console.log('数据库连接池创建成功');
} catch (error) {
    console.error('创建数据库连接池失败:', error);
}

// 尝试导入AMQP客户端，如果失败则继续运行
let amqpClient = null;
try {
    const { startAmqpClient } = require('./amqp-client');
    // 尝试启动AMQP客户端，但不阻止服务器启动
    try {
        amqpClient = startAmqpClient(io);
        console.log('AMQP客户端启动成功');
    } catch (error) {
        console.error('启动AMQP客户端失败:', error);
        console.log('将使用模拟数据模式');
    }
} catch (error) {
    console.error('导入AMQP客户端模块失败:', error);
    console.log('将使用模拟数据模式');
}

// 如果AMQP客户端不可用，创建一个模拟数据生成器
if (!amqpClient) {
    console.log('创建模拟数据生成器...');
    
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
    
    // 启动模拟数据定时器
    const simulationInterval = 10000; // 10秒发送一次模拟数据
    const simulationTimer = setInterval(generateSimulatedData, simulationInterval);
    
    // 立即发送一次模拟数据
    generateSimulatedData();
    
    // 设置进程退出时清理定时器
    process.on('SIGINT', () => {
        if (simulationTimer) {
            clearInterval(simulationTimer);
            console.log('模拟数据定时器已清理');
        }
    });
    
    // 创建一个简单的amqpClient对象，以便其他代码可以正常运行
    amqpClient = {
        connection: null,
        updateLastRealDataTime: () => {},
        startSimulation: () => {},
        stopSimulation: () => {},
        setSimulationEnabled: () => {},
        setSimulationInterval: () => {}
    };
}

// 基本路由
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 定义API路由
// 获取最新的电池数据
app.get('/api/battery-data', async (req, res) => {
    try {
        if (!pool) {
            // 返回模拟数据
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
            return res.json(mockData);
        }
        
        const [rows] = await pool.query('SELECT * FROM battery_data ORDER BY timestamp DESC LIMIT 100');
        res.json(rows);
    } catch (error) {
        console.error('获取电池数据时出错:', error);
        // 返回模拟数据
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
    }
});

// 获取最新的太阳能数据
app.get('/api/solar-data', async (req, res) => {
    try {
        if (!pool) {
            // 返回模拟数据
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
            return res.json(mockData);
        }
        
        const [rows] = await pool.query('SELECT * FROM solar_data ORDER BY timestamp DESC LIMIT 100');
        res.json(rows);
    } catch (error) {
        console.error('获取太阳能数据时出错:', error);
        // 返回模拟数据
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
    }
});

// 获取所有最新数据
app.get('/api/all-latest-data', async (req, res) => {
    try {
        let batteryData, solarData, powerStatus, weatherData, priceData;
        
        if (!pool) {
            // 生成模拟数据
            const now = new Date();
            
            batteryData = {
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
            solarData = {
                id: 1,
                voltage: voltage,
                current: current,
                power: voltage * current,
                efficiency: 70 + Math.random() * 20,
                timestamp: now
            };
            
            powerStatus = {
                id: 1,
                source: Math.random() > 0.5 ? '太阳能' : '电网',
                load_power: 50 + Math.random() * 150,
                solar_status: Math.random() > 0.3 ? '正常' : '离线',
                grid_status: Math.random() > 0.2 ? '正常' : '断电',
                timestamp: now
            };
            
            weatherData = {
                id: 1,
                temperature: 20 + Math.random() * 15,
                humidity: 40 + Math.random() * 40,
                weather_condition: ['晴朗', '多云', '阴天', '小雨'][Math.floor(Math.random() * 4)],
                solar_radiation: 200 + Math.random() * 600,
                timestamp: now
            };
            
            priceData = {
                id: 1,
                price: 0.5 + Math.random() * 0.3,
                price_level: ['峰值', '平值', '谷值'][Math.floor(Math.random() * 3)],
                next_change_time: new Date(now.getTime() + 3600000 + Math.random() * 3600000),
                timestamp: now
            };
        } else {
            // 从数据库获取数据
            const [batteryRows] = await pool.query('SELECT * FROM battery_data ORDER BY timestamp DESC LIMIT 1');
            batteryData = batteryRows[0] || null;
            
            const [solarRows] = await pool.query('SELECT * FROM solar_data ORDER BY timestamp DESC LIMIT 1');
            solarData = solarRows[0] || null;
            
            const [powerRows] = await pool.query('SELECT * FROM system_power_status ORDER BY timestamp DESC LIMIT 1');
            powerStatus = powerRows[0] || null;
            
            const [weatherRows] = await pool.query('SELECT * FROM weather_data ORDER BY timestamp DESC LIMIT 1');
            weatherData = weatherRows[0] || null;
            
            const [priceRows] = await pool.query('SELECT * FROM electricity_price ORDER BY timestamp DESC LIMIT 1');
            priceData = priceRows[0] || null;
        }
        
        res.json({
            battery: batteryData,
            solar: solarData,
            powerStatus: powerStatus,
            weather: weatherData,
            price: priceData
        });
    } catch (error) {
        console.error('获取所有最新数据时出错:', error);
        
        // 生成模拟数据
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
    }
});

// API 路由 - 获取系统供电状态
app.get('/api/power-status', async (req, res) => {
    try {
        const [rows] = await pool.query(
            'SELECT * FROM power_status ORDER BY timestamp DESC LIMIT 100'
        );
        res.json(rows);
    } catch (error) {
        console.error('获取系统供电状态时出错:', error);
        res.status(500).json({ error: '获取数据失败' });
    }
});

// API 路由 - 获取天气数据
app.get('/api/weather-data', async (req, res) => {
    try {
        const [rows] = await pool.query(
            'SELECT * FROM weather_data ORDER BY timestamp DESC LIMIT 100'
        );
        res.json(rows);
    } catch (error) {
        console.error('获取天气数据时出错:', error);
        res.status(500).json({ error: '获取数据失败' });
    }
});

// API 路由 - 获取电价数据
app.get('/api/electricity-price', async (req, res) => {
    try {
        // 首先尝试获取湖北实时电价
        const hubeiPrice = hubeiElectricityPrice.getCurrentPrice();
        
        if (hubeiPrice && hubeiPrice.price > 0) {
            // 如果有湖北实时电价，返回这些数据
            // 但仍需从数据库查询历史电价记录
            const [rows] = await pool.query('SELECT * FROM electricity_price ORDER BY timestamp DESC LIMIT 100');
            
            // 确保最新的电价是湖北实时电价
            if (rows.length > 0 && rows[0].timestamp < hubeiPrice.timestamp) {
                rows.unshift(hubeiPrice);
            } else if (rows.length === 0) {
                rows.push(hubeiPrice);
            }
            
            res.json(rows);
        } else if (pool) {
            // 如果没有湖北实时电价，但数据库连接可用，使用数据库数据
            const [rows] = await pool.query('SELECT * FROM electricity_price ORDER BY timestamp DESC LIMIT 100');
            res.json(rows);
        } else {
            // 如果都不可用，返回模拟数据
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
        }
    } catch (error) {
        console.error('获取电价数据时出错:', error);
        res.status(500).json({ error: '获取电价数据失败' });
    }
});

// API 路由 - 获取能源数据
app.get('/api/energy-data', async (req, res) => {
    try {
        const [rows] = await pool.query(
            'SELECT * FROM energy_data ORDER BY timestamp DESC LIMIT 100'
        );
        res.json(rows);
    } catch (error) {
        console.error('获取能源数据时出错:', error);
        res.status(500).json({ error: '获取数据失败' });
    }
});

// Socket.IO 连接处理
io.on('connection', (socket) => {
    console.log('新客户端连接');
    
    // 当客户端请求历史数据时
    socket.on('get-historical-data', async () => {
        try {
            // 获取最近的电池数据
            const [batteryData] = await pool.query(
                'SELECT * FROM battery_data ORDER BY timestamp DESC LIMIT 20'
            );
            
            // 获取最近的太阳能数据
            const [solarData] = await pool.query(
                'SELECT * FROM solar_data ORDER BY timestamp DESC LIMIT 20'
            );
            
            // 获取最近的系统电源状态
            const [powerStatus] = await pool.query(
                'SELECT * FROM power_status ORDER BY timestamp DESC LIMIT 20'
            );
            
            // 获取最近的天气数据
            const [weatherData] = await pool.query(
                'SELECT * FROM weather_data ORDER BY timestamp DESC LIMIT 20'
            );
            
            // 获取最近的电价数据
            const [priceData] = await pool.query(
                'SELECT * FROM electricity_price ORDER BY timestamp DESC LIMIT 20'
            );
            
            // 获取最近的能源数据
            const [energyData] = await pool.query(
                'SELECT * FROM energy_data ORDER BY timestamp DESC LIMIT 20'
            );
            
            // 如果查询到了数据，更新上次接收真实数据的时间
            if (batteryData.length > 0 || solarData.length > 0 || powerStatus.length > 0 || 
                weatherData.length > 0 || priceData.length > 0 || energyData.length > 0) {
                amqpClient.updateLastRealDataTime();
            }
            
            // 发送历史数据给客户端
            socket.emit('historical-data', {
                battery: batteryData,
                solar: solarData,
                power: powerStatus,
                weather: weatherData,
                price: priceData,
                energy: energyData
            });
        } catch (error) {
            console.error('获取历史数据时出错:', error);
            socket.emit('error', { message: '获取历史数据失败' });
        }
    });
    
    // 当客户端断开连接时
    socket.on('disconnect', () => {
        console.log('客户端断开连接');
    });
});

// 设置进程退出时的清理操作
process.on('SIGINT', async () => {
    console.log('正在关闭服务器...');
    
    // 停止模拟数据发送
    if (amqpClient && amqpClient.stopSimulation) {
        amqpClient.stopSimulation();
    }
    
    // 关闭数据库连接
    try {
        await pool.end();
        console.log('数据库连接已关闭');
    } catch (err) {
        console.error('关闭数据库连接时出错:', err);
    }
    
    // 关闭服务器
    server.close(() => {
        console.log('服务器已关闭');
        process.exit(0);
    });
});

// 启动服务器
const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0', () => {
    console.log(`服务器运行在端口 ${PORT}`);
    console.log(`访问地址: http://localhost:${PORT}`);
    
    // 启动湖北省电价数据更新任务
    const priceUpdateJob = hubeiElectricityPrice.startPriceUpdateJob();
    
    // 启动武汉天气数据更新任务
    const weatherUpdateJob = wuhanWeatherService.startWeatherUpdateJob();
    
    // 新增：定时获取天气数据并通过Socket.IO发送给客户端
    const sendWeatherData = async () => {
        try {
            console.log('正在获取并发送天气数据...');
            const weatherData = await wuhanWeatherService.fetchWeatherData();
            
            // 格式化为前端期望的格式
            const formattedWeatherData = {
                timestamp: new Date().toISOString(),
                weather: {
                    temperature: weatherData.temperature,
                    humidity: weatherData.humidity,
                    condition: weatherData.weather,
                    weather: weatherData.weather,
                    weather_condition: weatherData.weather,
                    windDirection: weatherData.windDirection,
                    windScale: weatherData.windScale,
                    radiation: weatherData.radiation || 800,
                    isSimulated: weatherData.isSimulated || false,
                    partiallySimulated: weatherData.partiallySimulated || false // 添加部分模拟标记
                }
            };
            
            // 通过Socket.IO发送给所有客户端
            io.emit('device-data', formattedWeatherData);
            console.log('天气数据已通过Socket.IO发送');
            
        } catch (error) {
            console.error('获取并发送天气数据时出错:', error);
        }
    };
    
    // 立即获取并发送一次天气数据
    sendWeatherData();
    
    // 设置定时获取并发送天气数据
    const sendWeatherDataInterval = setInterval(sendWeatherData, 300000); // 每5分钟执行一次
    
    // 设置进程退出时清理任务
    process.on('SIGINT', () => {
        if (priceUpdateJob) {
            priceUpdateJob.cancel();
            console.log('电价数据更新任务已取消');
        }
        
        if (weatherUpdateJob) {
            weatherUpdateJob.cancel();
            console.log('天气数据更新任务已取消');
        }
        
        if (sendWeatherDataInterval) {
            clearInterval(sendWeatherDataInterval);
            console.log('天气数据发送任务已取消');
        }
        
        process.exit();
    });
});

// 添加一个新的API端点，专门用于获取湖北省实时电价
app.get('/api/hubei-electricity-price', (req, res) => {
    const currentPrice = hubeiElectricityPrice.getCurrentPrice();
    if (currentPrice) {
        res.json(currentPrice);
    } else {
        res.status(404).json({ error: '当前没有可用的湖北省电价数据' });
    }
});

// API 路由 - 获取武汉实时天气数据
app.get('/api/wuhan-weather', async (req, res) => {
    try {
        // 调用天气服务获取最新数据
        const latestWeather = await wuhanWeatherService.fetchWeatherData();
        res.json(latestWeather);
    } catch (error) {
        console.error('获取武汉天气数据时出错:', error);
        res.status(500).json({ error: '获取武汉天气数据失败' });
    }
}); 