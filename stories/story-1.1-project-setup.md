# Story 1.1: 项目设置与UI骨架搭建

## Story
**As a** 开发者  
**I want** 建立一个基于Plasmo框架的、集成了React, TypeScript和Tailwind CSS的新项目  
**so that** 我有一个标准化的、可运行的基础框架，以及一个包含了基础UI元素的弹出窗口，为后续功能开发做准备。

## Acceptance Criteria
- [ ] 新的Plasmo项目被成功创建，并能在Chrome浏览器的开发者模式下正确加载和运行
- [ ] 插件的弹出窗口(Popup) UI能正确显示，其中包含两个按钮："复制会话"和"应用会话"
- [ ] Tailwind CSS被成功集成，能够通过utility classes为UI元素添加样式
- [ ] 项目的文件结构遵循Plasmo框架的最佳实践

## Dev Notes
### 技术要求
- **框架**: Plasmo (最新版本)
- **UI库**: React + TypeScript
- **样式**: Tailwind CSS
- **目标浏览器**: Chrome (开发者模式)

### 项目结构参考
```
incognito-session-bridge/
├── .plasmo/              # 自动生成的构建目录 (请勿修改)
├── assets/
│   └── icon.png          # 扩展图标 (128x128)
├── components/
│   ├── ActionButton.tsx  # 可复用的按钮组件
│   └── StatusBar.tsx     # 用户反馈组件
├── lib/
│   └── sessionManager.ts # 会话管理核心逻辑
├── popup.tsx             # 扩展弹窗主UI组件
├── package.json
└── tsconfig.json
```

### UI设计要求
- 弹出窗口标题: "Incognito Session Bridge"
- 两个主要按钮: "Copy Session" 和 "Apply Session"
- 简洁专业的开发者工具风格
- 使用Tailwind CSS实现样式

## Tasks
- [ ] 初始化 Plasmo 项目
  - [ ] 安装 Plasmo CLI
  - [ ] 创建新的 Plasmo 项目
  - [ ] 配置 TypeScript 和 Tailwind CSS
- [ ] 创建基础项目结构
  - [ ] 创建 `components/` 目录
  - [ ] 创建 `lib/` 目录
  - [ ] 添加项目图标到 `assets/`
- [ ] 实现弹出窗口UI
  - [ ] 创建 `popup.tsx` 主界面
  - [ ] 实现 `ActionButton` 组件
  - [ ] 实现基础布局和样式
- [ ] 配置和测试
  - [ ] 配置 Chrome 扩展清单
  - [ ] 在开发者模式下加载测试
  - [ ] 验证弹窗正确显示

## Testing
- [ ] 手动测试：在Chrome开发者模式下加载插件
- [ ] 验证弹窗UI正确显示
- [ ] 确认按钮样式和布局符合设计要求

## Definition of Done
- [ ] 项目可以在Chrome开发者模式下成功加载
- [ ] 弹出窗口显示正确，包含所需的UI元素
- [ ] 代码遵循TypeScript和React最佳实践
- [ ] Tailwind CSS正确集成并应用样式
- [ ] 项目结构符合Plasmo框架约定

## File List
*将在开发过程中更新*

## Change Log
| 日期 | 变更 | 作者 |
|------|------|------|
| 2025-01-XX | 创建故事 | BMad Master |

## Status
Approved

---

## Dev Agent Record
*开发代理执行记录将在实施时填写*

### Agent Model Used
*待填写*

### Debug Log References
*待填写*

### Completion Notes
*待填写*
