import { useState, useEffect } from 'react';
import { useTables } from '@/hooks/use-tables';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Table as TableIcon, Grid3X3, Download } from 'lucide-react';
import { toast, Toaster } from 'sonner';
import { Table, ViewMode } from '@/types';
import { TableManager } from '@/components/TableManager';
import { DataTable } from '@/components/DataTable';
import { CardView } from '@/components/CardView';

function App() {
  const { 
    tables, 
    setTables, 
    createTable: createTableInDB, 
    deleteTable: deleteTableFromDB, 
    updateTable: updateTableInDB,
    createRow,
    updateRow,
    deleteRow,
    batchUpdateRows,
    loading, 
    error, 
    refresh, 
    isUsingSupabase 
  } = useTables();
  
  const [activeTableId, setActiveTableId] = useState<string | null>(() => {
    // 從 localStorage 讀取上次選中的表格
    const savedTableId = localStorage.getItem('activeTableId');
    return savedTableId || 'sample-employees';
  });
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [newTableName, setNewTableName] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  // 當選中的表格改變時，保存到 localStorage
  useEffect(() => {
    if (activeTableId) {
      localStorage.setItem('activeTableId', activeTableId);
    }
  }, [activeTableId]);

  const activeTable = tables?.find(table => table.id === activeTableId);

  const createTable = async () => {
    if (!newTableName.trim()) {
      toast.error('請輸入子表名稱');
      return;
    }

    const newTableData = {
      id: Date.now().toString(),
      name: newTableName.trim(),
      columns: [
        { id: 'name', name: '姓名', type: 'text' as const },
        { id: 'email', name: '電子郵件', type: 'email' as const },
        { id: 'created', name: '建立日期', type: 'date' as const }
      ]
    };

    await createTableInDB(newTableData);
    setActiveTableId(newTableData.id);
    setNewTableName('');
    setIsCreateDialogOpen(false);
  };

  const deleteTable = async (tableId: string) => {
    await deleteTableFromDB(tableId);
    if (activeTableId === tableId) {
      setActiveTableId(null);
    }
  };

  const updateTable = async (updatedTable: Table) => {
    try {
      // 使用 hook 中的 updateTable 方法
      if (updateTableInDB) {
        await updateTableInDB(updatedTable);
      } else {
        // 備用邏輯
        await setTables(currentTables => 
          currentTables ? currentTables.map(table => 
            table.id === updatedTable.id ? updatedTable : table
          ) : [updatedTable]
        );
      }
    } catch (error) {
      console.error('Error updating table:', error);
      toast.error('更新表格時發生錯誤');
    }
  };

  const exportData = () => {
    if (!activeTable) return;
    
    const dataStr = JSON.stringify({
      tableName: activeTable.name,
      columns: activeTable.columns,
      rows: activeTable.rows
    }, null, 2);
    
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${activeTable.name.toLowerCase().replace(/\s+/g, '-')}.json`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success('資料匯出成功');
  };

  return (
    <div className="min-h-screen bg-background">
      <Toaster position="top-right" />
      <div className="flex h-screen">
        {/* Sidebar */}
        <div className="w-64 border-r border-border bg-card">
          <div className="p-4 border-b border-border">
            <h1 className="text-xl font-bold text-foreground">孵化之路信息管理系統</h1>
            <div className="mt-2 flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${isUsingSupabase ? 'bg-green-500' : 'bg-orange-500'}`}></div>
              <span className="text-xs text-muted-foreground">
                {isUsingSupabase ? '雲端存儲' : '本地存儲'}
              </span>
              {error && (
                <span className="text-xs text-red-500">連接錯誤</span>
              )}
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
              tables={tables || []}
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
                      <Download className="w-4 h-4 mr-2" />
                      匯出
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
                  <DataTable 
                    table={activeTable} 
                    onUpdateTable={updateTable}
                    onCreateRow={createRow}
                    onUpdateRow={updateRow}
                    onDeleteRow={deleteRow}
                  />
                ) : (
                  <CardView table={activeTable} onUpdateTable={updateTable} />
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