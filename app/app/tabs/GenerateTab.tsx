'use client'
import { useState, useRef, useCallback } from 'react'
import { useCompletion } from 'ai/react'
import { motion, AnimatePresence } from 'framer-motion'
import { useApp, SENIORITY, TONES, SECTORS, fmtDate } from '../context'
import { Card, SectionHeader, Field, Input, Textarea, Chip, Tip, Guidance, Button } from '../../../components/ui'
import { Search, Building2, FileText, Mail, BarChart2, Mic, Flag, Key, Loader2, Copy, Download, Printer, CheckCircle, X, Plus } from 'lucide-react'
import { toast } from 'sonner'
import { clsx } from 'clsx'

const GEN_BUTTONS = [
  { type: 'cv',        label: 'ATS-optimised CV',      icon: FileText,  variant: 'primary' },
  { type: 'cl',        label: 'Cover letter',           icon: Mail,      variant: 'secondary' },
  { type: 'review',    label: 'Fit review & score',     icon: BarChart2, variant: 'blue' },
  { type: 'interview', label: 'Interview prep',         icon: Mic,       variant: 'purple' },
  { type: 'flags',     label: 'Red flag checker',       icon: Flag,      variant: 'red' },
  { type: 'keywords',  label: 'Keyword gap analysis',   icon: Key,       variant: 'amber' },
]

const VARIANT_STYLES: Record<string, string> = {
  primary:   'bg-forest-500 text-white hover:bg-forest-600 shadow-sm',
  secondary: 'bg-white text-forest-700 border border-forest-300 hover:bg-forest-50',
  blue:      'bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100',
  purple:    'bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100',
  red:       'bg-red-50 text-red-700 border border-red-200 hover:bg-red-100',
  amber:     'bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100',
}

const OUT_TAB_STYLES: Record<string, string> = {
  cv:        'data-[active=true]:bg-forest-50 data-[active=true]:border-forest-300 data-[active=true]:text-forest-700',
  cl:        'data-[active=true]:bg-forest-50 data-[active=true]:border-forest-300 data-[active=true]:text-forest-700',
  review:    'data-[active=true]:bg-blue-50 data-[active=true]:border-blue-300 data-[active=true]:text-blue-700',
  interview: 'data-[active=true]:bg-purple-50 data-[active=true]:border-purple-300 data-[active=true]:text-purple-700',
  flags:     'data-[active=true]:bg-red-50 data-[active=true]:border-red-300 data-[active=true]:text-red-700',
  keywords:  'data-[active=true]:bg-amber-50 data-[active=true]:border-amber-300 data-[active=true]:text-amber-700',
}

// Score Ring
function ScoreRing({ score }: { score: number }) {
  const r = 38; const c = 2 * Math.PI * r
  const offset = c - (score / 100) * c
  const col = score >= 75 ? '#2d5a3d' : score >= 50 ? '#d97706' : '#dc2626'
  const textCol = score >= 75 ? 'text-forest-600' : score >= 50 ? 'text-amber-600' : 'text-red-600'
  return (
    <div className="flex flex-col items-center gap-1">
      <svg width="90" height="90" viewBox="0 0 90 90">
        <circle cx="45" cy="45" r={r} fill="none" stroke="#e8f0eb" strokeWidth="5.5" />
        <motion.circle cx="45" cy="45" r={r} fill="none" stroke={col} strokeWidth="5.5" strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={offset} transform="rotate(-90 45 45)"
          initial={{ strokeDashoffset: c }} animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: [0.4, 0, 0.2, 1], delay: 0.2 }}
        />
        <text x="45" y="41" textAnchor="middle" fontSize="18" fontWeight="600" fill={col} fontFamily="Georgia, serif">{score}</text>
        <text x="45" y="54" textAnchor="middle" fontSize="9" fill="#9ca3af">/100</text>
      </svg>
    </div>
  )
}

// Output panels for structured JSON
function ReviewPanel({ data }: { data: any }) {
  const score = Math.min(100, Math.max(0, parseInt(data.fitScore) || 0))
  const verdict = score >= 80 ? 'Strong match — apply with confidence' : score >= 65 ? 'Good match — worth applying' : score >= 45 ? 'Partial match — consider carefully' : 'Significant gaps'
  const col = score >= 75 ? 'text-forest-600' : score >= 50 ? 'text-amber-600' : 'text-red-600'
  return (
    <div className="p-5 space-y-5">
      <div className="flex items-center gap-5">
        <ScoreRing score={score} />
        <div>
          <div className={clsx('text-lg font-semibold', col)}>{verdict}</div>
          <div className="text-xs text-gray-400 mt-0.5">Based on JD match, experience, skills, and seniority</div>
          {data.salaryContext && (
            <div className="mt-2 bg-forest-50 border border-forest-200 rounded-lg px-3 py-2">
              <div className="text-forest-700 font-semibold text-sm">{data.salaryContext.range}</div>
              <div className="text-xs text-forest-600 mt-0.5 leading-relaxed">{data.salaryContext.note}</div>
            </div>
          )}
        </div>
      </div>
      {(data.dimensions || []).map((d: any) => (
        <div key={d.name} className="flex items-center gap-3">
          <span className="w-28 text-xs text-gray-500 shrink-0">{d.name}</span>
          <div className="flex-1 h-1.5 bg-parchment-200 rounded-full overflow-hidden">
            <motion.div initial={{ width: 0 }} animate={{ width: `${d.score}%` }} transition={{ duration: 0.7, delay: 0.3 }}
              className="h-full rounded-full" style={{ background: d.score >= 70 ? '#2d5a3d' : d.score >= 45 ? '#d97706' : '#dc2626' }} />
          </div>
          <span className="w-7 text-right text-xs font-semibold text-gray-600">{d.score}%</span>
        </div>
      ))}
      {[
        { title: '✓ Strengths', items: data.strengths, col: 'text-forest-700', dot: 'bg-forest-500' },
        { title: '✗ Gaps', items: data.gaps, col: 'text-red-700', dot: 'bg-red-500' },
        { title: '⚠ Considerations', items: data.considerations, col: 'text-amber-700', dot: 'bg-amber-500' },
      ].map(({ title, items, col, dot }) => (items || []).length ? (
        <div key={title}>
          <div className={clsx('text-[11px] font-bold tracking-[1.5px] uppercase mb-2', col)}>{title}</div>
          {items.map((item: string, i: number) => (
            <div key={i} className="flex items-start gap-2 text-sm text-gray-600 mb-2 leading-relaxed">
              <div className={clsx('w-1.5 h-1.5 rounded-full mt-1.5 shrink-0', dot)} />{item}
            </div>
          ))}
        </div>
      ) : null)}
      {data.recommendation && <div className="bg-blue-50 border border-blue-100 rounded-xl p-3.5 text-sm text-blue-800 leading-relaxed">💬 {data.recommendation}</div>}
    </div>
  )
}

function InterviewPanel({ data }: { data: any }) {
  return (
    <div className="p-4 space-y-3">
      {(data.questions || []).map((q: any, i: number) => (
        <motion.div key={i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
          className="bg-parchment-100 border border-parchment-300 rounded-xl p-4">
          <div className="text-[10px] font-bold tracking-[1.5px] text-purple-600 uppercase mb-1">Q{i+1} · {q.type}</div>
          <div className="font-semibold text-sm text-gray-900 mb-2">{q.question}</div>
          <div className="text-xs text-gray-500 leading-relaxed"><strong>Angle:</strong> {q.hint}</div>
        </motion.div>
      ))}
    </div>
  )
}

function FlagsPanel({ data }: { data: any }) {
  const st: Record<string, any> = { high: { bg: 'bg-red-50 border-red-200', icon: '🔴' }, medium: { bg: 'bg-amber-50 border-amber-200', icon: '🟡' }, low: { bg: 'bg-forest-50 border-forest-200', icon: '🟢' } }
  return (
    <div className="p-4 space-y-2.5">
      <p className="text-xs text-gray-400 mb-3">Address these before submitting your application.</p>
      {(data.flags || []).map((f: any, i: number) => {
        const s = st[f.severity] || st.medium
        return (
          <div key={i} className={clsx('flex items-start gap-3 rounded-xl p-3.5 border text-sm', s.bg)}>
            <span className="text-base shrink-0">{s.icon}</span>
            <div><div className="font-semibold text-gray-800 mb-1">{f.issue}</div><div className="text-xs text-gray-500 leading-relaxed">{f.advice}</div></div>
          </div>
        )
      })}
      {data.overall && <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-800 mt-2">{data.overall}</div>}
    </div>
  )
}

function KeywordsPanel({ data }: { data: any }) {
  return (
    <div className="p-4 space-y-4">
      <p className="text-xs text-gray-400">Green = in your profile · Red = missing. Add missing to skills or achievements.</p>
      {[
        { title: `✓ You have (${(data.have||[]).length})`, items: data.have, cls: 'bg-forest-50 border-forest-200 text-forest-700' },
        { title: `✗ Missing (${(data.missing||[]).length})`, items: data.missing, cls: 'bg-red-50 border-red-200 text-red-700' },
      ].map(({ title, items, cls }) => (
        <div key={title}>
          <div className="text-[11px] font-bold tracking-wider uppercase text-gray-500 mb-2">{title}</div>
          <div className="flex flex-wrap gap-1.5">{(items||[]).map((k: string) => <span key={k} className={clsx('text-xs px-2.5 py-1 rounded-full font-medium border', cls)}>{k}</span>)}</div>
        </div>
      ))}
      {data.advice && <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-800">{data.advice}</div>}
    </div>
  )
}

function OutputPanel({ type, content }: { type: string; content: string }) {
  if (!content) return null
  const isText = ['cv', 'cl'].includes(type)
  const copy = () => { navigator.clipboard.writeText(content); toast.success('Copied!') }
  const download = () => { const a = document.createElement('a'); a.href = 'data:text/plain;charset=utf-8,' + encodeURIComponent(content); a.download = type + '.txt'; a.click() }
  const print = () => { const w = window.open('', '_blank')!; w.document.write(`<html><head><title>Folio</title><style>body{font-family:Calibri,sans-serif;font-size:11pt;line-height:1.6;margin:25mm 20mm}pre{white-space:pre-wrap;font-family:inherit}</style></head><body><pre>${content.replace(/</g,'&lt;')}</pre></body></html>`); w.document.close(); w.print() }

  if (isText) return (
    <>
      <div className="flex items-center gap-2 px-4 py-2.5 bg-parchment-100 border-b border-parchment-300">
        <div className="flex items-center gap-1.5 flex-1">
          <CheckCircle size={13} className="text-forest-500" />
          <span className="text-xs text-gray-500 font-medium">ATS ready · plain text</span>
        </div>
        <div className="flex gap-1.5">
          {[{ icon: Copy, label: 'Copy', fn: copy }, { icon: Download, label: '.txt', fn: download }, { icon: Printer, label: 'PDF', fn: print }].map(({ icon: Icon, label, fn }) => (
            <button key={label} onClick={fn} className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-800 bg-white border border-parchment-300 px-2.5 py-1 rounded-lg transition-colors">
              <Icon size={11} /> {label}
            </button>
          ))}
        </div>
      </div>
      <pre className="p-5 text-[13px] leading-relaxed text-gray-800 whitespace-pre-wrap break-words font-sans max-h-[520px] overflow-y-auto">{content}</pre>
    </>
  )

  try {
    const data = JSON.parse(content.replace(/```json|```/g, '').trim())
    if (type === 'review') return <ReviewPanel data={data} />
    if (type === 'interview') return <InterviewPanel data={data} />
    if (type === 'flags') return <FlagsPanel data={data} />
    if (type === 'keywords') return <KeywordsPanel data={data} />
  } catch {}
  return <pre className="p-5 text-xs whitespace-pre-wrap font-sans text-gray-600">{content}</pre>
}

export function GenerateTab() {
  const { profileData, jdText, setJdText, jdUrl, setJdUrl, tone, setTone, sector, setSector, customSectors, setCustomSectors, companyBrief, setCompanyBrief, outputs, setOutput, token, setUpgradeMsg } = useApp()
  const [activeOut, setActiveOut] = useState<string>('cv')
  const [activeGenType, setActiveGenType] = useState<string | null>(null)
  const [briefLoading, setBriefLoading] = useState(false)
  const [attachments, setAttachments] = useState<any[]>([])
  const fileRef = useRef<HTMLInputElement>(null)
  const senLabel = SENIORITY.find(s => s.key === profileData.profile.seniority)?.label || 'Mid-level'

  const buildRequestBody = (type: string) => {
    const textParts: string[] = []
    const imgBlocks: any[] = []
    if (jdText) textParts.push('JOB DESCRIPTION:\n' + jdText)
    if (jdUrl) textParts.push('Job URL: ' + jdUrl)
    attachments.forEach(a => {
      if (a.error) return
      if (a.text) textParts.push(`ATTACHED (${a.name}):\n${a.text.substring(0, 30000)}`)
      if (a.base64 && a.isImage) imgBlocks.push({ type: 'image', source: { type: 'base64', media_type: a.name.endsWith('.png') ? 'image/png' : 'image/jpeg', data: a.base64 } })
    })
    return {
      type,
      data: {
        profile: profileData.profile,
        jobs: profileData.jobs.map(j => j.isGap
          ? { isGap: true, gapReason: j.gapReason, dates: `${fmtDate(j.startMonth, j.startYear, false)} – ${fmtDate(j.endMonth, j.endYear, false)}` }
          : { title: j.title, company: j.company, location: j.location, dates: `${fmtDate(j.startMonth, j.startYear, false)} – ${fmtDate(j.endMonth, j.endYear, j.current)}`, achievements: j.achievements.filter(a => a.trim()) }),
        education: profileData.education.map(e => ({ degree: e.degree, institution: e.institution, location: e.location, grade: e.grade, dates: `${fmtDate(e.startMonth, e.startYear, false)} – ${fmtDate(e.endMonth, e.endYear, false)}`, notes: e.notes })),
        qualifications: profileData.qualifications.filter(q => q.title && q.body).map(q => ({ title: q.title, body: q.body, reference: q.reference, achieved: fmtDate(q.achievedMonth, q.achievedYear, false), expiry: q.expiry, notes: q.notes })),
        skills: profileData.skills.map(s => ({ category: s.category, skills: s.tags, context: s.context || '' })),
      },
      jdContext: textParts.join('\n\n——\n\n'),
      companyBrief,
      tone,
      sector,
      seniority: profileData.profile.seniority,
    }
  }

  const { complete, isLoading, error } = useCompletion({
    api: '/api/generate',
    headers: { Authorization: `Bearer ${token}` },
    onFinish: (_, completion) => {
      if (activeGenType) { setOutput(activeGenType, completion); setActiveOut(activeGenType) }
      setActiveGenType(null)
    },
    onError: (err: any) => {
      if (err.message?.includes('limit') || err.message?.includes('Upgrade')) setUpgradeMsg(err.message)
      else toast.error(err.message)
      setActiveGenType(null)
    },
  })

  function generate(type: string) {
    if (isLoading) return
    setActiveGenType(type)
    complete('', { body: buildRequestBody(type) })
  }

  async function fetchCompanyBrief() {
    if (!jdUrl && !jdText) { toast.error('Paste a job URL or description first.'); return }
    setBriefLoading(true)
    try {
      const res = await fetch('/api/company-research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ jdContext: jdText.substring(0, 1000), jdUrl }),
      })
      const reader = res.body!.getReader(); const decoder = new TextDecoder(); let result = ''
      while (true) {
        const { done, value } = await reader.read(); if (done) break
        const chunk = decoder.decode(value); result += chunk
      }
      const match = result.match(/\{[\s\S]*\}/)
      if (match) setCompanyBrief(match[0])
    } catch (e: any) { toast.error('Research failed: ' + e.message) }
    setBriefLoading(false)
  }

  function handleFiles(files: FileList) {
    Array.from(files).forEach(file => {
      const ext = file.name.split('.').pop()?.toLowerCase()
      const isImage = ['png', 'jpg', 'jpeg'].includes(ext || '')
      const entry: any = { id: uid(), name: file.name, isImage, text: '', base64: '', error: false }
      setAttachments(prev => [...prev, entry])
      const r = new FileReader()
      if (isImage || ext === 'pdf') {
        r.onload = ev => { entry.base64 = (ev.target!.result as string).split(',')[1]; setAttachments(prev => prev.map(a => a.id === entry.id ? { ...a, base64: entry.base64 } : a)) }
        r.readAsDataURL(file)
      } else {
        r.onload = ev => { entry.text = ev.target!.result as string; setAttachments(prev => prev.map(a => a.id === entry.id ? { ...a, text: entry.text } : a)) }
        r.readAsText(file)
      }
    })
  }

  let parsedBrief: any = null
  try { if (companyBrief) parsedBrief = JSON.parse(companyBrief) } catch {}

  const outputTabs = Object.entries(outputs).filter(([, v]) => v).map(([k]) => k)

  return (
    <div>
      <SectionHeader eyebrow="Step 6" title="Generate" sub="Paste the job description — every tool uses it." />

      {/* Settings */}
      <Card className="mb-4">
        <div className="flex items-center gap-3 flex-wrap mb-3">
          <span className="text-xs text-gray-500">Level: <strong className="text-forest-700">{senLabel}</strong></span>
          <div className="flex flex-wrap gap-1.5 ml-auto">
            {TONES.map(t => <Chip key={t.key} label={t.label} active={tone === t.key} onClick={() => setTone(t.key)} />)}
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5">
          <span className="text-[10px] font-bold tracking-wider uppercase text-gray-400 self-center">Sector</span>
          {[...SECTORS, ...customSectors.map(c => ({ key: 'custom_' + c, label: c }))].map(s => (
            <Chip key={s.key} label={s.label} active={sector === s.key} onClick={() => setSector(s.key)}
              onRemove={s.key.startsWith('custom_') ? () => { setCustomSectors(customSectors.filter(c => c !== s.label)); if (sector === s.key) setSector('general') } : undefined}
            />
          ))}
          <Chip label="+ Add" active={false} dashed onClick={() => { const n = prompt('Sector name:'); if (n) setCustomSectors([...customSectors, n]) }} />
        </div>
      </Card>

      {/* Company brief panel */}
      <AnimatePresence>
        {briefLoading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white border border-forest-200 rounded-2xl p-5 mb-4 flex items-center gap-3 text-forest-600">
            <Loader2 size={18} className="animate-spin" />
            <div><div className="text-sm font-medium">Researching company…</div><div className="text-xs text-forest-400 mt-0.5">Searching web · reading news · analysing culture signals</div></div>
          </motion.div>
        )}
        {parsedBrief && !briefLoading && (
          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="border border-forest-200 rounded-2xl overflow-hidden mb-4">
            <div className="bg-forest-50 border-b border-forest-200 px-4 py-3 flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-forest-500 flex items-center justify-center text-white text-sm">🏢</div>
              <div className="flex-1"><div className="text-sm font-semibold text-forest-700">{parsedBrief.name || 'Company research'}</div><div className="text-xs text-forest-500">Live research · feeds into all outputs below</div></div>
              <button onClick={() => setCompanyBrief('')} className="text-forest-400 hover:text-red-500 transition-colors"><X size={15} /></button>
            </div>
            <div className="bg-white p-4">
              {parsedBrief.summary && <p className="text-sm text-gray-600 leading-relaxed mb-3">{parsedBrief.summary}</p>}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
                {[['Industry', parsedBrief.industry], ['Size', parsedBrief.size], ['Stage', parsedBrief.revenue], ['HQ', parsedBrief.hq]].filter(([, v]) => v).map(([k, v]) => (
                  <div key={k} className="bg-parchment-100 rounded-lg px-3 py-2">
                    <div className="text-[10px] font-bold tracking-wider text-gray-400 uppercase mb-0.5">{k}</div>
                    <div className="text-xs font-medium text-gray-800">{v}</div>
                  </div>
                ))}
              </div>
              {parsedBrief.talkingPoints && <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-800">💬 <strong>Use in cover letter/interview:</strong> {parsedBrief.talkingPoints}</div>}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* JD input */}
      <Card className="mb-4">
        <div className="flex items-end gap-2 mb-3">
          <Field label="Job posting URL" className="flex-1"><Input value={jdUrl} onChange={e => setJdUrl(e.target.value)} placeholder="https://company.com/careers/role" /></Field>
          <Button variant="secondary" size="sm" loading={briefLoading} onClick={fetchCompanyBrief} icon={<Search size={13} />} className="mb-0.5 whitespace-nowrap">Research</Button>
        </div>
        {/* Attachments */}
        <div
          className="border-2 border-dashed border-parchment-400 rounded-xl p-4 text-center cursor-pointer hover:border-forest-300 hover:bg-forest-50/30 transition-all mb-3"
          onClick={() => fileRef.current?.click()}
          onDragOver={e => e.preventDefault()}
          onDrop={e => { e.preventDefault(); handleFiles(e.dataTransfer.files) }}
        >
          <div className="text-lg opacity-40 mb-1">📎</div>
          <div className="text-xs font-medium text-gray-500">Click or drag to upload · PDF, DOCX, TXT, PNG, JPG</div>
        </div>
        <input ref={fileRef} type="file" multiple accept=".pdf,.docx,.doc,.txt,.png,.jpg,.jpeg" className="hidden" onChange={e => e.target.files && handleFiles(e.target.files)} />
        {attachments.length > 0 && (
          <div className="space-y-1.5 mb-3">
            {attachments.map((a, i) => (
              <div key={a.id} className="flex items-center gap-2 bg-parchment-100 border border-parchment-300 rounded-lg px-3 py-2">
                <span className="text-sm">{a.isImage ? '🖼️' : a.type === 'pdf' ? '📄' : '📝'}</span>
                <span className="flex-1 text-xs font-medium truncate">{a.name}</span>
                <span className={clsx('text-[10px]', a.error ? 'text-red-500' : 'text-forest-600')}>{a.error ? 'Failed' : a.text ? Math.round(a.text.length / 4) + ' tokens' : 'Processing…'}</span>
                <button onClick={() => setAttachments(prev => prev.filter((_, j) => j !== i))} className="text-gray-400 hover:text-red-500 transition-colors text-sm">×</button>
              </div>
            ))}
          </div>
        )}
        <Field label="Job description">
          <Textarea value={jdText} onChange={e => setJdText(e.target.value)} rows={9} placeholder={'Paste the full job description here…\n\nThe more detail, the better every tool performs.'} />
        </Field>
        <Tip>Include the full posting — company blurb, requirements, nice-to-haves. All 6 tools use this to tailor your application and assess your real fit.</Tip>
      </Card>

      {/* Generate buttons */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mb-4">
        {GEN_BUTTONS.map(({ type, label, icon: Icon, variant }) => (
          <button
            key={type}
            onClick={() => generate(type)}
            disabled={isLoading}
            className={clsx(
              'flex items-center justify-center gap-2 py-3 px-3 rounded-xl text-xs font-semibold transition-all duration-200',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              VARIANT_STYLES[variant]
            )}
          >
            {isLoading && activeGenType === type ? <Loader2 size={13} className="animate-spin" /> : <Icon size={13} />}
            {isLoading && activeGenType === type ? 'Generating…' : label}
          </button>
        ))}
      </div>

      {/* Streaming output in real-time */}
      {isLoading && activeGenType && !outputs[activeGenType] && (
        <Card className="mb-3">
          <div className="flex items-center gap-2 text-gray-400 text-sm p-1">
            <Loader2 size={15} className="animate-spin text-forest-500" />
            <span>Generating {activeGenType === 'cv' ? 'CV' : activeGenType === 'cl' ? 'cover letter' : 'analysis'}…</span>
          </div>
        </Card>
      )}

      {/* Output panel */}
      {outputTabs.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="border border-parchment-300 rounded-2xl overflow-hidden shadow-card">
          <div className="bg-white border-b border-parchment-200 px-4 py-2.5 flex items-center gap-2 flex-wrap">
            {outputTabs.map(t => {
              const btn = GEN_BUTTONS.find(g => g.type === t)
              return (
                <button key={t} data-active={activeOut === t} onClick={() => setActiveOut(t)}
                  className={clsx('text-xs font-medium px-3 py-1.5 rounded-lg border transition-all', activeOut === t ? 'bg-forest-50 border-forest-300 text-forest-700' : 'bg-parchment-50 border-parchment-300 text-gray-500 hover:text-gray-700')}>
                  {btn?.label || t}
                </button>
              )
            })}
          </div>
          {outputs[activeOut] && <OutputPanel type={activeOut} content={outputs[activeOut]} />}
        </motion.div>
      )}
    </div>
  )
}

function uid() { return Math.random().toString(36).slice(2) }
