---
name: 2-commit-fast
description: Automates git commit process by selecting the first suggested message, generating structured commits with consistent formatting while skipping manual confirmation and removing Claude co-Contributor...
version: 1.0.0
author: steadycursor
source: Claude Code Marketplace
keywords: claude-code,ai,assistant
---

# 2-commit-fast

Automates git commit process by selecting the first suggested message, generating structured commits with consistent formatting while skipping manual confirmation and removing Claude co-Contributor...

## 来源信息

- **原始平台**: Claude Code
- **市场来源**: Claude Code Marketplace
- **原始名称**: 2-commit-fast
- **版本**: 1.0.0
- **作者**: steadycursor
- **关键词**: 无

## 功能描述

# Create new fast commit task

This task uses the same logic as the commit task (.claude/commands/commit.md) but automatically selects the first suggested commit message without asking for confirmation.

- Generate 3 commit message suggestions following the same format as the commit task
- Automatically use the first suggestion without asking the user
- Immediately run `git commit -m` with the first message
- All other behaviors remain the same as the commit task (format, package names, staged files only)
- Do NOT add Claude co-authorship footer to commits

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
