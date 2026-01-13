# Implementation Plan: Liquid Glass Theme

## Overview

将 Docusaurus 博客改造为液态玻璃风格，分阶段实现设计系统、核心组件、WebGL 动画、内容增强功能。

## Tasks

- [x] 1. 设计系统基础
  - [x] 1.1 创建 Design Tokens 配置文件
    - 在 `src/theme/tokens.ts` 定义颜色、字体、间距、毛玻璃效果参数
    - 定义 4 色流体动画色板 (Indigo, Violet, Pink, Cyan)
    - _Requirements: 1.1, 1.5_

  - [x] 1.2 更新全局 CSS 变量
    - 修改 `src/css/custom.css` 添加 CSS 变量
    - 配置 MiSans 字体
    - 设置高留白间距
    - _Requirements: 1.2, 1.3_

  - [x] 1.3 配置 Tailwind 扩展
    - 更新 `tailwind.config.ts` 添加自定义颜色和毛玻璃工具类
    - _Requirements: 1.1, 1.4_

- [x] 2. 核心玻璃组件
  - [x] 2.1 创建 GlassCard 基础组件
    - 在 `src/components/Glass/GlassCard.tsx` 实现毛玻璃卡片
    - 应用 `backdrop-blur-md` 和 `border-white/20`
    - 实现稳定的 hover 效果（无 scale）
    - _Requirements: 1.1, 7.4_

  - [x] 2.2 改造 Navbar 为 Floating Glass 样式
    - 修改 `src/theme/Navbar/Layout/index.tsx`
    - 添加 `fixed top-4 left-4 right-4` 定位
    - 应用毛玻璃效果
    - _Requirements: 7.1_

  - [x] 2.3 改造 Footer 为 Glass 样式
    - 修改 Footer 组件应用毛玻璃效果
    - _Requirements: 7.2_

  - [x] 2.4 改造 Sidebar 为 Glass 样式
    - 修改 BlogSidebar 和 DocSidebar 组件
    - _Requirements: 7.3_

  - [x] 2.5 改造博客列表卡片为 Glass 样式
    - 修改 `src/theme/BlogPostGridItems` 组件
    - _Requirements: 7.4_

- [x] 3. Checkpoint - 确保基础组件正常工作
  - 运行 `pnpm build` 确保无编译错误
  - 本地预览检查 Light/Dark 模式下的毛玻璃效果

- [x] 4. Hero WebGL 流体背景
  - [x] 4.1 创建 FluidBackground WebGL 组件
    - 在 `src/components/FluidBackground/index.tsx` 实现
    - 使用 WebGL shader 实现流体效果
    - 4 色渐变流动动画
    - _Requirements: 2.1, 2.2_

  - [x] 4.2 实现鼠标交互效果
    - 监听鼠标移动事件
    - 在鼠标位置产生波动和扭曲效果
    - _Requirements: 2.3_

  - [x] 4.3 实现 CSS 降级方案
    - 检测 WebGL 支持
    - 不支持时使用 CSS 渐变动画
    - _Requirements: 2.5_

  - [x] 4.4 集成到首页 Hero 区域
    - 修改 `src/pages/index.tsx` 添加 FluidBackground
    - _Requirements: 2.1_

- [x] 5. Checkpoint - 确保 WebGL 动画正常工作
  - 测试流体动画在不同浏览器的表现
  - 测试鼠标交互效果
  - 测试 WebGL 降级方案

- [x] 6. 内容渲染增强
  - [x] 6.1 集成 KaTeX 支持 LaTeX 公式
    - 安装 `remark-math` 和 `rehype-katex`
    - 配置 `docusaurus.config.ts`
    - _Requirements: 3.2_

  - [x] 6.2 集成 Mermaid 支持流程图
    - 安装 `@docusaurus/theme-mermaid`
    - 配置 `docusaurus.config.ts`
    - _Requirements: 3.3_

  - [x] 6.3 优化代码块样式
    - 更新代码块 CSS 应用毛玻璃效果
    - _Requirements: 3.4_

- [x] 7. 用户交互功能（可选）
  - [x] 7.1 集成 Giscus 评论系统
    - 配置 GitHub Discussions 作为评论后端（已存在）
    - 创建评论组件
    - _Requirements: 4.1, 5.3, 5.4_

  - [x] 7.2 创建留言箱页面
    - 在 `src/pages/guestbook/index.tsx` 创建页面
    - 添加导航链接
    - _Requirements: 6.1, 6.2, 6.4_

- [x] 8. 响应式和无障碍优化
  - [x] 8.1 响应式布局优化
    - 测试 320px, 768px, 1024px, 1440px 断点
    - 修复移动端布局问题
    - _Requirements: 7.1-7.5_

  - [x] 8.2 无障碍优化
    - 确保对比度 >= 4.5:1
    - 添加 `prefers-reduced-motion` 支持
    - _Requirements: 2.4, 2.5_

- [x] 9. Final Checkpoint - 全面测试
  - 运行 `pnpm build` 确保生产构建成功
  - 测试 Light/Dark 模式
  - 测试所有页面的毛玻璃效果一致性
  - 测试 WebGL 性能

## Notes

- 任务 7 (用户交互功能) 标记为可选，可根据需要跳过
- 每个 Checkpoint 后应确认功能正常再继续
- 遵循 ui-ux-pro-max 规范：无 emoji 图标、稳定 hover、cursor-pointe