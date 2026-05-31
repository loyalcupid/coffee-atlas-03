"use client";

import { useEffect, useState, useMemo, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { db, snapToArray } from "@/lib/firebase";
import { ref, get } from "firebase/database";
import { Home, Star, MapPin, Search, TrendingUp, Coffee, Calendar, Users } from "lucide-react";

const REGIONS = ["서울","경기","인천","강원","충북","충남","대전","전북","전남","광주","경북","대구","경주","경남","울산","부산","제주"] as const;
type Region = typeof REGIONS[number];

interface CafeRecord { id: string; name: string; location: string; region?: string; rating: number; author?: { uid: string; display_name: string }; }
interface Visit      { id: string; record_id: string; date: string; }
interface Order      { id: string; visit_id: string; drink_name: string; rating: number; acidity: number; body: number; sweetness: number; }

interface CafeSummary {
  name: string;
  location: string;
  region: string;
  avgCafeRating: number;
  visitCount: number;
  recordCount: number;
  topDrinks: string[];
  avgAcidity: number;
  avgBody: number;
  avgSweetness: number;
  reviewers: string[];
}

function ReputationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [records, setRecords] = useState<CafeRecord[]>([]);
  const [visits,  setVisits]  = useState<Visit[]>([]);
  const [orders,  setOrders]  = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search,       setSearch]       = useState(searchParams.get("q") || "");
  const [sort,         setSort]         = useState<"rating" | "visits">((searchParams.get("sort") as "rating" | "visits") || "rating");
  const [regionFilter, setRegionFilter] = useState(searchParams.get("region") || "");

  useEffect(() => {
    const params = new URLSearchParams();
    if (search) params.set("q", search);
    if (sort !== "rating") params.set("sort", sort);
    if (regionFilter) params.set("region", regionFilter);
    const qs = params.toString();
    router.replace(qs ? `/reputation?${qs}` : "/reputation", { scroll: false });
  }, [search, sort, regionFilter]);

  useEffect(() => {
    const load = async () => {
      const [r, v, o] = await Promise.all([
        get(ref(db, "records")),
        get(ref(db, "visits")),
        get(ref(db, "orders")),
      ]);
      setRecords(snapToArray<CafeRecord>(r));
      setVisits(snapToArray<Visit>(v));
      setOrders(snapToArray<Order>(o));
      setLoading(false);
    };
    load();
  }, []);

  const cafeSummaries = useMemo<CafeSummary[]>(() => {
    const visitsByRecord: Record<string, Visit[]> = {};
    visits.forEach(v => { (visitsByRecord[v.record_id] ??= []).push(v); });
    const ordersByVisit: Record<string, Order[]> = {};
    orders.forEach(o => { (ordersByVisit[o.visit_id] ??= []).push(o); });

    const cafeMap: Record<string, { name: string; location: string; region: string; records: CafeRecord[]; visits: Visit[]; orders: Order[] }> = {};
    records.forEach(r => {
      const key = `${r.name?.trim()}||${(r.location || "").trim()}`;
      if (!cafeMap[key]) cafeMap[key] = { name: r.name?.trim(), location: (r.location || "").trim(), region: r.region || "", records: [], visits: [], orders: [] };
      if (!cafeMap[key].region && r.region) cafeMap[key].region = r.region;
      cafeMap[key].records.push(r);
      const rv = visitsByRecord[r.id] || [];
      cafeMap[key].visits.push(...rv);
      rv.forEach(v => cafeMap[key].orders.push(...(ordersByVisit[v.id] || [])));
    });

    return Object.values(cafeMap)
      .filter(c => c.name)
      .map(c => {
        const cafeRatings = c.records.map(r => r.rating).filter(Boolean);
        const avgCafeRating = cafeRatings.length
          ? +(cafeRatings.reduce((s, v) => s + v, 0) / cafeRatings.length).toFixed(1) : 0;

        const drinkCnt: Record<string, number> = {};
        c.orders.forEach(o => { if (o.drink_name) drinkCnt[o.drink_name] = (drinkCnt[o.drink_name] || 0) + 1; });
        const topDrinks = Object.entries(drinkCnt).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([n]) => n);

        const tasteSrc = c.orders.filter(o => o.acidity);
        const avgAcidity   = tasteSrc.length ? +(tasteSrc.reduce((s, o) => s + o.acidity,   0) / tasteSrc.length).toFixed(1) : 0;
        const avgBody      = tasteSrc.length ? +(tasteSrc.reduce((s, o) => s + o.body,      0) / tasteSrc.length).toFixed(1) : 0;
        const avgSweetness = tasteSrc.length ? +(tasteSrc.reduce((s, o) => s + o.sweetness, 0) / tasteSrc.length).toFixed(1) : 0;

        const reviewers = [...new Set(c.records.filter(r => r.author?.display_name).map(r => r.author!.display_name))];

        return { name: c.name, location: c.location, region: c.region, avgCafeRating, visitCount: c.visits.length,
                 recordCount: c.records.length, topDrinks, avgAcidity, avgBody, avgSweetness, reviewers };
      });
  }, [records, visits, orders]);

  const globalAvg = useMemo(() => {
    const rated = orders.filter(o => o.rating);
    return rated.length ? +(rated.reduce((s, o) => s + o.rating, 0) / rated.length).toFixed(1) : 0;
  }, [orders]);

  const regionStats = useMemo(() => {
    if (!regionFilter) return null;
    const inRegion = cafeSummaries.filter(c =>
      regionFilter === "미분류" ? !c.region : c.region === regionFilter
    );
    const regionRecordIds = new Set(
      records
        .filter(r => regionFilter === "미분류" ? !r.region : r.region === regionFilter)
        .map(r => r.id)
    );
    const regionVisitIds = new Set(
      visits.filter(v => regionRecordIds.has(v.record_id)).map(v => v.id)
    );
    const regionOrders = orders.filter(o => regionVisitIds.has(o.visit_id) && o.rating);
    const avgRating = regionOrders.length
      ? +(regionOrders.reduce((s, o) => s + o.rating, 0) / regionOrders.length).toFixed(1)
      : 0;
    return {
      cafeCount: inRegion.length,
      visitCount: inRegion.reduce((sum, c) => sum + c.visitCount, 0),
      avgRating,
    };
  }, [regionFilter, cafeSummaries, records, visits, orders]);

  const filtered = useMemo(() => {
    const term = search.toLowerCase();
    let list = cafeSummaries.filter(c => {
      const matchText = !term || c.name.toLowerCase().includes(term) || c.location.toLowerCase().includes(term);
      const matchRegion = !regionFilter
        || (regionFilter === "미분류" ? !c.region : c.region === regionFilter);
      return matchText && matchRegion;
    });
    if (sort === "rating") list.sort((a, b) => b.avgCafeRating - a.avgCafeRating || b.visitCount - a.visitCount);
    else                   list.sort((a, b) => b.visitCount - a.visitCount || b.avgCafeRating - a.avgCafeRating);
    return list;
  }, [cafeSummaries, search, sort, regionFilter]);

  const medals = ["🥇", "🥈", "🥉"];

  return (
    <div className="min-h-screen cafe-bg">
      {/* Header */}
      <div className="w-full border-b border-[#D4AF37]/20 px-6 py-5">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-[#D4AF37]/60 hover:text-[#D4AF37] transition-colors">
              <Home size={20} />
            </Link>
            <span className="text-[#D4AF37]/30">/</span>
            <div className="flex items-center gap-2">
              <Star size={18} className="text-[#D4AF37]" />
              <h1 className="playfair text-xl font-bold text-[#FCF5E5]">전국 카페 평판</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-10 space-y-8">

        {/* Title */}
        <div className="text-center space-y-3">
          <div className="gold-divider text-[#D4AF37]/50 text-xs tracking-[0.4em] uppercase cormorant">
            National Café Reputation
          </div>
          <p className="cormorant text-[#FCF5E5]/45 text-lg font-light">
            Coffee Atlas 유저들이 기록한 {loading ? "..." : cafeSummaries.length}곳의 카페 정보
          </p>
        </div>

        {/* Stats */}
        {!loading && (
          <div className="grid grid-cols-1 gap-4">
            {[
              { icon: <Coffee size={18} />,   label: "등록된 카페",   value: regionStats ? regionStats.cafeCount : cafeSummaries.length, unit: "곳" },
              { icon: <Calendar size={18} />, label: "총 방문 기록",  value: regionStats ? regionStats.visitCount : visits.length,        unit: "회" },
              { icon: <Star size={18} />,     label: "평균 커피 평점", value: (regionStats ? regionStats.avgRating : globalAvg) || "-",    unit: (regionStats ? regionStats.avgRating : globalAvg) ? "점" : "" },
            ].map((s, i) => (
              <div key={i} className="border border-[#D4AF37]/20 rounded-2xl p-5 bg-[#1a0f0a]/40 flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/10 text-[#D4AF37] flex items-center justify-center flex-shrink-0">
                  {s.icon}
                </div>
                <div>
                  <p className="playfair text-2xl font-bold text-[#FCF5E5]">
                    {s.value}<span className="text-sm font-normal text-[#FCF5E5]/40 ml-0.5">{s.unit}</span>
                  </p>
                  <p className="cormorant text-[#FCF5E5]/40 text-sm">{s.label}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Search + Sort */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#FCF5E5]/30" />
            <input
              type="text"
              placeholder="카페 이름 또는 지역으로 검색..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-xl bg-[#1a0f0a]/60 border border-[#D4AF37]/20 text-[#FCF5E5] placeholder-[#FCF5E5]/25 focus:outline-none focus:border-[#D4AF37]/40 transition-all text-sm"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setSort("rating")}
              className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-bold transition-all cormorant ${
                sort === "rating"
                  ? "bg-[#D4AF37] text-[#1a0f0a]"
                  : "border border-[#D4AF37]/25 text-[#FCF5E5]/50 hover:border-[#D4AF37]/50"
              }`}
            >
              <Star size={14} /> 평점순
            </button>
            <button
              onClick={() => setSort("visits")}
              className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-bold transition-all cormorant ${
                sort === "visits"
                  ? "bg-[#D4AF37] text-[#1a0f0a]"
                  : "border border-[#D4AF37]/25 text-[#FCF5E5]/50 hover:border-[#D4AF37]/50"
              }`}
            >
              <TrendingUp size={14} /> 방문순
            </button>
          </div>
        </div>

        {/* Region tabs — 지역 선택 중일 때만 표시 */}
        {regionFilter && !loading && (
          <div className="flex items-center gap-3">
            <button
              onClick={() => setRegionFilter("")}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold border border-[#D4AF37]/25 text-[#FCF5E5]/50 hover:border-[#D4AF37]/50 transition-all cormorant"
            >
              ← 전체 지역
            </button>
            <span className="bg-[#D4AF37] text-[#1a0f0a] px-4 py-2 rounded-xl text-sm font-bold cormorant">
              {regionFilter}
            </span>
          </div>
        )}

        {/* Main Content */}
        {loading ? (
          <div className="text-center py-24 cormorant text-[#FCF5E5]/30 text-xl">불러오는 중...</div>

        ) : !regionFilter && !search ? (
          /* 지역 선택 그리드 */
          <div className="space-y-4">
            <p className="cormorant text-[#FCF5E5]/35 text-sm tracking-wide">지역을 선택하세요</p>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
              {REGIONS.map(r => {
                const count = cafeSummaries.filter(c => c.region === r).length;
                const hasData = count > 0;
                return (
                  <button
                    key={r}
                    onClick={() => setRegionFilter(r)}
                    className={`border rounded-2xl p-4 transition-all text-center group ${
                      hasData
                        ? "border-[#D4AF37]/20 bg-[#1a0f0a]/40 hover:border-[#D4AF37]/60 hover:bg-[#D4AF37]/8 cursor-pointer"
                        : "border-[#D4AF37]/8 bg-[#1a0f0a]/20 cursor-pointer hover:border-[#D4AF37]/20"
                    }`}
                  >
                    <p className={`playfair text-lg font-bold transition-colors ${
                      hasData
                        ? "text-[#FCF5E5] group-hover:text-[#D4AF37]"
                        : "text-[#FCF5E5]/30"
                    }`}>{r}</p>
                    <p className={`cormorant text-xs mt-1 ${hasData ? "text-[#FCF5E5]/35" : "text-[#FCF5E5]/15"}`}>
                      {hasData ? `${count}개` : "—"}
                    </p>
                  </button>
                );
              })}
            </div>
            {cafeSummaries.filter(c => !c.region).length > 0 && (
              <button
                onClick={() => setRegionFilter("미분류")}
                className="border border-[#D4AF37]/20 rounded-2xl px-5 py-3 bg-[#1a0f0a]/40 hover:border-[#D4AF37]/60 transition-all cormorant text-[#FCF5E5]/40 text-sm hover:text-[#FCF5E5]/60"
              >
                지역 미설정 카페 {cafeSummaries.filter(c => !c.region).length}개 보기 →
              </button>
            )}
          </div>

        ) : filtered.length === 0 ? (
          <div className="text-center py-24 space-y-4">
            <Coffee size={48} className="mx-auto text-[#D4AF37]/20" />
            <p className="playfair text-[#FCF5E5]/40 text-xl">
              {search ? `"${search}" 검색 결과가 없습니다.` : `${regionFilter} 지역에 등록된 카페가 없습니다.`}
            </p>
          </div>

        ) : (
          <div className="space-y-4">
            {filtered.map((cafe, i) => (
              <Link
                key={i}
                href={`/reputation/cafe/${encodeURIComponent(cafe.name)}?loc=${encodeURIComponent(cafe.location)}`}
                className="block border border-[#D4AF37]/20 rounded-2xl p-6 bg-[#1a0f0a]/40 hover:border-[#D4AF37]/40 transition-all"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    <div className="flex-shrink-0 w-10 text-center">
                      {i < 3 ? (
                        <span className="text-2xl">{medals[i]}</span>
                      ) : (
                        <span className="playfair text-xl font-bold text-[#FCF5E5]/30">{i + 1}</span>
                      )}
                    </div>

                    <div className="flex-1 min-w-0 space-y-2">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h2 className="playfair text-xl font-bold text-[#FCF5E5]">{cafe.name}</h2>
                          {cafe.region && (
                            <span className="cormorant text-xs bg-[#D4AF37]/15 text-[#D4AF37]/80 border border-[#D4AF37]/20 px-2 py-0.5 rounded-full">
                              {cafe.region}
                            </span>
                          )}
                        </div>
                      </div>

                      {cafe.reviewers.length > 0 && (
                        <div className="flex items-center gap-1.5 cormorant text-[#FCF5E5]/30 text-xs">
                          <Users size={11} />
                          {cafe.reviewers.slice(0, 3).join(", ")}
                          {cafe.reviewers.length > 3 && ` 외 ${cafe.reviewers.length - 3}명`}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex-shrink-0 text-right space-y-2">
                    <div className="flex items-center gap-1 justify-end">
                      {[1,2,3,4,5].map(n => (
                        <Star key={n} size={13}
                          fill={cafe.avgCafeRating >= n ? "#D4AF37" : "none"}
                          stroke="#D4AF37"
                          strokeWidth={1.5}
                          className="opacity-80"
                        />
                      ))}
                    </div>
                    {cafe.avgCafeRating > 0 && (
                      <p className="playfair text-2xl font-bold text-[#D4AF37]">{cafe.avgCafeRating}</p>
                    )}
                    <p className="cormorant text-[#FCF5E5]/35 text-sm">{cafe.visitCount}회 방문</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <footer className="w-full py-8 text-center border-t border-[#D4AF37]/15 mt-8">
        <p className="cormorant text-[#FCF5E5]/25 tracking-widest text-sm uppercase">
          © 2026 Coffee Atlas · All rights reserved
        </p>
      </footer>
    </div>
  );
}

export default function ReputationPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen cafe-bg flex items-center justify-center">
        <div className="cormorant text-[#FCF5E5]/30 text-xl">불러오는 중...</div>
      </div>
    }>
      <ReputationContent />
    </Suspense>
  );
}
