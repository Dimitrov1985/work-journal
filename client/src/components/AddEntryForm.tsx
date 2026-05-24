import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { entriesApi } from '@/api/entries';
import { workTypesApi } from '@/api/workTypes';
import { Modal } from './ui/Modal';
import { Input } from './ui/Input';
import { Select } from './ui/Select';
import { Button } from './ui/Button';
import type { WorkEntry } from '@/types';

const UNITS = [
  { value: 'м²', label: 'м² (кв. метр)' },
  { value: 'м³', label: 'м³ (куб. метр)' },
  { value: 'м.п.', label: 'м.п. (пог. метр)' },
  { value: 'шт.', label: 'шт. (штук)' },
  { value: 'т', label: 'т (тонн)' },
  { value: 'кг', label: 'кг (килограмм)' },
];

const schema = z.object({
  date: z.string().min(1, 'Укажите дату'),
  workTypeId: z.coerce.number().min(1, 'Выберите вид работ'),
  volume: z.coerce.number().positive('Объём должен быть больше 0'),
  unit: z.string().min(1, 'Выберите единицу измерения'),
  executorName: z.string().min(2, 'Введите ФИО исполнителя'),
});

type FormData = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onClose: () => void;
  entry?: WorkEntry;
}

export function AddEntryForm({ open, onClose, entry }: Props) {
  const isEdit = !!entry;
  const qc = useQueryClient();

  const { data: workTypes = [] } = useQuery({
    queryKey: ['work-types'],
    queryFn: workTypesApi.getAll,
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { date: new Date().toISOString().split('T')[0] },
  });

  useEffect(() => {
    if (entry) {
      reset({
        date: entry.date.split('T')[0],
        workTypeId: entry.workTypeId,
        volume: entry.volume,
        unit: entry.unit,
        executorName: entry.executorName,
      });
    } else {
      reset({ date: new Date().toISOString().split('T')[0] });
    }
  }, [entry, reset]);

  const createMutation = useMutation({
    mutationFn: entriesApi.create,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['entries'] }); reset(); onClose(); },
  });

  const updateMutation = useMutation({
    mutationFn: entriesApi.update,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['entries'] }); onClose(); },
  });

  const isPending = createMutation.isPending || updateMutation.isPending;
  const isError = createMutation.isError || updateMutation.isError;

  const onSubmit = (data: FormData) => {
    if (isEdit) {
      updateMutation.mutate({ id: entry.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? 'Редактировать запись' : 'Новая запись журнала'}>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <Input
          id="date"
          type="date"
          label="Дата выполнения"
          error={errors.date?.message}
          {...register('date')}
        />

        <Select
          id="workTypeId"
          label="Вид работ"
          placeholder="— Выберите вид работ —"
          options={workTypes.map((t) => ({ value: t.id, label: t.name }))}
          error={errors.workTypeId?.message}
          {...register('workTypeId')}
        />

        <div className="grid grid-cols-2 gap-3">
          <Input
            id="volume"
            type="number"
            step="0.01"
            label="Объём"
            placeholder="24"
            error={errors.volume?.message}
            {...register('volume')}
          />
          <Select
            id="unit"
            label="Единица измерения"
            placeholder="— Ед. —"
            options={UNITS}
            error={errors.unit?.message}
            {...register('unit')}
          />
        </div>

        <Input
          id="executorName"
          label="ФИО исполнителя"
          placeholder="Иванов Иван Иванович"
          error={errors.executorName?.message}
          {...register('executorName')}
        />

        {isError && (
          <p className="text-sm text-red-500">Ошибка при сохранении. Попробуйте снова.</p>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Отмена
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending ? 'Сохранение...' : isEdit ? 'Сохранить изменения' : 'Сохранить'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
