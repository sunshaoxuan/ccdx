import paramiko
import os

hostname = "vmsnode.briconbric.com"
username = "root"
password = "BtZhY1^3"
web_root = "/var/www/ccdx"

def fix_deployment():
    try:
        print(f"正在连接服务器 {hostname} 修复部署...")
        ssh = paramiko.SSHClient()
        ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
        ssh.connect(hostname, username=username, password=password)
        
        # 1. 强制重新构建并启动 Docker 容器
        print("正在强制重新构建并启动 Docker 容器...")
        # 确保在正确的目录
        ssh.exec_command(f"cd {web_root} && /usr/local/bin/docker-compose down")[1].channel.recv_exit_status()
        stdin, stdout, stderr = ssh.exec_command(f"cd {web_root} && /usr/local/bin/docker-compose up -d --build")
        print(stdout.read().decode())
        print(stderr.read().decode())
        
        # 2. 等待几秒钟让容器启动
        import time
        time.sleep(5)
        
        # 3. 再次检查容器状态
        print("\n--- 检查容器状态 ---")
        stdin, stdout, stderr = ssh.exec_command("docker ps")
        print(stdout.read().decode())
        
        # 4. 检查 3000 端口
        print("\n--- 检查 3000 端口 ---")
        stdin, stdout, stderr = ssh.exec_command("netstat -tuln | grep :3000")
        print(stdout.read().decode())
        
        # 5. 检查 Nginx 监听
        print("\n--- 检查 Nginx 监听 (80/443) ---")
        stdin, stdout, stderr = ssh.exec_command("netstat -tuln | grep -E ':80|:443'")
        print(stdout.read().decode())

        ssh.close()
    except Exception as e:
        print(f"❌ 修复过程中发生错误: {str(e)}")

if __name__ == "__main__":
    fix_deployment()
