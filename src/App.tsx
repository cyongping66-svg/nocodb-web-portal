import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Edit, Trash2, ArrowUp, ArrowDown, GripVertical, Link, File, Mail, Phone, Search, Filter, X, CheckSquare, Square, Download as DownloadIcon, Copy, Table as TableIcon, Grid3X3 } from 'lucide-react';
import { toast, Toaster } from 'sonner';
import { Table, ViewMode } from '@/types';
import { TableManager } from '@/components/TableManager';
import { DataTable } from '@/components/DataTable';
import { CardView } from '@/components/CardView';
import { apiService } from '@/lib/api';
import * as XLSX from 'xlsx';

function App() {
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTableId, setActiveTableId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [newTableName, setNewTableName] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  // 加载表格数据
  useEffect(() => {
    loadTables();
  }, []);

  const loadTables = async () => {
    try {
      setLoading(true);
      const tablesData = await apiService.getTables();
      
      // 为每个表格获取行数据
      const tablesWithRows = await Promise.all(
        tablesData.map(async (table: any) => {
          try {
            const rows = await apiService.getTableRows(table.id);
            return {
              ...table,
              rows: rows || []
            };
          } catch (err) {
            console.error(`Error loading table ${table.id}:`, err);
            return { ...table, rows: [] };
          }
        })
      );
      
      setTables(tablesWithRows);
      if (tablesWithRows.length > 0 && !activeTableId) {
        setActiveTableId(tablesWithRows[0].id);
      }
    } catch (err) {
      console.error('Error loading tables:', err);
      toast.error('載入數據時發生錯誤');
    } finally {
      setLoading(false);
    }
  };

  const activeTable = tables?.find(table => table.id === activeTableId);

  const createTable = async () => {
    if (!newTableName.trim()) {
      toast.error('請輸入子表名稱');
      return;
    }

    try {
      const tableData = {
        name: newTableName.trim(),
        columns: [
          { id: 'name', name: '姓名', type: 'text' },
          { id: 'email', name: '電子郵件', type: 'email' },
          { id: 'created', name: '建立日期', type: 'date' }
        ]
      };

      const newTable = await apiService.createTable(tableData);
      await loadTables();
      setActiveTableId(newTable.id);
      setNewTableName('');
      setIsCreateDialogOpen(false);
      toast.success(`子表「${newTable.name}」建立成功`);
    } catch (err) {
      console.error('Error creating table:', err);
      toast.error('創建子表失敗');
    }
  };

  const deleteTable = async (tableId: string) => {
    try {
      await apiService.deleteTable(tableId);
      await loadTables();
      if (activeTableId === tableId) {
        setActiveTableId(tables.length > 1 ? tables[0].id : null);
      }
      toast.success('子表刪除成功');
    } catch (err) {
      console.error('Error deleting table:', err);
      toast.error('刪除子表失敗');
    }
  };
  const updateTable = async (updatedTable: Table) => {
    try {
      await apiService.updateTable(updatedTable.id, updatedTable);
      await loadTables();
    } catch (err) {
      console.error('Error updating table:', err);
      toast.error('更新子表失敗');
    }
  };

  // 在 updateTable 函数后添加以下函数:
      const createRow = async (tableId: string, rowData: any) => {
    try {
      // 调用后端 API 创建新行
      await apiService.createRow(tableId, rowData);
      // 重新加载数据以确保同步
      await loadTables();
      toast.success('數據添加成功');
    } catch (err) {
      console.error('Error creating row:', err);
      toast.error('添加數據失敗');
    }
  };
    const updateRow = async (tableId: string, rowId: string, rowData: any) => {
    try {
      // 调用后端 API 更新行数据
      await apiService.updateRow(tableId, rowId, rowData);
      // 重新加载数据以确保同步
      await loadTables();
      toast.success('數據更新成功');
    } catch (err) {
      console.error('Error updating row:', err);
      toast.error('更新數據失敗');
    }
  };
  const deleteRow = async (tableId: string, rowId: string) => {
    try {
      // 调用后端 API 删除行数据
      await apiService.deleteRow(tableId, rowId);
      // 重新加载数据以确保同步
      await loadTables();
      toast.success('數據刪除成功');
    } catch (err) {
      console.error('Error deleting row:', err);
      toast.error('刪除數據失敗');
    }
  };
  const exportData = () => {
    if (!activeTable) return;

    // 准备表头数据
    const headers = activeTable.columns.map(col => col.name);
    
    // 准备行数据
    const rows = activeTable.rows.map(row => {
      const rowData: any = {};
      activeTable.columns.forEach(col => {
        rowData[col.name] = row[col.id];
      });
      return rowData;
    });

    // 创建工作表
    const ws = XLSX.utils.aoa_to_sheet([headers, ...rows.map(row => 
      headers.map(header => {
        const value = row[header];
        // 处理特殊类型数据
        if (value && typeof value === 'object') {
          if (value.name) {
            // 文件类型数据
            return value.name;
          }
          // 其他对象类型数据
          return JSON.stringify(value);
        }
        return value;
      })
    )]);

    // 创建工作簿
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, activeTable.name.substring(0, 31)); // Excel工作表名称限制为31个字符

    // 导出文件
    XLSX.writeFile(wb, `${activeTable.name.toLowerCase().replace(/\s+/g, '-')}.xlsx`);
    toast.success('Excel資料匯出成功');
  };

  // 显示存储模式
  const storageMode = '本地 SQLite 數據庫';

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>載入中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Toaster position="top-right" />
      <div className="flex h-screen">
        {/* Sidebar */}
        <div className="w-64 border-r border-border bg-card">
          <div className="p-4 border-b border-border">
            <h1 className="text-xl font-bold text-foreground">孵化之路信息管理系統</h1>
            <div className="text-sm text-muted-foreground mt-1">
              當前存儲模式: {storageMode}
            </div>
          </div>
          
          <div className="p-4">
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="w-full mb-4" size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  新增子表
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>建立新子表</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="table-name">子表名稱</Label>
                    <Input
                      id="table-name"
                      value={newTableName}
                      onChange={(e) => setNewTableName(e.target.value)}
                      placeholder="輸入子表名稱"
                      onKeyDown={(e) => e.key === 'Enter' && createTable()}
                    />
                  </div>
                  <Button onClick={createTable} className="w-full">
                    建立子表
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
             
            <TableManager
              tables={tables}
              activeTableId={activeTableId}
              onSelectTable={setActiveTableId}
              onDeleteTable={deleteTable}
              onUpdateTable={updateTable}
            />
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {activeTable ? (
            <>
              {/* Header */}
              <div className="p-4 border-b border-border bg-card">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-foreground">{activeTable.name}</h2>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={exportData}>
                      <DownloadIcon className="w-4 h-4 mr-2" />
                      匯出EXCEL
                    </Button>
                    <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as ViewMode)}>
                      <TabsList>
                        <TabsTrigger value="grid">
                          <TableIcon className="w-4 h-4" />
                        </TabsTrigger>
                        <TabsTrigger value="card">
                          <Grid3X3 className="w-4 h-4" />
                        </TabsTrigger>
                      </TabsList>
                    </Tabs>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 p-4">
                {viewMode === 'grid' ? (
                  <DataTable table={activeTable} 
                  onUpdateTable={updateTable} onCreateRow={createRow} onUpdateRow={updateRow} onDeleteRow={deleteRow} />
                ) : (
                  <CardView table={activeTable} 
                  onUpdateTable={updateTable} onCreateRow={createRow} onUpdateRow={updateRow} onDeleteRow={deleteRow} />
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <Card className="max-w-md">
                <CardHeader>
                  <CardTitle className="text-center">歡迎使用孵化之路信息管理系統</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-muted-foreground mb-4">
                    建立您的第一個子表來開始組織您的資料
                  </p>
                  <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="w-4 h-4 mr-2" />
                        建立第一個子表
                      </Button>
                    </DialogTrigger>
                  </Dialog>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;