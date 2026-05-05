"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/firebase";
import { ref, onValue } from "firebase/database";
import { Home, MapPin, Users, Coffee, Clock, BookOpen, ChevronLeft, ExternalLink } from "lucide-react";

interface ExpertCafe {
  id: string;
  name: string;
  photos: string[];
  barista: { name: string; career: string; bio: string; photo: string };
  history: { year: string; event: string }[];
  signatureMenus: { name: string; description: string; features: string; photo: string }[];
  description: string;
  location: { address: string; detail: string };
  createdAt: number;
}

export default function ExpertCafeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [cafe, setCafe] = useState<ExpertCafe | null>(null);
  const [loading, setLoading] = useState(true);
  const [activePhoto, setActivePhoto] = useState(0);

  useEffect(() => {
    const unsubscribe = onValue(ref(db, `expertCafes/${id}`), (snap) => {
      if (!snap.exists()) { router.push("/expert-tour"); return; }
      setCafe({ id, ...snap.val() } as ExpertCafe);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [id, router]);

  if (loading) {
    return (
      <div className="min-h-screen cafe-bg flex items-center justify-center">
        <p className="cormorant text-[#FCF5E5]/40 text-xl">불러오는 중...</p>
      </div>
    );
  }

  if (!cafe) return null;

  const photos = cafe.photos || [];
  const history = (cafe.history || []).filter(h => h.event?.trim());
  const menus = (cafe.signatureMenus || []).filter(m => m.name?.trim());

  return (
    <div className="min-h-screen cafe-bg">
      {/* Top nav */}
      <div className="w-full border-b border-[#D4AF37]/20 px-6 py-5">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-[#D4AF37]/40 hover:text-[#D4AF37] transition-colors">
              <Home size={18} />
            </Link>
            <span className="text-[#D4AF37]/20">/</span>
            <Link href="/expert-tour" className="cormorant text-[#D4AF37]/50 hover:text-[#D4AF37] transition-colors text-base flex items-center gap-1.5">
              <Users size={14} /> 커피 고수 탐방
            </Link>
            <span className="text-[#D4AF37]/20">/</span>
            <span className="cormorant text-[#FCF5E5]/60 text-base">{cafe.name}</span>
          </div>
          <Link href="/expert-tour" className="flex items-center gap-1.5 text-[#D4AF37]/50 hover:text-[#D4AF37] transition-colors text-sm cormorant">
            <ChevronLeft size={16} /> 목록으로
          </Link>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-10 space-y-10">

        {/* ── 1. 카페 이름 & 사진 갤러리 ── */}
        <section>
          {/* Cafe title */}
          <div className="text-center mb-8 space-y-3">
            <p className="cormorant text-[#D4AF37]/50 tracking-[0.4em] text-sm uppercase">Expert Café</p>
            <h1 className="cafe-sign-title text-5xl md:text-6xl text-[#FCF5E5]">{cafe.name}</h1>
            <div className="gold-divider w-full max-w-sm mx-auto text-[#D4AF37]/40 text-xs tracking-[0.3em] uppercase cormorant">
              ✦ Coffee Masters ✦
            </div>
          </div>

          {photos.length > 0 && (
            <div className="space-y-3">
              {/* Main photo */}
              <div className="aspect-video rounded-2xl overflow-hidden border border-[#D4AF37]/20 shadow-2xl">
                <img
                  src={photos[activePhoto]}
                  alt={`${cafe.name} 사진 ${activePhoto + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
              {/* Thumbnails */}
              {photos.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {photos.map((url, i) => (
                    <button
                      key={i}
                      onClick={() => setActivePhoto(i)}
                      className={`flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${
                        i === activePhoto ? "border-[#D4AF37]" : "border-transparent opacity-50 hover:opacity-80"
                      }`}
                    >
                      <img src={url} alt={`썸네일 ${i + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </section>

        {/* ── 2. 바리스타 소개 ── */}
        {cafe.barista?.name && (
          <section className="border border-[#D4AF37]/20 rounded-2xl p-8 bg-[#1a0f0a]/40">
            <SectionLabel icon={<Users size={16} />} text="바리스타 소개" />
            <div className="flex gap-6 items-start mt-5">
              {cafe.barista.photo && (
                <div className="flex-shrink-0 w-24 h-24 rounded-2xl overflow-hidden border border-[#D4AF37]/30 shadow-lg">
                  <img src={cafe.barista.photo} alt={cafe.barista.name} className="w-full h-full object-cover" />
                </div>
              )}
              <div className="flex-1 space-y-2">
                <div>
                  <h2 className="playfair text-2xl font-bold text-[#FCF5E5]">{cafe.barista.name}</h2>
                  {cafe.barista.career && (
                    <p className="cormorant text-[#D4AF37]/70 text-base">{cafe.barista.career}</p>
                  )}
                </div>
                {cafe.barista.bio && (
                  <p className="cormorant text-[#FCF5E5]/60 text-lg leading-relaxed font-light">{cafe.barista.bio}</p>
                )}
              </div>
            </div>
          </section>
        )}

        {/* ── 3. 카페 연혁 ── */}
        {history.length > 0 && (
          <section className="border border-[#D4AF37]/20 rounded-2xl p-8 bg-[#1a0f0a]/40">
            <SectionLabel icon={<Clock size={16} />} text="카페 연혁" />
            <div className="mt-5 space-y-0">
              {history
                .sort((a, b) => (parseInt(a.year) || 0) - (parseInt(b.year) || 0))
                .map((item, i) => (
                  <div key={i} className="flex gap-5 group">
                    {/* Timeline line */}
                    <div className="flex flex-col items-center">
                      <div className="w-3 h-3 rounded-full bg-[#D4AF37] border-2 border-[#D4AF37]/40 mt-1.5 flex-shrink-0 shadow-[0_0_8px_rgba(212,175,55,0.5)]" />
                      {i < history.length - 1 && <div className="w-px flex-1 bg-[#D4AF37]/20 my-1" />}
                    </div>
                    <div className={`pb-6 ${i < history.length - 1 ? "" : ""}`}>
                      {item.year && (
                        <span className="cormorant text-[#D4AF37] text-sm tracking-widest font-semibold">{item.year}</span>
                      )}
                      <p className="cormorant text-[#FCF5E5]/70 text-lg font-light mt-0.5">{item.event}</p>
                    </div>
                  </div>
                ))}
            </div>
          </section>
        )}

        {/* ── 4. 시그니처 메뉴 ── */}
        {menus.length > 0 && (
          <section>
            <div className="border border-[#D4AF37]/20 rounded-2xl p-8 bg-[#1a0f0a]/40">
              <SectionLabel icon={<Coffee size={16} />} text="시그니처 메뉴와 커피 특징" />
              <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
                {menus.map((menu, i) => (
                  <div key={i} className="border border-[#D4AF37]/15 rounded-xl p-5 bg-[#1a0f0a]/30 space-y-3">
                    <div className="flex gap-4 items-start">
                      {menu.photo && (
                        <div className="w-16 h-16 rounded-xl overflow-hidden border border-[#D4AF37]/20 flex-shrink-0">
                          <img src={menu.photo} alt={menu.name} className="w-full h-full object-cover" />
                        </div>
                      )}
                      <div className="flex-1">
                        <h3 className="playfair text-lg font-bold text-[#FCF5E5]">{menu.name}</h3>
                        {menu.description && (
                          <p className="cormorant text-[#D4AF37]/60 text-base">{menu.description}</p>
                        )}
                      </div>
                    </div>
                    {menu.features && (
                      <p className="cormorant text-[#FCF5E5]/50 text-base leading-relaxed border-t border-[#D4AF37]/10 pt-3 font-light">
                        {menu.features}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ── 5. 카페 설명 ── */}
        {cafe.description && (
          <section className="border border-[#D4AF37]/20 rounded-2xl p-8 bg-[#1a0f0a]/40">
            <SectionLabel icon={<BookOpen size={16} />} text="카페 소개" />
            <p className="mt-5 cormorant text-[#FCF5E5]/65 text-xl leading-relaxed font-light whitespace-pre-wrap">
              {cafe.description}
            </p>
          </section>
        )}

        {/* ── 6. 카페 위치 ── */}
        {cafe.location?.address && (
          <section className="border border-[#D4AF37]/20 rounded-2xl p-8 bg-[#1a0f0a]/40">
            <SectionLabel icon={<MapPin size={16} />} text="카페 위치" />
            <div className="mt-5 space-y-3">
              <div className="flex items-start gap-3">
                <MapPin size={18} className="text-[#D4AF37]/60 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="cormorant text-[#FCF5E5]/80 text-xl">{cafe.location.address}</p>
                  {cafe.location.detail && (
                    <p className="cormorant text-[#FCF5E5]/45 text-base mt-0.5">{cafe.location.detail}</p>
                  )}
                </div>
              </div>
              <a
                href={`https://map.naver.com/v5/search/${encodeURIComponent(cafe.location.address)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm cormorant text-[#D4AF37]/60 hover:text-[#D4AF37] transition-colors border border-[#D4AF37]/20 hover:border-[#D4AF37]/40 rounded-lg px-4 py-2"
              >
                <ExternalLink size={14} /> 네이버 지도에서 보기
              </a>
            </div>
          </section>
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

function SectionLabel({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex items-center gap-2 text-[#D4AF37]/70">
      {icon}
      <span className="cormorant tracking-[0.3em] text-sm uppercase">{text}</span>
      <div className="flex-1 h-px bg-[#D4AF37]/15 ml-2" />
    </div>
  );
}
