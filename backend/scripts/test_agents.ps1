$ErrorActionPreference = 'Stop'

$script:token = $null

function DoLogin {
  Write-Host '--- LOGIN ---'
  $body = @{ email = 'demo@local' } | ConvertTo-Json
  $login = Invoke-RestMethod -Uri 'http://localhost:3001/api/auth/login' -Method Post -ContentType 'application/json' -Body $body
  $script:token = $login.token
  Write-Host ("TOKEN=" + $script:token)
}

function InvokeAgent([string]$agent, [string]$message) {
  if (-not $script:token) { throw 'Token ausente. Rode DoLogin primeiro.' }
  Write-Host ("`n=== AGENT: " + $agent + " ===") -ForegroundColor Cyan
  $headers = @{ Authorization = ("Bearer " + $script:token) }
  $body = @{ message = $message } | ConvertTo-Json
  $resp = Invoke-RestMethod -Uri ("http://localhost:3001/api/agents/" + $agent + "/act") -Method Post -ContentType 'application/json' -Headers $headers -Body $body
  $resp | ConvertTo-Json -Depth 8
}

function ListEntities {
  if (-not $script:token) { throw 'Token ausente. Rode DoLogin primeiro.' }
  $headers = @{ Authorization = ("Bearer " + $script:token) }
  Write-Host "\n--- CASES ---" -ForegroundColor Yellow
  try { Invoke-RestMethod -Uri 'http://localhost:3001/api/cases' -Headers $headers | ConvertTo-Json -Depth 8 } catch { Write-Host $_.Exception.Message }
  Write-Host "\n--- DEADLINES ---" -ForegroundColor Yellow
  try { Invoke-RestMethod -Uri 'http://localhost:3001/api/deadlines' -Headers $headers | ConvertTo-Json -Depth 8 } catch { Write-Host $_.Exception.Message }
  Write-Host "\n--- DOCUMENTS ---" -ForegroundColor Yellow
  try { Invoke-RestMethod -Uri 'http://localhost:3001/api/documents' -Headers $headers | ConvertTo-Json -Depth 8 } catch { Write-Host $_.Exception.Message }
}

# MAIN
DoLogin
InvokeAgent 'assistente-casos' 'Criar caso trabalhista da cliente Maria com prazo 2025-08-30 e prioridade alta'
InvokeAgent 'analista-documentos' 'Registrar documento: Peticao Inicial do caso Maria, tipo PDF, descricao breve para o processo'
InvokeAgent 'consultor-jurisprudencia' 'Pesquisar jurisprudencia sobre adicional de periculosidade na CLT e registrar referencias'

ListEntities
