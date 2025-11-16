'use client'

import { useState } from 'react'

interface CoachingMessage {
  id: string
  message_type: string
  title: string
  content: string
  created_at: string
}

const MESSAGE_EMOJIS: Record<string, string> = {
  motivation: '💪',
  celebration: '🎉',
  tip: '💡',
  reminder: '⏰',
  progress: '📈',
  warning: '⚠️',
}

export function CoachingMessages({ messages }: { messages: CoachingMessage[] }) {
  const [dismissed, setDismissed] = useState<string[]>([])

  if (!messages || messages.length === 0) {
    return null
  }

  const visibleMessages = messages.filter(m => !dismissed.includes(m.id))

  if (visibleMessages.length === 0) {
    return null
  }

  const handleDismiss = (messageId: string) => {
    setDismissed([...dismissed, messageId])
  }

  return (
    <div className="space-y-3">
      {visibleMessages.map(message => (
        <div
          key={message.id}
          className={`relative p-4 rounded-lg border-l-4 ${
            message.message_type === 'celebration'
              ? 'bg-green-50 border-green-500'
              : message.message_type === 'warning'
              ? 'bg-yellow-50 border-yellow-500'
              : message.message_type === 'progress'
              ? 'bg-blue-50 border-blue-500'
              : 'bg-purple-50 border-purple-500'
          }`}
        >
          <button
            onClick={() => handleDismiss(message.id)}
            className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 text-xl"
          >
            ×
          </button>

          <div className="flex items-start gap-3 pr-8">
            <div className="text-2xl flex-shrink-0">
              {MESSAGE_EMOJIS[message.message_type] || '📢'}
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 mb-1">
                {message.title}
              </h3>
              <p className="text-sm text-gray-700">
                {message.content}
              </p>
              <div className="text-xs text-gray-500 mt-2">
                {new Date(message.created_at).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  hour: 'numeric',
                  minute: '2-digit',
                })}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
