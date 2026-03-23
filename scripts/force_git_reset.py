import paramiko
import os

hostname = "vmsnode.briconbric.com"
username = "root"
password = "BtZhY1^3"
web_root = "/var/www/ccdx"

def force_git_reset():
    try:
        print(f"正在连接服务器 {hostname} 强制同步代码...")
        ssh = paramiko.SSHClient()
        ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
        ssh.connect(hostname, username=username, password=password)
        
        # 1. 强制重置 Git 仓库
        print("正在强制重置 Git 仓库...")
        commands = [
            f"cd {web_root} && git fetch --all",
            f"cd {web_root} && git reset --hard origin/main",
            f"cd {web_root} && git clean -fd"
        ]
        for cmd in commands:
            stdin, stdout, stderr = ssh.exec_command(cmd)
            stdout.channel.recv_exit_status()
            print(f"执行: {cmd}")
            print(stdout.read().decode())
            print(stderr.read().decode())
        
        # 2. 再次检查目录内容
        print("\n--- 再次检查目录内容 ---")
        stdin, stdout, stderr = ssh.exec_command(f"ls -la {web_root}")
        print(stdout.read().decode())
        
        # 3. 尝试启动容器
        print("\n--- 尝试启动容器 ---")
        stdin, stdout, stderr = ssh.exec_command(f"cd {web_root} && docker compose up -d --build")
        print("STDOUT:", stdout.read().decode())
        print("STDERR:", stderr.read().decode())
        
        # 4. 检查容器状态
        print("\n--- 检查容器状态 ---")
        stdin, stdout, stderr = ssh.exec_command("docker ps")
        print(stdout.read().decode())

        ssh.close()
    except Exception as e:
        print(f"❌ 修复过程中发生错误: {str(e)}")

if __name__ == "__main__":
    force_git_reset()
