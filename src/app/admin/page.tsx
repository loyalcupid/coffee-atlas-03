"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { ref, onValue, remove } from "firebase/database";
import {
  Home, Shield, Users, Coffee, Plus, Trash2,
  Mail, Calendar, ChevronRight,
} from "lucide-react";

const ADMIN_EMAIL = "doin25@gmail.com";

interface UserRecord {
  uid: string;
  email: string;
  displayName: string | null;
  provider: string;
  createdAt: number;
  lastLogin: number;
}

interface ExpertCafe {
  id: string;
  name: string;
  barista: { name: string };
  createdAt: number;
}

function formatDate(ts: number) {
  return new Date(ts).toLocaleDateString("ko-KR", {
    year: "numeric", month: "2-digit", day: "2-digit",
  });
}

export default function AdminPage() {
  const router = useRouter();
  const [authChecked, setAuthChecked] = useState(false);
  const [isAdmin, setIsAdmin]         = useState(false);
  const [users, setUsers]             = useState<UserRecord[]>([]);
  const [cafes, setCafes]             = useState<ExpertCafe[]>([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [cafesLoading, setCafesLoading] = useState(true);

  /* ── 관리자 인증 확인 ── */
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (!u || u.email !== ADMIN_EMAIL) {
        router.replace("/");
        return;
      }
      setIsAdmin(true);
      setAuthChecked(true);
    });
    return () => unsub();
  }, [router]);

  /* ── 데이터 로드 (관리자 확인 후) ── */
  useEffect(() => {
    if (!isAdmin) return;

    const unsubUsers = onValue(ref(db, "users"), (snap) => {
      if (!snap.exists()) { setUsers([]); setUsersLoading(false); return; }
      const data = snap.val() as Record<string, Omit<UserRecord, "uid">>;
      const list = Object.entries(data)
        .map(([uid, val]) => ({ uid, ...val }))
        .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      setUsers(list);
      setUsersLoading(false);
    });

    const unsubCafes = onValue(ref(db, "expertCafes"), (snap) => {
      if (!snap.exists()) { setCafes([]); setCafesLoading(false); return; }
      const data = snap.val() as Record<string, Omit<ExpertCafe, "id">>;
      const list = Object.entries(data)
        .map(([id, val]) => ({ id, ...val }))
        .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      setCafes(list);
      setCafesLoading(false);
    });

    return () => { unsubUsers(); unsubCafes(); };
  }, [isAdmin]);

  const deleteUser = async (uid: string) => {
    if (!confirm("이 회원 기록을 삭제하시겠습니까?")) return;
    await remove(ref(db, `users/${uid}`));
  };

  const deleteCafe = async (id: string) => {
    if (!confirm("이 카페를 삭제하시겠습니까?\n삭제 후 복구할 수 없습니다.")) return;
    await remove(ref(db, `expertCafes/${id}`));
  };

  /* ── 로딩 / 인증 대기 ── */
  if (!authChecked) {
    return (
      <div className="min-h-screen cafe-bg flex items-center justify-center">
        <p className="cormorant text-[#FCF5E5]/30 text-xl tracking-widest">확인 중...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen cafe-bg">

      {/* Header */}
      <div className="w-full border-b border-[#D4AF37]/20 px-6 py-5">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-[#D4AF37]/60 hover:text-[#D4AF37] transition-colors">
              <Home size={20} />
            </Link>
            <span className="text-[#D4AF37]/30">/</span>
            <div className="flex items-center gap-2">
              <Shield size={18} className="text-[#D4AF37]" />
              <h1 className="playfair text-xl font-bold text-[#FCF5E5]">관리자 페이지</h1>
            </div>
          </div>
          <span className="cormorant text-[#D4AF37] text-xs border border-[#D4AF37]/40 bg-[#D4AF37]/10 px-3 py-1 rounded-full tracking-widest uppercase">
            Admin
          </span>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-10 space-y-12">

        {/* Hero */}
        <div className="text-center space-y-3">
          <div className="gold-divider text-[#D4AF37]/40 text-xs tracking-[0.4em] uppercase cormorant">
            Admin Dashboard
          </div>
          <h2 className="cafe-sign-title text-4xl text-[#FCF5E5]">관리자 대시보드</h2>
          <p className="cormorant text-[#FCF5E5]/40 text-lg font-light">
            {ADMIN_EMAIL} 계정으로 로그인됨
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-5">
          <div className="sign-frame rounded-2xl p-8 text-center space-y-3">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-[#D4AF37]/10 border border-[#D4AF37]/30 flex items-center justify-center">
              <Users size={26} className="text-[#D4AF37]" />
            </div>
            <p className="playfair text-5xl font-bold text-[#FCF5E5]">
              {usersLoading ? "—" : users.length}
            </p>
            <p className="cormorant text-[#FCF5E5]/50 text-lg tracking-wide">전체 회원</p>
          </div>
          <div className="sign-frame rounded-2xl p-8 text-center space-y-3">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-[#D4AF37]/10 border border-[#D4AF37]/30 flex items-center justify-center">
              <Coffee size={26} className="text-[#D4AF37]" />
            </div>
            <p className="playfair text-5xl font-bold text-[#FCF5E5]">
              {cafesLoading ? "—" : cafes.length}
            </p>
            <p className="cormorant text-[#FCF5E5]/50 text-lg tracking-wide">등록된 고수 카페</p>
          </div>
        </div>

        {/* ── 회원 관리 ── */}
        <section className="space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="playfair text-2xl font-bold text-[#FCF5E5] flex items-center gap-2">
              <Users size={22} className="text-[#D4AF37]" />
              회원 관리
            </h2>
            <span className="cormorant text-[#FCF5E5]/30 text-sm">{users.length}명</span>
          </div>

          {usersLoading ? (
            <p className="text-center py-12 cormorant text-[#FCF5E5]/30 text-lg">불러오는 중...</p>
          ) : users.length === 0 ? (
            <div className="sign-frame rounded-2xl p-12 text-center space-y-3">
              <Users size={40} className="text-[#D4AF37]/20 mx-auto" />
              <p className="cormorant text-[#FCF5E5]/30 text-lg">아직 가입한 회원이 없습니다.</p>
              <p className="cormorant text-[#FCF5E5]/20 text-sm">회원이 로그인하면 이 목록에 표시됩니다.</p>
            </div>
          ) : (
            <div className="sign-frame rounded-2xl overflow-hidden">
              {/* 헤더 */}
              <div className="hidden md:grid grid-cols-[1.2fr_2fr_0.8fr_1fr_1fr_auto] gap-4 px-6 py-3 border-b border-[#D4AF37]/15 bg-[#D4AF37]/5">
                {["이름", "이메일", "가입 수단", "가입일", "최근 로그인", ""].map((h, i) => (
                  <span key={i} className="cormorant text-[#D4AF37]/60 text-xs uppercase tracking-widest">{h}</span>
                ))}
              </div>

              {users.map((u, idx) => (
                <div
                  key={u.uid}
                  className={`grid grid-cols-1 md:grid-cols-[1.2fr_2fr_0.8fr_1fr_1fr_auto] gap-2 md:gap-4 px-6 py-4 border-b border-[#D4AF37]/10 hover:bg-white/[0.02] transition-colors items-center ${idx === users.length - 1 ? "border-b-0" : ""}`}
                >
                  {/* 이름 */}
                  <span className="cormorant text-[#FCF5E5]/80 text-base font-semibold truncate">
                    {u.displayName || <span className="text-[#FCF5E5]/30 text-sm">이름 없음</span>}
                  </span>

                  {/* 이메일 */}
                  <span className="cormorant text-[#FCF5E5]/60 text-sm truncate flex items-center gap-1.5">
                    <Mail size={12} className="text-[#D4AF37]/40 flex-shrink-0" />
                    {u.email}
                  </span>

                  {/* 가입 수단 */}
                  <span className={`cormorant text-xs px-2.5 py-0.5 rounded-full border w-fit ${
                    u.provider === "google.com"
                      ? "border-blue-500/40 text-blue-300 bg-blue-900/20"
                      : "border-[#D4AF37]/30 text-[#D4AF37]/80 bg-[#D4AF37]/10"
                  }`}>
                    {u.provider === "google.com" ? "Google" : "이메일"}
                  </span>

                  {/* 가입일 */}
                  <span className="cormorant text-[#FCF5E5]/40 text-sm flex items-center gap-1">
                    <Calendar size={11} className="flex-shrink-0 text-[#D4AF37]/30" />
                    {u.createdAt ? formatDate(u.createdAt) : "—"}
                  </span>

                  {/* 최근 로그인 */}
                  <span className="cormorant text-[#FCF5E5]/30 text-sm flex items-center gap-1">
                    <Calendar size={11} className="flex-shrink-0" />
                    {u.lastLogin ? formatDate(u.lastLogin) : "—"}
                  </span>

                  {/* 삭제 */}
                  <button
                    onClick={() => deleteUser(u.uid)}
                    className="text-red-400/30 hover:text-red-400 transition-colors p-1.5 rounded-lg hover:bg-red-400/10"
                    title="회원 삭제"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ── 커피 고수 탐방 관리 ── */}
        <section className="space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="playfair text-2xl font-bold text-[#FCF5E5] flex items-center gap-2">
              <Coffee size={22} className="text-[#D4AF37]" />
              커피 고수 탐방 관리
            </h2>
            <Link
              href="/expert-tour/new"
              className="flex items-center gap-2 bg-[#D4AF37] text-[#1a0f0a] px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-[#e8c84a] transition-all playfair shadow-lg"
            >
              <Plus size={16} /> 카페 등록
            </Link>
          </div>

          {cafesLoading ? (
            <p className="text-center py-12 cormorant text-[#FCF5E5]/30 text-lg">불러오는 중...</p>
          ) : cafes.length === 0 ? (
            <div className="sign-frame rounded-2xl p-12 text-center space-y-4">
              <Coffee size={40} className="text-[#D4AF37]/20 mx-auto" />
              <p className="cormorant text-[#FCF5E5]/30 text-lg">등록된 카페가 없습니다.</p>
              <Link
                href="/expert-tour/new"
                className="inline-flex items-center gap-2 bg-[#D4AF37] text-[#1a0f0a] px-7 py-3 rounded-xl text-sm font-bold hover:bg-[#e8c84a] transition-all playfair"
              >
                <Plus size={16} /> 첫 카페 등록하기
              </Link>
            </div>
          ) : (
            <div className="sign-frame rounded-2xl overflow-hidden">
              <div className="hidden md:grid grid-cols-[2fr_1fr_1fr_auto] gap-4 px-6 py-3 border-b border-[#D4AF37]/15 bg-[#D4AF37]/5">
                {["카페명", "바리스타", "등록일", ""].map((h, i) => (
                  <span key={i} className="cormorant text-[#D4AF37]/60 text-xs uppercase tracking-widest">{h}</span>
                ))}
              </div>

              {cafes.map((cafe, idx) => (
                <div
                  key={cafe.id}
                  className={`grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr_auto] gap-2 md:gap-4 px-6 py-4 border-b border-[#D4AF37]/10 hover:bg-white/[0.02] transition-colors items-center ${idx === cafes.length - 1 ? "border-b-0" : ""}`}
                >
                  <Link
                    href={`/expert-tour/${cafe.id}`}
                    className="playfair text-[#FCF5E5]/80 text-base hover:text-[#D4AF37] transition-colors flex items-center gap-2 group truncate"
                  >
                    {cafe.name}
                    <ChevronRight size={14} className="text-[#D4AF37]/30 group-hover:text-[#D4AF37] flex-shrink-0" />
                  </Link>
                  <span className="cormorant text-[#FCF5E5]/50 text-sm truncate">
                    {cafe.barista?.name || "—"}
                  </span>
                  <span className="cormorant text-[#FCF5E5]/40 text-sm flex items-center gap-1">
                    <Calendar size={11} className="flex-shrink-0 text-[#D4AF37]/30" />
                    {cafe.createdAt ? formatDate(cafe.createdAt) : "—"}
                  </span>
                  <button
                    onClick={() => deleteCafe(cafe.id)}
                    className="text-red-400/30 hover:text-red-400 transition-colors p-1.5 rounded-lg hover:bg-red-400/10"
                    title="카페 삭제"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

      </div>

      <footer className="w-full py-10 text-center border-t border-[#D4AF37]/15 mt-10">
        <p className="cormorant text-[#FCF5E5]/30 tracking-widest text-sm uppercase">
          © 2026 Coffee Atlas &nbsp;·&nbsp; Admin Dashboard
        </p>
      </footer>
    </div>
  );
}
