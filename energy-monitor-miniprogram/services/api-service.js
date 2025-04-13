/**
 * API服务
 * 负责处理所有与后端API的通信，包括实时数据、历史数据和系统设置
 */

// 改为按需加载模式
// const api = require('../utils/api');
// const mock = require('../utils/mock');
const config = require('../utils/config');

// 是否使用模拟数据
const USE_MOCK = true; // 简化版config.js中不存在useMockData，所以默认为true

/**
 * API请求工具函数
 * @param {String} url - 请求地址
 * @param {String} method - 请求方法 GET/POST/PUT/DELETE
 * @param {Object} data - 请求数据
 * @return {Promise} Promise对象
 */
function request(url, method = 'GET', data = {}) {
  return new Promise((resolve, reject) => {
    // 先尝试连接真实API
    const fullUrl = url.startsWith('http') ? url : 'http://localhost:3001/api' + url;
    console.log(`尝试请求真实API: ${method} ${fullUrl}`);
    
    wx.request({
      url: fullUrl,
      method: method,
      data: data,
      header: {
        'content-type': 'application/json',
        'Authorization': wx.getStorageSync('token') || ''
      },
      timeout: 5000, // 5秒超时，快速失败
      success: (res) => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          console.log('API请求成功:', res.data);
          resolve(res.data);
        } else {
          console.error('API请求失败，状态码:', res.statusCode);
          // 失败时使用模拟数据
          fallbackToMockData(url, data, resolve);
        }
      },
      fail: (err) => {
        console.error('API请求失败，使用模拟数据:', err);
        // 失败时使用模拟数据
        fallbackToMockData(url, data, resolve);
      }
    });
  });
}

/**
 * 当API请求失败时，使用模拟数据
 * @param {String} url - 请求地址
 * @param {Object} data - 请求参数
 * @param {Function} resolve - Promise的resolve函数
 */
function fallbackToMockData(url, data, resolve) {
  console.log('使用模拟数据作为后备');
  const mock = require('../utils/mock');
  let mockResponse = {
    success: true,
    message: '操作成功(模拟数据)',
    data: {}
  };
  
  // 根据URL返回不同的模拟数据
  if (url.includes('/status')) {
    mockResponse.data = mock.getHomePageData();
  } else if (url.includes('/history')) {
    mockResponse.data = mock.getHistoryMockData(data.type || 'battery', data.startDate, data.endDate);
  } else if (url.includes('/trend')) {
    mockResponse.data = mock.getTrendMockData(data.type || 'battery', data.period || 'day');
  } else {
    mockResponse.data = { result: '操作成功(模拟数据)' };
  }
  
  // 模拟网络延迟
  setTimeout(() => {
    resolve(mockResponse);
  }, 300);
}

/**
 * 获取实时数据
 * @return {Promise} Promise对象，包含最新的系统数据
 */
function getRealTimeData() {
  try {
    // 尝试通过API请求获取数据
    return request('/status', 'GET');
  } catch (error) {
    console.error('API请求出错，使用模拟数据:', error);
    // 加载模拟数据模块
    const mock = require('../utils/mock');
    return Promise.resolve(mock.getRealtimeMockData());
  }
}

/**
 * 获取历史数据
 * @param {Object} params 查询参数对象
 * @param {String} params.startDate 开始日期 YYYY-MM-DD
 * @param {String} params.endDate 结束日期 YYYY-MM-DD
 * @param {String} params.type 数据类型: battery/solar/weather/price/system
 * @return {Promise} Promise对象，包含历史数据列表
 */
function getHistoryData(params) {
  if (USE_MOCK) {
    // 按需加载mock模块
    const mock = require('../utils/mock');
    console.log('使用模拟历史数据');
    return Promise.resolve({
      success: true,
      data: mock.getHistoryMockData(params.type, params.startDate, params.endDate)
    });
  }
  
  // 按需加载api模块
  const api = require('../utils/api');
  return api.getHistoryData(params);
}

/**
 * 获取趋势数据
 * @param {Object} params 查询参数对象
 * @param {String} params.period 时间周期: day/week/month
 * @param {String} params.type 数据类型: battery/solar/weather/price/system
 * @return {Promise} Promise对象，包含趋势数据
 */
function getTrendData(params) {
  if (USE_MOCK) {
    // 按需加载mock模块
    const mock = require('../utils/mock');
    console.log('使用模拟趋势数据');
    return Promise.resolve({
      success: true,
      data: mock.getTrendMockData(params.type, params.period)
    });
  }
  
  // 按需加载api模块
  const api = require('../utils/api');
  return api.getTrendData(params.type, params.period);
}

/**
 * 获取系统设置
 * @return {Promise} Promise对象，包含系统设置信息
 */
function getSystemSettings() {
  return request('/api/settings', 'GET');
}

/**
 * 更新系统设置
 * @param {Object} settings 系统设置对象
 * @return {Promise} Promise对象，包含更新结果
 */
function updateSystemSettings(settings) {
  return request('/api/settings', 'PUT', settings);
}

/**
 * 执行系统指令
 * @param {String} command 指令名称
 * @param {Object} params 指令参数
 * @return {Promise} Promise对象，包含指令执行结果
 */
function executeCommand(command, params) {
  return request('/api/command', 'POST', {
    command: command,
    params: params
  });
}

/**
 * 发送告警确认
 * @param {String} alarmId 告警ID
 * @return {Promise} Promise对象，包含确认结果
 */
function confirmAlarm(alarmId) {
  return request(`/api/alarms/${alarmId}/confirm`, 'POST');
}

/**
 * 获取告警列表
 * @param {Object} params 查询参数对象
 * @param {Boolean} params.unconfirmedOnly 是否只获取未确认的告警
 * @return {Promise} Promise对象，包含告警列表
 */
function getAlarms(params) {
  return request('/api/alarms', 'GET', params);
}

/**
 * 用户登录
 * @param {String} username 用户名
 * @param {String} password 密码
 * @return {Promise} Promise对象，包含登录结果和Token
 */
function login(username, password) {
  return request('/api/auth/login', 'POST', {
    username: username,
    password: password
  });
}

/**
 * 用户登出
 * @return {Promise} Promise对象，包含登出结果
 */
function logout() {
  return request('/api/auth/logout', 'POST');
}

/**
 * 获取设备信息
 * @returns {Promise} - 返回Promise对象
 */
function getDeviceInfo() {
  if (USE_MOCK) {
    // 按需加载mock模块
    const mock = require('../utils/mock');
    console.log('使用模拟设备信息');
    return Promise.resolve({
      success: true,
      data: mock.getDeviceMockData()
    });
  }
  
  // 按需加载api模块
  const api = require('../utils/api');
  return api.getDeviceInfo();
}

/**
 * 获取天气数据
 * @returns {Promise} - 返回Promise对象
 */
function getWeatherData() {
  if (USE_MOCK) {
    // 按需加载mock模块
    const mock = require('../utils/mock');
    console.log('使用模拟天气数据');
    return Promise.resolve({
      success: true,
      data: mock.getWeatherMockData()
    });
  }
  
  // 按需加载api模块
  const api = require('../utils/api');
  return api.getWeatherData();
}

/**
 * 控制设备
 * @param {string} deviceId - 设备ID
 * @param {string} action - 操作
 * @param {Object} params - 参数
 * @returns {Promise} - 返回Promise对象
 */
function controlDevice(deviceId, action, params = {}) {
  if (USE_MOCK) {
    // 按需加载mock模块
    const mock = require('../utils/mock');
    console.log('使用模拟设备控制', deviceId, action, params);
    return Promise.resolve({
      success: true,
      message: '操作成功',
      data: { status: 'success' }
    });
  }
  
  // 按需加载api模块
  const api = require('../utils/api');
  return api.controlDevice(deviceId, action, params);
}

// 导出所有API方法
module.exports = {
  getRealTimeData,
  getHistoryData,
  getTrendData,
  getSystemSettings,
  updateSystemSettings,
  executeCommand,
  confirmAlarm,
  getAlarms,
  login,
  logout,
  getDeviceInfo,
  getWeatherData,
  controlDevice
}; 