// 导入必要的模块
const mysql = require('mysql2');
const fs = require('fs');
const path = require('path');

console.log('开始初始化数据库...');

// 创建数据库连接
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'mpptuser',
  password: 'password',
  database: 'energy_system',
  multipleStatements: true // 允许执行多条SQL语句
});

console.log('尝试连接到MySQL...');

// 创建电池数据表
const createBatteryTable = `
CREATE TABLE IF NOT EXISTS battery_data (
  id INT AUTO_INCREMENT PRIMARY KEY,
  voltage FLOAT NOT NULL,
  capacity FLOAT NOT NULL,
  status VARCHAR(50) NOT NULL,
  temperature FLOAT,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
);
`;

// 创建太阳能板数据表
const createSolarTable = `
CREATE TABLE IF NOT EXISTS solar_data (
  id INT AUTO_INCREMENT PRIMARY KEY,
  voltage FLOAT NOT NULL,
  current FLOAT NOT NULL,
  power FLOAT NOT NULL,
  temperature FLOAT,
  efficiency FLOAT,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
);
`;

// 创建系统供电状态表
const createPowerStatusTable = `
CREATE TABLE IF NOT EXISTS power_status (
  id INT AUTO_INCREMENT PRIMARY KEY,
  source VARCHAR(50) NOT NULL,
  grid_status VARCHAR(50),
  solar_status VARCHAR(50),
  load_power FLOAT,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
);
`;

// 创建天气数据表
const createWeatherTable = `
CREATE TABLE IF NOT EXISTS weather_data (
  id INT AUTO_INCREMENT PRIMARY KEY,
  temperature FLOAT,
  humidity FLOAT,
  weather_condition VARCHAR(50),
  solar_radiation FLOAT,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
);
`;

// 创建电价数据表
const createPriceTable = `
CREATE TABLE IF NOT EXISTS electricity_price (
  id INT AUTO_INCREMENT PRIMARY KEY,
  price FLOAT NOT NULL,
  price_level VARCHAR(20),
  next_change_time DATETIME,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
);
`;

// 插入测试数据
const insertBatteryData = `
INSERT INTO battery_data (voltage, capacity, status, temperature, timestamp) VALUES
(12.5, 85.0, '正常放电', 25.3, NOW() - INTERVAL 10 MINUTE),
(12.6, 87.5, '正常放电', 25.5, NOW() - INTERVAL 9 MINUTE),
(12.4, 82.0, '正常放电', 25.7, NOW() - INTERVAL 8 MINUTE),
(12.7, 90.0, '正常放电', 25.8, NOW() - INTERVAL 7 MINUTE),
(12.8, 92.5, '正常放电', 26.0, NOW() - INTERVAL 6 MINUTE),
(12.9, 95.0, '充电中', 26.2, NOW() - INTERVAL 5 MINUTE),
(13.0, 97.0, '充电中', 26.3, NOW() - INTERVAL 4 MINUTE),
(13.1, 98.5, '充电中', 26.5, NOW() - INTERVAL 3 MINUTE),
(13.2, 99.5, '充电中', 26.6, NOW() - INTERVAL 2 MINUTE),
(13.3, 100.0, '满电', 26.8, NOW() - INTERVAL 1 MINUTE);
`;

const insertSolarData = `
INSERT INTO solar_data (voltage, current, power, temperature, efficiency, timestamp) VALUES
(18.5, 1.2, 22.2, 35.3, 18.5, NOW() - INTERVAL 10 MINUTE),
(18.7, 1.3, 24.3, 36.5, 19.0, NOW() - INTERVAL 9 MINUTE),
(18.4, 1.1, 20.2, 37.7, 17.5, NOW() - INTERVAL 8 MINUTE),
(18.9, 1.4, 26.5, 38.8, 20.0, NOW() - INTERVAL 7 MINUTE),
(19.2, 1.5, 28.8, 39.0, 21.5, NOW() - INTERVAL 6 MINUTE),
(19.5, 1.6, 31.2, 39.2, 22.0, NOW() - INTERVAL 5 MINUTE),
(19.8, 1.7, 33.7, 39.3, 22.5, NOW() - INTERVAL 4 MINUTE),
(20.1, 1.8, 36.2, 39.5, 23.0, NOW() - INTERVAL 3 MINUTE),
(20.3, 1.9, 38.6, 39.6, 23.5, NOW() - INTERVAL 2 MINUTE),
(20.5, 2.0, 41.0, 39.8, 24.0, NOW() - INTERVAL 1 MINUTE);
`;

const insertPowerStatusData = `
INSERT INTO power_status (source, grid_status, solar_status, load_power, timestamp) VALUES
('太阳能', '正常', '正常', 15.0, NOW() - INTERVAL 10 MINUTE),
('太阳能', '正常', '正常', 16.5, NOW() - INTERVAL 9 MINUTE),
('太阳能', '正常', '正常', 14.0, NOW() - INTERVAL 8 MINUTE),
('太阳能', '正常', '正常', 18.0, NOW() - INTERVAL 7 MINUTE),
('太阳能', '正常', '正常', 19.5, NOW() - INTERVAL 6 MINUTE),
('电网', '正常', '低效', 21.0, NOW() - INTERVAL 5 MINUTE),
('电网', '正常', '低效', 22.5, NOW() - INTERVAL 4 MINUTE),
('电网', '正常', '低效', 24.0, NOW() - INTERVAL 3 MINUTE),
('太阳能', '正常', '正常', 25.5, NOW() - INTERVAL 2 MINUTE),
('太阳能', '正常', '正常', 27.0, NOW() - INTERVAL 1 MINUTE);
`;

const insertWeatherData = `
INSERT INTO weather_data (temperature, humidity, weather_condition, solar_radiation, timestamp) VALUES
(28.5, 65.0, '晴', 850.0, NOW() - INTERVAL 10 MINUTE),
(28.7, 64.0, '晴', 870.0, NOW() - INTERVAL 9 MINUTE),
(29.0, 63.0, '晴', 890.0, NOW() - INTERVAL 8 MINUTE),
(29.2, 62.0, '多云', 750.0, NOW() - INTERVAL 7 MINUTE),
(29.5, 61.0, '多云', 720.0, NOW() - INTERVAL 6 MINUTE),
(29.7, 60.0, '多云', 700.0, NOW() - INTERVAL 5 MINUTE),
(30.0, 59.0, '晴', 900.0, NOW() - INTERVAL 4 MINUTE),
(30.2, 58.0, '晴', 920.0, NOW() - INTERVAL 3 MINUTE),
(30.5, 57.0, '晴', 950.0, NOW() - INTERVAL 2 MINUTE),
(30.7, 56.0, '晴', 980.0, NOW() - INTERVAL 1 MINUTE);
`;

const insertPriceData = `
INSERT INTO electricity_price (price, price_level, next_change_time, timestamp) VALUES
(0.52, '平值', NOW() + INTERVAL 2 HOUR, NOW() - INTERVAL 10 MINUTE),
(0.52, '平值', NOW() + INTERVAL 2 HOUR, NOW() - INTERVAL 9 MINUTE),
(0.52, '平值', NOW() + INTERVAL 2 HOUR, NOW() - INTERVAL 8 MINUTE),
(0.52, '平值', NOW() + INTERVAL 2 HOUR, NOW() - INTERVAL 7 MINUTE),
(0.52, '平值', NOW() + INTERVAL 2 HOUR, NOW() - INTERVAL 6 MINUTE),
(0.82, '峰值', NOW() + INTERVAL 3 HOUR, NOW() - INTERVAL 5 MINUTE),
(0.82, '峰值', NOW() + INTERVAL 3 HOUR, NOW() - INTERVAL 4 MINUTE),
(0.82, '峰值', NOW() + INTERVAL 3 HOUR, NOW() - INTERVAL 3 MINUTE),
(0.82, '峰值', NOW() + INTERVAL 3 HOUR, NOW() - INTERVAL 2 MINUTE),
(0.82, '峰值', NOW() + INTERVAL 3 HOUR, NOW() - INTERVAL 1 MINUTE);
`;

// 执行创建表和插入数据的操作
connection.query(createBatteryTable, (err) => {
  if (err) {
    console.error('创建电池数据表时出错:', err);
    return;
  }
  console.log('电池数据表创建成功');
  
  connection.query(insertBatteryData, (err) => {
    if (err) {
      console.error('插入电池数据时出错:', err);
    } else {
      console.log('电池数据插入成功');
    }
  });
});

connection.query(createSolarTable, (err) => {
  if (err) {
    console.error('创建太阳能板数据表时出错:', err);
    return;
  }
  console.log('太阳能板数据表创建成功');
  
  connection.query(insertSolarData, (err) => {
    if (err) {
      console.error('插入太阳能板数据时出错:', err);
    } else {
      console.log('太阳能板数据插入成功');
    }
  });
});

connection.query(createPowerStatusTable, (err) => {
  if (err) {
    console.error('创建系统供电状态表时出错:', err);
    return;
  }
  console.log('系统供电状态表创建成功');
  
  connection.query(insertPowerStatusData, (err) => {
    if (err) {
      console.error('插入系统供电状态数据时出错:', err);
    } else {
      console.log('系统供电状态数据插入成功');
    }
  });
});

connection.query(createWeatherTable, (err) => {
  if (err) {
    console.error('创建天气数据表时出错:', err);
    return;
  }
  console.log('天气数据表创建成功');
  
  connection.query(insertWeatherData, (err) => {
    if (err) {
      console.error('插入天气数据时出错:', err);
    } else {
      console.log('天气数据插入成功');
    }
  });
});

connection.query(createPriceTable, (err) => {
  if (err) {
    console.error('创建电价数据表时出错:', err);
    return;
  }
  console.log('电价数据表创建成功');
  
  connection.query(insertPriceData, (err) => {
    if (err) {
      console.error('插入电价数据时出错:', err);
    } else {
      console.log('电价数据插入成功');
    }
    
    // 完成所有操作后关闭连接
    connection.end();
    console.log('数据库初始化完成');
  });
}); 