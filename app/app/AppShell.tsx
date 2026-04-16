'use client'
import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@supabase/supabase-js'
import {
  User, Briefcase, GraduationCap, Award, Zap, Search, LayoutGrid,
  Clock, Wrench, Sparkles, LogOut, CreditCard, Plus, ChevronRight,
  CheckCircle, Circle, Menu, X, TrendingUp
} from 'lucide-react'
import { AppProvider, useApp, SENIORITY } from './context'
import { ProfileTab } from './tabs/ProfileTab'
import { ToolsTab } from './tabs/ToolsTab'
import { ExperienceTab } from './tabs/ExperienceTab'
import { EducationTab } from './tabs/EducationTab'
import { QualificationsTab } from './tabs/QualificationsTab'
import { SkillsTab } from './tabs/SkillsTab'
import { GenerateTab } from './tabs/GenerateTab'
import { JobsTab } from './tabs/JobsTab'
import { TrackerTab } from './tabs/TrackerTab'
import { HistoryTab } from './tabs/HistoryTab'

const getSupabase = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const SETUP_TABS = [
  { id: 'profile',        label: 'Profile',         icon: User,          step: 1 },
  { id: 'experience',     label: 'Experience',       icon: Briefcase,     step: 2 },
  { id: 'education',      label: 'Education',        icon: GraduationCap, step: 3 },
  { id: 'qualifications', label: 'Qualifications',   icon: Award,         step: 4 },
  { id: 'skills',         label: 'Skills',           icon: Zap,           step: 5 },
]

const ACTION_TABS = [
  { id: 'generate', label: 'Generate',   icon: Sparkles    },
  { id: 'jobs',     label: 'Find jobs',  icon: Search      },
  { id: 'tracker',  label: 'Tracker',    icon: LayoutGrid  },
  { id: 'history',  label: 'History',    icon: Clock       },
  { id: 'tools',    label: 'Tools',      icon: Wrench      },
]

const PLAN_STYLES: Record<string, { bg: string; color: string; label: string }> = {
  free:      { bg: '#f3f4f6', color: '#6b7280', label: 'Free' },
  sprint:    { bg: '#dcfce7', color: '#16a34a', label: 'Sprint' },
  pro:       { bg: '#dcfce7', color: '#16a34a', label: 'Pro' },
  boost:     { bg: '#fef3c7', color: '#d97706', label: 'Boost' },
  recruiter: { bg: '#f3e8ff', color: '#7c3aed', label: 'Recruiter' },
}

// ─── UPGRADE MODAL ────────────────────────────────────────────
function UpgradeModal() {
  const { upgradeMsg, setUpgradeMsg, checkout } = useApp()
  if (!upgradeMsg) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
        onClick={() => setUpgradeMsg(null)}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96 }}
          style={{ background: '#fff', borderRadius: 20, width: '100%', maxWidth: 480, padding: 28, boxShadow: '0 24px 64px rgba(0,0,0,0.2)' }}
          onClick={e => e.stopPropagation()}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Sparkles size={16} color="#16a34a" />
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 800, color: '#111827', letterSpacing: '-0.02em' }}>Upgrade your plan</h3>
          </div>
          <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 20, lineHeight: 1.6 }}>{upgradeMsg}</p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
            {[
              { key: 'sprint', name: 'Sprint', price: '£39 / 3 months', tag: 'Best value', features: ['Everything unlimited', 'LinkedIn optimiser', 'Salary coach', 'No monthly bill'] },
              { key: 'boost', name: 'Career Boost', price: '£19/month', tag: null, features: ['Everything in Pro', 'LinkedIn optimiser', 'Salary coach', 'Job alerts'] },
            ].map(plan => (
              <div key={plan.key} style={{ border: '1.5px solid #e5e7eb', borderRadius: 14, padding: 16, display: 'flex', flexDirection: 'column', gap: 0 }}>
                {plan.tag && <span style={{ fontSize: 9, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#16a34a', marginBottom: 4 }}>{plan.tag}</span>}
                <div style={{ fontWeight: 800, fontSize: 14, color: '#111827', marginBottom: 2 }}>{plan.name}</div>
                <div style={{ fontSize: 12, color: '#16a34a', fontWeight: 600, marginBottom: 12 }}>{plan.price}</div>
                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 16px', display: 'flex', flexDirection: 'column', gap: 6, flex: 1 }}>
                  {plan.features.map(f => (
                    <li key={f} style={{ fontSize: 12, color: '#374151', display: 'flex', gap: 7 }}>
                      <span style={{ color: '#16a34a', flexShrink: 0 }}>✓</span>{f}
                    </li>
                  ))}
                </ul>
                <button onClick={() => { setUpgradeMsg(null); checkout(plan.key) }}
                  style={{ background: '#16a34a', color: '#fff', border: 'none', borderRadius: 10, padding: '9px', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font-sans)' }}>
                  Get {plan.name}
                </button>
              </div>
            ))}
          </div>
          <button onClick={() => setUpgradeMsg(null)} style={{ display: 'block', width: '100%', textAlign: 'center', fontSize: 13, color: '#9ca3af', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-sans)' }}>
            Maybe later
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

// ─── SIDEBAR ──────────────────────────────────────────────────
function Sidebar({ tab, setTab, open, setOpen }: { tab: string; setTab: (t: string) => void; open: boolean; setOpen: (v: boolean) => void }) {
  const { profileData, userInfo, profiles, currentProfileId, switchProfile, newProfile, signOut, checkout } = useApp()

  const progress = [
    !!(profileData.profile.name && profileData.profile.email),
    profileData.jobs.some(j => !j.isGap && j.title && j.company),
    profileData.education.some(e => e.degree && e.institution),
    profileData.skills.some(s => s.tags.length > 0),
  ]
  const progressCount = progress.filter(Boolean).length
  const planStyle = PLAN_STYLES[userInfo?.plan || 'free'] || PLAN_STYLES.free

  const navItem = (id: string, label: string, Icon: any, isDone?: boolean) => {
    const active = tab === id
    return (
      <button key={id} onClick={() => { setTab(id); setOpen(false) }}
        style={{
          display: 'flex', alignItems: 'center', gap: 10, width: '100%',
          padding: '9px 12px', borderRadius: 10, border: 'none', cursor: 'pointer',
          background: active ? '#dcfce7' : 'transparent',
          color: active ? '#15803d' : '#6b7280',
          fontFamily: 'var(--font-sans)', fontSize: 13, fontWeight: active ? 700 : 500,
          transition: 'all 0.12s', textAlign: 'left',
        }}
        onMouseEnter={e => { if (!active) (e.currentTarget as HTMLElement).style.background = '#f9fafb' }}
        onMouseLeave={e => { if (!active) (e.currentTarget as HTMLElement).style.background = 'transparent' }}
      >
        <Icon size={15} style={{ flexShrink: 0 }} />
        <span style={{ flex: 1 }}>{label}</span>
        {isDone !== undefined && (
          isDone
            ? <CheckCircle size={13} style={{ color: '#16a34a', flexShrink: 0 }} />
            : <Circle size={13} style={{ color: '#d1d5db', flexShrink: 0 }} />
        )}
      </button>
    )
  }

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 49 }} onClick={() => setOpen(false)} />
      )}

      <aside style={{
        width: 224, flexShrink: 0, background: '#fff', borderRight: '1px solid #e5e7eb',
        display: 'flex', flexDirection: 'column', height: '100vh', position: 'sticky', top: 0, overflow: 'hidden',
        // Mobile: slide in
        ...(typeof window !== 'undefined' && window.innerWidth < 768 ? {
          position: 'fixed', left: open ? 0 : -240, top: 0, bottom: 0, zIndex: 50,
          transition: 'left 0.25s ease', boxShadow: open ? '4px 0 24px rgba(0,0,0,0.15)' : 'none',
        } : {}),
      }} className="sidebar">
        {/* Logo */}
        <div style={{ padding: '18px 16px 14px', borderBottom: '1px solid #f3f4f6' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 7 }}>
            <span style={{ fontFamily: 'var(--font-serif)', fontSize: 22, fontWeight: 700, color: '#111827', letterSpacing: '-0.02em' }}>Folio</span>
            <span style={{ fontSize: 8, fontWeight: 800, letterSpacing: '0.18em', color: '#16a34a', textTransform: 'uppercase' }}>CV Builder</span>
          </div>
        </div>

        {/* Profile switcher */}
        <div style={{ padding: '12px 12px 8px' }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#9ca3af', marginBottom: 6, paddingLeft: 4 }}>Profile</div>
          <div style={{ display: 'flex', gap: 6 }}>
            <select value={currentProfileId || ''} onChange={e => switchProfile(e.target.value)}
              style={{ flex: 1, background: '#f9fafb', border: '1.5px solid #e5e7eb', borderRadius: 8, fontSize: 12, fontWeight: 600, color: '#374151', padding: '6px 10px', outline: 'none', fontFamily: 'var(--font-sans)', cursor: 'pointer' }}>
              {profiles.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            <button onClick={newProfile}
              style={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f9fafb', border: '1.5px solid #e5e7eb', borderRadius: 8, cursor: 'pointer', color: '#6b7280', flexShrink: 0 }}>
              <Plus size={14} />
            </button>
          </div>
        </div>

        {/* Progress */}
        <div style={{ padding: '4px 16px 12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 5 }}>
            <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#9ca3af' }}>Completeness</span>
            <span style={{ fontSize: 11, fontWeight: 800, color: progressCount === 4 ? '#16a34a' : '#d97706' }}>{Math.round((progressCount / 4) * 100)}%</span>
          </div>
          <div style={{ height: 5, background: '#f3f4f6', borderRadius: 99, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${(progressCount / 4) * 100}%`, background: progressCount === 4 ? '#16a34a' : '#f59e0b', borderRadius: 99, transition: 'width 0.4s ease' }} />
          </div>
        </div>

        {/* Nav — Setup */}
        <div style={{ padding: '0 8px', flex: 1, overflowY: 'auto' }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#9ca3af', padding: '6px 4px 4px' }}>Setup</div>
          {SETUP_TABS.map(t => navItem(t.id, t.label, t.icon, progress[t.step - 1]))}

          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#9ca3af', padding: '14px 4px 4px' }}>Actions</div>
          {ACTION_TABS.map(t => navItem(t.id, t.label, t.icon))}
        </div>

        {/* Bottom — plan + signout */}
        <div style={{ padding: '10px 12px 16px', borderTop: '1px solid #f3f4f6' }}>
          {userInfo?.plan === 'free' && (
            <button onClick={() => checkout('sprint')}
              style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 8, background: '#dcfce7', border: '1.5px solid #bbf7d0', borderRadius: 10, padding: '10px 12px', marginBottom: 8, cursor: 'pointer', fontFamily: 'var(--font-sans)' }}>
              <Sparkles size={14} color="#16a34a" />
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#15803d' }}>Upgrade to Pro</div>
                <div style={{ fontSize: 10, color: '#16a34a', fontWeight: 500 }}>Unlimited everything</div>
              </div>
            </button>
          )}
          {userInfo && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 4px 8px' }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#374151', flexShrink: 0 }}>
                {(userInfo.fullName || userInfo.email || 'U').charAt(0).toUpperCase()}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#111827', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{userInfo.fullName || userInfo.email?.split('@')[0]}</div>
                <span style={{ fontSize: 10, fontWeight: 700, padding: '1px 7px', borderRadius: 99, background: planStyle.bg, color: planStyle.color }}>{planStyle.label}</span>
              </div>
            </div>
          )}
          <button onClick={signOut}
            style={{ display: 'flex', alignItems: 'center', gap: 7, width: '100%', background: 'none', border: 'none', padding: '7px 4px', cursor: 'pointer', fontSize: 12, color: '#9ca3af', fontFamily: 'var(--font-sans)', fontWeight: 500 }}>
            <LogOut size={13} />
            Sign out
          </button>
        </div>
      </aside>
    </>
  )
}

// ─── FREE PLAN BANNER ─────────────────────────────────────────
function FreeBanner() {
  const { userInfo, checkout } = useApp()
  if (!userInfo || userInfo.plan !== 'free') return null
  return (
    <div style={{ background: '#fffbeb', borderBottom: '1px solid #fde68a', padding: '8px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <span style={{ fontSize: 12, color: '#92400e', fontWeight: 500 }}>
        Free plan · {userInfo.usageSummary?.cv?.remaining ?? '?'} CV generations and {userInfo.usageSummary?.review?.remaining ?? '?'} fit reviews remaining
      </span>
      <button onClick={() => checkout('pro')}
        style={{ fontSize: 12, fontWeight: 700, color: '#d97706', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-sans)', textDecoration: 'underline' }}>
        Upgrade →
      </button>
    </div>
  )
}

// ─── MAIN APP SHELL ───────────────────────────────────────────
function AppShell() {
  const params = useSearchParams()
  const { checkout } = useApp()
  const [tab, setTab] = useState('profile')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [salaryCoachPreset, setSalaryCoachPreset] = useState<{ role: string; company: string } | null>(null)

  function openSalaryCoach(role: string, company: string) {
    setSalaryCoachPreset({ role, company })
    setTab('tools')
  }

  useEffect(() => {
    const plan = params.get('checkout')
    if (plan) checkout(plan)
    const jd = params.get('jd')
    const from = params.get('from')
    if (jd && from === 'extension') {
      setTab('generate')
    }
  }, [])

  const allTabs = [...SETUP_TABS, ...ACTION_TABS]
  const currentTabInfo = allTabs.find(t => t.id === tab)
  const isSetupTab = SETUP_TABS.some(t => t.id === tab)
  const currentIdx = SETUP_TABS.findIndex(t => t.id === tab)

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f9fafb', fontFamily: 'var(--font-sans)' }}>
      <UpgradeModal />

      {/* Sidebar */}
      <Sidebar tab={tab} setTab={setTab} open={sidebarOpen} setOpen={setSidebarOpen} />

      {/* Main content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>
        {/* Top bar */}
        <header style={{ background: '#fff', borderBottom: '1px solid #e5e7eb', padding: '0 20px', height: 52, display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0, position: 'sticky', top: 0, zIndex: 30 }}>
          {/* Mobile menu button */}
          <button onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{ display: 'none', background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: '#6b7280' }} className="md:hidden sidebar-toggle">
            <Menu size={20} />
          </button>

          {/* Breadcrumb */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flex: 1 }}>
            <span style={{ fontSize: 13, color: '#9ca3af', fontWeight: 500 }}>Folio</span>
            <ChevronRight size={13} style={{ color: '#d1d5db' }} />
            <span style={{ fontSize: 13, fontWeight: 700, color: '#111827' }}>{currentTabInfo?.label || 'App'}</span>
          </div>

          {/* Right actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {isSetupTab && currentIdx < SETUP_TABS.length - 1 && (
              <button onClick={() => setTab(SETUP_TABS[currentIdx + 1].id)}
                style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#16a34a', color: '#fff', border: 'none', borderRadius: 10, padding: '7px 16px', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font-sans)' }}>
                Next <ChevronRight size={14} />
              </button>
            )}
            {currentIdx === SETUP_TABS.length - 1 && (
              <button onClick={() => setTab('generate')}
                style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#16a34a', color: '#fff', border: 'none', borderRadius: 10, padding: '7px 16px', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font-sans)' }}>
                Generate CV <Sparkles size={14} />
              </button>
            )}
          </div>
        </header>

        <FreeBanner />

        {/* Page content */}
        <main style={{ flex: 1, padding: '24px 24px 48px', maxWidth: 900, width: '100%', margin: '0 auto' }}>
          <AnimatePresence mode="wait">
            <motion.div key={tab} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
              {tab === 'profile'        && <ProfileTab />}
              {tab === 'experience'     && <ExperienceTab />}
              {tab === 'education'      && <EducationTab />}
              {tab === 'qualifications' && <QualificationsTab />}
              {tab === 'skills'         && <SkillsTab />}
              {tab === 'generate'       && <GenerateTab />}
              {tab === 'jobs'           && <JobsTab onApply={() => setTab('generate')} />}
              {tab === 'tracker'        && <TrackerTab onOpenSalaryCoach={openSalaryCoach} />}
              {tab === 'history'        && <HistoryTab onRestore={() => setTab('generate')} />}
              {tab === 'tools'          && <ToolsTab initialSection={salaryCoachPreset ? 'salary' : undefined} salaryPreset={salaryCoachPreset} />}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .sidebar { position: fixed !important; z-index: 50 !important; }
          .sidebar-toggle { display: flex !important; }
        }
        @media (min-width: 769px) {
          .sidebar { position: sticky !important; left: unset !important; }
        }
        * { box-sizing: border-box; }
        select { appearance: none; }
      `}</style>
    </div>
  )
}

// ─── ROOT EXPORT ──────────────────────────────────────────────
export default function AppPage() {
  const [session, setSession] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const supabase = getSupabase()
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) router.replace('/auth')
      else setSession(session)
      setLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      if (!session) router.replace('/auth')
      else setSession(session)
    })
    return () => subscription.unsubscribe()
  }, [router])

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#f9fafb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, color: '#9ca3af' }}>
        <div style={{ width: 32, height: 32, border: '3px solid #e5e7eb', borderTopColor: '#16a34a', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
        <span style={{ fontSize: 13, fontWeight: 600, fontFamily: 'var(--font-sans)' }}>Loading Folio…</span>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  if (!session) return null

  return (
    <AppProvider session={session}>
      <AppShell />
    </AppProvider>
  )
}
