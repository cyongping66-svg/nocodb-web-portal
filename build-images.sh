#!/bin/bash

# 🚀 Docker 鏡像構建和推送腳本
# 日期: 2025-08-26

set -e  # 出錯時停止

# 顏色輸出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 配置
DOCKER_USERNAME="clark640"
TAG="250826"
FRONTEND_IMAGE="${DOCKER_USERNAME}/nocodb-frontend:${TAG}"
BACKEND_IMAGE="${DOCKER_USERNAME}/nocodb-backend:${TAG}"

echo -e "${BLUE}🏗️  開始構建 NocoDB Web Portal 鏡像${NC}"
echo -e "${YELLOW}鏡像標籤: ${TAG}${NC}"
echo "================================"

# 檢查 Docker 登錄狀態
echo -e "${BLUE}📋 檢查 Docker 登錄狀態...${NC}"
if ! docker info >/dev/null 2>&1; then
    echo -e "${RED}❌ Docker 未運行，請先啟動 Docker${NC}"
    exit 1
fi

# 構建前端鏡像
echo -e "${BLUE}🔨 構建前端鏡像: ${FRONTEND_IMAGE}${NC}"
docker build -t ${FRONTEND_IMAGE} .

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ 前端鏡像構建成功${NC}"
else
    echo -e "${RED}❌ 前端鏡像構建失敗${NC}"
    exit 1
fi

# 構建後端鏡像
echo -e "${BLUE}🔨 構建後端鏡像: ${BACKEND_IMAGE}${NC}"
docker build -t ${BACKEND_IMAGE} ./server

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ 後端鏡像構建成功${NC}"
else
    echo -e "${RED}❌ 後端鏡像構建失敗${NC}"
    exit 1
fi

# 顯示鏡像信息
echo -e "${BLUE}📊 查看構建的鏡像:${NC}"
docker images | grep -E "(nocodb-frontend|nocodb-backend).*${TAG}"

# 詢問是否推送到 Docker Hub
echo ""
echo -e "${YELLOW}🚀 是否推送鏡像到 Docker Hub? (y/n)${NC}"
read -r response

if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
    echo -e "${BLUE}📤 開始推送鏡像...${NC}"
    
    # 檢查是否已登錄 Docker Hub
    if ! docker info | grep -q "Username"; then
        echo -e "${YELLOW}🔐 請先登錄 Docker Hub:${NC}"
        docker login
    fi
    
    # 推送前端鏡像
    echo -e "${BLUE}📤 推送前端鏡像...${NC}"
    docker push ${FRONTEND_IMAGE}
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ 前端鏡像推送成功${NC}"
    else
        echo -e "${RED}❌ 前端鏡像推送失敗${NC}"
        exit 1
    fi
    
    # 推送後端鏡像
    echo -e "${BLUE}📤 推送後端鏡像...${NC}"
    docker push ${BACKEND_IMAGE}
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ 後端鏡像推送成功${NC}"
    else
        echo -e "${RED}❌ 後端鏡像推送失敗${NC}"
        exit 1
    fi
    
    echo ""
    echo -e "${GREEN}🎉 所有鏡像構建和推送完成！${NC}"
    echo -e "${BLUE}📋 鏡像信息:${NC}"
    echo -e "  前端: ${FRONTEND_IMAGE}"
    echo -e "  後端: ${BACKEND_IMAGE}"
    echo ""
    echo -e "${YELLOW}🚀 現在你可以在服務器上運行:${NC}"
    echo -e "  docker-compose pull"
    echo -e "  docker-compose up -d"
    
else
    echo -e "${YELLOW}⏸️  跳過推送步驟${NC}"
    echo -e "${BLUE}📋 本地鏡像已構建完成:${NC}"
    echo -e "  前端: ${FRONTEND_IMAGE}"
    echo -e "  後端: ${BACKEND_IMAGE}"
fi

echo ""
echo -e "${GREEN}✅ 構建腳本執行完成${NC}"
