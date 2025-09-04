Write-Host "Testing Multiple SAJ Plants Generation API..." -ForegroundColor Green

$baseUrl = "https://intl-developer.saj-electric.com/prod-api/open/api"
$appId = "VH_3TmblTqb"
$appSecret = "VdtqQAUrVHoKs5hQUpvD4khelTqbBac2eK3VtE4f5GUx3TmbZy7o0JvutUsIsCBf"

# Multiple test plants from your synced list
$testPlants = @(
    @{ id = "23759059767"; name = "Lo Thiang Chooi"; no = "1067HH" },
    @{ id = "24897568325"; name = "Lee Seng Hoor"; no = "42QBK6" },
    @{ id = "1869576165"; name = "HNSolar"; no = "28BVIB" },
    @{ id = "22047323004"; name = "Chong Soon Tay"; no = "13029Q" },
    @{ id = "24519633444"; name = "Tan Tiang Hong"; no = "344SLR" }
)

$clientDate = Get-Date -Format "yyyy-MM-dd HH:mm:ss"

Write-Host "Client Date: $clientDate" -ForegroundColor Cyan
Write-Host "Testing $($testPlants.Count) plants..." -ForegroundColor Cyan

# Step 1: Get Access Token
Write-Host ""
Write-Host "Getting access token..." -ForegroundColor Green

$tokenUrl = "$baseUrl/access_token?appId=$appId&appSecret=$appSecret"
$tokenHeaders = @{
    "content-language" = "en_US:English"
}

$tokenResponse = Invoke-RestMethod -Uri $tokenUrl -Method GET -Headers $tokenHeaders -TimeoutSec 30

if ($tokenResponse.code -eq 200) {
    $accessToken = $tokenResponse.data.access_token
    Write-Host "SUCCESS: Access token obtained" -ForegroundColor Green
    
    # Step 2: Test each plant
    Write-Host ""
    Write-Host "Testing plant generation data..." -ForegroundColor Green
    Write-Host "=" * 60 -ForegroundColor Gray
    
    $generationHeaders = @{
        "Content-Type" = "application/json"
        "content-language" = "en_US:English"
        "accessToken" = $accessToken
    }
    
    $totalNonZeroPlants = 0
    $plantResults = @()
    
    foreach ($plant in $testPlants) {
        Write-Host ""
        Write-Host "Testing: $($plant.name) (ID: $($plant.id))" -ForegroundColor Yellow
        
        $generationUrl = "$baseUrl/plant/energy?plantId=$($plant.id)&clientDate=$clientDate"
        
        try {
            $generationResponse = Invoke-RestMethod -Uri $generationUrl -Method GET -Headers $generationHeaders -TimeoutSec 30
            
            if ($generationResponse.code -eq 200) {
                $data = $generationResponse.data
                
                # Check if any values are non-zero
                $powerNow = [double]$data.powerNow
                $todayPv = [double]$data.todayPvEnergy
                $totalPv = [double]$data.totalPvEnergy
                $monthPv = [double]$data.monthPvEnergy
                $yearPv = [double]$data.yearPvEnergy
                
                $hasNonZeroData = ($powerNow -ne 0) -or ($todayPv -ne 0) -or ($totalPv -ne 0) -or ($monthPv -ne 0) -or ($yearPv -ne 0)
                
                if ($hasNonZeroData) {
                    $totalNonZeroPlants++
                    Write-Host "✅ HAS DATA!" -ForegroundColor Green
                } else {
                    Write-Host "ℹ️  All values are 0" -ForegroundColor DarkYellow
                }
                
                Write-Host "  Power Now: $($data.powerNow) W" -ForegroundColor White
                Write-Host "  Today PV: $($data.todayPvEnergy) kWh" -ForegroundColor White  
                Write-Host "  Total PV: $($data.totalPvEnergy) kWh" -ForegroundColor White
                Write-Host "  Month PV: $($data.monthPvEnergy) kWh" -ForegroundColor White
                Write-Host "  Year PV: $($data.yearPvEnergy) kWh" -ForegroundColor White
                Write-Host "  Last Update: $($data.updateDate)" -ForegroundColor Gray
                
                $plantResults += @{
                    name = $plant.name
                    id = $plant.id
                    powerNow = $data.powerNow
                    todayPvEnergy = $data.todayPvEnergy
                    totalPvEnergy = $data.totalPvEnergy
                    hasData = $hasNonZeroData
                    updateDate = $data.updateDate
                }
                
            } else {
                Write-Host "❌ ERROR: API returned code $($generationResponse.code)" -ForegroundColor Red
                Write-Host "Message: $($generationResponse.msg)" -ForegroundColor Red
            }
            
        } catch {
            Write-Host "❌ ERROR: $($_.Exception.Message)" -ForegroundColor Red
        }
    }
    
    # Summary
    Write-Host ""
    Write-Host "=" * 60 -ForegroundColor Gray
    Write-Host "SUMMARY:" -ForegroundColor Green
    Write-Host "Total plants tested: $($testPlants.Count)" -ForegroundColor Yellow
    Write-Host "Plants with data: $totalNonZeroPlants" -ForegroundColor Cyan
    Write-Host "Plants with all zeros: $($testPlants.Count - $totalNonZeroPlants)" -ForegroundColor DarkYellow
    
    if ($totalNonZeroPlants -eq 0) {
        Write-Host ""
        Write-Host "🤔 All plants show zero values - This could be normal if:" -ForegroundColor DarkYellow
        Write-Host "  - It's nighttime (no solar generation)" -ForegroundColor Gray
        Write-Host "  - Plants are offline or in maintenance" -ForegroundColor Gray
        Write-Host "  - Plants are new installations with no data yet" -ForegroundColor Gray
    } else {
        Write-Host ""
        Write-Host "✅ Found $totalNonZeroPlants plants with actual data!" -ForegroundColor Green
        Write-Host "If your web app shows all zeros, there may be a data parsing issue." -ForegroundColor Yellow
    }
    
} else {
    Write-Host "ERROR: Failed to get access token" -ForegroundColor Red
}