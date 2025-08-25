import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Pencil, Trash, ArrowUp, ArrowDown } from '@phosphor-icons/react';
import { Table, Column, Row } from '@/types';
import { toast } from 'sonner';

interface DataTableProps {
  table: Table;
  onUpdateTable: (table: Table) => void;
}

export function DataTable({ table, onUpdateTable }: DataTableProps) {
  const [editingCell, setEditingCell] = useState<{ rowId: string; columnId: string } | null>(null);
  const [editValue, setEditValue] = useState('');
  const [isAddColumnOpen, setIsAddColumnOpen] = useState(false);
  const [newColumn, setNewColumn] = useState({ name: '', type: 'text' as Column['type'], options: [''] });
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);

  const addColumn = () => {
    if (!newColumn.name.trim()) {
      toast.error('Please enter a column name');
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
    toast.success('Column added successfully');
  };

  const deleteColumn = (columnId: string) => {
    const updatedColumns = table.columns.filter(col => col.id !== columnId);
    const updatedRows = table.rows.map(row => {
      const { [columnId]: deleted, ...rest } = row;
      return rest;
    });

    onUpdateTable({
      ...table,
      columns: updatedColumns,
      rows: updatedRows
    });
    toast.success('Column deleted successfully');
  };

  const addRow = () => {
    const newRow: Row = {
      id: Date.now().toString(),
      ...table.columns.reduce((acc, col) => {
        acc[col.id] = col.type === 'boolean' ? false : col.type === 'date' ? new Date().toISOString().split('T')[0] : '';
        return acc;
      }, {} as Record<string, any>)
    };

    onUpdateTable({
      ...table,
      rows: [...table.rows, newRow]
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

    let processedValue = editValue;
    if (column.type === 'number') {
      processedValue = parseFloat(editValue) || 0;
    } else if (column.type === 'boolean') {
      processedValue = editValue === 'true';
    }

    const updatedRows = table.rows.map(row =>
      row.id === editingCell.rowId
        ? { ...row, [editingCell.columnId]: processedValue }
        : row
    );

    onUpdateTable({ ...table, rows: updatedRows });
    setEditingCell(null);
    setEditValue('');
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

  const sortedRows = [...table.rows];
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
              {column.options.map(option => (
                <SelectItem key={option} value={option}>{option}</SelectItem>
              ))}
            </SelectContent>
          </Select>
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
            type={column.type === 'number' ? 'number' : column.type === 'date' ? 'date' : 'text'}
            autoFocus
          />
        );
      }
    }

    return (
      <div
        className="p-2 cursor-pointer hover:bg-muted/50 transition-colors min-h-[32px] flex items-center"
        onClick={() => startEdit(row.id, column.id, value)}
      >
        {column.type === 'boolean' ? (
          <Checkbox checked={Boolean(value)} readOnly />
        ) : (
          <span className="text-sm">{String(value || '')}</span>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button onClick={addRow} size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Add Row
          </Button>
          
          <Dialog open={isAddColumnOpen} onOpenChange={setIsAddColumnOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Add Column
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Column</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="column-name">Column Name</Label>
                  <Input
                    id="column-name"
                    value={newColumn.name}
                    onChange={(e) => setNewColumn({ ...newColumn, name: e.target.value })}
                    placeholder="Enter column name"
                  />
                </div>
                <div>
                  <Label htmlFor="column-type">Data Type</Label>
                  <Select value={newColumn.type} onValueChange={(value: Column['type']) => setNewColumn({ ...newColumn, type: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="text">Text</SelectItem>
                      <SelectItem value="number">Number</SelectItem>
                      <SelectItem value="date">Date</SelectItem>
                      <SelectItem value="boolean">Boolean</SelectItem>
                      <SelectItem value="select">Select</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {newColumn.type === 'select' && (
                  <div>
                    <Label>Options</Label>
                    {newColumn.options.map((option, index) => (
                      <div key={index} className="flex gap-2 mt-2">
                        <Input
                          value={option}
                          onChange={(e) => {
                            const newOptions = [...newColumn.options];
                            newOptions[index] = e.target.value;
                            setNewColumn({ ...newColumn, options: newOptions });
                          }}
                          placeholder={`Option ${index + 1}`}
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
                  Add Column
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        
        <span className="text-sm text-muted-foreground">
          {table.rows.length} row{table.rows.length !== 1 ? 's' : ''}
        </span>
      </div>

      <div className="border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                {table.columns.map((column) => (
                  <th key={column.id} className="text-left border-r border-border last:border-r-0">
                    <div className="flex items-center justify-between p-3 group">
                      <button
                        className="flex items-center gap-2 text-sm font-medium text-foreground hover:text-primary transition-colors"
                        onClick={() => handleSort(column.id)}
                      >
                        {column.name}
                        {sortConfig?.key === column.id && (
                          sortConfig.direction === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
                        )}
                      </button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 h-auto"
                        onClick={() => deleteColumn(column.id)}
                      >
                        <Trash className="w-3 h-3" />
                      </Button>
                    </div>
                  </th>
                ))}
                <th className="w-12 p-3"></th>
              </tr>
            </thead>
            <tbody>
              {sortedRows.map((row) => (
                <tr key={row.id} className="border-t border-border hover:bg-muted/25 transition-colors">
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
              {table.rows.length === 0 && (
                <tr>
                  <td colSpan={table.columns.length + 1} className="p-8 text-center text-muted-foreground">
                    No data yet. Click "Add Row" to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}