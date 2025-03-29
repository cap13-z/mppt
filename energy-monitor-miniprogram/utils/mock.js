/**
 * 模拟数据生成模块
 * 提供测试用的模拟数据
 */

/**
 * 生成随机整数
 * @param {number} min 最小值
 * @param {number} max 最大值
 * @returns {number} 随机整数
 */
const randomInt = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

/**
 * 生成随机浮点数
 * @param {number} min 最小值
 * @param {number} max 最大值
 * @param {number} decimals 小数位数
 * @returns {number} 随机浮点数
 */
const randomFloat = (min, max, decimals = 2) => {
  const value = Math.random() * (max - min) + min;
  return Number(value.toFixed(decimals));
};

/**
 * 从数组中随机选择一项
 * @param {Array} array 选项数组
 * @returns {any} 随机选中的项
 */
const randomFrom = (array) => {
  return array[Math.floor(Math.random() * array.length)];
};

/**
 * 生成标准化的ISO时间字符串
 * @param {Date} date - 日期对象
 * @returns {string} ISO格式的时间字符串
 */
const formatISOTime = (date) => {
  if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
    return new Date().toISOString();
  }
  
  // 使用更稳健的方式生成标准时间格式 (YYYY-MM-DD HH:MM:SS)
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  
  // 返回标准格式的时间字符串，而不是ISO格式
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

/**
 * 生成首页需要的所有模拟数据
 * @returns {Object} 首页数据
 */
const getHomePageData = () => {
  // 获取当前时间
  const now = new Date();
  const hour = now.getHours();
  
  // 生成电池数据
  const batteryCapacity = randomInt(30, 90);
  const batteryStatus = batteryCapacity > 80 ? '满电状态' : 
                         batteryCapacity > 20 ? '正常' : '低电量';
  const batteryCurrent = hour >= 9 && hour <= 16 ? 
                         randomFloat(1.0, 3.0) : 
                         randomFloat(-2.0, -0.1);
  const batteryTemperature = randomFloat(25, 40);
  
  // 生成太阳能数据
  const solarPower = (hour >= 8 && hour <= 17) ? randomFloat(0.5, 2.5) : randomFloat(0, 0.2);
  const dailySolarGeneration = randomFloat(2, 15);
  const solarEfficiency = randomFloat(15, 25);
  const panelTemperature = randomFloat(30, 60);
  
  // 生成天气数据
  const weatherTypes = ['晴', '多云', '阴', '小雨', '雾', '霾'];
  const weatherType = randomFrom(weatherTypes);
  const temperature = randomFloat(15, 30);
  const humidity = randomInt(30, 90);
  const windSpeed = randomFloat(1, 8);
  
  // 生成电网数据
  const gridConnected = Math.random() > 0.1;
  const gridVoltage = gridConnected ? randomFloat(215, 235) : 0;
  const gridLoad = gridConnected ? randomFloat(0.5, 2.5) : 0;
  const electricityPrice = randomFloat(0.5, 1.2);
  
  // 返回数据 - 只使用简单数据类型，避免嵌套对象
  return {
    // 系统状态
    systemStatus: '正常',
    updateTime: formatISOTime(now),
    
    // 电池状态
    batteryCapacity: batteryCapacity,
    batteryStatus: batteryStatus,
    batteryCurrent: batteryCurrent,
    batteryTemperature: batteryTemperature,
    chargingStatus: batteryCurrent > 0 ? '充电中' : '放电中',
    
    // 太阳能数据
    solarPower: solarPower,
    dailySolarGeneration: dailySolarGeneration,
    solarEfficiency: solarEfficiency,
    panelTemperature: panelTemperature,
    
    // 天气信息
    weatherType: weatherType,
    temperature: temperature,
    humidity: humidity,
    windSpeed: windSpeed,
    
    // 电网状态
    gridConnected: gridConnected,
    electricityPrice: electricityPrice,
    gridVoltage: gridVoltage,
    gridLoad: gridLoad
  };
};

/**
 * 生成实时数据流
 * @returns {Object} 实时数据
 */
const getRealtimeData = () => {
  return getHomePageData();
};

/**
 * 生成历史数据的模拟数据
 * @param {string} type 数据类型
 * @param {string} startDate 开始日期
 * @param {string} endDate 结束日期
 * @returns {Array} 历史数据数组
 */
const getHistoryMockData = (type, startDate, endDate) => {
  // 生成模拟的历史数据
  const result = [];
  
  console.log('生成历史模拟数据，类型:', type, '开始日期:', startDate, '结束日期:', endDate);
  
  // 解析日期字符串为Date对象
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  // 确保日期有效
  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    console.error('日期格式无效:', startDate, endDate);
    return [];
  }
  
  // 计算时间间隔（毫秒）
  const timeRange = end.getTime() - start.getTime();
  
  // 生成数据点的数量（每天4个点）
  const numPoints = Math.min(20, Math.ceil(timeRange / (24 * 60 * 60 * 1000)) * 4);
  
  // 每个点的时间间隔
  const interval = timeRange / numPoints;
  
  console.log('将生成点数:', numPoints, '时间间隔(毫秒):', interval);
  
  // 生成每个时间点的数据
  for (let i = 0; i < numPoints; i++) {
    // 计算当前时间点
    const timestamp = new Date(start.getTime() + i * interval);
    const formattedTime = formatISOTime(timestamp);
    
    console.log(`生成第${i+1}个数据点，时间:`, formattedTime);
    
    // 创建基础数据项
    const dataItem = {
      id: i + 1,
      timestamp: formattedTime // 直接使用格式化后的时间字符串
    };
    
    // 根据不同类型添加特定属性
    switch (type) {
      case 'battery':
        dataItem.voltage = randomFloat(4.8, 5.1, 2);
        dataItem.capacity = randomFloat(70, 95, 1);
        dataItem.status = i % 2 === 0 ? '充电中' : '正常';
        break;
        
      case 'solar':
        dataItem.voltage = randomFloat(14.5, 15.5, 2);
        dataItem.current = randomFloat(0.8, 1.2, 2);
        dataItem.power = randomFloat(12, 18, 1);
        dataItem.efficiency = randomFloat(80, 90, 1);
        break;
        
      case 'weather':
        dataItem.temperature = randomFloat(15, 30, 1);
        dataItem.humidity = randomInt(40, 80);
        dataItem.condition = ['晴', '多云', '阴', '小雨', '雾'][randomInt(0, 4)];
        break;
        
      case 'price':
        const hourOfDay = timestamp.getHours();
        dataItem.price = hourOfDay >= 8 && hourOfDay <= 22 ? randomFloat(0.6, 0.9, 2) : randomFloat(0.3, 0.5, 2);
        dataItem.level = hourOfDay >= 8 && hourOfDay <= 22 ? '峰值' : '谷值';
        break;
        
      case 'system':
        dataItem.powerSource = i % 3 === 0 ? '电网' : '太阳能';
        dataItem.loadPower = randomFloat(10, 20, 1);
        break;
    }
    
    result.push(dataItem);
  }
  
  return result;
};

/**
 * 生成趋势数据的模拟数据
 * @param {string} type 数据类型
 * @param {string} period 时间周期
 * @returns {Object} 趋势数据对象
 */
const getTrendMockData = (type, period) => {
  // 创建数据点数量
  let numPoints;
  switch (period) {
    case 'day': numPoints = 24; break; // 每小时一个点
    case 'week': numPoints = 7; break; // 每天一个点
    case 'month': numPoints = 30; break; // 每天一个点
    default: numPoints = 24;
  }
  
  // 初始化数据数组
  const data = [];
  const labels = [];
  const now = new Date();
  
  // 生成数据点
  for (let i = 0; i < numPoints; i++) {
    // 根据周期生成时间标签
    let label;
    if (period === 'day') {
      label = `${i}:00`;
    } else if (period === 'week') {
      const date = new Date(now);
      date.setDate(date.getDate() - (numPoints - i - 1));
      label = `${date.getMonth() + 1}/${date.getDate()}`;
    } else {
      const date = new Date(now);
      date.setDate(date.getDate() - (numPoints - i - 1));
      label = `${date.getMonth() + 1}/${date.getDate()}`;
    }
    
    labels.push(label);
    
    // 根据不同类型生成不同的数据
    switch (type) {
      case 'battery':
        // 电池容量趋势
        data.push(randomFloat(60, 90, 1));
        break;
        
      case 'solar':
        // 太阳能发电趋势
        if (period === 'day') {
          // 白天发电，晚上不发电
          if (i >= 6 && i <= 18) {
            data.push(randomFloat(10, 20, 1));
          } else {
            data.push(0);
          }
        } else {
          data.push(randomFloat(80, 120, 0));
        }
        break;
        
      case 'weather':
        // 温度趋势
        data.push(randomFloat(15, 30, 1));
        break;
        
      case 'price':
        // 电价趋势
        if (period === 'day') {
          // 峰谷电价
          if (i >= 8 && i <= 22) {
            data.push(randomFloat(0.6, 0.9, 2));
          } else {
            data.push(randomFloat(0.3, 0.5, 2));
          }
        } else {
          data.push(randomFloat(0.5, 0.8, 2));
        }
        break;
        
      case 'system':
        // 系统负载趋势
        data.push(randomFloat(10, 20, 1));
        break;
    }
  }
  
  return {
    labels: labels,
    datasets: [{
      data: data
    }]
  };
};

/**
 * 生成设备信息的模拟数据
 * @returns {Object} 设备信息对象
 */
const getDeviceMockData = () => {
  return {
    deviceId: 'MPPT-001',
    deviceName: '家用储能监控系统',
    firmwareVersion: 'v1.2.3',
    hardwareVersion: 'v2.0',
    lastMaintenance: '2023-05-15',
    nextMaintenance: '2023-11-15',
    installationDate: '2022-10-01',
    batteryType: '锂电池',
    batteryCapacity: '5kWh',
    solarPanelType: '单晶硅',
    solarPanelPower: '2kW',
    manufacturerName: '智能能源科技有限公司',
    servicePhone: '400-123-4567'
  };
};

// 导出模块方法
module.exports = {
  getHomePageData,
  getRealtimeData,
  getHistoryMockData,
  getTrendMockData,
  getDeviceMockData,
  getRealtimeMockData: getHomePageData, // 别名，兼容性考虑
  getWeatherMockData: () => ({ // 简单的天气数据
    temperature: randomFloat(15, 30, 1),
    condition: ['晴', '多云', '阴', '小雨', '雾'][randomInt(0, 4)],
    humidity: randomInt(40, 80),
    windSpeed: randomFloat(1, 8, 1)
  })
}; 