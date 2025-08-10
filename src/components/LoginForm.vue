<template>
  <div class="login-container">
    <div class="login-form">
      <h2>用戶登入</h2>
      
      <!-- 錯誤訊息顯示 -->
      <div v-if="errorMessage" class="error-message">
        {{ errorMessage }}
      </div>
      
      <!-- 成功訊息顯示 -->
      <div v-if="successMessage" class="success-message">
        {{ successMessage }}
      </div>
      
      <form @submit.prevent="handleLogin">
        <div class="form-group">
          <label for="username">用戶名：</label>
          <input
            id="username"
            v-model="formData.username"
            type="text"
            placeholder="請輸入用戶名"
            required
            :disabled="isLoading"
          />
        </div>
        
        <div class="form-group">
          <label for="password">密碼：</label>
          <input
            id="password"
            v-model="formData.password"
            type="password"
            placeholder="請輸入密碼"
            required
            :disabled="isLoading"
          />
        </div>
        
        <button 
          type="submit" 
          class="login-button"
          :disabled="isLoading"
        >
          {{ isLoading ? '登入中...' : '登入' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import authService from '../services/auth.service.js'

// 組件事件定義
const emit = defineEmits(['loginSuccess'])

// 響應式資料
const formData = reactive({
  username: '',
  password: ''
})

const isLoading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

/**
 * 清除訊息
 */
const clearMessages = () => {
  errorMessage.value = ''
  successMessage.value = ''
}

/**
 * 處理登入表單提交
 */
const handleLogin = async () => {
  clearMessages()
  
  // 表單驗證
  if (!formData.username.trim() || !formData.password.trim()) {
    errorMessage.value = '請填寫完整的用戶名和密碼'
    return
  }
  
  isLoading.value = true
  
  try {
    const result = await authService.login(formData.username, formData.password)
    
    if (result.success) {
      successMessage.value = result.message
      
      // 清空表單
      formData.username = ''
      formData.password = ''
      
      // 延遲一下後觸發登入成功事件
      setTimeout(() => {
        emit('loginSuccess', result.user)
      }, 1000)
    } else {
      errorMessage.value = result.message
    }
  } catch (error) {
    errorMessage.value = '登入過程中發生未預期的錯誤'
    console.error('登入錯誤:', error)
  } finally {
    isLoading.value = false
  }
}

/**
 * 處理 Enter 鍵登入
 */
const handleKeyPress = (event) => {
  if (event.key === 'Enter' && !isLoading.value) {
    handleLogin()
  }
}
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f5f5f5;
  padding: 20px;
}

.login-form {
  background: white;
  padding: 40px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
}

.login-form h2 {
  text-align: center;
  margin-bottom: 30px;
  color: #333;
  font-size: 24px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  color: #555;
  font-weight: 500;
}

.form-group input {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
  transition: border-color 0.3s;
  box-sizing: border-box;
}

.form-group input:focus {
  outline: none;
  border-color: #4CAF50;
}

.form-group input:disabled {
  background-color: #f9f9f9;
  cursor: not-allowed;
}

.login-button {
  width: 100%;
  padding: 12px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.login-button:hover:not(:disabled) {
  background-color: #45a049;
}

.login-button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.error-message {
  background-color: #ffebee;
  color: #c62828;
  padding: 10px;
  border-radius: 4px;
  margin-bottom: 20px;
  border-left: 4px solid #c62828;
}

.success-message {
  background-color: #e8f5e8;
  color: #2e7d32;
  padding: 10px;
  border-radius: 4px;
  margin-bottom: 20px;
  border-left: 4px solid #2e7d32;
}

/* 響應式設計 */
@media (max-width: 480px) {
  .login-container {
    padding: 10px;
  }
  
  .login-form {
    padding: 30px 20px;
  }
}
</style>
