import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Pencil, Trash, File, Link, Envelope, Phone } from '@phosphor-icons/react';
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
      <div className="flex items-center justify-between">
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
        
        <span className="text-sm text-muted-foreground">
          {table.rows.length} 筆資料
        </span>
      </div>

      {table.rows.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">尚無資料。點擊「新增行」開始輸入資料。</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {table.rows.map((row) => (
            <Card key={row.id} className="relative group">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">
                    {String(row[table.columns[0]?.id] || '未命名')}
                  </CardTitle>
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