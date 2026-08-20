# ═══════════════════════════════════════════════════════════
#   Career Gap Analyser — Start Script
#   Starts backend (port 5000) + frontend (port 5173)
# ═══════════════════════════════════════════════════════════

$ROOT = "c:\Users\vedig\Documents\All of Varad\Career-gap analyser"
$BACKEND = "$ROOT\backend"
$FRONTEND = "$ROOT\frontend"

Write-Host ""
Write-Host "  ╔══════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "  ║   Career Gap Analyser — Starting...  ║" -ForegroundColor Cyan
Write-Host "  ╚══════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# ── Kill stale processes on ports 5000 and 5173 ──────────────────────────────
Write-Host "🔄 Cleaning up old processes..." -ForegroundColor Yellow
@(5000, 5173) | ForEach-Object {
    $port = $_
    $conn = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
    if ($conn) {
        $pid_ = $conn.OwningProcess | Select-Object -First 1
        Stop-Process -Id $pid_ -Force -ErrorAction SilentlyContinue
        Write-Host "   Killed process on port $port (PID $pid_)" -ForegroundColor DarkGray
    }
}
Start-Sleep -Seconds 1

# ── Start Backend in a new window ────────────────────────────────────────────
Write-Host "🚀 Starting Backend  (http://localhost:5000)..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", `
    "Set-Location '$BACKEND'; " + `
    "Write-Host '═══════════════════════════════════' -ForegroundColor Green; " + `
    "Write-Host '  BACKEND — Career Gap Analyser' -ForegroundColor Green; " + `
    "Write-Host '═══════════════════════════════════' -ForegroundColor Green; " + `
    "npm run dev"

# Wait for backend to initialise (DB connect + seed admin)
Write-Host "⏳ Waiting for backend to initialise..." -ForegroundColor Yellow
Start-Sleep -Seconds 8

# ── Start Frontend in a new window ───────────────────────────────────────────
Write-Host "🎨 Starting Frontend (http://localhost:5173)..." -ForegroundColor Blue
Start-Process powershell -ArgumentList "-NoExit", "-Command", `
    "Set-Location '$FRONTEND'; " + `
    "Write-Host '═══════════════════════════════════' -ForegroundColor Blue; " + `
    "Write-Host '  FRONTEND — Career Gap Analyser' -ForegroundColor Blue; " + `
    "Write-Host '═══════════════════════════════════' -ForegroundColor Blue; " + `
    "npm run dev"

Start-Sleep -Seconds 4

# ── Print summary ─────────────────────────────────────────────────────────────
Write-Host ""
Write-Host "  ✅ Both servers are starting!" -ForegroundColor Green
Write-Host ""
Write-Host "  🌐 Frontend  → http://localhost:5173" -ForegroundColor Cyan
Write-Host "  🔧 Backend   → http://localhost:5000" -ForegroundColor Cyan
Write-Host ""
Write-Host "  ─────────────────────────────────────" -ForegroundColor DarkGray
Write-Host "  🔐 Admin Login" -ForegroundColor Yellow
Write-Host "     Email:    admin@careergap.com" -ForegroundColor White
Write-Host "     Password: Admin@123" -ForegroundColor White
Write-Host "  ─────────────────────────────────────" -ForegroundColor DarkGray
Write-Host ""

# Open browser
Start-Process "http://localhost:5173/login"
