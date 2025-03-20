// 设置页面逻辑
const app = getApp();

Page({
  // 页面数据
  data: {
    theme: 'dark',  // 默认为暗色主题
    currentYear: new Date().getFullYear(),  // 当前年份，用于版权声明
    isLoggedIn: false,  // 登录状态
    
    // 通知设置
    notificationSettings: {
      alarm: true,          // 告警通知
      lowBattery: true,     // 低电量通知
      weatherChange: false  // 天气变化通知
    },
    
    // 数据设置
    dataSettings: {
      autoRefresh: true     // 自动刷新
    },
    
    // 刷新间隔选项
    refreshIntervals: ['5秒', '10秒', '30秒', '1分钟', '5分钟'],
    refreshIntervalIndex: 1  // 默认选择10秒
  },
  
  // 生命周期函数：页面加载时
  onLoad: function() {
    // 从全局获取主题设置
    this.setData({
      theme: app.globalData.theme || 'dark'
    });
    
    // 加载本地存储的设置
    this.loadSettings();
    
    // 检查登录状态
    this.checkLoginStatus();
  },
  
  // 切换主题
  switchTheme: function(e) {
    const isDark = e.detail.value;
    const theme = isDark ? 'dark' : 'light';
    
    // 更新页面数据
    this.setData({
      theme: theme
    });
    
    // 更新全局主题
    app.globalData.theme = theme;
    
    // 保存到本地存储
    wx.setStorageSync('theme', theme);
  },
  
  // 切换告警通知
  switchAlarmNotification: function(e) {
    const notificationSettings = this.data.notificationSettings;
    notificationSettings.alarm = e.detail.value;
    
    this.setData({
      notificationSettings: notificationSettings
    });
    
    this.saveSettings();
  },
  
  // 切换低电量通知
  switchLowBatteryNotification: function(e) {
    const notificationSettings = this.data.notificationSettings;
    notificationSettings.lowBattery = e.detail.value;
    
    this.setData({
      notificationSettings: notificationSettings
    });
    
    this.saveSettings();
  },
  
  // 切换天气变化通知
  switchWeatherNotification: function(e) {
    const notificationSettings = this.data.notificationSettings;
    notificationSettings.weatherChange = e.detail.value;
    
    this.setData({
      notificationSettings: notificationSettings
    });
    
    this.saveSettings();
  },
  
  // 切换自动刷新
  switchAutoRefresh: function(e) {
    const dataSettings = this.data.dataSettings;
    dataSettings.autoRefresh = e.detail.value;
    
    this.setData({
      dataSettings: dataSettings
    });
    
    this.saveSettings();
  },
  
  // 更新刷新间隔
  updateRefreshInterval: function(e) {
    this.setData({
      refreshIntervalIndex: e.detail.value
    });
    
    this.saveSettings();
  },
  
  // 显示关于应用信息
  showAbout: function() {
    wx.showModal({
      title: '关于应用',
      content: '能源演示系统小程序 v1.0.0\n\n一个实时监控能源系统数据的小程序，提供电池、太阳能、天气和电价等信息的实时查看和历史数据分析。',
      showCancel: false
    });
  },
  
  // 退出登录
  logout: function() {
    wx.showModal({
      title: '确认退出',
      content: '您确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          // 清除登录信息
          wx.removeStorageSync('token');
          wx.removeStorageSync('userInfo');
          
          // 更新登录状态
          this.setData({
            isLoggedIn: false
          });
          
          // 提示用户
          wx.showToast({
            title: '已退出登录',
            icon: 'success',
            duration: 2000
          });
        }
      }
    });
  },
  
  // 加载设置
  loadSettings: function() {
    try {
      // 尝试从本地存储加载设置
      const notificationSettings = wx.getStorageSync('notificationSettings');
      const dataSettings = wx.getStorageSync('dataSettings');
      const refreshIntervalIndex = wx.getStorageSync('refreshIntervalIndex');
      
      // 如果存在，更新数据
      if (notificationSettings) {
        this.setData({
          notificationSettings: notificationSettings
        });
      }
      
      if (dataSettings) {
        this.setData({
          dataSettings: dataSettings
        });
      }
      
      if (refreshIntervalIndex !== '') {
        this.setData({
          refreshIntervalIndex: refreshIntervalIndex
        });
      }
    } catch (e) {
      console.error('加载设置失败:', e);
    }
  },
  
  // 保存设置
  saveSettings: function() {
    try {
      // 保存设置到本地存储
      wx.setStorageSync('notificationSettings', this.data.notificationSettings);
      wx.setStorageSync('dataSettings', this.data.dataSettings);
      wx.setStorageSync('refreshIntervalIndex', this.data.refreshIntervalIndex);
    } catch (e) {
      console.error('保存设置失败:', e);
    }
  },
  
  // 检查登录状态
  checkLoginStatus: function() {
    // 检查是否有token
    const token = wx.getStorageSync('token');
    
    this.setData({
      isLoggedIn: !!token
    });
  },
  
  // 生命周期函数：页面显示时
  onShow: function() {
    // 重新检查登录状态，以防在其他页面登录/登出
    this.checkLoginStatus();
  },
  
  // 页面分享
  onShareAppMessage: function () {
    return {
      title: '能源演示系统 - 设置',
      path: '/pages/settings/settings'
    };
  }
});
