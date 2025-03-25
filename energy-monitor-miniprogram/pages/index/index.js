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

// 引入WebSocket相关模块
const websocket = require('../../utils/websocket');
const config = require('../../utils/config');

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
    lastBatteryCapacity: 0, // 上次电池容量，用于计算趋势
    
    // 系统状态数据
    batteryStatus: {
      voltage: 0,
      capacity: 0,
      temperature: 0,
      current: 0,
      status: '正在检测...'
    },
    solarPower: {
      power: 0,
      voltage: 0,
      current: 0,
      todayEnergy: 0,
      temperature: 0
    },
    weather: {
      temperature: 0,
      humidity: '0%',
      condition: '晴',
      icon: '../../images/weather/sunny.png'
    },
    // 界面状态
    connected: false,
    loading: true,
    lastUpdate: '正在连接...'
  },
  
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log('首页加载');
    // 从本地存储获取主题设置
    if (app.globalData && app.globalData.theme) {
      this.setData({
        theme: app.globalData.theme
      });
    } else {
      // 从存储中读取主题设置
      const savedTheme = wx.getStorageSync('theme');
      if (savedTheme) {
        this.setData({
          theme: savedTheme
        });
        if (app.globalData) {
          app.globalData.theme = savedTheme;
        }
      }
    }
    
    // 加载页面时立即获取数据
    this.loadAllData();
    
    // 获取用户设置，确定是否自动刷新
    const autoRefresh = wx.getStorageSync('autoRefresh') || false;
    if (autoRefresh) {
      const refreshTime = wx.getStorageSync('refreshInterval') || 60; // 默认60秒
      this.startAutoRefresh(refreshTime);
    }

    // 初始化WebSocket连接
    this.initWebSocket();
  },
  
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    // 页面显示时，确保WebSocket连接
    if (!this.data.connected) {
      this.initWebSocket();
    }
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
    // 移除消息处理器
    websocket.removeHandler(this.handleWebSocketMessage);
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
    // 使用mock模块获取模拟数据
    try {
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
        estimatedCost: mockData.estimatedCost,
        
        // 新增 - 直接存储完整的数据对象
        batteryData: mockData.battery,
        solarData: mockData.solar,
        powerStatus: mockData.powerStatus,
        weatherData: mockData.weather,
        priceData: mockData.price,
        
        // 更新UI状态
        connected: true,
        loading: false,
        lastUpdate: util.formatTime(new Date())
      });
    } catch (error) {
      console.error('加载模拟数据失败:', error);
      this.setData({
        hasError: true,
        errorMessage: '加载数据失败，请重试',
        loading: false
      });
    }
  },
  
  /**
   * 初始化WebSocket连接
   */
  initWebSocket: function() {
    console.log('初始化WebSocket连接');
    
    // 连接WebSocket
    websocket.connect();
    
    // 注册消息处理器
    this.handleWebSocketMessage = (data) => {
      console.log('首页收到WebSocket消息:', data);
      
      // 处理消息更新UI
      this.processWebSocketData(data);
      
      // 更新连接状态
      this.setData({
        connected: true,
        loading: false,
        lastUpdate: util.formatTime(new Date())
      });
    };
    
    // 注册消息处理器
    websocket.registerHandler(this.handleWebSocketMessage);
  },
  
  /**
   * 处理WebSocket数据 - 适配新的数据格式
   */
  processWebSocketData: function(data) {
    try {
      console.log('处理接收到的数据', Object.keys(data));
      
      if (!data) {
        console.error('收到空数据');
        return;
      }
      
      // 获取天气条件 - 支持多种字段名
      const weatherData = data.weather || {};
      const weatherCondition = weatherData.condition || weatherData.weather || weatherData.weather_condition || '未知';
      
      // 根据天气条件确定图标
      const weatherIconFile = this.getWeatherIcon(weatherCondition);
      
      // 兼容处理，确保各个数据对象存在
      const battery = data.battery || {};
      const solar = data.solar || {};
      const weather = data.weather || {};
      const powerStatus = data.powerStatus || {};
      const price = data.price || {};
      
      // 计算电池趋势
      let batteryTrend = '稳定';
      if (battery.capacity > this.data.lastBatteryCapacity) {
        batteryTrend = '上升';
      } else if (battery.capacity < this.data.lastBatteryCapacity) {
        batteryTrend = '下降';
      }
      
      // 根据天气条件确定图标
      let weatherIcon = '../../images/weather/sunny.png';
      if (weatherCondition.includes('多云')) {
        weatherIcon = '../../images/weather/cloudy.png';
      } else if (weatherCondition.includes('阴')) {
        weatherIcon = '../../images/weather/overcast.png';
      } else if (weatherCondition.includes('小雨')) {
        weatherIcon = '../../images/weather/light_rain.png';
      } else if (weatherCondition.includes('中雨')) {
        weatherIcon = '../../images/weather/moderate_rain.png';
      } else if (weatherCondition.includes('大雨')) {
        weatherIcon = '../../images/weather/heavy_rain.png';
      } else if (weatherCondition.includes('雷')) {
        weatherIcon = '../../images/weather/thunder.png';
      }
      
      // 更新页面数据 - 同时兼容旧格式和新格式
      this.setData({
        // 存储完整的数据对象
        batteryData: battery,
        solarData: solar,
        weatherData: weather,
        powerStatus: powerStatus,
        priceData: price,
        
        // 电池状态
        batteryCapacity: battery.capacity || 0,
        batteryStatus: battery.status || '未知',
        batteryCurrent: battery.current || 0,
        batteryTemperature: battery.temperature || 0,
        batteryVoltage: battery.voltage || 0,
        batteryTrend: batteryTrend,
        
        // 太阳能数据
        solarPower: solar.power || 0,
        solarVoltage: solar.voltage || 0,
        solarCurrent: solar.current || 0,
        solarEfficiency: solar.efficiency || 0,
        panelTemperature: solar.temperature || 0,
        
        // 天气信息
        weatherType: weatherCondition,
        temperature: weather.temperature || 0,
        humidity: weather.humidity || 0,
        solarRadiation: weather.solar_radiation || 0,
        weather: {
          temperature: weather.temperature || 0,
          humidity: `${weather.humidity || 0}%`,
          condition: weatherCondition,
          icon: weatherIcon
        },
        
        // 电网状态
        gridConnected: powerStatus.grid_status === '正常',
        electricityPrice: price.price || 0,
        gridVoltage: powerStatus.grid_voltage || 220,
        gridLoad: powerStatus.load_power || 0,
        
        // 系统状态
        systemStatus: powerStatus.system_status || '正常运行中',
        
        // 更新UI状态
        connected: true,
        loading: false,
        lastUpdate: util.formatTime(new Date())
      });
    } catch (error) {
      console.error('处理WebSocket数据失败:', error);
    }
  },
  
  /**
   * 手动刷新数据
   */
  refreshData: function () {
    this.setData({ loading: true });
    
    // 发送刷新请求
    websocket.send({
      type: 'refresh',
      timestamp: new Date().toISOString()
    }).catch(error => {
      console.error('发送刷新请求失败:', error);
      this.setData({ loading: false });
    });
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
  
  /**
   * 重试加载
   */
  retryLoad: function() {
    this.loadAllData();
  },
  
  /**
   * 更新页面数据
   */
  updatePageData: function() {
    try {
      // 获取最新的模拟数据
      const mockData = mock.getHomePageData();
      this.setData(mockData);
    } catch (error) {
      console.error('更新页面数据失败:', error);
    }
  },
  
  /**
   * 根据天气条件获取天气图标
   */
  getWeatherIcon: function(condition) {
    if (!condition) return '../../images/weather/sunny.png';
    
    // 转小写并去除空格以便匹配
    const conditionLower = condition.toLowerCase().trim();
    
    if (conditionLower.includes('晴')) {
      return '../../images/weather/sunny.png';
    } else if (conditionLower.includes('多云')) {
      return '../../images/weather/cloudy.png';
    } else if (conditionLower.includes('阴')) {
      return '../../images/weather/overcast.png';
    } else if (conditionLower.includes('雷') && conditionLower.includes('雨')) {
      return '../../images/weather/thunder.png';
    } else if (conditionLower.includes('雨')) {
      if (conditionLower.includes('大') || conditionLower.includes('暴')) {
        return '../../images/weather/heavy_rain.png';
      } else {
        return '../../images/weather/light_rain.png';
      }
    } else if (conditionLower.includes('雪')) {
      return '../../images/weather/snow.png';
    } else if (conditionLower.includes('雾')) {
      return '../../images/weather/fog.png';
    } else if (conditionLower.includes('霾') || conditionLower.includes('haze')) {
      return '../../images/weather/haze.png';
    } else if (conditionLower.includes('尘') || conditionLower.includes('沙') || conditionLower.includes('dust')) {
      return '../../images/weather/dust.png';
    }
    
    // 默认图标
    return '../../images/weather/sunny.png';
  }
}); 