/**
 * API接口封装
 * 用于与后端服务进行通信
 */
const config = require('./config');

// API基础地址
const BASE_URL = config.serverConfig.apiUrl;

// 请求超时时间（毫秒）
const TIMEOUT = 10000;

/**
 * API工具模块 - 处理网络请求
 */
const baseOptions = {
  timeout: TIMEOUT, // 10秒超时
  header: {
    'content-type': 'application/json'
  }
};

/**
 * 发送GET请求
 * @param {string} url - 请求路径
 * @param {Object} data - 请求参数
 * @returns {Promise} - 返回Promise对象
 */
function get(url, data = {}) {
  return request('GET', url, data);
}

/**
 * 发送POST请求
 * @param {string} url - 请求路径
 * @param {Object} data - 请求参数
 * @returns {Promise} - 返回Promise对象
 */
function post(url, data = {}) {
  return request('POST', url, data);
}

/**
 * 通用请求方法
 * @param {string} method - 请求方法
 * @param {string} url - 请求路径
 * @param {Object} data - 请求参数
 * @returns {Promise} - 返回Promise对象
 */
function request(method, url, data = {}) {
  // 如果url不是完整的HTTP URL，添加baseUrl
  if (!url.startsWith('http')) {
    url = BASE_URL + url;
  }
  
  // 请求配置
  const options = {
    ...baseOptions,
    method: method,
    url: url,
    data: data
  };
  
  // 返回Promise对象
  return new Promise((resolve, reject) => {
    // 获取存储的token
    const token = wx.getStorageSync('token') || '';
    
    // 开始加载指示器
    wx.showLoading({
      title: '加载中...',
      mask: true
    });
    
    options.header = {
      ...options.header,
      'Authorization': token ? `Bearer ${token}` : ''
    };
    
    options.success = res => {
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
        reject({
          code: res.statusCode,
          message: res.data.message || '请求失败',
          data: res.data
        });
      }
    };
    
    options.fail = err => {
      reject({
        code: -1,
        message: err.errMsg || '网络请求失败',
        error: err
      });
    };
    
    options.complete = () => {
      wx.hideLoading();
    };
    
    wx.request(options);
  });
}

// API方法

/**
 * 获取系统状态数据
 * @returns {Promise} - 系统状态数据
 */
const getSystemStatus = () => {
  return get('/api/system/status');
};

/**
 * 获取电池状态数据
 * @returns {Promise} - 电池状态数据
 */
const getBatteryStatus = () => {
  return get('/api/battery/status');
};

/**
 * 获取太阳能发电数据
 * @returns {Promise} - 太阳能发电数据
 */
const getSolarData = () => {
  return get('/api/solar/status');
};

/**
 * 获取天气数据
 * @returns {Promise} - 天气数据
 */
const getWeatherData = () => {
  return get('/api/weather/current');
};

/**
 * 获取电网状态数据
 * @returns {Promise} - 电网状态数据
 */
const getGridStatus = () => {
  return get('/api/grid/status');
};

/**
 * 获取能源消耗数据
 * @returns {Promise} - 能源消耗数据
 */
const getEnergyConsumption = () => {
  return get('/api/energy/consumption');
};

/**
 * 获取历史数据
 * @param {number} days - 天数
 * @returns {Promise} - 返回Promise对象
 */
function getHistoryData(days = 7) {
  return get(config.serverConfig.apiPaths.history, { days });
}

/**
 * 获取趋势数据
 * @param {string} type - 数据类型
 * @param {string} period - 周期 (day, week, month)
 * @returns {Promise} - 趋势数据
 */
const getTrendData = (type, period) => {
  return get(`/api/trends/${type}?period=${period}`);
};

/**
 * 用户登录
 * @param {string} username - 用户名
 * @param {string} password - 密码
 * @returns {Promise} - 登录结果
 */
const login = (username, password) => {
  return post('/api/auth/login', { username, password });
};

/**
 * 用户注册
 * @param {Object} userData - 用户数据
 * @returns {Promise} - 注册结果
 */
const register = (userData) => {
  return post('/api/auth/register', userData);
};

/**
 * 修改用户信息
 * @param {Object} userData - 用户数据
 * @returns {Promise} - 修改结果
 */
const updateUserInfo = (userData) => {
  return post('/api/user/update', userData);
};

/**
 * 控制设备
 * @param {string} deviceId - 设备ID
 * @param {string} action - 动作
 * @param {Object} params - 参数
 * @returns {Promise} - 控制结果
 */
const controlDevice = (deviceId, action, params) => {
  return post(`/api/device/${deviceId}/control`, { action, ...params });
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
      energyData: energy
    };
  } catch (error) {
    console.error('获取首页数据失败:', error);
    throw error;
  }
};

/**
 * 获取设备信息
 * @returns {Promise} - 设备信息
 */
function getDeviceInfo() {
  return get('/api/device/info');
}

/**
 * 获取首页数据
 * @returns {Promise} - 首页数据
 */
function getHomePage() {
  return get('/api/home');
}

/**
 * 模拟请求 - 开发测试专用
 * 返回mock数据，不实际发起网络请求
 * @param {string} api - API名称
 * @param {Object} params - 请求参数
 * @returns {Promise} - 模拟数据
 */
function mockRequest(api, params = {}) {
  // 根据API名称返回对应的模拟数据
  return new Promise(resolve => {
    setTimeout(() => {
      resolve({
        success: true,
        data: {}
      });
    }, 500);
  });
}

// 导出方法
module.exports = {
  get,
  post,
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
  getAllHomePageData,
  getDeviceInfo,
  getHomePage,
  mockRequest
}; 