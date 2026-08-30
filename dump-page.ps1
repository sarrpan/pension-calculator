# ============================================================
#  dump-page.ps1
#  Exports one page's code + shared context into a single .txt
#
#  USAGE (run from the FreePension root folder):
#     .\dump-page.ps1 ReportRecoveryPage
#     .\dump-page.ps1 ContactPage
#     .\dump-page.ps1 HomePage -NoShared
#
#  Output: _dumps\<PageName>-context.txt
# ============================================================

param(
    [Parameter(Mandatory = $true, Position = 0)]
    [string]$Page,

    [string]$Root = ".",

    [switch]$NoShared,

    [int]$MaxLines = 0
)

$ErrorActionPreference = "Stop"

$srcPath = Join-Path $Root "src"
if (-not (Test-Path $srcPath)) {
    Write-Host "ERROR: folder 'src' not found in '$Root'." -ForegroundColor Red
    Write-Host "Run this script from the project root (where package.json is)." -ForegroundColor Yellow
    exit 1
}

$fence = [char]96 + [char]96 + [char]96
$sep   = "=" * 64

function Add-FileToDump {
    param(
        [System.Text.StringBuilder]$Buffer,
        [string]$FullPath,
        [string]$Label
    )

    if (-not (Test-Path $FullPath)) { return $false }

    $relative = (Resolve-Path $FullPath -Relative)
    $ext = [System.IO.Path]::GetExtension($FullPath).TrimStart('.')

    if ($ext -eq 'jsx' -or $ext -eq 'js') { $lang = 'jsx' }
    elseif ($ext -eq 'css') { $lang = 'css' }
    else { $lang = $ext }

    $content = Get-Content -Path $FullPath -Raw -Encoding UTF8
    if ($null -eq $content) { $content = "" }
    $lineCount = ($content -split "`n").Count

    if ($MaxLines -gt 0 -and $lineCount -gt $MaxLines) {
        $lines = $content -split "`n"
        $content = ($lines[0..($MaxLines - 1)] -join "`n")
        $content += "`n`n/* ... TRUNCATED at $MaxLines lines (total: $lineCount) ... */"
    }

    [void]$Buffer.AppendLine("")
    [void]$Buffer.AppendLine($sep)
    [void]$Buffer.AppendLine("### $Label")
    [void]$Buffer.AppendLine("### $relative   ($lineCount lines)")
    [void]$Buffer.AppendLine($sep)
    [void]$Buffer.AppendLine($fence + $lang)
    [void]$Buffer.AppendLine($content.TrimEnd())
    [void]$Buffer.AppendLine($fence)

    Write-Host "  + $relative  ($lineCount lines)" -ForegroundColor Green
    return $true
}

function Find-OneFile {
    param([string]$Pattern)
    $hit = Get-ChildItem -Path $srcPath -Recurse -File -Filter $Pattern -ErrorAction SilentlyContinue |
           Select-Object -First 1
    if ($hit) { return $hit.FullName }
    return $null
}

# ---------- start ----------

$Page = $Page -replace '\.jsx$', '' -replace '\.css$', ''

Write-Host ""
Write-Host "Exporting context for: $Page" -ForegroundColor Cyan
Write-Host ""

$sb = New-Object System.Text.StringBuilder

[void]$sb.AppendLine("CODE EXPORT - $Page")
[void]$sb.AppendLine("Project: FreePension")
[void]$sb.AppendLine("Date: $(Get-Date -Format 'dd/MM/yyyy HH:mm')")
[void]$sb.AppendLine("")
[void]$sb.AppendLine("Contains: the page component, its CSS,")
[void]$sb.AppendLine("and (optionally) shared layout/style files for context.")

# --- 1. the page ---
Write-Host "Page files:" -ForegroundColor White
$found = 0

$pageJsx = Find-OneFile "$Page.jsx"
if ($pageJsx) {
    if (Add-FileToDump $sb $pageJsx "PAGE - JSX") { $found++ }
} else {
    Write-Host "  ! $Page.jsx not found" -ForegroundColor Yellow
}

$pageCss = Find-OneFile "$Page.css"
if ($pageCss) {
    if (Add-FileToDump $sb $pageCss "PAGE - CSS") { $found++ }
} else {
    Write-Host "  ! $Page.css not found (may not exist - that is fine)" -ForegroundColor DarkYellow
}

if ($found -eq 0) {
    Write-Host ""
    Write-Host "No file found named '$Page'." -ForegroundColor Red
    Write-Host "Available pages:" -ForegroundColor Yellow
    Get-ChildItem -Path $srcPath -Recurse -File -Filter "*.jsx" |
        ForEach-Object { Write-Host "   $($_.BaseName)" -ForegroundColor Gray }
    exit 1
}

# --- 2. shared context ---
if (-not $NoShared) {
    Write-Host ""
    Write-Host "Shared context:" -ForegroundColor White

    $shared = @(
        @{ File = "index.css";  Label = "SHARED - Global CSS / variables" },
        @{ File = "App.jsx";    Label = "SHARED - Routing" },
        @{ File = "Navbar.jsx"; Label = "SHARED - Navbar" },
        @{ File = "Navbar.css"; Label = "SHARED - Navbar CSS" },
        @{ File = "Footer.jsx"; Label = "SHARED - Footer" },
        @{ File = "Footer.css"; Label = "SHARED - Footer CSS" }
    )

    foreach ($item in $shared) {
        $p = Find-OneFile $item.File
        if ($p) { [void](Add-FileToDump $sb $p $item.Label) }
    }
}

# --- 3. write output ---
$outDir = Join-Path $Root "_dumps"
if (-not (Test-Path $outDir)) { New-Item -ItemType Directory -Path $outDir | Out-Null }

$outFile = Join-Path $outDir "$Page-context.txt"
$utf8 = New-Object System.Text.UTF8Encoding($false)
[System.IO.File]::WriteAllText($outFile, $sb.ToString(), $utf8)

$sizeKb = [math]::Round((Get-Item $outFile).Length / 1KB, 1)

Write-Host ""
Write-Host ("-" * 40) -ForegroundColor DarkGray
Write-Host "Done: $outFile" -ForegroundColor Cyan
Write-Host "Size: $sizeKb KB" -ForegroundColor Gray
Write-Host ""
Write-Host "Upload this file to the chat." -ForegroundColor White
Write-Host ""
