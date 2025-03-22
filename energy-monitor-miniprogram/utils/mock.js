/**
 * 模拟数据工具
 * 用于提供开发和测试阶段的模拟数据
 */

/**
 * 生成指定范围内的随机数
 * @param {number} min - 最小值
 * @param {number} max - 最大值
 * @param {number} decimal - 小数位数
 * @returns {number} - 随机数
 */
function random(min, max, decimal = 0) {
  const value = Math.random() * (max - min) + min;
  return parseFloat(value.toFixed(decimal));
}

/**
 * 获取首页需要的模拟数据
 * @returns {Object} - 模拟数据对象
 */
function getHomePageData() {
  // 获取当前时间和日期
  const now = new Date();
  
  // 模拟电池数据
  const battery = {
    voltage: random(12, 14, 1),       // 12-14V
    capacity: random(50, 100, 0),     // 50-100%
    temperature: random(25, 35, 1),   // 25-35°C
    current: random(1, 3, 2),         // 1-3A
    status: random(0, 100) > 30 ? '充电中' : (random(0, 100) > 50 ? '放电中' : '满电状态'),
    timestamp: now
  };
  
  // 模拟太阳能数据
  const solar = {
    voltage: random(18, 22, 1),       // 18-22V
    current: random(0.5, 3, 2),       // 0.5-3A
    power: 0,
    efficiency: random(70, 90, 1),    // 70-90%
    temperature: random(30, 60, 1),   // 30-60°C
    timestamp: now
  };
  // 计算功率
  solar.power = parseFloat((solar.voltage * solar.current).toFixed(1));
  
  // 模拟系统供电状态
  const powerStatus = {
    source: random(0, 100) > 50 ? '太阳能' : '电网',
    load_power: random(50, 200, 1),   // 50-200W
    solar_status: random(0, 100) > 30 ? '正常' : '离线',
    grid_status: random(0, 100) > 20 ? '正常' : '断电',
    timestamp: now
  };
  
  // 模拟天气数据
  const weatherConditions = ['晴朗', '多云', '阴天', '小雨'];
  const weatherIndex = Math.floor(random(0, weatherConditions.length));
  const weather = {
    temperature: random(20, 35, 1),   // 20-35°C
    humidity: random(40, 80, 0),      // 40-80%
    weather_condition: weatherConditions[weatherIndex],
    solar_radiation: random(200, 800, 0), // 200-800 W/m²
    timestamp: now
  };
  
  // 模拟电价数据
  const priceLevels = ['峰值', '平值', '谷值'];
  const priceLevelIndex = Math.floor(random(0, priceLevels.length));
  const price = {
    price: random(0.5, 0.8, 2),       // 0.5-0.8 元/kWh
    price_level: priceLevels[priceLevelIndex],
    next_change_time: new Date(now.getTime() + 3600000 + random(0, 3600000)), // 1-2小时后
    timestamp: now
  };
  
  // 模拟设备数据
  const devices = [
    { id: 1, name: '客厅空调', status: random(0, 1) > 0.5, power: random(100, 1500, 0) },
    { id: 2, name: '卧室灯', status: random(0, 1) > 0.5, power: random(5, 20, 0) },
    { id: 3, name: '电视机', status: random(0, 1) > 0.5, power: random(50, 200, 0) },
    { id: 4, name: '洗衣机', status: random(0, 1) > 0.5, power: random(300, 800, 0) },
    { id: 5, name: '冰箱', status: true, power: random(80, 120, 0) }
  ];
  
  // 能源消耗数据
  const energy = {
    consumption: random(1, 10, 2),
    peakPower: random(800, 2000, 0),
    comparedToYesterday: random(-20, 20, 1),
    estimatedCost: random(5, 30, 2)
  };
  
  // 系统状态
  const systemStatus = random(0, 100) > 90 ? '维护中' : (random(0, 100) > 95 ? '故障' : '正常运行中');
  
  // 返回完整的模拟数据对象 - 与前端网页数据结构保持一致
  return {
    battery: battery,
    solar: solar,
    powerStatus: powerStatus,
    weather: weather,
    price: price,
    devices: devices,
    energy: energy,
    systemStatus: systemStatus,
    lastUpdateTime: now.toLocaleTimeString(),
    
    // 兼容小程序原有结构的数据，保留一定的向下兼容性
    batteryCapacity: battery.capacity,
    batteryStatus: battery.status,
    batteryCurrent: battery.current,
    batteryTemperature: battery.temperature,
    batteryVoltage: battery.voltage,
    batteryTrend: random(0, 2) === 0 ? '上升' : (random(0, 1) > 0.5 ? '下降' : '稳定'),
    
    solarPower: solar.power,
    dailySolarGeneration: random(0.5, 5, 2),
    solarEfficiency: solar.efficiency,
    panelTemperature: solar.temperature,
    solarVoltage: solar.voltage,
    solarCurrent: solar.current,
    
    weatherType: weather.weather_condition,
    temperature: weather.temperature,
    windSpeed: random(1, 15, 1),
    humidity: weather.humidity,
    solarRadiation: weather.solar_radiation,
    
    gridConnected: powerStatus.grid_status === '正常',
    electricityPrice: price.price,
    gridVoltage: random(220, 230, 1),
    gridLoad: powerStatus.load_power,
    
    energyConsumption: energy.consumption,
    peakPower: energy.peakPower,
    comparedToYesterday: energy.comparedToYesterday,
    estimatedCost: energy.estimatedCost
  };
}

/**
 * 获取趋势页的模拟数据
 * @param {string} type - 数据类型
 * @param {string} period - 时间周期
 * @returns {Object} - 模拟趋势数据
 */
function getTrendData(type, period) {
  const dataPoints = period === 'day' ? 24 : (period === 'week' ? 7 : 30);
  const data = [];
  
  // 生成时间标签
  const labels = [];
  const now = new Date();
  
  for (let i = 0; i < dataPoints; i++) {
    const date = new Date();
    
    if (period === 'day') {
      // 小时数据点
      date.setHours(now.getHours() - (dataPoints - 1 - i));
      labels.push(date.getHours() + ':00');
    } else if (period === 'week') {
      // 天数据点
      date.setDate(now.getDate() - (dataPoints - 1 - i));
      labels.push(`${date.getMonth() + 1}/${date.getDate()}`);
    } else {
      // 月数据点
      date.setDate(now.getDate() - (dataPoints - 1 - i));
      labels.push(`${date.getMonth() + 1}/${date.getDate()}`);
    }
    
    // 根据类型生成不同的模拟数据
    let value;
    switch (type) {
      case 'battery':
        value = random(20, 100);
        break;
      case 'solar':
        value = random(0, 2000);
        break;
      case 'temperature':
        value = random(15, 35, 1);
        break;
      case 'consumption':
        value = random(0, 3000);
        break;
      default:
        value = random(0, 100);
    }
    
    data.push(value);
  }
  
  return {
    labels,
    data,
    type,
    period
  };
}

/**
 * 获取历史页的模拟数据
 * @param {number} days - 天数
 * @returns {Object} - 模拟历史数据
 */
function getHistoryData(days = 7) {
  const records = [];
  const now = new Date();
  
  for (let i = 0; i < days; i++) {
    const date = new Date();
    date.setDate(now.getDate() - i);
    
    // 为每一天创建一条记录
    records.push({
      date: `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`,
      solarGeneration: random(1, 8, 2),
      consumption: random(2, 15, 2),
      batteryStatus: random(30, 100),
      batteryCycles: Math.floor(random(0, 3)),
      savings: random(2, 10, 2),
      peakPower: random(500, 3000),
      weather: ['晴朗', '多云', '阴天', '小雨'][Math.floor(random(0, 4))],
      temperature: {
        min: random(15, 25, 1),
        max: random(25, 35, 1)
      }
    });
  }
  
  return {
    records,
    summary: {
      totalGeneration: random(10, 50, 2),
      totalConsumption: random(20, 80, 2),
      totalSavings: random(15, 60, 2),
      averageEfficiency: random(70, 95, 1)
    }
  };
}

/**
 * 获取实时数据，与服务器格式保持一致
 * @returns {Object} - 实时数据
 */
function getRealTimeData() {
  const mockData = getHomePageData();
  
  // 直接返回与服务器格式一致的数据结构
  return {
    battery: mockData.battery,
    solar: mockData.solar,
    powerStatus: mockData.powerStatus,
    weather: mockData.weather,
    price: mockData.price,
    timestamp: new Date()
  };
}

// 导出模拟数据函数
module.exports = {
  getHomePageData,
  getTrendData,
  getHistoryData,
  getRealTimeData
}; 