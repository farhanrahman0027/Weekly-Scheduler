import { X, AlertTriangle } from 'lucide-react';
import { DaySlot } from '../lib/supabase';
import { SchedulerService } from '../services/schedulerService';

interface DeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  slot: DaySlot | null;
}

export function DeleteModal({ isOpen, onClose, onConfirm, slot }: DeleteModalProps) {
  if (!isOpen || !slot) return null;

  const dateObj = new Date(slot.date);
  const formattedDate = dateObj.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="bg-gradient-to-r from-red-500 to-rose-500 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-white" />
            <h2 className="text-xl font-bold text-white">Delete Slot</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <p className="text-slate-600">
            Are you sure you want to delete this slot?
          </p>

          <div className="bg-slate-50 rounded-lg p-4 space-y-2 border border-slate-200">
            <div className="text-sm text-slate-500">Date</div>
            <div className="font-semibold text-slate-800">{formattedDate}</div>

            <div className="text-sm text-slate-500 mt-3">Time</div>
            <div className="font-semibold text-slate-800">
              {SchedulerService.formatTime(slot.start_time)} - {SchedulerService.formatTime(slot.end_time)}
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-2.5 rounded-lg text-sm">
            This will only delete this specific occurrence. Other occurrences remain unchanged.
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 px-4 py-2.5 bg-gradient-to-r from-red-500 to-rose-500 text-white rounded-lg font-medium hover:from-red-600 hover:to-rose-600 transition-all shadow-lg shadow-red-500/30"
            >
              Delete Slot
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
