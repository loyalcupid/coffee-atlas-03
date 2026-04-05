"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Home, Coffee, Star, MapPin, Search, ExternalLink, ChevronRight } from "lucide-react";
import { fetchRecordsWithDetails, RecordSummary } from "@/lib/data";

export default function MapPage() {
    const [records, setRecords] = useState<RecordSummary[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        fetchRecordsWithDetails()
            .then(setRecords)
            .catch((err) => console.error("Error fetching records:", err))
            .finally(() => setLoading(false));
    }, []);

    const filteredRecords = records.filter(
        (r) =>
            r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            r.location.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const openInNaverMaps = (record: RecordSummary) => {
        const query = encodeURIComponent(`${record.name} ${record.location}`);
        window.open(`https://map.naver.com/v5/search/${query}`, "_blank");
    };

    return (
        <div className="min-h-screen bg-coffee-cream/30 flex flex-col">
            {/* Header */}
            <header className="p-6 md:px-12 bg-white/50 backdrop-blur-md border-b border-coffee-brown/10 flex items-center justify-between sticky top-0 z-50">
                <div className="flex items-center gap-4">
                    <Link href="/" className="p-2 hover:bg-coffee-brown/5 rounded-full transition-colors text-coffee-brown">
                        <Home size={24} />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-coffee-brown leading-tight">나의 카페 지도</h1>
                        <p className="text-xs text-coffee-brown/60">방문한 카페를 네이버 지도에서 찾아보세요</p>
                    </div>
                </div>
                <Link
                    href="/add-record"
                    className="bg-coffee-brown text-coffee-cream px-4 py-2 rounded-lg text-sm font-bold shadow-md hover:bg-coffee-brown/90 transition-all hidden sm:block"
                >
                    기록 추가
                </Link>
            </header>

            <main className="flex-1 max-w-4xl w-full mx-auto p-6 space-y-6">
                {/* Search Bar */}
                <div className="relative group">
                    <Search
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-coffee-brown/30 group-focus-within:text-coffee-brown transition-colors"
                        size={20}
                    />
                    <input
                        type="text"
                        placeholder="카페 이름이나 위치로 검색..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 rounded-2xl border border-coffee-brown/10 bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-4 focus:ring-coffee-brown/5 transition-all shadow-sm text-coffee-brown placeholder:text-coffee-brown/30"
                    />
                </div>

                {/* Cafe List */}
                <div className="space-y-4">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20">
                            <div className="animate-spin w-10 h-10 border-4 border-coffee-brown border-t-transparent rounded-full mb-4"></div>
                            <p className="text-coffee-brown/60 font-medium">카페 정보를 불러오는 중...</p>
                        </div>
                    ) : filteredRecords.length > 0 ? (
                        filteredRecords.map((record) => (
                            <div
                                key={record.id}
                                onClick={() => openInNaverMaps(record)}
                                className="bg-white/80 backdrop-blur-sm border border-coffee-brown/10 p-5 rounded-2xl flex items-center justify-between group cursor-pointer hover:border-coffee-brown/30 hover:shadow-lg transition-all active:scale-[0.98]"
                            >
                                <div className="flex items-center gap-5">
                                    <div className="w-14 h-14 bg-coffee-brown/5 text-coffee-brown rounded-xl flex items-center justify-center group-hover:bg-coffee-brown group-hover:text-coffee-cream transition-all duration-300">
                                        <Coffee size={28} />
                                    </div>
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <h3 className="text-xl font-bold text-coffee-brown group-hover:text-coffee-accent transition-colors">
                                                {record.name}
                                            </h3>
                                            <div className="flex items-center text-xs text-yellow-600 font-bold bg-yellow-50 px-2 py-0.5 rounded shadow-sm">
                                                <Star size={12} fill="currentColor" className="mr-0.5" /> {record.rating}
                                            </div>
                                        </div>
                                        <p className="text-coffee-brown/60 text-sm font-medium">{record.drink}</p>
                                        <div className="flex items-center gap-3 text-xs text-coffee-brown/40">
                                            <span className="flex items-center gap-1">
                                                <MapPin size={14} /> {record.location}
                                            </span>
                                            <span>•</span>
                                            <span>{record.date}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="hidden md:flex items-center gap-1 text-xs font-bold text-coffee-brown/40 group-hover:text-coffee-brown transition-colors">
                                        <span>네이버 지도</span>
                                        <ExternalLink size={14} />
                                    </div>
                                    <ChevronRight
                                        className="text-coffee-brown/20 group-hover:text-coffee-brown group-hover:translate-x-1 transition-all"
                                        size={24}
                                    />
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-20 bg-white/40 rounded-3xl border-2 border-dashed border-coffee-brown/10">
                            <Coffee size={48} className="mx-auto text-coffee-brown/10 mb-4" />
                            <p className="text-coffee-brown/60 font-medium">
                                {searchTerm ? `"${searchTerm}" 검색 결과가 없습니다.` : "아직 기록이 없습니다."}
                            </p>
                            {!searchTerm && (
                                <Link href="/add-record" className="mt-4 inline-block text-sm font-bold text-coffee-brown hover:underline">
                                    첫 카페 기록하기 →
                                </Link>
                            )}
                        </div>
                    )}
                </div>
            </main>

            <footer className="p-8 text-center text-coffee-brown/40 text-sm border-t border-coffee-brown/5 bg-white/20 mt-auto">
                <p>리스트를 클릭하면 네이버 지도로 연결됩니다.</p>
            </footer>
        </div>
    );
}
