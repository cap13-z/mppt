/**
 * API接口封装
 * 用于与后端服务进行通信
 */

// API基础地址
const BASE_URL = 'https://api.energy-demo-system.com';

// 请求超时时间（毫秒）
const TIMEOUT = 10000;

/**
 * 发送请求的基础方法
 * @param {string} url - 请求路径
 * @param {string} method - 请求方法 (GET, POST, PUT, DELETE)
 * @param {Object} data - 请求数据
 * @returns {Promise} - 请求结果Promise
 */
const request = (url, method = 'GET', data = {}) => {
  return new Promise((resolve, reject) => {
    // 获取存储的token
    const token = wx.getStorageSync('token') || '';
    
    // 开始加载指示器
    wx.showLoading({
      title: '加载中...',
      mask: true
    });
    
    wx.request({
      url: `${BASE_URL}${url}`,
      method,
      data,
      header: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
      },
      timeout: TIMEOUT,
      success: (res) => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(res.data);
        } else if (res.statusCode === 401) {
          // 未授权，清除token并重定向到登录页
          wx.removeStorageSync('token');
          wx.showToast({
            title: '登录状态已过期',
            icon: 'none',
            duration: 1500
          });
          setTimeout(() => {
            wx.navigateTo({
              url: '/pages/login/login'
            });
          }, 1500);
          reject(new Error('登录状态已过期'));
        } else {
          reject(new Error(res.data.message || '请求失败'));
        }
      },
      fail: (err) => {
        reject(new Error('网络请求失败'));
      },
      complete: () => {
        wx.hideLoading();
      }
    });
  });
};

// API方法

/**
 * 获取系统状态数据
 * @returns {Promise} - 系统状态数据
 */
const getSystemStatus = () => {
  return request('/api/system/status');
};

/**
 * 获取电池状态数据
 * @returns {Promise} - 电池状态数据
 */
const getBatteryStatus = () => {
  return request('/api/battery/status');
};

/**
 * 获取太阳能发电数据
 * @returns {Promise} - 太阳能发电数据
 */
const getSolarData = () => {
  return request('/api/solar/status');
};

/**
 * 获取天气数据
 * @returns {Promise} - 天气数据
 */
const getWeatherData = () => {
  return request('/api/weather/current');
};

/**
 * 获取电网状态数据
 * @returns {Promise} - 电网状态数据
 */
const getGridStatus = () => {
  return request('/api/grid/status');
};

/**
 * 获取能源消耗数据
 * @returns {Promise} - 能源消耗数据
 */
const getEnergyConsumption = () => {
  return request('/api/energy/consumption');
};

/**
 * 获取历史数据
 * @param {string} type - 数据类型
 * @param {string} startDate - 开始日期
 * @param {string} endDate - 结束日期
 * @returns {Promise} - 历史数据
 */
const getHistoryData = (type, startDate, endDate) => {
  return request(`/api/history/${type}?startDate=${startDate}&endDate=${endDate}`);
};

/**
 * 获取趋势数据
 * @param {string} type - 数据类型
 * @param {string} period - 周期 (day, week, month)
 * @returns {Promise} - 趋势数据
 */
const getTrendData = (type, period) => {
  return request(`/api/trends/${type}?period=${period}`);
};

/**
 * 用户登录
 * @param {string} username - 用户名
 * @param {string} password - 密码
 * @returns {Promise} - 登录结果
 */
const login = (username, password) => {
  return request('/api/auth/login', 'POST', { username, password });
};

/**
 * 用户注册
 * @param {Object} userData - 用户数据
 * @returns {Promise} - 注册结果
 */
const register = (userData) => {
  return request('/api/auth/register', 'POST', userData);
};

/**
 * 修改用户信息
 * @param {Object} userData - 用户数据
 * @returns {Promise} - 修改结果
 */
const updateUserInfo = (userData) => {
  return request('/api/user/update', 'PUT', userData);
};

/**
 * 控制设备
 * @param {string} deviceId - 设备ID
 * @param {string} action - 动作
 * @param {Object} params - 参数
 * @returns {Promise} - 控制结果
 */
const controlDevice = (deviceId, action, params) => {
  return request(`/api/device/${deviceId}/control`, 'POST', { action, ...params });
};

/**
 * 一次性获取所有首页需要的数据
 * @returns {Promise} - 包含所有数据的对象
 */
const getAllHomePageData = async () => {
  try {
    const [system, battery, solar, weather, grid, energy] = await Promise.all([
      getSystemStatus(),
      getBatteryStatus(),
      getSolarData(),
      getWeatherData(),
      getGridStatus(),
      getEnergyConsumption()
    ]);
    
    return {
      systemStatus: system,
      batteryData: battery,
      solarData: solar,
      weatherData: weather,
      gridData: grid,
      energyData: energy,
      timestamp: new Date().getTime()
    };
  } catch (error) {
    throw new Error('获取数据失败: ' + error.message);
  }
};

module.exports = {
  request,
  getSystemStatus,
  getBatteryStatus,
  getSolarData,
  getWeatherData,
  getGridStatus,
  getEnergyConsumption,
  getHistoryData,
  getTrendData,
  login,
  register,
  updateUserInfo,
  controlDevice,
  getAllHomePageData
}; 