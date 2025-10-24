import { useState, useEffect, useRef, useCallback } from 'react';
import { Calendar, ChevronRight, Loader2 } from 'lucide-react';
import { DayColumn } from './components/DayColumn';
import { SlotModal } from './components/SlotModal';
import { DeleteModal } from './components/DeleteModal';
import { DaySlot } from './lib/supabase';
import { SchedulerService } from './services/schedulerService';

function App() {
  const [weeks, setWeeks] = useState<Date[]>([]);
  const [slotsMap, setSlotsMap] = useState<Map<string, Map<string, DaySlot[]>>>(new Map());
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedSlot, setSelectedSlot] = useState<DaySlot | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);

  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const getWeekStart = (date: Date): Date => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    const day = d.getDay();
    const diff = d.getDate() - day;
    return new Date(d.setDate(diff));
  };

  const getCurrentWeekStart = (): Date => {
    return getWeekStart(new Date());
  };

  const loadWeek = async (weekStart: Date) => {
    const weekKey = SchedulerService.formatDate(weekStart);

    if (slotsMap.has(weekKey)) {
      return;
    }

    setLoading(true);
    try {
      const weekSlots = await SchedulerService.getSlotsForWeek(weekStart);
      setSlotsMap(prev => {
        const newMap = new Map(prev);
        newMap.set(weekKey, weekSlots);
        return newMap;
      });
    } catch (error) {
      console.error('Error loading week:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadNextWeek = useCallback(() => {
    if (loading) return;

    const lastWeek = weeks[weeks.length - 1] || getCurrentWeekStart();
    const nextWeek = new Date(lastWeek);
    nextWeek.setDate(nextWeek.getDate() + 7);

    setWeeks(prev => [...prev, nextWeek]);
    loadWeek(nextWeek);
  }, [weeks, loading]);

  useEffect(() => {
    const currentWeek = getCurrentWeekStart();
    setWeeks([currentWeek]);
    loadWeek(currentWeek);
  }, []);

  useEffect(() => {
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading) {
          loadNextWeek();
        }
      },
      { threshold: 0.1 }
    );

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [loadNextWeek, loading]);

  const refreshWeek = async (weekStart: Date) => {
    const weekKey = SchedulerService.formatDate(weekStart);
    const weekSlots = await SchedulerService.getSlotsForWeek(weekStart);
    setSlotsMap(prev => {
      const newMap = new Map(prev);
      newMap.set(weekKey, weekSlots);
      return newMap;
    });
  };

  const handleCreateSlot = (date: string) => {
    setSelectedDate(date);
    setSelectedSlot(null);
    setIsEditMode(false);
    setIsModalOpen(true);
  };

  const handleEditSlot = (slot: DaySlot) => {
    setSelectedDate(slot.date);
    setSelectedSlot(slot);
    setIsEditMode(true);
    setIsModalOpen(true);
  };

  const handleDeleteSlot = (slot: DaySlot) => {
    setSelectedSlot(slot);
    setIsDeleteModalOpen(true);
  };

  const handleSaveSlot = async (startTime: string, endTime: string) => {
    try {
      const dateObj = new Date(selectedDate);
      const dayOfWeek = dateObj.getDay();

      if (isEditMode && selectedSlot) {
        await SchedulerService.updateSlotForDate(
          selectedSlot.recurring_slot_id,
          selectedDate,
          startTime,
          endTime
        );
      } else {
        const slotsForDate = Array.from(slotsMap.values())
          .flatMap(weekMap => Array.from(weekMap.values()))
          .flat()
          .filter(slot => slot.date === selectedDate);

        if (slotsForDate.length >= 2) {
          alert('Maximum 2 slots per day allowed');
          return;
        }

        await SchedulerService.createRecurringSlot(dayOfWeek, startTime, endTime);
      }

      weeks.forEach(week => refreshWeek(week));
    } catch (error) {
      console.error('Error saving slot:', error);
      alert('Failed to save slot');
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedSlot) return;

    try {
      await SchedulerService.deleteSlotForDate(
        selectedSlot.recurring_slot_id,
        selectedSlot.date
      );

      weeks.forEach(week => refreshWeek(week));
      setIsDeleteModalOpen(false);
      setSelectedSlot(null);
    } catch (error) {
      console.error('Error deleting slot:', error);
      alert('Failed to delete slot');
    }
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-emerald-50">
      <header className="bg-white shadow-sm border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl shadow-lg">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">Weekly Scheduler</h1>
              <p className="text-sm text-slate-500">Manage your recurring time slots</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="space-y-8">
          {weeks.map((weekStart, weekIndex) => {
            const weekKey = SchedulerService.formatDate(weekStart);
            const weekSlots = slotsMap.get(weekKey);

            return (
              <div key={weekKey} className="space-y-4">
                <div className="flex items-center gap-2">
                  <ChevronRight className="w-5 h-5 text-emerald-600" />
                  <h2 className="text-lg font-semibold text-slate-700">
                    Week of {weekStart.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                  </h2>
                </div>

                <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100">
                  {Array.from({ length: 7 }).map((_, dayIndex) => {
                    const currentDate = new Date(weekStart);
                    currentDate.setDate(currentDate.getDate() + dayIndex);
                    const dateStr = SchedulerService.formatDate(currentDate);
                    const daySlots = weekSlots?.get(dateStr) || [];
                    const isToday = currentDate.getTime() === today.getTime();

                    return (
                      <div key={dateStr} className="snap-start">
                        <DayColumn
                          date={currentDate}
                          dateStr={dateStr}
                          slots={daySlots}
                          isToday={isToday}
                          onEditSlot={handleEditSlot}
                          onDeleteSlot={handleDeleteSlot}
                          onCreateSlot={handleCreateSlot}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}

          <div ref={loadMoreRef} className="flex justify-center py-8">
            {loading && (
              <div className="flex items-center gap-2 text-slate-500">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Loading more weeks...</span>
              </div>
            )}
          </div>
        </div>
      </main>

      <SlotModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveSlot}
        initialStartTime={selectedSlot?.start_time || '09:00'}
        initialEndTime={selectedSlot?.end_time || '10:00'}
        date={selectedDate}
        isEdit={isEditMode}
      />

      <DeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        slot={selectedSlot}
      />
    </div>
  );
}

export default App;
