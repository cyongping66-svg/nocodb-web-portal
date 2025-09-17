#!/bin/bash

# NocoDB Web Portal 快速部署腳本

echo "🚀 開始部署 NocoDB Web Portal..."

# 檢查 Docker 是否安裝
if ! command -v docker &> /dev/null; then
    echo "❌ Docker 未安裝，請先安裝 Docker"
    exit 1
fi

# 檢查 Docker Compose 是否安裝
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose 未安裝，請先安裝 Docker Compose"
    exit 1
fi

# 創建數據目錄
echo "📁 創建數據目錄..."
mkdir -p data

# 停止現有服務
echo "🛑 停止現有服務..."
docker-compose down

# 構建並啟動服務
echo "🔨 構建並啟動服務..."
docker-compose up --build -d

# 等待服務啟動
echo "⏳ 等待服務啟動..."
sleep 10

# 檢查服務狀態
echo "🔍 檢查服務狀態..."
docker-compose ps

# 檢查後端健康狀態
echo "🩺 檢查後端健康狀態..."
if curl -f http://localhost/api/health &> /dev/null; then
    echo "✅ 後端服務啟動成功"
else
    echo "❌ 後端服務啟動失敗"
    docker-compose logs backend
    exit 1
fi

# 檢查前端是否可訪問
echo "🌐 檢查前端服務..."
if curl -f http://localhost/ &> /dev/null; then
    echo "✅ 前端服務啟動成功"
else
    echo "❌ 前端服務啟動失敗"
    docker-compose logs frontend
    exit 1
fi

echo ""
echo "🎉 部署完成！"
echo "前端界面: http://localhost"
echo "後端 API: http://localhost/api"
echo ""
echo "查看日誌: docker-compose logs"
echo "停止服務: docker-compose down"
