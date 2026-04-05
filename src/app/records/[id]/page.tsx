"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { Coffee, MapPin, Calendar, Star, Edit2, Home, ArrowLeft, Trash2, Plus, Camera } from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function RecordDetail() {
    const params = useParams();
    const router = useRouter();
    const [record, setRecord] = useState<any>(null);
    const [visits, setVisits] = useState<any[]>([]);
    const [orders, setOrders] = useState<any[]>([]);
    const [selectedVisitId, setSelectedVisitId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false); // For basic cafe info editing

    // Edit form states for basic info
    const [name, setName] = useState("");
    const [location, setLocation] = useState("");
    const [rating, setRating] = useState(3);
    const [atmosphereImages, setAtmosphereImages] = useState<string[]>([]);

    // Upload state and ref
    const [uploadingImage, setUploadingImage] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                // Fetch record
                const { data: recData, error: recError } = await supabase
                    .from('records')
                    .select('*')
                    .eq('id', params.id)
                    .single();

                if (recError) throw recError;
                setRecord(recData);
                setName(recData.name);
                setLocation(recData.location);
                setRating(recData.rating);
                setAtmosphereImages(recData.atmosphere_images || []);

                // Fetch visits
                const { data: visitData, error: visitError } = await supabase
                    .from('visits')
                    .select('*')
                    .eq('record_id', params.id)
                    .order('date', { ascending: false })
                    .execute();

                if (visitError) throw visitError;
                setVisits(visitData || []);

                if (visitData && visitData.length > 0) {
                    setSelectedVisitId(visitData[0].id);
                }
            } catch (error) {
                console.error('Error fetching record data:', error);
                alert('데이터를 불러오는 중 오류가 발생했습니다.');
            } finally {
                setLoading(false);
            }
        };

        if (params.id) {
            fetchInitialData();
        }
    }, [params.id]);

    useEffect(() => {
        const fetchOrders = async () => {
            if (!selectedVisitId) {
                setOrders([]);
                return;
            }
            const { data, error } = await supabase
                .from('orders')
                .select('*')
                .eq('visit_id', selectedVisitId)
                .execute();

            if (!error) setOrders(data || []);
        };

        fetchOrders();
    }, [selectedVisitId]);

    const handleAddVisit = async () => {
        const date = prompt("방문 날짜를 입력하세요 (YYYY-MM-DD)", new Date().toISOString().split('T')[0]);
        if (!date) return;

        const { data, error } = await supabase
            .from('visits')
            .insert([{ record_id: params.id, date }])
            .select()
            .execute();

        if (!error && data) {
            setVisits([data[0], ...visits]);
            setSelectedVisitId(data[0].id);
        }
    };

    const handleDeleteVisit = async (visitId: string) => {
        if (!confirm("이 방문 기록을 삭제하시겠습니까? 관련된 주문 커피 내역도 모두 삭제됩니다.")) return;
        const { error } = await supabase.from('visits').delete().eq('id', visitId).execute();
        if (!error) {
            const updatedVisits = visits.filter(v => v.id !== visitId);
            setVisits(updatedVisits);
            if (selectedVisitId === visitId) {
                setSelectedVisitId(updatedVisits.length > 0 ? updatedVisits[0].id : null);
            }
        } else {
            alert('방문 기록 삭제에 실패했습니다.');
        }
    };

    const handleAddOrder = async () => {
        if (!selectedVisitId) {
            alert("먼저 방문 날짜를 선택하거나 추가해주세요.");
            return;
        }
        const drink_name = prompt("주문한 커피 이름을 입력하세요");
        if (!drink_name) return;

        const { data, error } = await supabase
            .from('orders')
            .insert([{ visit_id: selectedVisitId, drink_name, rating: 3, acidity: 3, body: 3, sweetness: 3 }])
            .select()
            .execute();

        if (!error && data) {
            setOrders([...orders, data[0]]);
        }
    };

    const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        if (atmosphereImages.length >= 10) {
            alert('사진은 최대 10장까지 업로드 가능합니다.');
            return;
        }

        setUploadingImage(true);
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random()}.${fileExt}`;
            const filePath = `${params.id}/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('cafe_images')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('cafe_images')
                .getPublicUrl(filePath);

            const newImages = [...atmosphereImages, publicUrl];

            const { error: updateError } = await supabase
                .from('records')
                .update({ atmosphere_images: newImages })
                .eq('id', params.id)
                .execute();

            if (updateError) throw updateError;

            setAtmosphereImages(newImages);
        } catch (error) {
            console.error("Error uploading image: ", error);
            alert("이미지 업로드에 실패했습니다. 데이터베이스 설정을 확인증입니다.");
        } finally {
            setUploadingImage(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        }
    };

    const handleUpdateBasicInfo = async () => {
        const { error } = await supabase
            .from('records')
            .update({ name, location, rating })
            .eq('id', params.id)
            .execute();

        if (!error) {
            setRecord({ ...record, name, location, rating });
            setIsEditing(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm("정말로 이 기록을 삭제하시겠습니까?")) return;
        const { error } = await supabase.from('records').delete().eq('id', params.id).execute();
        if (!error) {
            alert('기록이 삭제되었습니다.');
            router.push('/records');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-coffee-cream/30 p-6 flex items-center justify-center">
                <div className="animate-spin w-12 h-12 border-4 border-coffee-brown border-t-transparent rounded-full"></div>
            </div>
        );
    }

    if (!record) return null;

    return (
        <div className="min-h-screen bg-coffee-cream/30 p-4 md:p-8">
            <div className="max-w-2xl mx-auto space-y-6">
                {/* Header Navigation */}
                <div className="flex items-center justify-between pb-2">
                    <div className="flex items-center gap-4">
                        <Link href="/records" className="p-2 hover:bg-coffee-brown/5 rounded-full transition-colors text-coffee-brown">
                            <ArrowLeft size={24} />
                        </Link>
                        <h1 className="text-2xl font-bold text-coffee-brown">상세 기록</h1>
                    </div>
                    <Link href="/" className="p-2 hover:bg-coffee-brown/5 rounded-full transition-colors text-coffee-brown">
                        <Home size={24} />
                    </Link>
                </div>

                <div className="coffee-card bg-white/90 backdrop-blur-sm p-6 space-y-8 shadow-2xl relative overflow-hidden">
                    {/* Top Info Section */}
                    <div className="space-y-4">
                        <div className="flex justify-between items-start">
                            <div className="space-y-1">
                                {isEditing ? (
                                    <input
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="text-4xl font-black text-coffee-brown bg-transparent border-b-2 border-coffee-brown/20 outline-none w-full"
                                    />
                                ) : (
                                    <h2 className="text-4xl font-black text-coffee-brown tracking-tighter">{record.name}</h2>
                                )}
                                <div className="flex items-center gap-1 text-coffee-brown/50 text-sm">
                                    <MapPin size={14} />
                                    {isEditing ? (
                                        <input
                                            value={location}
                                            onChange={(e) => setLocation(e.target.value)}
                                            className="bg-transparent border-b border-coffee-brown/20 outline-none"
                                        />
                                    ) : (
                                        <span>{record.location}</span>
                                    )}
                                </div>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                                <div className="flex items-center text-yellow-600 font-bold bg-yellow-50 px-3 py-1 rounded-full text-lg border border-yellow-100">
                                    <Star size={20} fill="currentColor" className="mr-1" />
                                    {isEditing ? (
                                        <select value={rating} onChange={(e) => setRating(Number(e.target.value))} className="bg-transparent outline-none">
                                            {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n}</option>)}
                                        </select>
                                    ) : (
                                        record.rating
                                    )}
                                </div>
                                <div className="text-sm text-coffee-brown/60 font-medium">
                                    방문횟수 : <span className="bg-coffee-brown/5 px-2 py-0.5 rounded border border-coffee-brown/20 text-blue-600 font-bold">{visits.length}</span> 회
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Visit Dates Horizontal List */}
                    <div className="space-y-3">
                        <div className="flex gap-4 border-2 border-blue-400/50 rounded-2xl p-4 bg-blue-50/30 overflow-hidden relative min-h-[116px]">
                            <button
                                onClick={handleAddVisit}
                                className="flex-shrink-0 w-[120px] border-2 border-dashed border-coffee-brown/30 rounded-lg flex flex-col items-center justify-center gap-1 hover:bg-white/50 transition-all text-coffee-brown group"
                            >
                                <span className="text-sm font-bold">방문날짜</span>
                                <span className="text-sm font-bold">입력</span>
                            </button>

                            <div className="flex flex-wrap gap-3 flex-1 content-start pt-1 pb-1">
                                {visits.map((visit) => (
                                    <div key={visit.id} className="relative flex-shrink-0 inline-flex group">
                                        <button
                                            onClick={() => setSelectedVisitId(visit.id)}
                                            className={`w-[140px] h-[40px] border rounded-md flex items-center justify-center gap-2 font-medium transition-all ${selectedVisitId === visit.id
                                                ? 'bg-blue-600 text-white border-blue-700 shadow-md scale-[1.02]'
                                                : 'bg-white text-coffee-brown/60 border-coffee-brown/10 hover:border-blue-400'
                                                }`}
                                        >
                                            <Calendar size={14} />
                                            <span className="text-sm">{visit.date}</span>
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDeleteVisit(visit.id);
                                            }}
                                            title="삭제"
                                            className="absolute -top-2 -right-2 bg-red-100/90 text-red-500 rounded-full w-5 h-5 flex items-center justify-center text-[10px] sm:opacity-0 sm:group-hover:opacity-100 transition-opacity z-10 hover:bg-red-500 hover:text-white shadow-sm border border-red-200"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Ordered Coffee Horizontal List */}
                    <div className="space-y-3">
                        <div className="flex gap-4 border-2 border-blue-400/50 rounded-2xl p-4 bg-blue-50/30 overflow-hidden relative min-h-[116px]">
                            <button
                                onClick={handleAddOrder}
                                className="flex-shrink-0 w-[120px] border-2 border-dashed border-coffee-brown/30 rounded-lg flex flex-col items-center justify-center gap-1 hover:bg-white/50 transition-all text-coffee-brown group"
                            >
                                <span className="text-sm font-bold">주문커피</span>
                                <span className="text-sm font-bold">입력</span>
                            </button>

                            <div className="flex flex-wrap gap-3 flex-1 content-start pt-1 pb-1">
                                {orders.length > 0 ? orders.map((order) => (
                                    <Link
                                        key={order.id}
                                        href={`/records/${params.id}/orders/${order.id}`}
                                        className="flex-shrink-0 w-[160px] h-[50px] bg-white border border-coffee-brown/10 rounded-md flex items-center justify-center text-coffee-brown font-bold hover:border-blue-500 hover:text-blue-600 transition-all shadow-sm"
                                    >
                                        {order.drink_name}
                                    </Link>
                                )) : (
                                    <div className="flex items-center text-coffee-brown/30 text-xs italic pl-2">
                                        기록된 커피가 없습니다.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Cafe Mood Grid */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-bold text-coffee-brown pl-1">카페 분위기</h3>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                            {atmosphereImages.map((imgUrl, index) => (
                                <div key={index} className="aspect-square rounded-lg border border-gray-200 overflow-hidden relative shadow-sm">
                                    <img src={imgUrl} alt={`Atmosphere ${index}`} className="w-full h-full object-cover" />
                                </div>
                            ))}

                            {atmosphereImages.length < 10 && (
                                <div
                                    onClick={() => fileInputRef.current?.click()}
                                    className="aspect-square bg-gray-100 rounded-lg flex flex-col items-center justify-center text-gray-400 gap-2 border-2 border-dashed border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors"
                                >
                                    <Camera size={24} />
                                    <span className="text-[10px] text-center px-1 leading-tight line-clamp-2">
                                        {uploadingImage ? '업로드 중...' : '클릭하여 사진을 업로드하세요'}
                                    </span>
                                </div>
                            )}

                            <input
                                type="file"
                                accept="image/*"
                                ref={fileInputRef}
                                onChange={handleImageUpload}
                                className="hidden"
                            />
                        </div>
                    </div>

                    {/* Bottom Actions */}
                    <div className="flex gap-4 pt-4">
                        {isEditing ? (
                            <>
                                <button
                                    onClick={handleUpdateBasicInfo}
                                    className="flex-1 bg-blue-600 text-white py-4 rounded-xl font-bold shadow-lg hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
                                >
                                    기본정보 저장
                                </button>
                                <button
                                    onClick={() => setIsEditing(false)}
                                    className="px-6 py-4 rounded-xl font-bold text-coffee-brown bg-gray-100 hover:bg-gray-200 transition-all"
                                >
                                    취소
                                </button>
                            </>
                        ) : (
                            <>
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="flex-1 bg-[#4d443e] text-white py-5 rounded-md font-bold hover:bg-[#3d3632] transition-all flex items-center justify-center gap-2 text-lg"
                                >
                                    <Edit2 size={20} /> 기록 수정하기
                                </button>
                                <button
                                    onClick={handleDelete}
                                    className="flex-1 bg-[#53585f] text-white py-5 rounded-md font-bold hover:bg-[#43484f] transition-all flex items-center justify-center gap-2 text-lg"
                                >
                                    <Trash2 size={20} /> 삭제하기
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>

            <style jsx global>{`
                .scrollbar-hide::-webkit-scrollbar {
                    display: none;
                }
                .scrollbar-hide {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}</style>
        </div>
    );
}
