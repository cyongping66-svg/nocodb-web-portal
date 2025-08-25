import { useState } from 'react';
import { useKV } from '@github/spark/hooks';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Table as TableIcon, LayoutGrid, Download } from '@phosphor-icons/react';
import { toast } from 'sonner';
import { Table, ViewMode } from '@/types';
import { TableManager } from '@/components/TableManager';
import { DataTable } from '@/components/DataTable';
import { CardView } from '@/components/CardView';

function App() {
  const [tables, setTables] = useKV<Table[]>('database-tables', []);
  const [activeTableId, setActiveTableId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [newTableName, setNewTableName] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const activeTable = tables.find(table => table.id === activeTableId);

  const createTable = () => {
    if (!newTableName.trim()) {
      toast.error('Please enter a table name');
      return;
    }

    const newTable: Table = {
      id: Date.now().toString(),
      name: newTableName.trim(),
      columns: [
        { id: 'name', name: 'Name', type: 'text' },
        { id: 'created', name: 'Created', type: 'date' }
      ],
      rows: []
    };

    setTables(currentTables => [...currentTables, newTable]);
    setActiveTableId(newTable.id);
    setNewTableName('');
    setIsCreateDialogOpen(false);
    toast.success(`Table "${newTable.name}" created successfully`);
  };

  const deleteTable = (tableId: string) => {
    setTables(currentTables => currentTables.filter(table => table.id !== tableId));
    if (activeTableId === tableId) {
      setActiveTableId(null);
    }
    toast.success('Table deleted successfully');
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
    toast.success('Data exported successfully');
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="flex h-screen">
        {/* Sidebar */}
        <div className="w-64 border-r border-border bg-card">
          <div className="p-4 border-b border-border">
            <h1 className="text-xl font-bold text-foreground">Database Builder</h1>
          </div>
          
          <div className="p-4">
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="w-full mb-4" size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  New Table
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Table</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="table-name">Table Name</Label>
                    <Input
                      id="table-name"
                      value={newTableName}
                      onChange={(e) => setNewTableName(e.target.value)}
                      placeholder="Enter table name"
                      onKeyDown={(e) => e.key === 'Enter' && createTable()}
                    />
                  </div>
                  <Button onClick={createTable} className="w-full">
                    Create Table
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            <TableManager
              tables={tables}
              activeTableId={activeTableId}
              onSelectTable={setActiveTableId}
              onDeleteTable={deleteTable}
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
                      Export
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
                  <CardTitle className="text-center">Welcome to Database Builder</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-muted-foreground mb-4">
                    Create your first table to start organizing your data
                  </p>
                  <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="w-4 h-4 mr-2" />
                        Create First Table
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