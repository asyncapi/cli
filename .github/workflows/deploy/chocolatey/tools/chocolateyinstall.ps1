$ErrorActionPreference = 'Stop' # stop on all errors
$toolsDir   = "$(Split-Path -parent $MyInvocation.MyCommand.Definition)"

if (-not [Environment]::Is64BitOperatingSystem) {
  throw 'AsyncAPI CLI requires 64-bit Windows.'
}

$url64        = 'https://github.com/asyncapi/cli/releases/download/v{{version}}/asyncapi.x64.exe' 

$packageArgs = @{
  packageName   = $env:ChocolateyPackageName
  unzipLocation = $toolsDir
  fileType      = 'EXE' 
  url64bit      = $url64
  #file         = $fileLocation NOTE: Commented out because we are using url instead

  softwareName  = 'asyncapi-cli*'

  checksum64    = '{{checksum64}}'
  checksumType64= 'sha256' #default is checksumType

  validExitCodes= @(0, 3010, 1641)
  silentArgs   = '/S'           # NSIS
}

Install-ChocolateyPackage @packageArgs # https://docs.chocolatey.org/en-us/create/functions/install-chocolateypackage
