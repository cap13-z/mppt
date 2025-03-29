// amqp-client.js
// 阿里云AMQP客户端，用于获取设备数据（当前仅使用模拟数据）

const mysql = require('mysql2/promise');

// 模拟设备配置
const deviceConfig = {
    productKey: 'a1Nz0KACK2w'  // 模拟的产品Key
};

// 数据库配置
const dbConfig = {
    host: 'localhost',
    user: 'mpptuser',
    password: 'password',
    database: 'energy_system'
};

// 创建数据库连接池
const pool = mysql.createPool(dbConfig);

// 模拟数据配置
let simulationConfig = {
    enabled: true,  // 是否启用模拟数据
    interval: 10000,  // 模拟数据发送间隔（毫秒）
    simulationTimer: null,  // 模拟数据定时器
    lastRealDataTime: 0,  // 上次接收到真实数据的时间
    realDataTimeout: 30000  // 真实数据超时时间（毫秒）
};

// 模拟数据状态变量 - 用于保持数据平滑变化
let simulationState = {
    batteryCapacity: 75.5,  // 电池容量百分比
    batteryTrend: 0.1,      // 电池变化趋势
    solarVoltage: 15.2,     // 太阳能电压
    solarCurrent: 0.98,     // 太阳能电流
    loadPower: 15.0,        // 负载功率
    temperature: 28.0       // 温度
};

// 启动AMQP客户端函数（现在只启动模拟数据）
function startAmqpClient(io) {
    console.log('启动模拟数据发送器...');
    return startSimulation(io);
}

// 保存数据到数据库
async function saveToDatabase(data) {
    try {
        const conn = await pool.getConnection();
        
        // 根据数据类型保存到相应的表
        if (data.topic && data.topic.includes('/thing/event/property/post')) {
            // 设备属性上报数据
            if (data.params) {
                // 处理电压数据
                if (data.params.vot !== undefined) {
                    await conn.query(
                        'INSERT INTO battery_data (voltage, capacity, temperature, status, timestamp) VALUES (?, ?, ?, ?, NOW())',
                        [data.params.vot, 
                         calculateBatteryCapacity(data.params.vot), // 根据电压估算电池容量
                         data.params.tem || 25, // 如果有温度数据则使用，否则默认25度
                         '正常' // 添加默认状态
                        ] 
                    );
                }
                
                // 处理功耗数据
                if (data.params.powerConsumption !== undefined) {
                    await conn.query(
                        'INSERT INTO power_status (status, load_power, mode, timestamp) VALUES (?, ?, ?, NOW())',
                        [getStatusFromMeterState(data.params.ElectricMeterState), 
                         data.params.powerConsumption,
                         'MPPT模式']
                    );
                    
                    // 更新最后一次真实数据接收时间
                    updateLastRealDataTime();
                }
                
                // 处理天气数据
                if (data.params.weatherCondition !== undefined) {
                    await conn.query(
                        'INSERT INTO weather_data (city, weather, temperature, status) VALUES (?, ?, ?, ?)',
                        ['武汉', 
                         data.params.weatherCondition,
                         data.params.tem || 25,
                         '正常'
                        ]
                    );
                }
            }
        } else if (data.topic && data.topic.includes('/mqtt/status')) {
            // 设备状态变更消息
            await conn.query(
                'INSERT INTO power_status (status, timestamp) VALUES (?, NOW())',
                [data.status]
            );
        } else {
            // 保存其他类型数据（如模拟数据）
            console.log('保存其他类型数据');
            
            // 保存电池状态数据
            if (data.battery) {
                await conn.query(
                    'INSERT INTO battery_data (voltage, capacity, temperature, status, timestamp) VALUES (?, ?, ?, ?, NOW())',
                    [data.battery.voltage, 
                     data.battery.capacity,
                     data.battery.temperature,
                     data.battery.status || '正常' // 添加status字段，如果不存在则默认为"正常"
                    ]
                );
            }
            
            // 保存功耗状态数据
            if (data.power) {
                await conn.query(
                    'INSERT INTO power_status (status, load_power, mode, timestamp) VALUES (?, ?, ?, NOW())',
                    [data.power.status,
                     data.power.loadPower,
                     data.power.mode]
                );
            }
            
            // 保存天气数据
            if (data.weather) {
                await conn.query(
                    'INSERT INTO weather_data (city, weather, `condition`, temperature, status) VALUES (?, ?, ?, ?, ?)',
                    ['武汉', 
                     data.weather.weather || data.weather.condition || '未知',
                     data.weather.condition || data.weather.weather || '未知', 
                     data.weather.temperature || 25,
                     '正常'
                    ]
                );
            }
        }
        
        conn.release();
    } catch (error) {
        console.error('保存数据到数据库时出错:', error);
    }
}

// 根据电压估算电池容量
function calculateBatteryCapacity(voltage) {
    // 5V锂电池的电压范围为4.0V（空）到5.2V（满）
    const minVoltage = 4.0;
    const maxVoltage = 5.2;
    
    if (voltage >= maxVoltage) return 100;
    if (voltage <= minVoltage) return 0;
    
    // 线性映射电压到容量
    return parseFloat(((voltage - minVoltage) / (maxVoltage - minVoltage) * 100).toFixed(1));
}

// 计算电池电压
function calculateBatteryVoltage(capacity) {
    // 5V锂电池的电压范围为4.0V（空）到5.2V（满）
    const minVoltage = 4.0;
    const maxVoltage = 5.2;
    
    // 线性映射容量到电压
    return parseFloat((minVoltage + (capacity / 100) * (maxVoltage - minVoltage)).toFixed(2));
}

// 生成平滑变化的值
function smoothChange(lastValue, min, max, maxChange, decimal = 0) {
    // 生成-1到1之间的随机变化方向
    const changeDirection = (Math.random() * 2) - 1;
    // 计算本次变化量
    const change = changeDirection * Math.random() * maxChange;
    // 计算新值并确保在范围内
    let newValue = lastValue + change;
    if (newValue > max) newValue = max;
    if (newValue < min) newValue = min;
    return parseFloat(newValue.toFixed(decimal));
}

// 根据电表状态获取系统状态
function getStatusFromMeterState(meterState) {
    switch(meterState) {
        case 0: return 'offline_normal'; // 离线正常
        case 1: return 'offline_error';  // 离线异常
        case 2: return 'device_managed'; // 设备管理
        case 3: return 'grid_side';      // 电网端
        default: return 'unknown';
    }
}

// 生成模拟数据
function generateSimulatedData() {
    // 获取当前时间
    const now = new Date();
    const hour = now.getHours();
    
    // 根据时间调整电池容量变化趋势
    // 白天(8-17点)：太阳能充足，电池趋势为充电
    // 晚上(18-7点)：用电较多，电池趋势为放电
    if (hour >= 8 && hour < 17) {
        simulationState.batteryTrend = Math.random() * 0.2 + 0.1; // 白天缓慢充电
    } else {
        simulationState.batteryTrend = -1 * (Math.random() * 0.15 + 0.05); // 晚上缓慢放电
    }
    
    // 平滑更新电池容量
    simulationState.batteryCapacity += simulationState.batteryTrend;
    if (simulationState.batteryCapacity > 100) simulationState.batteryCapacity = 100;
    if (simulationState.batteryCapacity < 10) simulationState.batteryCapacity = 10;
    
    // 根据容量计算电压
    const voltage = calculateBatteryVoltage(simulationState.batteryCapacity);
    
    // 平滑更新太阳能电压和电流
    simulationState.solarVoltage = smoothChange(simulationState.solarVoltage, 14.5, 15.5, 0.1, 2);
    simulationState.solarCurrent = smoothChange(simulationState.solarCurrent, 0.9, 1.1, 0.02, 2);
    
    // 平滑更新负载功率（控制在13-17W左右）
    simulationState.loadPower = smoothChange(simulationState.loadPower, 13, 17, 0.3, 2);
    
    // 平滑更新温度
    simulationState.temperature = smoothChange(simulationState.temperature, 25, 35, 0.3, 1);
    
    // 生成系统供电状态 - 白天使用太阳能，晚上使用电网
    const electricMeterState = (hour >= 8 && hour < 17) ? 2 : 3; // 2-太阳能，3-电网
    
    // 标准天气状况，使用明确的字符串而不是随机索引
    const standardWeatherConditions = ['晴朗', '多云', '阴天', '小雨'];
    const weatherIndex = Math.floor(Math.random() * standardWeatherConditions.length);
    const weatherCondition = standardWeatherConditions[weatherIndex];
    
    // 构造模拟数据
    return {
        topic: '/sys/' + deviceConfig.productKey + '/thing/event/property/post',
        params: {
            vot: voltage,
            powerConsumption: simulationState.loadPower,
            tem: simulationState.temperature,
            humidity: parseFloat(smoothChange(50, 40, 70, 1, 1)),
            weatherCondition: weatherCondition, // 使用标准天气状况
            solarRadiation: hour >= 8 && hour < 17 ? 
                parseFloat(smoothChange(600, 400, 800, 20, 0)) : 
                parseFloat(smoothChange(100, 0, 200, 10, 0)),
            windDirection: ['东风', '南风', '西风', '北风'][Math.floor(Math.random() * 4)],
            windScale: Math.floor(Math.random() * 4) + 1,
            ElectricMeterState: electricMeterState,
            solarVoltage: simulationState.solarVoltage,
            solarCurrent: simulationState.solarCurrent
        },
        isSimulated: true // 标记为模拟数据
    };
}

// 格式化数据，适应前端显示
function formatDataForFrontend(data) {
    // 如果是设备属性上报数据
    if (data.params) {
        const timestamp = new Date().toISOString();
        const batteryStatus = data.params.ElectricMeterState === 2 ? '充电中' : 
                              (simulationState.batteryCapacity > 95 ? '满电状态' : '放电中');
        
        // 从缓存获取最新的天气数据
        let weatherData = null;
        if (require('./weather-service').getLastWeatherData) {
            weatherData = require('./weather-service').getLastWeatherData();
        }
        
        return {
            timestamp: timestamp,
            battery: {
                voltage: data.params.vot || 0,
                capacity: simulationState.batteryCapacity,
                temperature: data.params.tem || 25,
                current: simulationState.batteryTrend > 0 ? 0.8 : 0.4, // 充电电流较大，放电电流较小
                status: batteryStatus
            },
            solar: {
                voltage: data.params.solarVoltage || 15.0,
                current: data.params.solarCurrent || 1.0,
                power: parseFloat((data.params.solarVoltage * data.params.solarCurrent).toFixed(1)) || 15.0,
                efficiency: smoothChange(85, 80, 90, 0.5, 1), // 高效率
                temperature: data.params.tem ? data.params.tem + 5 : 35 // 太阳能板温度略高于环境温度
            },
            system: {
                online: true,
                source: data.params.ElectricMeterState === 3 ? '电网' : '太阳能',
                loadPower: data.params.powerConsumption || 15.0,
                mode: 'MPPT模式',
                gridStatus: data.params.ElectricMeterState === 3 ? '在线' : '离线',
                solarStatus: data.params.ElectricMeterState === 2 ? '在线' : '离线',
                meterStatus: ['离线正常', '离线异常', '太阳能模式', '电网模式'][data.params.ElectricMeterState] || '未知'
            },
            weather: weatherData ? {
                temperature: weatherData.temperature,
                condition: weatherData.weather
            } : {
                temperature: '20',
                condition: '多云'
            },
            price: {
                current: 0.5,
                level: '平值',
                nextChange: new Date(Date.now() + 3600000).toISOString()
            },
            isSimulated: data.isSimulated || false
        };
    }
    
    // 如果是设备状态变更消息
    if (data.status) {
        return {
            status: data.status,
            timestamp: new Date().toISOString(),
            isSimulated: data.isSimulated || false
        };
    }
    
    return data;
}

// 启动模拟数据发送
function startSimulation(io) {
    if (simulationConfig.simulationTimer) {
        clearInterval(simulationConfig.simulationTimer);
    }
    
    console.log('启动模拟数据发送，间隔：', simulationConfig.interval, 'ms');
    
    simulationConfig.simulationTimer = setInterval(() => {
        // 检查是否应该发送模拟数据
        const now = Date.now();
        const timeSinceLastRealData = now - simulationConfig.lastRealDataTime;
        
        if (simulationConfig.enabled && 
            (timeSinceLastRealData > simulationConfig.realDataTimeout || simulationConfig.lastRealDataTime === 0)) {
            
            console.log('发送模拟数据（上次真实数据接收时间：', 
                        simulationConfig.lastRealDataTime ? new Date(simulationConfig.lastRealDataTime).toLocaleString() : '从未',
                        '）');
            
            // 生成模拟数据
            const simulatedData = generateSimulatedData();
            
            // 保存到数据库
            saveToDatabase(simulatedData);
            
            // 发送到前端
            if (io) {
                const formattedData = formatDataForFrontend(simulatedData);
                io.emit('device-data', formattedData);
            }
        }
    }, simulationConfig.interval);
    
    return simulationConfig.simulationTimer;
}

// 停止模拟数据发送
function stopSimulation() {
    if (simulationConfig.simulationTimer) {
        console.log('停止模拟数据发送');
        clearInterval(simulationConfig.simulationTimer);
        simulationConfig.simulationTimer = null;
    }
}

// 更新上次接收真实数据的时间
function updateLastRealDataTime() {
    simulationConfig.lastRealDataTime = Date.now();
    console.log('更新上次真实数据接收时间：', new Date(simulationConfig.lastRealDataTime).toLocaleString());
}

// 导出函数
module.exports = { startAmqpClient };