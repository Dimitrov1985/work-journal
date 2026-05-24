export interface WorkType {
  id: number;
  name: string;
}

export interface WorkEntry {
  id: number;
  date: string;
  workTypeId: number;
  workType: WorkType;
  volume: number;
  unit: string;
  executorName: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateEntryDto {
  date: string;
  workTypeId: number;
  volume: number;
  unit: string;
  executorName: string;
}
