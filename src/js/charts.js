// 图表实例
let voltageChart = null;
let powerChart = null;

// 初始化图表
function initCharts() {
    // 初始化电压图表
    voltageChart = echarts.init(document.getElementById('voltage-chart'));
    const voltageOption = {
        title: {
            text: '电压变化趋势',
            left: 'center'
        },
        tooltip: {
            trigger: 'axis'
        },
        legend: {
            data: ['电池电压', '太阳能电压'],
            bottom: 0
        },
        xAxis: {
            type: 'time',
            boundaryGap: false
        },
        yAxis: {
            type: 'value',
            name: '电压 (V)'
        },
        series: [
            {
                name: '电池电压',
                type: 'line',
                data: generateMockData(20, 11, 13),
                smooth: true,
                symbol: 'none'
            },
            {
                name: '太阳能电压',
                type: 'line',
                data: generateMockData(20, 15, 20),
                smooth: true,
                symbol: 'none'
            }
        ]
    };
    voltageChart.setOption(voltageOption);

    // 初始化功率图表
    powerChart = echarts.init(document.getElementById('power-chart'));
    const powerOption = {
        title: {
            text: '功率变化趋势',
            left: 'center'
        },
        tooltip: {
            trigger: 'axis'
        },
        legend: {
            data: ['系统功率'],
            bottom: 0
        },
        xAxis: {
            type: 'time',
            boundaryGap: false
        },
        yAxis: {
            type: 'value',
            name: '功率 (W)'
        },
        series: [
            {
                name: '系统功率',
                type: 'line',
                data: generateMockData(20, 0, 1000),
                smooth: true,
                symbol: 'none',
                areaStyle: {
                    opacity: 0.3
                }
            }
        ]
    };
    powerChart.setOption(powerOption);

    // 监听窗口大小变化，调整图表大小
    window.addEventListener('resize', function() {
        voltageChart.resize();
        powerChart.resize();
    });
}

// 生成模拟数据
function generateMockData(count, min, max) {
    const data = [];
    const now = new Date();
    for (let i = 0; i < count; i++) {
        data.push({
            name: new Date(now - (count - i) * 1000),
            value: [
                new Date(now - (count - i) * 1000),
                (Math.random() * (max - min) + min).toFixed(2)
            ]
        });
    }
    return data;
}

// 更新图表数据
function updateCharts() {
    if (!voltageChart || !powerChart) return;

    // 更新电压图表数据
    const voltageData = {
        battery: generateMockData(1, 11, 13),
        solar: generateMockData(1, 15, 20)
    };
    voltageChart.setOption({
        series: [
            {
                data: [...voltageChart.getOption().series[0].data, ...voltageData.battery].slice(-20)
            },
            {
                data: [...voltageChart.getOption().series[1].data, ...voltageData.solar].slice(-20)
            }
        ]
    });

    // 更新功率图表数据
    const powerData = generateMockData(1, 0, 1000);
    powerChart.setOption({
        series: [{
            data: [...powerChart.getOption().series[0].data, ...powerData].slice(-20)
        }]
    });
}

// 导出函数供其他模块使用
window.initCharts = initCharts;
window.updateCharts = updateCharts; 