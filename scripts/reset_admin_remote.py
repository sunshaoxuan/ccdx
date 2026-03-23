import paramiko
import os

hostname = "vmsnode.briconbric.com"
username = "root"
password = "BtZhY1^3"
web_root = "/var/www/ccdx"

def reset_admin_remote():
    try:
        print(f"正在连接服务器 {hostname} 重置管理员密码...")
        ssh = paramiko.SSHClient()
        ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
        ssh.connect(hostname, username=username, password=password)
        
        # 1. 拉取最新代码
        print("更新代码库...")
        ssh.exec_command(f"cd {web_root} && git pull")[1].channel.recv_exit_status()
        
        # 2. 在容器内运行重置脚本
        print("执行重置脚本...")
        stdin, stdout, stderr = ssh.exec_command(f"docker exec $(docker ps -qf 'name=app') node scripts/reset_admin.js")
        print(stdout.read().decode())
        print(stderr.read().decode())

        ssh.close()
        print("✅ 重置完成")
    except Exception as e:
        print(f"❌ 发生错误: {str(e)}")

if __name__ == "__main__":
    reset_admin_remote()
