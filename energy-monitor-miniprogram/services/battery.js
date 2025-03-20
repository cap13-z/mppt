// 电池数据服务
// 提供处理和存储电池相关数据的方法

const api = require('../utils/api');
const util = require('../utils/util');

// 上一次电池容量，用于计算趋势
let lastBatteryCapacity = null;

// 电池数据服务
const batteryService = {
  // 最新的电池数据
  latestData: null,
  
  // 历史电池数据记录
  historyData: [],
  
  /**
   * 更新电池数据
   * @param {Object} data - 电池数据
   * @returns {Object} - 处理后的电池数据
   */
  updateBatteryData: function(data) {
    if (!data) return null;
    
    // 计算电池容量变化趋势
    let trend = 0;
    const capacity = data.capacity || 0;
    
    if (lastBatteryCapacity !== null) {
      if (capacity > lastBatteryCapacity) {
        trend = 1; // 上升趋势
      } else if (capacity < lastBatteryCapacity) {
        trend = -1; // 下降趋势
      }
    }
    
    // 更新上一次容量值
    lastBatteryCapacity = capacity;
    
    // 添加状态信息
    const statusInfo = util.mapBatteryStatus(capacity, trend);
    
    // 构建完整的电池数据
    const batteryData = {
      voltage: data.voltage || 0,
      capacity: capacity,
      trend: trend,
      status: statusInfo.status,
      statusClass: statusInfo.className,
      timestamp: data.timestamp || new Date().toISOString(),
      formattedTime: util.formatTime(data.timestamp || new Date())
    };
    
    // 更新最新数据
    this.latestData = batteryData;
    
    return batteryData;
  },
  
  /**
   * 获取历史电池数据
   * @param {string} startDate - 开始日期
   * @param {string} endDate - 结束日期
   * @returns {Promise} - 返回Promise对象
   */
  fetchHistoryData: function(startDate, endDate) {
    return new Promise((resolve, reject) => {
      api.getBatteryData(startDate, endDate)
        .then(data => {
          // 处理历史数据，添加趋势信息
          let prevCapacity = null;
          
          // 为历史数据添加趋势、状态和格式化时间
          this.historyData = data.map(item => {
            // 计算趋势
            let trend = 0;
            if (prevCapacity !== null) {
              if (item.capacity > prevCapacity) {
                trend = 1;
              } else if (item.capacity < prevCapacity) {
                trend = -1;
              }
            }
            prevCapacity = item.capacity;
            
            // 添加状态信息
            const statusInfo = util.mapBatteryStatus(item.capacity, trend);
            
            // 返回添加了额外信息的数据
            return {
              ...item,
              trend,
              status: statusInfo.status,
              statusClass: statusInfo.className,
              formattedTime: util.formatTime(item.timestamp)
            };
          });
          
          resolve(this.historyData);
        })
        .catch(error => {
          console.error('获取电池历史数据失败:', error);
          reject(error);
        });
    });
  },
  
  /**
   * 获取处理后的最新电池数据
   * @returns {Object} - 电池数据
   */
  getLatestData: function() {
    return this.latestData;
  },
  
  /**
   * 获取处理后的历史电池数据
   * @returns {Array} - 电池历史数据数组
   */
  getHistoryData: function() {
    return this.historyData;
  }
};

module.exports = batteryService; 