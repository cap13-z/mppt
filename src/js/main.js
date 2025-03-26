// 页面加载完成后执行
document.addEventListener('DOMContentLoaded', function() {
    // 初始化图表
    initCharts();
    // 初始化实时数据更新
    initRealtimeData();
    // 初始化导航栏交互
    initNavigation();
});

// 初始化导航栏交互
function initNavigation() {
    const navLinks = document.querySelectorAll('.nav a');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            const targetSection = document.getElementById(targetId);
            if (targetSection) {
                targetSection.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
}

// 初始化实时数据更新
function initRealtimeData() {
    // 模拟实时数据更新（实际项目中需要替换为真实的API调用）
    setInterval(updateRealtimeData, 1000);
}

// 更新实时数据
function updateRealtimeData() {
    // 更新概览卡片数据
    updateOverviewCards();
    // 更新图表数据
    updateCharts();
    // 更新数据表格
    updateDataTable();
}

// 更新概览卡片数据
function updateOverviewCards() {
    // 模拟数据（实际项目中需要替换为真实的API数据）
    const mockData = {
        battery: {
            voltage: (Math.random() * 2 + 11).toFixed(2),
            capacity: Math.floor(Math.random() * 100)
        },
        solar: {
            voltage: (Math.random() * 5 + 15).toFixed(2),
            power: Math.floor(Math.random() * 1000)
        },
        system: {
            mode: Math.random() > 0.5 ? '太阳能供电' : '电网供电',
            runningTime: Math.floor(Math.random() * 24)
        }
    };

    // 更新DOM元素
    document.getElementById('battery-voltage').textContent = `${mockData.battery.voltage} V`;
    document.getElementById('battery-capacity').textContent = `${mockData.battery.capacity}%`;
    document.getElementById('solar-voltage').textContent = `${mockData.solar.voltage} V`;
    document.getElementById('solar-power').textContent = `${mockData.solar.power} W`;
    document.getElementById('power-mode').textContent = mockData.system.mode;
    document.getElementById('running-time').textContent = `${mockData.system.runningTime} h`;
}

// 更新数据表格
function updateDataTable() {
    const tbody = document.getElementById('realtime-data');
    const now = new Date();
    const timeStr = now.toLocaleTimeString();
    
    // 创建新的表格行
    const newRow = document.createElement('tr');
    newRow.innerHTML = `
        <td>${timeStr}</td>
        <td>${(Math.random() * 2 + 11).toFixed(2)} V</td>
        <td>${(Math.random() * 5 + 15).toFixed(2)} V</td>
        <td>${Math.floor(Math.random() * 1000)} W</td>
        <td>${Math.random() > 0.5 ? '正常' : '异常'}</td>
    `;

    // 将新行添加到表格开头
    tbody.insertBefore(newRow, tbody.firstChild);

    // 保持最多显示10行数据
    if (tbody.children.length > 10) {
        tbody.removeChild(tbody.lastChild);
    }
}

// 错误处理函数
function handleError(error) {
    console.error('发生错误:', error);
    // 这里可以添加错误提示UI
}

// 导出函数供其他模块使用
window.updateRealtimeData = updateRealtimeData;
window.handleError = handleError; 