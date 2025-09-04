Write-Host "Broad Plant ID Search - Testing for ANY active plants..." -ForegroundColor Green

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
    
    # Test a variety of plant IDs - some from our known list, some random variations
    $testPlantIds = @(
        # Our known plants
        "23759059767", "24897568325", "1869576165", "22047323004", "24519633444",
        # Random variations (common patterns)
        "12345678901", "98765432109", "11111111111", "22222222222", "33333333333",
        "10000000000", "20000000000", "30000000000",
        # Sequential variations around our known IDs
        "23759059768", "23759059769", "23759059770",
        "24897568324", "24897568326", "24897568327"
    )
    
    $generationHeaders = @{
        "Content-Type" = "application/json"
        "content-language" = "en_US:English"  
        "accessToken" = $accessToken
    }
    
    $plantsWithData = 0
    $plantsWithErrors = 0
    $uniqueTimestamps = @{}
    $uniqueStatuses = @{}
    
    Write-Host ""
    Write-Host "Testing $($testPlantIds.Count) plant IDs for ANY active data..." -ForegroundColor Cyan
    Write-Host "=" * 70 -ForegroundColor Gray
    
    foreach ($plantId in $testPlantIds) {
        Write-Host "Testing: $plantId" -NoNewline
        
        $generationUrl = "$baseUrl/plant/energy?plantId=$plantId&clientDate=$clientDate"
        
        try {
            $response = Invoke-RestMethod -Uri $generationUrl -Method GET -Headers $generationHeaders -TimeoutSec 15
            
            if ($response.code -eq 200) {
                $data = $response.data
                
                # Track unique timestamps and statuses
                $timestamp = $data.updateDate
                if ($uniqueTimestamps.ContainsKey($timestamp)) {
                    $uniqueTimestamps[$timestamp]++
                } else {
                    $uniqueTimestamps[$timestamp] = 1
                }
                
                $status = $data.deviceStatus
                if ($uniqueStatuses.ContainsKey($status)) {
                    $uniqueStatuses[$status]++
                } else {
                    $uniqueStatuses[$status] = 1
                }
                
                # Check for any non-zero data
                $powerNow = [double]$data.powerNow
                $todayPv = [double]$data.todayPvEnergy
                $totalPv = [double]$data.totalPvEnergy
                $monthPv = [double]$data.monthPvEnergy
                $yearPv = [double]$data.yearPvEnergy
                
                if ($powerNow -gt 0 -or $todayPv -gt 0 -or $totalPv -gt 0 -or $monthPv -gt 0 -or $yearPv -gt 0) {
                    Write-Host " SUCCESS HAS DATA!" -ForegroundColor Green
                    Write-Host "    Power: $($data.powerNow) W, Today: $($data.todayPvEnergy) kWh, Total: $($data.totalPvEnergy) kWh"
                    Write-Host "    Status: $($data.deviceStatus), Updated: $($data.updateDate)" -ForegroundColor Cyan
                    $plantsWithData++
                } else {
                    Write-Host " - zeros (Status: $status, Updated: $timestamp)" -ForegroundColor DarkGray
                }
            } else {
                Write-Host " ERROR: $($response.code)" -ForegroundColor Red
                $plantsWithErrors++
            }
        } catch {
            Write-Host " Exception" -ForegroundColor Red
            $plantsWithErrors++
        }
    }
    
    Write-Host ""
    Write-Host "=" * 70 -ForegroundColor Gray
    Write-Host "ANALYSIS RESULTS:" -ForegroundColor Green
    Write-Host "Plants tested: $($testPlantIds.Count)"
    Write-Host "Plants with data: $plantsWithData" -ForegroundColor $(if($plantsWithData -gt 0){"Green"}else{"Red"})
    Write-Host "Plants with errors: $plantsWithErrors"
    Write-Host "Plants with zeros: $($testPlantIds.Count - $plantsWithData - $plantsWithErrors)"
    
    Write-Host ""
    Write-Host "TIMESTAMP ANALYSIS:" -ForegroundColor Yellow
    if ($uniqueTimestamps.Count -eq 1) {
        $singleTimestamp = $uniqueTimestamps.Keys | Select-Object -First 1
        Write-Host "ALL plants have IDENTICAL timestamp: $singleTimestamp" -ForegroundColor Red
        Write-Host "This strongly indicates a systemic SAJ API data issue!" -ForegroundColor Red
    } else {
        Write-Host "Found $($uniqueTimestamps.Count) different timestamps:"
        foreach ($timestamp in $uniqueTimestamps.Keys) {
            Write-Host "  $timestamp : $($uniqueTimestamps[$timestamp]) plants"
        }
    }
    
    Write-Host ""
    Write-Host "DEVICE STATUS ANALYSIS:" -ForegroundColor Yellow
    Write-Host "Found $($uniqueStatuses.Count) different device statuses:"
    foreach ($status in $uniqueStatuses.Keys) {
        $statusText = switch ($status) {
            0 { "Offline" }
            1 { "Online" }
            2 { "Alarm" }
            default { "Unknown($status)" }
        }
        Write-Host "  Status $status ($statusText): $($uniqueStatuses[$status]) plants"
    }
    
    if ($plantsWithData -eq 0) {
        Write-Host ""
        Write-Host "CONCLUSION:" -ForegroundColor Red
        Write-Host "NO active plants found across $($testPlantIds.Count) different IDs during 2 PM daylight hours."
        Write-Host "This is highly unusual and suggests a systemic issue with SAJ data system."
    } else {
        Write-Host ""
        Write-Host "FOUND ACTIVE DATA!" -ForegroundColor Green
        Write-Host "This indicates some plants are working - check your app against these active ones."
    }
    
} else {
    Write-Host "Failed to get token: code $($tokenResponse.code)" -ForegroundColor Red
}