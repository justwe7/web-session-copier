# 测试与性能

## 测试要求

### 组件测试模板

使用 React Testing Library 和 Jest，测试应专注于用户行为而非实现细节。

```typescript
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
```

### 测试最佳实践

- **单元测试**: 测试独立的工具函数和核心逻辑（例如 `lib/sessionManager.ts` 中的函数）。
- **组件测试**: 测试 UI 组件的渲染和交互。
- **端到端（E2E）测试**: （MVP 后）测试关键的用户流程，如完整的复制和粘贴操作。
- **代码覆盖率目标**: 目标设定为关键逻辑达到 80% 的代码覆盖率。

## 性能考量

### 性能目标 (Performance Goals)

- **加载速度 (Load Time)**: 插件弹出窗口的界面必须在 200 毫秒内完成渲染，实现"即时"打开的体验。
- **交互响应 (Interaction Response)**: 所有用户交互（如按钮点击）必须在 100 毫秒内提供视觉反馈。
- **动画帧率 (Animation FPS)**: 所有动画效果必须维持在每秒 60 帧（FPS），以保证流畅不卡顿。

### 达成目标的设计策略 (Design Strategies)

- **极简设计**: 我们有意地保持了 UI 的极简主义，限制了 DOM 元素的数量，以确保最快的渲染速度。
- **无自定义字体**: 我们选择使用系统字体，从而消除了加载网络字体所需的时间和性能开销。
- **优化的图标**: 我们将使用内联 SVG 作为图标，这是性能最高、伸缩性最好的方案。
- **无媒体资源**: 设计中不包含任何位图（raster images）、视频或其他会拖慢加载速度的媒体文件。

## 前端开发者标准

### 关键编码规则

1. 所有用于会话管理的核心业务逻辑必须封装在 `lib/sessionManager.ts` 中。
2. UI 组件应尽可能保持无状态，通过 Props 从 `popup.tsx` 接收数据和回调。
3. UI 组件应避免直接调用 `chrome.*` API；应通过 `sessionManager` 服务模块进行。
