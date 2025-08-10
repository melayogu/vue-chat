# Vue.js 項目部署到 IIS 腳本
# 使用方法: .\deploy-to-iis.ps1

param(
    [string]$IISPath = "C:\inetpub\wwwroot\Vuejs3Chat",
    [switch]$BackupExisting = $true
)

Write-Host "=== Vue.js 項目 IIS 部署腳本 ===" -ForegroundColor Green

# 檢查是否存在 node_modules
if (-not (Test-Path "node_modules")) {
    Write-Host "正在安裝依賴項..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "依賴項安裝失敗!" -ForegroundColor Red
        exit 1
    }
}

# 建置項目
Write-Host "正在建置項目..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "建置失敗!" -ForegroundColor Red
    exit 1
}

# 檢查建置輸出
if (-not (Test-Path "dist")) {
    Write-Host "建置輸出目錄不存在!" -ForegroundColor Red
    exit 1
}

# 備份現有部署（如果存在）
if ($BackupExisting -and (Test-Path $IISPath)) {
    $BackupPath = "$IISPath-backup-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
    Write-Host "備份現有部署到: $BackupPath" -ForegroundColor Yellow
    Copy-Item -Path $IISPath -Destination $BackupPath -Recurse -Force
}

# 創建 IIS 目錄（如果不存在）
if (-not (Test-Path $IISPath)) {
    Write-Host "創建 IIS 目錄: $IISPath" -ForegroundColor Yellow
    New-Item -ItemType Directory -Path $IISPath -Force | Out-Null
}

# 清空目標目錄
Write-Host "清空目標目錄..." -ForegroundColor Yellow
Remove-Item "$IISPath\*" -Recurse -Force -ErrorAction SilentlyContinue

# 複製建置文件到 IIS 目錄
Write-Host "複製文件到 IIS 目錄..." -ForegroundColor Yellow
Copy-Item -Path "dist\*" -Destination $IISPath -Recurse -Force

# 驗證部署
$IndexFile = Join-Path $IISPath "index.html"
if (Test-Path $IndexFile) {
    Write-Host "✅ 部署成功!" -ForegroundColor Green
    Write-Host "IIS 路徑: $IISPath" -ForegroundColor Cyan
    Write-Host "訪問網址: http://your-domain/Vuejs3Chat/" -ForegroundColor Cyan
} else {
    Write-Host "❌ 部署失敗: index.html 不存在" -ForegroundColor Red
    exit 1
}

# 顯示部署摘要
Write-Host "`n=== 部署摘要 ===" -ForegroundColor Green
Write-Host "源目錄: $(Get-Location)\dist" -ForegroundColor White
Write-Host "目標目錄: $IISPath" -ForegroundColor White
Write-Host "文件數量: $((Get-ChildItem -Path $IISPath -Recurse -File).Count)" -ForegroundColor White
Write-Host "部署時間: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor White

Write-Host "`n=== 後續步驟 ===" -ForegroundColor Yellow
Write-Host "1. 確保 IIS 中已創建 'Vuejs3Chat' 應用程式" -ForegroundColor White
Write-Host "2. 設定應用程式池（建議使用 .NET Framework 4.0+）" -ForegroundColor White
Write-Host "3. 確保 IIS 安裝了 URL Rewrite 模組" -ForegroundColor White
Write-Host "4. 檢查防火牆和網路設定" -ForegroundColor White
