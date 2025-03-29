/**
 * 首页逻辑处理
 * 负责展示实时监控数据
 */

// 导入工具模块和依赖
const util = require('../../utils/util');
const config = require('../../utils/config');
const mock = require('../../utils/mock');

Page({
  // 页面数据
  data: {
    // 系统状态
    systemStatus: '正常',
    updateTime: '加载中...',
    
    // 电池状态数据
    batteryCapacity: 0,
    batteryStatus: '未知',
    batteryCurrent: 0,
    batteryTemperature: 0,
    chargingStatus: '稳定',
    
    // 太阳能数据
    solarPower: 0,
    dailySolarGeneration: 0,
    solarEfficiency: 0,
    panelTemperature: 0,
    
    // 天气信息
    weatherType: '未知',
    temperature: 0,
    windSpeed: 0,
    humidity: 0,
    
    // 电网状态
    gridConnected: true,
    electricityPrice: 0,
    gridVoltage: 0,
    gridLoad: 0,
    
    // 页面状态
    isLoading: true,
    hasError: false,
    errorMessage: '',
    
    // 当前标签页
    activeTab: 'home',
    
    // 测试数据按钮
    showTestButton: true
  },

  // 生命周期函数--监听页面加载
  onLoad: function (options) {
    // 初始化数据
    this.refreshData();
    
    // 初始化WebSocket连接
    this.initWebSocket();
    
    // 设置定时刷新数据
    this.dataRefreshTimer = setInterval(() => {
      this.refreshData();
    }, 30000); // 每30秒刷新一次
  },
  
  // 生命周期函数--监听页面显示
  onShow: function () {
    if (!this.data.isLoading && !this.data.hasError) {
      this.refreshData();
    }
  },
  
  // 生命周期函数--监听页面卸载
  onUnload: function () {
    try {
      // 关闭WebSocket连接
      const websocket = require('../../utils/websocket');
      
      // 注销消息处理器
      if (this.handleWebSocketMessage) {
        websocket.removeHandler(this.handleWebSocketMessage);
      }
      
      // 清除定时器
      if (this.dataRefreshTimer) {
        clearInterval(this.dataRefreshTimer);
      }
      
      // 关闭WebSocket
      websocket.close();
    } catch (e) {
      console.error('页面卸载时出错:', e);
    }
  },
  
  // 用户下拉刷新
  onPullDownRefresh: function () {
    this.refreshData();
    
    // 停止下拉刷新动画
    setTimeout(() => {
      wx.stopPullDownRefresh();
    }, 1000);
  },
  
  // 刷新数据
  refreshData: function() {
    this.setData({
      isLoading: true,
      hasError: false
    });
    
    // 尝试通过API获取数据
    try {
      const api = require('../../utils/api');
      api.getStatus().then(res => {
        this.updateUIWithData(res);
      }).catch(err => {
        console.error('获取状态数据失败:', err);
        this.setData({
          isLoading: false,
          hasError: true,
          errorMessage: '获取数据失败，请检查网络连接'
        });
      });
    } catch (error) {
      console.error('刷新数据出错:', error);
      this.setData({
        isLoading: false,
        hasError: true,
        errorMessage: '获取数据失败，请检查网络连接'
      });
    }
  },
  
  // 初始化WebSocket
  initWebSocket: function() {
    try {
      const websocket = require('../../utils/websocket');
      
      // 注册消息处理器
      this.handleWebSocketMessage = (data) => {
        if (data && data.type === 'status') {
          this.updateUIWithData(data.data);
        }
      };
      
      websocket.registerHandler('message', this.handleWebSocketMessage);
      
      // 连接WebSocket
      websocket.connect();
    } catch (error) {
      console.error('初始化WebSocket出错:', error);
    }
  },
  
  // 使用接收到的数据更新UI
  updateUIWithData: function(data) {
    if (!data) return;
    
    console.log('接收到数据:', data);
    
    // 格式化数据，确保所有值都是适合显示的格式
    const formattedData = {
      // 系统状态
      systemStatus: data.systemStatus || '未知',
      updateTime: data.updateTime ? util.formatTime(new Date(data.updateTime)) : util.formatTime(new Date()),
      
      // 电池状态
      batteryCapacity: this.formatNumberData(data.batteryCapacity, 0),
      batteryStatus: typeof data.batteryStatus === 'string' ? data.batteryStatus : '未知',
      batteryCurrent: this.formatNumberData(data.batteryCurrent, 1),
      batteryTemperature: this.formatNumberData(data.batteryTemperature, 0),
      
      // 太阳能数据
      solarPower: this.formatNumberData(data.solarPower, 2),
      dailySolarGeneration: this.formatNumberData(data.dailySolarGeneration, 1),
      solarEfficiency: this.formatNumberData(data.solarEfficiency, 0),
      panelTemperature: this.formatNumberData(data.panelTemperature, 0),
      
      // 天气信息
      weatherType: data.weatherType || '未知',
      temperature: this.formatNumberData(data.temperature, 0),
      windSpeed: this.formatNumberData(data.windSpeed, 1),
      humidity: this.formatNumberData(data.humidity, 0),
      
      // 电网状态
      gridConnected: data.gridConnected !== undefined ? data.gridConnected : true,
      electricityPrice: this.formatNumberData(data.electricityPrice, 2),
      gridVoltage: this.formatNumberData(data.gridVoltage, 0),
      gridLoad: this.formatNumberData(data.gridLoad, 1),
      
      // 更新页面状态
      isLoading: false,
      hasError: false
    };
    
    console.log('格式化后的数据:', formattedData);
    
    // 更新页面数据
    this.setData(formattedData);
  },
  
  // 格式化数字数据
  formatNumberData: function(value, decimal = 0) {
    if (value === undefined || value === null || isNaN(Number(value))) {
      return decimal === 0 ? 0 : Number(0).toFixed(decimal);
    }
    
    const num = Number(value);
    return decimal === 0 ? Math.round(num) : num.toFixed(decimal);
  },
  
  // 加载测试数据
  testLoadMockData: function() {
    try {
      console.log('开始加载模拟数据...');
      const mock = require('../../utils/mock');
      const mockData = mock.getHomePageData();
      
      // 处理可能的嵌套对象
      const processedData = { ...mockData };
      
      // 如果存在battery对象，将其属性展开
      if (processedData.battery && typeof processedData.battery === 'object') {
        console.log('展开battery对象');
        Object.keys(processedData.battery).forEach(key => {
          processedData[`battery${key.charAt(0).toUpperCase() + key.slice(1)}`] = processedData.battery[key];
        });
        delete processedData.battery;
      }
      
      // 如果存在solar对象，将其属性展开
      if (processedData.solar && typeof processedData.solar === 'object') {
        console.log('展开solar对象');
        Object.keys(processedData.solar).forEach(key => {
          processedData[`solar${key.charAt(0).toUpperCase() + key.slice(1)}`] = processedData.solar[key];
        });
        delete processedData.solar;
      }
      
      // 详细输出数据内容
      console.log('==== 模拟数据详情 ====');
      console.log('电池状态:', typeof processedData.batteryStatus, processedData.batteryStatus);
      console.log('电池容量:', typeof processedData.batteryCapacity, processedData.batteryCapacity);
      console.log('太阳能功率:', typeof processedData.solarPower, processedData.solarPower);
      console.log('处理后的数据对象:', JSON.stringify(processedData));
      console.log('===== 结束 =====');
      
      this.updateUIWithData(processedData);
      
      wx.showToast({
        title: '已加载测试数据',
        icon: 'success',
        duration: 2000
      });
    } catch (error) {
      console.error('测试加载数据失败:', error);
      wx.showToast({
        title: '加载测试数据失败',
        icon: 'none',
        duration: 2000
      });
    }
  },
  
  // 切换标签页
  switchTab: function(e) {
    const tab = e.currentTarget.dataset.tab;
    if (tab === this.data.activeTab) return;
    
    this.setData({
      activeTab: tab
    });
    
    if (tab === 'home') {
      this.refreshData();
    }
  }
}); 