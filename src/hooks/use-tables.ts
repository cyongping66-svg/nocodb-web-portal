import { useState, useEffect } from 'react'
import { Table } from '../types'
import { apiService } from '@/lib/api'
import { toast } from 'sonner'

// ... existing code ...

// 检查是否使用 Supabase
const isUsingSupabase = import.meta.env.VITE_USE_SUPABASE === 'true'
// 检查是否使用后端API（即使不使用Supabase）
const isUsingBackend = import.meta.env.VITE_USE_SUPABASE !== 'true'

// 本地存储键名
const LOCAL_STORAGE_KEY = 'nocodb-tables'

export function useTables() {
  const [tables, setTablesState] = useState<Table[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // 初始化加载数据
  useEffect(() => {
    loadTables()
  }, [])

  const loadTables = async () => {
    setLoading(true)
    setError(null)

    try {
      if (isUsingSupabase) {
        // 使用 Supabase
        const tablesData = await apiService.getTables()
        
        // 为每个表格获取行数据
        const tablesWithRows = await Promise.all(
          tablesData.map(async (table: any) => {
            try {
              const rows = await apiService.getTableRows(table.id)
              return {
                ...table,
                rows: rows || []
              }
            } catch (err) {
              console.error(`Error loading table ${table.id}:`, err)
              return { ...table, rows: [] }
            }
          })
        )
        
        setTablesState(tablesWithRows)
      } else if (isUsingBackend) {
        // 使用后端 API（非 Supabase 模式）
        const tablesData = await apiService.getTables()
        
        // 为每个表格获取行数据
        const tablesWithRows = await Promise.all(
          tablesData.map(async (table: any) => {
            try {
              const rows = await apiService.getTableRows(table.id)
              return {
                ...table,
                rows: rows || []
              }
            } catch (err) {
              console.error(`Error loading table ${table.id}:`, err)
              return { ...table, rows: [] }
            }
          })
        )
        
        setTablesState(tablesWithRows)
      } else {
        // 使用本地存储
        const storedTables = localStorage.getItem(LOCAL_STORAGE_KEY)
        const tablesData = storedTables ? JSON.parse(storedTables) : []
        setTablesState(tablesData)
      }
    } catch (err) {
      console.error('Error loading tables:', err)
      setError('载入数据时发生错误')
      toast.error('无法连接到服务器')
    } finally {
      setLoading(false)
    }
  }

  const createTable = async (tableData: Omit<Table, 'id' | 'rows'>) => {
    try {
      if (isUsingSupabase || isUsingBackend) {
        // 使用 API 创建表格
        const newTable = await apiService.createTable(tableData)
        await loadTables()
        toast.success('表格创建成功')
        return newTable
      } else {
        // 使用本地存储
        const newTable = {
          ...tableData,
          id: Date.now().toString(),
          rows: []
        }
        const updatedTables = [...tables, newTable]
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedTables))
        setTablesState(updatedTables)
        toast.success('表格创建成功')
        return newTable
      }
    } catch (err) {
      console.error('Error creating table:', err)
      toast.error('创建表格失败')
      throw err
    }
  }

  const updateTable = async (tableId: string, tableData: Partial<Table>) => {
    try {
      if (isUsingSupabase || isUsingBackend) {
        // 使用 API 更新表格
        await apiService.updateTable(tableId, tableData)
        await loadTables()
        toast.success('表格更新成功')
      } else {
        // 使用本地存储
        const updatedTables = tables.map(table =>
          table.id === tableId ? { ...table, ...tableData } : table
        )
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedTables))
        setTablesState(updatedTables)
        toast.success('表格更新成功')
      }
    } catch (err) {
      console.error('Error updating table:', err)
      toast.error('更新表格失败')
      throw err
    }
  }

  const deleteTable = async (tableId: string) => {
    try {
      if (isUsingSupabase || isUsingBackend) {
        // 使用 API 删除表格
        await apiService.deleteTable(tableId)
        await loadTables()
        toast.success('表格删除成功')
      } else {
        // 使用本地存储
        const updatedTables = tables.filter(table => table.id !== tableId)
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedTables))
        setTablesState(updatedTables)
        toast.success('表格删除成功')
      }
    } catch (err) {
      console.error('Error deleting table:', err)
      toast.error('删除表格失败')
      throw err
    }
  }

  const addRow = async (tableId: string, rowData: any) => {
    try {
      if (isUsingSupabase || isUsingBackend) {
        // 使用 API 添加行
        await apiService.createRow(tableId, rowData)
        await loadTables()
        toast.success('数据添加成功')
      } else {
        // 使用本地存储
        const updatedTables = tables.map(table => {
          if (table.id === tableId) {
            const newRow = {
              ...rowData,
              id: Date.now().toString()
            }
            return {
              ...table,
              rows: [...table.rows, newRow]
            }
          }
          return table
        })
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedTables))
        setTablesState(updatedTables)
        toast.success('数据添加成功')
      }
    } catch (err) {
      console.error('Error adding row:', err)
      toast.error('添加数据失败')
      throw err
    }
  }

  const updateRow = async (tableId: string, rowId: string, rowData: any) => {
    try {
      if (isUsingSupabase || isUsingBackend) {
        // 使用 API 更新行
        await apiService.updateRow(tableId, rowId, rowData)
        await loadTables()
        toast.success('数据更新成功')
      } else {
        // 使用本地存储
        const updatedTables = tables.map(table => {
          if (table.id === tableId) {
            const updatedRows = table.rows.map(row =>
              row.id === rowId ? { ...row, ...rowData } : row
            )
            return {
              ...table,
              rows: updatedRows
            }
          }
          return table
        })
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedTables))
        setTablesState(updatedTables)
        toast.success('数据更新成功')
      }
    } catch (err) {
      console.error('Error updating row:', err)
      toast.error('更新数据失败')
      throw err
    }
  }

  const deleteRow = async (tableId: string, rowId: string) => {
    try {
      if (isUsingSupabase || isUsingBackend) {
        // 使用 API 删除行
        await apiService.deleteRow(tableId, rowId)
        await loadTables()
        toast.success('数据删除成功')
      } else {
        // 使用本地存储
        const updatedTables = tables.map(table => {
          if (table.id === tableId) {
            const updatedRows = table.rows.filter(row => row.id !== rowId)
            return {
              ...table,
              rows: updatedRows
            }
          }
          return table
        })
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedTables))
        setTablesState(updatedTables)
        toast.success('数据删除成功')
      }
    } catch (err) {
      console.error('Error deleting row:', err)
      toast.error('删除数据失败')
      throw err
    }
  }

  return {
    tables,
    loading,
    error,
    createTable,
    updateTable,
    deleteTable,
    addRow,
    updateRow,
    deleteRow,
    loadTables
  }
}