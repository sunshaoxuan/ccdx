import paramiko
import os

hostname = "vmsnode.briconbric.com"
username = "root"
password = "BtZhY1^3"
web_root = "/var/www/ccdx"

def deep_fix():
    try:
        print(f"正在连接服务器 {hostname} 进行深度修复...")
        ssh = paramiko.SSHClient()
        ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
        ssh.connect(hostname, username=username, password=password)
        
        # 1. 检查目录内容
        print("\n--- 1. 检查目录内容 ---")
        stdin, stdout, stderr = ssh.exec_command(f"ls -la {web_root}")
        print(stdout.read().decode())
        
        # 2. 检查 Docker Compose 版本和路径
        print("\n--- 2. 检查 Docker Compose ---")
        stdin, stdout, stderr = ssh.exec_command("docker-compose --version")
        print(stdout.read().decode())
        stdin, stdout, stderr = ssh.exec_command("docker compose version")
        print(stdout.read().decode())
        
        # 3. 尝试使用 'docker compose' (新版) 启动
        print("\n--- 3. 尝试启动容器 ---")
        # 强制进入目录并运行
        cmd = f"cd {web_root} && docker compose up -d --build"
        stdin, stdout, stderr = ssh.exec_command(cmd)
        print("STDOUT:", stdout.read().decode())
        print("STDERR:", stderr.read().decode())
        
        # 4. 检查 Nginx 配置文件内容
        print("\n--- 4. 检查 Nginx 配置文件 ---")
        stdin, stdout, stderr = ssh.exec_command("cat /etc/nginx/sites-available/cc.briconbric.com.conf")
        print(stdout.read().decode())
        
        # 5. 检查 Nginx 软链接
        print("\n--- 5. 检查 Nginx 软链接 ---")
        stdin, stdout, stderr = ssh.exec_command("ls -l /etc/nginx/sites-enabled/cc.briconbric.com.conf")
        print(stdout.read().decode())

        ssh.close()
    except Exception as e:
        print(f"❌ 修复过程中发生错误: {str(e)}")

if __name__ == "__main__":
    deep_fix()
