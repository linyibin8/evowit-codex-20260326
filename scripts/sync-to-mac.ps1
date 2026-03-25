param(
    [string]$MacHost = "gray@192.168.0.142",
    [string]$MacPath = "~/evowit"
)

$source = (Resolve-Path "$PSScriptRoot\..").Path

Write-Host "Syncing $source to $MacHost`:$MacPath"
rsync -av --delete --exclude ".git" --exclude "backend/node_modules" "$source/" "$MacHost`:$MacPath/"
