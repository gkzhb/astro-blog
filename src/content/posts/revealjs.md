---
title: "用 Hugo 与 Markdown 制作网页 PPT"
published: 2019-12-18T18:33:44+08:00
updated: 2019-12-18T18:33:44+08:00
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

很久以前就在知乎上看到可以用 [reveal.js](https://github.com/hakimel/reveal.js/) 在网页上制作 PPT。但是一直没有用过，直到最近课堂展示上看到有人用 HackMD 做网页端 Slides 才又有了兴致。HackMD 提供网页端服务，通过 Markdown 排版 Slides。看起来也是用的 reveal.js，可惜网络不(bei)好(qiang)，在公用电脑上不方便进行展示。于是我在网上寻找类似的功能，发现有 [reveal.js 的 Hugo 主题](https://github.com/dzello/reveal-hugo) 可以较好地实现。这里有一个该[Hugo 主题的 Demo](https://themes.gohugo.io/theme/reveal-hugo)和我自己的[简单的 Demo](https://gkzhb.gitee.io/slides)。

<!--more-->

## 安装

Hugo 必装，Git 推荐安装。Hugo 在 Windows 下的安装参考[Hugo 安装中文文档](https://www.gohugo.org/doc/tutorials/installing-on-windows/)，简单来说以下几步：

1. 在 [Latest Release · gohugoio/hugo](https://github.com/gohugoio/hugo/releases/latest) 下载最新版 `hugo_0.61.0_Windows-64bit.zip` 或 `hugo_extended_0.61.0_Windows-64bit.zip` （32位电脑请自觉用 32bit）
1. 解压安装包，将 `hugo_*.exe` 文件重命名为 `hugo.exe` ，并添加该文件所在目录到 PATH 环境变量中，方便命令行访问
1. 输入 `hugo help` 来验证配置是否成功，成功时输出会包括以下内容：

```text
Hugo is a Fast and Flexible Static Site Generator
built with love by spf13 and friends in Go.
```

## 制作第一个 Slide 网页

### 新建 Hugo 网站

在命令行中输入命令创建一个 Hugo 网站，并进入该新建的文件夹：

```bash
hugo new site my-presentation
cd my-presentation
```

如果安装了 git 可以使用 git 安装主题：

```bash
git init
git submodule add git@github.com:dzello/reveal-hugo.git themes/reveal-hugo
```

否则需要在 [dzello/reveal-hugos](https://github.com/dzello/reveal-hugo/archive/master.zip) 下载 ZIP 文件，解压到 `my-presentation/themes/` 并确保解压出的文件夹名称是 `reveal-hugo`

### 配置主题

修改 `my-presentation` 文件夹中的 `config.toml` 添加以下内容：

```toml
theme = "reveal-hugo"
RelativeURLs = true
CanonifyURLs = true

[markup]
defaultMarkdownHandler = "blackfriday"

[outputFormats.Reveal]
baseName = "index"
mediaType = "text/html"
isHTML = true
```

最后，在 `content` 文件夹下，创建 `_index.md` 文件：

```markdown
+++
title = "My presentation"
outputs = ["Reveal"]
+++

# Hello world!

This is my first slide.

---

# Hello Mars!

This is my second slide.
```

上面 `+++` 框起来的区域用来写网页相关配置头部信息。后面开始是正文内容。

生成静态网站，只需在 `my-presentation` 目录下执行 `hugo` 命令。所有生成的静态网站数据在 `public` 文件夹下，打开 `index.html` 来查看网站内容。

要实时预览，执行 `hugo server` 命令，会有类似以下输出（不要关闭这个窗口）：

```text
Web Server is available at http://localhost:1313/ (bind address 127.0.0.1)
```

这时可以打开 `http://localhost:1313/` 即可实时预览，当文件有改动时，网页会自动刷新。

## 网站结构

```markdown
- content
  - home # 特殊目录，用于添加内容到网站首页 PPT 之后
    - body.md # 添加到首页 PPT 后
    - conclusion.md # 添加到首页 PPT 后
  - _index.md # 网站首页 PPT
  - ted-talk
    - _index.md # ted talk PPT 的开头
    - body.md # 添加到 ted talk PPT 后
    - conclusion.md # 添加到 ted talk PPT 后
```

在这个目录结构中，最后会生成两个 PPT，一个是根目录的 PPT，一个是 `/ted-talk` 路径下的 PPT。在文件夹中的补充 Markdown 文件会按照其中配置头部信息中的 `weight` 属性排序。如：

```markdown
+++
weight = 10
+++

# Slide 3

---

# Slide 4
```

## 基本语法介绍

### Slide 分页

```text

---

```

空行隔开的 `---` 表示分隔到下一页 Slide。

### Hugo Shortcodes 功能

Hugo 提供了 Shortcodes 功能方便 Markdown 书写而无需输入大量的 HTML 代码。

#### Section

reveal.js 提供了纵向的导航方式，可以用来将一个章节部份的内容放到一个纵列中，从而实现在章节之间通过左右快速跳转。

一个纵列中的 Slides 如下图所示：

```markdown
{{%/* section */%}}

# Vertical slide 1

---

# Vertical slide 2

{{%/* /section */%}}
```

#### Fragment

```markdown
{{%/* fragment */%}} One {{%/* /fragment */%}}
{{%/* fragment */%}} Two {{%/* /fragment */%}}
{{%/* fragment */%}} Three {{%/* /fragment */%}}
```

可以实现增量显示，即开始不显示，每次操作顺次出现。

单行显示 `{{%/* frag c="One" */%}}` 通过 `c` 属性确定内容，同上面的第一行。

另外可以添加 `index` 属性来指定显示的顺序，如 `{{%/* fragment index=2 */%}} One {{%/* /fragment */%}}`。生成的 html 如下：

```html
<span class='fragment' data-fragment-index=2> One </span>
```

`data-fragment-index` 属性指定显示顺序，从小到大依次显示，数值一样则同时显示。对于行内文字用 `<span>` 包裹，而段(`block`)内容（如代码块、图片）用 `<div>` 包裹。主题默认没有提供 `<div>` 类型的 shortcode，可以自己将 `themes/reveal-hugo/layouts/shortcodes/fragment.html` 复制到 `layouts/shortcodes/bfragment.html` 文件中，将其中的两个 `span` 换成 `div`。之后用 `{{%/* bfragment */%}}` 可以使段内容增量显示，而且同样可以用 `index` 指定显示顺序。

#### Slide

```markdown
---

{{</* slide id="custom-slide" */>}}

## Custom slide

---
```

`id` 属性用来链接引用。如 `[Try the link](#custom-slide)` 会生成一个链接到对应 `id` 的 Slide 的链接。

#### note

使用 `{{%/* note */%}}` 可以添加演讲者注释信息，在网页端按 `s` 键可以打开演讲者界面。

## 添加 reveal.js 插件

在 `static` 目录下创建 `plugin` 文件夹，将 reveal.js 的插件放入其中。在需要使用插件的 Markdown 文件头部添加：

```text
[reveal_hugo]
plugins = ["plugin/math-katex/math-katex.js"]
slide_number = true
```

路径要对应实际的 js 文件。顺便说一句，最后一行的 `slide_number` 为可选设置，它可以设置是否显示 Slide 页码，取值 `true` 或 `false`。

对于需要添加 css 的插件，还需要将 css 信息添加到页面样式中：

在 `layouts/partials/<path-to-slide>/reveal-hugo` 目录下添加 `head.html` 文件，加上引用所需 css 的 html 代码。

教程参考 [Plugin Example](https://themes.gohugo.io/theme/reveal-hugo/plugin-example)，对应 css 配置见 [reveal-hugo/head.html at master · dzello/reveal-hugo](https://github.com/dzello/reveal-hugo/blob/master/exampleSite/layouts/partials/plugin-example/reveal-hugo/head.html)。

## 小功能

### 快捷键

* 上下左右控制 Slide 移动方向
* `s` 进入演讲者模式
* `o` 进入概览模式
* `f` 进入全屏模式

### 导出为 PDF

reveal.js 支持用 Chrome 浏览器导出为 PDF 文件，只需要在原来的网页地址后加上 `?print-pdf`，如 `https://gkzhb.gitee.io/slides/?print-pdf`，然后使用 Chrome 的打印功能即可导出为 PDF。

## 更多

参看[官方 Demo](https://themes.gohugo.io/theme/reveal-hugo)

* 每张 Slide 可单独设置背景颜色、出现的变换效果及快慢等。
* 通过修改 Markdown 文件头部信息可以修改网页设置，如添加插件。
* 使用 reveal.js 的 Markdown 语法渲染 Slide `{{</* markdown */>}}`与用 html 渲染 Slide `<section data-noprocess> ... </section>`

在 GitHub 项目 `exampleSite/content` 目录下可以看到演示 Demo 的源 Markdown 文件，可以作为参考样例。

Hugo 也提供了添加自定义样式或 html 结构到特定网页的功能，感兴趣的也可以自行探索，当然也欢迎大家一起讨论。

## 总结

我个人觉得这个 Slide 最大的优点就是便携性与兼容性。  

* 我们可以将 Slides 部署到网上，方便在任何有网的地方进行访问，也可以将整个 `public` 文件夹放到 U 盘通过浏览器打开。简单的部署可以选择 Github 或码云（国内推荐，网速更快）的静态网站托管服务。  
* 相比于 PPT 来说兼容性比较不错，只是浏览器不能过于老旧（吐槽一下我们学校图书馆中居然还有用 XP 系统并且默认浏览器不支持 HTTPS 的电脑）。  
* 而且相比 PDF Beamer 不需要安装庞大的 LaTeX 环境，却又能提供简单的动画效果及 Hugo 提供的实时预览功能。当然如果够大佬的话，也可以充分利用浏览器环境进行各种刁炸天的骚操作。
