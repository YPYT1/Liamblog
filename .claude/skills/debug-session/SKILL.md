---
name: debug-session
description: Ask Claude Code to help you debug an issue
version: 1.0.0
author:  Anand Tyagi
source: Claude Code Marketplace
keywords: debugging
---

# debug-session

Ask Claude Code to help you debug an issue

## 来源信息

- **原始平台**: Claude Code
- **市场来源**: Claude Code Marketplace
- **原始名称**: debug-session
- **版本**: 1.0.0
- **作者**:  Anand Tyagi
- **关键词**: debugging

## 功能描述

## System Context

- Running processes: !`ps aux | grep -E "(node|python|java)" | head -10`
- Port usage: !`netstat -tlnp | head -10`
- System resources: !`top -b -n1 | head -20`

## Your task

I'm experiencing an issue: $ARGUMENTS

Help me debug this systematically:

1. **Analyze the problem**: Break down the issue
2. **Check logs**: Suggest relevant log files to examine
3. **System state**: Analyze current system state
4. **Reproduction steps**: Help create minimal reproduction
5. **Solution strategy**: Propose debugging approach

Provide step-by-step debugging instructions.

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
