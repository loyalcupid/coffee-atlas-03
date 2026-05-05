"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { db } from "@/lib/firebase";
import { ref, onValue } from "firebase/database";
import { Users, Plus, MapPin, ChevronRight, Home } from "lucide-react";

interface ExpertCafe {
  id: string;
  name: string;
  photos: string[];
  barista: { name: string; career: string };
  location: { address: string };
  description: string;
  createdAt: number;
}

export default function ExpertTourPage() {
  const [cafes, setCafes] = useState<ExpertCafe[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onValue(ref(db, "expertCafes"), (snap) => {
      if (!snap.exists()) { setCafes([]); setLoading(false); return; }
      const data = snap.val() as Record<string, Omit<ExpertCafe, "id">>;
      const list = Object.entries(data)
        .map(([id, val]) => ({ id, ...val }))
        .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      setCafes(list);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="min-h-screen cafe-bg">
      {/* Header */}
      <div className="w-full border-b border-[#D4AF37]/20 px-6 py-5">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-[#D4AF37]/60 hover:text-[#D4AF37] transition-colors">
              <Home size={20} />
            </Link>
            <span className="text-[#D4AF37]/30">/</span>
            <div className="flex items-center gap-2">
              <Users size={18} className="text-[#D4AF37]" />
              <h1 className="playfair text-xl font-bold text-[#FCF5E5]">커피 고수 탐방</h1>
            </div>
          </div>
          <Link
            href="/expert-tour/new"
            className="flex items-center gap-2 bg-[#D4AF37] text-[#1a0f0a] px-5 py-2.5 rounded-lg text-sm font-bold hover:bg-[#e8c84a] transition-all"
          >
            <Plus size={16} /> 카페 등록
          </Link>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-12">
        {/* Section label */}
        <div className="gold-divider text-[#D4AF37]/50 text-xs tracking-[0.4em] uppercase cormorant mb-10">
          Expert Cafés Collection
        </div>

        <p className="cormorant text-[#FCF5E5]/50 text-lg text-center mb-12 font-light">
          커피 고수들이 직접 소개하는 특별한 카페들을 만나보세요.
        </p>

        {loading ? (
          <div className="text-center py-24 text-[#FCF5E5]/30 cormorant text-xl">불러오는 중...</div>
        ) : cafes.length === 0 ? (
          <div className="text-center py-24 space-y-6">
            <Users size={48} className="mx-auto text-[#D4AF37]/20" />
            <p className="playfair text-[#FCF5E5]/40 text-xl">아직 등록된 카페가 없습니다.</p>
            <p className="cormorant text-[#FCF5E5]/25 text-lg">첫 번째 커피 고수 카페를 등록해보세요.</p>
            <Link
              href="/expert-tour/new"
              className="inline-flex items-center gap-2 bg-[#D4AF37] text-[#1a0f0a] px-8 py-3 rounded-lg font-bold hover:bg-[#e8c84a] transition-all playfair"
            >
              <Plus size={18} /> 첫 카페 등록하기
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {cafes.map((cafe) => (
              <Link key={cafe.id} href={`/expert-tour/${cafe.id}`} className="group block">
                <div className="border border-[#D4AF37]/20 rounded-2xl overflow-hidden hover:border-[#D4AF37]/50 transition-all bg-[#1a0f0a]/60 hover:bg-[#1a0f0a]/80">
                  {/* Thumbnail */}
                  <div className="aspect-video bg-[#3D2B1F]/30 relative overflow-hidden">
                    {cafe.photos?.[0] ? (
                      <img
                        src={cafe.photos[0]}
                        alt={cafe.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Users size={40} className="text-[#D4AF37]/20" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#1a0f0a]/80 via-transparent to-transparent" />
                  </div>

                  {/* Info */}
                  <div className="p-6 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h2 className="playfair text-xl font-bold text-[#FCF5E5] group-hover:text-[#D4AF37] transition-colors">
                          {cafe.name}
                        </h2>
                        {cafe.barista?.name && (
                          <p className="cormorant text-[#D4AF37]/70 text-base mt-0.5">
                            바리스타 {cafe.barista.name}
                            {cafe.barista.career && <span className="text-[#FCF5E5]/30"> · {cafe.barista.career}</span>}
                          </p>
                        )}
                      </div>
                      <ChevronRight size={18} className="text-[#D4AF37]/40 group-hover:text-[#D4AF37] group-hover:translate-x-1 transition-all flex-shrink-0 mt-1" />
                    </div>

                    {cafe.location?.address && (
                      <div className="flex items-center gap-1.5 text-[#FCF5E5]/35 cormorant text-sm">
                        <MapPin size={13} />
                        <span>{cafe.location.address}</span>
                      </div>
                    )}

                    {cafe.description && (
                      <p className="cormorant text-[#FCF5E5]/40 text-base leading-snug line-clamp-2">
                        {cafe.description}
                      </p>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <footer className="w-full py-8 text-center border-t border-[#D4AF37]/15 mt-auto">
        <p className="cormorant text-[#FCF5E5]/25 tracking-widest text-sm uppercase">
          © 2026 Coffee Atlas · All rights reserved
        </p>
      </footer>
    </div>
  );
}
