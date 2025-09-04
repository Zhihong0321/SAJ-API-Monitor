Write-Host "Testing SAJ API with Historical Dates..." -ForegroundColor Green

$baseUrl = "https://intl-developer.saj-electric.com/prod-api/open/api"
$appId = "VH_3TmblTqb"
$appSecret = "VdtqQAUrVHoKs5hQUpvD4khelTqbBac2eK3VtE4f5GUx3TmbZy7o0JvutUsIsCBf"

# Test different dates
$testDates = @{
    "Today 2 PM" = Get-Date -Format "yyyy-MM-dd 14:00:00"
    "Today 8 AM" = Get-Date -Format "yyyy-MM-dd 08:00:00" 
    "Today 12 PM" = Get-Date -Format "yyyy-MM-dd 12:00:00"
    "Yesterday 2 PM" = (Get-Date).AddDays(-1).ToString("yyyy-MM-dd 14:00:00")
    "2 Days Ago 2 PM" = (Get-Date).AddDays(-2).ToString("yyyy-MM-dd 14:00:00")
    "Last Week 2 PM" = (Get-Date).AddDays(-7).ToString("yyyy-MM-dd 14:00:00")
    "1 Month Ago 2 PM" = (Get-Date).AddDays(-30).ToString("yyyy-MM-dd 14:00:00")
}

# Get token
Write-Host "Getting access token..."
$tokenUrl = "$baseUrl/access_token?appId=$appId&appSecret=$appSecret"
$tokenHeaders = @{ "content-language" = "en_US:English" }
$tokenResponse = Invoke-RestMethod -Uri $tokenUrl -Method GET -Headers $tokenHeaders -TimeoutSec 30

if ($tokenResponse.code -eq 200) {
    $accessToken = $tokenResponse.data.access_token
    Write-Host "Token obtained successfully" -ForegroundColor Green
    
    $generationHeaders = @{
        "Content-Type" = "application/json"
        "content-language" = "en_US:English"
        "accessToken" = $accessToken
    }
    
    $testPlantId = "24897568325"  # Lee Seng Hoor
    
    Write-Host ""
    Write-Host "Testing Plant ID: $testPlantId with different historical dates..." -ForegroundColor Cyan
    Write-Host "Current time: $(Get-Date)" -ForegroundColor White
    Write-Host "=" * 80 -ForegroundColor Gray
    
    $uniqueResponses = @{}
    
    foreach ($dateName in $testDates.Keys) {
        $clientDate = $testDates[$dateName]
        
        Write-Host ""
        Write-Host "Testing: $dateName" -ForegroundColor Yellow
        Write-Host "Date sent: $clientDate" -ForegroundColor White
        
        $generationUrl = "$baseUrl/plant/energy?plantId=$testPlantId&clientDate=$clientDate"
        
        try {
            $response = Invoke-RestMethod -Uri $generationUrl -Method GET -Headers $generationHeaders -TimeoutSec 30
            
            if ($response.code -eq 200) {
                $data = $response.data
                
                # Create a signature for this response to detect changes
                $signature = "$($data.powerNow)|$($data.todayPvEnergy)|$($data.totalPvEnergy)|$($data.deviceStatus)|$($data.updateDate)"
                
                if ($uniqueResponses.ContainsKey($signature)) {
                    $uniqueResponses[$signature]++
                } else {
                    $uniqueResponses[$signature] = 1
                }
                
                $powerNow = [double]$data.powerNow
                $todayPv = [double]$data.todayPvEnergy
                $totalPv = [double]$data.totalPvEnergy
                
                $hasData = ($powerNow -gt 0) -or ($todayPv -gt 0) -or ($totalPv -gt 0)
                
                Write-Host "Response:" -ForegroundColor Gray
                Write-Host "  Power Now: $($data.powerNow) W" -ForegroundColor White
                Write-Host "  Today PV: $($data.todayPvEnergy) kWh" -ForegroundColor White
                Write-Host "  Total PV: $($data.totalPvEnergy) kWh" -ForegroundColor White
                Write-Host "  Device Status: $($data.deviceStatus)" -ForegroundColor White
                Write-Host "  Last Update: $($data.updateDate)" -ForegroundColor Cyan
                
                if ($hasData) {
                    Write-Host "  RESULT: HAS DATA!" -ForegroundColor Green
                } else {
                    Write-Host "  RESULT: All zeros" -ForegroundColor DarkYellow
                }
                
            } else {
                Write-Host "  ERROR: API returned code $($response.code) - $($response.msg)" -ForegroundColor Red
            }
            
        } catch {
            Write-Host "  EXCEPTION: $($_.Exception.Message)" -ForegroundColor Red
        }
    }
    
    Write-Host ""
    Write-Host "=" * 80 -ForegroundColor Gray
    Write-Host "RESPONSE VARIATION ANALYSIS:" -ForegroundColor Green
    Write-Host "Found $($uniqueResponses.Count) unique response signatures:" -ForegroundColor Yellow
    
    foreach ($signature in $uniqueResponses.Keys) {
        Write-Host "  Response: $signature" -ForegroundColor White
        Write-Host "  Count: $($uniqueResponses[$signature]) times" -ForegroundColor Gray
        Write-Host ""
    }
    
    if ($uniqueResponses.Count -eq 1) {
        Write-Host "CONCLUSION: API returns IDENTICAL data regardless of clientDate parameter!" -ForegroundColor Red
        Write-Host "This confirms the data is frozen/cached and not updating properly." -ForegroundColor Red
    } else {
        Write-Host "CONCLUSION: Found different responses - data may be working correctly!" -ForegroundColor Green
    }
    
} else {
    Write-Host "Failed to get access token: $($tokenResponse.code)" -ForegroundColor Red
}