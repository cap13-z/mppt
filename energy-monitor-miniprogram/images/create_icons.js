/**
 * 创建简单图标的脚本
 * 用于生成占位图标文件
 */

// 图标列表
const iconFiles = [
  'home.png',
  'home_selected.png',
  'trend.png',
  'trend_selected.png',
  'history.png',
  'history_selected.png',
  'settings.png',
  'settings_selected.png',
  'battery.png',
  'solar.png',
  'weather.png',
  'energy.png',
  'grid.png',
  'share.png'
];

/**
 * 在微信小程序开发环境中，此脚本只作为参考
 * 实际图标需要在设计完成后替换占位图标
 */

console.log('图标文件列表:');
iconFiles.forEach(icon => {
  console.log(`- ${icon}`);
});

// 导出图标列表，以便其他脚本使用
module.exports = {
  iconFiles
};
