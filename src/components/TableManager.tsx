import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Table as TableIcon, Trash } from '@phosphor-icons/react';
import { Table } from '@/types';

interface TableManagerProps {
  tables: Table[];
  activeTableId: string | null;
  onSelectTable: (tableId: string) => void;
  onDeleteTable: (tableId: string) => void;
}

export function TableManager({ tables, activeTableId, onSelectTable, onDeleteTable }: TableManagerProps) {
  if (tables.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-8">
        <TableIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">尚無資料表</p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {tables.map((table) => (
        <div
          key={table.id}
          className={`group flex items-center justify-between p-2 rounded-md cursor-pointer transition-colors ${
            activeTableId === table.id
              ? 'bg-primary text-primary-foreground'
              : 'hover:bg-muted'
          }`}
          onClick={() => onSelectTable(table.id)}
        >
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <TableIcon className="w-4 h-4 flex-shrink-0" />
            <span className="text-sm font-medium truncate">{table.name}</span>
          </div>
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className={`opacity-0 group-hover:opacity-100 transition-opacity p-1 h-auto ${
                  activeTableId === table.id ? 'hover:bg-primary-foreground/20' : ''
                }`}
                onClick={(e) => e.stopPropagation()}
              >
                <Trash className="w-3 h-3" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>刪除資料表</AlertDialogTitle>
                <AlertDialogDescription>
                  您確定要刪除「{table.name}」嗎？此操作無法復原，將永久刪除此資料表中的所有資料。
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>取消</AlertDialogCancel>
                <AlertDialogAction onClick={() => onDeleteTable(table.id)}>
                  刪除
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      ))}
    </div>
  );
}