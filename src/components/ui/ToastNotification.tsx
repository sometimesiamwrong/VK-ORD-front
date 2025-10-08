import React, { useEffect, useState } from 'react'
import { type MessageState } from '../../types'

interface ToastNotificationProps {
  message: MessageState
  onClose: () => void
}

export const ToastNotification: React.FC<ToastNotificationProps> = ({ message, onClose }) => {
  const [isVisible, setIsVisible] = useState(false)
  const [isExiting, setIsExiting] = useState(false)

  useEffect(() => {
    if (message.text && message.highlight) {
      setIsVisible(true)
      setIsExiting(false)
    } else if (message.text && !message.highlight) {
      // Start exit animation
      setIsExiting(true)
      const timer = setTimeout(() => {
        setIsVisible(false)
        onClose()
      }, 300) // Animation duration
      return () => clearTimeout(timer)
    }
  }, [message.text, message.highlight, onClose])

  if (!isVisible || !message.text) {
    return null
  }

  const getIcon = () => {
    switch (message.status) {
      case 'success':
        return '✅'
      case 'error':
        return '❌'
      case 'info':
      default:
        return 'ℹ️'
    }
  }

  return (
    <div
      className={`vk-toast vk-toast--${message.status} ${isExiting ? 'vk-toast--exiting' : ''}`}
      role="alert"
      aria-live="polite"
    >
      <div className="vk-toast__content">
        <span className="vk-toast__icon">{getIcon()}</span>
        <span className="vk-toast__text">{message.text}</span>
      </div>
    </div>
  )
}
