// 历史数据页面逻辑
const app = getApp();
// 改为用时注入模式，减少启动时加载的代码量
// const apiService = require('../../services/api-service');
// const dateUtil = require('../../utils/date-util');

// 分页配置
const PAGE_SIZE = 20; // 每页数据条数

// 屏幕高度和每行高度，用于计算虚拟列表
let screenHeight = 0; // 屏幕高度，onLoad时获取
const ROW_HEIGHT = 60; // 每行高度，单位rpx
const VISIBLE_ITEM_COUNT = 15; // 可见条目数量

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
    systemData: [],
    // 虚拟列表相关
    startIndex: 0, // 可视区域起始索引
    endIndex: VISIBLE_ITEM_COUNT, // 可视区域结束索引
    scrollTop: 0, // 滚动位置
    placeholderTop: 0, // 上部占位高度
    placeholderBottom: 0, // 下部占位高度
    // 下拉刷新状态
    isRefreshing: false
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
    
    // 获取屏幕高度，用于虚拟列表计算
    const systemInfo = wx.getSystemInfoSync();
    screenHeight = systemInfo.windowHeight;
    
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
        hasMoreData: true,
        // 重置虚拟列表状态
        startIndex: 0,
        endIndex: VISIBLE_ITEM_COUNT,
        scrollTop: 0,
        placeholderTop: 0,
        placeholderBottom: 0
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
    
    // 重置虚拟列表状态
    updated.startIndex = 0;
    updated.endIndex = VISIBLE_ITEM_COUNT;
    updated.scrollTop = 0;
    updated.placeholderTop = 0;
    updated.placeholderBottom = 0;
    
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
      isLoading: this.data.currentPage === 1 && !this.data.isRefreshing, // 首页加载才显示整页loading，但下拉刷新时不显示
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
          isLoadingMore: false,
          isRefreshing: false
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
        
        // 更新虚拟列表的占位高度
        this.updatePlaceholders(updateData[dataKey].length);
        
        this.setData(updateData);
        
        // 停止下拉刷新动画
        if (this.data.isRefreshing) {
          wx.stopPullDownRefresh();
        }
      })
      .catch(err => {
        console.error('获取历史数据失败:', err);
        this.setData({
          isLoading: false,
          isLoadingMore: false,
          isRefreshing: false,
          hasError: true,
          errorMessage: '获取数据失败，请重试'
        });
        
        // 停止下拉刷新动画
        if (this.data.isRefreshing) {
          wx.stopPullDownRefresh();
        }
      });
  },
  
  // 下拉刷新事件
  onPullDownRefresh: function() {
    this.setData({
      isRefreshing: true,
      currentPage: 1,
      hasMoreData: true
    });
    this.loadHistoryData();
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
  
  // 滚动事件处理，用于虚拟列表
  onTableScroll: function(e) {
    const scrollTop = e.detail.scrollTop;
    // 计算当前可见的起始索引
    const startIndex = Math.floor(scrollTop / (ROW_HEIGHT * (wx.getSystemInfoSync().windowWidth / 750)));
    const endIndex = Math.min(
      startIndex + VISIBLE_ITEM_COUNT,
      this.getListData().length
    );
    
    // 优化：滚动距离较小时不更新视图
    if (Math.abs(scrollTop - this.data.scrollTop) > 30) {
      this.setData({
        startIndex: Math.max(0, startIndex - 5), // 向上多渲染5条，减少空白
        endIndex: endIndex + 5, // 向下多渲染5条
        scrollTop: scrollTop
      });
      
      this.updatePlaceholders();
    }
  },
  
  // 更新虚拟列表的占位高度
  updatePlaceholders: function(totalLength) {
    const totalItems = totalLength || this.getListData().length;
    // 计算每行的实际像素高度
    const rowHeightPx = ROW_HEIGHT * (wx.getSystemInfoSync().windowWidth / 750);
    
    // 计算占位高度
    const placeholderTop = Math.max(0, this.data.startIndex) * rowHeightPx;
    const placeholderBottom = Math.max(0, totalItems - this.data.endIndex) * rowHeightPx;
    
    this.setData({
      placeholderTop: placeholderTop,
      placeholderBottom: placeholderBottom
    });
  },
  
  // 获取当前选项卡的数据列表
  getListData: function() {
    return this.data[this.data.selectedTab + 'Data'] || [];
  },
  
  // 获取当前可见的数据
  getVisibleData: function() {
    const allData = this.getListData();
    return allData.slice(this.data.startIndex, this.data.endIndex);
  },
  
  // 格式化历史数据
  formatHistoryData: function (data, type) {
    // 用时加载模块
    const dateUtil = require('../../utils/date-util');

    if (!data || !Array.isArray(data)) {
      return [];
    }
    
    console.log('===== 格式化历史数据开始 =====');
    console.log('数据类型:', type);
    console.log('数据条数:', data.length);
    
    if (data.length > 0) {
      console.log('第一条数据样本:', JSON.stringify(data[0]));
    }
    
    // 检查时间是否交替出现 Invalid Date 的规律
    let hasAlternating = false;
    if (data.length >= 4) {
      const sample1 = data[0].timestamp;
      const sample2 = data[1].timestamp;
      const sample3 = data[2].timestamp;
      const sample4 = data[3].timestamp;
      console.log('时间戳样本对比:');
      console.log('样本1:', sample1, typeof sample1);
      console.log('样本2:', sample2, typeof sample2);
      
      // 检查是否有交替模式
      if (sample1 !== sample2 && sample1 === sample3 && sample2 === sample4) {
        hasAlternating = true;
        console.log('检测到交替时间模式！');
      }
    }
    
    const results = data.map((item, index) => {
      // 调试信息：检查时间戳
      console.log(`项目${index}时间戳:`, item.timestamp, typeof item.timestamp);
      
      // 手动修复交替无效的时间戳
      if (hasAlternating && index % 2 === 0 && index > 0) {
        // 尝试使用上一条数据的时间作为基础
        if (index > 0 && data[index-1] && data[index-1].timestamp) {
          console.log(`修复项目${index}的时间戳，基于上一条数据`);
          const prevTime = new Date(data[index-1].timestamp);
          if (!isNaN(prevTime.getTime())) {
            // 添加10分钟
            prevTime.setMinutes(prevTime.getMinutes() + 10);
            item.timestamp = dateUtil.formatTime(prevTime);
          }
        }
      }
      
      // 使用增强的日期解析函数处理timestamp
      let parsedDate = dateUtil.parseDate(item.timestamp);
      
      if (!parsedDate && typeof item.timestamp === 'string') {
        // 尝试修复时区问题
        console.log('尝试修复时区问题:', item.timestamp);
        const fixedString = item.timestamp.replace('T', ' ').replace(/\.\d+Z$/, '');
        parsedDate = new Date(fixedString);
        if (isNaN(parsedDate.getTime())) {
          parsedDate = null;
        } else {
          console.log('修复成功!');
        }
      }
      
      // 格式化时间
      let formattedTime = '';
      if (parsedDate) {
        formattedTime = dateUtil.formatTime(parsedDate);
        console.log('成功格式化时间:', formattedTime);
      } else {
        console.error('无法解析时间戳:', item.timestamp);
        // 使用当前时间加偏移作为备用
        const backupTime = new Date();
        backupTime.setMinutes(backupTime.getMinutes() - (data.length - index) * 10);
        formattedTime = dateUtil.formatTime(backupTime);
        console.log('使用备用时间:', formattedTime);
      }
      
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
    
    console.log('===== 格式化历史数据结束 =====');
    return results;
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