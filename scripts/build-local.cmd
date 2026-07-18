@echo off
if not exist dist mkdir dist
cd android
call gradlew.bat assembleRelease
cd ..
if exist android\app\build\outputs\apk\release\app-release.apk copy /Y android\app\build\outputs\apk\release\app-release.apk dist\app-release.apk