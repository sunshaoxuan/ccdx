import paramiko
import os

hostname = "vmsnode.briconbric.com"
username = "root"
password = "BtZhY1^3"
web_root = "/var/www/ccdx"

def restart_app():
    try:
        print(f"正在连接服务器 {hostname} 重启应用...")
        ssh = paramiko.SSHClient()
        ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
        ssh.connect(hostname, username=username, password=password)
        
        # 重启 docker 容器
        print("正在重启 Docker 容器以应用最新代码...")
        ssh.exec_command(f"cd {web_root} && docker compose restart app")[1].channel.recv_exit_status()
        
        print("✅ 重启成功！")
        ssh.close()
    except Exception as e:
        print(f"❌ 重启失败: {str(e)}")

if __name__ == "__main__":
    restart_app()
