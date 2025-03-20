// 首页逻辑
// 获取App实例
const app = getApp();

// 引入各个数据服务
const batteryService = require('../../services/battery');
const solarService = require('../../services/solar');
const weatherService = require('../../services/weather');
const priceService = require('../../services/price');
const systemService = require('../../services/system');

// 引入工具类
const util = require('../../utils/util.js');
const api = require('../../utils/api.js');
const mock = require('../../utils/mock.js');

Page({
  /**
   * 页面的初始数据
   */
  data: {
    theme: 'dark',                  // 主题样式
    socketConnected: false,         // WebSocket连接状态
    systemData: {},                 // 系统状态数据
    batteryData: null,              // 电池数据
    solarData: null,                // 太阳能数据
    weatherData: null,              // 天气数据
    priceData: null,                // 电价数据
    isLoading: true,                // 加载状态
    hasError: false,                // 错误状态
    errorMessage: '',              // 错误消息
    
    // 系统状态信息
    systemStatus: '正常',
    lastUpdateTime: '加载中...',
    
    // 电池状态数据
    batteryCapacity: 0,
    batteryStatus: '未知',
    batteryCurrent: 0,
    batteryTemperature: 0,
    batteryTrend: '稳定',
    
    // 太阳能发电数据
    solarPower: 0,
    dailySolarGeneration: 0,
    solarEfficiency: 0,
    panelTemperature: 0,
    
    // 天气信息
    weatherType: '晴',
    temperature: 0,
    windSpeed: 0,
    humidity: 0,
    solarRadiation: 0,
    
    // 电网状态
    gridConnected: true,
    electricityPrice: 0,
    gridVoltage: 220,
    gridLoad: 0,
    
    // 能源消耗
    energyConsumption: 0,
    peakPower: 0,
    comparedToYesterday: 0,
    estimatedCost: 0,
    
    // 页面状态
    refreshInterval: null,
    lastBatteryCapacity: 0 // 上次电池容量，用于计算趋势
  },
  
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // 从全局获取主题设置
    this.setData({
      theme: app.globalData.theme
    });
    
    // 加载页面时立即获取数据
    this.loadAllData();
    
    // 获取用户设置，确定是否自动刷新
    const autoRefresh = wx.getStorageSync('autoRefresh') || false;
    if (autoRefresh) {
      const refreshTime = wx.getStorageSync('refreshInterval') || 60; // 默认60秒
      this.startAutoRefresh(refreshTime);
    }
  },
  
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    // 更新WebSocket连接状态
    this.setData({
      socketConnected: app.globalData.socketConnected
    });
    
    // 页面显示时，重新加载数据
    this.loadAllData();
  },
  
  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    // 页面隐藏时，停止自动刷新
    this.stopAutoRefresh();
  },
  
  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    // 页面卸载时，停止自动刷新
    this.stopAutoRefresh();
  },
  
  /**
   * 开始自动刷新数据
   */
  startAutoRefresh: function (seconds) {
    // 清除可能已存在的定时器
    this.stopAutoRefresh();
    
    // 设置新的定时器
    const refreshInterval = setInterval(() => {
      this.loadAllData();
    }, seconds * 1000);
    
    this.setData({
      refreshInterval: refreshInterval
    });
  },
  
  /**
   * 停止自动刷新
   */
  stopAutoRefresh: function () {
    if (this.data.refreshInterval) {
      clearInterval(this.data.refreshInterval);
      this.setData({
        refreshInterval: null
      });
    }
  },
  
  /**
   * 加载所有数据
   */
  loadAllData: function () {
    // 设置加载状态
    this.setData({
      isLoading: true,
      hasError: false,
      errorMessage: ''
    });
    
    // 记录上次电池容量用于计算趋势
    this.setData({
      lastBatteryCapacity: this.data.batteryCapacity
    });
    
    // 在实际应用中，这里应该从API获取数据
    // 目前使用模拟数据进行展示
    this.loadMockData();
    
    // 更新刷新时间
    const currentTime = util.formatTime(new Date());
    this.setData({
      lastUpdateTime: currentTime,
      isLoading: false
    });
  },
  
  /**
   * 加载模拟数据（实际开发中应替换为API调用）
   */
  loadMockData: function () {
    // 获取模拟数据
    const mockData = mock.getHomePageData();
    
    // 计算电池趋势
    let batteryTrend = '稳定';
    if (mockData.batteryCapacity > this.data.lastBatteryCapacity) {
      batteryTrend = '上升';
    } else if (mockData.batteryCapacity < this.data.lastBatteryCapacity) {
      batteryTrend = '下降';
    }
    
    // 更新页面数据
    this.setData({
      // 系统状态
      systemStatus: mockData.systemStatus,
      
      // 电池状态
      batteryCapacity: mockData.batteryCapacity,
      batteryStatus: mockData.batteryStatus,
      batteryCurrent: mockData.batteryCurrent,
      batteryTemperature: mockData.batteryTemperature,
      batteryTrend: batteryTrend,
      
      // 太阳能数据
      solarPower: mockData.solarPower,
      dailySolarGeneration: mockData.dailySolarGeneration,
      solarEfficiency: mockData.solarEfficiency,
      panelTemperature: mockData.panelTemperature,
      
      // 天气信息
      weatherType: mockData.weatherType,
      temperature: mockData.temperature,
      windSpeed: mockData.windSpeed,
      humidity: mockData.humidity,
      solarRadiation: mockData.solarRadiation,
      
      // 电网状态
      gridConnected: mockData.gridConnected,
      electricityPrice: mockData.electricityPrice,
      gridVoltage: mockData.gridVoltage,
      gridLoad: mockData.gridLoad,
      
      // 能源消耗
      energyConsumption: mockData.energyConsumption,
      peakPower: mockData.peakPower,
      comparedToYesterday: mockData.comparedToYesterday,
      estimatedCost: mockData.estimatedCost
    });
  },
  
  /**
   * 手动刷新数据
   */
  refreshData: function () {
    wx.showToast({
      title: '刷新中...',
      icon: 'loading',
      duration: 1000
    });
    
    this.loadAllData();
  },
  
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    return {
      title: '能源演示系统实时状态',
      path: '/pages/index/index',
      imageUrl: '/images/share-preview.png' // 分享预览图（需要添加）
    };
  },
  
  /**
   * 下拉刷新
   */
  onPullDownRefresh: function () {
    this.loadAllData();
    wx.stopPullDownRefresh();
  },
  
  // 处理数据更新事件
  onDataUpdate: function(data) {
    console.log('接收到数据更新:', data);
    // 调用更新所有数据的方法
    this.updateAllData(data);
  },
  
  // 重试加载
  retryLoad: function() {
    this.loadAllData();
  },
  
  // 更新所有数据
  updateAllData: function(data) {
    // 更新系统状态数据
    if (data.system) {
      const systemData = systemService.updateSystemData(data.system);
      this.setData({
        systemData: systemData
      });
    }
    
    // 更新电池数据
    if (data.battery) {
      const batteryData = batteryService.updateBatteryData(data.battery);
      this.setData({
        batteryData: batteryData
      });
    }
    
    // 更新太阳能数据
    if (data.solar) {
      const solarData = solarService.updateSolarData(data.solar);
      this.setData({
        solarData: solarData
      });
    }
    
    // 更新天气数据
    if (data.weather) {
      const weatherData = weatherService.updateWeatherData(data.weather);
      this.setData({
        weatherData: weatherData
      });
    }
    
    // 更新电价数据
    if (data.price) {
      const priceData = priceService.updatePriceData(data.price);
      this.setData({
        priceData: priceData
      });
    }
  }
}); 