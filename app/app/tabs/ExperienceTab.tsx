'use client'
import { useApp, EMPTY_JOB, EMPTY_EDU, EMPTY_QUAL, EMPTY_SKILL, uid, fmtDate, Job, Education, Qualification, Skill } from '../context'
import { Card, Field, Input, Textarea, DatePicker, SectionHeader, Guidance, Tip, Button, SkillTagInput } from '../../../components/ui'
import { Plus, Trash2, Sparkles } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useCompletion } from 'ai/react'
import { toast } from 'sonner'
import { clsx } from 'clsx'

// ─── EXPERIENCE TAB ───────────────────────────────────────────
export function ExperienceTab() {
  const { profileData, updateJobs, token } = useApp()
  const { jobs } = profileData

  const upJob = (id: string, k: keyof Job, v: any) => updateJobs(jobs.map(j => j.id === id ? { ...j, [k]: v } : j))
  const upAch = (id: string, ai: number, v: string) => updateJobs(jobs.map(j => j.id === id ? { ...j, achievements: j.achievements.map((a, i) => i === ai ? v : a) } : j))

  const { complete: strengthenAch, isLoading: strengtheningAch } = useCompletion({
    api: '/api/generate',
    headers: { Authorization: `Bearer ${token}` },
    onFinish: (_, completion) => {
      try {
        const arr = JSON.parse(completion.replace(/```json|```/g, '').trim())
        const updatedJobs = [...jobs]
        arr.forEach((item: any) => {
          const j = updatedJobs.find(x => x.id === item.jobId)
          if (j && item.idx >= 0 && item.idx < j.achievements.length) j.achievements[item.idx] = item.improved
        })
        updateJobs(updatedJobs)
        toast.success('Achievements strengthened — review each one. Estimates flagged with (est.)')
      } catch { toast.error('Could not parse AI response') }
    },
  })

  function runStrengthen() {
    const weak = jobs.filter(j => !j.isGap && j.achievements.some(a => a.trim() && !/\d/.test(a)))
    if (!weak.length) { toast.info('No unquantified achievements found — great job!'); return }
    const toFix = weak.map(j => ({ jobId: j.id, title: j.title, company: j.company, achievements: j.achievements.map((a, i) => ({ idx: i, text: a, needsWork: a.trim() && !/\d/.test(a) })).filter(a => a.needsWork) }))
    strengthenAch('', { body: { type: 'strengthen_ach', data: toFix } })
  }

  return (
    <div>
      <SectionHeader eyebrow="Step 2" title="Work experience" sub="Most recent first. Add all achievements — AI selects the most relevant per application."
        action={
          <div className="flex gap-2">
            <Button variant="amber" size="sm" onClick={() => updateJobs([...jobs, { ...EMPTY_JOB(), isGap: true }])} icon={<Plus size={13} />}>Gap</Button>
            <Button variant="secondary" size="sm" loading={strengtheningAch} onClick={runStrengthen} icon={<Sparkles size={13} />}>Add metrics</Button>
            <Button size="sm" onClick={() => updateJobs([...jobs, EMPTY_JOB()])} icon={<Plus size={13} />}>Add role</Button>
          </div>
        }
      />

      <Guidance title="✦ Writing strong achievements" items={[
        <><strong>CAR formula:</strong> Challenge → Action → Result with a number</>,
        'Add more than you think you need — AI picks only the most relevant ones',
        <><strong>Exec roles:</strong> Strategy, P&L, org design — not task execution</>,
        'Quantify: %, £/$, headcount, time saved, revenue, users, SLA improvements',
      ]} />

      <AnimatePresence>
        {jobs.map((job, ji) => job.isGap ? (
          <motion.div key={job.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, height: 0 }}>
            <Card accent="amber" className="mb-3">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-bold tracking-[2px] text-amber-700 uppercase">Employment gap</span>
                {jobs.length > 1 && <Button variant="danger" size="sm" onClick={() => updateJobs(jobs.filter(j => j.id !== job.id))} icon={<Trash2 size={12} />}>Remove</Button>}
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Reason (shown on CV)"><Input value={job.gapReason} onChange={e => upJob(job.id, 'gapReason', e.target.value)} placeholder="e.g. Career break — caring responsibilities" /></Field>
                <div className="grid grid-cols-2 gap-2">
                  <DatePicker label="From" monthVal={job.startMonth} yearVal={job.startYear} onChangeMonth={v => upJob(job.id, 'startMonth', v)} onChangeYear={v => upJob(job.id, 'startYear', v)} />
                  <DatePicker label="To" monthVal={job.endMonth} yearVal={job.endYear} onChangeMonth={v => upJob(job.id, 'endMonth', v)} onChangeYear={v => upJob(job.id, 'endYear', v)} />
                </div>
              </div>
            </Card>
          </motion.div>
        ) : (
          <motion.div key={job.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, height: 0 }}>
            <Card className="mb-3">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-bold tracking-[2px] text-forest-600 uppercase">Role {ji + 1}</span>
                {jobs.length > 1 && <Button variant="danger" size="sm" onClick={() => updateJobs(jobs.filter(j => j.id !== job.id))} icon={<Trash2 size={12} />}>Remove</Button>}
              </div>
              <div className="grid sm:grid-cols-2 gap-4 mb-4">
                <Field label="Job title" required><Input value={job.title} onChange={e => upJob(job.id, 'title', e.target.value)} placeholder="Senior Software Engineer" /></Field>
                <Field label="Company" required><Input value={job.company} onChange={e => upJob(job.id, 'company', e.target.value)} placeholder="Acme Ltd" /></Field>
                <div className="sm:col-span-2"><Field label="Location"><Input value={job.location} onChange={e => upJob(job.id, 'location', e.target.value)} placeholder="London, UK / Remote" /></Field></div>
                <DatePicker label="Start date" monthVal={job.startMonth} yearVal={job.startYear} onChangeMonth={v => upJob(job.id, 'startMonth', v)} onChangeYear={v => upJob(job.id, 'startYear', v)} />
                <DatePicker label="End date" monthVal={job.endMonth} yearVal={job.endYear} onChangeMonth={v => upJob(job.id, 'endMonth', v)} onChangeYear={v => upJob(job.id, 'endYear', v)} disabled={job.current} />
              </div>
              <label className="flex items-center gap-2 text-sm text-gray-500 cursor-pointer mb-4">
                <input type="checkbox" checked={job.current} onChange={e => upJob(job.id, 'current', e.target.checked)} className="accent-forest-500 w-3.5 h-3.5" />
                Current role
              </label>
              <div>
                <div className="text-[11px] font-semibold tracking-wide text-gray-500 uppercase mb-1.5">Achievements &amp; responsibilities</div>
                <p className="text-xs text-gray-400 mb-3">Add all — AI selects the most relevant per job description. Lead with impact. Use numbers.</p>
                {job.achievements.map((a, ai) => (
                  <div key={ai} className="flex items-start gap-2 mb-2">
                    <span className="text-forest-500 font-bold text-xs mt-2.5 shrink-0">▸</span>
                    <Textarea value={a} rows={2} onChange={e => upAch(job.id, ai, e.target.value)} placeholder="e.g. Reduced churn by 18% by redesigning onboarding, improving 30-day retention from 62% to 80%" className="flex-1" />
                    {job.achievements.length > 1 && <button onClick={() => updateJobs(jobs.map(j => j.id === job.id ? { ...j, achievements: j.achievements.filter((_, i) => i !== ai) } : j))} className="text-red-400 hover:text-red-600 mt-2 text-sm transition-colors">✕</button>}
                  </div>
                ))}
                <button onClick={() => updateJobs(jobs.map(j => j.id === job.id ? { ...j, achievements: [...j.achievements, ''] } : j))} className="text-xs text-gray-400 border border-dashed border-parchment-400 rounded-lg px-3 py-1.5 hover:text-forest-600 hover:border-forest-300 transition-colors mt-1">
                  + Add achievement
                </button>
              </div>
            </Card>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}

// ─── EDUCATION TAB ────────────────────────────────────────────
export function EducationTab() {
  const { profileData, updateEducation } = useApp()
  const { education } = profileData
  const upE = (id: string, k: keyof Education, v: any) => updateEducation(education.map(e => e.id === id ? { ...e, [k]: v } : e))

  return (
    <div>
      <SectionHeader eyebrow="Step 3" title="Education" sub="Degrees, certifications, bootcamps — most recent first"
        action={<Button size="sm" onClick={() => updateEducation([...education, EMPTY_EDU()])} icon={<Plus size={13} />}>Add entry</Button>}
      />
      <Guidance title="📚 Education tips" items={[
        '5+ years experience? Keep this brief — track record matters more',
        'Include grade only if strong (2:1 / First / Distinction or equivalent)',
        'Certifications (AWS, CFA, PMP, CIMA) are highly ATS-searchable',
        'Recent grads: expand with modules, dissertation, awards, societies',
      ]} />
      {education.map((edu, ei) => (
        <Card key={edu.id} className="mb-3">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] font-bold tracking-[2px] text-forest-600 uppercase">Entry {ei + 1}</span>
            {education.length > 1 && <Button variant="danger" size="sm" onClick={() => updateEducation(education.filter(e => e.id !== edu.id))} icon={<Trash2 size={12} />}>Remove</Button>}
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Degree / qualification" required><Input value={edu.degree} onChange={e => upE(edu.id, 'degree', e.target.value)} placeholder="BSc Computer Science" /></Field>
            <Field label="Institution" required><Input value={edu.institution} onChange={e => upE(edu.id, 'institution', e.target.value)} placeholder="University of Manchester" /></Field>
            <Field label="Location"><Input value={edu.location} onChange={e => upE(edu.id, 'location', e.target.value)} placeholder="Manchester, UK" /></Field>
            <Field label="Grade"><Input value={edu.grade} onChange={e => upE(edu.id, 'grade', e.target.value)} placeholder="First Class Honours" /></Field>
            <DatePicker label="Start" monthVal={edu.startMonth} yearVal={edu.startYear} onChangeMonth={v => upE(edu.id, 'startMonth', v)} onChangeYear={v => upE(edu.id, 'startYear', v)} />
            <DatePicker label="End" monthVal={edu.endMonth} yearVal={edu.endYear} onChangeMonth={v => upE(edu.id, 'endMonth', v)} onChangeYear={v => upE(edu.id, 'endYear', v)} />
            <div className="sm:col-span-2"><Field label="Notable projects, modules, dissertation, awards"><Textarea value={edu.notes} rows={2} onChange={e => upE(edu.id, 'notes', e.target.value)} placeholder="Dissertation: NLP fraud detection (82%). Dean's List 2018." /></Field></div>
          </div>
        </Card>
      ))}
    </div>
  )
}

// ─── QUALIFICATIONS TAB ───────────────────────────────────────
export function QualificationsTab() {
  const { profileData, updateQualifications } = useApp()
  const { qualifications } = profileData
  const upQ = (id: string, k: keyof Qualification, v: any) => updateQualifications(qualifications.map(q => q.id === id ? { ...q, [k]: v } : q))

  return (
    <div>
      <SectionHeader eyebrow="Step 4" title="Qualifications & memberships" sub="Chartered status, professional accreditations, licences, memberships"
        action={<Button size="sm" onClick={() => updateQualifications([...qualifications, EMPTY_QUAL()])} icon={<Plus size={13} />}>Add qualification</Button>}
      />
      <Guidance title="🏅 What belongs here" items={[
        <><strong>Chartered status:</strong> CEng, CFA, ACCA, MRICS, MCIPS, CIPD, GMC, SRA, solicitor/barrister status</>,
        <><strong>Accreditations:</strong> PMP, Prince2, AWS/Azure/GCP, Scrum Master, NEBOSH, ISO lead auditor</>,
        <><strong>Memberships:</strong> MICE, MIET, MInstP, FCA — include grade (Associate, Member, Fellow)</>,
        'Missing chartered status in regulated industries is often an automatic red flag — always include it',
      ]} />
      {qualifications.map((q, qi) => {
        const expWarn = q.expiry && new Date(q.expiry) < new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
        return (
          <Card key={q.id} className="mb-3">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] font-bold tracking-[2px] text-forest-600 uppercase">Qualification {qi + 1}</span>
              {qualifications.length > 1 && <Button variant="danger" size="sm" onClick={() => updateQualifications(qualifications.filter(x => x.id !== q.id))} icon={<Trash2 size={12} />}>Remove</Button>}
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Title" required><Input value={q.title} onChange={e => upQ(q.id, 'title', e.target.value)} placeholder="Chartered Engineer (CEng)" /></Field>
              <Field label="Awarding body" required><Input value={q.body} onChange={e => upQ(q.id, 'body', e.target.value)} placeholder="Engineering Council / IMechE" /></Field>
              <Field label="Membership / reference number"><Input value={q.reference} onChange={e => upQ(q.id, 'reference', e.target.value)} placeholder="12345678 (optional)" /></Field>
              <Field label="Expiry (if applicable)">
                <Input type="month" value={q.expiry} onChange={e => upQ(q.id, 'expiry', e.target.value)} />
                {expWarn && <p className="text-[11px] text-amber-600 mt-1">⚠ Expires soon — check renewal status</p>}
              </Field>
              <DatePicker label="Date achieved" monthVal={q.achievedMonth} yearVal={q.achievedYear} onChangeMonth={v => upQ(q.id, 'achievedMonth', v)} onChangeYear={v => upQ(q.id, 'achievedYear', v)} />
              <div className="sm:col-span-2"><Field label="Notes (specialism, grade, renewal status)"><Textarea value={q.notes} rows={2} onChange={e => upQ(q.id, 'notes', e.target.value)} placeholder="Mechanical engineering specialism. Fellow grade (FIMechE). Currently in renewal process." /></Field></div>
            </div>
          </Card>
        )
      })}
    </div>
  )
}

// ─── SKILLS TAB ───────────────────────────────────────────────
export function SkillsTab() {
  const { profileData, updateSkills, token } = useApp()
  const { skills } = profileData
  const upS = (id: string, k: keyof Skill, v: any) => updateSkills(skills.map(s => s.id === id ? { ...s, [k]: v } : s))

  const { complete: strengthenSkills, isLoading: strengtheningSkills } = useCompletion({
    api: '/api/generate',
    headers: { Authorization: `Bearer ${token}` },
    onFinish: (_, completion) => {
      try {
        const arr = JSON.parse(completion.replace(/```json|```/g, '').trim())
        const updated = skills.map(s => { const found = arr.find((a: any) => a.id === s.id); return found?.context ? { ...s, context: found.context } : s })
        updateSkills(updated)
        toast.success('Skills enriched with context!')
      } catch { toast.error('Could not parse response') }
    },
  })

  function runStrengthenSkills() {
    const jobsCtx = profileData.jobs.filter(j => !j.isGap && j.title).map(j => `${j.title} at ${j.company}: ${j.achievements.filter(a => a.trim()).join(' | ')}`).join('\n')
    strengthenSkills('', { body: { type: 'strengthen_skills', data: { jobs: profileData.jobs, skills } } })
  }

  return (
    <div>
      <SectionHeader eyebrow="Step 5" title="Skills" sub="Tag skills, then add context to make them credible — not just buzzwords"
        action={<Button size="sm" onClick={() => updateSkills([...skills, EMPTY_SKILL()])} icon={<Plus size={13} />}>Add category</Button>}
      />
      <Guidance title="🎯 Making skills meaningful" items={[
        <><strong>"Leadership"</strong> is worthless. <strong>"Leadership — managed 3 cross-functional teams of 8–25, delivered £2.4m programme"</strong> is evidence.</>,
        'Use the context field to add one specific sentence of proof per category',
        'Mirror exact JD wording — "stakeholder management" not a paraphrase',
        <><strong>Director/Exec:</strong> Prioritise commercial and strategic skills over technical tools</>,
      ]} />
      <button
        onClick={runStrengthenSkills}
        disabled={strengtheningSkills}
        className="w-full mb-4 flex items-center justify-center gap-2 bg-purple-50 border border-purple-200 text-purple-700 rounded-xl py-2.5 text-xs font-semibold hover:bg-purple-100 transition-colors disabled:opacity-50"
      >
        <Sparkles size={13} className={strengtheningSkills ? 'animate-spin' : ''} />
        {strengtheningSkills ? 'Enriching skills…' : '✦ AI-enrich all skill categories with context from your experience'}
      </button>
      {skills.map((sk, si) => (
        <Card key={sk.id} className="mb-3">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-bold tracking-[2px] text-forest-600 uppercase">Category {si + 1}</span>
            {skills.length > 1 && <Button variant="danger" size="sm" onClick={() => updateSkills(skills.filter(s => s.id !== sk.id))} icon={<Trash2 size={12} />}>Remove</Button>}
          </div>
          <Field label="Category name" className="mb-3"><Input value={sk.category} onChange={e => upS(sk.id, 'category', e.target.value)} placeholder="e.g. Leadership" /></Field>
          <Field label="Skills — press Enter or comma to add">
            <SkillTagInput tags={sk.tags} onAdd={v => upS(sk.id, 'tags', [...sk.tags, v])} onRemove={i => upS(sk.id, 'tags', sk.tags.filter((_, j) => j !== i))} />
          </Field>
          <Textarea
            value={sk.context || ''}
            onChange={e => upS(sk.id, 'context', e.target.value)}
            rows={2}
            placeholder="Context — e.g. Led cross-functional teams of 8–25 delivering £2.4m programmes across 3 countries (leave blank for AI to fill)"
            className="mt-3"
          />
        </Card>
      ))}
    </div>
  )
}
