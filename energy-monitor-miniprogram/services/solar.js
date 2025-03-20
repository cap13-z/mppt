// 太阳能数据服务
// 提供处理和存储太阳能相关数据的方法

const api = require('../utils/api');
const util = require('../utils/util');

// 太阳能数据服务
const solarService = {
  // 最新的太阳能数据
  latestData: null,
  
  // 历史太阳能数据记录
  historyData: [],
  
  /**
   * 更新太阳能数据
   * @param {Object} data - 太阳能数据
   * @returns {Object} - 处理后的太阳能数据
   */
  updateSolarData: function(data) {
    if (!data) return null;
    
    // 计算发电效率百分比
    let efficiency = data.efficiency || 0;
    
    // 构建完整的太阳能数据
    const solarData = {
      voltage: data.voltage || 0,
      current: data.current || 0,
      power: data.power || 0,
      efficiency: efficiency,
      // 状态分类: 'high' (效率>50%), 'medium' (20-50%), 'low' (<20%)
      efficiencyLevel: efficiency > 50 ? 'high' : (efficiency > 20 ? 'medium' : 'low'),
      timestamp: data.timestamp || new Date().toISOString(),
      formattedTime: util.formatTime(data.timestamp || new Date())
    };
    
    // 更新最新数据
    this.latestData = solarData;
    
    return solarData;
  },
  
  /**
   * 获取历史太阳能数据
   * @param {string} startDate - 开始日期
   * @param {string} endDate - 结束日期
   * @returns {Promise} - 返回Promise对象
   */
  fetchHistoryData: function(startDate, endDate) {
    return new Promise((resolve, reject) => {
      api.getSolarData(startDate, endDate)
        .then(data => {
          // 为历史数据添加效率级别和格式化时间
          this.historyData = data.map(item => {
            const efficiency = item.efficiency || 0;
            
            return {
              ...item,
              efficiencyLevel: efficiency > 50 ? 'high' : (efficiency > 20 ? 'medium' : 'low'),
              formattedTime: util.formatTime(item.timestamp)
            };
          });
          
          resolve(this.historyData);
        })
        .catch(error => {
          console.error('获取太阳能历史数据失败:', error);
          reject(error);
        });
    });
  },
  
  /**
   * 获取处理后的最新太阳能数据
   * @returns {Object} - 太阳能数据
   */
  getLatestData: function() {
    return this.latestData;
  },
  
  /**
   * 获取处理后的历史太阳能数据
   * @returns {Array} - 太阳能历史数据数组
   */
  getHistoryData: function() {
    return this.historyData;
  }
};

module.exports = solarService; 