# Incognito Session Bridge 产品需求文档 (PRD)

## 1. 目标与背景 (Goals and Background Context)

### 目标 (Goals)

* 验证核心市场需求：通过吸引首批目标用户（开发者、QA测试人员、客服专员）来验证“会话转移”这一核心功能的市场需求。
* 显著提升用户效率：将用户在不同环境中转移会话所需的时间从数分钟缩短至秒级。
* 提供更安全的替代方案：为团队协作和测试中临时共享账户的场景，提供一种比直接分享密码更安全的选择。
* 建立高质量的产品基础：以获取Chrome应用商店4.5星以上的评分为目标，并积极收集用户反馈以指导未来迭代。

### 背景 (Background Context)

本项目旨在解决两个核心痛点：一是浏览器普通模式与无痕模式的会话隔离，导致用户需要繁琐地手动重复登录；二是团队协作中因临时需要访问特定账户而产生的共享密码等不安全行为。本插件通过提供一个通用的“会话导出/导入”功能，致力于实现一个无缝、高效且更安全的会话转移解决方案。

### 变更日志 (Change Log)

| 日期 | 版本 | 描述 | 作者 |
| :--- | :--- | :--- | :--- |
| 2025-08-21 | 1.0 | 基于项目简介创建PRD初稿。 | John (PM) |

---
## 2. 需求 (Requirements)

### 功能性需求 (Functional Requirements)

* **FR1**: 插件必须能够读取用户当前激活标签页中属于该域名下的所有会话数据，包括`Cookies`、`Local Storage`和`Session Storage`。
* **FR2**: 插件必须提供一个“复制会话”功能，该功能会将捕获到的会话数据打包成一个结构化的JSON字符串，并存入系统剪贴板。
* **FR3**: 插件必须能够从系统剪贴板中读取并解析符合其规定JSON格式的会话数据。
* **FR4**: 插件必须提供一个“应用会话”功能，该功能会将从剪贴板读取的数据注入到当前激活的标签页中（即设置`Cookies`和写入`Storage`）。
* **FR5**: 用户在成功应用会话并刷新页面后，页面应能正确识别新的会话状态（例如，从未登录变为已登录）。
* **FR6**: 插件的用户界面（Popup）必须包含清晰的“复制会话”和“应用会话”按钮，并提供操作结果的即时反馈（如“复制成功”）。

### 非功能性需求 (Non-Functional Requirements)

* **NFR1**: 插件必须兼容最新稳定版的Google Chrome浏览器。
* **NFR2**: 所有插件操作（复制、应用）的响应时间必须在500毫秒以内，且不能对浏览器性能造成可感知的影响。
* **NFR3**: 插件的所有逻辑必须在客户端本地执行，不得将任何用户会话数据传输到任何外部服务器。
* **NFR4**: 插件必须在隐私政策中清晰地向用户声明其所需权限（如访问网站数据和Cookie）及其用途。
* **NFR5**: 插件必须使用Plasmo框架、React和Tailwind CSS进行开发。

---
## 3. 用户界面设计目标 (User Interface Design Goals)

### 整体用户体验愿景 (Overall UX Vision)

[cite_start]提供一个直观、简洁、无干扰的界面，让目标用户能够以最快的速度、最小的认知负担当中完成复制和应用会话的核心任务。整体感觉应该像一个轻量级的实用工具，而非一个复杂的应用程序。 [cite: 512, 513]

### 关键交互模式 (Key Interaction Paradigms)

[cite_start]核心交互为简单的两步操作：“在来源页面点击复制”、“在目标页面点击应用”。操作反馈应即时、清晰（例如，按钮状态变化并显示“已复制！”文本提示）。 [cite: 512]

### 核心界面与视图 (Core Screens and Views)

[cite_start]插件只有一个核心界面：**弹出窗口 (Popup)**。这个单一的界面将承载所有必要的功能控件和信息反馈。 [cite: 512, 515]

### 无障碍设计 (Accessibility)

[cite_start]界面将遵循WCAG AA标准，确保其可用性，例如提供足够的色彩对比度。 [cite: 512, 514] 完整的键盘操作支持将作为MVP之后的迭代目标。

### 品牌与风格 (Branding)

[cite_start]风格将保持简洁、专业，类似于一个开发者工具。将使用简单的Logo和有限的色板，避免不必要的动画和装饰。我们将使用`Tailwind CSS`来实现这一风格。 [cite: 512, 516, 517]

### 目标设备与平台 (Target Device and Platforms)

[cite_start]目标平台为桌面版Google Chrome浏览器（兼容Windows, macOS, Linux）。由于插件弹出窗口的尺寸是固定的，因此无需进行响应式设计。 [cite: 512, 519]

---
## 4. 技术假设 (Technical Assumptions)

### 代码仓库结构 (Repository Structure): Single Repository

* **Rationale**: 对于一个独立的浏览器插件项目，单一、自包含的代码仓库是最高效的管理方式，这也符合Plasmo框架的约定。

### 服务架构 (Service Architecture): Purely Client-Side

* [cite_start]**Rationale**: MVP阶段的所有功能和逻辑都在用户的浏览器内完成，不依赖任何后端服务器。因此，不存在传统的后端服务架构（如单体、微服务或无服务器）。 [cite: 522]

### 测试要求 (Testing Requirements): Unit + Integration Tests

* [cite_start]**Rationale**: 我们需要确保核心逻辑单元（Unit Tests）的正确性，以及插件与Chrome浏览器API交互（Integration Tests）的稳定性。这个组合能在保障质量和控制测试成本之间取得良好平衡。 [cite: 523]

### 其他技术假设与要求 (Additional Technical Assumptions and Requests)

* **核心框架**: 项目将使用 **Plasmo** 框架进行构建。
* **UI技术栈**: 界面将使用 **React** 和 **TypeScript** 进行开发。
* **样式方案**: 样式将使用 **Tailwind CSS** 实现。
* **数据处理**: 所有用户会话数据都严格在本地客户端处理，绝不会被发送到任何远程服务器。

---
## 5. 史诗列表 (Epic List)

### Epic 1: MVP - Core Session Transfer Functionality

* [cite_start]**Epic Goal**: 交付一个功能完整的Chrome扩展插件MVP，允许用户完整地复制一个网站的会话（包括Cookies和Storage），并将其应用到另一个浏览器环境中，从而实现快速的会话转移。 [cite: 524, 525, 527]

---
## 6. 史诗详情 (Epic Details)

### Epic 1: MVP - Core Session Transfer Functionality

#### Story 1.1: 项目设置与UI骨架搭建
* **As a** 开发者,
* **I want** 建立一个基于Plasmo框架的、集成了React, TypeScript和Tailwind CSS的新项目,
* **so that** 我有一个标准化的、可运行的基础框架，以及一个包含了基础UI元素的弹出窗口，为后续功能开发做准备。

* **Acceptance Criteria**:
    1.  新的Plasmo项目被成功创建，并能在Chrome浏览器的开发者模式下正确加载和运行。
    2.  插件的弹出窗口(Popup) UI能正确显示，其中包含两个按钮：“复制会话”和“应用会话”。
    3.  Tailwind CSS被成功集成，能够通过utility classes为UI元素添加样式。
    4.  项目的文件结构遵循Plasmo框架的最佳实践。

#### Story 1.2: 实现核心的会话“读取”逻辑
* **As a** 开发者,
* **I want** 编写一个能够读取当前激活页面所有`Cookies`, `Local Storage`, 和 `Session Storage`的模块,
* **so that** 插件能够完整地捕获到用于转移的会话数据。

* **Acceptance Criteria**:
    1.  调用一个函数后，能返回一个包含了当前页面域名下所有`Cookies`信息的JSON对象。
    2.  该JSON对象也必须包含`Local Storage`中的所有键值对。
    3.  该JSON对象也必须包含`Session Storage`中的所有键值对。
    4.  该核心逻辑模块有对应的单元测试覆盖。

#### Story 1.3: 实现核心的会话“写入”逻辑
* **As a** 开发者,
* **I want** 编写一个能够将包含会话信息的JSON对象应用到当前页面的模块,
* **so that** 捕获到的会话可以在一个新的环境中被还原。

* **Acceptance Criteria**:
    1.  一个函数能够接收符合预定格式的会话JSON对象作为参数。
    2.  该函数能成功将对象中的`Cookies`信息（包括domain, path等属性）设置到当前页面。
    3.  该函数能成功将对象中的键值对写入`Local Storage`。
    4.  该函数能成功将对象中的键值对写入`Session Storage`。
    5.  该核心逻辑模块有对应的单元测试覆盖。

#### Story 1.4: 集成核心逻辑与UI及剪贴板功能
* **As a** 用户,
* **I want** 点击“复制会话”按钮时，会话数据能被存入我的剪贴板；点击“应用会话”按钮时，能从剪贴板中读取并应用数据,
* **so that** 我可以实际执行完整的会话转移操作。

* **Acceptance Criteria**:
    1.  点击“复制会话”按钮后，会成功触发1.2中实现的“读取”逻辑。
    2.  “读取”逻辑返回的JSON数据被成功写入系统剪贴板。
    3.  点击“应用会话”按钮后，会成功从系统剪贴板读取内容。
    4.  读取到的内容被成功传递给1.3中实现的“写入”逻辑并执行。

#### Story 1.5: 添加用户操作的即时反馈
* **As a** 用户,
* **I want** 在点击按钮后能看到清晰的操作结果反馈,
* **so that** 我能明确地知道我的操作是否成功。

* **Acceptance Criteria**:
    1.  成功复制会话后，UI界面上应有清晰的成功提示（如“复制成功！”），并在几秒后自动消失。
    2.  成功应用会话后，UI界面上应有清晰的成功提示（如“应用成功！请刷新页面”）。
    3.  如果应用失败（例如剪贴板内容格式不正确），UI界面应显示对应的失败提示。