#!/bin/bash

# 🚀 服務器端 Docker 鏡像部署腳本
# 用於在生產服務器上拉取和運行預構建的鏡像

set -e  # 出錯時停止

# 顏色輸出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 開始部署 NocoDB Web Portal${NC}"
echo -e "${YELLOW}使用預構建鏡像: clarkou/nocodb-*:250826${NC}"
echo "================================"

# 檢查 Docker 和 Docker Compose
echo -e "${BLUE}📋 檢查環境...${NC}"

if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker 未安裝，請先安裝 Docker${NC}"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}❌ Docker Compose 未安裝，請先安裝 Docker Compose${NC}"
    exit 1
fi

if ! docker info >/dev/null 2>&1; then
    echo -e "${RED}❌ Docker 未運行，請先啟動 Docker 服務${NC}"
    exit 1
fi

echo -e "${GREEN}✅ 環境檢查通過${NC}"

# 創建必要的目錄
echo -e "${BLUE}📁 創建數據目錄...${NC}"
mkdir -p data
chmod 755 data

# 停止現有容器（如果存在）
echo -e "${BLUE}🛑 停止現有容器...${NC}"
docker-compose down 2>/dev/null || true

# 清理舊的容器和網絡
echo -e "${BLUE}🧹 清理舊資源...${NC}"
docker container prune -f
docker network prune -f

# 拉取最新鏡像
echo -e "${BLUE}📥 拉取最新鏡像...${NC}"
docker-compose pull

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ 鏡像拉取成功${NC}"
else
    echo -e "${RED}❌ 鏡像拉取失敗，請檢查網絡連接和鏡像名稱${NC}"
    exit 1
fi

# 啟動服務
echo -e "${BLUE}🚀 啟動服務...${NC}"
docker-compose up -d

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ 服務啟動成功${NC}"
else
    echo -e "${RED}❌ 服務啟動失敗${NC}"
    echo -e "${YELLOW}查看日誌：docker-compose logs${NC}"
    exit 1
fi

# 等待服務就緒
echo -e "${BLUE}⏳ 等待服務就緒...${NC}"
sleep 10

# 檢查服務狀態
echo -e "${BLUE}📊 檢查服務狀態...${NC}"
docker-compose ps

# 健康檢查
echo -e "${BLUE}🏥 執行健康檢查...${NC}"

# 檢查後端 API
echo -e "${YELLOW}檢查後端 API...${NC}"
max_attempts=30
attempt=1

while [ $attempt -le $max_attempts ]; do
    if curl -s -f http://localhost:8080/api/health >/dev/null 2>&1; then
        echo -e "${GREEN}✅ 後端 API 正常運行${NC}"
        break
    else
        echo -e "${YELLOW}⏳ 等待後端 API 啟動... (${attempt}/${max_attempts})${NC}"
        sleep 2
        ((attempt++))
    fi
done

if [ $attempt -gt $max_attempts ]; then
    echo -e "${RED}❌ 後端 API 健康檢查失敗${NC}"
    echo -e "${YELLOW}查看後端日誌：docker-compose logs backend${NC}"
else
    # 檢查前端
    echo -e "${YELLOW}檢查前端服務...${NC}"
    if curl -s -f http://localhost:8080/ >/dev/null 2>&1; then
        echo -e "${GREEN}✅ 前端服務正常運行${NC}"
    else
        echo -e "${RED}❌ 前端服務健康檢查失敗${NC}"
        echo -e "${YELLOW}查看前端日誌：docker-compose logs frontend${NC}"
    fi
fi

# 顯示服務信息
echo ""
echo -e "${GREEN}🎉 部署完成！${NC}"
echo "================================"
echo -e "${BLUE}📋 服務信息:${NC}"
echo -e "  🌐 前端地址: http://localhost:8080"
echo -e "  🔌 API 地址: http://localhost:8080/api"
echo -e "  📊 健康檢查: http://localhost:8080/api/health"
echo ""
echo -e "${BLUE}🛠️  常用命令:${NC}"
echo -e "  查看狀態: docker-compose ps"
echo -e "  查看日誌: docker-compose logs"
echo -e "  重啟服務: docker-compose restart"
echo -e "  停止服務: docker-compose down"
echo ""
echo -e "${YELLOW}📝 注意事項:${NC}"
echo -e "  • 數據保存在 ./data 目錄"
echo -e "  • 確保防火牆開放 8080 端口"
echo -e "  • 定期備份 ./data 目錄"

# 最終狀態檢查
echo ""
echo -e "${BLUE}🔍 最終狀態檢查:${NC}"
docker-compose ps

echo ""
echo -e "${GREEN}✅ 部署腳本執行完成${NC}"
