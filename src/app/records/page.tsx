"use client";

import { Search, Filter, Coffee, MapPin, Star, ChevronRight, Home } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { fetchRecordsWithDetails, RecordSummary } from "@/lib/data";
import { useRequireAuth } from "@/lib/useRequireAuth";

export default function MyRecords() {
    const { authLoading } = useRequireAuth();
    const [records, setRecords] = useState<RecordSummary[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        fetchRecordsWithDetails()
            .then(setRecords)
            .catch((err) => console.error('Error fetching records:', err))
            .finally(() => setLoading(false));
    }, []);

    const filteredRecords = records.filter((r) =>
        r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.location.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (authLoading) return (
        <div className="min-h-screen bg-coffee-cream/30 flex items-center justify-center">
            <div className="w-10 h-10 border-4 border-coffee-brown border-t-transparent rounded-full animate-spin" />
        </div>
    );

    return (
        <div className="min-h-screen bg-coffee-cream/30 p-6 md:p-12">
            <div className="max-w-4xl mx-auto space-y-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <Link href="/" className="p-2 hover:bg-coffee-brown/5 rounded-full transition-colors text-coffee-brown">
                            <Home size={24} />
                        </Link>
                        <h1 className="text-3xl font-bold text-coffee-brown">나의 기록들</h1>
                    </div>
                    <Link href="/add-record" className="bg-coffee-brown text-coffee-cream px-6 py-3 rounded-xl font-bold shadow-lg text-center">
                        새 기록 추가
                    </Link>
                </div>

                {/* Search & Filter */}
                <div className="flex gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-coffee-brown/30" size={20} />
                        <input
                            type="text"
                            placeholder="카페 이름이나 위치로 검색..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-4 rounded-xl border border-coffee-brown/10 bg-white focus:outline-none focus:ring-2 focus:ring-coffee-brown/20 transition-all shadow-sm"
                        />
                    </div>
                    <button
                        onClick={() => setSearchTerm("")}
                        className="bg-white border border-coffee-brown/10 p-4 rounded-xl text-coffee-brown/60 hover:text-coffee-brown transition-colors shadow-sm"
                        title="필터 초기화"
                    >
                        <Filter size={20} />
                    </button>
                </div>

                {/* Records List */}
                <div className="space-y-4">
                    {loading ? (
                        <div className="text-center py-20">
                            <div className="animate-spin w-8 h-8 border-4 border-coffee-brown border-t-transparent rounded-full mx-auto mb-4"></div>
                            <p className="text-coffee-brown/40">기록을 불러오는 중...</p>
                        </div>
                    ) : filteredRecords.map((record) => (
                        <Link
                            key={record.id}
                            href={`/records/${record.id}`}
                            className="coffee-card flex justify-between items-center group cursor-pointer hover:border-coffee-brown/40"
                        >
                            <div className="flex items-center space-x-4">
                                <div className="w-16 h-16 bg-coffee-brown/5 rounded-2xl flex items-center justify-center text-coffee-brown group-hover:bg-coffee-accent/20 transition-colors">
                                    <Coffee size={28} />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h3 className="text-lg font-bold text-coffee-brown">{record.name}</h3>
                                        <div className="flex items-center text-xs text-yellow-600 font-bold bg-yellow-50 px-2 py-0.5 rounded">
                                            <Star size={12} fill="currentColor" /> {record.rating}
                                        </div>
                                    </div>
                                    <p className="text-coffee-brown/60 text-sm">{record.drink}</p>
                                    <div className="flex items-center gap-4 mt-1">
                                        <span className="text-xs text-coffee-brown/40 flex items-center gap-1 group/loc">
                                            <MapPin size={12} /> {record.location}
                                            <button
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    window.open(`https://map.naver.com/v5/search/${encodeURIComponent(record.name)}`, '_blank');
                                                }}
                                                className="ml-1 text-[10px] text-blue-500 hover:underline hidden group-hover/loc:inline-block"
                                            >
                                                지도보기
                                            </button>
                                        </span>
                                        <span className="text-xs text-coffee-brown/40">{record.date}</span>
                                    </div>
                                </div>
                            </div>
                            <ChevronRight className="text-coffee-brown/20 group-hover:text-coffee-brown transition-all translate-x-0 group-hover:translate-x-1" />
                        </Link>
                    ))}
                </div>

                {!loading && filteredRecords.length === 0 && (
                    <div className="text-center py-20 bg-white/50 rounded-3xl border-2 border-dashed border-coffee-brown/10">
                        <Coffee size={48} className="mx-auto text-coffee-brown/10 mb-4" />
                        <p className="text-coffee-brown/40">
                            {searchTerm ? `"${searchTerm}" 검색 결과가 없습니다.` : "아직 기록이 없습니다. 첫 커피를 기록해보세요!"}
                        </p>
                        {!searchTerm && (
                            <Link href="/add-record" className="mt-4 inline-block text-sm font-bold text-coffee-brown hover:underline">
                                첫 카페 기록하기 →
                            </Link>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
