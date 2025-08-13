$ErrorActionPreference = 'Stop'

Write-Host '--- LOGIN ---'
$loginBody = @{ email = 'demo@local' } | ConvertTo-Json -Depth 3
$login = Invoke-RestMethod -Uri "http://localhost:3001/api/auth/login" -Method Post -ContentType 'application/json' -Body $loginBody
$token = $login.token
Write-Host ("TOKEN=" + $token)
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
