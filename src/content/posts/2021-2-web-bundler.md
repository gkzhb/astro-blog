---
title: "Webpack, Rollup 与 Parsel 三个 Bundlers 对比"
published: 2021-02-07T17:16:37+08:00
updated: 2021-02-07T17:16:37+08:00
draft: false
keywords: []
description: ""
tags: []
category: Programming
author: ""

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

前端网页打包通常会使用一些工具，如 Webpack，Rollup.js 及 Parsel。这些打包工具可以为前端进行浏览器兼容的处理（ES6 转 ES5）、精简代码（Minify Code）、动态编译（热重载 Live Reload）、代码拆分（Code Splitting）、通过 Tree Shaking 减小打包后的大小等等。这些工具称为 Bundlers。

<!--more-->

通过对 [Rollup vs. Parcel vs. webpack: Which Is the Best Bundler? | by Manisha Sharma | Better Programming | Medium](https://medium.com/better-programming/the-battle-of-bundlers-6333a4e3eda9) 这篇文章的阅读我对几个 Bundles 的优缺点进行简单小结。

## 配置

* Parcel 无需配置文件
* Rollup 需要配置文件，支持相对路径
* Webpack 需要配置文件，支持第三方引入

## 死码删除 Dead Code Elimination

通过 Tree Shaking 和其它静态分析方法分析运行时不会用到的代码片段进行移除。

* Parcel 最好，它的 Tree Shaking 支持 ES6 和 CommonJS 模块。另外 Tree Shaking 支持并行操作从而带来快速的构建体验，同时文件系统 的缓存机制让动态更新也及其迅速。
* Rollup 其次，无需配置即可优化
* Webpack 需要额外手动配置：
  * 使用 ES6 语法
  * 在 `package.json` 中设置 `SideEffects` 标志
  * 引入最小化代码的工具插件

## 代码拆分 Code Splitting

* Webpack 最快也最方便
* Rollup 其次
* Parcel 最慢，但是无需额外配置

## 动态更新 Live Reload

开发时 Bundlers 可以提供一个开发服务器，在本地代码变动时自动同步构建。

* Parcel 提供，但对 HTTP logging，hoooks 和 middleware 可能存在问题
* Rollup 需要安装配置 `rollup-plugin-serve` 及 `rollup-plugin-livereload`
* Webpack 需要一个插件 `webpack-dev-server`，支持 hooks 配置，选择使用的（served）文件等，定制化程度更高

## 热模块更新 Hot Module Replacement（HMR）

更新模块后在浏览器运行环境自动更新模块，而无需整个网页刷新。它可以保持应用当前的运行状态，Live Reload 会重新进行路由等操作。

* Webpack 在 `webpack-dev-server` 中包含 HMR 功能，相比另外两个功能更稳定
* Parcel 已有内置支持
* Rollup 需要 `rollup-plugin-hotreload` 插件

## 模块转换器 Module Transformers

Bundlers 通常只知道如何读取 JS 文件。Transformers 告诉 Bundler 如何处理其它格式的文件并打包。

* Parcel 内置，自动读取各种配置文件如 `.babelrc` 等
* Rollup 与 Webpack 都需要自行配置

## 小结

* 构建简单应用并快速启动项目并运行：Parcel
* 构建一个最小化第三方引入的库：Rollup
* 需要很多第三方集成工具的复杂应用；需要 Code Splitting，静态资源、CommonJs 依赖：Webpack

## Refs

  * [Rollup vs. Parcel vs. webpack: Which Is the Best Bundler? | by Manisha Sharma | Better Programming | Medium](https://medium.com/better-programming/the-battle-of-bundlers-6333a4e3eda9)
