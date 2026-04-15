'use client'
import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useApp } from '../context'
import { Card, SectionHeader, Field, Input, Button } from '../../../components/ui'
import { Search, ExternalLink, Loader2, MapPin } from 'lucide-react'
import { toast } from 'sonner'
import { clsx } from 'clsx'

// Location autocomplete component using Adzuna's location data
function LocationAutocomplete({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [open, setOpen] = useState(false)
  const [highlight, setHighlight] = useState(-1)
  const debounce = useRef<NodeJS.Timeout>()
  const wrapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  function onInput(val: string) {
    onChange(val)
    setHighlight(-1)
    clearTimeout(debounce.current)
    if (val.length < 2) { setSuggestions([]); setOpen(false); return }
    debounce.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/jobs/locations?q=${encodeURIComponent(val)}&country=gb`)
        const data = await res.json()
        setSuggestions(data.locations || [])
        setOpen((data.locations || []).length > 0)
      } catch {}
    }, 250)
  }

  function pick(loc: string) {
    onChange(loc)
    setSuggestions([])
    setOpen(false)
  }

  function onKey(e: React.KeyboardEvent) {
    if (!open) return
    if (e.key === 'ArrowDown') { e.preventDefault(); setHighlight(h => Math.min(h + 1, suggestions.length - 1)) }
    if (e.key === 'ArrowUp') { e.preventDefault(); setHighlight(h => Math.max(h - 1, -1)) }
    if (e.key === 'Enter' && highlight >= 0) { e.preventDefault(); pick(suggestions[highlight]) }
    if (e.key === 'Escape') setOpen(false)
  }

  return (
    <div ref={wrapRef} className="relative">
      <input
        type="text"
        value={value}
        onChange={e => onInput(e.target.value)}
        onKeyDown={onKey}
        onFocus={() => suggestions.length > 0 && setOpen(true)}
        placeholder={placeholder || 'e.g. Hull, East Riding Of Yorkshire'}
        className="w-full bg-parchment-100 border border-parchment-300 rounded-lg px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-forest-400/30 focus:border-forest-400 focus:bg-white transition-all"
      />
      {open && suggestions.length > 0 && (
        <div className="absolute z-50 left-0 right-0 top-full mt-1 bg-white border border-parchment-300 rounded-xl shadow-card-hover overflow-hidden">
          {suggestions.map((s, i) => (
            <button
              key={s}
              type="button"
              onMouseDown={() => pick(s)}
              className={clsx(
                'w-full text-left flex items-center gap-2 px-3 py-2.5 text-sm transition-colors',
                i === highlight ? 'bg-forest-50 text-forest-700' : 'text-gray-700 hover:bg-parchment-100'
              )}
            >
              <MapPin size={12} className="text-gray-400 shrink-0" />
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

const DISTANCE_OPTIONS = [
  { value: '', label: 'Any distance' },
  { value: '5', label: 'Within 5 miles' },
  { value: '10', label: 'Within 10 miles' },
  { value: '20', label: 'Within 20 miles' },
  { value: '30', label: 'Within 30 miles' },
  { value: '50', label: 'Within 50 miles' },
]

const WORK_TYPE_OPTIONS = [
  { value: '', label: 'All types', icon: '🔍' },
  { value: 'remote', label: 'Remote', icon: '🌐' },
  { value: 'hybrid', label: 'Hybrid', icon: '🏠' },
  { value: 'onsite', label: 'On-site', icon: '🏢' },
]

const CONTRACT_OPTIONS = [
  { value: '', label: 'All contracts' },
  { value: 'permanent', label: 'Permanent' },
  { value: 'contract', label: 'Contract' },
  { value: 'part_time', label: 'Part-time' },
]

// Title autocomplete component
function TitleAutocomplete({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [open, setOpen] = useState(false)
  const [highlight, setHighlight] = useState(-1)
  const debounce = useRef<NodeJS.Timeout>()
  const wrapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  function onInput(val: string) {
    onChange(val)
    setHighlight(-1)
    clearTimeout(debounce.current)
    if (val.length < 2) { setSuggestions([]); setOpen(false); return }
    debounce.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/jobs/titles?q=${encodeURIComponent(val)}&country=gb`)
        const data = await res.json()
        setSuggestions(data.titles || [])
        setOpen((data.titles || []).length > 0)
      } catch {}
    }, 250)
  }

  function pick(title: string) {
    onChange(title)
    setSuggestions([])
    setOpen(false)
  }

  function onKey(e: React.KeyboardEvent) {
    if (!open) return
    if (e.key === 'ArrowDown') { e.preventDefault(); setHighlight(h => Math.min(h + 1, suggestions.length - 1)) }
    if (e.key === 'ArrowUp') { e.preventDefault(); setHighlight(h => Math.max(h - 1, -1)) }
    if (e.key === 'Enter' && highlight >= 0) { e.preventDefault(); pick(suggestions[highlight]) }
    if (e.key === 'Escape') setOpen(false)
  }

  return (
    <div ref={wrapRef} className="relative">
      <input
        type="text"
        value={value}
        onChange={e => onInput(e.target.value)}
        onKeyDown={onKey}
        onFocus={() => suggestions.length > 0 && setOpen(true)}
        placeholder={placeholder || 'e.g. Product Manager'}
        className="w-full bg-parchment-100 border border-parchment-300 rounded-lg px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-forest-400/30 focus:border-forest-400 focus:bg-white transition-all"
      />
      {open && suggestions.length > 0 && (
        <div className="absolute z-50 left-0 right-0 top-full mt-1 bg-white border border-parchment-300 rounded-xl shadow-card-hover overflow-hidden">
          {suggestions.map((s, i) => (
            <button
              key={s}
              type="button"
              onMouseDown={() => pick(s)}
              className={clsx(
                'w-full text-left px-3 py-2.5 text-sm transition-colors',
                i === highlight ? 'bg-forest-50 text-forest-700' : 'text-gray-700 hover:bg-parchment-100'
              )}
            >
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── JOBS TAB ─────────────────────────────────────────────────
export function JobsTab({ onApply }: { onApply: (job: any) => void }) {
  const { profileData, setJdText, setJdUrl, token } = useApp()
  const [what, setWhat] = useState(profileData.jobs.find(j => !j.isGap && j.title)?.title || '')
  const [location, setLocation] = useState(profileData.profile.location || '')
  const [distance, setDistance] = useState('')
  const [workType, setWorkType] = useState('')
  const [contract, setContract] = useState('')
  const [salaryMin, setSalaryMin] = useState('')
  const [results, setResults] = useState<any[]>([])
  const [searchedCity, setSearchedCity] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  async function search() {
    setLoading(true)

    // Build the search keywords including work type
    let searchWhat = what
    if (workType === 'remote') searchWhat = `${what} remote`.trim()
    if (workType === 'hybrid') searchWhat = `${what} hybrid`.trim()

    try {
      const res = await fetch('/api/jobs/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          what: searchWhat,
          location,
          distance_km: distance ? Math.round(parseInt(distance) * 1.60934) : undefined,
          contract_type: contract || undefined,
          salaryMin: salaryMin ? parseInt(salaryMin) : undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setResults(data.jobs || [])
      if (data.searchedCity) setSearchedCity(data.searchedCity)
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
        {/* Main search row */}
        <div className="grid sm:grid-cols-2 gap-3 mb-3">
          <Field label="Role / keywords">
            <TitleAutocomplete value={what} onChange={setWhat} placeholder="e.g. Product Manager" />
          </Field>
          <Field label="Location">
            <LocationAutocomplete value={location} onChange={setLocation} placeholder="e.g. Hull, East Riding Of Yorkshire" />
          </Field>
        </div>

        {/* Work type chips */}
        <div className="mb-3">
          <div className="text-[10px] font-bold tracking-wider text-gray-400 uppercase mb-2">Work type</div>
          <div className="flex flex-wrap gap-2">
            {WORK_TYPE_OPTIONS.map(opt => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setWorkType(opt.value)}
                className={clsx(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all',
                  workType === opt.value
                    ? 'bg-forest-50 border-forest-300 text-forest-700'
                    : 'bg-white border-parchment-300 text-gray-500 hover:border-forest-200 hover:text-forest-600'
                )}
              >
                <span>{opt.icon}</span>
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Distance, contract, salary row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
          <Field label="Distance from location">
            <select
              value={distance}
              onChange={e => setDistance(e.target.value)}
              className="w-full bg-parchment-100 border border-parchment-300 rounded-lg px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-forest-400"
              style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='11' height='7' viewBox='0 0 11 7'%3E%3Cpath d='M1 1l4.5 4.5L10 1' stroke='%239c9b94' stroke-width='1.4' fill='none' stroke-linecap='round'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center', paddingRight: '32px', appearance: 'none' as any }}
            >
              {DISTANCE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </Field>
          <Field label="Contract type">
            <select
              value={contract}
              onChange={e => setContract(e.target.value)}
              className="w-full bg-parchment-100 border border-parchment-300 rounded-lg px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-forest-400"
              style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='11' height='7' viewBox='0 0 11 7'%3E%3Cpath d='M1 1l4.5 4.5L10 1' stroke='%239c9b94' stroke-width='1.4' fill='none' stroke-linecap='round'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center', paddingRight: '32px', appearance: 'none' as any }}
            >
              {CONTRACT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </Field>
          <Field label="Min salary (£)">
            <Input value={salaryMin} onChange={e => setSalaryMin(e.target.value)} placeholder="e.g. 40000" type="number" />
          </Field>
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
            <p className="text-xs text-gray-400 mb-3">
              {results.length} roles found
              {searchedCity ? ` near ${searchedCity}` : ''}
              {distance ? ` · within ${distance} miles` : ''}
              {workType ? ` · ${workType}` : ''}
            </p>
            {results.map((job, i) => (
              <motion.div key={job.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                <Card className="mb-3 hover:shadow-card-hover transition-shadow">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <div className="font-semibold text-sm text-gray-900">{job.title}</div>
                      <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                        <span className="text-xs text-gray-500">{job.company}</span>
                        <span className="text-gray-300">·</span>
                        <span className="flex items-center gap-1 text-xs text-gray-500">
                          <MapPin size={10} />
                          {job.location}
                        </span>
                        {job.contract && <span className="text-[10px] font-medium bg-parchment-200 text-gray-600 px-2 py-0.5 rounded-full">{job.contract}</span>}
                      </div>
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
          <div className="text-center py-12 text-gray-400 text-sm">
            No results found.<br />
            <span className="text-xs mt-1 block">Try broader keywords, a different location, or remove the distance filter.</span>
          </div>
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
