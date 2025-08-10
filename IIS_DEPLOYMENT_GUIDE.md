# IIS 部署配置指南

## 前置需求

### 1. IIS 功能啟用
確保以下 Windows 功能已啟用：
- Internet Information Services (IIS)
- IIS Management Console
- World Wide Web Services
  - Common HTTP Features
    - Default Document
    - Directory Browsing
    - HTTP Errors
    - HTTP Redirection
    - Static Content
  - Application Development Features
    - .NET Extensibility 4.8
    - ASP.NET 4.8
    - ISAPI Extensions
    - ISAPI Filters

### 2. URL Rewrite 模組
下載並安裝 IIS URL Rewrite 模組：
- 下載地址: https://www.iis.net/downloads/microsoft/url-rewrite
- 安裝後重啟 IIS Manager

## IIS 設定步驟

### 1. 創建應用程式
1. 開啟 IIS Manager
2. 展開伺服器節點
3. 右鍵點擊 "Default Web Site"
4. 選擇 "Add Application..."
5. 設定：
   - Alias: `Vuejs3Chat`
   - Physical path: `C:\inetpub\wwwroot\Vuejs3Chat`
   - Application pool: `DefaultAppPool` (或創建新的)

### 2. 應用程式池設定
1. 在 IIS Manager 中選擇 "Application Pools"
2. 選擇您的應用程式池
3. 點擊 "Advanced Settings..."
4. 建議設定：
   - .NET CLR Version: `v4.0`
   - Managed Pipeline Mode: `Integrated`
   - Identity: `ApplicationPoolIdentity`
   - Start Mode: `OnDemand`

### 3. 權限設定
確保應用程式池身份有權限讀取網站目錄：
1. 右鍵點擊 `C:\inetpub\wwwroot\Vuejs3Chat`
2. 選擇 "Properties" > "Security" 選項卡
3. 添加 "IIS_IUSRS" 用戶組，給予 "Read & execute" 權限

## 部署步驟

### 方法一：使用自動部署腳本
```bash
# 在項目根目錄執行
npm run deploy
```

### 方法二：手動部署
```bash
# 1. 建置項目
npm run build

# 2. 複製文件到 IIS 目錄
xcopy /s /y "dist\*" "C:\inetpub\wwwroot\Vuejs3Chat\"
```

### 方法三：自訂 IIS 路徑
```bash
# 使用自訂路徑部署
powershell -ExecutionPolicy Bypass -File ./deploy-to-iis.ps1 -IISPath "D:\WebSites\Vuejs3Chat"
```

## 驗證部署

### 1. 檢查文件結構
確保 IIS 目錄包含以下文件：
```
C:\inetpub\wwwroot\Vuejs3Chat\
├── index.html
├── web.config
├── assets/
│   ├── css/
│   ├── js/
│   └── [其他靜態資源]
└── favicon.ico
```

### 2. 測試訪問
1. 本地測試: `http://localhost/Vuejs3Chat/`
2. 網路測試: `http://your-server-ip/Vuejs3Chat/`
3. 域名測試: `http://your-domain/Vuejs3Chat/`

## 常見問題解決

### 1. 404 錯誤 - 頁面找不到
- 檢查 IIS 應用程式是否正確創建
- 確認物理路徑指向正確的目錄
- 驗證 URL Rewrite 模組已安裝

### 2. 500 錯誤 - 內部伺服器錯誤
- 檢查 web.config 語法是否正確
- 確認應用程式池設定
- 查看 Windows 事件日誌獲取詳細錯誤信息

### 3. 靜態資源載入失敗
- 確認 MIME 類型設定正確
- 檢查文件權限
- 驗證防火牆設定

### 4. Vue Router 路由不工作
- 確保 URL Rewrite 模組已安裝
- 檢查 web.config 中的重寫規則
- 確認 Vue 應用使用 history 模式

## 安全建議

### 1. 隱藏伺服器信息
在 web.config 中添加：
```xml
<httpHeaders>
  <remove name="Server" />
  <add name="X-Content-Type-Options" value="nosniff" />
  <add name="X-Frame-Options" value="DENY" />
</httpHeaders>
```

### 2. 啟用 HTTPS
- 安裝 SSL 憑證
- 配置 HTTPS 綁定
- 強制 HTTPS 重定向

### 3. 定期更新
- 保持 IIS 和 Windows 更新
- 定期更新 Vue.js 應用依賴項
- 監控安全漏洞並及時修補

## 維護建議

### 1. 備份策略
- 定期備份網站文件
- 備份 IIS 設定
- 建立還原程序

### 2. 監控
- 設定 IIS 日誌記錄
- 監控效能計數器
- 定期檢查錯誤日誌

### 3. 自動化
- 使用 PowerShell 腳本自動化部署
- 設定 CI/CD 管道
- 實施自動化測試
