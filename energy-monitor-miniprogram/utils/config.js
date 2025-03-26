/**
 * 配置文件
 * 系统全局配置参数
 */

/**
 * 服务器配置
 */
const serverConfig = {
  // API基础地址
  apiUrl: 'http://localhost:3001',
  // WebSocket地址
  socketUrl: 'ws://localhost:3001',
  // API路径
  apiPaths: {
    home: '/api/home',
    history: '/api/history',
    trend: '/api/trend',
    device: '/api/device',
    auth: '/api/auth',
    deviceInfo: '/api/device/info'
  },
  // 请求超时时间
  timeout: 10000
};

/**
 * 应用配置
 */
const appConfig = {
  // 应用名称
  appName: '能源监控系统',
  // 默认主题
  defaultTheme: 'light',
  // 自动刷新间隔（毫秒）
  refreshInterval: 30000,
  // 是否使用模拟数据（开发环境设为true）
  useMockData: true,
  // 数据缓存时间（毫秒）
  cacheTime: 5 * 60 * 1000,
  // 调试模式
  debug: true
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
  weatherConfig
}; 