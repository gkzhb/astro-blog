---
title: "Mac OS Node.js gpy 报错：No receipt for 'com.apple.pkg.CLTools_Executables' found at '/'"
published: 2021-02-05T15:20:49+08:00
updated: 2021-02-05T15:20:49+08:00
draft: false
keywords: []
description: ""
tags: ["Node.js"]
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

<!--more-->

在 Mac 上使用 yarn 安装依赖包时，gpy 遇到以下问题出错：
```
No receipt for 'com.apple.pkg.CLTools_Executables' found at '/'.

No receipt for 'com.apple.pkg.DeveloperToolsCLILeo' found at '/'.

No receipt for 'com.apple.pkg.DeveloperToolsCLI' found at '/'.
```

之后搜索找到 [Is this an Issue with MACOS catalina? · Issue #1927 · nodejs/node-gyp](https://github.com/nodejs/node-gyp/issues/1927)

在终端运行 `xcodebuild` 命令得到同样报错：
```
xcode-select: error: tool 'xcodebuild' requires Xcode, but active developer directory '/Library/Developer/CommandLineTools' is a command line tools instance
```

之后根据 [此回复](https://github.com/nodejs/node-gyp/issues/1927#issuecomment-542935181) 找到 [xcode-select: error: tool 'xcodebuild' requires Xcode, but active developer directory '/Library/Developer/CommandLineTools' is a command line tools instance · Issue #569 · nodejs/node-gyp](https://github.com/nodejs/node-gyp/issues/569)

解决方法是执行命令：
```
sudo xcode-select -s /Applications/Xcode.app/Contents/Developer
```
