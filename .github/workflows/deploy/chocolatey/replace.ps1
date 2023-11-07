param (
  [Parameter(Mandatory=$true)]
  [string]$version
)

$filePaths = @(
  './tools/chocolateyinstall.ps1'
  './asyncapi-cli.nuspec'
)

foreach ($filePath in $filePaths) {
  $fileContents = Get-Content $filePath
  $fileContents = $fileContents -replace '{{version}}', $version
  Set-Content $filePath $fileContents
}