"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { auth, db, storage } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { ref as dbRef, onValue, update } from "firebase/database";
import { ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";

const ADMIN_EMAILS = ["doin25@gmail.com", "loyalcupid@naver.com"];
import {
  Home, Camera, Plus, Trash2, Send, Users, MapPin, Coffee, Clock, BookOpen, ChevronLeft
} from "lucide-react";

interface HistoryItem { year: string; event: string; }
interface MenuItem { name: string; description: string; features: string; photo: string; }
interface BaristaInfo { name: string; career: string; bio: string; photo: string; }

const inputCls = "w-full px-4 py-3 rounded-xl bg-white/5 border border-[#D4AF37]/20 text-[#FCF5E5] placeholder-[#FCF5E5]/25 focus:outline-none focus:border-[#D4AF37]/40 focus:ring-1 focus:ring-[#D4AF37]/20 transition-all text-sm";

function Section({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="border border-[#D4AF37]/20 rounded-2xl p-7 bg-[#1a0f0a]/50 space-y-5">
      <h2 className="cormorant text-xs text-[#D4AF37]/60 uppercase tracking-[0.3em] border-b border-[#D4AF37]/15 pb-3 flex items-center gap-2">
        {icon}{title}
      </h2>
      {children}
    </div>
  );
}

function FieldLabel({ icon, text, required }: { icon: React.ReactNode; text: string; required?: boolean }) {
  return (
    <label className="text-xs font-bold text-[#FCF5E5]/50 uppercase tracking-widest flex items-center gap-1.5">
      {icon}{text}{required && <span className="text-red-400 ml-0.5">*</span>}
    </label>
  );
}

export default function EditExpertCafePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [dataLoaded, setDataLoaded] = useState(false);
  const [adminUid, setAdminUid] = useState("");

  /* ── 관리자 전용 가드 ── */
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (!u || !ADMIN_EMAILS.includes(u.email ?? "")) router.replace("/");
      else setAdminUid(u.uid);
    });
    return () => unsub();
  }, [router]);

  const [cafeName, setCafeName] = useState("");
  const [cafePhotos, setCafePhotos] = useState<string[]>([]);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const photoInputRef = useRef<HTMLInputElement>(null);

  const [barista, setBarista] = useState<BaristaInfo>({ name: "", career: "", bio: "", photo: "" });
  const [uploadingBarista, setUploadingBarista] = useState(false);
  const baristaInputRef = useRef<HTMLInputElement>(null);

  const [history, setHistory] = useState<HistoryItem[]>([{ year: "", event: "" }]);

  const [menus, setMenus] = useState<MenuItem[]>([{ name: "", description: "", features: "", photo: "" }]);
  const menuPhotoRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [uploadingMenu, setUploadingMenu] = useState<number | null>(null);

  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");
  const [addressDetail, setAddressDetail] = useState("");
  const [loading, setLoading] = useState(false);

  /* ── 기존 데이터 로드 ── */
  useEffect(() => {
    const unsub = onValue(dbRef(db, `expertCafes/${id}`), (snap) => {
      if (!snap.exists()) { router.push("/expert-tour"); return; }
      const data = snap.val();
      setCafeName(data.name || "");
      setCafePhotos(data.photos || []);
      setBarista(data.barista || { name: "", career: "", bio: "", photo: "" });
      setHistory(data.history?.length ? data.history : [{ year: "", event: "" }]);
      setMenus(data.signatureMenus?.length ? data.signatureMenus : [{ name: "", description: "", features: "", photo: "" }]);
      setDescription(data.description || "");
      setAddress(data.location?.address || "");
      setAddressDetail(data.location?.detail || "");
      setDataLoaded(true);
    }, { onlyOnce: true });
    return () => unsub();
  }, [id, router]);

  const uploadImage = async (file: File, path: string): Promise<string> => {
    const ext = file.name.split(".").pop();
    const fullPath = `uploads/${adminUid}/expertCafes/${path}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const sRef = storageRef(storage, fullPath);
    await uploadBytes(sRef, file);
    return getDownloadURL(sRef);
  };

  const handleCafePhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (cafePhotos.length >= 8) { alert("최대 8장까지 가능합니다."); return; }
    setUploadingPhoto(true);
    try {
      const url = await uploadImage(file, "photos");
      setCafePhotos(p => [...p, url]);
    } catch { alert("이미지 업로드에 실패했습니다."); }
    finally { setUploadingPhoto(false); if (photoInputRef.current) photoInputRef.current.value = ""; }
  };

  const handleBaristaPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingBarista(true);
    try {
      const url = await uploadImage(file, "barista");
      setBarista(b => ({ ...b, photo: url }));
    } catch { alert("이미지 업로드에 실패했습니다."); }
    finally { setUploadingBarista(false); if (baristaInputRef.current) baristaInputRef.current.value = ""; }
  };

  const handleMenuPhoto = async (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingMenu(index);
    try {
      const url = await uploadImage(file, "menus");
      setMenus(prev => prev.map((m, i) => i === index ? { ...m, photo: url } : m));
    } catch { alert("이미지 업로드에 실패했습니다."); }
    finally { setUploadingMenu(null); }
  };

  const addHistory = () => setHistory(h => [...h, { year: "", event: "" }]);
  const removeHistory = (i: number) => setHistory(h => h.filter((_, idx) => idx !== i));
  const updateHistory = (i: number, field: keyof HistoryItem, val: string) =>
    setHistory(h => h.map((item, idx) => idx === i ? { ...item, [field]: val } : item));

  const addMenu = () => setMenus(m => [...m, { name: "", description: "", features: "", photo: "" }]);
  const removeMenu = (i: number) => setMenus(m => m.filter((_, idx) => idx !== i));
  const updateMenu = (i: number, field: keyof MenuItem, val: string) =>
    setMenus(m => m.map((item, idx) => idx === i ? { ...item, [field]: val } : item));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cafeName.trim()) { alert("카페 이름을 입력해주세요."); return; }
    setLoading(true);
    try {
      await update(dbRef(db, `expertCafes/${id}`), {
        name: cafeName.trim(),
        photos: cafePhotos,
        barista,
        history: history.filter(h => h.event.trim()),
        signatureMenus: menus.filter(m => m.name.trim()),
        description: description.trim(),
        location: { address: address.trim(), detail: addressDetail.trim() },
      });
      router.push(`/expert-tour/${id}`);
    } catch (err) {
      console.error(err);
      alert("저장 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  if (!dataLoaded) {
    return (
      <div className="min-h-screen cafe-bg flex items-center justify-center">
        <p className="cormorant text-[#FCF5E5]/40 text-xl">불러오는 중...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen cafe-bg">
      {/* Header */}
      <div className="w-full border-b border-[#D4AF37]/20 px-6 py-5">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-[#D4AF37]/60 hover:text-[#D4AF37] transition-colors">
              <Home size={20} />
            </Link>
            <span className="text-[#D4AF37]/30">/</span>
            <Link href="/expert-tour" className="cormorant text-[#D4AF37]/50 hover:text-[#D4AF37] transition-colors text-base flex items-center gap-1.5">
              <Users size={14} /> 커피 고수 탐방
            </Link>
            <span className="text-[#D4AF37]/30">/</span>
            <Link href={`/expert-tour/${id}`} className="cormorant text-[#D4AF37]/50 hover:text-[#D4AF37] transition-colors text-base">
              {cafeName}
            </Link>
            <span className="text-[#D4AF37]/30">/</span>
            <span className="cormorant text-[#FCF5E5]/60 text-base">수정</span>
          </div>
          <Link href={`/expert-tour/${id}`} className="cormorant text-[#FCF5E5]/30 hover:text-[#FCF5E5]/60 transition-colors text-sm flex items-center gap-1">
            <ChevronLeft size={14} /> 취소
          </Link>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-10 space-y-6">
        {/* Title */}
        <div className="text-center space-y-2 mb-8">
          <div className="gold-divider text-[#D4AF37]/50 text-xs tracking-[0.4em] uppercase cormorant">
            Edit Expert Café
          </div>
          <h1 className="playfair text-3xl font-bold text-[#FCF5E5]">카페 정보 수정</h1>
          <p className="cormorant text-[#FCF5E5]/40 text-lg font-light">
            {cafeName}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* ── 1. 카페 이름 & 사진 ── */}
          <Section title="카페 이름 & 사진" icon={<Camera size={15} />}>
            <div className="space-y-4">
              <div className="space-y-2">
                <FieldLabel icon={<Coffee size={14} />} text="카페 이름" required />
                <input
                  type="text"
                  placeholder="카페 이름을 입력하세요"
                  value={cafeName}
                  onChange={e => setCafeName(e.target.value)}
                  required
                  className={inputCls}
                />
              </div>
              <div>
                <FieldLabel icon={<Camera size={14} />} text="카페 사진" />
                <p className="cormorant text-[#FCF5E5]/25 text-sm mb-3 mt-1">카페 분위기를 잘 담은 사진을 올려주세요 · 최대 8장</p>
                <div className="grid grid-cols-4 gap-3">
                  {cafePhotos.map((url, i) => (
                    <div key={i} className="aspect-square rounded-xl overflow-hidden border border-[#D4AF37]/20 relative group">
                      <img src={url} alt={`카페 사진 ${i + 1}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setCafePhotos(p => p.filter((_, idx) => idx !== i))}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 text-[10px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >✕</button>
                    </div>
                  ))}
                  {cafePhotos.length < 8 && (
                    <div
                      onClick={() => photoInputRef.current?.click()}
                      className="aspect-square rounded-xl flex flex-col items-center justify-center gap-1 border-2 border-dashed border-[#D4AF37]/20 cursor-pointer hover:border-[#D4AF37]/40 hover:bg-[#D4AF37]/5 transition-all text-[#FCF5E5]/25 hover:text-[#D4AF37]/50"
                    >
                      <Camera size={20} />
                      <span className="text-[10px]">{uploadingPhoto ? "업로드 중..." : "사진 추가"}</span>
                    </div>
                  )}
                </div>
                <input type="file" accept="image/*" ref={photoInputRef} onChange={handleCafePhoto} className="hidden" />
              </div>
            </div>
          </Section>

          {/* ── 2. 바리스타 소개 ── */}
          <Section title="바리스타 소개" icon={<Users size={15} />}>
            <div className="space-y-4">
              <div className="flex gap-4 items-start">
                <div className="flex-shrink-0">
                  <div
                    onClick={() => baristaInputRef.current?.click()}
                    className="w-24 h-24 rounded-2xl border-2 border-dashed border-[#D4AF37]/20 bg-[#D4AF37]/5 flex flex-col items-center justify-center gap-1 cursor-pointer hover:border-[#D4AF37]/40 hover:bg-[#D4AF37]/10 transition-all text-[#FCF5E5]/25 overflow-hidden"
                  >
                    {barista.photo ? (
                      <img src={barista.photo} alt="바리스타" className="w-full h-full object-cover" />
                    ) : (
                      <>
                        <Camera size={20} />
                        <span className="text-[10px]">{uploadingBarista ? "업로드 중..." : "사진"}</span>
                      </>
                    )}
                  </div>
                  <input type="file" accept="image/*" ref={baristaInputRef} onChange={handleBaristaPhoto} className="hidden" />
                </div>

                <div className="flex-1 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <FieldLabel icon={<Users size={13} />} text="이름" />
                      <input
                        type="text"
                        placeholder="바리스타 이름"
                        value={barista.name}
                        onChange={e => setBarista(b => ({ ...b, name: e.target.value }))}
                        className={inputCls}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <FieldLabel icon={<Clock size={13} />} text="경력" />
                      <input
                        type="text"
                        placeholder="예: 10년차 바리스타"
                        value={barista.career}
                        onChange={e => setBarista(b => ({ ...b, career: e.target.value }))}
                        className={inputCls}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <FieldLabel icon={<BookOpen size={13} />} text="바리스타 소개글" />
                <textarea
                  placeholder="바리스타의 커피 철학, 수상 경력, 전문 분야 등을 소개해주세요."
                  value={barista.bio}
                  onChange={e => setBarista(b => ({ ...b, bio: e.target.value }))}
                  className="w-full h-28 px-4 py-3 rounded-xl bg-white/5 border border-[#D4AF37]/20 text-[#FCF5E5] placeholder-[#FCF5E5]/25 focus:outline-none focus:border-[#D4AF37]/40 transition-all resize-none text-sm"
                />
              </div>
            </div>
          </Section>

          {/* ── 3. 카페 연혁 ── */}
          <Section title="카페 연혁" icon={<Clock size={15} />}>
            <div className="space-y-3">
              {history.map((item, i) => (
                <div key={i} className="flex gap-3 items-center">
                  <input
                    type="text"
                    placeholder="연도"
                    value={item.year}
                    onChange={e => updateHistory(i, "year", e.target.value)}
                    className={`${inputCls} w-24 flex-shrink-0`}
                  />
                  <input
                    type="text"
                    placeholder="예: 카페 오픈, 바리스타 챔피언십 우승..."
                    value={item.event}
                    onChange={e => updateHistory(i, "event", e.target.value)}
                    className={`${inputCls} flex-1`}
                  />
                  {history.length > 1 && (
                    <button type="button" onClick={() => removeHistory(i)} className="text-red-400/60 hover:text-red-400 p-1.5 rounded-lg hover:bg-red-400/10 transition-colors">
                      <Trash2 size={15} />
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={addHistory}
                className="w-full py-2.5 rounded-xl border-2 border-dashed border-[#D4AF37]/15 text-[#FCF5E5]/30 hover:border-[#D4AF37]/30 hover:text-[#D4AF37]/60 transition-all flex items-center justify-center gap-2 text-sm cormorant"
              >
                <Plus size={15} /> 연혁 추가
              </button>
            </div>
          </Section>

          {/* ── 4. 시그니처 메뉴 ── */}
          <Section title="시그니처 메뉴와 커피 특징" icon={<Coffee size={15} />}>
            <div className="space-y-5">
              {menus.map((menu, i) => (
                <div key={i} className="border border-[#D4AF37]/15 rounded-xl p-5 space-y-4 bg-[#1a0f0a]/30">
                  <div className="flex items-center justify-between">
                    <span className="cormorant text-xs text-[#D4AF37]/50 uppercase tracking-widest flex items-center gap-1.5">
                      <Coffee size={12} /> 메뉴 {i + 1}
                    </span>
                    {menus.length > 1 && (
                      <button type="button" onClick={() => removeMenu(i)} className="text-red-400/60 hover:text-red-400 p-1 rounded-lg hover:bg-red-400/10 transition-colors">
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>

                  <div className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div
                        onClick={() => menuPhotoRefs.current[i]?.click()}
                        className="w-20 h-20 rounded-xl border-2 border-dashed border-[#D4AF37]/20 bg-[#D4AF37]/5 flex flex-col items-center justify-center gap-1 cursor-pointer hover:border-[#D4AF37]/40 hover:bg-[#D4AF37]/10 transition-all text-[#FCF5E5]/25 overflow-hidden"
                      >
                        {menu.photo ? (
                          <img src={menu.photo} alt={menu.name} className="w-full h-full object-cover" />
                        ) : (
                          <>
                            <Camera size={18} />
                            <span className="text-[9px]">{uploadingMenu === i ? "업로드중" : "사진"}</span>
                          </>
                        )}
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        ref={el => { menuPhotoRefs.current[i] = el; }}
                        onChange={e => handleMenuPhoto(e, i)}
                        className="hidden"
                      />
                    </div>

                    <div className="flex-1 space-y-3">
                      <div className="space-y-1.5">
                        <FieldLabel icon={<Coffee size={13} />} text="메뉴 이름" />
                        <input
                          type="text"
                          placeholder="예: 싱글 오리진 에스프레소"
                          value={menu.name}
                          onChange={e => updateMenu(i, "name", e.target.value)}
                          className={inputCls}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <FieldLabel icon={<BookOpen size={13} />} text="메뉴 설명" />
                        <input
                          type="text"
                          placeholder="예: 에티오피아 예가체프 원두 사용"
                          value={menu.description}
                          onChange={e => updateMenu(i, "description", e.target.value)}
                          className={inputCls}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <FieldLabel icon={<BookOpen size={13} />} text="커피 특징" />
                    <textarea
                      placeholder="이 커피의 향미, 산미, 바디감, 추출 방식 등 특징을 설명해주세요."
                      value={menu.features}
                      onChange={e => updateMenu(i, "features", e.target.value)}
                      className="w-full h-20 px-4 py-3 rounded-xl bg-white/5 border border-[#D4AF37]/20 text-[#FCF5E5] placeholder-[#FCF5E5]/25 focus:outline-none focus:border-[#D4AF37]/40 transition-all resize-none text-sm"
                    />
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={addMenu}
                className="w-full py-3 rounded-xl border-2 border-dashed border-[#D4AF37]/15 text-[#FCF5E5]/30 hover:border-[#D4AF37]/30 hover:text-[#D4AF37]/60 transition-all flex items-center justify-center gap-2 text-sm cormorant"
              >
                <Plus size={15} /> 메뉴 추가하기
              </button>
            </div>
          </Section>

          {/* ── 5. 카페 설명 ── */}
          <Section title="카페 소개" icon={<BookOpen size={15} />}>
            <div className="space-y-1.5">
              <FieldLabel icon={<BookOpen size={14} />} text="카페에 대한 설명" />
              <textarea
                placeholder="이 카페만의 특별한 이야기, 분위기, 철학, 방문 시 주목할 포인트 등을 자유롭게 작성해주세요."
                value={description}
                onChange={e => setDescription(e.target.value)}
                className="w-full h-40 px-4 py-3 rounded-xl bg-white/5 border border-[#D4AF37]/20 text-[#FCF5E5] placeholder-[#FCF5E5]/25 focus:outline-none focus:border-[#D4AF37]/40 transition-all resize-none text-sm"
              />
            </div>
          </Section>

          {/* ── 6. 카페 위치 ── */}
          <Section title="카페 위치" icon={<MapPin size={15} />}>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <FieldLabel icon={<MapPin size={14} />} text="주소" />
                  <button
                    type="button"
                    onClick={() => {
                      if (address) window.open(`https://map.naver.com/v5/search/${encodeURIComponent(address)}`, "_blank");
                      else alert("주소를 먼저 입력해주세요.");
                    }}
                    className="cormorant text-xs text-[#D4AF37]/50 hover:text-[#D4AF37] flex items-center gap-1 transition-colors"
                  >
                    <MapPin size={11} /> 네이버 지도 검색
                  </button>
                </div>
                <input
                  type="text"
                  placeholder="예: 서울특별시 마포구 연남동 239-13"
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  className={inputCls}
                />
              </div>
              <div className="space-y-1.5">
                <FieldLabel icon={<MapPin size={14} />} text="상세 위치" />
                <input
                  type="text"
                  placeholder="예: 연남동 골목 안쪽 2층, 주차 가능"
                  value={addressDetail}
                  onChange={e => setAddressDetail(e.target.value)}
                  className={inputCls}
                />
              </div>
            </div>
          </Section>

          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-[#D4AF37] text-[#1a0f0a] py-4 rounded-xl text-lg font-bold shadow-xl hover:bg-[#e8c84a] transition-all flex items-center justify-center gap-2 playfair ${loading ? "opacity-70 cursor-not-allowed" : ""}`}
          >
            {loading ? "저장 중..." : <><Send size={20} /> 수정 완료</>}
          </button>
        </form>
      </div>

      <footer className="w-full py-8 text-center border-t border-[#D4AF37]/15 mt-8">
        <p className="cormorant text-[#FCF5E5]/25 tracking-widest text-sm uppercase">
          © 2026 Coffee Atlas · All rights reserved
        </p>
      </footer>
    </div>
  );
}
