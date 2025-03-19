import http.server
import socketserver
import os

# 设置端口
PORT = 8080

# 切换到public目录
os.chdir('public')

# 创建HTTP服务器
Handler = http.server.SimpleHTTPRequestHandler
httpd = socketserver.TCPServer(("", PORT), Handler)

print(f"服务器运行在端口 {PORT}")
print(f"访问地址: http://localhost:{PORT}")

# 启动服务器
httpd.serve_forever() 