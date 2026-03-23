import paramiko
import os

hostname = "vmsnode.briconbric.com"
username = "root"
password = "BtZhY1^3"

def debug_server():
    try:
        print(f"正在连接服务器 {hostname} 进行故障排查...")
        ssh = paramiko.SSHClient()
        ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
        ssh.connect(hostname, username=username, password=password)
        
        # 1. 检查 Docker 容器状态
        print("\n--- 1. Docker 容器状态 ---")
        stdin, stdout, stderr = ssh.exec_command("docker ps -a")
        print(stdout.read().decode())
        
        # 2. 检查应用日志 (如果有容器崩溃)
        print("\n--- 2. 应用容器日志 (最近20行) ---")
        stdin, stdout, stderr = ssh.exec_command("docker logs --tail 20 $(docker ps -qf 'name=app')")
        print(stdout.read().decode())
        
        # 3. 测试本地访问 3000 端口
        print("\n--- 3. 测试本地访问 localhost:3000 ---")
        stdin, stdout, stderr = ssh.exec_command("curl -I http://localhost:3000")
        print(stdout.read().decode())
        
        # 4. 检查 Nginx 状态和配置
        print("\n--- 4. Nginx 状态 ---")
        stdin, stdout, stderr = ssh.exec_command("systemctl status nginx | grep Active")
        print(stdout.read().decode())
        
        print("\n--- 5. Nginx 配置测试 ---")
        stdin, stdout, stderr = ssh.exec_command("nginx -t")
        print(stderr.read().decode()) # nginx -t output goes to stderr
        
        # 5. 检查 443 端口监听情况
        print("\n--- 6. 端口监听 (443) ---")
        stdin, stdout, stderr = ssh.exec_command("netstat -tuln | grep :443")
        print(stdout.read().decode())
        
        # 6. 检查防火墙状态
        print("\n--- 7. 防火墙状态 (ufw) ---")
        stdin, stdout, stderr = ssh.exec_command("ufw status")
        print(stdout.read().decode())

        ssh.close()
    except Exception as e:
        print(f"❌ 排查过程中发生错误: {str(e)}")

if __name__ == "__main__":
    debug_server()
