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
  const minute = now.getMinutes();
  
  // 保存上次生成的电池容量，确保变化合理
  if (!getHomePageData.lastBatteryCapacity) {
    getHomePageData.lastBatteryCapacity = 75; // 初始默认值
  }
  
  // 根据时间确定电池变化方向和速率
  let batteryCapacityChange = 0;
  if (hour >= 9 && hour <= 16) {
    // 白天，阳光充足，电池充电
    batteryCapacityChange = randomFloat(0.1, 0.3);
  } else if (hour >= 17 && hour <= 22) {
    // 晚上用电高峰期，电池放电
    batteryCapacityChange = randomFloat(-0.3, -0.1);
  } else {
    // 其他时间，轻微放电
    batteryCapacityChange = randomFloat(-0.1, -0.05);
  }
  
  // 计算新的电池容量
  let batteryCapacity = Math.min(100, Math.max(10, getHomePageData.lastBatteryCapacity + batteryCapacityChange));
  
  // 更新上次电池容量
  getHomePageData.lastBatteryCapacity = batteryCapacity;
  
  // 电池状态根据容量确定
  const batteryStatus = batteryCapacity >= 100 ? '满电' : 
                         batteryCapacity > 20 ? '正常' : '低电量';
  
  // 电流根据充放电状态确定，不超过1A
  const batteryCurrent = batteryCapacityChange > 0 ? 
                         randomFloat(0.3, 0.8) : 
                         randomFloat(-0.8, -0.3);
  
  // 电池温度(根据季节和充放电状态略有变化)
  const batteryTemperature = randomFloat(25, 30);
  
  // 太阳能数据
  // 太阳能功率根据时间变化
  let solarPower = 0;
  if (hour >= 7 && hour <= 18) {
    // 白天时间
    if (hour >= 10 && hour <= 14) {
      // 太阳最强时段
      solarPower = randomFloat(12, 16);
    } else {
      // 早晚时段
      solarPower = randomFloat(8, 12);
    }
  } else {
    // 夜间时段
    solarPower = randomFloat(5, 7);
  }
  
  // 太阳能发电效率
  const solarEfficiency = randomFloat(80, 85);
  
  // 太阳能每日发电量(根据当前时间累计)
  const hourFactor = Math.min(hour, 18) / 18; // 一天中的比例因子
  const dailySolarGeneration = randomFloat(0.8, 1.2) * hourFactor * 15; // 最高约15度电
  
  // 太阳能板温度(根据环境温度和发电情况)
  const panelTemperature = randomFloat(30, 40);
  
  // 天气数据 - 简化，只包含天气情况、温度和城市
  const weatherTypes = ['晴', '多云', '阴', '小雨', '大雨', '雷阵雨', '雾'];
  const weatherType = randomFrom(weatherTypes);
  
  // 根据季节和时间调整温度
  let baseTemp = 25; // 基础温度
  if (hour >= 12 && hour <= 14) {
    baseTemp += 3; // 中午温度更高
  } else if (hour >= 20 || hour <= 5) {
    baseTemp -= 5; // 夜间温度更低
  }
  const temperature = randomFloat(baseTemp - 2, baseTemp + 2);
  
  // 电网数据
  const gridConnected = true; // 默认总是连接到电网
  
  // 湖北省实时电价模拟 (峰谷电价)
  let electricityPrice;
  if ((hour >= 8 && hour <= 11) || (hour >= 15 && hour <= 18) || (hour >= 19 && hour <= 21)) {
    // 峰时段电价 (上午8:00-11:00，下午15:00-18:00，晚上19:00-21:00)
    electricityPrice = randomFloat(0.65, 0.68);
  } else if (hour >= 12 && hour <= 14) {
    // 平时段电价 (上午11:00-15:00)
    electricityPrice = randomFloat(0.45, 0.48);
  } else {
    // 谷时段电价 (其他时间)
    electricityPrice = randomFloat(0.25, 0.28);
  }
  
  // 返回数据 - 只使用简单数据类型，不显示数据来源标识
  return {
    // 系统状态
    systemStatus: '正常',
    updateTime: formatISOTime(now),
    
    // 电池状态
    batteryCapacity: Number(batteryCapacity.toFixed(1)),
    batteryStatus: batteryStatus,
    batteryCurrent: Number(batteryCurrent.toFixed(2)),
    batteryTemperature: Number(batteryTemperature.toFixed(1)),
    chargingStatus: batteryCurrent > 0 ? '充电中' : '放电中',
    
    // 太阳能数据
    solarPower: Number(solarPower.toFixed(2)),
    dailySolarGeneration: Number(dailySolarGeneration.toFixed(2)),
    solarEfficiency: Number(solarEfficiency.toFixed(1)),
    panelTemperature: Number(panelTemperature.toFixed(1)),
    
    // 天气信息 - 简化
    weatherType: weatherType,
    temperature: Number(temperature.toFixed(1)),
    city: '武汉',
    
    // 电网状态 - 简化
    gridConnected: gridConnected,
    electricityPrice: Number(electricityPrice.toFixed(2))
  };
};

/**
 * 生成实时数据流，包装为API格式
 * @returns {Object} 模拟的API响应
 */
const getRealtimeMockData = () => {
  const data = getHomePageData();
  
  // 包装为API响应格式
  return {
    code: 0,
    message: "获取数据成功",
    data: data,
    timestamp: new Date().getTime()
  };
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
  getRealtimeMockData,
  getHistoryMockData,
  getTrendMockData,
  getDeviceMockData,
  getWeatherMockData: () => ({ // 简单的天气数据
    temperature: randomFloat(15, 30, 1),
    condition: ['晴', '多云', '阴', '小雨', '雾'][randomInt(0, 4)],
    humidity: randomInt(40, 80),
    windSpeed: randomFloat(1, 8, 1)
  })
}; 