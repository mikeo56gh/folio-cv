'use client'
import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@supabase/supabase-js'
import { ChevronDown, Sparkles, CreditCard, LogOut, Plus } from 'lucide-react'
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

const TABS = [
  { id: 'profile',        label: 'Profile',         step: '1' },
  { id: 'experience',     label: 'Experience',       step: '2' },
  { id: 'education',      label: 'Education',        step: '3' },
  { id: 'qualifications', label: 'Qualifications',   step: '4' },
  { id: 'skills',         label: 'Skills',           step: '5' },
  { id: 'generate',       label: 'Generate',         step: '◈' },
  { id: 'jobs',           label: 'Find jobs',        step: '🔎' },
  { id: 'tracker',        label: 'Tracker',          step: '📋' },
  { id: 'history',        label: 'History',          step: '🕐' },
]

const PLAN_COLORS: Record<string, string> = {
  free: 'bg-gray-100 text-gray-600',
  pro: 'bg-forest-50 text-forest-700',
  boost: 'bg-amber-50 text-amber-700',
  recruiter: 'bg-purple-50 text-purple-700',
}

function UpgradeModal() {
  const { upgradeMsg, setUpgradeMsg, checkout } = useApp()
  if (!upgradeMsg) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
        onClick={() => setUpgradeMsg(null)}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-7"
          onClick={e => e.stopPropagation()}
        >
          <div className="flex items-center gap-2 mb-2">
            <Sparkles size={18} className="text-forest-500" />
            <h3 className="font-serif text-xl text-gray-900">Upgrade your plan</h3>
          </div>
          <p className="text-sm text-gray-500 mb-6 leading-relaxed">{upgradeMsg}</p>

          <div className="grid grid-cols-2 gap-3 mb-5">
            {[
              { key: 'sprint', name: 'Job Seeker Sprint', price: '£39 / 3 months', features: ['Unlimited everything', 'LinkedIn optimiser', 'Weekly job alerts', 'Pay once — no monthly commitment'] },
              { key: 'pro', name: 'Pro', price: '£9/mo', features: ['Unlimited everything', 'Company research', 'Interview prep', 'Version history'] },
            ].map(plan => (
              <div key={plan.key} className="border border-parchment-300 rounded-xl p-4">
                <div className="font-semibold text-sm text-gray-900 mb-0.5">{plan.name}</div>
                <div className="text-xs text-forest-600 font-medium mb-3">{plan.price}</div>
                <ul className="space-y-1 mb-4">
                  {plan.features.map(f => <li key={f} className="text-xs text-gray-500">✓ {f}</li>)}
                </ul>
                <button
                  onClick={() => { setUpgradeMsg(null); checkout(plan.key) }}
                  className="w-full bg-forest-500 text-white rounded-lg py-2 text-xs font-semibold hover:bg-forest-600 transition-colors"
                >
                  Upgrade to {plan.name}
                </button>
              </div>
            ))}
          </div>
          <button onClick={() => setUpgradeMsg(null)} className="w-full text-center text-xs text-gray-400 hover:text-gray-600 transition-colors">
            Maybe later
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

function AppShell() {
  const router = useRouter()
  const params = useSearchParams()
  const { userInfo, profiles, currentProfileId, profileData, switchProfile, newProfile, saveVersion, signOut, checkout, outputs } = useApp()
  const [tab, setTab] = useState('profile')
  const [salaryCoachPreset, setSalaryCoachPreset] = useState<{ role: string; company: string } | null>(null)

  function openSalaryCoach(role: string, company: string) {
    setSalaryCoachPreset({ role, company })
    setTab('tools')
  }

  // Handle checkout redirect and extension JD injection
  useEffect(() => {
    const plan = params.get('checkout')
    if (plan) checkout(plan)

    // Handle JD injection from Chrome extension
    const jd = params.get('jd')
    const jdUrl = params.get('url')
    const from = params.get('from')
    if (jd && from === 'extension') {
      setJdText(decodeURIComponent(jd))
      if (jdUrl) setJdUrl(decodeURIComponent(jdUrl))
      setTab('generate')
    }
  }, [])

  // Progress dots
  const progress = [
    !!(profileData.profile.name && profileData.profile.email),
    profileData.jobs.some(j => !j.isGap && j.title && j.company),
    profileData.education.some(e => e.degree && e.institution),
    profileData.skills.some(s => s.tags.length > 0),
  ]
  const progressCount = progress.filter(Boolean).length

  const GENERATE_TABS = ['generate', 'jobs', 'tracker', 'history']
  const isAtGenerate = GENERATE_TABS.includes(tab)

  const tabIndex = TABS.findIndex(t => t.id === tab)
  const canGoBack = tabIndex > 0 && !GENERATE_TABS.includes(tab)
  const canGoForward = tabIndex < 5 // only Continue on setup tabs

  return (
    <div className="min-h-screen bg-parchment-100 flex flex-col">
      <UpgradeModal />

      {/* HEADER */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-sm border-b border-parchment-300 shadow-sm">
        <div className="flex items-center justify-between px-5 h-14">
          <div className="flex items-center gap-3">
            <span className="font-serif text-[19px] text-gray-900">Folio</span>
            <span className="hidden sm:block text-[9px] font-bold tracking-[2px] text-forest-600 uppercase">CV Builder</span>
          </div>

          <div className="flex items-center gap-2">
            {/* Profile selector */}
            <div className="flex items-center gap-1">
              <select
                value={currentProfileId || ''}
                onChange={e => switchProfile(e.target.value)}
                className="bg-parchment-100 border border-parchment-300 rounded-lg text-xs font-medium text-gray-700 px-2.5 py-1.5 outline-none max-w-[130px] cursor-pointer"
              >
                {profiles.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
              <button
                onClick={newProfile}
                className="w-7 h-7 flex items-center justify-center bg-parchment-100 border border-parchment-300 rounded-lg text-gray-500 hover:text-forest-600 hover:border-forest-300 transition-colors"
              >
                <Plus size={13} />
              </button>
            </div>

            {/* Plan badge */}
            {userInfo && (
              <span className={`hidden sm:inline-flex text-[10px] font-bold px-2.5 py-1 rounded-full tracking-wider uppercase ${PLAN_COLORS[userInfo.plan] || PLAN_COLORS.free}`}>
                {userInfo.planName}
              </span>
            )}

            {/* Progress */}
            <div className="hidden sm:flex items-center gap-2">
              <div className="w-20 h-1.5 bg-parchment-300 rounded-full overflow-hidden">
                <div
                  className="h-full bg-forest-500 rounded-full transition-all duration-500"
                  style={{ width: `${(progressCount / 4) * 100}%` }}
                />
              </div>
              <span className="text-[10px] font-medium text-gray-500">{progressCount}/4</span>
            </div>

            {/* Actions */}
            {userInfo?.plan !== 'free' && (
              <button onClick={async () => { const { url } = await (await fetch('/api/stripe/portal', { method: 'POST', headers: { Authorization: `Bearer ${userInfo?.token}` } })).json(); window.location.href = url }}
                className="hidden sm:flex items-center gap-1 text-xs text-gray-400 hover:text-gray-700 transition-colors px-2 py-1.5">
                <CreditCard size={12} />
              </button>
            )}
            <button onClick={signOut} className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-700 transition-colors px-2 py-1.5">
              <LogOut size={13} />
              <span className="hidden sm:inline">Sign out</span>
            </button>
          </div>
        </div>

        {/* Free plan usage bar */}
        {userInfo?.plan === 'free' && (
          <div className="bg-amber-50 border-t border-amber-200 px-5 py-1.5 flex items-center justify-between">
            <span className="text-xs text-amber-700">
              Free plan · {userInfo.usageSummary?.cv?.remaining ?? '?'} CV generations, {userInfo.usageSummary?.review?.remaining ?? '?'} fit reviews remaining
            </span>
            <button onClick={() => checkout('pro')} className="text-xs font-semibold text-amber-700 underline hover:text-amber-900">
              Upgrade to Pro →
            </button>
          </div>
        )}
      </header>

      {/* NAV */}
      <nav className="bg-white border-b border-parchment-300 overflow-x-auto">
        <div className="flex min-w-max px-4">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`relative flex items-center gap-2 px-3.5 h-11 text-xs font-medium transition-colors whitespace-nowrap border-b-2 ${
                tab === t.id
                  ? 'border-forest-500 text-forest-700'
                  : 'border-transparent text-gray-400 hover:text-gray-700 hover:border-parchment-400'
              }`}
            >
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold transition-colors ${
                tab === t.id ? 'bg-forest-50 text-forest-600' : 'bg-parchment-200 text-gray-500'
              }`}>
                {t.step}
              </span>
              {t.label}
            </button>
          ))}
        </div>
      </nav>

      {/* MAIN CONTENT */}
      <main className="flex-1 max-w-[960px] mx-auto w-full px-5 py-6 pb-24">
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.18 }}
          >
            {tab === 'profile'        && <ProfileTab />}
            {tab === 'experience'     && <ExperienceTab />}
            {tab === 'education'      && <EducationTab />}
            {tab === 'qualifications' && <QualificationsTab />}
            {tab === 'skills'         && <SkillsTab />}
            {tab === 'generate'       && <GenerateTab />}
            {tab === 'jobs'           && <JobsTab onApply={(job) => { setTab('generate') }} />}
            {tab === 'tools'          && <ToolsTab initialSection={salaryCoachPreset ? 'salary' : undefined} salaryPreset={salaryCoachPreset} />}
            {tab === 'tracker'        && <TrackerTab onOpenSalaryCoach={openSalaryCoach} />}
            {tab === 'history'        && <HistoryTab onRestore={() => setTab('generate')} />}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* FOOTER */}
      {!isAtGenerate && (
        <footer className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-parchment-300 px-5 py-3 flex justify-end gap-2.5 z-30">
          {canGoBack && (
            <button onClick={() => setTab(TABS[tabIndex - 1].id)}
              className="text-sm font-medium text-gray-500 hover:text-gray-800 bg-parchment-100 border border-parchment-300 px-5 py-2 rounded-xl transition-all hover:border-parchment-400">
              ← Back
            </button>
          )}
          {canGoForward && tabIndex < 5 && (
            <button onClick={() => setTab(TABS[tabIndex + 1].id)}
              className="text-sm font-semibold text-white bg-forest-500 hover:bg-forest-600 px-6 py-2 rounded-xl transition-all shadow-sm hover:shadow">
              Continue →
            </button>
          )}
          {tab === 'generate' && (
            <button onClick={saveVersion}
              className="text-sm font-medium text-gray-600 border border-parchment-300 px-5 py-2 rounded-xl hover:border-parchment-400 transition-all">
              💾 Save version
            </button>
          )}
        </footer>
      )}
    </div>
  )
}

export default function AppPage() {
  const [session, setSession] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const supabase = getSupabase()
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.replace('/auth')
      } else {
        setSession(session)
      }
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        router.replace('/auth')
      } else {
        setSession(session)
      }
    })

    return () => subscription.unsubscribe()
  }, [router])

  if (loading) return (
    <div className="min-h-screen bg-parchment-100 flex items-center justify-center">
      <div className="flex flex-col items-center gap-3 text-gray-400">
        <div className="w-8 h-8 border-2 border-forest-300 border-t-forest-600 rounded-full animate-spin" />
        <span className="text-sm font-medium">Loading Folio…</span>
      </div>
    </div>
  )

  if (!session) return null

  return (
    <AppProvider session={session}>
      <AppShell />
    </AppProvider>
  )
}
