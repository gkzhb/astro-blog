---
title: Using Grep & Regular Expressions
published: 2018-11-07 17:33:47
category: Linux
tags:
  - Command Line
  - Linux
  - Regular Expression
toc: true
---

From [Using Grep & Regular Expressions to Search for Text Patterns in Linux](https://www.digitalocean.com/community/tutorials/using-grep-regular-expressions-to-search-for-text-patterns-in-linux)

<!-- more -->

## Basic Usage

```bash
$ grep [Pattern] [Input File]
```

Print out every **line** in the file containing that Pattern

Common Options|Description
---|---
`-i` == `--ignore-case`|both upper- and lower-case variations
`-v` == `--invert-match`|do not contain the Pattern
`-n` == `--line-number`|show the line number

## A Little bit about Regular Expressions

### Anchor Matches

Anchor Matches|Description
:-:|---
`^`|at the begining of the string(line)
`$`|at the end of the string

### Matching Any Character

Any Character|Description
:-:|---
`.`|match any single character

### Bracket Expressions

* Characters between `[` and `]` means `OR`
* But if the characters start with `^`, it means `NOT`, i.e. **except**
* Represent a range of characters: `[A-Z]`, but we can use POSIX character classes to replace the `[A-Z]`: `[[:upper:]]`

### Repeat Pattern Zero or More Times

Character|Description
:-:|---
`*`|repeat the previous character or expression zero or more times

### Escaping Meta-Characters

Using backslash character `\` to escape characters that would normally have a special meaning.

## Extended Regular Expressions

Use `-E` flag or call `egrep` command to use Extended Regular Expressions

### Groupinn

### Alternation

### Quantifiers

Character|Description
:-:|---
`?`|match the previouscharacter zero or one times
`+`|one or more times

### Specifying Match Repetition

`{NUM}` to specify matching times, from an exact number, a range, or an upper or lower bounds

