Write-Host "Getting SAJ API access token..." -ForegroundColor Green

$baseUrl = "https://intl-developer.saj-electric.com/prod-api/open/api"
$appId = "VH_3TmblTqb"
$appSecret = "VdtqQAUrVHoKs5hQUpvD4khelTqbBac2eK3VtE4f5GUx3TmbZy7o0JvutUsIsCBf"

$tokenUrl = "$baseUrl/access_token?appId=$appId&appSecret=$appSecret"

$headers = @{
    "content-language" = "en_US:English"
}

try {
    $tokenResponse = Invoke-RestMethod -Uri $tokenUrl -Method GET -Headers $headers -TimeoutSec 30
    Write-Host "Token Response Code:" $tokenResponse.code -ForegroundColor Yellow

    if ($tokenResponse.code -eq 200) {
        $accessToken = $tokenResponse.data.access_token
        Write-Host "SUCCESS: Access token obtained" -ForegroundColor Green
        
        # Now test the plants API
        Write-Host ""
        Write-Host "Testing plants API..." -ForegroundColor Green
        
        $plantUrl = "$baseUrl/developer/plant/page?appId=$appId&pageNum=1&pageSize=100"
        Write-Host "Plant URL: $plantUrl" -ForegroundColor Cyan
        
        $plantHeaders = @{
            "content-language" = "en_US:English"
            "accessToken" = $accessToken
        }
        
        $plantResponse = Invoke-RestMethod -Uri $plantUrl -Method GET -Headers $plantHeaders -TimeoutSec 30
        
        Write-Host ""
        Write-Host "=== FULL PLANT RESPONSE ===" -ForegroundColor Green
        $plantResponse | ConvertTo-Json -Depth 4
        
        Write-Host ""
        Write-Host "=== RESPONSE ANALYSIS ===" -ForegroundColor Green
        Write-Host "Response Code:" $plantResponse.code -ForegroundColor Yellow
        Write-Host "Response Message:" $plantResponse.msg -ForegroundColor Yellow
        Write-Host "Has data property:" ($null -ne $plantResponse.data) -ForegroundColor Yellow
        
        if ($null -ne $plantResponse.data) {
            Write-Host "Data keys:" ($plantResponse.data | Get-Member -MemberType NoteProperty | ForEach-Object { $_.Name }) -ForegroundColor Yellow
            
            if ($null -ne $plantResponse.data.rows) {
                Write-Host "Rows count:" $plantResponse.data.rows.Count -ForegroundColor Cyan
                Write-Host "Rows type:" $plantResponse.data.rows.GetType().Name -ForegroundColor Cyan
            } else {
                Write-Host "No 'rows' property found in data" -ForegroundColor Red
            }
            
            if ($null -ne $plantResponse.data.total) {
                Write-Host "Total:" $plantResponse.data.total -ForegroundColor Cyan
            } else {
                Write-Host "No 'total' property found in data" -ForegroundColor Red
            }
        } else {
            Write-Host "No 'data' property found in response" -ForegroundColor Red
        }
        
    } else {
        Write-Host "ERROR: Failed to get access token, code: $($tokenResponse.code)" -ForegroundColor Red
    }
} catch {
    Write-Host "ERROR: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Exception Type: $($_.Exception.GetType().Name)" -ForegroundColor Red
}