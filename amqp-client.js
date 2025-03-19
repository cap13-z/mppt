// amqp-client.js
// 阿里云AMQP客户端，用于获取设备数据

const rhea = require('rhea');
const crypto = require('node:crypto');
const mysql = require('mysql2/promise');

// 阿里云AMQP配置
const config = {
    endPoint: 'amqps://ilop.iot-amqp.cn-shanghai.aliyuncs.com:5671',
    appKey: '335298326',  // 使用您的AppKey
    appSecret: 'dd8915b8ab8d4f1dbf512c5be0d29713',  // 使用您的AppSecret
    consumerGroupId: '335298326',  // 通常与AppKey相同
    clientId: 'mppt_client_' + Math.random().toString(36).substring(2, 15),
    productKey: 'a1Nz0KACK2w'  // 您的产品Key
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
    realDataTimeout: 30000,  // 真实数据超时时间（毫秒）
    lastRealDataTime: 0,  // 上次接收到真实数据的时间
    simulationTimer: null  // 模拟数据定时器
};

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
                        'INSERT INTO battery_data (voltage, capacity, temperature, current, timestamp) VALUES (?, ?, ?, ?, NOW())',
                        [data.params.vot, 
                         calculateBatteryCapacity(data.params.vot), // 根据电压估算电池容量
                         data.params.tem || 25, // 如果有温度数据则使用，否则默认25度
                         0] // 没有电流数据，默认为0
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
                    
                    // 同时也保存到太阳能数据表，作为太阳能输出功率
                    await conn.query(
                        'INSERT INTO solar_data (voltage, current, power, efficiency, timestamp) VALUES (?, ?, ?, ?, NOW())',
                        [data.params.vot || 0, 
                         data.params.powerConsumption / (data.params.vot || 1), // 根据功率和电压计算电流
                         data.params.powerConsumption,
                         85] // 默认效率85%
                    );
                }
                
                // 处理温度数据
                if (data.params.tem !== undefined) {
                    await conn.query(
                        'INSERT INTO weather_data (temperature, humidity, weather_condition, solar_radiation, timestamp) VALUES (?, ?, ?, ?, NOW())',
                        [data.params.tem, 
                         50, // 默认湿度50%
                         '晴朗', // 默认天气状况
                         800] // 默认太阳辐射
                    );
                }
                
                // 处理电表状态数据
                if (data.params.ElectricMeterState !== undefined) {
                    const status = getStatusFromMeterState(data.params.ElectricMeterState);
                    await conn.query(
                        'INSERT INTO power_status (status, timestamp) VALUES (?, NOW())',
                        [status]
                    );
                }
            }
        } else if (data.topic && data.topic.includes('/mqtt/status')) {
            // 设备状态变更消息
            await conn.query(
                'INSERT INTO power_status (status, timestamp) VALUES (?, NOW())',
                [data.status]
            );
        }
        
        conn.release();
        console.log('数据已保存到数据库');
    } catch (err) {
        console.error('保存数据到数据库时出错:', err);
    }
}

// 根据电压估算电池容量
function calculateBatteryCapacity(voltage) {
    // 假设电池电压范围为10.5V（空）到12.6V（满）
    const minVoltage = 10.5;
    const maxVoltage = 12.6;
    
    if (voltage >= maxVoltage) return 100;
    if (voltage <= minVoltage) return 0;
    
    // 线性映射电压到容量
    return Math.round((voltage - minVoltage) / (maxVoltage - minVoltage) * 100);
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
    
    // 根据时间生成不同的模拟数据
    // 白天(6-18点)：太阳能发电较多，电池充电
    // 晚上(18-6点)：太阳能发电较少，电池放电
    const isDaytime = hour >= 6 && hour < 18;
    
    // 生成随机波动
    const randomFluctuation = () => (Math.random() * 0.2 + 0.9);
    
    // 电压 - 白天略高，晚上略低
    const baseVoltage = isDaytime ? 12.2 : 11.8;
    const voltage = baseVoltage * randomFluctuation();
    
    // 功耗 - 白天略低（太阳能供电），晚上略高（电池供电）
    const basePower = isDaytime ? 80 : 120;
    const powerConsumption = basePower * randomFluctuation();
    
    // 温度 - 白天略高，晚上略低
    const baseTemp = isDaytime ? 28 : 22;
    const temperature = baseTemp * randomFluctuation();
    
    // 生成湿度数据 - 白天略低，晚上略高
    const baseHumidity = isDaytime ? 45 : 65;
    const humidity = Math.min(100, baseHumidity * randomFluctuation());
    
    // 生成天气状况 - 根据随机数决定
    const weatherConditions = ['晴朗', '多云', '阴天', '小雨', '中雨'];
    const weatherCondition = weatherConditions[Math.floor(Math.random() * weatherConditions.length)];
    
    // 生成太阳辐射 - 白天较高，晚上为0
    const baseSolarRadiation = isDaytime ? 800 : 0;
    const solarRadiation = baseSolarRadiation * (isDaytime ? randomFluctuation() : 0);
    
    // 生成风向 - 随机选择
    const windDirections = ['东风', '南风', '西风', '北风', '东北风', '东南风', '西南风', '西北风'];
    const windDirection = windDirections[Math.floor(Math.random() * windDirections.length)];
    
    // 生成风力等级 - 1-6级随机
    const windScale = Math.floor(Math.random() * 6) + 1;
    
    // 电表状态 - 白天更可能使用太阳能，晚上更可能使用电网
    const electricMeterState = isDaytime ? 
        (Math.random() > 0.7 ? 3 : 2) : // 白天70%太阳能，30%电网
        (Math.random() > 0.3 ? 3 : 2);  // 晚上30%太阳能，70%电网
    
    // 构造模拟数据
    return {
        topic: '/sys/' + config.productKey + '/thing/event/property/post',
        params: {
            vot: parseFloat(voltage.toFixed(2)),
            powerConsumption: parseFloat(powerConsumption.toFixed(2)),
            tem: parseFloat(temperature.toFixed(2)),
            humidity: parseFloat(humidity.toFixed(1)),
            weatherCondition: weatherCondition,
            solarRadiation: parseFloat(solarRadiation.toFixed(0)),
            windDirection: windDirection,
            windScale: windScale.toString(),
            ElectricMeterState: electricMeterState
        },
        isSimulated: true // 标记为模拟数据
    };
}

// 格式化数据，适应前端显示
function formatDataForFrontend(data) {
    // 如果是设备属性上报数据
    if (data.params) {
        const timestamp = new Date().toISOString();
        
        return {
            timestamp: timestamp,
            battery: {
                voltage: data.params.vot || 0,
                capacity: data.params.vot ? calculateBatteryCapacity(data.params.vot) : 0,
                temperature: data.params.tem || 25,
                current: 0, // 没有电流数据，默认为0
                status: data.params.ElectricMeterState !== undefined ? 
                    getStatusFromMeterState(data.params.ElectricMeterState) : 'unknown'
            },
            solar: {
                voltage: data.params.vot || 0,
                current: data.params.powerConsumption && data.params.vot ? 
                    (data.params.powerConsumption / data.params.vot) : 0,
                power: data.params.powerConsumption || 0,
                efficiency: 85, // 默认效率85%
                temperature: data.params.tem || 25
            },
            system: {
                online: data.params.ElectricMeterState !== undefined ? 
                    (data.params.ElectricMeterState !== 0 && data.params.ElectricMeterState !== 1) : true,
                source: data.params.ElectricMeterState === 3 ? '电网' : '太阳能',
                loadPower: data.params.powerConsumption || 0,
                mode: 'MPPT模式',
                gridStatus: data.params.ElectricMeterState === 3 ? '在线' : '离线',
                solarStatus: data.params.ElectricMeterState !== 3 ? '在线' : '离线',
                meterStatus: data.params.ElectricMeterState !== undefined ? 
                    ['离线正常', '离线异常', '设备管理', '电网端'][data.params.ElectricMeterState] : '未知'
            },
            weather: {
                temperature: data.params.tem || 25,
                humidity: data.params.humidity || 50, // 默认湿度50%
                condition: data.params.weatherCondition || '晴朗', // 默认天气状况
                radiation: data.params.solarRadiation || 800, // 默认太阳辐射
                windDirection: data.params.windDirection || '东北风', // 默认风向
                windScale: data.params.windScale || '3', // 默认风力等级
                isSimulated: data.isSimulated || true // 标记是否为模拟数据
            },
            price: {
                current: 0.5, // 默认电价
                level: '平值', // 默认电价等级
                nextChange: new Date(Date.now() + 3600000).toISOString() // 默认下次变动时间为1小时后
            },
            isSimulated: data.isSimulated || false // 标记是否为模拟数据
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

// 生成认证信息
function generateAuth() {
    const random = Math.floor(Date.now());
    const signContent = 'random=' + random;
    const hmac = crypto.createHmac('sha256', config.appSecret);
    hmac.update(signContent);
    const password = hmac.digest('base64');
    
    const username = config.clientId + '|authMode=appkey'
        + ',signMethod=SHA256'
        + ',random=' + random
        + ',appKey=' + config.appKey
        + ',groupId=' + config.consumerGroupId + '|';
        
    return { username, password };
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

// 启动AMQP客户端函数
function startAmqpClient(io) {
    try {
        console.log('正在创建AMQP连接...');
        
        // 启动模拟数据发送
        startSimulation(io);
        
        // 创建AMQP连接
        const auth = generateAuth();
        const connection = rhea.connect({
            host: 'ilop.iot-amqp.cn-shanghai.aliyuncs.com',
            port: 5671,
            transport: 'tls',
            idle_time_out: 80000,
            username: auth.username,
            password: auth.password
        });

        // 处理连接事件
        connection.on('connection_open', function(context) {
            console.log('AMQP连接已建立');
            const receiver = context.connection.open_receiver('default');
            
            receiver.on('message', function(context) {
                try {
                    const message = context.message;
                    const data = JSON.parse(message.body);
                    console.log('收到AMQP消息:', data);
                    
                    // 更新上次接收真实数据的时间
                    updateLastRealDataTime();
                    
                    // 保存数据到数据库
                    saveToDatabase(data);
                    
                    // 如果提供了Socket.IO实例，发送数据到前端
                    if (io) {
                        // 转换数据格式，适应前端显示
                        const formattedData = formatDataForFrontend(data);
                        io.emit('device-data', formattedData);
                    }
                } catch (err) {
                    console.error('处理AMQP消息时出错:', err);
                }
            });
        });

        connection.on('disconnected', function(context) {
            console.log('AMQP连接已断开', context.error);
            // 尝试重新连接
            setTimeout(() => {
                console.log('尝试重新连接AMQP...');
                startAmqpClient(io);
            }, 5000);
        });
        
        // 添加错误处理
        connection.on('error', function(context) {
            console.error('AMQP连接错误:', context.error);
        });
        
        return {
            connection,
            updateLastRealDataTime,
            startSimulation,
            stopSimulation,
            setSimulationEnabled: (enabled) => {
                simulationConfig.enabled = enabled;
                console.log('模拟数据发送已' + (enabled ? '启用' : '禁用'));
            },
            setSimulationInterval: (interval) => {
                simulationConfig.interval = interval;
                console.log('模拟数据发送间隔已设置为', interval, 'ms');
                // 重启模拟数据发送
                if (simulationConfig.simulationTimer) {
                    stopSimulation();
                    startSimulation(io);
                }
            }
        };
    } catch (error) {
        console.error('创建AMQP连接时出错:', error);
        // 即使AMQP连接失败，也返回模拟数据相关的功能
        return {
            connection: null,
            updateLastRealDataTime,
            startSimulation,
            stopSimulation,
            setSimulationEnabled: (enabled) => {
                simulationConfig.enabled = enabled;
                console.log('模拟数据发送已' + (enabled ? '启用' : '禁用'));
            },
            setSimulationInterval: (interval) => {
                simulationConfig.interval = interval;
                console.log('模拟数据发送间隔已设置为', interval, 'ms');
                // 重启模拟数据发送
                if (simulationConfig.simulationTimer) {
                    stopSimulation();
                    startSimulation(io);
                }
            }
        };
    }
}

// 导出函数
module.exports = { startAmqpClient };