'use client'
import { useApp, SENIORITY } from '../context'
import { Card, Field, Input, SectionHeader, CompletenessBar, Guidance } from '../../../components/ui'
import { clsx } from 'clsx'

export function ProfileTab() {
  const { profileData, updateProfile } = useApp()
  const { profile: prof } = profileData

  const completenessChecks = [
    { label: 'Name & email',           ok: !!(prof.name && prof.email) },
    { label: 'LinkedIn URL',            ok: !!prof.linkedin },
    { label: 'Phone & location',        ok: !!(prof.phone && prof.location) },
    { label: 'Work experience',         ok: profileData.jobs.some(j => !j.isGap && j.title && j.company) },
    { label: 'Quantified achievements', ok: profileData.jobs.some(j => j.achievements.some(a => /\d/.test(a))) },
    { label: 'Education',               ok: profileData.education.some(e => e.degree && e.institution) },
    { label: 'Qualifications',          ok: profileData.qualifications.some(q => q.title && q.body) },
    { label: 'Skills added',            ok: profileData.skills.some(s => s.tags.length > 0) },
    { label: 'Skills with context',     ok: profileData.skills.some(s => (s.context || '').trim().length > 5) },
    { label: 'GitHub or portfolio',     ok: !!(prof.github || prof.website) },
  ]

  return (
    <div>
      <SectionHeader eyebrow="Step 1" title="Personal profile" sub="Contact details and career level" />
      <CompletenessBar checks={completenessChecks} />

      <Card className="mb-4">
        <div className="font-semibold text-xs text-gray-500 uppercase tracking-widest mb-4">Contact details</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Full name" required><Input value={prof.name} onChange={e => updateProfile('name', e.target.value)} placeholder="Jane Smith" /></Field>
          <Field label="Email" required><Input type="email" value={prof.email} onChange={e => updateProfile('email', e.target.value)} placeholder="jane@email.com" /></Field>
          <Field label="Phone"><Input value={prof.phone} onChange={e => updateProfile('phone', e.target.value)} placeholder="+44 7700 000000" /></Field>
          <Field label="Location"><Input value={prof.location} onChange={e => updateProfile('location', e.target.value)} placeholder="London, UK" /></Field>
          <div className="sm:col-span-2">
            <Field label="LinkedIn URL"><Input value={prof.linkedin} onChange={e => updateProfile('linkedin', e.target.value)} placeholder="https://linkedin.com/in/yourname" /></Field>
          </div>
          <Field label="GitHub"><Input value={prof.github} onChange={e => updateProfile('github', e.target.value)} placeholder="https://github.com/yourname" /></Field>
          <Field label="Portfolio / website"><Input value={prof.website} onChange={e => updateProfile('website', e.target.value)} placeholder="https://yoursite.com" /></Field>
        </div>
      </Card>

      <Card>
        <div className="flex items-center justify-between mb-3">
          <div className="font-semibold text-xs text-gray-500 uppercase tracking-widest">Career level</div>
          <span className="text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-0.5 rounded-full">Shapes AI tone</span>
        </div>
        <p className="text-sm text-gray-400 mb-4 leading-relaxed">Select your current or target level. The AI calibrates tone, language, and emphasis accordingly.</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          {SENIORITY.map(sen => (
            <button
              key={sen.key}
              type="button"
              onClick={() => updateProfile('seniority', sen.key)}
              className={clsx(
                'text-left p-3 rounded-xl border-[1.5px] transition-all duration-150',
                prof.seniority === sen.key
                  ? 'border-forest-400 bg-forest-50'
                  : 'border-parchment-300 bg-white hover:border-forest-200 hover:bg-parchment-50'
              )}
            >
              <div className={clsx('text-xs font-semibold mb-0.5', prof.seniority === sen.key ? 'text-forest-700' : 'text-gray-800')}>{sen.label}</div>
              <div className="text-[11px] text-gray-400">{sen.desc}</div>
            </button>
          ))}
        </div>
      </Card>

      <Guidance title="📋 Profile tips" items={[
        'Use a professional email — avoid nicknames or old university addresses',
        'Customise your LinkedIn URL: linkedin.com/in/yourname (not a random string)',
        'Location: city and country only — no full address needed on a CV',
        'Only include GitHub/portfolio if they contain recent, quality work',
      ]} />
    </div>
  )
}
