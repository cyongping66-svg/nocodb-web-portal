import { useState, useEffect } from 'react'
import { Table } from '@/types'
import { apiService } from '@/lib/api'
import { toast } from 'sonner'

// 检查是否使用 Supabase
const isUsingSupabase = import.meta.env.VITE_USE_SUPABASE === 'true'

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
        // 使用 Supabase 或后端 API
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

  const setTables = async (newTables: Table[] | ((prev: Table[]) => Table[])) => {
    const updatedTables = typeof newTables === 'function' ? newTables(tables) : newTables
    
    // 立即更新本地状态
    setTablesState(updatedTables)
    
    try {
      if (isUsingSupabase) {
        // Supabase 模式下可以实现同步逻辑
        toast.success('数据已更新')
      } else {
        // 本地存储模式
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedTables))
        toast.success('数据已保存到本地')
      }
    } catch (err) {
      console.error('Error syncing tables:', err)
      toast.error('同步到服务器时发生错误')
    }
  }

  const createTable = async (table: Omit<Table, 'rows'>) => {
    try {
      const newTable: Table = { ...table, rows: [] }
      
      if (isUsingSupabase) {
        await apiService.createTable(table)
        setTablesState(prev => [...prev, newTable])
      } else {
        // 本地存储模式
        const updatedTables = [...tables, newTable]
        setTablesState(updatedTables)
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedTables))
      }
      
      toast.success('表格已创建')
    } catch (err) {
      console.error('Error creating table:', err)
      toast.error('创建表格失败')
    }
  }

  const deleteTable = async (tableId: string) => {
    try {
      if (isUsingSupabase) {
        await apiService.deleteTable(tableId)
        setTablesState(prev => prev.filter(t => t.id !== tableId))
      } else {
        // 本地存储模式
        const updatedTables = tables.filter(t => t.id !== tableId)
        setTablesState(updatedTables)
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedTables))
      }
      
      toast.success('表格已删除')
    } catch (err) {
      console.error('Error deleting table:', err)
      toast.error('删除表格失败')
    }
  }

  const updateTable = async (updatedTable: Table) => {
    try {
      if (isUsingSupabase) {
        // 分离表格结构和行数据
        const { rows, ...tableStructure } = updatedTable
        
        // 更新表格结构
        await apiService.updateTable(updatedTable.id, tableStructure)
        
        // 更新本地状态
        setTablesState(prev => 
          prev.map(table => 
            table.id === updatedTable.id ? updatedTable : table
          )
        )
      } else {
        // 本地存储模式
        const updatedTables = tables.map(table => 
          table.id === updatedTable.id ? updatedTable : table
        )
        setTablesState(updatedTables)
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedTables))
      }
      
      toast.success('表格已更新')
    } catch (err) {
      console.error('Error updating table:', err)
      toast.error('更新表格失败')
    }
  }

  const refresh = () => {
    loadTables()
  }

  // 行数据操作方法
  const createRow = async (tableId: string, rowData: any) => {
    try {
      if (isUsingSupabase) {
        await apiService.createRow(tableId, rowData)
        
        // 重新加载该表格的数据
        const rows = await apiService.getTableRows(tableId)
        setTablesState(prev => 
          prev.map(table => 
            table.id === tableId ? { ...table, rows } : table
          )
        )
      } else {
        // 本地存储模式
        const updatedTables = tables.map(table => {
          if (table.id === tableId) {
            const newRow = { id: Date.now().toString(), ...rowData }
            return { ...table, rows: [...table.rows, newRow] }
          }
          return table
        })
        
        setTablesState(updatedTables)
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedTables))
      }
      
      toast.success('数据已添加')
    } catch (err) {
      console.error('Error creating row:', err)
      toast.error('添加数据失败')
    }
  }

  const updateRow = async (tableId: string, rowId: string, rowData: any) => {
    try {
      if (isUsingSupabase) {
        await apiService.updateRow(tableId, rowId, rowData)
        
        // 重新加载该表格的数据
        const rows = await apiService.getTableRows(tableId)
        setTablesState(prev => 
          prev.map(table => 
            table.id === tableId ? { ...table, rows } : table
          )
        )
      } else {
        // 本地存储模式
        const updatedTables = tables.map(table => {
          if (table.id === tableId) {
            const updatedRows = table.rows.map(row => 
              row.id === rowId ? { ...row, ...rowData } : row
            )
            return { ...table, rows: updatedRows }
          }
          return table
        })
        
        setTablesState(updatedTables)
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedTables))
      }
      
      toast.success('数据已更新')
    } catch (err) {
      console.error('Error updating row:', err)
      toast.error('更新数据失败')
    }
  }

  const deleteRow = async (tableId: string, rowId: string) => {
    try {
      if (isUsingSupabase) {
        await apiService.deleteRow(tableId, rowId)
        
        // 重新加载该表格的数据
        const rows = await apiService.getTableRows(tableId)
        setTablesState(prev => 
          prev.map(table => 
            table.id === tableId ? { ...table, rows } : table
          )
        )
      } else {
        // 本地存储模式
        const updatedTables = tables.map(table => {
          if (table.id === tableId) {
            const updatedRows = table.rows.filter(row => row.id !== rowId)
            return { ...table, rows: updatedRows }
          }
          return table
        })
        
        setTablesState(updatedTables)
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedTables))
      }
      
      toast.success('数据已删除')
    } catch (err) {
      console.error('Error deleting row:', err)
      toast.error('删除数据失败')
    }
  }

  const batchUpdateRows = async (tableId: string, operations: any[]) => {
    try {
      if (isUsingSupabase) {
        await apiService.batchUpdateRows(tableId, operations)
        
        // 重新加载该表格的数据
        const rows = await apiService.getTableRows(tableId)
        setTablesState(prev => 
          prev.map(table => 
            table.id === tableId ? { ...table, rows } : table
          )
        )
      } else {
        // 本地存储模式 - 简化处理，只处理删除操作
        let updatedTables = [...tables]
        
        for (const op of operations) {
          if (op.type === 'delete') {
            updatedTables = updatedTables.map(table => {
              if (table.id === tableId) {
                const updatedRows = table.rows.filter(row => !op.rowIds.includes(row.id))
                return { ...table, rows: updatedRows }
              }
              return table
            })
          }
        }
        
        setTablesState(updatedTables)
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedTables))
      }
      
      toast.success('批量操作已完成')
    } catch (err) {
      console.error('Error batch updating rows:', err)
      toast.error('批量操作失败')
    }
  }

  return {
    tables,
    setTables,
    createTable,
    deleteTable,
    updateTable,
    createRow,
    updateRow,
    deleteRow,
    batchUpdateRows,
    loading,
    error,
    refresh,
    isUsingSupabase
  }
}
