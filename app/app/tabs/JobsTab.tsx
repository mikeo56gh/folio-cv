'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useApp } from '../context'
import { Card, SectionHeader, Field, Input, Button } from '../../../components/ui'
import { Search, ExternalLink, Loader2, Plus, ArrowRight } from 'lucide-react'
import { toast } from 'sonner'
import { clsx } from 'clsx'

// ─── JOBS TAB ─────────────────────────────────────────────────
export function JobsTab({ onApply }: { onApply: (job: any) => void }) {
  const { profileData, setJdText, setJdUrl, token } = useApp()
  const [what, setWhat] = useState(profileData.jobs.find(j => !j.isGap && j.title)?.title || '')
  const [location, setLocation] = useState(profileData.profile.location?.split(',')[0] || '')
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  async function search() {
    setLoading(true)
    try {
      const res = await fetch('/api/jobs/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ what, location }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setResults(data.jobs || [])
    } catch (e: any) { toast.error(e.message) }
    setLoading(false)
    setSearched(true)
  }

  function apply(job: any) {
    setJdText(job.description || '')
    setJdUrl(job.url || '')
    onApply(job)
    toast.success(`Opening ${job.title} at ${job.company} in Generate…`)
  }

  return (
    <div>
      <SectionHeader title="Find matching jobs" sub="Search live job listings — click 'Apply with Folio' to generate a tailored CV instantly." />
      <Card className="mb-5">
        <div className="grid sm:grid-cols-2 gap-3 mb-3">
          <Field label="Role / keywords"><Input value={what} onChange={e => setWhat(e.target.value)} placeholder="Product Manager" onKeyDown={e => e.key === 'Enter' && search()} /></Field>
          <Field label="Location"><Input value={location} onChange={e => setLocation(e.target.value)} placeholder="London" onKeyDown={e => e.key === 'Enter' && search()} /></Field>
        </div>
        <Button onClick={search} loading={loading} icon={<Search size={14} />}>Search jobs</Button>
      </Card>

      {loading && (
        <div className="flex items-center gap-3 text-gray-400 py-8 justify-center">
          <Loader2 size={18} className="animate-spin text-forest-500" />
          <span className="text-sm">Searching live job boards…</span>
        </div>
      )}

      <AnimatePresence>
        {results.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <p className="text-xs text-gray-400 mb-3">{results.length} roles found</p>
            {results.map((job, i) => (
              <motion.div key={job.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                <Card className="mb-3 hover:shadow-card-hover transition-shadow">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <div className="font-semibold text-sm text-gray-900">{job.title}</div>
                      <div className="text-xs text-gray-500 mt-0.5">{job.company} · {job.location}</div>
                    </div>
                    {job.salary && <span className="text-xs font-semibold text-forest-700 bg-forest-50 border border-forest-200 px-2.5 py-1 rounded-full whitespace-nowrap shrink-0">{job.salary}</span>}
                  </div>
                  <p className="text-xs text-gray-400 leading-relaxed mb-3 line-clamp-2">{job.description}</p>
                  <div className="flex gap-2">
                    <button onClick={() => apply(job)} className="flex items-center gap-1.5 text-xs font-semibold bg-forest-500 text-white px-3 py-1.5 rounded-lg hover:bg-forest-600 transition-colors">
                      ◈ Apply with Folio
                    </button>
                    <a href={job.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-gray-500 border border-parchment-300 px-3 py-1.5 rounded-lg hover:border-parchment-400 transition-colors">
                      View <ExternalLink size={11} />
                    </a>
                  </div>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}
        {searched && !loading && results.length === 0 && (
          <div className="text-center py-12 text-gray-400 text-sm">No results found. Try broader keywords or a different location.</div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── TRACKER TAB ──────────────────────────────────────────────
const COLS = [
  { key: 'applied',   label: 'Applied',   color: '#1d5fa6' },
  { key: 'interview', label: 'Interview', color: '#d97706' },
  { key: 'offer',     label: 'Offer',     color: '#2d5a3d' },
  { key: 'rejected',  label: 'Rejected',  color: '#dc2626' },
]

export function TrackerTab({ onOpenSalaryCoach }: { onOpenSalaryCoach?: (role: string, company: string) => void }) {
  const { tracker, updateTracker } = useApp()

  function addApp(col: string) {
    const val = prompt('Role @ Company (e.g. Senior Engineer @ Stripe):')
    if (!val) return
    const [role, ...co] = val.split('@')
    const app = { id: Math.random().toString(36).slice(2), role: role.trim(), company: co.join('@').trim(), date: new Date().toISOString() }
    updateTracker({ ...tracker, [col]: [...(tracker[col] || []), app] })
  }

  function moveApp(fromCol: string, id: string, toCol: string) {
    const app = (tracker[fromCol] || []).find((a: any) => a.id === id)
    if (!app) return
    updateTracker({ ...tracker, [fromCol]: (tracker[fromCol] || []).filter((a: any) => a.id !== id), [toCol]: [...(tracker[toCol] || []), app] })

    // When a card moves to Offer — prompt to open salary coach
    if (toCol === 'offer' && onOpenSalaryCoach) {
      setTimeout(() => {
        const open = confirm(`🎉 Congratulations on the offer for ${app.role}${app.company ? ' at ' + app.company : ''}!\n\nWant to open the Salary Negotiation Coach to build your counter-offer strategy?`)
        if (open) onOpenSalaryCoach(app.role, app.company)
      }, 300)
    }
  }

  function delApp(col: string, id: string) {
    updateTracker({ ...tracker, [col]: (tracker[col] || []).filter((a: any) => a.id !== id) })
  }

  return (
    <div>
      <SectionHeader title="Application tracker" sub="Track every application. Drag or move cards as your status changes." />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {COLS.map(col => (
          <div key={col.key} className="bg-parchment-200 rounded-2xl p-3">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-bold tracking-wider uppercase" style={{ color: col.color }}>{col.label}</span>
              <span className="text-[10px] font-semibold bg-parchment-300 text-gray-500 px-2 py-0.5 rounded-full">{(tracker[col.key] || []).length}</span>
            </div>
            {(tracker[col.key] || []).map((app: any) => (
              <div key={app.id} className="bg-white border rounded-xl p-3 mb-2 shadow-sm" style={{ borderLeftWidth: 3, borderLeftColor: col.color }}>
                <div className="font-semibold text-xs text-gray-900 mb-0.5 truncate">{app.role}</div>
                <div className="text-[11px] text-gray-500 mb-2 truncate">{app.company}</div>
                {app.date && <div className="text-[10px] text-gray-400 mb-2">{new Date(app.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</div>}
                <div className="flex flex-wrap gap-1">
                  {COLS.filter(c => c.key !== col.key).map(c => (
                    <button key={c.key} onClick={() => moveApp(col.key, app.id, c.key)}
                      className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-parchment-100 border border-parchment-300 text-gray-500 hover:border-parchment-400 transition-colors">
                      → {c.label}
                    </button>
                  ))}
                  <button onClick={() => delApp(col.key, app.id)} className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-red-50 border border-red-200 text-red-500">×</button>
                </div>
              </div>
            ))}
            <button onClick={() => addApp(col.key)}
              className="w-full text-xs text-gray-400 border border-dashed border-parchment-400 rounded-xl py-2 hover:border-forest-300 hover:text-forest-600 transition-colors mt-1">
              + Add
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── HISTORY TAB ──────────────────────────────────────────────
export function HistoryTab({ onRestore }: { onRestore: () => void }) {
  const { versions, outputs, setOutput } = useApp()

  function restore(v: any) {
    if (v.cv_text) setOutput('cv', v.cv_text)
    if (v.cover_letter) setOutput('cl', v.cover_letter)
    onRestore()
    toast.success('Version restored — check the Generate tab')
  }

  return (
    <div>
      <SectionHeader title="Version history" sub="All saved CVs and cover letters" />
      {versions.length === 0 ? (
        <Card className="text-center py-12 text-gray-400 text-sm">
          No saved versions yet.<br /><span className="text-xs mt-1 block">Generate a CV, then click 💾 Save version in the footer.</span>
        </Card>
      ) : (
        <div className="space-y-2.5">
          {versions.map(v => (
            <Card key={v.id} className="flex items-center gap-3 py-3.5">
              <span className="text-2xl">📄</span>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm text-gray-900 truncate">{v.name}</div>
                <div className="text-xs text-gray-400 mt-0.5 flex items-center gap-2">
                  <span>{new Date(v.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  {v.fit_score && <span className="text-forest-600 font-medium">· Fit: {v.fit_score}/100</span>}
                  {v.company_name && <span>· {v.company_name}</span>}
                </div>
              </div>
              <div className="flex gap-2 shrink-0">
                <button onClick={() => restore(v)} className="text-xs font-medium text-forest-700 bg-forest-50 border border-forest-200 px-3 py-1.5 rounded-lg hover:bg-forest-100 transition-colors">
                  Restore
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
