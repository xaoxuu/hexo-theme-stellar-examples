param(
  [string]$SourceRef = $(if ($null -ne $env:STELLAR_INSTALL_REF) { $env:STELLAR_INSTALL_REF } else { "main" }),
  [Parameter(ValueFromRemainingArguments = $true)]
  [string[]]$CliArguments
)

$ErrorActionPreference = "Stop"
$Repository = if ($env:STELLAR_INSTALL_REPOSITORY) { $env:STELLAR_INSTALL_REPOSITORY } else { "https://github.com/xaoxuu/hexo-theme-stellar-examples.git" }

if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
  throw "需要 Node.js 22 或更高版本。"
}
$NodeMajor = [int](& node -p 'process.versions.node.split(".")[0]')
if ($NodeMajor -lt 22) {
  throw "需要 Node.js 22 或更高版本，当前为 $(& node --version)。"
}
if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
  throw "需要 Git 下载 Stellar 创建器。"
}

$Temporary = Join-Path ([System.IO.Path]::GetTempPath()) ("stellar-create-" + [guid]::NewGuid().ToString("N"))
New-Item -ItemType Directory -Path $Temporary | Out-Null
$Temporary = (Resolve-Path $Temporary).Path
try {
  $Source = Join-Path $Temporary "source"
  & git -c http.version=HTTP/1.1 clone --quiet --depth 1 --no-checkout $Repository $Source
  if ($LASTEXITCODE -ne 0) { throw "Stellar 创建器源码下载失败。" }

  $CheckoutRef = if ($SourceRef) { $SourceRef } else { "HEAD" }
  & git -C $Source checkout --quiet --detach $CheckoutRef
  if ($LASTEXITCODE -ne 0) { throw "Stellar 创建器版本 $CheckoutRef 不存在。" }

  & node (Join-Path $Source "scripts/blueprint-artifacts.mjs") build
  if ($LASTEXITCODE -ne 0) { throw "Stellar Blueprint 制品生成失败。" }

  & node (Join-Path $Source "main.mjs") @CliArguments
  if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
} finally {
  Remove-Item -LiteralPath $Temporary -Recurse -Force -ErrorAction SilentlyContinue
}
