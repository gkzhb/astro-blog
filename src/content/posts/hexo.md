---
title: Hexo 博客搭建折腾记录
published: 2019-01-01 21:35:16
category: Programming
tags:
- Blog
toc: true
---

记录自己搭建博客遇到的问题的解决方案，方便今后查找。

<!-- more -->

## 在 Hexo 中使用 LaTeX 渲染数学公式

来源：

* [使用LaTex添加公式到Hexo博客里 - Aoman_Hao的博客 - CSDN博客](https://blog.csdn.net/Aoman_Hao/article/details/81381507)
* [hexo下LaTeX无法显示的解决方案 - crazy_scott的博客 - CSDN博客](https://blog.csdn.net/crazy_scott/article/details/79293576)

### 步骤

1. 安装 Kramed

	将 Hexo 默认渲染引擎 marked (不支持 Mathjax) 更换为 hexo-renderer-kramed 引擎 (支持 Mathjax 公式输出)
	在 Hexo 目录下，输入下面的命令卸载默认渲染引擎，安装新的引擎：
```bash
$ npm uninstall hexo-renderer-marked --save
$ npm install hexo-renderer-kramed --save
```

1. 修改配置文件

	打开 `node_modules/hexo-renderer-kramed/lib/renderer.js`，将
```javascript
// Change inline math rule
function formatText(text) {
    // Fit kramed's rule: $$ + \1 + $$
    return text.replace(/`\$(.*?)\$`/g, '$$$$$1$$$$');
}
```
	中 `return` 那行注释掉 (开头加两斜线，同 `return` 上面一行那样)，在下面一行添加 `return text;`。也即改为下面这样：
```javascript
// Change inline math rule
function formatText(text) {
    // Fit kramed's rule: $$ + \1 + $$
    // return text.replace(/`\$(.*?)\$`/g, '$$$$$1$$$$');
	return text;
}
```

1. 停止使用 hexo-math，并安装 Mathjax 包

	卸载 hexo-math：
```bash
$ npm uninstall hexo-math --save
```

	安装 hexo-renderer-mathjax 包：
```
$ npm install hexo-renderer-mathjax --save
```

1. 更新 Mathjax 的配置文件

	打开 `node_modules/hexo-renderer-mathjax/mathjax.html`，将所有内容注释掉，加上以下内容：
```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.1/MathJax.js?config=TeX-MML-AM_CHTML"></script>
```

1. 更改默认转义规则 (解决语义冲突)

	因为 LaTeX 与 Markdown 语法有语义冲突，所以 Hexo 默认的转义规则会将一些字符进行转义，因此要对默认规则进行修改。
	打开 `node_modules/kramed/lib/rules/inline.js`，找到第 11 行的 `escape: ` 项和原第 20 行的 `em: ` 项，分别注释掉并添加内容，即修改为以下这样：
```javascript
  // escape: /^\\([\\`*{}\[\]()#$+\-.!_>])/,
  escape: /^\\([`*\[\]()# +\-.!_>])/,
```
	和
```javascript
  // em: /^\b_((?:__|[\s\S])+?)_\b|^\*((?:\*\*|[\s\S])+?)\*(?!\*)/,
  em: /^\*((?:\*\*|[\s\S])+?)\*(?!\*)/,
```
	这两项修改分别
1. 开启 Mathjax

	在 `themes/[Your Theme]/config.yml` 中，添加如下代码 (如果存在 `mathjax:` 就不用添加这一行了)
```
mathjax:
	enable: true
```

	或者
```
mathjax: true
```

	**注意配置项和参数中间有一个空格不能漏掉**

	写博客 posts 时，要开启 `Mathjax` 选项，即在文章的 Front-matter 里添加以下内容：
```
mathjax: true
```

	例如 (上下各三个减号我的代码渲染有问题就不加上了)：
```hexo
title: hexo
date: 2019-1-1
tags:
mathjax: true
```

	*PS: 我没有添加这一项也成功渲染出来了。* 

1. 测试

	添加一段 LaTeX 代码：
```latex
$$lim_{1\to+\infty}P(|\frac{1}{n}\sum_i^nX_i-\mu|<\epsilon)=1, i=1,...,n$$  
```

	渲染结果如下：
$$lim_{1\to+\infty}P(|\frac{1}{n}\sum_i^nX_i-\mu|<\epsilon)=1, i=1,...,n$$  

## 使用七牛云加速网站资源的加载 (无法长期使用，放弃)

考虑到 Github 网速较慢，加载网页图片等速度较慢。我选择国内的 CDN 服务运营商七牛云来加速网站加载。

### 使用插件 [hexo-qiniu-sync](https://github.com/gyk001/hexo-qiniu-sync)

1. 根据插件的 `README` 操作，用 `npm install hexo-qiniu-sync --save` 命令安装插件
1. 在 `_config.yml` 文件中，根据提示修改。主要修改的地方有几个：
	* `bucket` - 改为自己的空间名称
	* `access_key` `secret_key` - 在七牛云中点击个人面板，密钥管理中有这两个参数，**注意不要泄漏这些密钥**！ (如果仓库是公开的话，可以修改 `secret_file` 参数，将密钥放在本地文件中而不在此处添加密钥，并将这个文件添加到 `.gitignore` 中)
	* `urlPrefix` - 修改为自己存储空间的域名 (注意 `.com/` 后面的部分要与 `dirPrefix` 的内容保持一致)
1. 设置完成后，执行 `hexo g` 就会自动生成一个 `local_dir` 对应的目录，在其中对应目录下存放对应文件即可
1. 使用命令 `hexo s` 会自动上传同步 `local_dir` 中的文件
**不知为何我一直无法成功上传**，两个 key 也检查过没有错误。
```
ERROR get file stat err: static/images/xxx.jpeg
[object Object]
```
