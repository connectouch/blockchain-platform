@echo off
echo 🔒 REMOVING API KEYS FROM GIT HISTORY
echo =====================================

echo 📦 Creating backup branch...
git branch backup-before-cleaning-%date:~-4,4%%date:~-10,2%%date:~-7,2%-%time:~0,2%%time:~3,2%%time:~6,2%

echo 🧹 Step 1: Removing OpenAI API key from history...
set FILTER_BRANCH_SQUELCH_WARNING=1
git filter-branch --force --tree-filter "if exist deploy-edge-functions.js (powershell -Command \"(Get-Content 'deploy-edge-functions.js') -replace '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', '[REDACTED_OPENAI_KEY]' | Set-Content 'deploy-edge-functions.js'\")" --all

echo 🧹 Step 2: Removing Alchemy API key from history...
git filter-branch --force --tree-filter "if exist deploy-edge-functions.js (powershell -Command \"(Get-Content 'deploy-edge-functions.js') -replace 'alcht_4VtVtdF68sMtNaLupR7oPQ1wDSFNc4', '[REDACTED_ALCHEMY_KEY]' | Set-Content 'deploy-edge-functions.js'\")" --all

echo 🧹 Step 3: Removing CoinMarketCap API key from history...
git filter-branch --force --tree-filter "if exist deploy-edge-functions.js (powershell -Command \"(Get-Content 'deploy-edge-functions.js') -replace 'd714f7e6-91a5-47ac-866e-f28f26eee302', '[REDACTED_CMC_KEY]' | Set-Content 'deploy-edge-functions.js'\")" --all

echo 🔄 Cleaning up Git repository...
git reflog expire --expire=now --all
git gc --prune=now --aggressive

echo ✅ API keys have been removed from Git history!
echo.
echo 🚨 NEXT STEPS:
echo 1. Force push to update remote repository:
echo    git push --force-with-lease origin main
echo.
echo 2. Revoke and regenerate the exposed API keys:
echo    - OpenAI: https://platform.openai.com/api-keys
echo    - Alchemy: https://dashboard.alchemy.com/
echo    - CoinMarketCap: https://coinmarketcap.com/api/
echo.
echo ⚠️  WARNING: Force push will rewrite remote history!
echo    Team members will need to re-clone the repository.

pause
