// 系统状态服务
// 提供处理和存储系统供电状态相关数据的方法

const api = require('../utils/api');
const util = require('../utils/util');

// 系统状态服务
const systemService = {
  // 最新的系统状态数据
  latestData: null,
  
  // 历史系统状态数据记录
  historyData: [],
  
  /**
   * 更新系统状态数据
   * @param {Object} data - 系统状态数据
   * @returns {Object} - 处理后的系统状态数据
   */
  updateSystemData: function(data) {
    if (!data) return null;
    
    // 构建完整的系统状态数据
    const systemData = {
      source: data.source || '未知',
      load_power: data.load_power || 0,
      solar_status: data.solar_status || '未知',
      grid_status: data.grid_status || '未知',
      // 是否使用太阳能供电
      isSolarPowered: data.source === '太阳能',
      // 是否使用电网供电
      isGridPowered: data.source !== '太阳能',
      timestamp: data.timestamp || new Date().toISOString(),
      formattedTime: util.formatTime(data.timestamp || new Date())
    };
    
    // 更新最新数据
    this.latestData = systemData;
    
    return systemData;
  },
  
  /**
   * 获取历史系统状态数据
   * @param {string} startDate - 开始日期
   * @param {string} endDate - 结束日期
   * @returns {Promise} - 返回Promise对象
   */
  fetchHistoryData: function(startDate, endDate) {
    return new Promise((resolve, reject) => {
      api.getPowerStatus(startDate, endDate)
        .then(data => {
          // 为历史数据添加额外信息
          this.historyData = data.map(item => {
            return {
              ...item,
              isSolarPowered: item.source === '太阳能',
              isGridPowered: item.source !== '太阳能',
              formattedTime: util.formatTime(item.timestamp)
            };
          });
          
          resolve(this.historyData);
        })
        .catch(error => {
          console.error('获取系统状态历史数据失败:', error);
          reject(error);
        });
    });
  },
  
  /**
   * 获取处理后的最新系统状态数据
   * @returns {Object} - 系统状态数据
   */
  getLatestData: function() {
    return this.latestData;
  },
  
  /**
   * 获取处理后的历史系统状态数据
   * @returns {Array} - 系统状态历史数据数组
   */
  getHistoryData: function() {
    return this.historyData;
  },
  
  /**
   * 计算太阳能供电百分比
   * @param {Array} data - 系统状态历史数据
   * @returns {number} - 太阳能供电百分比
   */
  calculateSolarPowerPercentage: function(data) {
    if (!data || data.length === 0) {
      return 0;
    }
    
    const totalCount = data.length;
    const solarCount = data.filter(item => item.source === '太阳能').length;
    
    return (solarCount / totalCount) * 100;
  },
  
  /**
   * 计算平均负载功率
   * @param {Array} data - 系统状态历史数据
   * @returns {number} - 平均负载功率
   */
  calculateAverageLoadPower: function(data) {
    if (!data || data.length === 0) {
      return 0;
    }
    
    const totalPower = data.reduce((sum, item) => sum + (item.load_power || 0), 0);
    
    return totalPower / data.length;
  }
};

module.exports = systemService; 