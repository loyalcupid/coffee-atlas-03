"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Star, Save, Home, Camera, UtensilsCrossed } from "lucide-react";
import Link from "next/link";
import { db, storage } from "@/lib/firebase";
import { ref, get, update } from "firebase/database";
import { ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";
import { useRequireAuth } from "@/lib/useRequireAuth";

export default function MenuItemDetail() {
    const params = useParams();
    const router = useRouter();
    const { user } = useRequireAuth();
    const [item, setItem] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [itemName, setItemName] = useState("");
    const [price, setPrice] = useState<number | "">(0);
    const [rating, setRating] = useState(3);
    const [memo, setMemo] = useState("");
    const [images, setImages] = useState<string[]>([]);

    useEffect(() => {
        const fetchItem = async () => {
            try {
                const snap = await get(ref(db, `other_items/${params.itemId}`));
                if (!snap.exists()) throw new Error("item not found");
                const data = { id: snap.key, ...snap.val() } as any;
                setItem(data);
                setItemName(data.name);
                setPrice(data.price ?? 0);
                setRating(data.rating ?? 3);
                setMemo(data.memo || "");
                setImages(data.images || []);
            } catch (error) {
                console.error("Error fetching item:", error);
                alert("메뉴 정보를 찾을 수 없습니다.");
                router.back();
            } finally {
                setLoading(false);
            }
        };

        if (params.itemId) fetchItem();
    }, [params.itemId]);

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (images.length >= 5) { alert("사진은 최대 5장까지 업로드 가능합니다."); return; }
        setUploadingImage(true);
        try {
            const ext = file.name.split(".").pop();
            const path = `uploads/${user!.uid}/menu-items/${params.itemId}/${Date.now()}.${ext}`;
            const sRef = storageRef(storage, path);
            await uploadBytes(sRef, file);
            const url = await getDownloadURL(sRef);
            setImages(prev => [...prev, url]);
        } catch {
            alert("이미지 업로드에 실패했습니다.");
        } finally {
            setUploadingImage(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await update(ref(db, `other_items/${params.itemId}`), {
                name: itemName, price: price || 0, rating, memo, images,
            });
            router.back();
        } catch {
            alert("저장 중 오류가 발생했습니다.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-coffee-cream/30 flex items-center justify-center">
                <div className="animate-spin w-12 h-12 border-4 border-coffee-brown border-t-transparent rounded-full" />
            </div>
        );
    }

    if (!item) return null;

    return (
        <div className="min-h-screen bg-coffee-cream/30 p-6 md:p-12">
            <div className="max-w-xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => router.back()}
                            className="p-2 hover:bg-coffee-brown/5 rounded-full transition-colors text-coffee-brown"
                        >
                            <ArrowLeft size={24} />
                        </button>
                        <div className="flex items-center gap-2">
                            <UtensilsCrossed size={20} className="text-orange-500" />
                            <h1 className="text-2xl font-bold text-coffee-brown">메뉴 상세 기록</h1>
                        </div>
                    </div>
                    <Link href="/" className="p-2 hover:bg-coffee-brown/5 rounded-full transition-colors text-coffee-brown">
                        <Home size={24} />
                    </Link>
                </div>

                <div className="coffee-card p-8 bg-white/80 backdrop-blur-sm space-y-8">

                    {/* Item Name */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-coffee-brown/40 uppercase tracking-widest">Menu Name</label>
                        <input
                            value={itemName}
                            onChange={e => setItemName(e.target.value)}
                            className="w-full text-3xl font-black text-coffee-brown bg-transparent border-b-2 border-coffee-brown/10 focus:border-coffee-brown outline-none pb-2 transition-colors"
                            placeholder="메뉴 이름을 입력하세요"
                        />
                    </div>

                    {/* Price */}
                    <div className="space-y-3">
                        <label className="text-xs font-bold text-coffee-brown/40 uppercase tracking-widest">Price</label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-coffee-brown/50 font-bold text-lg">₩</span>
                            <input
                                type="number"
                                value={price}
                                onChange={e => setPrice(e.target.value === "" ? "" : Number(e.target.value))}
                                min="0"
                                placeholder="0"
                                className="w-full pl-10 pr-4 py-3 rounded-xl border border-coffee-brown/10 bg-white focus:outline-none focus:ring-2 focus:ring-coffee-brown/20 transition-all text-xl font-bold text-coffee-brown"
                            />
                        </div>
                    </div>

                    {/* Rating */}
                    <div className="space-y-4">
                        <label className="text-xs font-bold text-coffee-brown/40 uppercase tracking-widest">Rating</label>
                        <div className="flex gap-2">
                            {[1, 2, 3, 4, 5].map(num => (
                                <button
                                    key={num}
                                    onClick={() => setRating(num)}
                                    className={`flex-1 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-1 ${
                                        rating === num
                                            ? "bg-orange-500 text-white shadow-lg scale-105"
                                            : "bg-coffee-brown/5 text-coffee-brown hover:bg-coffee-brown/10"
                                    }`}
                                >
                                    <Star size={18} fill={rating >= num ? "currentColor" : "none"} /> {num}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Photos */}
                    <div className="space-y-4">
                        <h3 className="text-xs font-bold text-coffee-brown/40 uppercase tracking-widest border-b border-coffee-brown/10 pb-2">Photos</h3>
                        <div className="grid grid-cols-3 gap-3">
                            {images.map((url, i) => (
                                <div key={i} className="aspect-square rounded-xl overflow-hidden border border-gray-200 relative shadow-sm group">
                                    <img src={url} alt="" className="w-full h-full object-cover" />
                                    <button
                                        onClick={() => setImages(prev => prev.filter((_, idx) => idx !== i))}
                                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 text-[10px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow"
                                    >✕</button>
                                </div>
                            ))}
                            {images.length < 5 && (
                                <div
                                    onClick={() => fileInputRef.current?.click()}
                                    className="aspect-square bg-gray-50 rounded-xl flex flex-col items-center justify-center gap-1.5 border-2 border-dashed border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors text-gray-400"
                                >
                                    <Camera size={22} />
                                    <span className="text-[10px] text-center px-1 leading-tight">
                                        {uploadingImage ? "업로드 중..." : "사진 추가"}
                                    </span>
                                </div>
                            )}
                        </div>
                        <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageUpload} className="hidden" />
                        <p className="text-xs text-coffee-brown/30">최대 5장</p>
                    </div>

                    {/* Review / Memo */}
                    <div className="space-y-4">
                        <h3 className="text-xs font-bold text-coffee-brown/40 uppercase tracking-widest border-b border-coffee-brown/10 pb-2">Review</h3>
                        <textarea
                            value={memo}
                            onChange={e => setMemo(e.target.value)}
                            className="w-full h-40 p-6 rounded-2xl bg-coffee-brown/[0.02] border-2 border-coffee-brown/5 focus:border-orange-200 outline-none text-coffee-brown transition-all resize-none leading-relaxed italic"
                            placeholder="메뉴의 맛과 느낌을 기록해보세요..."
                        />
                    </div>

                    {/* Save */}
                    <div className="pt-4">
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="w-full bg-orange-500 text-white py-5 rounded-3xl font-bold shadow-xl hover:bg-orange-600 transition-all flex items-center justify-center gap-2 text-lg active:scale-[0.98] disabled:opacity-70"
                        >
                            {saving ? "저장 중..." : <><Save size={24} /> 수정 완료</>}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
