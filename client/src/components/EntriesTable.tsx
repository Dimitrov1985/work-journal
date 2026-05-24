import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { Trash2, ArrowDown, ArrowUp, CalendarDays, Search, Pencil } from 'lucide-react';
import { entriesApi } from '@/api/entries';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { AddEntryForm } from './AddEntryForm';
import type { WorkEntry } from '@/types';

type SortDir = 'asc' | 'desc';

export function EntriesTable() {
  const qc = useQueryClient();
  const [sort, setSort] = useState<SortDir>('desc');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [editEntry, setEditEntry] = useState<WorkEntry | null>(null);

  const { data: entries = [], isLoading } = useQuery({
    queryKey: ['entries', sort, startDate, endDate],
    queryFn: () => entriesApi.getAll({
      sort,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
    }),
  });

  const deleteMutation = useMutation({
    mutationFn: entriesApi.delete,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['entries'] });
      setDeleteId(null);
    },
  });

  const toggleSort = () => setSort((s) => (s === 'desc' ? 'asc' : 'desc'));
  const SortIcon = sort === 'desc' ? ArrowDown : ArrowUp;

  return (
    <>
      <div className="flex flex-col gap-4">
        {/* Filters */}
        <div className="flex flex-wrap items-end gap-3 rounded-xl bg-white border border-gray-200 p-4 shadow-sm">
          <div className="flex items-center gap-2 text-gray-500">
            <Search size={16} />
            <span className="text-sm font-medium text-gray-600">Фильтр по дате:</span>
          </div>
          <Input
            type="date"
            label="С"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-40"
          />
          <Input
            type="date"
            label="По"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-40"
          />
          {(startDate || endDate) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => { setStartDate(''); setEndDate(''); }}
              className="mt-5"
            >
              Сбросить
            </Button>
          )}
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/80">
                <th className="px-4 py-3 text-left">
                  <button
                    onClick={toggleSort}
                    className="flex items-center gap-1.5 font-medium text-gray-600 hover:text-gray-900 transition-colors cursor-pointer"
                  >
                    <CalendarDays size={14} />
                    Дата
                    <SortIcon size={13} className="text-blue-500" />
                  </button>
                </th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Вид работ</th>
                <th className="px-4 py-3 text-right font-medium text-gray-600">Объём</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Исполнитель</th>
                <th className="px-4 py-3 text-center font-medium text-gray-600 w-24"></th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-gray-400">
                    <div className="flex flex-col items-center gap-2">
                      <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
                      <span>Загрузка...</span>
                    </div>
                  </td>
                </tr>
              )}
              {!isLoading && entries.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-16 text-center">
                    <div className="flex flex-col items-center gap-2 text-gray-400">
                      <CalendarDays size={32} className="opacity-40" />
                      <p className="font-medium">Записей пока нет</p>
                      <p className="text-xs">Нажмите «Добавить запись», чтобы начать</p>
                    </div>
                  </td>
                </tr>
              )}
              {entries.map((entry, idx) => (
                <tr
                  key={entry.id}
                  className={`border-b border-gray-50 transition-colors hover:bg-blue-50/40 ${
                    idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'
                  }`}
                >
                  <td className="px-4 py-3.5">
                    <span className="font-medium text-gray-900">
                      {format(new Date(entry.date.slice(0, 10) + 'T12:00:00'), 'd MMM yyyy', { locale: ru })}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="inline-flex items-center rounded-md bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700 ring-1 ring-blue-700/10">
                      {entry.workType.name}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-right font-medium text-gray-900">
                    {entry.volume} <span className="text-gray-400 font-normal">{entry.unit}</span>
                  </td>
                  <td className="px-4 py-3.5 text-gray-700">{entry.executorName}</td>
                  <td className="px-4 py-3.5">
                    {deleteId === entry.id ? (
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => deleteMutation.mutate(entry.id)}
                          className="rounded px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50 cursor-pointer transition-colors"
                          disabled={deleteMutation.isPending}
                        >
                          Да
                        </button>
                        <button
                          onClick={() => setDeleteId(null)}
                          className="rounded px-2 py-1 text-xs text-gray-500 hover:bg-gray-100 cursor-pointer transition-colors"
                        >
                          Нет
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => setEditEntry(entry)}
                          className="rounded-lg p-1.5 text-gray-300 hover:bg-blue-50 hover:text-blue-500 transition-colors cursor-pointer"
                          title="Редактировать"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          onClick={() => setDeleteId(entry.id)}
                          className="rounded-lg p-1.5 text-gray-300 hover:bg-red-50 hover:text-red-500 transition-colors cursor-pointer"
                          title="Удалить"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {entries.length > 0 && (
            <div className="border-t border-gray-100 bg-gray-50/50 px-4 py-2.5 text-xs text-gray-400">
              Записей: {entries.length}
            </div>
          )}
        </div>
      </div>

      <AddEntryForm
        open={!!editEntry}
        onClose={() => setEditEntry(null)}
        entry={editEntry ?? undefined}
      />
    </>
  );
}
