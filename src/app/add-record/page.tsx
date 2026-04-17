"use client";

import { useState, useRef } from "react";
import { Coffee, MapPin, Calendar, Star, Send, Home, Camera } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function AddRecord() {
    const router = useRouter();

    // Cafe info
    const [name, setName] = useState("");
    const [location, setLocation] = useState("");
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

    // Coffee order
    const [drink, setDrink] = useState("");
    const [price, setPrice] = useState<number | "">("");
    const [coffeeRating, setCoffeeRating] = useState(3);
    const [acidity, setAcidity] = useState(3);
    const [body, setBody] = useState(3);
    const [sweetness, setSweetness] = useState(3);
    const [coffeeMemo, setCoffeeMemo] = useState("");

    // Atmosphere
    const [atmosphereImages, setAtmosphereImages] = useState<string[]>([]);
    const [uploadingImage, setUploadingImage] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Overall review
    const [cafeRating, setCafeRating] = useState(3);
    const [overallMemo, setOverallMemo] = useState("");

    const [loading, setLoading] = useState(false);

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (atmosphereImages.length >= 10) { alert('최대 10장까지 가능합니다.'); return; }
        setUploadingImage(true);
        try {
            const ext = file.name.split('.').pop();
            const path = `temp-${Date.now()}/${Math.random().toString(36).slice(2)}.${ext}`;
            const { error } = await supabase.storage.from('cafe_images').upload(path, file);
            if (error) throw error;
            const { data: { publicUrl } } = supabase.storage.from('cafe_images').getPublicUrl(path);
            setAtmosphereImages(prev => [...prev, publicUrl]);
        } catch (err) {
            console.error(err);
            alert('이미지 업로드에 실패했습니다.');
        } finally {
            setUploadingImage(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { data: recordData, error: recordError } = await supabase
                .from('records')
                .insert([{
                    name,
                    location,
                    rating: cafeRating,
                    atmosphere_images: atmosphereImages,
                    overall_memo: overallMemo,
                }])
                .select()
                .execute();

            if (recordError || !recordData?.[0]) throw recordError ?? new Error('record 생성 실패');

            const { data: visitData, error: visitError } = await supabase
                .from('visits')
                .insert([{ record_id: recordData[0].id, date }])
                .select()
                .execute();

            if (visitError || !visitData?.[0]) throw visitError ?? new Error('visit 생성 실패');

            const { error: orderError } = await supabase
                .from('orders')
                .insert([{
                    visit_id: visitData[0].id,
                    drink_name: drink,
                    price: price || 0,
                    rating: coffeeRating,
                    acidity,
                    body,
                    sweetness,
                    memo: coffeeMemo,
                }])
                .execute();

            if (orderError) throw orderError;
            router.push('/records');
        } catch (err) {
            console.error(err);
            alert('기록 저장 중 오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-coffee-cream/30 p-6 md:p-12">
            <div className="max-w-3xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/" className="p-2 hover:bg-coffee-brown/5 rounded-full transition-colors text-coffee-brown">
                            <Home size={24} />
                        </Link>
                        <h1 className="text-3xl font-bold text-coffee-brown">커피 기록하기</h1>
                    </div>
                    <Link href="/records" className="text-coffee-brown/50 hover:text-coffee-brown transition-colors text-sm">
                        취소
                    </Link>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">

                    {/* ── SECTION 1: 카페 정보 ── */}
                    <FormSection title="카페 정보">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <FieldLabel icon={<Coffee size={15} />} text="카페 이름" />
                                    <button
                                        type="button"
                                        onClick={() => {
                                            if (name) window.open(`https://map.naver.com/v5/search/${encodeURIComponent(name)}`, '_blank');
                                            else alert('카페 이름을 입력해주세요.');
                                        }}
                                        className="text-xs text-blue-500 hover:underline flex items-center gap-1"
                                    >
                                        <MapPin size={11} /> 지도 검색
                                    </button>
                                </div>
                                <input
                                    type="text"
                                    placeholder="카페 이름을 입력하세요"
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                    required
                                    className={inputCls}
                                />
                            </div>
                            <div className="space-y-2">
                                <FieldLabel icon={<MapPin size={15} />} text="위치" />
                                <input
                                    type="text"
                                    placeholder="예: 서울 마포구 연남동"
                                    value={location}
                                    onChange={e => setLocation(e.target.value)}
                                    className={inputCls}
                                />
                            </div>
                            <div className="space-y-2">
                                <FieldLabel icon={<Calendar size={15} />} text="방문 날짜" />
                                <input
                                    type="date"
                                    value={date}
                                    onChange={e => setDate(e.target.value)}
                                    required
                                    className={inputCls}
                                />
                            </div>
                        </div>
                    </FormSection>

                    {/* ── SECTION 2: 주문한 커피 ── */}
                    <FormSection title="주문한 커피">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="space-y-2">
                                <FieldLabel icon={<Coffee size={15} />} text="커피 이름" />
                                <input
                                    type="text"
                                    placeholder="예: 아이스 아메리카노"
                                    value={drink}
                                    onChange={e => setDrink(e.target.value)}
                                    required
                                    className={inputCls}
                                />
                            </div>
                            <div className="space-y-2">
                                <FieldLabel icon={<span className="text-sm font-bold leading-none">₩</span>} text="가격" />
                                <input
                                    type="number"
                                    placeholder="예: 5500"
                                    value={price}
                                    onChange={e => setPrice(e.target.value === "" ? "" : Number(e.target.value))}
                                    min="0"
                                    className={inputCls}
                                />
                            </div>
                        </div>

                        {/* Taste Profile */}
                        <div className="space-y-4 pt-2">
                            <p className="text-sm font-bold text-coffee-brown/60">
                                맛 프로파일 <span className="font-normal text-xs text-coffee-brown/40">(1~5점)</span>
                            </p>
                            <RangeSlider label="산미 (Acidity)" value={acidity} onChange={setAcidity} />
                            <RangeSlider label="바디감 (Body)" value={body} onChange={setBody} />
                            <RangeSlider label="단맛 (Sweetness)" value={sweetness} onChange={setSweetness} />
                        </div>

                        {/* Coffee Rating */}
                        <div className="space-y-3 pt-2">
                            <p className="text-sm font-bold text-coffee-brown/60">커피 평점</p>
                            <StarPicker value={coffeeRating} onChange={setCoffeeRating} activeClass="bg-coffee-accent text-coffee-brown" />
                        </div>

                        {/* Coffee Memo */}
                        <div className="space-y-2 pt-2">
                            <p className="text-sm font-bold text-coffee-brown/60">커피 메모</p>
                            <textarea
                                placeholder="이 커피의 향, 맛, 느낌을 적어주세요."
                                value={coffeeMemo}
                                onChange={e => setCoffeeMemo(e.target.value)}
                                className="w-full h-28 px-4 py-3 rounded-xl border border-coffee-brown/10 bg-white focus:outline-none focus:ring-2 focus:ring-coffee-brown/20 transition-all resize-none text-sm"
                            />
                        </div>

                        {/* 커피구매 총액 */}
                        {price !== "" && Number(price) > 0 && (
                            <div className="flex items-center justify-between bg-coffee-brown/5 rounded-xl px-5 py-3 mt-1">
                                <span className="text-sm text-coffee-brown/60 font-medium">커피구매 총액</span>
                                <span className="text-xl font-black text-coffee-brown">₩{Number(price).toLocaleString()}</span>
                            </div>
                        )}
                    </FormSection>

                    {/* ── SECTION 3: 카페 분위기 ── */}
                    <FormSection title="카페 분위기">
                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                            {atmosphereImages.map((url, i) => (
                                <div key={i} className="aspect-square rounded-xl overflow-hidden border border-gray-200 relative shadow-sm group">
                                    <img src={url} alt={`분위기 ${i + 1}`} className="w-full h-full object-cover" />
                                    <button
                                        type="button"
                                        onClick={() => setAtmosphereImages(p => p.filter((_, idx) => idx !== i))}
                                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 text-[10px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow"
                                    >✕</button>
                                </div>
                            ))}
                            {atmosphereImages.length < 10 && (
                                <div
                                    onClick={() => fileInputRef.current?.click()}
                                    className="aspect-square bg-gray-50 rounded-xl flex flex-col items-center justify-center gap-1.5 border-2 border-dashed border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors text-gray-400"
                                >
                                    <Camera size={22} />
                                    <span className="text-[10px] text-center px-1 leading-tight">
                                        {uploadingImage ? '업로드 중...' : '사진 추가'}
                                    </span>
                                </div>
                            )}
                        </div>
                        <p className="text-xs text-coffee-brown/30 mt-1">최대 10장 · 카페 분위기 사진을 추가하세요</p>
                        <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageUpload} className="hidden" />
                    </FormSection>

                    {/* ── SECTION 4: 총평 ── */}
                    <FormSection title="총평">
                        <div className="space-y-5">
                            <div className="space-y-3">
                                <p className="text-sm font-bold text-coffee-brown/60">총평점 <span className="font-normal text-xs text-coffee-brown/40">(카페 전체)</span></p>
                                <StarPicker value={cafeRating} onChange={setCafeRating} activeClass="bg-yellow-400 text-yellow-900" />
                            </div>
                            <div className="space-y-2">
                                <p className="text-sm font-bold text-coffee-brown/60">총평글</p>
                                <textarea
                                    placeholder="이 카페에 대한 전반적인 인상이나 추천 여부를 남겨주세요."
                                    value={overallMemo}
                                    onChange={e => setOverallMemo(e.target.value)}
                                    className="w-full h-32 px-4 py-3 rounded-xl border border-coffee-brown/10 bg-white focus:outline-none focus:ring-2 focus:ring-coffee-brown/20 transition-all resize-none text-sm"
                                />
                            </div>
                        </div>
                    </FormSection>

                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full bg-coffee-brown text-coffee-cream py-4 rounded-xl text-lg font-bold shadow-xl hover:bg-coffee-brown/90 transition-all flex items-center justify-center gap-2 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                    >
                        {loading ? '기록 중...' : <><Send size={20} /> 기록 완료하기</>}
                    </button>
                </form>
            </div>
        </div>
    );
}

// ── Sub-components ──────────────────────────────────────────────────────────────

const inputCls = "w-full px-4 py-3 rounded-xl border border-coffee-brown/10 bg-white focus:outline-none focus:ring-2 focus:ring-coffee-brown/20 transition-all text-sm";

function FormSection({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div className="coffee-card bg-white/80 backdrop-blur-sm space-y-5">
            <h2 className="text-xs font-bold text-coffee-brown/40 uppercase tracking-widest border-b border-coffee-brown/5 pb-3">{title}</h2>
            {children}
        </div>
    );
}

function FieldLabel({ icon, text }: { icon: React.ReactNode; text: string }) {
    return (
        <label className="text-sm font-bold text-coffee-brown flex items-center gap-1.5">
            {icon}{text}
        </label>
    );
}

function StarPicker({ value, onChange, activeClass }: { value: number; onChange: (v: number) => void; activeClass: string }) {
    return (
        <div className="flex gap-3">
            {[1, 2, 3, 4, 5].map(s => (
                <button
                    key={s}
                    type="button"
                    onClick={() => onChange(s)}
                    className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all ${value >= s ? `${activeClass} shadow-md scale-105` : 'bg-coffee-brown/5 text-coffee-brown/25 hover:bg-coffee-brown/10'}`}
                >
                    <Star size={20} fill={value >= s ? "currentColor" : "none"} />
                </button>
            ))}
        </div>
    );
}

function RangeSlider({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
    return (
        <div className="space-y-2">
            <div className="flex justify-between items-center">
                <span className="text-sm text-coffee-brown/70">{label}</span>
                <span className="text-sm font-bold text-coffee-brown bg-coffee-brown/5 px-2.5 py-0.5 rounded-lg">{value}점</span>
            </div>
            <input
                type="range"
                min="1"
                max="5"
                step="1"
                value={value}
                onChange={e => onChange(parseInt(e.target.value))}
                className="w-full h-2 bg-coffee-brown/10 rounded-lg appearance-none cursor-pointer accent-coffee-brown"
            />
            <div className="flex justify-between text-[10px] text-coffee-brown/25 px-0.5">
                {[1, 2, 3, 4, 5].map(n => <span key={n}>{n}</span>)}
            </div>
        </div>
    );
}
