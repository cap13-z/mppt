// 模拟数据生成脚本
// 当Socket.IO不可用时，使用此脚本生成模拟数据

// 生成随机数据的辅助函数
function getRandomNumber(min, max) {
    return min + Math.random() * (max - min);
}

// 生成随机状态
function getRandomStatus(statusOptions) {
    return statusOptions[Math.floor(Math.random() * statusOptions.length)];
}

// 生成模拟数据
function generateMockData() {
    const now = new Date();
    
    // 模拟电池数据
    const batteryData = {
        voltage: getRandomNumber(12, 14), // 12-14V
        capacity: getRandomNumber(50, 100), // 50-100%
        temperature: getRandomNumber(25, 35), // 25-35°C
        current: getRandomNumber(1, 3), // 1-3A
        status: getRandomStatus(['充电中', '放电中', '满电状态']),
        timestamp: now
    };
    
    // 模拟太阳能数据
    const solarData = {
        voltage: getRandomNumber(18, 22), // 18-22V
        current: getRandomNumber(0.5, 3), // 0.5-3A
        power: 0,
        efficiency: getRandomNumber(70, 90), // 70-90%
        timestamp: now
    };
    solarData.power = solarData.voltage * solarData.current;
    
    // 模拟系统供电状态
    const powerStatus = {
        source: Math.random() > 0.5 ? '太阳能' : '电网',
        load_power: getRandomNumber(50, 200), // 50-200W
        solar_status: Math.random() > 0.3 ? '正常' : '离线',
        grid_status: Math.random() > 0.2 ? '正常' : '断电',
        timestamp: now
    };
    
    // 模拟天气数据
    const weatherData = {
        temperature: getRandomNumber(20, 35), // 20-35°C
        humidity: getRandomNumber(40, 80), // 40-80%
        weather_condition: getRandomStatus(['晴朗', '多云', '阴天', '小雨']),
        solar_radiation: getRandomNumber(200, 800), // 200-800 W/m²
        timestamp: now
    };
    
    // 模拟电价数据
    const priceData = {
        price: getRandomNumber(0.5, 0.8), // 0.5-0.8 元/kWh
        price_level: getRandomStatus(['峰值', '平值', '谷值']),
        next_change_time: new Date(now.getTime() + 3600000 + Math.random() * 3600000), // 1-2小时后
        timestamp: now
    };
    
    return {
        battery: batteryData,
        solar: solarData,
        powerStatus: powerStatus,
        weather: weatherData,
        price: priceData
    };
}

// 更新页面数据
function updatePageData() {
    console.log('更新页面数据...');
    const mockData = generateMockData();
    
    // 更新页面显示
    document.getElementById('load-power').textContent = mockData.powerStatus.load_power.toFixed(1);
    
    // 更新太阳能状态
    const solarStatusElement = document.getElementById('solar-power-status');
    const gridStatusElement = document.getElementById('grid-power-status');
    
    if (mockData.powerStatus.source === '太阳能') {
        solarStatusElement.classList.add('active');
        solarStatusElement.classList.remove('inactive');
        gridStatusElement.classList.add('inactive');
        gridStatusElement.classList.remove('active');
    } else {
        gridStatusElement.classList.add('active');
        gridStatusElement.classList.remove('inactive');
        solarStatusElement.classList.add('inactive');
        solarStatusElement.classList.remove('active');
    }
    
    document.getElementById('solar-status-text').textContent = mockData.powerStatus.solar_status;
    document.getElementById('grid-status-text').textContent = mockData.powerStatus.grid_status;
    
    // 更新电池数据
    document.getElementById('battery-voltage').textContent = mockData.battery.voltage.toFixed(2);
    document.getElementById('battery-percentage').textContent = `${mockData.battery.capacity.toFixed(0)}%`;
    document.getElementById('battery-level').style.width = `${mockData.battery.capacity}%`;
    
    const batteryStatusElement = document.getElementById('battery-status');
    batteryStatusElement.textContent = mockData.battery.status;
    batteryStatusElement.className = 'status-indicator';
    
    if (mockData.battery.status.includes('充电')) {
        batteryStatusElement.classList.add('charging');
    } else if (mockData.battery.status.includes('放电')) {
        batteryStatusElement.classList.add('discharging');
    } else if (mockData.battery.status.includes('满电')) {
        batteryStatusElement.classList.add('full');
    }
    
    // 更新太阳能板数据
    document.getElementById('solar-power').textContent = mockData.solar.power.toFixed(1);
    document.getElementById('solar-voltage').textContent = `电压: ${mockData.solar.voltage.toFixed(1)}V`;
    document.getElementById('solar-current').textContent = `电流: ${mockData.solar.current.toFixed(2)}A`;
    document.getElementById('solar-efficiency').textContent = `效率: ${mockData.solar.efficiency.toFixed(1)}%`;
    
    // 更新天气数据
    let weatherIconClass = 'fa-sun';
    if (mockData.weather.weather_condition.includes('多云')) {
        weatherIconClass = 'fa-cloud-sun';
    } else if (mockData.weather.weather_condition.includes('阴')) {
        weatherIconClass = 'fa-cloud';
    } else if (mockData.weather.weather_condition.includes('雨')) {
        weatherIconClass = 'fa-cloud-rain';
    }
    
    document.getElementById('weather-icon').innerHTML = `<i class="fas ${weatherIconClass}"></i>`;
    document.getElementById('weather-condition').textContent = mockData.weather.weather_condition;
    document.getElementById('weather-temperature').textContent = `${mockData.weather.temperature.toFixed(1)}°C`;
    document.getElementById('weather-humidity').textContent = `${mockData.weather.humidity.toFixed(0)}%`;
    document.getElementById('solar-radiation').textContent = `${mockData.weather.solar_radiation.toFixed(0)} W/m²`;
    
    // 更新电价数据
    document.getElementById('electricity-price').textContent = mockData.price.price.toFixed(2);
    
    const priceLevelElement = document.getElementById('price-level');
    priceLevelElement.textContent = mockData.price.price_level;
    priceLevelElement.className = 'price-level';
    
    if (mockData.price.price_level === '峰值') {
        priceLevelElement.classList.add('peak');
    } else if (mockData.price.price_level === '平值') {
        priceLevelElement.classList.add('normal');
    } else if (mockData.price.price_level === '谷值') {
        priceLevelElement.classList.add('valley');
    }
    
    document.getElementById('next-price-change').textContent = `下次变动: ${new Date(mockData.price.next_change_time).toLocaleString('zh-CN')}`;
}

// 定时更新数据
function startMockDataUpdate() {
    console.log('启动模拟数据更新...');
    // 立即更新一次
    updatePageData();
    
    // 每10秒更新一次
    setInterval(updatePageData, 10000);
}

// 页面加载完成后启动模拟数据更新
window.addEventListener('load', function() {
    console.log('页面加载完成，准备替代Socket.IO...');
    
    // 检查Socket.IO是否可用
    if (typeof io === 'undefined') {
        console.log('Socket.IO不可用，使用模拟数据...');
        startMockDataUpdate();
    } else {
        console.log('Socket.IO可用，使用实时数据...');
    }
}); 