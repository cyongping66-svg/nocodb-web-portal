const express = require('express');
const router = express.Router();
const Database = require('../db/database');
const { v4: uuidv4 } = require('uuid');

const db = new Database();

// 獲取表格的所有行
router.get('/:tableId/rows', (req, res) => {
  const { tableId } = req.params;

  db.getTableRows(tableId, (err, rows) => {
    if (err) {
      console.error('Error getting rows:', err);
      return res.status(500).json({ error: 'Failed to get rows' });
    }

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
  });
});

// 創建新行
router.post('/:tableId/rows', (req, res) => {
  const { tableId } = req.params;
  const rowData = req.body;

  if (!rowData.id) {
    rowData.id = uuidv4();
  }

  db.createRow(tableId, rowData, (err) => {
    if (err) {
      console.error('Error creating row:', err);
      return res.status(500).json({ error: 'Failed to create row' });
    }

    res.status(201).json({ message: 'Row created successfully', row: rowData });
  });
});

// 更新行
router.put('/:tableId/rows/:rowId', (req, res) => {
  const { rowId } = req.params;
  const rowData = req.body;

  // 確保 ID 一致
  rowData.id = rowId;

  db.updateRow(rowId, rowData, (err) => {
    if (err) {
      console.error('Error updating row:', err);
      return res.status(500).json({ error: 'Failed to update row' });
    }

    res.json({ message: 'Row updated successfully' });
  });
});

// 刪除行
router.delete('/:tableId/rows/:rowId', (req, res) => {
  const { rowId } = req.params;

  db.deleteRow(rowId, (err) => {
    if (err) {
      console.error('Error deleting row:', err);
      return res.status(500).json({ error: 'Failed to delete row' });
    }

    res.json({ message: 'Row deleted successfully' });
  });
});

// 批量操作
router.post('/:tableId/rows/batch', (req, res) => {
  const { tableId } = req.params;
  const { operation, rows, rowIds } = req.body;

  switch (operation) {
    case 'create':
      // 批量創建
      const promises = rows.map(rowData => {
        return new Promise((resolve, reject) => {
          if (!rowData.id) {
            rowData.id = uuidv4();
          }
          db.createRow(tableId, rowData, (err) => {
            if (err) reject(err);
            else resolve(rowData);
          });
        });
      });

      Promise.all(promises)
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
          db.deleteRow(rowId, (err) => {
            if (err) reject(err);
            else resolve(rowId);
          });
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
