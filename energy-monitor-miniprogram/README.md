# 能源演示系统 - 微信小程序

## 项目概述
该小程序旨在为能源演示系统提供移动端监控界面，使用户能够随时随地查看能源系统的运行状态、历史数据以及趋势分析。

## 功能模块
1. **首页** - 实时监控系统状态，包括电池电量、太阳能发电、天气信息等
2. **趋势** - 展示系统各项指标的变化趋势，包括日内、周内和月内变化
3. **历史** - 查询历史数据记录，可按日期、设备类型等条件筛选
4. **设置** - 用户偏好设置，如主题切换、通知设置等

## 项目结构
```
energy-monitor-miniprogram/
├── app.js                 # 小程序主逻辑
├── app.json               # 小程序配置文件
├── app.wxss               # 全局样式
├── package.json           # 项目依赖
├── project.config.json    # 项目配置
├── sitemap.json           # 小程序索引配置
├── pages/                 # 页面文件夹
│   ├── index/             # 首页
│   │   ├── index.js
│   │   ├── index.json
│   │   ├── index.wxml
│   │   └── index.wxss
│   ├── trends/            # 趋势页
│   │   ├── trends.js
│   │   ├── trends.json
│   │   ├── trends.wxml
│   │   └── trends.wxss
│   ├── history/           # 历史页
│   │   ├── history.js
│   │   ├── history.json
│   │   ├── history.wxml
│   │   └── history.wxss
│   └── settings/          # 设置页
│       ├── settings.js
│       ├── settings.json
│       ├── settings.wxml
│       └── settings.wxss
├── components/            # 自定义组件
│   ├── battery-card/      # 电池状态卡片
│   ├── solar-card/        # 太阳能状态卡片
│   ├── weather-card/      # 天气状态卡片
│   └── chart/             # 图表组件
├── utils/                 # 工具函数
│   ├── api.js             # API接口
│   ├── util.js            # 通用工具函数
│   └── mock.js            # 模拟数据
└── images/                # 图片资源
    ├── home.png           # 首页图标
    ├── home_selected.png  # 首页选中图标
    ├── trend.png          # 趋势图标
    ├── trend_selected.png # 趋势选中图标
    ├── history.png        # 历史图标
    ├── history_selected.png # 历史选中图标
    ├── settings.png       # 设置图标
    ├── settings_selected.png # 设置选中图标
    ├── battery.png        # 电池图标
    ├── solar.png          # 太阳能图标
    ├── weather.png        # 天气图标
    ├── energy.png         # 能源图标
    ├── grid.png           # 电网图标
    └── share.png          # 分享图标
```

## 开发进度
- [x] 项目初始结构搭建
- [x] 底部导航栏配置
- [x] 设置页面开发
- [ ] 首页开发
- [ ] 趋势页面开发
- [ ] 历史页面开发
- [ ] 自定义组件开发
- [ ] API接口对接
- [ ] 数据可视化实现

## 注意事项
1. 当前图标文件为空白占位符，实际开发中需替换为真实图标
2. 开发时请使用微信开发者工具进行调试和预览
3. API接口需要与服务端对接，确保数据格式一致
4. 小程序UI设计遵循能源演示系统的整体风格，以深蓝色为主题色
5. 工具函数和组件设计需考虑复用性，避免代码冗余

## 后续开发计划
1. 完善首页实时数据展示
2. 实现图表组件，用于展示趋势和历史数据
3. 添加用户认证和权限控制
4. 优化UI/UX，提升用户体验
5. 增加数据分析和预测功能

## 开发环境
- 微信开发者工具 v1.06.2203190
- 基础库 最新版
- 开发模式 普通小程序 