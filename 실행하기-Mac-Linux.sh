#!/bin/bash

echo "========================================"
echo "  🎯 설로세움 자동 설치 및 실행 스크립트"
echo "========================================"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js가 설치되어 있지 않습니다!"
    echo ""
    echo "🔗 https://nodejs.org 에서 Node.js를 다운로드하세요"
    echo "설치 후 이 스크립트를 다시 실행하세요."
    exit 1
fi

echo "✅ Node.js 발견: $(node --version)"
echo ""

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo "⚠️  환경 변수 파일(.env.local)이 없습니다!"
    echo ""
    echo "📝 .env.example 파일을 .env.local로 복사하고"
    echo "   Supabase URL, API Key, OpenAI Key를 입력하세요."
    echo ""
    read -p "자동으로 .env.local 파일을 생성할까요? (y/n): " CREATE_ENV
    
    if [ "$CREATE_ENV" = "y" ] || [ "$CREATE_ENV" = "Y" ]; then
        cp .env.example .env.local
        echo "✅ .env.local 파일이 생성되었습니다!"
        echo "📝 텍스트 에디터로 열어서 API 키를 입력하세요."
        
        # Open with default text editor
        if [ "$(uname)" = "Darwin" ]; then
            open -e .env.local  # Mac
        else
            xdg-open .env.local 2>/dev/null || nano .env.local  # Linux
        fi
        
        echo ""
        read -p "API 키 입력을 완료하셨나요? (y/n): " ENV_READY
        if [ "$ENV_READY" != "y" ] && [ "$ENV_READY" != "Y" ]; then
            echo "❌ 설치를 취소합니다."
            exit 1
        fi
    else
        echo "❌ .env.local 파일을 먼저 생성하세요."
        exit 1
    fi
fi

echo "✅ 환경 변수 파일 확인됨"
echo ""

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 필요한 패키지를 설치하는 중... (2-3분 소요)"
    echo ""
    npm install
    
    if [ $? -ne 0 ]; then
        echo "❌ 패키지 설치 실패!"
        echo "인터넷 연결을 확인하고 다시 시도하세요."
        exit 1
    fi
    
    echo "✅ 패키지 설치 완료!"
    echo ""
fi

echo "🚀 설로세움 개발 서버를 시작합니다..."
echo ""
echo "⭐ 브라우저에서 http://localhost:3000 을 열어주세요!"
echo "🛑 종료하려면 Ctrl+C를 누르세요."
echo ""
echo "========================================"
echo ""

npm run dev
