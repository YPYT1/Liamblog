---
name: update-claudemd
description: Automatically update CLAUDE.md file based on recent code changes
version: 1.0.0
author:  Anand Tyagi
source: Claude Code Marketplace
keywords: code-review
---

# update-claudemd

Automatically update CLAUDE.md file based on recent code changes

## 来源信息

- **原始平台**: Claude Code
- **市场来源**: Claude Code Marketplace
- **原始名称**: update-claudemd
- **版本**: 1.0.0
- **作者**:  Anand Tyagi
- **关键词**: code-review

## 功能描述

# Update Claude.md File

## Current Claude.md State
@CLAUDE.md

## Git Analysis

### Current Repository Status
!`git status --porcelain`

### Recent Changes (Last 10 commits)
!`git log --oneline -10`

### Detailed Recent Changes
!`git log --since="1 week ago" --pretty=format:"%h - %an, %ar : %s" --stat`

### Recent Diff Analysis
!`git diff HEAD~5 --name-only | head -20`

### Detailed Diff of Key Changes
!`git diff HEAD~5 -- "*.js" "*.ts" "*.jsx" "*.tsx" "*.py" "*.md" "*.json" | head -200`

### New Files Added
!`git diff --name-status HEAD~10 | grep "^A" | head -15`

### Deleted Files
!`git diff --name-status HEAD~10 | grep "^D" | head -10`

### Modified Core Files
!`git diff --name-status HEAD~10 | grep "^M" | grep -E "(package\.json|README|config|main|index|app)" | head -10`

## Project Structure Changes
!`find . -name "*.md" -not -path "./node_modules/*" -not -path "./.git/*" | head -10`

## Configuration Changes
!`git diff HEAD~10 -- package.json tsconfig.json webpack.config.js next.config.js .env* docker* | head -100`

## API/Route Changes  
!`git diff HEAD~10 -- "**/routes/**" "**/api/**" "**/controllers/**" | head -150`

## Database/Model Changes
!`git diff HEAD~10 -- "**/models/**" "**/schemas/**" "**/migrations/**" | head -100`

## Your Task

Based on the current CLAUDE.md content and all the git analysis above, create an updated CLAUDE.md file that:

## 1. Preserves Important Existing Content
- Keep the core project description and architecture
- Maintain important setup instructions
- Preserve key architectural decisions and patterns
- Keep essential development workflow information

## 2. Integrates Recent Changes
Analyze the git diff and logs to identify:
- **New Features**: What new functionality was added?
- **API Changes**: New endpoints, modified routes, updated parameters
- **Configuration Updates**: Changes to build tools, dependencies, environment variables
- **File Structure Changes**: New directories, moved files, deleted components
- **Database Changes**: New models, schema updates, migrations
- **Bug Fixes**: Important fixes that affect how the system works
- **Refactoring**: Significant code reorganization or architectural changes

## 3. Updates Key Sections
Intelligently update these CLAUDE.md sections:

### Project Overview
- Update description if scope changed
- Note new technologies or frameworks added
- Update version information

### Architecture
- Document new architectural patterns
- Note significant structural changes
- Update component relationships

### Setup Instructions  
- Add new environment variables
- Update installation steps if dependencies changed
- Note new configuration requirements

### API Documentation
- Add new endpoints discovered in routes
- Update existing endpoint documentation
- Note authentication or parameter changes

### Development Workflow
- Update based on new scripts in package.json
- Note new development tools or processes
- Update testing procedures if changed

### Recent Changes Section
Add a "Recent Updates" section with:
- Summary of major changes from git analysis
- New features and their impact
- Important bug fixes
- Breaking changes developers should know about

### File Structure
- Update directory explanations for new folders
- Note relocated or reorganized files
- Document new important files

## 4. Smart Content Management
- **Don't duplicate**: Avoid repeating information already well-documented
- **Prioritize relevance**: Focus on changes that affect how developers work with the code
- **Keep it concise**: Summarize rather than listing every small change
- **Maintain structure**: Follow existing CLAUDE.md organization
- **Add timestamps**: Note when major updates were made

## 5. Output Format
Provide the complete updated CLAUDE.md content, organized as:

```markdown
# Project Name

## Overview
[Updated project description]

## Architecture
[Updated architecture information]

## Setup & Installation
[Updated setup instructions]

## Development Workflow
[Updated development processes]

## API Documentation
[Updated API information]

## File Structure
[Updated directory explanations]

## Recent Updates (Updated: YYYY-MM-DD)
[Summary of recent changes]

## Important Notes
[Key information for developers]

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
