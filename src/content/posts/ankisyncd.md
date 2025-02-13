---
title: "Anki 自建同步服务器 ankisyncd"
published: 2019-06-23T11:25:09+08:00
updated: 2020-12-16T23:11:00+08:00
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

Anki 是一个用于记忆的软件，客户端同时支持电脑端和移动端（除了 iOS 上 AnkiMobile 收费以外都是免费的）。如果要使用同步的功能，使用官方的 AnkiWeb 网速较慢，在同步大量的 media 文件的时候十分痛苦。GitHub 上有牛人实现了 Anki 同步的 API 接口，可以自建同步服务器：[dsnopek/anki-sync-server](https://github.com/dsnopek/anki-sync-server)。不过这个服务端已经很久没有维护过了，在电脑上最新的 Anki 已经无法正常同步了。于是我在 Google 上找到了一篇文章：[ankisyncd – A Custom Sync Server for Anki 2.1 | Gene Dan's Blog](http://genedan.com/no-127-ankisyncd-a-custom-sync-server-for-anki-2-1/)。我按照博客里提供的 [tsudoko/anki-sync-server](https://github.com/tsudoko/anki-sync-server) 对应的文档，成功在自己的 VPS 上搭建了服务器，并且在 Ankidroid 上和 Linux 端 2.1.11 版本的 Anki 上成功同步数据。

注意：

* iOS 上 AnkiMobile 不支持自定义同步服务器
* 同步服务器没有 AnkiWeb 的网页端访问支持
* ankisyncd 服务器支持 PC 端 Anki 版本 **2.1.1 - 2.1.11**，但是 2.1.9 版本不支持
* PC 端最新版 Anki 因为更新了同步协议，而目前开源同步服务端并没有更新到新的协议，所以要使用自建服务器，请务必**使用老版 Anki**
* 另 AnkiDroid 似乎在 2.10 版本之后会要求使用 HTTPS 连接同步服务器，导致 HTTP 服务器无法正常同步

> 想使用最新版 PC 端 Anki 可参考 [Updating anki-bundled past 2.1.16+ · Issue #67 · tsudoko/anki-sync-server](https://github.com/tsudoko/anki-sync-server/issues/67)

<!--more-->

# 环境要求

* Linux（理论上 Windows 应该也可以）
* Python3（推荐，python2 估计也行，但没测试过也不推荐）
* pip3（基于 Python3 的 pip，和上一条 Python 版本对应）
* git（Windows 下注意 git 命令使用环境）

环境安装略。

# ankisyncd 安装步骤

## 配置环境

### virtualenv

为避免环境问题导致安装或运行出错，推荐使用 virtualenv ，不想安装也可以跳过这一部份内容。通过以下命令安装 virtualenv：
```bash
$ pip install virtualenv
```
在准备安装服务器的目录下创建 Python 虚拟环境：
```bash
$ cd [安装目录]
virtualenv ankienv
```
然后进入新创建的虚拟环境：
```bash
$ . ankienv/bin/activate
```
注意句号和路径之间有个空格。

输入完成后，命令行前会多出 `(ankienv)` 表示当前的 Python 环境，之后与 Python 或 pip 有关的所有操作都要在这个环境中进行。

## 安装 ankisyncd


使用 git 来 clone 服务器代码：
```bash
$ git clone https://github.com/tsudoko/anki-sync-server.git
```
进入代码目录并安装 git 子模块：
```bash
$ cd anki-sync-server
$ git submodule update --init
```
完成后进入 `anki-bundled` 目录并继续安装 Python 模块环境：
```bash
$ cd anki-bundled
$ pip install -r requirements.txt
```
我在执行这一步的时候报错 pyaudio 安装失败，解决方法是直接把 requirements.txt 文件中 pyaudio 删掉，再重新执行上面的 pip 命令。根据官方文档的说明这个模块不影响服务器同步功能的使用。

继续安装 Python 模块，安装完后进入 `anki-sync-server` 目录：
```bash
$ pip install webob
$ cd ..
```
最后，还可以修改服务器配置文件：`anki-sync-server` 目录下的 `ankisyncd.conf`。对我来说无需更改任何配置。

配置文件里包括 `host` 对应服务器监听地址，默认 `0.0.0.0` 表示接收所有 IP 的请求，如果改成 `127.0.0.1` 则无法接收外网或内网上的请求，也就是只能通过服务器本机访问，改成服务器内网 IP 则只接收内网的请求。port 表示监听端口，如果修改这个参数则客户端连接端口也要对应修改与其相同。`data_root` 应该是同步数据的保存目录。

到此服务器已经安装完成了。

# 运行服务器

如果前面使用了 virtualenv，这一部份的命令仍然需要在 ankienv 环境下运行。运行服务器之前需要先创建用户（继续前面的命令，目前在 `anki-sync-server` 目录下）：
```bash
$ ./ankisyncctl.py adduser <username>
```
将命令中的 `<username>` 替换为实际的用户名。之后输入密码，按回车确定（Linux 下输入密码不会显示出来）。

最后，启动服务器：
```bash
$ python -m ankisyncd
```

执行这条命令的时候会一直占用命令行终端，否则表示服务器已停止运行。

如果是通过 ssh 连接到 Linux 服务器在服务器上运行，断开 ssh 连接会自动停止服务器运行，这就需要下面的命令防止进程停止：
```bash
$ nohup python -m ankisyncd &
```
当然也可以用 screen 或 tmux 之类的服务器上常用的工具解决这个问题。

# Anki 客户端设置

## Linux 和 Windows 端 Anki

### Anki 2.1

在 [Add-on](https://apps.ankiweb.net/docs/addons.html#_add_on_folders) 文件夹 下创建文件夹 `ankisyncd`，并在其中创建并编辑文件 `__init__.py`：
```python
import anki.sync, anki.hooks, aqt

addr = "http://127.0.0.1:27701/" # put your server address here
anki.sync.SYNC_BASE = "%s" + addr
def resetHostNum():
    aqt.mw.pm.profile['hostNum'] = None
anki.hooks.addHook("profileLoaded", resetHostNum)
```
将 `addr = "http://127.0.0.1:27701/"` 行中的 `127.0.0.1` 换成对应服务器的 IP。`27701` 对应服务器配置的端口。

### Anki 2.0

（我也不知道是否支持，但是官方文档上给了相关配置）在 `~/Anki/addons` 下创建并编辑文件 `ankisyncd.py`：
```python
import anki.sync

addr = "http://127.0.0.1:27701/" # put your server address here
anki.sync.SYNC_BASE = addr
anki.sync.SYNC_MEDIA_BASE = addr + "msync/"
```
同理，把 `127.0.0.1` 换成服务器的 IP 。`27701` 为服务器端口。

## Android 端 Ankidroid

设置 --> 高级设置 --> 自定义同步服务器

* 同步地址：`http://127.0.0.1:27701/`
* 媒体文件同步地址：`http://127.0.0.1:27701/msync`

把以上地址中的 `127.0.0.1` 换成服务器的 IP 地址。`27701` 为端口设置。注意上面两个地址末尾的斜杠有无一定要正确，否则会同步失败。

# 同步失败可能的问题排查

如果服务器能正常运行，而同步无法正确进行，可以尝试以下几个方面的检查：

* 在命令行 `ping [服务器 IP 地址]` 如果有持续输出表示可以连接上服务器，如果没有结果说明网络连接有问题
* 检查服务器防火墙，如果是 VPS 在控制台检查防火墙，添加 TCP 规则 27701 端口，Windows 可以尝试关闭所有防火墙
* 尝试通过浏览器打开链接 `http://127.0.0.1:27701` （将 `127.0.0.1` 换成服务器 IP 或域名），如果网页显示 `Anki Sync Server` 说明可以访问到服务器

# 参考

* [No. 127: ankisyncd – A Custom Sync Server for Anki 2.1 | Gene Dan's Blog](http://genedan.com/no-127-ankisyncd-a-custom-sync-server-for-anki-2-1/)
* [tsudoko/anki-sync-server: Self-hosted Anki sync server](https://github.com/tsudoko/anki-sync-server)

在写完这篇文章后，我发现有几篇博客已经有相关的记录了，这里也贴上链接吧。

* [anki的使用以及anki server的配置 • extendswind](https://extendswind.top/posts/technical/anki_and_anki_server/)
* [CentOS7自建Anki同步服务器(python3) | Bruce's Blog](https://www.xiebruce.top/881.html)
