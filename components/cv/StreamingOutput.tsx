'use client'
import { useCompletion } from 'ai/react'
import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Copy, Download, Printer, CheckCircle, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface StreamingOutputProps {
  type: 'cv' | 'cl' | 'review' | 'interview' | 'flags' | 'keywords'
  onComplete?: (text: string) => void
  token: string
}

// Score ring SVG component
function ScoreRing({ score }: { score: number }) {
  const radius = 40
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (score / 100) * circumference
  const color = score >= 75 ? '#2d5a3d' : score >= 50 ? '#d97706' : '#dc2626'

  return (
    <div className="flex flex-col items-center">
      <svg width="100" height="100" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r={radius} fill="none" stroke="#e8f0eb" strokeWidth="6" />
        <circle
          cx="50" cy="50" r={radius}
          fill="none" stroke={color} strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform="rotate(-90 50 50)"
          style={{ transition: 'stroke-dashoffset 1s cubic-bezier(0.4, 0, 0.2, 1)' }}
        />
        <text x="50" y="46" textAnchor="middle" fontSize="20" fontWeight="600" fill={color} fontFamily="serif">{score}</text>
        <text x="50" y="60" textAnchor="middle" fontSize="10" fill="#9ca3af">/100</text>
      </svg>
    </div>
  )
}

// Parse and render review JSON
function ReviewPanel({ content }: { content: string }) {
  let data: any
  try { data = JSON.parse(content.replace(/```json|```/g, '').trim()) }
  catch { return <pre className="text-xs p-4 whitespace-pre-wrap font-mono">{content}</pre> }

  const score = Math.min(100, Math.max(0, parseInt(data.fitScore) || 0))
  const verdict = score >= 80 ? 'Strong match' : score >= 65 ? 'Good match' : score >= 45 ? 'Partial match' : 'Significant gaps'
  const col = score >= 75 ? 'text-forest-600' : score >= 50 ? 'text-amber-600' : 'text-red-600'

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-6">
        <ScoreRing score={score} />
        <div>
          <div className={`text-xl font-semibold ${col}`}>{verdict}</div>
          <div className="text-sm text-gray-400 mt-1">Based on JD match, experience, skills, and seniority</div>
          {data.salaryContext && (
            <div className="mt-2 bg-forest-50 rounded-lg px-3 py-2">
              <div className="text-forest-700 font-semibold text-sm">{data.salaryContext.range}</div>
              <div className="text-xs text-forest-600 mt-0.5">{data.salaryContext.note}</div>
            </div>
          )}
        </div>
      </div>

      {(data.dimensions || []).length > 0 && (
        <div className="space-y-2.5">
          {data.dimensions.map((d: any) => (
            <div key={d.name} className="flex items-center gap-3 text-sm">
              <span className="w-32 text-gray-500 text-xs shrink-0">{d.name}</span>
              <div className="flex-1 h-1.5 bg-parchment-300 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${d.score}%` }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  className="h-full rounded-full"
                  style={{ background: d.score >= 70 ? '#2d5a3d' : d.score >= 45 ? '#d97706' : '#dc2626' }}
                />
              </div>
              <span className="w-8 text-right text-xs font-semibold text-gray-700">{d.score}%</span>
            </div>
          ))}
        </div>
      )}

      {[
        { title: '✓ Where you are strong', items: data.strengths, col: 'text-forest-600', bg: 'bg-forest-50', dot: 'bg-forest-500' },
        { title: '✗ Gaps & risks', items: data.gaps, col: 'text-red-600', bg: 'bg-red-50', dot: 'bg-red-500' },
        { title: '⚠ Worth considering', items: data.considerations, col: 'text-amber-600', bg: 'bg-amber-50', dot: 'bg-amber-500' },
      ].map(({ title, items, col, dot }) => items?.length ? (
        <div key={title}>
          <div className={`text-xs font-bold tracking-[1.5px] uppercase mb-3 ${col}`}>{title}</div>
          <div className="space-y-2">
            {items.map((item: string, i: number) => (
              <div key={i} className="flex items-start gap-2.5 text-sm text-gray-600 leading-relaxed">
                <div className={`w-1.5 h-1.5 rounded-full ${dot} mt-1.5 shrink-0`} />
                {item}
              </div>
            ))}
          </div>
        </div>
      ) : null)}

      {data.recommendation && (
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-800 leading-relaxed">
          💬 {data.recommendation}
        </div>
      )}
    </div>
  )
}

function InterviewPanel({ content }: { content: string }) {
  let data: any
  try { data = JSON.parse(content.replace(/```json|```/g, '').trim()) }
  catch { return <pre className="text-xs p-4 whitespace-pre-wrap">{content}</pre> }

  return (
    <div className="p-5 space-y-4">
      {(data.questions || []).map((q: any, i: number) => (
        <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
          className="bg-parchment-100 rounded-xl p-4 border border-parchment-300">
          <div className="text-[10px] font-bold tracking-[1.5px] text-forest-600 uppercase mb-1.5">Q{i+1} · {q.type}</div>
          <div className="font-medium text-gray-900 text-sm mb-2">{q.question}</div>
          <div className="text-xs text-gray-500 leading-relaxed"><strong>Suggested angle:</strong> {q.hint}</div>
        </motion.div>
      ))}
    </div>
  )
}

function FlagsPanel({ content }: { content: string }) {
  let data: any
  try { data = JSON.parse(content.replace(/```json|```/g, '').trim()) }
  catch { return <pre className="text-xs p-4 whitespace-pre-wrap">{content}</pre> }

  const styles = {
    high: { bg: 'bg-red-50 border-red-200', icon: '🔴', text: 'text-gray-700' },
    medium: { bg: 'bg-amber-50 border-amber-200', icon: '🟡', text: 'text-gray-700' },
    low: { bg: 'bg-forest-50 border-forest-200', icon: '🟢', text: 'text-gray-700' },
  }

  return (
    <div className="p-5 space-y-3">
      <p className="text-xs text-gray-400 mb-4">Address these before submitting your application.</p>
      {(data.flags || []).map((f: any, i: number) => {
        const st = styles[f.severity as keyof typeof styles] || styles.medium
        return (
          <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}
            className={`flex items-start gap-3 rounded-xl p-4 border text-sm ${st.bg}`}>
            <span className="text-base shrink-0 mt-0.5">{st.icon}</span>
            <div className={st.text}>
              <div className="font-semibold mb-1">{f.issue}</div>
              <div className="text-xs leading-relaxed opacity-80">{f.advice}</div>
            </div>
          </motion.div>
        )
      })}
      {data.overall && <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-800">{data.overall}</div>}
    </div>
  )
}

function KeywordsPanel({ content }: { content: string }) {
  let data: any
  try { data = JSON.parse(content.replace(/```json|```/g, '').trim()) }
  catch { return <pre className="text-xs p-4 whitespace-pre-wrap">{content}</pre> }

  return (
    <div className="p-5 space-y-5">
      <p className="text-xs text-gray-400">Green = in your profile · Red = missing. Add missing keywords to skills or achievements.</p>
      {[
        { title: `✓ You have (${(data.have||[]).length})`, items: data.have, cls: 'bg-forest-50 border-forest-200 text-forest-700' },
        { title: `✗ Missing (${(data.missing||[]).length})`, items: data.missing, cls: 'bg-red-50 border-red-200 text-red-700' },
      ].map(({ title, items, cls }) => (
        <div key={title}>
          <div className="text-[11px] font-bold tracking-[1.5px] uppercase text-gray-500 mb-2.5">{title}</div>
          <div className="flex flex-wrap gap-2">
            {(items || []).map((k: string) => (
              <span key={k} className={`text-xs px-3 py-1 rounded-full font-medium border ${cls}`}>{k}</span>
            ))}
          </div>
        </div>
      ))}
      {data.advice && <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-800">{data.advice}</div>}
    </div>
  )
}

// The main streaming output component
export function StreamingOutput({ type, requestBody, token }: { type: string, requestBody: any, token: string }) {
  const [done, setDone] = useState(false)
  const { completion, complete, isLoading, error } = useCompletion({
    api: '/api/generate',
    headers: { Authorization: `Bearer ${token}` },
    onFinish: () => setDone(true),
  })

  const run = useCallback(() => {
    setDone(false)
    complete('', { body: requestBody })
  }, [complete, requestBody])

  const copy = () => {
    navigator.clipboard.writeText(completion)
    toast.success('Copied to clipboard')
  }

  const download = () => {
    const a = document.createElement('a')
    a.href = 'data:text/plain;charset=utf-8,' + encodeURIComponent(completion)
    a.download = type + '.txt'
    a.click()
  }

  const print = () => {
    const w = window.open('', '_blank')!
    w.document.write(`<!DOCTYPE html><html><head><title>Folio — ${type.toUpperCase()}</title><style>body{font-family:Calibri,sans-serif;font-size:11pt;line-height:1.6;margin:25mm 20mm;color:#000}pre{white-space:pre-wrap;font-family:inherit}</style></head><body><pre>${completion.replace(/</g,'&lt;')}</pre></body></html>`)
    w.document.close(); w.print()
  }

  const isTextType = ['cv', 'cl'].includes(type)

  return (
    <div>
      {/* Loading state */}
      {isLoading && !completion && (
        <div className="flex items-center gap-3 p-6 text-gray-400">
          <Loader2 size={18} className="animate-spin text-forest-500" />
          <span className="text-sm">Generating{type === 'review' ? ' analysis' : type === 'company_research' ? ' research' : ''}…</span>
        </div>
      )}

      {/* Streaming text output */}
      {completion && isTextType && (
        <div>
          <div className="flex items-center gap-2 px-4 py-3 border-b border-parchment-200 bg-parchment-50">
            <div className="flex-1 flex items-center gap-2">
              {done ? <CheckCircle size={14} className="text-forest-500" /> : <Loader2 size={14} className="animate-spin text-forest-500" />}
              <span className="text-xs text-gray-500">{done ? 'Complete · ATS ready' : 'Generating…'}</span>
            </div>
            {done && (
              <div className="flex gap-2">
                <button onClick={copy} className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-800 bg-parchment-100 hover:bg-parchment-200 px-2.5 py-1.5 rounded-lg transition-colors">
                  <Copy size={12} /> Copy
                </button>
                <button onClick={download} className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-800 bg-parchment-100 hover:bg-parchment-200 px-2.5 py-1.5 rounded-lg transition-colors">
                  <Download size={12} /> .txt
                </button>
                <button onClick={print} className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-800 bg-parchment-100 hover:bg-parchment-200 px-2.5 py-1.5 rounded-lg transition-colors">
                  <Printer size={12} /> PDF
                </button>
              </div>
            )}
          </div>
          <pre className={`p-6 text-sm leading-relaxed text-gray-800 whitespace-pre-wrap break-words font-sans max-h-[560px] overflow-y-auto ${!done ? 'streaming-cursor' : ''}`}>
            {completion}
          </pre>
        </div>
      )}

      {/* Structured output panels */}
      {completion && done && type === 'review' && <ReviewPanel content={completion} />}
      {completion && done && type === 'interview' && <InterviewPanel content={completion} />}
      {completion && done && type === 'flags' && <FlagsPanel content={completion} />}
      {completion && done && type === 'keywords' && <KeywordsPanel content={completion} />}

      {/* Structured output — streaming placeholder */}
      {completion && !done && !isTextType && (
        <div className="p-6 flex items-center gap-3 text-gray-400">
          <Loader2 size={18} className="animate-spin text-forest-500" />
          <span className="text-sm">Analysing…</span>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 border-t border-red-100 text-sm text-red-700">
          {(error as any).message?.includes('upgrade') || (error as any).message?.includes('limit')
            ? <span>⚡ {(error as any).message} <a href="/pricing" className="underline font-semibold">Upgrade here</a></span>
            : (error as any).message
          }
        </div>
      )}
    </div>
  )
}
