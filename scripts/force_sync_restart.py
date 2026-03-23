import paramiko
import os

hostname = "vmsnode.briconbric.com"
username = "root"
password = "BtZhY1^3"
web_root = "/var/www/ccdx"

def force_sync_and_restart():
    try:
        print(f"正在连接服务器 {hostname} 强制同步并重启...")
        ssh = paramiko.SSHClient()
        ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
        ssh.connect(hostname, username=username, password=password)
        
        # 1. 强制 Git 同步
        print("1. 正在强制同步 Git 代码...")
        commands = [
            "git config --global --add safe.directory /var/www/ccdx",
            f"cd {web_root} && git fetch --all",
            f"cd {web_root} && git reset --hard origin/main",
            f"cd {web_root} && git clean -fd"
        ]
        for cmd in commands:
            ssh.exec_command(cmd)[1].channel.recv_exit_status()
            print(f"   执行完成: {cmd}")

        # 2. 强制重新构建并启动容器
        print("2. 正在强制重新构建并启动 Docker 容器...")
        ssh.exec_command(f"cd {web_root} && docker compose down")[1].channel.recv_exit_status()
        stdin, stdout, stderr = ssh.exec_command(f"cd {web_root} && docker compose up -d --build")
        print(stdout.read().decode())
        print(stderr.read().decode())

        # 3. 检查 Nginx 配置中的静态文件路径
        print("3. 检查 Nginx 静态资源路径...")
        stdin, stdout, stderr = ssh.exec_command("cat /etc/nginx/sites-available/cc.briconbric.com.conf")
        nginx_content = stdout.read().decode()
        print(nginx_content)

        # 4. 重启 Nginx
        print("4. 正在重启 Nginx...")
        ssh.exec_command("systemctl restart nginx")[1].channel.recv_exit_status()
        
        print("✅ 强制同步与重启完成！")
        ssh.close()
    except Exception as e:
        print(f"❌ 发生错误: {str(e)}")

if __name__ == "__main__":
    force_sync_and_restart()
