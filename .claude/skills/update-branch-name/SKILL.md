---
name: update-branch-name
description: Updates branch names with proper prefixes and formats, enforcing naming conventions, supporting semantic prefixes, and managing remote branch updates.
version: 1.0.0
author: giselles-ai
source: Claude Code Marketplace
keywords: claude-code,ai,assistant
---

# update-branch-name

Updates branch names with proper prefixes and formats, enforcing naming conventions, supporting semantic prefixes, and managing remote branch updates.

## 来源信息

- **原始平台**: Claude Code
- **市场来源**: Claude Code Marketplace
- **原始名称**: update-branch-name
- **版本**: 1.0.0
- **作者**: giselles-ai
- **关键词**: 无

## 功能描述

# Update Branch Name

Follow these steps to update the current branch name:

1. Check differences between current branch and main branch HEAD using `git diff main...HEAD`
2. Analyze the changed files to understand what work is being done
3. Determine an appropriate descriptive branch name based on the changes
4. Update the current branch name using `git branch -m [new-branch-name]`
5. Verify the branch name was updated with `git branch`

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
