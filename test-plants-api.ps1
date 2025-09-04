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
    Write-Host "Token Response Message:" $tokenResponse.msg -ForegroundColor Yellow

    if ($tokenResponse.code -eq 200) {
        $accessToken = $tokenResponse.data.access_token
        Write-Host "SUCCESS: Access token obtained" -ForegroundColor Green
        $tokenPreview = $accessToken.Substring(0, [Math]::Min(20, $accessToken.Length))
        Write-Host "Token preview: $tokenPreview..." -ForegroundColor Cyan
        
        # Now test the plants API
        Write-Host ""
        Write-Host "Testing plants API..." -ForegroundColor Green
        
        $plantUrl = "$baseUrl/developer/plant/page?appId=$appId&pageNum=1&pageSize=100"
        $plantHeaders = @{
            "content-language" = "en_US:English"
            "accessToken" = $accessToken
        }
        
        $plantResponse = Invoke-RestMethod -Uri $plantUrl -Method GET -Headers $plantHeaders -TimeoutSec 30
        Write-Host "Plants Response Code:" $plantResponse.code -ForegroundColor Yellow
        Write-Host "Plants Response Message:" $plantResponse.msg -ForegroundColor Yellow
        
        if ($plantResponse.code -eq 200) {
            Write-Host "SUCCESS: Plants data retrieved!" -ForegroundColor Green
            Write-Host "Total plants in response:" $plantResponse.data.rows.Count -ForegroundColor Cyan
            Write-Host "Total records:" $plantResponse.data.total -ForegroundColor Cyan
            Write-Host "Page size:" $plantResponse.data.pageSize -ForegroundColor Cyan
            Write-Host "Current page:" $plantResponse.data.pageNum -ForegroundColor Cyan
            
            Write-Host ""
            Write-Host "SAMPLE PLANT DATA:" -ForegroundColor Green
            Write-Host "==================" -ForegroundColor Green
            
            if ($plantResponse.data.rows.Count -gt 0) {
                # Show first few plants as samples
                for ($i = 0; $i -lt [Math]::Min(3, $plantResponse.data.rows.Count); $i++) {
                    Write-Host "Plant $($i+1):" -ForegroundColor Yellow
                    $plantResponse.data.rows[$i] | ConvertTo-Json -Depth 2
                    Write-Host ""
                }
                
                Write-Host "SUMMARY:" -ForegroundColor Green
                Write-Host "- Total plants available: $($plantResponse.data.total)" -ForegroundColor White
                Write-Host "- Plants in this page: $($plantResponse.data.rows.Count)" -ForegroundColor White
                Write-Host "- Page size: $($plantResponse.data.pageSize)" -ForegroundColor White
                Write-Host "- Current page: $($plantResponse.data.pageNum)" -ForegroundColor White
                
                # Calculate total pages
                $totalPages = [Math]::Ceiling($plantResponse.data.total / $plantResponse.data.pageSize)
                Write-Host "- Total pages: $totalPages" -ForegroundColor White
            } else {
                Write-Host "No plants found in the response" -ForegroundColor Yellow
            }
        } else {
            Write-Host "ERROR: Plants API failed with code: $($plantResponse.code)" -ForegroundColor Red
            Write-Host "Error message: $($plantResponse.msg)" -ForegroundColor Red
        }
    } else {
        Write-Host "ERROR: Failed to get access token, code: $($tokenResponse.code)" -ForegroundColor Red
        Write-Host "Error message: $($tokenResponse.msg)" -ForegroundColor Red
    }
} catch {
    Write-Host "ERROR: $($_.Exception.Message)" -ForegroundColor Red
}