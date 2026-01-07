---
name: test-file
description: Generate comprehensive tests for a specific file
version: 1.0.0
author:  Anand Tyagi
source: Claude Code Marketplace
keywords: testing
---

# test-file

Generate comprehensive tests for a specific file

## 来源信息

- **原始平台**: Claude Code
- **市场来源**: Claude Code Marketplace
- **原始名称**: test-file
- **版本**: 1.0.0
- **作者**:  Anand Tyagi
- **关键词**: testing

## 功能描述

## Your task

Generate comprehensive unit tests for the file: @$ARGUMENTS

Requirements:
- Use the existing testing framework in this project
- Include edge cases and error scenarios
- Follow the project's testing conventions
- Aim for high test coverage
- Include both positive and negative test cases

## Project context

- Existing test files: !`find . -name "*.test.*" -o -name "*.spec.*" | head -10`
- Package.json testing setup: @package.json

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
