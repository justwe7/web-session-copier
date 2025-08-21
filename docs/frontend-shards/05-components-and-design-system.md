# 组件库与设计系统

## 设计系统方法

对于 MVP 阶段，我们不会引入外部的重量级组件库（如 MUI, Ant Design）或构建一个正式的设计系统（如使用 Storybook）。相反，我们将采用一种更轻量的方法：

在项目内部创建一套小型的、可复用的、高度定制化的 React 组件。所有组件将使用 Tailwind CSS 进行样式设置，确保视觉一致性和开发效率。

## 核心组件

### 组件名称: ActionButton

- **目的**: 用于"复制"和"应用"这两个核心操作的可复用按钮。
- **变体 (Variants)**: 主要操作按钮、禁用状态按钮。
- **状态 (States)**: 默认 (default), 悬停 (hover), 点击 (active/pressed), 禁用 (disabled), 加载中 (loading)。
- **使用指南**: 用于弹出窗口中所有主要的号召性操作（call-to-action）。

### 组件名称: StatusBar

- **目的**: 用于向用户显示操作反馈信息（如"复制成功"）。
- **变体 (Variants)**: 成功 (success), 失败 (error), 提示 (info)。
- **状态 (States)**: 显示 (visible), 隐藏 (hidden)。
- **使用指南**: 在用户操作后出现，提供反馈，并在短暂延迟后自动消失。

### 组件名称: PopupContainer

- **目的**: 作为插件弹出窗口的根容器，负责整体布局。
- **变体 (Variants)**: 无。
- **状态 (States)**: 无。
- **使用指南**: 承载 ActionButton 和 StatusBar 等所有其他组件。

## 组件标准

为保证代码库的整洁、一致和可维护，所有新组件必须遵守以下标准。

### 组件模板

所有 React 组件都将是使用 TypeScript 编写的函数式组件，并遵循此结构（以 ActionButton.tsx 为例）：

```typescript
import type { FC } from "react";

// 1. 为Props定义接口以保证类型安全
interface ActionButtonProps {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  isLoading?: boolean;
}

// 2. 使用FC (Functional Component) 类型定义组件
const ActionButton: FC<ActionButtonProps> = ({
  label,
  onClick,
  disabled = false,
  isLoading = false
}) => {
  // 3. 组件逻辑
  return (
    <button
      onClick={onClick}
      disabled={disabled || isLoading}
      className="px-4 py-2 font-semibold text-white bg-blue-500 rounded-md shadow-sm hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
    >
      {isLoading ? "..." : label}
    </button>
  );
};

export default ActionButton;
```

### 命名约定

- **组件文件**: PascalCase.tsx (e.g., StatusBar.tsx)
- **组件函数**: PascalCase (e.g., const StatusBar: FC<...)
- **自定义钩子文件**: useCamelCase.ts (e.g., useClipboard.ts)
- **库/工具函数文件**: camelCase.ts (e.g., sessionManager.ts)
