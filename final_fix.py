import paramiko
import os

hostname = "vmsnode.briconbric.com"
username = "root"
password = "BtZhY1^3"
web_root = "/var/www/ccdx"

def final_fix():
    try:
        print(f"正在连接服务器 {hostname} 进行最终修复...")
        ssh = paramiko.SSHClient()
        ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
        ssh.connect(hostname, username=username, password=password)
        
        # 1. 解决 Git 权限问题并同步
        print("正在同步代码...")
        commands = [
            "git config --global --add safe.directory /var/www/ccdx",
            f"cd {web_root} && git fetch --all",
            f"cd {web_root} && git reset --hard origin/main",
            f"cd {web_root} && git clean -fd",
            f"chown -R root:root {web_root}" # 将所有权改回 root 以便 docker 运行
        ]
        for cmd in commands:
            ssh.exec_command(cmd)[1].channel.recv_exit_status()
            print(f"执行完成: {cmd}")
        
        # 2. 检查目录
        print("\n--- 检查目录内容 ---")
        stdin, stdout, stderr = ssh.exec_command(f"ls -la {web_root}")
        print(stdout.read().decode())
        
        # 3. 启动容器
        print("\n--- 启动 Docker 容器 ---")
        stdin, stdout, stderr = ssh.exec_command(f"cd {web_root} && docker compose up -d --build")
        print("STDOUT:", stdout.read().decode())
        print("STDERR:", stderr.read().decode())
        
        # 4. 初始化数据
        print("\n--- 初始化数据库数据 ---")
        stdin, stdout, stderr = ssh.exec_command(f"docker exec $(docker ps -qf 'name=app') node seed.js")
        print(stdout.read().decode())
        
        # 5. 重启 Nginx
        print("\n--- 重启 Nginx ---")
        ssh.exec_command("systemctl restart nginx")[1].channel.recv_exit_status()
        print("Nginx 已重启")

        ssh.close()
    except Exception as e:
        print(f"❌ 修复过程中发生错误: {str(e)}")

if __name__ == "__main__":
    final_fix()
