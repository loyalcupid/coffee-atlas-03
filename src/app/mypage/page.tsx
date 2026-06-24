"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { auth, db, googleProvider } from "@/lib/firebase";
import {
  updatePassword,
  updateProfile,
  reauthenticateWithCredential,
  reauthenticateWithPopup,
  EmailAuthProvider,
  deleteUser,
} from "firebase/auth";
import { ref, remove, update } from "firebase/database";
import { useRequireAuth } from "@/lib/useRequireAuth";
import { Home, Lock, Trash2, User, Coffee, Pencil } from "lucide-react";

function getErrorMsg(code: string): string {
  const map: Record<string, string> = {
    "auth/wrong-password":          "현재 비밀번호가 올바르지 않습니다.",
    "auth/invalid-credential":      "현재 비밀번호가 올바르지 않습니다.",
    "auth/weak-password":           "비밀번호는 6자 이상이어야 합니다.",
    "auth/requires-recent-login":   "보안을 위해 다시 로그인 후 시도해주세요.",
    "auth/too-many-requests":       "잠시 후 다시 시도해주세요.",
    "auth/network-request-failed":  "네트워크 오류가 발생했습니다.",
    "auth/popup-closed-by-user":    "",
    "auth/cancelled-popup-request": "",
  };
  return map[code] ?? "오류가 발생했습니다. 다시 시도해주세요.";
}

export default function MyPage() {
  const router = useRouter();
  const { user, authLoading } = useRequireAuth();

  const [currentPw, setCurrentPw]   = useState("");
  const [newPw, setNewPw]           = useState("");
  const [confirmPw, setConfirmPw]   = useState("");
  const [pwLoading, setPwLoading]   = useState(false);
  const [pwError, setPwError]       = useState("");
  const [pwSuccess, setPwSuccess]   = useState(false);

  const [nameInput, setNameInput]       = useState("");
  const [nameLoading, setNameLoading]   = useState(false);
  const [nameError, setNameError]       = useState("");
  const [nameSuccess, setNameSuccess]   = useState(false);
  const [editingName, setEditingName]   = useState(false);

  const [showDeleteForm, setShowDeleteForm] = useState(false);
  const [deletePw, setDeletePw]             = useState("");
  const [deleteLoading, setDeleteLoading]   = useState(false);
  const [deleteError, setDeleteError]       = useState("");

  if (authLoading) {
    return (
      <div className="min-h-screen cafe-bg flex items-center justify-center">
        <p className="cormorant text-[#FCF5E5]/40 text-xl">로딩 중...</p>
      </div>
    );
  }

  if (!user) return null;

  const isEmailUser = user.providerData[0]?.providerId === "password";
  const joinedDate = user.metadata.creationTime
    ? new Date(user.metadata.creationTime).toLocaleDateString("ko-KR", {
        year: "numeric", month: "long", day: "numeric",
      })
    : "-";

  const handleNameChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setNameError("");
    setNameSuccess(false);
    const trimmed = nameInput.trim();
    if (!trimmed) { setNameError("이름을 입력해주세요."); return; }
    if (trimmed.length > 20) { setNameError("이름은 20자 이하로 입력해주세요."); return; }
    setNameLoading(true);
    try {
      await updateProfile(user, { displayName: trimmed });
      await update(ref(db, `users/${user.uid}`), { displayName: trimmed });
      setNameSuccess(true);
      setEditingName(false);
      setNameInput("");
    } catch {
      setNameError("이름 변경에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setNameLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwError("");
    setPwSuccess(false);
    if (newPw !== confirmPw) { setPwError("새 비밀번호가 일치하지 않습니다."); return; }
    if (newPw.length < 6)    { setPwError("비밀번호는 6자 이상이어야 합니다."); return; }
    setPwLoading(true);
    try {
      const credential = EmailAuthProvider.credential(user.email!, currentPw);
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPw);
      setPwSuccess(true);
      setCurrentPw("");
      setNewPw("");
      setConfirmPw("");
    } catch (err: unknown) {
      const msg = getErrorMsg((err as { code: string }).code);
      if (msg) setPwError(msg);
    } finally {
      setPwLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeleteError("");
    setDeleteLoading(true);
    try {
      if (isEmailUser) {
        const credential = EmailAuthProvider.credential(user.email!, deletePw);
        await reauthenticateWithCredential(user, credential);
      } else {
        await reauthenticateWithPopup(user, googleProvider);
      }
      await remove(ref(db, `users/${user.uid}`));
      await deleteUser(user);
      router.push("/");
    } catch (err: unknown) {
      const msg = getErrorMsg((err as { code: string }).code);
      if (msg) setDeleteError(msg);
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="min-h-screen cafe-bg flex flex-col items-center px-6 py-12">
      <div className="w-full max-w-lg space-y-6">

        <Link
          href="/"
          className="inline-flex items-center gap-2 text-[#D4AF37]/50 hover:text-[#D4AF37] transition-colors text-sm cormorant"
        >
          <Home size={14} /> 홈으로
        </Link>

        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <div className="w-14 h-14 rounded-2xl bg-[#D4AF37]/10 border border-[#D4AF37]/30 flex items-center justify-center">
              <Coffee size={28} className="text-[#D4AF37]" />
            </div>
          </div>
          <h1 className="cafe-sign-title text-3xl text-[#FCF5E5]">마이페이지</h1>
          <p className="cormorant text-[#FCF5E5]/40 text-lg">나의 계정을 관리하세요.</p>
        </div>

        {/* 계정 정보 */}
        <div className="sign-frame rounded-2xl p-6 space-y-4">
          <h2 className="cormorant text-[#D4AF37] text-xs tracking-[0.3em] uppercase font-bold flex items-center gap-2">
            <User size={12} /> 계정 정보
          </h2>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-[#D4AF37]/15 border border-[#D4AF37]/30 flex items-center justify-center flex-shrink-0">
              <span className="cormorant text-[#D4AF37] text-2xl font-bold">
                {(user.displayName || user.email || "?")[0].toUpperCase()}
              </span>
            </div>
            <div className="space-y-1">
              {user.displayName && (
                <p className="playfair text-[#FCF5E5] font-bold text-lg leading-tight">{user.displayName}</p>
              )}
              <p className="cormorant text-[#FCF5E5]/60 text-base">{user.email}</p>
              <span className={`inline-block text-xs px-2 py-0.5 rounded-full border font-bold ${isEmailUser ? "bg-[#D4AF37]/10 border-[#D4AF37]/30 text-[#D4AF37]" : "bg-blue-500/10 border-blue-400/30 text-blue-300"}`}>
                {isEmailUser ? "이메일 가입" : "Google 가입"}
              </span>
            </div>
          </div>
          <div className="pt-2 border-t border-[#D4AF37]/10">
            <p className="cormorant text-[#FCF5E5]/35 text-sm">가입일 {joinedDate}</p>
          </div>
        </div>

        {/* 이름 변경 */}
        <div className="sign-frame rounded-2xl p-6 space-y-4">
          <h2 className="cormorant text-[#D4AF37] text-xs tracking-[0.3em] uppercase font-bold flex items-center gap-2">
            <Pencil size={12} /> 이름 변경
          </h2>

          {!editingName ? (
            <div className="flex items-center justify-between">
              <p className="cormorant text-[#FCF5E5]/70 text-base">
                {user.displayName || <span className="text-[#FCF5E5]/35 italic">이름 미설정</span>}
              </p>
              <button
                onClick={() => { setEditingName(true); setNameInput(user.displayName || ""); setNameSuccess(false); setNameError(""); }}
                className="text-xs px-3 py-1.5 rounded-lg border border-[#D4AF37]/30 text-[#D4AF37] hover:bg-[#D4AF37]/10 transition-all cormorant tracking-wide"
              >
                변경
              </button>
            </div>
          ) : (
            <form onSubmit={handleNameChange} className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#FCF5E5]/40 uppercase tracking-widest">새 이름</label>
                <input
                  type="text"
                  value={nameInput}
                  onChange={e => setNameInput(e.target.value)}
                  placeholder="변경할 이름 입력 (최대 20자)"
                  maxLength={20}
                  autoFocus
                  className="w-full px-4 py-3 rounded-xl bg-white/8 border border-[#D4AF37]/20 text-[#FCF5E5] placeholder-[#FCF5E5]/25 focus:outline-none focus:border-[#D4AF37]/50 focus:ring-1 focus:ring-[#D4AF37]/30 transition-all text-sm"
                />
              </div>

              {nameError && (
                <p className="text-red-400 text-sm text-center bg-red-400/10 rounded-lg py-2.5 px-4 border border-red-400/20">{nameError}</p>
              )}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => { setEditingName(false); setNameInput(""); setNameError(""); }}
                  className="flex-1 border border-[#D4AF37]/20 text-[#FCF5E5]/50 py-3 rounded-xl font-bold text-sm hover:bg-white/5 transition-all playfair"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={nameLoading}
                  className="flex-1 bg-[#D4AF37] text-[#1a0f0a] py-3 rounded-xl font-bold text-sm hover:bg-[#e8c84a] transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-60 playfair"
                >
                  <Pencil size={14} /> {nameLoading ? "저장 중..." : "저장"}
                </button>
              </div>
            </form>
          )}

          {nameSuccess && (
            <p className="text-green-400 text-sm text-center bg-green-400/10 rounded-lg py-2.5 px-4 border border-green-400/20">이름이 성공적으로 변경되었습니다.</p>
          )}
        </div>

        {/* 비밀번호 변경 */}
        <div className="sign-frame rounded-2xl p-6 space-y-4">
          <h2 className="cormorant text-[#D4AF37] text-xs tracking-[0.3em] uppercase font-bold flex items-center gap-2">
            <Lock size={12} /> 비밀번호 변경
          </h2>

          {isEmailUser ? (
            <form onSubmit={handlePasswordChange} className="space-y-3">
              {(["현재 비밀번호", "새 비밀번호", "새 비밀번호 확인"] as const).map((label, i) => {
                const vals   = [currentPw, newPw, confirmPw];
                const setters = [setCurrentPw, setNewPw, setConfirmPw];
                const placeholders = ["현재 비밀번호 입력", "6자 이상", "새 비밀번호를 다시 입력"];
                return (
                  <div key={label} className="space-y-1.5">
                    <label className="text-xs font-bold text-[#FCF5E5]/40 uppercase tracking-widest">{label}</label>
                    <input
                      type="password"
                      value={vals[i]}
                      onChange={e => setters[i](e.target.value)}
                      required
                      placeholder={placeholders[i]}
                      className="w-full px-4 py-3 rounded-xl bg-white/8 border border-[#D4AF37]/20 text-[#FCF5E5] placeholder-[#FCF5E5]/25 focus:outline-none focus:border-[#D4AF37]/50 focus:ring-1 focus:ring-[#D4AF37]/30 transition-all text-sm"
                    />
                  </div>
                );
              })}

              {pwError && (
                <p className="text-red-400 text-sm text-center bg-red-400/10 rounded-lg py-2.5 px-4 border border-red-400/20">{pwError}</p>
              )}
              {pwSuccess && (
                <p className="text-green-400 text-sm text-center bg-green-400/10 rounded-lg py-2.5 px-4 border border-green-400/20">비밀번호가 성공적으로 변경되었습니다.</p>
              )}

              <button
                type="submit"
                disabled={pwLoading}
                className="w-full bg-[#D4AF37] text-[#1a0f0a] py-3 rounded-xl font-bold text-sm hover:bg-[#e8c84a] transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-60 playfair"
              >
                <Lock size={14} /> {pwLoading ? "변경 중..." : "비밀번호 변경"}
              </button>
            </form>
          ) : (
            <p className="cormorant text-[#FCF5E5]/40 text-base">
              Google 계정으로 가입하셨기 때문에 비밀번호 변경이 지원되지 않습니다.
            </p>
          )}
        </div>

        {/* 회원 탈퇴 */}
        <div className="sign-frame rounded-2xl p-6 space-y-4">
          <h2 className="cormorant text-red-400 text-xs tracking-[0.3em] uppercase font-bold flex items-center gap-2">
            <Trash2 size={12} /> 회원 탈퇴
          </h2>

          {!showDeleteForm ? (
            <div className="space-y-3">
              <p className="cormorant text-[#FCF5E5]/45 text-base leading-relaxed">
                탈퇴하면 기록된 모든 데이터가 삭제되며 복구할 수 없습니다.
              </p>
              <button
                onClick={() => setShowDeleteForm(true)}
                className="w-full border border-red-500/40 text-red-400 py-3 rounded-xl font-bold text-sm hover:bg-red-500/10 transition-all flex items-center justify-center gap-2 playfair"
              >
                <Trash2 size={14} /> 회원 탈퇴
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="cormorant text-red-300/80 text-base">
                정말로 탈퇴하시겠습니까? 이 작업은 되돌릴 수 없습니다.
              </p>

              {isEmailUser && (
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#FCF5E5]/40 uppercase tracking-widest">비밀번호 확인</label>
                  <input
                    type="password"
                    value={deletePw}
                    onChange={e => setDeletePw(e.target.value)}
                    placeholder="현재 비밀번호 입력"
                    className="w-full px-4 py-3 rounded-xl bg-white/8 border border-red-500/30 text-[#FCF5E5] placeholder-[#FCF5E5]/25 focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/20 transition-all text-sm"
                  />
                </div>
              )}

              {deleteError && (
                <p className="text-red-400 text-sm text-center bg-red-400/10 rounded-lg py-2.5 px-4 border border-red-400/20">{deleteError}</p>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => { setShowDeleteForm(false); setDeletePw(""); setDeleteError(""); }}
                  className="flex-1 border border-[#D4AF37]/20 text-[#FCF5E5]/50 py-3 rounded-xl font-bold text-sm hover:bg-white/5 transition-all playfair"
                >
                  취소
                </button>
                <button
                  onClick={handleDeleteAccount}
                  disabled={deleteLoading || (isEmailUser && !deletePw)}
                  className="flex-1 bg-red-500/80 text-white py-3 rounded-xl font-bold text-sm hover:bg-red-500 transition-all flex items-center justify-center gap-2 disabled:opacity-50 playfair"
                >
                  <Trash2 size={14} />
                  {deleteLoading ? "처리 중..." : isEmailUser ? "탈퇴 확인" : "Google로 인증 후 탈퇴"}
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
