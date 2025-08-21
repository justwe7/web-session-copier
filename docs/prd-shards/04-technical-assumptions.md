# 4. 技术假设 (Technical Assumptions)

## 代码仓库结构 (Repository Structure): Single Repository

* **Rationale**: 对于一个独立的浏览器插件项目，单一、自包含的代码仓库是最高效的管理方式，这也符合Plasmo框架的约定。

## 服务架构 (Service Architecture): Purely Client-Side

* [cite_start]**Rationale**: MVP阶段的所有功能和逻辑都在用户的浏览器内完成，不依赖任何后端服务器。因此，不存在传统的后端服务架构（如单体、微服务或无服务器）。 [cite: 522]

## 测试要求 (Testing Requirements): Unit + Integration Tests

* [cite_start]**Rationale**: 我们需要确保核心逻辑单元（Unit Tests）的正确性，以及插件与Chrome浏览器API交互（Integration Tests）的稳定性。这个组合能在保障质量和控制测试成本之间取得良好平衡。 [cite: 523]

## 其他技术假设与要求 (Additional Technical Assumptions and Requests)

* **核心框架**: 项目将使用 **Plasmo** 框架进行构建。
* **UI技术栈**: 界面将使用 **React** 和 **TypeScript** 进行开发。
* **样式方案**: 样式将使用 **Tailwind CSS** 实现。
* **数据处理**: 所有用户会话数据都严格在本地客户端处理，绝不会被发送到任何远程服务器。
