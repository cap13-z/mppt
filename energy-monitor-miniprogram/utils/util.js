/**
 * 工具函数模块
 * 提供通用工具方法
 */

// 格式化数字，保留指定位数小数
const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : `0${n}`
}

/**
 * 格式化时间
 * @param {Date} date 日期对象
 * @returns {string} 格式化后的时间字符串
 */
const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return `${[year, month, day].map(formatNumber).join('/')} ${[hour, minute, second].map(formatNumber).join(':')}`
}

/**
 * 格式化日期
 * @param {Date} date 日期对象
 * @returns {string} 格式化后的日期字符串 (YYYY-MM-DD)
 */
const formatDate = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()

  return `${[year, month, day].map(formatNumber).join('-')}`
}

/**
 * 获取相对时间描述
 * @param {Date|string} dateTime 日期时间对象或字符串
 * @returns {string} 相对时间描述
 */
const getRelativeTime = (dateTime) => {
  // 如果传入的是字符串，转换为Date对象
  const date = typeof dateTime === 'string' ? new Date(dateTime) : dateTime
  
  const now = new Date()
  const diff = now - date // 时间差(毫秒)
  
  // 计算时间差
  const minute = 60 * 1000
  const hour = 60 * minute
  const day = 24 * hour
  
  // 不同时间段返回不同的描述
  if (diff < minute) {
    return '刚刚'
  } else if (diff < hour) {
    return `${Math.floor(diff / minute)}分钟前`
  } else if (diff < day) {
    return `${Math.floor(diff / hour)}小时前`
  } else if (diff < 7 * day) {
    return `${Math.floor(diff / day)}天前`
  } else {
    return formatDate(date)
  }
}

/**
 * 防抖函数
 * @param {Function} func 要执行的函数
 * @param {number} wait 等待时间(毫秒)
 * @returns {Function} 防抖处理后的函数
 */
const debounce = (func, wait = 300) => {
  let timeout = null
  return function() {
    const context = this
    const args = arguments
    clearTimeout(timeout)
    timeout = setTimeout(() => {
      func.apply(context, args)
    }, wait)
  }
}

/**
 * 节流函数
 * @param {Function} func 要执行的函数
 * @param {number} wait 等待时间(毫秒)
 * @returns {Function} 节流处理后的函数
 */
const throttle = (func, wait = 300) => {
  let timeout = null
  let previous = 0
  
  return function() {
    const context = this
    const args = arguments
    const now = Date.now()
    
    if (now - previous > wait) {
      if (timeout) {
        clearTimeout(timeout)
        timeout = null
      }
      func.apply(context, args)
      previous = now
    } else if (!timeout) {
      timeout = setTimeout(() => {
        previous = Date.now()
        timeout = null
        func.apply(context, args)
      }, wait - (now - previous))
    }
  }
}

/**
 * 格式化金额
 * @param {number} amount 金额
 * @param {number} precision 小数位数
 * @returns {string} 格式化后的金额字符串
 */
const formatAmount = (amount, precision = 2) => {
  return amount.toFixed(precision)
}

/**
 * 生成UUID
 * @returns {string} UUID字符串
 */
const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0
    const v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}

/**
 * 深拷贝对象
 * @param {Object} obj 要拷贝的对象
 * @returns {Object} 拷贝后的新对象
 */
const deepClone = (obj) => {
  if (obj === null || typeof obj !== 'object') {
    return obj
  }
  
  const result = Array.isArray(obj) ? [] : {}
  
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      result[key] = deepClone(obj[key])
    }
  }
  
  return result
}

/**
 * 格式化文件大小
 * @param {number} size 文件大小(字节)
 * @returns {string} 格式化后的文件大小
 */
const formatFileSize = (size) => {
  if (size < 1024) {
    return size + ' B'
  } else if (size < 1024 * 1024) {
    return (size / 1024).toFixed(2) + ' KB'
  } else if (size < 1024 * 1024 * 1024) {
    return (size / (1024 * 1024)).toFixed(2) + ' MB'
  } else {
    return (size / (1024 * 1024 * 1024)).toFixed(2) + ' GB'
  }
}

module.exports = {
  formatTime,
  formatDate,
  getRelativeTime,
  debounce,
  throttle,
  formatAmount,
  generateUUID,
  deepClone,
  formatFileSize
} 