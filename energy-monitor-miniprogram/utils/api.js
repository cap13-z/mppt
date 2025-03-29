/**
 * API请求模块
 * 提供与后端服务器的通信功能
 */

const config = require('./config');

/**
 * 发送GET请求
 * @param {string} url 请求地址
 * @param {Object} data 请求参数
 * @returns {Promise} Promise对象
 */
const get = (url, data = {}) => {
  return request(url, 'GET', data);
};

/**
 * 发送POST请求
 * @param {string} url 请求地址
 * @param {Object} data 请求数据
 * @returns {Promise} Promise对象
 */
const post = (url, data = {}) => {
  return request(url, 'POST', data);
};

/**
 * 发送PUT请求
 * @param {string} url 请求地址
 * @param {Object} data 请求数据
 * @returns {Promise} Promise对象
 */
const put = (url, data = {}) => {
  return request(url, 'PUT', data);
};

/**
 * 发送DELETE请求
 * @param {string} url 请求地址
 * @param {Object} data 请求参数
 * @returns {Promise} Promise对象
 */
const del = (url, data = {}) => {
  return request(url, 'DELETE', data);
};

/**
 * 通用请求方法
 * @param {string} url 请求地址
 * @param {string} method 请求方法
 * @param {Object} data 请求数据
 * @returns {Promise} Promise对象
 */
const request = (url, method, data) => {
  return new Promise((resolve, reject) => {
    // 添加基础URL
    if (!url.startsWith('http')) {
      url = config.getApiBaseUrl() + url;
    }
    
    // 请求配置
    const options = {
      url: url,
      method: method,
      data: data,
      header: {
        'content-type': 'application/json'
      },
      timeout: 10000, // 10秒超时
      success: (res) => {
        // 约定：服务端返回的数据结构为 { code, data, message }
        if (res.statusCode === 200) {
          if (res.data && res.data.code === 0) {
            // 处理API返回的数据，展开嵌套对象
            let apiData = res.data.data;
            
            // 如果数据是对象，处理可能的嵌套结构
            if (apiData && typeof apiData === 'object') {
              // 处理battery对象
              if (apiData.battery && typeof apiData.battery === 'object') {
                console.log('API: 展开battery对象');
                Object.keys(apiData.battery).forEach(key => {
                  apiData[`battery${key.charAt(0).toUpperCase() + key.slice(1)}`] = apiData.battery[key];
                });
                delete apiData.battery;
              }
              
              // 处理solar对象
              if (apiData.solar && typeof apiData.solar === 'object') {
                console.log('API: 展开solar对象');
                Object.keys(apiData.solar).forEach(key => {
                  apiData[`solar${key.charAt(0).toUpperCase() + key.slice(1)}`] = apiData.solar[key];
                });
                delete apiData.solar;
              }
            }
            
            resolve(apiData);
          } else {
            // 业务逻辑错误
            console.error(`API请求业务错误: ${url}`, res.data);
            reject({
              type: 'business',
              code: res.data ? res.data.code : -1,
              message: res.data ? res.data.message : '未知业务错误',
              data: res.data
            });
          }
        } else {
          // HTTP错误
          console.error(`API请求HTTP错误: ${url}`, res);
          reject({
            type: 'http',
            code: res.statusCode,
            message: `HTTP请求错误: ${res.statusCode}`,
            data: res.data
          });
        }
      },
      fail: (err) => {
        // 网络错误、超时等
        console.error(`API请求失败: ${url}`, err);
        reject({
          type: 'request',
          code: -1,
          message: err.errMsg || '网络请求失败',
          error: err
        });
      }
    };
    
    // 发送请求
    wx.request(options);
  });
};

/**
 * 获取系统信息
 * @returns {Promise} Promise对象
 */
const getSystemInfo = () => {
  return get('/system/info');
};

/**
 * 获取实时状态数据
 * @returns {Promise} Promise对象
 */
const getStatus = () => {
  return get('/status');
};

/**
 * 获取电池状态
 * @returns {Promise} Promise对象
 */
const getBatteryStatus = () => {
  return get('/battery/status');
};

/**
 * 获取太阳能状态
 * @returns {Promise} Promise对象
 */
const getSolarStatus = () => {
  return get('/solar/status');
};

/**
 * 获取天气信息
 * @returns {Promise} Promise对象
 */
const getWeather = () => {
  return get('/weather');
};

/**
 * 获取电价信息
 * @returns {Promise} Promise对象
 */
const getPrice = () => {
  return get('/price');
};

/**
 * 获取历史数据
 * @param {string} type 数据类型
 * @param {string} startDate 开始日期
 * @param {string} endDate 结束日期
 * @param {number} page 页码
 * @param {number} pageSize 每页数量
 * @returns {Promise} Promise对象
 */
const getHistory = (type, startDate, endDate, page = 1, pageSize = 20) => {
  return get('/history', {
    type,
    startDate,
    endDate,
    page,
    pageSize
  });
};

/**
 * 获取趋势数据
 * @param {string} type 数据类型
 * @param {string} period 时间周期
 * @returns {Promise} Promise对象
 */
const getTrend = (type, period) => {
  return get('/trend', {
    type,
    period
  });
};

/**
 * 控制设备
 * @param {string} action 操作类型
 * @param {Object} params 操作参数
 * @returns {Promise} Promise对象
 */
const controlDevice = (action, params = {}) => {
  return post('/control', {
    action,
    ...params
  });
};

/**
 * 设置系统参数
 * @param {Object} settings 设置参数
 * @returns {Promise} Promise对象
 */
const setSettings = (settings) => {
  return post('/settings', settings);
};

module.exports = {
  get,
  post,
  put,
  delete: del,
  request,
  getSystemInfo,
  getStatus,
  getBatteryStatus,
  getSolarStatus,
  getWeather,
  getPrice,
  getHistory,
  getTrend,
  controlDevice,
  setSettings
}; 