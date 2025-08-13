$ErrorActionPreference = 'Stop'

# Requires these environment variables set in your session (without quotes):
#   setx SUPABASE_URL https://YOUR-PROJECT.supabase.co
#   setx SUPABASE_ANON_KEY YOUR_ANON_KEY
# Then open a NEW terminal so they take effect.

$sbUrl = $env:SUPABASE_URL
$anon  = $env:SUPABASE_ANON_KEY
if (-not $sbUrl -or -not $anon) { throw 'Set SUPABASE_URL and SUPABASE_ANON_KEY environment variables first.' }

$headers = @{
  apikey = $anon
  Authorization = "Bearer $anon"
  Accept = 'application/json'
}

Write-Host "--- RLS TEST: SELECT cases with ANON ---" -ForegroundColor Cyan
try {
  $r = Invoke-RestMethod -Method Get -Uri ("$sbUrl/rest/v1/cases?select=*") -Headers $headers
  $r | ConvertTo-Json -Depth 8
} catch {
  Write-Host $_.Exception.Message -ForegroundColor Yellow
}

Write-Host "--- RLS TEST: SELECT documents with ANON ---" -ForegroundColor Cyan
try {
  $r = Invoke-RestMethod -Method Get -Uri ("$sbUrl/rest/v1/documents?select=*") -Headers $headers
  $r | ConvertTo-Json -Depth 8
} catch {
  Write-Host $_.Exception.Message -ForegroundColor Yellow
}

Write-Host "If RLS is ON and policies restrict by user_id/auth.uid(), direct anonymous selects should be empty or 401/403 unless row matches anon user (unlikely)." -ForegroundColor Green
