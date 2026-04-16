'use client'
import { useState } from 'react'
import { useApp } from '../context'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Trash2, TrendingUp, ChevronRight } from 'lucide-react'

const COLS = [
  { key: 'applied',    label: 'Applied',     color: '#6b7280', bg: '#f9fafb',  dot: '#6b7280' },
  { key: 'interview',  label: 'Interview',   color: '#2563eb', bg: '#eff6ff',  dot: '#2563eb' },
  { key: 'offer',      label: 'Offer',       color: '#16a34a', bg: '#dcfce7',  dot: '#16a34a' },
  { key: 'rejected',   label: 'Rejected',    color: '#dc2626', bg: '#fef2f2',  dot: '#dc2626' },
]

export function TrackerTab({ onOpenSalaryCoach }: { onOpenSalaryCoach?: (role: string, company: string) => void }) {
  const { tracker, updateTracker } = useApp()
  const [adding, setAdding] = useState<string | null>(null)
  const [newRole, setNewRole] = useState('')
  const [newCompany, setNewCompany] = useState('')

  function addApp(col: string) {
    if (!newRole.trim()) return
    const app = {
      id: Math.random().toString(36).slice(2),
      role: newRole.trim(),
      company: newCompany.trim(),
      date: new Date().toISOString(),
    }
    updateTracker({ ...tracker, [col]: [...(tracker[col] || []), app] })
    setNewRole('')
    setNewCompany('')
    setAdding(null)
  }

  function moveApp(fromCol: string, id: string, toCol: string) {
    const app = (tracker[fromCol] || []).find((a: any) => a.id === id)
    if (!app) return
    updateTracker({
      ...tracker,
      [fromCol]: (tracker[fromCol] || []).filter((a: any) => a.id !== id),
      [toCol]: [...(tracker[toCol] || []), app],
    })
    if (toCol === 'offer' && onOpenSalaryCoach) {
      setTimeout(() => {
        if (confirm(`🎉 Congratulations on the offer for ${app.role}${app.company ? ' at ' + app.company : ''}!\n\nOpen the Salary Negotiation Coach?`)) {
          onOpenSalaryCoach(app.role, app.company)
        }
      }, 300)
    }
  }

  function delApp(col: string, id: string) {
    updateTracker({ ...tracker, [col]: (tracker[col] || []).filter((a: any) => a.id !== id) })
  }

  const total = COLS.reduce((n, c) => n + (tracker[c.key] || []).length, 0)
  const offerRate = total > 0 ? Math.round(((tracker.offer || []).length / total) * 100) : 0

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#16a34a', marginBottom: 4 }}>Applications</div>
        <h2 style={{ fontSize: 20, fontWeight: 800, color: '#111827', letterSpacing: '-0.02em', marginBottom: 3 }}>Tracker</h2>
        <p style={{ fontSize: 13, color: '#6b7280' }}>Move cards as your status changes. Get a salary coach prompt when you land an offer.</p>
      </div>

      {/* Stats bar */}
      {total > 0 && (
        <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
          {[
            { label: 'Total', value: total, color: '#374151' },
            { label: 'Interviews', value: (tracker.interview || []).length, color: '#2563eb' },
            { label: 'Offers', value: (tracker.offer || []).length, color: '#16a34a' },
            { label: 'Offer rate', value: `${offerRate}%`, color: '#16a34a' },
          ].map(stat => (
            <div key={stat.label} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: '10px 16px', minWidth: 90 }}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#9ca3af', marginBottom: 4 }}>{stat.label}</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: stat.color, fontFamily: 'var(--font-serif)', letterSpacing: '-0.02em', lineHeight: 1 }}>{stat.value}</div>
            </div>
          ))}
        </div>
      )}

      {/* Kanban board */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
        {COLS.map(col => {
          const apps = tracker[col.key] || []
          return (
            <div key={col.key} style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 14, padding: '14px 12px', minHeight: 200 }}>
              {/* Column header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: col.dot }} />
                  <span style={{ fontSize: 12, fontWeight: 700, color: col.color, letterSpacing: '0.04em' }}>{col.label}</span>
                </div>
                <span style={{ fontSize: 11, fontWeight: 700, background: '#fff', border: '1px solid #e5e7eb', borderRadius: 99, padding: '1px 8px', color: '#6b7280' }}>{apps.length}</span>
              </div>

              {/* Cards */}
              <AnimatePresence initial={false}>
                {apps.map((app: any) => (
                  <motion.div key={app.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.18 }}>
                    <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: '12px', marginBottom: 8, borderLeft: `3px solid ${col.dot}` }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#111827', marginBottom: 2, lineHeight: 1.3 }}>{app.role}</div>
                      {app.company && <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 8 }}>{app.company}</div>}
                      {app.date && <div style={{ fontSize: 10, color: '#9ca3af', marginBottom: 8 }}>{new Date(app.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</div>}

                      {/* Move buttons */}
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                        {COLS.filter(c => c.key !== col.key).map(c => (
                          <button key={c.key} onClick={() => moveApp(col.key, app.id, c.key)}
                            style={{ fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 6, border: '1px solid #e5e7eb', background: '#f9fafb', color: c.color, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 3, fontFamily: 'var(--font-sans)' }}>
                            <ChevronRight size={9} /> {c.label}
                          </button>
                        ))}
                        <button onClick={() => delApp(col.key, app.id)}
                          style={{ fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 6, border: '1px solid #fecaca', background: '#fef2f2', color: '#dc2626', cursor: 'pointer', fontFamily: 'var(--font-sans)' }}>
                          ×
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Add card */}
              {adding === col.key ? (
                <div style={{ background: '#fff', border: '1.5px solid #16a34a', borderRadius: 10, padding: '10px' }}>
                  <input value={newRole} onChange={e => setNewRole(e.target.value)} placeholder="Role title" autoFocus
                    style={{ width: '100%', border: 'none', outline: 'none', fontSize: 13, fontWeight: 600, color: '#111827', marginBottom: 6, fontFamily: 'var(--font-sans)', boxSizing: 'border-box' }}
                    onKeyDown={e => { if (e.key === 'Enter') addApp(col.key); if (e.key === 'Escape') { setAdding(null); setNewRole(''); setNewCompany('') } }}
                  />
                  <input value={newCompany} onChange={e => setNewCompany(e.target.value)} placeholder="Company (optional)"
                    style={{ width: '100%', border: 'none', outline: 'none', fontSize: 12, color: '#6b7280', marginBottom: 8, fontFamily: 'var(--font-sans)', boxSizing: 'border-box' }}
                    onKeyDown={e => { if (e.key === 'Enter') addApp(col.key); if (e.key === 'Escape') { setAdding(null); setNewRole(''); setNewCompany('') } }}
                  />
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button onClick={() => addApp(col.key)}
                      style={{ flex: 1, background: '#16a34a', color: '#fff', border: 'none', borderRadius: 7, padding: '6px', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font-sans)' }}>
                      Add
                    </button>
                    <button onClick={() => { setAdding(null); setNewRole(''); setNewCompany('') }}
                      style={{ background: '#f9fafb', color: '#6b7280', border: '1px solid #e5e7eb', borderRadius: 7, padding: '6px 10px', fontSize: 12, cursor: 'pointer', fontFamily: 'var(--font-sans)' }}>
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button onClick={() => setAdding(col.key)}
                  style={{ width: '100%', padding: '8px', background: 'transparent', border: '1.5px dashed #d1d5db', borderRadius: 10, fontSize: 12, color: '#9ca3af', cursor: 'pointer', fontFamily: 'var(--font-sans)', transition: 'all 0.15s' }}
                  onMouseEnter={e => { (e.currentTarget).style.borderColor = '#16a34a'; (e.currentTarget).style.color = '#16a34a'; (e.currentTarget).style.background = '#f0fdf4' }}
                  onMouseLeave={e => { (e.currentTarget).style.borderColor = '#d1d5db'; (e.currentTarget).style.color = '#9ca3af'; (e.currentTarget).style.background = 'transparent' }}>
                  + Add
                </button>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
