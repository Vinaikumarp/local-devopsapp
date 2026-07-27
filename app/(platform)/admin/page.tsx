"use client";

import { useMemo, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import {
  ArrowUpRight,
  CircleDollarSign,
  Download,
  FileJson,
  FileSpreadsheet,
  MoreHorizontal,
  Pencil,
  Plus,
  Search,
  ShieldCheck,
  Trash2,
  Upload,
  UsersRound,
  X,
} from "lucide-react";
import { RevenueChart } from "@/components/charts";
import { categories, questions } from "@/lib/data";
import { Badge, Button, Card, SectionTitle } from "@/components/ui";
import { difficultyTone } from "@/lib/utils";
import { AdminGate } from "@/components/access-gate";
import { AIContentEngine } from "@/components/admin/ai-content-engine";

function AdminContent() {
  const [query, setQuery] = useState("");
  const [importOpen, setImportOpen] = useState(false);
  const [tab, setTab] = useState<"ai-engine" | "questions" | "students" | "categories">("ai-engine");

  const filtered = useMemo(
    () => questions.filter((question) => question.question.toLowerCase().includes(query.toLowerCase()) || question.category.toLowerCase().includes(query.toLowerCase())),
    [query],
  );

  return (
    <div className="mx-auto max-w-[1500px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <div className="flex items-center gap-2">
            <Badge tone="violet"><ShieldCheck size={11} className="mr-1" /> Admin access</Badge>
            <span className="text-[9px] text-zinc-700">admin@devopscrack.com</span>
          </div>
          <h1 className="mt-3 text-2xl font-semibold tracking-[-.04em] sm:text-3xl">Control center</h1>
          <p className="mt-2 text-xs text-zinc-500">Manage content, students, subscriptions, and platform performance.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => setImportOpen(true)}><Upload size={14} /> Bulk import</Button>
          <Button><Plus size={14} /> Add question</Button>
        </div>
      </div>

      <section className="mt-7 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Total students", value: "10,284", delta: "+12.4%", icon: UsersRound, color: "text-violet-300 bg-violet-400/10" },
          { label: "Active subscribers", value: "8,416", delta: "+8.7%", icon: ShieldCheck, color: "text-emerald-300 bg-emerald-400/10" },
          { label: "Monthly revenue", value: "₹7.48L", delta: "+17.2%", icon: CircleDollarSign, color: "text-cyan-300 bg-cyan-400/10" },
          { label: "Question library", value: "1,857", delta: "+64", icon: FileJson, color: "text-amber-300 bg-amber-400/10" },
        ].map((stat) => (
          <Card key={stat.label} className="p-5">
            <div className="flex items-start justify-between">
              <span className={`grid size-10 place-items-center rounded-xl ${stat.color}`}><stat.icon size={18} /></span>
              <Badge tone="green">{stat.delta}</Badge>
            </div>
            <p className="mt-5 text-2xl font-semibold">{stat.value}</p>
            <p className="mt-1 text-[10px] text-zinc-600">{stat.label}</p>
          </Card>
        ))}
      </section>

      <section className="mt-5 grid gap-5 xl:grid-cols-[1.25fr_.75fr]">
        <Card className="p-5">
          <SectionTitle eyebrow="Last 6 months" title="Revenue growth" action={<Badge tone="green"><ArrowUpRight size={10} className="mr-1" /> 128%</Badge>} />
          <div className="mt-5 h-[270px]"><RevenueChart /></div>
        </Card>
        <Card className="p-5">
          <SectionTitle eyebrow="Subscription mix" title="Plan distribution" />
          <div className="mt-7 flex items-center justify-center gap-8">
            <div className="relative size-36 rounded-full" style={{ background: "conic-gradient(#8b5cf6 0 48%, #22d3ee 48% 78%, #f59e0b 78%)" }}>
              <div className="absolute inset-5 grid place-items-center rounded-full bg-[var(--panel)] text-center"><span><span className="block text-xl font-semibold">8.4k</span><span className="text-[9px] text-zinc-600">subscribers</span></span></div>
            </div>
            <div className="space-y-4">
              {[["6 Months", "48%", "bg-violet-500"], ["Yearly", "30%", "bg-cyan-400"], ["Monthly", "22%", "bg-amber-400"]].map(([label, value, color]) => (
                <div key={label} className="flex items-center gap-2 text-[10px]"><span className={`size-2 rounded-full ${color}`} /><span className="w-16 text-zinc-500">{label}</span><span>{value}</span></div>
              ))}
            </div>
          </div>
        </Card>
      </section>

      <section className="mt-7">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div className="flex rounded-xl border border-white/[.07] bg-white/[.025] p-1">
            {(["ai-engine", "questions", "students", "categories"] as const).map((item) => (
              <button key={item} onClick={() => setTab(item)} className={`rounded-lg px-3 py-2 text-[10px] capitalize ${tab === item ? "bg-white/[.07] text-white" : "text-zinc-600"}`}>{item === "ai-engine" ? "AI Engine" : item}</button>
            ))}
          </div>
          <div className="flex h-9 w-full items-center gap-2 rounded-xl border border-white/[.07] bg-white/[.025] px-3 sm:w-64">
            <Search size={13} className="text-zinc-600" />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={`Search ${tab === "ai-engine" ? "content" : tab}...`} className="min-w-0 flex-1 bg-transparent text-[10px] placeholder:text-zinc-700" />
          </div>
        </div>

        {tab === "ai-engine" && <AIContentEngine />}

        {tab === "questions" && (
          <Card className="mt-4 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[850px] text-left">
                <thead><tr className="border-b border-white/[.06] text-[9px] uppercase tracking-wider text-zinc-700">
                  <th className="px-5 py-3 font-medium">Question</th><th className="px-3 py-3 font-medium">Category</th><th className="px-3 py-3 font-medium">Difficulty</th><th className="px-3 py-3 font-medium">Companies</th><th className="px-5 py-3 text-right font-medium">Actions</th>
                </tr></thead>
                <tbody>{filtered.slice(0, 10).map((question) => (
                  <tr key={question.id} className="border-b border-white/[.05] last:border-0 hover:bg-white/[.02]">
                    <td className="max-w-md px-5 py-4"><p className="line-clamp-1 text-xs text-zinc-300">{question.question}</p><p className="mt-1 text-[9px] text-zinc-700">{question.id} · {question.tags.join(", ")}</p></td>
                    <td className="px-3 py-4"><Badge>{question.category}</Badge></td>
                    <td className="px-3 py-4"><Badge tone={difficultyTone(question.difficulty)}>{question.difficulty}</Badge></td>
                    <td className="px-3 py-4 text-[10px] text-zinc-600">{question.companies.join(", ")}</td>
                    <td className="px-5 py-4"><div className="flex justify-end gap-1"><button className="grid size-8 place-items-center rounded-lg text-zinc-600 hover:bg-white/[.05] hover:text-violet-300"><Pencil size={13} /></button><button className="grid size-8 place-items-center rounded-lg text-zinc-600 hover:bg-rose-400/[.07] hover:text-rose-300"><Trash2 size={13} /></button><button className="grid size-8 place-items-center rounded-lg text-zinc-600 hover:bg-white/[.05]"><MoreHorizontal size={14} /></button></div></td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          </Card>
        )}

        {tab === "students" && (
          <Card className="mt-4 overflow-hidden">
            {[
              ["MS", "Mustafa Shaik", "mustafa@example.com", "6 Months", "Active", "26 Jul 2026"],
              ["PS", "Priya Sharma", "priya@example.com", "Yearly", "Active", "25 Jul 2026"],
              ["AR", "Arjun Reddy", "arjun@example.com", "Monthly", "Active", "25 Jul 2026"],
              ["SN", "Sana Khan", "sana@example.com", "6 Months", "Past due", "24 Jul 2026"],
            ].map(([avatar, name, email, plan, status, seen]) => (
              <div key={email} className="grid grid-cols-[1fr_90px] items-center gap-4 border-b border-white/[.05] p-4 last:border-0 sm:grid-cols-[1fr_100px_90px_100px]">
                <div className="flex min-w-0 items-center gap-3"><span className="grid size-9 shrink-0 place-items-center rounded-xl bg-white/[.05] text-[10px] font-medium">{avatar}</span><div className="min-w-0"><p className="truncate text-xs">{name}</p><p className="mt-1 truncate text-[9px] text-zinc-700">{email}</p></div></div>
                <Badge tone="violet">{plan}</Badge>
                <Badge tone={status === "Active" ? "green" : "amber"} className="hidden sm:inline-flex">{status}</Badge>
                <span className="hidden text-[9px] text-zinc-700 sm:block">{seen}</span>
              </div>
            ))}
          </Card>
        )}

        {tab === "categories" && (
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((category) => (
              <Card key={category.slug} hover className="flex items-center gap-3 p-4">
                <span className="grid size-10 place-items-center rounded-xl text-xs font-semibold" style={{ backgroundColor: `${category.color}18`, color: category.color }}>{category.name.slice(0, 2).toUpperCase()}</span>
                <div><p className="text-xs font-medium">{category.name}</p><p className="mt-1 text-[9px] text-zinc-700">{category.total} questions · /{category.slug}</p></div>
                <button className="ml-auto grid size-8 place-items-center rounded-lg text-zinc-600 hover:bg-white/[.05]"><Pencil size={13} /></button>
              </Card>
            ))}
          </div>
        )}
      </section>

      <Dialog.Root open={importOpen} onOpenChange={setImportOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-[70] bg-black/70 backdrop-blur-sm" />
          <Dialog.Content className="fixed left-1/2 top-1/2 z-[80] w-[calc(100%-24px)] max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-white/10 bg-[#111113] p-5 shadow-[0_30px_100px_rgba(0,0,0,.55)]">
            <div className="flex items-center justify-between"><Dialog.Title className="text-base font-semibold">Bulk import questions</Dialog.Title><Dialog.Close className="grid size-8 place-items-center rounded-lg text-zinc-600 hover:bg-white/[.06]"><X size={16} /></Dialog.Close></div>
            <Dialog.Description className="mt-2 text-[10px] leading-5 text-zinc-600">Upload a CSV or JSON export. Columns are validated before any content is imported.</Dialog.Description>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <button className="rounded-2xl border border-dashed border-white/[.12] bg-white/[.025] p-6 text-center hover:border-violet-400/25 hover:bg-violet-400/[.04]"><FileSpreadsheet size={24} className="mx-auto text-emerald-300" /><p className="mt-3 text-xs font-medium">Upload CSV</p><p className="mt-1 text-[9px] text-zinc-700">Up to 10 MB</p></button>
              <button className="rounded-2xl border border-dashed border-white/[.12] bg-white/[.025] p-6 text-center hover:border-violet-400/25 hover:bg-violet-400/[.04]"><FileJson size={24} className="mx-auto text-cyan-300" /><p className="mt-3 text-xs font-medium">Upload JSON</p><p className="mt-1 text-[9px] text-zinc-700">Up to 10 MB</p></button>
            </div>
            <div className="mt-4 flex items-center justify-between rounded-xl border border-white/[.06] bg-white/[.02] p-3"><p className="text-[10px] text-zinc-600">Need the correct format?</p><button className="flex items-center gap-1.5 text-[10px] text-violet-300"><Download size={12} /> Download template</button></div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}

export default function AdminPage() {
  return (
    <AdminGate>
      <AdminContent />
    </AdminGate>
  );
}
