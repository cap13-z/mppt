// app.js
// 微信小程序全局JS文件，负责初始化全局数据和建立WebSocket连接

App({
  // 全局数据，可以在整个应用程序中访问
  globalData: {
    serverUrl: 'https://your-server-url.com', // 服务器URL，需要替换为实际地址
    wsUrl: 'wss://your-server-url.com',       // WebSocket URL，需要替换为实际地址
    socketConnected: false,                   // WebSocket连接状态
    latestData: {                             // 最新的设备数据
      battery: null,                          // 电池数据
      solar: null,                            // 太阳能数据
      weather: null,                          // 天气数据
      price: null,                            // 电价数据
      system: null                            // 系统状态数据
    },
    theme: 'dark'                             // 应用主题，默认为暗色主题
  },

  // 小程序启动时执行
  onLaunch: function() {
    console.log('小程序启动');
    // 初始化WebSocket连接
    this.initWebSocket();
    // 获取用户偏好设置
    this.loadUserPreferences();
  },

  // 初始化WebSocket连接
  initWebSocket: function() {
    const ws = require('./utils/websocket');
    // 连接到WebSocket服务器
    ws.connect(this.globalData.wsUrl);
    
    // 连接建立时的回调
    ws.onConnect(() => {
      console.log('WebSocket连接已建立');
      this.globalData.socketConnected = true;
    });
    
    // 接收消息时的回调
    ws.onMessage((data) => {
      console.log('收到WebSocket消息:', data);
      this.handleSocketMessage(data);
    });
    
    // 连接断开时的回调
    ws.onDisconnect(() => {
      console.log('WebSocket连接已断开');
      this.globalData.socketConnected = false;
      // 尝试重新连接
      setTimeout(() => {
        this.initWebSocket();
      }, 5000); // 5秒后重连
    });
  },

  // 处理WebSocket消息
  handleSocketMessage: function(message) {
    if (message.type === 'device-data') {
      // 处理设备数据
      this.updateLatestData(message.data);
    } else if (message.type === 'data-update') {
      // 处理数据更新
      this.updateLatestData(message.data);
    }
  },

  // 更新最新数据
  updateLatestData: function(data) {
    // 更新对应类型的数据
    if (data.battery) this.globalData.latestData.battery = data.battery;
    if (data.solar) this.globalData.latestData.solar = data.solar;
    if (data.weather) this.globalData.latestData.weather = data.weather;
    if (data.price) this.globalData.latestData.price = data.price;
    if (data.system) this.globalData.latestData.system = data.system;
    
    // 发送数据更新事件，通知页面刷新数据
    this.triggerDataUpdateEvent();
  },

  // 触发数据更新事件
  triggerDataUpdateEvent: function() {
    // 使用自定义事件通知页面数据已更新
    const pages = getCurrentPages();
    if (pages.length > 0) {
      const currentPage = pages[pages.length - 1];
      if (currentPage && currentPage.onDataUpdate) {
        currentPage.onDataUpdate(this.globalData.latestData);
      }
    }
  },

  // 加载用户偏好设置
  loadUserPreferences: function() {
    try {
      // 尝试从本地存储读取用户偏好设置
      const theme = wx.getStorageSync('theme') || 'dark';
      this.globalData.theme = theme;
    } catch (e) {
      console.error('读取用户偏好设置失败:', e);
    }
  },

  // 保存用户偏好设置
  saveUserPreferences: function() {
    try {
      // 保存主题设置到本地存储
      wx.setStorageSync('theme', this.globalData.theme);
    } catch (e) {
      console.error('保存用户偏好设置失败:', e);
    }
  }
}) 