@echo off
echo Pushing TrustNet to GitHub...

:: Configure Git if not already configured
git config --global --get user.email > nul 2>&1
if %errorlevel% neq 0 (
  git config --global user.email "jsobieski411@gmail.com"
  git config --global user.name "ServTrust"
)

:: Add remote if it doesn't exist
git remote -v | findstr origin > nul 2>&1
if %errorlevel% neq 0 (
  git remote add origin https://github.com/ServTrust/TrustNet.git
)

:: Force push to overwrite any existing content
git push -f origin master

echo Done!
pause
