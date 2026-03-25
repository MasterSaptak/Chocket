$base = "c:\Users\Devil\Desktop\Chocket\app\product"
$dirs = Get-ChildItem -LiteralPath $base | Where-Object { $_.PSIsContainer }
foreach ($dir in $dirs) {
    if ($dir.Name -ne "[id]") {
        Write-Host "Cleaning with LiteralPath: $($dir.FullName)"
        Remove-Item -LiteralPath $dir.FullName -Recurse -Force
    }
}
