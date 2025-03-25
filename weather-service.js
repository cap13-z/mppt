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
    console.log('启动天气服务...');
    
    // 确保weather_data表已创建
    await resetWeatherTable();
    
    // 立即发送一次天气数据
    await sendWeatherData(io);
    
    // 定时发送天气数据
    weatherConfig.weatherTimer = setInterval(() => {
        sendWeatherData(io);
    }, weatherConfig.interval);
    
    return weatherConfig.weatherTimer;
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
 * 生成并发送天气数据
 * @param {Object} io - Socket.IO实例
 */
async function sendWeatherData(io) {
    try {
        const weatherData = await fetchWeatherData();
        
        // 保存天气数据到数据库
        try {
            await saveWeatherData(weatherData);
        } catch (error) {
            console.error('保存天气数据时出错:', error);
        }
        
        // 通过Socket.IO发送天气数据给客户端
        if (io) {
            io.emit('weather-data', {
                timestamp: new Date().toISOString(),
                weather: weatherData
            });
            console.log('已通过Socket.IO发送天气数据');
        }
    } catch (error) {
        console.error('获取或发送天气数据时出错:', error);
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
            
            // 构建简化的天气数据对象
            const weatherData = {
                city: location.name || '武汉',
                temperature: now.temperature || 'N/A',
                weather: now.text || '未知'
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
            weather: '未知'
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
 * 根据天气状况估算太阳辐射值
 * @param {string} weatherText - 天气描述文本
 * @returns {number} 估算的太阳辐射值
 */
function estimateRadiationFromWeather(weatherText) {
    if (!weatherText) return 0;
    
    const now = new Date();
    const hour = now.getHours();
    
    // 夜间没有太阳辐射
    if (hour < 6 || hour >= 18) {
        return 0;
    }
    
    // 根据天气状况估算辐射值
    let baseRadiation = 800; // 晴天基础辐射值
    
    if (weatherText.includes('暴雨') || weatherText.includes('大雨')) {
        baseRadiation = 100; // 大雨/暴雨辐射极低
    } else if (weatherText.includes('中雨')) {
        baseRadiation = 200; // 中雨辐射很低
    } else if (weatherText.includes('小雨')) {
        baseRadiation = 300; // 小雨辐射低
    } else if (weatherText.includes('阴')) {
        baseRadiation = 400; // 阴天辐射中低
    } else if (weatherText.includes('多云')) {
        baseRadiation = 600; // 多云辐射中等
    }
    
    // 根据时间调整辐射值，中午时分辐射最强
    const timeAdjustment = 1 - Math.abs(hour - 12) / 6; // 12点为1，6点和18点为0
    const radiation = Math.round(baseRadiation * timeAdjustment);
    
    return radiation;
}

/**
 * 生成模拟的天气数据
 * @returns {Object} 模拟的天气数据
 */
function generateSimulatedWeatherData() {
    // 获取当前时间
    const now = new Date();
    const hour = now.getHours();
    const isDaytime = hour >= 6 && hour < 18;
    
    // 随机生成一个介于15-35之间的温度，夜间温度略低
    const baseTemp = isDaytime ? 25 : 18;
    const temperature = (baseTemp + Math.random() * 10).toFixed(1);
    
    // 天气类型数组，白天和夜间的可能天气不同
    const daytimeWeather = ['晴', '多云', '阴', '小雨', '中雨', '大雨', '雷阵雨'];
    const nighttimeWeather = ['晴', '多云', '阴', '小雨', '中雨'];
    const weatherTypes = isDaytime ? daytimeWeather : nighttimeWeather;
    const weatherIndex = Math.floor(Math.random() * weatherTypes.length);
    const weatherText = weatherTypes[weatherIndex];
    
    // 随机生成一个介于30-90之间的湿度，雨天湿度较高
    let humidityBase = 50;
    if (weatherText.includes('雨')) {
        humidityBase = 70;
    }
    const humidity = Math.floor(Math.random() * 30 + humidityBase);
    
    // 风向数组
    const windDirections = ['东风', '南风', '西风', '北风', '东北风', '东南风', '西北风', '西南风'];
    const windDirectionIndex = Math.floor(Math.random() * windDirections.length);
    
    // 风力等级，天气越差风力越大
    let maxWindScale = 3;
    if (weatherText.includes('雨')) {
        maxWindScale = 6;
    }
    const windScale = Math.floor(Math.random() * maxWindScale) + 1;
    
    // 估算太阳辐射值
    const radiation = getEstimatedRadiation(weatherText, now);
    
    return {
        city: '武汉',
        temperature: temperature,
        weather: weatherText,
        humidity: humidity + '%',
        windDirection: windDirections[windDirectionIndex],
        windScale: windScale.toString(),
        radiation: radiation,
        timestamp: new Date().toISOString(),
        isSimulated: true // 标记为模拟数据
    };
}

/**
 * 估算太阳辐射值
 * @param {string} weatherText - 天气描述文本
 * @param {Date} currentTime - 当前时间
 * @returns {number} 估算的太阳辐射值
 */
function getEstimatedRadiation(weatherText, currentTime) {
    const hour = currentTime.getHours();
    
    // 夜间没有太阳辐射
    if (hour < 6 || hour >= 18) {
        return 0;
    }
    
    // 根据天气状况估算辐射值
    let baseRadiation = 800; // 晴天基础辐射值
    
    if (weatherText.includes('暴雨') || weatherText.includes('大雨')) {
        baseRadiation = 100; // 大雨/暴雨辐射极低
    } else if (weatherText.includes('中雨')) {
        baseRadiation = 200; // 中雨辐射很低
    } else if (weatherText.includes('小雨')) {
        baseRadiation = 300; // 小雨辐射低
    } else if (weatherText.includes('阴')) {
        baseRadiation = 400; // 阴天辐射中低
    } else if (weatherText.includes('多云')) {
        baseRadiation = 600; // 多云辐射中等
    }
    
    // 根据时间调整辐射值，中午时分辐射最强
    const timeAdjustment = 1 - Math.abs(hour - 12) / 6; // 12点为1，6点和18点为0
    const radiation = Math.round(baseRadiation * timeAdjustment);
    
    return radiation;
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