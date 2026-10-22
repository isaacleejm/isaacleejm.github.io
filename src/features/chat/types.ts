import type { ChatMessage } from '../../../shared/chat'

export type { ChatMessage } from '../../../shared/chat'
export { MAX_MESSAGE_LENGTH } from '../../../shared/chat'

export interface ChatEntry extends ChatMessage {
  id: string
}

export type ChatStatus = 'idle' | 'loading' | 'error'
