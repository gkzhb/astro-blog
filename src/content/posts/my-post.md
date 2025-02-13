---
title: "第一篇 Hugo 文章"
published: 2019-11-08T22:26:28+08:00
updated: 2019-11-08T22:26:28+08:00
draft: false
keywords: []
description: ""
tags: []
category: Programming
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
mathjax: true
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

测试 Hugo Markdown 语法样式
<!--more-->

# 一级标题

## 二级标题

### 三级标题

# 语法介绍

## 标题

效果见上方

```markdown
# 一级标题

## 二级标题

### 三级标题
```

## 段落换行

```markdown
第一段
继续第一段

第二段

第三段  
换行（上一行末尾有两个空格）
```

第一段
继续第一段

第二段

第三段  
换行（上一行末尾有两个空格）


## 文字样式

```markdown
**加粗** *斜体* ***加粗和斜体***

~~删除线~~ ~~**加粗删除**~~ ~~*斜体删除*~~
```

**加粗** *斜体* ***加粗和斜体***

~~删除线~~ ~~**加粗删除**~~ ~~*斜体删除*~~

## 链接

```markdown
[ZHB's Blog](http://blog.gkzhb.tk)

[相对链接](/)
```

[ZHB's Blog](http://blog.gkzhb.tk)

[相对链接](/)

## 图片

```markdown
![百(la)度(ji)](https://www.baidu.com/img/bd_logo1.png 文字)
```

![百(la)度(ji)](https://www.baidu.com/img/bd_logo1.png)

## 列表

### 无序列表

```markdown
* 列表项1
* 列表项2
* 列表项3
```

* 列表项1
* 列表项2
* 列表项3

### 有序列表

```
1. 第一项

	内容（Tab），注意上面一行空行

	很多

    很多（空格）
1. 第二项
1. 第三项
```

1. 第一项

	内容（Tab），注意上面一行空行

	很多

    很多（空格）
1. 第二项
1. 第三项

### 待办事项

```markdown
* [ ] 未完成
* [x] 已完成
```

* [ ] 未完成
* [x] 已完成

### 多级混合列表

```markdown
* aaa
	* 111
	* 222
* bbb
	1. b.1
	1. b.2
* ccc
	* [x] c.x
	* [ ] c.todo
- ddd
	* dd
		+ d
		+ e
	* ee
```

* aaa
	* 111
	* 222
* bbb
	1. b.1
	1. b.2
* ccc
	* [x] c.x
	* [ ] c.todo
- ddd
	* dd
		+ d
		+ e
	* ee

## 代码块

行内代码：`inline code`

```bash
$ echo hello world
hello world
```

## 表格

```markdown
表头|表头|表头|表头
:-:|--:|---|:--
居中|右对齐|默认|左对齐
居中|右对齐|默认左对齐|左对齐
xxxxxxx|aaaaaaaaaa|bbbbbbbb|cccccccc
居中|右对齐|无|左对齐
```

表头|表头|表头|表头
:-:|--:|---|:--
居中|右对齐|默认|左对齐
居中|右对齐|默认左对齐|左对齐
xxxxxxx|aaaaaaaaaa|bbbbbbbb|cccccccc
居中|右对齐|无|左对齐

## 数学公式

使用MathJax渲染

行内公式：$a_1$

```latex
$$lim_{1\to+\infty}P(|\frac{1}{n}\sum_i^nX_i-\mu|<\epsilon)=1, i=1,...,n$$  
```

$$lim_{1\to+\infty}P(|\frac{1}{n}\sum_i^nX_i-\mu|<\epsilon)=1, i=1,...,n$$  
