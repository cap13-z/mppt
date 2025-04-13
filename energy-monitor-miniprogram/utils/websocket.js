/**
 * WebSocket连接模块
 * 提供WebSocket连接管理和消息处理
 */

const config = require('./config');
const util = require('./util');

// WebSocket连接实例
let socketTask = null;

// 连接状态
let isConnecting = false;
let isConnected = false;

// 重连计数和定时器
let reconnectCount = 0;
let reconnectTimer = null;
const MAX_RECONNECT = 5;
const RECONNECT_INTERVAL = 5000; // 5秒重连间隔

// 消息处理器集合
const messageHandlers = {
  'message': [],
  'open': [],
  'close': [],
  'error': []
};

/**
 * 连接WebSocket服务器
 * @returns {Promise} 连接结果Promise
 */
const connect = () => {
  return new Promise((resolve, reject) => {
    // 避免重复连接
    if (isConnected || isConnecting) {
      resolve({ connected: isConnected });
      return;
    }
    
    isConnecting = true;
    
    // 获取WebSocket服务器地址
    const wsUrl = 'ws://localhost:3001/ws';
    
    console.log('开始连接WebSocket:', wsUrl);
    
    try {
      // 创建WebSocket连接
      socketTask = wx.connectSocket({
        url: wsUrl,
        success: () => {
          console.log('WebSocket连接创建成功');
        },
        fail: (err) => {
          console.error('WebSocket连接创建失败:', err);
          isConnecting = false;
          // 静默失败，不抛出错误给上层
          resolve({ connected: false, error: err });
        }
      });
      
      // 设置超时检测，避免连接长时间未响应
      const connectionTimeout = setTimeout(() => {
        if (isConnecting && !isConnected) {
          console.log('WebSocket连接超时');
          isConnecting = false;
          resolve({ connected: false, error: { errMsg: 'connection timeout' } });
        }
      }, 5000);
      
      // 监听WebSocket连接打开事件
      socketTask.onOpen(() => {
        console.log('WebSocket连接已打开');
        clearTimeout(connectionTimeout);
        isConnected = true;
        isConnecting = false;
        reconnectCount = 0;
        
        // 调用open处理器
        triggerHandlers('open', {});
        
        resolve({ connected: true });
      });
      
      // 监听WebSocket接收到服务器的消息事件
      socketTask.onMessage((res) => {
        try {
          // 解析消息
          const message = JSON.parse(res.data);
          console.log('收到WebSocket消息:', message);
          
          // 预处理消息数据，展开嵌套对象
          if (message.data) {
            // 如果存在battery对象，将其属性展开
            if (message.data.battery && typeof message.data.battery === 'object') {
              console.log('WebSocket: 展开battery对象');
              Object.keys(message.data.battery).forEach(key => {
                message.data[`battery${key.charAt(0).toUpperCase() + key.slice(1)}`] = message.data.battery[key];
              });
              delete message.data.battery;
            }
            
            // 如果存在solar对象，将其属性展开
            if (message.data.solar && typeof message.data.solar === 'object') {
              console.log('WebSocket: 展开solar对象');
              Object.keys(message.data.solar).forEach(key => {
                message.data[`solar${key.charAt(0).toUpperCase() + key.slice(1)}`] = message.data.solar[key];
              });
              delete message.data.solar;
            }
          }
          
          // 调用message处理器
          triggerHandlers('message', message);
        } catch (error) {
          console.error('解析WebSocket消息失败:', error, res.data);
        }
      });
      
      // 监听WebSocket错误事件
      socketTask.onError((err) => {
        console.error('WebSocket发生错误:', err);
        
        // 调用error处理器
        triggerHandlers('error', err);
        
        // 尝试重连
        handleReconnect(err);
        
        // 静默失败，不抛出错误给上层
        resolve({ connected: false, error: err });
      });
      
      // 监听WebSocket连接关闭事件
      socketTask.onClose((res) => {
        console.log('WebSocket连接已关闭:', res);
        isConnected = false;
        
        // 调用close处理器
        triggerHandlers('close', res);
        
        // 意外关闭时尝试重连
        if (res.code !== 1000) {
          handleReconnect();
        }
      });
    } catch (error) {
      console.error('创建WebSocket连接失败:', error);
      isConnecting = false;
      // 静默失败，不抛出错误给上层
      resolve({ connected: false, error: error });
    }
  });
};

/**
 * 处理连接断开后的重连
 * @param {Object} error 错误信息
 */
const handleReconnect = (error) => {
  isConnected = false;
  
  // 清除可能存在的重连定时器
  if (reconnectTimer) {
    clearTimeout(reconnectTimer);
    reconnectTimer = null;
  }
  
  // 超过最大重连次数，不再重连
  if (reconnectCount >= MAX_RECONNECT) {
    console.log('超过最大重连次数，停止重连');
    return;
  }
  
  // 递增重连计数
  reconnectCount++;
  
  // 设置重连定时器
  console.log(`${RECONNECT_INTERVAL / 1000}秒后尝试第${reconnectCount}次重连...`);
  reconnectTimer = setTimeout(() => {
    console.log(`开始第${reconnectCount}次重连...`);
    connect().catch(err => {
      console.error(`第${reconnectCount}次重连失败:`, err);
    });
  }, RECONNECT_INTERVAL);
};

/**
 * 发送WebSocket消息
 * @param {string} type 消息类型
 * @param {Object} data 消息数据
 * @returns {Promise} 发送结果Promise
 */
const send = (type, data = {}) => {
  return new Promise((resolve, reject) => {
    if (!isConnected || !socketTask) {
      reject(new Error('WebSocket未连接'));
      return;
    }
    
    try {
      // 构建消息对象
      const message = {
        type: type,
        data: data,
        timestamp: new Date().toISOString()
      };
      
      // 发送消息
      socketTask.send({
        data: JSON.stringify(message),
        success: () => {
          console.log('消息发送成功:', type);
          resolve({ success: true });
        },
        fail: (err) => {
          console.error('消息发送失败:', err);
          reject(err);
        }
      });
    } catch (error) {
      console.error('发送消息出错:', error);
      reject(error);
    }
  });
};

/**
 * 关闭WebSocket连接
 * @param {number} code 关闭代码
 * @param {string} reason 关闭原因
 * @returns {Promise} 关闭结果Promise
 */
const close = (code = 1000, reason = '用户关闭') => {
  return new Promise((resolve, reject) => {
    if (!socketTask) {
      resolve({ closed: true });
      return;
    }
    
    try {
      // 关闭连接
      socketTask.close({
        code: code,
        reason: reason,
        success: () => {
          console.log('WebSocket连接已关闭');
          isConnected = false;
          socketTask = null;
          resolve({ closed: true });
        },
        fail: (err) => {
          console.error('关闭WebSocket连接失败:', err);
          reject(err);
        }
      });
    } catch (error) {
      console.error('关闭WebSocket连接出错:', error);
      reject(error);
    }
  });
};

/**
 * 注册消息处理器
 * @param {string} type 消息类型
 * @param {Function} handler 处理函数
 */
const registerHandler = (type, handler) => {
  if (typeof handler !== 'function') {
    console.error('处理器必须是函数');
    return;
  }
  
  if (!messageHandlers[type]) {
    messageHandlers[type] = [];
  }
  
  messageHandlers[type].push(handler);
  console.log(`已注册[${type}]处理器`);
};

/**
 * 移除消息处理器
 * @param {Function} handler 要移除的处理函数
 */
const removeHandler = (handler) => {
  if (typeof handler !== 'function') {
    console.error('处理器必须是函数');
    return;
  }
  
  // 遍历所有类型的处理器，移除匹配的
  Object.keys(messageHandlers).forEach(type => {
    const index = messageHandlers[type].indexOf(handler);
    if (index !== -1) {
      messageHandlers[type].splice(index, 1);
      console.log(`已移除[${type}]处理器`);
    }
  });
};

/**
 * 触发指定类型的所有处理器
 * @param {string} type 消息类型
 * @param {Object} data 消息数据
 */
const triggerHandlers = (type, data) => {
  if (!messageHandlers[type] || messageHandlers[type].length === 0) {
    return;
  }
  
  // 调用所有该类型的处理器
  messageHandlers[type].forEach(handler => {
    try {
      handler(data);
    } catch (error) {
      console.error(`执行[${type}]处理器出错:`, error);
    }
  });
};

/**
 * 获取WebSocket连接状态
 * @returns {boolean} 是否已连接
 */
const getConnectionStatus = () => {
  return { 
    connected: isConnected,
    connecting: isConnecting,
    reconnectCount: reconnectCount
  };
};

// 导出模块方法
module.exports = {
  connect,
  send,
  close,
  registerHandler,
  removeHandler,
  getConnectionStatus,
  
  // 便于调试
  get isConnected() {
    return isConnected;
  }
}; 