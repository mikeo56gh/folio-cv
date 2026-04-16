'use client'
import { useState, useRef } from 'react'
import { useCompletion } from 'ai/react'
import { motion, AnimatePresence } from 'framer-motion'
import { useApp, SENIORITY, TONES, SECTORS, fmtDate, uid } from '../context'
import { Field, Input, Guidance, Button } from '../../../components/ui'
import {
  Search, FileText, Mail, BarChart2, Mic, Flag, Key, Loader2,
  Copy, Download, Printer, CheckCircle, X, Plus, ChevronDown,
  ChevronUp, Building2, Sparkles, Target, TrendingUp, AlertTriangle
} from 'lucide-react'
import { toast } from 'sonner'

// ── Design tokens ──────────────────────────────────────────────
const T = {
  green: '#16a34a', greenDark: '#15803d', greenLight: '#dcfce7', greenBorder: '#bbf7d0',
  ink: '#111827', inkMid: '#374151', inkSoft: '#6b7280', inkFaint: '#9ca3af',
  border: '#e5e7eb', bg: '#f9fafb', surface: '#ffffff',
  amber: '#d97706', amberBg: '#fffbeb', amberBorder: '#fde68a',
  red: '#dc2626', redBg: '#fef2f2', blue: '#2563eb', blueBg: '#eff6ff', blueBorder: '#bfdbfe',
  purple: '#7c3aed', purpleBg: '#f5f3ff', purpleBorder: '#ddd6fe',
}

// ── Tool definitions ───────────────────────────────────────────
const TOOLS = [
  { type: 'cv',          label: 'ATS CV',        icon: FileText,    color: T.green,  bg: T.greenLight,  border: T.greenBorder },
  { type: 'cl',          label: 'Cover letter',  icon: Mail,        color: T.green,  bg: T.greenLight,  border: T.greenBorder },
  { type: 'review',      label: 'Fit review',    icon: BarChart2,   color: T.blue,   bg: T.blueBg,      border: T.blueBorder  },
  { type: 'deep_review', label: 'Deep analysis', icon: Target,      color: T.purple, bg: T.purpleBg,    border: T.purpleBorder },
  { type: 'interview',   label: 'Interview prep', icon: Mic,        color: T.purple, bg: T.purpleBg,    border: T.purpleBorder },
  { type: 'flags',       label: 'Red flags',     icon: Flag,        color: T.red,    bg: T.redBg,       border: '#fecaca'     },
  { type: 'keywords',    label: 'Keywords',      icon: Key,         color: T.amber,  bg: T.amberBg,     border: T.amberBorder },
]

// ── Score ring ─────────────────────────────────────────────────
function ScoreRing({ score, size = 80 }: { score: number; size?: number }) {
  const r = (size / 2) - 7
  const c = 2 * Math.PI * r
  const offset = c - (score / 100) * c
  const col = score >= 75 ? T.green : score >= 50 ? T.amber : T.red
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={T.border} strokeWidth="5" />
      <motion.circle cx={size/2} cy={size/2} r={r} fill="none" stroke={col} strokeWidth="5"
        strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c}
        animate={{ strokeDashoffset: offset }} transition={{ duration: 1.1, ease: [0.4,0,0.2,1], delay: 0.2 }}
        transform={`rotate(-90 ${size/2} ${size/2})`} />
      <text x={size/2} y={size/2 - 4} textAnchor="middle" fontSize={size > 70 ? 18 : 14} fontWeight="800" fill={col} fontFamily="var(--font-serif)">{score}</text>
      <text x={size/2} y={size/2 + 11} textAnchor="middle" fontSize="9" fill={T.inkFaint} fontFamily="var(--font-sans)">/100</text>
    </svg>
  )
}

// ── Fit review panel ───────────────────────────────────────────
function ReviewPanel({ data }: { data: any }) {
  const score = Math.min(100, Math.max(0, parseInt(data.fitScore) || 0))
  const verdict = score >= 80 ? 'Strong match' : score >= 65 ? 'Good match' : score >= 45 ? 'Partial match' : 'Significant gaps'
  const col = score >= 75 ? T.green : score >= 50 ? T.amber : T.red

  return (
    <div style={{ padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
        <ScoreRing score={score} />
        <div>
          <div style={{ fontSize: 20, fontWeight: 800, color: col, letterSpacing: '-0.02em' }}>{verdict}</div>
          <div style={{ fontSize: 12, color: T.inkFaint, marginTop: 2 }}>Based on JD match, experience, skills, and seniority</div>
          {data.salaryContext && (
            <div style={{ marginTop: 10, background: T.greenLight, border: `1px solid ${T.greenBorder}`, borderRadius: 10, padding: '10px 14px' }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: T.greenDark }}>{data.salaryContext.range}</div>
              <div style={{ fontSize: 12, color: T.green, marginTop: 2, lineHeight: 1.5 }}>{data.salaryContext.note}</div>
            </div>
          )}
        </div>
      </div>

      {(data.dimensions || []).map((d: any) => (
        <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ width: 130, fontSize: 12, color: T.inkSoft, flexShrink: 0 }}>{d.name}</span>
          <div style={{ flex: 1, height: 6, background: T.border, borderRadius: 99, overflow: 'hidden' }}>
            <motion.div initial={{ width: 0 }} animate={{ width: `${d.score}%` }} transition={{ duration: 0.7, delay: 0.3 }}
              style={{ height: '100%', borderRadius: 99, background: d.score >= 70 ? T.green : d.score >= 45 ? T.amber : T.red }} />
          </div>
          <span style={{ width: 36, textAlign: 'right', fontSize: 12, fontWeight: 700, color: T.inkMid }}>{d.score}%</span>
        </div>
      ))}

      {[
        { title: 'Strengths', items: data.strengths, col: T.green,   bg: T.greenLight, border: T.greenBorder, icon: '✓' },
        { title: 'Gaps',      items: data.gaps,      col: T.red,     bg: T.redBg,      border: '#fecaca',     icon: '✗' },
        { title: 'Watch',     items: data.considerations, col: T.amber, bg: T.amberBg, border: T.amberBorder, icon: '⚠' },
      ].map(({ title, items, col, bg, border, icon }) => (items || []).length ? (
        <div key={title}>
          <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: col, marginBottom: 8 }}>{icon} {title}</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {items.map((item: string, i: number) => (
              <div key={i} style={{ display: 'flex', gap: 10, background: bg, border: `1px solid ${border}`, borderRadius: 8, padding: '9px 12px', fontSize: 13, color: T.inkMid, lineHeight: 1.5 }}>
                <span style={{ color: col, flexShrink: 0, fontWeight: 700 }}>{icon}</span>
                {item}
              </div>
            ))}
          </div>
        </div>
      ) : null)}

      {data.recommendation && (
        <div style={{ background: T.blueBg, border: `1px solid ${T.blueBorder}`, borderRadius: 10, padding: '12px 16px', fontSize: 13, color: T.blue, lineHeight: 1.6 }}>
          💬 {data.recommendation}
        </div>
      )}
    </div>
  )
}

// ── Deep review (scorecard) panel ──────────────────────────────
function DeepReviewPanel({ data }: { data: any }) {
  const [open, setOpen] = useState<string | null>('assessment')

  const sections = [
    { key: 'assessment', label: 'Situation assessment', icon: '📊', content: (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <p style={{ fontSize: 13, color: T.inkMid, lineHeight: 1.7 }}>{data.assessment}</p>
        {data.gaps?.map((gap: any, i: number) => (
          <div key={i} style={{ background: gap.addressable ? T.amberBg : T.redBg, border: `1px solid ${gap.addressable ? T.amberBorder : '#fecaca'}`, borderRadius: 10, padding: '12px 16px' }}>
            <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: gap.addressable ? T.amber : T.red, marginBottom: 4 }}>
              {gap.type} gap · {gap.addressable ? 'Addressable in narrative' : 'Structural gap'}
            </div>
            <div style={{ fontSize: 13, fontWeight: 600, color: T.inkMid, marginBottom: 4 }}>{gap.title}</div>
            <div style={{ fontSize: 12, color: T.inkSoft, lineHeight: 1.55 }}>{gap.advice}</div>
          </div>
        ))}
      </div>
    )},
    { key: 'scores', label: 'Scorecard', icon: '🎯', content: (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {[
          { label: 'CV', score: data.cvScore, notes: data.cvNotes },
          { label: 'Cover letter', score: data.clScore, notes: data.clNotes },
        ].map(doc => (
          <div key={doc.label} style={{ background: T.bg, border: `1px solid ${T.border}`, borderRadius: 12, padding: '16px 18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: T.ink }}>{doc.label}</div>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: T.inkFaint, marginBottom: 2 }}>JD Fit</div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: doc.score?.fit >= 75 ? T.green : doc.score?.fit >= 50 ? T.amber : T.red, fontFamily: 'var(--font-serif)' }}>{doc.score?.fit ?? '--'}%</div>
                </div>
                <div>
                  <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: T.inkFaint, marginBottom: 2 }}>AI Detection</div>
                  <div style={{ fontSize: 13, fontWeight: 700, padding: '3px 10px', borderRadius: 99, background: doc.score?.aiRisk === 'Low' ? T.greenLight : doc.score?.aiRisk === 'High' ? T.redBg : T.amberBg, color: doc.score?.aiRisk === 'Low' ? T.green : doc.score?.aiRisk === 'High' ? T.red : T.amber }}>
                    {doc.score?.aiRisk ?? '--'}
                  </div>
                </div>
              </div>
            </div>
            {doc.notes && <p style={{ fontSize: 12, color: T.inkSoft, lineHeight: 1.6 }}>{doc.notes}</p>}
          </div>
        ))}
      </div>
    )},
    { key: 'options', label: 'Strategic options', icon: '🧭', content: (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {(data.options || []).map((opt: any, i: number) => (
          <div key={i} style={{ border: `1.5px solid ${T.border}`, borderRadius: 12, padding: '16px 18px' }}>
            <div style={{ display: 'flex', gap: 10, marginBottom: 8, alignItems: 'flex-start' }}>
              <span style={{ fontSize: 16, flexShrink: 0 }}>{['A', 'B', 'C'][i]}</span>
              <div style={{ fontSize: 14, fontWeight: 700, color: T.ink }}>{opt.label}</div>
            </div>
            <p style={{ fontSize: 13, color: T.inkSoft, lineHeight: 1.65, marginBottom: 8 }}>{opt.description}</p>
            {opt.recommendation && (
              <div style={{ fontSize: 11, fontWeight: 600, color: opt.recommended ? T.green : T.inkFaint, display: 'flex', gap: 5, alignItems: 'center' }}>
                {opt.recommended && <CheckCircle size={12} color={T.green} />}
                {opt.recommendation}
              </div>
            )}
          </div>
        ))}
      </div>
    )},
    { key: 'honest', label: 'Honest read', icon: '🪞', content: (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ background: '#fafafa', border: `1px solid ${T.border}`, borderRadius: 12, padding: '16px 18px' }}>
          <p style={{ fontSize: 13, color: T.inkMid, lineHeight: 1.75, whiteSpace: 'pre-line' }}>{data.honestRead}</p>
        </div>
        {data.interviewPrepNote && (
          <div style={{ background: T.blueBg, border: `1px solid ${T.blueBorder}`, borderRadius: 10, padding: '12px 16px', fontSize: 13, color: T.blue, lineHeight: 1.6 }}>
            💬 Interview prep note: {data.interviewPrepNote}
          </div>
        )}
      </div>
    )},
  ]

  return (
    <div style={{ padding: '20px 22px' }}>
      <div style={{ display: 'flex', gap: 16, marginBottom: 20, padding: '14px 18px', background: T.purpleBg, border: `1px solid ${T.purpleBorder}`, borderRadius: 12 }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: T.purple, marginBottom: 4 }}>Overall fit</div>
          <div style={{ fontSize: 36, fontWeight: 800, color: T.purple, fontFamily: 'var(--font-serif)', lineHeight: 1 }}>{data.overallFit ?? '--'}%</div>
        </div>
        <div style={{ flex: 1, fontSize: 13, color: T.inkMid, lineHeight: 1.6, paddingLeft: 16, borderLeft: `1px solid ${T.purpleBorder}` }}>
          {data.oneLiner}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {sections.map(sec => (
          <div key={sec.key} style={{ border: `1px solid ${T.border}`, borderRadius: 12, overflow: 'hidden' }}>
            <button onClick={() => setOpen(o => o === sec.key ? null : sec.key)}
              style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '13px 16px', background: open === sec.key ? T.bg : T.surface, border: 'none', cursor: 'pointer', fontFamily: 'var(--font-sans)' }}>
              <span style={{ fontSize: 16 }}>{sec.icon}</span>
              <span style={{ flex: 1, fontSize: 14, fontWeight: 700, color: T.ink, textAlign: 'left' }}>{sec.label}</span>
              {open === sec.key ? <ChevronUp size={15} color={T.inkFaint} /> : <ChevronDown size={15} color={T.inkFaint} />}
            </button>
            <AnimatePresence>
              {open === sec.key && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} style={{ overflow: 'hidden' }}>
                  <div style={{ padding: '4px 16px 16px', borderTop: `1px solid ${T.border}' `}}>
                    {sec.content}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Interview panel ────────────────────────────────────────────
function InterviewPanel({ data }: { data: any }) {
  return (
    <div style={{ padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 10 }}>
      {(data.questions || []).map((q: any, i: number) => (
        <motion.div key={i} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
          style={{ background: T.bg, border: `1px solid ${T.border}`, borderRadius: 12, padding: '14px 16px' }}>
          <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: T.purple, marginBottom: 6 }}>Q{i+1} · {q.type}</div>
          <div style={{ fontSize: 14, fontWeight: 700, color: T.ink, marginBottom: 6, lineHeight: 1.45 }}>{q.question}</div>
          <div style={{ fontSize: 12, color: T.inkSoft, lineHeight: 1.6 }}><strong style={{ color: T.inkMid }}>Angle:</strong> {q.hint}</div>
        </motion.div>
      ))}
    </div>
  )
}

// ── Flags panel ────────────────────────────────────────────────
function FlagsPanel({ data }: { data: any }) {
  const cfg: Record<string, { bg: string; border: string; col: string; icon: string }> = {
    high:   { bg: T.redBg,   border: '#fecaca',       col: T.red,   icon: '🔴' },
    medium: { bg: T.amberBg, border: T.amberBorder,   col: T.amber, icon: '🟡' },
    low:    { bg: T.greenLight, border: T.greenBorder, col: T.green, icon: '🟢' },
  }
  return (
    <div style={{ padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 10 }}>
      <p style={{ fontSize: 12, color: T.inkFaint, marginBottom: 4 }}>Address these before submitting.</p>
      {(data.flags || []).map((f: any, i: number) => {
        const s = cfg[f.severity] || cfg.medium
        return (
          <div key={i} style={{ display: 'flex', gap: 12, background: s.bg, border: `1px solid ${s.border}`, borderRadius: 12, padding: '12px 16px' }}>
            <span style={{ fontSize: 16, flexShrink: 0 }}>{s.icon}</span>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: T.ink, marginBottom: 4 }}>{f.issue}</div>
              <div style={{ fontSize: 12, color: T.inkSoft, lineHeight: 1.6 }}>{f.advice}</div>
            </div>
          </div>
        )
      })}
      {data.overall && <div style={{ background: T.amberBg, border: `1px solid ${T.amberBorder}`, borderRadius: 10, padding: '12px 16px', fontSize: 12, color: '#92400e', lineHeight: 1.6 }}>{data.overall}</div>}
    </div>
  )
}

// ── Keywords panel ─────────────────────────────────────────────
function KeywordsPanel({ data }: { data: any }) {
  return (
    <div style={{ padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 16 }}>
      <p style={{ fontSize: 12, color: T.inkFaint }}>Green = in your profile · Red = missing. Add missing to skills or achievements.</p>
      {[
        { title: `✓ You have (${(data.have||[]).length})`, items: data.have, bg: T.greenLight, border: T.greenBorder, col: T.greenDark },
        { title: `✗ Missing (${(data.missing||[]).length})`, items: data.missing, bg: T.redBg, border: '#fecaca', col: T.red },
      ].map(({ title, items, bg, border, col }) => (
        <div key={title}>
          <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: T.inkSoft, marginBottom: 8 }}>{title}</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {(items||[]).map((k: string) => (
              <span key={k} style={{ fontSize: 12, fontWeight: 600, padding: '4px 12px', borderRadius: 99, background: bg, border: `1px solid ${border}`, color: col }}>{k}</span>
            ))}
          </div>
        </div>
      ))}
      {data.advice && <div style={{ background: T.amberBg, border: `1px solid ${T.amberBorder}`, borderRadius: 10, padding: '12px 16px', fontSize: 12, color: '#92400e', lineHeight: 1.6 }}>{data.advice}</div>}
    </div>
  )
}

// ── Text output panel (CV / cover letter) ──────────────────────
function TextPanel({ content }: { content: string }) {
  const copy = () => { navigator.clipboard.writeText(content); toast.success('Copied!') }
  const download = () => { const a = document.createElement('a'); a.href = 'data:text/plain;charset=utf-8,' + encodeURIComponent(content); a.download = 'folio-cv.txt'; a.click() }
  const print = () => { const w = window.open('', '_blank')!; w.document.write(`<html><head><title>Folio CV</title><style>body{font-family:Calibri,sans-serif;font-size:11pt;line-height:1.7;margin:20mm 18mm}pre{white-space:pre-wrap;font-family:inherit}</style></head><body><pre>${content.replace(/</g,'&lt;')}</pre></body></html>`); w.document.close(); w.print() }
  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 16px', background: T.bg, borderBottom: `1px solid ${T.border}` }}>
        <CheckCircle size={13} color={T.green} />
        <span style={{ fontSize: 12, color: T.inkSoft, fontWeight: 500, flex: 1 }}>ATS-ready · plain text format</span>
        <div style={{ display: 'flex', gap: 6 }}>
          {[{ icon: Copy, label: 'Copy', fn: copy }, { icon: Download, label: '.txt', fn: download }, { icon: Printer, label: 'Print / PDF', fn: print }].map(({ icon: Icon, label, fn }) => (
            <button key={label} onClick={fn}
              style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: T.inkSoft, background: T.surface, border: `1px solid ${T.border}`, padding: '5px 10px', borderRadius: 8, cursor: 'pointer', fontFamily: 'var(--font-sans)' }}>
              <Icon size={11} /> {label}
            </button>
          ))}
        </div>
      </div>
      <pre style={{ padding: '20px 22px', fontSize: 13, lineHeight: 1.75, color: T.inkMid, whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontFamily: "'Courier New', monospace", maxHeight: 540, overflowY: 'auto', margin: 0 }}>{content}</pre>
    </>
  )
}

// ── Output dispatcher ──────────────────────────────────────────
function OutputPanel({ type, content }: { type: string; content: string }) {
  if (!content) return null
  if (['cv', 'cl'].includes(type)) return <TextPanel content={content} />
  try {
    const data = JSON.parse(content.replace(/```json|```/g, '').trim())
    if (type === 'review')      return <ReviewPanel data={data} />
    if (type === 'deep_review') return <DeepReviewPanel data={data} />
    if (type === 'interview')   return <InterviewPanel data={data} />
    if (type === 'flags')       return <FlagsPanel data={data} />
    if (type === 'keywords')    return <KeywordsPanel data={data} />
  } catch {}
  return <pre style={{ padding: '20px', fontSize: 12, color: T.inkSoft, whiteSpace: 'pre-wrap', fontFamily: 'monospace' }}>{content}</pre>
}

// ── Chip component ─────────────────────────────────────────────
function Chip({ label, active, onClick, onRemove, dashed }: { label: string; active: boolean; onClick: () => void; onRemove?: () => void; dashed?: boolean }) {
  return (
    <button onClick={onClick}
      style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 12px', borderRadius: 99, fontSize: 12, fontWeight: active ? 700 : 500, cursor: 'pointer', fontFamily: 'var(--font-sans)', transition: 'all 0.12s', border: `1.5px ${dashed ? 'dashed' : 'solid'} ${active ? T.greenBorder : T.border}`, background: active ? T.greenLight : T.surface, color: active ? T.greenDark : T.inkSoft }}>
      {label}
      {onRemove && <span onClick={e => { e.stopPropagation(); onRemove() }} style={{ marginLeft: 2, color: T.inkFaint, fontSize: 14, lineHeight: 1 }}>×</span>}
    </button>
  )
}

// ── Main generate tab ──────────────────────────────────────────
export function GenerateTab() {
  const { profileData, jdText, setJdText, jdUrl, setJdUrl, tone, setTone, sector, setSector, customSectors, setCustomSectors, companyBrief, setCompanyBrief, outputs, setOutput, token, setUpgradeMsg } = useApp()
  const [activeOut, setActiveOut] = useState<string>('cv')
  const [activeGenType, setActiveGenType] = useState<string | null>(null)
  const [briefLoading, setBriefLoading] = useState(false)
  const [attachments, setAttachments] = useState<any[]>([])
  const [settingsOpen, setSettingsOpen] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const senLabel = SENIORITY.find(s => s.key === profileData.profile.seniority)?.label || 'Mid-level'

  const buildRequestBody = (type: string) => {
    const textParts: string[] = []
    if (jdText) textParts.push('JOB DESCRIPTION:\n' + jdText)
    if (jdUrl) textParts.push('Job URL: ' + jdUrl)
    attachments.forEach(a => { if (!a.error && a.text) textParts.push(`ATTACHED (${a.name}):\n${a.text.substring(0, 30000)}`) })
    return {
      type,
      data: {
        profile: profileData.profile,
        jobs: profileData.jobs.map(j => j.isGap
          ? { isGap: true, gapReason: j.gapReason, dates: `${fmtDate(j.startMonth, j.startYear, false)} – ${fmtDate(j.endMonth, j.endYear, false)}` }
          : { title: j.title, company: j.company, location: j.location, dates: `${fmtDate(j.startMonth, j.startYear, false)} – ${fmtDate(j.endMonth, j.endYear, j.current)}`, achievements: j.achievements.filter(a => a.trim()) }),
        education: profileData.education.map(e => ({ degree: e.degree, institution: e.institution, grade: e.grade, dates: `${e.startYear} – ${e.endYear}`, notes: e.notes })),
        qualifications: profileData.qualifications.filter(q => q.title).map(q => ({ title: q.title, body: q.body, year: q.year })),
        skills: profileData.skills.map(s => ({ category: s.category, skills: s.tags, context: s.context || '' })),
      },
      jdContext: textParts.join('\n\n——\n\n'),
      companyBrief,
      tone,
      sector,
      seniority: profileData.profile.seniority,
    }
  }

  const { complete, isLoading } = useCompletion({
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
        result += decoder.decode(value)
      }
      const match = result.match(/\{[\s\S]*\}/)
      if (match) setCompanyBrief(match[0])
      else toast.error('Could not parse company brief')
    } catch (e: any) { toast.error('Research failed: ' + e.message) }
    setBriefLoading(false)
  }

  function handleFiles(files: FileList) {
    Array.from(files).forEach(file => {
      const ext = file.name.split('.').pop()?.toLowerCase()
      const entry: any = { id: uid(), name: file.name, text: '', error: false }
      setAttachments(prev => [...prev, entry])
      const r = new FileReader()
      r.onload = ev => { entry.text = ev.target!.result as string; setAttachments(prev => prev.map(a => a.id === entry.id ? { ...a, text: entry.text } : a)) }
      r.readAsText(file)
    })
  }

  let parsedBrief: any = null
  try { if (companyBrief) parsedBrief = JSON.parse(companyBrief) } catch {}

  const outputTabs = Object.entries(outputs).filter(([, v]) => v).map(([k]) => k)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Header */}
      <div>
        <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.14em', textTransform: 'uppercase', color: T.green, marginBottom: 4 }}>Step 6</div>
        <h2 style={{ fontSize: 20, fontWeight: 800, color: T.ink, letterSpacing: '-0.02em', marginBottom: 3 }}>Generate</h2>
        <p style={{ fontSize: 13, color: T.inkSoft }}>Paste a job description — all eight tools use it to tailor your application.</p>
      </div>

      {/* Company brief */}
      <AnimatePresence>
        {briefLoading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ background: T.greenLight, border: `1px solid ${T.greenBorder}`, borderRadius: 12, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
            <Loader2 size={16} style={{ animation: 'spin 0.7s linear infinite', color: T.green, flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: T.greenDark }}>Researching company…</div>
              <div style={{ fontSize: 11, color: T.green, marginTop: 1 }}>Searching web · reading news · analysing culture</div>
            </div>
          </motion.div>
        )}
        {parsedBrief && !briefLoading && (
          <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
            style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 14, overflow: 'hidden' }}>
            <div style={{ background: T.greenLight, borderBottom: `1px solid ${T.greenBorder}`, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
              <Building2 size={16} color={T.green} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: T.greenDark }}>{parsedBrief.name || 'Company research'}</div>
                <div style={{ fontSize: 11, color: T.green }}>Live research — feeds into all outputs below</div>
              </div>
              <button onClick={() => setCompanyBrief('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: T.inkFaint, display: 'flex' }}><X size={15} /></button>
            </div>
            <div style={{ padding: '14px 16px' }}>
              {parsedBrief.summary && <p style={{ fontSize: 13, color: T.inkMid, lineHeight: 1.6, marginBottom: 12 }}>{parsedBrief.summary}</p>}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 8, marginBottom: 10 }}>
                {[['Industry', parsedBrief.industry], ['Size', parsedBrief.size], ['Revenue', parsedBrief.revenue], ['HQ', parsedBrief.hq]].filter(([, v]) => v).map(([k, v]) => (
                  <div key={k as string} style={{ background: T.bg, borderRadius: 8, padding: '8px 10px' }}>
                    <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: T.inkFaint, marginBottom: 3 }}>{k}</div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: T.inkMid }}>{v}</div>
                  </div>
                ))}
              </div>
              {parsedBrief.talkingPoints && (
                <div style={{ background: T.amberBg, border: `1px solid ${T.amberBorder}`, borderRadius: 8, padding: '10px 14px', fontSize: 12, color: '#92400e', lineHeight: 1.6 }}>
                  💬 <strong>Use in interview:</strong> {parsedBrief.talkingPoints}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* JD input */}
      <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 14, padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
          <div style={{ flex: 1 }}>
            <Field label="Job URL">
              <Input value={jdUrl} onChange={e => setJdUrl(e.target.value)} placeholder="https://company.com/careers/job" />
            </Field>
          </div>
          <Button variant="secondary" size="md" loading={briefLoading} onClick={fetchCompanyBrief} icon={<Search size={13} />}>Research</Button>
        </div>

        <Field label="Job description" hint="Paste the full posting — company overview, requirements, nice-to-haves">
          <textarea
            value={jdText}
            onChange={e => setJdText(e.target.value)}
            rows={10}
            placeholder={'Paste the full job description here…\n\nThe more detail, the better every tool performs. Include company blurb, requirements, and nice-to-haves.'}
            style={{ width: '100%', background: T.bg, border: `1.5px solid ${T.border}`, borderRadius: 10, padding: '10px 13px', fontFamily: 'var(--font-sans)', fontSize: 13, color: T.ink, outline: 'none', resize: 'vertical', lineHeight: 1.65, boxSizing: 'border-box', transition: 'all 0.15s' }}
            onFocus={e => { e.target.style.borderColor = T.green; e.target.style.boxShadow = '0 0 0 3px rgba(22,163,74,0.1)'; e.target.style.background = T.surface }}
            onBlur={e => { e.target.style.borderColor = T.border; e.target.style.boxShadow = 'none'; e.target.style.background = T.bg }}
          />
        </Field>

        {/* File drop zone */}
        <div
          onClick={() => fileRef.current?.click()}
          onDragOver={e => e.preventDefault()}
          onDrop={e => { e.preventDefault(); handleFiles(e.dataTransfer.files) }}
          style={{ border: `1.5px dashed ${T.border}`, borderRadius: 10, padding: '12px', textAlign: 'center', cursor: 'pointer', transition: 'all 0.15s' }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = T.green; (e.currentTarget as HTMLElement).style.background = T.greenLight }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = T.border; (e.currentTarget as HTMLElement).style.background = 'transparent' }}
        >
          <div style={{ fontSize: 12, color: T.inkFaint }}>📎 Click or drag to attach files — PDF, DOCX, TXT</div>
        </div>
        <input ref={fileRef} type="file" multiple accept=".pdf,.docx,.txt,.png,.jpg" style={{ display: 'none' }} onChange={e => e.target.files && handleFiles(e.target.files)} />

        {attachments.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {attachments.map((a, i) => (
              <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: 8, background: T.bg, border: `1px solid ${T.border}`, borderRadius: 8, padding: '8px 12px' }}>
                <span style={{ fontSize: 14 }}>📄</span>
                <span style={{ flex: 1, fontSize: 12, fontWeight: 500, color: T.inkMid, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.name}</span>
                <span style={{ fontSize: 11, color: a.text ? T.green : T.inkFaint }}>{a.text ? `${Math.round(a.text.length/4)} tokens` : 'Loading…'}</span>
                <button onClick={() => setAttachments(prev => prev.filter((_, j) => j !== i))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: T.inkFaint, fontSize: 16, lineHeight: 1 }}>×</button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Settings toggle */}
      <div>
        <button onClick={() => setSettingsOpen(!settingsOpen)}
          style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12, fontWeight: 600, color: T.inkSoft, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-sans)', padding: '4px 0' }}>
          <Sparkles size={12} />
          Tone & sector settings
          {settingsOpen ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          <span style={{ fontSize: 11, color: T.inkFaint, fontWeight: 400 }}>· {senLabel} level</span>
        </button>
        <AnimatePresence>
          {settingsOpen && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ overflow: 'hidden' }}>
              <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 12, padding: '16px 18px', marginTop: 8, display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div>
                  <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: T.inkFaint, marginBottom: 8 }}>Tone</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {TONES.map(t => <Chip key={t.key} label={t.label} active={tone === t.key} onClick={() => setTone(t.key)} />)}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: T.inkFaint, marginBottom: 8 }}>Sector</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {[...SECTORS, ...customSectors.map(c => ({ key: 'custom_' + c, label: c }))].map(s => (
                      <Chip key={s.key} label={s.label} active={sector === s.key} onClick={() => setSector(s.key)}
                        onRemove={s.key.startsWith('custom_') ? () => { setCustomSectors(customSectors.filter(c => c !== s.label)); if (sector === s.key) setSector('general') } : undefined} />
                    ))}
                    <Chip label="+ Add" active={false} dashed onClick={() => { const n = prompt('Sector name:'); if (n) setCustomSectors([...customSectors, n]) }} />
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Generate buttons */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 8 }}>
        {TOOLS.map(({ type, label, icon: Icon, color, bg, border }) => (
          <button key={type} onClick={() => generate(type)} disabled={isLoading}
            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '11px 14px', borderRadius: 12, border: `1.5px solid ${border}`, background: isLoading && activeGenType === type ? bg : T.surface, color, fontFamily: 'var(--font-sans)', fontSize: 13, fontWeight: 700, cursor: isLoading ? 'not-allowed' : 'pointer', opacity: isLoading && activeGenType !== type ? 0.6 : 1, transition: 'all 0.15s' }}
            onMouseEnter={e => { if (!isLoading) { (e.currentTarget as HTMLElement).style.background = bg; (e.currentTarget as HTMLElement).style.borderColor = color } }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = T.surface; (e.currentTarget as HTMLElement).style.borderColor = border }}
          >
            {isLoading && activeGenType === type
              ? <Loader2 size={14} style={{ animation: 'spin 0.7s linear infinite', flexShrink: 0 }} />
              : <Icon size={14} style={{ flexShrink: 0 }} />
            }
            <span>{isLoading && activeGenType === type ? 'Working…' : label}</span>
          </button>
        ))}
      </div>

      {/* Output */}
      {outputTabs.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
          style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 16, overflow: 'hidden' }}>
          <div style={{ background: T.bg, borderBottom: `1px solid ${T.border}`, padding: '10px 14px', display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {outputTabs.map(t => {
              const tool = TOOLS.find(g => g.type === t)
              const active = activeOut === t
              return (
                <button key={t} onClick={() => setActiveOut(t)}
                  style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: active ? 700 : 500, padding: '6px 12px', borderRadius: 8, border: `1.5px solid ${active ? (tool?.border || T.greenBorder) : T.border}`, background: active ? (tool?.bg || T.greenLight) : T.surface, color: active ? (tool?.color || T.green) : T.inkSoft, cursor: 'pointer', fontFamily: 'var(--font-sans)', transition: 'all 0.12s' }}>
                  {tool && <tool.icon size={11} />}
                  {tool?.label || t}
                </button>
              )
            })}
          </div>
          {outputs[activeOut] && <OutputPanel type={activeOut} content={outputs[activeOut]} />}
        </motion.div>
      )}

      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}
