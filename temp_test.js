// 测试导入config.js
try {
  const config = require('./energy-monitor-miniprogram/utils/config.js');
  console.log('成功导入config.js');
  console.log(config);
} catch (error) {
  console.error('导入config.js时出错：', error);
} 