const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const Database = require('./db/database');

const app = express();
const port = process.env.PORT || 3003;

// 初始化數據庫
const db = new Database();

// 中間件
app.use(helmet());
app.use(morgan('combined'));
app.use(cors());
app.use(express.json());

// API 路由
app.use('/api/tables', require('./routes/tables'));
app.use('/api/tables', require('./routes/rows'));

// 健康檢查
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 錯誤處理中間件
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 處理
app.use((req, res) => {
  res.status(404).json({ error: 'API endpoint not found' });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
  console.log(`Health check: http://localhost:${port}/api/health`);
});

module.exports = app;
