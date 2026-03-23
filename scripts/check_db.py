import paramiko
import os

hostname = "vmsnode.briconbric.com"
username = "root"
password = "BtZhY1^3"

def check_db_users():
    try:
        print(f"正在连接服务器 {hostname} 检查数据库用户...")
        ssh = paramiko.SSHClient()
        ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
        ssh.connect(hostname, username=username, password=password)
        
        # 1. 在容器内执行查询
        print("\n--- 1. 数据库中的用户列表 ---")
        # 使用 mongosh (新版 mongo 容器默认工具)
        cmd = "docker exec $(docker ps -qf 'name=db') mongosh ccdx --eval 'db.users.find({}, {password: 0})'"
        stdin, stdout, stderr = ssh.exec_command(cmd)
        print(stdout.read().decode())
        print(stderr.read().decode())
        
        # 2. 检查应用环境变量
        print("\n--- 2. 应用环境变量 (.env) ---")
        stdin, stdout, stderr = ssh.exec_command("cat /var/www/ccdx/.env")
        print(stdout.read().decode())
        
        # 3. 尝试重新运行种子脚本并捕获输出
        print("\n--- 3. 重新运行种子脚本 ---")
        stdin, stdout, stderr = ssh.exec_command("docker exec $(docker ps -qf 'name=app') node seed.js")
        print(stdout.read().decode())
        print(stderr.read().decode())

        ssh.close()
    except Exception as e:
        print(f"❌ 检查过程中发生错误: {str(e)}")

if __name__ == "__main__":
    check_db_users()
