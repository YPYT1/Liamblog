---
name: optimize
description: Analyze and optimize code performance
version: 1.0.0
author:  Anand Tyagi
source: Claude Code Marketplace
keywords: performance
---

# optimize

Analyze and optimize code performance

## 来源信息

- **原始平台**: Claude Code
- **市场来源**: Claude Code Marketplace
- **原始名称**: optimize
- **版本**: 1.0.0
- **作者**:  Anand Tyagi
- **关键词**: performance

## 功能描述

## Context

- File size: !`du -h $ARGUMENTS 2>/dev/null || echo "File not specified"`
- Line count: !`wc -l $ARGUMENTS 2>/dev/null || echo "File not specified"`

## Your task

Analyze and optimize: @$ARGUMENTS

Focus areas:
1. **Algorithm efficiency**: Improve time/space complexity
2. **Memory usage**: Reduce memory footprint
3. **I/O operations**: Optimize file/network operations
4. **Caching opportunities**: Identify cacheable operations
5. **Lazy loading**: Implement lazy loading where beneficial
6. **Bundle optimization**: Reduce bundle size (if applicable)

Provide before/after comparisons and performance impact estimates.

## 使用方法

1. **自动触发**: Codex 会根据任务描述自动选择并使用此技能
2. **手动指定**: 在提示中提及技能名称或相关关键词
3. **斜杠命令**: 使用 `/skills` 命令查看并选择可用技能

## 兼容性

- ✅ Codex CLI
- ✅ Codex IDE 扩展
- ✅ 基于 Agent Skills 开放标准

---
*此技能由 Claude Code 插件自动转换，已适配 Codex 官方技能系统*
