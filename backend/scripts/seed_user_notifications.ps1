Continue = 'Stop'
 = 'teste@exemplo.com'
 = '123456'

# Login
 = @{ email=; password= } | ConvertTo-Json
 = Invoke-RestMethod -Uri 'http://localhost:3001/api/auth/login' -Method Post -ContentType 'application/json' -Body 
if (-not .token) { throw 'Login sem token' }
 = @{ Authorization = ('Bearer ' + .token) }

# Notificações
 = @(
  @{ title='Prazo Urgente'; message='Recurso vence em 2 dias'; type='deadline'; severity='HIGH' },
  @{ title='Atualização de Caso'; message='Audiência remarcada para 15/08'; type='case'; severity='MEDIUM' },
  @{ title='E-mail Recebido'; message='Cliente João: assinatura do contrato'; type='email'; severity='LOW' }
)

foreach ( in ) {
   =  | ConvertTo-Json
  Invoke-RestMethod -Uri 'http://localhost:3001/api/notifications' -Headers  -Method Post -ContentType 'application/json' -Body  | Out-Null
}

# Listar
 = Invoke-RestMethod -Uri 'http://localhost:3001/api/notifications' -Headers  -Method Get
 | ConvertTo-Json -Depth 5
