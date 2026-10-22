import {
  useEffect,
  useId,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
} from 'react'
import { MAX_MESSAGE_LENGTH } from './types'
import { useChat } from './useChat'
import { ChatNotice } from './ChatNotice'
import './ChatWidget.css'

function ChatIcon() {
  return (
    <svg
      aria-hidden="true"
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 15a3 3 0 0 1-3 3H9l-5 3V6a3 3 0 0 1 3-3h10a3 3 0 0 1 3 3Z" />
      <path d="m8 8 3 3-3 3m6 0h2" />
    </svg>
  )
}

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [isNoticeOpen, setIsNoticeOpen] = useState(true)
  const [draft, setDraft] = useState('')
  const dialogRef = useRef<HTMLDialogElement>(null)
  const launcherRef = useRef<HTMLButtonElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const transcriptRef = useRef<HTMLDivElement>(null)
  const noticeToggleRef = useRef<HTMLButtonElement>(null)
  const noticeId = useId()
  const { messages, status, error, sendMessage, retry, clearChat } = useChat()
  const canSend = status === 'idle' && draft.trim().length > 0

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    if (isOpen && !dialog.open) {
      dialog.showModal()
      inputRef.current?.focus()
    } else if (!isOpen && dialog.open) {
      dialog.close()
    }
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [isOpen])

  useEffect(() => {
    if (isOpen && transcriptRef.current) {
      transcriptRef.current.scrollTop = messages.length
        ? transcriptRef.current.scrollHeight
        : 0
    }
  }, [messages, status, isOpen])

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (canSend && sendMessage(draft)) setDraft('')
  }

  function clear() {
    clearChat()
    setDraft('')
    inputRef.current?.focus()
  }

  function choosePrompt(prompt: string) {
    setDraft(prompt)
    inputRef.current?.focus()
  }

  function keepFocusInPanel(event: KeyboardEvent<HTMLDialogElement>) {
    if (event.key !== 'Tab') return

    const controls = event.currentTarget.querySelectorAll<HTMLElement>(
      'button:not(:disabled), textarea:not(:disabled), [tabindex="0"]',
    )
    const first = controls[0]
    const last = controls[controls.length - 1]

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault()
      last?.focus()
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault()
      first?.focus()
    }
  }

  return (
    <>
      <button
        ref={launcherRef}
        className="chat-launcher"
        type="button"
        aria-haspopup="dialog"
        aria-controls="portfolio-chat"
        onClick={() => setIsOpen(true)}
      >
        <ChatIcon />
        <span>Ask about Isaac</span>
        <span className="chat-launcher-badge">Demo</span>
      </button>

      <dialog
        ref={dialogRef}
        id="portfolio-chat"
        className="chat-panel"
        aria-labelledby="chat-title"
        aria-describedby="chat-summary"
        onKeyDown={keepFocusInPanel}
        onClose={() => {
          setIsOpen(false)
          launcherRef.current?.focus()
        }}
      >
        <header className="chat-header">
          <div className="chat-heading">
            <span className="chat-heading-icon">
              <ChatIcon />
            </span>
            <div>
              <h2 id="chat-title">Ask about Isaac</h2>
              <div className="chat-heading-meta">
                <p id="chat-summary">Portfolio assistant</p>
                <button
                  ref={noticeToggleRef}
                  className="chat-details"
                  type="button"
                  aria-expanded={isNoticeOpen}
                  aria-controls={noticeId}
                  onClick={() => setIsNoticeOpen(!isNoticeOpen)}
                >
                  Details
                </button>
              </div>
            </div>
          </div>
          <button
            className="chat-close"
            type="button"
            aria-label="Close chat"
            onClick={() => setIsOpen(false)}
          >
            <svg
              aria-hidden="true"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
            >
              <path d="m6 6 12 12M6 18 18 6" />
            </svg>
          </button>
        </header>

        <ChatNotice
          id={noticeId}
          title="Replies are simulated"
          isOpen={isNoticeOpen}
          onDismiss={() => {
            setIsNoticeOpen(false)
            noticeToggleRef.current?.focus()
          }}
        >
          <p>Gemini isn’t connected yet, and messages stay in this browser.</p>
          <button
            className="chat-demo-error"
            type="button"
            disabled={status !== 'idle'}
            onClick={() => choosePrompt('/error')}
          >
            Try a demo error
          </button>
        </ChatNotice>

        <div
          ref={transcriptRef}
          className="chat-transcript"
          role="log"
          aria-label="Conversation"
          aria-live="polite"
          aria-relevant="additions text"
          tabIndex={0}
        >
          {messages.length === 0 ? (
            <div className="chat-empty">
              <span className="chat-empty-code" aria-hidden="true">
                {'{ hello }'}
              </span>
              <h3>A conversation about my work.</h3>
              <p>
                This panel will help you explore my projects, skills, and
                contributions. For now, try the chat controls with a demo
                message.
              </p>
              <div className="chat-prompts" aria-label="Example questions">
                <button
                  type="button"
                  onClick={() =>
                    choosePrompt('What projects has Isaac worked on?')
                  }
                >
                  Explore my projects <span aria-hidden="true">↗</span>
                </button>
                <button
                  type="button"
                  onClick={() =>
                    choosePrompt('What did Isaac contribute to PyHelper?')
                  }
                >
                  Ask about a contribution <span aria-hidden="true">↗</span>
                </button>
              </div>
            </div>
          ) : (
            <ol className="chat-messages">
              {messages.map((message) => (
                <li
                  key={message.id}
                  className={`chat-message chat-message--${message.role}`}
                >
                  <p className="chat-speaker">
                    {message.role === 'user' ? 'You' : 'Demo assistant'}
                  </p>
                  <p className="chat-message-content">{message.content}</p>
                </li>
              ))}
            </ol>
          )}
          {status === 'loading' && (
            <p className="chat-loading" role="status">
              <span className="chat-loading-dots" aria-hidden="true">
                <span />
                <span />
                <span />
              </span>
              Preparing demo reply…
            </p>
          )}
          {error && (
            <div className="chat-error">
              <p role="alert">{error}</p>
              <button type="button" onClick={retry}>
                Retry message
              </button>
            </div>
          )}
        </div>

        <form className="chat-composer" onSubmit={submit}>
          <div className="chat-composer-heading">
            <label htmlFor="chat-message">Your message</label>
            <button
              className="chat-clear"
              type="button"
              disabled={messages.length === 0 && !draft}
              onClick={clear}
            >
              Clear chat
            </button>
          </div>
          <textarea
            ref={inputRef}
            id="chat-message"
            name="message"
            rows={2}
            maxLength={MAX_MESSAGE_LENGTH}
            value={draft}
            readOnly={status === 'error'}
            placeholder="Ask about a project or skill…"
            aria-describedby="chat-input-hint"
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if (
                event.key === 'Enter' &&
                !event.shiftKey &&
                !event.nativeEvent.isComposing
              ) {
                event.preventDefault()
                if (canSend) event.currentTarget.form?.requestSubmit()
              }
            }}
          />
          <div className="chat-composer-footer">
            <div>
              <p id="chat-input-hint">
                {status === 'error'
                  ? 'Retry or clear the chat to continue.'
                  : status === 'loading'
                    ? 'You can draft your next message while waiting.'
                    : 'Enter to send · Shift+Enter for a new line'}
              </p>
              <p className="chat-character-count">
                {draft.length.toLocaleString()} /{' '}
                {MAX_MESSAGE_LENGTH.toLocaleString()}
              </p>
            </div>
            <button className="chat-send" type="submit" disabled={!canSend}>
              Send <span aria-hidden="true">↑</span>
            </button>
          </div>
        </form>
      </dialog>
    </>
  )
}
