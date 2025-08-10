import { ref } from 'vue'
import { createMessage } from '../models/message.model.js'
import authService from './auth.service.js'

/**
 * Chat Service 類別
 * 處理聊天相關的業務邏輯和 API 呼叫
 */
class ChatService {
  constructor() {
    this.messages = ref([])
    this.apiUrl = 'https://www.godmelayogu.com/LandScape/api/OpenAiApi' // 後端 API 路由
    
    // 添加初始歡迎訊息
    this.initializeWelcomeMessages()
  }

  /**
   * 初始化歡迎訊息
   */
  initializeWelcomeMessages() {
    const welcomeMessage = createMessage(
      '歡迎來到聊天室！我是您的 AI 助手，有什麼可以幫助您的嗎？',
      'AI助手',
      false
    )
    this.messages.value.push(welcomeMessage)
  }

  /**
   * 獲取所有訊息
   * @returns {Ref<Array>} 訊息陣列的響應式引用
   */
  getMessages() {
    return this.messages
  }

  /**
   * 添加新訊息
   * @param {Object} message - 要添加的訊息對象
   */
  addMessage(message) {
    this.messages.value.push(message)
  }

  /**
   * 更新最後一條訊息的內容
   * @param {string} text - 新的訊息內容
   */
  updateLastMessage(text) {
    if (this.messages.value.length > 0) {
      const lastMessage = this.messages.value[this.messages.value.length - 1]
      lastMessage.text = text
    }
  }

  /**
   * 發送流式訊息到後端 API
   * @param {string} message - 要發送的訊息內容
   */
  async sendStreamMessage(message) {
    try {
      // 準備請求 headers，包含認證信息和應用程式參數
      const headers = {
        'Content-Type': 'application/json',
        'Platform': 'web',
        'App': 'Vuejs3Chat'
      }
      
      // 如果用戶已登入，添加認證 header
      if (authService.getAuthStatus().value) {
        headers['Authorization'] = `Bearer ${authService.getToken().value}`
      }

      const response = await fetch(`${this.apiUrl}/stream`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({ 
          message: message,
          platform: 'web',
          app: 'Vuejs3Chat'
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const reader = response.body?.getReader()
      const decoder = new TextDecoder('utf-8')

      if (!reader) {
        throw new Error('無法獲取回應讀取器')
      }

      // 創建 AI 回覆訊息
      const aiMessage = createMessage('', 'AI助手', false)
      this.addMessage(aiMessage)

      let accumulatedText = ''

      while (true) {
        const { done, value } = await reader.read()
        
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        console.log('Received chunk:', chunk) // 調試信息
        const lines = chunk.split('\n')

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6).trim()
            console.log('Parsed data:', data) // 調試信息
            
            if (data === '[DONE]') {
              return
            }

            // 直接使用文字內容，不解析 JSON
            if (data) {
              accumulatedText += data
              console.log('Accumulated text:', accumulatedText) // 調試信息
              this.updateLastMessage(accumulatedText)
            }
          }
        }
      }
    } catch (error) {
      console.error('Stream 訊息發送失敗:', error)
      
      // 添加錯誤訊息
      const errorMessage = createMessage(
        '抱歉，發生了錯誤，請稍後再試。',
        'AI助手',
        false
      )
      
      this.addMessage(errorMessage)
    }
  }

  /**
   * 清除所有訊息
   */
  clearMessages() {
    this.messages.value = []
  }

  /**
   * 獲取訊息數量
   * @returns {number} 訊息總數
   */
  getMessageCount() {
    return this.messages.value.length
  }
}

// 創建服務實例（單例模式）
export const chatService = new ChatService()

/**
 * Composable 函數，提供聊天服務的功能
 * @returns {Object} 包含聊天相關方法和數據的對象
 */
export function useChatService() {
  const messages = chatService.getMessages()

  /**
   * 發送訊息
   * @param {string} text - 訊息內容
   * @param {string} sender - 發送者名稱，默認為 '用戶'
   */
  const sendMessage = async (text, sender = '用戶') => {
    // 添加用戶訊息
    const userMessage = createMessage(text, sender, true)
    chatService.addMessage(userMessage)
    
    // 發送到 API 並接收流式回應
    await chatService.sendStreamMessage(text)
  }

  /**
   * 清除所有訊息
   */
  const clearMessages = () => {
    chatService.clearMessages()
  }

  /**
   * 獲取訊息數量
   * @returns {number} 訊息總數
   */
  const getMessageCount = () => {
    return chatService.getMessageCount()
  }

  return {
    messages,
    sendMessage,
    clearMessages,
    getMessageCount
  }
}
