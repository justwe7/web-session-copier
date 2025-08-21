import React from "react"

interface ActionButtonProps {
  children: React.ReactNode
  onClick: () => void
  variant?: "primary" | "secondary"
  disabled?: boolean
}

export const ActionButton: React.FC<ActionButtonProps> = ({
  children,
  onClick,
  variant = "primary",
  disabled = false
}) => {
  const baseClasses = "plasmo-px-4 plasmo-py-2 plasmo-rounded-lg plasmo-font-medium plasmo-transition-all plasmo-border plasmo-cursor-pointer plasmo-text-sm"
  
  const variantClasses = {
    primary: "plasmo-bg-blue-600 plasmo-text-white plasmo-border-blue-600 hover:plasmo-bg-blue-700 hover:plasmo-border-blue-700 active:plasmo-scale-95",
    secondary: "plasmo-bg-gray-100 plasmo-text-gray-700 plasmo-border-gray-300 hover:plasmo-bg-gray-200 hover:plasmo-border-gray-400 active:plasmo-scale-95"
  }
  
  const disabledClasses = "plasmo-opacity-50 plasmo-cursor-not-allowed"
  
  const buttonClasses = `${baseClasses} ${variantClasses[variant]} ${disabled ? disabledClasses : ""}`
  
  return (
    <button
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      className={buttonClasses}
      type="button"
    >
      {children}
    </button>
  )
}
