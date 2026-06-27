"use client";

import { useState } from "react";
import Link from "next/link";
import { Brain, Trophy, CheckCircle, XCircle, ChevronRight } from "lucide-react";
import { User } from "firebase/auth";
import { ref, update } from "firebase/database";
import { db } from "@/lib/firebase";
import { getRandomQuiz, getCoffeeLevel, QuizQuestion } from "@/lib/coffeeQuizData";

interface Props {
  user: User | null;
}

type Phase = "idle" | "quiz" | "result";

const DIFFICULTY_LABEL = { basic: "기초", intermediate: "중급", advanced: "고급" } as const;

export default function CoffeeQuizSection({ user }: Props) {
  const [phase, setPhase] = useState<Phase>("idle");
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<boolean[]>([]);
  const [selected, setSelected] = useState<string | boolean | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved">("idle");

  const startQuiz = () => {
    setQuestions(getRandomQuiz());
    setCurrent(0);
    setAnswers([]);
    setSelected(null);
    setShowFeedback(false);
    setSaveState("idle");
    setPhase("quiz");
  };

  const handleAnswer = (choice: string | boolean) => {
    if (showFeedback) return;

    const q = questions[current];
    const correct = choice === q.answer;
    const newAnswers = [...answers, correct];

    setSelected(choice);
    setShowFeedback(true);
    setAnswers(newAnswers);

    setTimeout(() => {
      if (current + 1 < questions.length) {
        setCurrent(c => c + 1);
        setSelected(null);
        setShowFeedback(false);
      } else {
        const score = newAnswers.filter(Boolean).length;
        const lvl = getCoffeeLevel(score, questions.length);
        if (user) {
          setSaveState("saving");
          update(ref(db, `users/${user.uid}`), {
            coffeeQuizLevel: lvl.label,
            coffeeQuizScore: score,
            coffeeQuizTotal: questions.length,
            coffeeQuizDate: new Date().toISOString(),
          }).then(() => setSaveState("saved")).catch(() => setSaveState("idle"));
        }
        setPhase("result");
      }
    }, 1600);
  };

  if (phase === "idle") {
    return (
      <section className="w-full pt-12 pb-20 border-t border-[#D4AF37]/15 bg-[#F0DDB0]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="brown-divider text-xs tracking-[0.4em] uppercase cormorant mb-14">
            Coffee Level Test
          </div>
          <div className="flex flex-col items-center text-center max-w-xl mx-auto gap-6">
            <div className="w-20 h-20 border-2 border-[#FCF5E5] bg-[#D4AF37]/10 text-[#D4AF37] rounded-2xl flex items-center justify-center shadow-lg">
              <Brain size={36} />
            </div>
            <div className="space-y-3">
              <h2 className="playfair text-3xl font-extrabold text-[#5C3A25]">나의 커피 레벨 테스트</h2>
              <p className="cormorant text-[#5C3A25]/70 text-xl font-light leading-relaxed">
                15문제로 알아보는 나의 커피 지식 수준<br />
                기초 · 중급 · 고급 문제로 구성된 OX / 4지선다 퀴즈
              </p>
            </div>
            <div className="flex items-center gap-5 text-sm text-[#5C3A25]/55 cormorant text-lg">
              <span>📝 총 15문제</span>
              <span>·</span>
              <span>🎲 매번 랜덤 출제</span>
              <span>·</span>
              <span>⏱ 약 5분 소요</span>
            </div>
            <button
              onClick={startQuiz}
              className="flex items-center gap-2 bg-[#5C3A25] text-[#FCF5E5] px-8 py-4 rounded-2xl font-bold text-base hover:bg-[#6B4530] transition-all shadow-lg hover:shadow-xl hover:-translate-y-1 playfair"
            >
              테스트 시작 <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </section>
    );
  }

  // ── Quiz Modal ──
  if (phase === "quiz") {
    const q = questions[current];
    const isCorrect = showFeedback && selected === q.answer;

    return (
      <div className="fixed inset-0 bg-black/75 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
        <div className="bg-[#FCF5E5] rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden">

          {/* Header */}
          <div className="bg-[#5C3A25] px-6 py-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="cormorant text-[#D4AF37] text-sm tracking-[0.3em] uppercase">
                {DIFFICULTY_LABEL[q.difficulty]} 수준
              </span>
              <span className="cormorant text-white/55 text-sm">{current + 1} / {questions.length}</span>
            </div>
            <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#D4AF37] rounded-full transition-all duration-500"
                style={{ width: `${((current + 1) / questions.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Body */}
          <div className="px-6 py-5 space-y-4">
            {/* Type badge */}
            <span className={`inline-block text-xs font-bold px-2.5 py-1 rounded-full border ${
              q.type === "OX"
                ? "bg-blue-50 border-blue-200 text-blue-600"
                : "bg-amber-50 border-amber-200 text-amber-600"
            }`}>
              {q.type === "OX" ? "O / X" : "4지선다"}
            </span>

            {/* Question */}
            <p className="playfair text-[#3D2B1F] text-base font-bold leading-snug">{q.question}</p>

            {/* OX Buttons */}
            {q.type === "OX" && (
              <div className="grid grid-cols-2 gap-3 pt-1">
                {([true, false] as const).map((val) => {
                  const isSelected = selected === val;
                  const isAnswer = q.answer === val;
                  let cls = "h-20 rounded-2xl text-4xl font-black transition-all border-2 ";
                  if (showFeedback) {
                    if (isAnswer) cls += "bg-green-100 border-green-400 text-green-600 scale-105 shadow-md";
                    else if (isSelected) cls += "bg-red-100 border-red-400 text-red-500";
                    else cls += "bg-white/60 border-[#D4AF37]/15 text-[#5C3A25]/30";
                  } else if (isSelected) {
                    cls += "bg-[#D4AF37]/20 border-[#D4AF37] text-[#5C3A25] scale-105";
                  } else {
                    cls += "bg-white border-[#D4AF37]/25 text-[#5C3A25] hover:bg-[#D4AF37]/10 hover:border-[#D4AF37]/60 hover:scale-105";
                  }
                  return (
                    <button key={String(val)} onClick={() => handleAnswer(val)} disabled={showFeedback} className={cls}>
                      {val ? "O" : "X"}
                    </button>
                  );
                })}
              </div>
            )}

            {/* MC Options */}
            {q.type === "MC" && q.options && (
              <div className="space-y-2 pt-1">
                {q.options.map((opt, i) => {
                  const isSelected = selected === opt;
                  const isAnswer = q.answer === opt;
                  let cls = "w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all border ";
                  if (showFeedback) {
                    if (isAnswer) cls += "bg-green-100 border-green-400 text-green-700 shadow-sm";
                    else if (isSelected) cls += "bg-red-100 border-red-400 text-red-600";
                    else cls += "bg-white/60 border-[#D4AF37]/10 text-[#5C3A25]/40";
                  } else if (isSelected) {
                    cls += "bg-[#D4AF37]/20 border-[#D4AF37] text-[#5C3A25]";
                  } else {
                    cls += "bg-white border-[#D4AF37]/20 text-[#5C3A25] hover:bg-[#D4AF37]/10 hover:border-[#D4AF37]/50";
                  }
                  return (
                    <button key={i} onClick={() => handleAnswer(opt)} disabled={showFeedback} className={cls}>
                      <span className="text-[#D4AF37] font-black mr-2">{["①", "②", "③", "④"][i]}</span>
                      {opt}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Feedback */}
            {showFeedback && (
              <div className={`flex items-start gap-2.5 p-3 rounded-xl text-sm leading-relaxed ${
                isCorrect ? "bg-green-50 border border-green-200 text-green-700" : "bg-red-50 border border-red-200 text-red-700"
              }`}>
                {isCorrect
                  ? <CheckCircle size={16} className="flex-shrink-0 mt-0.5" />
                  : <XCircle   size={16} className="flex-shrink-0 mt-0.5" />
                }
                <span><strong>{isCorrect ? "정답! " : "오답. "}</strong>{q.explanation}</span>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 pb-4">
            <div className="flex justify-between text-xs text-[#5C3A25]/35 cormorant">
              <span>✓ 정답 {answers.filter(Boolean).length}개</span>
              <span>✗ 오답 {answers.filter(v => !v).length}개</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Result Modal ──
  const score = answers.filter(Boolean).length;
  const level = getCoffeeLevel(score, questions.length);

  const byDiff = { basic: { c: 0, t: 0 }, intermediate: { c: 0, t: 0 }, advanced: { c: 0, t: 0 } };
  questions.forEach((q, i) => {
    byDiff[q.difficulty].t++;
    if (answers[i]) byDiff[q.difficulty].c++;
  });

  return (
    <div className="fixed inset-0 bg-black/75 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-[#FCF5E5] rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden">

        {/* Result Header */}
        <div className="bg-gradient-to-br from-[#3D2B1F] to-[#5C3A25] px-6 pt-8 pb-7 text-center space-y-3">
          <p className="cormorant text-[#D4AF37] text-xs tracking-[0.5em] uppercase">테스트 완료</p>
          <div className="text-5xl leading-none">{level.emoji}</div>
          <h2 className="cafe-sign-title text-3xl text-[#FCF5E5]">{level.label}</h2>
          <p className="cormorant text-white/55 text-lg font-light">{level.desc}</p>
          <div className="inline-flex items-center gap-2 bg-[#D4AF37]/20 border border-[#D4AF37]/40 rounded-full px-5 py-1.5">
            <Trophy size={15} className="text-[#D4AF37]" />
            <span className="cormorant text-[#D4AF37] font-bold text-lg">{score} / {questions.length}점</span>
          </div>
        </div>

        {/* Result Body */}
        <div className="px-6 py-5 space-y-4">
          {/* Breakdown by difficulty */}
          <div className="space-y-2.5">
            {(["basic", "intermediate", "advanced"] as const).map((key) => {
              const d = byDiff[key];
              const colors = { basic: "bg-emerald-400", intermediate: "bg-yellow-400", advanced: "bg-rose-400" };
              return (
                <div key={key} className="flex items-center gap-3">
                  <span className="cormorant text-[#5C3A25] text-sm w-8">{DIFFICULTY_LABEL[key]}</span>
                  <div className="flex-1 h-2 bg-[#5C3A25]/10 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${colors[key]} rounded-full transition-all duration-700`}
                      style={{ width: `${(d.c / d.t) * 100}%` }}
                    />
                  </div>
                  <span className="cormorant text-[#5C3A25]/50 text-sm w-10 text-right">{d.c}/{d.t}</span>
                </div>
              );
            })}
          </div>

          {/* Save state */}
          {user ? (
            <div className={`text-sm text-center py-2.5 px-4 rounded-xl cormorant border ${
              saveState === "saved"
                ? "bg-green-50 text-green-600 border-green-200"
                : "bg-[#D4AF37]/8 text-[#5C3A25]/55 border-[#D4AF37]/20"
            }`}>
              {saveState === "saving" && "결과 저장 중..."}
              {saveState === "saved"  && "✓ 나의 커피 취향 분석에 레벨이 저장되었습니다"}
              {saveState === "idle"   && "결과를 저장하는 중..."}
            </div>
          ) : (
            <div className="text-sm text-center py-2.5 px-4 rounded-xl cormorant bg-[#D4AF37]/8 text-[#5C3A25]/55 border border-[#D4AF37]/20">
              로그인하면 레벨이 취향 분석에 자동 저장됩니다
            </div>
          )}

          {/* Action buttons */}
          <div className="flex gap-3">
            <button
              onClick={startQuiz}
              className="flex-1 border-2 border-[#5C3A25]/30 text-[#5C3A25] py-3 rounded-2xl font-bold text-sm hover:bg-[#5C3A25]/8 transition-all playfair"
            >
              다시 풀기
            </button>
            {user ? (
              <Link
                href="/dashboard"
                className="flex-1 bg-[#5C3A25] text-[#FCF5E5] py-3 rounded-2xl font-bold text-sm hover:bg-[#6B4530] transition-all text-center playfair"
              >
                취향 분석 보기
              </Link>
            ) : (
              <button
                onClick={() => setPhase("idle")}
                className="flex-1 bg-[#5C3A25] text-[#FCF5E5] py-3 rounded-2xl font-bold text-sm hover:bg-[#6B4530] transition-all playfair"
              >
                닫기
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
