"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import confetti from "canvas-confetti";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  ChevronRight,
  Gauge,
  Lightbulb,
  RotateCcw,
  Timer,
  Trophy,
  X,
  Zap,
} from "lucide-react";
import { motion } from "framer-motion";
import { Badge, Button, Card, ProgressBar } from "@/components/ui";
import { categories, questions } from "@/lib/data";
import { difficultyTone } from "@/lib/utils";
import { useAppStore } from "@/lib/store";
import type { QuizMode } from "@/lib/types";

type QuizStage = "setup" | "active" | "complete";

export default function QuizPage() {
  const [stage, setStage] = useState<QuizStage>("setup");
  const [selectedCategories, setSelectedCategories] = useState(["kubernetes", "docker", "terraform"]);
  const [questionCount, setQuestionCount] = useState(5);
  const [duration, setDuration] = useState(10);
  const [mode, setMode] = useState<QuizMode>("Adaptive");
  const [difficulty, setDifficulty] = useState("Mixed");
  const [company, setCompany] = useState("Any company");
  const [experience, setExperience] = useState("3–5 years");
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [timeLeft, setTimeLeft] = useState(duration * 60);
  const recorded = useRef(false);
  const recordQuizAttempt = useAppStore((state) => state.recordQuizAttempt);

  const quizQuestions = useMemo(() => {
    const mcq = questions.filter((question) => question.options);
    const preferred = mcq.filter((question) => selectedCategories.includes(question.categorySlug));
    const pool = preferred.length >= questionCount ? preferred : mcq;
    return [...pool, ...mcq].filter((question, idx, all) => all.findIndex((q) => q.id === question.id) === idx).slice(0, questionCount);
  }, [selectedCategories, questionCount]);

  const score = quizQuestions.reduce((total, question) => total + (answers[question.id] === question.correctOption ? 1 : 0), 0);
  const accuracy = quizQuestions.length ? Math.round((score / quizQuestions.length) * 100) : 0;
  const current = quizQuestions[index];

  const start = () => {
    setIndex(0);
    setAnswers({});
    setTimeLeft(duration * 60);
    recorded.current = false;
    setStage("active");
  };

  const finish = useCallback(() => {
    if (!recorded.current) {
      const wrongCategories = quizQuestions
        .filter((question) => answers[question.id] !== question.correctOption)
        .map((question) => question.category);
      recordQuizAttempt({
        id: `QA-${Date.now().toString().slice(-6)}`,
        mode,
        score,
        total: quizQuestions.length,
        timeSeconds: duration * 60 - timeLeft,
        categories: [...new Set(quizQuestions.map((question) => question.category))],
        weakCategories: [...new Set(wrongCategories)],
        createdAt: new Date().toISOString(),
      });
      recorded.current = true;
    }
    setStage("complete");
    if (score / Math.max(quizQuestions.length, 1) >= 0.6) {
      confetti({ particleCount: 130, spread: 75, origin: { y: 0.65 }, colors: ["#8b5cf6", "#22d3ee", "#fbbf24"] });
    }
  }, [answers, duration, mode, quizQuestions, recordQuizAttempt, score, timeLeft]);

  useEffect(() => {
    if (stage !== "active") return;
    const timer = window.setTimeout(() => {
      if (timeLeft <= 1) {
        setTimeLeft(0);
        finish();
      } else {
        setTimeLeft(timeLeft - 1);
      }
    }, 1000);
    return () => window.clearTimeout(timer);
  }, [stage, timeLeft, finish]);

  const toggleCategory = (slug: string) =>
    setSelectedCategories((current) => current.includes(slug) ? current.filter((item) => item !== slug) : [...current, slug]);

  if (stage === "active" && current) {
    const chosen = answers[current.id];
    return (
      <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <div className="flex items-center gap-3">
          <button onClick={() => setStage("setup")} className="grid size-10 place-items-center rounded-xl border border-white/[.08] text-zinc-500 hover:bg-white/[.05]"><X size={17} /></button>
          <div className="flex-1">
            <div className="flex items-center justify-between text-[10px] text-zinc-600">
              <span>Question {index + 1} of {quizQuestions.length}</span>
              <span>{mode === "Adaptive" ? `Adaptive · ${current?.difficulty ?? difficulty}` : mode}</span>
            </div>
            <ProgressBar value={((index + 1) / quizQuestions.length) * 100} className="mt-2" />
          </div>
          <div className={`flex h-10 items-center gap-2 rounded-xl border px-3 font-mono text-xs ${timeLeft < 60 ? "border-rose-400/20 bg-rose-400/10 text-rose-300" : "border-white/[.08] bg-white/[.035] text-zinc-400"}`}>
            <Timer size={15} />
            {String(Math.floor(timeLeft / 60)).padStart(2, "0")}:{String(timeLeft % 60).padStart(2, "0")}
          </div>
        </div>

        <motion.div key={current.id} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} className="mt-8">
          <Card className="overflow-hidden">
            <div className="border-b border-white/[.07] px-5 py-4 sm:px-8">
              <div className="flex flex-wrap items-center gap-2">
                <Badge>{current.category}</Badge>
                <Badge tone={difficultyTone(current.difficulty)}>{current.difficulty}</Badge>
                <span className="ml-auto text-[10px] text-zinc-700">+40 XP</span>
              </div>
            </div>
            <div className="p-5 sm:p-8 lg:p-10">
              <p className="max-w-3xl text-lg font-medium leading-8 sm:text-xl">{current.question}</p>
              <div className="mt-8 grid gap-3">
                {current.options?.map((option, optionIndex) => {
                  const selected = chosen === optionIndex;
                  return (
                    <motion.button
                      key={option}
                      whileTap={{ scale: 0.995 }}
                      onClick={() => setAnswers((currentAnswers) => ({ ...currentAnswers, [current.id]: optionIndex }))}
                      className={`flex min-h-14 items-center gap-4 rounded-2xl border p-4 text-left text-sm transition ${
                        selected ? "border-violet-400/35 bg-violet-400/[.09] text-violet-100" : "border-white/[.07] bg-white/[.025] text-zinc-400 hover:border-white/[.14] hover:bg-white/[.045]"
                      }`}
                    >
                      <span className={`grid size-7 shrink-0 place-items-center rounded-lg border font-mono text-[10px] ${selected ? "border-violet-400 bg-violet-500 text-white" : "border-white/10 text-zinc-600"}`}>
                        {String.fromCharCode(65 + optionIndex)}
                      </span>
                      <span>{option}</span>
                      {selected && <Check size={16} className="ml-auto text-violet-300" />}
                    </motion.button>
                  );
                })}
              </div>
            </div>
          </Card>
          <div className="mt-5 flex items-center justify-between">
            <Button variant="ghost" disabled={index === 0} onClick={() => setIndex((value) => value - 1)}><ArrowLeft size={14} /> Previous</Button>
            {index === quizQuestions.length - 1 ? (
              <Button disabled={chosen === undefined} onClick={finish}>Finish quiz <CheckCircle2 size={15} /></Button>
            ) : (
              <Button disabled={chosen === undefined} onClick={() => setIndex((value) => value + 1)}>Next question <ArrowRight size={15} /></Button>
            )}
          </div>
        </motion.div>
      </div>
    );
  }

  if (stage === "complete") {
    return (
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}>
          <Card className="overflow-hidden text-center">
            <div className="relative border-b border-white/[.07] bg-gradient-to-b from-violet-500/12 to-transparent px-6 py-12">
              <div className="premium-grid absolute inset-0 opacity-30" />
              <span className="relative mx-auto grid size-20 place-items-center rounded-[26px] border border-violet-400/20 bg-violet-400/10 text-violet-300">
                <Trophy size={34} />
              </span>
              <Badge tone={accuracy >= 60 ? "green" : "amber"} className="relative mt-5">Quiz complete</Badge>
              <h1 className="relative mt-4 text-3xl font-semibold tracking-[-.04em]">{accuracy >= 80 ? "Excellent work!" : accuracy >= 60 ? "Strong progress!" : "Good attempt—keep going."}</h1>
              <p className="relative mt-2 text-xs text-zinc-500">You completed the mixed DevOps challenge in {duration - Math.ceil(timeLeft / 60) || 1} minutes.</p>
            </div>
            <div className="grid grid-cols-3 gap-px bg-white/[.06]">
              {[
                [`${accuracy}%`, "Accuracy"],
                [`${score}/${quizQuestions.length}`, "Correct"],
                [`+${score * 40}`, "XP earned"],
              ].map(([value, label]) => (
                <div key={label} className="bg-[var(--panel)] px-3 py-6">
                  <p className="text-xl font-semibold">{value}</p>
                  <p className="mt-1 text-[10px] text-zinc-600">{label}</p>
                </div>
              ))}
            </div>
            <div className="p-5 text-left sm:p-7">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold">Answer review</h2>
                <Badge>{score} correct</Badge>
              </div>
              <div className="mt-4 space-y-2">
                {quizQuestions.map((question, questionIndex) => {
                  const correct = answers[question.id] === question.correctOption;
                  return (
                    <div key={question.id} className="flex items-center gap-3 rounded-xl border border-white/[.06] bg-white/[.02] p-3">
                      <span className={`grid size-7 shrink-0 place-items-center rounded-lg ${correct ? "bg-emerald-400/10 text-emerald-300" : "bg-rose-400/10 text-rose-300"}`}>
                        {correct ? <Check size={14} /> : <X size={14} />}
                      </span>
                      <p className="line-clamp-1 text-xs text-zinc-400">{questionIndex + 1}. {question.question}</p>
                      <span className="ml-auto text-[9px] text-zinc-700">{question.category}</span>
                    </div>
                  );
                })}
              </div>
              <div className="mt-6 flex flex-col justify-center gap-2 sm:flex-row">
                <Button variant="secondary" onClick={() => setStage("setup")}>Back to setup</Button>
                <Button onClick={start}><RotateCcw size={14} /> Retry quiz</Button>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <div className="text-center">
        <Badge tone="violet"><Zap size={11} className="mr-1" /> Adaptive practice</Badge>
        <h1 className="mt-4 text-3xl font-semibold tracking-[-.045em] sm:text-4xl">Build your quiz</h1>
        <p className="mx-auto mt-3 max-w-xl text-xs leading-6 text-zinc-500">Choose your focus and difficulty. We’ll create a fast, targeted challenge from real DevOps interview topics.</p>
      </div>

      <div className="mt-8 grid gap-5 lg:grid-cols-[1fr_340px]">
        <Card className="p-5 sm:p-7">
          <h2 className="text-sm font-semibold">1. Choose focus areas</h2>
          <p className="mt-1 text-[10px] text-zinc-600">Select one or more categories</p>
          <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-3">
            {categories.slice(0, 9).map((category) => {
              const selected = selectedCategories.includes(category.slug);
              return (
                <button
                  key={category.slug}
                  onClick={() => toggleCategory(category.slug)}
                  className={`flex items-center gap-3 rounded-xl border p-3 text-left transition ${
                    selected ? "border-violet-400/25 bg-violet-400/[.08] text-violet-200" : "border-white/[.065] bg-white/[.022] text-zinc-500 hover:bg-white/[.04]"
                  }`}
                >
                  <span className="grid size-8 place-items-center rounded-lg bg-white/[.045] text-[10px] font-semibold">{category.name.slice(0, 2).toUpperCase()}</span>
                  <span className="text-[11px] font-medium">{category.name}</span>
                  {selected && <Check size={13} className="ml-auto" />}
                </button>
              );
            })}
          </div>

          <div className="mt-8 border-t border-white/[.06] pt-7">
            <h2 className="text-sm font-semibold">2. Choose practice mode</h2>
            <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
              {(["MCQ", "Interview", "Scenario", "Rapid Fire", "Hands-on", "Adaptive"] as QuizMode[]).map((item) => (
                <button key={item} onClick={() => setMode(item)} className={`rounded-xl border px-3 py-3 text-left text-[11px] font-medium transition ${mode === item ? "border-violet-400/25 bg-violet-400/10 text-violet-200" : "border-white/[.07] text-zinc-600 hover:bg-white/[.035]"}`}>
                  {item}
                  {item === "Adaptive" && <span className="mt-1 block text-[8px] font-normal text-cyan-400">Recommended</span>}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-8 grid gap-7 border-t border-white/[.06] pt-7 sm:grid-cols-2">
            <div>
              <h2 className="text-sm font-semibold">3. Number of questions</h2>
              <div className="mt-4 grid grid-cols-3 gap-2">
                {[3, 5, 10].map((value) => (
                  <button key={value} onClick={() => setQuestionCount(value)} className={`rounded-xl border py-3 text-xs font-medium ${questionCount === value ? "border-violet-400/25 bg-violet-400/10 text-violet-200" : "border-white/[.07] text-zinc-600"}`}>{value}</button>
                ))}
              </div>
            </div>
            <div>
              <h2 className="text-sm font-semibold">4. Time limit</h2>
              <div className="mt-4 grid grid-cols-3 gap-2">
                {[5, 10, 20].map((value) => (
                  <button key={value} onClick={() => setDuration(value)} className={`rounded-xl border py-3 text-xs font-medium ${duration === value ? "border-cyan-400/25 bg-cyan-400/10 text-cyan-200" : "border-white/[.07] text-zinc-600"}`}>{value}m</button>
                ))}
              </div>
            </div>
          </div>
          <div className="mt-7 grid gap-3 border-t border-white/[.06] pt-7 sm:grid-cols-3">
            {[
              ["Difficulty", difficulty, setDifficulty, ["Mixed", "Easy", "Medium", "Hard"]],
              ["Company", company, setCompany, ["Any company", "Amazon", "Google", "TCS", "Infosys"]],
              ["Experience", experience, setExperience, ["0–2 years", "3–5 years", "5+ years"]],
            ].map(([label, value, setter, options]) => (
              <label key={String(label)} className="text-[10px] text-zinc-600">
                {String(label)}
                <select value={String(value)} onChange={(event) => (setter as (value: string) => void)(event.target.value)} className="mt-2 h-11 w-full rounded-xl border border-white/[.07] bg-[#101012] px-3 text-xs text-zinc-300 outline-none">
                  {(options as string[]).map((option) => <option key={option}>{option}</option>)}
                </select>
              </label>
            ))}
          </div>
        </Card>

        <Card className="h-fit overflow-hidden">
          <div className="border-b border-white/[.07] bg-gradient-to-br from-violet-500/10 to-cyan-500/[.03] p-5">
            <div className="flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-xl bg-violet-400/10 text-violet-300"><Gauge size={20} /></span>
              <div>
                <p className="text-sm font-semibold">Quiz summary</p>
                <p className="mt-1 text-[10px] text-zinc-600">Ready when you are</p>
              </div>
            </div>
          </div>
          <div className="space-y-4 p-5">
            {[
              ["Questions", String(Math.min(questionCount, quizQuestions.length))],
              ["Duration", `${duration} minutes`],
              ["Mode", mode],
              ["Categories", `${selectedCategories.length} selected`],
              ["Difficulty", difficulty],
              ["Company", company],
              ["Experience", experience],
            ].map(([label, value]) => (
              <div key={label} className="flex items-center justify-between text-xs">
                <span className="text-zinc-600">{label}</span><span className="text-zinc-300">{value}</span>
              </div>
            ))}
            <div className="rounded-xl border border-amber-400/10 bg-amber-400/[.045] p-3">
              <div className="flex items-start gap-2">
                <Lightbulb size={14} className="mt-0.5 shrink-0 text-amber-300" />
                <p className="text-[10px] leading-5 text-zinc-500">Each correct answer earns 40 XP. Your weak categories update automatically after submission.</p>
              </div>
            </div>
            <Button onClick={start} disabled={!selectedCategories.length || !quizQuestions.length} size="lg" className="w-full">
              Start quiz <ChevronRight size={15} />
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
