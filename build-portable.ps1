$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$release = Join-Path $root 'release'

if (Test-Path $release) { Remove-Item $release -Recurse -Force }
New-Item -ItemType Directory -Path $release | Out-Null

Copy-Item (Join-Path $root 'src') $release -Recurse
Copy-Item (Join-Path $root 'public') $release -Recurse
Copy-Item (Join-Path $root 'views') $release -Recurse
Copy-Item (Join-Path $root 'package.json') $release
Copy-Item (Join-Path $root 'package-lock.json') $release
Copy-Item (Join-Path $root 'start-overlay.bat') $release
New-Item -ItemType Directory -Path (Join-Path $release 'data') | Out-Null

Push-Location $release
npm ci --omit=dev
Pop-Location

Write-Host ''
Write-Host 'Portable files created in .\release' -ForegroundColor Green
Write-Host 'Copy a Windows Node.js runtime to .\release\node\node.exe' -ForegroundColor Yellow
Write-Host 'Then copy the release folder to the target machine and run start-overlay.bat'
