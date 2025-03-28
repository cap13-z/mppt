/**
 * 配置文件
 * 提供系统配置项和全局设置
 */

// 全局配置
const appConfig = {
  // 应用基本信息
  name: '能源监控系统',
  version: '1.0.0',
  defaultTheme: 'dark',  // 默认主题
  
  // 后端服务配置
  backendHost: 'http://localhost:3001',  // 后端服务地址
  socketUrl: 'ws://localhost:3001/ws',   // WebSocket服务地址
  
  // 功能配置
  useMockData: true,     // 是否使用模拟数据
  enableNotifications: true,  // 是否启用通知
  autoRefresh: true,     // 是否自动刷新
  refreshInterval: 60,   // 刷新间隔（秒）
  
  // API版本
  apiVersion: 'v1',
  
  // 存储键名
  storageKeys: {
    theme: 'theme',
    autoRefresh: 'autoRefresh',
    refreshInterval: 'refreshInterval',
    notifications: 'notifications',
    deviceId: 'deviceId'
  },

  // 默认设置
  defaultSettings: {
    theme: 'dark',
    autoRefresh: true,
    refreshInterval: 30,
    notifications: true
  }
};

/**
 * 获取WebSocket服务器地址
 * @returns {string} WebSocket服务器URL
 */
function getWebSocketUrl() {
  return appConfig.socketUrl;
}

/**
 * 获取后端API基础URL
 * @returns {string} 后端API基础URL
 */
function getApiBaseUrl() {
  return `${appConfig.backendHost}/api/${appConfig.apiVersion}`;
}

/**
 * 获取设备ID，如果不存在则生成一个
 * @returns {string} 设备ID
 */
function getDeviceId() {
  let deviceId = wx.getStorageSync(appConfig.storageKeys.deviceId);
  
  if (!deviceId) {
    // 生成随机设备ID
    deviceId = 'wxapp_' + Math.random().toString(36).substring(2, 10);
    wx.setStorageSync(appConfig.storageKeys.deviceId, deviceId);
  }
  
  return deviceId;
}

/**
 * 获取主题设置，如果不存在则使用默认主题
 * @returns {string} 主题名称
 */
function getTheme() {
  return wx.getStorageSync(appConfig.storageKeys.theme) || appConfig.defaultTheme;
}

/**
 * 保存主题设置
 * @param {string} theme 主题名称
 */
function saveTheme(theme) {
  wx.setStorageSync(appConfig.storageKeys.theme, theme);
}

/**
 * 获取自动刷新设置
 * @returns {boolean} 是否自动刷新
 */
function getAutoRefresh() {
  const value = wx.getStorageSync(appConfig.storageKeys.autoRefresh);
  return value !== '' ? value : appConfig.autoRefresh;
}

/**
 * 获取刷新间隔
 * @returns {number} 刷新间隔（秒）
 */
function getRefreshInterval() {
  const value = wx.getStorageSync(appConfig.storageKeys.refreshInterval);
  return value || appConfig.refreshInterval;
}

/**
 * 服务器配置
 */
const serverConfig = {
  // API服务器地址
  apiBaseUrl: 'http://localhost:3001/api',
  
  // WebSocket服务器地址
  webSocketUrl: 'ws://localhost:3001/ws',
  
  // 设备ID (用于身份识别)
  deviceId: 'miniprogram-client'
};

/**
 * 获取API服务器基础URL
 * @returns {string} API基础URL
 */
const getApiBaseUrl = () => {
  return serverConfig.apiBaseUrl;
};

/**
 * 获取WebSocket服务器URL
 * @returns {string} WebSocket URL
 */
const getWebSocketUrl = () => {
  return serverConfig.webSocketUrl;
};

/**
 * 获取设备ID
 * @returns {string} 设备ID
 */
const getDeviceId = () => {
  return serverConfig.deviceId;
};

/**
 * 获取应用程序配置
 * @returns {Object} 应用程序配置对象
 */
const getAppConfig = () => {
  return appConfig;
};

/**
 * 图表配置
 */
const chartConfig = {
  // 折线图颜色
  lineColors: ['#1890ff', '#faad14', '#52c41a', '#722ed1', '#eb2f96'],
  // 柱状图颜色
  barColors: ['#36cfc9', '#ff7a45', '#597ef7', '#73d13d', '#ffc53d'],
  // 饼图颜色
  pieColors: ['#2f54eb', '#13c2c2', '#fa8c16', '#52c41a', '#f5222d', '#eb2f96']
};

/**
 * 电池状态配置
 */
const batteryConfig = {
  // 电池低电量阈值
  lowThreshold: 20,
  // 电池充电完成阈值
  fullThreshold: 95,
  // 温度警告阈值（摄氏度）
  tempWarningThreshold: 40
};

/**
 * 太阳能配置
 */
const solarConfig = {
  // 太阳能最大功率
  maxPower: 2000,
  // 夜间启用时间
  nightModeStartHour: 18,
  // 白天启用时间
  dayModeStartHour: 6
};

/**
 * 天气配置
 */
const weatherConfig = {
  // 天气图标前缀路径
  iconBasePath: '/images/weather/',
  // 支持的天气类型
  supportedTypes: [
    { name: '晴', icon: 'sunny.png' },
    { name: '多云', icon: 'cloudy.png' },
    { name: '阴', icon: 'overcast.png' },
    { name: '小雨', icon: 'light_rain.png' },
    { name: '中雨', icon: 'moderate_rain.png' },
    { name: '大雨', icon: 'heavy_rain.png' },
    { name: '雷阵雨', icon: 'thunder.png' },
    { name: '雪', icon: 'snow.png' },
    { name: '雾', icon: 'fog.png' },
    { name: '霾', icon: 'haze.png' }
  ]
};

// 导出配置
module.exports = {
  serverConfig,
  appConfig,
  chartConfig,
  batteryConfig,
  solarConfig,
  weatherConfig,
  getWebSocketUrl,
  getApiBaseUrl,
  getDeviceId,
  getTheme,
  saveTheme,
  getAutoRefresh,
  getRefreshInterval,
  getAppConfig
}; 