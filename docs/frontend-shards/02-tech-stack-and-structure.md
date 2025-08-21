# 技术栈与项目结构

## 前端技术栈

本技术栈以 **Plasmo** 框架为中心，集成了现代、高效的前端开发工具。

### 技术栈表

| Category | Technology | Version | Purpose | Rationale |
| :--- | :--- | :--- | :--- | :--- |
| **框架** | Plasmo | 最新 | 核心扩展框架 | 简化构建流程、清单管理和热重载。 |
| **UI库** | React & TypeScript | 最新 (来自 Plasmo) | 构建UI组件 | 现代组件模型，通过强类型保证代码的健壮性和可维护性。 |
| **样式** | Tailwind CSS | 最新 | 功能类优先的CSS | 实现快速、一致的样式开发，符合"开发者工具"的美学风格。 |
| **状态管理** | React Hooks | N/A | 管理UI状态 | 对于MVP的简单状态需求已足够，避免了不必要的依赖。 |
| **测试** | Jest & React Testing Library | 最新 | 单元与组件测试 | 测试React应用和逻辑的行业标准。 |
| **构建工具**| Vite | 最新 (来自 Plasmo) | 打包与开发服务器 | 由Plasmo核心框架管理，提供优化的开发体验。 |
| **路由** | N/A | N/A | N/A | 插件是单一视图的弹窗，不需要路由库。 |

## 项目结构

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

## 状态管理

### 存储结构

对于 MVP，我们将不引入外部状态管理库。状态将通过以下方式管理：

- **本地组件状态**: 使用 `useState` 和 `useReducer` 管理单个组件内部的简单状态。
- **跨组件状态**: 对于需要跨组件共享的简单状态（例如，全局加载状态），将使用 React 的 `useContext` Hook。相关 Context 将定义在 `hooks/` 目录中。

## API 集成

本插件不与外部 HTTP API 交互，但它会与 Chrome 扩展 API 交互。我们将这些交互逻辑封装在一个专门的服务模块中，以保持 UI 组件的整洁。

### 服务模板 (lib/sessionManager.ts)

```typescript
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
```
