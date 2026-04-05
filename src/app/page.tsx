import Link from "next/link";
import { Coffee, Map, TrendingUp, User } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center">
      {/* Hero Section */}
      <section className="w-full max-w-6xl px-6 py-20 flex flex-col items-center text-center space-y-8">
        <div className="inline-flex items-center space-x-2 bg-coffee-brown/10 text-coffee-brown px-4 py-2 rounded-full font-medium mb-4">
          <Coffee size={20} />
          <span>당신의 커피 취향을 기록하세요</span>
        </div>
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-coffee-brown leading-tight">
          <Link href="/records" className="hover:text-coffee-accent transition-colors">
            Coffee <span className="text-coffee-accent">Atlas</span>
          </Link>
        </h1>
        <p className="text-xl md:text-2xl text-coffee-brown/80 max-w-2xl leading-relaxed">
          어떤 카페가 좋았나요? 그날의 향기와 맛을 기록하고, <br className="hidden md:block" />
          당신만의 특별한 커피 취향을 지도로 만들어보세요.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 pt-4">
          <Link
            href="/add-record"
            className="bg-coffee-brown text-coffee-cream px-10 py-4 rounded-xl text-lg font-bold shadow-xl hover:bg-coffee-brown/90 transition-all hover:-translate-y-1 text-center"
          >
            카페 방문 기록 남기기
          </Link>
          <Link
            href="/dashboard"
            className="bg-transparent border-2 border-coffee-brown text-coffee-brown px-10 py-4 rounded-xl text-lg font-bold hover:bg-coffee-brown/5 transition-all text-center"
          >
            나의 커피 취향 분석
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white/50 w-full py-20 border-y border-coffee-brown/10">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
          <Link href="/map" className="space-y-4 flex flex-col items-center group cursor-pointer">
            <div className="w-16 h-16 bg-coffee-brown text-coffee-cream rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
              <Map size={32} />
            </div>
            <h3 className="text-2xl font-bold text-coffee-brown group-hover:text-coffee-accent transition-colors">나의 카페 지도</h3>
            <p className="text-coffee-brown/70">
              기록에 남긴 카페 주소를 기반으로, 내가 다녀온 카페들을 지도에서 한눈에 확인해 보세요.
            </p>
          </Link>
          <div className="space-y-4 flex flex-col items-center">
            <div className="w-16 h-16 bg-coffee-accent text-coffee-brown rounded-2xl flex items-center justify-center shadow-lg">
              <TrendingUp size={32} />
            </div>
            <h3 className="text-2xl font-bold text-coffee-brown">커피 맛 추천 카페</h3>
            <p className="text-coffee-brown/70">
              산미, 바디감, 단맛 등 데이터를 바탕으로 취향을 분석해드립니다.
            </p>
          </div>
          <div className="space-y-4 flex flex-col items-center">
            <div className="w-16 h-16 bg-coffee-brown/20 text-coffee-brown rounded-2xl flex items-center justify-center shadow-lg">
              <User size={32} />
            </div>
            <h3 className="text-2xl font-bold text-coffee-brown">나의 커피 사전</h3>
            <p className="text-coffee-brown/70">
              월간 통계와 소비 금액을 한눈에 확인하고 취향을 깊게 알아가세요.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full max-w-4xl px-6 py-20 text-center">
        <div className="coffee-card bg-coffee-brown text-coffee-cream border-none p-12 space-y-6">
          <h2 className="text-3xl font-bold">지금 바로 커피 지도를 완성해보세요</h2>
          <p className="text-coffee-cream/80 text-lg">
            500명 이상의 카페 애호가들과 함께 커피 취향을 찾아가는 여정에 합류하세요.
          </p>
          <button className="bg-coffee-cream text-coffee-brown px-8 py-3 rounded-lg font-bold hover:bg-white transition-all">
            무료로 시작하기
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full py-10 text-center text-coffee-brown/60 border-t border-coffee-brown/10 mt-auto">
        <p>© 2026 Coffee Atlas. All rights reserved.</p>
      </footer>
    </div>
  );
}
