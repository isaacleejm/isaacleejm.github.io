import type { ReactNode } from 'react'

export function ChatNotice({
  id,
  title,
  isOpen,
  onDismiss,
  children,
}: {
  id: string
  title: string
  isOpen: boolean
  onDismiss: () => void
  children: ReactNode
}) {
  return (
    <aside
      id={id}
      className="chat-notice"
      aria-label="Chat notice"
      hidden={!isOpen}
    >
      <div className="chat-notice-header">
        <h3>{title}</h3>
        <button
          className="chat-notice-close"
          type="button"
          aria-label="Hide chat notice"
          onClick={onDismiss}
        >
          <svg
            aria-hidden="true"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          >
            <path d="m6 6 12 12M6 18 18 6" />
          </svg>
        </button>
      </div>
      <div className="chat-notice-body">{children}</div>
    </aside>
  )
}
