import { DaySlot } from '../lib/supabase';
import { SlotCard } from './SlotCard';

interface DayColumnProps {
  date: Date;
  dateStr: string;
  slots: DaySlot[];
  isToday: boolean;
  onEditSlot: (slot: DaySlot) => void;
  onDeleteSlot: (slot: DaySlot) => void;
  onCreateSlot: (date: string) => void;
}

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function DayColumn({
  date,
  dateStr,
  slots,
  isToday,
  onEditSlot,
  onDeleteSlot,
  onCreateSlot,
}: DayColumnProps) {
  const dayName = DAY_NAMES[date.getDay()];
  const dayNumber = date.getDate();
  const monthName = MONTH_NAMES[date.getMonth()];

  return (
    <div className="flex-shrink-0 w-full md:w-80 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className={`p-4 ${isToday ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white' : 'bg-slate-50'}`}>
        <div className="text-center">
          <div className={`text-sm font-medium ${isToday ? 'text-emerald-100' : 'text-slate-500'}`}>
            {dayName}
          </div>
          <div className={`text-2xl font-bold ${isToday ? 'text-white' : 'text-slate-800'}`}>
            {dayNumber}
          </div>
          <div className={`text-xs ${isToday ? 'text-emerald-100' : 'text-slate-500'}`}>
            {monthName} {date.getFullYear()}
          </div>
          {isToday && (
            <div className="text-xs font-semibold mt-1 bg-white/20 rounded-full px-2 py-0.5 inline-block">
              Today
            </div>
          )}
        </div>
      </div>

      <div className="p-4 space-y-3">
        {slots.length === 0 && (
          <>
            <SlotCard isEmpty date={dateStr} onEdit={onEditSlot} onDelete={onDeleteSlot} onCreate={onCreateSlot} />
            <SlotCard isEmpty date={dateStr} onEdit={onEditSlot} onDelete={onDeleteSlot} onCreate={onCreateSlot} />
          </>
        )}

        {slots.length === 1 && (
          <>
            <SlotCard slot={slots[0]} date={dateStr} onEdit={onEditSlot} onDelete={onDeleteSlot} onCreate={onCreateSlot} />
            <SlotCard isEmpty date={dateStr} onEdit={onEditSlot} onDelete={onDeleteSlot} onCreate={onCreateSlot} />
          </>
        )}

        {slots.length === 2 && (
          <>
            <SlotCard slot={slots[0]} date={dateStr} onEdit={onEditSlot} onDelete={onDeleteSlot} onCreate={onCreateSlot} />
            <SlotCard slot={slots[1]} date={dateStr} onEdit={onEditSlot} onDelete={onDeleteSlot} onCreate={onCreateSlot} />
          </>
        )}
      </div>
    </div>
  );
}
