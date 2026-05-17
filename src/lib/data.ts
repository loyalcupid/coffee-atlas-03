import { db, snapToArray } from './firebase';
import { ref, get } from 'firebase/database';

export interface RecordSummary {
  id: string;
  name: string;
  location: string;
  region?: string;
  rating: number;
  atmosphere_images?: string[];
  date: string;
  drink: string;
}

export async function fetchRecordsWithDetails(uid: string): Promise<RecordSummary[]> {
  const [recSnap, visSnap, ordSnap] = await Promise.all([
    get(ref(db, 'records')),
    get(ref(db, 'visits')),
    get(ref(db, 'orders')),
  ]);

  const records = snapToArray<any>(recSnap).filter(r => r.uid === uid);
  const allVisits = snapToArray<any>(visSnap);
  const allOrders = snapToArray<any>(ordSnap);

  return records.map(record => {
    const visits = allVisits
      .filter(v => v.record_id === record.id)
      .sort((a, b) => b.date.localeCompare(a.date));

    const latestVisit = visits[0];
    const latestOrder = latestVisit
      ? allOrders.find(o => o.visit_id === latestVisit.id)
      : null;

    return {
      ...record,
      date: latestVisit?.date || '',
      drink: latestOrder?.drink_name || '',
    } as RecordSummary;
  }).sort((a, b) => {
    if (!a.date) return 1;
    if (!b.date) return -1;
    return b.date.localeCompare(a.date);
  });
}
