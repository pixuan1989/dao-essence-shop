Add-Type -AssemblyName System.Drawing
Get-ChildItem 'C:\Users\agenew\Desktop\DaoEssence1.0\learn-bazi\images' | ForEach-Object {
    $img = [System.Drawing.Image]::FromFile($_.FullName)
    $name = $_.Name
    $w = $img.Width
    $h = $img.Height
    $kb = [math]::Round($_.Length/1KB)
    Write-Output "$name | ${w}x${h} | ${kb}KB"
    $img.Dispose()
}
