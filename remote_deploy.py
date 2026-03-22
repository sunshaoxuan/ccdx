import paramiko
import os

hostname = "vmsnode.briconbric.com"
username = "root"
password = "BtZhY1^3"
web_root = "/var/www/ccdx"
nginx_conf_local = "/Users/sunsx/Projects/ccdx/cc.briconbric.com.conf"
nginx_conf_remote = "/etc/nginx/sites-available/cc.briconbric.com.conf"

def deploy_fullstack():
    try:
        print(f"正在连接服务器 {hostname} 进行全栈部署...")
        ssh = paramiko.SSHClient()
        ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
        ssh.connect(hostname, username=username, password=password)
        
        # 1. 检查并安装 Docker 和 Docker Compose
        print("检查 Docker 环境...")
        ssh.exec_command("curl -fsSL https://get.docker.com | sh")[1].channel.recv_exit_status()
        ssh.exec_command("curl -L \"https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)\" -o /usr/local/bin/docker-compose")[1].channel.recv_exit_status()
        ssh.exec_command("chmod +x /usr/local/bin/docker-compose")[1].channel.recv_exit_status()

        # 2. 拉取最新代码
        print("更新代码库...")
        ssh.exec_command(f"cd {web_root} && git pull")[1].channel.recv_exit_status()

        # 3. 启动容器
        print("启动 Docker 容器...")
        ssh.exec_command(f"cd {web_root} && /usr/local/bin/docker-compose up -d --build")[1].channel.recv_exit_status()

        # 4. 运行数据种子脚本 (在容器内运行)
        print("初始化数据库数据...")
        ssh.exec_command(f"docker exec $(docker ps -qf \"name=app\") node seed.js")[1].channel.recv_exit_status()

        # 5. 更新 Nginx 配置
        print("更新 Nginx 配置...")
        sftp = ssh.open_sftp()
        sftp.put(nginx_conf_local, nginx_conf_remote)
        sftp.close()
        
        ssh.exec_command("nginx -t && systemctl restart nginx")[1].channel.recv_exit_status()

        print("✅ 全栈应用部署成功！")
        ssh.close()
    except Exception as e:
        print(f"❌ 部署失败: {str(e)}")

if __name__ == "__main__":
    deploy_fullstack()
