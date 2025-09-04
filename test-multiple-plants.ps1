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

Write-Host "Test Parameters:" -ForegroundColor Yellow
Write-Host "Client Date: $clientDate" -ForegroundColor Cyan
Write-Host "Testing $($testPlants.Count) plants..." -ForegroundColor Cyan

# Step 1: Get Access Token
Write-Host ""
Write-Host "Step 1: Getting access token..." -ForegroundColor Green

$tokenUrl = "$baseUrl/access_token?appId=$appId&appSecret=$appSecret"
$tokenHeaders = @{
    "content-language" = "en_US:English"
}

try {
    $tokenResponse = Invoke-RestMethod -Uri $tokenUrl -Method GET -Headers $tokenHeaders -TimeoutSec 30
    
    if ($tokenResponse.code -eq 200) {
        $accessToken = $tokenResponse.data.access_token
        Write-Host "SUCCESS: Access token obtained" -ForegroundColor Green
        $tokenPreview = $accessToken.Substring(0, [Math]::Min(20, $accessToken.Length))
        Write-Host "Token preview: $tokenPreview..." -ForegroundColor Cyan
        
        # Step 2: Test each plant
        Write-Host ""
        Write-Host "Step 2: Testing plant generation data..." -ForegroundColor Green
        Write-Host "=" * 80 -ForegroundColor Gray
        
        $generationHeaders = @{
            "Content-Type" = "application/json"
            "content-language" = "en_US:English"
            "accessToken" = $accessToken
        }
        
        $totalNonZeroPlants = 0
        $plantResults = @()
        
        foreach ($plant in $testPlants) {
            Write-Host ""
            Write-Host "Testing Plant: $($plant.name) (ID: $($plant.id))" -ForegroundColor Yellow
            Write-Host "-" * 60 -ForegroundColor Gray
            
            $generationUrl = "$baseUrl/plant/energy?plantId=$($plant.id)&clientDate=$clientDate"
            
            try {
                $generationResponse = Invoke-RestMethod -Uri $generationUrl -Method GET -Headers $generationHeaders -TimeoutSec 30
                
                if ($generationResponse.code -eq 200) {
                    $data = $generationResponse.data
                    
                    # Check if any values are non-zero
                    $hasNonZeroData = $false
                    $nonZeroFields = @()
                    
                    $fieldsToCheck = @(
                        @{ name = "powerNow"; value = [double]$data.powerNow },
                        @{ name = "batEnergyPercent"; value = [double]$data.batEnergyPercent },
                        @{ name = "todayPvEnergy"; value = [double]$data.todayPvEnergy },
                        @{ name = "monthPvEnergy"; value = [double]$data.monthPvEnergy },
                        @{ name = "yearPvEnergy"; value = [double]$data.yearPvEnergy },
                        @{ name = "totalPvEnergy"; value = [double]$data.totalPvEnergy },
                        @{ name = "todayChargeEnergy"; value = [double]$data.todayChargeEnergy },
                        @{ name = "totalChargeEnergy"; value = [double]$data.totalChargeEnergy }
                    )
                    
                    foreach ($field in $fieldsToCheck) {
                        if ($field.value -ne 0) {
                            $hasNonZeroData = $true
                            $nonZeroFields += "$($field.name): $($field.value)"
                        }
                    }
                    
                    if ($hasNonZeroData) {
                        $totalNonZeroPlants++
                        Write-Host "✅ SUCCESS: Plant has data!" -ForegroundColor Green
                        Write-Host "Non-zero values:" -ForegroundColor Cyan
                        foreach ($field in $nonZeroFields) {
                            Write-Host "  $field" -ForegroundColor White
                        }
                    } else {
                        Write-Host "ℹ️  All values are 0 (offline/nighttime/no generation)" -ForegroundColor DarkYellow
                    }
                    
                    # Store key values for summary
                    $plantResults += @{
                        name = $plant.name
                        id = $plant.id
                        no = $plant.no
                        powerNow = $data.powerNow
                        todayPvEnergy = $data.todayPvEnergy
                        totalPvEnergy = $data.totalPvEnergy
                        deviceStatus = $data.deviceStatus
                        updateDate = $data.updateDate
                        hasData = $hasNonZeroData
                    }
                    
                    Write-Host "Key Stats:" -ForegroundColor Gray
                    Write-Host "  Power Now: $($data.powerNow) W" -ForegroundColor White
                    Write-Host "  Today PV: $($data.todayPvEnergy) kWh" -ForegroundColor White  
                    Write-Host "  Total PV: $($data.totalPvEnergy) kWh" -ForegroundColor White
                    Write-Host "  Device Status: $($data.deviceStatus)" -ForegroundColor White
                    Write-Host "  Last Update: $($data.updateDate)" -ForegroundColor White
                    
                } else {
                    Write-Host "❌ ERROR: API returned code $($generationResponse.code)" -ForegroundColor Red
                    Write-Host "Message: $($generationResponse.msg)" -ForegroundColor Red
                    
                    $plantResults += @{
                        name = $plant.name
                        id = $plant.id
                        no = $plant.no
                        error = "API Error: $($generationResponse.msg)"
                        hasData = $false
                    }
                }
                
            } catch {
                Write-Host "❌ ERROR: $($_.Exception.Message)" -ForegroundColor Red
                $plantResults += @{
                    name = $plant.name
                    id = $plant.id
                    no = $plant.no
                    error = $_.Exception.Message
                    hasData = $false
                }
            }
        }
        
        # Summary
        Write-Host ""
        Write-Host "=" * 80 -ForegroundColor Gray
        Write-Host "SUMMARY RESULTS:" -ForegroundColor Green
        Write-Host "=" * 80 -ForegroundColor Gray
        
        Write-Host "Total plants tested: $($testPlants.Count)" -ForegroundColor Yellow
        Write-Host "Plants with non-zero data: $totalNonZeroPlants" -ForegroundColor Cyan
        Write-Host "Plants with all zeros: $($testPlants.Count - $totalNonZeroPlants)" -ForegroundColor DarkYellow
        
        Write-Host ""
        Write-Host "DETAILED RESULTS:" -ForegroundColor Green
        foreach ($result in $plantResults) {
            Write-Host ""
            Write-Host "$($result.name) ($($result.id)):" -ForegroundColor Yellow
            if ($result.error) {
                Write-Host "  Status: ERROR - $($result.error)" -ForegroundColor Red
            } else {
                $status = if ($result.hasData) { "HAS DATA" } else { "ALL ZEROS" }
                $color = if ($result.hasData) { "Green" } else { "DarkYellow" }
                Write-Host "  Status: $status" -ForegroundColor $color
                Write-Host "  Power: $($result.powerNow) W" -ForegroundColor White
                Write-Host "  Today: $($result.todayPvEnergy) kWh" -ForegroundColor White
                Write-Host "  Total: $($result.totalPvEnergy) kWh" -ForegroundColor White
                Write-Host "  Updated: $($result.updateDate)" -ForegroundColor Gray
            }
        }
        
        Write-Host ""
        if ($totalNonZeroPlants -eq 0) {
            Write-Host "🤔 ANALYSIS: All plants showing zero values" -ForegroundColor DarkYellow
            Write-Host "This could be normal if:" -ForegroundColor Gray
            Write-Host "  - It's nighttime (no solar generation)" -ForegroundColor Gray
            Write-Host "  - Plants are offline for maintenance" -ForegroundColor Gray
            Write-Host "  - Plants are new with no historical data" -ForegroundColor Gray
        } else {
            Write-Host "✅ GOOD: Found $totalNonZeroPlants plants with actual generation data!" -ForegroundColor Green
            Write-Host "If your app shows all zeros, there may be a data parsing issue." -ForegroundColor Yellow
        }
        
    } else {
        Write-Host "ERROR: Failed to get access token, code: $($tokenResponse.code)" -ForegroundColor Red
    }
} catch {
    Write-Host "ERROR: $($_.Exception.Message)" -ForegroundColor Red
}