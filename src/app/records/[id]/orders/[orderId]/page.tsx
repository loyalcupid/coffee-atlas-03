"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Star, Save, Home, Camera } from "lucide-react";
import { PhotoLightbox } from "@/components/PhotoLightbox";
import Link from "next/link";
import { db, storage } from "@/lib/firebase";
import { ref, get, update } from "firebase/database";
import { ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";
import { useRequireAuth } from "@/lib/useRequireAuth";

export default function OrderDetail() {
    const params = useParams();
    const router = useRouter();
    const { user } = useRequireAuth();
    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [drinkName, setDrinkName] = useState("");
    const [price, setPrice] = useState<number | "">(0);
    const [rating, setRating] = useState(5);
    const [acidity, setAcidity] = useState(3);
    const [body, setBody] = useState(3);
    const [sweetness, setSweetness] = useState(3);
    const [nuttiness, setNuttiness] = useState(3);
    const [aroma, setAroma] = useState(3);
    const [balance, setBalance] = useState(3);
    const [memo, setMemo] = useState("");
    const [images, setImages] = useState<string[]>([]);
    const [uploadingImage, setUploadingImage] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const snap = await get(ref(db, `orders/${params.orderId}`));
                if (!snap.exists()) throw new Error('order not found');
                const data = { id: snap.key, ...snap.val() } as any;
                setOrder(data);
                setDrinkName(data.drink_name);
                setPrice(data.price ?? 0);
                setRating(data.rating);
                setAcidity(data.acidity);
                setBody(data.body);
                setSweetness(data.sweetness);
                setNuttiness(data.nuttiness ?? 3);
                setAroma(data.aroma ?? 3);
                setBalance(data.balance ?? 3);
                setMemo(data.memo || "");
                setImages(data.images || []);
            } catch (error) {
                console.error('Error fetching order:', error);
                alert('주문 정보를 찾을 수 없습니다.');
                router.back();
            } finally {
                setLoading(false);
            }
        };

        if (params.orderId) fetchOrder();
    }, [params.orderId]);

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !user) return;
        if (images.length >= 5) { alert("사진은 최대 5장까지 가능합니다."); return; }
        setUploadingImage(true);
        try {
            const ext = file.name.split(".").pop();
            const path = `uploads/${user.uid}/coffee-orders/${params.orderId}/${Date.now()}.${ext}`;
            const sRef = storageRef(storage, path);
            await uploadBytes(sRef, file);
            const url = await getDownloadURL(sRef);
            const newImages = [...images, url];
            await update(ref(db, `orders/${params.orderId}`), { images: newImages });
            setImages(newImages);
        } catch {
            alert("이미지 업로드에 실패했습니다.");
        } finally {
            setUploadingImage(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    const handleRemoveImage = async (idx: number) => {
        const newImages = images.filter((_, i) => i !== idx);
        await update(ref(db, `orders/${params.orderId}`), { images: newImages });
        setImages(newImages);
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await update(ref(db, `orders/${params.orderId}`), {
                drink_name: drinkName, price: price || 0, rating, acidity, body, sweetness, nuttiness, aroma, balance, memo, images
            });
            router.back();
        } catch (error) {
            console.error('Error saving order:', error);
            alert('저장 중 오류가 발생했습니다.');
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

    if (!order) return null;

    return (
        <div className="min-h-screen bg-coffee-cream/30 p-6 md:p-12">
            <div className="max-w-xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button onClick={() => router.back()} className="p-2 hover:bg-coffee-brown/5 rounded-full transition-colors text-coffee-brown">
                            <ArrowLeft size={24} />
                        </button>
                        <h1 className="text-2xl font-bold text-coffee-brown">커피 상세 기록</h1>
                    </div>
                    <Link href="/" className="p-2 hover:bg-coffee-brown/5 rounded-full transition-colors text-coffee-brown">
                        <Home size={24} />
                    </Link>
                </div>

                <div className="coffee-card p-8 bg-white/80 backdrop-blur-sm space-y-8">

                    {/* Coffee Name */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-coffee-brown/40 uppercase tracking-widest">Coffee Name</label>
                        <input
                            value={drinkName}
                            onChange={e => setDrinkName(e.target.value)}
                            className="w-full text-3xl font-black text-coffee-brown bg-transparent border-b-2 border-coffee-brown/10 focus:border-coffee-brown outline-none pb-2 transition-colors"
                            placeholder="커피 이름을 입력하세요"
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

                    {/* Overall Rating */}
                    <div className="space-y-4">
                        <label className="text-xs font-bold text-coffee-brown/40 uppercase tracking-widest">Rating <span className="normal-case font-normal">(10점 만점)</span></label>
                        <div className="grid grid-cols-5 gap-2">
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                                <button
                                    key={num}
                                    onClick={() => setRating(num)}
                                    className={`py-3 rounded-xl font-bold transition-all flex items-center justify-center ${rating === num ? 'bg-yellow-500 text-white shadow-lg scale-105' : 'bg-coffee-brown/5 text-coffee-brown hover:bg-coffee-brown/10'}`}
                                >
                                    {num}
                                </button>
                            ))}
                        </div>
                        <p className="text-xs text-coffee-brown/30 text-right">{rating} / 10점</p>
                    </div>

                    {/* Taste Profile */}
                    <div className="space-y-6">
                        <h3 className="text-xs font-bold text-coffee-brown/40 uppercase tracking-widest border-b border-coffee-brown/10 pb-2">Taste Profile</h3>
                        <div className="space-y-8">
                            {[
                                { label: "Acidity (산미)",       value: acidity,   setter: setAcidity },
                                { label: "Body (바디감)",         value: body,      setter: setBody },
                                { label: "Sweetness (단맛)",      value: sweetness, setter: setSweetness },
                                { label: "Nuttiness (고소함)",    value: nuttiness, setter: setNuttiness },
                                { label: "Aroma (향미)",          value: aroma,     setter: setAroma },
                                { label: "Balance (균형감)",      value: balance,   setter: setBalance },
                            ].map(item => (
                                <div key={item.label} className="space-y-4">
                                    <div className="flex justify-between items-end">
                                        <span className="text-coffee-brown font-bold">{item.label}</span>
                                        <span className="text-coffee-brown/40 text-xs font-mono">{item.value}/5</span>
                                    </div>
                                    <div className="flex justify-between gap-1">
                                        {[1, 2, 3, 4, 5].map(num => (
                                            <button
                                                key={num}
                                                onClick={() => item.setter(num)}
                                                className={`flex-1 h-10 rounded-xl text-sm font-bold transition-all ${item.value === num ? 'bg-coffee-brown text-coffee-cream shadow-md scale-105' : 'bg-coffee-brown/5 text-coffee-brown hover:bg-coffee-brown/10'}`}
                                            >
                                                {num}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Photos */}
                    <div className="space-y-4">
                        <h3 className="text-xs font-bold text-coffee-brown/40 uppercase tracking-widest border-b border-coffee-brown/10 pb-2">Photos</h3>
                        <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                            {images.map((url, i) => (
                                <div key={i} className="aspect-square rounded-xl overflow-hidden border border-gray-200 relative shadow-sm group">
                                    <img
                                        src={url}
                                        alt=""
                                        className="w-full h-full object-cover cursor-pointer"
                                        onClick={() => setLightboxUrl(url)}
                                    />
                                    <button
                                        onClick={() => handleRemoveImage(i)}
                                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 text-[10px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow"
                                    >✕</button>
                                </div>
                            ))}
                            {images.length < 5 && (
                                <div
                                    onClick={() => fileInputRef.current?.click()}
                                    className="aspect-square bg-gray-50 rounded-xl flex flex-col items-center justify-center gap-1 border-2 border-dashed border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors text-gray-400"
                                >
                                    <Camera size={18} />
                                    <span className="text-[9px] text-center px-1 leading-tight">
                                        {uploadingImage ? "업로드 중..." : "사진 추가"}
                                    </span>
                                </div>
                            )}
                        </div>
                        <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageUpload} className="hidden" />
                        <p className="text-xs text-coffee-brown/30">최대 5장</p>
                    </div>

                    {/* Memo */}
                    <div className="space-y-4">
                        <h3 className="text-xs font-bold text-coffee-brown/40 uppercase tracking-widest border-b border-coffee-brown/10 pb-2">Memo</h3>
                        <div className="relative">
                            <textarea
                                value={memo}
                                onChange={e => setMemo(e.target.value)}
                                className="w-full h-48 p-6 rounded-2xl bg-coffee-brown/[0.02] border-2 border-coffee-brown/5 focus:border-coffee-accent/30 outline-none text-coffee-brown transition-all resize-none leading-relaxed italic"
                                placeholder="노트의 향과 맛, 분위기를 기록해보세요..."
                            />
                            <div className="absolute top-0 right-0 p-4 pointer-events-none opacity-5">
                                <Star size={100} />
                            </div>
                        </div>
                    </div>

                    {/* Save */}
                    <div className="pt-4">
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="w-full bg-coffee-brown text-coffee-cream py-5 rounded-3xl font-bold shadow-xl hover:bg-coffee-brown/90 transition-all flex items-center justify-center gap-2 text-lg active:scale-[0.98]"
                        >
                            {saving ? "저장 중..." : <><Save size={24} /> 수정 완료</>}
                        </button>
                    </div>
                </div>
            </div>
            {lightboxUrl && <PhotoLightbox url={lightboxUrl} onClose={() => setLightboxUrl(null)} />}
        </div>
    );
}
