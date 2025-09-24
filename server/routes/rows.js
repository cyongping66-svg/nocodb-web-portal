const express = require('express');
const router = express.Router();
const DatabaseManager = require('../db/database');
const { v4: uuidv4 } = require('uuid');

const db = new DatabaseManager();

// 獲取表格的所有行
router.get('/:tableId/rows', (req, res) => {
  const { tableId } = req.params;

  try {
    const rows = db.getTableRows(tableId);
    
    // 解析數據
    const parsedRows = rows.map(row => {
      const data = JSON.parse(row.data);
      return {
        id: row.id,
        ...data,
        _createdAt: row.created_at,
        _updatedAt: row.updated_at
      };
    });

    res.json(parsedRows);
  } catch (err) {
    console.error('Error getting rows:', err);
    return res.status(500).json({ error: 'Failed to get rows' });
  }
});

// 獲取單行數據
router.get('/:tableId/rows/:rowId', (req, res) => {
  const { tableId, rowId } = req.params;

  try {
    const row = db.getRowById(tableId, rowId);
    
    if (!row) {
      return res.status(404).json({ error: 'Row not found' });
    }

    const parsedData = JSON.parse(row.data);
    const result = {
      id: row.id,
      ...parsedData,
      _createdAt: row.created_at,
      _updatedAt: row.updated_at
    };

    res.json(result);
  } catch (err) {
    console.error('Error getting row:', err);
    return res.status(500).json({ error: 'Failed to get row' });
  }
});

// 創建新行
router.post('/:tableId/rows', (req, res) => {
  const { tableId } = req.params;
  const rowData = req.body;

  try {
    const newRow = db.createRow(tableId, rowData);
    
    const parsedData = JSON.parse(newRow.data);
    const result = {
      id: newRow.id,
      ...parsedData,
      _createdAt: newRow.created_at,
      _updatedAt: newRow.updated_at
    };

    res.status(201).json(result);
  } catch (err) {
    console.error('Error creating row:', err);
    return res.status(500).json({ error: 'Failed to create row' });
  }
});

// 更新行數據
router.put('/:tableId/rows/:rowId', (req, res) => {
  const { tableId, rowId } = req.params;
  const rowData = req.body;

  try {
    const updatedRow = db.updateRow(tableId, rowId, rowData);
    
    if (!updatedRow) {
      return res.status(404).json({ error: 'Row not found' });
    }

    const parsedData = JSON.parse(updatedRow.data);
    const result = {
      id: updatedRow.id,
      ...parsedData,
      _createdAt: updatedRow.created_at,
      _updatedAt: updatedRow.updated_at
    };

    res.json(result);
  } catch (err) {
    console.error('Error updating row:', err);
    return res.status(500).json({ error: 'Failed to update row' });
  }
});

// 刪除行
router.delete('/:tableId/rows/:rowId', (req, res) => {
  const { tableId, rowId } = req.params;

  try {
    const result = db.deleteRow(tableId, rowId);
    
    if (!result) {
      return res.status(404).json({ error: 'Row not found' });
    }

    res.json({ message: 'Row deleted successfully' });
  } catch (err) {
    console.error('Error deleting row:', err);
    return res.status(500).json({ error: 'Failed to delete row' });
  }
});

// 批量操作
router.post('/:tableId/rows/batch', (req, res) => {
  const { tableId } = req.params;
  const { operation, rows, rowIds } = req.body;

  switch (operation) {
    case 'create':
      // 批量創建
      const createPromises = rows.map(rowData => {
        return new Promise((resolve, reject) => {
          if (!rowData.id) {
            rowData.id = uuidv4();
          }
          try {
            const result = db.createRow(tableId, rowData);
            resolve(result);
          } catch (err) {
            reject(err);
          }
        });
      });

      Promise.all(createPromises)
        .then(results => {
          res.status(201).json({ message: 'Rows created successfully', rows: results });
        })
        .catch(err => {
          console.error('Error in batch create:', err);
          res.status(500).json({ error: 'Failed to create rows' });
        });
      break;

    case 'delete':
      // 批量刪除
      if (!rowIds || !Array.isArray(rowIds)) {
        return res.status(400).json({ error: 'rowIds array is required for delete operation' });
      }

      const deletePromises = rowIds.map(rowId => {
        return new Promise((resolve, reject) => {
          try {
            const result = db.deleteRow(rowId);
            resolve(result);
          } catch (err) {
            reject(err);
          }
        });
      });

      Promise.all(deletePromises)
        .then(() => {
          res.json({ message: `${rowIds.length} rows deleted successfully` });
        })
        .catch(err => {
          console.error('Error in batch delete:', err);
          res.status(500).json({ error: 'Failed to delete rows' });
        });
      break;

    default:
      res.status(400).json({ error: 'Invalid operation. Supported: create, delete' });
  }
});

module.exports = router;