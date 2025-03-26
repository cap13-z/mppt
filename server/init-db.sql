-- 创建数据库
CREATE DATABASE IF NOT EXISTS energy_system;
USE energy_system;

-- 创建电池数据表
CREATE TABLE IF NOT EXISTS battery_data (
    id INT AUTO_INCREMENT PRIMARY KEY,
    voltage DECIMAL(10,2) NOT NULL,
    capacity INT NOT NULL,
    timestamp DATETIME NOT NULL,
    INDEX idx_timestamp (timestamp)
);

-- 创建太阳能数据表
CREATE TABLE IF NOT EXISTS solar_data (
    id INT AUTO_INCREMENT PRIMARY KEY,
    voltage DECIMAL(10,2) NOT NULL,
    power DECIMAL(10,2) NOT NULL,
    timestamp DATETIME NOT NULL,
    INDEX idx_timestamp (timestamp)
);

-- 创建系统数据表
CREATE TABLE IF NOT EXISTS system_data (
    id INT AUTO_INCREMENT PRIMARY KEY,
    power_mode VARCHAR(20) NOT NULL,
    running_time INT NOT NULL,
    timestamp DATETIME NOT NULL,
    INDEX idx_timestamp (timestamp)
);

-- 创建用户表
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 创建系统配置表
CREATE TABLE IF NOT EXISTS system_config (
    id INT AUTO_INCREMENT PRIMARY KEY,
    config_key VARCHAR(50) NOT NULL UNIQUE,
    config_value TEXT NOT NULL,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 插入默认系统配置
INSERT INTO system_config (config_key, config_value) VALUES
('battery_voltage_min', '11.0'),
('battery_voltage_max', '13.0'),
('solar_voltage_min', '15.0'),
('solar_voltage_max', '20.0'),
('system_power_max', '1000.0');

-- 创建管理员用户（密码需要在实际部署时修改）
INSERT INTO users (username, password) VALUES
('admin', '$2b$10$YourHashedPasswordHere'); 