/**
 * 日期工具类
 * 提供日期和时间的格式化方法，用于在应用中统一日期显示格式
 */

/**
 * 格式化日期为 YYYY-MM-DD 格式
 * @param {Date} date - 要格式化的日期对象
 * @return {String} 格式化后的日期字符串
 */
function formatDate(date) {
  if (!date || !(date instanceof Date)) {
    return '';
  }
  
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  
  return `${year}-${month}-${day}`;
}

/**
 * 格式化时间为 YYYY-MM-DD HH:MM:SS 格式
 * @param {Date} date - 要格式化的日期对象
 * @return {String} 格式化后的时间字符串
 */
function formatTime(date) {
  if (!date || !(date instanceof Date)) {
    return '';
  }
  
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const seconds = date.getSeconds().toString().padStart(2, '0');
  
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

/**
 * 格式化时间为友好的显示格式（例如：刚刚、x分钟前、x小时前、昨天等）
 * @param {Date|String} date - 要格式化的日期对象或日期字符串
 * @return {String} 格式化后的友好显示时间
 */
function formatFriendlyTime(date) {
  if (!date) {
    return '';
  }
  
  // 如果是字符串，转换为Date对象
  if (typeof date === 'string') {
    date = new Date(date);
  }
  
  const now = new Date();
  const diff = (now - date) / 1000; // 转换为秒
  
  // 不同时间范围采用不同显示方式
  if (diff < 60) {
    return '刚刚';
  } else if (diff < 3600) {
    return Math.floor(diff / 60) + '分钟前';
  } else if (diff < 86400) {
    return Math.floor(diff / 3600) + '小时前';
  } else if (diff < 172800) {
    return '昨天';
  } else if (diff < 2592000) {
    return Math.floor(diff / 86400) + '天前';
  } else {
    // 超过30天，直接显示具体日期
    return formatDate(date);
  }
}

/**
 * 获取两个日期之间的天数
 * @param {Date} startDate - 开始日期
 * @param {Date} endDate - 结束日期
 * @return {Number} 天数差值
 */
function getDaysBetween(startDate, endDate) {
  if (!startDate || !endDate) {
    return 0;
  }
  
  // 为确保计算准确，去除时间部分
  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);
  
  const end = new Date(endDate);
  end.setHours(0, 0, 0, 0);
  
  // 计算毫秒差值并转换为天数
  const diffTime = Math.abs(end - start);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * 判断是否是同一天
 * @param {Date} date1 - 第一个日期
 * @param {Date} date2 - 第二个日期
 * @return {Boolean} 是否是同一天
 */
function isSameDay(date1, date2) {
  if (!date1 || !date2) {
    return false;
  }
  
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

/**
 * 获取当前日期的开始时间（00:00:00）
 * @param {Date} date - 日期对象
 * @return {Date} 当日开始时间的日期对象
 */
function getStartOfDay(date) {
  if (!date) {
    date = new Date();
  }
  
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  
  return result;
}

/**
 * 获取当前日期的结束时间（23:59:59）
 * @param {Date} date - 日期对象
 * @return {Date} 当日结束时间的日期对象
 */
function getEndOfDay(date) {
  if (!date) {
    date = new Date();
  }
  
  const result = new Date(date);
  result.setHours(23, 59, 59, 999);
  
  return result;
}

module.exports = {
  formatDate,
  formatTime,
  formatFriendlyTime,
  getDaysBetween,
  isSameDay,
  getStartOfDay,
  getEndOfDay
}; 