# Script para testar fluxo completo do bot WhatsApp + Sistema
Write-Host "🚀 Testando fluxo completo do JurIA Bot..." -ForegroundColor Green

# 1. Testar backend
Write-Host "`n1. Testando backend..." -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri "http://localhost:3001/api/health" -Method Get
    Write-Host "✅ Backend funcionando: $($health.time)" -ForegroundColor Green
} catch {
    Write-Host "❌ Backend não está funcionando" -ForegroundColor Red
    exit 1
}

# 2. Testar rota de tokens
Write-Host "`n2. Testando rota de tokens..." -ForegroundColor Yellow
try {
    $tokens = Invoke-RestMethod -Uri "http://localhost:3001/api/tokens/admin/list" -Method Get
    Write-Host "✅ Rota de tokens funcionando" -ForegroundColor Green
} catch {
    Write-Host "❌ Rota de tokens com problema" -ForegroundColor Red
}

# 3. Simular criação de token (como o bot faria)
Write-Host "`n3. Simulando criação de token..." -ForegroundColor Yellow
$tokenData = @{
    token = "JURIA_TEST_" + (Get-Random -Maximum 99999)
    phone = "5562999373530@c.us"
    contactName = "Cliente Teste"
    expiresAt = (Get-Date).AddHours(24).ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
}

try {
    $result = Invoke-RestMethod -Uri "http://localhost:3001/api/tokens" -Method Post -Body ($tokenData | ConvertTo-Json) -ContentType "application/json"
    Write-Host "✅ Token criado: $($tokenData.token)" -ForegroundColor Green
    
    # 4. Testar validação do token
    Write-Host "`n4. Testando validação do token..." -ForegroundColor Yellow
    $validation = Invoke-RestMethod -Uri "http://localhost:3001/api/tokens/validate/$($tokenData.token)" -Method Get
    Write-Host "✅ Token válido até: $($validation.data.expiresAt)" -ForegroundColor Green
    
    # 5. Mostrar link de cadastro
    Write-Host "`n5. Link de cadastro gerado:" -ForegroundColor Yellow
    Write-Host "http://localhost:5174/cadastro/$($tokenData.token)" -ForegroundColor Cyan
    
} catch {
    Write-Host "❌ Erro ao criar/validar token: $($_.Exception.Message)" -ForegroundColor Red
}

# 6. Status do bot
Write-Host "`n6. Verificando bot WhatsApp..." -ForegroundColor Yellow
$botProcess = Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object { $_.Path -like "*whatsapp-bot*" }
if ($botProcess) {
    Write-Host "✅ Bot WhatsApp rodando (PID: $($botProcess.Id))" -ForegroundColor Green
} else {
    Write-Host "⚠️ Bot WhatsApp pode não estar rodando" -ForegroundColor Yellow
}

Write-Host "`n🎉 Teste completo finalizado!" -ForegroundColor Green
Write-Host "`n📋 PRÓXIMOS PASSOS:" -ForegroundColor Cyan
Write-Host "1. Escaneie o QR Code no WhatsApp" -ForegroundColor White
Write-Host "2. Teste enviando mensagem para o bot" -ForegroundColor White
Write-Host "3. Simule um pagamento e cadastro" -ForegroundColor White
Write-Host "4. Acesse: http://localhost:5174" -ForegroundColor White
