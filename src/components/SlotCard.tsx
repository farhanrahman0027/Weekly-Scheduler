import { Pencil, Trash2, Plus } from 'lucide-react';
import { DaySlot } from '../lib/supabase';
import { SchedulerService } from '../services/schedulerService';

interface SlotCardProps {
  slot?: DaySlot;
  date: string;
  onEdit: (slot: DaySlot) => void;
  onDelete: (slot: DaySlot) => void;
  onCreate: (date: string) => void;
  isEmpty?: boolean;
}

export function SlotCard({ slot, date, onEdit, onDelete, onCreate, isEmpty }: SlotCardProps) {
  if (isEmpty || !slot) {
    return (
      <button
        onClick={() => onCreate(date)}
        className="w-full bg-white border-2 border-dashed border-slate-300 rounded-lg p-3 text-slate-400 hover:border-emerald-400 hover:text-emerald-600 transition-all duration-200 flex items-center justify-center gap-2 group"
      >
        <Plus className="w-4 h-4 group-hover:scale-110 transition-transform" />
        <span className="text-sm font-medium">Add Slot</span>
      </button>
    );
  }

  return (
    <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 rounded-lg p-3 shadow-sm hover:shadow-md transition-all duration-200 group">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="text-slate-800 font-semibold text-sm">
            {SchedulerService.formatTime(slot.start_time)} - {SchedulerService.formatTime(slot.end_time)}
          </div>
          {slot.is_exception && (
            <div className="text-xs text-amber-600 font-medium mt-1">Modified</div>
          )}
        </div>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onEdit(slot)}
            className="p-1.5 bg-white rounded-md hover:bg-blue-50 hover:text-blue-600 text-slate-600 transition-colors"
            title="Edit slot"
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(slot)}
            className="p-1.5 bg-white rounded-md hover:bg-red-50 hover:text-red-600 text-slate-600 transition-colors"
            title="Delete slot"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
