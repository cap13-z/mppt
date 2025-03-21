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
  
  // 模拟系统状态
  const systemStatus = '正常运行中';
  
  // 模拟电池数据
  const batteryData = {
    batteryCapacity: random(20, 100),
    batteryStatus: random(0, 100) > 30 ? '充电中' : '放电中',
    batteryCurrent: random(0.1, 5, 2),
    batteryTemperature: random(20, 40, 1),
    batteryVoltage: random(11, 13.5, 1)
  };
  
  // 模拟太阳能数据
  const solarData = {
    solarPower: random(50, 500),
    dailySolarGeneration: random(0.5, 5, 2),
    solarEfficiency: random(70, 95),
    panelTemperature: random(30, 60, 1),
    solarVoltage: random(16, 22, 1),
    solarCurrent: random(1, 10, 2)
  };
  
  // 模拟天气数据
  const weatherConditions = ['晴', '多云', '阴', '小雨', '中雨', '大雨'];
  const weatherIndex = Math.floor(random(0, weatherConditions.length));
  const weatherData = {
    weatherType: weatherConditions[weatherIndex],
    temperature: random(15, 35, 1),
    windSpeed: random(1, 15, 1),
    humidity: random(30, 95),
    solarRadiation: random(300, 1000)
  };
  
  // 模拟电网数据
  const gridData = {
    gridConnected: random(0, 100) > 10,
    electricityPrice: random(0.5, 0.9, 2),
    gridVoltage: random(220, 230, 1),
    gridLoad: random(500, 2000)
  };
  
  // 模拟能源消耗数据
  const energyData = {
    energyConsumption: random(1, 10, 2),
    peakPower: random(800, 2000),
    comparedToYesterday: random(-20, 20, 1),
    estimatedCost: random(5, 30, 2)
  };
  
  // 模拟设备数据
  const devices = [
    { id: 1, name: '客厅空调', status: random(0, 1) > 0.5, power: random(100, 1500) },
    { id: 2, name: '卧室灯', status: random(0, 1) > 0.5, power: random(5, 20) },
    { id: 3, name: '电视机', status: random(0, 1) > 0.5, power: random(50, 200) },
    { id: 4, name: '洗衣机', status: random(0, 1) > 0.5, power: random(300, 800) },
    { id: 5, name: '冰箱', status: true, power: random(80, 120) }
  ];
  
  // 返回完整的模拟数据对象
  return {
    systemStatus,
    batteryCapacity: batteryData.batteryCapacity,
    batteryStatus: batteryData.batteryStatus,
    batteryCurrent: batteryData.batteryCurrent,
    batteryTemperature: batteryData.batteryTemperature,
    batteryVoltage: batteryData.batteryVoltage,
    batteryTrend: random(0, 2) === 0 ? '上升' : (random(0, 1) > 0.5 ? '下降' : '稳定'),
    
    solarPower: solarData.solarPower,
    dailySolarGeneration: solarData.dailySolarGeneration,
    solarEfficiency: solarData.solarEfficiency,
    panelTemperature: solarData.panelTemperature,
    solarVoltage: solarData.solarVoltage,
    solarCurrent: solarData.solarCurrent,
    
    weatherType: weatherData.weatherType,
    temperature: weatherData.temperature,
    windSpeed: weatherData.windSpeed,
    humidity: weatherData.humidity,
    solarRadiation: weatherData.solarRadiation,
    
    gridConnected: gridData.gridConnected,
    electricityPrice: gridData.electricityPrice,
    gridVoltage: gridData.gridVoltage,
    gridLoad: gridData.gridLoad,
    
    energyConsumption: energyData.energyConsumption,
    peakPower: energyData.peakPower,
    comparedToYesterday: energyData.comparedToYesterday,
    estimatedCost: energyData.estimatedCost,
    
    devices,
    lastUpdateTime: now.toLocaleTimeString()
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
      weather: ['晴', '多云', '阴', '小雨'][Math.floor(random(0, 4))],
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

// 导出模拟数据函数
module.exports = {
  getHomePageData,
  getTrendData,
  getHistoryData
}; 