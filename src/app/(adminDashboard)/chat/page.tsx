/* eslint-disable react-hooks/preserve-manual-memoization */
'use client'
import {
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

// ─── Types ─────────────────────────────────────────────────────────────────────

type MessageStatus = 'sending' | 'sent' | 'failed'

interface ServerMessage {
  _id: string
  sender: string        // userId string from server
  receiver?: string
  text?: string
  imageUrl?: string[]
  seen?: boolean
  chat?: string
  createdAt?: string
  updatedAt?: string
}

interface ChatMessage {
  id: string
  sender: string        // userId of sender
  text: string
  imageUrl?: string[]
  timestamp?: string    // normalized from createdAt
  status?: MessageStatus
  isPending?: boolean
}

/** Normalize a raw server message into our ChatMessage shape */
function normalizeMessage(raw: ServerMessage): ChatMessage {
  return {
    id: raw._id,
    sender: raw.sender,
    text: raw.text ?? '',
    imageUrl: raw.imageUrl,
    timestamp: raw.createdAt,
  }
}

interface ChatParticipant {
  _id: string
  name: string
  image?: string
}

interface LastMessage {
  _id?: string
  text?: string
  imageUrl?: string[]
  seen?: boolean
  sender?: string
  receiver?: string
  chat?: string
  createdAt?: string
  updatedAt?: string
}

interface ChatListItem {
  chat: {
    _id: string
    participants: ChatParticipant[]
  }
  // The server returns the full last-message document, not a plain string
  message?: LastMessage | string
  unreadMessageCount?: number
}

/** Safely extract display text from whatever the server sends as `message` */
function getLastMessageText(message: LastMessage | string | undefined): string {
  if (!message) return ''
  if (typeof message === 'string') return message
  if (message.text) return message.text
  if (message.imageUrl?.length) return '📎 Image'
  return ''
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

function getInitials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('')
}

function formatTime(iso?: string) {
  if (!iso) return ''
  const date = new Date(iso)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60_000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffMins < 1) return 'just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays === 1) return 'Yesterday'
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function formatMessageTime(iso?: string) {
  if (!iso) return ''
  return new Date(iso).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  })
}

function formatDateDivider(iso?: string) {
  if (!iso) return ''
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
    day: 'numeric'
  })
}

function isSameDay(a?: string, b?: string) {
  if (!a || !b) return false
  return new Date(a).toDateString() === new Date(b).toDateString()
}

// ─── Avatar ────────────────────────────────────────────────────────────────────

function Avatar({
  name,
  image,
  size = 'md',
  showOnline
}: {
  name: string
  image?: string
  size?: 'sm' | 'md' | 'lg'
  showOnline?: boolean
}) {
  const sizeClass = {
    sm: 'size-8 text-xs',
    md: 'size-10 text-sm',
    lg: 'size-12 text-base'
  }[size]

  return (
    <div className='relative shrink-0'>
      {image ? (
        <img
          src={image}
          alt={name}
          className={`${sizeClass} rounded-full object-cover shadow-sm`}
        />
      ) : (
        <span
          className={`
            ${sizeClass} flex items-center justify-center rounded-full
            bg-linear-to-br from-[#00C0B5] to-[#00C0B5] font-bold text-white shadow-sm
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

// ─── Message Status ────────────────────────────────────────────────────────────

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
            style={{
              animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite`
            }}
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
  participant
}: {
  message: ChatMessage
  isOwn: boolean
  showAvatar: boolean
  participant?: ChatParticipant
}) {
  return (
    <div className={`flex items-end gap-2 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
      {/* Avatar space */}
      <div className='size-7 shrink-0'>
        {!isOwn && showAvatar && participant && (
          <Avatar name={participant.name} image={participant.image} size='sm' />
        )}
      </div>

      <div className={`group flex max-w-[70%] flex-col gap-1 ${isOwn ? 'items-end' : 'items-start'}`}>
        <div
          className={`
            rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-sm
            ${isOwn
              ? 'rounded-br-sm bg-[#00C0B5] text-white'
              : 'rounded-bl-sm bg-muted text-foreground'
            }
            ${message.isPending ? 'opacity-60' : ''}
          `}
        >
          {message.text}
        </div>
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
  chatData,
  isActive,
  isOnline,
  onClick
}: {
  chatData: ChatListItem
  isActive: boolean
  isOnline: boolean
  onClick: () => void
}) {
  const participant = chatData.chat.participants?.[0]
  if (!participant) return null

  return (
    <button
      onClick={onClick}
      className={`
        flex w-full items-start gap-3 rounded-xl p-3 text-left transition-colors
        ${isActive ? 'bg-accent' : 'hover:bg-accent/50'}
      `}
    >
      <Avatar name={participant.name} image={participant.image} size='md' showOnline={isOnline} />
      <div className='min-w-0 flex-1'>
        <div className='flex items-center justify-between gap-1'>
          <span className={`truncate text-sm font-semibold ${chatData.unreadMessageCount ? 'text-foreground' : 'text-foreground/80'}`}>
            {participant.name}
          </span>
          {chatData.unreadMessageCount && chatData.unreadMessageCount > 0 ? (
            <span className='flex size-5 shrink-0 items-center justify-center rounded-full bg-[#00C0B5] text-[10px] font-bold text-white'>
              {chatData.unreadMessageCount > 9 ? '9+' : chatData.unreadMessageCount}
            </span>
          ) : null}
        </div>
        {getLastMessageText(chatData.message) && (
          <p className={`mt-0.5 truncate text-xs ${chatData.unreadMessageCount ? 'font-medium text-foreground/90' : 'text-muted-foreground'}`}>
            {getLastMessageText(chatData.message)}
          </p>
        )}
      </div>
    </button>
  )
}

// ─── Left Panel ────────────────────────────────────────────────────────────────

function ConversationList({
  chatListData,
  activeUserId,
  isLoading,
  onlineUsers,
  onSelect
}: {
  chatListData: ChatListItem[]
  activeUserId: string
  isLoading: boolean
  onlineUsers: string[]
  onSelect: (userId: string, chatId: string, participant: ChatParticipant) => void
}) {
  return (
    <aside className='flex h-full w-72 shrink-0 flex-col border-r xl:w-80'>
      <div className='px-5 py-4'>
        <h2 className='text-lg font-bold tracking-tight'>Messages</h2>
        <p className='text-xs text-muted-foreground mt-0.5'>
          {chatListData.length} conversation{chatListData.length !== 1 ? 's' : ''}
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
        ) : chatListData.length === 0 ? (
          <div className='flex flex-col items-center justify-center gap-2 py-16 text-center'>
            <IconMessageCircle className='size-8 text-muted-foreground/40' />
            <p className='text-sm text-muted-foreground'>No conversations yet</p>
          </div>
        ) : (
          <div className='flex flex-col gap-0.5 p-2'>
            {chatListData.map((chatData, idx) => {
              const participant = chatData.chat.participants?.[0]
              if (!participant) return null
              return (
                <ConversationItem
                  key={idx}
                  chatData={chatData}
                  isActive={activeUserId === participant._id}
                  isOnline={onlineUsers.includes(participant._id)}
                  onClick={() => onSelect(participant._id, chatData.chat._id, participant)}
                />
              )
            })}
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
  onTyping
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

// ─── No Conversation Selected ──────────────────────────────────────────────────

function NoConversationSelected() {
  return (
    <div className='flex flex-1 flex-col items-center justify-center gap-4 text-center'>
      <div className='flex size-20 items-center justify-center rounded-full bg-muted'>
        <IconMessageCircle className='size-10 text-muted-foreground/40' />
      </div>
      <div>
        <p className='text-base font-semibold text-foreground/80'>No conversation selected</p>
        <p className='mt-1 text-sm text-muted-foreground'>
          Choose a conversation from the left to get started
        </p>
      </div>
    </div>
  )
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function CustomerSupportPage() {
  const { socket } = useSocket();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const user: any = useAppSelector((state) => state.auth.user)

  // ── State ──────────────────────────────────────────────────────────────────
  const [chatListData, setChatListData] = useState<ChatListItem[]>([])
  const [isChatListLoading, setIsChatListLoading] = useState(false)

  const [selectedUserId, setSelectedUserId] = useState<string>('')
  const [selectedChatId, setSelectedChatId] = useState<string>('')
  const [selectedParticipant, setSelectedParticipant] = useState<ChatParticipant | null>(null)

  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isMessagesLoading, setIsMessagesLoading] = useState(false)

  const [onlineUsers, setOnlineUsers] = useState<string[]>([])
  const [isTyping, setIsTyping] = useState(false)

  const chatBoxRef = useRef<HTMLDivElement>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);



  // ── Auto-scroll ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight
    }
  }, [messages, isTyping])

  // ── Chat list ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!socket || !user?.userId) return

    const fetchChatList = () => {
      setIsChatListLoading(true)
      socket.emit('my_chat_list', { page: 1, limit: 9999 })
    }

    const handleChatList = (res: { chats: ChatListItem[] }) => {
      setChatListData(res?.chats ?? [])
      setIsChatListLoading(false)
    }

    // Register listener FIRST, then emit — eliminates the race condition
    socket.on('chat_list', handleChatList)

    // Emit immediately if already connected, otherwise wait for the connect event
    if (socket.connected) {
      fetchChatList()
    }

    // Re-fetch on connect / reconnect (covers cold-start and socket drop cases)
    socket.on('connect', fetchChatList)

    return () => {
      socket.off('chat_list', handleChatList)
      socket.off('connect', fetchChatList)
    }
  }, [socket, user?.userId])

  // ── Online users ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (!socket || !user?.userId) return

    const handleOnlineUsers = (res: string[]) => setOnlineUsers(res)

    socket.on('onlineUser', handleOnlineUsers)

    return () => {
      socket.off('onlineUser', handleOnlineUsers)
    }
  }, [socket, user?.userId])

  // ── Messages for active conversation ──────────────────────────────────────
  useEffect(() => {
    if (!socket || !user?.userId || !selectedUserId) return

    const fetchMessages = () => {
      setIsMessagesLoading(true)
      socket.emit('message_page', { userId: selectedUserId, page: 1, limit: 9999 })
    }

    const handleMessages = (res: {
      success?: boolean
      data?: { data?: ServerMessage[] } | ServerMessage[]
    }) => {
      // Server shape: { data: { data: [...], meta: {...} } }
      // Handles both double-nested and flat array shapes defensively
      let raw: ServerMessage[] = []
      const outer = res?.data
      if (Array.isArray(outer)) {
        raw = outer
      } else if (outer && typeof outer === 'object' && 'data' in outer && Array.isArray((outer as { data: ServerMessage[] }).data)) {
        raw = (outer as { data: ServerMessage[] }).data
      }
      setMessages(raw.map(normalizeMessage).reverse())
      setIsMessagesLoading(false)

      if (selectedChatId) {
        socket.emit('seen', { chatId: selectedChatId })
      }
    }

    // Register listener FIRST, then emit
    socket.on('message', handleMessages)

    if (socket.connected) {
      fetchMessages()
    }

    // Re-fetch if socket reconnects while this conversation is open
    socket.on('connect', fetchMessages)

    return () => {
      socket.off('message', handleMessages)
      socket.off('connect', fetchMessages)
    }
  }, [socket, user?.userId, selectedUserId])

  // ── New message (real-time) ────────────────────────────────────────────────
  useEffect(() => {
    if (!socket || !selectedChatId) return

    const event = `new-message::${selectedChatId}`

    socket.on(event, (res: ServerMessage) => {
      const normalized = normalizeMessage(res)
      setMessages((prev) => {
        // Drop any matching optimistic (temp) message by text+sender, then append real one
        const withoutOptimistic = prev.filter(
          (m) => !(m.isPending && m.text === normalized.text && m.sender === normalized.sender)
        )
        const exists = withoutOptimistic.find((m) => m.id === normalized.id)
        if (exists) return withoutOptimistic
        return [...withoutOptimistic, normalized]
      })
      socket.emit('seen', { chatId: selectedChatId })
    })

    return () => {
      socket.off(event)
    }
  }, [socket, selectedChatId])

  // ── Typing indicator ───────────────────────────────────────────────────────
  useEffect(() => {
    if (!socket || !selectedChatId) return

    socket.on(`typing::${selectedChatId}`, (res: { userId: string; isTyping: boolean }) => {
      if (res.userId !== user?.userId) {
        setIsTyping(res.isTyping)
        if (res.isTyping) {
          if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
          typingTimeoutRef.current = setTimeout(() => setIsTyping(false), 4000)
        }
      }
    })

    return () => {
      socket.off(`typing::${selectedChatId}`)
    }
  }, [socket, selectedChatId, user?.userId])

  // ── Select conversation ────────────────────────────────────────────────────
  const handleSelectConversation = useCallback(
    (userId: string, chatId: string, participant: ChatParticipant) => {
      if (userId === selectedUserId) return
      setSelectedUserId(userId)
      setSelectedChatId(chatId)
      setSelectedParticipant(participant)
      setMessages([])
      setIsTyping(false)
       socket?.emit('seen', { chatId })
    },
    [selectedUserId]
  )

  // ── Send message ───────────────────────────────────────────────────────────
  const handleSend = useCallback(
    // eslint-disable-next-line react-hooks/preserve-manual-memoization
    (text: string) => {
      if (!socket || !user?.userId || !selectedUserId) return

      // Optimistic insert
      const tempId = `tmp_${Date.now()}`
      const optimistic: ChatMessage = {
        id: tempId,
        sender: user.userId,
        text,
        timestamp: new Date().toISOString(),
        status: 'sending',
        isPending: true
      }
      setMessages((prev) => [...prev, optimistic])

      socket.emit('send_message', { receiver: selectedUserId, text });



      // Mark optimistic as sent after a short delay (server will push real msg via new-message event)
      setTimeout(() => {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === tempId ? { ...m, status: 'sent' as MessageStatus, isPending: false } : m
          )
        )
      }, 800)
    },
    [socket, user?.userId, selectedUserId]
  )

  // ── Emit typing ────────────────────────────────────────────────────────────
  const handleTyping = useCallback(() => {
    if (!socket || !selectedChatId) return
    socket.emit('typing', { chatId: selectedChatId, isTyping: true })
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('typing', { chatId: selectedChatId, isTyping: false })
    }, 2000)
  }, [socket, selectedChatId])

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className='flex flex-1 flex-col min-h-0 overflow-hidden'>
      {/* Page title */}
      <div className='flex h-12 shrink-0 items-center justify-between px-1 pb-3'>
        <div>
          <h1 className='text-xl font-bold tracking-tight'>Customer Support</h1>
          <p className='text-xs text-muted-foreground'>
            {chatListData.length} conversation{chatListData.length !== 1 ? 's' : ''}
          </p>
        </div>
        {/* Socket status */}
        <div className='flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs text-muted-foreground'>
          <span className={`size-2 rounded-full ${socket?.connected ? 'bg-emerald-500' : 'bg-amber-500'}`} />
          {socket?.connected ? 'Live' : 'Connecting…'}
        </div>
      </div>

      {/* Main layout */}
      <div className='flex min-h-0 flex-1 overflow-hidden rounded-2xl border bg-background shadow-sm'>

        {/* Left — conversation list */}
        <ConversationList
          chatListData={chatListData}
          activeUserId={selectedUserId}
          isLoading={isChatListLoading}
          onlineUsers={onlineUsers}
          onSelect={handleSelectConversation}
        />

        {/* Right — chat area */}
        <div className='flex min-w-0 flex-1 flex-col'>
          {!selectedParticipant ? (
            <NoConversationSelected />
          ) : (
            <>
              {/* Header */}
              <div className='flex h-16 shrink-0 items-center gap-3 border-b px-5'>
                <Avatar
                  name={selectedParticipant.name}
                  image={selectedParticipant.image}
                  size='sm'
                  showOnline={onlineUsers.includes(selectedParticipant._id)}
                />
                <div className='min-w-0'>
                  <p className='truncate text-sm font-semibold'>{selectedParticipant.name}</p>
                  <p className='text-xs text-muted-foreground'>
                    {onlineUsers.includes(selectedParticipant._id) ? 'Online' : 'Offline'}
                  </p>
                </div>
              </div>

              {/* Messages */}
              <div
                ref={chatBoxRef}
                className='flex flex-1 flex-col gap-1 overflow-y-auto px-5 py-4'
              >
                {isMessagesLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className={`flex gap-2 ${i % 2 === 0 ? 'flex-row' : 'flex-row-reverse'}`}>
                      <Skeleton className='size-7 shrink-0 rounded-full' />
                      <Skeleton className={`h-10 rounded-2xl ${i % 2 === 0 ? 'w-56' : 'w-44'}`} />
                    </div>
                  ))
                ) : messages.length === 0 ? (
                  <div className='flex flex-1 flex-col items-center justify-center gap-2 text-center'>
                    <IconMessageCircle className='size-12 text-muted-foreground/20' />
                    <p className='text-sm text-muted-foreground'>No messages yet</p>
                    <p className='text-xs text-muted-foreground/60'>Start the conversation below</p>
                  </div>
                ) : (
                  messages.map((msg, idx) => {
                    const prev = messages[idx - 1]
                    const showDivider = !prev || !isSameDay(prev.timestamp, msg.timestamp)
                    const isNewGroup =
                      !prev ||
                      prev.sender !== msg.sender ||
                      new Date(msg.timestamp ?? 0).getTime() - new Date(prev.timestamp ?? 0).getTime() > 5 * 60_000
                    // sender may be userId string or nested object — normalize to string
                    const senderId = typeof msg.sender === 'object'
                      ? (msg.sender as { _id?: string })?._id
                      : msg.sender
                    const isOwn = senderId === user?.userId

                    return (
                      <div key={msg.id}>
                        {showDivider && (
                          <DateDivider label={formatDateDivider(msg.timestamp)} />
                        )}
                        <div className={isNewGroup ? 'mt-3' : 'mt-0.5'}>
                          <MessageBubble
                            message={{
                              ...msg, sender: typeof msg.sender === 'object'
                                ? (msg.sender as { _id?: string })?._id ?? ''
                                : msg.sender
                            }}
                            isOwn={isOwn}
                            showAvatar={isNewGroup}
                            participant={selectedParticipant}
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