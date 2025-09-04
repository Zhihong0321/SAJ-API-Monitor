Write-Host "Quick Plant Generation Test..." -ForegroundColor Green

$baseUrl = "https://intl-developer.saj-electric.com/prod-api/open/api"
$appId = "VH_3TmblTqb"
$appSecret = "VdtqQAUrVHoKs5hQUpvD4khelTqbBac2eK3VtE4f5GUx3TmbZy7o0JvutUsIsCBf"
$clientDate = Get-Date -Format "yyyy-MM-dd HH:mm:ss"

# Get token
Write-Host "Getting access token..."
$tokenUrl = "$baseUrl/access_token?appId=$appId&appSecret=$appSecret"
$tokenHeaders = @{ "content-language" = "en_US:English" }
$tokenResponse = Invoke-RestMethod -Uri $tokenUrl -Method GET -Headers $tokenHeaders -TimeoutSec 30

if ($tokenResponse.code -eq 200) {
    $accessToken = $tokenResponse.data.access_token
    Write-Host "Token obtained successfully" -ForegroundColor Green
    
    # Test plants
    $plants = @("23759059767", "24897568325", "1869576165", "22047323004", "24519633444")
    $generationHeaders = @{
        "Content-Type" = "application/json"
        "content-language" = "en_US:English"
        "accessToken" = $accessToken
    }
    
    $plantsWithData = 0
    
    foreach ($plantId in $plants) {
        Write-Host ""
        Write-Host "Testing Plant ID: $plantId" -ForegroundColor Yellow
        
        $generationUrl = "$baseUrl/plant/energy?plantId=$plantId&clientDate=$clientDate"
        
        try {
            $response = Invoke-RestMethod -Uri $generationUrl -Method GET -Headers $generationHeaders -TimeoutSec 30
            
            if ($response.code -eq 200) {
                $data = $response.data
                
                $powerNow = [double]$data.powerNow
                $todayPv = [double]$data.todayPvEnergy  
                $totalPv = [double]$data.totalPvEnergy
                $monthPv = [double]$data.monthPvEnergy
                
                Write-Host "Response Code: $($response.code)" -ForegroundColor Green
                Write-Host "Power Now: $($data.powerNow) W"
                Write-Host "Today PV: $($data.todayPvEnergy) kWh"
                Write-Host "Month PV: $($data.monthPvEnergy) kWh"  
                Write-Host "Total PV: $($data.totalPvEnergy) kWh"
                Write-Host "Last Update: $($data.updateDate)"
                
                if ($powerNow -gt 0 -or $todayPv -gt 0 -or $totalPv -gt 0 -or $monthPv -gt 0) {
                    Write-Host "✅ This plant HAS DATA!" -ForegroundColor Green
                    $plantsWithData++
                } else {
                    Write-Host "ℹ️  This plant shows all zeros" -ForegroundColor DarkYellow
                }
            } else {
                Write-Host "❌ API Error: $($response.code) - $($response.msg)" -ForegroundColor Red
            }
        } catch {
            Write-Host "❌ Exception: $($_.Exception.Message)" -ForegroundColor Red
        }
    }
    
    Write-Host ""
    Write-Host "=" * 50 -ForegroundColor Gray
    Write-Host "SUMMARY:" -ForegroundColor Green
    Write-Host "Plants tested: $($plants.Count)"
    Write-Host "Plants with data: $plantsWithData"
    Write-Host "Plants with zeros: $($plants.Count - $plantsWithData)"
    
    if ($plantsWithData -eq 0) {
        Write-Host ""
        Write-Host "All plants show zero - This might be normal (nighttime/offline)" -ForegroundColor DarkYellow
    } else {
        Write-Host ""  
        Write-Host "Found $plantsWithData plants with data - check if your web app shows the same!" -ForegroundColor Green
    }
    
} else {
    Write-Host "❌ Failed to get token: $($tokenResponse.code)" -ForegroundColor Red
}