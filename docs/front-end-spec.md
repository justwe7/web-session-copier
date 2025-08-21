# Incognito Session Bridge UI/UX Specification

## 1. Introduction

[cite_start]This document defines the user experience goals, information architecture, user flows, and visual design specifications for the Incognito Session Bridge's user interface. [cite: 676] [cite_start]It serves as the foundation for visual design and frontend development, ensuring a cohesive and user-centered experience. [cite: 677]

### Overall UX Goals & Principles

* **Target User Personas**
    * [cite_start]**Primary (Technical & Support Staff)**: Developers, QA testers, and support agents who need an extremely fast and efficient way to debug and test across different user sessions. [cite: 681]
    * **Secondary (Multi-Account Managers)**: Marketers and power users who need a simple way to switch between different accounts on the same platform without repeated logins.
* **Usability Goals**
    * [cite_start]**Efficiency**: The core workflow of copying and applying a session should be completable in under 10 seconds. [cite: 683]
    * **Learnability**: A new user should understand how to use the tool's core functionality within their first interaction, without needing a tutorial.
    * **Error Prevention**: The interface should guide users to prevent mistakes, such as applying a session to the wrong website.
* **Design Principles**
    1.  [cite_start]**Efficiency Above All**: Every design choice must prioritize the speed of the core workflow. [cite: 684]
    2.  **Clarity and Simplicity**: The interface must be immediately understandable. [cite_start]No cleverness, no ambiguity. [cite: 684]
    3.  [cite_start]**Provide Immediate Feedback**: Every user action must result in a clear, immediate, and understandable response from the interface. [cite: 685]

---
## 2. 信息架构 (Information Architecture)

### 站点地图 / 界面清单 (Site Map / Screen Inventory)

由于这是一个功能高度聚焦的工具，其界面架构极其简单，仅包含一个核心界面。

```mermaid
graph TD
    A[插件弹出窗口] --> B[核心操作区];
    B --> C[复制会话];
    B --> D[应用会话];
    B --> E[状态反馈区];
导航结构 (Navigation Structure)

主导航 (Primary Navigation): 不适用。本插件仅由一个无导航的单一视图构成。 


次级导航 (Secondary Navigation): 不适用。 


面包屑 (Breadcrumb Strategy): 不适用。 

3. 用户流程 (User Flows)
流程 1: 复制 (导出) 会话

用户目标: 将当前网站的会话数据安全地复制到剪贴板。 


入口: 用户在已登录的网站页面上，点击浏览器工具栏中的插件图标。 


成功标准: 包含会话数据的JSON字符串被存入用户剪贴板，同时用户在界面上看到清晰的成功反馈。 

流程图:

代码段

graph TD
    A(用户点击插件图标) --> B{弹出窗口出现};
    B --> C(用户点击 "复制会话" 按钮);
    C --> D[插件读取 Cookies & Storage];
    D --> E[插件将数据打包成JSON];
    E --> F[插件将JSON写入剪贴板];
    F --> G[UI显示 "复制成功!" 提示];
    G --> H(提示在几秒后消失);
边缘情况 & 错误处理:

剪贴板权限失败: 如果浏览器安全策略阻止了剪贴板写入，UI应显示错误提示：“无法访问剪贴板，请检查浏览器权限。”

无会话数据: 如果用户在一个没有登录信息的页面（如新标签页）尝试复制，按钮可以置灰或给出提示：“当前页面无可复制的会话。”

流程 2: 应用 (导入) 会话

用户目标: 将剪贴板中的会话数据应用到当前网站，以恢复登录状态。 


入口: 用户在剪贴板中存有会话数据的情况下，在目标网站（通常是未登录状态）的页面上，点击插件图标。 


成功标准: 会话数据被成功注入页面。用户手动刷新页面后，网站呈现为登录状态。 

流程图:

代码段

graph TD
    A(用户点击插件图标) --> B{弹出窗口出现};
    B --> C(用户点击 "应用会话" 按钮);
    C --> D[插件从剪贴板读取数据];
    D --> E{数据是有效的会话JSON吗?};
    E -- 否 --> F[UI显示 "剪贴板数据格式无效" 错误];
    E -- 是 --> G[插件应用 Cookies & Storage];
    G --> H[UI显示 "应用成功! 请刷新页面" 提示];
    H --> I(提示在几秒后消失);
边缘情况 & 错误处理:


剪贴板数据无效: 如果剪贴板中的内容不是预期的JSON格式，UI应明确提示错误。 


权限不足: 如果插件没有权限修改当前站点的Cookie，UI应显示错误提示：“无法应用会话，请检查插件权限。” 

4. 线框图与模型 (Wireframes & Mockups)
设计文件 (Design Files)

主要设计文件: 对于MVP阶段，我们将依赖下方描述的低保真线框图进行开发。如果未来需要高保真视觉稿，将在Figma中创建并在此处提供链接。 

核心界面布局 (Key Screen Layouts)

界面名称: 插件弹出窗口 (Extension Popup) 


目的: 为用户提供“复制”和“应用”会话的核心功能，并给予清晰的操作反馈。 

关键元素:

标题: "Incognito Session Bridge"

主操作区:

一个清晰的主按钮: "Copy Session"

另一个同样清晰的主按钮: "Apply Session"

状态反馈区: 默认隐藏，在用户操作后显示反馈信息（如“复制成功！”）。

(可选建议): 一个小问号图标或“帮助”链接，点击后可显示关于安全风险和使用方法的简短说明。

交互说明:

按钮应有明确的悬停（hover）和点击（active）状态。 

点击按钮后，应有短暂的加载状态，然后显示成功或失败的信息。 

状态反馈信息可以使用颜色进行区分（如绿色代表成功，红色代表失败）。 

5. 组件库 / 设计系统 (Component Library / Design System)
设计系统方法 (Design System Approach)
对于MVP阶段，我们不会引入外部的重量级组件库（如MUI, Ant Design）或构建一个正式的设计系统（如使用Storybook）。相反，我们将采用一种更轻量的方法：

在项目内部创建一套小型的、可复用的、高度定制化的React组件。所有组件将使用Tailwind CSS进行样式设置，确保视觉一致性和开发效率。 

核心组件 (Core Components)
组件名称: ActionButton


目的: 用于“复制”和“应用”这两个核心操作的可复用按钮。 


变体 (Variants): 主要操作按钮、禁用状态按钮。 


状态 (States): 默认 (default), 悬停 (hover), 点击 (active/pressed), 禁用 (disabled), 加载中 (loading)。 


使用指南: 用于弹出窗口中所有主要的号召性操作（call-to-action）。 

组件名称: StatusBar


目的: 用于向用户显示操作反馈信息（如“复制成功”）。 


变体 (Variants): 成功 (success), 失败 (error), 提示 (info)。 


状态 (States): 显示 (visible), 隐藏 (hidden)。 


使用指南: 在用户操作后出现，提供反馈，并在短暂延迟后自动消失。 

组件名称: PopupContainer


目的: 作为插件弹出窗口的根容器，负责整体布局。 


变体 (Variants): 无。 


状态 (States): 无。 


使用指南: 承载ActionButton和StatusBar等所有其他组件。 

6. 品牌与风格指南 (Branding & Style Guide)
视觉识别 (Visual Identity)

品牌指南: 暂无。我们将遵循以下定义的基本、功能性风格。 

色板 (Color Palette)
类型	Hex色值	用途
主色 (Primary)	#3B82F6	主要按钮、焦点元素
成功 (Success)	#22C55E	成功状态的反馈信息
失败 (Error)	#EF4444	失败状态的反馈信息
中性色 (Neutral)	#6B7280 (Text), #F3F4F6 (BG)	正文文本、边框、背景

导出到 Google 表格
字体 (Typography)
字体族:


主字体: System UI Font Stack (使用操作系统默认字体，如Segoe UI, San Francisco, Roboto)。这能确保最佳性能和原生感。 


等宽字体: System Monospace Font Stack (用于显示任何代码或技术文本)。 

字号层级:


标题 (H1): 18px (1.125rem), semi-bold 


正文 (Body): 14px (0.875rem), regular 


小字 (Small): 12px (0.75rem), regular 

图标 (Iconography)

图标库: Heroicons。这是一个由Tailwind CSS团队设计的开源图标库，风格简洁，与我们的设计方向完美匹配。 


使用指南: 图标应作为SVG组件直接使用，以保证清晰度和性能。 

间距与布局 (Spacing & Layout)

间距体系: 我们将严格遵循Tailwind CSS的默认间距体系（基于4px网格）。这将确保所有元素之间的间距保持一致和协调。 

7. 无障碍设计要求 (Accessibility Requirements)
合规目标 (Compliance Target)
Standard: Our goal is to meet the WCAG 2.1 AA standard. As we've discussed, while we aim for this standard, complete and robust keyboard-only navigation will be treated as a post-MVP enhancement. 

核心要求 (Key Requirements)
视觉 (Visual):


色彩对比度: 所有文本和交互元素（如按钮）的背景/前景色彩对比度必须至少达到 4.5:1，以确保可读性。 


焦点指示器: 所有可交互的元素在通过键盘（或替代输入方式）获得焦点时，必须有清晰可见的视觉指示（例如，轮廓线）。 

交互 (Interaction):


屏幕阅读器支持: 弹出窗口的标题、按钮和状态反馈信息必须能被屏幕阅读器正确地读取和播报。 按钮应包含描述性的 aria-label。 

内容 (Content):


图标: 所有功能性图标必须提供等效的文本描述（例如，通过 aria-label）。 


标题结构: 弹出窗口应使用正确的标题层级（例如，用一个 <h1> 作为主标题）。 

测试策略 (Testing Strategy)
我们将结合使用自动化工具（如Axe DevTools）和手动测试来验证无障碍性。手动测试将包括检查色彩对比度和验证核心流程的屏幕阅读器播报是否清晰准确。 

8. 响应式策略 (Responsiveness Strategy)
断点 (Breakpoints)
不适用 (N/A)。 

适配模式 (Adaptation Patterns)
不适用 (N/A)。 

9. 动画与微交互 (Animation & Micro-interactions)
动效原则 (Motion Principles)

功能性与极简主义: 动画应具有明确的功能目的，主要用于提供操作反馈或平滑状态过渡。所有动效都必须保持简约，避免引起用户分心或增加等待时间。动效必须是高性能的，并尊重用户的系统设置（如 prefers-reduced-motion）。 

关键动画 (Key Animations)

按钮反馈: 当用户点击ActionButton时，按钮应有一个微妙的视觉变化（例如，轻微缩小或颜色加深），以即时确认点击已被接收。 


状态信息过渡: 成功或失败的StatusBar信息不应突然出现和消失，而应使用柔和的淡入淡出（fade in/out）效果，使体验更平滑。 

加载状态: 点击按钮后，在执行后台操作的短暂时间内（通常小于500毫秒），按钮可以显示一个加载中的状态（例如，一个微小的旋转图标），以告知用户系统正在处理。

10. 性能考量 (Performance Considerations)
性能目标 (Performance Goals)

加载速度 (Load Time): 插件弹出窗口的界面必须在200毫秒内完成渲染，实现“即时”打开的体验。 


交互响应 (Interaction Response): 所有用户交互（如按钮点击）必须在100毫秒内提供视觉反馈。 


动画帧率 (Animation FPS): 所有动画效果必须维持在每秒60帧（FPS），以保证流畅不卡顿。 

达成目标的设计策略 (Design Strategies)

极简设计: 我们有意地保持了UI的极简主义，限制了DOM元素的数量，以确保最快的渲染速度。 


无自定义字体: 我们选择使用系统字体，从而消除了加载网络字体所需的时间和性能开销。 


优化的图标: 我们将使用内联SVG作为图标，这是性能最高、伸缩性最好的方案。 


无媒体资源: 设计中不包含任何位图（raster images）、视频或其他会拖慢加载速度的媒体文件。 

11. 后续步骤 (Next Steps)
立即行动项 (Immediate Actions)

批准文档: 请您对这份完整的UI/UX规格说明进行最终审核和批准。 


移交架构师: 将此文档与PRD一同移交给架构师（Architect）角色，以开始创建详细的前端架构文档 (front-end-architecture.md)。 


（可选）高保真设计: 如果开发团队认为需要，可以基于本文档中的线框图和风格指南，在Figma等工具中创建高保真视觉稿。 

设计移交清单 (Design Handoff Checklist)
以下清单确认了本UI/UX规格说明已包含移交给架构和开发阶段所需的全部核心要素：

[x] 所有用户流程均已文档化 

[x] 核心组件清单已完成 

[x] 无障碍设计要求已定义 

[x] 响应式策略已明确 

[x] 品牌指南已包含 

[x] 性能目标已建立 