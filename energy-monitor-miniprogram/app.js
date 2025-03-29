/**
 * 能源监控小程序 - 入口文件
 */
const config = require('./utils/config');
const util = require('./utils/util');
const websocket = require('./utils/websocket');

App({
  // 全局数据
  globalData: {
    userInfo: null,
    theme: 'dark',
    connected: false
  },

  /**
   * 小程序启动时执行
   */
  onLaunch: function() {
    console.log('小程序启动');
    
    // 获取本地存储的主题设置
    const theme = wx.getStorageSync('theme');
    if (theme) {
      this.globalData.theme = theme;
    } else {
      // 使用默认主题
      this.globalData.theme = config.appConfig.defaultTheme;
      wx.setStorageSync('theme', this.globalData.theme);
    }
    
    // 初始化WebSocket连接
    this.initWebSocket();
    
    // 检查更新
    this.checkUpdate();
  },
  
  /**
   * 初始化WebSocket连接
   */
  initWebSocket: function() {
    try {
      // 连接WebSocket
      websocket.connect()
        .then(() => {
          console.log('全局WebSocket连接成功');
          this.globalData.connected = true;
        })
        .catch(error => {
          console.error('全局WebSocket连接失败:', error);
        });
    } catch (error) {
      console.error('初始化WebSocket错误:', error);
    }
  },
  
  /**
   * 检查小程序更新
   */
  checkUpdate: function() {
    if (wx.canIUse('getUpdateManager')) {
      const updateManager = wx.getUpdateManager();
      
      updateManager.onCheckForUpdate(function(res) {
        if (res.hasUpdate) {
          console.log('有新版本可用');
        }
      });
      
      updateManager.onUpdateReady(function() {
        wx.showModal({
          title: '更新提示',
          content: '新版本已准备好，是否重启应用？',
          success: function(res) {
            if (res.confirm) {
              updateManager.applyUpdate();
            }
          }
        });
      });
      
      updateManager.onUpdateFailed(function() {
        console.log('新版本下载失败');
      });
    }
  },
  
  /**
   * 切换主题
   * @param {string} theme 主题名称 ('light' 或 'dark')
   */
  switchTheme: function(theme) {
    this.globalData.theme = theme;
    wx.setStorageSync('theme', theme);
  },
  
  /**
   * 获取当前主题设置
   * @returns {string} 当前主题
   */
  getTheme: function() {
    return this.globalData.theme;
  }
}); 