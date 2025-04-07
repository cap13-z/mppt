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
                        'INSERT INTO power_status (source, load_power, grid_status, solar_status, timestamp) VALUES (?, ?, ?, ?, NOW())',
                        [getStatusFromMeterState(data.params.ElectricMeterState), 
                         data.params.powerConsumption,
                         '正常',
                         '正常']
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
                'INSERT INTO power_status (source, grid_status, solar_status, timestamp) VALUES (?, ?, ?, NOW())',
                [data.status, '正常', '正常']
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
                    'INSERT INTO power_status (source, load_power, grid_status, solar_status, timestamp) VALUES (?, ?, ?, ?, NOW())',
                    [data.power.status || data.power.source || '电网',
                     data.power.loadPower,
                     data.power.grid_status || '正常',
                     data.power.solar_status || '正常']
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
    const powerSource = (hour >= 8 && hour < 17) ? '太阳能' : '电网';
    const solarStatus = (hour >= 8 && hour < 17) ? '正常' : '低效';
    const gridStatus = '正常';
    
    // 构造模拟数据 - 移除天气相关字段
    return {
        topic: '/sys/' + deviceConfig.productKey + '/thing/event/property/post',
        params: {
            vot: voltage,
            powerConsumption: simulationState.loadPower,
            tem: simulationState.temperature,
            ElectricMeterState: hour >= 8 && hour < 17 ? 2 : 3,
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
        
        // 构造电池状态数据
        const batteryData = {
            voltage: data.params.vot || 0,
            capacity: calculateBatteryCapacity(data.params.vot) || 0,
            temperature: data.params.tem || 25,
            timestamp: timestamp,
            status: data.params.vot > 5.0 ? '充电中' : '放电中' // 根据电压判断状态
        };
        
        // 构造太阳能数据
        const solarData = {
            voltage: data.params.solarVoltage || 0,
            current: data.params.solarCurrent || 0,
            power: (data.params.solarVoltage || 0) * (data.params.solarCurrent || 0),
            efficiency: 80 + Math.random() * 15, // 模拟效率
            temperature: data.params.tem ? data.params.tem + 5 : 30, // 太阳能板温度通常高于环境温度
            timestamp: timestamp
        };
        
        // 构造系统供电状态数据
        const powerStatus = {
            source: data.params.ElectricMeterState === 2 ? '太阳能' : '电网',
            load_power: data.params.powerConsumption || 0,
            grid_status: '正常',
            solar_status: data.params.ElectricMeterState === 2 ? '正常' : '低效',
            timestamp: timestamp
        };
        
        return {
            battery: batteryData,
            solar: solarData,
            power: powerStatus,
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

// 开始模拟数据发送
function startSimulation(io) {
    console.log('启动模拟数据发送器...');
    
    // 初始化模拟状态
    simulationState = {
        batteryCapacity: 75, // 初始电池容量
        batteryTrend: 0.1,   // 初始趋势(充电中)
        solarVoltage: 15,    // 初始太阳能电压
        solarCurrent: 1,     // 初始太阳能电流
        loadPower: 15,       // 初始负载功率
        temperature: 30      // 初始温度
    };
    
    // 停止之前的定时器
    if (simulationConfig.simulationTimer) {
        clearInterval(simulationConfig.simulationTimer);
    }
    
    // 设置发送间隔
    const INTERVAL = 3000; // 3秒一次，缩短间隔以便更快看到效果
    console.log(`启动模拟数据发送，间隔： ${INTERVAL} ms`);
    
    // 立即发送多次模拟数据，以确保前端有足够的数据显示
    console.log('立即发送初始化数据...');
    for (let i = 0; i < 10; i++) {
        setTimeout(() => {
            sendSimulatedData(io);
        }, i * 100); // 快速发送10次初始数据
    }
    
    // 定期发送模拟数据
    simulationConfig.simulationTimer = setInterval(() => {
        sendSimulatedData(io);
    }, INTERVAL);
    
    return true;
}

// 发送模拟数据
async function sendSimulatedData(io) {
    try {
        // 生成模拟数据
        const data = generateSimulatedData();
        console.log('发送模拟数据（上次真实数据接收时间： ' + 
            (simulationConfig.lastRealDataTime ? new Date(simulationConfig.lastRealDataTime).toLocaleString() : '从未') + ' ）');

        // 格式化数据供前端使用
        const formattedData = formatDataForFrontend(data);
        
        // 生成电价数据
        const priceData = generatePriceData();
        formattedData.price = priceData;
        
        // 确保所有数据都有合理的非零值
        ensureValidData(formattedData);
        
        // 使用全局API天气数据（如果可用）
        if (global.lastApiWeatherData) {
            console.log('使用全局API天气数据');
            formattedData.weather = global.lastApiWeatherData;
        } else {
            console.log('无API天气数据可用');
            // 不生成模拟天气数据
        }
        
        // 通过WebSocket发送数据到前端
        io.emit('device-data', formattedData);
        
        // 保存到数据库（如果可用）
        try {
            await saveToDatabase(formattedData);
            
            // 保存电价数据
            try {
                const conn = await pool.getConnection();
                await conn.query(
                    'INSERT INTO electricity_price (price, price_level, next_change_time, timestamp) VALUES (?, ?, ?, NOW())',
                    [priceData.price, priceData.price_level, new Date(priceData.next_change_time)]
                );
                conn.release();
            } catch (priceError) {
                console.error('保存电价数据到数据库时出错:', priceError);
            }
        } catch (error) {
            console.error('保存模拟数据到数据库时出错:', error);
        }
        
        // 也发送data-update事件格式的数据，确保兼容性
        const dataUpdatePayload = {
            timestamp: new Date().toISOString(),
            battery: formattedData.battery,
            solar: formattedData.solar,
            system: {
                source: formattedData.power.source,
                loadPower: formattedData.power.load_power,
                gridStatus: formattedData.power.grid_status,
                solarStatus: formattedData.power.solar_status
            },
            price: priceData
        };
        
        // 只有在有API天气数据时才添加到payload
        if (global.lastApiWeatherData) {
            dataUpdatePayload.weather = global.lastApiWeatherData;
        }
        
        io.emit('data-update', dataUpdatePayload);
        
        return true;
    } catch (error) {
        console.error('发送模拟数据时出错:', error);
        return false;
    }
}

// 确保所有数据都有合理的非零值
function ensureValidData(data) {
    // 确保电池数据有效
    if (data.battery) {
        if (!data.battery.voltage || data.battery.voltage <= 0) {
            data.battery.voltage = 12 + Math.random() * 2;
        }
        if (!data.battery.capacity || data.battery.capacity <= 0) {
            data.battery.capacity = 75 + Math.random() * 25;
        }
        data.battery.status = data.battery.voltage > 12.5 ? '充电中' : '放电中';
    }
    
    // 确保太阳能数据有效
    if (data.solar) {
        if (!data.solar.voltage || data.solar.voltage <= 0) {
            data.solar.voltage = 15 + Math.random() * 3;
        }
        if (!data.solar.current || data.solar.current <= 0) {
            data.solar.current = 0.8 + Math.random() * 1.2;
        }
        if (!data.solar.power || data.solar.power <= 0) {
            data.solar.power = data.solar.voltage * data.solar.current;
        }
        data.solar.efficiency = 80 + Math.random() * 15;
    }
    
    // 确保电源状态数据有效
    if (data.power) {
        if (!data.power.load_power || data.power.load_power <= 0) {
            data.power.load_power = 50 + Math.random() * 100;
        }
        if (!data.power.source || data.power.source === '') {
            data.power.source = Math.random() > 0.5 ? '太阳能' : '电网';
        }
        data.power.grid_status = '正常';
        data.power.solar_status = data.power.source === '太阳能' ? '正常' : '低效';
    }
    
    // 确保电价数据有效
    if (data.price) {
        if (!data.price.price || data.price.price <= 0) {
            data.price.price = 0.52 + Math.random() * 0.3;
        }
    }
    
    return data;
}

// 生成电价数据
function generatePriceData() {
    const now = new Date();
    const hour = now.getHours();
    
    // 根据时间段生成不同的电价等级
    let priceLevel = '平值';
    let price = 0.52; // 默认平值电价
    
    // 8:00-12:00 和 17:00-21:00 是峰值时段
    if ((hour >= 8 && hour < 12) || (hour >= 17 && hour < 21)) {
        priceLevel = '峰值';
        price = 0.82; // 峰值电价
    } 
    // 23:00-次日7:00 是谷值时段
    else if (hour >= 23 || hour < 7) {
        priceLevel = '谷值';
        price = 0.32; // 谷值电价
    }
    
    // 计算下次电价变动时间
    let nextChangeHour;
    if (hour < 7) nextChangeHour = 7;
    else if (hour < 8) nextChangeHour = 8;
    else if (hour < 12) nextChangeHour = 12;
    else if (hour < 17) nextChangeHour = 17;
    else if (hour < 21) nextChangeHour = 21;
    else if (hour < 23) nextChangeHour = 23;
    else nextChangeHour = 7; // 跨天
    
    const nextChangeTime = new Date(now);
    if (hour >= 23 && nextChangeHour < 23) {
        // 跨天设置
        nextChangeTime.setDate(nextChangeTime.getDate() + 1);
    }
    nextChangeTime.setHours(nextChangeHour, 0, 0, 0);
    
    return {
        price: price + (Math.random() - 0.5) * 0.05, // 增加少量随机波动
        price_level: priceLevel,
        next_change_time: nextChangeTime.toISOString(),
        timestamp: now.toISOString()
    };
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