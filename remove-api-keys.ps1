# PowerShell script to remove API keys from Git history
Write-Host "🔒 REMOVING API KEYS FROM GIT HISTORY" -ForegroundColor Red
Write-Host "=====================================" -ForegroundColor Red

# The API keys to remove
$apiKeys = @(
    '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',
    'alcht_4VtVtdF68sMtNaLupR7oPQ1wDSFNc4',
    'd714f7e6-91a5-47ac-866e-f28f26eee302'
)

Write-Host "📦 Creating backup branch..." -ForegroundColor Yellow
git branch backup-before-cleaning-$(Get-Date -Format "yyyyMMdd-HHmmss")

Write-Host "🧹 Removing API keys from all commits..." -ForegroundColor Yellow

# Use git filter-branch to replace the API keys in all commits
foreach ($key in $apiKeys) {
    Write-Host "Removing key: $($key.Substring(0,20))..." -ForegroundColor Cyan

    $env:FILTER_BRANCH_SQUELCH_WARNING = "1"
    $escapedKey = [regex]::Escape($key)
    git filter-branch --force --tree-filter "if [ -f deploy-edge-functions.js ]; then sed -i 's/$escapedKey/[REDACTED_API_KEY]/g' deploy-edge-functions.js; fi" --all
}

Write-Host "🔄 Cleaning up Git repository..." -ForegroundColor Yellow
git reflog expire --expire=now --all
git gc --prune=now --aggressive

Write-Host "✅ API keys have been removed from Git history!" -ForegroundColor Green
Write-Host ""
Write-Host "🚨 NEXT STEPS:" -ForegroundColor Red
Write-Host "1. Force push to update remote repository:" -ForegroundColor White
Write-Host "   git push --force-with-lease origin main" -ForegroundColor Cyan
Write-Host ""
Write-Host "2. Revoke and regenerate the exposed API keys:" -ForegroundColor White
Write-Host "   - OpenAI: https://platform.openai.com/api-keys" -ForegroundColor Cyan
Write-Host "   - Alchemy: https://dashboard.alchemy.com/" -ForegroundColor Cyan
Write-Host "   - CoinMarketCap: https://coinmarketcap.com/api/" -ForegroundColor Cyan
Write-Host ""
Write-Host "⚠️  WARNING: Force push will rewrite remote history!" -ForegroundColor Yellow
Write-Host "   Team members will need to re-clone the repository." -ForegroundColor Yellow
