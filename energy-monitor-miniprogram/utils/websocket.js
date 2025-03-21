/**
 * WebSocket连接管理器
 */
const config = require('./config');

// 连接状态
let socketState = {
  connected: false,
  connecting: false,
  socket: null,
  reconnectTimer: null,
  reconnectCount: 0,
  maxReconnectAttempts: 5,
  reconnectInterval: 3000, // 毫秒
  messageHandlers: []
};

/**
 * 创建WebSocket连接
 */
function connectSocket() {
  // 如果已经连接或正在连接中，直接返回
  if (socketState.connected || socketState.connecting) {
    return;
  }

  socketState.connecting = true;
  
  // 清除可能存在的重连定时器
  if (socketState.reconnectTimer) {
    clearTimeout(socketState.reconnectTimer);
    socketState.reconnectTimer = null;
  }

  console.log('正在连接WebSocket服务器:', config.serverConfig.wsUrl);
  
  // 创建WebSocket连接
  socketState.socket = wx.connectSocket({
    url: config.serverConfig.wsUrl,
    success: () => {
      console.log('WebSocket连接请求已发送');
    },
    fail: (error) => {
      console.error('WebSocket连接请求发送失败:', error);
      handleSocketError();
    }
  });

  // 监听WebSocket事件
  socketState.socket.onOpen(handleSocketOpen);
  socketState.socket.onClose(handleSocketClose);
  socketState.socket.onError(handleSocketError);
  socketState.socket.onMessage(handleSocketMessage);
}

/**
 * 处理WebSocket连接打开事件
 */
function handleSocketOpen() {
  console.log('WebSocket连接已建立');
  socketState.connected = true;
  socketState.connecting = false;
  socketState.reconnectCount = 0;
}

/**
 * 处理WebSocket连接关闭事件
 */
function handleSocketClose() {
  console.log('WebSocket连接已关闭');
  socketState.connected = false;
  socketState.connecting = false;
  attemptReconnect();
}

/**
 * 处理WebSocket错误事件
 */
function handleSocketError(error) {
  console.error('WebSocket连接发生错误:', error);
  socketState.connected = false;
  socketState.connecting = false;
  attemptReconnect();
}

/**
 * 尝试重新连接WebSocket
 */
function attemptReconnect() {
  // 如果已达到最大重连次数，不再尝试
  if (socketState.reconnectCount >= socketState.maxReconnectAttempts) {
    console.error('WebSocket连接失败: 已超过最大重连次数');
    return;
  }

  socketState.reconnectCount++;
  
  console.log(`WebSocket将在${socketState.reconnectInterval/1000}秒后尝试第${socketState.reconnectCount}次重连`);
  
  // 设置重连定时器
  socketState.reconnectTimer = setTimeout(() => {
    connectSocket();
  }, socketState.reconnectInterval);
}

/**
 * 处理接收到的WebSocket消息
 * @param {Object} result - 接收到的消息对象
 */
function handleSocketMessage(result) {
  try {
    const data = JSON.parse(result.data);
    console.log('收到WebSocket消息:', data);
    
    // 调用所有注册的消息处理器
    socketState.messageHandlers.forEach(handler => {
      if (typeof handler === 'function') {
        handler(data);
      }
    });
  } catch (error) {
    console.error('处理WebSocket消息失败:', error);
  }
}

/**
 * 发送WebSocket消息
 * @param {Object|string} data - 要发送的数据
 * @returns {Promise<boolean>} - 是否发送成功
 */
function sendSocketMessage(data) {
  return new Promise((resolve, reject) => {
    if (!socketState.connected) {
      // 如果未连接，先尝试连接
      connectSocket();
      reject(new Error('WebSocket未连接'));
      return;
    }
    
    const message = typeof data === 'string' ? data : JSON.stringify(data);
    
    socketState.socket.send({
      data: message,
      success: () => {
        console.log('WebSocket消息发送成功');
        resolve(true);
      },
      fail: (error) => {
        console.error('WebSocket消息发送失败:', error);
        reject(error);
      }
    });
  });
}

/**
 * 关闭WebSocket连接
 */
function closeSocket() {
  if (socketState.socket && (socketState.connected || socketState.connecting)) {
    socketState.socket.close({
      success: () => {
        console.log('WebSocket连接已手动关闭');
      },
      fail: (error) => {
        console.error('关闭WebSocket连接失败:', error);
      }
    });
  }
  
  // 清除重连定时器
  if (socketState.reconnectTimer) {
    clearTimeout(socketState.reconnectTimer);
    socketState.reconnectTimer = null;
  }
  
  // 重置状态
  socketState.connected = false;
  socketState.connecting = false;
}

/**
 * 注册消息处理器
 * @param {Function} handler - 处理接收到的消息的回调函数
 */
function registerMessageHandler(handler) {
  if (typeof handler === 'function' && !socketState.messageHandlers.includes(handler)) {
    socketState.messageHandlers.push(handler);
  }
}

/**
 * 移除消息处理器
 * @param {Function} handler - 要移除的处理器函数
 */
function removeMessageHandler(handler) {
  const index = socketState.messageHandlers.indexOf(handler);
  if (index !== -1) {
    socketState.messageHandlers.splice(index, 1);
  }
}

// 导出API
module.exports = {
  connect: connectSocket,
  send: sendSocketMessage,
  close: closeSocket,
  registerHandler: registerMessageHandler,
  removeHandler: removeMessageHandler
}; 