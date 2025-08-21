import { ActionButton } from "~components/ActionButton"

import "~style.css"

function IndexPopup() {
  const handleCopySession = () => {
    // TODO: 实现会话复制逻辑 (Story 1.2)
    console.log("Copy Session clicked")
  }

  const handleApplySession = () => {
    // TODO: 实现会话应用逻辑 (Story 1.3)
    console.log("Apply Session clicked")
  }

  return (
    <div className="plasmo-flex plasmo-flex-col plasmo-p-4 plasmo-w-64 plasmo-bg-white">
      {/* 标题 */}
      <div className="plasmo-mb-4 plasmo-text-center">
        <h1 className="plasmo-text-lg plasmo-font-semibold plasmo-text-gray-800 plasmo-mb-1">
          Incognito Session Bridge
        </h1>
        <p className="plasmo-text-xs plasmo-text-gray-500">
          管理隐身会话数据
        </p>
      </div>

      {/* 按钮组 */}
      <div className="plasmo-flex plasmo-flex-col plasmo-space-y-3">
        <ActionButton 
          onClick={handleCopySession}
          variant="primary"
        >
          复制会话
        </ActionButton>
        
        <ActionButton 
          onClick={handleApplySession}
          variant="secondary"
        >
          应用会话
        </ActionButton>
      </div>

      {/* 状态栏占位 */}
      <div className="plasmo-mt-4 plasmo-text-xs plasmo-text-gray-400 plasmo-text-center">
        就绪
      </div>
    </div>
  )
}

export default IndexPopup
