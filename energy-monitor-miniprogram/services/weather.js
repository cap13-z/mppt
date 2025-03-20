// 天气数据服务
// 提供处理和存储天气相关数据的方法

const api = require('../utils/api');
const util = require('../utils/util');

// 天气数据服务
const weatherService = {
  // 最新的天气数据
  latestData: null,
  
  // 历史天气数据记录
  historyData: [],
  
  /**
   * 更新天气数据
   * @param {Object} data - 天气数据
   * @returns {Object} - 处理后的天气数据
   */
  updateWeatherData: function(data) {
    if (!data) return null;
    
    // 获取天气图标
    const iconName = util.mapWeatherConditionToIcon(data.condition || 'unknown');
    
    // 构建完整的天气数据
    const weatherData = {
      temperature: data.temperature || 0,
      humidity: data.humidity || 0,
      condition: data.condition || 'unknown',
      conditionName: this.getConditionName(data.condition || 'unknown'),
      solar_radiation: data.solar_radiation || 0,
      wind_direction: data.wind_direction || '',
      wind_scale: data.wind_scale || 0,
      iconName: iconName,
      isSimulated: data.isSimulated || false,
      dataSource: data.dataSource || '未知',
      timestamp: data.timestamp || new Date().toISOString(),
      formattedTime: util.formatTime(data.timestamp || new Date())
    };
    
    // 更新最新数据
    this.latestData = weatherData;
    
    return weatherData;
  },
  
  /**
   * 获取武汉实时天气
   * @returns {Promise} - 返回Promise对象
   */
  fetchWuhanWeather: function() {
    return new Promise((resolve, reject) => {
      api.getWuhanWeather()
        .then(data => {
          const weatherData = this.updateWeatherData(data);
          resolve(weatherData);
        })
        .catch(error => {
          console.error('获取武汉实时天气失败:', error);
          reject(error);
        });
    });
  },
  
  /**
   * 获取历史天气数据
   * @param {string} startDate - 开始日期
   * @param {string} endDate - 结束日期
   * @returns {Promise} - 返回Promise对象
   */
  fetchHistoryData: function(startDate, endDate) {
    return new Promise((resolve, reject) => {
      api.getWeatherData(startDate, endDate)
        .then(data => {
          // 为历史数据添加额外信息
          this.historyData = data.map(item => {
            const iconName = util.mapWeatherConditionToIcon(item.condition || 'unknown');
            
            return {
              ...item,
              conditionName: this.getConditionName(item.condition || 'unknown'),
              iconName: iconName,
              formattedTime: util.formatTime(item.timestamp)
            };
          });
          
          resolve(this.historyData);
        })
        .catch(error => {
          console.error('获取天气历史数据失败:', error);
          reject(error);
        });
    });
  },
  
  /**
   * 将天气条件代码转换为中文名称
   * @param {string} condition - 天气条件代码
   * @returns {string} - 中文天气名称
   */
  getConditionName: function(condition) {
    const conditionMap = {
      'sunny': '晴天',
      'cloudy': '多云',
      'partly_cloudy': '局部多云',
      'overcast': '阴天',
      'rainy': '雨天',
      'light_rain': '小雨',
      'moderate_rain': '中雨',
      'heavy_rain': '大雨',
      'snowy': '雪天',
      'light_snow': '小雪',
      'moderate_snow': '中雪',
      'heavy_snow': '大雪',
      'foggy': '雾天',
      'hazy': '霾',
      'windy': '多风',
      'stormy': '暴风雨',
      'thunder': '雷雨',
      'hail': '冰雹',
      'unknown': '未知'
    };
    
    return conditionMap[condition.toLowerCase()] || '未知';
  },
  
  /**
   * 获取处理后的最新天气数据
   * @returns {Object} - 天气数据
   */
  getLatestData: function() {
    return this.latestData;
  },
  
  /**
   * 获取处理后的历史天气数据
   * @returns {Array} - 天气历史数据数组
   */
  getHistoryData: function() {
    return this.historyData;
  }
};

module.exports = weatherService; 