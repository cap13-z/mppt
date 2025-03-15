// 数据处理类
class DataHandler {
    constructor() {
        this.baseUrl = 'http://your-api-endpoint'; // 替换为实际的API端点
        this.ws = null;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.reconnectDelay = 3000;
    }

    // 初始化WebSocket连接
    initWebSocket() {
        try {
            this.ws = new WebSocket('ws://your-websocket-endpoint'); // 替换为实际的WebSocket端点
            
            this.ws.onopen = () => {
                console.log('WebSocket连接已建立');
                this.reconnectAttempts = 0;
            };

            this.ws.onmessage = (event) => {
                this.handleWebSocketMessage(event.data);
            };

            this.ws.onclose = () => {
                console.log('WebSocket连接已关闭');
                this.handleReconnect();
            };

            this.ws.onerror = (error) => {
                console.error('WebSocket错误:', error);
                this.handleError(error);
            };
        } catch (error) {
            console.error('WebSocket初始化失败:', error);
            this.handleError(error);
        }
    }

    // 处理WebSocket消息
    handleWebSocketMessage(data) {
        try {
            const parsedData = JSON.parse(data);
            // 根据数据类型分发到不同的处理函数
            switch (parsedData.type) {
                case 'battery':
                    this.handleBatteryData(parsedData);
                    break;
                case 'solar':
                    this.handleSolarData(parsedData);
                    break;
                case 'system':
                    this.handleSystemData(parsedData);
                    break;
                default:
                    console.warn('未知的数据类型:', parsedData.type);
            }
        } catch (error) {
            console.error('数据处理错误:', error);
            this.handleError(error);
        }
    }

    // 处理电池数据
    handleBatteryData(data) {
        // 更新电池相关的UI元素
        document.getElementById('battery-voltage').textContent = `${data.voltage} V`;
        document.getElementById('battery-capacity').textContent = `${data.capacity}%`;
    }

    // 处理太阳能数据
    handleSolarData(data) {
        // 更新太阳能相关的UI元素
        document.getElementById('solar-voltage').textContent = `${data.voltage} V`;
        document.getElementById('solar-power').textContent = `${data.power} W`;
    }

    // 处理系统数据
    handleSystemData(data) {
        // 更新系统相关的UI元素
        document.getElementById('power-mode').textContent = data.mode;
        document.getElementById('running-time').textContent = `${data.runningTime} h`;
    }

    // 处理重连
    handleReconnect() {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            console.log(`尝试重新连接 (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
            setTimeout(() => {
                this.initWebSocket();
            }, this.reconnectDelay);
        } else {
            console.error('达到最大重连次数，请检查网络连接');
            this.handleError(new Error('WebSocket连接失败'));
        }
    }

    // 错误处理
    handleError(error) {
        console.error('数据处理错误:', error);
        // 这里可以添加错误提示UI
        window.handleError(error);
    }

    // 发送数据到服务器
    sendData(data) {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify(data));
        } else {
            console.warn('WebSocket未连接，无法发送数据');
        }
    }

    // 获取历史数据
    async getHistoricalData(startTime, endTime) {
        try {
            const response = await fetch(`${this.baseUrl}/historical-data`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    startTime,
                    endTime
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('获取历史数据失败:', error);
            this.handleError(error);
            return null;
        }
    }
}

// 创建全局实例
const dataHandler = new DataHandler();

// 导出实例供其他模块使用
window.dataHandler = dataHandler; 