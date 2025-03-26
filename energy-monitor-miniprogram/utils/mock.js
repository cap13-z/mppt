/**
 * 模拟数据生成工具
 * 用于在开发阶段提供模拟数据
 */

/**
 * 生成指定范围内的随机整数
 * @param {number} min - 最小值
 * @param {number} max - 最大值
 * @returns {number} - 生成的随机整数
 */
function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * 生成指定天数前到现在的随机日期
 * @param {number} daysAgo - 天数
 * @returns {Date} - 随机日期
 */
function getRandomDate(daysAgo = 7) {
  const now = new Date();
  const past = new Date(now);
  past.setDate(past.getDate() - daysAgo);
  
  const randomTime = past.getTime() + Math.random() * (now.getTime() - past.getTime());
  return new Date(randomTime);
}

/**
 * 生成指定日期区间内的随机日期
 * @param {string} startDate - 开始日期字符串 (YYYY-MM-DD)
 * @param {string} endDate - 结束日期字符串 (YYYY-MM-DD)
 * @returns {Date} - 随机日期
 */
function getRandomDateInRange(startDate, endDate) {
  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);
  
  const end = new Date(endDate);
  end.setHours(23, 59, 59, 999);
  
  const randomTime = start.getTime() + Math.random() * (end.getTime() - start.getTime());
  return new Date(randomTime);
}

/**
 * 格式化日期为 YYYY-MM-DD 格式
 * @param {Date} date - 日期对象
 * @returns {string} - 格式化后的日期字符串
 */
function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * 生成模拟的天气数据
 * @returns {Object} - 天气数据对象
 */
function getWeatherMockData() {
  const weatherTypes = ['晴', '多云', '阴', '小雨', '中雨', '大雨', '雷阵雨', '雾', '雪'];
  const icons = ['sunny', 'cloudy', 'overcast', 'light_rain', 'moderate_rain', 'heavy_rain', 'thunder', 'fog', 'snow'];
  
  const index = getRandomInt(0, weatherTypes.length - 1);
  const temperature = getRandomInt(10, 35);
  const humidity = getRandomInt(30, 90);
  
  return {
    temperature: temperature,
    humidity: humidity + '%',
    condition: weatherTypes[index],
    weather: weatherTypes[index],
    icon: '../../images/weather/' + icons[index] + '.png',
    updateTime: new Date().toISOString()
  };
}

/**
 * 生成模拟的电池数据
 * @returns {Object} - 电池数据对象
 */
function getBatteryMockData() {
  const capacity = getRandomInt(20, 100);
  const voltage = (12 + Math.random() * 2).toFixed(1);
  const current = (capacity > 90) ? 0.2 : (0.5 + Math.random() * 1.5).toFixed(1);
  
  let status;
  if (capacity > 95) {
    status = '满电状态';
  } else if (current > 1) {
    status = '充电中';
  } else {
    status = '放电中';
  }
  
  return {
    capacity: capacity,
    voltage: parseFloat(voltage),
    temperature: getRandomInt(20, 40),
    current: parseFloat(current),
    status: status,
    updateTime: new Date().toISOString()
  };
}

/**
 * 生成模拟的太阳能数据
 * @returns {Object} - 太阳能数据对象
 */
function getSolarMockData() {
  const voltage = (14 + Math.random() * 8).toFixed(1);
  const current = (0.2 + Math.random() * 1.8).toFixed(1);
  const power = (parseFloat(voltage) * parseFloat(current)).toFixed(1);
  
  return {
    voltage: parseFloat(voltage),
    current: parseFloat(current),
    power: parseFloat(power),
    efficiency: getRandomInt(70, 95),
    temperature: getRandomInt(30, 60),
    updateTime: new Date().toISOString()
  };
}

/**
 * 生成模拟的系统状态数据
 * @returns {Object} - 系统状态数据对象
 */
function getSystemMockData() {
  const powerSources = ['太阳能', '电网', '电池'];
  const modes = ['高效模式', 'MPPT模式', '标准模式', '省电模式'];
  
  return {
    source: powerSources[getRandomInt(0, 2)],
    loadPower: getRandomInt(5, 30),
    mode: modes[getRandomInt(0, 3)],
    online: true,
    updateTime: new Date().toISOString()
  };
}

/**
 * 生成模拟的电价数据
 * @returns {Object} - 电价数据对象
 */
function getPriceMockData() {
  const levels = ['低谷', '平值', '高峰'];
  const prices = [0.3, 0.5, 0.8];
  const index = getRandomInt(0, 2);
  
  return {
    price: prices[index],
    level: levels[index],
    nextChange: new Date(Date.now() + 3600000).toISOString(),
    updateTime: new Date().toISOString()
  };
}

/**
 * 生成模拟的实时数据
 * @returns {Object} - 实时数据对象
 */
function getRealtimeMockData() {
  return {
    battery: getBatteryMockData(),
    solar: getSolarMockData(),
    system: getSystemMockData(),
    weather: getWeatherMockData(),
    price: getPriceMockData(),
    updateTime: new Date().toISOString()
  };
}

/**
 * 生成指定数量的历史数据
 * @param {string} type - 数据类型 (battery, solar, weather, price, system)
 * @param {string} startDate - 开始日期 (YYYY-MM-DD)
 * @param {string} endDate - 结束日期 (YYYY-MM-DD)
 * @param {number} count - 数据条数
 * @returns {Array} - 历史数据数组
 */
function getHistoryMockData(type, startDate, endDate, count = 20) {
  // 如果未提供日期范围，使用过去7天
  if (!startDate || !endDate) {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 7);
    
    startDate = formatDate(start);
    endDate = formatDate(end);
  }
  
  // 生成历史数据
  const result = [];
  for (let i = 0; i < count; i++) {
    const timestamp = getRandomDateInRange(startDate, endDate);
    
    let data = {
      timestamp: timestamp.toISOString(),
      id: i + 1
    };
    
    switch (type) {
      case 'battery':
        const batteryCapacity = getRandomInt(20, 100);
        const batteryVoltage = (12 + Math.random() * 2).toFixed(1);
        const batteryCurrent = (batteryCapacity > 90) ? 0.2 : (0.5 + Math.random() * 1.5).toFixed(1);
        
        let status;
        if (batteryCapacity > 95) {
          status = '满电状态';
        } else if (batteryCurrent > 1) {
          status = '充电中';
        } else {
          status = '放电中';
        }
        
        data = {
          ...data,
          capacity: batteryCapacity,
          voltage: parseFloat(batteryVoltage),
          temperature: getRandomInt(20, 40),
          current: parseFloat(batteryCurrent),
          status: status
        };
        break;
        
      case 'solar':
        const solarVoltage = (14 + Math.random() * 8).toFixed(1);
        const solarCurrent = (0.2 + Math.random() * 1.8).toFixed(1);
        const solarPower = (parseFloat(solarVoltage) * parseFloat(solarCurrent)).toFixed(1);
        
        data = {
          ...data,
          voltage: parseFloat(solarVoltage),
          current: parseFloat(solarCurrent),
          power: parseFloat(solarPower),
          efficiency: getRandomInt(70, 95)
        };
        break;
        
      case 'weather':
        const weatherTypes = ['晴', '多云', '阴', '小雨', '中雨', '大雨', '雷阵雨', '雾', '雪'];
        const index = getRandomInt(0, weatherTypes.length - 1);
        
        data = {
          ...data,
          temperature: getRandomInt(10, 35),
          humidity: getRandomInt(30, 90) + '%',
          condition: weatherTypes[index],
          weather: weatherTypes[index]
        };
        break;
        
      case 'price':
        const levels = ['低谷', '平值', '高峰'];
        const prices = [0.3, 0.5, 0.8];
        const priceIndex = getRandomInt(0, 2);
        
        data = {
          ...data,
          price: prices[priceIndex],
          level: levels[priceIndex]
        };
        break;
        
      case 'system':
        const powerSources = ['太阳能', '电网', '电池'];
        
        data = {
          ...data,
          source: powerSources[getRandomInt(0, 2)],
          loadPower: getRandomInt(5, 30)
        };
        break;
    }
    
    result.push(data);
  }
  
  // 按时间排序
  return result.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
}

/**
 * 生成模拟的设备信息
 * @returns {Object} - 设备信息对象
 */
function getDeviceMockData() {
  return {
    deviceId: 'EM' + getRandomInt(10000, 99999),
    model: 'EM-2000Plus',
    firmwareVersion: '1.3.5',
    status: 'online',
    lastUpdate: new Date().toISOString(),
    ipAddress: '192.168.1.' + getRandomInt(2, 254),
    macAddress: 'AA:BB:CC:' + getRandomInt(10, 99) + ':' + getRandomInt(10, 99) + ':' + getRandomInt(10, 99)
  };
}

/**
 * 生成模拟的趋势数据
 * @param {string} type - 数据类型 (energy, solar, battery)
 * @param {string} period - 周期 (day, week, month)
 * @returns {Array} - 趋势数据数组
 */
function getTrendMockData(type, period) {
  let count;
  let step;
  
  switch (period) {
    case 'day':
      count = 24;
      step = 60 * 60 * 1000; // 1小时
      break;
    case 'week':
      count = 7;
      step = 24 * 60 * 60 * 1000; // 1天
      break;
    case 'month':
      count = 30;
      step = 24 * 60 * 60 * 1000; // 1天
      break;
    default:
      count = 24;
      step = 60 * 60 * 1000; // 1小时
  }
  
  const result = [];
  const now = new Date();
  
  for (let i = count - 1; i >= 0; i--) {
    const timestamp = new Date(now.getTime() - i * step);
    let value;
    
    switch (type) {
      case 'energy':
        value = getRandomInt(10, 50);
        break;
      case 'solar':
        // 白天产生更多太阳能
        const hour = timestamp.getHours();
        if (hour >= 6 && hour <= 18) {
          value = getRandomInt(30, 100);
        } else {
          value = getRandomInt(0, 10);
        }
        break;
      case 'battery':
        value = getRandomInt(20, 100);
        break;
      default:
        value = getRandomInt(10, 100);
    }
    
    result.push({
      timestamp: timestamp.toISOString(),
      value: value,
      label: formatTimeLabel(timestamp, period)
    });
  }
  
  return result;
}

/**
 * 根据周期格式化时间标签
 * @param {Date} date - 日期对象
 * @param {string} period - 周期 (day, week, month)
 * @returns {string} - 格式化后的时间标签
 */
function formatTimeLabel(date, period) {
  switch (period) {
    case 'day':
      return date.getHours() + ':00';
    case 'week':
      const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
      return weekdays[date.getDay()];
    case 'month':
      return (date.getMonth() + 1) + '/' + date.getDate();
    default:
      return date.getHours() + ':00';
  }
}

// 导出方法
module.exports = {
  getRandomInt,
  getRandomDate,
  getWeatherMockData,
  getBatteryMockData,
  getSolarMockData,
  getSystemMockData,
  getPriceMockData,
  getRealtimeMockData,
  getHistoryMockData,
  getDeviceMockData,
  getTrendMockData
}; 