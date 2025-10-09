# Story 1.6: 跨域会话写入支持（按域名策略区分）

## Story
**As a** 用户  
**I want** 将读取到的会话数据（cookies 与 storage）在任意网站进行写入  
**so that** 我可以在不同站点快速复用/迁移当前会话状态。

## Acceptance Criteria
- [ ] 当目标站点域名与读取来源域名相同（或满足子域一致策略）时：按“原域名写入规则”写入 cookies 与 storage，并在 UI 明确提示“同域写入”。
- [ ] 当目标站点域名与读取来源域名不同：将读取到的所有 cookies 与 storage 值“尽最大可能”写入当前域名（不跨域强写），在 UI 明确提示“跨域写入（当前域生效）”。
- [ ] 写入前后有清晰的用户反馈，包含写入策略类型（同域/跨域）与成功/失败结果，失败时提供主要原因（权限、协议、安全标志、HttpOnly 限制等）。
- [ ] 对 HttpOnly、Secure、SameSite、Path、Domain 等受限属性进行合理处理与说明，不误导用户；对无法通过前端脚本写入的情况，给出受限说明。
- [ ] 对 localStorage 与 sessionStorage 的写入遵循当前页面上下文安全边界，不进行跨站写入尝试；跨域模式下仅在当前域落地。
- [ ] 子域名策略：当来源为 `sub.example.com` 且目标为 `example.com` 或同父子域时，遵循浏览器/扩展 API 可行策略，尽最大可能维持原有效范围（例如保留 Domain=.example.com 的可行性判断）。
- [ ] 在 `popup.tsx` 中，写入操作完成后，使用 `StatusBar` 告知用户：
  - 写入类型：同域/跨域
  - 成功/失败摘要
  - 需要用户后续操作（例如刷新）

## Dev Notes
### 行为定义
- 同域写入：读取域与当前页面域名相同或明确满足子域策略时，按原 cookie 的 `domain/path/samesite/secure` 进行写入；storage 写入到当前页面上下文。
- 跨域写入：读取域与当前页面域不同，所有 cookies 与 storage 仅写入“当前域”上下文，不尝试跨站强制写入。
- 受限属性：
  - HttpOnly：无法通过 JS 写入，若依赖 `chrome.cookies` 等扩展 API，也需权限与可写条件，失败需提示。
  - Secure：仅在 https 场景可设置，http 页面无法设置带 Secure 的 cookie。
  - SameSite/Path/Domain：在同域写入时尽可能保留；跨域写入时根据当前域可行范围降级处理。
- 权限与能力：优先使用现有实现能力；若需 `chrome.cookies` 权限，需在故事实现时更新 `manifest` 并最小化权限范围。

### UX 文案建议
- 同域写入成功："同域写入成功！请刷新页面以生效"
- 跨域写入成功："跨域写入完成（已落地当前域）！请刷新页面以生效"
- 写入失败："写入失败：{原因摘要}"
- 细节提示（可选信息提示级）："部分 Cookie 受 HttpOnly/安全策略限制，无法写入"

### 性能与安全
- 批量写入应分批提交，避免阻塞 UI；使用状态提示与加载指示。
- 不记录敏感值到日志；仅统计数量级与失败原因类别。

## Tasks
- [ ] 设计并实现“写入策略判定”方法：基于读取来源域与当前域，返回 `sameDomain`/`crossDomain`。
- [ ] 扩展 `sessionManager`：
  - [ ] `applySessionToCurrentDomain(session, strategy)`：根据策略分别处理 cookies 与 storage 落地。
  - [ ] 在同域策略下，尽量保留 cookie 属性；在跨域策略下，按当前域可行性降级。
  - [ ] 返回写入结果摘要（成功数、失败数、失败类型）。
- [ ] 在 `popup.tsx` 集成策略判定与写入，并通过 `StatusBar` 显示：写入类型 + 结果摘要。
- [ ] 为 `manifest`（如需）增加 `cookies` 权限与 `host_permissions`，并确保最小权限。
- [ ] 文案与本地化：与现有中文文案风格保持一致。

## Testing
- [ ] 单元测试：策略判定、属性保留/降级、错误分支（HttpOnly、Secure、权限缺失）。
- [ ] 集成测试：在同域/跨域场景下的端到端写入流程，验证 UI 提示。
- [ ] 回归测试：不破坏 Story 1.2/1.3 的读写逻辑与 Story 1.5 的反馈机制。

## Definition of Done
- [ ] 在相同域名（含子域策略）与不同域名两种场景下，均能按规范完成写入，并正确提示。
- [ ] 对受限属性行为有清晰、准确的用户反馈与文档说明。
- [ ] 相关权限配置（若需）已经更新且通过审核构建。
- [ ] 测试通过，TypeScript 类型校验无误。

## File List
- `src/lib/sessionManager.ts`：新增策略判定与跨域写入逻辑。
- `src/popup.tsx`：集成策略判定、触发写入与用户反馈。
- `build/manifest.json`（如需变更开发清单）：权限最小化配置。

## Change Log
| 日期 | 变更 | 作者 |
|------|------|------|
| 2025-10-09 | 创建故事草案 | James |

## Status
Draft
