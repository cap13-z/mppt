/**
 * API服务
 * 负责处理所有与后端API的通信，包括实时数据、历史数据和系统设置
 */

// 改为按需加载模式
// const api = require('../utils/api');
// const mock = require('../utils/mock');
const config = require('../utils/config');

// 是否使用模拟数据
const USE_MOCK = config.appConfig.useMockData || true;

/**
 * API请求工具函数
 * @param {String} url - 请求地址
 * @param {String} method - 请求方法 GET/POST/PUT/DELETE
 * @param {Object} data - 请求数据
 * @return {Promise} Promise对象
 */
function request(url, method = 'GET', data = {}) {
  return new Promise((resolve, reject) => {
    wx.request({
      url: url.startsWith('http') ? url : config.apiBaseUrl + url,
      method: method,
      data: data,
      header: {
        'content-type': 'application/json',
        'Authorization': wx.getStorageSync('token') || ''  // 从缓存获取token
      },
      success: (res) => {
        // 统一处理返回结果
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(res.data);
        } else if (res.statusCode === 401) {
          // 处理未授权情况
          console.error('未授权，请登录');
          wx.navigateTo({
            url: '/pages/login/login'
          });
          reject(new Error('未授权，请登录'));
        } else {
          // 其他错误
          console.error('请求失败:', res);
          reject(new Error(res.data.message || '请求失败'));
        }
      },
      fail: (err) => {
        console.error('网络请求错误:', err);
        reject(new Error('网络请求失败，请检查网络连接'));
      }
    });
  });
}

/**
 * 获取实时数据
 * @return {Promise} Promise对象，包含最新的系统数据
 */
function getRealTimeData() {
  if (USE_MOCK) {
    // 按需加载mock模块
    const mock = require('../utils/mock');
    console.log('使用模拟实时数据');
    return Promise.resolve({
      success: true,
      data: mock.getRealtimeMockData()
    });
  }
  
  // 按需加载api模块
  const api = require('../utils/api');
  return api.getAllHomePageData();
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