Write-Host "Testing SAJ API with Different Timezone Formats..." -ForegroundColor Green

$baseUrl = "https://intl-developer.saj-electric.com/prod-api/open/api"
$appId = "VH_3TmblTqb"
$appSecret = "VdtqQAUrVHoKs5hQUpvD4khelTqbBac2eK3VtE4f5GUx3TmbZy7o0JvutUsIsCBf"

# Test different time formats
$timeFormats = @{
    "Local Time (Current)" = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    "UTC Time" = (Get-Date).ToUniversalTime().ToString("yyyy-MM-dd HH:mm:ss")
    "UTC+8 (Malaysia/Singapore)" = (Get-Date).ToUniversalTime().AddHours(8).ToString("yyyy-MM-dd HH:mm:ss")
    "UTC+0 (GMT)" = (Get-Date).ToUniversalTime().ToString("yyyy-MM-dd HH:mm:ss")
    "China Standard Time (UTC+8)" = (Get-Date).ToUniversalTime().AddHours(8).ToString("yyyy-MM-dd HH:mm:ss")
    "ISO Format UTC" = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ")
    "ISO Format Local" = Get-Date -Format "yyyy-MM-ddTHH:mm:ss"
}

# Get token first
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
    
    # Test with one plant ID using different time formats
    $testPlantId = "24897568325"  # Lee Seng Hoor
    
    Write-Host ""
    Write-Host "Testing Plant ID: $testPlantId with different time formats..." -ForegroundColor Cyan
    Write-Host "=" * 80 -ForegroundColor Gray
    
    foreach ($formatName in $timeFormats.Keys) {
        $clientDate = $timeFormats[$formatName]
        
        Write-Host ""
        Write-Host "Testing: $formatName" -ForegroundColor Yellow
        Write-Host "Time sent: $clientDate" -ForegroundColor White
        
        $generationUrl = "$baseUrl/plant/energy?plantId=$testPlantId&clientDate=$clientDate"
        
        try {
            $response = Invoke-RestMethod -Uri $generationUrl -Method GET -Headers $generationHeaders -TimeoutSec 30
            
            if ($response.code -eq 200) {
                $data = $response.data
                
                # Check for non-zero values
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
    Write-Host "TIMEZONE ANALYSIS COMPLETE" -ForegroundColor Green
    Write-Host "Look for any format that returns non-zero data or different timestamps!" -ForegroundColor Yellow
    
} else {
    Write-Host "Failed to get access token: $($tokenResponse.code)" -ForegroundColor Red
}