import paramiko
import os

hostname = "vmsnode.briconbric.com"
username = "root"
password = "BtZhY1^3"
web_root = "/var/www/ccdx"

def check_remote_admin_js():
    try:
        print(f"正在连接服务器 {hostname} 检查 admin.js...")
        ssh = paramiko.SSHClient()
        ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
        ssh.connect(hostname, username=username, password=password)
        
        stdin, stdout, stderr = ssh.exec_command(f"cat {web_root}/routes/admin.js")
        content = stdout.read().decode()
        print("\n--- 服务器上的 routes/admin.js 内容 ---")
        print(content)
        
        ssh.close()
    except Exception as e:
        print(f"❌ 检查失败: {str(e)}")

if __name__ == "__main__":
    check_remote_admin_js()
