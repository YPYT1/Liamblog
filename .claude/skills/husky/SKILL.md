---
name: husky
description: Sets up and manages Husky Git hooks by configuring pre-commit hooks, establishing commit message standards, integrating with linting tools, and ensuring code quality on commits.
version: 1.0.0
author: evmts
source: Claude Code Marketplace
keywords: claude-code,ai,assistant
---

# husky

Sets up and manages Husky Git hooks by configuring pre-commit hooks, establishing commit message standards, integrating with linting tools, and ensuring code quality on commits.

## 来源信息

- **原始平台**: Claude Code
- **市场来源**: Claude Code Marketplace
- **原始名称**: husky
- **版本**: 1.0.0
- **作者**: evmts
- **关键词**: 无

## 功能描述

# Repository Health Verification Protocol

This command outlines a comprehensive protocol for verifying and maintaining a repository's health.

## Key Goals
- Verify repo is in a working state
- Run CI checks
- Fix any identified issues
- Prepare files for staging

## Main Steps
1. Update dependencies with `pnpm i`
2. Run linter checks
3. Verify builds and types
4. Run test coverage
5. Sort package.json
6. Lint packages
7. Double-check all previous steps
8. Stage files (avoiding git submodules)

## Error Handling Protocol
1. Explain why something broke
2. Propose and implement a fix
3. Check for similar issues elsewhere
4. Clean up debugging code

## Important Guidelines
- Never commit, only stage files
- Run tests package-by-package
- Be willing to make necessary fixes
- Use typescript and tests as safeguards

The document emphasizes a methodical approach to maintaining code quality and resolving issues systematically.

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
