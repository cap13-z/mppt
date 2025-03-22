/**
 * 小程序全局配置文件
 */

// 服务器配置
const serverConfig = {
  // WebSocket服务器地址（本地开发环境）
  wsUrl: 'ws://127.0.0.1:3000',
  // HTTP服务器地址（本地开发环境）
  apiUrl: 'http://127.0.0.1:3000',
  // API路径
  apiPaths: {
    history: '/api/history',
    deviceInfo: '/api/device-info',
    settings: '/api/settings'
  }
};

// 主题配置
const themeConfig = {
  light: {
    backgroundColor: '#f8f8f8',
    textColor: '#333333',
    cardBackground: '#ffffff',
    primaryColor: '#4a90e2'
  },
  dark: {
    backgroundColor: '#222222',
    textColor: '#eeeeee',
    cardBackground: '#333333',
    primaryColor: '#4a90e2'
  }
};

// 应用设置默认值
const defaultSettings = {
  theme: 'light',
  useMockData: true,  // 是否使用模拟数据（当WebSocket连接失败时）
  notifications: {
    alarm: true,
    lowBattery: true,
    weatherChange: false
  },
  dataRefresh: {
    autoRefresh: true,
    interval: 30 // 秒
  }
};

// 历史数据配置
const historyConfig = {
  defaultRange: 7, // 默认显示7天的数据
  chartColors: {
    battery: '#4a90e2',
    solar: '#f39c12',
    temperature: '#e74c3c'
  }
};

// 天气图标映射
const weatherIcons = {
  '晴朗': 'sunny.png',
  '晴': 'sunny.png',
  '多云': 'cloudy.png',
  '阴天': 'overcast.png',
  '阴': 'overcast.png',
  '小雨': 'light_rain.png',
  '中雨': 'moderate_rain.png',
  '大雨': 'heavy_rain.png',
  '雷雨': 'thunder.png'
};

module.exports = {
  serverConfig,
  themeConfig,
  defaultSettings,
  historyConfig,
  weatherIcons,
  appVersion: '1.0.0'
}; 