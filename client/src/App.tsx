import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Plus, HardHat } from 'lucide-react';
import { EntriesTable } from './components/EntriesTable';
import { AddEntryForm } from './components/AddEntryForm';
import { Button } from './components/ui/Button';

const queryClient = new QueryClient();

function Journal() {
  const [formOpen, setFormOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-amber-50/30 to-stone-100">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-gray-200 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-600 shadow-md shadow-amber-200">
              <HardHat size={18} className="text-white" />
            </div>
            <div>
              <h1 className="text-base font-semibold text-gray-900">Журнал работ</h1>
              <p className="text-xs text-gray-400">Строительный объект</p>
            </div>
          </div>
          <Button onClick={() => setFormOpen(true)} size="md">
            <Plus size={16} />
            Добавить запись
          </Button>
        </div>
      </header>

      {/* Main */}
      <main className="mx-auto max-w-6xl px-6 py-8">
        <EntriesTable />
      </main>

      <AddEntryForm open={formOpen} onClose={() => setFormOpen(false)} />
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Journal />
    </QueryClientProvider>
  );
}
