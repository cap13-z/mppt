// 历史数据页面逻辑
const app = getApp();
// 改为用时注入模式，减少启动时加载的代码量
// const apiService = require('../../services/api-service');
// const dateUtil = require('../../utils/date-util');

// 分页配置
const PAGE_SIZE = 20; // 每页数据条数

Page({
  data: {
    // 页面主题
    theme: 'dark',
    // 当前选中的选项卡
    selectedTab: 'battery', // 使用selectedTab替代currentTab，并使用字符串而非数字索引
    // 日期选择范围
    dateRange: {
      start: '',
      end: ''
    },
    // 数据状态
    isLoading: false,
    hasError: false,
    errorMessage: '',
    // 分页加载状态
    isLoadingMore: false,
    hasMoreData: true,
    currentPage: 1,
    // 历史数据
    batteryData: [],
    solarData: [],
    weatherData: [],
    priceData: [],
    systemData: []
  },

  onLoad: function () {
    // 用时加载模块
    const dateUtil = require('../../utils/date-util');

    // 设置默认的开始日期和结束日期（最近7天）
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 7);
    
    this.setData({
      theme: app.globalData.theme || 'dark',
      'dateRange.start': dateUtil.formatDate(start),
      'dateRange.end': dateUtil.formatDate(end)
    });
    
    // 加载默认选项卡的历史数据
    this.loadHistoryData();
  },
  
  // 切换选项卡
  switchTab: function (e) {
    const tab = e.currentTarget.dataset.tab;
    if (tab !== this.data.selectedTab) {
      this.setData({
        selectedTab: tab,
        currentPage: 1,
        hasMoreData: true
      });
      
      // 重置数据并加载新选项卡数据
      const resetData = {};
      resetData[this.data.selectedTab + 'Data'] = [];
      resetData[tab + 'Data'] = [];
      this.setData(resetData);
      
      // 切换选项卡后加载数据
      this.loadHistoryData();
    }
  },
  
  // 开始日期变化事件
  bindDateChange: function (e) {
    const field = e.currentTarget.dataset.field;
    let updated = {};
    
    if (field === 'start') {
      updated['dateRange.start'] = e.detail.value;
    } else if (field === 'end') {
      updated['dateRange.end'] = e.detail.value;
    }
    
    // 更新日期范围后重置分页
    updated.currentPage = 1;
    updated.hasMoreData = true;
    
    // 清空当前选项卡数据
    const dataKey = this.data.selectedTab + 'Data';
    updated[dataKey] = [];
    
    this.setData(updated);
    this.loadHistoryData();
  },
  
  // 加载历史数据
  loadHistoryData: function () {
    // 用时加载模块
    const apiService = require('../../services/api-service');

    // 已经加载完所有数据，不再请求
    if (!this.data.hasMoreData && this.data.currentPage > 1) {
      return;
    }
    
    // 设置加载状态
    this.setData({
      isLoading: this.data.currentPage === 1, // 首页加载才显示整页loading
      isLoadingMore: this.data.currentPage > 1, // 加载更多时显示底部loading
      hasError: false
    });
    
    const params = {
      startDate: this.data.dateRange.start,
      endDate: this.data.dateRange.end,
      type: this.data.selectedTab,
      page: this.data.currentPage,
      pageSize: PAGE_SIZE
    };
    
    // 调用API服务获取历史数据
    apiService.getHistoryData(params)
      .then(res => {
        // 处理并格式化返回的数据
        const formattedData = this.formatHistoryData(res.data, this.data.selectedTab);
        
        // 获取当前选项卡的数据键名
        const dataKey = this.data.selectedTab + 'Data';
        
        // 构建更新对象
        const updateData = {
          isLoading: false,
          isLoadingMore: false
        };
        
        // 如果是第一页，直接设置数据，否则追加数据
        if (this.data.currentPage === 1) {
          updateData[dataKey] = formattedData;
        } else {
          // 合并当前数据和新加载的数据
          updateData[dataKey] = [...this.data[dataKey], ...formattedData];
        }
        
        // 更新是否还有更多数据的状态
        updateData.hasMoreData = formattedData.length >= PAGE_SIZE;
        
        this.setData(updateData);
      })
      .catch(err => {
        console.error('获取历史数据失败:', err);
        this.setData({
          isLoading: false,
          isLoadingMore: false,
          hasError: true,
          errorMessage: '获取数据失败，请重试'
        });
      });
  },
  
  // 加载更多数据
  onLoadMore: function() {
    if (!this.data.isLoading && !this.data.isLoadingMore && this.data.hasMoreData) {
      this.setData({
        currentPage: this.data.currentPage + 1
      });
      this.loadHistoryData();
    }
  },
  
  // 格式化历史数据
  formatHistoryData: function (data, type) {
    // 用时加载模块
    const dateUtil = require('../../utils/date-util');

    if (!data || !Array.isArray(data)) {
      return [];
    }
    
    return data.map(item => {
      // 格式化时间
      const formattedTime = item.timestamp ? dateUtil.formatTime(new Date(item.timestamp)) : '';
      
      // 基础格式化的数据对象
      const formattedItem = {
        timestamp: item.timestamp,
        formattedTime: formattedTime
      };
      
      // 根据不同类型的数据进行格式化
      switch (type) {
        case 'battery':
          formattedItem.capacity = item.capacity ? item.capacity + '%' : 'N/A';
          formattedItem.voltage = item.voltage ? item.voltage + 'V' : 'N/A';
          formattedItem.status = item.status || '未知';
          // 状态样式已移至WXS处理，提高性能
          break;
          
        case 'solar':
          formattedItem.power = item.power ? item.power + 'W' : 'N/A';
          formattedItem.efficiency = item.efficiency ? item.efficiency + '%' : 'N/A';
          formattedItem.voltage = item.voltage ? item.voltage + 'V' : 'N/A';
          break;
          
        case 'weather':
          formattedItem.temperature = item.temperature ? item.temperature + '°C' : 'N/A';
          formattedItem.humidity = item.humidity ? item.humidity + '%' : 'N/A';
          formattedItem.conditionName = item.condition || item.weather || '未知';
          break;
          
        case 'price':
          formattedItem.price = item.price ? item.price + '元/kWh' : 'N/A';
          formattedItem.levelName = item.level || '普通';
          break;
          
        case 'system':
          formattedItem.source = item.powerSource || item.source || '未知';
          formattedItem.load_power = item.loadPower ? item.loadPower + 'W' : 'N/A';
          break;
      }
      
      return formattedItem;
    });
  },
  
  // 重试按钮点击事件
  retryLoad: function () {
    // 重置到第一页重新加载
    this.setData({
      currentPage: 1,
      hasMoreData: true
    });
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