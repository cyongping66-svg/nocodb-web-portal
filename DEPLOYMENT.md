# NocoDB Web Portal 部署指南

這是一個完整的全端應用程式，包含 React 前端和 Node.js 後端，數據存儲在 SQLite 數據庫中。

### 環境變量

### 後端
- `NODE_ENV`: 運行環境 (development/production)
- `PORT`: 服務器端口 (默認: 3002)

- **前端**: React 19 + TypeScript + Vite + Tailwind CSS
- **後端**: Node.js + Express + better-sqlite3
- **部署**: Docker + Docker Compose

## 本地開發

### 1. 啟動後端服務器
```bash
cd server
npm install
node server.js
```

後端將在 http://localhost:3002 啟動

### 2. 啟動前端開發服務器
```bash
npm install
npm run dev
```

前端將在 http://localhost:5001 啟動

## 生產部署

### 使用 Docker Compose 一鍵部署

1. 確保已安裝 Docker 和 Docker Compose

2. 克隆項目到服務器
```bash
git clone <repository-url>
cd nocodb-web-portal
```

3. 創建數據目錄
```bash
mkdir -p data
```

4. 啟動服務
```bash
docker-compose up -d
```

5. 檢查服務狀態
```bash
docker-compose ps
docker-compose logs
```

### 訪問應用程式

- 前端界面: http://your-server-ip
- 後端 API: http://your-server-ip/api

### 數據持久化

數據庫文件存儲在 `./data` 目錄中，確保定期備份此目錄。

## API 端點

### 表格管理
- `GET /api/tables` - 獲取所有表格
- `POST /api/tables` - 創建新表格
- `PUT /api/tables/:id` - 更新表格
- `DELETE /api/tables/:id` - 刪除表格

### 數據管理
- `GET /api/tables/:tableId/rows` - 獲取表格數據
- `POST /api/tables/:tableId/rows` - 創建新行
- `PUT /api/tables/:tableId/rows/:id` - 更新行數據
- `DELETE /api/tables/:tableId/rows/:id` - 刪除行
- `POST /api/tables/:tableId/rows/batch` - 批量操作

### 健康檢查
- `GET /api/health` - 服務器健康狀態

## 環境變量

### 後端
- `NODE_ENV`: 運行環境 (development/production)
- `PORT`: 服務器端口 (默認: 3001)

## 故障排除

### 檢查容器狀態
```bash
docker-compose ps
```

### 查看日誌
```bash
docker-compose logs backend
docker-compose logs frontend
```

### 重啟服務
```bash
docker-compose restart
```

### 完全重建
```bash
docker-compose down
docker-compose up --build -d
```

## 備份與恢復

### 備份數據庫
```bash
cp -r ./data ./backup-$(date +%Y%m%d)
```

### 恢復數據庫
```bash
cp -r ./backup-YYYYMMDD/* ./data/
docker-compose restart backend
```
