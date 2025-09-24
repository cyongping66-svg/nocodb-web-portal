///測試是否正確連接數據庫
///使用以下終端命令
/// cd server
/// node test-db.js

const Database = require('./db/database');

console.log('正在测试数据库连接...');

try {
  const db = new Database();
  console.log('数据库连接成功！');
  console.log('数据库路径:', db.dbPath);
  
  // 测试查询
  db.db.get("SELECT 1 AS result", (err, row) => {
    if (err) {
      console.error('查询测试失败:', err);
    } else {
      console.log('查询测试成功，结果:', row);
    }
    
    // 关闭数据库连接
    db.close();
    console.log('数据库连接已关闭');
  });
} catch (error) {
  console.error('数据库连接失败:', error);
}