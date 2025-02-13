---
title: "微前端学习及相关概念扩展学习"
published: 2021-01-22T11:28:48+08:00
updated: 2021-01-22T11:28:48+08:00
draft: true
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

学习了 [微前端到底是什么？ - 知乎](https://zhuanlan.zhihu.com/p/96464401) 之后写写我自己的理解以及补充学习到的一些概念。

<!--more-->

## 微前端目标

微前端想解决的一个问题是在前端项目变得越来越庞大复杂的时候如何能解耦，将复杂的项目通过某种规则拆分成更多易于管理维护的小项目，从而提高复杂项目的开发效率。

同时解耦带来的其它好处有不同小项目之间可以使用不同的技术栈，比如使 Vue.js 和 React.js 同时出现在一个项目中。

## 特性之一——影响隔离

为了让子项目之间以及父子项目之间不会互相影响（样式、js 作用域变量等）需要有良好的隔离机制。

## 补充学习

### Backend For Frontend(BFF)

多端客户端对服务端 API 需求不同，导致服务端接口开发负担增加，多团队多需求导致团队协作成本增加。

移动端因为算力和省电的考虑，需尽量将数据聚合的工作交给服务端执行。

解决方案是为每种用户体验提供一个后端（one backend per user experience），称为 Backend For Frontend（BFF 用户体验适配层）。

由此在概念上将前端应用拆分成两部分：客户端应用和服务端部分（BFF）。BFF 由对应前端 UI 团队负责实现维护。一个 BFF 专注于一种用户体验（一种 UI）。

多 BFF 复用：加一层**网关服务**（Edge API Service），提供通用逻辑，让 BFF 专注于业务逻辑。

复用的一般原则：
> Creating an abstraction when you’re about to implement something for the 3rd time.

应用场景：BFF 比下游服务更灵活，适合为第三方提供定制 API 等**差异化场景**。

优势：
* 关注点分离（separation of concerns）：后端的领域模型与前端的页面数据解耦
* 前端团队拥有 API 自主权

### Web Components

#### Shadow DOM

Shadow DOM 相当于沙箱，为组建提供隔离的环境，使组建不会被外接侵入。

* **Shadow Root**：`DocumentFragment` 通过 `createShadowRoot()` 得到的  `Fragment`
* **Shadow Host**：Shadow Root 与 DOM 的连接点
* **Shadow Boundary**：隔离 Shadow Root 下的 HTML 和 CSS

## Refs

* [**微前端到底是什么？ - 知乎**](https://zhuanlan.zhihu.com/p/96464401)
* [Backend For Frontend (BFF) | 黯羽轻扬](http://www.ayqy.net/blog/backend-for-frontend-bff/)
* [Using shadow DOM - Web Components | MDN](https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_shadow_DOM)
