/**
 * WebSocket连接管理工具
 * 负责管理与服务器的WebSocket连接，处理消息发送、接收和重连
 */

// WebSocket连接状态
let socketOpen = false;
// 消息队列，存储未发送的消息
let socketMsgQueue = [];
// WebSocket任务对象
let socketTask = null;
// 回调函数
let connectCallback = null;
let messageCallback = null;
let disconnectCallback = null;
// 自动重连配置
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 10;
const RECONNECT_INTERVAL = 5000; // 5秒重连间隔

/**
 * 连接WebSocket服务器
 * @param {string} url - WebSocket服务器地址
 */
function connect(url) {
  console.log('尝试连接WebSocket:', url);
  // 创建WebSocket连接
  socketTask = wx.connectSocket({
    url: url,
    success: () => {
      console.log('WebSocket连接请求发送成功');
    },
    fail: (err) => {
      console.error('WebSocket连接请求发送失败', err);
      // 连接失败时尝试重连
      scheduleReconnect(url);
    }
  });
  
  // 监听连接打开事件
  socketTask.onOpen(() => {
    console.log('WebSocket连接已打开');
    socketOpen = true;
    reconnectAttempts = 0; // 重置重连计数
    
    // 发送队列中的消息
    while(socketMsgQueue.length > 0) {
      const msg = socketMsgQueue.shift();
      send(msg);
    }
    
    // 调用连接成功回调
    if (connectCallback) {
      connectCallback();
    }
  });
  
  // 监听消息接收事件
  socketTask.onMessage((res) => {
    console.log('收到WebSocket消息:', res);
    
    // 调用消息回调
    if (messageCallback) {
      try {
        // 尝试解析JSON数据
        const data = JSON.parse(res.data);
        messageCallback(data);
      } catch (e) {
        console.error('解析WebSocket消息失败:', e);
        // 如果解析失败，传递原始数据
        messageCallback(res.data);
      }
    }
  });
  
  // 监听连接关闭事件
  socketTask.onClose(() => {
    console.log('WebSocket连接已关闭');
    socketOpen = false;
    
    // 调用断开连接回调
    if (disconnectCallback) {
      disconnectCallback();
    }
    
    // 尝试自动重连
    scheduleReconnect(url);
  });
  
  // 监听错误事件
  socketTask.onError((err) => {
    console.error('WebSocket连接发生错误:', err);
    socketOpen = false;
    
    // 尝试自动重连
    scheduleReconnect(url);
  });
}

/**
 * 安排重连
 * @param {string} url - WebSocket服务器地址
 */
function scheduleReconnect(url) {
  if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
    reconnectAttempts++;
    const delay = RECONNECT_INTERVAL * Math.pow(1.5, reconnectAttempts - 1);
    console.log(`${delay / 1000}秒后尝试第${reconnectAttempts}次重连...`);
    
    setTimeout(() => {
      console.log(`正在进行第${reconnectAttempts}次重连...`);
      connect(url);
    }, delay);
  } else {
    console.error(`重连失败：已达到最大重连次数(${MAX_RECONNECT_ATTEMPTS})`);
  }
}

/**
 * 发送WebSocket消息
 * @param {Object|string} msg - 要发送的消息
 */
function send(msg) {
  if (socketOpen) {
    // 如果连接已打开，直接发送消息
    socketTask.send({
      data: typeof msg === 'string' ? msg : JSON.stringify(msg),
      success: () => {
        console.log('WebSocket消息发送成功:', msg);
      },
      fail: (err) => {
        console.error('WebSocket消息发送失败:', err);
      }
    });
  } else {
    // 如果连接未打开，将消息加入队列
    socketMsgQueue.push(msg);
    console.log('WebSocket未连接，消息已加入队列:', msg);
  }
}

/**
 * 关闭WebSocket连接
 */
function close() {
  if (socketTask) {
    socketTask.close({
      success: () => {
        console.log('WebSocket连接关闭成功');
      },
      fail: (err) => {
        console.error('WebSocket连接关闭失败:', err);
      }
    });
  }
}

/**
 * 设置连接成功回调
 * @param {Function} callback - 连接成功的回调函数
 */
function onConnect(callback) {
  connectCallback = callback;
}

/**
 * 设置接收消息回调
 * @param {Function} callback - 接收消息的回调函数
 */
function onMessage(callback) {
  messageCallback = callback;
}

/**
 * 设置连接断开回调
 * @param {Function} callback - 连接断开的回调函数
 */
function onDisconnect(callback) {
  disconnectCallback = callback;
}

// 导出WebSocket工具函数
module.exports = {
  connect,
  send,
  close,
  onConnect,
  onMessage,
  onDisconnect
}; 