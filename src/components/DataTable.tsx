import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Pencil, Trash, ArrowUp, ArrowDown, DotsSixVertical, Link, File, Envelope, Phone, MagnifyingGlass, Funnel, X, CheckSquare, Square, Download, Copy } from '@phosphor-icons/react';
import { Table, Column, Row } from '@/types';
import { toast } from 'sonner';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  horizontalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import {
  CSS,
} from '@dnd-kit/utilities';

// 為選項生成一致的顏色
const getOptionColor = (option: string, index: number) => {
  const colors = [
    'bg-blue-100 text-blue-800 border-blue-200',
    'bg-green-100 text-green-800 border-green-200', 
    'bg-purple-100 text-purple-800 border-purple-200',
    'bg-orange-100 text-orange-800 border-orange-200',
    'bg-pink-100 text-pink-800 border-pink-200',
    'bg-cyan-100 text-cyan-800 border-cyan-200',
    'bg-yellow-100 text-yellow-800 border-yellow-200',
    'bg-indigo-100 text-indigo-800 border-indigo-200',
    'bg-red-100 text-red-800 border-red-200',
    'bg-emerald-100 text-emerald-800 border-emerald-200'
  ];
  
  // 使用選項字串的哈希值來確保相同選項總是得到相同顏色
  let hash = 0;
  for (let i = 0; i < option.length; i++) {
    const char = option.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // 轉換為32位整數
  }
  
  return colors[Math.abs(hash) % colors.length];
};

interface DataTableProps {
  table: Table;
  onUpdateTable: (table: Table) => void;
}

interface SortableHeaderProps {
  column: Column;
  sortConfig: { key: string; direction: 'asc' | 'desc' } | null;
  onSort: (columnId: string) => void;
  onDelete: (columnId: string) => void;
  onUpdateColumn: (columnId: string, newName: string) => void;
}

function SortableHeader({ column, sortConfig, onSort, onDelete, onUpdateColumn }: SortableHeaderProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(column.name);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: column.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
    setEditValue(column.name);
  };

  const handleSaveEdit = () => {
    if (editValue.trim() && editValue.trim() !== column.name) {
      onUpdateColumn(column.id, editValue.trim());
    }
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditValue(column.name);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSaveEdit();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleCancelEdit();
    }
  };

  return (
    <th 
      ref={setNodeRef} 
      style={style} 
      className="text-left border-r border-border last:border-r-0 relative"
    >
      <div className="flex items-center justify-between p-3 group">
        <div className="flex items-center gap-2 flex-1">
          <button
            className="p-1 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing"
            {...attributes}
            {...listeners}
          >
            <DotsSixVertical className="w-3 h-3 text-muted-foreground" />
          </button>
          
          {isEditing ? (
            <Input
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onBlur={handleSaveEdit}
              onKeyDown={handleKeyDown}
              className="h-7 text-sm font-medium"
              autoFocus
            />
          ) : (
            <div className="flex items-center gap-1">
              <div className="flex items-center gap-2">
                <span 
                  className="hover:bg-muted/50 px-1 py-0.5 rounded cursor-pointer transition-colors text-sm font-medium text-foreground"
                  onClick={handleEditClick}
                  title="點擊編輯欄位名稱"
                >
                  {column.name}
                </span>
                <button
                  className="flex items-center gap-1 text-sm font-medium text-foreground hover:text-primary transition-colors"
                  onClick={() => onSort(column.id)}
                  title="排序"
                >
                  {sortConfig?.key === column.id && (
                    sortConfig.direction === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
                  )}
                </button>
              </div>
              <button
                className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 hover:bg-muted rounded"
                onClick={handleEditClick}
                title="編輯欄位名稱"
              >
                <Pencil className="w-3 h-3 text-muted-foreground" />
              </button>
            </div>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="opacity-0 group-hover:opacity-100 transition-opacity p-1 h-auto"
          onClick={() => onDelete(column.id)}
        >
          <Trash className="w-3 h-3" />
        </Button>
      </div>
    </th>
  );
}

export function DataTable({ table, onUpdateTable }: DataTableProps) {
  const [editingCell, setEditingCell] = useState<{ rowId: string; columnId: string } | null>(null);
  const [editValue, setEditValue] = useState('');
  const [isAddColumnOpen, setIsAddColumnOpen] = useState(false);
  const [newColumn, setNewColumn] = useState({ name: '', type: 'text' as Column['type'], options: [''] });
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<{ [columnId: string]: string }>({});
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [isBatchEditOpen, setIsBatchEditOpen] = useState(false);
  const [batchEditColumn, setBatchEditColumn] = useState('');
  const [batchEditValue, setBatchEditValue] = useState('');

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = table.columns.findIndex(col => col.id === active.id);
      const newIndex = table.columns.findIndex(col => col.id === over?.id);

      const newColumns = arrayMove(table.columns, oldIndex, newIndex);
      
      onUpdateTable({
        ...table,
        columns: newColumns
      });
      
      toast.success('欄位順序已更新');
    }
  };

  const addColumn = () => {
    if (!newColumn.name.trim()) {
      toast.error('請輸入欄位名稱');
      return;
    }

    const column: Column = {
      id: Date.now().toString(),
      name: newColumn.name.trim(),
      type: newColumn.type,
      options: newColumn.type === 'select' ? newColumn.options.filter(opt => opt.trim()) : undefined
    };

    onUpdateTable({
      ...table,
      columns: [...table.columns, column]
    });

    setNewColumn({ name: '', type: 'text', options: [''] });
    setIsAddColumnOpen(false);
    toast.success('欄位新增成功');
  };

  const updateColumn = (columnId: string, newName: string) => {
    const updatedColumns = table.columns.map(col =>
      col.id === columnId ? { ...col, name: newName } : col
    );

    onUpdateTable({
      ...table,
      columns: updatedColumns
    });

    toast.success('欄位名稱已更新');
  };

  const deleteColumn = (columnId: string) => {
    const updatedColumns = table.columns.filter(col => col.id !== columnId);
    const updatedRows: Row[] = table.rows.map(row => {
      const { [columnId]: deleted, ...rest } = row;
      return rest as Row;
    });

    onUpdateTable({
      ...table,
      columns: updatedColumns,
      rows: updatedRows
    });
    toast.success('欄位刪除成功');
  };

  const addRow = () => {
    const newRow: Row = {
      id: Date.now().toString(),
      ...table.columns.reduce((acc, col) => {
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
        return acc;
      }, {} as Record<string, any>)
    };

    onUpdateTable({
      ...table,
      rows: [...table.rows, newRow] as Row[]
    });
  };

  const deleteRow = (rowId: string) => {
    onUpdateTable({
      ...table,
      rows: table.rows.filter(row => row.id !== rowId)
    });
  };

  const startEdit = (rowId: string, columnId: string, currentValue: any) => {
    setEditingCell({ rowId, columnId });
    setEditValue(String(currentValue || ''));
  };

  const saveEdit = () => {
    if (!editingCell) return;

    const column = table.columns.find(col => col.id === editingCell.columnId);
    if (!column) return;

    let processedValue: any = editValue;
    if (column.type === 'number') {
      processedValue = parseFloat(editValue) || 0;
    } else if (column.type === 'boolean') {
      processedValue = editValue === 'true';
    }

    const updatedRows: Row[] = table.rows.map(row =>
      row.id === editingCell.rowId
        ? { ...row, [editingCell.columnId]: processedValue }
        : row
    );

    onUpdateTable({ ...table, rows: updatedRows });
    setEditingCell(null);
    setEditValue('');
  };

  const handleFileUpload = (rowId: string, columnId: string, file: File) => {
    // Create a file URL for display
    const fileUrl = URL.createObjectURL(file);
    const fileData = {
      name: file.name,
      size: file.size,
      type: file.type,
      url: fileUrl,
      lastModified: file.lastModified
    };

    const updatedRows: Row[] = table.rows.map(row =>
      row.id === rowId
        ? { ...row, [columnId]: fileData }
        : row
    );

    onUpdateTable({ ...table, rows: updatedRows });
    toast.success('檔案上傳成功');
  };

  const cancelEdit = () => {
    setEditingCell(null);
    setEditValue('');
  };

  const handleSort = (columnId: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === columnId && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key: columnId, direction });
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
    if (selectedRows.size === sortedRows.length && sortedRows.length > 0) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(sortedRows.map(row => row.id)));
    }
  };

  const batchDelete = () => {
    if (selectedRows.size === 0) {
      toast.error('請選擇要刪除的資料');
      return;
    }

    const updatedRows: Row[] = table.rows.filter(row => !selectedRows.has(row.id));
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

    let processedValue: any = batchEditValue;
    if (column.type === 'number') {
      processedValue = parseFloat(batchEditValue) || 0;
    } else if (column.type === 'boolean') {
      processedValue = batchEditValue === 'true';
    }

    const updatedRows: Row[] = table.rows.map(row =>
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
    const duplicatedRows: Row[] = selectedRowsData.map(row => ({
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
    return Object.entries(filters).every(([filterKey, filterValue]) => {
      if (!filterValue) return true;
      
      // 檢查是否為範圍篩選（數字或日期）
      if (filterKey.endsWith('_min') || filterKey.endsWith('_max') || 
          filterKey.endsWith('_start') || filterKey.endsWith('_end')) {
        const columnId = filterKey.replace(/_min|_max|_start|_end$/, '');
        const column = table.columns.find(col => col.id === columnId);
        const cellValue = row[columnId];
        
        if (!column || cellValue === null || cellValue === undefined) return true;
        
        if (column.type === 'number') {
          const numValue = parseFloat(cellValue);
          if (isNaN(numValue)) return true;
          
          if (filterKey.endsWith('_min')) {
            const minValue = parseFloat(filterValue);
            return isNaN(minValue) || numValue >= minValue;
          } else if (filterKey.endsWith('_max')) {
            const maxValue = parseFloat(filterValue);
            return isNaN(maxValue) || numValue <= maxValue;
          }
        } else if (column.type === 'date') {
          const dateValue = new Date(cellValue);
          const filterDate = new Date(filterValue);
          
          if (isNaN(dateValue.getTime()) || isNaN(filterDate.getTime())) return true;
          
          if (filterKey.endsWith('_start')) {
            return dateValue >= filterDate;
          } else if (filterKey.endsWith('_end')) {
            return dateValue <= filterDate;
          }
        }
        
        return true;
      }
      
      // 一般篩選
      const cellValue = row[filterKey];
      const column = table.columns.find(col => col.id === filterKey);
      
      if (!column) return true;
      
      if (column.type === 'boolean') {
        return String(cellValue) === filterValue;
      } else if (column.type === 'select') {
        return cellValue === filterValue;
      } else {
        // 文字類型篩選
        if (cellValue && typeof cellValue === 'object' && cellValue.name) {
          // 對於檔案類型，篩選檔案名稱
          return cellValue.name.toLowerCase().includes(filterValue.toLowerCase());
        }
        return String(cellValue || '').toLowerCase().includes(filterValue.toLowerCase());
      }
    });
  });

  const sortedRows = [...filteredRows];
  if (sortConfig) {
    sortedRows.sort((a, b) => {
      const aVal = a[sortConfig.key];
      const bVal = b[sortConfig.key];
      
      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }

  const renderCell = (row: Row, column: Column) => {
    const value = row[column.id];
    const isEditing = editingCell?.rowId === row.id && editingCell?.columnId === column.id;

    if (isEditing) {
      if (column.type === 'boolean') {
        return (
          <Checkbox
            checked={editValue === 'true'}
            onCheckedChange={(checked) => setEditValue(String(checked))}
            onBlur={saveEdit}
            autoFocus
          />
        );
      } else if (column.type === 'select' && column.options) {
        return (
          <Select value={editValue} onValueChange={(val) => { setEditValue(val); saveEdit(); }}>
            <SelectTrigger className="h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {column.options.map((option, index) => (
                <SelectItem key={option} value={option}>
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded border ${getOptionColor(option, index)}`} />
                    {option}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      } else if (column.type === 'file') {
        return (
          <Input
            type="file"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                handleFileUpload(row.id, column.id, file);
                setEditingCell(null);
              }
            }}
            className="h-8"
            autoFocus
          />
        );
      } else {
        return (
          <Input
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={saveEdit}
            onKeyDown={(e) => {
              if (e.key === 'Enter') saveEdit();
              if (e.key === 'Escape') cancelEdit();
            }}
            className="h-8"
            type={
              column.type === 'number' ? 'number' :
              column.type === 'date' ? 'date' :
              column.type === 'email' ? 'email' :
              column.type === 'phone' ? 'tel' :
              column.type === 'url' ? 'url' : 'text'
            }
            autoFocus
          />
        );
      }
    }

    // Display logic for different column types
    const renderCellContent = () => {
      if (column.type === 'boolean') {
        return <Checkbox checked={Boolean(value)} disabled />;
      } else if (column.type === 'file' && value) {
        return (
          <div className="flex items-center gap-2 text-sm">
            <File className="w-4 h-4 text-blue-500" />
            <a 
              href={value.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 underline truncate max-w-[150px]"
              onClick={(e) => e.stopPropagation()}
            >
              {value.name}
            </a>
          </div>
        );
      } else if (column.type === 'url' && value) {
        return (
          <div className="flex items-center gap-2 text-sm">
            <Link className="w-4 h-4 text-blue-500" />
            <a 
              href={value.startsWith('http') ? value : `https://${value}`}
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 underline truncate max-w-[150px]"
              onClick={(e) => e.stopPropagation()}
            >
              {value}
            </a>
          </div>
        );
      } else if (column.type === 'email' && value) {
        return (
          <div className="flex items-center gap-2 text-sm">
            <Envelope className="w-4 h-4 text-green-500" />
            <a 
              href={`mailto:${value}`}
              className="text-green-600 hover:text-green-800 underline"
              onClick={(e) => e.stopPropagation()}
            >
              {value}
            </a>
          </div>
        );
      } else if (column.type === 'phone' && value) {
        return (
          <div className="flex items-center gap-2 text-sm">
            <Phone className="w-4 h-4 text-purple-500" />
            <a 
              href={`tel:${value}`}
              className="text-purple-600 hover:text-purple-800 underline"
              onClick={(e) => e.stopPropagation()}
            >
              {value}
            </a>
          </div>
        );
      } else if (column.type === 'select' && value && column.options) {
        // 為選項類型添加顏色標籤
        const optionIndex = column.options.indexOf(value);
        const colorClass = getOptionColor(value, optionIndex);
        
        return (
          <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium border ${colorClass}`}>
            {value}
          </span>
        );
      } else {
        return <span className="text-sm">{String(value || '')}</span>;
      }
    };

    return (
      <div
        className="p-2 cursor-pointer hover:bg-muted/50 transition-colors min-h-[32px] flex items-center"
        onClick={() => startEdit(row.id, column.id, column.type === 'file' ? '' : value)}
      >
        {renderCellContent()}
      </div>
    );
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
                    {(() => {
                      // 根據欄位類型提供不同的篩選控制項
                      if (column.type === 'boolean') {
                        return (
                          <Select 
                            value={filters[column.id] || ''} 
                            onValueChange={(value) => setFilters(prev => ({
                              ...prev,
                              [column.id]: value
                            }))}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="選擇布林值" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="">全部</SelectItem>
                              <SelectItem value="true">是</SelectItem>
                              <SelectItem value="false">否</SelectItem>
                            </SelectContent>
                          </Select>
                        );
                      } else if (column.type === 'select' && column.options) {
                        return (
                          <Select 
                            value={filters[column.id] || ''} 
                            onValueChange={(value) => setFilters(prev => ({
                              ...prev,
                              [column.id]: value
                            }))}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="選擇選項" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="">全部</SelectItem>
                              {column.options.map((option, index) => (
                                <SelectItem key={option} value={option}>
                                  <div className="flex items-center gap-2">
                                    <div className={`w-3 h-3 rounded-full border ${getOptionColor(option, index)}`} />
                                    {option}
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        );
                      } else if (column.type === 'number') {
                        return (
                          <div className="flex gap-2">
                            <Input
                              type="number"
                              placeholder="最小值"
                              value={filters[`${column.id}_min`] || ''}
                              onChange={(e) => setFilters(prev => ({
                                ...prev,
                                [`${column.id}_min`]: e.target.value
                              }))}
                              className="flex-1"
                            />
                            <Input
                              type="number" 
                              placeholder="最大值"
                              value={filters[`${column.id}_max`] || ''}
                              onChange={(e) => setFilters(prev => ({
                                ...prev,
                                [`${column.id}_max`]: e.target.value
                              }))}
                              className="flex-1"
                            />
                          </div>
                        );
                      } else if (column.type === 'date') {
                        return (
                          <div className="flex gap-2">
                            <Input
                              type="date"
                              placeholder="起始日期"
                              value={filters[`${column.id}_start`] || ''}
                              onChange={(e) => setFilters(prev => ({
                                ...prev,
                                [`${column.id}_start`]: e.target.value
                              }))}
                              className="flex-1"
                            />
                            <Input
                              type="date"
                              placeholder="結束日期"
                              value={filters[`${column.id}_end`] || ''}
                              onChange={(e) => setFilters(prev => ({
                                ...prev,
                                [`${column.id}_end`]: e.target.value
                              }))}
                              className="flex-1"
                            />
                          </div>
                        );
                      } else {
                        // 預設為文字搜尋（適用於 text, email, phone, url, file）
                        return (
                          <Input
                            id={`filter-${column.id}`}
                            placeholder={`篩選 ${column.name}...`}
                            value={filters[column.id] || ''}
                            onChange={(e) => setFilters(prev => ({
                              ...prev,
                              [column.id]: e.target.value
                            }))}
                            type={
                              column.type === 'email' ? 'email' :
                              column.type === 'phone' ? 'tel' :
                              column.type === 'url' ? 'url' : 'text'
                            }
                          />
                        );
                      }
                    })()}
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
            {Object.entries(filters).map(([filterKey, value]) => {
              if (!value) return null;
              
              // 處理範圍篩選的顯示
              if (filterKey.endsWith('_min') || filterKey.endsWith('_start')) {
                const columnId = filterKey.replace(/_min|_start$/, '');
                const column = table.columns.find(col => col.id === columnId);
                const maxKey = filterKey.replace(/_min$/, '_max').replace(/_start$/, '_end');
                const maxValue = filters[maxKey];
                
                if (!column) return null;
                
                const label = filterKey.endsWith('_min') ? '最小' : '起始';
                const rangeLabel = maxValue ? ` - ${maxValue}` : '';
                
                return (
                  <span key={filterKey} className="bg-muted px-2 py-1 rounded flex items-center gap-1">
                    {column.name} {label}: {value}{rangeLabel}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="p-0 h-auto ml-1"
                      onClick={() => {
                        setFilters(prev => {
                          const newFilters = { ...prev };
                          delete newFilters[filterKey];
                          if (maxValue) delete newFilters[maxKey];
                          return newFilters;
                        });
                      }}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </span>
                );
              } else if (filterKey.endsWith('_max') || filterKey.endsWith('_end')) {
                // 跳過 max/end 標籤，因為它們已經在 min/start 中處理了
                const minKey = filterKey.replace(/_max$/, '_min').replace(/_end$/, '_start');
                if (filters[minKey]) return null;
                
                const columnId = filterKey.replace(/_max|_end$/, '');
                const column = table.columns.find(col => col.id === columnId);
                if (!column) return null;
                
                const label = filterKey.endsWith('_max') ? '最大' : '結束';
                
                return (
                  <span key={filterKey} className="bg-muted px-2 py-1 rounded flex items-center gap-1">
                    {column.name} {label}: {value}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="p-0 h-auto ml-1"
                      onClick={() => setFilters(prev => ({ ...prev, [filterKey]: '' }))}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </span>
                );
              } else {
                // 一般篩選
                const column = table.columns.find(col => col.id === filterKey);
                if (!column) return null;
                
                return (
                  <span key={filterKey} className="bg-muted px-2 py-1 rounded flex items-center gap-1">
                    {column.name}: "{value}"
                    <Button
                      variant="ghost"
                      size="sm"
                      className="p-0 h-auto ml-1"
                      onClick={() => setFilters(prev => ({ ...prev, [filterKey]: '' }))}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </span>
                );
              }
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
                                    {column.options.map((option, index) => (
                                      <SelectItem key={option} value={option}>
                                        <div className="flex items-center gap-2">
                                          <div className={`w-3 h-3 rounded border ${getOptionColor(option, index)}`} />
                                          {option}
                                        </div>
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
          <Button onClick={addRow} size="sm">
            <Plus className="w-4 h-4 mr-2" />
            新增行
          </Button>
          
          <Dialog open={isAddColumnOpen} onOpenChange={setIsAddColumnOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Plus className="w-4 h-4 mr-2" />
                新增欄位
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>新增欄位</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="column-name">欄位名稱</Label>
                  <Input
                    id="column-name"
                    value={newColumn.name}
                    onChange={(e) => setNewColumn({ ...newColumn, name: e.target.value })}
                    placeholder="輸入欄位名稱"
                  />
                </div>
                <div>
                  <Label htmlFor="column-type">資料類型</Label>
                  <Select value={newColumn.type} onValueChange={(value: Column['type']) => setNewColumn({ ...newColumn, type: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="text">文字</SelectItem>
                      <SelectItem value="number">數字</SelectItem>
                      <SelectItem value="date">日期</SelectItem>
                      <SelectItem value="boolean">布林值</SelectItem>
                      <SelectItem value="select">選項</SelectItem>
                      <SelectItem value="file">檔案</SelectItem>
                      <SelectItem value="url">網址連結</SelectItem>
                      <SelectItem value="email">電子郵件</SelectItem>
                      <SelectItem value="phone">電話號碼</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {newColumn.type === 'select' && (
                  <div>
                    <Label>選項</Label>
                    {newColumn.options.map((option, index) => (
                      <div key={index} className="flex gap-2 mt-2">
                        <Input
                          value={option}
                          onChange={(e) => {
                            const newOptions = [...newColumn.options];
                            newOptions[index] = e.target.value;
                            setNewColumn({ ...newColumn, options: newOptions });
                          }}
                          placeholder={`選項 ${index + 1}`}
                        />
                        {index === newColumn.options.length - 1 && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setNewColumn({ ...newColumn, options: [...newColumn.options, ''] })}
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                <Button onClick={addColumn} className="w-full">
                  新增欄位
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        
        <span className="text-sm text-muted-foreground">
          顯示 {sortedRows.length} / {table.rows.length} 筆資料
        </span>
      </div>

      <div className="border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <DndContext 
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="w-12 p-3">
                    <div className="flex items-center justify-center">
                      <button
                        onClick={toggleSelectAll}
                        className="p-1 hover:bg-muted rounded"
                        title={selectedRows.size === sortedRows.length && sortedRows.length > 0 ? "取消全選" : "全選"}
                      >
                        {selectedRows.size === sortedRows.length && sortedRows.length > 0 ? (
                          <CheckSquare className="w-4 h-4 text-primary" />
                        ) : selectedRows.size > 0 ? (
                          <div className="w-4 h-4 bg-primary/20 border-2 border-primary rounded flex items-center justify-center">
                            <div className="w-2 h-2 bg-primary rounded-sm" />
                          </div>
                        ) : (
                          <Square className="w-4 h-4 text-muted-foreground" />
                        )}
                      </button>
                    </div>
                  </th>
                  <SortableContext items={table.columns.map(col => col.id)} strategy={horizontalListSortingStrategy}>
                    {table.columns.map((column) => (
                      <SortableHeader
                        key={column.id}
                        column={column}
                        sortConfig={sortConfig}
                        onSort={handleSort}
                        onDelete={deleteColumn}
                        onUpdateColumn={updateColumn}
                      />
                    ))}
                  </SortableContext>
                  <th className="w-12 p-3"></th>
                </tr>
              </thead>
              <tbody>
                {sortedRows.map((row) => (
                  <tr key={row.id} className="border-t border-border hover:bg-muted/25 transition-colors group">
                    <td className="p-2">
                      <div className="flex items-center justify-center">
                        <button
                          onClick={() => toggleRowSelection(row.id)}
                          className="p-1 hover:bg-muted rounded"
                        >
                          {selectedRows.has(row.id) ? (
                            <CheckSquare className="w-4 h-4 text-primary" />
                          ) : (
                            <Square className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                          )}
                        </button>
                      </div>
                    </td>
                    {table.columns.map((column) => (
                      <td key={column.id} className="border-r border-border last:border-r-0">
                        {renderCell(row, column)}
                      </td>
                    ))}
                    <td className="p-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 h-auto"
                        onClick={() => deleteRow(row.id)}
                      >
                        <Trash className="w-3 h-3" />
                      </Button>
                    </td>
                  </tr>
                ))}
                {sortedRows.length === 0 && table.rows.length > 0 ? (
                  <tr>
                    <td colSpan={table.columns.length + 2} className="p-8 text-center text-muted-foreground">
                      <div className="space-y-2">
                        <MagnifyingGlass className="w-8 h-8 mx-auto text-muted-foreground/50" />
                        <p>找不到符合條件的資料</p>
                        <Button variant="outline" size="sm" onClick={clearFilters}>
                          清除篩選條件
                        </Button>
                      </div>
                    </td>
                  </tr>
                ) : sortedRows.length === 0 ? (
                  <tr>
                    <td colSpan={table.columns.length + 2} className="p-8 text-center text-muted-foreground">
                      尚無資料。點擊「新增行」開始輸入資料。
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </DndContext>
        </div>
      </div>
    </div>
  );
}