# Requirements Document

## Introduction

将现有 Docusaurus 博客主题改造为液态玻璃（Liquid Glass）风格，融合 Notion 的极简设计理念。整体设计追求高留白、非衬线字体、细腻边框，所有组件应用毛玻璃效果。Hero 区域实现基于 WebGL/Canvas 的动态流体背景，支持鼠标交互产生波动效果。同时增强博客功能，包括 LaTeX/Mermaid 渲染、标签过滤、用户登录、点赞评论和留言箱功能。

## Requirements

### Requirement 1: 液态玻璃视觉设计系统

**User Story:** As a 访客, I want 看到统一的液态玻璃风格界面, so that 获得现代、精致的视觉体验。

#### Acceptance Criteria

1. THE Design_System SHALL apply `backdrop-blur-md` and `border-white/20` to all card and panel components
2. THE Design_System SHALL use non-serif fonts (MiSans) with high whitespace ratio following Notion style
3. THE Design_System SHALL implement subtle borders (1px or less) with low opacity
4. WHEN dark mode is active, THE Design_System SHALL adjust glass opacity and blur intensity appropriately
5. THE Design_System SHALL define a color palette with 4 primary colors for fluid animation

### Requirement 2: Hero 区域动态流体背景

**User Story:** As a 访客, I want 在首页看到动态流动的背景效果, so that 获得沉浸式的视觉体验。

#### Acceptance Criteria

1. THE Hero_Component SHALL render a WebGL or Canvas based fluid animation
2. THE Fluid_Animation SHALL smoothly blend and flow between 4 defined colors
3. WHEN user moves mouse over Hero area, THE Fluid_Animation SHALL produce ripple and distortion effects at cursor position
4. THE Fluid_Animation SHALL maintain 60fps performance on modern browsers
5. THE Hero_Component SHALL gracefully degrade on devices without WebGL support

### Requirement 3: 博客内容系统

**User Story:** As a 博主, I want 在 blog 目录下编写 Markdown 文件发布博客, so that 方便地管理和发布内容。

#### Acceptance Criteria

1. WHEN a Markdown file is placed in `blog/` directory with proper frontmatter, THE Blog_System SHALL automatically publish it
2. THE Markdown_Renderer SHALL support LaTeX math formulas using KaTeX or MathJax
3. THE Markdown_Renderer SHALL support Mermaid diagrams for flowcharts
4. THE Markdown_Renderer SHALL provide syntax highlighting for code blocks
5. THE Blog_List SHALL support filtering articles by tags

### Requirement 4: 用户认证系统

**User Story:** As a 访客, I want 登录账户, so that 可以进行点赞、评论和留言操作。

#### Acceptance Criteria

1. THE Auth_System SHALL provide login/register functionality
2. THE Auth_System SHALL support OAuth providers (GitHub, Google) or email login
3. WHEN user is not logged in, THE System SHALL disable like, comment, and message features
4. THE Auth_System SHALL persist user session securely

### Requirement 5: 点赞与评论功能

**User Story:** As a 登录用户, I want 对文章点赞和评论, so that 可以与博主和其他读者互动。

#### Acceptance Criteria

1. WHEN logged-in user clicks like button, THE Like_System SHALL provide instant visual feedback
2. THE Like_System SHALL persist like count and prevent duplicate likes from same user
3. THE Comment_System SHALL display comments in a threaded list format
4. WHEN logged-in user submits comment, THE Comment_System SHALL add it to the list immediately
5. IF user is not logged in, THEN THE System SHALL prompt login before allowing interaction

### Requirement 6: 留言箱功能

**User Story:** As a 登录用户, I want 在独立页面留言, so that 可以与博主进行非文章相关的交流。

#### Acceptance Criteria

1. THE Guestbook_Page SHALL be accessible from navigation
2. WHEN logged-in user submits message, THE Guestbook SHALL display it in the list
3. IF user is not logged in, THEN THE Guestbook SHALL prompt login
4. THE Guestbook SHALL display messages with user avatar, name, and timestamp

### Requirement 7: 全站液态玻璃一致性

**User Story:** As a 访客, I want 在所有页面看到一致的液态玻璃风格, so that 获得统一的品牌体验。

#### Acceptance Criteria

1. THE Navbar SHALL apply glass effect with blur and transparency
2. THE Footer SHALL apply glass effect consistent with overall design
3. THE Sidebar SHALL apply glass effect on docs and blog pages
4. THE Card_Components SHALL apply glass effect on project, friend, and blog list pages
5. THE Modal_Components SHALL apply glass effect for dialogs and popups
