// 湖北省电价数据获取模块
const axios = require('axios');
const cheerio = require('cheerio');
const mysql = require('mysql2/promise');
const schedule = require('node-schedule');

// 数据库配置
const dbConfig = {
    host: 'localhost',
    user: 'mpptuser',
    password: 'password',
    database: 'energy_system'
};

// 当前电价数据缓存
let currentPriceData = {
    price: 0.55, // 默认值，单位：元/kWh
    price_level: '平值', // 默认为平值
    next_change_time: new Date(Date.now() + 3600000), // 默认1小时后变动
    timestamp: new Date(),
    source: '默认值' // 数据来源
};

// 湖北省电价类型和时段定义
const priceSchedule = {
    peak: { // 峰时段
        hours: [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21],
        price: 0.82, // 峰时电价 (元/kWh)
        level: '峰值'
    },
    valley: { // 谷时段
        hours: [0, 1, 2, 3, 4, 5, 6, 7, 22, 23],
        price: 0.32, // 谷时电价 (元/kWh)
        level: '谷值'
    },
    normal: { // 平时段
        hours: [], // 如果不是峰时也不是谷时，则为平时
        price: 0.55, // 平时电价 (元/kWh)
        level: '平值'
    }
};

/**
 * 根据当前时间确定电价水平
 * @returns {Object} 包含价格和级别的对象
 */
function determinePriceByTime() {
    const now = new Date();
    const hour = now.getHours();
    
    // 判断当前时段
    if (priceSchedule.peak.hours.includes(hour)) {
        return {
            price: priceSchedule.peak.price,
            level: priceSchedule.peak.level
        };
    } else if (priceSchedule.valley.hours.includes(hour)) {
        return {
            price: priceSchedule.valley.price,
            level: priceSchedule.valley.level
        };
    } else {
        return {
            price: priceSchedule.normal.price,
            level: priceSchedule.normal.level
        };
    }
}

/**
 * 计算下一个电价变动时间
 * @returns {Date} 下一个变动时间
 */
function calculateNextChangeTime() {
    const now = new Date();
    const hour = now.getHours();
    const nextHour = new Date(now);
    
    // 找到所有可能的变动时间点
    const allChangeHours = [...priceSchedule.peak.hours, ...priceSchedule.valley.hours].sort((a, b) => a - b);
    
    // 找到下一个变动时间
    let nextChangeHour = null;
    for (const changeHour of allChangeHours) {
        if (changeHour > hour) {
            nextChangeHour = changeHour;
            break;
        }
    }
    
    // 如果没有找到今天的下一个变动时间，则取明天的第一个变动时间
    if (nextChangeHour === null) {
        nextChangeHour = allChangeHours[0];
        nextHour.setDate(nextHour.getDate() + 1);
    }
    
    nextHour.setHours(nextChangeHour, 0, 0, 0);
    return nextHour;
}

/**
 * 尝试从国家电网网站获取湖北省电价
 * 注意：这是一个示例函数，可能需要根据实际API调整
 * @returns {Promise<Object>} 电价数据对象
 */
async function fetchHubeiPriceFromWeb() {
    try {
        // 这里应该是实际的API请求
        // 由于国家电网没有公开API，这里模拟一个请求
        // const response = await axios.get('https://www.example.com/hubei-electricity-price');
        
        // 使用本地时间计算的电价作为备用
        const priceDeterminedByTime = determinePriceByTime();
        const nextChangeTime = calculateNextChangeTime();
        
        return {
            price: priceDeterminedByTime.price,
            price_level: priceDeterminedByTime.level,
            next_change_time: nextChangeTime,
            timestamp: new Date(),
            source: '基于时间计算'
        };
    } catch (error) {
        console.error('获取湖北电价数据失败:', error);
        // 出错时返回当前缓存的数据
        return currentPriceData;
    }
}

/**
 * 将电价数据保存到数据库
 * @param {Object} priceData 电价数据对象
 */
async function savePriceToDatabase(priceData) {
    try {
        const pool = mysql.createPool(dbConfig);
        const connection = await pool.getConnection();
        
        const query = `
            INSERT INTO electricity_price 
            (price, price_level, next_change_time, timestamp) 
            VALUES (?, ?, ?, ?)
        `;
        
        await connection.execute(query, [
            priceData.price,
            priceData.price_level,
            priceData.next_change_time,
            priceData.timestamp
        ]);
        
        connection.release();
        console.log('电价数据已保存到数据库');
    } catch (error) {
        console.error('保存电价数据失败:', error);
    }
}

/**
 * 更新电价数据
 */
async function updateElectricityPrice() {
    try {
        // 获取最新电价数据
        const newPriceData = await fetchHubeiPriceFromWeb();
        
        // 如果数据发生变化，更新缓存并保存到数据库
        if (
            newPriceData.price !== currentPriceData.price || 
            newPriceData.price_level !== currentPriceData.price_level
        ) {
            console.log('电价数据已更新:', newPriceData);
            currentPriceData = newPriceData;
            
            // 保存到数据库
            await savePriceToDatabase(newPriceData);
        }
        
        return newPriceData;
    } catch (error) {
        console.error('更新电价数据失败:', error);
        return currentPriceData;
    }
}

/**
 * 获取当前电价数据
 * @returns {Object} 当前电价数据
 */
function getCurrentPrice() {
    return currentPriceData;
}

/**
 * 启动电价数据定时更新任务
 */
function startPriceUpdateJob() {
    // 初始化立即更新一次
    updateElectricityPrice().then(data => {
        console.log('初始电价数据:', data);
    });
    
    // 设置定时任务，每小时更新一次
    const job = schedule.scheduleJob('0 0 * * * *', async function() {
        console.log('执行定时电价数据更新...');
        await updateElectricityPrice();
    });
    
    console.log('电价数据更新任务已启动');
    return job;
}

// 导出模块
module.exports = {
    getCurrentPrice,
    updateElectricityPrice,
    startPriceUpdateJob
}; 