"use client";

import { useEffect, useState, useMemo } from "react";
import { Coffee, Star, Home, Calendar, MapPin, Award, ChevronRight, TrendingUp, Droplets, Layers, Candy } from "lucide-react";
import Link from "next/link";
import { db, snapToArray } from "@/lib/firebase";
import { ref, get } from "firebase/database";

/* ─────────────────────────── types ─────────────────────────── */
interface CafeRecord { id: string; name: string; location: string; rating: number; }
interface Visit      { id: string; record_id: string; date: string; }
interface Order      { id: string; visit_id: string; drink_name: string; rating: number; acidity: number; body: number; sweetness: number; memo: string; }

/* ─────────────────────── Taste Radar SVG ───────────────────── */
function TasteRadar({ acidity, body, sweetness }: { acidity: number; body: number; sweetness: number }) {
    const W = 220, H = 220, cx = 110, cy = 110, R = 80;
    const toRad = (d: number) => (d * Math.PI) / 180;
    // top=산미, bottom-right=바디감, bottom-left=단맛
    const axes = [
        { angle: -90, label: "산미", sub: "Acidity",   val: acidity,   icon: "◈" },
        { angle:  30, label: "바디감", sub: "Body",     val: body,      icon: "◉" },
        { angle: 150, label: "단맛",  sub: "Sweetness", val: sweetness, icon: "◆" },
    ];
    const scaledPts = axes.map(a => ({
        x: cx + R * (a.val / 5) * Math.cos(toRad(a.angle)),
        y: cy + R * (a.val / 5) * Math.sin(toRad(a.angle)),
    }));
    const axisPts  = axes.map(a => ({ x: cx + R * Math.cos(toRad(a.angle)), y: cy + R * Math.sin(toRad(a.angle)) }));
    const labelPts = axes.map(a => ({ x: cx + (R + 26) * Math.cos(toRad(a.angle)), y: cy + (R + 26) * Math.sin(toRad(a.angle)) }));
    const poly = scaledPts.map(p => `${p.x},${p.y}`).join(" ");
    const gridScales = [0.2, 0.4, 0.6, 0.8, 1.0];

    return (
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} className="mx-auto">
            {/* grid rings */}
            {gridScales.map((s, i) => (
                <polygon key={i}
                    points={axisPts.map(p => `${cx + (p.x - cx) * s},${cy + (p.y - cy) * s}`).join(" ")}
                    fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth={1} />
            ))}
            {/* axis lines */}
            {axisPts.map((p, i) => (
                <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="rgba(255,255,255,0.2)" strokeWidth={1} />
            ))}
            {/* data polygon */}
            <polygon points={poly} fill="#D4AF37" fillOpacity={0.35} stroke="#D4AF37" strokeWidth={2.5} strokeLinejoin="round" />
            {/* data dots */}
            {scaledPts.map((p, i) => (
                <circle key={i} cx={p.x} cy={p.y} r={5} fill="#D4AF37" stroke="white" strokeWidth={1.5} />
            ))}
            {/* labels */}
            {axes.map((a, i) => (
                <g key={i}>
                    <text x={labelPts[i].x} y={labelPts[i].y - 6} textAnchor="middle" fontSize={11} fontWeight="700" fill="white">{a.label}</text>
                    <text x={labelPts[i].x} y={labelPts[i].y + 8} textAnchor="middle" fontSize={10} fill="#D4AF37" fontWeight="600">{a.val.toFixed(1)}</text>
                </g>
            ))}
            {/* center dot */}
            <circle cx={cx} cy={cy} r={3} fill="rgba(255,255,255,0.4)" />
        </svg>
    );
}

/* ────────────────── Monthly Bar Chart ─────────────────────── */
function MonthlyBar({ data }: { data: { label: string; count: number }[] }) {
    const max = Math.max(...data.map(d => d.count), 1);
    return (
        <div className="flex items-end gap-[6px] h-28 px-1">
            {data.map((d, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
                    {d.count > 0 && (
                        <span className="text-[10px] font-bold text-coffee-brown opacity-0 group-hover:opacity-100 transition-opacity">{d.count}</span>
                    )}
                    <div className="w-full flex flex-col justify-end" style={{ height: "80px" }}>
                        <div
                            className="w-full rounded-t-md transition-all duration-700"
                            style={{
                                height: `${Math.max((d.count / max) * 100, d.count > 0 ? 8 : 3)}%`,
                                background: d.count > 0
                                    ? "linear-gradient(180deg,#D4AF37 0%,#3D2B1F 100%)"
                                    : "rgba(61,43,31,0.08)",
                            }}
                        />
                    </div>
                    <span className="text-[9px] text-coffee-brown/40 font-medium">{d.label}</span>
                </div>
            ))}
        </div>
    );
}

/* ───────────────────── Taste Type Logic ────────────────────── */
function getTasteType(acidity: number, body: number, sweetness: number): { emoji: string; label: string; desc: string } {
    if (acidity === 0 && body === 0 && sweetness === 0) return { emoji: "☕", label: "기록 중", desc: "더 많은 커피를 기록해보세요" };
    const diff = Math.max(acidity, body, sweetness) - Math.min(acidity, body, sweetness);
    if (diff < 0.5) return { emoji: "⚖️", label: "균형형", desc: "어떤 커피든 조화롭게 즐기는 타입" };
    if (acidity >= body && acidity >= sweetness) return { emoji: "🍋", label: "산미 선호형", desc: "밝고 과일향 풍부한 스페셜티 추천" };
    if (body >= acidity && body >= sweetness)    return { emoji: "🌊", label: "바디감 선호형", desc: "묵직하고 진한 에스프레소 베이스 추천" };
    return { emoji: "🍯", label: "단맛 선호형", desc: "달콤하고 부드러운 라떼 계열 추천" };
}

/* ══════════════════════ MAIN COMPONENT ═════════════════════════ */
export default function Dashboard() {
    const [records, setRecords] = useState<CafeRecord[]>([]);
    const [visits,  setVisits]  = useState<Visit[]>([]);
    const [orders,  setOrders]  = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            const [recSnap, visSnap, ordSnap] = await Promise.all([
                get(ref(db, "records")),
                get(ref(db, "visits")),
                get(ref(db, "orders")),
            ]);
            setRecords(snapToArray<CafeRecord>(recSnap));
            setVisits(snapToArray<Visit>(visSnap));
            setOrders(snapToArray<Order>(ordSnap));
            setLoading(false);
        };
        load();
    }, []);

    /* ── derived stats ── */
    const now       = new Date();
    const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

    const totalCafes    = records.length;
    const totalVisits   = visits.length;
    const monthlyVisits = visits.filter(v => v.date?.startsWith(thisMonth)).length;
    const avgRating     = orders.length ? +(orders.reduce((s, o) => s + (o.rating ?? 0), 0) / orders.length).toFixed(1) : 0;
    const avgAcidity    = orders.length ? +(orders.reduce((s, o) => s + (o.acidity   ?? 0), 0) / orders.length).toFixed(1) : 0;
    const avgBody       = orders.length ? +(orders.reduce((s, o) => s + (o.body      ?? 0), 0) / orders.length).toFixed(1) : 0;
    const avgSweetness  = orders.length ? +(orders.reduce((s, o) => s + (o.sweetness ?? 0), 0) / orders.length).toFixed(1) : 0;
    const tasteType     = getTasteType(avgAcidity, avgBody, avgSweetness);

    /* ── top drinks ── */
    const topDrinks = useMemo(() => {
        const cnt: Record<string, number> = {};
        orders.forEach(o => { if (o.drink_name) cnt[o.drink_name] = (cnt[o.drink_name] || 0) + 1; });
        return Object.entries(cnt).sort((a, b) => b[1] - a[1]).slice(0, 5);
    }, [orders]);

    /* ── best rated cafe ── */
    const bestCafe = useMemo(() => {
        if (!records.length || !visits.length || !orders.length) return null;
        const visitMap: Record<string, string[]> = {};
        visits.forEach(v => { (visitMap[v.record_id] ??= []).push(v.id); });
        const scores = records.map(r => {
            const vIds = new Set(visitMap[r.id] || []);
            const ords = orders.filter(o => vIds.has(o.visit_id));
            const avg  = ords.length ? ords.reduce((s, o) => s + (o.rating ?? 0), 0) / ords.length : 0;
            const visitCount = (visitMap[r.id] || []).length;
            return { ...r, avgRating: avg, visitCount };
        }).filter(r => r.avgRating > 0).sort((a, b) => b.avgRating - a.avgRating);
        return scores[0] ?? null;
    }, [records, visits, orders]);

    /* ── monthly chart (last 6 months) ── */
    const monthlyData = useMemo(() => {
        const months = Array.from({ length: 6 }, (_, i) => {
            const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
            const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
            const label = `${d.getMonth() + 1}월`;
            const count = visits.filter(v => v.date?.startsWith(key)).length;
            return { label, count };
        });
        return months;
    }, [visits]);

    /* ── recent records ── */
    const recentVisits = useMemo(() => {
        const sorted = [...visits].sort((a, b) => (b.date > a.date ? 1 : -1)).slice(0, 4);
        return sorted.map(v => {
            const record = records.find(r => r.id === v.record_id);
            const order  = orders.find(o => o.visit_id === v.id);
            return { visit: v, record, order };
        }).filter(x => x.record);
    }, [visits, records, orders]);

    /* ── rating level ── */
    const ratingLevel =
        avgRating >= 4.5 ? { label: "엄격한 미식가", color: "text-amber-600" } :
        avgRating >= 3.5 ? { label: "커피 애호가",   color: "text-coffee-brown" } :
        avgRating >  0   ? { label: "커피 입문자",   color: "text-coffee-brown/60" } :
                           { label: "기록 없음",     color: "text-coffee-brown/30" };

    if (loading) return (
        <div className="min-h-screen bg-[#FCF5E5] flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-coffee-brown border-t-transparent rounded-full animate-spin" />
                <p className="text-coffee-brown/50 font-medium text-sm">분석 중...</p>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#FCF5E5]">

            {/* ── Hero Header ── */}
            <div className="bg-gradient-to-br from-[#2A1A10] via-[#3D2B1F] to-[#5C3D2E] text-white px-6 pt-8 pb-14 md:px-12">
                <div className="max-w-5xl mx-auto">
                    <div className="flex items-center justify-between mb-8">
                        <Link href="/" className="p-2 rounded-full hover:bg-white/10 transition-colors">
                            <Home size={22} />
                        </Link>
                        <Link href="/add-record"
                            className="bg-[#D4AF37] text-[#2A1A10] px-5 py-2 rounded-full text-sm font-bold hover:bg-yellow-300 transition-all shadow-lg">
                            + 기록 추가
                        </Link>
                    </div>
                    <div className="space-y-1 mb-6">
                        <p className="text-white/50 text-sm font-medium tracking-widest uppercase">My Coffee Atlas</p>
                        <h1 className="text-3xl md:text-4xl font-black tracking-tight">나의 커피 취향 분석</h1>
                        <p className="text-white/50 text-sm">총 {totalCafes}개 카페 · {totalVisits}번의 방문 기록</p>
                    </div>
                    {/* ── 4 Hero Stats ── */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {[
                            { label: "방문한 카페",   value: totalCafes,    unit: "곳",  icon: <Coffee   size={16} />, accent: false },
                            { label: "총 방문 횟수",  value: totalVisits,   unit: "회",  icon: <Calendar size={16} />, accent: false },
                            { label: "이번 달 방문",  value: monthlyVisits, unit: "회",  icon: <TrendingUp size={16} />, accent: true  },
                            { label: "평균 평점",     value: avgRating,     unit: "점",  icon: <Star     size={16} />, accent: false },
                        ].map((s, i) => (
                            <div key={i} className={`rounded-2xl p-4 space-y-2 border ${s.accent
                                ? "bg-[#D4AF37]/20 border-[#D4AF37]/30"
                                : "bg-white/8 border-white/10"}`}>
                                <div className={`flex items-center gap-1.5 text-xs font-medium ${s.accent ? "text-[#D4AF37]" : "text-white/50"}`}>
                                    {s.icon}{s.label}
                                </div>
                                <p className={`text-2xl font-black ${s.accent ? "text-[#D4AF37]" : "text-white"}`}>
                                    {s.value}<span className={`text-sm font-semibold ml-0.5 ${s.accent ? "text-[#D4AF37]/70" : "text-white/40"}`}>{s.unit}</span>
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-4 md:px-6 -mt-6 pb-16 space-y-5">

                {/* ── Row 1: Taste DNA + Top Drinks ── */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                    {/* Taste DNA Card */}
                    <div className="bg-gradient-to-br from-[#2A1A10] to-[#4A2E1E] rounded-3xl p-6 shadow-xl overflow-hidden relative">
                        <div className="absolute top-0 right-0 w-40 h-40 bg-[#D4AF37]/5 rounded-full -translate-y-10 translate-x-10 pointer-events-none" />
                        <div className="space-y-1 mb-4 relative z-10">
                            <p className="text-[#D4AF37] text-xs font-bold tracking-widest uppercase">Taste DNA</p>
                            <h2 className="text-white text-xl font-black">나의 맛 프로파일</h2>
                        </div>
                        <TasteRadar acidity={avgAcidity} body={avgBody} sweetness={avgSweetness} />
                        <div className="mt-3 p-3 bg-white/8 rounded-2xl border border-white/10 relative z-10">
                            <div className="flex items-center gap-2">
                                <span className="text-2xl">{tasteType.emoji}</span>
                                <div>
                                    <p className="text-white font-bold text-sm">{tasteType.label}</p>
                                    <p className="text-white/50 text-xs">{tasteType.desc}</p>
                                </div>
                            </div>
                        </div>
                        {/* 3 taste bars below radar */}
                        <div className="mt-4 space-y-2.5 relative z-10">
                            {[
                                { label: "산미 (Acidity)",   val: avgAcidity,   icon: <Droplets size={12} />, color: "#7EC8E3" },
                                { label: "바디감 (Body)",     val: avgBody,      icon: <Layers   size={12} />, color: "#C8A97E" },
                                { label: "단맛 (Sweetness)", val: avgSweetness, icon: <Candy    size={12} />, color: "#D4AF37" },
                            ].map((t, i) => (
                                <div key={i} className="space-y-1">
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="flex items-center gap-1 text-white/60">{t.icon}{t.label}</span>
                                        <span className="font-bold text-white">{t.val > 0 ? `${t.val} / 5` : "-"}</span>
                                    </div>
                                    <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                                        <div className="h-full rounded-full transition-all duration-700"
                                            style={{ width: `${(t.val / 5) * 100}%`, backgroundColor: t.color }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Top Drinks + Rating Level */}
                    <div className="space-y-4">
                        {/* Rating Level */}
                        <div className="bg-white rounded-3xl p-5 shadow-md border border-coffee-brown/5 flex items-center gap-4">
                            <div className="w-14 h-14 bg-[#FCF5E5] rounded-2xl flex items-center justify-center border border-coffee-brown/10 flex-shrink-0">
                                <Award size={28} className="text-coffee-brown" />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-coffee-brown/40 uppercase tracking-widest mb-0.5">나의 레벨</p>
                                <p className={`text-lg font-black ${ratingLevel.color}`}>{ratingLevel.label}</p>
                                <div className="flex items-center gap-1 mt-0.5">
                                    {[1,2,3,4,5].map(n => (
                                        <Star key={n} size={13}
                                            fill={avgRating >= n ? "#D4AF37" : "none"}
                                            stroke={avgRating >= n ? "#D4AF37" : "#D4AF37"}
                                            strokeWidth={1.5}
                                            className="transition-all" />
                                    ))}
                                    <span className="text-xs text-coffee-brown/40 ml-1">평균 {avgRating}점</span>
                                </div>
                            </div>
                        </div>

                        {/* Top Drinks */}
                        <div className="bg-white rounded-3xl p-5 shadow-md border border-coffee-brown/5 flex-1">
                            <div className="flex items-center justify-between mb-4">
                                <p className="text-xs font-bold text-coffee-brown/40 uppercase tracking-widest">자주 마신 음료</p>
                                <Coffee size={14} className="text-coffee-brown/30" />
                            </div>
                            {topDrinks.length === 0 ? (
                                <p className="text-coffee-brown/30 text-sm text-center py-6">아직 기록이 없어요</p>
                            ) : (
                                <div className="space-y-3">
                                    {topDrinks.map(([name, count], i) => {
                                        const maxCount = topDrinks[0][1];
                                        const medals = ["🥇","🥈","🥉","",""];
                                        return (
                                            <div key={i} className="space-y-1">
                                                <div className="flex items-center justify-between text-sm">
                                                    <span className="flex items-center gap-2 font-semibold text-coffee-brown">
                                                        <span>{medals[i] || `${i+1}.`}</span>
                                                        <span className="truncate max-w-[140px]">{name}</span>
                                                    </span>
                                                    <span className="text-xs font-bold text-coffee-brown/50">{count}잔</span>
                                                </div>
                                                <div className="h-1.5 bg-coffee-brown/6 rounded-full overflow-hidden">
                                                    <div className="h-full rounded-full transition-all duration-700"
                                                        style={{
                                                            width: `${(count / maxCount) * 100}%`,
                                                            background: i === 0
                                                                ? "linear-gradient(90deg, #D4AF37, #A0832A)"
                                                                : "linear-gradient(90deg, #3D2B1F80, #3D2B1F40)"
                                                        }} />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* ── Row 2: Monthly Chart + Best Cafe ── */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                    {/* Monthly Chart */}
                    <div className="bg-white rounded-3xl p-6 shadow-md border border-coffee-brown/5">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <p className="text-xs font-bold text-coffee-brown/40 uppercase tracking-widest">방문 히스토리</p>
                                <h2 className="text-coffee-brown font-black text-lg mt-0.5">월별 카페 방문 횟수</h2>
                            </div>
                            <div className="w-10 h-10 bg-[#FCF5E5] rounded-xl flex items-center justify-center border border-coffee-brown/10">
                                <TrendingUp size={18} className="text-coffee-brown" />
                            </div>
                        </div>
                        <MonthlyBar data={monthlyData} />
                        <div className="mt-4 pt-4 border-t border-coffee-brown/5 flex items-center justify-between text-xs text-coffee-brown/40">
                            <span>최근 6개월</span>
                            <span>총 {visits.length}회 방문</span>
                        </div>
                    </div>

                    {/* Best Rated Cafe */}
                    <div className={`rounded-3xl p-6 shadow-md border overflow-hidden relative ${bestCafe
                        ? "bg-gradient-to-br from-[#3D2B1F] to-[#6B4A30] border-transparent"
                        : "bg-white border-coffee-brown/5"}`}>
                        {bestCafe ? (
                            <>
                                <div className="absolute top-0 right-0 w-48 h-48 bg-[#D4AF37]/8 rounded-full -translate-y-16 translate-x-16 pointer-events-none" />
                                <div className="relative z-10 space-y-4">
                                    <div>
                                        <p className="text-[#D4AF37] text-xs font-bold tracking-widest uppercase">Best Rated Café</p>
                                        <h2 className="text-white text-xl font-black mt-1 leading-tight">{bestCafe.name}</h2>
                                        <div className="flex items-center gap-1.5 mt-1 text-white/50 text-sm">
                                            <MapPin size={13} />{bestCafe.location}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="flex items-center gap-1.5 bg-[#D4AF37]/20 text-[#D4AF37] px-3 py-1.5 rounded-full border border-[#D4AF37]/30">
                                            <Star size={14} fill="currentColor" />
                                            <span className="font-black text-lg">{bestCafe.avgRating.toFixed(1)}</span>
                                            <span className="text-xs opacity-70">/ 5</span>
                                        </div>
                                        <div className="text-white/50 text-sm">
                                            <span className="text-white font-bold">{bestCafe.visitCount}</span>번 방문
                                        </div>
                                    </div>
                                    <Link href={`/records/${bestCafe.id}`}
                                        className="flex items-center gap-2 text-[#D4AF37] text-sm font-bold hover:gap-3 transition-all">
                                        상세 기록 보기 <ChevronRight size={16} />
                                    </Link>
                                </div>
                            </>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full py-8 gap-3">
                                <div className="w-14 h-14 bg-[#FCF5E5] rounded-2xl flex items-center justify-center">
                                    <Award size={28} className="text-coffee-brown/30" />
                                </div>
                                <p className="text-coffee-brown/40 text-sm text-center">카페를 기록하면<br />최고 평점 카페가 표시돼요</p>
                                <Link href="/add-record" className="text-coffee-brown text-sm font-bold hover:underline">첫 기록 남기기 →</Link>
                            </div>
                        )}
                    </div>
                </div>

                {/* ── Row 3: Recent Visit Timeline ── */}
                <div className="bg-white rounded-3xl p-6 shadow-md border border-coffee-brown/5">
                    <div className="flex items-center justify-between mb-5">
                        <div>
                            <p className="text-xs font-bold text-coffee-brown/40 uppercase tracking-widest">Recent Activity</p>
                            <h2 className="text-coffee-brown font-black text-lg mt-0.5">최근 방문 기록</h2>
                        </div>
                        <Link href="/records" className="text-xs font-bold text-coffee-brown/50 hover:text-coffee-brown transition-colors flex items-center gap-1">
                            전체 보기 <ChevronRight size={13} />
                        </Link>
                    </div>
                    {recentVisits.length === 0 ? (
                        <div className="text-center py-10">
                            <Coffee size={36} className="mx-auto text-coffee-brown/10 mb-3" />
                            <p className="text-coffee-brown/30 text-sm">아직 기록이 없습니다.</p>
                            <Link href="/add-record" className="mt-3 inline-block text-sm font-bold text-coffee-brown hover:underline">첫 카페 기록하기 →</Link>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {recentVisits.map(({ visit, record, order }, i) => record && (
                                <Link key={i} href={`/records/${record.id}`}
                                    className="flex items-center gap-4 p-3 rounded-2xl hover:bg-[#FCF5E5] transition-colors group">
                                    {/* date badge */}
                                    <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-coffee-brown to-[#5C3D2E] rounded-xl flex flex-col items-center justify-center text-white shadow-md">
                                        <span className="text-[10px] font-semibold opacity-70 leading-none">{visit.date?.slice(5,7)}월</span>
                                        <span className="text-base font-black leading-none">{visit.date?.slice(8,10)}</span>
                                    </div>
                                    {/* info */}
                                    <div className="flex-1 min-w-0">
                                        <p className="font-bold text-coffee-brown group-hover:text-coffee-accent transition-colors truncate">{record.name}</p>
                                        <div className="flex items-center gap-2 text-xs text-coffee-brown/40 mt-0.5">
                                            {order?.drink_name && <span className="text-coffee-brown/60 font-medium">{order.drink_name}</span>}
                                            {order?.drink_name && <span>·</span>}
                                            <MapPin size={10} className="flex-shrink-0" />
                                            <span className="truncate">{record.location}</span>
                                        </div>
                                    </div>
                                    {/* taste mini-badges */}
                                    {order && (
                                        <div className="flex-shrink-0 flex items-center gap-2">
                                            <div className="flex items-center gap-0.5 text-xs text-yellow-600 font-bold bg-yellow-50 px-2 py-1 rounded-lg border border-yellow-100">
                                                <Star size={11} fill="currentColor" />{order.rating}
                                            </div>
                                        </div>
                                    )}
                                    <ChevronRight size={16} className="text-coffee-brown/20 group-hover:text-coffee-brown transition-colors flex-shrink-0" />
                                </Link>
                            ))}
                        </div>
                    )}
                </div>

                {/* ── Row 4: Taste Deep Dive ── */}
                <div className="bg-white rounded-3xl p-6 shadow-md border border-coffee-brown/5">
                    <div className="mb-5">
                        <p className="text-xs font-bold text-coffee-brown/40 uppercase tracking-widest">Taste Deep Dive</p>
                        <h2 className="text-coffee-brown font-black text-lg mt-0.5">기록 기반 상세 통계</h2>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {[
                            { label: "산미 (Acidity)",   avg: avgAcidity,    sub: orders.length ? `${orders.filter(o=>o.acidity>=4).length}개 기록이 4점 이상` : "기록 없음", icon: <Droplets size={20} />, color: "#7EC8E3", bg: "#EFF8FF" },
                            { label: "바디감 (Body)",     avg: avgBody,       sub: orders.length ? `${orders.filter(o=>o.body>=4).length}개 기록이 4점 이상` : "기록 없음",   icon: <Layers   size={20} />, color: "#C8A97E", bg: "#FBF5EE" },
                            { label: "단맛 (Sweetness)", avg: avgSweetness,  sub: orders.length ? `${orders.filter(o=>o.sweetness>=4).length}개 기록이 4점 이상` : "기록 없음", icon: <Candy    size={20} />, color: "#D4AF37", bg: "#FDFBEF" },
                        ].map((item, i) => (
                            <div key={i} className="rounded-2xl p-4 border border-coffee-brown/5" style={{ background: item.bg }}>
                                <div className="flex items-center gap-2 mb-3">
                                    <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${item.color}25`, color: item.color }}>
                                        {item.icon}
                                    </div>
                                    <span className="text-sm font-bold text-coffee-brown">{item.label}</span>
                                </div>
                                <p className="text-3xl font-black text-coffee-brown mb-1">
                                    {item.avg > 0 ? item.avg : "-"}
                                    {item.avg > 0 && <span className="text-sm font-semibold text-coffee-brown/40 ml-1">/5</span>}
                                </p>
                                {/* 5-segment progress */}
                                <div className="flex gap-1 mb-2">
                                    {[1,2,3,4,5].map(n => (
                                        <div key={n} className="flex-1 h-2 rounded-full transition-all"
                                            style={{ background: n <= item.avg ? item.color : `${item.color}25` }} />
                                    ))}
                                </div>
                                <p className="text-xs text-coffee-brown/40">{item.sub}</p>
                            </div>
                        ))}
                    </div>
                    {orders.length > 0 && (
                        <div className="mt-4 p-4 bg-gradient-to-r from-[#FCF5E5] to-[#FDF8F0] rounded-2xl border border-coffee-brown/8 flex items-center gap-3">
                            <span className="text-2xl">{tasteType.emoji}</span>
                            <div>
                                <p className="text-coffee-brown font-bold text-sm">{tasteType.label} — {tasteType.desc}</p>
                                <p className="text-coffee-brown/40 text-xs mt-0.5">총 {orders.length}잔의 커피 기록을 바탕으로 분석한 결과입니다.</p>
                            </div>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}
