---
title: Spring 入门笔记
published: 2019-02-19 15:22:33
updated: 2019-02-20
category: Programming
tags:
- Spring
toc: true
---

Spring in Action *4th Edition* 笔记

<!-- more -->

## Spring 概览

### 核心概念

* 依赖注入 (**Dependency Injection** *abbr* DI)
* 面向切面编程 (**Aspect-Oriented Programming** *abbr* AOP)

### 名词定义

* **POJO**: plain old Java object
* **wiring**: the act of creating associations between application components
* **container**: where application objects live in a Spring-based application. There are two distinct types of container implementations:
	* Bean factories: the simplest of containers
	* Application contexts: build on the notion of a bean factory by providing application-framework services

### Spring 家族

Spring 发展到现在已经不仅仅只是一个框架了。它还发展出了一系列的 Spring 配套的工具集，比如 Spring Boot, Spring Cloud 等。

## 连接(wiring) beans

在 Spring 中有三种方式配置 beans：
* XML 配置
* 在 Java 中配置
* 自动连接(Automatically wiring beans)

### Automatically wiring beans

* **Component scanning**: 自动发现并添加 beans
* **Autowiring**: 自动配置 beans 依赖关系

#### Component scanning

使用 `@Component` 标记需要添加到 beans 的类，如：
```java
package ...;
import org.springframework.stereotype.Component;

@Component
public class SgtPeppers implements CompactDisc {
	...
}
```

同时，需要明确配置开启 ComponentScan：
```java
package ...;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;

@Configureation
@ComponentScan
public class CDPlayerConfig {
}
```

* 命名 component-scanned bean

每个 bean 都有一个 ID，如果不明确分配，将使用类名的第一个字母小写的形式作为 ID。注明 ID 的方式为 `@Component("[bean-ID]")`，也可以使用 *Java Dependency Injection specification (JSR-330)* 中的 `@Named` 注释来提供 bean ID：`@Named("[bean-ID]")` （需要 `import javax.inject.Named;`）。在 Spring 中，这两种方式有微小的差别，但在大多数情况下两者是可以互换的。

* 为 component scanning 设置 base packages

`@ComponentScan("[package-name]")` 使用 String 类型指定包，更明显地传递参数方式 `@ComponentScan(basePackages="[package-name]")`，也可以指定多个包 `@ComponentScan(basePackages={"[package-name1]", "[package-name2]")`。

除了使用字符串指定包，也可以使用包中的类或接口 `@ComponentScan(basePackageClasses={[class-name1].class, [class-name2].class})` 注意参数名变成了 **basePackageClasses**

#### Autowiring

使用 `@Autowired` 注释类中的方法（需要 `import org.springframework.beans.factory.annotation.Autowired;`）。Spring 在实例化 bean 之后，将尽力去满足被 `@Autowired` 标记的方法需要的依赖。 如果没有满足的 bean ，Spring 会在生成 application context 的时候抛出一个异常。可以设置 `@Autowired` 的 `required` 参数为 `false` 来避免异常的抛出。不过尽量不要修改这个参数。当有多个 beans 满足依赖关系时，Spring 也会抛出一个异常，指出 autowiring 选择 bean 时有歧义。

`@Autowired` 有类似的 Java 中的注释 `@Inject` (`import javax.inject.Inject`)，和 `@Component` 与 `@Named` 的情况类似。

### 使用 Java 配置 beans (JavaConfig)

> 注：Java 配置虽然使用 Java 语言，但它实际上是配置文件，而非业务逻辑代码。所以 JavaConfig 中不能包含逻辑代码，同时配置内容也必须保存在 JavaConfig 中。

* 创建配置类：使用 `@Configuration` 注释类
```
package ...;
import org.springframework.context.annotation.Configuration;

@Configuration
public class CDPlayerConfig {
}
```

* 声明 bean：被 `@bean` 注释的方法将返回一个将被注册为 bean 的对象。默认情况下，bean ID 为方法名。通过 `@bean` 的 `name` 参数可以显式指定 ID 。
```java
@Bean // 或者 @Bean(name="lonelyHeartsClubBand") 指定 bean ID
public CompactDisc sgtPeppers() {
	return new SgtPeppers();
}
```
声明方法中可以使用任意 Java 代码来最终获得 bean 对象。

* 注入依赖：将依赖作为方法参数传入
```java
@Bean
public CDPlayer cdPlayer(CompactDisc compactDisc) {
	return new CDPlayer(compactDisc);
}
```

### 使用 XML 配置

> 注：XML 配置尽量少用，推荐使用 JavaConfig 。但能读懂 XML 配置也是必须的。


### 导入和混合配置

* 导入：`@Import([JavaConfig-name].class)` `@ImportResource("classpath:[xml-config-name].xml")` 导入多个配置可以在圆括号 `( )` 中使用花括号 `{ }`

## 高级 Wiring 技巧

### Scoping beans （作用域）

* 分类：
	* Singleton
	* Prototype
	* Session
	* Request

* 声明 Scope：`@Scope(ConfigurableBeanFactory.SCOPE_[SCOPE-NAME])` 位于 bean 声明注释之后（`@Bean` 或 `@Component`）

使用 Session 或 Request Scope 时，需要同时声明代理类型：
```java
@Scope(
	value=WebApplicationContext.SCOPE_[SESSION | REQUEST],
	proxyMode=ScopedProxyMode.[INTERFACES | TARGET_CLASS])
```

当声明的 bean 类型是一个接口时，代理使用 `INTERFACES`，否则为具体的类时，代理使用 `TARGET_CLASS`。

## Spring 项目创建、编译与运行

创建项目可以在 [Spring Initializr](https://start.spring.io/) 上填入相关信息，点击生成项目就可以得到项目初始的 zip 压缩包了。

编译 jar 包的命令

* gradle: `gradle build`
* maven: `mvn package`

gradle maven 编译生成的 jar 包的位置分别为 `build/libs/[project][-version].jar` `target/[project][-version].jar`

运行 jar 包的命令：`java -jar [target].jar`

如果要生成 war 包，在 maven 中只需要修改/添加 `pom.xml` 中相应内容：`<packaging>war</packaging>`，而在 gradle 中，需要添加 war 插件：`apply plugin: 'war'`，同时还要将设置项中的 `jar` 改为 `war`：
```
war {
  baseName = '[project-name]'
  version = '0.0.1'
}
```

具体的 maven 编译过程可以参考 [理解maven命令package、install、deploy的联系与区别 - zhaojianting的博客 - CSDN博客](https://blog.csdn.net/zhaojianting/article/details/80324533)
