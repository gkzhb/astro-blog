---
title: "自建”稍后阅读“服务—— wallabag"
published: 2019-04-03T21:00:53+08:00
updated: 2019-11-09T11:18:11+08:00
draft: false
keywords: []
description: ""
tags: []
category: Linux
author: ""

# You can also close(false) or open(true) something for this content.
# P.S. comment can only be closed
comment: false
toc: true
autoCollapseToc: false
postMetaInFooter: false
hiddenFromHomePage: false
# You can also define another contentCopyright. e.g. contentCopyright: "This is another copyright."
contentCopyright: false
reward: false
mathjax: false
mathjaxEnableSingleDollar: false
mathjaxEnableAutoNumber: false

# You unlisted posts you might want not want the header or footer to show
hideHeaderAndFooter: false

# You can enable or disable out-of-date content warning for individual post.
# Comment this out to use the global config.
#enableOutdatedInfoWarning: false

flowchartDiagrams:
  enable: false
  options: ""

sequenceDiagrams: 
  enable: false
  options: ""

---

"稍后阅读"英文对应于 *Read-It-Later* ，是指将碎片化信息中需要花时间仔细阅读思考或需要二次阅读消化的内容收集起来，待空余时间统一消化理解。国外这方面的知名应用服务商有 Pocket、 Instapaper 以及我之前一直使用的网速慢而且标签功能有 bug 的 Ioreader 等。由于国外服务商在国内网速较慢，而国内的也没找到附合心意的服务商，我选择自建服务 wallabag，运行在我的阿里云 VPS 上。

<!--more-->

# wallabag 官方文档

* [wallabag 官方文档](https://doc.wallabag.org/en/)

主要安装过程参考上方 wallabag 官方文档的 `Installation` 一栏。

# 环境安装

VPS 当然选择的是 Linux 系统，我使用的发行版是 Ubuntu。

注意以下命令行中 `$` 开头为普通用户执行的命令，`#` 开头表示命令需要以 `root` 权限运行。也就是说，如果是普通用户遇到 `#` 开头的命令，需要在命令前添加 `sudo` 执行。

## 安装 php （世界上最好的语言）

这里我安装的是 php7.0

```bash
apt-get install php
```

## 安装 Composer

```bash
curl -s https://getcomposer.org/installer | php
```

命令执行完后会在当前目录下生成一个 composer.phar 的文件，将其移动到 `/usr/local/bin` 并添加一个软链接到 `/usr/local/bin/composer`：

```bash
mv composer.phar /usr/local/bin
ln -s /usr/local/bin/composer.phar /usr/local/bin/composer
```

## 安装 php extensions

下面的 php7.0 要和自己的 php 版本对应

```bash
apt-get install php7.0-mysql php7.0-session php7.0-ctype php7.0-dom php7.0-hash php7.0-simplexml php7.0-json php7.0-gd php7.0-mbstring php7.0-xml php7.0-tidy php7.0-iconv php7.0-curl php7.0-gettext php7.0-tokenizer php7.0-bcmath
```

其中会有一部分的包会安装出错，显示找不到，因为有的 php 插件集成在 `php7.0-common` 里。可以使用命令 `php -m` 查看已启用的插件。所以上面的命令参数中只需要尚未安装的 php 插件。

## 安装 Mysql 服务器

```bash
apt-get install mysql-server # 安装 mysql 服务器
```

详细配置可参考 [How To Install MySQL on Ubuntu ###.04 | DigitalOcean](https://www.digitalocean.com/community/tutorials/how-to-install-mysql-on-ubuntu-###-04)

## 配置 mysql 服务器

连接 mysql 服务器并为 wallabag 添加用户、创建数据库并添加权限

连接数据库：

```bash
mysqld -u root -p
```

之后在数据库中执行以下命令：

```mysql
CREATE DATABASE wallabag; -- 创建数据库 wallabag
CREATE USER wallabag@localhost; -- 创建用户 wallabag 且只允许本地访问
SET password FOR wallabag@localhost= PASSWORD("your-password"); -- 修改 wallabag 用户的密码，将 your-password 换成需要的密码
GRANT ALL PRIVILEGES ON wallabag.* TO wallabag@localhost IDENTIFIED BY 'your-password'; -- 允许 wallabag 访问、修改数据库 wallabag 的权限
FLUSH PRIVILEGES; -- 更新权限使之生效
EXIT: -- 退出 mysql 数据库
```

## 安装 wallabag

使用 git 获取 wallabag 代码：

```bash
git clone https://github.com/wallabag/wallabag.git
```

不过考虑 GitHub 在国内网速较慢，可以考虑先将其导入到国内的代码仓库再从国内的代码托管平台上 clone 下来。下面的命令是从我的代码仓库克隆代码。

```bash
git clone https://gitee.com/gkzhb/wallabag.git
```

获取代码之后，进入目录并编译：

```bash
cd wallabag && make install
```

这一步，我在官网上和其他网站上看到的安装方式不同。  
在 Linuxbabe 网站上，我看到的教程是执行以下命令，而非上面的 `make install` 命令：

```bash
SYMFONY_ENV=prod composer install --no-dev -o --prefer-dist
```

不过，不论执行哪一个命令，最后都会出现以下内容需要我们填写：

```
Creating the "app/config/parameters.yml" file
 Some parameters are missing. Please provide them.
 database_driver (pdo_sqlite): pdo_mysql
 database_host (127.0.0.1): 127.0.0.1
 database_port (null): 3306
 database_name (symfony): wallabag
 database_user (root): wallabag
 database_password (null): your-password
 database_path ('%kernel.root_dir%/../data/db/wallabag.sqlite'): /var/lib/mysql/wallabag
 database_table_prefix (wallabag_): wallabag_
 database_socket(null): Press Enter
 domain_name ('https://your-wallabag-url-instance.com'): http://Your-Domain
```

按照以上说明填写即可。`database_path` 我不太记得是填上面的内容还是只要填 `wallabag` 。注意如果搭建的 wallabag 网站使用的不是默认的 80 端口，需要在上面的 domain_name 上添加 `:[Port]` 也就是 `Your-Domain:[Port]`，将 `[Port]` 换成将要使用的端口。其它的设置可以默认直接 `Press Enter` 即直接按回车用默认值就好了。

这里又出现了一个不同，如果按照官网的做法使用 `make install` 此时应该即将完成安装，请继续看下面的内容。而如果使用 Linuxbabe 文章的做法，还需要执行以下命令来生成网站资源：

```bash
php bin/console wallabag:install --env=prod
```

`--env=prod` 也可以换成 `-e prod` 表示编译生成生产环境。

接着两种方法都会又遇到一个配置 wallabag 的界面：

```
Installing Wallabag...

Step 1 of 5. Checking system requirements.
+-----------------+--------+----------------+
| Checked         | Status | Recommendation |
+-----------------+--------+----------------+
| PDO Driver      | OK!    |                |
| curl_exec       | OK!    |                |
| curl_multi_init | OK!    |                |
+-----------------+--------+----------------+
Success! Your system can run Wallabag properly.

Step 2 of 5. Setting up database.
It appears that your database already exists. Would you like to reset it? (y/N)n
Creating schema
Clearing the cache

Step 3 of 5. Administration setup.
Would you like to create a new admin user (recommended) ? (Y/n)y
Username (default: wallabag) : your-admin-username
Password (default: wallabag) : admin-pasword-here
Email: admin-email-here

Step 4 of 5. Config setup.

Step 5 of 5. Installing assets.

Wallabag has been successfully installed.
Just execute `php bin/console server:run --env=prod` for using wallabag: http://localhost:8000
```

输出内容可能有些不同，但是配置选项都是一样的。按照上面的提示输入 y 或 n 完成最后的安装。

然后移动 wallabag 目录位置：

```bash
 mv ../wallabag/ /usr/share/nginx/
```

## 配置 Nginx

这里我选择 Nginx 来运行 wallabag 网站，你也可以使用 Apache 之类的其它工具，在官网文档上有相关配置教程。

编辑配置文件：

```bash
vim /etc/nginx/conf.d/wallabag.conf
```

内容如下：

```
root@gkzhb:~/gitrep# cat /etc/nginx/conf.d/wallabag.conf
server {
    # listen 8081; # 监听端口，如果要修改网站端口将这一行开头的 # 去掉并修改端口数值
    server_name example.com;
    root /usr/share/nginx/wallabag/web;

    location / {
        # try to serve file directly, fallback to app.php
        try_files $uri /app.php$is_args$args;
    }
    location ~ ^/app\.php(/|$) {
        # if, for some reason, you are still using PHP 5,
        # then replace /run/php/php7.0 by /var/run/php5
        fastcgi_pass unix:/run/php/php7.0-fpm.sock;
        fastcgi_split_path_info ^(.+\.php)(/.*)$;
        include fastcgi_params;
        # When you are using symlinks to link the document root to the
        # current version of your application, you should pass the real
        # application path instead of the path to the symlink to PHP
        # FPM.
        # Otherwise, PHP's OPcache may not properly detect changes to
        # your PHP files (see https://github.com/zendtech/ZendOptimizerPlus/issues/126
        # for more information).
        fastcgi_param  SCRIPT_FILENAME  $realpath_root$fastcgi_script_name;
        fastcgi_param DOCUMENT_ROOT $realpath_root;
        # Prevents URIs that include the front controller. This will 404:
        # http://domain.tld/app.php/some-path
        # Remove the internal directive to allow URIs like this
        internal;
    }

    # return 404 for all other php files not matching the front controller
    # this prevents access to other php files you don't want to be accessible.
    location ~ \.php$ {
        return 404;
    }

    error_log /var/log/nginx/wallabag_error.log;
    access_log /var/log/nginx/wallabag_access.log;
}
```

这里的配置我大部份摘录自 [wallabag doc](https://doc.wallabag.org/en/admin/installation/virtualhosts.html)

修改完成后执行命令重启 Nginx 服务：

```bash
systemctl restart nginx
```

之后可以在浏览器上访问 wallabag 网站了。

## 用户管理

未完待续...
 
# 参考

* [改变你的阅读方式：认识「稍后读」 - 少数派](https://sspai.com/post/25336)
* [How to Install Wallabag on Arch Linux VPS with LEMP Stack - Linuxbabe](https://www.linuxbabe.com/arch/install-wallabag-arch-linux-server-nginx-mariadb-php7)
* [How to check which PHP extensions have been enabled/disabled in Ubuntu Linux 12.04 LTS? - Stack Overflow](https://stackoverflow.com/questions/24351260/how-to-check-which-php-extensions-have-been-enabled-disabled-in-ubuntu-linux-12)
* [php - Installing PDO driver on MySQL Linux server - Stack Overflow](https://stackoverflow.com/questions/13375061/installing-pdo-driver-on-mysql-linux-server)
