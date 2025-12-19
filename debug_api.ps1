
try {
    $url = "http://localhost:8000/analyze"
    $filePath = "$env:TEMP\test_image.jpg"
    "dummy content" | Set-Content $filePath

    $form = @{
        file = Get-Item -Path $filePath
    }

    Write-Host "Sending request to $url..."
    $response = Invoke-WebRequest -Uri $url -Method Post -Form $form -Headers @{ "Accept" = "application/json" }
    
    Write-Host "Status Code: $($response.StatusCode)"
    Write-Host "Content-Type: $($response.Headers['Content-Type'])"
    
    if ($response.Headers['Content-Type'] -like "*application/json*") {
        Write-Host "Response Body (JSON):"
        Write-Host $response.Content
    } else {
        Write-Host "Response is not JSON. Content-Type is $($response.Headers['Content-Type'])"
        Write-Host "First 100 chars of content:"
        Write-Host $response.Content.Substring(0, [Math]::Min($response.Content.Length, 100))
    }
} catch {
    Write-Host "Error: $_"
    if ($_.Exception.Response) {
         Write-Host "Response Status: $($_.Exception.Response.StatusCode)"
         Write-Host "Response Content-Type: $($_.Exception.Response.Headers['Content-Type'])"
    }
}
