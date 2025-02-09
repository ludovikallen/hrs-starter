# Ensure script runs as Admin
param (
    [string]$jsonPath = "..\.vscode\extensions.json"
)

function Get-VSCodeExtensions {
    if (-not (Test-Path $jsonPath)) {
        Write-Host "Extensions JSON file not found at $jsonPath" -ForegroundColor Red
        return @()
    }

    try {
        $extensionsJson = Get-Content $jsonPath | ConvertFrom-Json
        return $extensionsJson.recommendations
    }
    catch {
        Write-Host "Error reading extensions from JSON" -ForegroundColor Red
        return @()
    }
}

function Install-VSCodeExtensions {
    $extensions = Get-VSCodeExtensions

    Write-Host "Installing VS Code extensions..." -ForegroundColor Green
        
    foreach ($extension in $extensions) {
        try {
            Write-Host "Installing $extension..." -ForegroundColor Cyan
            code --install-extension $extension --force
        }
        catch {
            Write-Host "Failed to install $extension" -ForegroundColor Red
        }
    }
        
    Write-Host "Extension installation complete!" -ForegroundColor Green
    
}

if (-not ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")) {
    Write-Host "This script needs to run as Administrator. Restarting as Admin..."
    Start-Process PowerShell -ArgumentList "-File `"$PSCommandPath`"" -Verb RunAs
    exit
}

function Install-Choco {
    if (-Not (Get-Command choco -ErrorAction SilentlyContinue)) {
        Write-Host "Chocolatey not found. Installing..."
        Set-ExecutionPolicy Bypass -Scope Process -Force
        [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor [System.Net.SecurityProtocolType]::Tls12
        Invoke-Expression ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))
    }
    else {
        Write-Host "Chocolatey is already installed."
    }
}

function Install-Jabba {
    if (-Not (Test-Path "$env:USERPROFILE\.jabba\bin\jabba.exe")) {
        Write-Host "Installing Jabba..."
        [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
        Invoke-Expression (
            Invoke-WebRequest https://github.com/Jabba-Team/jabba/raw/main/install.ps1 -UseBasicParsing
        ).Content
        Write-Host "Jabba installed successfully!"
    }
    else {
        Write-Host "Jabba is already installed."
    }
}

# Check if the path is absolute
if (-not [System.IO.Path]::IsPathRooted($jsonPath)) {
    $scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition

    $jsonPath = Join-Path -Path $scriptDir -ChildPath $jsonPath
}

if (Test-Path $jsonPath) {
    $jsonPath = Convert-Path $jsonPath
}
else {
    Write-Warning "File does not exist, using resolved path: $jsonPath"
}

Install-Choco

Install-Jabba

[Environment]::SetEnvironmentVariable(
    "Path", 
    [Environment]::GetEnvironmentVariable("Path", "Machine") + ";$($env:ChocolateyInstall)\bin", 
    "Machine"
)

[Environment]::SetEnvironmentVariable(
    "Path", 
    [Environment]::GetEnvironmentVariable("Path", "Machine") + ";$env:USERPROFILE\.jabba\bin", 
    "Machine"
)

# Refresh environment variables to recognize choco and jabba without restarting
$env:Path = [Environment]::GetEnvironmentVariable("Path", "Machine")

$javaVersion = "openjdk@21"
if (-Not (jabba ls | Select-String $javaVersion)) {
    Write-Host "Installing Java 21 using Jabba..."
    jabba install $javaVersion
    jabba use $javaVersion
    Write-Host "Java 21 installed successfully!"
}
else {
    Write-Host "Java 21 is already installed."
}

$envRegKey = [Microsoft.Win32.Registry]::LocalMachine.OpenSubKey('SYSTEM\CurrentControlSet\Control\Session Manager\Environment', $true)
$envPath = $envRegKey.GetValue('Path', $null, "DoNotExpandEnvironmentNames").replace('%JAVA_HOME%\bin;', '')
[Environment]::SetEnvironmentVariable('JAVA_HOME', "$(jabba which $(jabba current))", 'Machine')
[Environment]::SetEnvironmentVariable('PATH', "%JAVA_HOME%\bin;$envPath", 'Machine')


# Refresh environment variables to recognize java without restarting
$env:JAVA_HOME = [Environment]::GetEnvironmentVariable("JAVA_HOME", "Machine")

choco install nvm -y
choco install docker-desktop -y

[Environment]::SetEnvironmentVariable(
    "Path",
    [Environment]::GetEnvironmentVariable("Path", "Machine") + ";C:\Program Files\Docker\Docker\resources\bin",
    "Machine"
)

# Refresh environment variables to recognize docker without restarting
$env:Path = [Environment]::GetEnvironmentVariable("Path", "Machine")

nvm install 22.13.1
nvm use 22.13.1

Install-VSCodeExtensions

$dockerProcess = Get-Process -Name "Docker Desktop" -ErrorAction SilentlyContinue
if (-not $dockerProcess) {
    Write-Host "Starting Docker Desktop..."
    Start-Process "C:\Program Files\Docker\Docker\Docker Desktop.exe"
    Start-Sleep -Seconds 10  # Wait for Docker to start
}

Write-Host "All dependencies installed successfully!"
Start-Sleep -Seconds 10