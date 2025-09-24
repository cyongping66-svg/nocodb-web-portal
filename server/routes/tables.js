const express = require('express');
const router = express.Router();
const DatabaseManager = require('../db/database');
const { v4: uuidv4 } = require('uuid');

const db = new DatabaseManager();

// 獲取所有表格
router.get('/', (req, res) => {
  try {
    const tables = db.getTables();
    
    // 解析 columns JSON 字串
    const parsedTables = tables.map(table => ({
      ...table,
      columns: JSON.parse(table.columns)
    }));

    res.json(parsedTables);
  } catch (err) {
    console.error('Error getting tables:', err);
    return res.status(500).json({ error: 'Failed to get tables' });
  }
});

// 獲取單個表格（包含行數據）
router.get('/:tableId', (req, res) => {
  const { tableId } = req.params;

  try {
    const table = db.getTable(tableId);
    
    if (!table) {
      return res.status(404).json({ error: 'Table not found' });
    }

    // 獲取表格的行數據
    const rows = db.getTableRows(tableId);

    // 解析數據
    const parsedRows = rows.map(row => JSON.parse(row.data));

    const result = {
      ...table,
      columns: JSON.parse(table.columns),
      rows: parsedRows
    };

    res.json(result);
  } catch (err) {
    console.error('Error getting table:', err);
    return res.status(500).json({ error: 'Failed to get table' });
  }
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

  try {
    db.createTable(tableData);
    res.status(201).json({ message: 'Table created successfully', table: tableData });
  } catch (err) {
    console.error('Error creating table:', err);
    return res.status(500).json({ error: 'Failed to create table' });
  }
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

  try {
    const result = db.updateTable(tableData);
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Table not found' });
    }
    res.json({ message: 'Table updated successfully' });
  } catch (err) {
    console.error('Error updating table:', err);
    return res.status(500).json({ error: 'Failed to update table' });
  }
});

// 刪除表格
router.delete('/:tableId', (req, res) => {
  const { tableId } = req.params;

  try {
    const result = db.deleteTable(tableId);
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Table not found' });
    }
    res.json({ message: 'Table deleted successfully' });
  } catch (err) {
    console.error('Error deleting table:', err);
    return res.status(500).json({ error: 'Failed to delete table' });
  }
});

module.exports = router;