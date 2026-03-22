#!/bin/bash

# 服务器配置
SERVER="root@vmsnode.briconbric.com"
WEB_ROOT="/var/www/ccdx"
NGINX_CONF="/etc/nginx/sites-available/cc.briconbric.com.conf"
NGINX_LINK="/etc/nginx/sites-enabled/cc.briconbric.com.conf"
GIT_REPO="https://github.com/sunshaoxuan/ccdx.git"

echo "开始部署 CC点心 网站到 $SERVER..."

# 1. 在服务器上准备目录并拉取代码
ssh -o StrictHostKeyChecking=no $SERVER << EOF
    # 安装 git 和 nginx (如果未安装)
    if ! command -v git &> /dev/null; then apt-get update && apt-get install -y git; fi
    if ! command -v nginx &> /dev/null; then apt-get update && apt-get install -y nginx; fi

    # 准备 Web 目录
    mkdir -p /var/www
    if [ ! -d "$WEB_ROOT/.git" ]; then
        echo "克隆仓库..."
        rm -rf $WEB_ROOT
        git clone $GIT_REPO $WEB_ROOT
    else
        echo "更新仓库..."
        cd $WEB_ROOT && git pull origin main
    fi

    # 设置权限
    chown -R www-data:www-data $WEB_ROOT
    chmod -R 755 $WEB_ROOT
EOF

# 2. 上传 Nginx 配置文件
echo "上传 Nginx 配置..."
scp ./cc.briconbric.com.conf $SERVER:$NGINX_CONF

# 3. 激活配置并重启 Nginx
ssh $SERVER << EOF
    # 创建软链接 (适配 Debian/Ubuntu 风格)
    mkdir -p /etc/nginx/sites-enabled
    ln -sf $NGINX_CONF $NGINX_LINK
    
    # 检查 Nginx 配置语法
    nginx -t
    if [ $? -eq 0 ]; then
        echo "Nginx 配置检查通过，正在重启..."
        systemctl restart nginx || service nginx restart
        echo "部署成功！"
    else
        echo "Nginx 配置有误，请检查！"
        exit 1
    fi
EOF
