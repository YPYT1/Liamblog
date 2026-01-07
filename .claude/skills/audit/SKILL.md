---
name: audit
description: Perform security audit on codebase
version: 1.0.0
author:  Anand Tyagi
source: Claude Code Marketplace
keywords: code-review, security
---

# audit

Perform security audit on codebase

## 来源信息

- **原始平台**: Claude Code
- **市场来源**: Claude Code Marketplace
- **原始名称**: audit
- **版本**: 1.0.0
- **作者**:  Anand Tyagi
- **关键词**: code-review, security

## 功能描述

## Context

- Package.json dependencies: @package.json
- Environment files: !`find . -name ".env*" -o -name "config.*" | head -10`
- Potential security files: !`find . -name "*secret*" -o -name "*key*" -o -name "*password*" | head -10`

## Your task

Perform a security audit focusing on:

1. **Dependency vulnerabilities**: Check for known CVEs
2. **Authentication/Authorization**: Review auth implementations
3. **Input validation**: Check for injection vulnerabilities
4. **Data exposure**: Look for sensitive data leaks
5. **Configuration security**: Review security configurations
6. **Secrets management**: Ensure proper secret handling

Target: $ARGUMENTS (if specified, otherwise audit entire codebase)

Provide prioritized findings with remediation steps.

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
