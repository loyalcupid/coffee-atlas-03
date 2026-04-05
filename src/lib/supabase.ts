import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

const isMock = !supabaseUrl || supabaseUrl === 'your_supabase_url_here'

export const supabase = isMock ? {
    from: (table: string) => {
        const getStoredData = (): any[] => {
            if (typeof window === 'undefined') return [];

            const initialData: Record<string, any[]> = {
                records: [
                    { id: "rec-001", name: "카페 어니언", location: "성수", rating: 5 },
                    { id: "rec-002", name: "프릳츠 커피", location: "마포", rating: 4 },
                    { id: "rec-003", name: "테라로사", location: "강릉", rating: 4 },
                    { id: "rec-004", name: "제이엠커피", location: "부산 기장군 대변3길 8", rating: 3 }
                ],
                visits: [
                    { id: "vis-001", record_id: "rec-001", date: "2026-02-22" },
                    { id: "vis-002", record_id: "rec-002", date: "2026-02-20" },
                    { id: "vis-003", record_id: "rec-003", date: "2026-02-15" },
                    { id: "vis-004", record_id: "rec-004", date: "2026-03-01" },
                ],
                orders: [
                    { id: "ord-001", visit_id: "vis-001", drink_name: "아이스 아메리카노", rating: 5, acidity: 3, body: 3, sweetness: 3, memo: "성수동의 힙한 분위기와 맛있는 커피" },
                    { id: "ord-002", visit_id: "vis-002", drink_name: "플랫 화이트", rating: 4, acidity: 3, body: 4, sweetness: 3, memo: "레트로한 감성과 훌륭한 블렌딩" },
                    { id: "ord-003", visit_id: "vis-003", drink_name: "핸드 드립", rating: 4, acidity: 4, body: 3, sweetness: 2, memo: "강릉 바다와 함께 즐기는 스페셜티 커피" },
                    { id: "ord-004", visit_id: "vis-004", drink_name: "아리차", rating: 3, acidity: 4, body: 2, sweetness: 3, memo: "약간의 산미, 약간의 가향, 플로럴 향" }
                ]
            };

            const stored = localStorage.getItem(table);
            let data: any[] = JSON.parse(stored || '[]');

            if (table === 'records') {
                const storedVisits: any[] = JSON.parse(localStorage.getItem('visits') || '[]');
                const storedOrders: any[] = JSON.parse(localStorage.getItem('orders') || '[]');
                let changed = false;

                // Seed missing initial cafes
                const existingNames = new Set(data.map((r: any) => r.name));
                initialData.records.forEach(seed => {
                    if (!existingNames.has(seed.name)) {
                        data.push(seed);
                        changed = true;
                        const seedVisits = initialData.visits.filter(v => v.record_id === seed.id);
                        seedVisits.forEach(v => {
                            if (!storedVisits.some((sv: any) => sv.id === v.id)) {
                                storedVisits.push(v);
                                initialData.orders
                                    .filter(o => o.visit_id === v.id)
                                    .forEach(o => {
                                        if (!storedOrders.some((so: any) => so.id === o.id)) {
                                            storedOrders.push(o);
                                        }
                                    });
                            }
                        });
                    }
                });

                // Migrate old flat-format records (date/drink on record itself)
                const migratedVisits = [...storedVisits];
                const migratedOrders = [...storedOrders];
                data = data.map((record: any) => {
                    if ((record.date || record.drink) && !migratedVisits.some(v => v.record_id === record.id)) {
                        const visitId = `mig-vis-${Math.random().toString(36).substr(2, 5)}`;
                        const orderId = `mig-ord-${Math.random().toString(36).substr(2, 5)}`;
                        migratedVisits.push({ id: visitId, record_id: record.id, date: record.date || new Date().toISOString().split('T')[0] });
                        migratedOrders.push({ id: orderId, visit_id: visitId, drink_name: record.drink || "이름 없는 커피", rating: record.rating || 3, acidity: record.acidity || 3, body: record.body || 3, sweetness: record.sweetness || 3, memo: record.memo || "" });
                        const { date: _d, drink: _dr, memo: _m, acidity: _a, body: _b, sweetness: _s, ...cleanRecord } = record;
                        changed = true;
                        return cleanRecord;
                    }
                    return record;
                });

                if (changed) {
                    localStorage.setItem('records', JSON.stringify(data));
                    localStorage.setItem('visits', JSON.stringify(migratedVisits));
                    localStorage.setItem('orders', JSON.stringify(migratedOrders));
                }
            } else if (data.length === 0 && initialData[table]?.length > 0) {
                data = initialData[table];
                localStorage.setItem(table, JSON.stringify(data));
            }

            return data;
        };

        return {
            insert: (dataToInsert: any[]) => {
                const executeInsert = async () => {
                    if (typeof window === 'undefined') return { data: null, error: null };
                    const existing = getStoredData();
                    const newData = dataToInsert.map(item => ({
                        ...item,
                        id: item.id || Math.random().toString(36).substr(2, 9)
                    }));
                    localStorage.setItem(table, JSON.stringify([...newData, ...existing]));
                    return { data: newData, error: null };
                };
                return {
                    select: () => ({ execute: executeInsert }),
                    execute: executeInsert,
                    then: (resolve: any, reject: any) => executeInsert().then(resolve).catch(reject)
                };
            },

            select: (_query: string = '*') => {
                const chain = {
                    eq: (field: string, value: any) => {
                        const filtered = () => getStoredData().filter((i: any) => i[field] === value);
                        const subChain = {
                            single: async () => {
                                if (typeof window === 'undefined') return { data: null, error: null };
                                const item = filtered()[0];
                                return { data: item ?? null, error: item ? null : { message: 'Not found' } };
                            },
                            execute: async () => {
                                if (typeof window === 'undefined') return { data: [], error: null };
                                return { data: filtered(), error: null };
                            },
                            order: (orderField: string, { ascending }: { ascending: boolean }) => ({
                                execute: async () => {
                                    if (typeof window === 'undefined') return { data: [], error: null };
                                    const sorted = [...filtered()].sort((a: any, b: any) => {
                                        if (!a[orderField]) return 1;
                                        if (!b[orderField]) return -1;
                                        return ascending
                                            ? a[orderField] > b[orderField] ? 1 : -1
                                            : a[orderField] < b[orderField] ? 1 : -1;
                                    });
                                    return { data: sorted, error: null };
                                }
                            }),
                            then: (resolve: any, reject: any) =>
                                (async () => ({ data: filtered(), error: null }))().then(resolve).catch(reject)
                        };
                        return subChain;
                    },
                    order: (field: string, { ascending }: { ascending: boolean }) => ({
                        execute: async () => {
                            if (typeof window === 'undefined') return { data: [], error: null };
                            const sorted = [...getStoredData()].sort((a: any, b: any) => {
                                if (!a[field]) return 1;
                                if (!b[field]) return -1;
                                return ascending ? (a[field] > b[field] ? 1 : -1) : (a[field] < b[field] ? 1 : -1);
                            });
                            return { data: sorted, error: null };
                        }
                    }),
                    execute: async () => {
                        if (typeof window === 'undefined') return { data: [], error: null };
                        return { data: getStoredData(), error: null };
                    }
                };
                return chain;
            },

            update: (updateData: any) => ({
                eq: (field: string, value: any) => {
                    const executeUpdate = async () => {
                        if (typeof window === 'undefined') return { error: null };
                        const data = getStoredData().map((item: any) =>
                            item[field] === value ? { ...item, ...updateData } : item
                        );
                        localStorage.setItem(table, JSON.stringify(data));
                        return { error: null };
                    };
                    return {
                        execute: executeUpdate,
                        then: (resolve: any, reject: any) => executeUpdate().then(resolve).catch(reject)
                    };
                }
            }),

            delete: () => ({
                eq: (field: string, value: any) => {
                    const executeDelete = async () => {
                        if (typeof window === 'undefined') return { error: null };
                        const data = getStoredData().filter((item: any) => item[field] !== value);
                        localStorage.setItem(table, JSON.stringify(data));
                        return { error: null };
                    };
                    return {
                        execute: executeDelete,
                        then: (resolve: any, reject: any) => executeDelete().then(resolve).catch(reject)
                    };
                }
            })
        };
    },

    storage: {
        from: (bucket: string) => ({
            upload: async (path: string, file: File) => {
                return new Promise<{ data: { path: string } | null; error: null }>((resolve) => {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                        localStorage.setItem(`storage_${bucket}_${path}`, reader.result as string);
                        resolve({ data: { path }, error: null });
                    };
                    reader.readAsDataURL(file);
                });
            },
            getPublicUrl: (path: string) => {
                const dataUrl = typeof window !== 'undefined'
                    ? localStorage.getItem(`storage_${bucket}_${path}`)
                    : null;
                return { data: { publicUrl: dataUrl || '' } };
            }
        })
    }
} as any : createClient(supabaseUrl, supabaseAnonKey);
