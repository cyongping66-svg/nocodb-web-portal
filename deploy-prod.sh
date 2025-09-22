#!/bin/bash

# NocoDB Web Portal 生產環境部署腳本

echo "🚀 開始部署 NocoDB Web Portal 到生產環境..."

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

# 設置權限
chmod 755 data

# 停止現有服務
echo "🛑 停止現有服務..."
docker-compose down

# 清理舊的鏡像（可選）
echo "🧹 清理舊的 Docker 鏡像..."
docker system prune -f

# 構建並啟動服務
echo "🔨 構建並啟動服務..."
docker-compose up --build -d

# 等待服務啟動
echo "⏳ 等待服務啟動..."
sleep 15

# 檢查服務狀態
echo "🔍 檢查服務狀態..."
docker-compose ps

# 檢查後端健康狀態
echo "🩺 檢查後端健康狀態..."
if curl -f http://localhost:8080/api/health &> /dev/null; then
    echo "✅ 後端服務啟動成功"
else
    echo "❌ 後端服務啟動失敗，查看日誌："
    docker-compose logs backend
    exit 1
fi

# 檢查前端是否可訪問
echo "🌐 檢查前端服務..."
if curl -f http://localhost:8080/ &> /dev/null; then
    echo "✅ 前端服務啟動成功"
else
    echo "❌ 前端服務啟動失敗，查看日誌："
    docker-compose logs frontend
    exit 1
fi

echo ""
echo "🎉 部署完成！"
echo "前端界面: http://your-server-ip:8080"
echo "後端 API: http://your-server-ip:8080/api"
echo ""
echo "常用命令："
echo "查看日誌: docker-compose logs"
echo "查看狀態: docker-compose ps"
echo "停止服務: docker-compose down"
echo "重啟服務: docker-compose restart"
echo ""
echo "數據備份目錄: ./data"
echo "記得定期備份 ./data 目錄中的數據庫文件！"
