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

const BADGE_COLORS: Record<string, string> = {
  'Бетонирование':              'bg-orange-50 text-orange-700 ring-orange-700/10',
  'Армирование':                'bg-yellow-50 text-yellow-700 ring-yellow-700/10',
  'Кладка перегородок':         'bg-purple-50 text-purple-700 ring-purple-700/10',
  'Монтаж кровли':              'bg-blue-50   text-blue-700   ring-blue-700/10',
  'Монтаж опалубки':            'bg-green-50  text-green-700  ring-green-700/10',
  'Штукатурные работы':         'bg-pink-50   text-pink-700   ring-pink-700/10',
  'Укладка плитки':             'bg-cyan-50   text-cyan-700   ring-cyan-700/10',
  'Электромонтажные работы':    'bg-indigo-50 text-indigo-700 ring-indigo-700/10',
};

const DEFAULT_BADGE = 'bg-amber-50 text-amber-700 ring-amber-700/10';

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
        <div className="flex flex-wrap items-end gap-3 rounded-xl bg-white border border-stone-200 p-4 shadow-sm">
          <div className="flex items-center gap-2 text-stone-500">
            <Search size={16} />
            <span className="text-sm font-medium text-stone-600">Фильтр по дате:</span>
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
        <div className="overflow-hidden rounded-xl border border-stone-200 bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stone-100 bg-stone-50">
                <th className="px-4 py-3 text-left">
                  <button
                    onClick={toggleSort}
                    className="flex items-center gap-1.5 font-medium text-stone-600 hover:text-stone-900 transition-colors cursor-pointer"
                  >
                    <CalendarDays size={14} />
                    Дата
                    <SortIcon size={13} className="text-amber-500" />
                  </button>
                </th>
                <th className="px-4 py-3 text-left font-medium text-stone-600">Вид работ</th>
                <th className="px-4 py-3 text-right font-medium text-stone-600">Объём</th>
                <th className="px-4 py-3 text-left font-medium text-stone-600">Исполнитель</th>
                <th className="px-4 py-3 text-center font-medium text-stone-600 w-24"></th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-stone-400">
                    <div className="flex flex-col items-center gap-2">
                      <div className="h-6 w-6 animate-spin rounded-full border-2 border-amber-500 border-t-transparent" />
                      <span>Загрузка...</span>
                    </div>
                  </td>
                </tr>
              )}
              {!isLoading && entries.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-16 text-center">
                    <div className="flex flex-col items-center gap-2 text-stone-400">
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
                  className={`border-b border-stone-50 transition-colors hover:bg-amber-50/40 ${
                    idx % 2 === 0 ? 'bg-white' : 'bg-stone-50/40'
                  }`}
                >
                  <td className="px-4 py-3.5">
                    <span className="font-medium text-stone-900">
                      {format(new Date(entry.date.slice(0, 10) + 'T12:00:00'), 'd MMM yyyy', { locale: ru })}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={`inline-flex items-center rounded-md px-2.5 py-1 text-xs font-medium ring-1 ${BADGE_COLORS[entry.workType.name] ?? DEFAULT_BADGE}`}>
                      {entry.workType.name}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-right font-medium text-stone-900">
                    {entry.volume} <span className="text-stone-400 font-normal">{entry.unit}</span>
                  </td>
                  <td className="px-4 py-3.5 text-stone-700">{entry.executorName}</td>
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
                          className="rounded px-2 py-1 text-xs text-stone-500 hover:bg-stone-100 cursor-pointer transition-colors"
                        >
                          Нет
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => setEditEntry(entry)}
                          className="rounded-lg p-1.5 text-stone-300 hover:bg-amber-50 hover:text-amber-500 transition-colors cursor-pointer"
                          title="Редактировать"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          onClick={() => setDeleteId(entry.id)}
                          className="rounded-lg p-1.5 text-stone-300 hover:bg-red-50 hover:text-red-500 transition-colors cursor-pointer"
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
            <div className="border-t border-stone-100 bg-stone-50/60 px-4 py-2.5 text-xs text-stone-400">
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
