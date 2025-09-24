# NocoDB Web Portal 生產部署指南

## 🚀 快速部署

這是一個完整的全端應用程式，專為你的雲服務器配置，避開已佔用的端口（3000、3002、8000、9000）。

### 端口配置
- **前端服務**: `8080` 端口
- **後端 API**: `3003` 端口（內部）
- **數據庫**: better-sqlite3（本地文件）

## 📋 部署前準備

確保你的服務器已安裝：
- Docker
- Docker Compose
- Git

## 🔧 一鍵部署

### 1. 上傳項目到服務器
```bash
# 方式一：使用 git clone
git clone <your-repo-url>
cd nocodb-web-portal

# 方式二：使用 scp 上傳（如果項目在本地）
scp -r ./nocodb-web-portal user@your-server:/path/to/deploy/
```

### 2. 運行部署腳本
```bash
# 構建項目
./build.sh

# 部署到生產環境
./deploy-prod.sh
```

### 3. 訪問應用
```
http://your-server-ip:8080
```

## 📁 Docker 容器架構

```
┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │
│   (Nginx)       │────│   (Node.js)     │
│   Port: 8080    │    │   Port: 3003    │
└─────────────────┘    └─────────────────┘
         │                       │
         └───────────────────────┤
                                 │
                    ┌─────────────────┐
                    │better-sqlite3 DB│
                    │   (./data)      │
                    └─────────────────┘
```

## 🛠️ 手動部署步驟

如果不使用一鍵腳本，可以手動執行：

```bash
# 1. 創建數據目錄
mkdir -p data

# 2. 構建前端
npm install
npm run build

# 3. 安裝後端依賴
cd server
npm install
cd ..

# 4. 啟動 Docker 服務
docker-compose up --build -d

# 5. 檢查狀態
docker-compose ps
```

## 📊 服務管理

### 查看服務狀態
```bash
docker-compose ps
```

### 查看日誌
```bash
# 所有服務日誌
docker-compose logs

# 特定服務日誌
docker-compose logs backend
docker-compose logs frontend

# 實時日誌
docker-compose logs -f
```

### 重啟服務
```bash
# 重啟所有服務
docker-compose restart

# 重啟單個服務
docker-compose restart backend
```

### 停止服務
```bash
docker-compose down
```

## 💾 數據備份

### 自動備份腳本
```bash
# 創建備份腳本
cat > backup.sh << 'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d-%H%M%S)
BACKUP_DIR="./backups"
mkdir -p $BACKUP_DIR
tar -czf $BACKUP_DIR/nocodb-backup-$DATE.tar.gz data/
echo "備份完成: $BACKUP_DIR/nocodb-backup-$DATE.tar.gz"
EOF

chmod +x backup.sh
```

### 設置定時備份
```bash
# 編輯 crontab
crontab -e

# 添加每日備份（凌晨 2 點）
0 2 * * * /path/to/nocodb-web-portal/backup.sh
```

## 🔧 配置調整

### 修改端口（如果 8080 也被佔用）
在 `docker-compose.yml` 中修改：
```yaml
frontend:
  ports:
    - "8081:80"  # 改為 8081 或其他可用端口
```

### 環境變量配置
創建 `.env` 文件：
```bash
# 後端配置
NODE_ENV=production
PORT=3003

# 數據庫配置
DB_PATH=/app/db
```

## 🚨 故障排除

### 常見問題

1. **端口被佔用**
```bash
# 檢查端口使用
lsof -i :8080
netstat -tuln | grep 8080
```

2. **容器無法啟動**
```bash
# 查看詳細錯誤
docker-compose logs backend
docker-compose logs frontend
```

3. **數據庫權限問題**
```bash
# 設置數據目錄權限
chmod 755 data/
chown -R 1000:1000 data/
```

4. **內存不足**
```bash
# 檢查系統資源
free -h
df -h
docker system df
```

### 重置和重建

```bash
# 完全重置（會丟失數據）
docker-compose down -v
docker system prune -a
rm -rf data/*
docker-compose up --build -d
```

## 📈 性能監控

### 設置監控腳本
```bash
# 創建監控腳本
cat > monitor.sh << 'EOF'
#!/bin/bash
echo "=== 服務狀態 ==="
docker-compose ps

echo "=== 資源使用 ==="
docker stats --no-stream

echo "=== 磁盤空間 ==="
df -h

echo "=== 服務健康檢查 ==="
curl -s http://localhost:8080/api/health || echo "API 不可用"
EOF

chmod +x monitor.sh
```

## 🔒 安全建議

1. **防火牆配置**
```bash
# Ubuntu/Debian
ufw allow 8080
ufw enable

# CentOS/RHEL
firewall-cmd --permanent --add-port=8080/tcp
firewall-cmd --reload
```

2. **SSL 證書**（可選）
```bash
# 使用 Certbot 獲取 SSL 證書
sudo apt install certbot
sudo certbot certonly --standalone -d your-domain.com
```

3. **定期更新**
```bash
# 更新系統
sudo apt update && sudo apt upgrade

# 更新 Docker 鏡像
docker-compose pull
docker-compose up -d
```

## 📞 聯繫支持

部署成功後，你可以：
- 訪問 `http://your-server-ip:8080` 使用應用
- API 端點：`http://your-server-ip:8080/api`
- 數據自動保存在 `./data` 目錄

如有問題，請檢查：
1. 服務器防火牆設置
2. Docker 服務狀態
3. 端口是否被其他程序佔用
4. 磁盤空間是否充足
