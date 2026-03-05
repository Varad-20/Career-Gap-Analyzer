# Start Career Gap Finder - Both Servers
Write-Host "Starting Career Gap Finder..." -ForegroundColor Cyan

Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'c:\Users\vedig\Documents\my new projects\Skill-gap analyser\backend'; Write-Host 'Backend starting...' -ForegroundColor Green; node server.js"

Start-Sleep -Seconds 2

Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'c:\Users\vedig\Documents\my new projects\Skill-gap analyser\frontend'; Write-Host 'Frontend starting...' -ForegroundColor Blue; npx vite --port 5173"

Start-Sleep -Seconds 3

Write-Host ""
Write-Host "App is running! Open: http://localhost:5173" -ForegroundColor Green
Write-Host "Admin: admin@careergap.com / Admin@123" -ForegroundColor Yellow
Write-Host ""
Start-Process "http://localhost:5173"
