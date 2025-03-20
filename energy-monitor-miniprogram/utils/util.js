// 通用工具函数
// 提供格式化、数据处理等辅助方法

/**
 * 通用工具函数
 */

/**
 * 格式化时间
 * @param {Date} date 日期对象
 * @returns {string} 格式化后的时间字符串 (YYYY-MM-DD HH:mm:ss)
 */
const formatTime = date => {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hour = date.getHours();
  const minute = date.getMinutes();
  const second = date.getSeconds();

  return [year, month, day].map(formatNumber).join('-') + ' ' + [hour, minute, second].map(formatNumber).join(':');
};

/**
 * 格式化日期
 * @param {Date} date 日期对象
 * @returns {string} 格式化后的日期字符串 (YYYY-MM-DD)
 */
const formatDate = date => {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();

  return [year, month, day].map(formatNumber).join('-');
};

/**
 * 格式化数字，保证两位数
 * @param {number} n 数字
 * @returns {string} 格式化后的数字字符串
 */
const formatNumber = n => {
  n = n.toString();
  return n[1] ? n : '0' + n;
};

/**
 * 四舍五入保留指定小数位
 * @param {number} number 需要格式化的数字
 * @param {number} decimal 小数位数
 * @returns {number} 格式化后的数字
 */
const roundToDecimal = (number, decimal = 2) => {
  const factor = Math.pow(10, decimal);
  return Math.round(number * factor) / factor;
};

/**
 * 格式化电力单位
 * @param {number} power 电力值（W）
 * @returns {string} 格式化后的电力值，自动选择合适的单位
 */
const formatPower = power => {
  if (power >= 1000000) {
    return roundToDecimal(power / 1000000) + ' MW';
  } else if (power >= 1000) {
    return roundToDecimal(power / 1000) + ' kW';
  } else {
    return Math.round(power) + ' W';
  }
};

/**
 * 格式化电量单位
 * @param {number} energy 电量值（Wh）
 * @returns {string} 格式化后的电量值，自动选择合适的单位
 */
const formatEnergy = energy => {
  if (energy >= 1000000) {
    return roundToDecimal(energy / 1000000) + ' MWh';
  } else if (energy >= 1000) {
    return roundToDecimal(energy / 1000) + ' kWh';
  } else {
    return Math.round(energy) + ' Wh';
  }
};

/**
 * 格式化温度
 * @param {number} temp 温度值
 * @returns {string} 格式化后的温度值，带单位
 */
const formatTemperature = temp => {
  return roundToDecimal(temp, 1) + '°C';
};

/**
 * 获取状态颜色
 * @param {string} status 状态值
 * @returns {string} 对应的颜色
 */
const getStatusColor = status => {
  const statusMap = {
    '正常': '#4cd964',
    '异常': '#ff3b30',
    '警告': '#ff9500',
    '离线': '#8e8e93',
    '充电中': '#00a8ff',
    '放电中': '#ff9500',
    '满电': '#4cd964',
    '电量低': '#ff3b30'
  };
  
  return statusMap[status] || '#8e8e93';
};

/**
 * 生成唯一ID
 * @returns {string} 唯一ID字符串
 */
const generateUniqueId = () => {
  return 'id_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
};

/**
 * 深度克隆对象
 * @param {Object} obj 需要克隆的对象
 * @returns {Object} 克隆后的新对象
 */
const deepClone = obj => {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  
  let clone = Array.isArray(obj) ? [] : {};
  
  for (let key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      clone[key] = deepClone(obj[key]);
    }
  }
  
  return clone;
};

/**
 * 获取当前时间的小时
 * @returns {number} 当前小时数
 */
const getCurrentHour = () => {
  return new Date().getHours();
};

/**
 * 判断是否为夜间
 * @returns {boolean} 是否为夜间
 */
const isNightTime = () => {
  const hour = getCurrentHour();
  return hour < 6 || hour >= 18; // 晚上6点到早上6点认为是夜间
};

/**
 * 防抖函数
 * @param {Function} func 要执行的函数
 * @param {number} wait 等待时间（毫秒）
 * @returns {Function} 防抖处理后的函数
 */
const debounce = (func, wait = 300) => {
  let timeout;
  return function() {
    const context = this;
    const args = arguments;
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      func.apply(context, args);
    }, wait);
  };
};

// 导出工具函数
module.exports = {
  formatTime,
  formatDate,
  formatNumber,
  roundToDecimal,
  formatPower,
  formatEnergy,
  formatTemperature,
  getStatusColor,
  generateUniqueId,
  deepClone,
  getCurrentHour,
  isNightTime,
  debounce
}; 