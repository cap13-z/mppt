# 能源演示系统微信小程序项目结构

```
energy-monitor-miniprogram/
├── app.js                 # 小程序全局JS
├── app.json               # 小程序全局配置
├── app.wxss               # 小程序全局样式
├── project.config.json    # 项目配置文件
├── sitemap.json           # 小程序索引配置
├── utils/                 # 工具函数目录
│   ├── util.js            # 通用工具函数
│   ├── api.js             # API请求封装
│   └── websocket.js       # WebSocket连接管理
├── services/              # 服务层目录
│   ├── battery.js         # 电池数据服务
│   ├── solar.js           # 太阳能数据服务
│   ├── weather.js         # 天气数据服务
│   ├── price.js           # 电价数据服务
│   └── system.js          # 系统状态服务
├── pages/                 # 页面目录
│   ├── index/             # 首页(总览页)
│   │   ├── index.js       # 首页逻辑
│   │   ├── index.wxml     # 首页结构
│   │   ├── index.wxss     # 首页样式
│   │   └── index.json     # 首页配置
│   ├── trends/            # 趋势分析页
│   │   ├── trends.js      # 趋势页逻辑
│   │   ├── trends.wxml    # 趋势页结构
│   │   ├── trends.wxss    # 趋势页样式
│   │   └── trends.json    # 趋势页配置
│   ├── history/           # 历史数据页
│   │   ├── history.js     # 历史数据页逻辑
│   │   ├── history.wxml   # 历史数据页结构
│   │   ├── history.wxss   # 历史数据页样式
│   │   └── history.json   # 历史数据页配置
│   └── settings/          # 设置页
│       ├── settings.js    # 设置页逻辑
│       ├── settings.wxml  # 设置页结构
│       ├── settings.wxss  # 设置页样式
│       └── settings.json  # 设置页配置
├── components/            # 自定义组件目录
│   ├── card/              # 卡片组件
│   │   ├── card.js        # 卡片组件逻辑
│   │   ├── card.wxml      # 卡片组件结构
│   │   ├── card.wxss      # 卡片组件样式
│   │   └── card.json      # 卡片组件配置
│   ├── chart/             # 图表组件
│   │   ├── chart.js       # 图表组件逻辑
│   │   ├── chart.wxml     # 图表组件结构
│   │   ├── chart.wxss     # 图表组件样式
│   │   └── chart.json     # 图表组件配置
│   ├── battery-status/    # 电池状态组件
│   ├── solar-status/      # 太阳能状态组件
│   ├── weather-display/   # 天气显示组件
│   └── price-display/     # 电价显示组件
└── ec-canvas/             # ECharts小程序组件
    ├── ec-canvas.js       # ECharts组件逻辑
    ├── ec-canvas.wxml     # ECharts组件结构
    ├── ec-canvas.wxss     # ECharts组件样式
    ├── ec-canvas.json     # ECharts组件配置
    └── echarts.js         # ECharts库
```

## 关键文件内容示例

### 1. app.js
```javascript
// app.js
App({
  globalData: {
    serverUrl: 'https://your-server-url.com',
    wsUrl: 'wss://your-server-url.com',
    socketConnected: false,
    latestData: {
      battery: null,
      solar: null,
      weather: null,
      price: null,
      system: null
    },
    theme: 'dark'
  },
  onLaunch: function() {
    // 初始化WebSocket连接
    this.initWebSocket();
    // 获取用户偏好设置
    this.loadUserPreferences();
  },
  initWebSocket: function() {
    const ws = require('./utils/websocket');
    ws.connect(this.globalData.wsUrl);
    ws.onConnect(() => {
      this.globalData.socketConnected = true;
    });
    ws.onMessage((data) => {
      this.handleSocketMessage(data);
    });
    ws.onDisconnect(() => {
      this.globalData.socketConnected = false;
    });
  },
  handleSocketMessage: function(message) {
    if (message.type === 'device-data') {
      this.updateLatestData(message.data);
    } else if (message.type === 'data-update') {
      this.updateLatestData(message.data);
    }
  },
  updateLatestData: function(data) {
    if (data.battery) this.globalData.latestData.battery = data.battery;
    if (data.solar) this.globalData.latestData.solar = data.solar;
    if (data.weather) this.globalData.latestData.weather = data.weather;
    if (data.price) this.globalData.latestData.price = data.price;
    if (data.system) this.globalData.latestData.system = data.system;
  },
  loadUserPreferences: function() {
    const theme = wx.getStorageSync('theme') || 'dark';
    this.globalData.theme = theme;
  }
})
```

### 2. utils/api.js
```javascript
// utils/api.js
const app = getApp();
const baseUrl = app.globalData.serverUrl;

// HTTP请求封装
const request = (url, method, data = {}) => {
  return new Promise((resolve, reject) => {
    wx.request({
      url: `${baseUrl}${url}`,
      method: method,
      data: data,
      header: {
        'content-type': 'application/json'
      },
      success: (res) => {
        if (res.statusCode === 200) {
          resolve(res.data);
        } else {
          reject(res);
        }
      },
      fail: (err) => {
        reject(err);
      }
    });
  });
};

// API方法
const api = {
  // 获取所有最新数据
  getAllLatestData: () => {
    return request('/api/all-latest-data', 'GET');
  },
  
  // 获取电池历史数据
  getBatteryData: (startDate, endDate) => {
    return request('/api/battery-data', 'GET', { startDate, endDate });
  },
  
  // 获取太阳能历史数据
  getSolarData: (startDate, endDate) => {
    return request('/api/solar-data', 'GET', { startDate, endDate });
  },
  
  // 获取供电状态历史数据
  getPowerStatus: (startDate, endDate) => {
    return request('/api/power-status', 'GET', { startDate, endDate });
  },
  
  // 获取天气历史数据
  getWeatherData: (startDate, endDate) => {
    return request('/api/weather-data', 'GET', { startDate, endDate });
  },
  
  // 获取电价历史数据
  getElectricityPrice: (startDate, endDate) => {
    return request('/api/electricity-price', 'GET', { startDate, endDate });
  },
  
  // 获取武汉实时天气
  getWuhanWeather: () => {
    return request('/api/wuhan-weather', 'GET');
  },
  
  // 获取湖北省实时电价
  getHubeiElectricityPrice: () => {
    return request('/api/hubei-electricity-price', 'GET');
  }
};

module.exports = api;
```

### 3. utils/websocket.js
```javascript
// utils/websocket.js
let socketOpen = false;
let socketMsgQueue = [];
let socketTask = null;
let connectCallback = null;
let messageCallback = null;
let disconnectCallback = null;

// 连接WebSocket
function connect(url) {
  socketTask = wx.connectSocket({
    url: url,
    success: () => {
      console.log('WebSocket连接成功');
    },
    fail: (err) => {
      console.error('WebSocket连接失败', err);
    }
  });
  
  socketTask.onOpen(() => {
    console.log('WebSocket连接已打开');
    socketOpen = true;
    // 发送队列中的消息
    while(socketMsgQueue.length > 0) {
      const msg = socketMsgQueue.shift();
      send(msg);
    }
    if (connectCallback) {
      connectCallback();
    }
  });
  
  socketTask.onMessage((res) => {
    console.log('收到WebSocket消息', res);
    if (messageCallback) {
      try {
        const data = JSON.parse(res.data);
        messageCallback(data);
      } catch (e) {
        console.error('解析WebSocket消息失败', e);
      }
    }
  });
  
  socketTask.onClose(() => {
    console.log('WebSocket连接已关闭');
    socketOpen = false;
    if (disconnectCallback) {
      disconnectCallback();
    }
  });
  
  socketTask.onError((err) => {
    console.error('WebSocket发生错误', err);
    socketOpen = false;
  });
}

// 发送WebSocket消息
function send(msg) {
  if (socketOpen) {
    socketTask.send({
      data: typeof msg === 'string' ? msg : JSON.stringify(msg),
      success: () => {
        console.log('WebSocket消息发送成功', msg);
      },
      fail: (err) => {
        console.error('WebSocket消息发送失败', err);
      }
    });
  } else {
    socketMsgQueue.push(msg);
  }
}

// 关闭WebSocket连接
function close() {
  if (socketTask) {
    socketTask.close();
  }
}

// 设置连接回调
function onConnect(callback) {
  connectCallback = callback;
}

// 设置消息回调
function onMessage(callback) {
  messageCallback = callback;
}

// 设置断开连接回调
function onDisconnect(callback) {
  disconnectCallback = callback;
}

module.exports = {
  connect,
  send,
  close,
  onConnect,
  onMessage,
  onDisconnect
};
```

### 4. pages/index/index.wxml (首页结构示例)
```html
<!-- pages/index/index.wxml -->
<view class="container {{theme}}">
  <view class="header">
    <view class="title">能源演示系统</view>
    <view class="status {{socketConnected ? 'online' : 'offline'}}">
      {{socketConnected ? '已连接' : '未连接'}}
    </view>
  </view>
  
  <!-- 系统供电状态卡片 -->
  <view class="system-card card">
    <view class="card-icon"><icon class="icon-plug" /></view>
    <view class="card-title">系统供电状态</view>
    <view class="card-value">{{systemData.load_power || 0}}</view>
    <view class="card-unit">W</view>
    <view class="system-status">
      <view class="status-item {{systemData.source === '太阳能' ? 'active' : 'inactive'}}">
        <icon class="icon-sun" />
        <view>太阳能供电</view>
        <view>{{systemData.solar_status || '未知'}}</view>
      </view>
      <view class="status-item {{systemData.source !== '太阳能' ? 'active' : 'inactive'}}">
        <icon class="icon-bolt" />
        <view>电网供电</view>
        <view>{{systemData.grid_status || '未知'}}</view>
      </view>
    </view>
  </view>
  
  <!-- 主要数据卡片区域 -->
  <view class="cards-container">
    <!-- 电池状态卡片 -->
    <battery-status wx:if="{{batteryData}}" data="{{batteryData}}" />
    
    <!-- 太阳能板卡片 -->
    <solar-status wx:if="{{solarData}}" data="{{solarData}}" />
    
    <!-- 天气卡片 -->
    <weather-display wx:if="{{weatherData}}" data="{{weatherData}}" />
    
    <!-- 电价卡片 -->
    <price-display wx:if="{{priceData}}" data="{{priceData}}" />
  </view>
</view>
```

### 5. components/battery-status/battery-status.wxml (电池状态组件示例)
```html
<!-- components/battery-status/battery-status.wxml -->
<view class="card battery-card">
  <view class="card-icon"><icon class="icon-battery" /></view>
  <view class="card-title">电池状态</view>
  
  <view class="battery-container">
    <view class="battery-level" style="width: {{data.capacity}}%"></view>
    <view class="battery-text">{{data.capacity}}%</view>
  </view>
  
  <view class="card-value">{{data.voltage}}</view>
  <view class="card-unit">V</view>
  
  <view class="status-indicator {{getStatusClass(data.status)}}">
    {{data.status}}
  </view>
</view>
```

### 6. pages/trends/trends.wxml (趋势图表页面示例)
```html
<!-- pages/trends/trends.wxml -->
<view class="container {{theme}}">
  <view class="tabs">
    <view class="tab {{currentTab === 'energy' ? 'active' : ''}}" bindtap="switchTab" data-tab="energy">能源数据</view>
    <view class="tab {{currentTab === 'battery' ? 'active' : ''}}" bindtap="switchTab" data-tab="battery">电池数据</view>
    <view class="tab {{currentTab === 'solar' ? 'active' : ''}}" bindtap="switchTab" data-tab="solar">太阳能数据</view>
    <view class="tab {{currentTab === 'power' ? 'active' : ''}}" bindtap="switchTab" data-tab="power">供电状态</view>
    <view class="tab {{currentTab === 'weather' ? 'active' : ''}}" bindtap="switchTab" data-tab="weather">天气数据</view>
    <view class="tab {{currentTab === 'price' ? 'active' : ''}}" bindtap="switchTab" data-tab="price">电价数据</view>
  </view>
  
  <view class="chart-container">
    <view class="chart-wrapper {{currentTab === 'energy' ? 'active' : ''}}">
      <ec-canvas id="energyChart" canvas-id="energyChart" ec="{{ecEnergy}}"></ec-canvas>
    </view>
    <view class="chart-wrapper {{currentTab === 'battery' ? 'active' : ''}}">
      <ec-canvas id="batteryChart" canvas-id="batteryChart" ec="{{ecBattery}}"></ec-canvas>
    </view>
    <view class="chart-wrapper {{currentTab === 'solar' ? 'active' : ''}}">
      <ec-canvas id="solarChart" canvas-id="solarChart" ec="{{ecSolar}}"></ec-canvas>
    </view>
    <view class="chart-wrapper {{currentTab === 'power' ? 'active' : ''}}">
      <ec-canvas id="powerChart" canvas-id="powerChart" ec="{{ecPower}}"></ec-canvas>
    </view>
    <view class="chart-wrapper {{currentTab === 'weather' ? 'active' : ''}}">
      <ec-canvas id="weatherChart" canvas-id="weatherChart" ec="{{ecWeather}}"></ec-canvas>
    </view>
    <view class="chart-wrapper {{currentTab === 'price' ? 'active' : ''}}">
      <ec-canvas id="priceChart" canvas-id="priceChart" ec="{{ecPrice}}"></ec-canvas>
    </view>
  </view>
  
  <view class="time-range-picker">
    <picker mode="date" value="{{startDate}}" bindchange="startDateChange">
      <view class="picker-item">
        起始: {{startDate}}
      </view>
    </picker>
    <picker mode="date" value="{{endDate}}" bindchange="endDateChange">
      <view class="picker-item">
        结束: {{endDate}}
      </view>
    </picker>
    <button class="query-btn" bindtap="queryData">查询</button>
  </view>
</view>
```

以上是微信小程序项目的基本结构和部分关键文件内容示例，可以作为开发的起点。实际开发中还需根据具体需求进行调整和完善。 