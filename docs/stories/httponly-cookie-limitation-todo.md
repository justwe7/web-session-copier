# HttpOnly Cookie 限制处理 - 待办事项

## 问题描述

在实现会话转移功能时，发现了一个重要的技术限制：**HttpOnly Cookie 无法被 JavaScript 读取和设置**。

### 技术背景

- **HttpOnly Cookie**: 这是一种安全机制，防止 JavaScript 访问敏感的 Cookie 数据
- **浏览器限制**: 出于安全考虑，浏览器不允许 JavaScript 读取或设置标记为 HttpOnly 的 Cookie
- **影响范围**: 这会影响会话转移的完整性，特别是对于使用 HttpOnly Cookie 进行身份验证的网站

## 当前状态

### ✅ 已实现
- 在 `setCookies` 函数中添加了 HttpOnly Cookie 检测
- 当遇到 HttpOnly Cookie 时，会在控制台记录警告信息
- 使用 JavaScript 脚本注入方式设置 Cookie，确保在开发者工具中可见

### ❌ 待处理
- 在读取会话时检测 HttpOnly Cookie 的存在
- 在 UI 中向用户说明 HttpOnly Cookie 的限制
- 提供替代方案或建议
- 更新错误处理机制

## 具体待办任务

### 1. 会话读取时的 HttpOnly Cookie 检测
- [ ] 在 `getSession()` 函数中添加 HttpOnly Cookie 检测
- [ ] 记录 HttpOnly Cookie 的数量和名称
- [ ] 在返回的会话数据中标记 HttpOnly Cookie

### 2. UI 用户提示
- [ ] 在复制会话成功后，显示 HttpOnly Cookie 的警告信息
- [ ] 说明哪些 Cookie 无法被转移
- [ ] 提供用户友好的说明文字

### 3. 错误处理增强
- [ ] 添加 `HTTPONLY_COOKIE_LIMITATION` 错误类型
- [ ] 在应用会话时，标记无法设置的 HttpOnly Cookie
- [ ] 提供详细的限制说明

### 4. 文档和用户指导
- [ ] 在 README 中说明 HttpOnly Cookie 的限制
- [ ] 提供常见网站的 HttpOnly Cookie 使用情况
- [ ] 建议用户如何处理这种情况

## 技术实现建议

### 检测 HttpOnly Cookie
```typescript
// 在 getSession() 中检测 HttpOnly Cookie
const httponlyCookies = cookies.filter(cookie => cookie.httpOnly);
if (httponlyCookies.length > 0) {
  console.warn(`⚠️ 发现 ${httponlyCookies.length} 个 HttpOnly Cookie，无法被 JavaScript 读取`);
}
```

### UI 提示组件
```typescript
// 在 StatusBar 中添加 HttpOnly Cookie 警告
if (httponlyCookieCount > 0) {
  showWarning(`注意：${httponlyCookieCount} 个 HttpOnly Cookie 无法被转移`);
}
```

### 错误处理
```typescript
// 在 setSession() 中处理 HttpOnly Cookie 限制
if (httponlyCookies.length > 0) {
  throw new SessionManagerError(
    `无法设置 ${httponlyCookies.length} 个 HttpOnly Cookie`,
    'HTTPONLY_COOKIE_LIMITATION',
    'HttpOnly Cookie 是浏览器的安全限制，无法被 JavaScript 设置'
  );
}
```

## 优先级

**高优先级**: 这是影响功能完整性的重要限制，需要尽快处理
**影响范围**: 所有使用 HttpOnly Cookie 的网站
**用户体验**: 用户需要了解这个限制，避免困惑

## 相关文件

- `session-bridge/src/lib/sessionManager.ts` - 核心逻辑
- `session-bridge/src/components/StatusBar.tsx` - 用户提示
- `stories/story-2.1-error-handling-enhancement.md` - 错误处理故事

## 备注

这个限制是浏览器的安全机制，无法绕过。我们的目标是：
1. 透明地向用户说明这个限制
2. 提供尽可能完整的会话转移功能
3. 在遇到 HttpOnly Cookie 时给出清晰的指导
