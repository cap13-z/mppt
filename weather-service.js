/**
 * weather-service.js
 * 从心知天气API获取武汉的实时天气数据
 */
const axios = require('axios');
const schedule = require('node-schedule');
const mysql = require('mysql2/promise');

// 数据库配置
const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: 'password',
    database: 'energy_dashboard'
};

// 心知天气API配置
const API_KEY = 'SMN-aLLz_OY40oLYT'; // 使用私钥作为API密钥
const CITY = 'wuhan'; // 武汉
const LANGUAGE = 'zh-Hans'; // 简体中文
const BASE_URL = 'https://api.seniverse.com/v3';

// 创建数据库连接池
let pool;
try {
    pool = mysql.createPool(dbConfig);
    console.log('天气服务成功连接到数据库');
} catch (error) {
    console.error('天气服务连接数据库失败:', error);
}

/**
 * 从心知天气API获取武汉的当前天气
 * @returns {Promise<Object>} 天气数据对象
 */
async function fetchWeatherData() {
    try {
        // 构建API请求URL，包含公钥和私钥
        const url = `${BASE_URL}/weather/now.json?key=${API_KEY}&location=${CITY}&language=${LANGUAGE}&unit=c`;
        
        console.log('正在请求天气数据...');
        const response = await axios.get(url);
        
        if (response.data && response.data.results && response.data.results.length > 0) {
            const weatherData = response.data.results[0];
            const now = weatherData.now;
            
            // 获取当前时间
            const currentTime = new Date();
            const hour = currentTime.getHours();
            const isDaytime = hour >= 6 && hour < 18;
            
            // 根据温度和天气状况智能填充缺失数据
            const weatherText = now.text || '晴';
            
            // 1. 处理湿度数据 - 如果API没有提供，根据天气状况模拟
            let humidity = now.humidity ? now.humidity : null;
            if (!humidity) {
                // 根据天气状况估算湿度
                if (weatherText.includes('雨')) {
                    humidity = Math.floor(70 + Math.random() * 20); // 雨天湿度高 70-90%
                } else if (weatherText.includes('雪')) {
                    humidity = Math.floor(65 + Math.random() * 25); // 雪天湿度中高 65-90%
                } else if (weatherText.includes('雾') || weatherText.includes('霾')) {
                    humidity = Math.floor(75 + Math.random() * 15); // 雾霾天湿度很高 75-90%
                } else if (weatherText.includes('阴')) {
                    humidity = Math.floor(60 + Math.random() * 20); // 阴天湿度中等 60-80%
                } else if (weatherText.includes('多云')) {
                    humidity = Math.floor(50 + Math.random() * 20); // 多云湿度适中 50-70%
                } else {
                    // 晴天，根据季节和时间估计
                    const month = currentTime.getMonth() + 1; // 月份从0开始
                    if (month >= 6 && month <= 8) { // 夏季
                        humidity = Math.floor(40 + Math.random() * 30); // 夏季晴天湿度 40-70%
                    } else if (month >= 12 || month <= 2) { // 冬季
                        humidity = Math.floor(30 + Math.random() * 20); // 冬季晴天湿度较低 30-50%
                    } else { // 春秋
                        humidity = Math.floor(35 + Math.random() * 25); // 春秋晴天湿度适中 35-60%
                    }
                }
            }
            
            // 2. 处理风向数据 - 如果API没有提供，根据季节和天气状况模拟
            let windDirection = now.wind_direction;
            if (!windDirection || windDirection === '未知') {
                const month = currentTime.getMonth() + 1;
                const windDirections = ['东风', '南风', '西风', '北风', '东北风', '东南风', '西北风', '西南风'];
                
                // 根据季节调整风向概率
                let directionIndex;
                if (month >= 12 || month <= 2) { // 冬季，北风概率高
                    const winterDirections = ['北风', '东北风', '西北风', '东风', '西风'];
                    directionIndex = Math.floor(Math.random() * winterDirections.length);
                    windDirection = winterDirections[directionIndex];
                } else if (month >= 3 && month <= 5) { // 春季，东南风概率高
                    const springDirections = ['东风', '东南风', '南风', '北风', '东北风'];
                    directionIndex = Math.floor(Math.random() * springDirections.length);
                    windDirection = springDirections[directionIndex];
                } else if (month >= 6 && month <= 8) { // 夏季，南风概率高
                    const summerDirections = ['南风', '东南风', '西南风', '东风'];
                    directionIndex = Math.floor(Math.random() * summerDirections.length);
                    windDirection = summerDirections[directionIndex];
                } else { // 秋季，西北风概率高
                    const autumnDirections = ['西北风', '北风', '西风', '东北风'];
                    directionIndex = Math.floor(Math.random() * autumnDirections.length);
                    windDirection = autumnDirections[directionIndex];
                }
            }
            
            // 3. 处理风力等级 - 如果API没有提供，根据天气状况模拟
            let windScale = now.wind_scale;
            if (!windScale || windScale === '未知') {
                if (weatherText.includes('台风') || weatherText.includes('飓风')) {
                    windScale = (10 + Math.floor(Math.random() * 3)).toString(); // 10-12级
                } else if (weatherText.includes('暴雨') || weatherText.includes('大雨')) {
                    windScale = (4 + Math.floor(Math.random() * 4)).toString(); // 4-7级
                } else if (weatherText.includes('雨')) {
                    windScale = (2 + Math.floor(Math.random() * 3)).toString(); // 2-4级
                } else if (weatherText.includes('阴')) {
                    windScale = (1 + Math.floor(Math.random() * 3)).toString(); // 1-3级
                } else {
                    windScale = (Math.floor(Math.random() * 3) + 1).toString(); // 1-3级
                }
            }
            
            // 估算太阳辐射值
            const radiation = getEstimatedRadiation(weatherText, currentTime);
            
            // 格式化天气数据
            const formattedData = {
                city: weatherData.location.name,
                temperature: now.temperature, // 摄氏度
                weather: weatherText,
                humidity: humidity ? humidity + '%' : '未知', // 湿度
                windDirection: windDirection || '未知',
                windScale: windScale || '未知',
                radiation: radiation,
                timestamp: new Date().toISOString(),
                isSimulated: false, // 基础数据来自API，但有部分数据是模拟的
                partiallySimulated: (!now.humidity || !now.wind_direction || !now.wind_scale) // 标记是否部分数据为模拟
            };
            
            console.log('成功获取武汉天气数据:', formattedData);
            
            // 保存到数据库
            await saveWeatherToDatabase(formattedData);
            
            return formattedData;
        } else {
            throw new Error('API返回的数据格式不正确');
        }
    } catch (error) {
        console.error('获取天气数据失败:', error.message || error);
        // 如果API请求失败，返回模拟数据
        return generateSimulatedWeatherData();
    }
}

/**
 * 生成模拟的天气数据（当API请求失败时使用）
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
 * 将天气数据保存到数据库
 * @param {Object} data 天气数据
 */
async function saveWeatherToDatabase(data) {
    try {
        if (!pool) {
            console.error('数据库连接池未初始化');
            return;
        }
        
        const query = `
            INSERT INTO weather_data (city, temperature, weather, humidity, wind_direction, wind_scale, timestamp)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
        
        await pool.query(query, [
            data.city,
            data.temperature,
            data.weather,
            data.humidity,
            data.windDirection,
            data.windScale,
            new Date(data.timestamp)
        ]);
        
        console.log('天气数据已保存到数据库');
    } catch (error) {
        console.error('保存天气数据到数据库失败:', error);
    }
}

/**
 * 启动定时任务，每小时获取一次天气数据
 * @returns {Object} 定时任务对象
 */
function startWeatherUpdateJob() {
    console.log('启动天气数据定时更新任务 - 每小时更新一次');
    
    // 立即获取一次天气数据
    fetchWeatherData().catch(err => console.error('初始化天气数据获取失败:', err));
    
    // 设置定时任务，每小时执行一次（在每小时的第0分钟）
    const job = schedule.scheduleJob('0 * * * *', async function() {
        console.log('执行定时天气数据更新...');
        try {
            await fetchWeatherData();
        } catch (err) {
            console.error('定时获取天气数据失败:', err);
        }
    });
    
    return job;
}

/**
 * 根据天气状况和当前时间估算太阳辐射值
 * @param {string} weatherText 天气状况文本
 * @param {Date} currentTime 当前时间
 * @returns {number} 估算的太阳辐射值 (W/m²)
 */
function getEstimatedRadiation(weatherText, currentTime) {
    // 检查是否是夜间
    const hour = currentTime.getHours();
    const isNighttime = hour < 6 || hour >= 18;
    
    if (isNighttime) {
        return 0; // 夜间无太阳辐射
    }
    
    // 根据天气状况估计辐射值
    if (weatherText.includes('晴')) {
        return 800 + Math.random() * 200; // 晴天 800-1000 W/m²
    } else if (weatherText.includes('多云')) {
        return 500 + Math.random() * 300; // 多云 500-800 W/m²
    } else if (weatherText.includes('阴')) {
        return 200 + Math.random() * 300; // 阴天 200-500 W/m²
    } else if (weatherText.includes('雨') || weatherText.includes('雪')) {
        return 100 + Math.random() * 100; // 雨雪天 100-200 W/m²
    } else {
        return 500 + Math.random() * 300; // 默认中等辐射值
    }
}

module.exports = {
    fetchWeatherData,
    startWeatherUpdateJob,
    generateSimulatedWeatherData
}; 