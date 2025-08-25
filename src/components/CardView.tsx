import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Pencil, Trash, File, Link, Envelope, Phone, MagnifyingGlass, Funnel, X, CheckSquare, Square, Download, Copy } from '@phosphor-icons/react';
import { Table, Row } from '@/types';
import { toast } from 'sonner';

interface CardViewProps {
  table: Table;
  onUpdateTable: (table: Table) => void;
}

export function CardView({ table, onUpdateTable }: CardViewProps) {
  const [editingRow, setEditingRow] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Record<string, any>>({});
  const [isAddRowOpen, setIsAddRowOpen] = useState(false);
  const [newRowValues, setNewRowValues] = useState<Record<string, any>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<{ [columnId: string]: string }>({});
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [isBatchEditOpen, setIsBatchEditOpen] = useState(false);
  const [batchEditColumn, setBatchEditColumn] = useState('');
  const [batchEditValue, setBatchEditValue] = useState('');

  const startEditRow = (row: Row) => {
    setEditingRow(row.id);
    setEditValues({ ...row });
  };

  const saveEdit = () => {
    if (!editingRow) return;

    const updatedRows = table.rows.map(row =>
      row.id === editingRow ? { ...editValues } : row
    );

    onUpdateTable({ ...table, rows: updatedRows });
    setEditingRow(null);
    setEditValues({});
    toast.success('行更新成功');
  };

  const cancelEdit = () => {
    setEditingRow(null);
    setEditValues({});
  };

  const deleteRow = (rowId: string) => {
    onUpdateTable({
      ...table,
      rows: table.rows.filter(row => row.id !== rowId)
    });
    toast.success('行刪除成功');
  };

  const addNewRow = () => {
    const newRow: Row = {
      id: Date.now().toString(),
      ...table.columns.reduce((acc, col) => {
        if (newRowValues[col.id] !== undefined) {
          acc[col.id] = newRowValues[col.id];
        } else {
          switch (col.type) {
            case 'boolean':
              acc[col.id] = false;
              break;
            case 'date':
              acc[col.id] = new Date().toISOString().split('T')[0];
              break;
            case 'number':
              acc[col.id] = 0;
              break;
            case 'file':
              acc[col.id] = null;
              break;
            default:
              acc[col.id] = '';
          }
        }
        return acc;
      }, {} as Record<string, any>)
    };

    onUpdateTable({
      ...table,
      rows: [...table.rows, newRow]
    });

    setNewRowValues({});
    setIsAddRowOpen(false);
    toast.success('行新增成功');
  };

  const handleFileUpload = (file: File, onChange: (value: any) => void) => {
    const fileUrl = URL.createObjectURL(file);
    const fileData = {
      name: file.name,
      size: file.size,
      type: file.type,
      url: fileUrl,
      lastModified: file.lastModified
    };
    onChange(fileData);
    toast.success('檔案上傳成功');
  };

  const clearFilters = () => {
    setFilters({});
    setSearchTerm('');
  };

  // 批量操作函數
  const toggleRowSelection = (rowId: string) => {
    const newSelected = new Set(selectedRows);
    if (newSelected.has(rowId)) {
      newSelected.delete(rowId);
    } else {
      newSelected.add(rowId);
    }
    setSelectedRows(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedRows.size === filteredRows.length && filteredRows.length > 0) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(filteredRows.map(row => row.id)));
    }
  };

  const batchDelete = () => {
    if (selectedRows.size === 0) {
      toast.error('請選擇要刪除的資料');
      return;
    }

    const updatedRows = table.rows.filter(row => !selectedRows.has(row.id));
    onUpdateTable({ ...table, rows: updatedRows });
    setSelectedRows(new Set());
    toast.success(`已刪除 ${selectedRows.size} 筆資料`);
  };

  const batchEdit = () => {
    if (selectedRows.size === 0) {
      toast.error('請選擇要編輯的資料');
      return;
    }
    if (!batchEditColumn) {
      toast.error('請選擇要編輯的欄位');
      return;
    }

    const column = table.columns.find(col => col.id === batchEditColumn);
    if (!column) return;

    let processedValue = batchEditValue;
    if (column.type === 'number') {
      processedValue = parseFloat(batchEditValue) || 0;
    } else if (column.type === 'boolean') {
      processedValue = batchEditValue === 'true';
    }

    const updatedRows = table.rows.map(row =>
      selectedRows.has(row.id)
        ? { ...row, [batchEditColumn]: processedValue }
        : row
    );

    onUpdateTable({ ...table, rows: updatedRows });
    setSelectedRows(new Set());
    setBatchEditColumn('');
    setBatchEditValue('');
    setIsBatchEditOpen(false);
    toast.success(`已更新 ${selectedRows.size} 筆資料`);
  };

  const batchExport = () => {
    if (selectedRows.size === 0) {
      toast.error('請選擇要匯出的資料');
      return;
    }

    const selectedRowsData = table.rows.filter(row => selectedRows.has(row.id));
    const exportData = {
      tableName: table.name,
      columns: table.columns,
      rows: selectedRowsData,
      exportedAt: new Date().toISOString(),
      totalRows: selectedRowsData.length
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${table.name}-selected-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success(`已匯出 ${selectedRows.size} 筆資料`);
  };

  const batchDuplicate = () => {
    if (selectedRows.size === 0) {
      toast.error('請選擇要複製的資料');
      return;
    }

    const selectedRowsData = table.rows.filter(row => selectedRows.has(row.id));
    const duplicatedRows = selectedRowsData.map(row => ({
      ...row,
      id: `${Date.now()}-${Math.random()}`,
    }));

    onUpdateTable({
      ...table,
      rows: [...table.rows, ...duplicatedRows]
    });

    setSelectedRows(new Set());
    toast.success(`已複製 ${selectedRowsData.length} 筆資料`);
  };

  const filteredRows = table.rows.filter(row => {
    // 搜尋篩選
    if (searchTerm) {
      const searchMatch = Object.values(row).some(value => {
        if (value && typeof value === 'object' && value.name) {
          // 對於檔案類型，搜尋檔案名稱
          return value.name.toLowerCase().includes(searchTerm.toLowerCase());
        }
        return String(value || '').toLowerCase().includes(searchTerm.toLowerCase());
      });
      if (!searchMatch) return false;
    }

    // 欄位篩選
    return Object.entries(filters).every(([columnId, filterValue]) => {
      if (!filterValue) return true;
      const cellValue = row[columnId];
      
      if (cellValue && typeof cellValue === 'object' && cellValue.name) {
        // 對於檔案類型，篩選檔案名稱
        return cellValue.name.toLowerCase().includes(filterValue.toLowerCase());
      }
      
      return String(cellValue || '').toLowerCase().includes(filterValue.toLowerCase());
    });
  });

  const renderFieldInput = (column: any, value: any, onChange: (value: any) => void, isEditing = false) => {
    const inputId = `${column.id}-${isEditing ? 'edit' : 'new'}`;
    
    switch (column.type) {
      case 'boolean':
        return (
          <div className="flex items-center space-x-2">
            <Checkbox
              id={inputId}
              checked={Boolean(value)}
              onCheckedChange={onChange}
            />
            <Label htmlFor={inputId}>{column.name}</Label>
          </div>
        );
      case 'select':
        return (
          <div className="space-y-2">
            <Label htmlFor={inputId}>{column.name}</Label>
            <Select value={String(value || '')} onValueChange={onChange}>
              <SelectTrigger>
                <SelectValue placeholder={`選擇${column.name.toLowerCase()}`} />
              </SelectTrigger>
              <SelectContent>
                {column.options?.map((option: string) => (
                  <SelectItem key={option} value={option}>{option}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );
      case 'number':
        return (
          <div className="space-y-2">
            <Label htmlFor={inputId}>{column.name}</Label>
            <Input
              id={inputId}
              type="number"
              value={value || ''}
              onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
              placeholder={`輸入${column.name.toLowerCase()}`}
            />
          </div>
        );
      case 'date':
        return (
          <div className="space-y-2">
            <Label htmlFor={inputId}>{column.name}</Label>
            <Input
              id={inputId}
              type="date"
              value={value || ''}
              onChange={(e) => onChange(e.target.value)}
            />
          </div>
        );
      case 'file':
        return (
          <div className="space-y-2">
            <Label htmlFor={inputId}>{column.name}</Label>
            <Input
              id={inputId}
              type="file"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  handleFileUpload(file, onChange);
                }
              }}
            />
            {value && (
              <div className="text-sm text-muted-foreground">
                已選擇: {value.name}
              </div>
            )}
          </div>
        );
      case 'url':
        return (
          <div className="space-y-2">
            <Label htmlFor={inputId}>{column.name}</Label>
            <Input
              id={inputId}
              type="url"
              value={value || ''}
              onChange={(e) => onChange(e.target.value)}
              placeholder="https://example.com"
            />
          </div>
        );
      case 'email':
        return (
          <div className="space-y-2">
            <Label htmlFor={inputId}>{column.name}</Label>
            <Input
              id={inputId}
              type="email"
              value={value || ''}
              onChange={(e) => onChange(e.target.value)}
              placeholder="example@email.com"
            />
          </div>
        );
      case 'phone':
        return (
          <div className="space-y-2">
            <Label htmlFor={inputId}>{column.name}</Label>
            <Input
              id={inputId}
              type="tel"
              value={value || ''}
              onChange={(e) => onChange(e.target.value)}
              placeholder="0912-345-678"
            />
          </div>
        );
      default:
        return (
          <div className="space-y-2">
            <Label htmlFor={inputId}>{column.name}</Label>
            <Input
              id={inputId}
              value={value || ''}
              onChange={(e) => onChange(e.target.value)}
              placeholder={`輸入${column.name.toLowerCase()}`}
            />
          </div>
        );
    }
  };

  const renderFieldDisplay = (column: any, value: any) => {
    switch (column.type) {
      case 'boolean':
        return (
          <div className="flex items-center space-x-2">
            <Checkbox checked={Boolean(value)} readOnly />
            <span className="text-sm">{Boolean(value) ? '是' : '否'}</span>
          </div>
        );
      case 'file':
        if (!value) return <span className="text-sm text-muted-foreground">無檔案</span>;
        return (
          <div className="flex items-center gap-2 text-sm">
            <File className="w-4 h-4 text-blue-500" />
            <a 
              href={value.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 underline"
            >
              {value.name}
            </a>
          </div>
        );
      case 'url':
        if (!value) return <span className="text-sm text-muted-foreground">無連結</span>;
        return (
          <div className="flex items-center gap-2 text-sm">
            <Link className="w-4 h-4 text-blue-500" />
            <a 
              href={value.startsWith('http') ? value : `https://${value}`}
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 underline"
            >
              {value}
            </a>
          </div>
        );
      case 'email':
        if (!value) return <span className="text-sm text-muted-foreground">無電子郵件</span>;
        return (
          <div className="flex items-center gap-2 text-sm">
            <Envelope className="w-4 h-4 text-green-500" />
            <a 
              href={`mailto:${value}`}
              className="text-green-600 hover:text-green-800 underline"
            >
              {value}
            </a>
          </div>
        );
      case 'phone':
        if (!value) return <span className="text-sm text-muted-foreground">無電話號碼</span>;
        return (
          <div className="flex items-center gap-2 text-sm">
            <Phone className="w-4 h-4 text-purple-500" />
            <a 
              href={`tel:${value}`}
              className="text-purple-600 hover:text-purple-800 underline"
            >
              {value}
            </a>
          </div>
        );
      default:
        return <span className="text-sm">{String(value || '')}</span>;
    }
  };

  return (
    <div className="space-y-4">
      {/* 搜尋和篩選區域 */}
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          {/* 搜尋框 */}
          <div className="relative flex-1 max-w-sm">
            <MagnifyingGlass className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="搜尋所有欄位..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
            {searchTerm && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1/2 transform -translate-y-1/2 p-1 h-auto"
                onClick={() => setSearchTerm('')}
              >
                <X className="w-3 h-3" />
              </Button>
            )}
          </div>

          {/* 篩選按鈕 */}
          <Dialog open={isFilterOpen} onOpenChange={setIsFilterOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Funnel className="w-4 h-4 mr-2" />
                篩選
                {Object.values(filters).filter(Boolean).length > 0 && (
                  <span className="ml-1 bg-primary text-primary-foreground rounded-full w-5 h-5 text-xs flex items-center justify-center">
                    {Object.values(filters).filter(Boolean).length}
                  </span>
                )}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>進階篩選</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {table.columns.map((column) => (
                  <div key={column.id}>
                    <Label htmlFor={`filter-${column.id}`}>{column.name}</Label>
                    <Input
                      id={`filter-${column.id}`}
                      placeholder={`篩選 ${column.name}...`}
                      value={filters[column.id] || ''}
                      onChange={(e) => setFilters(prev => ({
                        ...prev,
                        [column.id]: e.target.value
                      }))}
                    />
                  </div>
                ))}
                <div className="flex gap-2 pt-2">
                  <Button onClick={clearFilters} variant="outline" className="flex-1">
                    清除篩選
                  </Button>
                  <Button onClick={() => setIsFilterOpen(false)} className="flex-1">
                    套用篩選
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* 清除所有篩選 */}
          {(searchTerm || Object.values(filters).some(Boolean)) && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              <X className="w-4 h-4 mr-2" />
              清除全部
            </Button>
          )}
        </div>

        {/* 作用中的篩選顯示 */}
        {(searchTerm || Object.values(filters).some(Boolean)) && (
          <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
            {searchTerm && (
              <span className="bg-muted px-2 py-1 rounded flex items-center gap-1">
                搜尋: "{searchTerm}"
                <Button
                  variant="ghost"
                  size="sm"
                  className="p-0 h-auto ml-1"
                  onClick={() => setSearchTerm('')}
                >
                  <X className="w-3 h-3" />
                </Button>
              </span>
            )}
            {Object.entries(filters).map(([columnId, value]) => {
              if (!value) return null;
              const column = table.columns.find(col => col.id === columnId);
              return (
                <span key={columnId} className="bg-muted px-2 py-1 rounded flex items-center gap-1">
                  {column?.name}: "{value}"
                  <Button
                    variant="ghost"
                    size="sm"
                    className="p-0 h-auto ml-1"
                    onClick={() => setFilters(prev => ({ ...prev, [columnId]: '' }))}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </span>
              );
            })}
          </div>
        )}
      </div>

      {/* 批量操作工具列 */}
      {selectedRows.size > 0 && (
        <div className="bg-primary/10 border border-primary/20 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-primary">
                已選擇 {selectedRows.size} 筆資料
              </span>
              <div className="flex items-center gap-2">
                <Dialog open={isBatchEditOpen} onOpenChange={setIsBatchEditOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Pencil className="w-4 h-4 mr-2" />
                      批量編輯
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>批量編輯資料</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label>選擇要編輯的欄位</Label>
                        <Select value={batchEditColumn} onValueChange={setBatchEditColumn}>
                          <SelectTrigger>
                            <SelectValue placeholder="選擇欄位" />
                          </SelectTrigger>
                          <SelectContent>
                            {table.columns.map(column => (
                              <SelectItem key={column.id} value={column.id}>
                                {column.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      {batchEditColumn && (
                        <div>
                          <Label>新值</Label>
                          {(() => {
                            const column = table.columns.find(col => col.id === batchEditColumn);
                            if (!column) return null;

                            if (column.type === 'boolean') {
                              return (
                                <Select value={batchEditValue} onValueChange={setBatchEditValue}>
                                  <SelectTrigger>
                                    <SelectValue placeholder="選擇值" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="true">是</SelectItem>
                                    <SelectItem value="false">否</SelectItem>
                                  </SelectContent>
                                </Select>
                              );
                            } else if (column.type === 'select' && column.options) {
                              return (
                                <Select value={batchEditValue} onValueChange={setBatchEditValue}>
                                  <SelectTrigger>
                                    <SelectValue placeholder="選擇選項" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {column.options.map(option => (
                                      <SelectItem key={option} value={option}>
                                        {option}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              );
                            } else {
                              return (
                                <Input
                                  value={batchEditValue}
                                  onChange={(e) => setBatchEditValue(e.target.value)}
                                  placeholder="輸入新值"
                                  type={
                                    column.type === 'number' ? 'number' :
                                    column.type === 'date' ? 'date' :
                                    column.type === 'email' ? 'email' :
                                    column.type === 'phone' ? 'tel' :
                                    column.type === 'url' ? 'url' : 'text'
                                  }
                                />
                              );
                            }
                          })()}
                        </div>
                      )}
                      <div className="flex gap-2 pt-2">
                        <Button onClick={() => setIsBatchEditOpen(false)} variant="outline" className="flex-1">
                          取消
                        </Button>
                        <Button onClick={batchEdit} className="flex-1" disabled={!batchEditColumn}>
                          套用變更
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>

                <Button variant="outline" size="sm" onClick={batchDuplicate}>
                  <Copy className="w-4 h-4 mr-2" />
                  複製
                </Button>

                <Button variant="outline" size="sm" onClick={batchExport}>
                  <Download className="w-4 h-4 mr-2" />
                  匯出選中
                </Button>

                <Button variant="destructive" size="sm" onClick={batchDelete}>
                  <Trash className="w-4 h-4 mr-2" />
                  刪除選中
                </Button>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setSelectedRows(new Set())}
            >
              <X className="w-4 h-4 mr-2" />
              取消選擇
            </Button>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Dialog open={isAddRowOpen} onOpenChange={setIsAddRowOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                新增行
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>新增行</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                {table.columns.map((column) => (
                  <div key={column.id}>
                    {renderFieldInput(
                      column,
                      newRowValues[column.id],
                      (value) => setNewRowValues({ ...newRowValues, [column.id]: value })
                    )}
                  </div>
                ))}
                <div className="flex gap-2 pt-4">
                  <Button onClick={addNewRow} className="flex-1">
                    新增行
                  </Button>
                  <Button variant="outline" onClick={() => setIsAddRowOpen(false)} className="flex-1">
                    取消
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {filteredRows.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={toggleSelectAll}
            >
              {selectedRows.size === filteredRows.length && filteredRows.length > 0 ? (
                <>
                  <CheckSquare className="w-4 h-4 mr-2" />
                  取消全選
                </>
              ) : (
                <>
                  <Square className="w-4 h-4 mr-2" />
                  全選
                </>
              )}
            </Button>
          )}
        </div>
        
        <span className="text-sm text-muted-foreground">
          顯示 {filteredRows.length} / {table.rows.length} 筆資料
        </span>
      </div>

      {filteredRows.length === 0 && table.rows.length > 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="space-y-2">
              <MagnifyingGlass className="w-8 h-8 mx-auto text-muted-foreground/50" />
              <p className="text-muted-foreground">找不到符合條件的資料</p>
              <Button variant="outline" size="sm" onClick={clearFilters}>
                清除篩選條件
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : filteredRows.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">尚無資料。點擊「新增行」開始輸入資料。</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredRows.map((row) => (
            <Card key={row.id} className={`relative group transition-all ${selectedRows.has(row.id) ? 'ring-2 ring-primary bg-primary/5' : ''}`}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 flex-1">
                    <button
                      onClick={() => toggleRowSelection(row.id)}
                      className="p-1 hover:bg-muted rounded opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      {selectedRows.has(row.id) ? (
                        <CheckSquare className="w-4 h-4 text-primary" />
                      ) : (
                        <Square className="w-4 h-4 text-muted-foreground" />
                      )}
                    </button>
                    <CardTitle className="text-base">
                      {String(row[table.columns[0]?.id] || '未命名')}
                    </CardTitle>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {editingRow === row.id ? (
                      <>
                        <Button size="sm" variant="ghost" onClick={saveEdit}>
                          儲存
                        </Button>
                        <Button size="sm" variant="ghost" onClick={cancelEdit}>
                          取消
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => startEditRow(row)}
                        >
                          <Pencil className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => deleteRow(row.id)}
                        >
                          <Trash className="w-3 h-3" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {table.columns.slice(1).map((column) => (
                  <div key={column.id} className="space-y-1">
                    <Label className="text-xs font-medium text-muted-foreground">
                      {column.name}
                    </Label>
                    {editingRow === row.id ? (
                      renderFieldInput(
                        column,
                        editValues[column.id],
                        (value) => setEditValues({ ...editValues, [column.id]: value }),
                        true
                      )
                    ) : (
                      renderFieldDisplay(column, row[column.id])
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}