# Incognito Session Bridge 前端架构文档

## 1. 模板和框架选择

基于已完成的产品需求文档（PRD）和UI/UX规格说明，本项目将使用一个专为浏览器扩展开发而设计的现代化框架。

* **入选框架**: **Plasmo 框架**
* **理由**: 如PRD阶段所决定的，Plasmo为浏览器扩展提供了高效的、生产就绪的开发环境。它能自动处理复杂的构建配置、热重载和项目结构，使我们能完全专注于插件的功能实现。
* **约束**: 采用Plasmo意味着我们将遵循其关于文件组织、组件结构和配置的惯例，以确保充分利用框架的优势。

### 变更日志

| 日期 | 版本 | 描述 | 作者 |
| :--- | :--- | :--- | :--- |
| 2025-08-21 | 1.0 | 创建架构文档初稿。 | Winston (Architect) |

---
## 2. 前端技术栈

本技术栈以 **Plasmo** 框架为中心，集成了现代、高效的前端开发工具。

### 技术栈表

| Category | Technology | Version | Purpose | Rationale |
| :--- | :--- | :--- | :--- | :--- |
| **框架** | Plasmo | 最新 | 核心扩展框架 | 简化构建流程、清单管理和热重载。 |
| **UI库** | React & TypeScript | 最新 (来自 Plasmo) | 构建UI组件 | 现代组件模型，通过强类型保证代码的健壮性和可维护性。 |
| **样式** | Tailwind CSS | 最新 | 功能类优先的CSS | 实现快速、一致的样式开发，符合“开发者工具”的美学风格。 |
| **状态管理** | React Hooks | N/A | 管理UI状态 | 对于MVP的简单状态需求已足够，避免了不必要的依赖。 |
| **测试** | Jest & React Testing Library | 最新 | 单元与组件测试 | 测试React应用和逻辑的行业标准。 |
| **构建工具**| Vite | 最新 (来自 Plasmo) | 打包与开发服务器 | 由Plasmo核心框架管理，提供优化的开发体验。 |
| **路由** | N/A | N/A | N/A | 插件是单一视图的弹窗，不需要路由库。 |

---
## 3. 项目结构

项目将遵循由 **Plasmo** 框架建立的标准目录结构惯例。

```plaintext
incognito-session-bridge/
├── .plasmo/              # 自动生成的构建目录 (请勿修改)
├── assets/
│   └── icon.png          # 扩展图标 (例如 128x128)
├── components/
│   ├── ActionButton.tsx  # 可复用的按钮组件
│   └── StatusBar.tsx     # 用于用户反馈的组件
├── hooks/
│   └── useClipboard.ts   # (可选) 用于剪贴板逻辑的自定义钩子
├── lib/
│   └── sessionManager.ts # 用于读/写会话数据的核心逻辑
├── popup.tsx             # 扩展弹窗的主UI组件
├── package.json          # 项目依赖和脚本
└── tsconfig.json         # TypeScript 配置
```


4. 组件标准
为保证代码库的整洁、一致和可维护，所有新组件必须遵守以下标准。

组件模板
所有React组件都将是使用TypeScript编写的函数式组件，并遵循此结构（以ActionButton.tsx为例）：

TypeScript

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
命名约定
组件文件: PascalCase.tsx (e.g., StatusBar.tsx)

组件函数: PascalCase (e.g., const StatusBar: FC<...)

自定义钩子文件: useCamelCase.ts (e.g., useClipboard.ts)

库/工具函数文件: camelCase.ts (e.g., sessionManager.ts)

5. 状态管理
存储结构
对于MVP，我们将不引入外部状态管理库。状态将通过以下方式管理：

本地组件状态: 使用 useState 和 useReducer 管理单个组件内部的简单状态。

跨组件状态: 对于需要跨组件共享的简单状态（例如，全局加载状态），将使用React的 useContext Hook。相关Context将定义在hooks/目录中。

6. API 集成
本插件不与外部HTTP API交互，但它会与Chrome扩展API交互。我们将这些交互逻辑封装在一个专门的服务模块中，以保持UI组件的整洁。

服务模板 (lib/sessionManager.ts)
TypeScript

// lib/sessionManager.ts

// 定义会话数据的类型接口
export interface SessionData {
  cookies: chrome.cookies.Cookie[];
  localStorage: Record<string, string>;
  sessionStorage: Record<string, string>;
}

/**
 * 从当前标签页读取会话数据
 */
export const getSession = async (): Promise<SessionData> => {
  // ... chrome.cookies.getAll and chrome.storage.local.get logic
  // This is a placeholder for the actual implementation
  return { cookies: [], localStorage: {}, sessionStorage: {} };
};

/**
 * 将会话数据应用到当前标签页
 * @param session - The session data to apply
 */
export const setSession = async (session: SessionData): Promise<void> => {
  // ... chrome.cookies.set and chrome.storage.local.set logic
};
7. 样式指南
样式方法
我们将采用**功能类优先（Utility-First）**的方法，使用 Tailwind CSS 进行样式设置。避免编写自定义的CSS文件，而是通过组合Tailwind的功能类来构建UI。

全局主题
颜色、字体和间距的规范应在tailwind.config.js文件中定义，以扩展Tailwind的默认主题。这确保了整个应用的一致性，并与UI/UX规格说明中定义的品牌指南保持同步。

8. 测试要求
组件测试模板
使用React Testing Library和Jest，测试应专注于用户行为而非实现细节。

TypeScript

// components/ActionButton.test.tsx

import { render, screen, fireEvent } from '@testing-library/react';
import ActionButton from './ActionButton';

describe('ActionButton', () => {
  it('renders the button with the correct label', () => {
    render(<ActionButton label="Click Me" onClick={() => {}} />);
    expect(screen.getByText('Click Me')).toBeInTheDocument();
  });

  it('calls the onClick handler when clicked', () => {
    const handleClick = jest.fn();
    render(<ActionButton label="Click Me" onClick={handleClick} />);
    fireEvent.click(screen.getByText('Click Me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
测试最佳实践
单元测试: 测试独立的工具函数和核心逻辑（例如lib/sessionManager.ts中的函数）。

组件测试: 测试UI组件的渲染和交互。

端到端（E2E）测试: （MVP后）测试关键的用户流程，如完整的复制和粘贴操作。

代码覆盖率目标: 目标设定为关键逻辑达到80%的代码覆盖率。

9. 前端开发者标准
关键编码规则
所有用于会话管理的核心业务逻辑必须封装在lib/sessionManager.ts中。

UI组件应尽可能保持无状态，通过Props从popup.tsx接收数据和回调。

UI组件应避免直接调用chrome.* API；应通过sessionManager服务模块进行。