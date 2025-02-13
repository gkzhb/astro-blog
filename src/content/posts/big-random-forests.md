---
title: "Training Big Random Forests with Little Resources"
published: 2019-12-14T10:01:00+08:00
updated: 2019-12-14T10:01:00+08:00
draft: false
keywords: []
description: ""
tags: ["机器学习"]
category: 论文
author: "zhb"

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

## Abstract

对大量数据实例使用随机森林一般需要大型计算集群来进行训练。这篇论文提出了一种简单有效的分层构造框架来提高训练的速度。其基本思路是一个多级构造方案：用数据的少量随机子集来构建顶层树，之后将所有训练实例通过顶层树分散到各个叶子节点后进行后续的处理。

<!--more-->

## 1 Introduction

## 2 Background

> 介绍标准随机森林

$T$ 表示一组训练模式，$T_i$ 表示第i棵树，而 $f_i(x)$ 表示第i棵树的预测函数。公式1表示随机森林预测结果的表达式，其中函数C表示从B棵树的预测结果得到最终预测结果的函数。在回归模型中通常取平均值，而分类模型通常取最大分类结果数。

一棵树从根节点开始递归地构造，而且使用训练数据的一个子集来训练节点。每个节点将数据分为两个子集，这两个子集被分别用来构造该节点下的两棵子树。当训练节点的数据子集只有一种分类结果时或满足其它条件（如达到设定最大深度）时，该节点成为叶子节点。在图 1 中给出了一个简单的示例，对于一个与训练实例的子集 $S\subseteq T'$ 相对应的内部节点，搜索一个分裂维度 i 和一个使信息增益最大化的阈值 $\theta$ 。信息增益见公式 2 。L和R两个S的子集是根据 $x_i$ 与 $\theta$ 的关系确定的。Q是一个度量集合中杂质的函数，如公式3和4分别对应回归和分类问题，公式 3 中 $\hat{y}$ 可能是打错了应该是 $\bar{y}$，是 y 的均值。

随机森林的总体结构在算法 1 中进行了概述。对每颗树从集合 T 中随机提取样本 T' 构建树。算法 2 中描述了构造树的方法。

### 2.1 Large-Scale Construction

> 这一部份探讨对于大量数据时森林构造的性能优化。

过去人们提出了很多随机森林的变体，不过构造单棵树的效率往往取决于特定随机森林变量和用于加速的方法。一种流行的方法是**极随机树**(*extremely randomized trees*)。在实践中，诉诸潜在的“次优”分割通常会产生竞争性的，有时甚至是更好的树木组合。此外，训练这种变体也可能更快。另一个变种是基于**补丁**(*patches*)，每个补丁都基于不同的 features 构成的子集，每颗树都独立地建立在这些补丁上。

在软件层面上也可以优化实现来提高实际运行时间。

众所周知，随机森林可以“并行化”。但是，针对未修剪的完整树，这种方法似乎并没有比标准的多核执行改善多少。

另一个研究领域是分布式计算。比如对数据的子集构建单独的树或森林。最后由这些树或森林组成整个集合。

### 2.2 Deep Trees

> 探讨对于稀有类别进行分类可能出现的问题。

原始的随机森林实现是生成完整的树。一个简单的变种是生成具有指定最大高度的树。尽管这种方法验证和测试的准确性可能提升，但失去了分辨稀有分类的能力。所谓的 $\frac{m}{n}$ 子集策略

## 3 Algorithmic Framework

提出了一种基于包装的方法，该方法可以处理单个计算节点上的大量数据集。

3.1 概述一棵树的构造，3.2 介绍整体的实现如何同时构造所有的树。基本思路是由一小部分数据构造出顶层树，之后用这棵树将所有数据尽可能均匀地划分到不同的子集中。

### 3.1 Wrapper-Based Construction

整体流程见算法 3：第一阶段，从所有训练集 T 中随机抽取一个子集 S，用于构建顶部树 $T_{top}$。第二阶段：训练数据 T 中所有数据都被这棵树分类到某个叶子节点中。第三阶段：对上一步分出的每个集合 $T_i$ 计算它的底部树，并将其附加到对应的顶部树的叶节点。这样就构成了一棵大树 $\cal T$。这棵大树类似于用 `BuildTree` 方法构造的一棵树。但是为了避免生成的顶层树很不平衡，不能直接套用 `BuildTree` 方法。

#### 3.1.1 Construction of Top Trees.

算法 4 对 `BuildTree` 进行了两点修改：
1. *停止分裂条件*：递归构造只在节点大小达到最小叶节点大小时停止。$M$ 指定了一个期望最大叶节点大小。由于实际叶节点的大小只有在将所有数据实例都经过顶部树分类后才知道，他们选择用 $ \bar{M} = max(2, M\cdot\frac{R}{N}) $ 估计 M。
1. *平衡分裂*：用公式 5 代替顶部树中的信息增益函数来提供更平衡的划分。公式 5 右边减去的部份体现了这个函数受左右两个子节点平衡性的影响。这与标准的 [k-d 树](https://www.cnblogs.com/flyinggod/p/8727584.html)相类似。$\lambda \in[0, 1]$ 用来决定原来的信息增益与平衡划分的权重。

当分裂几乎很纯的节点时，公式 5 第二部分对划分的平衡性有重要意义。可以看图 3 的一个例子，a 和 b 分别是 $\lambda = 0$ 和 $\lambda = 1$ 的情形。红色表示叶子节点的大小比重。a 中只考虑信息增益会导致很不平衡的叶子。而 b 中划分很平衡。对后续底部树的构造更有利。但是也会造成顶部树的结构单一，缺乏随机性。

#### 3.1.2 Distribution & Construction of Botton Trees

对数据进行划分时，根据数据实例返回一个分类的叶节点编号。最后根据所有这些编号分得叶 buckets。对每个叶 bucket，构建底部树的数目 $n_b$ 可以由用户定义。在大规模数据下，这些叶 buckets 之间可以并行，并且只需要自己那部份数据子集。但是这也会减少随机森林的整体随机性，可能影响模型的质量。*所以在运行时间和树的多样性之间有权衡*（废话）。

### 3.2 Implementation

构造 $n_t$ 棵顶部树和将数据划分经过两轮整个数据集的处理。每轮都对特定块大小的数据进行处理。第一轮随机提取数据子集用于训练顶层树。第二轮分配数据阶段，为每个叶 bucket 创建一个训练子集。第三轮是对每个叶 bucket 训练树木。

性能分析：略。所有 $n_t$ 棵顶部树的构造可以用额外的 O(R+C) 内存完成（R 是数据子集大小，C 是块大小 chunk size）。

woody

## 4 Experiments

用一台多核电脑做所有的实验。与当下另外三个方法对比。

### 4.1 Experimental Setup

使用一台标准桌面电脑 i7-3770 4 核 8 线程 CPU，16G 内存和 16G Swap space。系统 Ubuntu 16.04。关注构建阶段的运行时间和测试集的准确性。所有结果都是四轮测试的平均值。使用标准随机森林。实验验证，使用四种实现：
1. 本文提出的基于包装的(wrapper-based)构造方案
1. subsets，通过从所有数据中随机抽取很多子集，然后对这些子集构造分类树。
1. sklearn，由 sklearn 提供的随机森林分类器实现
1. h2o，由 $H_2O$ 包提供的随机森林实现

只对分类问题进行测试。实验数据规模见表 1，d 是特征数。最大的 landsat-osm 是一个遥感数据集。

### 4.2 Model Parameters

分析两个重要参数的影响

#### 4.2.1 $n_b$ 每棵顶部树构建的底部树数量

增大 $n_b$ 来减少每棵顶部树的构建规模来减少构造时间，即让更多的树共享顶部树，不过这会导致随机性的减弱。

M 是叶子 bucket 大小

图 4：用 covtype 数据集探究这个参数的影响。使用 M 1000, 20000, 75000。M 很小时，会构建更大的顶部树，构造性能会更差。

在每个测试例子中，底部树的数量总和都是 24 棵。$n_b$ 越大，精度越差，但是差异很小。同样地，M 的变化对精度影响叶很小，所以只要底部树的数量足够多，构造叶子更大的顶部树不会对精度有较大影响。

#### 4.2.2 $\lambda$ 调节平衡性的指标

使用改进信息增益函数作为节点划分依据的标准随机森林和本模型对比。

图 5：同样使用 covtype 数据集，使用不同的 $\lambda$，每个测试节点都构造 24 棵底部树( $n_t=6, n_b=4$ )。

左边是标准随机森林实现，右边是论文提出的方法（底部树中仍然使用 G 而不是 $\bar{G}$）。

$\lambda$ 越小，精度越高。但在右下角的图看出在论文提出的实现中，它对精度影响不大。而且训练数据量越大，精度越高。

### 4.3 Small Data

图 6 是 covtype, susy, higgs 三个数据集的运行时间和模型精度。所有实现方法精度基本都差不多，而且 woody 方法在分类性能上的削弱基本可以忽略不计。subsets 从所有训练数据中抽取子集训练树木，并没有从更多的数据中提高精度，而是陷入一种粘滞的状态。本论文提出的方法还可以适用于更大的数据规模上，而且能构生成可分类稀有分类的完全树。

### 4.4 Big Data

使用 landsat-osm 数据集，生成 12 棵树。图 7，woody 和 subsets 两种方法都能成功处理所有的训练实例，而另外两种实现不能很好地处理这样大量的数据。sklearn 只能处理一千万数据，精度是 0.72，而 $h_2o$ 只能处理到三千万数据，但精度不足 0.24。woody 与 subsets 相比，精度有所提升，而且可以生成完全树，对稀有实例数据进行分类。

用 landsat-osm 数据集所有十亿数据对 woody 训练，各阶段运行时间见图 8，这个数据中有很多不平衡的分类标签。训练参数 $n_t=1, n_b=4, \lambda=1$。从图中可以看出，woody 可以有效处理十亿规模的数据，而且分配数据阶段和构造底部树阶段占据了大部份的训练时间。

## 5 Conclusion


