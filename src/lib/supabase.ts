import { createClient } from '@supabase/supabase-js'
import { Table, Column, Row } from '@/types'

// 这里需要替换为实际的 Supabase 项目配置
// 在实际使用时，这些应该存储在环境变量中
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co'
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key'

export const supabase = createClient(supabaseUrl, supabaseKey)

// 数据库表结构类型
export interface DatabaseTable {
  id: string
  name: string
  columns: Column[]
  user_id?: string
  created_at?: string
  updated_at?: string
}

export interface DatabaseRow {
  id: string
  table_id: string
  data: Record<string, any>
  user_id?: string
  created_at?: string
  updated_at?: string
}

// 数据服务类
export class DataService {
  // 获取用户的所有表格
  static async getTables(userId?: string): Promise<Table[]> {
    try {
      let query = supabase
        .from('tables')
        .select('*')
        .order('created_at', { ascending: false })

      if (userId) {
        query = query.eq('user_id', userId)
      }

      const { data, error } = await query

      if (error) {
        console.error('Error fetching tables:', error)
        return []
      }

      // 获取每个表格的行数据
      const tablesWithRows = await Promise.all(
        (data || []).map(async (table) => {
          const rows = await this.getTableRows(table.id)
          return {
            id: table.id,
            name: table.name,
            columns: table.columns,
            rows
          }
        })
      )

      return tablesWithRows
    } catch (error) {
      console.error('Error in getTables:', error)
      return []
    }
  }

  // 创建新表格
  static async createTable(table: Omit<Table, 'rows'>, userId?: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('tables')
        .insert({
          id: table.id,
          name: table.name,
          columns: table.columns,
          user_id: userId
        })

      if (error) {
        console.error('Error creating table:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Error in createTable:', error)
      return false
    }
  }

  // 更新表格
  static async updateTable(table: Omit<Table, 'rows'>, userId?: string): Promise<boolean> {
    try {
      let query = supabase
        .from('tables')
        .update({
          name: table.name,
          columns: table.columns,
          updated_at: new Date().toISOString()
        })
        .eq('id', table.id)

      if (userId) {
        query = query.eq('user_id', userId)
      }

      const { error } = await query

      if (error) {
        console.error('Error updating table:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Error in updateTable:', error)
      return false
    }
  }

  // 删除表格
  static async deleteTable(tableId: string, userId?: string): Promise<boolean> {
    try {
      // 先删除所有行数据
      await this.deleteAllTableRows(tableId, userId)

      // 再删除表格
      let query = supabase
        .from('tables')
        .delete()
        .eq('id', tableId)

      if (userId) {
        query = query.eq('user_id', userId)
      }

      const { error } = await query

      if (error) {
        console.error('Error deleting table:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Error in deleteTable:', error)
      return false
    }
  }

  // 获取表格的所有行数据
  static async getTableRows(tableId: string): Promise<Row[]> {
    try {
      const { data, error } = await supabase
        .from('rows')
        .select('*')
        .eq('table_id', tableId)
        .order('created_at', { ascending: true })

      if (error) {
        console.error('Error fetching rows:', error)
        return []
      }

      return (data || []).map(row => ({
        id: row.id,
        ...row.data
      }))
    } catch (error) {
      console.error('Error in getTableRows:', error)
      return []
    }
  }

  // 创建新行
  static async createRow(tableId: string, row: Row, userId?: string): Promise<boolean> {
    try {
      const { id, ...data } = row
      
      const { error } = await supabase
        .from('rows')
        .insert({
          id,
          table_id: tableId,
          data,
          user_id: userId
        })

      if (error) {
        console.error('Error creating row:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Error in createRow:', error)
      return false
    }
  }

  // 更新行数据
  static async updateRow(tableId: string, row: Row, userId?: string): Promise<boolean> {
    try {
      const { id, ...data } = row
      
      let query = supabase
        .from('rows')
        .update({
          data,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .eq('table_id', tableId)

      if (userId) {
        query = query.eq('user_id', userId)
      }

      const { error } = await query

      if (error) {
        console.error('Error updating row:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Error in updateRow:', error)
      return false
    }
  }

  // 删除行
  static async deleteRow(tableId: string, rowId: string, userId?: string): Promise<boolean> {
    try {
      let query = supabase
        .from('rows')
        .delete()
        .eq('id', rowId)
        .eq('table_id', tableId)

      if (userId) {
        query = query.eq('user_id', userId)
      }

      const { error } = await query

      if (error) {
        console.error('Error deleting row:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Error in deleteRow:', error)
      return false
    }
  }

  // 删除表格的所有行
  static async deleteAllTableRows(tableId: string, userId?: string): Promise<boolean> {
    try {
      let query = supabase
        .from('rows')
        .delete()
        .eq('table_id', tableId)

      if (userId) {
        query = query.eq('user_id', userId)
      }

      const { error } = await query

      if (error) {
        console.error('Error deleting all table rows:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Error in deleteAllTableRows:', error)
      return false
    }
  }

  // 批量删除行
  static async deleteRows(tableId: string, rowIds: string[], userId?: string): Promise<boolean> {
    try {
      let query = supabase
        .from('rows')
        .delete()
        .eq('table_id', tableId)
        .in('id', rowIds)

      if (userId) {
        query = query.eq('user_id', userId)
      }

      const { error } = await query

      if (error) {
        console.error('Error deleting rows:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Error in deleteRows:', error)
      return false
    }
  }
}
