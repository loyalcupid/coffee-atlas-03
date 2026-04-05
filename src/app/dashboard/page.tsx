"use client";

import { useEffect, useState } from "react";
import { Coffee, TrendingUp, Star, Home } from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { fetchRecordsWithDetails, RecordSummary } from "@/lib/data";

interface Stats {
    totalVisits: number;
    monthlyVisits: number;
    avgRating: number;
    topCafe: string;
}

export default function Dashboard() {
    const [stats, setStats] = useState<Stats>({ totalVisits: 0, monthlyVisits: 0, avgRating: 0, topCafe: "-" });
    const [recentRecords, setRecentRecords] = useState<RecordSummary[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const [records, visitsResult, ordersResult] = await Promise.all([
                    fetchRecordsWithDetails(),
                    supabase.from('visits').select('*').execute(),
                    supabase.from('orders').select('*').execute(),
                ]);

                const visits: any[] = visitsResult.data || [];
                const orders: any[] = ordersResult.data || [];

                const now = new Date();
                const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

                const totalVisits = visits.length;
                const monthlyVisits = visits.filter(v => v.date?.startsWith(thisMonth)).length;
                const avgRating = orders.length
                    ? Math.round((orders.reduce((sum, o) => sum + (o.rating ?? 0), 0) / orders.length) * 10) / 10
                    : 0;

                // Top cafe by average rating
                const ratingByRecord: Record<string, number[]> = {};
                for (const record of records) {
                    const recordVisits = visits.filter(v => v.record_id === record.id);
                    const visitIds = new Set(recordVisits.map(v => v.id));
                    const recordOrders = orders.filter(o => visitIds.has(o.visit_id));
                    if (recordOrders.length > 0) {
                        ratingByRecord[record.name] = recordOrders.map(o => o.rating ?? 3);
                    }
                }
                const topCafe = Object.entries(ratingByRecord).sort((a, b) => {
                    const avgA = a[1].reduce((s, r) => s + r, 0) / a[1].length;
                    const avgB = b[1].reduce((s, r) => s + r, 0) / b[1].length;
                    return avgB - avgA;
                })[0]?.[0] ?? "-";

                setStats({ totalVisits, monthlyVisits, avgRating, topCafe });
                setRecentRecords(records.slice(0, 3));
            } catch (err) {
                console.error('Error fetching dashboard stats:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    // Taste profile averages
    const [tasteProfile, setTasteProfile] = useState({ acidity: 0, body: 0, sweetness: 0 });
    useEffect(() => {
        const fetchTaste = async () => {
            const { data: orders } = await supabase.from('orders').select('*').execute();
            if (!orders || orders.length === 0) return;
            const avg = (key: string) => Math.round((orders.reduce((s: number, o: any) => s + (o[key] ?? 3), 0) / orders.length) * 10) / 10;
            setTasteProfile({ acidity: avg('acidity'), body: avg('body'), sweetness: avg('sweetness') });
        };
        fetchTaste();
    }, []);

    return (
        <div className="min-h-screen bg-coffee-cream/30 p-6 md:p-12">
            <div className="max-w-6xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex justify-between items-end">
                    <div>
                        <div className="flex items-center gap-4">
                            <Link href="/" className="p-2 hover:bg-coffee-brown/5 rounded-full transition-colors text-coffee-brown">
                                <Home size={24} />
                            </Link>
                            <h1 className="text-3xl font-bold text-coffee-brown">Dashboard</h1>
                        </div>
                        <p className="text-coffee-brown/60 pt-2">환영합니다! 이번 달에도 커피와 함께 즐거운 시간 보내셨나요?</p>
                    </div>
                    <Link href="/add-record" className="bg-coffee-brown text-coffee-cream px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all">
                        기록 추가하기
                    </Link>
                </div>

                {/* Stats Grid */}
                {loading ? (
                    <div className="flex justify-center py-10">
                        <div className="animate-spin w-8 h-8 border-4 border-coffee-brown border-t-transparent rounded-full"></div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        <StatCard icon={<Coffee className="text-coffee-brown" />} label="총 방문 횟수" value={`${stats.totalVisits}회`} />
                        <StatCard icon={<TrendingUp className="text-coffee-accent" />} label="이번 달 방문" value={`${stats.monthlyVisits}회`} />
                        <StatCard icon={<Star className="text-yellow-500" />} label="평균 평점" value={`${stats.avgRating} / 5.0`} />
                        <StatCard icon={<Coffee className="text-coffee-accent" />} label="최고 평점 카페" value={stats.topCafe} />
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Taste Profile */}
                    <div className="lg:col-span-2 coffee-card space-y-6">
                        <h2 className="text-2xl font-bold text-coffee-brown">취향 분석 (Taste Profile)</h2>
                        <div className="space-y-4">
                            <TasteBar label="산미 (Acidity)" value={tasteProfile.acidity} />
                            <TasteBar label="바디감 (Body)" value={tasteProfile.body} />
                            <TasteBar label="단맛 (Sweetness)" value={tasteProfile.sweetness} />
                        </div>
                        {tasteProfile.acidity > 0 && (
                            <div className="p-4 bg-coffee-brown text-coffee-cream rounded-xl">
                                <p className="font-bold text-lg">
                                    {tasteProfile.acidity >= tasteProfile.body && tasteProfile.acidity >= tasteProfile.sweetness
                                        ? '당신은 "산미 선호형"입니다!'
                                        : tasteProfile.body >= tasteProfile.sweetness
                                            ? '당신은 "바디감 선호형"입니다!'
                                            : '당신은 "단맛 선호형"입니다!'}
                                </p>
                                <p className="text-coffee-cream/70 text-sm mt-1">기록된 커피 데이터를 분석한 결과입니다.</p>
                            </div>
                        )}
                    </div>

                    {/* Recent Records */}
                    <div className="coffee-card space-y-6">
                        <h2 className="text-2xl font-bold text-coffee-brown">최근 기록</h2>
                        <div className="space-y-4">
                            {recentRecords.length === 0 ? (
                                <p className="text-coffee-brown/40 text-sm">아직 기록이 없습니다.</p>
                            ) : recentRecords.map((rec) => (
                                <Link
                                    key={rec.id}
                                    href={`/records/${rec.id}`}
                                    className="flex items-center justify-between p-3 hover:bg-coffee-brown/5 rounded-lg transition-colors cursor-pointer group"
                                >
                                    <div className="flex items-center space-x-3">
                                        <div className="w-12 h-12 bg-coffee-accent/20 rounded-lg flex items-center justify-center">
                                            <Coffee size={20} className="text-coffee-brown" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-coffee-brown group-hover:text-coffee-accent transition-colors">{rec.name}</p>
                                            <p className="text-xs text-coffee-brown/50">{rec.date}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center text-xs text-yellow-600 font-bold bg-yellow-50 px-2 py-0.5 rounded">
                                        <Star size={10} fill="currentColor" className="mr-0.5" /> {rec.rating}
                                    </div>
                                </Link>
                            ))}
                        </div>
                        <Link href="/records" className="w-full py-2 text-coffee-brown/60 text-sm hover:text-coffee-brown transition-colors block text-center">
                            전체 보기 →
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
    return (
        <div className="coffee-card flex items-center space-x-4">
            <div className="w-12 h-12 bg-white rounded-xl shadow-inner flex items-center justify-center border border-coffee-brown/5">
                {icon}
            </div>
            <div className="min-w-0">
                <p className="text-sm text-coffee-brown/50 font-medium">{label}</p>
                <p className="text-xl font-bold text-coffee-brown truncate">{value}</p>
            </div>
        </div>
    );
}

function TasteBar({ label, value }: { label: string; value: number }) {
    const pct = Math.round((value / 5) * 100);
    return (
        <div className="space-y-1">
            <div className="flex justify-between text-sm">
                <span className="text-coffee-brown/70 font-medium">{label}</span>
                <span className="font-bold text-coffee-brown">{value > 0 ? `${value} / 5` : "-"}</span>
            </div>
            <div className="w-full h-2.5 bg-coffee-brown/10 rounded-full overflow-hidden">
                <div
                    className="h-full bg-coffee-brown rounded-full transition-all duration-500"
                    style={{ width: `${pct}%` }}
                />
            </div>
        </div>
    );
}
