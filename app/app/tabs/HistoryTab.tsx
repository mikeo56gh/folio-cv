'use client'
import { useApp } from '../context'
import { motion } from 'framer-motion'
import { Clock, RotateCcw, FileText, Star } from 'lucide-react'

export function HistoryTab({ onRestore }: { onRestore: () => void }) {
  const { versions, loadVersions } = useApp()

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#16a34a', marginBottom: 4 }}>Saved versions</div>
        <h2 style={{ fontSize: 20, fontWeight: 800, color: '#111827', letterSpacing: '-0.02em', marginBottom: 3 }}>History</h2>
        <p style={{ fontSize: 13, color: '#6b7280' }}>Every saved CV and cover letter. Restore any version to the Generate tab.</p>
      </div>

      {versions.length === 0 ? (
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 14, padding: '40px 24px', textAlign: 'center' }}>
          <Clock size={28} color="#d1d5db" style={{ margin: '0 auto 12px' }} />
          <div style={{ fontSize: 14, fontWeight: 600, color: '#374151', marginBottom: 6 }}>No saved versions yet</div>
          <div style={{ fontSize: 13, color: '#9ca3af', lineHeight: 1.6 }}>Generate a CV then use Save version to build your history.</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {versions.map((v: any, i: number) => (
            <motion.div key={v.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
              <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 14, padding: '18px 20px', display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                <div style={{ width: 40, height: 40, borderRadius: 12, background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <FileText size={18} color="#16a34a" />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: '#111827', marginBottom: 3 }}>{v.name || 'Untitled version'}</div>
                      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                        {v.role_title && <span style={{ fontSize: 11, color: '#6b7280' }}>{v.role_title}</span>}
                        {v.company_name && <span style={{ fontSize: 11, color: '#9ca3af' }}>@ {v.company_name}</span>}
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                      {v.fit_score && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: v.fit_score >= 75 ? '#dcfce7' : v.fit_score >= 50 ? '#fffbeb' : '#fef2f2', border: `1px solid ${v.fit_score >= 75 ? '#bbf7d0' : v.fit_score >= 50 ? '#fde68a' : '#fecaca'}`, borderRadius: 99, padding: '3px 10px' }}>
                          <Star size={10} color={v.fit_score >= 75 ? '#16a34a' : v.fit_score >= 50 ? '#d97706' : '#dc2626'} />
                          <span style={{ fontSize: 11, fontWeight: 700, color: v.fit_score >= 75 ? '#15803d' : v.fit_score >= 50 ? '#d97706' : '#dc2626' }}>{v.fit_score}%</span>
                        </div>
                      )}
                      <button onClick={() => { loadVersions(); onRestore() }}
                        style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#16a34a', color: '#fff', border: 'none', borderRadius: 8, padding: '7px 14px', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font-sans)' }}>
                        <RotateCcw size={12} /> Restore
                      </button>
                    </div>
                  </div>
                  <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 8 }}>
                    {v.created_at && new Date(v.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </div>
                  {v.cv_text && (
                    <div style={{ marginTop: 10, fontSize: 12, color: '#6b7280', lineHeight: 1.55, background: '#f9fafb', borderRadius: 8, padding: '8px 12px', borderLeft: '3px solid #e5e7eb', fontFamily: 'monospace', maxHeight: 80, overflow: 'hidden', whiteSpace: 'pre-wrap' }}>
                      {v.cv_text.substring(0, 300)}…
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
