# Vue.js 與 .NET Core 登入整合指南

## 前端 Vue.js 設置

### 1. 認證服務 (`src/services/auth.service.js`)
- 處理用戶登入、登出和認證狀態管理
- 支援 JWT Token 儲存和自動附加到 API 請求
- 響應式認證狀態管理

### 2. 登入組件 (`src/components/LoginForm.vue`)
- 用戶友好的登入介面
- 表單驗證和錯誤處理
- 載入狀態指示器

### 3. 主應用程式整合 (`src/App.vue`)
- 條件式渲染：未登入顯示登入表單，已登入顯示聊天室
- 用戶信息顯示和登出功能

## 後端 .NET Core 設置

### 1. 控制器設定
```csharp
[HttpPost("LoginAct")]
public IActionResult LoginAct(string username, string password)
```

### 2. JWT 設定 (appsettings.json)
```json
{
  "JwtSettings": {
    "SecretKey": "您的長密鑰至少32個字符",
    "Issuer": "您的應用程式名稱",
    "Audience": "您的應用程式用戶"
  }
}
```

### 3. Program.cs 配置
- JWT 認證服務
- CORS 政策（允許 Vue.js 前端）
- 認證和授權中間件

## API 整合流程

1. **用戶登入**：
   - 前端發送 POST 請求到 `/api/Login/LoginAct`
   - 使用 `application/x-www-form-urlencoded` 格式
   - 後端驗證用戶並返回 JWT token

2. **認證狀態管理**：
   - Token 儲存在 localStorage
   - 自動附加到後續 API 請求的 Authorization header

3. **受保護的 API 呼叫**：
   - Chat Service 自動檢查認證狀態
   - 在請求 header 中包含 Bearer token

## 使用方式

1. 啟動 Vue.js 開發伺服器：
   ```bash
   npm run dev
   ```

2. 訪問 http://localhost:5173

3. 在登入表單中輸入用戶名和密碼

4. 成功登入後將顯示聊天室界面

## 安全注意事項

1. **生產環境**：
   - 使用 HTTPS
   - 設定強密鑰 (至少 32 個字符)
   - 實施適當的密碼雜湊

2. **Token 管理**：
   - 設定適當的 token 過期時間
   - 考慮實施 refresh token 機制

3. **CORS 設定**：
   - 生產環境中限制允許的來源域名

## 自訂設定

### 修改 API 基礎路徑
在 `auth.service.js` 中修改：
```javascript
this.apiUrl = 'https://your-api-domain.com/api'
```

### 調整 Token 儲存方式
可以修改為使用 sessionStorage 或實施更安全的儲存方案。

### 添加額外的用戶信息
在後端 `GetUserInfo` 方法中返回更多用戶詳細信息。
