"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { auth, db, googleProvider } from "@/lib/firebase";
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  onAuthStateChanged,
} from "firebase/auth";
import { ref, get, set, update } from "firebase/database";
import { Coffee, Mail, Lock, LogIn, Home, AlertTriangle } from "lucide-react";

function detectInAppBrowser(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  return (
    /KAKAOTALK|NAVER|Instagram|FB_IAB|FB4A|FBAV|Line\/|Twitter/i.test(ua) ||
    /Android.*wv\)/i.test(ua) ||
    (/iPhone|iPad|iPod/i.test(ua) && !/Safari/i.test(ua) && /AppleWebKit/i.test(ua))
  );
}

function isMobileBrowser(): boolean {
  if (typeof navigator === "undefined") return false;
  return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
}

function getAuthErrorMsg(code: string): string {
  const map: Record<string, string> = {
    "auth/invalid-credential":      "이메일 또는 비밀번호가 올바르지 않습니다.",
    "auth/user-not-found":          "등록되지 않은 이메일입니다.",
    "auth/wrong-password":          "비밀번호가 올바르지 않습니다.",
    "auth/invalid-email":           "유효하지 않은 이메일 형식입니다.",
    "auth/too-many-requests":       "잠시 후 다시 시도해주세요.",
    "auth/network-request-failed":  "네트워크 오류가 발생했습니다.",
    "auth/popup-blocked":           "팝업이 차단되었습니다. 브라우저 설정에서 팝업을 허용해주세요.",
    "auth/popup-closed-by-user":    "",
    "auth/cancelled-popup-request": "",
  };
  return map[code] ?? "로그인 중 오류가 발생했습니다.";
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/";
  const [email, setEmail]               = useState("");
  const [password, setPassword]         = useState("");
  const [error, setError]               = useState("");
  const [loading, setLoading]           = useState(false);
  const [inAppBrowser, setInAppBrowser] = useState(false);

  useEffect(() => {
    setInAppBrowser(detectInAppBrowser());
  }, []);

  // 모바일 redirect 로그인 완료 후 결과 처리
  useEffect(() => {
    let redirectHandled = false;
    let authUnsub: (() => void) | null = null;

    const doRedirect = (uid?: string) => {
      if (redirectHandled) return;
      redirectHandled = true;
      void uid; // DB 업데이트는 getRedirectResult 경로에서만 처리
      const saved = sessionStorage.getItem("googleLoginRedirect") || redirectTo;
      sessionStorage.removeItem("googleLoginRedirect");
      router.replace(saved);
    };

    getRedirectResult(auth)
      .then(async (cred) => {
        if (cred) {
          // 새 로그인: DB 업데이트 후 리다이렉트
          setLoading(true);
          const u = cred.user;
          const userRef = ref(db, `users/${u.uid}`);
          const snap = await get(userRef);
          if (!snap.exists()) {
            await set(userRef, {
              email: u.email,
              displayName: u.displayName,
              provider: "google.com",
              createdAt: Date.now(),
              lastLogin: Date.now(),
            });
          } else {
            await update(userRef, { lastLogin: Date.now() });
          }
          doRedirect(cred.user.uid);
        } else {
          // getRedirectResult가 null인 경우:
          // 모바일 Chrome의 서드파티 쿠키 제한으로 redirect 상태가 소실되어도
          // Firebase는 auth 상태를 복원하므로 onAuthStateChanged로 fallback
          authUnsub = onAuthStateChanged(auth, (u) => {
            if (u) doRedirect(u.uid);
          });
        }
      })
      .catch((err: unknown) => {
        const msg = getAuthErrorMsg((err as { code: string }).code);
        if (msg) setError(msg);
      })
      .finally(() => setLoading(false));

    return () => {
      redirectHandled = true;
      if (authUnsub) authUnsub();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      const u = cred.user;
      const userRef = ref(db, `users/${u.uid}`);
      const snap = await get(userRef);
      if (!snap.exists()) {
        await set(userRef, {
          email: u.email,
          displayName: u.displayName,
          provider: "email",
          createdAt: Date.now(),
          lastLogin: Date.now(),
        });
      } else {
        await update(userRef, { lastLogin: Date.now() });
      }
      router.push(redirectTo);
    } catch (err: unknown) {
      const msg = getAuthErrorMsg((err as { code: string }).code);
      if (msg) setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    if (inAppBrowser) {
      setError("카카오톡·인스타그램 등 앱 내 브라우저에서는 Google 로그인을 사용할 수 없습니다. 우측 하단 ··· 메뉴에서 '브라우저에서 열기'를 선택해주세요.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      if (isMobileBrowser()) {
        // 모바일: 새 탭 opener 통신 실패 문제를 피해 redirect 방식 사용
        sessionStorage.setItem("googleLoginRedirect", redirectTo);
        await signInWithRedirect(auth, googleProvider);
      } else {
        // 데스크탑: popup 방식
        const cred = await signInWithPopup(auth, googleProvider);
        const u = cred.user;
        const userRef = ref(db, `users/${u.uid}`);
        const snap = await get(userRef);
        if (!snap.exists()) {
          await set(userRef, {
            email: u.email,
            displayName: u.displayName,
            provider: "google.com",
            createdAt: Date.now(),
            lastLogin: Date.now(),
          });
        } else {
          await update(userRef, { lastLogin: Date.now() });
        }
        router.push(redirectTo);
        setLoading(false);
      }
    } catch (err: unknown) {
      const msg = getAuthErrorMsg((err as { code: string }).code);
      if (msg) setError(msg);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen cafe-bg flex flex-col items-center justify-center px-6">

      <div className="w-full max-w-md space-y-8">

        {/* Logo */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2 text-[#D4AF37]/50 hover:text-[#D4AF37] transition-colors text-sm cormorant mb-4">
            <Home size={14} /> 홈으로
          </Link>
          <div className="flex justify-center">
            <div className="w-14 h-14 rounded-2xl bg-[#D4AF37]/10 border border-[#D4AF37]/30 flex items-center justify-center">
              <Coffee size={28} className="text-[#D4AF37]" />
            </div>
          </div>
          <h1 className="cafe-sign-title text-3xl text-[#FCF5E5]">Coffee Atlas</h1>
          <p className="cormorant text-[#FCF5E5]/40 text-lg">로그인하여 나만의 커피 기록을 시작하세요.</p>
        </div>

        {/* 인앱 브라우저 안내 배너 */}
        {inAppBrowser && (
          <div className="flex items-start gap-3 bg-amber-500/15 border border-amber-500/30 rounded-xl px-4 py-3">
            <AlertTriangle size={16} className="text-amber-400 mt-0.5 shrink-0" />
            <p className="text-amber-300 text-sm leading-relaxed">
              현재 앱 내 브라우저에서 열려 있습니다.<br />
              Google 로그인은 <strong>Chrome 또는 Safari</strong>에서만 사용 가능합니다.<br />
              <span className="text-amber-400/70 text-xs">우측 하단 ··· 메뉴 → &apos;브라우저에서 열기&apos; 선택</span>
            </p>
          </div>
        )}

        {/* Card */}
        <div className="sign-frame rounded-2xl p-8 space-y-5">

          {/* Google login */}
          <button
            onClick={handleGoogle}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 bg-white text-[#3D2B1F] py-3.5 rounded-xl font-bold text-sm hover:bg-gray-50 transition-all shadow-md disabled:opacity-60"
          >
            <svg width="18" height="18" viewBox="0 0 18 18">
              <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" />
              <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" />
              <path fill="#FBBC05" d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z" />
              <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.961L3.964 7.293C4.672 5.163 6.656 3.58 9 3.58z" />
            </svg>
            Google로 로그인
          </button>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-[#D4AF37]/15" />
            <span className="cormorant text-[#FCF5E5]/30 text-sm">또는</span>
            <div className="flex-1 h-px bg-[#D4AF37]/15" />
          </div>

          {/* Email form */}
          <form onSubmit={handleEmail} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#FCF5E5]/50 uppercase tracking-widest flex items-center gap-1.5">
                <Mail size={12} /> 이메일
              </label>
              <input
                type="email"
                placeholder="example@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl bg-white/8 border border-[#D4AF37]/20 text-[#FCF5E5] placeholder-[#FCF5E5]/25 focus:outline-none focus:border-[#D4AF37]/50 focus:ring-1 focus:ring-[#D4AF37]/30 transition-all text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#FCF5E5]/50 uppercase tracking-widest flex items-center gap-1.5">
                <Lock size={12} /> 비밀번호
              </label>
              <input
                type="password"
                placeholder="비밀번호를 입력하세요"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl bg-white/8 border border-[#D4AF37]/20 text-[#FCF5E5] placeholder-[#FCF5E5]/25 focus:outline-none focus:border-[#D4AF37]/50 focus:ring-1 focus:ring-[#D4AF37]/30 transition-all text-sm"
              />
            </div>

            {error && (
              <p className="text-amber-300 text-sm text-center bg-amber-400/10 rounded-lg py-2.5 px-4 border border-amber-400/20 leading-relaxed">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#D4AF37] text-[#1a0f0a] py-3.5 rounded-xl font-bold text-sm hover:bg-[#e8c84a] transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-60 playfair"
            >
              <LogIn size={16} /> {loading ? "로그인 중..." : "이메일로 로그인"}
            </button>
          </form>

          <p className="text-center cormorant text-[#FCF5E5]/35 text-base">
            계정이 없으신가요?{" "}
            <Link href="/signup" className="text-[#D4AF37]/70 hover:text-[#D4AF37] transition-colors font-semibold">
              회원가입
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
