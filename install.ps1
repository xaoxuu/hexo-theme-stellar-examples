param(
  [string]$InstallVersion = $(if ($env:STELLAR_INSTALL_VERSION) { $env:STELLAR_INSTALL_VERSION } else { "latest" }),
  [Parameter(ValueFromRemainingArguments = $true)]
  [string[]]$CliArguments
)

$ErrorActionPreference = "Stop"
$Repository = "xaoxuu/hexo-theme-stellar-examples"

if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
  throw "需要 Node.js 22 或更高版本。"
}
$NodeMajor = [int](& node -p 'process.versions.node.split(".")[0]')
if ($NodeMajor -lt 22) {
  throw "需要 Node.js 22 或更高版本，当前为 $(& node --version)。"
}

if ($env:STELLAR_INSTALL_BASE_URL) {
  $BaseUrl = $env:STELLAR_INSTALL_BASE_URL.TrimEnd('/')
} elseif ($InstallVersion -eq "latest") {
  $BaseUrl = "https://github.com/$Repository/releases/latest/download"
} else {
  $ReleaseTag = if ($InstallVersion.StartsWith("v")) { $InstallVersion } else { "v$InstallVersion" }
  $BaseUrl = "https://github.com/$Repository/releases/download/$ReleaseTag"
}

$Temporary = Join-Path ([System.IO.Path]::GetTempPath()) ("stellar-create-" + [guid]::NewGuid().ToString("N"))
New-Item -ItemType Directory -Path $Temporary | Out-Null
try {
  $MainFile = Join-Path $Temporary "main.mjs"
  $ChecksumsFile = Join-Path $Temporary "checksums.txt"
  Invoke-WebRequest -Uri "$BaseUrl/main.mjs" -OutFile $MainFile
  Invoke-WebRequest -Uri "$BaseUrl/checksums.txt" -OutFile $ChecksumsFile

  $ChecksumLine = Get-Content $ChecksumsFile | Where-Object { $_ -match '^[a-fA-F0-9]{64}\s{2}main\.mjs$' } | Select-Object -First 1
  if (-not $ChecksumLine) { throw "版本校验文件缺少 main.mjs。" }
  $Expected = ($ChecksumLine -split '\s+')[0].ToLowerInvariant()
  $Actual = (Get-FileHash -Algorithm SHA256 $MainFile).Hash.ToLowerInvariant()
  if ($Expected -ne $Actual) { throw "main.mjs SHA-256 校验失败。" }

  & node $MainFile @CliArguments
  if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
} finally {
  Remove-Item -LiteralPath $Temporary -Recurse -Force -ErrorAction SilentlyContinue
}
