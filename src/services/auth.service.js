import { ref } from 'vue'

/**
 * 認證服務類別
 * 處理用戶登入、登出和認證狀態管理
 */
class AuthService {
  constructor() {
    this.isAuthenticated = ref(false)
    this.user = ref(null)
    this.token = ref(null)
    this.apiUrl = 'https://localhost:7123' // 後端基礎路由，不需要 /api 前綴
    
    // 檢查本地存儲中是否有已儲存的認證信息
    this.initializeAuth()
  }

  /**
   * 初始化認證狀態
   * 從 localStorage 讀取已儲存的登入狀態
   */
  initializeAuth() {
    const storedToken = localStorage.getItem('authToken')
    const storedUser = localStorage.getItem('user')
    
    if (storedToken && storedUser) {
      this.token.value = storedToken
      this.user.value = JSON.parse(storedUser)
      this.isAuthenticated.value = true
    }
  }

  /**
   * 用戶登入
   * @param {string} username - 用戶名
   * @param {string} password - 密碼
   * @returns {Promise<Object>} 登入結果
   */
  async login(username, password) {
    try {
      const response = await fetch(`${this.apiUrl}/Login/LoginAct`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          username: username,
          password: password
        })
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`登入失敗: ${response.status} - ${errorText}`)
      }

      const result = await response.json()
      
      // 根據您的後端控制器，返回格式是 { isSuccess: boolean }
      if (result.isSuccess) {
        // 由於後端沒有返回 token，我們創建一個簡單的認證狀態
        this.token.value = 'logged-in-' + Date.now() // 簡單的認證標記
        this.user.value = {
          username: username,
          displayName: username
        }
        this.isAuthenticated.value = true
        
        // 儲存到 localStorage
        localStorage.setItem('authToken', this.token.value)
        localStorage.setItem('user', JSON.stringify(this.user.value))
        
        return {
          success: true,
          message: '登入成功',
          user: this.user.value
        }
      } else {
        throw new Error('用戶名或密碼錯誤')
      }
    } catch (error) {
      console.error('登入錯誤:', error)
      return {
        success: false,
        message: error.message || '登入過程中發生錯誤'
      }
    }
  }

  /**
   * 用戶登出
   */
  logout() {
    this.isAuthenticated.value = false
    this.user.value = null
    this.token.value = null
    
    // 清除 localStorage
    localStorage.removeItem('authToken')
    localStorage.removeItem('user')
  }

  /**
   * 獲取認證狀態
   * @returns {Ref<boolean>} 認證狀態的響應式引用
   */
  getAuthStatus() {
    return this.isAuthenticated
  }

  /**
   * 獲取當前用戶信息
   * @returns {Ref<Object|null>} 用戶信息的響應式引用
   */
  getCurrentUser() {
    return this.user
  }

  /**
   * 獲取認證 token
   * @returns {Ref<string|null>} token 的響應式引用
   */
  getToken() {
    return this.token
  }

  /**
   * 獲取帶有認證 header 的請求選項
   * @returns {Object} 包含認證 header 的請求選項
   */
  getAuthHeaders() {
    return {
      'Authorization': `Bearer ${this.token.value}`,
      'Content-Type': 'application/json'
    }
  }
}

// 創建單例實例
export const authService = new AuthService()
export default authService
