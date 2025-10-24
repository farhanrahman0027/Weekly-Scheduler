import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface SlotModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (startTime: string, endTime: string) => void;
  initialStartTime?: string;
  initialEndTime?: string;
  date: string;
  isEdit: boolean;
}

export function SlotModal({
  isOpen,
  onClose,
  onSave,
  initialStartTime = '09:00',
  initialEndTime = '10:00',
  date,
  isEdit,
}: SlotModalProps) {
  const [startTime, setStartTime] = useState(initialStartTime);
  const [endTime, setEndTime] = useState(initialEndTime);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setStartTime(initialStartTime);
      setEndTime(initialEndTime);
      setError('');
    }
  }, [isOpen, initialStartTime, initialEndTime]);

  const handleSave = () => {
    if (!startTime || !endTime) {
      setError('Please select both start and end times');
      return;
    }

    const start = new Date(`2000-01-01T${startTime}`);
    const end = new Date(`2000-01-01T${endTime}`);

    if (end <= start) {
      setError('End time must be after start time');
      return;
    }

    onSave(startTime, endTime);
    onClose();
  };

  if (!isOpen) return null;

  const dateObj = new Date(date);
  const formattedDate = dateObj.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="bg-gradient-to-r from-emerald-500 to-teal-500 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">
            {isEdit ? 'Edit Slot' : 'Create New Slot'}
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              Date
            </label>
            <div className="text-slate-600 bg-slate-50 rounded-lg px-4 py-2.5 border border-slate-200">
              {formattedDate}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="start-time" className="block text-sm font-semibold text-slate-700 mb-1">
                Start Time
              </label>
              <input
                id="start-time"
                type="time"
                value={startTime}
                onChange={(e) => {
                  setStartTime(e.target.value);
                  setError('');
                }}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
              />
            </div>

            <div>
              <label htmlFor="end-time" className="block text-sm font-semibold text-slate-700 mb-1">
                End Time
              </label>
              <input
                id="end-time"
                type="time"
                value={endTime}
                onChange={(e) => {
                  setEndTime(e.target.value);
                  setError('');
                }}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2.5 rounded-lg text-sm">
              {error}
            </div>
          )}

          {isEdit && (
            <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-2.5 rounded-lg text-sm">
              This will only modify this specific date. Other occurrences remain unchanged.
            </div>
          )}

          {!isEdit && (
            <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-2.5 rounded-lg text-sm">
              This slot will repeat every week on the same day.
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex-1 px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-lg font-medium hover:from-emerald-600 hover:to-teal-600 transition-all shadow-lg shadow-emerald-500/30"
            >
              {isEdit ? 'Save Changes' : 'Create Slot'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
