/**
 * weather-service.js
 * 从心知天气API获取武汉的实时天气数据
 * 模拟天气数据服务
 */
const mysql = require('mysql2/promise');
const axios = require('axios');
require('dotenv').config();

// 数据库配置
const dbConfig = {
    host: 'localhost',
    user: 'mpptuser',
    password: 'password',
    database: 'energy_system'
};

// 创建数据库连接池
let pool;
try {
    pool = mysql.createPool(dbConfig);
    console.log('天气服务成功连接到数据库');
    
} catch (error) {
    console.error('天气服务连接数据库失败:', error);
}

// 心知天气API配置 - 免费版
const API_KEY = process.env.WEATHER_API_KEY || 'SMN-aLLz_OY40oLYT'; 
const CITY = 'wuhan'; // 武汉
const LANGUAGE = 'zh-Hans'; // 简体中文
const BASE_URL = 'https://api.seniverse.com/v3';
const UNIT = 'c'; // 温度单位（摄氏度）

// 天气服务配置
let weatherConfig = {
    interval: 300000, // 5分钟更新一次
    weatherTimer: null,
    lastSuccessfulApiData: null, // 存储上一次成功的API数据
    lastApiCallTime: 0, // 上一次API调用时间
    apiCallCooldown: 60000 // API调用冷却时间（1分钟）
};

/**
 * 启动天气服务
 * @param {Object} io - Socket.IO实例，用于向客户端推送数据
 */
async function startWeatherService(io) {
    console.log('启动天气服务 - 只使用真实API数据...');
    
    try {
        // 确保weather_data表已创建
        await resetWeatherTable();
        
        // 从API获取真实天气数据
        try {
            const realWeatherData = await fetchWeatherData();
            if (realWeatherData && realWeatherData.weather && realWeatherData.temperature) {
                console.log('成功获取真实天气数据：', realWeatherData.weather, realWeatherData.temperature);
                sendWeatherData(io, realWeatherData);
                
                // 多发送几次确保前端接收到
                for (let i = 0; i < 3; i++) {
                    setTimeout(() => {
                        sendWeatherData(io, realWeatherData);
                    }, i * 500);
                }
            } else {
                throw new Error('API返回的天气数据不完整');
            }
        } catch (apiError) {
            console.error('无法获取真实天气数据:', apiError.message);
            console.log('系统将持续尝试获取真实天气数据，不使用模拟数据');
        }
        
        // 定时发送天气数据
        weatherConfig.interval = 60000; // 1分钟更新一次
        weatherConfig.weatherTimer = setInterval(async () => {
            try {
                // 获取真实天气数据
                const realWeatherData = await fetchWeatherData();
                if (realWeatherData && realWeatherData.weather && realWeatherData.temperature) {
                    console.log('定时更新：使用真实天气数据');
                    sendWeatherData(io, realWeatherData);
                } else {
                    throw new Error('定时更新：API返回的天气数据不完整');
                }
            } catch (error) {
                console.error('定时更新：获取真实天气数据失败，将在下次尝试');
            }
        }, weatherConfig.interval);
        
        return weatherConfig.weatherTimer;
    } catch (error) {
        console.error('启动天气服务时出错:', error);
        return null;
    }
}

/**
 * 重置weather_data表
 */
async function resetWeatherTable() {
    if (!pool) return;
    
    try {
        console.log('重置weather_data表...');
        await pool.query('DROP TABLE IF EXISTS weather_data');
        console.log('weather_data表已删除');
        
        // 创建新表，添加condition字段，用反引号避免关键字冲突
        await pool.query(`
            CREATE TABLE weather_data (
                id INT AUTO_INCREMENT PRIMARY KEY,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                city VARCHAR(50),
                weather VARCHAR(50),
                \`condition\` VARCHAR(50),
                temperature VARCHAR(10),
                status VARCHAR(50) DEFAULT '正常'
            )
        `);
        console.log('weather_data表已重建，包含condition字段');
        return true;
    } catch (error) {
        console.error('重置weather_data表时出错:', error);
        return false;
    }
}

/**
 * 发送天气数据给客户端
 * @param {Object} io - Socket.IO实例
 * @param {Object} weatherData - 天气数据
 */
function sendWeatherData(io, weatherData) {
    if (!weatherData || !weatherData.weather) {
        console.log('没有有效的天气数据可发送，跳过此次发送');
        return false;
    }
    
    try {
        console.log('发送真实天气数据:', weatherData.weather, weatherData.temperature + '°C');
        
        // 天气图标映射
        const weatherIconMap = {
            '晴': 'sun',
            '晴朗': 'sun',
            '多云': 'cloud-sun',
            '阴': 'cloud',
            '小雨': 'cloud-rain',
            '雨': 'cloud-rain',
            '中雨': 'cloud-showers-heavy',
            '大雨': 'cloud-showers-heavy',
            '雷阵雨': 'bolt',
            '阵雨': 'cloud-sun-rain',
            '雪': 'snowflake',
            '雾': 'smog'
        };
        
        // 获取天气图标
        const weatherIcon = weatherIconMap[weatherData.weather] || 'cloud';
        
        // 构建前端需要的数据格式
        const data = {
            temperature: weatherData.temperature,
            condition: weatherData.weather,
            icon: weatherIcon,
            city: weatherData.city || '武汉',
            timestamp: new Date().toISOString(),
            source: weatherData.source || '心知天气API'
        };
        
        // 标记为真实API数据
        data.isReal = true;
        data.priority = 'high';
        
        // 保存到全局变量，供其他模块使用
        global.lastApiWeatherData = {
            temperature: weatherData.temperature,
            weather: weatherData.weather,
            weather_condition: weatherData.weather,
            condition: weatherData.weather,
            timestamp: data.timestamp,
            source: weatherData.source || '心知天气API',
            isReal: true,
            priority: 'high'
        };
        
        console.log('已将API天气数据保存到全局变量:', global.lastApiWeatherData);
        
        // 通过Socket.IO发送天气数据
        if (io) {
            // 发送weather-data事件
            io.emit('weather-data', {
                weather: data,
                timestamp: data.timestamp
            });
            
            // 同时发送符合前端期望格式的数据
            io.emit('weather-update', data);
            
            // 也通过device-data事件发送，确保优先级高于其他数据
            io.emit('device-data', {
                weather: {
                    temperature: weatherData.temperature,
                    weather_condition: weatherData.weather,
                    condition: weatherData.weather,
                    humidity: weatherData.humidity || '65%',
                    timestamp: data.timestamp,
                    source: weatherData.source || '心知天气API',
                    isReal: true,
                    priority: 'high'
                },
                timestamp: data.timestamp,
                priority: 'high'
            });
            
            // 发送data-update事件，确保兼容性
            io.emit('data-update', {
                weather: {
                    temperature: weatherData.temperature,
                    condition: weatherData.weather,
                    timestamp: data.timestamp,
                    source: weatherData.source || '心知天气API',
                    isReal: true
                },
                timestamp: data.timestamp
            });
            
            console.log('天气数据发送完成');
            
            // 保存到数据库
            saveWeatherData(weatherData).catch(err => {
                console.error('保存天气数据到数据库时出错:', err);
            });
            
            return true;
        }
    } catch (error) {
        console.error('发送天气数据给客户端时出错:', error);
        return false;
    }
}

/**
 * 从心知天气API获取武汉的当前天气
 * @returns {Promise<Object>} 天气数据对象
 */
async function fetchWeatherData() {
    const now = Date.now();
    
    // 检查冷却时间，避免频繁调用API超出免费限额
    if (weatherConfig.lastSuccessfulApiData && 
        (now - weatherConfig.lastApiCallTime < weatherConfig.apiCallCooldown)) {
        console.log('API冷却时间内，使用缓存数据');
        return weatherConfig.lastSuccessfulApiData;
    }
    
    weatherConfig.lastApiCallTime = now;
    
    try {
        console.log('尝试从心知天气API获取数据...');
        
        // 构建API请求URL - 免费版API
        const url = `${BASE_URL}/weather/now.json?key=${API_KEY}&location=${CITY}&language=${LANGUAGE}&unit=${UNIT}`;
        console.log('API请求URL:', url);
        
        const response = await axios.get(url);
        
        // 检查API返回是否有效
        if (response.data && response.data.results && response.data.results[0]) {
            console.log('API返回数据:', JSON.stringify(response.data));
            
            // 从API响应中提取基本数据 - 免费版只有城市、天气状况和温度
            const result = response.data.results[0];
            const now = result.now || {};
            const location = result.location || {};
            const lastUpdate = result.last_update || new Date().toISOString();
            
            // 构建标准的天气数据对象，确保包含所有需要的字段
            const weatherData = {
                city: location.name || '武汉',
                temperature: now.temperature || 'N/A',
                weather: now.text || '未知',
                weather_condition: now.text || '未知', // 兼容两种字段名
                condition: now.text || '未知', // 三种字段名都提供以确保兼容性
                humidity: '65%', // 免费版API没有湿度，使用默认值
                timestamp: lastUpdate,
                source: '心知天气API', // 标记数据来源
                isReal: true // 标记为真实数据
            };
            
            console.log('解析出的天气数据:', weatherData);
            
            // 缓存成功获取的数据
            weatherConfig.lastSuccessfulApiData = weatherData;
            return weatherData;
        } else {
            throw new Error('API返回数据结构不符合预期');
        }
    } catch (error) {
        console.error('获取天气API数据失败:', error.message);
        if (error.response) {
            console.error('错误状态码:', error.response.status);
            console.error('错误响应数据:', JSON.stringify(error.response.data));
        }
        
        // 如果有缓存数据，返回缓存数据
        if (weatherConfig.lastSuccessfulApiData) {
            console.log('使用缓存的天气数据');
            return weatherConfig.lastSuccessfulApiData;
        }
        
        // 如果无法获取数据且没有缓存，返回默认数据
        return {
            city: '武汉',
            temperature: 'N/A',
            weather: '未知',
            weather_condition: '未知',
            condition: '未知',
            timestamp: new Date().toISOString(),
            source: '默认数据'
        };
    }
}

/**
 * 保存天气数据到数据库
 * @param {Object} weatherData - 天气数据
 */
async function saveWeatherData(weatherData) {
    if (!pool) return;
    
    try {
        // 包含status字段的插入语句
        const query = `
            INSERT INTO weather_data (city, weather, temperature, status)
            VALUES (?, ?, ?, ?)
        `;
        
        await pool.query(query, [
            weatherData.city,
            weatherData.weather,
            weatherData.temperature,
            '正常' // 默认状态值
        ]);
        
        console.log('天气数据已保存到数据库');
    } catch (error) {
        console.error('保存数据到数据库时出错:', error);
        throw error; // 向上层抛出错误以便处理
    }
}

/**
 * 停止天气服务
 */
function stopWeatherService() {
    if (weatherConfig.weatherTimer) {
        clearInterval(weatherConfig.weatherTimer);
        weatherConfig.weatherTimer = null;
        console.log('天气服务已停止');
    }
}

/**
 * 获取最后一次成功获取的天气数据
 * @returns {Object|null} 最后一次成功获取的天气数据，如果没有则返回null
 */
function getLastWeatherData() {
    return weatherConfig.lastSuccessfulApiData;
}

// 导出函数
module.exports = {
    startWeatherService,
    stopWeatherService,
    fetchWeatherData,
    getLastWeatherData
}; 