"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { Map, Star, Users, BookOpen, ScrollText, LogIn, LogOut } from "lucide-react";

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setAuthLoading(false);
    });
    return () => unsub();
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center cafe-bg">

      {/* Auth bar */}
      <div className="w-full border-b border-[#D4AF37]/10 px-6 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-end gap-3">
          {!authLoading && (
            user ? (
              <div className="flex items-center gap-3">
                <span className="cormorant text-[#FCF5E5]/40 text-sm">
                  {user.displayName || user.email}
                </span>
                <button
                  onClick={() => signOut(auth)}
                  className="flex items-center gap-1.5 cormorant text-[#FCF5E5]/40 hover:text-[#D4AF37] transition-colors text-sm"
                >
                  <LogOut size={14} /> 로그아웃
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="flex items-center gap-1.5 cormorant text-[#FCF5E5]/40 hover:text-[#D4AF37] transition-colors text-sm"
              >
                <LogIn size={14} /> 로그인
              </Link>
            )
          )}
        </div>
      </div>

      {/* Hero Section */}
      <section className="w-full max-w-6xl px-6 py-24 flex flex-col items-center text-center space-y-10">

        {/* Top label */}
        <div className="cormorant text-[#D4AF37]/70 tracking-[0.3em] text-sm uppercase">
          Est. 2026 &nbsp;·&nbsp; Seoul, Korea
        </div>

        {/* Cafe Signboard */}
        <div className="sign-frame rounded-2xl px-12 py-12 md:px-20 md:py-16 flex flex-col items-center space-y-6 w-full max-w-3xl">

          {/* Top ornament */}
          <div className="gold-divider w-full text-[#D4AF37]/60 text-xs tracking-[0.4em] uppercase cormorant">
            ✦ The Original ✦
          </div>

          {/* Main title */}
          <div className="space-y-2">
            <p className="cormorant text-[#D4AF37]/60 tracking-[0.5em] text-base uppercase">
              당신의 커피 취향을 기록하다
            </p>
            <h1 className="cafe-sign-title text-6xl md:text-8xl text-[#FCF5E5] leading-none">
              Coffee
            </h1>
            <h1 className="cafe-sign-title cafe-sign-accent text-6xl md:text-8xl leading-none">
              Atlas
            </h1>
          </div>

          {/* Bottom ornament */}
          <div className="gold-divider w-full text-[#D4AF37]/60 text-xs tracking-[0.4em] uppercase cormorant">
            ✦ Since 2026 ✦
          </div>

          {/* Subtitle */}
          <p className="cormorant text-[#FCF5E5]/60 text-xl md:text-2xl leading-relaxed max-w-lg font-light">
            어떤 카페가 좋았나요? 그날의 향기와 맛을 기록하고,<br />
            당신만의 특별한 커피 취향을 지도로 만들어보세요.
          </p>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-2">
            <Link
              href="/add-record"
              className="playfair bg-[#D4AF37] text-[#1a0f0a] px-10 py-4 rounded-lg text-base font-bold tracking-wide shadow-xl hover:bg-[#e8c84a] transition-all hover:-translate-y-0.5 text-center"
            >
              카페 방문 기록 남기기
            </Link>
            <Link
              href="/dashboard"
              className="playfair bg-transparent border border-[#D4AF37]/50 text-[#D4AF37] px-10 py-4 rounded-lg text-base font-bold tracking-wide hover:bg-[#D4AF37]/10 transition-all text-center"
            >
              나의 커피 취향 분석
            </Link>
          </div>
        </div>
      </section>

      {/* My Cafe Story Banner */}
      <section className="w-full max-w-6xl px-6 pb-10">
        <Link href="/records" className="group block w-full">
          <div className="relative flex items-center justify-between rounded-2xl border border-[#D4AF37]/30 bg-[#D4AF37]/5 hover:bg-[#D4AF37]/10 transition-all px-10 py-8 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-[#D4AF37]/0 via-[#D4AF37]/5 to-[#D4AF37]/0 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="flex items-center gap-6">
              <div className="w-14 h-14 border border-[#D4AF37]/50 bg-[#D4AF37]/15 text-[#D4AF37] rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                <ScrollText size={26} />
              </div>
              <div className="text-left">
                <p className="cormorant text-[#D4AF37]/60 text-sm tracking-[0.3em] uppercase mb-1">My Collection</p>
                <h2 className="playfair text-2xl font-bold text-[#FCF5E5] group-hover:text-[#D4AF37] transition-colors">나의 카페 스토리</h2>
                <p className="cormorant text-[#FCF5E5]/45 text-lg font-light mt-1">
                  내가 기록한 모든 카페 방문 이야기를 한곳에서 만나보세요.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-[#D4AF37]/60 group-hover:text-[#D4AF37] transition-colors flex-shrink-0 ml-6">
              <span className="cormorant text-base tracking-widest hidden sm:block">둘러보기</span>
              <span className="text-xl group-hover:translate-x-1 transition-transform inline-block">→</span>
            </div>
          </div>
        </Link>
      </section>

      {/* Features Section */}
      <section className="w-full py-20 border-t border-[#D4AF37]/15">
        <div className="max-w-6xl mx-auto px-6">
          <div className="gold-divider text-[#D4AF37]/50 text-xs tracking-[0.4em] uppercase cormorant mb-16">
            Our Features
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 text-center">
            <Link href="/map" className="space-y-4 flex flex-col items-center group cursor-pointer">
              <div className="w-16 h-16 border border-[#D4AF37]/40 bg-[#D4AF37]/10 text-[#D4AF37] rounded-2xl flex items-center justify-center shadow-lg group-hover:bg-[#D4AF37]/20 group-hover:scale-110 transition-all">
                <Map size={28} />
              </div>
              <h3 className="playfair text-xl font-bold text-[#FCF5E5] group-hover:text-[#D4AF37] transition-colors">나의 카페 지도</h3>
              <p className="cormorant text-[#FCF5E5]/50 text-lg font-light leading-snug">
                내가 다녀온 카페들을<br />지도에서 한눈에 확인하세요.
              </p>
            </Link>

            <Link href="/reputation" className="space-y-4 flex flex-col items-center group cursor-pointer">
              <div className="w-16 h-16 border border-[#D4AF37]/40 bg-[#D4AF37]/10 text-[#D4AF37] rounded-2xl flex items-center justify-center shadow-lg group-hover:bg-[#D4AF37]/20 group-hover:scale-110 transition-all">
                <Star size={28} />
              </div>
              <h3 className="playfair text-xl font-bold text-[#FCF5E5] group-hover:text-[#D4AF37] transition-colors">전국 카페 평판</h3>
              <p className="cormorant text-[#FCF5E5]/50 text-lg font-light leading-snug">
                전국 카페들의 실제 방문<br />후기와 평점을 확인하세요.
              </p>
            </Link>

            <Link href="/expert-tour" className="space-y-4 flex flex-col items-center group cursor-pointer">
              <div className="w-16 h-16 border border-[#D4AF37]/40 bg-[#D4AF37]/10 text-[#D4AF37] rounded-2xl flex items-center justify-center shadow-lg group-hover:bg-[#D4AF37]/20 group-hover:scale-110 transition-all">
                <Users size={28} />
              </div>
              <h3 className="playfair text-xl font-bold text-[#FCF5E5] group-hover:text-[#D4AF37] transition-colors">커피 고수 탐방</h3>
              <p className="cormorant text-[#FCF5E5]/50 text-lg font-light leading-snug">
                전문가들의 추천 카페와<br />브루잉 노하우를 만나보세요.
              </p>
            </Link>

            <Link href="/dashboard" className="space-y-4 flex flex-col items-center group cursor-pointer">
              <div className="w-16 h-16 border border-[#D4AF37]/40 bg-[#D4AF37]/10 text-[#D4AF37] rounded-2xl flex items-center justify-center shadow-lg group-hover:bg-[#D4AF37]/20 group-hover:scale-110 transition-all">
                <BookOpen size={28} />
              </div>
              <h3 className="playfair text-xl font-bold text-[#FCF5E5] group-hover:text-[#D4AF37] transition-colors">커피 취향 분석</h3>
              <p className="cormorant text-[#FCF5E5]/50 text-lg font-light leading-snug">
                나의 커피 취향을<br />데이터로 분석해보세요.
              </p>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full py-10 text-center border-t border-[#D4AF37]/15 mt-auto">
        <p className="cormorant text-[#FCF5E5]/30 tracking-widest text-sm uppercase">
          © 2026 Coffee Atlas &nbsp;·&nbsp; All rights reserved
        </p>
      </footer>
    </div>
  );
}
