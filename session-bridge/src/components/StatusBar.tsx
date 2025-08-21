import React from "react"

export type StatusType = "ready" | "loading" | "success" | "error"

interface StatusBarProps {
  status: string
  type: StatusType
  isLoading?: boolean
}

export const StatusBar: React.FC<StatusBarProps> = ({ 
  status, 
  type, 
  isLoading = false 
}) => {
  const getStatusStyles = () => {
    const baseClasses = "plasmo-mt-4 plasmo-text-xs plasmo-text-center plasmo-px-3 plasmo-py-2 plasmo-rounded-md plasmo-transition-all plasmo-duration-200"
    
    switch (type) {
      case "loading":
        return `${baseClasses} plasmo-text-blue-600 plasmo-bg-blue-50 plasmo-border plasmo-border-blue-200`
      case "success":
        return `${baseClasses} plasmo-text-green-600 plasmo-bg-green-50 plasmo-border plasmo-border-green-200`
      case "error":
        return `${baseClasses} plasmo-text-red-600 plasmo-bg-red-50 plasmo-border plasmo-border-red-200`
      case "ready":
      default:
        return `${baseClasses} plasmo-text-gray-500 plasmo-bg-gray-50`
    }
  }

  const getIcon = () => {
    if (isLoading) {
      return (
        <span className="plasmo-inline-block plasmo-w-3 plasmo-h-3 plasmo-mr-2 plasmo-border-2 plasmo-border-current plasmo-border-t-transparent plasmo-rounded-full plasmo-animate-spin"></span>
      )
    }

    switch (type) {
      case "success":
        return <span className="plasmo-mr-2">✅</span>
      case "error":
        return <span className="plasmo-mr-2">❌</span>
      case "loading":
        return <span className="plasmo-mr-2">⏳</span>
      default:
        return <span className="plasmo-mr-2">ℹ️</span>
    }
  }

  return (
    <div className={getStatusStyles()}>
      <div className="plasmo-flex plasmo-items-center plasmo-justify-center">
        {getIcon()}
        <span className="plasmo-text-xs plasmo-font-medium">{status}</span>
      </div>
    </div>
  )
}
