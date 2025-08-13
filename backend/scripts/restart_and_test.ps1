$ErrorActionPreference = 'Stop'

Write-Host '--- KILL PORT 3001 IF IN USE ---'
try {
  $pids = (Get-NetTCPConnection -LocalPort 3001 -State Listen -ErrorAction Stop | Select-Object -ExpandProperty OwningProcess -Unique)
  foreach ($pid in $pids) { Write-Host "Killing PID $pid"; Stop-Process -Id $pid -Force }
} catch { Write-Host 'No listener on 3001 or unable to query. Continuing.' }

Write-Host '--- START BACKEND ---'
$backendPath = "c:\Users\sarah\Downloads\advogado\project\backend"
Start-Process -FilePath "npm" -ArgumentList "start" -WorkingDirectory $backendPath -WindowStyle Hidden
Start-Sleep -Seconds 3

Write-Host '--- HEALTH ---'
$health = Invoke-RestMethod -Uri "http://localhost:3001/api/health"
$health | ConvertTo-Json -Depth 5

Write-Host '--- LOGIN ---'
$loginBody = @{ email = 'demo@local' } | ConvertTo-Json -Depth 3
$login = Invoke-RestMethod -Uri "http://localhost:3001/api/auth/login" -Method Post -ContentType 'application/json' -Body $loginBody
$login | ConvertTo-Json -Depth 6
$token = $login.token
if (-not $token) { throw 'No token returned' }

$headers = @{ Authorization = "Bearer $token" }

Write-Host '--- CASES (before) ---'
try {
  $casesBefore = Invoke-RestMethod -Uri "http://localhost:3001/api/cases" -Headers $headers
  $casesBefore | ConvertTo-Json -Depth 6
} catch { Write-Host $_.Exception.Message }

Write-Host '--- AGENT (assistente-casos) ---'
$agentBody = @{ message = 'Criar caso trabalhista cliente Maria prioridade alta prazo 2025-08-30' } | ConvertTo-Json -Depth 3
$agentResp = Invoke-RestMethod -Uri "http://localhost:3001/api/agents/assistente-casos/act" -Method Post -ContentType 'application/json' -Headers $headers -Body $agentBody
$agentResp | ConvertTo-Json -Depth 6

Write-Host '--- CASES (after) ---'
$casesAfter = Invoke-RestMethod -Uri "http://localhost:3001/api/cases" -Headers $headers
$casesAfter | ConvertTo-Json -Depth 6
