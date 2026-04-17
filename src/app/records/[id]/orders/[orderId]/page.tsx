"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Star, Save, Home } from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function OrderDetail() {
    const params = useParams();
    const router = useRouter();
    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [drinkName, setDrinkName] = useState("");
    const [price, setPrice] = useState<number | "">(0);
    const [rating, setRating] = useState(3);
    const [acidity, setAcidity] = useState(3);
    const [body, setBody] = useState(3);
    const [sweetness, setSweetness] = useState(3);
    const [memo, setMemo] = useState("");

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const { data, error } = await supabase
                    .from('orders')
                    .select('*')
                    .eq('id', params.orderId)
                    .single();

                if (error) throw error;
                setOrder(data);
                setDrinkName(data.drink_name);
                setPrice(data.price ?? 0);
                setRating(data.rating);
                setAcidity(data.acidity);
                setBody(data.body);
                setSweetness(data.sweetness);
                setMemo(data.memo || "");
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

    const handleSave = async () => {
        setSaving(true);
        try {
            const { error } = await supabase
                .from('orders')
                .update({ drink_name: drinkName, price: price || 0, rating, acidity, body, sweetness, memo })
                .eq('id', params.orderId)
                .execute();

            if (error) throw error;
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
                        <label className="text-xs font-bold text-coffee-brown/40 uppercase tracking-widest">Rating</label>
                        <div className="flex gap-2">
                            {[1, 2, 3, 4, 5].map(num => (
                                <button
                                    key={num}
                                    onClick={() => setRating(num)}
                                    className={`flex-1 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-1 ${rating === num ? 'bg-yellow-500 text-white shadow-lg scale-105' : 'bg-coffee-brown/5 text-coffee-brown hover:bg-coffee-brown/10'}`}
                                >
                                    <Star size={18} fill={rating >= num ? "currentColor" : "none"} /> {num}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Taste Profile */}
                    <div className="space-y-6">
                        <h3 className="text-xs font-bold text-coffee-brown/40 uppercase tracking-widest border-b border-coffee-brown/10 pb-2">Taste Profile</h3>
                        <div className="space-y-8">
                            {[
                                { label: "Acidity (산미)", value: acidity, setter: setAcidity },
                                { label: "Body (바디감)", value: body, setter: setBody },
                                { label: "Sweetness (단맛)", value: sweetness, setter: setSweetness },
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
        </div>
    );
}
