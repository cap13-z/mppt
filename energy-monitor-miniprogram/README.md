# 能源监控小程序

这是一个微信小程序项目，用于监控和展示家庭能源系统的状态，包括电池存储、太阳能发电、天气信息、电网状态和能源消耗等数据。

## 项目结构

```
energy-monitor-miniprogram/
├── app.js                // 小程序入口文件
├── app.json              // 小程序配置文件
├── app.wxss              // 小程序全局样式
├── project.config.json   // 项目配置文件
├── project.private.config.json // 项目私有配置文件
├── README.md             // 项目说明文档
├── sitemap.json          // 小程序搜索设置文件
├── components/           // 自定义组件目录
├── images/               // 图片资源目录
│   ├── home.png          // 首页图标
│   ├── home_selected.png // 首页选中图标
│   ├── trend.png         // 趋势图标
│   ├── trend_selected.png // 趋势选中图标
│   ├── history.png       // 历史图标
│   ├── history_selected.png // 历史选中图标
│   ├── settings.png      // 设置图标
│   ├── settings_selected.png // 设置选中图标
│   ├── battery.png       // 电池图标
│   ├── solar.png         // 太阳能图标
│   ├── weather.png       // 天气图标
│   ├── grid.png          // 电网图标
│   ├── energy.png        // 能源图标
│   ├── share.png         // 分享图标
│   └── weather/          // 天气图标目录
│       ├── sunny.png     // 晴天图标
│       ├── cloudy.png    // 多云图标
│       ├── overcast.png  // 阴天图标
│       ├── light_rain.png // 小雨图标
│       ├── moderate_rain.png // 中雨图标
│       ├── heavy_rain.png // 大雨图标
│       └── thunder.png   // 雷雨图标
├── pages/                // 页面目录
│   ├── index/            // 首页
│   │   ├── index.js      // 首页逻辑
│   │   ├── index.wxml    // 首页结构
│   │   └── index.wxss    // 首页样式
│   ├── trends/           // 趋势分析页
│   │   ├── trends.js     // 趋势分析页逻辑
│   │   ├── trends.wxml   // 趋势分析页结构
│   │   └── trends.wxss   // 趋势分析页样式
│   ├── history/          // 历史数据页
│   │   ├── history.js    // 历史数据页逻辑
│   │   ├── history.wxml  // 历史数据页结构
│   │   └── history.wxss  // 历史数据页样式
│   └── settings/         // 设置页
│       ├── settings.js   // 设置页逻辑
│       ├── settings.wxml // 设置页结构
│       └── settings.wxss // 设置页样式
├── services/             // 服务模块目录
│   ├── battery.js        // 电池服务
│   ├── solar.js          // 太阳能服务
│   ├── weather.js        // 天气服务
│   ├── price.js          // 电价服务
│   └── system.js         // 系统服务
└── utils/                // 工具模块目录
    ├── api.js            // API接口
    ├── config.js         // 配置文件
    ├── mock.js           // 模拟数据
    ├── util.js           // 通用工具函数
    └── websocket.js      // WebSocket连接管理
```

## 功能说明

本小程序提供以下主要功能：

1. **首页**：展示整个能源系统的实时状态，包括电池存储、太阳能发电、天气信息、电网状态和能源消耗
2. **趋势分析**：以图表形式展示电池状态、太阳能发电、天气温度和能源消耗等数据的趋势变化
3. **历史数据**：查看过去一段时间内的历史数据记录
4. **设置**：用户设置，包括主题切换、通知设置等

## 技术实现

本项目使用了以下技术：

1. **微信小程序原生开发框架**：使用微信小程序的WXML、WXSS、JS进行页面开发
2. **WebSocket通信**：实现与后端服务器的实时数据通信
3. **模拟数据**：在开发阶段使用模拟数据进行UI展示和功能测试

## 使用方法

### 开发者

1. 克隆项目到本地
2. 使用微信开发者工具打开项目
3. 在`utils/config.js`中配置服务器地址
4. 点击编译运行即可在开发环境预览

### 测试环境

1. 确保`utils/mock.js`中的模拟数据功能正常，可以在无后端环境下测试UI和交互
2. 在`utils/config.js`中将`serverConfig.wsUrl`和`serverConfig.apiUrl`设置为测试服务器地址

### 生产环境

1. 确保关闭所有调试和模拟数据功能
2. 在`utils/config.js`中将`serverConfig.wsUrl`和`serverConfig.apiUrl`设置为生产服务器地址
3. 使用微信开发者工具上传代码，并提交审核

## 注意事项

1. 图标文件必须存在，否则小程序将无法正常显示
2. WebSocket连接需要可靠的网络环境，在弱网环境下应有适当的降级处理
3. 生产环境中应关闭模拟数据功能，确保使用真实数据

## 更新日志

- 2024-03-21：初始版本发布，实现基本功能

## 未来计划

1. 增加用户登录和权限管理
2. 添加设备控制功能
3. 优化UI和用户体验
4. 增加多语言支持

## 贡献指南

欢迎提交问题和改进建议！ 