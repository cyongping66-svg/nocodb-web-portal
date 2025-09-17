const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const { v4: uuidv4 } = require('uuid');

class Database {
  constructor() {
    // 使用環境變量指定的路徑，默認為當前目錄
    const dbDir = process.env.DB_PATH || __dirname;
    this.dbPath = path.join(dbDir, 'nocodb.sqlite');
    this.init();
  }

  init() {
    this.db = new sqlite3.Database(this.dbPath, (err) => {
      if (err) {
        console.error('Error opening database:', err);
      } else {
        console.log('Connected to SQLite database');
        this.createTables();
      }
    });
  }

  createTables() {
    // 創建表格結構表
    this.db.run(`
      CREATE TABLE IF NOT EXISTS tables (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        columns TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `, (err) => {
      if (err) {
        console.error('Error creating tables table:', err);
        return;
      }

      // 創建行數據表
      this.db.run(`
        CREATE TABLE IF NOT EXISTS rows (
          id TEXT PRIMARY KEY,
          table_id TEXT NOT NULL,
          data TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (table_id) REFERENCES tables (id) ON DELETE CASCADE
        )
      `, (err) => {
        if (err) {
          console.error('Error creating rows table:', err);
          return;
        }

        // 只有在表格創建成功後才插入示例數據
        this.insertSampleData();
      });
    });
  }

  insertSampleData() {
    // 檢查是否已有數據
    this.db.get("SELECT COUNT(*) as count FROM tables", (err, row) => {
      if (err) {
        console.error('Error checking tables:', err);
        return;
      }

      if (row.count === 0) {
        console.log('Inserting sample data...');
        
        const tableId = 'sample-employees';
        const columns = [
          { id: 'name', name: '姓名', type: 'text' },
          { id: 'department', name: '部門', type: 'select', options: ['研發部', '行銷部', '人資部', '財務部'] },
          { id: 'salary', name: '薪資', type: 'number' },
          { id: 'hired_date', name: '到職日期', type: 'date' },
          { id: 'email', name: '電子郵件', type: 'email' },
          { id: 'phone', name: '聯絡電話', type: 'phone' },
          { id: 'active', name: '在職狀態', type: 'boolean' }
        ];

        // 插入表格定義
        this.db.run(
          "INSERT INTO tables (id, name, columns) VALUES (?, ?, ?)",
          [tableId, '員工資料', JSON.stringify(columns)],
          (err) => {
            if (err) {
              console.error('Error inserting table:', err);
              return;
            }

            // 插入示例行數據
            const sampleRows = [
              {
                id: 'emp1',
                name: '張小明',
                department: '研發部',
                salary: 65000,
                hired_date: '2023-01-15',
                email: 'ming.zhang@company.com',
                phone: '0912-345-678',
                active: true
              },
              {
                id: 'emp2',
                name: '李小華',
                department: '行銷部',
                salary: 58000,
                hired_date: '2023-03-10',
                email: 'hua.li@company.com',
                phone: '0923-456-789',
                active: true
              },
              {
                id: 'emp3',
                name: '王大偉',
                department: '財務部',
                salary: 72000,
                hired_date: '2022-11-20',
                email: 'david.wang@company.com',
                phone: '0934-567-890',
                active: false
              }
            ];

            sampleRows.forEach((rowData) => {
              this.db.run(
                "INSERT INTO rows (id, table_id, data) VALUES (?, ?, ?)",
                [rowData.id, tableId, JSON.stringify(rowData)]
              );
            });

            console.log('Sample data inserted successfully');
          }
        );
      }
    });
  }

  // 獲取所有表格
  getTables(callback) {
    this.db.all("SELECT * FROM tables ORDER BY created_at", callback);
  }

  // 獲取單個表格
  getTable(tableId, callback) {
    this.db.get("SELECT * FROM tables WHERE id = ?", [tableId], callback);
  }

  // 創建表格
  createTable(tableData, callback) {
    const { id, name, columns } = tableData;
    this.db.run(
      "INSERT INTO tables (id, name, columns) VALUES (?, ?, ?)",
      [id, name, JSON.stringify(columns)],
      callback
    );
  }

  // 更新表格
  updateTable(tableData, callback) {
    const { id, name, columns } = tableData;
    this.db.run(
      "UPDATE tables SET name = ?, columns = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
      [name, JSON.stringify(columns), id],
      callback
    );
  }

  // 刪除表格
  deleteTable(tableId, callback) {
    this.db.run("DELETE FROM tables WHERE id = ?", [tableId], callback);
  }

  // 獲取表格的所有行
  getTableRows(tableId, callback) {
    this.db.all("SELECT * FROM rows WHERE table_id = ? ORDER BY created_at", [tableId], callback);
  }

  // 創建行
  createRow(tableId, rowData, callback) {
    const { id, ...data } = rowData;
    this.db.run(
      "INSERT INTO rows (id, table_id, data) VALUES (?, ?, ?)",
      [id, tableId, JSON.stringify(rowData)],
      callback
    );
  }

  // 更新行
  updateRow(rowId, rowData, callback) {
    this.db.run(
      "UPDATE rows SET data = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
      [JSON.stringify(rowData), rowId],
      callback
    );
  }

  // 刪除行
  deleteRow(rowId, callback) {
    this.db.run("DELETE FROM rows WHERE id = ?", [rowId], callback);
  }

  // 關閉數據庫連接
  close() {
    this.db.close((err) => {
      if (err) {
        console.error('Error closing database:', err);
      } else {
        console.log('Database connection closed');
      }
    });
  }
}

module.exports = Database;
