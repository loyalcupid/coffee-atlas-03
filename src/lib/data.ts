import { supabase } from './supabase';

export interface RecordSummary {
  id: string;
  name: string;
  location: string;
  rating: number;
  atmosphere_images?: string[];
  date: string;
  drink: string;
}

export async function fetchRecordsWithDetails(): Promise<RecordSummary[]> {
  const { data: recordsData, error } = await supabase.from('records').select('*').execute();
  if (error || !recordsData) return [];

  const results = await Promise.all(
    recordsData.map(async (record: any) => {
      const { data: visitData } = await supabase
        .from('visits')
        .select('*')
        .eq('record_id', record.id)
        .order('date', { ascending: false })
        .execute();

      const latestVisit = visitData?.[0];
      let latestDrink = '';

      if (latestVisit) {
        const { data: orderData } = await supabase
          .from('orders')
          .select('*')
          .eq('visit_id', latestVisit.id)
          .execute();
        latestDrink = orderData?.[0]?.drink_name || '';
      }

      return {
        ...record,
        date: latestVisit?.date || '',
        drink: latestDrink,
      } as RecordSummary;
    })
  );

  return results.sort((a, b) => {
    if (!a.date) return 1;
    if (!b.date) return -1;
    return b.date.localeCompare(a.date);
  });
}
