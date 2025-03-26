// 趋势页面逻辑
// 引入数据服务
const batteryService = require('../../services/battery');
const solarService = require('../../services/solar');
const weatherService = require('../../services/weather');
const priceService = require('../../services/price');
const systemService = require('../../services/system');

// 获取应用实例
const app = getApp();

Page({
  // 页面数据
  data: {
    theme: 'dark',
    selectedTab: 'battery', // 当前选中的数据类型 (battery, solar, weather, price)
    batteryData: [],
    solarData: [],
    weatherData: [],
    priceData: [],
    isLoading: false,
    hasError: false,
    errorMessage: '',
    dateRange: {
      start: '',
      end: ''
    }
  },
  
  // 页面加载时触发
  onLoad: function () {
    // 从全局获取主题设置
    this.setData({
      theme: app.globalData.theme
    });
    
    // 设置默认日期范围为最近7天
    this.setDefaultDateRange();
    // 加载初始数据
    this.loadBatteryData();
  },
  
  // 设置默认日期范围
  setDefaultDateRange: function () {
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const startDate = sevenDaysAgo.toISOString().split('T')[0];
    const endDate = now.toISOString().split('T')[0];
    
    this.setData({
      'dateRange.start': startDate,
      'dateRange.end': endDate
    });
  },
  
  // 切换数据选项卡
  switchTab: function (e) {
    const tab = e.currentTarget.dataset.tab;
    
    if (tab !== this.data.selectedTab) {
      this.setData({
        selectedTab: tab
      });
      
      // 加载对应的数据
      switch (tab) {
        case 'battery':
          this.loadBatteryData();
          break;
        case 'solar':
          this.loadSolarData();
          break;
        case 'weather':
          this.loadWeatherData();
          break;
        case 'price':
          this.loadPriceData();
          break;
      }
    }
  },
  
  // 加载电池历史数据
  loadBatteryData: function () {
    this.setData({
      isLoading: true,
      hasError: false
    });
    
    batteryService.fetchHistoryData(this.data.dateRange.start, this.data.dateRange.end)
      .then(data => {
        this.setData({
          batteryData: data,
          isLoading: false
        });
        // 渲染电池趋势图表
        this.renderBatteryChart(data);
      })
      .catch(error => {
        console.error('获取电池历史数据失败:', error);
        this.setData({
          isLoading: false,
          hasError: true,
          errorMessage: '获取电池数据失败，请稍后重试'
        });
      });
  },
  
  // 加载太阳能历史数据
  loadSolarData: function () {
    this.setData({
      isLoading: true,
      hasError: false
    });
    
    solarService.fetchHistoryData(this.data.dateRange.start, this.data.dateRange.end)
      .then(data => {
        this.setData({
          solarData: data,
          isLoading: false
        });
        // 渲染太阳能趋势图表
        this.renderSolarChart(data);
      })
      .catch(error => {
        console.error('获取太阳能历史数据失败:', error);
        this.setData({
          isLoading: false,
          hasError: true,
          errorMessage: '获取太阳能数据失败，请稍后重试'
        });
      });
  },
  
  // 加载天气历史数据
  loadWeatherData: function () {
    this.setData({
      isLoading: true,
      hasError: false
    });
    
    weatherService.fetchHistoryData(this.data.dateRange.start, this.data.dateRange.end)
      .then(data => {
        this.setData({
          weatherData: data,
          isLoading: false
        });
        // 渲染天气趋势图表
        this.renderWeatherChart(data);
      })
      .catch(error => {
        console.error('获取天气历史数据失败:', error);
        this.setData({
          isLoading: false,
          hasError: true,
          errorMessage: '获取天气数据失败，请稍后重试'
        });
      });
  },
  
  // 加载电价历史数据
  loadPriceData: function () {
    this.setData({
      isLoading: true,
      hasError: false
    });
    
    priceService.fetchHistoryData(this.data.dateRange.start, this.data.dateRange.end)
      .then(data => {
        this.setData({
          priceData: data,
          isLoading: false
        });
        // 渲染电价趋势图表
        this.renderPriceChart(data);
      })
      .catch(error => {
        console.error('获取电价历史数据失败:', error);
        this.setData({
          isLoading: false,
          hasError: true,
          errorMessage: '获取电价数据失败，请稍后重试'
        });
      });
  },
  
  // 日期范围变更
  bindDateChange: function (e) {
    const field = e.currentTarget.dataset.field;
    const value = e.detail.value;
    
    this.setData({
      [`dateRange.${field}`]: value
    });
    
    // 根据当前选中的选项卡重新加载数据
    switch (this.data.selectedTab) {
      case 'battery':
        this.loadBatteryData();
        break;
      case 'solar':
        this.loadSolarData();
        break;
      case 'weather':
        this.loadWeatherData();
        break;
      case 'price':
        this.loadPriceData();
        break;
    }
  },
  
  // 渲染电池趋势图表
  renderBatteryChart: function (data) {
    if (!data || data.length === 0) return;
    
    // 这里可以使用微信小程序的canvas绘制图表
    // 或使用第三方图表组件如echarts
    console.log('渲染电池趋势图表');
    
    // 简化的图表渲染逻辑
    // 实际项目中应使用完整的图表组件
  },
  
  // 渲染太阳能趋势图表
  renderSolarChart: function (data) {
    if (!data || data.length === 0) return;
    
    console.log('渲染太阳能趋势图表');
    // 简化的图表渲染逻辑
  },
  
  // 渲染天气趋势图表
  renderWeatherChart: function (data) {
    if (!data || data.length === 0) return;
    
    console.log('渲染天气趋势图表');
    // 简化的图表渲染逻辑
  },
  
  // 渲染电价趋势图表
  renderPriceChart: function (data) {
    if (!data || data.length === 0) return;
    
    console.log('渲染电价趋势图表');
    // 简化的图表渲染逻辑
  },
  
  // 重试加载数据
  retryLoad: function () {
    switch (this.data.selectedTab) {
      case 'battery':
        this.loadBatteryData();
        break;
      case 'solar':
        this.loadSolarData();
        break;
      case 'weather':
        this.loadWeatherData();
        break;
      case 'price':
        this.loadPriceData();
        break;
    }
  }
}); 