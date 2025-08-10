<script setup>
import { computed } from 'vue'
import ChatRoom from './components/ChatRoom.vue'
import LoginForm from './components/LoginForm.vue'
import authService from './services/auth.service.js'

// 獲取認證狀態
const isAuthenticated = computed(() => authService.getAuthStatus().value)
const currentUser = computed(() => authService.getCurrentUser().value)

/**
 * 處理登入成功
 */
const handleLoginSuccess = (user) => {
  console.log('用戶登入成功:', user)
}

/**
 * 處理登出
 */
const handleLogout = () => {
  authService.logout()
}
</script>

<template>
  <!-- 用戶未登入時顯示登入表單 -->
  <LoginForm 
    v-if="!isAuthenticated" 
    @login-success="handleLoginSuccess" 
  />
  
  <!-- 用戶已登入時顯示聊天室 -->
  <div v-else class="app-container">
    <!-- 頂部導航欄 -->
    <header class="app-header">
      <div class="header-content">
        <h1>Vue 聊天室</h1>
        <div class="user-info">
          <span class="welcome-text">歡迎, {{ currentUser?.username || '用戶' }}</span>
          <button @click="handleLogout" class="logout-button">登出</button>
        </div>
      </div>
    </header>
    
    <!-- 聊天室主體 -->
    <main class="app-main">
      <ChatRoom />
    </main>
  </div>
</template>

<style scoped>
.app-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

.app-header {
  background-color: #4CAF50;
  color: white;
  padding: 0;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.header-content h1 {
  margin: 0;
  font-size: 1.5rem;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.welcome-text {
  font-size: 0.9rem;
}

.logout-button {
  background-color: rgba(255, 255, 255, 0.2);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.logout-button:hover {
  background-color: rgba(255, 255, 255, 0.3);
}

.app-main {
  flex: 1;
  overflow: hidden;
}

/* 響應式設計 */
@media (max-width: 768px) {
  .header-content {
    padding: 0.75rem 1rem;
  }
  
  .header-content h1 {
    font-size: 1.25rem;
  }
  
  .user-info {
    flex-direction: column;
    gap: 0.5rem;
    align-items: flex-end;
  }
  
  .welcome-text {
    font-size: 0.8rem;
  }
  
  .logout-button {
    padding: 0.4rem 0.8rem;
    font-size: 0.8rem;
  }
}

header {
  line-height: 1.5;
}

.logo {
  display: block;
  margin: 0 auto 2rem;
}

@media (min-width: 1024px) {
  header .wrapper {
    display: flex;
    place-items: flex-start;
    flex-wrap: wrap;
  }
}
</style>
