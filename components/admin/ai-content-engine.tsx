"use client";

import { useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  BrainCircuit,
  Check,
  CheckCircle2,
  ChevronRight,
  CircleAlert,
  Clock3,
  FileCode2,
  FileJson,
  FileSpreadsheet,
  FileText,
  GitBranch,
  LoaderCircle,
  Network,
  Pencil,
  RefreshCw,
  Search,
  Sparkles,
  Trash2,
  UploadCloud,
  WandSparkles,
  X,
} from "lucide-react";
import { Badge, Button, Card, ProgressBar, SectionTitle } from "@/components/ui";
import { createContentProcessingJob } from "@/lib/repositories/content-repository";
import { isSupabaseConfigured } from "@/lib/supabase/client";

type PipelineTab = "intake" | "queue" | "review" | "graph";
type SourceFormat = "CSV" | "JSON" | "Markdown" | "PDF";
type ReviewStatus = "pending" | "approved" | "rejected";

type GeneratedItem = {
  id: string;
  type: string;
  prompt: string;
  difficulty: "Basic" | "Intermediate" | "Advanced";
  confidence: number;
  status: ReviewStatus;
};

const seedItems: GeneratedItem[] = [
  {
    id: "AI-4821",
    type: "Troubleshooting",
    prompt: "A Kubernetes Service has ready endpoints, but only cross-node requests time out. How would you isolate the network path?",
    difficulty: "Advanced",
    confidence: 96,
    status: "pending",
  },
  {
    id: "AI-4820",
    type: "Scenario",
    prompt: "Design a safe Terraform state migration from a local backend to S3 while two delivery teams are actively shipping.",
    difficulty: "Advanced",
    confidence: 93,
    status: "pending",
  },
  {
    id: "AI-4819",
    type: "MCQ",
    prompt: "Which probe should protect a slow-starting container from premature liveness restarts?",
    difficulty: "Basic",
    confidence: 99,
    status: "pending",
  },
  {
    id: "AI-4818",
    type: "Flashcard",
    prompt: "Explain the difference between an SLO, an SLA, and an error budget.",
    difficulty: "Intermediate",
    confidence: 94,
    status: "approved",
  },
];

const generationTypes = [
  "Basic",
  "Intermediate",
  "Advanced",
  "Scenario",
  "Troubleshooting",
  "Production",
  "Architecture",
  "Hands-on",
  "MCQ",
  "Flashcard",
  "Rapid Fire",
  "Whiteboard",
];

const queue = [
  { id: "JOB-842", source: "kubernetes-production.pdf", stage: "Generating variants", progress: 78, count: 126, eta: "2m" },
  { id: "JOB-841", source: "terraform-scenarios.csv", stage: "Building knowledge graph", progress: 52, count: 84, eta: "4m" },
  { id: "JOB-840", source: "jenkins-notes.md", stage: "Quality checks", progress: 92, count: 48, eta: "<1m" },
];

export function AIContentEngine() {
  const [tab, setTab] = useState<PipelineTab>("intake");
  const [items, setItems] = useState(seedItems);
  const [selectedId, setSelectedId] = useState(seedItems[0].id);
  const [dragging, setDragging] = useState(false);
  const [source, setSource] = useState<{ name: string; format: SourceFormat; size: string; file: File } | null>(null);
  const [processing, setProcessing] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [pipelineError, setPipelineError] = useState("");
  const [search, setSearch] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const selected = items.find((item) => item.id === selectedId) ?? items[0];
  const reviewItems = useMemo(
    () => items.filter((item) => item.prompt.toLowerCase().includes(search.toLowerCase()) || item.type.toLowerCase().includes(search.toLowerCase())),
    [items, search],
  );

  const acceptFile = (file?: File) => {
    if (!file) return;
    const extension = file.name.split(".").pop()?.toLowerCase();
    const format: SourceFormat = extension === "csv" ? "CSV" : extension === "json" ? "JSON" : extension === "md" || extension === "markdown" ? "Markdown" : "PDF";
    setSource({ name: file.name, format, size: file.size > 1_000_000 ? `${(file.size / 1_000_000).toFixed(1)} MB` : `${Math.max(1, Math.round(file.size / 1000))} KB`, file });
    setGenerated(false);
    setPipelineError("");
  };

  const runPipeline = async () => {
    if (!source) return;
    setProcessing(true);
    setPipelineError("");
    try {
      if (isSupabaseConfigured) {
        const format = source.format === "CSV" ? "csv" : source.format === "JSON" ? "json" : source.format === "Markdown" ? "markdown" : "pdf";
        await createContentProcessingJob(source.file, format);
      } else {
        await new Promise((resolve) => window.setTimeout(resolve, 1500));
      }
      setProcessing(false);
      setGenerated(true);
    } catch (error) {
      setProcessing(false);
      setPipelineError(error instanceof Error ? error.message : "The processing job could not be created.");
    }
  };

  const updateStatus = (id: string, status: ReviewStatus) => {
    setItems((current) => current.map((item) => item.id === id ? { ...item, status } : item));
    const next = items.find((item) => item.id !== id && item.status === "pending");
    if (next) setSelectedId(next.id);
  };

  return (
    <section className="mt-4">
      <Card className="overflow-hidden">
        <div className="relative border-b border-white/[.07] bg-gradient-to-r from-violet-500/[.1] via-transparent to-cyan-500/[.06] p-5 sm:p-6">
          <div className="premium-grid absolute inset-0 opacity-25" />
          <div className="relative flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
            <div className="flex items-center gap-3">
              <span className="grid size-12 place-items-center rounded-2xl border border-violet-400/15 bg-violet-400/10 text-violet-300"><BrainCircuit size={23} /></span>
              <div>
                <div className="flex items-center gap-2"><h2 className="text-lg font-semibold">AI Content Engine</h2><Badge tone="green">Online</Badge></div>
                <p className="mt-1 text-[10px] text-zinc-500">Turn every source question into a reviewed, expandable interview knowledge graph.</p>
              </div>
            </div>
            <div className="flex gap-2">
              <div className="rounded-xl border border-white/[.07] bg-black/20 px-3 py-2"><p className="text-sm font-semibold">482</p><p className="text-[8px] text-zinc-600">Generated today</p></div>
              <div className="rounded-xl border border-white/[.07] bg-black/20 px-3 py-2"><p className="text-sm font-semibold text-amber-300">{items.filter((item) => item.status === "pending").length}</p><p className="text-[8px] text-zinc-600">Awaiting review</p></div>
            </div>
          </div>
        </div>

        <div className="border-b border-white/[.06] px-3 sm:px-5">
          <div className="flex overflow-x-auto">
            {([
              ["intake", "Content intake", UploadCloud],
              ["queue", "Processing queue", LoaderCircle],
              ["review", "Approval desk", CheckCircle2],
              ["graph", "Knowledge graph", Network],
            ] as const).map(([value, label, Icon]) => (
              <button key={value} onClick={() => setTab(value)} className={`flex min-w-max items-center gap-2 border-b-2 px-4 py-3 text-[10px] transition ${tab === value ? "border-violet-400 text-violet-200" : "border-transparent text-zinc-600 hover:text-zinc-300"}`}>
                <Icon size={14} /> {label}
                {value === "review" && <span className="rounded-full bg-amber-400/10 px-1.5 py-0.5 text-[8px] text-amber-300">{items.filter((item) => item.status === "pending").length}</span>}
              </button>
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          {tab === "intake" && (
            <motion.div key="intake" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="grid gap-5 p-4 sm:p-6 xl:grid-cols-[1fr_380px]">
              <div>
                <div
                  onDragOver={(event) => { event.preventDefault(); setDragging(true); }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={(event) => { event.preventDefault(); setDragging(false); acceptFile(event.dataTransfer.files[0]); }}
                  className={`relative grid min-h-64 place-items-center overflow-hidden rounded-2xl border border-dashed p-7 text-center transition ${dragging ? "border-cyan-400/50 bg-cyan-400/[.06]" : "border-white/[.12] bg-white/[.018] hover:border-violet-400/30"}`}
                >
                  <div className="premium-grid absolute inset-0 opacity-20" />
                  <div className="relative">
                    <span className="mx-auto grid size-16 place-items-center rounded-[22px] border border-violet-400/15 bg-violet-400/[.08] text-violet-300"><UploadCloud size={28} /></span>
                    <p className="mt-5 text-sm font-semibold">Drop your question bank here</p>
                    <p className="mt-2 text-[10px] text-zinc-600">CSV, JSON, Markdown or PDF · maximum 25 MB</p>
                    <Button variant="secondary" onClick={() => inputRef.current?.click()} className="mt-5">Choose a source file</Button>
                    <input ref={inputRef} type="file" accept=".csv,.json,.md,.markdown,.pdf" className="hidden" onChange={(event) => acceptFile(event.target.files?.[0])} />
                    <div className="mt-5 flex justify-center gap-2">
                      {[[FileSpreadsheet, "CSV"], [FileJson, "JSON"], [FileCode2, "MD"], [FileText, "PDF"]].map(([Icon, label]) => {
                        const FileIcon = Icon as typeof FileText;
                        return <span key={String(label)} className="flex items-center gap-1 rounded-lg border border-white/[.06] bg-black/20 px-2 py-1 text-[8px] text-zinc-600"><FileIcon size={11} />{String(label)}</span>;
                      })}
                    </div>
                  </div>
                </div>

                {source && (
                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-4 rounded-2xl border border-white/[.07] bg-white/[.02] p-4">
                    <div className="flex items-center gap-3">
                      <span className="grid size-10 place-items-center rounded-xl bg-cyan-400/[.08] text-cyan-300"><FileText size={18} /></span>
                      <div className="min-w-0 flex-1"><p className="truncate text-xs text-zinc-300">{source.name}</p><p className="mt-1 text-[9px] text-zinc-600">{source.format} · {source.size} · Ready for analysis</p></div>
                      <button onClick={() => { setSource(null); setGenerated(false); }} className="grid size-8 place-items-center rounded-lg text-zinc-600 hover:bg-white/[.05]"><X size={14} /></button>
                    </div>
                    {processing && <div className="mt-4"><div className="flex justify-between text-[9px] text-zinc-600"><span>Extracting concepts and relationships…</span><span>Processing</span></div><ProgressBar value={72} className="mt-2" /></div>}
                    {generated && (
                      <div className="mt-4 grid grid-cols-3 gap-2">
                        {[["42", "Original questions"], ["42", "Enriched records"], ["97%", "Schema confidence"]].map(([value, label]) => <div key={label} className="rounded-xl border border-emerald-400/10 bg-emerald-400/[.035] p-3 text-center"><p className="text-sm font-semibold text-emerald-300">{value}</p><p className="mt-1 text-[8px] text-zinc-600">{label}</p></div>)}
                      </div>
                    )}
                    {pipelineError && <p className="mt-3 rounded-xl border border-rose-400/10 bg-rose-400/[.04] p-3 text-[9px] text-rose-300">{pipelineError}</p>}
                    <Button onClick={runPipeline} disabled={processing} className="mt-4 w-full">{processing ? <><LoaderCircle size={14} className="animate-spin" /> Analyzing source</> : generated ? <><RefreshCw size={14} /> Run again</> : <><WandSparkles size={14} /> Generate content graph</>}</Button>
                  </motion.div>
                )}
              </div>

              <div className="space-y-4">
                <Card className="p-4">
                  <SectionTitle eyebrow="One-time enrichment" title="What AI stores permanently" />
                  <div className="mt-4 flex flex-wrap gap-2">
                    {generationTypes.map((type) => <span key={type} className="rounded-lg border border-white/[.06] bg-white/[.025] px-2.5 py-1.5 text-[9px] text-zinc-500">{type}</span>)}
                  </div>
                </Card>
                <Card className="p-4">
                  <SectionTitle eyebrow="Extraction schema" title="Automatic classification" />
                  <div className="mt-4 space-y-3">
                    {["Explanation and hints", "Expected keywords and difficulty", "Tags and related questions", "Follow-up questions and common mistakes", "Source and approval provenance"].map((label) => (
                      <div key={label} className="flex items-center gap-2 text-[10px] text-zinc-500"><Check size={13} className="text-emerald-300" />{label}</div>
                    ))}
                  </div>
                </Card>
                <div className="rounded-xl border border-amber-400/10 bg-amber-400/[.035] p-3 text-[9px] leading-5 text-zinc-500"><CircleAlert size={14} className="mb-2 text-amber-300" />Nothing publishes automatically. Enrichment runs once, is cached permanently, and remains private until an admin approves it.</div>
              </div>
            </motion.div>
          )}

          {tab === "queue" && (
            <motion.div key="queue" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="p-4 sm:p-6">
              <div className="grid gap-3">
                {queue.map((job) => (
                  <div key={job.id} className="rounded-2xl border border-white/[.07] bg-white/[.018] p-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                      <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-violet-400/[.08] text-violet-300"><LoaderCircle size={19} className="animate-spin" /></span>
                      <div className="min-w-0 flex-1"><div className="flex items-center gap-2"><p className="truncate text-xs font-medium">{job.source}</p><Badge>{job.id}</Badge></div><p className="mt-1 text-[9px] text-zinc-600">{job.stage} · {job.count} source questions</p></div>
                      <span className="flex items-center gap-1 text-[9px] text-zinc-600"><Clock3 size={12} /> {job.eta} remaining</span>
                    </div>
                    <div className="mt-4 flex items-center gap-3"><ProgressBar value={job.progress} className="flex-1" /><span className="font-mono text-[9px] text-zinc-500">{job.progress}%</span></div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {tab === "review" && (
            <motion.div key="review" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="grid min-h-[560px] lg:grid-cols-[330px_1fr]">
              <aside className="border-b border-white/[.06] p-4 lg:border-b-0 lg:border-r">
                <div className="flex h-10 items-center gap-2 rounded-xl border border-white/[.07] bg-white/[.025] px-3"><Search size={13} className="text-zinc-600" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search generated content…" className="min-w-0 flex-1 bg-transparent text-[10px] outline-none placeholder:text-zinc-700" /></div>
                <div className="mt-3 max-h-[480px] space-y-2 overflow-y-auto">
                  {reviewItems.map((item) => (
                    <button key={item.id} onClick={() => setSelectedId(item.id)} className={`w-full rounded-xl border p-3 text-left transition ${selected?.id === item.id ? "border-violet-400/20 bg-violet-400/[.07]" : "border-white/[.055] bg-white/[.015] hover:bg-white/[.03]"}`}>
                      <div className="flex items-center gap-2"><Badge>{item.type}</Badge><span className={`ml-auto size-1.5 rounded-full ${item.status === "approved" ? "bg-emerald-400" : item.status === "rejected" ? "bg-rose-400" : "bg-amber-400"}`} /></div>
                      <p className="mt-2 line-clamp-2 text-[10px] leading-5 text-zinc-400">{item.prompt}</p>
                      <p className="mt-2 text-[8px] text-zinc-700">{item.id} · {item.confidence}% confidence</p>
                    </button>
                  ))}
                </div>
              </aside>
              {selected && (
                <div className="p-4 sm:p-6">
                  <div className="flex flex-wrap items-center gap-2"><Badge tone="violet">AI generated</Badge><Badge>{selected.type}</Badge><Badge tone={selected.difficulty === "Advanced" ? "rose" : selected.difficulty === "Intermediate" ? "amber" : "green"}>{selected.difficulty}</Badge><span className="ml-auto text-[9px] text-zinc-600">{selected.confidence}% model confidence</span></div>
                  <div className="mt-5 rounded-2xl border border-white/[.07] bg-white/[.02] p-5">
                    <p className="text-[9px] font-semibold uppercase tracking-[.15em] text-violet-400">Generated question</p>
                    <p className="mt-3 text-base font-medium leading-7 text-zinc-200">{selected.prompt}</p>
                  </div>
                  <div className="mt-4 rounded-2xl border border-white/[.07] bg-[#0d0d0f] p-5">
                    <p className="text-[9px] font-semibold uppercase tracking-[.15em] text-cyan-400">AI explanation</p>
                    <p className="mt-3 text-xs leading-6 text-zinc-500">A strong answer should establish the production symptom, validate the request path with evidence, narrow the failure domain, identify the root cause, and close with prevention, monitoring, and rollback strategy.</p>
                    <div className="mt-4 flex flex-wrap gap-2">{["network-path", "production", "diagnostics", "root-cause"].map((tag) => <span key={tag} className="rounded-lg bg-cyan-400/[.055] px-2 py-1 text-[8px] text-cyan-300">#{tag}</span>)}</div>
                  </div>
                  <div className="mt-4 grid gap-3 sm:grid-cols-3">
                    {[["Prerequisites", "Services, CNI, routing"], ["Related topics", "EndpointSlice, kube-proxy"], ["Suggested next", "NetworkPolicy lab"]].map(([label, value]) => <div key={label} className="rounded-xl border border-white/[.06] bg-white/[.018] p-3"><p className="text-[8px] text-zinc-700">{label}</p><p className="mt-2 text-[10px] text-zinc-400">{value}</p></div>)}
                  </div>
                  <div className="mt-6 flex flex-col gap-2 border-t border-white/[.06] pt-5 sm:flex-row">
                    <Button variant="secondary"><Pencil size={14} /> Edit draft</Button>
                    <Button variant="secondary" onClick={() => updateStatus(selected.id, "rejected")} className="sm:ml-auto"><Trash2 size={14} /> Reject</Button>
                    <Button onClick={() => updateStatus(selected.id, "approved")}><CheckCircle2 size={14} /> Approve & publish</Button>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {tab === "graph" && (
            <motion.div key="graph" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="p-4 sm:p-6">
              <div className="grid gap-5 xl:grid-cols-[1fr_310px]">
                <div className="relative min-h-[520px] overflow-hidden rounded-2xl border border-white/[.07] bg-[#09090b]">
                  <div className="premium-grid absolute inset-0 opacity-40" />
                  <svg aria-hidden="true" className="absolute inset-0 h-full w-full">
                    <line x1="50%" y1="48%" x2="22%" y2="22%" stroke="rgba(139,92,246,.35)" />
                    <line x1="50%" y1="48%" x2="78%" y2="21%" stroke="rgba(34,211,238,.28)" />
                    <line x1="50%" y1="48%" x2="20%" y2="77%" stroke="rgba(16,185,129,.25)" />
                    <line x1="50%" y1="48%" x2="80%" y2="76%" stroke="rgba(245,158,11,.28)" />
                    <line x1="22%" y1="22%" x2="78%" y2="21%" stroke="rgba(255,255,255,.08)" strokeDasharray="4 6" />
                  </svg>
                  {[
                    ["Kubernetes Services", "left-1/2 top-[48%] -translate-x-1/2 -translate-y-1/2", "size-36 border-violet-400/30 bg-violet-500/15 text-violet-100"],
                    ["Networking", "left-[22%] top-[22%] -translate-x-1/2 -translate-y-1/2", "size-24 border-cyan-400/25 bg-cyan-500/10 text-cyan-200"],
                    ["Troubleshooting", "left-[78%] top-[21%] -translate-x-1/2 -translate-y-1/2", "size-24 border-rose-400/25 bg-rose-500/10 text-rose-200"],
                    ["Production", "left-[20%] top-[77%] -translate-x-1/2 -translate-y-1/2", "size-24 border-emerald-400/25 bg-emerald-500/10 text-emerald-200"],
                    ["Mock Interview", "left-[80%] top-[76%] -translate-x-1/2 -translate-y-1/2", "size-24 border-amber-400/25 bg-amber-500/10 text-amber-200"],
                  ].map(([label, position, style], index) => (
                    <motion.button key={label} animate={{ y: index % 2 ? [0, -6, 0] : [0, 5, 0] }} transition={{ duration: 3 + index * .4, repeat: Infinity, ease: "easeInOut" }} className={`absolute grid place-items-center rounded-full border text-center text-[9px] font-medium shadow-[0_20px_60px_rgba(0,0,0,.4)] ${position} ${style}`}>{label}</motion.button>
                  ))}
                  <div className="absolute bottom-4 left-4 flex items-center gap-2 rounded-xl border border-white/[.07] bg-black/50 px-3 py-2 text-[9px] text-zinc-500"><GitBranch size={13} className="text-violet-300" /> 1 source · 14 concepts · 318 generated nodes</div>
                </div>
                <div className="space-y-4">
                  <Card className="p-4"><SectionTitle eyebrow="Selected concept" title="Kubernetes Services" /><div className="mt-4 space-y-3">{[["Source questions", "42"], ["Generated variants", "318"], ["Graph depth", "4 levels"], ["Coverage score", "92%"]].map(([label, value]) => <div key={label} className="flex justify-between text-[10px]"><span className="text-zinc-600">{label}</span><span>{value}</span></div>)}</div></Card>
                  <Card className="p-4"><SectionTitle eyebrow="Coverage gaps" title="Recommended expansion" /><div className="mt-4 space-y-2">{["Dual-stack networking", "Topology-aware routing", "Gateway API migration"].map((topic) => <button key={topic} className="flex w-full items-center gap-2 rounded-xl border border-white/[.06] bg-white/[.02] p-3 text-left text-[10px] text-zinc-500 hover:border-violet-400/20"><Sparkles size={13} className="text-violet-300" />{topic}<ChevronRight size={12} className="ml-auto" /></button>)}</div></Card>
                  <Button className="w-full"><WandSparkles size={14} /> Expand missing topics</Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </section>
  );
}
