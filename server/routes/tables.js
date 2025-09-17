const express = require('express');
const router = express.Router();
const Database = require('../db/database');
const { v4: uuidv4 } = require('uuid');

const db = new Database();

// 獲取所有表格
router.get('/', (req, res) => {
  db.getTables((err, tables) => {
    if (err) {
      console.error('Error getting tables:', err);
      return res.status(500).json({ error: 'Failed to get tables' });
    }

    // 解析 columns JSON 字串
    const parsedTables = tables.map(table => ({
      ...table,
      columns: JSON.parse(table.columns)
    }));

    res.json(parsedTables);
  });
});

// 獲取單個表格（包含行數據）
router.get('/:tableId', (req, res) => {
  const { tableId } = req.params;

  db.getTable(tableId, (err, table) => {
    if (err) {
      console.error('Error getting table:', err);
      return res.status(500).json({ error: 'Failed to get table' });
    }

    if (!table) {
      return res.status(404).json({ error: 'Table not found' });
    }

    // 獲取表格的行數據
    db.getTableRows(tableId, (err, rows) => {
      if (err) {
        console.error('Error getting rows:', err);
        return res.status(500).json({ error: 'Failed to get rows' });
      }

      // 解析數據
      const parsedRows = rows.map(row => JSON.parse(row.data));

      const result = {
        ...table,
        columns: JSON.parse(table.columns),
        rows: parsedRows
      };

      res.json(result);
    });
  });
});

// 創建新表格
router.post('/', (req, res) => {
  const { name, columns } = req.body;

  if (!name || !columns) {
    return res.status(400).json({ error: 'Name and columns are required' });
  }

  const tableData = {
    id: uuidv4(),
    name,
    columns
  };

  db.createTable(tableData, (err) => {
    if (err) {
      console.error('Error creating table:', err);
      return res.status(500).json({ error: 'Failed to create table' });
    }

    res.status(201).json({ message: 'Table created successfully', table: tableData });
  });
});

// 更新表格結構
router.put('/:tableId', (req, res) => {
  const { tableId } = req.params;
  const { name, columns } = req.body;

  if (!name || !columns) {
    return res.status(400).json({ error: 'Name and columns are required' });
  }

  const tableData = {
    id: tableId,
    name,
    columns
  };

  db.updateTable(tableData, (err) => {
    if (err) {
      console.error('Error updating table:', err);
      return res.status(500).json({ error: 'Failed to update table' });
    }

    res.json({ message: 'Table updated successfully' });
  });
});

// 刪除表格
router.delete('/:tableId', (req, res) => {
  const { tableId } = req.params;

  db.deleteTable(tableId, (err) => {
    if (err) {
      console.error('Error deleting table:', err);
      return res.status(500).json({ error: 'Failed to delete table' });
    }

    res.json({ message: 'Table deleted successfully' });
  });
});

module.exports = router;
