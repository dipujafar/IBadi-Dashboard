/* eslint-disable react-hooks/exhaustive-deps */
'use client'
import {
  IconArrowLeft,
  IconMessageCircle,
  IconSend,
  IconClock,
  IconCheck,
  IconX
} from '@tabler/icons-react'
import { useCallback, useEffect, useRef, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
import { useSocket } from '@/context/SocketContextApi'
import { useAppSelector } from '@/redux/hooks'
import { useForm } from 'react-hook-form'

// ─── Types matching exact server responses ─────────────────────────────────────

type MessageStatus = 'sending' | 'sent' | 'failed'

interface RawParticipant {
  id?: string
  chatId?: string
  userId?: string
  createdAt?: string
  updatedAt?: string
  user?: {
    id?: string
    name?: string
    email?: string
    profile?: string | null
    role?: string
    phoneNumber?: string
  }
}

interface RawLastMessage {
  id?: string
  text?: string
  seen?: boolean
  chatId?: string
  senderId?: string
  receiverId?: string
  createdAt?: string
  updatedAt?: string
}

interface RawMessage {
  id?: string
  _id?: string
  text?: string
  seen?: boolean
  createdAt?: string
  updatedAt?: string
  chatId?: string
  senderId?: string
  receiverId?: string
  images?: Array<{
    id?: string
    url?: string
    messageId?: string
    userId?: string | null
  }>
  chat?: { id?: string; status?: string; createdAt?: string; updatedAt?: string }
  sender?: {
    id?: string
    name?: string
    role?: string
    email?: string
    profile?: string | null
  }
  receiver?: {
    id?: string
    name?: string
    role?: string
    email?: string
    profile?: string | null
  }
}

interface RawChat {
  id?: string
  status?: string
  createdAt?: string
  updatedAt?: string
  participants?: RawParticipant[]
}

interface RawChatListItem {
  chat?: RawChat
  message?: RawLastMessage | string
  unreadMessageCount?: number
}

interface ChatParticipant {
  id: string
  name: string
  image?: string
  email?: string
}

interface ChatMessage {
  id: string
  senderId: string
  text: string
  imageUrls?: string[]
  timestamp?: string
  chatId?: string
  status?: MessageStatus
  isPending?: boolean
}

interface ChatListItem {
  chatId: string
  participant: ChatParticipant
  lastMessageText: string
  unreadCount: number
}

// ─── Parsers ───────────────────────────────────────────────────────────────────

function extractParticipant(raw: RawChatListItem): ChatParticipant | null {
  const participants = raw?.chat?.participants
  if (!Array.isArray(participants) || participants.length === 0) return null
  const p = participants[0]
  if (!p?.user) return null
  const u = p.user
  return {
    id: u.id ?? p.userId ?? '',
    name: u.name ?? 'Unknown User',
    image: u.profile ?? undefined,
    email: u.email,
  }
}

function extractLastMessageText(
  msg: RawLastMessage | string | undefined
): string {
  if (!msg) return ''
  if (typeof msg === 'string') return msg
  if (msg.text) return msg.text
  return ''
}

function parseChatList(res: unknown): ChatListItem[] {
  if (!res || typeof res !== 'object') return []
  const r = res as Record<string, unknown>
  let rawChats: RawChatListItem[] = []

  if (Array.isArray(r.chats)) {
    rawChats = r.chats as RawChatListItem[]
  } else if (r.data && typeof r.data === 'object') {
    const d = r.data as Record<string, unknown>
    if (Array.isArray(d.chats)) rawChats = d.chats as RawChatListItem[]
  }

  return rawChats
    .map((item): ChatListItem | null => {
      const chatId = item?.chat?.id
      if (!chatId) return null
      const participant = extractParticipant(item)
      if (!participant) return null
      return {
        chatId,
        participant,
        lastMessageText: extractLastMessageText(item.message),
        unreadCount: item.unreadMessageCount ?? 0,
      }
    })
    .filter((x): x is ChatListItem => x !== null)
}

function parseMessages(res: unknown): RawMessage[] {
  if (!res) return []
  if (Array.isArray(res)) return res as RawMessage[]
  if (typeof res !== 'object') return []

  const r = res as Record<string, unknown>

  if (Array.isArray(r.data)) return r.data as RawMessage[]

  if (r.data && typeof r.data === 'object') {
    const inner = r.data as Record<string, unknown>
    if (Array.isArray(inner.data)) return inner.data as RawMessage[]
  }

  return []
}

function normalizeMessage(raw: RawMessage): ChatMessage | null {
  if (!raw || typeof raw !== 'object') return null
  const id = raw.id ?? raw._id
  if (!id) return null

  const senderId = raw.senderId ?? raw.sender?.id ?? ''

  const imageUrls = raw.images
    ?.map((img) => img?.url)
    .filter((url): url is string => Boolean(url))

  return {
    id,
    senderId,
    text: raw.text ?? '',
    imageUrls: imageUrls?.length ? imageUrls : undefined,
    timestamp: raw.createdAt,
    chatId: raw.chatId ?? raw.chat?.id,
  }
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

function getInitials(name?: string | null): string {
  if (!name || typeof name !== 'string' || name.trim() === '') return '?'
  return name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('')
}

function formatMessageTime(iso?: string): string {
  if (!iso) return ''
  try {
    return new Date(iso).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    })
  } catch {
    return ''
  }
}

function formatDateDivider(iso?: string): string {
  if (!iso) return ''
  try {
    const date = new Date(iso)
    const now = new Date()
    const diffDays = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
    )
    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Yesterday'
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    })
  } catch {
    return ''
  }
}

function isSameDay(a?: string, b?: string): boolean {
  if (!a || !b) return false
  try {
    return new Date(a).toDateString() === new Date(b).toDateString()
  } catch {
    return false
  }
}

// ─── Avatar ────────────────────────────────────────────────────────────────────

function Avatar({
  name,
  image,
  size = 'md',
  showOnline,
}: {
  name?: string | null
  image?: string | null
  size?: 'sm' | 'md' | 'lg'
  showOnline?: boolean
}) {
  const sizeClass = {
    sm: 'size-8 text-xs',
    md: 'size-10 text-sm',
    lg: 'size-12 text-base',
  }[size]

  return (
    <div className='relative shrink-0'>
      {image ? (
        <img
          src={image}
          alt={name ?? 'User'}
          className={`${sizeClass} rounded-full object-cover shadow-sm`}
          onError={(e) => {
            e.currentTarget.style.display = 'none'
          }}
        />
      ) : (
        <span
          className={`
            ${sizeClass} flex items-center justify-center rounded-full
            bg-gradient-to-br from-[#00C0B5] to-[#009e94] font-bold text-white shadow-sm
          `}
        >
          {getInitials(name)}
        </span>
      )}
      {showOnline !== undefined && (
        <span
          className={`
            absolute -right-0.5 -bottom-0.5 size-2.5 rounded-full border-2 border-background
            ${showOnline ? 'bg-emerald-500' : 'bg-slate-400'}
          `}
        />
      )}
    </div>
  )
}

// ─── Message Status Icon ───────────────────────────────────────────────────────

function MessageStatusIcon({ status }: { status?: MessageStatus }) {
  if (status === 'sending') return <IconClock className='size-3 opacity-50' />
  if (status === 'sent') return <IconCheck className='size-3 opacity-60' />
  if (status === 'failed') return <IconX className='size-3 text-destructive' />
  return null
}

// ─── Date Divider ──────────────────────────────────────────────────────────────

function DateDivider({ label }: { label: string }) {
  return (
    <div className='flex items-center gap-3 py-2'>
      <div className='h-px flex-1 bg-border' />
      <span className='text-[11px] font-medium text-muted-foreground'>
        {label}
      </span>
      <div className='h-px flex-1 bg-border' />
    </div>
  )
}

// ─── Typing Bubble ─────────────────────────────────────────────────────────────

function TypingBubble() {
  return (
    <div className='flex items-end gap-2'>
      <div className='flex size-7 shrink-0 items-center justify-center rounded-full bg-muted text-[10px] font-bold text-muted-foreground'>
        …
      </div>
      <div className='flex items-center gap-1 rounded-2xl rounded-bl-sm bg-muted px-4 py-3'>
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className='size-1.5 rounded-full bg-muted-foreground/50'
            style={{ animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite` }}
          />
        ))}
      </div>
    </div>
  )
}

// ─── Message Bubble ────────────────────────────────────────────────────────────

function MessageBubble({
  message,
  isOwn,
  showAvatar,
  participant,
}: {
  message: ChatMessage
  isOwn: boolean
  showAvatar: boolean
  participant?: ChatParticipant
}) {
  return (
    <div
      className={`flex items-end gap-2 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}
    >
      <div className='size-7 shrink-0'>
        {!isOwn && showAvatar && participant && (
          <Avatar name={participant.name} image={participant.image} size='sm' />
        )}
      </div>

      <div
        className={`group flex max-w-[70%] flex-col gap-1 ${
          isOwn ? 'items-end' : 'items-start'
        }`}
      >
        {message.imageUrls && message.imageUrls.length > 0 && (
          <div className='flex flex-wrap gap-1'>
            {message.imageUrls.map((url, i) => (
              <img
                key={i}
                src={url}
                alt='attachment'
                className='max-h-48 max-w-xs rounded-xl object-cover shadow-sm'
              />
            ))}
          </div>
        )}

        {message.text && (
          <div
            className={`
              rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-sm
              ${
                isOwn
                  ? 'rounded-br-sm bg-[#00C0B5] text-white'
                  : 'rounded-bl-sm bg-muted text-foreground'
              }
              ${message.isPending ? 'opacity-60' : ''}
            `}
          >
            {message.text}
          </div>
        )}

        <div className='flex items-center gap-1 px-1'>
          <span className='text-[10px] text-muted-foreground'>
            {formatMessageTime(message.timestamp)}
          </span>
          {isOwn && <MessageStatusIcon status={message.status} />}
        </div>
      </div>
    </div>
  )
}

// ─── Conversation Item ─────────────────────────────────────────────────────────

function ConversationItem({
  item,
  isActive,
  isOnline,
  onClick,
}: {
  item: ChatListItem
  isActive: boolean
  isOnline: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`
        flex w-full items-start gap-3 rounded-xl p-3 text-left transition-colors
        ${isActive ? 'bg-accent' : 'hover:bg-accent/50'}
      `}
    >
      <Avatar
        name={item.participant.name}
        image={item.participant.image}
        size='md'
        showOnline={isOnline}
      />
      <div className='min-w-0 flex-1'>
        <div className='flex items-center justify-between gap-1'>
          <span
            className={`truncate text-sm font-semibold ${
              item.unreadCount > 0 ? 'text-foreground' : 'text-foreground/80'
            }`}
          >
            {item.participant.name}
          </span>
          {item.unreadCount > 0 && (
            <span className='flex size-5 shrink-0 items-center justify-center rounded-full bg-[#00C0B5] text-[10px] font-bold text-white'>
              {item.unreadCount > 9 ? '9+' : item.unreadCount}
            </span>
          )}
        </div>
        {item.lastMessageText && (
          <p
            className={`mt-0.5 truncate text-xs ${
              item.unreadCount > 0
                ? 'font-medium text-foreground/90'
                : 'text-muted-foreground'
            }`}
          >
            {item.lastMessageText}
          </p>
        )}
      </div>
    </button>
  )
}

// ─── Conversation List (left panel) ───────────────────────────────────────────

function ConversationList({
  items,
  activeChatId,
  isLoading,
  onlineUsers,
  onSelect,
}: {
  items: ChatListItem[]
  activeChatId: string
  isLoading: boolean
  onlineUsers: string[]
  onSelect: (item: ChatListItem) => void
}) {
  return (
    <aside className='flex h-full w-full shrink-0 flex-col border-r md:w-72 xl:w-80'>
      <div className='px-5 py-4'>
        <h2 className='text-lg font-bold tracking-tight'>Messages</h2>
        <p className='text-xs text-muted-foreground mt-0.5'>
          {items.length} conversation{items.length !== 1 ? 's' : ''}
        </p>
      </div>

      <Separator />

      <div className='flex-1 overflow-y-auto'>
        {isLoading ? (
          <div className='flex flex-col gap-0.5 p-2'>
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className='flex gap-3 rounded-xl p-3'>
                <Skeleton className='size-10 shrink-0 rounded-full' />
                <div className='flex flex-1 flex-col gap-1.5'>
                  <Skeleton className='h-3.5 w-28 rounded' />
                  <Skeleton className='h-3 w-full rounded' />
                </div>
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className='flex flex-col items-center justify-center gap-2 py-16 text-center'>
            <IconMessageCircle className='size-8 text-muted-foreground/40' />
            <p className='text-sm text-muted-foreground'>No conversations yet</p>
          </div>
        ) : (
          <div className='flex flex-col gap-0.5 p-2'>
            {items.map((item) => (
              <ConversationItem
                key={item.chatId}
                item={item}
                isActive={activeChatId === item.chatId}
                isOnline={onlineUsers.includes(item.participant.id)}
                onClick={() => onSelect(item)}
              />
            ))}
          </div>
        )}
      </div>
    </aside>
  )
}

// ─── Chat Input ────────────────────────────────────────────────────────────────

function ChatInput({
  disabled,
  onSend,
  onTyping,
}: {
  disabled: boolean
  onSend: (text: string) => void
  onTyping?: () => void
}) {
  const { register, handleSubmit, reset, watch } = useForm<{ message: string }>()
  const value = watch('message', '')

  const onSubmit = (data: { message: string }) => {
    const trimmed = data.message?.trim()
    if (!trimmed || disabled) return
    onSend(trimmed)
    reset()
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(onSubmit)()
    }
    onTyping?.()
  }

  return (
    <div className='border-t bg-background px-4 py-3'>
      <div className='flex items-end gap-2 rounded-2xl border bg-muted/30 px-4 py-2 focus-within:ring-2 focus-within:ring-[#00C0B5]/30'>
        <Textarea
          placeholder='Type a message… (Enter to send, Shift+Enter for newline)'
          disabled={disabled}
          rows={1}
          onKeyDown={handleKeyDown}
          className='
            max-h-32 min-h-9 flex-1 resize-none border-0 bg-transparent p-0 pl-3
            text-sm shadow-none focus-visible:ring-0
          '
          {...register('message', { required: true })}
        />
        <Button
          size='icon'
          type='button'
          disabled={disabled || !value?.trim()}
          onClick={handleSubmit(onSubmit)}
          className='
            mb-0.5 size-8 shrink-0 rounded-full
            bg-[#00C0B5] text-white
            shadow-sm hover:opacity-90 disabled:opacity-40
          '
        >
          <IconSend className='size-4' />
        </Button>
      </div>
      <p className='mt-1.5 text-center text-[10px] text-muted-foreground'>
        Enter to send · Shift+Enter for new line
      </p>
    </div>
  )
}

// ─── Empty state ───────────────────────────────────────────────────────────────

function NoConversationSelected() {
  return (
    <div className='flex flex-1 flex-col items-center justify-center gap-4 text-center h-[calc(100vh-320px)]'>
      <div className='flex size-20 items-center justify-center rounded-full bg-muted'>
        <IconMessageCircle className='size-10 text-muted-foreground/40' />
      </div>
      <div>
        <p className='text-base font-semibold text-foreground/80'>
          No conversation selected
        </p>
        <p className='mt-1 text-sm text-muted-foreground'>
          Choose a conversation from the left to get started
        </p>
      </div>
    </div>
  )
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function CustomerSupportPage() {
  const { socket } = useSocket()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const user: any = useAppSelector((state) => state.auth.user)
  const currentUserId: string = user?.userId ?? user?.id ?? ''

  // ── State ──────────────────────────────────────────────────────────────────
  const [chatItems, setChatItems] = useState<ChatListItem[]>([])
  const [isChatListLoading, setIsChatListLoading] = useState(false)

  const [activeItem, setActiveItem] = useState<ChatListItem | null>(null)
  const [activeChatId, setActiveChatId] = useState<string>('')

  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isMessagesLoading, setIsMessagesLoading] = useState(false)

  const [onlineUsers, setOnlineUsers] = useState<string[]>([])
  const [isTyping, setIsTyping] = useState(false)

  // ── Mobile view state: 'list' | 'chat' ────────────────────────────────────
  const [mobileView, setMobileView] = useState<'list' | 'chat'>('list')

  const chatBoxRef = useRef<HTMLDivElement>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const activeChatIdRef = useRef<string>('')

  useEffect(() => {
    activeChatIdRef.current = activeChatId
  }, [activeChatId])

  // ── Auto-scroll to bottom ──────────────────────────────────────────────────
  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight
    }
  }, [messages, isTyping])

  // ── Chat list ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!socket || !currentUserId) return

    const fetchChatList = () => {
      setIsChatListLoading(true)
      socket.emit('my_chat_list', {})
    }

    const handleChatList = (res: unknown) => {
      try {
        setChatItems(parseChatList(res))
      } catch (err) {
        console.error('[chat_list] parse error:', err)
        setChatItems([])
      } finally {
        setIsChatListLoading(false)
      }
    }

    socket.on('chat_list', handleChatList)
    if (socket.connected) fetchChatList()
    socket.on('connect', fetchChatList)

    return () => {
      socket.off('chat_list', handleChatList)
      socket.off('connect', fetchChatList)
    }
  }, [socket, currentUserId])

  // ── Online users ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (!socket) return

    const handleOnline = (res: unknown) => {
      try {
        setOnlineUsers(
          Array.isArray(res)
            ? res.filter((id): id is string => typeof id === 'string')
            : []
        )
      } catch {
        setOnlineUsers([])
      }
    }

    socket.on('onlineUsersList', handleOnline)
    return () => {
      socket.off('onlineUsersList', handleOnline)
    }
  }, [socket])

  // ── Messages for active conversation ──────────────────────────────────────
  useEffect(() => {
    if (!socket || !currentUserId || !activeItem) return

    const participantUserId = activeItem.participant.id

    const fetchMessages = () => {
      setIsMessagesLoading(true)
      socket.emit('message_page', { userId: participantUserId })
    }

    const handleMessages = (res: unknown) => {
      try {
        const raw = parseMessages(res)
        const normalized = raw
          .map(normalizeMessage)
          .filter((m): m is ChatMessage => m !== null)
        setMessages(normalized)
      } catch (err) {
        console.error('[message] parse error:', err)
        setMessages([])
      } finally {
        setIsMessagesLoading(false)
      }

      const chatId = activeChatIdRef.current
      if (chatId) socket.emit('seen', { chatId })
    }

    socket.on('message', handleMessages)
    if (socket.connected) fetchMessages()
    socket.on('connect', fetchMessages)

    return () => {
      socket.off('message', handleMessages)
      socket.off('connect', fetchMessages)
    }
  }, [socket, currentUserId, activeItem])

  // ── Real-time new messages ─────────────────────────────────────────────────
  useEffect(() => {
    if (!socket) return

    const handleNewMessage = (res: unknown) => {
      if (!res || typeof res !== 'object') return

      const normalized = normalizeMessage(res as RawMessage)
      if (!normalized) return

      const currentChatId = activeChatIdRef.current
      const msgChatId = normalized.chatId

      if (currentChatId && msgChatId && msgChatId !== currentChatId) {
        setChatItems((prev) =>
          prev.map((item) =>
            item.chatId === msgChatId
              ? {
                  ...item,
                  unreadCount: item.unreadCount + 1,
                  lastMessageText: normalized.text || item.lastMessageText,
                }
              : item
          )
        )
        return
      }

      setMessages((prev) => {
        const withoutOptimistic = prev.filter(
          (m) =>
            !(
              m.isPending &&
              m.text === normalized.text &&
              m.senderId === normalized.senderId
            )
        )
        if (withoutOptimistic.find((m) => m.id === normalized.id))
          return withoutOptimistic
        return [...withoutOptimistic, normalized]
      })

      if (currentChatId) socket.emit('seen', { chatId: currentChatId })
    }

    socket.on('new_message', handleNewMessage)
    return () => {
      socket.off('new_message', handleNewMessage)
    }
  }, [socket])

  // ── Typing indicator ───────────────────────────────────────────────────────
  useEffect(() => {
    if (!socket || !activeChatId) return

    const handleTyping = (res: unknown) => {
      if (!res || typeof res !== 'object') return
      const r = res as { userId?: string; isTyping?: boolean }
      if (r.userId && r.userId !== currentUserId) {
        setIsTyping(!!r.isTyping)
        if (r.isTyping) {
          if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
          typingTimeoutRef.current = setTimeout(
            () => setIsTyping(false),
            4000
          )
        }
      }
    }

    socket.on(`typing::${activeChatId}`, handleTyping)
    return () => {
      socket.off(`typing::${activeChatId}`, handleTyping)
    }
  }, [socket, activeChatId, currentUserId])

  // ── Select conversation ────────────────────────────────────────────────────
  const handleSelectConversation = useCallback(
    (item: ChatListItem) => {
      if (item.chatId === activeChatId) return
      setActiveItem(item)
      setActiveChatId(item.chatId)
      activeChatIdRef.current = item.chatId
      setMessages([])
      setIsTyping(false)
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
      setChatItems((prev) =>
        prev.map((c) =>
          c.chatId === item.chatId ? { ...c, unreadCount: 0 } : c
        )
      )
      socket?.emit('seen', { chatId: item.chatId })
      // On mobile, switch to chat view
      setMobileView('chat')
    },
    [activeChatId, socket]
  )

  // ── Back to list (mobile) ──────────────────────────────────────────────────
  const handleBackToList = useCallback(() => {
    setMobileView('list')
  }, [])

  // ── Send message ───────────────────────────────────────────────────────────
  const handleSend = useCallback(
    (text: string) => {
      if (!socket || !currentUserId || !activeItem) return

      const tempId = `tmp_${Date.now()}`
      const optimistic: ChatMessage = {
        id: tempId,
        senderId: currentUserId,
        text,
        timestamp: new Date().toISOString(),
        chatId: activeChatId,
        status: 'sending',
        isPending: true,
      }
      setMessages((prev) => [...prev, optimistic])

      socket.emit('send_message', {
        receiverId: activeItem.participant.id,
        text,
      })

      setTimeout(() => {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === tempId
              ? { ...m, status: 'sent' as MessageStatus, isPending: false }
              : m
          )
        )
      }, 800)
    },
    [socket, currentUserId, activeItem, activeChatId]
  )

  // ── Emit typing ────────────────────────────────────────────────────────────
  const handleTyping = useCallback(() => {
    if (!socket || !activeChatId) return
    socket.emit('typing', { chatId: activeChatId, isTyping: true })
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('typing', { chatId: activeChatId, isTyping: false })
    }, 2000)
  }, [socket, activeChatId])

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className='flex flex-1 flex-col min-h-0 overflow-hidden'>
      {/* Page title */}
      <div className='flex h-12 shrink-0 items-center justify-between px-1 pb-3'>
        <div>
          <h1 className='md:text-xl text-sm font-bold tracking-tight'>Customer Support</h1>
          <p className='text-xs text-muted-foreground'>
            {chatItems.length} conversation
            {chatItems.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div className='flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs text-muted-foreground'>
          <span
            className={`size-2 rounded-full ${
              socket?.connected ? 'bg-emerald-500' : 'bg-amber-500'
            }`}
          />
          {socket?.connected ? 'Live' : 'Connecting…'}
        </div>
      </div>

      {/* Main layout */}
      <div className='flex min-h-0 flex-1 overflow-hidden rounded-2xl border bg-background shadow-sm'>

        {/* ── Left — conversation list ────────────────────────────────────────
            Desktop: always visible as sidebar
            Mobile:  visible only when mobileView === 'list'
        ──────────────────────────────────────────────────────────────────── */}
        <div
          className={`
            h-full flex-col border-r
            md:flex md:w-72 xl:w-80
            ${mobileView === 'list' ? 'flex w-full' : 'hidden'}
          `}
        >
          <ConversationList
            items={chatItems}
            activeChatId={activeChatId}
            isLoading={isChatListLoading}
            onlineUsers={onlineUsers}
            onSelect={handleSelectConversation}
          />
        </div>

        {/* ── Right — chat area ───────────────────────────────────────────────
            Desktop: always visible
            Mobile:  visible only when mobileView === 'chat'
        ──────────────────────────────────────────────────────────────────── */}
        <div
          className={`
            min-w-0 flex-1 flex-col
            md:flex
            ${mobileView === 'chat' ? 'flex w-full' : 'hidden'}
          `}
        >
          {!activeItem ? (
            <NoConversationSelected />
          ) : (
            <>
              {/* Header */}
              <div className='flex h-16 shrink-0 items-center gap-3 border-b px-5'>
                {/* Back button — mobile only */}
                <button
                  onClick={handleBackToList}
                  className='mr-1 flex shrink-0 items-center justify-center rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-accent md:hidden'
                  aria-label='Back to conversations'
                >
                  <IconArrowLeft className='size-5' />
                </button>

                <Avatar
                  name={activeItem.participant.name}
                  image={activeItem.participant.image}
                  size='sm'
                  showOnline={onlineUsers.includes(activeItem.participant.id)}
                />
                <div className='min-w-0'>
                  <p className='truncate text-sm font-semibold'>
                    {activeItem.participant.name}
                  </p>
                  <p className='text-xs text-muted-foreground'>
                    {onlineUsers.includes(activeItem.participant.id)
                      ? 'Online'
                      : 'Offline'}
                  </p>
                </div>
              </div>

              {/* Messages — fixed height, scrollable */}
              <div
                ref={chatBoxRef}
                className='flex flex-col gap-1 overflow-y-auto px-5 py-4 h-[calc(100vh-320px)]'
              >
                {isMessagesLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <div
                      key={i}
                      className={`flex gap-2 ${
                        i % 2 === 0 ? 'flex-row' : 'flex-row-reverse'
                      }`}
                    >
                      <Skeleton className='size-7 shrink-0 rounded-full' />
                      <Skeleton
                        className={`h-10 rounded-2xl ${
                          i % 2 === 0 ? 'w-56' : 'w-44'
                        }`}
                      />
                    </div>
                  ))
                ) : messages.length === 0 ? (
                  <div className='flex flex-1 flex-col items-center justify-center gap-2 text-center'>
                    <IconMessageCircle className='size-12 text-muted-foreground/20' />
                    <p className='text-sm text-muted-foreground'>
                      No messages yet
                    </p>
                    <p className='text-xs text-muted-foreground/60'>
                      Start the conversation below
                    </p>
                  </div>
                ) : (
                  messages.map((msg, idx) => {
                    const prev = messages[idx - 1]
                    const showDivider =
                      !prev || !isSameDay(prev.timestamp, msg.timestamp)
                    const isNewGroup =
                      !prev ||
                      prev.senderId !== msg.senderId ||
                      new Date(msg.timestamp ?? 0).getTime() -
                        new Date(prev.timestamp ?? 0).getTime() >
                        5 * 60_000
                    const isOwn = msg.senderId === currentUserId

                    return (
                      <div key={msg.id}>
                        {showDivider && (
                          <DateDivider
                            label={formatDateDivider(msg.timestamp)}
                          />
                        )}
                        <div className={isNewGroup ? 'mt-3' : 'mt-0.5'}>
                          <MessageBubble
                            message={msg}
                            isOwn={isOwn}
                            showAvatar={isNewGroup}
                            participant={activeItem.participant}
                          />
                        </div>
                      </div>
                    )
                  })
                )}

                {isTyping && (
                  <div className='mt-3'>
                    <TypingBubble />
                  </div>
                )}
              </div>

              {/* Input */}
              <ChatInput
                disabled={!socket?.connected}
                onSend={handleSend}
                onTyping={handleTyping}
              />
            </>
          )}
        </div>
      </div>
    </div>
  )
}