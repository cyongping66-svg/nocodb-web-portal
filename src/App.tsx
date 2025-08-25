import { useState } from 'react';
import { useKV } from '@github/spark/hooks';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Table as TableIcon, LayoutGrid, Download } from '@phosphor-icons/react';
import { toast, Toaster } from 'sonner';
import { Table, ViewMode } from '@/types';
import { TableManager } from '@/components/TableManager';
import { DataTable } from '@/components/DataTable';
import { CardView } from '@/components/CardView';

function App() {
  const [tables, setTables] = useKV<Table[]>('database-tables', [
    {
      id: 'sample-employees',
      name: '員工資料',
      columns: [
        { id: 'name', name: '姓名', type: 'text' },
        { id: 'department', name: '部門', type: 'select', options: ['研發部', '行銷部', '人資部', '財務部'] },
        { id: 'salary', name: '薪資', type: 'number' },
        { id: 'hired_date', name: '到職日期', type: 'date' },
        { id: 'active', name: '在職狀態', type: 'boolean' }
      ],
      rows: [
        {
          id: 'emp1',
          name: '張小明',
          department: '研發部',
          salary: 65000,
          hired_date: '2023-01-15',
          active: true
        },
        {
          id: 'emp2', 
          name: '李小華',
          department: '行銷部',
          salary: 58000,
          hired_date: '2023-03-10',
          active: true
        },
        {
          id: 'emp3',
          name: '王大偉',
          department: '財務部', 
          salary: 72000,
          hired_date: '2022-11-20',
          active: false
        }
      ]
    },
    {
      id: 'sample-products',
      name: '產品清單',
      columns: [
        { id: 'product_name', name: '產品名稱', type: 'text' },
        { id: 'category', name: '分類', type: 'select', options: ['電子產品', '服飾配件', '居家用品', '運動器材'] },
        { id: 'price', name: '價格', type: 'number' },
        { id: 'launch_date', name: '上市日期', type: 'date' },
        { id: 'available', name: '供貨狀態', type: 'boolean' }
      ],
      rows: [
        {
          id: 'prod1',
          product_name: '無線藍牙耳機',
          category: '電子產品',
          price: 2990,
          launch_date: '2023-06-01',
          available: true
        },
        {
          id: 'prod2',
          product_name: '運動T恤',
          category: '服飾配件', 
          price: 890,
          launch_date: '2023-04-15',
          available: true
        },
        {
          id: 'prod3',
          product_name: '智能掃地機器人',
          category: '居家用品',
          price: 15900,
          launch_date: '2023-08-20',
          available: false
        }
      ]
    }
  ]);
  const [activeTableId, setActiveTableId] = useState<string | null>('sample-employees');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [newTableName, setNewTableName] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const activeTable = tables.find(table => table.id === activeTableId);

  const createTable = () => {
    if (!newTableName.trim()) {
      toast.error('請輸入資料表名稱');
      return;
    }

    const newTable: Table = {
      id: Date.now().toString(),
      name: newTableName.trim(),
      columns: [
        { id: 'name', name: '姓名', type: 'text' },
        { id: 'created', name: '建立日期', type: 'date' }
      ],
      rows: [
        {
          id: (Date.now() + 1).toString(),
          name: '張小明',
          created: new Date().toISOString().split('T')[0]
        },
        {
          id: (Date.now() + 2).toString(), 
          name: '李小華',
          created: new Date().toISOString().split('T')[0]
        }
      ]
    };

    setTables(currentTables => [...currentTables, newTable]);
    setActiveTableId(newTable.id);
    setNewTableName('');
    setIsCreateDialogOpen(false);
    toast.success(`資料表「${newTable.name}」建立成功`);
  };

  const deleteTable = (tableId: string) => {
    setTables(currentTables => currentTables.filter(table => table.id !== tableId));
    if (activeTableId === tableId) {
      setActiveTableId(null);
    }
    toast.success('資料表刪除成功');
  };

  const updateTable = (updatedTable: Table) => {
    setTables(currentTables => 
      currentTables.map(table => 
        table.id === updatedTable.id ? updatedTable : table
      )
    );
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
          </div>
          
          <div className="p-4">
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="w-full mb-4" size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  新增資料表
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>建立新資料表</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="table-name">資料表名稱</Label>
                    <Input
                      id="table-name"
                      value={newTableName}
                      onChange={(e) => setNewTableName(e.target.value)}
                      placeholder="輸入資料表名稱"
                      onKeyDown={(e) => e.key === 'Enter' && createTable()}
                    />
                  </div>
                  <Button onClick={createTable} className="w-full">
                    建立資料表
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
                      <Download className="w-4 h-4 mr-2" />
                      匯出
                    </Button>
                    <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as ViewMode)}>
                      <TabsList>
                        <TabsTrigger value="grid">
                          <TableIcon className="w-4 h-4" />
                        </TabsTrigger>
                        <TabsTrigger value="card">
                          <LayoutGrid className="w-4 h-4" />
                        </TabsTrigger>
                      </TabsList>
                    </Tabs>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 p-4">
                {viewMode === 'grid' ? (
                  <DataTable table={activeTable} onUpdateTable={updateTable} />
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
                    建立您的第一個資料表來開始組織您的資料
                  </p>
                  <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="w-4 h-4 mr-2" />
                        建立第一個資料表
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