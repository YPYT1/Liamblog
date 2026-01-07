---
name: claude-desktop-extension
description: This command provides the context necessary for Claude Code to create the Desktop Extension or .dxt file of an MCP.
version: 1.0.0
author:  Anand Tyagi
source: Claude Code Marketplace
keywords: workflow
---

# claude-desktop-extension

This command provides the context necessary for Claude Code to create the Desktop Extension or .dxt file of an MCP.

## 来源信息

- **原始平台**: Claude Code
- **市场来源**: Claude Code Marketplace
- **原始名称**: claude-desktop-extension
- **版本**: 1.0.0
- **作者**:  Anand Tyagi
- **关键词**: workflow

## 功能描述

I want to build this as a Desktop Extension, abbreviated as "DXT". Please follow these steps:

1. **Read the specifications thoroughly:**
   - https://github.com/anthropics/dxt/blob/main/README.md - DXT architecture overview, capabilities, and integration patterns
   - https://github.com/anthropics/dxt/blob/main/MANIFEST.md - Complete extension manifest structure and field definitions
   - https://github.com/anthropics/dxt/tree/main/examples - Reference implementations including a "Hello World" example

2. **Create a proper extension structure:**
   - Generate a valid manifest.json following the MANIFEST.md spec
   - Implement an MCP server using @modelcontextprotocol/sdk with proper tool definitions
   - Include proper error handling and timeout management

3. **Follow best development practices:**
   - Implement proper MCP protocol communication via stdio transport
   - Structure tools with clear schemas, validation, and consistent JSON responses
   - Make use of the fact that this extension will be running locally
   - Add appropriate logging and debugging capabilities
   - Include proper documentation and setup instructions

4. **Test considerations:**
   - Validate that all tool calls return properly structured responses
   - Verify manifest loads correctly and host integration works

Generate complete, production-ready code that can be immediately tested. Focus on defensive programming, clear error messages, and following the exact
DXT specifications to ensure compatibility with the ecosystem.

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
