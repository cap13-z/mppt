// 历史数据页面逻辑
const app = getApp();
const apiService = require('../../services/api-service');
const dateUtil = require('../../utils/date-util');

Page({
  data: {
    // 页面主题
    theme: 'dark',
    // 当前选中的选项卡索引
    currentTab: 0,
    // 选项卡标题
    tabs: ['电池', '太阳能', '天气', '电价', '系统'],
    // 日期选择范围
    startDate: '',
    endDate: '',
    // 数据状态
    isLoading: false,
    hasError: false,
    errorMsg: '',
    // 历史数据
    historyData: {
      battery: [],
      solar: [],
      weather: [],
      price: [],
      system: []
    }
  },

  onLoad: function () {
    // 设置默认的开始日期和结束日期（最近7天）
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 7);
    
    this.setData({
      theme: app.globalData.theme || 'dark',
      startDate: dateUtil.formatDate(start),
      endDate: dateUtil.formatDate(end)
    });
    
    // 加载默认选项卡的历史数据
    this.loadHistoryData();
  },
  
  // 切换选项卡
  switchTab: function (e) {
    const tabIndex = e.currentTarget.dataset.index;
    if (tabIndex !== this.data.currentTab) {
      this.setData({
        currentTab: tabIndex
      });
      
      // 如果当前选项卡没有数据，则加载数据
      const tabKey = this.getTabKey(tabIndex);
      if (this.data.historyData[tabKey].length === 0) {
        this.loadHistoryData();
      }
    }
  },
  
  // 根据选项卡索引获取对应的数据键名
  getTabKey: function (tabIndex) {
    const tabKeys = ['battery', 'solar', 'weather', 'price', 'system'];
    return tabKeys[tabIndex] || 'battery';
  },
  
  // 开始日期变化事件
  bindStartDateChange: function (e) {
    this.setData({
      startDate: e.detail.value
    });
    this.loadHistoryData();
  },
  
  // 结束日期变化事件
  bindEndDateChange: function (e) {
    this.setData({
      endDate: e.detail.value
    });
    this.loadHistoryData();
  },
  
  // 加载历史数据
  loadHistoryData: function () {
    // 设置加载状态
    this.setData({
      isLoading: true,
      hasError: false
    });
    
    const tabKey = this.getTabKey(this.data.currentTab);
    const params = {
      startDate: this.data.startDate,
      endDate: this.data.endDate,
      type: tabKey
    };
    
    // 调用API服务获取历史数据
    apiService.getHistoryData(params)
      .then(res => {
        // 处理并格式化返回的数据
        const formattedData = this.formatHistoryData(res.data, tabKey);
        
        // 更新对应选项卡的历史数据
        const historyData = this.data.historyData;
        historyData[tabKey] = formattedData;
        
        this.setData({
          historyData: historyData,
          isLoading: false
        });
      })
      .catch(err => {
        console.error('获取历史数据失败:', err);
        this.setData({
          isLoading: false,
          hasError: true,
          errorMsg: '获取数据失败，请重试'
        });
      });
  },
  
  // 格式化历史数据
  formatHistoryData: function (data, type) {
    if (!data || !Array.isArray(data)) {
      return [];
    }
    
    return data.map(item => {
      // 格式化时间
      const formattedTime = item.timestamp ? dateUtil.formatTime(new Date(item.timestamp)) : '';
      
      // 根据不同类型的数据进行格式化
      switch (type) {
        case 'battery':
          return {
            time: formattedTime,
            capacity: item.capacity ? item.capacity + '%' : 'N/A',
            voltage: item.voltage ? item.voltage + 'V' : 'N/A',
            status: item.status || '未知'
          };
          
        case 'solar':
          return {
            time: formattedTime,
            power: item.power ? item.power + 'W' : 'N/A',
            efficiency: item.efficiency ? item.efficiency + '%' : 'N/A',
            voltage: item.voltage ? item.voltage + 'V' : 'N/A'
          };
          
        case 'weather':
          return {
            time: formattedTime,
            temperature: item.temperature ? item.temperature + '°C' : 'N/A',
            humidity: item.humidity ? item.humidity + '%' : 'N/A',
            condition: item.condition || '未知'
          };
          
        case 'price':
          return {
            time: formattedTime,
            price: item.price ? item.price + '元/kWh' : 'N/A',
            level: item.level || '普通'
          };
          
        case 'system':
          return {
            time: formattedTime,
            powerSource: item.powerSource || '未知',
            loadPower: item.loadPower ? item.loadPower + 'W' : 'N/A'
          };
          
        default:
          return item;
      }
    });
  },
  
  // 重试按钮点击事件
  handleRetry: function () {
    this.loadHistoryData();
  },
  
  // 页面分享
  onShareAppMessage: function () {
    return {
      title: '能源监控 - 历史数据',
      path: '/pages/history/history'
    };
  }
}); 