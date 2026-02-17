@echo off
chcp 65001 > nul
echo ========================================
echo   🎯 설로세움 자동 설치 및 실행 스크립트
echo ========================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Node.js가 설치되어 있지 않습니다!
    echo.
    echo 🔗 https://nodejs.org 에서 Node.js를 다운로드하세요
    echo 설치 후 이 스크립트를 다시 실행하세요.
    pause
    exit /b 1
)

echo ✅ Node.js 발견: 
node --version
echo.

REM Check if .env.local exists
if not exist ".env.local" (
    echo ⚠️  환경 변수 파일(.env.local)이 없습니다!
    echo.
    echo 📝 .env.example 파일을 .env.local로 복사하고
    echo    Supabase URL, API Key, OpenAI Key를 입력하세요.
    echo.
    echo 자동으로 .env.local 파일을 생성할까요? (Y/N)
    set /p CREATE_ENV=
    
    if /i "%CREATE_ENV%"=="Y" (
        copy .env.example .env.local
        echo ✅ .env.local 파일이 생성되었습니다!
        echo 📝 메모장으로 열어서 API 키를 입력하세요.
        notepad .env.local
        echo.
        echo API 키 입력을 완료하셨나요? (Y/N)
        set /p ENV_READY=
        if /i not "%ENV_READY%"=="Y" (
            echo ❌ 설치를 취소합니다.
            pause
            exit /b 1
        )
    ) else (
        echo ❌ .env.local 파일을 먼저 생성하세요.
        pause
        exit /b 1
    )
)

echo ✅ 환경 변수 파일 확인됨
echo.

REM Check if node_modules exists
if not exist "node_modules" (
    echo 📦 필요한 패키지를 설치하는 중... (2-3분 소요)
    echo.
    call npm install
    
    if %ERRORLEVEL% NEQ 0 (
        echo ❌ 패키지 설치 실패!
        echo 인터넷 연결을 확인하고 다시 시도하세요.
        pause
        exit /b 1
    )
    
    echo ✅ 패키지 설치 완료!
    echo.
)

echo 🚀 설로세움 개발 서버를 시작합니다...
echo.
echo ⭐ 브라우저에서 http://localhost:3000 을 열어주세요!
echo 🛑 종료하려면 Ctrl+C를 누르세요.
echo.
echo ========================================
echo.

call npm run dev

pause
