$ErrorActionPreference = 'Stop'

$To = 'teste@exemplo.com'
$From = 'cliente@empresa.com'
$Subject = 'Novo doc via webhook'
$Text = 'Segue doc...'
$BaseUrl = 'http://localhost:3001'

$uri = "$BaseUrl/api/emails/inbound?dev=1"
$payload = @{ to = $To; from = $From; subject = $Subject; text = $Text } | ConvertTo-Json

$resp = Invoke-RestMethod -Uri $uri -Method Post -ContentType 'application/json' -Body $payload
$resp | ConvertTo-Json -Depth 5
