# Story 1.3: 实现核心的会话"写入"逻辑

## Story
**As a** 开发者  
**I want** 编写一个能够将包含会话信息的JSON对象应用到当前页面的模块  
**so that** 捕获到的会话可以在一个新的环境中被还原。

## Acceptance Criteria
- [ ] 一个函数能够接收符合预定格式的会话JSON对象作为参数
- [ ] 该函数能成功将对象中的`Cookies`信息（包括domain, path等属性）设置到当前页面
- [ ] 该函数能成功将对象中的键值对写入`Local Storage`
- [ ] 该函数能成功将对象中的键值对写入`Session Storage`
- [ ] 该核心逻辑模块有对应的单元测试覆盖

## Dev Notes
### 技术要求
- **Chrome API**: 使用 `chrome.cookies.set()` API 设置 Cookie
- **Storage API**: 使用 `chrome.storage.local.set()` 和内容脚本注入
- **权限**: 确保有足够权限修改目标域名的数据
- **错误处理**: 处理权限不足、域名不匹配等错误

### 实现注意事项
- Cookie 设置需要匹配正确的 domain 和 path
- Storage 数据需要通过内容脚本注入到页面
- 需要验证会话数据的完整性和格式
- 处理异步操作和错误回调

## Tasks
- [ ] 实现 Cookie 写入功能
  - [ ] 使用 `chrome.cookies.set()` 设置 Cookie
  - [ ] 处理 Cookie 属性（domain, path, secure, httpOnly等）
  - [ ] 实现批量 Cookie 设置
- [ ] 实现 Storage 写入功能
  - [ ] 通过内容脚本写入 `localStorage`
  - [ ] 通过内容脚本写入 `sessionStorage`
  - [ ] 处理存储配额和权限限制
- [ ] 数据验证和处理
  - [ ] 验证输入 JSON 格式的正确性
  - [ ] 实现数据清理和转换
  - [ ] 添加域名匹配验证
- [ ] 错误处理和回滚
  - [ ] 实现操作失败时的回滚机制
  - [ ] 添加详细的错误信息返回
  - [ ] 处理部分成功的情况

## Testing
- [ ] 单元测试：测试各个写入函数
- [ ] 集成测试：测试完整的会话应用流程
- [ ] 手动测试：验证会话在不同网站的应用效果
- [ ] 错误测试：测试各种错误情况的处理

## Definition of Done
- [ ] `lib/sessionManager.ts` 中的 `setSession()` 函数正常工作
- [ ] 能够正确应用会话数据到当前页面
- [ ] 应用后页面刷新能正确识别登录状态
- [ ] 单元测试覆盖率达到 80% 以上
- [ ] 错误处理和回滚机制完善

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
