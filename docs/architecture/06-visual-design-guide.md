# 视觉设计指南

## 品牌与风格指南

### 视觉识别 (Visual Identity)

**品牌指南**: 暂无。我们将遵循以下定义的基本、功能性风格。

### 色板 (Color Palette)

| 类型 | Hex色值 | 用途 |
| :--- | :--- | :--- |
| 主色 (Primary) | #3B82F6 | 主要按钮、焦点元素 |
| 成功 (Success) | #22C55E | 成功状态的反馈信息 |
| 失败 (Error) | #EF4444 | 失败状态的反馈信息 |
| 中性色 (Neutral) | #6B7280 (Text), #F3F4F6 (BG) | 正文文本、边框、背景 |

### 字体 (Typography)

#### 字体族:

- **主字体**: System UI Font Stack (使用操作系统默认字体，如 Segoe UI, San Francisco, Roboto)。这能确保最佳性能和原生感。
- **等宽字体**: System Monospace Font Stack (用于显示任何代码或技术文本)。

#### 字号层级:

- **标题 (H1)**: 18px (1.125rem), semi-bold
- **正文 (Body)**: 14px (0.875rem), regular
- **小字 (Small)**: 12px (0.75rem), regular

### 图标 (Iconography)

- **图标库**: Heroicons。这是一个由 Tailwind CSS 团队设计的开源图标库，风格简洁，与我们的设计方向完美匹配。
- **使用指南**: 图标应作为 SVG 组件直接使用，以保证清晰度和性能。

### 间距与布局 (Spacing & Layout)

**间距体系**: 我们将严格遵循 Tailwind CSS 的默认间距体系（基于 4px 网格）。这将确保所有元素之间的间距保持一致和协调。

## 样式指南

### 样式方法

我们将采用**功能类优先（Utility-First）**的方法，使用 Tailwind CSS 进行样式设置。避免编写自定义的 CSS 文件，而是通过组合 Tailwind 的功能类来构建 UI。

### 全局主题

颜色、字体和间距的规范应在 `tailwind.config.js` 文件中定义，以扩展 Tailwind 的默认主题。这确保了整个应用的一致性，并与 UI/UX 规格说明中定义的品牌指南保持同步。

## 线框图与模型

### 设计文件 (Design Files)

**主要设计文件**: 对于 MVP 阶段，我们将依赖下方描述的低保真线框图进行开发。如果未来需要高保真视觉稿，将在 Figma 中创建并在此处提供链接。
