/**
 * 能源监控小程序 - 入口文件
 */
const config = require('./utils/config');
const websocket = require('./utils/websocket');

App({
  // 全局数据
  globalData: {
    theme: config.defaultSettings.theme, // 默认主题
    userInfo: null,                     // 用户信息
    hasLogin: false,                    // 是否已登录
    socketConnected: false,             // WebSocket连接状态
    batteryData: null,                  // 电池数据
    solarData: null,                    // 太阳能数据
    weatherData: null,                  // 天气数据
    gridData: null,                     // 电网数据
    lastUpdateTime: null                // 最后更新时间
  },
  
  /**
   * 小程序启动时执行
   */
  onLaunch: function() {
    console.log('小程序启动');
    
    // 从本地存储加载用户设置
    this.loadUserSettings();
    
    // 连接WebSocket
    this.connectWebSocket();
  },
  
  /**
   * WebSocket连接
   */
  connectWebSocket: function() {
    console.log('正在连接WebSocket...');
    
    // 连接WebSocket
    websocket.connect();
    
    // 注册全局数据更新处理器
    websocket.registerHandler(this.handleWebSocketMessage);
    
    // 设置连接状态
    this.globalData.socketConnected = true;
  },
  
  /**
   * 处理WebSocket消息
   * @param {Object} data - 收到的数据
   */
  handleWebSocketMessage: function(data) {
    console.log('App收到WebSocket消息:', data);
    
    // 更新全局数据
    if (data.battery) {
      this.globalData.batteryData = data.battery;
    }
    
    if (data.solar) {
      this.globalData.solarData = data.solar;
    }
    
    if (data.weather) {
      this.globalData.weatherData = data.weather;
    }
    
    if (data.grid) {
      this.globalData.gridData = data.grid;
    }
    
    // 更新最后更新时间
    this.globalData.lastUpdateTime = new Date();
  },
  
  /**
   * 从本地存储加载用户设置
   */
  loadUserSettings: function() {
    try {
      // 加载主题设置
      const theme = wx.getStorageSync('theme');
      if (theme) {
        this.globalData.theme = theme;
      }
      
      // 加载用户信息
      const userInfo = wx.getStorageSync('userInfo');
      if (userInfo) {
        this.globalData.userInfo = userInfo;
        this.globalData.hasLogin = true;
      }
    } catch (error) {
      console.error('加载用户设置失败:', error);
    }
  },
  
  /**
   * 设置主题
   * @param {string} theme - 主题名称
   */
  setTheme: function(theme) {
    this.globalData.theme = theme;
    wx.setStorageSync('theme', theme);
  },
  
  /**
   * 小程序显示时执行
   */
  onShow: function() {
    // 如果WebSocket连接已断开，重新连接
    if (!this.globalData.socketConnected) {
      this.connectWebSocket();
    }
  },
  
  /**
   * 小程序隐藏时执行
   */
  onHide: function() {
    // 小程序隐藏时，不主动断开WebSocket连接，保持接收数据
  },
  
  /**
   * 发生错误时执行
   */
  onError: function(error) {
    console.error('小程序发生错误:', error);
  }
}); 