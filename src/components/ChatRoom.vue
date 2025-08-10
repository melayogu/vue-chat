<template>
  <div class="chat-container">
    <!-- 側邊列 -->
    <div class="sidebar" :class="{ 'sidebar-open': sidebarOpen }">
      <div class="sidebar-header">
        <h3>聊天歷史</h3>
        <button @click="toggleSidebar" class="sidebar-toggle">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
      </div>
      
      <div class="sidebar-content">
        <button @click="createNewChat" class="new-chat-button">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          新對話
        </button>
        
        <div class="chat-history">
          <div 
            v-for="chat in chatHistory" 
            :key="chat.id"
            @click="loadChat(chat.id)"
            class="chat-history-item"
            :class="{ 'active': chat.id === currentChatId }"
          >
            <div class="chat-title">{{ chat.title }}</div>
            <div class="chat-date">{{ formatDate(chat.lastMessage) }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 主聊天區域 -->
    <div class="main-chat">
      <!-- 聊天室頭部 -->
      <div class="chat-header">
        <div class="header-left">
          <button @click="toggleSidebar" class="sidebar-toggle-button" title="顯示/隱藏歷史記錄">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 12h18M3 6h18M3 18h18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
          <h2>{{ currentChatTitle }}</h2>
        </div>
        <div class="header-actions">
          <button @click="clearMessages" class="clear-button" title="清除聊天記錄">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14zM10 11v6M14 11v6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
          <div class="online-status">
            <span class="status-dot"></span>
            線上
          </div>
        </div>
      </div>

      <!-- 消息區域 -->
      <div class="messages-container" ref="messagesContainer">
        <div 
          v-for="message in messages" 
          :key="message.id"
          class="message-item"
          :class="{ 'own-message': message.isOwn }"
        >
          <div class="message-content">
            <div class="message-header">
              <span class="username">{{ message.sender }}</span>
              <span class="timestamp">{{ formatTime(message.timestamp) }}</span>
            </div>
            <div class="message-text">{{ message.text }}</div>
          </div>
        </div>
      </div>

      <!-- 輸入區域 -->
      <div class="input-container">
        <input 
          v-model="newMessage"
          @keyup.enter="sendMessage"
          type="text" 
          placeholder="輸入訊息..."
          class="message-input"
        />
        <button @click="sendMessage" class="send-button">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M2 21L23 12L2 3V10L17 12L2 14V21Z" fill="currentColor"/>
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick, watch } from 'vue'
import { useChatService } from '../services/chat.service.js'
import { formatTime } from '../models/message.model.js'

const newMessage = ref('')
const messagesContainer = ref(null)
const sidebarOpen = ref(false)
const currentChatId = ref('1')
const currentChatTitle = ref('聊天室')

// 聊天歷史記錄
const chatHistory = ref([
  {
    id: '1',
    title: '預設對話',
    lastMessage: new Date(),
    messages: []
  }
])

// 使用聊天服務
const { messages, sendMessage: sendApiMessage, clearMessages } = useChatService()

// 格式化日期
const formatDate = (date) => {
  const now = new Date()
  const messageDate = new Date(date)
  const diff = now - messageDate
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  
  if (days === 0) {
    return '今天'
  } else if (days === 1) {
    return '昨天'
  } else if (days < 7) {
    return `${days}天前`
  } else {
    return messageDate.toLocaleDateString('zh-TW', { month: 'short', day: 'numeric' })
  }
}

// 切換側邊列
const toggleSidebar = () => {
  sidebarOpen.value = !sidebarOpen.value
}

// 創建新對話
const createNewChat = () => {
  const newChatId = Date.now().toString()
  const newChat = {
    id: newChatId,
    title: `新對話 ${chatHistory.value.length}`,
    lastMessage: new Date(),
    messages: []
  }
  
  // 保存當前對話的訊息
  saveChatMessages()
  
  // 添加新對話到歷史記錄
  chatHistory.value.unshift(newChat)
  
  // 切換到新對話
  currentChatId.value = newChatId
  currentChatTitle.value = newChat.title
  
  // 清空當前訊息
  clearMessages()
  
  // 關閉側邊列（在手機上）
  if (window.innerWidth <= 768) {
    sidebarOpen.value = false
  }
}

// 載入對話
const loadChat = (chatId) => {
  // 保存當前對話的訊息
  saveChatMessages()
  
  // 找到要載入的對話
  const chat = chatHistory.value.find(c => c.id === chatId)
  if (chat) {
    currentChatId.value = chatId
    currentChatTitle.value = chat.title
    
    // 清空當前訊息並載入歷史訊息
    clearMessages()
    
    // 載入歷史訊息（如果有的話）
    if (chat.messages && chat.messages.length > 0) {
      chat.messages.forEach(msg => {
        messages.value.push(msg)
      })
    }
  }
  
  // 關閉側邊列（在手機上）
  if (window.innerWidth <= 768) {
    sidebarOpen.value = false
  }
}

// 保存當前對話的訊息
const saveChatMessages = () => {
  const currentChat = chatHistory.value.find(c => c.id === currentChatId.value)
  if (currentChat) {
    currentChat.messages = [...messages.value]
    currentChat.lastMessage = new Date()
    
    // 如果有訊息，更新標題為第一個用戶訊息的前20個字符
    const firstUserMessage = messages.value.find(m => m.isOwn)
    if (firstUserMessage && currentChat.title.startsWith('新對話')) {
      currentChat.title = firstUserMessage.text.substring(0, 20) + (firstUserMessage.text.length > 20 ? '...' : '')
    }
  }
}

// 發送消息到 API
const sendMessage = async () => {
  if (newMessage.value.trim()) {
    const messageText = newMessage.value.trim()
    newMessage.value = ''
    
    // 使用 API 服務發送訊息
    await sendApiMessage(messageText, '我')
    
    // 滾動到底部
    nextTick(() => {
      scrollToBottom()
    })
  }
}

// 監聽訊息變化，自動滾動到底部並保存
watch(messages, () => {
  nextTick(() => {
    scrollToBottom()
  })
  
  // 自動保存當前對話
  saveChatMessages()
}, { deep: true })

// 滾動到底部
const scrollToBottom = () => {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

onMounted(() => {
  scrollToBottom()
})
</script>

<style scoped>
.chat-container {
  display: flex;
  height: 100%;
  width: 100%;
  margin: 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  position: relative;
}

/* 側邊列樣式 */
.sidebar {
  width: 280px;
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(10px);
  border-right: 1px solid rgba(255, 255, 255, 0.2);
  display: flex;
  flex-direction: column;
  transition: all 0.3s ease;
  position: absolute;
  left: -280px;
  top: 0;
  bottom: 0;
  z-index: 10;
}

.sidebar-open {
  left: 0;
}

.sidebar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
}

.sidebar-header h3 {
  color: white;
  margin: 0;
  font-size: 16px;
  font-weight: 600;
}

.sidebar-toggle {
  padding: 4px;
  border: none;
  background: transparent;
  color: white;
  cursor: pointer;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s ease;
}

.sidebar-toggle:hover {
  background: rgba(255, 255, 255, 0.1);
}

.sidebar-content {
  flex: 1;
  padding: 16px;
  overflow-y: auto;
}

.new-chat-button {
  width: 100%;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  margin-bottom: 16px;
  transition: all 0.2s ease;
}

.new-chat-button:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-1px);
}

.chat-history {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.chat-history-item {
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.chat-history-item:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: translateX(4px);
}

.chat-history-item.active {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.3);
}

.chat-title {
  color: white;
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.chat-date {
  color: rgba(255, 255, 255, 0.7);
  font-size: 12px;
}

/* 主聊天區域 */
.main-chat {
  display: flex;
  flex-direction: column;
  flex: 1;
  transition: all 0.3s ease;
}

.chat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.sidebar-toggle-button {
  padding: 8px;
  border: none;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.sidebar-toggle-button:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: scale(1.05);
}

.chat-header h2 {
  color: white;
  margin: 0;
  font-size: 20px;
  font-weight: 600;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.clear-button {
  padding: 8px;
  border: none;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.clear-button:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: scale(1.05);
}

.clear-button:active {
  transform: scale(0.95);
}

.online-status {
  display: flex;
  align-items: center;
  color: white;
  font-size: 14px;
}

.status-dot {
  width: 8px;
  height: 8px;
  background: #4ade80;
  border-radius: 50%;
  margin-right: 6px;
}

.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: 16px 24px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.message-item {
  display: flex;
  justify-content: flex-start;
  animation: fadeIn 0.3s ease-out;
}

.message-item.own-message {
  justify-content: flex-end;
}

.message-content {
  max-width: 70%;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  padding: 12px 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.own-message .message-content {
  background: rgba(255, 255, 255, 1);
  border-bottom-right-radius: 4px;
}

.message-item:not(.own-message) .message-content {
  border-bottom-left-radius: 4px;
}

.message-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.username {
  font-weight: 600;
  font-size: 13px;
  color: #374151;
}

.timestamp {
  font-size: 11px;
  color: #9ca3af;
}

.message-text {
  color: #1f2937;
  line-height: 1.4;
  word-wrap: break-word;
}

.input-container {
  display: flex;
  align-items: center;
  padding: 16px 24px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-top: 1px solid rgba(255, 255, 255, 0.2);
  gap: 12px;
}

.message-input {
  flex: 1;
  padding: 12px 16px;
  border: none;
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.9);
  font-size: 14px;
  outline: none;
  transition: background 0.2s ease;
}

.message-input:focus {
  background: white;
}

.message-input::placeholder {
  color: #9ca3af;
}

.send-button {
  padding: 10px;
  border: none;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.send-button:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: scale(1.05);
}

.send-button:active {
  transform: scale(0.95);
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 自定義滾動條 */
.messages-container::-webkit-scrollbar,
.sidebar-content::-webkit-scrollbar {
  width: 6px;
}

.messages-container::-webkit-scrollbar-track,
.sidebar-content::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
}

.messages-container::-webkit-scrollbar-thumb,
.sidebar-content::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 3px;
}

.messages-container::-webkit-scrollbar-thumb:hover,
.sidebar-content::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.5);
}

/* 響應式設計 */
@media (min-width: 769px) {
  .sidebar {
    position: relative;
    left: 0;
  }
  
  .sidebar-open {
    left: 0;
  }
  
  .main-chat {
    margin-left: 0;
  }
}

@media (max-width: 768px) {
  .sidebar {
    width: 100%;
    left: -100%;
  }
  
  .sidebar-open {
    left: 0;
  }
  
  .sidebar-toggle {
    display: block;
  }
  
  .chat-header {
    padding: 12px 16px;
  }
  
  .messages-container {
    padding: 12px 16px;
  }
  
  .input-container {
    padding: 12px 16px;
  }
}
</style>
