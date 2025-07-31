@echo off
echo 🔒 CLEANING GIT HISTORY OF SECRETS
echo =====================================

echo 📦 Creating backup branch...
git branch backup-before-cleaning

echo 📥 Downloading BFG Repo-Cleaner...
curl -L -o bfg.jar https://repo1.maven.org/maven2/com/madgag/bfg/1.14.0/bfg-1.14.0.jar

echo 🧹 Removing secrets from Git history...
java -jar bfg.jar --replace-text secrets-to-remove.txt

echo 🔄 Cleaning up Git repository...
git reflog expire --expire=now --all
git gc --prune=now --aggressive

echo ✅ Git history has been cleaned!
echo.
echo 🚨 IMPORTANT: You must now force push to update remote repository:
echo git push --force-with-lease origin main
echo.
echo ⚠️  WARNING: This will rewrite remote history. Team members will need to re-clone.

pause
