---
name: explore
description: Helps Claude read a planning document and explore related files to get familiar with a topic. Asking Claude to prepare to discuss seems to work better than asking it to prepare to do specific work....
version: 1.0.0
author: Galen Ward
source: Claude Code Marketplace
keywords: explore
---

# explore

Helps Claude read a planning document and explore related files to get familiar with a topic. Asking Claude to prepare to discuss seems to work better than asking it to prepare to do specific work....

## 来源信息

- **原始平台**: Claude Code
- **市场来源**: Claude Code Marketplace
- **原始名称**: explore
- **版本**: 1.0.0
- **作者**: Galen Ward
- **关键词**: explore

## 功能描述

$ARGUMENTS
Read claude-checklists/DESCRIPTION-OF-THIS-AREA-OF-YOUR-SYSTEM.md and claude-checklists/CURRENT-PROJECT.md.
Read through related code.
Do not write any code right now. 
Conduct review, read relevant files and tests for the project and prepare to discuss this part of the codebase.

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
