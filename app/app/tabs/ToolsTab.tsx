'use client'
import { useState, useEffect } from 'react'
import { useCompletion } from 'ai/react'
import { motion, AnimatePresence } from 'framer-motion'
import { useApp } from '../context'
import { Card, SectionHeader, Field, Input, Button, Guidance, SkillTagInput } from '../../../components/ui'
import { Linkedin, Bell, BellOff, Plus, Trash2, Copy, CheckCircle, Loader2, Lock, TrendingUp, ChevronDown, ChevronUp, Sparkles } from 'lucide-react'
import { toast } from 'sonner'
import { clsx } from 'clsx'

// ─── LINKEDIN OPTIMISER ───────────────────────────────────────
function LinkedInOptimiser() {
  const { profileData, token, userInfo, setUpgradeMsg } = useApp()
  const [targetRole, setTargetRole] = useState('')
  const [currentAbout, setCurrentAbout] = useState('')
  const [result, setResult] = useState<{ headline: string; about: string; keywords: string[] } | null>(null)
  const [copied, setCopied] = useState<string | null>(null)

  const isPremium = ['boost', 'sprint', 'recruiter'].includes(userInfo?.plan || '')

  const { complete, completion, isLoading } = useCompletion({
    api: '/api/linkedin',
    headers: { Authorization: `Bearer ${token}` },
    onFinish: (_, text) => {
      const headlineMatch = text.match(/---HEADLINE---\s*([\s\S]*?)(?=---ABOUT---|$)/i)
      const aboutMatch = text.match(/---ABOUT---\s*([\s\S]*?)(?=---FEATURED_KEYWORDS---|$)/i)
      const keywordsMatch = text.match(/---FEATURED_KEYWORDS---\s*([\s\S]*?)$/i)
      setResult({
        headline: headlineMatch?.[1]?.trim() || '',
        about: aboutMatch?.[1]?.trim() || '',
        keywords: keywordsMatch?.[1]?.trim().split('\n').map(k => k.trim()).filter(Boolean) || [],
      })
    },
    onError: (err: any) => {
      if (err.message?.includes('upgrade') || err.message?.includes('Upgrade')) setUpgradeMsg(err.message)
      else toast.error(err.message)
    },
  })

  function run() {
    if (!isPremium) { setUpgradeMsg('LinkedIn profile optimiser requires Career Boost or Sprint. Upgrade to unlock.'); return }
    complete('', { body: { profileData, targetRole, sector: 'general', currentAbout } })
    setResult(null)
  }

  function copy(text: string, key: string) {
    navigator.clipboard.writeText(text)
    setCopied(key)
    toast.success('Copied to clipboard')
    setTimeout(() => setCopied(null), 2500)
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <div className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center">
          <Linkedin size={18} className="text-blue-700" />
        </div>
        <div>
          <h3 className="font-semibold text-[15px] text-gray-900">LinkedIn profile optimiser</h3>
          <p className="text-xs text-gray-400">Rewrites your About section and headline for LinkedIn's search algorithm</p>
        </div>
        {!isPremium && (
          <span className="ml-auto flex items-center gap-1.5 text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full">
            <Lock size={11} /> Boost / Sprint
          </span>
        )}
      </div>

      <Guidance title="What this does" items={[
        'Rewrites your headline to be keyword-rich and discoverable by recruiters in your sector',
        'Restructures your About section with a hook, achievements with numbers, and a clear call to action',
        'Identifies the 10 keywords to add to your LinkedIn Skills section for maximum search visibility',
        "LinkedIn's algorithm weights the About section heavily — a well-optimised profile gets 5–10x more profile views",
      ]} />

      <Card className="mb-4">
        <div className="grid sm:grid-cols-2 gap-4 mb-4">
          <Field label="Target role (optional)">
            <Input value={targetRole} onChange={e => setTargetRole(e.target.value)} placeholder="e.g. Senior Product Manager" />
          </Field>
        </div>
        <Field label="Your current LinkedIn About section (paste it here, or leave blank)">
          <textarea
            value={currentAbout}
            onChange={e => setCurrentAbout(e.target.value)}
            rows={6}
            placeholder="Paste your current About section here so the AI can improve it rather than starting from scratch…"
            className="w-full bg-parchment-100 border border-parchment-300 rounded-lg px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-forest-400/30 focus:border-forest-400 focus:bg-white transition-all resize-vertical leading-relaxed"
          />
        </Field>
        <Button onClick={run} loading={isLoading} className="mt-4" icon={<Linkedin size={14} />}>
          {isPremium ? 'Optimise LinkedIn profile' : 'Upgrade to optimise'}
        </Button>
      </Card>

      <AnimatePresence>
        {isLoading && !result && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-3 text-gray-400 text-sm py-4">
            <Loader2 size={16} className="animate-spin text-forest-500" />
            Analysing your profile and writing optimised content…
          </motion.div>
        )}
        {result && (
          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            {/* Headline */}
            <Card>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="text-[10px] font-bold tracking-[2px] text-blue-600 uppercase mb-0.5">LinkedIn headline</div>
                  <div className="text-xs text-gray-400">{result.headline.length} / 220 characters</div>
                </div>
                <button onClick={() => copy(result.headline, 'headline')} className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-800 bg-parchment-100 border border-parchment-300 px-3 py-1.5 rounded-lg transition-colors">
                  {copied === 'headline' ? <><CheckCircle size={12} className="text-forest-500" /> Copied</> : <><Copy size={12} /> Copy</>}
                </button>
              </div>
              <p className="text-sm text-gray-800 leading-relaxed font-medium">{result.headline}</p>
            </Card>
            {/* About */}
            <Card>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="text-[10px] font-bold tracking-[2px] text-blue-600 uppercase mb-0.5">About section</div>
                  <div className="text-xs text-gray-400">{result.about.length} / 2,600 characters</div>
                </div>
                <button onClick={() => copy(result.about, 'about')} className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-800 bg-parchment-100 border border-parchment-300 px-3 py-1.5 rounded-lg transition-colors">
                  {copied === 'about' ? <><CheckCircle size={12} className="text-forest-500" /> Copied</> : <><Copy size={12} /> Copy</>}
                </button>
              </div>
              <pre className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap font-sans">{result.about}</pre>
            </Card>
            {/* Keywords */}
            <Card>
              <div className="text-[10px] font-bold tracking-[2px] text-blue-600 uppercase mb-3">Add these to your LinkedIn Skills section</div>
              <div className="flex flex-wrap gap-2">
                {result.keywords.map((k, i) => (
                  <span key={i} className="text-xs font-medium bg-blue-50 border border-blue-200 text-blue-700 px-3 py-1 rounded-full">{k}</span>
                ))}
              </div>
              <p className="text-xs text-gray-400 mt-3">Go to LinkedIn → Profile → Skills → Add skill — add each of these.</p>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── JOB ALERTS ───────────────────────────────────────────────
function JobAlerts() {
  const { token, userInfo, profileData, setUpgradeMsg } = useApp()
  const [alerts, setAlerts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [title, setTitle] = useState('')
  const [keywords, setKeywords] = useState<string[]>([])
  const [location, setLocation] = useState(profileData.profile.location?.split(',')[0] || '')
  const [salaryMin, setSalaryMin] = useState('')
  const [saving, setSaving] = useState(false)

  const isPremium = ['pro', 'boost', 'sprint', 'recruiter'].includes(userInfo?.plan || '')

  useEffect(() => {
    if (!token) return
    fetch('/api/alerts', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => setAlerts(d.alerts || []))
      .finally(() => setLoading(false))
  }, [token])

  async function createAlert() {
    if (!isPremium) { setUpgradeMsg('Job alerts require Pro, Sprint, or Boost. Upgrade to unlock.'); return }
    if (!title || !keywords.length) { toast.error('Add a title and at least one keyword.'); return }
    setSaving(true)
    try {
      const res = await fetch('/api/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ title, keywords, location, salary_min: salaryMin ? parseInt(salaryMin) : undefined }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setAlerts(prev => [data.alert, ...prev])
      setShowForm(false)
      setTitle(''); setKeywords([]); setSalaryMin('')
      toast.success('Alert created — you\'ll get your first digest next Monday.')
    } catch (e: any) {
      if (e.message?.includes('upgrade')) setUpgradeMsg(e.message)
      else toast.error(e.message)
    }
    setSaving(false)
  }

  async function deleteAlert(id: string) {
    if (!confirm('Delete this alert?')) return
    await fetch('/api/alerts', { method: 'DELETE', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ id }) })
    setAlerts(prev => prev.filter(a => a.id !== id))
    toast.success('Alert deleted')
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-forest-50 flex items-center justify-center">
            <Bell size={18} className="text-forest-600" />
          </div>
          <div>
            <h3 className="font-semibold text-[15px] text-gray-900">Weekly job alerts</h3>
            <p className="text-xs text-gray-400">Matching roles delivered to your inbox every Monday at 8am</p>
          </div>
          {!isPremium && <span className="flex items-center gap-1.5 text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full"><Lock size={11} /> Pro+</span>}
        </div>
        <Button size="sm" onClick={() => { if (!isPremium) { setUpgradeMsg('Job alerts require Pro, Sprint, or Boost.'); return }; setShowForm(true) }} icon={<Plus size={13} />}>New alert</Button>
      </div>

      {/* Create form */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
            <Card accent="green" className="mb-4">
              <div className="text-[10px] font-bold tracking-[2px] text-forest-600 uppercase mb-4">New job alert</div>
              <div className="grid sm:grid-cols-2 gap-4 mb-4">
                <Field label="Alert name">
                  <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Senior PM roles in London" />
                </Field>
                <Field label="Location">
                  <Input value={location} onChange={e => setLocation(e.target.value)} placeholder="London" />
                </Field>
                <div className="sm:col-span-2">
                  <Field label="Keywords — press Enter to add">
                    <SkillTagInput tags={keywords} onAdd={k => setKeywords(prev => [...prev, k])} onRemove={i => setKeywords(prev => prev.filter((_, j) => j !== i))} placeholder="e.g. Product Manager, then Enter" />
                  </Field>
                </div>
                <Field label="Minimum salary (optional)">
                  <Input value={salaryMin} onChange={e => setSalaryMin(e.target.value)} placeholder="e.g. 60000" type="number" />
                </Field>
              </div>
              <div className="flex gap-2">
                <Button onClick={createAlert} loading={saving}>Create alert</Button>
                <Button variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Alert list */}
      {loading ? (
        <div className="flex items-center gap-2 text-gray-400 text-sm py-4"><Loader2 size={15} className="animate-spin" /> Loading alerts…</div>
      ) : alerts.length === 0 ? (
        <Card className="text-center py-10">
          <BellOff size={28} className="text-parchment-400 mx-auto mb-3" />
          <p className="text-sm text-gray-500 font-medium mb-1">No alerts yet</p>
          <p className="text-xs text-gray-400">Create one above — matching roles land in your inbox every Monday.</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {alerts.map(alert => (
            <Card key={alert.id} className="flex items-center gap-3">
              <Bell size={16} className="text-forest-500 shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm text-gray-900">{alert.title}</div>
                <div className="text-xs text-gray-400 mt-0.5 flex items-center gap-2 flex-wrap">
                  {alert.location && <span>{alert.location}</span>}
                  {alert.keywords?.length && <span>{alert.keywords.join(', ')}</span>}
                  {alert.salary_min && <span>£{Math.round(alert.salary_min/1000)}k+</span>}
                </div>
                {alert.last_sent_at && <div className="text-[10px] text-gray-400 mt-1">Last sent: {new Date(alert.last_sent_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</div>}
              </div>
              <button onClick={() => deleteAlert(alert.id)} className="text-gray-300 hover:text-red-500 transition-colors shrink-0">
                <Trash2 size={14} />
              </button>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── SALARY NEGOTIATION COACH ────────────────────────────────
function SalaryCoach({ preset }: { preset?: { role: string; company: string } | null }) {
  const { profileData, token, userInfo, setUpgradeMsg } = useApp()
  const [offerSalary, setOfferSalary] = useState('')
  const [currentSalary, setCurrentSalary] = useState('')
  const [roleTitle, setRoleTitle] = useState(preset?.role || profileData.jobs[0]?.title || '')
  const [companyName, setCompanyName] = useState(preset?.company || '')
  const [marketRange, setMarketRange] = useState('')
  const [notes, setNotes] = useState('')
  const [result, setResult] = useState<{
    assessment: string
    counterOffer: string
    script: string
    email: string
    talkingPoints: string[]
    walkAwayPoint: string
    otherBenefits: string[]
  } | null>(null)
  const [openSection, setOpenSection] = useState<string | null>('assessment')
  const [copied, setCopied] = useState<string | null>(null)

  const isPremium = ['boost', 'sprint', 'recruiter'].includes(userInfo?.plan || '')

  const { complete, isLoading } = useCompletion({
    api: '/api/salary-coach',
    headers: { Authorization: `Bearer ${token}` },
    onFinish: (_, text) => {
      try {
        const clean = text.replace(/```json|```/g, '').trim()
        const match = clean.match(/\{[\s\S]*\}/)
        if (match) setResult(JSON.parse(match[0]))
      } catch { toast.error('Could not parse coaching response — try again.') }
    },
    onError: (err: any) => {
      if (err.message?.includes('upgrade') || err.message?.includes('Upgrade')) setUpgradeMsg(err.message)
      else toast.error(err.message)
    },
  })

  function run() {
    if (!isPremium) { setUpgradeMsg('Salary negotiation coach requires Career Boost or Sprint. Upgrade to unlock.'); return }
    if (!offerSalary || !roleTitle) { toast.error('Enter the offer amount and role title to continue.'); return }

    complete('', {
      body: {
        offerSalary: parseInt(offerSalary.replace(/[^0-9]/g, '')),
        currentSalary: currentSalary ? parseInt(currentSalary.replace(/[^0-9]/g, '')) : null,
        marketRange,
        roleTitle,
        companyName,
        notes,
        seniority: profileData.profile.seniority,
        recentAchievements: profileData.jobs
          .filter(j => !j.isGap && j.achievements?.some(a => a.trim()))
          .slice(0, 2)
          .flatMap(j => j.achievements.filter(a => a.trim()).slice(0, 2)),
      },
    })
    setResult(null)
    setOpenSection('assessment')
  }

  function copy(text: string, key: string) {
    navigator.clipboard.writeText(text)
    setCopied(key)
    toast.success('Copied to clipboard')
    setTimeout(() => setCopied(null), 2500)
  }

  function toggle(key: string) {
    setOpenSection(prev => prev === key ? null : key)
  }

  const sections = result ? [
    {
      key: 'assessment',
      label: 'Situation assessment',
      icon: '📊',
      content: (
        <div className="space-y-4">
          <p className="text-sm text-gray-600 leading-relaxed">{result.assessment}</p>
          {result.walkAwayPoint && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <div className="text-[10px] font-bold tracking-wider text-red-600 uppercase mb-1">Walk-away point</div>
              <p className="text-sm text-red-800 font-medium">{result.walkAwayPoint}</p>
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'counter',
      label: 'Counter-offer strategy',
      icon: '🎯',
      content: (
        <div className="space-y-3">
          <div className="bg-forest-50 border border-forest-200 rounded-xl p-4">
            <div className="text-[10px] font-bold tracking-wider text-forest-600 uppercase mb-1">Recommended counter-offer</div>
            <p className="text-2xl font-serif font-light text-forest-700">{result.counterOffer}</p>
          </div>
          {result.otherBenefits?.length > 0 && (
            <div>
              <div className="text-[10px] font-bold tracking-wider text-gray-500 uppercase mb-2">If they won't move on salary, ask for</div>
              <div className="flex flex-wrap gap-2">
                {result.otherBenefits.map((b, i) => (
                  <span key={i} className="text-xs bg-parchment-200 border border-parchment-300 text-gray-700 px-2.5 py-1 rounded-full">{b}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'talking',
      label: 'Talking points',
      icon: '💬',
      content: (
        <div className="space-y-2.5">
          <p className="text-xs text-gray-400 mb-3">Use these in the conversation. Each one is grounded in your actual experience.</p>
          {result.talkingPoints?.map((point, i) => (
            <div key={i} className="flex items-start gap-3 bg-parchment-100 border border-parchment-300 rounded-xl p-3.5">
              <span className="text-forest-500 font-bold text-sm shrink-0 mt-0.5">▸</span>
              <p className="text-sm text-gray-700 leading-relaxed">{point}</p>
            </div>
          ))}
        </div>
      ),
    },
    {
      key: 'script',
      label: 'Phone / video script',
      icon: '📞',
      copyKey: 'script',
      copyText: result.script,
      content: (
        <div>
          <p className="text-xs text-gray-400 mb-3">A word-for-word script for the negotiation call. Adapt it to sound like you.</p>
          <pre className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap font-sans bg-parchment-50 border border-parchment-200 rounded-xl p-4">{result.script}</pre>
        </div>
      ),
    },
    {
      key: 'email',
      label: 'Follow-up email',
      icon: '✉️',
      copyKey: 'email',
      copyText: result.email,
      content: (
        <div>
          <p className="text-xs text-gray-400 mb-3">Send this after the call to confirm your counter-offer in writing.</p>
          <pre className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap font-sans bg-parchment-50 border border-parchment-200 rounded-xl p-4">{result.email}</pre>
        </div>
      ),
    },
  ] : []

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center">
          <TrendingUp size={18} className="text-amber-600" />
        </div>
        <div>
          <h3 className="font-semibold text-[15px] text-gray-900">Salary negotiation coach</h3>
          <p className="text-xs text-gray-400">Counter-offer strategy, talking points, call script, and follow-up email</p>
        </div>
        {!isPremium && (
          <span className="ml-auto flex items-center gap-1.5 text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full">
            <Lock size={11} /> Boost / Sprint
          </span>
        )}
      </div>

      <Guidance title="How to use this" items={[
        'Fill in the offer amount and role — the coach builds your strategy around your specific situation',
        'Add your current salary so it can calculate the uplift and calibrate the counter-offer',
        "If you know the market range (from Glassdoor, LinkedIn Salary, or your network) add it — the AI uses it to anchor the counter",
        'The talking points are drawn from your actual achievements in Folio — they\'re specific, not generic',
        'One successful negotiation at senior level typically means £5–15k extra — well worth 5 minutes of prep',
      ]} />

      <Card className="mb-4">
        <div className="grid sm:grid-cols-2 gap-4 mb-4">
          <Field label="Role title" required>
            <Input value={roleTitle} onChange={e => setRoleTitle(e.target.value)} placeholder="e.g. Senior Product Manager" />
          </Field>
          <Field label="Company name">
            <Input value={companyName} onChange={e => setCompanyName(e.target.value)} placeholder="e.g. Stripe" />
          </Field>
          <Field label="Offer salary (£)" required>
            <Input value={offerSalary} onChange={e => setOfferSalary(e.target.value)} placeholder="e.g. 75000" type="number" />
          </Field>
          <Field label="Your current salary (£)">
            <Input value={currentSalary} onChange={e => setCurrentSalary(e.target.value)} placeholder="e.g. 68000" type="number" />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Market range for this role (optional)" hint="From Glassdoor, LinkedIn Salary, or your network — helps anchor the counter-offer">
              <Input value={marketRange} onChange={e => setMarketRange(e.target.value)} placeholder="e.g. £72k–£90k based on LinkedIn Salary data" />
            </Field>
          </div>
          <div className="sm:col-span-2">
            <Field label="Anything else to factor in (optional)" hint="e.g. competing offer, relocation required, equity on table, start date pressure">
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                rows={2}
                placeholder="e.g. I have a competing offer at £78k from another company. They want me to start in 2 weeks."
                className="w-full bg-parchment-100 border border-parchment-300 rounded-lg px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-forest-400/30 focus:border-forest-400 focus:bg-white transition-all resize-none leading-relaxed"
              />
            </Field>
          </div>
        </div>
        <Button onClick={run} loading={isLoading} icon={<Sparkles size={14} />} variant={isPremium ? 'primary' : 'amber'}>
          {isPremium ? 'Build my negotiation strategy' : 'Upgrade to unlock'}
        </Button>
      </Card>

      {/* Results accordion */}
      <AnimatePresence>
        {sections.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
            {sections.map(section => (
              <div key={section.key} className="bg-white border border-parchment-300 rounded-2xl overflow-hidden shadow-sm">
                <button
                  onClick={() => toggle(section.key)}
                  className="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-parchment-50 transition-colors"
                >
                  <span className="text-base">{section.icon}</span>
                  <span className="flex-1 font-semibold text-sm text-gray-900">{section.label}</span>
                  {(section as any).copyKey && openSection === section.key && (
                    <button
                      onClick={e => { e.stopPropagation(); copy((section as any).copyText, (section as any).copyKey) }}
                      className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-800 bg-parchment-100 border border-parchment-300 px-2.5 py-1 rounded-lg transition-colors mr-2"
                    >
                      {copied === (section as any).copyKey ? <><CheckCircle size={11} className="text-forest-500" /> Copied</> : <><Copy size={11} /> Copy</>}
                    </button>
                  )}
                  {openSection === section.key
                    ? <ChevronUp size={15} className="text-gray-400 shrink-0" />
                    : <ChevronDown size={15} className="text-gray-400 shrink-0" />
                  }
                </button>
                <AnimatePresence>
                  {openSection === section.key && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 pb-5 pt-1 border-t border-parchment-200">
                        {section.content}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── COMBINED TAB ─────────────────────────────────────────────
export function ToolsTab({ initialSection, salaryPreset }: { initialSection?: string; salaryPreset?: { role: string; company: string } | null }) {
  const [section, setSection] = useState<'linkedin' | 'alerts' | 'salary'>(
    (initialSection as any) || 'linkedin'
  )

  const tabs = [
    { key: 'linkedin', label: 'LinkedIn optimiser', icon: Linkedin },
    { key: 'salary',   label: 'Salary coach',       icon: TrendingUp },
    { key: 'alerts',   label: 'Job alerts',          icon: Bell },
  ]

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#16a34a', marginBottom: 4 }}>Power tools</div>
        <h2 style={{ fontSize: 20, fontWeight: 800, color: '#111827', letterSpacing: '-0.02em', marginBottom: 3 }}>Tools</h2>
        <p style={{ fontSize: 13, color: '#6b7280' }}>LinkedIn optimiser, salary negotiation coach, and weekly job alerts.</p>
      </div>

      {/* Tab switcher */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 20, flexWrap: 'wrap' }}>
        {tabs.map(({ key, label, icon: Icon }) => {
          const active = section === key
          return (
            <button key={key} onClick={() => setSection(key as any)}
              style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 16px', borderRadius: 10, border: `1.5px solid ${active ? '#bbf7d0' : '#e5e7eb'}`, background: active ? '#dcfce7' : '#fff', color: active ? '#15803d' : '#6b7280', fontFamily: 'var(--font-sans)', fontSize: 13, fontWeight: active ? 700 : 500, cursor: 'pointer', transition: 'all 0.12s' }}>
              <Icon size={14} />
              {label}
            </button>
          )
        })}
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={section} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
          {section === 'linkedin' && <LinkedInOptimiser />}
          {section === 'salary'   && <SalaryCoach preset={salaryPreset} />}
          {section === 'alerts'   && <JobAlerts />}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
