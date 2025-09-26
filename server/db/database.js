const Database = require('better-sqlite3');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

class DatabaseManager {
  constructor() {
    // 使用環境變量指定的路徑，默認為當前目錄
    const dbDir = process.env.DB_PATH || __dirname;
    this.dbPath = path.join(dbDir, 'nocodb.sqlite');
    this.init();
  }

  init() {
    try {
      this.db = new Database(this.dbPath);
      console.log('Connected to SQLite database');
      this.createTables();
    } catch (err) {
      console.error('Error opening database:', err);
    }
  }

  createTables() {
    try {
      // 創建表格結構表
      this.db.exec(`
        CREATE TABLE IF NOT EXISTS tables (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          columns TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // 創建行數據表
      this.db.exec(`
        CREATE TABLE IF NOT EXISTS rows (
          id TEXT PRIMARY KEY,
          table_id TEXT NOT NULL,
          data TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (table_id) REFERENCES tables (id) ON DELETE CASCADE
        )
      `);

      console.log('Database tables created successfully');
      
      // 只有在表格創建成功後才插入示例數據
      this.insertSampleData();
    } catch (err) {
      console.error('Error creating tables:', err);
    }
  }

  insertSampleData() {
    const row = this.db.prepare("SELECT COUNT(*) as count FROM tables").get();
    
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
      const insertTable = this.db.prepare(
        "INSERT INTO tables (id, name, columns) VALUES (?, ?, ?)"
      );
      
      insertTable.run(tableId, '員工資料', JSON.stringify(columns));

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
          hired_date: '2023-03-22',
          email: 'hua.li@company.com',
          phone: '0923-456-789',
          active: true
        }
      ];

      const insertRow = this.db.prepare(
        "INSERT INTO rows (id, table_id, data) VALUES (?, ?, ?)"
      );

      for (const row of sampleRows) {
        insertRow.run(row.id, tableId, JSON.stringify(row));
      }

      console.log('Sample data inserted successfully');
    }
  }

  // 數據庫操作方法
  getTables() {
    try {
      const stmt = this.db.prepare("SELECT * FROM tables");
      return stmt.all();
    } catch (err) {
      console.error('Error getting tables:', err);
      return [];
    }
  }

  getTable(tableId) {
    try {
      const stmt = this.db.prepare("SELECT * FROM tables WHERE id = ?");
      return stmt.get(tableId);
    } catch (err) {
      console.error('Error getting table:', err);
      return null;
    }
  }

  createTable(tableData) {
    try {
      const { id, name, columns } = tableData;
      const stmt = this.db.prepare(
        "INSERT INTO tables (id, name, columns) VALUES (?, ?, ?)"
      );
      stmt.run(id, name, JSON.stringify(columns));
      return tableData;
    } catch (err) {
      console.error('Error creating table:', err);
      throw err;
    }
  }

  updateTable(tableData) {
    try {
      const { id, name, columns } = tableData;
      const stmt = this.db.prepare(
        "UPDATE tables SET name = ?, columns = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?"
      );
      return stmt.run(name, JSON.stringify(columns), id);
    } catch (err) {
      console.error('Error updating table:', err);
      throw err;
    }
  }

  deleteTable(tableId) {
    try {
      const stmt = this.db.prepare("DELETE FROM tables WHERE id = ?");
      return stmt.run(tableId);
    } catch (err) {
      console.error('Error deleting table:', err);
      throw err;
    }
  }

  getTableRows(tableId) {
    try {
      const stmt = this.db.prepare("SELECT * FROM rows WHERE table_id = ? ORDER BY created_at");
      return stmt.all(tableId);
    } catch (err) {
      console.error('Error getting rows:', err);
      return [];
    }
  }

  createRow(tableId, rowData) {
    try {
      const { id } = rowData;
      const stmt = this.db.prepare(
        "INSERT INTO rows (id, table_id, data) VALUES (?, ?, ?)"
      );
      return stmt.run(id, tableId, JSON.stringify(rowData));
    } catch (err) {
      console.error('Error creating row:', err);
      throw err;
    }
  }

  updateRow(rowId, rowData) {
    try {
      const stmt = this.db.prepare(
        "UPDATE rows SET data = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?"
      );
      return stmt.run(JSON.stringify(rowData), rowId);
    } catch (err) {
      console.error('Error updating row:', err);
      throw err;
    }
  }

// ... existing code ...

  deleteRow(rowId) {
    console.log(`DatabaseManager.deleteRow called with rowId: ${rowId}`);
    try {
      const stmt = this.db.prepare("DELETE FROM rows WHERE id = ?");
      const result = stmt.run(rowId);
      console.log('Database delete result:', result);
      return result;
    } catch (err) {
      console.error('Error deleting row:', err);
      throw err;
    }
  }

  // 添加批量操作方法
  batchUpdateRows(tableId, operations) {
    const results = [];
    const errors = [];
    
    // 开始事务
    const transaction = this.db.transaction((operations) => {
      for (const operation of operations) {
        try {
          switch (operation.type) {
            case 'create':
              if (operation.rowData) {
                const id = operation.rowData.id || uuidv4();
                const rowData = { ...operation.rowData, id };
                this.createRow(tableId, rowData);
                results.push({ operation: 'create', id, success: true });
              }
              break;
              
            case 'update':
              if (operation.rowId && operation.rowData) {
                this.updateRow(operation.rowId, operation.rowData);
                results.push({ operation: 'update', id: operation.rowId, success: true });
              }
              break;
              
            case 'delete':
              if (operation.rowId) {
                this.deleteRow(operation.rowId);
                results.push({ operation: 'delete', id: operation.rowId, success: true });
              } else if (operation.rowIds && Array.isArray(operation.rowIds)) {
                for (const rowId of operation.rowIds) {
                  this.deleteRow(rowId);
                  results.push({ operation: 'delete', id: rowId, success: true });
                }
              }
              break;
              
            default:
              errors.push({ operation: operation.type, error: 'Unknown operation type' });
          }
        } catch (err) {
          errors.push({ operation: operation.type, error: err.message });
        }
      }
    });
    
    try {
      transaction(operations);
      return { results, errors };
    } catch (err) {
      console.error('Error in batch operation:', err);
      throw err;
    }
  }

  close() {
    if (this.db) {
      this.db.close();
      console.log('Database connection closed');
    }
  }
}

module.exports = DatabaseManager;
