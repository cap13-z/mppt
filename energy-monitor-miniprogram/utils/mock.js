/**
 * 模拟数据工具
 * 用于开发和测试阶段，提供模拟的能源系统数据
 */

/**
 * 生成随机整数
 * @param {number} min - 最小值
 * @param {number} max - 最大值
 * @returns {number} - 随机整数
 */
const randomInt = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

/**
 * 生成随机浮点数
 * @param {number} min - 最小值
 * @param {number} max - 最大值
 * @param {number} decimals - 小数位数
 * @returns {number} - 随机浮点数
 */
const randomFloat = (min, max, decimals = 2) => {
  const factor = Math.pow(10, decimals);
  return Math.round((Math.random() * (max - min) + min) * factor) / factor;
};

/**
 * 生成随机日期
 * @param {number} daysBack - 向前天数
 * @returns {Date} - 随机日期
 */
const randomDate = (daysBack = 30) => {
  const today = new Date();
  const backDate = new Date();
  backDate.setDate(today.getDate() - daysBack);
  
  return new Date(backDate.getTime() + Math.random() * (today.getTime() - backDate.getTime()));
};

/**
 * 从数组中随机选择一个元素
 * @param {Array} array - 数组
 * @returns {*} - 随机元素
 */
const randomChoice = (array) => {
  return array[Math.floor(Math.random() * array.length)];
};

/**
 * 生成首页需要的模拟数据
 * @returns {Object} - 首页模拟数据
 */
const getHomePageData = () => {
  // 随机电池容量
  const batteryCapacity = randomInt(10, 95);
  
  // 根据电池容量确定电池状态
  let batteryStatus = '未知';
  if (batteryCapacity >= 90) {
    batteryStatus = '满电';
  } else if (batteryCapacity >= 50) {
    batteryStatus = '正常';
  } else if (batteryCapacity >= 20) {
    batteryStatus = '充电中';
  } else {
    batteryStatus = '电量低';
  }
  
  // 生成随机的电网连接状态
  const gridConnected = Math.random() > 0.1; // 90%概率连接
  
  // 获取当前时间
  const now = new Date();
  const hour = now.getHours();
  
  // 根据时间生成合理的太阳能发电量
  let solarPower = 0;
  if (hour >= 6 && hour < 19) { // 白天有太阳能发电
    // 日出和日落时发电量较小，中午发电量较大
    const timeOfDay = hour < 12 ? (hour - 6) / 6 : (18 - hour) / 6;
    solarPower = randomFloat(0.5, 5) * timeOfDay;
  }
  
  // 生成随机天气类型
  const weatherTypes = ['晴', '多云', '阴', '小雨', '雷阵雨'];
  const weatherTypeWeights = [0.4, 0.3, 0.2, 0.08, 0.02]; // 权重
  
  // 根据权重选择天气类型
  let weatherType = '';
  const randomValue = Math.random();
  let cumulativeWeight = 0;
  
  for (let i = 0; i < weatherTypes.length; i++) {
    cumulativeWeight += weatherTypeWeights[i];
    if (randomValue <= cumulativeWeight) {
      weatherType = weatherTypes[i];
      break;
    }
  }
  
  // 根据天气类型调整温度和太阳能效率
  let temperature = 0;
  let solarEfficiency = 0;
  
  if (hour >= 6 && hour < 12) { // 上午
    temperature = randomFloat(15, 25);
  } else if (hour >= 12 && hour < 18) { // 下午
    temperature = randomFloat(25, 35);
  } else { // 夜间
    temperature = randomFloat(10, 20);
  }
  
  // 根据天气调整温度和效率
  switch(weatherType) {
    case '晴':
      temperature += randomFloat(2, 5);
      solarEfficiency = randomFloat(18, 25);
      break;
    case '多云':
      solarEfficiency = randomFloat(12, 18);
      break;
    case '阴':
      temperature -= randomFloat(1, 3);
      solarEfficiency = randomFloat(5, 12);
      break;
    case '小雨':
      temperature -= randomFloat(3, 6);
      solarEfficiency = randomFloat(2, 8);
      break;
    case '雷阵雨':
      temperature -= randomFloat(5, 8);
      solarEfficiency = randomFloat(1, 5);
      break;
  }
  
  // 返回完整的模拟数据
  return {
    // 系统状态
    systemStatus: randomChoice(['正常', '正常', '正常', '异常']), // 75%概率正常
    
    // 电池状态
    batteryCapacity: batteryCapacity,
    batteryStatus: batteryStatus,
    batteryCurrent: randomFloat(-20, 20, 1), // 负值表示放电，正值表示充电
    batteryTemperature: randomFloat(20, 45, 1),
    
    // 太阳能数据
    solarPower: solarPower,
    dailySolarGeneration: randomFloat(5, 30, 1),
    solarEfficiency: solarEfficiency,
    panelTemperature: temperature + randomFloat(10, 20, 1),
    
    // 天气信息
    weatherType: weatherType,
    temperature: temperature,
    windSpeed: randomFloat(0, 10, 1),
    humidity: randomInt(30, 90),
    solarRadiation: weatherType === '晴' ? randomFloat(600, 1000) : 
                   weatherType === '多云' ? randomFloat(300, 600) : 
                   weatherType === '阴' ? randomFloat(100, 300) : 
                   randomFloat(20, 100),
    
    // 电网状态
    gridConnected: gridConnected,
    electricityPrice: randomFloat(0.5, 1.2, 3),
    gridVoltage: randomFloat(210, 240, 1),
    gridLoad: randomFloat(1, 10, 2),
    
    // 能源消耗
    energyConsumption: randomFloat(10, 50, 1),
    peakPower: randomFloat(3, 8, 1),
    comparedToYesterday: randomFloat(-15, 15, 1),
    estimatedCost: randomFloat(20, 100, 2)
  };
};

/**
 * 生成趋势页需要的模拟数据
 * @param {string} type - 数据类型
 * @param {string} period - 时间周期
 * @returns {Object} - 趋势模拟数据
 */
const getTrendData = (type, period) => {
  let points = 0;
  
  // 根据时间周期确定数据点数量
  switch(period) {
    case 'day':
      points = 24; // 每小时一个点
      break;
    case 'week':
      points = 7; // 每天一个点
      break;
    case 'month':
      points = 30; // 每天一个点
      break;
    default:
      points = 24;
  }
  
  const data = [];
  
  // 根据数据类型生成不同的数据
  switch(type) {
    case 'battery':
      // 电池容量数据
      for (let i = 0; i < points; i++) {
        data.push({
          time: i,
          value: randomInt(20, 90)
        });
      }
      break;
    case 'solar':
      // 太阳能发电数据
      for (let i = 0; i < points; i++) {
        // 白天产生的电力多一些
        const isDaytime = period === 'day' ? 
          (i >= 6 && i < 18) : 
          true;
        
        data.push({
          time: i,
          value: isDaytime ? randomFloat(1, 5, 1) : randomFloat(0, 0.5, 1)
        });
      }
      break;
    case 'grid':
      // 电网负载数据
      for (let i = 0; i < points; i++) {
        data.push({
          time: i,
          value: randomFloat(2, 8, 1)
        });
      }
      break;
    case 'consumption':
      // 能源消耗数据
      for (let i = 0; i < points; i++) {
        // 白天消耗多一些
        const isDaytime = period === 'day' ? 
          (i >= 8 && i < 22) : 
          true;
        
        data.push({
          time: i,
          value: isDaytime ? randomFloat(2, 5, 1) : randomFloat(0.5, 2, 1)
        });
      }
      break;
    default:
      // 默认返回随机数据
      for (let i = 0; i < points; i++) {
        data.push({
          time: i,
          value: randomFloat(0, 10, 1)
        });
      }
  }
  
  return {
    type,
    period,
    data
  };
};

/**
 * 生成历史页需要的模拟数据
 * @param {string} type - 数据类型
 * @param {string} startDate - 开始日期
 * @param {string} endDate - 结束日期
 * @returns {Object} - 历史模拟数据
 */
const getHistoryData = (type, startDate, endDate) => {
  // 将日期字符串转换为Date对象
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  // 计算日期差（天数）
  const diffTime = Math.abs(end - start);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  
  const data = [];
  
  // 为每一天生成数据
  for (let i = 0; i < diffDays; i++) {
    const date = new Date(start);
    date.setDate(start.getDate() + i);
    
    // 根据数据类型生成不同的数据
    switch(type) {
      case 'battery':
        // 电池容量变化记录
        data.push({
          date: date.toISOString().split('T')[0],
          minCapacity: randomInt(10, 30),
          maxCapacity: randomInt(70, 95),
          avgCapacity: randomInt(40, 60)
        });
        break;
      case 'solar':
        // 太阳能发电记录
        data.push({
          date: date.toISOString().split('T')[0],
          generation: randomFloat(5, 25, 1),
          peakPower: randomFloat(3, 7, 1),
          efficiency: randomFloat(10, 25, 1)
        });
        break;
      case 'grid':
        // 电网状态记录
        data.push({
          date: date.toISOString().split('T')[0],
          avgLoad: randomFloat(2, 8, 1),
          peakLoad: randomFloat(5, 12, 1),
          outageMinutes: Math.random() < 0.1 ? randomInt(5, 60) : 0 // 10%概率有断电
        });
        break;
      case 'consumption':
        // 能源消耗记录
        data.push({
          date: date.toISOString().split('T')[0],
          totalConsumption: randomFloat(15, 40, 1),
          peakConsumption: randomFloat(3, 8, 1),
          cost: randomFloat(10, 50, 2)
        });
        break;
      default:
        // 默认返回随机数据
        data.push({
          date: date.toISOString().split('T')[0],
          value: randomFloat(0, 100, 1)
        });
    }
  }
  
  return {
    type,
    startDate,
    endDate,
    data
  };
};

module.exports = {
  randomInt,
  randomFloat,
  randomDate,
  randomChoice,
  getHomePageData,
  getTrendData,
  getHistoryData
};
