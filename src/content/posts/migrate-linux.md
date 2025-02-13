---
title: "迁移 Linux 系统"
published: 2020-12-13T22:52:28+08:00
updated: 2020-12-13T22:52:28+08:00
draft: false
keywords: []
description: ""
tags: ["linux","配置"]
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
mathjaxEnableSingleDollar: true
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

最近入了一块 1TB 的固态，然后把原来安装在 256GB PM981 上的 Manjaro 系统迁移到了新的固态上。此文记录一下大致的迁移过程。

<!--more-->

## 流程

> 本篇中我使用的是 UEFI 引导 + GPT 分区

1. 在新的硬盘上创建好分区
1. 在 Linux 系统中挂载创建的分区
1. 使用 `rsync` 命令将 Linux 根目录同步到新分区中
1. 修改 `/etc/fstab` 中分区对应的 UUID
1. 为新硬盘安装 GRUB 引导
1. 若 BIOS 中没有显示对应的启动项，需要通过 `efibootmgr` 命令手动添加 EFI 启动项

## 创建分区

初始空硬盘格式化为 GPT 格式。之后在硬盘中依次创建 EFI 分区、Linux Swap 分区和 ext4 分区。

我使用的软件是 Linux 上的 Gparted，在 Win 上有很多磁盘管理软件，如 Disk Genius 等。

* EFI 分区：文件系统格式为 FAT32，我分配了 550MB 空间，分区的标志位（Flags）设置 `boot` 和 `esp`
* Linux Swap 分区：我设置成运行内存的大小 16GB
* ext4 分区：Linux 系统根目录挂载的分区，根据需要划分大小

## 复制 Linux 系统根目录到新分区

### 挂载新分区

在 Linux 上，挂载（需要 Root 权限）新的 ext4 分区到某个目录（`/mnt/ssd`）中：
```bash
mount /dev/nvme1n1p3 /mnt/ssd
```

需要查看分区设备号（`/dev/xxxpx`），可以用以下命令（同样需要 Root 权限）：
```bash
fdisk -l
```

### 使用 rsync 复制分区

使用 `rsync` 复制 Linux 系统到新分区上（同样需要 Root 权限）：
```bash
rsync -a -x / /mnt/ssd
```

这个过程时间可能会比较长，请耐心等待。要说明的一点是，命令中 `-x` 参数让 `rsync` 只会复制根目录对应的分区中的文件内容，即根目录下挂载的其它分区不会被复制。而且像 `/proc`、`/sys` 这些运行时产生的文件系统和如 `/tmp`，`/dev/shm` 等内存中的文件系统也不会被复制。

所以如果 Linux 系统有不止一个分区需要迁移，需要对其它分区也做 `rsync` 复制，否则它们是不会被复制到新分区中的。

关于 `-x` 参数的具体解释说明可以查看这个链接：[backup - Meaning of Crossing filesystem boundaries, --one-file-system, etc - Unix & Linux Stack Exchange](https://unix.stackexchange.com/questions/107113/meaning-of-crossing-filesystem-boundaries-one-file-system-etc)

## 修改 /etc/fstab 和 /etc/default/grub

在 `/etc/fstab` 文件中（挂载分区中对应 `/mnt/ssd/etc/fstab`），记录了各个路径点对应的挂载分区，一般使用 UUID 识别某个分区。

使用以下命令（需要 Root 权限）查看分区对应的 UUID：
```bash
lsblk -o+UUID
```

分区|挂载点
:-:|---
EFI 分区|`/boot/efi`
Linux Swap|`swap`
ext4 分区|`/`

只要将**新分区**中的 fstab 文件中 `UUID=` 后面的 UUID 进行替换即可，挂载点不用修改。

另外，在 `/etc/default/grub` 文件中，需要修改 `GRUB_CMDLINE_LINUX_DEFAULT` 的值：`resume=UUID=xxx` UUID 的值改为新 swap 分区的 UUID，之后更新 GRUB 引导（继续后面的步骤）。

## 安装 GRUB 引导

首先将新硬盘中的 EFI 分区挂载到 `/mnt/ssd/boot/efi` 路径点上，然后使用 `chroot` 命令（Root 权限）切换根目录到新硬盘中：
```
chroot /mnt/ssd
```

然后使用命令更新 GRUB 引导：
```
update-grub
```

之后如果重启能够在 BIOS 中找到 EFI 启动项并成功启动就没问题了（当然我并没有这么幸运）。如果不行可以尝试安装 GRUB：
```bash
grub-install /dev/nvme1n1
```

这里参数为**新硬盘的设备号**而不是分区的。

这个方法对我也行不通。所以我需要通过 `efibootmgr` 手动添加 EFI 启动项。

## efibootmgr 添加 EFI 启动项

efibootmgr 的使用推荐大家去看 [Gentoo Wiki](https://wiki.gentoo.org/wiki/Efibootmgr)。

efibootmgr 命令也需要 Root 权限。

### 查看当前启动项序列

使用 `-v` 参数查看当前启动项序列：
```bash
efibootmgr -v
```

你可以看看当前 Linux 系统启动项的 EFI 启动文件路径。比如我的显示如下：
```
Boot0001* Manjaro       HD(1,GPT,d0c6347f-32c0-441b-a898-b6498069b46c,0x3f,0x967c1)/File(\EFI\Manjaro\grubx64.efi)
```

只需要关心 `File` 后面的路径（这里路径分隔符使用**反斜线** `\` 而不是普通的斜线 `/` 请注意），之后创建 EFI 启动项的时候会用到。另外这个路径不区分大小写（FAT32 分区的锅），所以写成全大写或全小写应该也是没问题的。

### 修改 EFI 启动项时遇到的问题

之后修改 EFI 配置的时候，我遇到个问题：每次设置完用 efibootmgr 命令查看显示成功，但是重启进入 BIOS 却没有。之后找到[这个解决方案](https://superuser.com/questions/1166398/efi-settings-set-via-efibootmgr-are-ignored-after-reboot)（最后一个回答，被人踩了但确实解决了我的问题）。解决方法是重新挂载 efivarfs 分区（在 [Gentoo Wiki](https://wiki.gentoo.org/wiki/Efibootmgr) 中有提到）：
```bash
mount -o remount,rw -t efivarfs efivarfs /sys/firmware/efi/efivars
```

所以在修改 EFI 配置之前建议先执行上面的命令。

### 添加 EFI 启动项

创建 EFI 启动项：
```bash
efibootmgr -c -d /dev/nvme1n1 -p 1 -L "Manjaro" -l "\EFI\Manjaro\grubx64.efi"
```

上面命令中
* `-c` 表示创建 EFI 启动项
* `-d` 提供硬盘设备号，`-p` 提供 EFI 分区在硬盘的第几个分区，如 EFI 对应设备号为 `/dev/nvme1n1p1` 最后一个数字 `1` 就对应分区数（计数从 1 开始不是从 0 开始）
* `-L` 提供 EFI 启动项的标识文字，即在 BIOS 中看到的启动项名称
* `-l` 指定启动项执行的文件，就是之前记录的那个路径。可以去检查一下这个文件是否存在，如我的文件路径为 `.../boot/efi/EFI/Manjaro/grubx64.efi`

成功执行之后应该会输出添加后的所有 EFI 启动项。

### 删除 EFI 启动项

> 确定成功启动之前请务必不要删除原来的 EFI 启动项

删除使用 `-B` 参数：
```bash
efibootmgr -b 2 -B
```

`-b` 表示要删除的启动项的编号，即通过 `-v` 参数看到的，如 `Boot0001` 编号就是 1。这个编号是十六进制的，按照 `Boot` 后面的内容输入即可。

## 总结

最后说些题外话，曾经我也尝试用 efibootmgr 修复 EFI 引导成功过，而且当时似乎也遇到过同样地问题，但是现在不记得以前的步骤了。当初可能是碰对的感觉，现在又踩了一遍坑。

总结下经验：
1. 这些莫名其妙的 bug 还是要弄清楚为好，不然之后碰到还要浪费时间
1. 踩过的坑最好能记录下解决方法，之后可以参考

## 参考

* [backup - Moving entire Linux installation to another drive - Ask Ubuntu](https://askubuntu.com/questions/741723/moving-entire-linux-installation-to-another-drive)
* [dual boot - How can I repair grub? (How to get Ubuntu back after installing Windows?) - Ask Ubuntu](https://askubuntu.com/questions/88384/how-can-i-repair-grub-how-to-get-ubuntu-back-after-installing-windows/88432#88432)
* [Efibootmgr - Gentoo Wiki](https://wiki.gentoo.org/wiki/Efibootmgr)
* [linux - How do I fix Manjaro error hibernation device not found on boot? - Super User](https://superuser.com/questions/1014212/how-do-i-fix-manjaro-error-hibernation-device-not-found-on-boot)
