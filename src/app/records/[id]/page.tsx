"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { Coffee, MapPin, Calendar, Star, Edit2, Home, ArrowLeft, Trash2, Camera, UtensilsCrossed, X } from "lucide-react";
import Link from "next/link";
import { db, storage, snapToArray } from "@/lib/firebase";
import { ref as dbRef, get, push, update, remove } from "firebase/database";
import { ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";
import { useRequireAuth } from "@/lib/useRequireAuth";

export default function RecordDetail() {
    const params = useParams();
    const router = useRouter();
    const { user } = useRequireAuth();
    const [record, setRecord] = useState<any>(null);
    const [visits, setVisits] = useState<any[]>([]);
    const [orders, setOrders] = useState<any[]>([]);
    const [otherItems, setOtherItems] = useState<any[]>([]);
    const [selectedVisitId, setSelectedVisitId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);

    // Edit states
    const [name, setName] = useState("");
    const [location, setLocation] = useState("");
    const [rating, setRating] = useState(3);
    const [overallMemo, setOverallMemo] = useState("");
    const [atmosphereImages, setAtmosphereImages] = useState<string[]>([]);

    const [uploadingImage, setUploadingImage] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Modal states
    const [showDateModal, setShowDateModal] = useState(false);
    const [newDate, setNewDate] = useState(new Date().toISOString().split("T")[0]);
    const [showCoffeeModal, setShowCoffeeModal] = useState(false);
    const [newCoffeeName, setNewCoffeeName] = useState("");
    const [showOtherMenuModal, setShowOtherMenuModal] = useState(false);
    const [newMenuName, setNewMenuName] = useState("");

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const recSnap = await get(dbRef(db, `records/${params.id}`));
                if (!recSnap.exists()) throw new Error("record not found");
                const recData = { id: recSnap.key, ...recSnap.val() } as any;
                setRecord(recData);
                setName(recData.name);
                setLocation(recData.location);
                setRating(recData.rating);
                setOverallMemo(recData.overall_memo || "");
                setAtmosphereImages(recData.atmosphere_images || []);

                const visitsSnap = await get(dbRef(db, "visits"));
                const visitData = snapToArray<any>(visitsSnap)
                    .filter(v => v.record_id === params.id)
                    .sort((a, b) => b.date.localeCompare(a.date));
                setVisits(visitData);
                if (visitData.length > 0) setSelectedVisitId(visitData[0].id);
            } catch (error) {
                console.error("Error fetching record data:", error);
                alert("데이터를 불러오는 중 오류가 발생했습니다.");
            } finally {
                setLoading(false);
            }
        };

        if (params.id) fetchInitialData();
    }, [params.id]);

    useEffect(() => {
        const fetchOrders = async () => {
            if (!selectedVisitId) {
                setOrders([]);
                setOtherItems([]);
                return;
            }
            const [ordersSnap, otherSnap] = await Promise.all([
                get(dbRef(db, "orders")),
                get(dbRef(db, "other_items")),
            ]);
            setOrders(snapToArray<any>(ordersSnap).filter(o => o.visit_id === selectedVisitId));
            setOtherItems(snapToArray<any>(otherSnap).filter(o => o.visit_id === selectedVisitId));
        };
        fetchOrders();
    }, [selectedVisitId]);

    // ── 날짜 추가 ──
    const handleAddVisit = () => {
        setNewDate(new Date().toISOString().split("T")[0]);
        setShowDateModal(true);
    };

    const confirmAddVisit = async () => {
        if (!newDate) return;
        setShowDateModal(false);
        const visitRef = await push(dbRef(db, "visits"), { record_id: params.id, date: newDate });
        const newVisit = { id: visitRef.key, record_id: params.id, date: newDate };
        setVisits([newVisit, ...visits]);
        setSelectedVisitId(visitRef.key!);
    };

    const handleDeleteVisit = async (visitId: string) => {
        if (!confirm("이 방문 기록을 삭제하시겠습니까? 관련 주문 내역도 모두 삭제됩니다.")) return;
        try {
            const [ordersSnap, otherSnap] = await Promise.all([
                get(dbRef(db, "orders")),
                get(dbRef(db, "other_items")),
            ]);
            const toDeleteOrders = snapToArray<any>(ordersSnap).filter(o => o.visit_id === visitId);
            const toDeleteOther = snapToArray<any>(otherSnap).filter(o => o.visit_id === visitId);
            await Promise.all([
                ...toDeleteOrders.map(o => remove(dbRef(db, `orders/${o.id}`))),
                ...toDeleteOther.map(o => remove(dbRef(db, `other_items/${o.id}`))),
                remove(dbRef(db, `visits/${visitId}`)),
            ]);
            const updated = visits.filter((v: any) => v.id !== visitId);
            setVisits(updated);
            if (selectedVisitId === visitId) setSelectedVisitId(updated.length > 0 ? (updated[0] as any).id : null);
        } catch {
            alert("방문 기록 삭제에 실패했습니다.");
        }
    };

    // ── 커피 추가 / 삭제 ──
    const handleAddOrder = () => {
        if (!selectedVisitId) { alert("먼저 방문 날짜를 선택하거나 추가해주세요."); return; }
        setNewCoffeeName("");
        setShowCoffeeModal(true);
    };

    const confirmAddOrder = async () => {
        if (!newCoffeeName.trim()) return;
        setShowCoffeeModal(false);
        const orderRef = await push(dbRef(db, "orders"), {
            visit_id: selectedVisitId,
            drink_name: newCoffeeName.trim(),
            price: 0, rating: 3, acidity: 3, body: 3, sweetness: 3,
        });
        setOrders([...orders, {
            id: orderRef.key,
            visit_id: selectedVisitId,
            drink_name: newCoffeeName.trim(),
            price: 0, rating: 3, acidity: 3, body: 3, sweetness: 3,
        }]);
    };

    const handleDeleteOrder = async (orderId: string) => {
        if (!confirm("이 커피 기록을 삭제하시겠습니까?")) return;
        try {
            await remove(dbRef(db, `orders/${orderId}`));
            setOrders(orders.filter(o => o.id !== orderId));
        } catch {
            alert("커피 삭제에 실패했습니다.");
        }
    };

    // ── 다른 메뉴 추가 / 삭제 ──
    const handleAddOtherMenu = () => {
        if (!selectedVisitId) { alert("먼저 방문 날짜를 선택하거나 추가해주세요."); return; }
        setNewMenuName("");
        setShowOtherMenuModal(true);
    };

    const confirmAddOtherMenu = async () => {
        if (!newMenuName.trim()) return;
        setShowOtherMenuModal(false);
        const menuRef = await push(dbRef(db, "other_items"), {
            visit_id: selectedVisitId,
            name: newMenuName.trim(),
            price: 0,
            rating: 3,
        });
        setOtherItems([...otherItems, {
            id: menuRef.key,
            visit_id: selectedVisitId,
            name: newMenuName.trim(),
            price: 0,
            rating: 3,
        }]);
    };

    const handleDeleteOtherMenu = async (itemId: string) => {
        if (!confirm("이 메뉴 기록을 삭제하시겠습니까?")) return;
        try {
            await remove(dbRef(db, `other_items/${itemId}`));
            setOtherItems(otherItems.filter(o => o.id !== itemId));
        } catch {
            alert("메뉴 삭제에 실패했습니다.");
        }
    };

    const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;
        if (atmosphereImages.length >= 10) { alert("사진은 최대 10장까지 업로드 가능합니다."); return; }
        setUploadingImage(true);
        try {
            const ext = file.name.split(".").pop();
            const filePath = `uploads/${user!.uid}/records/${params.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
            const sRef = storageRef(storage, filePath);
            await uploadBytes(sRef, file);
            const publicUrl = await getDownloadURL(sRef);
            const newImages = [...atmosphereImages, publicUrl];
            await update(dbRef(db, `records/${params.id}`), { atmosphere_images: newImages });
            setAtmosphereImages(newImages);
        } catch (error) {
            console.error("Error uploading image:", error);
            alert("이미지 업로드에 실패했습니다.");
        } finally {
            setUploadingImage(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    const handleUpdateBasicInfo = async () => {
        await update(dbRef(db, `records/${params.id}`), { name, location, rating, overall_memo: overallMemo });
        setRecord({ ...record, name, location, rating, overall_memo: overallMemo });
        setIsEditing(false);
    };

    const handleDelete = async () => {
        if (!confirm("정말로 이 기록을 삭제하시겠습니까?")) return;
        const [visitsSnap, ordersSnap, otherSnap] = await Promise.all([
            get(dbRef(db, "visits")),
            get(dbRef(db, "orders")),
            get(dbRef(db, "other_items")),
        ]);
        const visitsToDelete = snapToArray<any>(visitsSnap).filter(v => v.record_id === params.id);
        const visitIds = new Set(visitsToDelete.map(v => v.id));
        const ordersToDelete = snapToArray<any>(ordersSnap).filter(o => visitIds.has(o.visit_id));
        const otherToDelete = snapToArray<any>(otherSnap).filter(o => visitIds.has(o.visit_id));
        await Promise.all([
            ...ordersToDelete.map(o => remove(dbRef(db, `orders/${o.id}`))),
            ...otherToDelete.map(o => remove(dbRef(db, `other_items/${o.id}`))),
            ...visitsToDelete.map(v => remove(dbRef(db, `visits/${v.id}`))),
        ]);
        await remove(dbRef(db, `records/${params.id}`));
        alert("기록이 삭제되었습니다.");
        router.push("/records");
    };

    const totalAmount = orders.reduce((sum, o) => sum + (o.price || 0), 0);

    if (loading) {
        return (
            <div className="min-h-screen bg-coffee-cream/30 flex items-center justify-center">
                <div className="animate-spin w-12 h-12 border-4 border-coffee-brown border-t-transparent rounded-full" />
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

                <div className="coffee-card bg-white/90 backdrop-blur-sm p-6 space-y-8 shadow-2xl">

                    {/* ── 카페 기본 정보 ── */}
                    <div className="space-y-4">
                        <div className="flex justify-between items-start gap-4">
                            <div className="space-y-1 flex-1 min-w-0">
                                {isEditing ? (
                                    <input
                                        value={name}
                                        onChange={e => setName(e.target.value)}
                                        className="text-3xl font-black text-coffee-brown bg-transparent border-b-2 border-coffee-brown/20 outline-none w-full"
                                    />
                                ) : (
                                    <h2 className="text-4xl font-black text-coffee-brown tracking-tighter truncate">{record.name}</h2>
                                )}
                                <div className="flex items-center gap-1 text-coffee-brown/50 text-sm mt-1">
                                    <MapPin size={14} className="flex-shrink-0" />
                                    {isEditing ? (
                                        <input
                                            value={location}
                                            onChange={e => setLocation(e.target.value)}
                                            className="bg-transparent border-b border-coffee-brown/20 outline-none flex-1"
                                        />
                                    ) : (
                                        <span>{record.location}</span>
                                    )}
                                </div>
                            </div>
                            <div className="flex flex-col items-end gap-2 flex-shrink-0">
                                <div className="flex items-center text-yellow-600 font-bold bg-yellow-50 px-3 py-1.5 rounded-full border border-yellow-100">
                                    <Star size={18} fill="currentColor" className="mr-1.5" />
                                    {isEditing ? (
                                        <select value={rating} onChange={e => setRating(Number(e.target.value))} className="bg-transparent outline-none font-bold text-lg">
                                            {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n}</option>)}
                                        </select>
                                    ) : (
                                        <span className="text-lg">{record.rating}</span>
                                    )}
                                </div>
                                <div className="text-sm text-coffee-brown/50 font-medium">
                                    방문 <span className="text-blue-600 font-bold bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-100">{visits.length}</span> 회
                                </div>
                            </div>
                        </div>
                    </div>

                    <Divider />

                    {/* ── 방문 날짜 ── */}
                    <div className="space-y-3">
                        <SectionLabel icon={<Calendar size={15} />} text="방문 날짜" />
                        <div className="flex gap-3 border-2 border-blue-200/60 rounded-2xl p-4 bg-blue-50/30 flex-wrap min-h-[80px] items-start content-start">
                            <button
                                onClick={handleAddVisit}
                                className="flex-shrink-0 w-[110px] h-[44px] border-2 border-dashed border-coffee-brown/25 rounded-lg flex items-center justify-center gap-1.5 hover:bg-white/60 transition-all text-coffee-brown/50 hover:text-coffee-brown text-xs font-bold"
                            >
                                <span>+ 날짜 추가</span>
                            </button>
                            {visits.map(visit => (
                                <div key={visit.id} className="relative flex-shrink-0 inline-flex group">
                                    <button
                                        onClick={() => setSelectedVisitId(visit.id)}
                                        className={`h-[44px] px-4 border rounded-lg flex items-center gap-2 font-medium transition-all text-sm ${selectedVisitId === visit.id
                                            ? "bg-blue-600 text-white border-blue-700 shadow-md"
                                            : "bg-white text-coffee-brown/60 border-coffee-brown/10 hover:border-blue-300"
                                            }`}
                                    >
                                        <Calendar size={13} />
                                        {visit.date}
                                    </button>
                                    <button
                                        onClick={e => { e.stopPropagation(); handleDeleteVisit(visit.id); }}
                                        className="absolute -top-2 -right-2 bg-red-100 text-red-500 rounded-full w-5 h-5 flex items-center justify-center text-[10px] sm:opacity-0 sm:group-hover:opacity-100 transition-opacity hover:bg-red-500 hover:text-white shadow-sm border border-red-200 z-10"
                                    >✕</button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* ── 주문한 커피 ── */}
                    <div className="space-y-3">
                        <SectionLabel icon={<Coffee size={15} />} text="주문한 커피" />
                        <div className="flex gap-3 border-2 border-blue-200/60 rounded-2xl p-4 bg-blue-50/30 flex-wrap min-h-[80px] items-start content-start">
                            <button
                                onClick={handleAddOrder}
                                className="flex-shrink-0 w-[110px] h-[44px] border-2 border-dashed border-coffee-brown/25 rounded-lg flex items-center justify-center gap-1.5 hover:bg-white/60 transition-all text-coffee-brown/50 hover:text-coffee-brown text-xs font-bold"
                            >
                                <span>+ 커피 추가</span>
                            </button>
                            {orders.length > 0 ? orders.map(order => (
                                <div key={order.id} className="relative flex-shrink-0 group">
                                    <Link
                                        href={`/records/${params.id}/orders/${order.id}`}
                                        className="flex w-[170px] bg-white border border-coffee-brown/10 rounded-xl p-3 flex-col gap-2 hover:border-blue-400 hover:shadow-md transition-all shadow-sm"
                                    >
                                        <span className="font-bold text-coffee-brown text-sm group-hover:text-blue-600 truncate leading-tight">
                                            {order.drink_name}
                                        </span>
                                        <div className="flex items-center justify-between text-xs">
                                            {order.price > 0
                                                ? <span className="font-semibold text-coffee-brown/60">₩{order.price.toLocaleString()}</span>
                                                : <span className="text-coffee-brown/25">가격 미입력</span>
                                            }
                                            <div className="flex items-center gap-0.5 text-yellow-500">
                                                <Star size={11} fill="currentColor" />
                                                <span className="font-bold text-coffee-brown/60">{order.rating}</span>
                                            </div>
                                        </div>
                                        <div className="flex gap-1.5">
                                            {[
                                                { label: "A", val: order.acidity },
                                                { label: "B", val: order.body },
                                                { label: "S", val: order.sweetness },
                                            ].map(({ label, val }) => (
                                                <div key={label} className="flex-1 flex flex-col items-center gap-0.5">
                                                    <span className="text-[9px] text-coffee-brown/30 font-bold">{label}</span>
                                                    <div className="w-full h-1.5 bg-coffee-brown/8 rounded-full overflow-hidden">
                                                        <div className="h-full bg-coffee-brown/30 rounded-full transition-all" style={{ width: `${(val / 5) * 100}%` }} />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </Link>
                                    <button
                                        onClick={e => { e.preventDefault(); handleDeleteOrder(order.id); }}
                                        className="absolute -top-2 -right-2 bg-red-100 text-red-500 rounded-full w-5 h-5 flex items-center justify-center text-[10px] sm:opacity-0 sm:group-hover:opacity-100 transition-opacity hover:bg-red-500 hover:text-white shadow-sm border border-red-200 z-10"
                                    >✕</button>
                                </div>
                            )) : (
                                <div className="flex items-center text-coffee-brown/30 text-xs italic pl-2 self-center">
                                    기록된 커피가 없습니다.
                                </div>
                            )}
                        </div>

                        {totalAmount > 0 && (
                            <div className="flex items-center justify-between bg-coffee-brown/5 rounded-xl px-5 py-3">
                                <span className="text-sm text-coffee-brown/60 font-medium">이번 방문 커피구매 총액</span>
                                <span className="text-xl font-black text-coffee-brown">₩{totalAmount.toLocaleString()}</span>
                            </div>
                        )}
                    </div>

                    {/* ── 주문한 다른 메뉴 ── */}
                    <div className="space-y-3">
                        <SectionLabel icon={<UtensilsCrossed size={15} />} text="주문한 다른 메뉴" />
                        <div className="flex gap-3 border-2 border-orange-200/60 rounded-2xl p-4 bg-orange-50/20 flex-wrap min-h-[80px] items-start content-start">
                            <button
                                onClick={handleAddOtherMenu}
                                className="flex-shrink-0 w-[110px] h-[44px] border-2 border-dashed border-coffee-brown/25 rounded-lg flex items-center justify-center gap-1.5 hover:bg-white/60 transition-all text-coffee-brown/50 hover:text-coffee-brown text-xs font-bold"
                            >
                                <span>+ 메뉴 추가</span>
                            </button>
                            {otherItems.length > 0 ? otherItems.map(item => (
                                <div key={item.id} className="relative flex-shrink-0 group">
                                    <div className="w-[160px] bg-white border border-coffee-brown/10 rounded-xl p-3 flex flex-col gap-2 shadow-sm">
                                        <span className="font-bold text-coffee-brown text-sm truncate leading-tight">
                                            {item.name}
                                        </span>
                                        <div className="flex items-center justify-between text-xs">
                                            {item.price > 0
                                                ? <span className="font-semibold text-coffee-brown/60">₩{item.price.toLocaleString()}</span>
                                                : <span className="text-coffee-brown/25">가격 미입력</span>
                                            }
                                            <div className="flex items-center gap-0.5 text-yellow-500">
                                                <Star size={11} fill="currentColor" />
                                                <span className="font-bold text-coffee-brown/60">{item.rating}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleDeleteOtherMenu(item.id)}
                                        className="absolute -top-2 -right-2 bg-red-100 text-red-500 rounded-full w-5 h-5 flex items-center justify-center text-[10px] sm:opacity-0 sm:group-hover:opacity-100 transition-opacity hover:bg-red-500 hover:text-white shadow-sm border border-red-200 z-10"
                                    >✕</button>
                                </div>
                            )) : (
                                <div className="flex items-center text-coffee-brown/30 text-xs italic pl-2 self-center">
                                    기록된 다른 메뉴가 없습니다.
                                </div>
                            )}
                        </div>
                    </div>

                    <Divider />

                    {/* ── 카페 분위기 ── */}
                    <div className="space-y-4">
                        <SectionLabel icon={<Camera size={15} />} text="카페 분위기" />
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                            {atmosphereImages.map((imgUrl, index) => (
                                <div key={index} className="aspect-square rounded-xl border border-gray-200 overflow-hidden relative shadow-sm group">
                                    <img src={imgUrl} alt={`분위기 ${index}`} className="w-full h-full object-cover" />
                                </div>
                            ))}
                            {atmosphereImages.length < 10 && (
                                <div
                                    onClick={() => fileInputRef.current?.click()}
                                    className="aspect-square bg-gray-50 rounded-xl flex flex-col items-center justify-center text-gray-400 gap-2 border-2 border-dashed border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors"
                                >
                                    <Camera size={22} />
                                    <span className="text-[10px] text-center px-1 leading-tight">
                                        {uploadingImage ? "업로드 중..." : "사진 추가"}
                                    </span>
                                </div>
                            )}
                            <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageUpload} className="hidden" />
                        </div>
                    </div>

                    <Divider />

                    {/* ── 총평 ── */}
                    <div className="space-y-4">
                        <SectionLabel icon={<Star size={15} />} text="총평" />
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <span className="text-sm text-coffee-brown/50 font-medium w-16">총평점</span>
                                <div className="flex gap-1.5">
                                    {[1, 2, 3, 4, 5].map(s => (
                                        <Star
                                            key={s}
                                            size={20}
                                            fill={record.rating >= s ? "currentColor" : "none"}
                                            className={record.rating >= s ? "text-yellow-400" : "text-coffee-brown/15"}
                                        />
                                    ))}
                                </div>
                                <span className="text-sm font-bold text-coffee-brown/60">{record.rating}점</span>
                            </div>

                            <div className="space-y-2">
                                <span className="text-sm text-coffee-brown/50 font-medium">총평글</span>
                                {isEditing ? (
                                    <textarea
                                        value={overallMemo}
                                        onChange={e => setOverallMemo(e.target.value)}
                                        placeholder="이 카페에 대한 전반적인 인상을 남겨주세요."
                                        className="w-full h-32 px-4 py-3 rounded-xl border border-coffee-brown/10 bg-white focus:outline-none focus:ring-2 focus:ring-coffee-brown/20 transition-all resize-none text-sm"
                                    />
                                ) : (
                                    <div className={`px-4 py-3 rounded-xl bg-coffee-brown/[0.03] border border-coffee-brown/8 text-sm leading-relaxed ${record.overall_memo ? "text-coffee-brown" : "text-coffee-brown/30 italic"}`}>
                                        {record.overall_memo || "총평이 없습니다. 수정 버튼을 눌러 추가해보세요."}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <Divider />

                    {/* ── Actions ── */}
                    <div className="flex gap-4 pt-2">
                        {isEditing ? (
                            <>
                                <button
                                    onClick={handleUpdateBasicInfo}
                                    className="flex-1 bg-blue-600 text-white py-4 rounded-xl font-bold shadow-lg hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
                                >
                                    저장
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
                                    className="flex-1 bg-[#4d443e] text-white py-3 rounded-xl font-bold hover:bg-[#3d3632] transition-all flex items-center justify-center gap-1.5 text-xs"
                                >
                                    <Edit2 size={13} /> 기록 수정하기
                                </button>
                                <button
                                    onClick={handleDelete}
                                    className="flex-1 bg-[#53585f] text-white py-3 rounded-xl font-bold hover:bg-[#43484f] transition-all flex items-center justify-center gap-1.5 text-xs"
                                >
                                    <Trash2 size={13} /> 삭제하기
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* ── 날짜 추가 모달 ── */}
            {showDateModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl p-6 shadow-2xl w-full max-w-sm space-y-5">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Calendar size={18} className="text-blue-600" />
                                <h3 className="font-bold text-coffee-brown text-lg">날짜 추가</h3>
                            </div>
                            <button
                                onClick={() => setShowDateModal(false)}
                                className="text-coffee-brown/40 hover:text-coffee-brown transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <input
                            type="date"
                            value={newDate}
                            onChange={e => setNewDate(e.target.value)}
                            className="w-full border border-coffee-brown/20 rounded-xl px-4 py-3 text-coffee-brown outline-none focus:ring-2 focus:ring-blue-300 transition-all text-sm"
                        />
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowDateModal(false)}
                                className="flex-1 py-3 rounded-xl border border-coffee-brown/20 text-coffee-brown/60 font-medium hover:bg-gray-50 transition-all text-sm"
                            >취소</button>
                            <button
                                onClick={confirmAddVisit}
                                className="flex-1 py-3 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition-all text-sm"
                            >추가하기</button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── 커피 추가 모달 ── */}
            {showCoffeeModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl p-6 shadow-2xl w-full max-w-sm space-y-5">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Coffee size={18} className="text-coffee-brown" />
                                <h3 className="font-bold text-coffee-brown text-lg">커피 추가</h3>
                            </div>
                            <button
                                onClick={() => setShowCoffeeModal(false)}
                                className="text-coffee-brown/40 hover:text-coffee-brown transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <input
                            type="text"
                            value={newCoffeeName}
                            onChange={e => setNewCoffeeName(e.target.value)}
                            onKeyDown={e => e.key === "Enter" && confirmAddOrder()}
                            placeholder="커피 이름을 입력하세요 (예: 아메리카노)"
                            className="w-full border border-coffee-brown/20 rounded-xl px-4 py-3 text-coffee-brown outline-none focus:ring-2 focus:ring-coffee-brown/20 transition-all text-sm placeholder:text-coffee-brown/30"
                            autoFocus
                        />
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowCoffeeModal(false)}
                                className="flex-1 py-3 rounded-xl border border-coffee-brown/20 text-coffee-brown/60 font-medium hover:bg-gray-50 transition-all text-sm"
                            >취소</button>
                            <button
                                onClick={confirmAddOrder}
                                className="flex-1 py-3 rounded-xl bg-coffee-brown text-white font-bold hover:bg-coffee-brown/80 transition-all text-sm"
                            >추가하기</button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── 다른 메뉴 추가 모달 ── */}
            {showOtherMenuModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl p-6 shadow-2xl w-full max-w-sm space-y-5">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <UtensilsCrossed size={18} className="text-orange-500" />
                                <h3 className="font-bold text-coffee-brown text-lg">다른 메뉴 추가</h3>
                            </div>
                            <button
                                onClick={() => setShowOtherMenuModal(false)}
                                className="text-coffee-brown/40 hover:text-coffee-brown transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <input
                            type="text"
                            value={newMenuName}
                            onChange={e => setNewMenuName(e.target.value)}
                            onKeyDown={e => e.key === "Enter" && confirmAddOtherMenu()}
                            placeholder="메뉴 이름을 입력하세요 (예: 스콘, 케이크)"
                            className="w-full border border-coffee-brown/20 rounded-xl px-4 py-3 text-coffee-brown outline-none focus:ring-2 focus:ring-orange-200 transition-all text-sm placeholder:text-coffee-brown/30"
                            autoFocus
                        />
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowOtherMenuModal(false)}
                                className="flex-1 py-3 rounded-xl border border-coffee-brown/20 text-coffee-brown/60 font-medium hover:bg-gray-50 transition-all text-sm"
                            >취소</button>
                            <button
                                onClick={confirmAddOtherMenu}
                                className="flex-1 py-3 rounded-xl bg-orange-500 text-white font-bold hover:bg-orange-600 transition-all text-sm"
                            >추가하기</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function Divider() {
    return <hr className="border-coffee-brown/8" />;
}

function SectionLabel({ icon, text }: { icon: React.ReactNode; text: string }) {
    return (
        <div className="flex items-center gap-2 text-sm font-bold text-coffee-brown/60">
            {icon}
            <span className="uppercase tracking-wider text-xs">{text}</span>
        </div>
    );
}
