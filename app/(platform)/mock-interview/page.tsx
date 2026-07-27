"use client";

import { useEffect, useMemo, useState } from "react";
import {
  BarChart3,
  Camera,
  Check,
  ChevronRight,
  CircleStop,
  Clock3,
  FileText,
  Mic,
  MicOff,
  MonitorUp,
  Play,
  RotateCcw,
  Sparkles,
  Target,
  Trophy,
  Video,
  VideoOff,
  Volume2,
  X,
} from "lucide-react";
import { motion } from "framer-motion";
import { Badge, Button, Card, ProgressBar } from "@/components/ui";
import { questions } from "@/lib/data";
import { HologramOrb } from "@/components/three/hologram-orb";
import { useAppStore } from "@/lib/store";

type Stage = "setup" | "interview" | "report";

export default function MockInterviewPage() {
  const [stage, setStage] = useState<Stage>("setup");
  const [index, setIndex] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [mic, setMic] = useState(true);
  const [video, setVideo] = useState(true);
  const [recording, setRecording] = useState(false);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [technology, setTechnology] = useState("Mixed DevOps");
  const [company, setCompany] = useState("Amazon");
  const [level, setLevel] = useState("5+ years");
  const [difficulty, setDifficulty] = useState("Mixed");
  const [duration, setDuration] = useState("30 minutes");
  const recordMockReport = useAppStore((state) => state.recordMockReport);
  const interviewQuestions = useMemo(() => [questions[0], questions[3], questions[5], questions[8], questions[13]], []);
  const answerQuality = Object.values(answers).reduce((total, answer) => total + Math.min(answer.trim().length / 140, 1), 0);
  const reportScore = Math.round(62 + (answerQuality / interviewQuestions.length) * 30);

  const finishInterview = () => {
    recordMockReport({
      id: `MI-${Date.now().toString().slice(-6)}`,
      technology,
      company,
      level,
      score: reportScore,
      timeSeconds: elapsed,
      answered: Object.values(answers).filter((answer) => answer.trim()).length,
      createdAt: new Date().toISOString(),
    });
    setStage("report");
  };

  useEffect(() => {
    if (stage !== "interview") return;
    const timer = window.setInterval(() => setElapsed((value) => value + 1), 1000);
    return () => window.clearInterval(timer);
  }, [stage]);

  const reset = () => {
    setStage("setup");
    setIndex(0);
    setElapsed(0);
    setAnswers({});
    setRecording(false);
  };

  if (stage === "interview") {
    const current = interviewQuestions[index];
    return (
      <div className="fixed inset-0 z-[80] flex flex-col overflow-y-auto bg-[#08080a] text-white">
        <header className="flex min-h-16 items-center gap-3 border-b border-white/[.07] px-4 sm:px-6">
          <div className="flex items-center gap-2">
            <span className="size-2 animate-pulse rounded-full bg-rose-400" />
            <span className="text-[10px] font-semibold uppercase tracking-[.16em] text-rose-300">Interview in progress</span>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <span className="flex items-center gap-2 rounded-xl border border-white/[.08] bg-white/[.035] px-3 py-2 font-mono text-xs text-zinc-400">
              <Clock3 size={14} /> {String(Math.floor(elapsed / 60)).padStart(2, "0")}:{String(elapsed % 60).padStart(2, "0")}
            </span>
            <button onClick={reset} className="grid size-9 place-items-center rounded-xl text-zinc-500 hover:bg-white/[.06]"><X size={18} /></button>
          </div>
        </header>

        <div className="grid flex-1 lg:grid-cols-[1fr_330px]">
          <section className="flex flex-col p-4 sm:p-6 lg:p-8">
            <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col">
              <div className="flex items-center justify-between">
                <p className="text-[10px] text-zinc-600">Question {index + 1} of {interviewQuestions.length}</p>
                <Badge>{current.category} · {current.difficulty}</Badge>
              </div>
              <ProgressBar value={((index + 1) / interviewQuestions.length) * 100} className="mt-3" />

              <div className="my-auto py-10">
                <motion.div key={current.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
                  <div className="flex items-center gap-3">
                    <div className="size-14 overflow-hidden rounded-full border border-violet-400/20 bg-black/40"><HologramOrb active className="size-full" /></div>
                    <div>
                      <p className="text-xs font-medium">Maya · Senior DevOps Interviewer</p>
                      <p className="mt-1 flex items-center gap-1 text-[9px] text-emerald-400"><Volume2 size={11} /> Speaking complete</p>
                    </div>
                  </div>
                  <p className="mt-7 max-w-3xl text-2xl font-medium leading-[1.45] tracking-[-.025em] sm:text-3xl">
                    {current.question}
                  </p>
                  <textarea
                    value={answers[current.id] ?? ""}
                    onChange={(event) => setAnswers((currentAnswers) => ({ ...currentAnswers, [current.id]: event.target.value }))}
                    placeholder="Type your key points while explaining aloud…"
                    className="mt-8 min-h-32 w-full resize-none rounded-2xl border border-white/[.08] bg-white/[.025] p-4 text-sm leading-6 text-zinc-300 placeholder:text-zinc-700 focus:border-violet-400/25"
                  />
                  <div className="mt-3 flex items-center gap-2 text-[10px] text-zinc-700">
                    <Sparkles size={12} className="text-violet-400" />
                    AI evaluation will score structure, technical depth, communication, and production relevance.
                  </div>
                </motion.div>
              </div>

              <div className="flex items-center justify-between border-t border-white/[.07] pt-5">
                <Button variant="ghost" disabled={index === 0} onClick={() => setIndex((value) => value - 1)}>Previous</Button>
                {index === interviewQuestions.length - 1 ? (
                  <Button onClick={finishInterview}><CircleStop size={15} /> Finish interview</Button>
                ) : (
                  <Button onClick={() => setIndex((value) => value + 1)}>Next question <ChevronRight size={15} /></Button>
                )}
              </div>
            </div>
          </section>

          <aside className="border-t border-white/[.07] bg-[#0c0c0e] p-4 lg:border-l lg:border-t-0 lg:p-5">
            <div className="relative aspect-video overflow-hidden rounded-2xl border border-white/[.08] bg-gradient-to-br from-zinc-800 to-zinc-950 lg:aspect-[4/3]">
              <div className="absolute inset-0 premium-grid opacity-25" />
              {video ? (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <span className="mx-auto grid size-20 place-items-center rounded-full bg-gradient-to-br from-violet-500/40 to-cyan-500/30 text-2xl font-semibold">MS</span>
                    <p className="mt-3 text-xs text-zinc-500">Camera preview</p>
                  </div>
                </div>
              ) : (
                <div className="absolute inset-0 grid place-items-center text-zinc-700"><VideoOff size={30} /></div>
              )}
              {recording && <span className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-black/45 px-2 py-1 text-[9px] text-rose-300"><span className="size-1.5 animate-pulse rounded-full bg-rose-400" /> REC</span>}
              <span className="absolute bottom-3 left-3 rounded-lg bg-black/45 px-2 py-1 text-[9px] text-zinc-400">Mustafa Shaik</span>
            </div>
            <div className="mt-4 flex justify-center gap-2">
              <button onClick={() => setMic(!mic)} className={`grid size-10 place-items-center rounded-xl border ${mic ? "border-white/[.08] bg-white/[.04] text-zinc-400" : "border-rose-400/20 bg-rose-400/10 text-rose-300"}`}>{mic ? <Mic size={17} /> : <MicOff size={17} />}</button>
              <button onClick={() => setVideo(!video)} className={`grid size-10 place-items-center rounded-xl border ${video ? "border-white/[.08] bg-white/[.04] text-zinc-400" : "border-rose-400/20 bg-rose-400/10 text-rose-300"}`}>{video ? <Video size={17} /> : <VideoOff size={17} />}</button>
              <button onClick={() => setRecording(!recording)} className={`grid size-10 place-items-center rounded-xl border ${recording ? "border-rose-400/20 bg-rose-400/10 text-rose-300" : "border-white/[.08] bg-white/[.04] text-zinc-400"}`}><Camera size={17} /></button>
            </div>
            <div className="mt-5 rounded-xl border border-white/[.07] bg-white/[.025] p-4">
              <p className="text-[10px] font-semibold uppercase tracking-[.14em] text-zinc-600">Interview setup</p>
              <div className="mt-3 space-y-3">
                {[
                  ["Technology", technology],
                  ["Company", company],
                  ["Difficulty", difficulty],
                  ["Duration", duration],
                  ["Questions", String(interviewQuestions.length)],
                ].map(([label, value]) => (
                  <div key={label} className="flex items-center justify-between text-[10px]"><span className="text-zinc-600">{label}</span><span className="text-zinc-300">{value}</span></div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>
    );
  }

  if (stage === "report") {
    return (
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <Badge tone="green">Interview complete</Badge>
            <h1 className="mt-3 text-3xl font-semibold tracking-[-.04em]">Your interview report</h1>
            <p className="mt-2 text-xs text-zinc-500">AI-generated evaluation based on technical depth, clarity, and production relevance.</p>
          </div>
          <Button variant="secondary" onClick={reset}><RotateCcw size={14} /> New interview</Button>
        </div>

        <div className="mt-7 grid gap-5 lg:grid-cols-[340px_1fr]">
          <Card className="overflow-hidden">
            <div className="relative bg-gradient-to-b from-violet-500/12 to-transparent p-7 text-center">
              <div className="premium-grid absolute inset-0 opacity-25" />
              <div className="relative mx-auto grid size-32 place-items-center rounded-full border-[6px] border-violet-400/20 bg-violet-400/[.06]">
                <span>
                  <span className="block text-4xl font-semibold">{reportScore}</span>
                  <span className="text-[10px] text-zinc-600">overall score</span>
                </span>
              </div>
              <h2 className="relative mt-5 text-lg font-semibold">{reportScore >= 82 ? "Strong Hire" : reportScore >= 72 ? "Hire" : "Developing"}</h2>
              <p className="relative mt-1 text-[10px] text-zinc-500">{company} · {technology} · {level}</p>
            </div>
            <div className="grid grid-cols-2 gap-px bg-white/[.06]">
              {[[`${Math.max(1, Math.ceil(elapsed / 60))}m`, "Time"], [`+${Math.round(reportScore * 6)}`, "XP"]].map(([value, label]) => (
                <div key={label} className="bg-[var(--panel)] p-4 text-center"><p className="text-sm font-semibold">{value}</p><p className="mt-1 text-[9px] text-zinc-600">{label}</p></div>
              ))}
            </div>
          </Card>

          <div className="space-y-5">
            <Card className="p-5">
              <div className="flex items-center gap-2"><BarChart3 size={17} className="text-violet-300" /><h2 className="text-sm font-semibold">Competency breakdown</h2></div>
              <div className="mt-5 space-y-4">
                {[
                  ["Technical accuracy", 86, "from-violet-500 to-violet-400"],
                  ["Production relevance", 91, "from-cyan-500 to-cyan-400"],
                  ["Communication", 78, "from-emerald-500 to-emerald-400"],
                  ["Answer structure", 73, "from-amber-500 to-amber-400"],
                ].map(([label, value, color]) => (
                  <div key={String(label)}>
                    <div className="flex justify-between text-[10px]"><span className="text-zinc-500">{label}</span><span>{value}%</span></div>
                    <ProgressBar value={Number(value)} color={String(color)} className="mt-2" />
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-5">
              <div className="flex items-center gap-2"><Sparkles size={17} className="text-cyan-300" /><h2 className="text-sm font-semibold">AI interviewer feedback</h2></div>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <div className="rounded-xl border border-emerald-400/10 bg-emerald-400/[.04] p-4">
                  <p className="flex items-center gap-2 text-xs font-medium text-emerald-300"><Check size={14} /> What worked well</p>
                  <ul className="mt-3 space-y-2 text-[10px] leading-5 text-zinc-500">
                    <li>• You followed the request path logically during Kubernetes troubleshooting.</li>
                    <li>• Strong use of production evidence and concrete commands.</li>
                    <li>• Security decisions included short-lived credentials and auditability.</li>
                  </ul>
                </div>
                <div className="rounded-xl border border-amber-400/10 bg-amber-400/[.04] p-4">
                  <p className="flex items-center gap-2 text-xs font-medium text-amber-300"><Target size={14} /> Improve next</p>
                  <ul className="mt-3 space-y-2 text-[10px] leading-5 text-zinc-500">
                    <li>• State the likely root cause before expanding into every diagnostic branch.</li>
                    <li>• Quantify impact when describing past incidents.</li>
                    <li>• Close each answer with prevention and monitoring.</li>
                  </ul>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <div className="grid gap-7 lg:grid-cols-[1fr_390px] lg:items-center">
        <div>
          <Badge tone="violet"><Sparkles size={11} className="mr-1" /> AI-powered simulation</Badge>
          <h1 className="mt-5 max-w-2xl text-4xl font-semibold leading-tight tracking-[-.05em] sm:text-5xl">Walk into the real interview already warmed up.</h1>
          <p className="mt-5 max-w-xl text-sm leading-7 text-zinc-500">Practice a realistic, timed DevOps interview with mixed production scenarios, optional video, and structured AI feedback.</p>
          <div className="mt-7 grid max-w-xl gap-3 sm:grid-cols-2">
            {[
              { icon: MonitorUp, title: "Real interview flow", text: "One question at a time, timed and distraction-free." },
              { icon: Mic, title: "Voice-ready answers", text: "Practice speaking while capturing your key points." },
              { icon: FileText, title: "Detailed report", text: "Technical, communication, and structure scores." },
              { icon: Trophy, title: "Growth tracking", text: "Compare every mock and see improvement over time." },
            ].map((feature) => (
              <div key={feature.title} className="flex gap-3 rounded-xl border border-white/[.065] bg-white/[.022] p-3.5">
                <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-violet-400/10 text-violet-300"><feature.icon size={15} /></span>
                <div><p className="text-xs font-medium">{feature.title}</p><p className="mt-1 text-[9px] leading-4 text-zinc-600">{feature.text}</p></div>
              </div>
            ))}
          </div>
        </div>

        <Card className="overflow-hidden">
          <div className="relative border-b border-white/[.07] bg-gradient-to-br from-violet-500/12 to-cyan-500/[.04] p-6">
            <div className="premium-grid absolute inset-0 opacity-30" />
            <div className="relative h-40 overflow-hidden rounded-2xl border border-violet-400/10 bg-black/30">
              <HologramOrb active={false} className="h-full w-full" />
              <div className="absolute inset-x-6 bottom-4 flex h-6 items-end justify-center gap-1">
                {[10, 18, 13, 23, 16, 28, 12, 20, 9, 17, 11].map((height, index) => (
                  <motion.span key={index} animate={{ height: [height * .45, height, height * .55] }} transition={{ duration: .8 + index * .04, repeat: Infinity }} className="w-1 rounded-full bg-cyan-300/60" />
                ))}
              </div>
            </div>
            <h2 className="relative mt-4 text-lg font-semibold">Senior DevOps Mock</h2>
            <p className="relative mt-1 text-[10px] text-zinc-500">Technical · Production scenarios · 30 minutes</p>
          </div>
          <div className="p-5">
            <div className="grid grid-cols-2 gap-3">
              {[
                ["Technology", technology, setTechnology, ["Mixed DevOps", "Kubernetes", "AWS", "Docker", "Terraform"]],
                ["Company", company, setCompany, ["Amazon", "Google", "Microsoft", "TCS", "Infosys"]],
                ["Experience", level, setLevel, ["0–2 years", "3–5 years", "5+ years"]],
                ["Difficulty", difficulty, setDifficulty, ["Easy", "Medium", "Hard", "Mixed"]],
                ["Duration", duration, setDuration, ["15 minutes", "30 minutes", "45 minutes"]],
              ].map(([label, value, setter, options]) => (
                <label key={String(label)} className="text-[9px] text-zinc-600 last:col-span-2">
                  {String(label)}
                  <select value={String(value)} onChange={(event) => (setter as (value: string) => void)(event.target.value)} className="mt-1.5 h-10 w-full rounded-xl border border-white/[.07] bg-[#101012] px-3 text-[11px] text-zinc-300 outline-none">
                    {(options as string[]).map((option) => <option key={option}>{option}</option>)}
                  </select>
                </label>
              ))}
            </div>
            <div className="mt-5 rounded-xl border border-cyan-400/10 bg-cyan-400/[.04] p-3 text-[10px] leading-5 text-zinc-500">
              <Sparkles size={14} className="mb-2 text-cyan-300" />
              Camera and voice controls are simulated in this frontend demo. Your typed key points drive the interview report experience.
            </div>
            <Button onClick={() => { setStage("interview"); setElapsed(0); }} size="lg" className="mt-5 w-full"><Play size={15} fill="currentColor" /> Enter interview room</Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
