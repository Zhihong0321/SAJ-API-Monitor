Write-Host "Testing SAJ Plant Generation API..." -ForegroundColor Green

$baseUrl = "https://intl-developer.saj-electric.com/prod-api/open/api"
$appId = "VH_3TmblTqb"
$appSecret = "VdtqQAUrVHoKs5hQUpvD4khelTqbBac2eK3VtE4f5GUx3TmbZy7o0JvutUsIsCBf"

# Test plant data
$plantId = "23759059767"
$plantNo = "1067HH"
$clientDate = Get-Date -Format "yyyy-MM-dd HH:mm:ss"

Write-Host "Test Parameters:" -ForegroundColor Yellow
Write-Host "Plant ID: $plantId" -ForegroundColor Cyan
Write-Host "Plant No: $plantNo" -ForegroundColor Cyan
Write-Host "Client Date: $clientDate" -ForegroundColor Cyan

# Step 1: Get Access Token
Write-Host ""
Write-Host "Step 1: Getting access token..." -ForegroundColor Green

$tokenUrl = "$baseUrl/access_token?appId=$appId&appSecret=$appSecret"
$tokenHeaders = @{
    "content-language" = "en_US:English"
}

try {
    $tokenResponse = Invoke-RestMethod -Uri $tokenUrl -Method GET -Headers $tokenHeaders -TimeoutSec 30
    Write-Host "Token Response Code:" $tokenResponse.code -ForegroundColor Yellow

    if ($tokenResponse.code -eq 200) {
        $accessToken = $tokenResponse.data.access_token
        Write-Host "SUCCESS: Access token obtained" -ForegroundColor Green
        $tokenPreview = $accessToken.Substring(0, [Math]::Min(20, $accessToken.Length))
        Write-Host "Token preview: $tokenPreview..." -ForegroundColor Cyan
        
        # Step 2: Test Plant Generation API
        Write-Host ""
        Write-Host "Step 2: Testing Plant Generation API..." -ForegroundColor Green
        
        $generationUrl = "$baseUrl/plant/energy?plantId=$plantId&clientDate=$clientDate"
        Write-Host "Generation URL: $generationUrl" -ForegroundColor Cyan
        
        $generationHeaders = @{
            "Content-Type" = "application/json"
            "content-language" = "en_US:English"
            "accessToken" = $accessToken
        }
        
        Write-Host "Request Headers:" -ForegroundColor Yellow
        $generationHeaders | Format-Table -AutoSize
        
        $generationResponse = Invoke-RestMethod -Uri $generationUrl -Method GET -Headers $generationHeaders -TimeoutSec 30
        
        Write-Host ""
        Write-Host "=== FULL PLANT GENERATION RESPONSE ===" -ForegroundColor Green
        $generationResponse | ConvertTo-Json -Depth 6
        
        Write-Host ""
        Write-Host "=== RESPONSE ANALYSIS ===" -ForegroundColor Green
        Write-Host "Response Code:" $generationResponse.code -ForegroundColor Yellow
        Write-Host "Response Message:" $generationResponse.msg -ForegroundColor Yellow
        Write-Host "Has data property:" ($null -ne $generationResponse.data) -ForegroundColor Yellow
        
        if ($null -ne $generationResponse.data) {
            Write-Host "Data type:" $generationResponse.data.GetType().Name -ForegroundColor Yellow
            
            if ($generationResponse.data -is [System.Array]) {
                Write-Host "Data is array with" $generationResponse.data.Count "items" -ForegroundColor Cyan
                if ($generationResponse.data.Count -gt 0) {
                    Write-Host "First item keys:" ($generationResponse.data[0] | Get-Member -MemberType NoteProperty | ForEach-Object { $_.Name }) -ForegroundColor Cyan
                }
            } elseif ($generationResponse.data -is [PSCustomObject]) {
                Write-Host "Data is object with keys:" ($generationResponse.data | Get-Member -MemberType NoteProperty | ForEach-Object { $_.Name }) -ForegroundColor Cyan
            }
        }
        
        if ($generationResponse.code -eq 200) {
            Write-Host ""
            Write-Host "SUCCESS: Plant generation data retrieved!" -ForegroundColor Green
            
            # Additional analysis if data exists
            if ($null -ne $generationResponse.data) {
                Write-Host ""
                Write-Host "=== DATA SUMMARY ===" -ForegroundColor Green
                
                if ($generationResponse.data -is [System.Array] -and $generationResponse.data.Count -gt 0) {
                    Write-Host "Total data points: $($generationResponse.data.Count)" -ForegroundColor White
                    Write-Host ""
                    Write-Host "Sample data point (first item):" -ForegroundColor Green
                    $generationResponse.data[0] | ConvertTo-Json -Depth 3
                } elseif ($generationResponse.data -is [PSCustomObject]) {
                    Write-Host "Single data object:" -ForegroundColor Green
                    $generationResponse.data | ConvertTo-Json -Depth 3
                } else {
                    Write-Host "Data: $($generationResponse.data)" -ForegroundColor White
                }
            }
        } else {
            Write-Host "ERROR: Plant generation API failed with code: $($generationResponse.code)" -ForegroundColor Red
            Write-Host "Error message: $($generationResponse.msg)" -ForegroundColor Red
        }
        
    } else {
        Write-Host "ERROR: Failed to get access token, code: $($tokenResponse.code)" -ForegroundColor Red
        Write-Host "Error message: $($tokenResponse.msg)" -ForegroundColor Red
    }
} catch {
    Write-Host "ERROR: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        Write-Host "HTTP Status: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
    }
}