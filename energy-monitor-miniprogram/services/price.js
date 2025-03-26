// 电价数据服务
// 提供处理和存储电价相关数据的方法

const api = require('../utils/api');
const util = require('../utils/util');

// 电价数据服务
const priceService = {
  // 最新的电价数据
  latestData: null,
  
  // 历史电价数据记录
  historyData: [],
  
  /**
   * 更新电价数据
   * @param {Object} data - 电价数据
   * @returns {Object} - 处理后的电价数据
   */
  updatePriceData: function(data) {
    if (!data) return null;
    
    // 电价级别中文名称
    const levelName = this.getPriceLevelName(data.price_level || 'normal');
    
    // 构建完整的电价数据
    const priceData = {
      price: data.price || 0,
      price_level: data.price_level || 'normal',
      levelName: levelName,
      next_change_time: data.next_change_time || '',
      nextChangeFormatted: data.next_change_time ? util.formatTime(data.next_change_time) : '',
      timeToNextChange: data.next_change_time ? this.getTimeToNextChange(data.next_change_time) : '',
      timestamp: data.timestamp || new Date().toISOString(),
      formattedTime: util.formatTime(data.timestamp || new Date())
    };
    
    // 更新最新数据
    this.latestData = priceData;
    
    return priceData;
  },
  
  /**
   * 获取湖北省实时电价
   * @returns {Promise} - 返回Promise对象
   */
  fetchHubeiElectricityPrice: function() {
    return new Promise((resolve, reject) => {
      api.getHubeiElectricityPrice()
        .then(data => {
          const priceData = this.updatePriceData(data);
          resolve(priceData);
        })
        .catch(error => {
          console.error('获取湖北省实时电价失败:', error);
          reject(error);
        });
    });
  },
  
  /**
   * 获取历史电价数据
   * @param {string} startDate - 开始日期
   * @param {string} endDate - 结束日期
   * @returns {Promise} - 返回Promise对象
   */
  fetchHistoryData: function(startDate, endDate) {
    return new Promise((resolve, reject) => {
      api.getElectricityPrice(startDate, endDate)
        .then(data => {
          // 为历史数据添加额外信息
          this.historyData = data.map(item => {
            return {
              ...item,
              levelName: this.getPriceLevelName(item.price_level || 'normal'),
              nextChangeFormatted: item.next_change_time ? util.formatTime(item.next_change_time) : '',
              formattedTime: util.formatTime(item.timestamp)
            };
          });
          
          resolve(this.historyData);
        })
        .catch(error => {
          console.error('获取电价历史数据失败:', error);
          reject(error);
        });
    });
  },
  
  /**
   * 将电价级别代码转换为中文名称
   * @param {string} level - 电价级别代码
   * @returns {string} - 中文电价级别名称
   */
  getPriceLevelName: function(level) {
    const levelMap = {
      'valley': '谷段',
      'normal': '平段',
      'peak': '峰段'
    };
    
    return levelMap[level.toLowerCase()] || '未知';
  },
  
  /**
   * 计算距离下一次电价变化的时间
   * @param {string} nextChangeTime - 下一次电价变化时间
   * @returns {string} - 距离下一次变化的时间描述
   */
  getTimeToNextChange: function(nextChangeTime) {
    const now = new Date();
    const nextChange = new Date(nextChangeTime);
    
    if (isNaN(nextChange.getTime())) {
      return '';
    }
    
    const diffMs = nextChange.getTime() - now.getTime();
    
    if (diffMs <= 0) {
      return '即将变化';
    }
    
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (diffHours > 0) {
      return `${diffHours}小时${diffMinutes}分钟后`;
    } else {
      return `${diffMinutes}分钟后`;
    }
  },
  
  /**
   * 获取处理后的最新电价数据
   * @returns {Object} - 电价数据
   */
  getLatestData: function() {
    return this.latestData;
  },
  
  /**
   * 获取处理后的历史电价数据
   * @returns {Array} - 电价历史数据数组
   */
  getHistoryData: function() {
    return this.historyData;
  }
};

module.exports = priceService; 