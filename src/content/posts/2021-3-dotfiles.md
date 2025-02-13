---
title: "使用裸 Git 仓库备份 *nix 系统用户配置文件"
published: 2021-03-28T23:36:09+08:00
updated: 2021-03-28T23:36:09+08:00
draft: false
keywords: ["git", "backup", "dotfiles", "vim", "fugitive"]
description: ""
tags: ["配置", "git", "备份", "vim"]
category: Programming
author: "gkzhb"

# You can also close(false) or open(true) something for this content.
# P.S. comment can only be closed
comment: true
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

之前一直比较头疼配置文件在多台设备上的备份与共享，最近 Google 到了一个简单方便的终极方法，这个方法只需要使用 Git。

> 此方法需要读者了解如何使用 Git，若不了解 Git 请先学习 [Git 基本操作](https://www.liaoxuefeng.com/wiki/896043488029600/896827951938304)。

<!--more-->

## 简介

本方法主要思想是使用 git 仓库管理配置文件，在 HOME 目录下保存一个 git 版本库，并将 HOME 目录设置为工作区，将需要备份的配置文件添加到 git 仓库中，而无需手动复制配置文件。在不同主机上如果使用不同的配置文件，可以使用不同的分支加以区分，并在 master 分支上保存公共的配置文件。这样我们可以充分利用 git 的 checkout、merge、rebase 等各种功能来管理我们的配置文件。

## 创建配置仓库

第一次备份配置时，需要创建一个 Git 仓库到 HOME 目录下：

```bash
git init --bare $HOME/.dotfiles
```

以上命令创建了一个裸 git 仓库，没有工作区。也就是说 `.dotfiles` 相当于普通 git 仓库下的 `.git` 文件夹，里面存放 git 仓库的历史记录及配置信息。

接着我们在 shell 的配置文件中定义一个别名 alias：

```bash
alias config='git --git-dir=$HOME/.dotfiles --work-tree=$HOME'
```

将以上内容添加到 shell 的配置文件中，可以使用下面的命令。shell 配置文件路径比如 bash 是 `~/.bashrc`，zsh 是 `~/.zshrc`，fish 是 `~/.config/fish/config.fish`。之后我们都通过 `config` 命令来操作配置仓库。而且只要把 `config` 当成 `git` 命令来使用即可。

```bash
echo "alias config='/usr/bin/git --git-dir=$HOME/.dotfiles --work-tree=$HOME'" >> $HOME/.bashrc
```

添加完后执行 `exec bash` 让配置生效，使用其它 shell 对应地替换掉 `bash` 即可。

现在通过以下命令我们可以看到当前配置仓库的状态：

```bash
config status
```

但是这样有个问题，HOME 目录下所有文件都被标记为 untracked，很影响仓库状态的查看，所以配置 git 仓库不显示未被追踪的文件：

```bash
config config --local status.showUntrackedFiles no
```

另外，为了避免今后在其它地方通过 git 获取备份的配置时出现奇怪的回溯问题，在 HOME 目录下创建 `.gitignore` 文件，并将以下内容添加到该文件中。

```text
.dotfiles
```

之后我们就可以通过 git add 和 git commit 命令将需要备份的配置文件添加到 git 仓库中，也可以通过 git remote add 添加远程 git 仓库。当然需要使用 `config` 替换 `git`。

## 在其他设备上获取配置

从远程仓库获取你的配置仓库，将 `<git-repo-url>` 换成实际远程仓库地址：

```bash
git clone --bare <git-repo-url> $HOME/.dotfiles
```

和之前一样，在 shell 中定义别名，如果备份的配置中已经定义了别名，现在可以直接在 shell 中执行以下命令，临时添加别名：

```bash
alias config='git --git-dir=$HOME/.dotfiles --work-tree=$HOME'
```

接着我们来从仓库中检出之前备份的配置文件：

```bash
config checkout
```

在这一步可能会发生冲突导致检出失败，比如出现类似下面的输出：

```text
error: The following untracked working tree files would be overwritten by checkout:
    .bashrc
    .gitignore
Please move or remove them before you can switch branches.
Aborting
```

这时我建议将出现冲突的本地文件重命名，加上 `.bak` 后缀再执行之前的检出命令。

检出成功执行后，所有的配置文件就都出现在其原本的位置。

最后和之前创建仓库时一样，需要设置仓库不显示未被追踪的文件：

```bash
config config --local status.showUntrackedFiles no
```

## 与 vim-fugitive 结合使用

vim-fugitive 是 Vim 上一个与 git 深度结合的插件，通过它可以方便快捷地操作暂存区以及查看 git 历史。要将该插件用于本文的配置仓库中，需要对仓库进行一些额外的配置。

因为 fugitive 根据 git 仓库的 `core.worktree` 属性确定工作区位置，所以需要配置仓库的这个属性：

```bash
config config --local core.worktree $HOME
```

为了检查确认设置正确可以运行不加参数的命令，如果输出是实际的 HOME 路径就没问题：

```bash
config config --local core.worktree
```

另外，因为我们通过 `--bare` 命令初始化仓库，在查看仓库状态时会遇到 `warning: core.bare and core.worktree do not make sense` 的问题，解决方法是去掉仓库 `core.bare` 属性或将它的值改成 `false` ，这里选择前者：

```bash
config config --unset core.bare
```

最后我们在启动 (neo)vim 时，添加环境变量 `GIT_DIR=$HOME/.dotfiles` 即可让 fugitive 获取配置仓库的位置

```bash
GIT_DIR=$HOME/.dotfiles vim
```

我使用的是 fish shell，所以使用以下命令：

```bash
env GIT_DIR=$HOME/.dotfiles vim
```

最后在 shell 配置文件中，可以将运行命令定义成一个别名 alias 方便使用（dv: dotfiles vim）：

```bash
alias dv='GIT_DIR=$HOME/.dotfiles vim'
```

另外补充一点，使用这种方法，fugitive 只能在 HOME 目录或子目录下正常使用，否则会出现 `fugitive: working directory does not belong to a Git repository` 的错误。所以如果在 HOME 中有软链接链接到其它地方，在其中 fugitive 会无法使用。

## Refs

* [GitHub does dotfiles - dotfiles.github.io](https://dotfiles.github.io/)
* [Dotfiles - ArchWiki](https://wiki.archlinux.org/index.php/Dotfiles)
* 本文内容基本来自此文章：[How to store dotfiles | Atlassian Git Tutorial](https://www.atlassian.com/git/tutorials/dotfiles)
* [Handle $GIT_DIR and $GIT_WORK_TREE · Issue #415 · tpope/vim-fugitive · GitHub](https://github.com/tpope/vim-fugitive/issues/415#issuecomment-37855823)
* vim-fugitive 参考 [How to use vim-fugitive with a git bare repository? - Stack Overflow](https://stackoverflow.com/questions/65021175/how-to-use-vim-fugitive-with-a-git-bare-repository) okket 的回答，并根据我自己（gkzhb）的实践补充了额外需要的配置写了一条更完整回答。
