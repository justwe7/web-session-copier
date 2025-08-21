# Story 1.2: 实现核心的会话"读取"逻辑

## Story
**As a** 开发者  
**I want** 编写一个能够读取当前激活页面所有`Cookies`, `Local Storage`, 和 `Session Storage`的模块  
**so that** 插件能够完整地捕获到用于转移的会话数据。

## Acceptance Criteria
- [ ] 调用一个函数后，能返回一个包含了当前页面域名下所有`Cookies`信息的JSON对象
- [ ] 该JSON对象也必须包含`Local Storage`中的所有键值对
- [ ] 该JSON对象也必须包含`Session Storage`中的所有键值对
- [ ] 该核心逻辑模块有对应的单元测试覆盖

## Dev Notes
### 技术要求
- **Chrome API**: 使用 `chrome.cookies` API 读取 Cookie
- **Storage API**: 使用 `chrome.storage.local` 和 `chrome.storage.session`
- **权限**: 确保 manifest 中包含必要的权限
- **类型安全**: 使用 TypeScript 定义数据结构

### 数据结构设计
```typescript
export interface SessionData {
  cookies: chrome.cookies.Cookie[];
  localStorage: Record<string, string>;
  sessionStorage: Record<string, string>;
  domain: string;
  timestamp: number;
}
```

### API 权限要求
- `cookies`: 读取 Cookie 数据
- `activeTab`: 获取当前活动标签页信息
- `storage`: 访问浏览器存储

## Tasks
- [ ] 设计会话数据接口
  - [ ] 定义 `SessionData` TypeScript 接口
  - [ ] 设计 JSON 数据格式规范
- [ ] 实现 Cookie 读取功能
  - [ ] 使用 `chrome.cookies.getAll()` 获取当前域名 Cookie
  - [ ] 处理 Cookie 权限和错误情况
- [ ] 实现 Storage 读取功能
  - [ ] 读取 `localStorage` 数据
  - [ ] 读取 `sessionStorage` 数据
  - [ ] 处理跨域访问限制
- [ ] 集成和封装
  - [ ] 创建 `getSession()` 主函数
  - [ ] 实现错误处理和异常捕获
  - [ ] 添加数据验证和清理

## Testing
- [ ] 单元测试：测试各个读取函数
- [ ] 集成测试：测试完整的会话读取流程
- [ ] 手动测试：在不同网站验证数据读取
- [ ] 边缘情况测试：空数据、权限拒绝等

## Definition of Done
- [ ] `lib/sessionManager.ts` 中的 `getSession()` 函数正常工作
- [ ] 能够正确读取当前页面的所有会话数据
- [ ] 返回的数据结构符合预定义格式
- [ ] 单元测试覆盖率达到 80% 以上
- [ ] 错误处理机制完善

## File List
*将在开发过程中更新*

## Change Log
| 日期 | 变更 | 作者 |
|------|------|------|
| 2025-01-XX | 创建故事 | BMad Master |

## Status
Draft

---

## Dev Agent Record
*开发代理执行记录将在实施时填写*

### Agent Model Used
*待填写*

### Debug Log References
*待填写*

### Completion Notes
*待填写*
