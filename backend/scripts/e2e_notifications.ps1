$ErrorActionPreference = 'Stop'

function Invoke-Login($email, $password) {
  $body = @{ email = $email; password = $password } | ConvertTo-Json
  return Invoke-RestMethod -Uri 'http://localhost:3001/api/auth/login' -Method Post -ContentType 'application/json' -Body $body
}

function Create-Notification($token, $payload) {
  $body = $payload | ConvertTo-Json
  return Invoke-RestMethod -Uri 'http://localhost:3001/api/notifications' -Headers @{ Authorization = "Bearer $token" } -Method Post -ContentType 'application/json' -Body $body
}

function List-Notifications($token) {
  return Invoke-RestMethod -Uri 'http://localhost:3001/api/notifications' -Headers @{ Authorization = "Bearer $token" } -Method Get
}

Write-Host '1) Login como teste@exemplo.com...'
$login = Invoke-Login -email 'teste@exemplo.com' -password '123456'
if (-not $login.token) { throw 'Login não retornou token' }
$token = $login.token
Write-Host ("TOKEN prefix: {0}" -f $token.Substring(0,16))

Write-Host '2) Criando 3 notificações...'
$payloads = @(
  @{ title='Prazo Urgente'; message='Recurso vence em 2 dias'; type='deadline'; severity='HIGH' },
  @{ title='Atualização de Caso'; message='Audiência remarcada para 15/08'; type='case'; severity='MEDIUM' },
  @{ title='E-mail Recebido'; message='Cliente João: assinatura do contrato'; type='email'; severity='LOW' }
)
foreach ($p in $payloads) {
  $res = Create-Notification -token $token -payload $p
  Write-Host ("CRIADA: {0}" -f ($res | ConvertTo-Json -Depth 5))
}

Write-Host '3) Listando notificações...'
$list = List-Notifications -token $token
$list | ConvertTo-Json -Depth 5
