# 使用 Node.js 18 作為基礎鏡像
FROM node:18-alpine

# 安裝 Python 和構建工具以支持 better-sqlite3 編譯
RUN apk add --no-cache python3 make g++

# 設置工作目錄
WORKDIR /app

# 複製 package.json 和 package-lock.json
COPY package*.json ./

# 安裝依賴
RUN npm ci --only=production

# 複製應用程式代碼
COPY . .

# 創建數據庫目錄
RUN mkdir -p /app/data

# 暴露端口
EXPOSE 3003

# 啟動應用
CMD ["node", "server.js"]