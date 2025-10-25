import { supabase, RecurringSlot, SlotException, DaySlot } from '../lib/supabase';

export class SchedulerService {
  static async getRecurringSlots(): Promise<RecurringSlot[]> {
    const { data, error } = await supabase
      .from('recurring_slots')
      .select('*')
      .order('day_of_week', { ascending: true })
      .order('start_time', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  static async getSlotExceptions(startDate: string, endDate: string): Promise<SlotException[]> {
    const { data, error } = await supabase
      .from('slot_exceptions')
      .select('*')
      .gte('exception_date', startDate)
      .lte('exception_date', endDate);

    if (error) throw error;
    return data || [];
  }

  static async getSlotsForWeek(weekStart: Date): Promise<Map<string, DaySlot[]>> {
    const recurringSlots = await this.getRecurringSlots();

    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);

    const exceptions = await this.getSlotExceptions(
      this.formatDate(weekStart),
      this.formatDate(weekEnd)
    );

    const exceptionMap = new Map<string, SlotException[]>();
    exceptions.forEach(exc => {
      const key = `${exc.recurring_slot_id}-${exc.exception_date}`;
      if (!exceptionMap.has(key)) {
        exceptionMap.set(key, []);
      }
      exceptionMap.get(key)!.push(exc);
    });

    const slotsMap = new Map<string, DaySlot[]>();

    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(weekStart);
      currentDate.setDate(currentDate.getDate() + i);
      const dateStr = this.formatDate(currentDate);
      const dayOfWeek = currentDate.getDay();

      const daySlots: DaySlot[] = [];

      recurringSlots
        .filter(slot => slot.day_of_week === dayOfWeek)
        .forEach(slot => {
          const exceptionKey = `${slot.id}-${dateStr}`;
          const dateExceptions = exceptionMap.get(exceptionKey) || [];

          const deletedException = dateExceptions.find(e => e.exception_type === 'deleted');
          if (deletedException) {
            return;
          }

          const modifiedException = dateExceptions.find(e => e.exception_type === 'modified');
          if (modifiedException) {
            daySlots.push({
              id: modifiedException.id,
              date: dateStr,
              start_time: modifiedException.start_time!,
              end_time: modifiedException.end_time!,
              is_exception: true,
              recurring_slot_id: slot.id,
            });
          } else {
            daySlots.push({
              id: slot.id,
              date: dateStr,
              start_time: slot.start_time,
              end_time: slot.end_time,
              is_exception: false,
              recurring_slot_id: slot.id,
            });
          }
        });

      slotsMap.set(dateStr, daySlots);
    }

    return slotsMap;
  }

  static async createRecurringSlot(
    dayOfWeek: number,
    startTime: string,
    endTime: string
  ): Promise<RecurringSlot> {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      throw new Error('User must be authenticated to create slots');
    }

    const { data, error } = await supabase
      .from('recurring_slots')
      .insert({
        user_id: user.id,
        day_of_week: dayOfWeek,
        start_time: startTime,
        end_time: endTime,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async updateSlotForDate(
    recurringSlotId: string,
    date: string,
    startTime: string,
    endTime: string
  ): Promise<SlotException> {
    const { data: existing } = await supabase
      .from('slot_exceptions')
      .select('*')
      .eq('recurring_slot_id', recurringSlotId)
      .eq('exception_date', date)
      .maybeSingle();

    if (existing) {
      const { data, error } = await supabase
        .from('slot_exceptions')
        .update({
          exception_type: 'modified',
          start_time: startTime,
          end_time: endTime,
        })
        .eq('id', existing.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    }

    const { data, error } = await supabase
      .from('slot_exceptions')
      .insert({
        recurring_slot_id: recurringSlotId,
        exception_date: date,
        exception_type: 'modified',
        start_time: startTime,
        end_time: endTime,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async deleteSlotForDate(
    recurringSlotId: string,
    date: string
  ): Promise<SlotException> {
    const { data: existing } = await supabase
      .from('slot_exceptions')
      .select('*')
      .eq('recurring_slot_id', recurringSlotId)
      .eq('exception_date', date)
      .maybeSingle();

    if (existing) {
      const { data, error } = await supabase
        .from('slot_exceptions')
        .update({
          exception_type: 'deleted',
          start_time: null,
          end_time: null,
        })
        .eq('id', existing.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    }

    const { data, error } = await supabase
      .from('slot_exceptions')
      .insert({
        recurring_slot_id: recurringSlotId,
        exception_date: date,
        exception_type: 'deleted',
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async deleteRecurringSlot(recurringSlotId: string): Promise<void> {
    const { error } = await supabase
      .from('recurring_slots')
      .delete()
      .eq('id', recurringSlotId);

    if (error) throw error;
  }

  static formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  static formatTime(time: string): string {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}:${minutes} ${ampm}`;
  }
}
