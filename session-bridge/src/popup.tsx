import { useState } from "react"
import { ActionButton } from "~components/ActionButton"
import { getSession, SessionManagerError } from "~lib/sessionManager"
import type { SessionData } from "~lib/sessionManager"

import "~style.css"

function IndexPopup() {
  const [status, setStatus] = useState<string>("就绪")
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const handleCopySession = async () => {
    setIsLoading(true)
    setStatus("正在读取会话数据...")
    
    try {
      const sessionData: SessionData = await getSession()
      
      // 将会话数据复制到剪贴板
      const jsonString = JSON.stringify(sessionData, null, 2)
      await navigator.clipboard.writeText(jsonString)
      
      setStatus(`会话已复制！域名: ${sessionData.domain}`)
      
      // 显示成功状态3秒后重置
      setTimeout(() => {
        setStatus("就绪")
      }, 3000)
      
    } catch (error) {
      console.error("复制会话失败:", error)
      
      if (error instanceof SessionManagerError) {
        setStatus(`错误: ${error.message}`)
      } else {
        setStatus("复制会话失败，请重试")
      }
      
      // 显示错误状态5秒后重置
      setTimeout(() => {
        setStatus("就绪")
      }, 5000)
    } finally {
      setIsLoading(false)
    }
  }

  const handleApplySession = () => {
    // TODO: 实现会话应用逻辑 (Story 1.3)
    console.log("Apply Session clicked")
    setStatus("应用会话功能即将推出...")
    setTimeout(() => {
      setStatus("就绪")
    }, 2000)
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
          disabled={isLoading}
        >
          {isLoading ? "读取中..." : "复制会话"}
        </ActionButton>
        
        <ActionButton 
          onClick={handleApplySession}
          variant="secondary"
          disabled={isLoading}
        >
          应用会话
        </ActionButton>
      </div>

      {/* 状态栏 */}
      <div className={`plasmo-mt-4 plasmo-text-xs plasmo-text-center plasmo-px-2 plasmo-py-1 plasmo-rounded ${
        status.includes("错误") || status.includes("失败") 
          ? "plasmo-text-red-600 plasmo-bg-red-50" 
          : status.includes("已复制") 
          ? "plasmo-text-green-600 plasmo-bg-green-50"
          : "plasmo-text-gray-400"
      }`}>
        {status}
      </div>
    </div>
  )
}

export default IndexPopup
