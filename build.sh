#!/bin/bash

# 構建前端項目腳本

echo "📦 開始構建前端項目..."

# 安裝依賴
echo "📥 安裝前端依賴..."
npm install

# 構建項目
echo "🔨 構建生產版本..."
npm run build

# 檢查構建結果
if [ -d "dist" ]; then
    echo "✅ 前端構建成功！"
    echo "構建文件位於 ./dist 目錄"
    echo "構建文件大小："
    du -sh dist/*
else
    echo "❌ 前端構建失敗"
    exit 1
fi

echo ""
echo "🔧 構建後端項目..."

# 進入後端目錄
cd server

# 安裝後端依賴
echo "📥 安裝後端依賴..."
npm install

echo "✅ 後端依賴安裝完成"

cd ..

echo ""
echo "🎉 項目構建完成！"
echo "現在可以運行 ./deploy-prod.sh 來部署到生產環境"
