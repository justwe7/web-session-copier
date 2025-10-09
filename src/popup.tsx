import { useState, useEffect } from "react"
import { ActionButton } from "~components/ActionButton"
import { StatusBar } from "~components/StatusBar"
import { getSession, setSession, SessionManagerError, validateSessionData, applySessionToCurrentDomain, determineWriteStrategy, debugCompareCookies } from "~lib/sessionManager"
import { copyToClipboard, readFromClipboard, ClipboardError, getClipboardInfo, validateClipboardJSON } from "~lib/clipboardUtils"
import type { SessionData } from "~lib/sessionManager"
import type { StatusType } from "~components/StatusBar"

import "~style.css"

function IndexPopup() {
  const [status, setStatus] = useState<string>("就绪")
  const [statusType, setStatusType] = useState<StatusType>("ready")
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [clipboardInfo, setClipboardInfo] = useState<{hasContent: boolean, isJSON: boolean} | null>(null)
  const [showManualInput, setShowManualInput] = useState<boolean>(false)
  const [manualSessionData, setManualSessionData] = useState<string>("")

  // 检查剪贴板状态
  useEffect(() => {
    const checkClipboard = async () => {
      try {
        const info = await getClipboardInfo()
        setClipboardInfo({
          hasContent: info.hasContent,
          isJSON: info.isJSON
        })
      } catch (error) {
        // 静默处理剪贴板检查错误
        setClipboardInfo({ hasContent: false, isJSON: false })
      }
    }

    checkClipboard()
  }, [])

  const updateStatus = (message: string, type: StatusType, duration: number = 0) => {
    setStatus(message)
    setStatusType(type)
    
    if (duration > 0) {
      setTimeout(() => {
        setStatus("就绪")
        setStatusType("ready")
      }, duration)
    }
  }

  const handleCopySession = async () => {
    setIsLoading(true)
    updateStatus("正在读取会话数据...", "loading")
    
    try {
      const sessionData: SessionData = await getSession()
      
      updateStatus("正在复制到剪贴板...", "loading")
      
      // 使用增强的剪贴板工具
      await copyToClipboard(JSON.stringify(sessionData, null, 2))
      
      // 更新剪贴板信息
      setClipboardInfo({ hasContent: true, isJSON: true })
      
      updateStatus(`会话已复制！域名: ${sessionData.domain}`, "success", 3000)
      
    } catch (error) {
      console.error("复制会话失败:", error)
      
      let errorMessage = "复制会话失败，请重试"
      
      if (error instanceof SessionManagerError) {
        errorMessage = error.message
      } else if (error instanceof ClipboardError) {
        errorMessage = error.message
      }
      
      updateStatus(`${errorMessage}`, "error", 5000)
    } finally {
      setIsLoading(false)
    }
  }

  const handleApplySession = async () => {
    setIsLoading(true)
    updateStatus("正在读取剪贴板...", "loading")
    
    try {
      // 使用增强的剪贴板工具
      const clipboardText = await readFromClipboard()
      
      if (!clipboardText.trim()) {
        throw new ClipboardError("剪贴板为空，请先复制会话数据", "EMPTY_CLIPBOARD")
      }
      
      await processSessionData(clipboardText)
      
    } catch (error) {
      console.error("应用会话失败:", error)
      
      let errorMessage = "应用会话失败，请重试"
      let showManualOption = false
      
      if (error instanceof ClipboardError) {
        errorMessage = error.message
        // 如果是权限问题，显示手动输入选项
        if (error.code === 'PERMISSION_DENIED' || error.message.includes('permission denied')) {
          showManualOption = true
          errorMessage += " - 可以尝试手动输入"
        }
      } else if (error instanceof SessionManagerError) {
        errorMessage = error.message
      } else if (error instanceof Error) {
        errorMessage = error.message
      }
      
      updateStatus(`${errorMessage}`, "error", showManualOption ? 0 : 5000)
      
      if (showManualOption) {
        setShowManualInput(true)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const processSessionData = async (sessionText: string) => {
    updateStatus("正在验证数据格式...", "loading")
    
    // 验证 JSON 格式
    const validation = validateClipboardJSON(sessionText)
    if (!validation.isValid) {
      throw new ClipboardError(validation.error || "JSON 格式无效", "INVALID_JSON")
    }
    
    // 验证会话数据格式
    if (!validateSessionData(validation.data)) {
      throw new ClipboardError("会话数据格式无效，请确保数据完整", "INVALID_SESSION_FORMAT")
    }
    
    const sessionData = validation.data as SessionData
    
    updateStatus("正在应用会话数据...", "loading")
    
    // 判定策略并应用
    const summary = await applySessionToCurrentDomain(sessionData)
    const typeLabel = summary.strategy === 'sameDomain' ? '同域' : '跨域'
    updateStatus(`${typeLabel}写入完成！来源: ${summary.sourceDomain} → 目标: ${summary.targetDomain}（Cookies: ${summary.cookies.applied}/${summary.cookies.total}）`, "success", 3000)
    
    // 关闭手动输入界面
    setShowManualInput(false)
    setManualSessionData("")
  }

  const handleManualApply = async () => {
    if (!manualSessionData.trim()) {
      updateStatus("请输入会话数据", "error", 3000)
      return
    }

    setIsLoading(true)
    updateStatus("正在处理手动输入的数据...", "loading")
    
    try {
      await processSessionData(manualSessionData)
    } catch (error) {
      console.error("手动应用会话失败:", error)
      
      let errorMessage = "处理会话数据失败"
      
      if (error instanceof ClipboardError || error instanceof SessionManagerError) {
        errorMessage = error.message
      } else if (error instanceof Error) {
        errorMessage = error.message
      }
      
      updateStatus(`${errorMessage}`, "error", 5000)
    } finally {
      setIsLoading(false)
    }
  }

  // const handleDebugCookies = async () => {
  //   setIsLoading(true)
  //   updateStatus("正在调试 Cookie...", "loading")
  //   try {
  //     const report = await debugCompareCookies()
  //     updateStatus(
  //       `按url:${report.byUrl.total}/${report.byUrl.httpOnly} HttpOnly，按domain:${report.byDomain.total}/${report.byDomain.httpOnly}`,
  //       "info" as StatusType,
  //       5000
  //     )
  //     console.log('[Cookie Debug] 按url vs 按domain', report)
  //   } catch (e) {
  //     const msg = e instanceof Error ? e.message : String(e)
  //     updateStatus(`Cookie 调试失败: ${msg}`, "error", 5000)
  //   } finally {
  //     setIsLoading(false)
  //   }
  // }

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

      {/* 剪贴板状态指示 */}
      {clipboardInfo && (
        <div className="plasmo-mb-3 plasmo-p-2 plasmo-bg-gray-50 plasmo-rounded-md">
          <div className="plasmo-flex plasmo-items-center plasmo-justify-between plasmo-text-xs">
            <span className="plasmo-text-gray-600">剪贴板状态:</span>
            <div className="plasmo-flex plasmo-items-center plasmo-space-x-2">
              <span className={`plasmo-px-2 plasmo-py-1 plasmo-rounded ${
                clipboardInfo.hasContent 
                  ? "plasmo-bg-green-100 plasmo-text-green-600" 
                  : "plasmo-bg-gray-100 plasmo-text-gray-500"
              }`}>
                {clipboardInfo.hasContent ? "有内容" : "无内容"}
              </span>
              {clipboardInfo.hasContent && (
                <span className={`plasmo-px-2 plasmo-py-1 plasmo-rounded ${
                  clipboardInfo.isJSON 
                    ? "plasmo-bg-blue-100 plasmo-text-blue-600" 
                    : "plasmo-bg-yellow-100 plasmo-text-yellow-600"
                }`}>
                  {clipboardInfo.isJSON ? "JSON" : "文本"}
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 手动输入界面 */}
      {showManualInput && (
        <div className="plasmo-mb-4 plasmo-p-3 plasmo-border plasmo-border-yellow-200 plasmo-bg-yellow-50 plasmo-rounded-md">
          <div className="plasmo-mb-2">
            <label className="plasmo-block plasmo-text-xs plasmo-font-medium plasmo-text-gray-700 plasmo-mb-2">
              手动输入会话数据 (JSON格式):
            </label>
            <textarea
              value={manualSessionData}
              onChange={(e) => setManualSessionData(e.target.value)}
              className="plasmo-w-full plasmo-h-20 plasmo-text-xs plasmo-p-2 plasmo-border plasmo-border-gray-300 plasmo-rounded plasmo-resize-none plasmo-font-mono"
              placeholder="请粘贴会话 JSON 数据..."
              disabled={isLoading}
            />
          </div>
          <div className="plasmo-flex plasmo-space-x-2">
            <ActionButton
              onClick={handleManualApply}
              variant="primary"
              disabled={isLoading || !manualSessionData.trim()}
            >
              {isLoading ? "处理中..." : "应用"}
            </ActionButton>
            <ActionButton
              onClick={() => {
                setShowManualInput(false)
                setManualSessionData("")
                updateStatus("就绪", "ready")
              }}
              variant="secondary"
              disabled={isLoading}
            >
              取消
            </ActionButton>
          </div>
        </div>
      )}

      {/* 按钮组 */}
      <div className="plasmo-flex plasmo-flex-col plasmo-space-y-3">
        <ActionButton 
          onClick={handleCopySession}
          variant="primary"
          disabled={isLoading}
        >
          {isLoading && statusType === "loading" && status.includes("读取会话") 
            ? "读取中..." 
            : isLoading && statusType === "loading" && status.includes("复制") 
            ? "复制中..." 
            : "复制会话"}
        </ActionButton>

        {/* <ActionButton 
          onClick={handleDebugCookies}
          variant="secondary"
          disabled={isLoading}
        >
          调试 Cookie
        </ActionButton> */}
        
        <ActionButton 
          onClick={handleApplySession}
          variant="secondary"
          disabled={isLoading}
        >
          {isLoading && statusType === "loading" && status.includes("剪贴板") 
            ? "读取中..." 
            : isLoading && statusType === "loading" && status.includes("应用") 
            ? "应用中..." 
            : "应用会话"}
        </ActionButton>
        
        {!showManualInput && (
          <button
            onClick={() => setShowManualInput(true)}
            className="plasmo-text-xs plasmo-text-gray-500 plasmo-underline plasmo-cursor-pointer hover:plasmo-text-gray-700"
            disabled={isLoading}
          >
            手动输入会话数据
          </button>
        )}
      </div>

      {/* 增强的状态栏 */}
      <StatusBar 
        status={status}
        type={statusType}
        isLoading={isLoading && statusType === "loading"}
      />
    </div>
  )
}

export default IndexPopup
