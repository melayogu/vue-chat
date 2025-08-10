<template>
  <div class="chat-container">
    <!-- 聊天室頭部 -->
    <div class="chat-header">
      <h2>聊天室</h2>
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
</template>

<script setup>
import { ref, onMounted, nextTick, watch } from 'vue'
import { useChatService } from '../services/chat.service.js'
import { formatTime } from '../models/message.model.js'

const newMessage = ref('')
const messagesContainer = ref(null)

// 使用聊天服務
const { messages, sendMessage: sendApiMessage, clearMessages } = useChatService()

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

// 監聽訊息變化，自動滾動到底部
watch(messages, () => {
  nextTick(() => {
    scrollToBottom()
  })
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
  flex-direction: column;
  height: 100%;
  width: 100%;
  margin: 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
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
.messages-container::-webkit-scrollbar {
  width: 6px;
}

.messages-container::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
}

.messages-container::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 3px;
}

.messages-container::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.5);
}
</style>
