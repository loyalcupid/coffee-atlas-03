"use client";

import { useEffect, useState, Suspense } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { db, snapToArray } from "@/lib/firebase";
import { ref, get } from "firebase/database";
import { Home, Star, MapPin, ArrowLeft, Coffee, Users, Camera, FileText, UtensilsCrossed } from "lucide-react";
import { PhotoLightbox } from "@/components/PhotoLightbox";

interface CafeRecord {
  id: string;
  name: string;
  location: string;
  region?: string;
  rating: number;
  atmosphere_rating?: number;
  atmosphere_images?: string[];
  overall_memo?: string;
  author?: { uid: string; display_name: string };
}

interface Visit {
  id: string;
  record_id: string;
  date: string;
}

interface Order {
  id: string;
  visit_id: string;
  drink_name: string;
  price: number;
  rating: number;
  acidity: number;
  body: number;
  sweetness: number;
  nuttiness: number;
  aroma: number;
  balance: number;
  memo?: string;
  images?: string[];
}

interface OtherItem {
  id: string;
  visit_id: string;
  name: string;
  price: number;
  rating: number;
  memo?: string;
  images?: string[];
}

function CafeDetailContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const cafeName = decodeURIComponent(params.name as string);
  const cafeLocation = decodeURIComponent(searchParams.get("loc") || "");

  const [records, setRecords] = useState<CafeRecord[]>([]);
  const [visits, setVisits] = useState<Visit[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [otherItems, setOtherItems] = useState<OtherItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      const [rSnap, vSnap, oSnap, otherSnap] = await Promise.all([
        get(ref(db, "records")),
        get(ref(db, "visits")),
        get(ref(db, "orders")),
        get(ref(db, "other_items")),
      ]);

      const allRecords = snapToArray<CafeRecord>(rSnap);
      const matchingRecords = allRecords.filter(
        r => r.name?.trim() === cafeName && (r.location || "").trim() === cafeLocation
      );

      const matchingIds = new Set(matchingRecords.map(r => r.id));
      const allVisits = snapToArray<Visit>(vSnap);
      const matchingVisits = allVisits.filter(v => matchingIds.has(v.record_id));

      const visitIds = new Set(matchingVisits.map(v => v.id));
      const allOrders = snapToArray<Order>(oSnap);
      const matchingOrders = allOrders.filter(o => visitIds.has(o.visit_id));
      const allOtherItems = snapToArray<OtherItem>(otherSnap);
      const matchingOtherItems = allOtherItems.filter(o => visitIds.has(o.visit_id));

      setRecords(matchingRecords);
      setVisits(matchingVisits);
      setOrders(matchingOrders);
      setOtherItems(matchingOtherItems);
      setLoading(false);
    };
    load();
  }, [cafeName, cafeLocation]);

  const cafeRatings = records.map(r => r.rating).filter(Boolean);
  const avgCafeRating = cafeRatings.length
    ? +(cafeRatings.reduce((s, v) => s + v, 0) / cafeRatings.length).toFixed(1) : 0;

  const tasteSrc = orders.filter(o => o.acidity);
  const avgAcidity   = tasteSrc.length ? +(tasteSrc.reduce((s, o) => s + o.acidity,    0) / tasteSrc.length).toFixed(1) : 0;
  const avgBody      = tasteSrc.length ? +(tasteSrc.reduce((s, o) => s + o.body,       0) / tasteSrc.length).toFixed(1) : 0;
  const avgSweetness = tasteSrc.length ? +(tasteSrc.reduce((s, o) => s + o.sweetness,  0) / tasteSrc.length).toFixed(1) : 0;
  const avgNuttiness = tasteSrc.length ? +(tasteSrc.reduce((s, o) => s + (o.nuttiness ?? 0), 0) / tasteSrc.length).toFixed(1) : 0;
  const avgAroma     = tasteSrc.length ? +(tasteSrc.reduce((s, o) => s + (o.aroma     ?? 0), 0) / tasteSrc.length).toFixed(1) : 0;
  const avgBalance   = tasteSrc.length ? +(tasteSrc.reduce((s, o) => s + (o.balance   ?? 0), 0) / tasteSrc.length).toFixed(1) : 0;


  const region = records.find(r => r.region)?.region || "";
  const reviewers = [...new Set(records.filter(r => r.author?.display_name).map(r => r.author!.display_name))];

  const visitsByRecord: Record<string, Visit[]> = {};
  visits.forEach(v => { (visitsByRecord[v.record_id] ??= []).push(v); });

  const ordersByVisit: Record<string, Order[]> = {};
  orders.forEach(o => { (ordersByVisit[o.visit_id] ??= []).push(o); });

  const otherItemsByVisit: Record<string, OtherItem[]> = {};
  otherItems.forEach(o => { (otherItemsByVisit[o.visit_id] ??= []).push(o); });

  const sortedRecords = [...records].sort((a, b) => {
    const aLatest = (visitsByRecord[a.id] || []).reduce((d, v) => (v.date > d ? v.date : d), "");
    const bLatest = (visitsByRecord[b.id] || []).reduce((d, v) => (v.date > d ? v.date : d), "");
    return bLatest.localeCompare(aLatest);
  });

  if (loading) {
    return (
      <div className="min-h-screen cafe-bg flex items-center justify-center">
        <div className="cormorant text-[#FCF5E5]/30 text-xl">불러오는 중...</div>
      </div>
    );
  }

  if (records.length === 0) {
    return (
      <div className="min-h-screen cafe-bg flex items-center justify-center">
        <div className="text-center space-y-4">
          <Coffee size={48} className="mx-auto text-[#D4AF37]/20" />
          <p className="cormorant text-[#FCF5E5]/40 text-xl">카페 정보를 찾을 수 없습니다.</p>
          <Link href="/reputation" className="inline-flex items-center gap-2 cormorant text-[#D4AF37]/60 hover:text-[#D4AF37] transition-colors">
            <ArrowLeft size={16} /> 전국 카페 평판으로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen cafe-bg">
      {/* Header */}
      <div className="w-full border-b border-[#D4AF37]/20 px-6 py-5">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3 flex-wrap">
            <Link href="/" className="text-[#D4AF37]/60 hover:text-[#D4AF37] transition-colors">
              <Home size={20} />
            </Link>
            <span className="text-[#D4AF37]/30">/</span>
            <Link href="/reputation" className="flex items-center gap-1.5 text-[#D4AF37]/60 hover:text-[#D4AF37] transition-colors">
              <Star size={15} />
              <span className="cormorant text-sm">전국 카페 평판</span>
            </Link>
            <span className="text-[#D4AF37]/30">/</span>
            <span className="cormorant text-sm text-[#FCF5E5]/60 truncate max-w-[160px]">{cafeName}</span>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-10 space-y-8">

        {/* Back */}
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 cormorant text-[#FCF5E5]/40 hover:text-[#D4AF37] transition-colors text-sm"
        >
          <ArrowLeft size={15} /> 전국 카페 평판으로 돌아가기
        </button>

        {/* Cafe header */}
        <div className="border border-[#D4AF37]/20 rounded-2xl p-6 bg-[#1a0f0a]/40 space-y-3">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2 flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="playfair text-3xl font-bold text-[#FCF5E5]">{cafeName}</h1>
                {region && (
                  <span className="cormorant text-xs bg-[#D4AF37]/15 text-[#D4AF37]/80 border border-[#D4AF37]/20 px-2 py-0.5 rounded-full">
                    {region}
                  </span>
                )}
              </div>
              {cafeLocation && (
                <div className="flex items-center gap-1.5 cormorant text-[#FCF5E5]/40 text-sm">
                  <MapPin size={13} />{cafeLocation}
                </div>
              )}
              {reviewers.length > 0 && (
                <div className="flex items-center gap-1.5 cormorant text-[#FCF5E5]/30 text-xs">
                  <Users size={11} />
                  {reviewers.join(", ")}
                </div>
              )}
            </div>
            <div className="flex-shrink-0 text-right space-y-2">
              <div className="flex items-center gap-1 justify-end">
                {[1,2,3,4,5].map(n => {
                  const isFull = avgCafeRating >= n * 2;
                  const isHalf = !isFull && avgCafeRating >= n * 2 - 1;
                  return (
                    <div key={n} className="relative flex-shrink-0" style={{ width: 13, height: 13 }}>
                      <Star size={13} fill="none" stroke="#D4AF37" strokeWidth={1.5} className="absolute opacity-40" />
                      {(isFull || isHalf) && (
                        <div className="absolute overflow-hidden" style={{ width: isFull ? 13 : 6.5, height: 13 }}>
                          <Star size={13} fill="#D4AF37" stroke="#D4AF37" strokeWidth={1.5} className="absolute opacity-80" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              {avgCafeRating > 0 && (
                <p className="playfair text-2xl font-bold text-[#D4AF37]">{avgCafeRating}<span className="text-sm font-normal text-[#D4AF37]/50">/10</span></p>
              )}
              <p className="cormorant text-[#FCF5E5]/35 text-sm">{visits.length}회 방문</p>
            </div>
          </div>
        </div>

        {/* Taste Profile */}
        {avgAcidity > 0 && (
          <div className="border border-[#D4AF37]/20 rounded-2xl p-6 bg-[#1a0f0a]/40 space-y-4">
            <h2 className="cormorant text-[#D4AF37]/70 text-xs uppercase tracking-widest font-bold">테이스트 프로파일</h2>
            <div className="space-y-3">
              {[
                { label: "산미",   val: avgAcidity,   color: "#7EC8E3" },
                { label: "바디",   val: avgBody,      color: "#C8A97E" },
                { label: "단맛",   val: avgSweetness, color: "#D4AF37" },
                { label: "고소함", val: avgNuttiness, color: "#A8C97E" },
                { label: "향미",   val: avgAroma,     color: "#E3A8E0" },
                { label: "균형감", val: avgBalance,   color: "#7EC8C8" },
              ].map((t, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="cormorant text-[#FCF5E5]/50 text-sm w-12">{t.label}</span>
                  <div className="flex-1 h-2 bg-white/8 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all" style={{ width: `${(t.val / 5) * 100}%`, backgroundColor: t.color }} />
                  </div>
                  <span className="cormorant text-[#FCF5E5]/50 text-sm w-6 text-right">{t.val}</span>
                </div>
              ))}
            </div>
          </div>
        )}


        {/* Records with visits and orders */}
        {sortedRecords.length > 0 && (
          <div className="space-y-5">
            <h2 className="cormorant text-[#D4AF37]/70 text-xs uppercase tracking-widest font-bold px-1">방문 기록</h2>
            {sortedRecords.map(record => {
              const recordVisits = (visitsByRecord[record.id] || []).sort((a, b) => b.date.localeCompare(a.date));
              const hasPhotos = (record.atmosphere_images || []).length > 0;
              const hasMemo = !!record.overall_memo;

              return (
                <div key={record.id} className="border border-[#D4AF37]/20 rounded-2xl p-6 bg-[#1a0f0a]/40 space-y-6">
                  {/* Record header */}
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                      <Users size={13} className="text-[#D4AF37]/40" />
                      <span className="cormorant text-[#FCF5E5]/50 text-sm">
                        {record.author?.display_name || "익명"}
                      </span>
                    </div>
                    {record.rating > 0 && (
                      <div className="flex items-center gap-1">
                        {[1,2,3,4,5].map(n => {
                          const isFull = record.rating >= n * 2;
                          const isHalf = !isFull && record.rating >= n * 2 - 1;
                          return (
                            <div key={n} className="relative flex-shrink-0" style={{ width: 12, height: 12 }}>
                              <Star size={12} fill="none" stroke="#D4AF37" strokeWidth={1.5} className="absolute opacity-40" />
                              {(isFull || isHalf) && (
                                <div className="absolute overflow-hidden" style={{ width: isFull ? 12 : 6, height: 12 }}>
                                  <Star size={12} fill="#D4AF37" stroke="#D4AF37" strokeWidth={1.5} className="absolute opacity-80" />
                                </div>
                              )}
                            </div>
                          );
                        })}
                        <span className="cormorant text-[#D4AF37]/60 text-xs ml-1">{record.rating}<span className="text-[10px] opacity-60">/10</span></span>
                      </div>
                    )}
                  </div>

                  {/* Overall memo */}
                  {hasMemo && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-1.5">
                        <FileText size={13} className="text-[#D4AF37]/40" />
                        <span className="cormorant text-[#D4AF37]/60 text-xs uppercase tracking-wider">총평</span>
                      </div>
                      <p className="cormorant text-[#FCF5E5]/60 text-sm leading-relaxed pl-5 italic">
                        {record.overall_memo}
                      </p>
                    </div>
                  )}

                  {/* Atmosphere Rating */}
                  {record.atmosphere_rating != null && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-1.5">
                        <Star size={13} className="text-[#D4AF37]/40" />
                        <span className="cormorant text-[#D4AF37]/60 text-xs uppercase tracking-wider">카페 분위기</span>
                      </div>
                      <div className="flex items-center gap-2 pl-5">
                        {[1,2,3,4,5].map(n => {
                          const isFull = record.atmosphere_rating! >= n * 2;
                          const isHalf = !isFull && record.atmosphere_rating! >= n * 2 - 1;
                          return (
                            <div key={n} className="relative flex-shrink-0" style={{ width: 13, height: 13 }}>
                              <Star size={13} fill="none" stroke="#D4AF37" strokeWidth={1.5} className="absolute opacity-40" />
                              {(isFull || isHalf) && (
                                <div className="absolute overflow-hidden" style={{ width: isFull ? 13 : 6.5, height: 13 }}>
                                  <Star size={13} fill="#D4AF37" stroke="#D4AF37" strokeWidth={1.5} className="absolute opacity-80" />
                                </div>
                              )}
                            </div>
                          );
                        })}
                        <span className="cormorant text-[#D4AF37]/60 text-sm ml-1">{record.atmosphere_rating}<span className="text-xs opacity-60">/10</span></span>
                      </div>
                    </div>
                  )}

                  {/* Photos */}
                  {hasPhotos && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-1.5">
                        <Camera size={13} className="text-[#D4AF37]/40" />
                        <span className="cormorant text-[#D4AF37]/60 text-xs uppercase tracking-wider">사진</span>
                      </div>
                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 pl-5">
                        {(record.atmosphere_images || []).map((img, i) => (
                          <div key={i} className="aspect-square rounded-xl overflow-hidden border border-[#D4AF37]/10">
                            <img
                              src={img}
                              alt=""
                              className="w-full h-full object-cover cursor-pointer"
                              onClick={() => setLightboxUrl(img)}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Visits + Orders */}
                  {recordVisits.length > 0 && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-1.5">
                        <Coffee size={13} className="text-[#D4AF37]/40" />
                        <span className="cormorant text-[#D4AF37]/60 text-xs uppercase tracking-wider">주문한 커피</span>
                      </div>
                      <div className="space-y-4 pl-5">
                        {recordVisits.map(visit => {
                          const visitOrders = ordersByVisit[visit.id] || [];
                          if (visitOrders.length === 0) return null;
                          return (
                            <div key={visit.id} className="space-y-3">
                              <span className="cormorant text-[#FCF5E5]/30 text-xs">{visit.date}</span>
                              <div className="space-y-3">
                                {visitOrders.map(order => (
                                  <div key={order.id} className="border border-[#D4AF37]/10 rounded-xl p-4 bg-[#1a0f0a]/30 space-y-3">
                                    <div className="flex items-center justify-between flex-wrap gap-2">
                                      <span className="playfair text-[#FCF5E5] font-bold text-sm">{order.drink_name}</span>
                                      <div className="flex items-center gap-3">
                                        {order.price > 0 && (
                                          <span className="cormorant text-[#D4AF37]/60 text-sm">
                                            ₩{order.price.toLocaleString()}
                                          </span>
                                        )}
                                        <div className="flex items-center gap-1">
                                          <Star size={11} fill="#D4AF37" stroke="#D4AF37" strokeWidth={1.5} />
                                          <span className="cormorant text-[#D4AF37]/80 text-sm font-bold">{order.rating}/10</span>
                                        </div>
                                      </div>
                                    </div>

                                    {order.acidity > 0 && (
                                      <div className="flex gap-3 flex-wrap">
                                        {[
                                          { label: "산미",   val: order.acidity,            color: "#7EC8E3" },
                                          { label: "바디",   val: order.body,               color: "#C8A97E" },
                                          { label: "단맛",   val: order.sweetness,          color: "#D4AF37" },
                                          { label: "고소함", val: order.nuttiness ?? 0,     color: "#A8C97E" },
                                          { label: "향미",   val: order.aroma     ?? 0,     color: "#E3A8E0" },
                                          { label: "균형감", val: order.balance   ?? 0,     color: "#7EC8C8" },
                                        ].filter(t => t.val > 0).map((t, ti) => (
                                          <div key={ti} className="flex items-center gap-2 min-w-[80px]">
                                            <span className="cormorant text-[#FCF5E5]/40 text-xs w-10">{t.label}</span>
                                            <div className="flex-1 h-1.5 bg-white/8 rounded-full overflow-hidden w-12">
                                              <div className="h-full rounded-full" style={{ width: `${(t.val / 5) * 100}%`, backgroundColor: t.color }} />
                                            </div>
                                            <span className="cormorant text-[#FCF5E5]/50 text-xs">{t.val}</span>
                                          </div>
                                        ))}
                                      </div>
                                    )}

                                    {order.images && order.images.length > 0 && (
                                      <div className="grid grid-cols-3 gap-2">
                                        {order.images.map((img, i) => (
                                          <div key={i} className="aspect-square rounded-lg overflow-hidden border border-[#D4AF37]/10">
                                            <img
                                              src={img}
                                              alt=""
                                              className="w-full h-full object-cover cursor-pointer"
                                              onClick={() => setLightboxUrl(img)}
                                            />
                                          </div>
                                        ))}
                                      </div>
                                    )}

                                    {order.memo && (
                                      <p className="cormorant text-[#FCF5E5]/50 text-sm italic leading-relaxed">
                                        {order.memo}
                                      </p>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* 주문한 다른 메뉴 */}
                  {recordVisits.some(v => (otherItemsByVisit[v.id] || []).length > 0) && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-1.5">
                        <UtensilsCrossed size={13} className="text-[#D4AF37]/40" />
                        <span className="cormorant text-[#D4AF37]/60 text-xs uppercase tracking-wider">주문한 다른 메뉴</span>
                      </div>
                      <div className="space-y-4 pl-5">
                        {recordVisits.map(visit => {
                          const visitOtherItems = otherItemsByVisit[visit.id] || [];
                          if (visitOtherItems.length === 0) return null;
                          return (
                            <div key={visit.id} className="space-y-3">
                              <span className="cormorant text-[#FCF5E5]/30 text-xs">{visit.date}</span>
                              <div className="space-y-3">
                                {visitOtherItems.map(item => (
                                  <div key={item.id} className="border border-[#D4AF37]/10 rounded-xl p-4 bg-[#1a0f0a]/30 space-y-3">
                                    <div className="flex items-center justify-between flex-wrap gap-2">
                                      <span className="playfair text-[#FCF5E5] font-bold text-sm">{item.name}</span>
                                      <div className="flex items-center gap-3">
                                        {item.price > 0 && (
                                          <span className="cormorant text-[#D4AF37]/60 text-sm">
                                            ₩{item.price.toLocaleString()}
                                          </span>
                                        )}
                                        <div className="flex items-center gap-0.5">
                                          {[1,2,3,4,5].map(n => (
                                            <Star key={n} size={11}
                                              fill={item.rating >= n ? "#D4AF37" : "none"}
                                              stroke="#D4AF37"
                                              strokeWidth={1.5}
                                            />
                                          ))}
                                        </div>
                                      </div>
                                    </div>

                                    {item.images && item.images.length > 0 && (
                                      <div className="grid grid-cols-3 gap-2">
                                        {item.images.map((img, i) => (
                                          <div key={i} className="aspect-square rounded-lg overflow-hidden border border-[#D4AF37]/10">
                                            <img
                                              src={img}
                                              alt=""
                                              className="w-full h-full object-cover cursor-pointer"
                                              onClick={() => setLightboxUrl(img)}
                                            />
                                          </div>
                                        ))}
                                      </div>
                                    )}

                                    {item.memo && (
                                      <p className="cormorant text-[#FCF5E5]/50 text-sm italic leading-relaxed">
                                        {item.memo}
                                      </p>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {lightboxUrl && <PhotoLightbox url={lightboxUrl} onClose={() => setLightboxUrl(null)} />}

      <footer className="w-full py-8 text-center border-t border-[#D4AF37]/15 mt-8">
        <p className="cormorant text-[#FCF5E5]/25 tracking-widest text-sm uppercase">
          © 2026 Coffee Atlas · All rights reserved
        </p>
      </footer>
    </div>
  );
}

export default function CafeDetailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen cafe-bg flex items-center justify-center">
        <div className="cormorant text-[#FCF5E5]/30 text-xl">불러오는 중...</div>
      </div>
    }>
      <CafeDetailContent />
    </Suspense>
  );
}
