// 导入必要的模块
const express = require('express');
const path = require('path');

// 创建 Express 应用
const app = express();

// 中间件设置
app.use(express.static(path.join(__dirname, 'public')));

// 基本路由
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 启动服务器
const PORT = 3003;
app.listen(PORT, () => {
    console.log(`服务器运行在端口 ${PORT}`);
    console.log(`访问地址: http://localhost:${PORT}`);
}); 