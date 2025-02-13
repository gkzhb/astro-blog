---
title: 使用 ngrok 实现内网穿透（自建 ngrok 服务器）
published: 2019-03-16 19:18:13
category: Programming
tags:
- Network
toc: true
---

有时候我希望能直接通过互联网访问到层层路由下的个人电脑，但是在没有固定 IPv4 的情况下很难做到这一点。一个解决方法就是使用内网穿透技术，而我选择用 ngrok 来实现。ngrok 在 1.x 版本时是开源的，到了 2.x 版本就闭源了。因为自建 ngrok 服务器需要将自己生成的证书编译到客户端中，所以只能使用开源的 1.x 版本从源码编译生成。

<!--more-->

## 前提条件

* 拥有一个域名
	免费域名可以在[Freenom](https://www.freenom.com/)上买到，但域名无法在国内备案。
* 拥有一个有固定 IP 的服务器
	购买 VPS 一般都会提供免费固定 IP，而且国内有学生优惠的话，VPS 价格在每月 10 元左右，挺便宜。

## 生成证书并编译 ngrok 服务端和客户端

ngrok 1.x 版本在 Github 上网址是 [[https://github.com/inconshreveable/ngrok]]，它是用 Go 语言编写的。

编译 ngrok 需要使用相应的编译工具，在 Ubuntu 上可以使用命令来安装这些工具：
```bash
$ sudo apt-get install build-essential mercurial git
```
其中，mercurial 和 git 都是版本控制软件。还有最重要的就是安装 golang ，我选择从 golang 官网下载最新版本然后手动安装。安装过程可以参考 Go 的官方文档。

在安装好所需的编译环境后，可以从 Github 上 clone 代码
```bash
$ git clone https://github.com/inconshreveable/ngrok.git
```
在编译之前，要先指定 Go 的工作路径，即编译时源文件所在文件夹的位置：`export GOPATH=[Working Directory]`，将 `[Working Directory]` 改为 ngrok 的绝对路径，如果按照上面一步 clone 的话应该是当前工作路径 + `/ngrok`。在开始编译之前，我们还需要生成我们自己的证书：
```bash
export NGROK_DOMAIN="[NGROK_BASE_DOMAIN]"  # 设置环境变量，ngrok 域名
openssl genrsa -out rootCA.key 2048
openssl req -x509 -new -nodes -key rootCA.key -subj "/CN=$NGROK_DOMAIN" -days 5000 -out rootCA.pem
openssl genrsa -out server.key 2048
openssl req -new -key server.key -subj "/CN=$NGROK_DOMAIN" -out server.csr
openssl x509 -req -in server.csr -CA rootCA.pem -CAkey rootCA.key -CAcreateserial -out server.crt -days 5000
```
其中，需要将 `[NGROK_BASE_DOMAIN]` 替换为你自己将要使用的 ngrok 域名。比如 `ngrok.YourDomain.com` 或 `tunnel.YourDomain.com`。我们需要将域名通过 A 记录指向那个拥有固定 IP 的服务器的 IP。在域名 DNS 记录管理中，添加两条 A 记录：主机记录(Host Name)为 `*.tunnel` 或 `*.ngrok` 即你将要使用的 ngrok 子域名，另一条主机记录为 `tunnel` 或 `ngrok` 就是将前面的 `*.` 去掉，第二条主机记录应该可以不加。这两条记录类型(Record Type)都为 A 类型，IP 地址指向服务器的固定 IP 。
不过我在 Freenom 上无法添加 `*.ngrok` 主机记录，估计是 DNS 服务商不支持通配符 `*`，所以我只能根据自己的需要手动添加多条 `[service].ngrok` 记录，`[service]` 更改为需要使用的二级域名。
在执行完上面的 openssl 命令后，会生成六个文件，将其中几个文件移动到 ngrok 仓库的指定位置：
```bash
cp rootCA.pem $GOPATH/assets/client/tls/ngrokroot.crt  # 复制rootCA.pem到assets/client/tls/并更名为ngrokroot.crt
cp server.crt $GOPATH/assets/server/tls/snakeoil.crt # 复制server.crt到assets/server/tls/并更名为snakeoil.crt
cp server.key $GOPATH/assets/server/tls/snakeoil.key # 复制server.key到assets/server/tls/并更名为snakeoil.key
```
之后，我们就可以开始编译 ngrok 了:
```bash
GOOS=[OS] GOARCH=[CPU ARCH] make release-server # 编译服务端
GOOS=[OS] GOARCH=[CPU ARCH] make release-client # 编译客户端
```
将 `[OS]` 换成对应的操作系统 `linux` `windows` `android`，`[CPU ARCH]` 换成对应的 CPU 架构 `386`(32位 x86) `amd64`(64位 x86-64)。具体组合见 [StackOverflow](https://stackoverflow.com/questions/20728767/all-possible-goos-value/20728862)：
```
$GOOS $GOARCH
android   arm
darwin    386
darwin    amd64
darwin    arm
darwin    arm64
dragonfly amd64
freebsd   386
freebsd   amd64
freebsd   arm
linux     386
linux     amd64
linux     arm
linux     arm64
linux     ppc64
linux     ppc64le
linux     mips
linux     mipsle
linux     mips64
linux     mips64le
netbsd    386
netbsd    amd64
netbsd    arm
openbsd   386
openbsd   amd64
openbsd   arm
plan9     386
plan9     amd64
solaris   amd64
windows   386
windows   amd64
```
常用 `windows` + `amd64` 或者 `linux` + `amd64` 组合。  
编译完成后在 `$GOPATH/bin` 下可以看到 `ngrok` `ngrokd` 两个文件，如果编译 windows 平台的会有 `.exe` 后缀。服务端文件是 `ngrokd`，客户端文件为 `ngrok`。

## 配置并运行服务端与客户端

### 服务端

服务器上可以将 `ngrokd` 与之前生成的证书 `server.crt` `server.key` 放在同一个目录中，并在目录中创建一个脚本文件 `run.sh` 来启动 ngrokd：
```bash
#!/bin/bash
./ngrokd -tlsKey=server.key -tlsCrt=server.crt -domain="[NGROK_BASE_DOMAIN]" -httpAddr=":[PORT]" -httpsAddr=":[PORT]"
```
将中括号部份换成实际需要的值。后两个 `[PORT]` 指定 ngrok 在服务器上 http 和 https 协议使用的端口。  
服务端运行起来之后，可以通过浏览器访问之前设置 DNS 记录的子域名，注意如果端口不是默认的，需要在域名后添加 `:[PORT]`。如果网页显示类似 `Tunnel ngrok.YourDomain.com:[PORT] not found` 字样则说明服务器成功启动。

### 客户端

#### 安装、配置和运行

客户端方面，注意要使用之前编译生成的 ngrok，似乎也可以使用 [python-ngork](https://github.com/hauntek/python-ngrok) 但我没有成功。客户端方面，需要新建配置文件 `ngrok.cfg`（使用 yaml 语法格式），内容如下：
```yaml
server_addr: [NGROK_BASE_DOMAIN]:4443
trust_host_root_certs: false
```
这里 4443 是 ngrokd 默认的监听端口。  
之后通过命令运行（同样可以将这条命令写成脚本）：`./ngrok -subdomain [SUBDOMAIN] -config=[YOUR_CONFIG_FILE_NAME] [PORT]` 这是将客户端本地 80 端口代理到服务器对应的 httpAddr 端口。  
同样可以代理 TCP 的端口：`./ngrok -subdomain mydatabaseserver -config=[YOUR_CONFIG_FILE_NAME] -proto tcp 3306` 将 mysql 的 3306 端口代理到服务器上，这样就可以通过域名 + 端口访问到客户端对应的端口上的服务。

不过这样设置并不方便，写入配置文件 `ngrok.cfg` 然后选择需要的代理更加便捷：
```yaml
server_addr: ngrok.YourDomain.com:4443
trust_host_root_certs: false
tunnels:
  http:
    subdomain: "http"
    proto:
      http: "4000"
  ssh:
    subdomain: "zhb"
    remote_port: 4422
    proto:
      tcp: "22"
```
`remote_port` 表示指定 TCP 在服务器上监听的端口。注意不要使用 Tab 而应该用空格进行缩进。 
最后通过命令 `./ngrok -config=ngrok.cfg start ssh` 启动 tunnels 中的 ssh 代理。start 后可以接多个代理名称，中间用空格分格。  
更多客户端配置文件选项可以访问 ngork 官网的文档进行了解（2.x 的配置文件应该是兼容的吧）。

#### 使用 systemctl 添加 ngrok 服务

##### systemctl 使用命令

以下的 `[Service Name].service` 中的 `.service` 可以省略，即使用 `[Service Name]` 即可。
```bash
$ systemctl start [Service Name].service # 启动 [Service Name] 服务
$ systemctl stop [Service Name].service # 停止 [Service Name] 服务
$ systemctl restart [Service Name].service # 重启 [Service Name] 服务
$ systemctl status [Service Name].service # 查看 [Service Name] 服务运行状态
$ systemctl enable [Service Name].service # 设置 [Service Name] 服务开机自启动
$ systemctl disable [Service Name].service # 关闭 [Service Name] 服务开机自启动
$ systemctl daemon-reload # 重新载入 systemd,扫描新的或有变动的单元
```

下面我们将新建一个自定义的 ngrok 服务。

##### 添加自定义 systemctl 服务

新建配置文件 `ngrok.service`，内容如下：
```
[Unit]
Description=Share local port(s) with ngrok
After=syslog.target network.target

[Service]
PrivateTmp=true
Type=simple
Restart=always
RestartSec=1min
StandardOutput=null
StandardError=null
ExecStart=/usr/local/ngrok/ngrok -config=/usr/local/ngrok/ngrok.cfg start ssh
#ExecStop=/usr/bin/killall ngrok

[Install]
WantedBy=multi-user.target
```
注意要修改你的 `ExecStart` 项的值，这项的值与上面的运行命令类似，不过注意 ngrok 客户端和配置文件要使用绝对路径。`ExecStop` 这项我将它注释掉了，这个命令可能误杀进程，所以不建议使用它。systemctl 有默认的 `ExecStop` 命令，具体可以参考[linux - how stop systemd service - Stack Overflow](https://stackoverflow.com/questions/40411338/how-stop-systemd-service) 中 Umut 的回答。  
将文件 `ngrok.service` 复制到路径 `/usr/lib/systemd/system/` 下（需要 root 权限）。然后执行命令使其开机启动与生效：
```bash
$ systemctl enable ngrok.service
$ systemctl daemon-reload
```
最后，可以通过命令 `systemctl start ngrok.service` 启动 ngrok 服务，使用命令 `systemctl stop ngrok.service` 停止 ngrok 服务，使用 `systemctl status ngrok.service` 查看 ngrok 服务的运行状态。

## 参考

* [Run Ngrok on Your Own Server - svenbit](https://www.svenbit.com/2014/09/run-ngrok-on-your-own-server/)
* [一分钟实现内网穿透（ngrok服务器搭建） - 学习笔记 - CSDN博客](https://blog.csdn.net/zhangguo5/article/details/77848658)
* [Ngrok完美实现内网穿透 - 知乎](https://zhuanlan.zhihu.com/p/29019562)
* [安卓端搭建网站+自建内网穿透ngrok – 沧水的博客](https://cangshui.net/?p=1943)
* systemctl 配置
	* [Centos 7 ngrok 加入系统服务，支持开启和关闭服务 - opfan的博客 - CSDN博客](https://blog.csdn.net/qazx123q/article/details/81212858)
	* [CentOS7使用systemctl添加自定义服务 - 简书](https://www.jianshu.com/p/79059b06a121) **详细**
	* [linux - how stop systemd service - Stack Overflow](https://stackoverflow.com/questions/40411338/how-stop-systemd-service)
	* [CentOS7利用systemctl添加自定义系统服务 - 梦徒 - 博客园](https://www.cnblogs.com/saneri/p/7778756.html)
	* [systemd.service 文档](https://www.freedesktop.org/software/systemd/man/systemd.service.html)
