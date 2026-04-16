'use client'
import { useApp, EMPTY_JOB, EMPTY_EDU, EMPTY_QUAL, EMPTY_SKILL, uid, fmtDate, Job, Education, Qualification, Skill } from '../context'
import { Card, Field, Input, LocationInput, Textarea, DatePicker, SectionHeader, Guidance, Tip, Button, SkillTagInput, CompletenessBar } from '../../../components/ui'
import { Plus, Trash2, Sparkles, ChevronDown, ChevronUp } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { useCompletion } from 'ai/react'
import { toast } from 'sonner'

// ─── EXPERIENCE TAB ───────────────────────────────────────────
export function ExperienceTab() {
  const { profileData, updateJobs, token } = useApp()
  const { jobs } = profileData
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({})

  const upJob = (id: string, k: keyof Job, v: any) =>
    updateJobs(jobs.map(j => j.id === id ? { ...j, [k]: v } : j))
  const upAch = (id: string, ai: number, v: string) =>
    updateJobs(jobs.map(j => j.id === id ? { ...j, achievements: j.achievements.map((a, i) => i === ai ? v : a) } : j))

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
    const toFix = weak.map(j => ({
      jobId: j.id, title: j.title, company: j.company,
      achievements: j.achievements.map((a, i) => ({ idx: i, text: a, needsWork: a.trim() && !/\d/.test(a) })).filter(a => a.needsWork),
    }))
    strengthenAch('', { body: { type: 'strengthen_ach', data: toFix } })
  }

  function addRole() {
    updateJobs([...jobs, EMPTY_JOB()])
  }

  function addGap() {
    updateJobs([...jobs, { ...EMPTY_JOB(), isGap: true }])
  }

  function toggle(id: string) {
    setCollapsed(c => ({ ...c, [id]: !c[id] }))
  }

  return (
    <div>
      <SectionHeader
        eyebrow="Step 2"
        title="Work experience"
        sub="Most recent first. Add all achievements — AI selects the most relevant per application."
        action={
          <div style={{ display: 'flex', gap: 8 }}>
            <Button variant="outline" size="sm" loading={strengtheningAch} onClick={runStrengthen} icon={<Sparkles size={12} />}>Add metrics</Button>
            <Button variant="secondary" size="sm" onClick={addGap}>+ Gap</Button>
            <Button size="sm" onClick={addRole} icon={<Plus size={13} />}>Add role</Button>
          </div>
        }
      />

      <Guidance title="Writing strong achievements" items={[
        <><strong>CAR formula:</strong> Challenge → Action → Result with a number</>,
        'Add more bullets than you think you need — AI picks only the most relevant',
        <><strong>Executive roles:</strong> Strategy, P&L, org design — not task execution</>,
        'Quantify everything: %, £/$, headcount, time saved, revenue, SLA improvements',
      ]} />

      <AnimatePresence initial={false}>
        {jobs.map((job, ji) => {
          const isCollapsed = collapsed[job.id] && (job.title || job.company)
          const label = job.isGap ? 'Employment gap' : `${job.title || 'New role'}${job.company ? ` · ${job.company}` : ''}`

          return (
            <motion.div
              key={job.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, height: 0, marginBottom: 0 }}
              transition={{ duration: 0.2 }}
              style={{ marginBottom: 12 }}
            >
              <Card accent={job.isGap ? 'amber' : undefined}>
                {/* Card header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: isCollapsed ? 0 : 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: job.isGap ? '#d97706' : '#16a34a' }}>
                      {job.isGap ? '⚠ Gap' : `Role ${ji + 1}`}
                    </span>
                    {isCollapsed && <span style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>{label}</span>}
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {(job.title || job.company) && (
                      <button onClick={() => toggle(job.id)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', display: 'flex', alignItems: 'center', padding: '2px 6px' }}>
                        {isCollapsed ? <ChevronDown size={15} /> : <ChevronUp size={15} />}
                      </button>
                    )}
                    {jobs.length > 1 && (
                      <Button variant="danger" size="sm" onClick={() => updateJobs(jobs.filter(j => j.id !== job.id))} icon={<Trash2 size={12} />}>Remove</Button>
                    )}
                  </div>
                </div>

                {!isCollapsed && (
                  job.isGap ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
                      <div style={{ gridColumn: '1/-1' }}>
                        <Field label="Reason (shown on CV)">
                          <Input value={job.gapReason} onChange={e => upJob(job.id, 'gapReason', e.target.value)} placeholder="e.g. Career break — caring responsibilities" />
                        </Field>
                      </div>
                      <DatePicker label="From" monthVal={job.startMonth} yearVal={job.startYear} onChangeMonth={v => upJob(job.id, 'startMonth', v)} onChangeYear={v => upJob(job.id, 'startYear', v)} />
                      <DatePicker label="To" monthVal={job.endMonth} yearVal={job.endYear} onChangeMonth={v => upJob(job.id, 'endMonth', v)} onChangeYear={v => upJob(job.id, 'endYear', v)} />
                    </div>
                  ) : (
                    <>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14, marginBottom: 14 }}>
                        <Field label="Job title" required>
                          <Input value={job.title} onChange={e => upJob(job.id, 'title', e.target.value)} placeholder="Senior Software Engineer" />
                        </Field>
                        <Field label="Company" required>
                          <Input value={job.company} onChange={e => upJob(job.id, 'company', e.target.value)} placeholder="Acme Ltd" />
                        </Field>
                        <div style={{ gridColumn: '1/-1' }}>
                          <Field label="Location">
                            <LocationInput value={job.location} onChange={v => upJob(job.id, 'location', v)} placeholder="e.g. London, UK / Remote" />
                          </Field>
                        </div>
                        <DatePicker label="Start date" monthVal={job.startMonth} yearVal={job.startYear} onChangeMonth={v => upJob(job.id, 'startMonth', v)} onChangeYear={v => upJob(job.id, 'startYear', v)} />
                        <DatePicker label="End date" monthVal={job.endMonth} yearVal={job.endYear} onChangeMonth={v => upJob(job.id, 'endMonth', v)} onChangeYear={v => upJob(job.id, 'endYear', v)} disabled={job.current} />
                      </div>

                      <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#6b7280', cursor: 'pointer', marginBottom: 16 }}>
                        <input type="checkbox" checked={job.current} onChange={e => upJob(job.id, 'current', e.target.checked)}
                          style={{ width: 15, height: 15, accentColor: '#16a34a', cursor: 'pointer' }} />
                        Current role
                      </label>

                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#9ca3af' }}>Achievements &amp; responsibilities</div>
                          <button
                            onClick={() => upJob(job.id, 'achievements', [...job.achievements, ''])}
                            style={{ fontSize: 11, fontWeight: 700, color: '#16a34a', background: '#dcfce7', border: '1px solid #bbf7d0', borderRadius: 6, padding: '3px 10px', cursor: 'pointer', fontFamily: 'var(--font-sans)' }}>
                            + Add bullet
                          </button>
                        </div>
                        <p style={{ fontSize: 12, color: '#9ca3af', marginBottom: 10, lineHeight: 1.5 }}>Add all — AI picks the most relevant per job description. Lead with impact. Use numbers.</p>

                        <AnimatePresence initial={false}>
                          {job.achievements.map((a, ai) => (
                            <motion.div key={ai} initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                              <div style={{ flexShrink: 0, width: 20, height: 20, borderRadius: '50%', background: a.trim() && /\d/.test(a) ? '#dcfce7' : '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: a.trim() && /\d/.test(a) ? '#16a34a' : '#9ca3af', marginTop: 9, fontWeight: 700 }}>
                                {ai + 1}
                              </div>
                              <input
                                value={a}
                                onChange={e => upAch(job.id, ai, e.target.value)}
                                placeholder={ai === 0 ? 'e.g. Reduced operational costs by 23% by implementing automated monitoring across 4 sites' : 'Another achievement or responsibility…'}
                                style={{ flex: 1, background: '#f9fafb', border: '1.5px solid #e5e7eb', borderRadius: 10, padding: '9px 13px', fontSize: 13, color: '#111827', outline: 'none', fontFamily: 'var(--font-sans)', transition: 'all 0.15s' }}
                                onFocus={e => { e.target.style.borderColor = '#16a34a'; e.target.style.boxShadow = '0 0 0 3px rgba(22,163,74,0.1)'; e.target.style.background = '#fff' }}
                                onBlur={e => { e.target.style.borderColor = '#e5e7eb'; e.target.style.boxShadow = 'none'; e.target.style.background = '#f9fafb' }}
                              />
                              {job.achievements.length > 1 && (
                                <button onClick={() => upJob(job.id, 'achievements', job.achievements.filter((_, i) => i !== ai))}
                                  style={{ flexShrink: 0, width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: 'none', cursor: 'pointer', color: '#d1d5db', marginTop: 7, borderRadius: 6, fontSize: 16, lineHeight: 1 }}>
                                  ×
                                </button>
                              )}
                            </motion.div>
                          ))}
                        </AnimatePresence>
                      </div>
                    </>
                  )
                )}
              </Card>
            </motion.div>
          )
        })}
      </AnimatePresence>

      {/* Add role button at bottom */}
      <button onClick={addRole}
        style={{ width: '100%', padding: '14px', background: '#fff', border: '1.5px dashed #d1d5db', borderRadius: 14, fontSize: 13, fontWeight: 600, color: '#9ca3af', cursor: 'pointer', transition: 'all 0.15s', fontFamily: 'var(--font-sans)', marginTop: 4 }}
        onMouseEnter={e => { (e.currentTarget).style.borderColor = '#16a34a'; (e.currentTarget).style.color = '#16a34a'; (e.currentTarget).style.background = '#f0fdf4' }}
        onMouseLeave={e => { (e.currentTarget).style.borderColor = '#d1d5db'; (e.currentTarget).style.color = '#9ca3af'; (e.currentTarget).style.background = '#fff' }}>
        + Add another role
      </button>
    </div>
  )
}

// ─── EDUCATION TAB ────────────────────────────────────────────
export function EducationTab() {
  const { profileData, updateEducation } = useApp()
  const { education } = profileData

  const upEdu = (id: string, k: keyof Education, v: any) =>
    updateEducation(education.map(e => e.id === id ? { ...e, [k]: v } : e))

  function addEntry() {
    updateEducation([...education, EMPTY_EDU()])
  }

  return (
    <div>
      <SectionHeader
        eyebrow="Step 3"
        title="Education"
        sub="Degrees, diplomas, and academic qualifications."
        action={<Button size="sm" onClick={addEntry} icon={<Plus size={13} />}>Add education</Button>}
      />

      <AnimatePresence initial={false}>
        {education.map((edu, ei) => (
          <motion.div key={edu.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.2 }} style={{ marginBottom: 12 }}>
            <Card>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#16a34a' }}>Education {ei + 1}</span>
                {education.length > 1 && (
                  <Button variant="danger" size="sm" onClick={() => updateEducation(education.filter(e => e.id !== edu.id))} icon={<Trash2 size={12} />}>Remove</Button>
                )}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
                <Field label="Degree / qualification" required>
                  <Input value={edu.degree} onChange={e => upEdu(edu.id, 'degree', e.target.value)} placeholder="BSc Computer Science" />
                </Field>
                <Field label="Institution" required>
                  <Input value={edu.institution} onChange={e => upEdu(edu.id, 'institution', e.target.value)} placeholder="University of Manchester" />
                </Field>
                <Field label="Grade / classification">
                  <Input value={edu.grade} onChange={e => upEdu(edu.id, 'grade', e.target.value)} placeholder="First Class Honours / 2:1 / Merit" />
                </Field>
                <DatePicker label="Start year" monthVal="" yearVal={edu.startYear} onChangeMonth={() => {}} onChangeYear={v => upEdu(edu.id, 'startYear', v)} />
                <DatePicker label="End year" monthVal="" yearVal={edu.endYear} onChangeMonth={() => {}} onChangeYear={v => upEdu(edu.id, 'endYear', v)} />
              </div>
              <div style={{ marginTop: 14 }}>
                <Field label="Notable modules or achievements" hint="Optional — dissertation, awards, relevant projects">
                  <Textarea value={edu.notes} onChange={e => upEdu(edu.id, 'notes', e.target.value)} placeholder="e.g. Dissertation on distributed systems; awarded departmental prize for outstanding performance" rows={2} />
                </Field>
              </div>
            </Card>
          </motion.div>
        ))}
      </AnimatePresence>

      <button onClick={addEntry}
        style={{ width: '100%', padding: '14px', background: '#fff', border: '1.5px dashed #d1d5db', borderRadius: 14, fontSize: 13, fontWeight: 600, color: '#9ca3af', cursor: 'pointer', transition: 'all 0.15s', fontFamily: 'var(--font-sans)', marginTop: 4 }}
        onMouseEnter={e => { (e.currentTarget).style.borderColor = '#16a34a'; (e.currentTarget).style.color = '#16a34a'; (e.currentTarget).style.background = '#f0fdf4' }}
        onMouseLeave={e => { (e.currentTarget).style.borderColor = '#d1d5db'; (e.currentTarget).style.color = '#9ca3af'; (e.currentTarget).style.background = '#fff' }}>
        + Add another qualification
      </button>
    </div>
  )
}

// ─── QUALIFICATIONS TAB ───────────────────────────────────────
export function QualificationsTab() {
  const { profileData, updateQualifications } = useApp()
  const { qualifications } = profileData

  const upQual = (id: string, k: keyof Qualification, v: any) =>
    updateQualifications(qualifications.map(q => q.id === id ? { ...q, [k]: v } : q))

  function addEntry() {
    updateQualifications([...qualifications, EMPTY_QUAL()])
  }

  return (
    <div>
      <SectionHeader
        eyebrow="Step 4"
        title="Qualifications &amp; memberships"
        sub="Professional certifications, licences, and body memberships."
        action={<Button size="sm" onClick={addEntry} icon={<Plus size={13} />}>Add qualification</Button>}
      />

      <Guidance title="What to include here" items={[
        'Professional memberships: CIMA, CEng, MCIPS, CIPD, CMI, PMP etc.',
        'Regulated licences: SIA, FCA, GDC, NMC, SMCR approved persons',
        'Technical certifications: AWS, Google Cloud, Azure, NEBOSH, IOSH',
        'Keep the body field brief — 1-2 lines about the qualification context',
      ]} />

      <AnimatePresence initial={false}>
        {qualifications.map((qual, qi) => (
          <motion.div key={qual.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.2 }} style={{ marginBottom: 12 }}>
            <Card>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#16a34a' }}>Qualification {qi + 1}</span>
                {qualifications.length > 1 && (
                  <Button variant="danger" size="sm" onClick={() => updateQualifications(qualifications.filter(q => q.id !== qual.id))} icon={<Trash2 size={12} />}>Remove</Button>
                )}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
                <Field label="Title / membership" required>
                  <Input value={qual.title} onChange={e => upQual(qual.id, 'title', e.target.value)} placeholder="Chartered Engineer (CEng)" />
                </Field>
                <Field label="Awarding body">
                  <Input value={qual.issuer} onChange={e => upQual(qual.id, 'issuer', e.target.value)} placeholder="Engineering Council / IChemE" />
                </Field>
                <DatePicker label="Year obtained" monthVal="" yearVal={qual.year} onChangeMonth={() => {}} onChangeYear={v => upQual(qual.id, 'year', v)} />
              </div>
              <div style={{ marginTop: 14 }}>
                <Field label="Additional context" hint="Optional — e.g. scope of licence, specialisation">
                  <Textarea value={qual.body} onChange={e => upQual(qual.id, 'body', e.target.value)} placeholder="e.g. Chartered status in chemical engineering, specialising in process safety and risk assessment" rows={2} />
                </Field>
              </div>
            </Card>
          </motion.div>
        ))}
      </AnimatePresence>

      <button onClick={addEntry}
        style={{ width: '100%', padding: '14px', background: '#fff', border: '1.5px dashed #d1d5db', borderRadius: 14, fontSize: 13, fontWeight: 600, color: '#9ca3af', cursor: 'pointer', transition: 'all 0.15s', fontFamily: 'var(--font-sans)', marginTop: 4 }}
        onMouseEnter={e => { (e.currentTarget).style.borderColor = '#16a34a'; (e.currentTarget).style.color = '#16a34a'; (e.currentTarget).style.background = '#f0fdf4' }}
        onMouseLeave={e => { (e.currentTarget).style.borderColor = '#d1d5db'; (e.currentTarget).style.color = '#9ca3af'; (e.currentTarget).style.background = '#fff' }}>
        + Add another qualification
      </button>
    </div>
  )
}

// ─── SKILLS TAB ───────────────────────────────────────────────
export function SkillsTab() {
  const { profileData, updateSkills, token } = useApp()
  const { skills } = profileData

  const upSkill = (id: string, k: keyof Skill, v: any) =>
    updateSkills(skills.map(s => s.id === id ? { ...s, [k]: v } : s))

  const { complete: strengthenSkills, isLoading: strengthening } = useCompletion({
    api: '/api/generate',
    headers: { Authorization: `Bearer ${token}` },
    onFinish: (_, completion) => {
      try {
        const arr = JSON.parse(completion.replace(/```json|```/g, '').trim())
        const updated = [...skills]
        arr.forEach((item: any) => {
          const s = updated.find(x => x.id === String(item.id))
          if (s) s.context = item.context
        })
        updateSkills(updated)
        toast.success('Skill context added from your experience')
      } catch { toast.error('Could not parse AI response') }
    },
  })

  function addEntry() {
    updateSkills([...skills, EMPTY_SKILL()])
  }

  return (
    <div>
      <SectionHeader
        eyebrow="Step 5"
        title="Skills"
        sub="Group your skills into categories. AI can add evidence from your experience automatically."
        action={
          <div style={{ display: 'flex', gap: 8 }}>
            <Button variant="outline" size="sm" loading={strengthening} onClick={() => strengthenSkills('', { body: { type: 'strengthen_skills', data: profileData } })} icon={<Sparkles size={12} />}>Add context</Button>
            <Button size="sm" onClick={addEntry} icon={<Plus size={13} />}>Add category</Button>
          </div>
        }
      />

      <Guidance title="Skills tips" items={[
        'Group related skills: Technical, Leadership, Languages, Tools etc.',
        'The context field is shown on the CV — 1 sentence of evidence is more compelling than a list',
        'Match keywords from your target job descriptions — ATS scans for exact matches',
        'Use "Add context" to auto-generate evidence from your experience entries above',
      ]} />

      <AnimatePresence initial={false}>
        {skills.map((skill, si) => (
          <motion.div key={skill.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.2 }} style={{ marginBottom: 12 }}>
            <Card>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#16a34a' }}>Category {si + 1}</span>
                {skills.length > 1 && (
                  <Button variant="danger" size="sm" onClick={() => updateSkills(skills.filter(s => s.id !== skill.id))} icon={<Trash2 size={12} />}>Remove</Button>
                )}
              </div>
              <div style={{ display: 'grid', gap: 14 }}>
                <Field label="Category name" required>
                  <Input value={skill.category} onChange={e => upSkill(skill.id, 'category', e.target.value)} placeholder="e.g. Technical, Leadership, Languages, Project Management" />
                </Field>
                <Field label="Skills" hint="Type a skill and press Enter or comma to add">
                  <SkillTagInput tags={skill.tags} onChange={tags => upSkill(skill.id, 'tags', tags)} placeholder="Type a skill and press Enter…" />
                </Field>
                <Field label="Evidence / context" hint="1 sentence showing how you've applied these skills — shown on the CV">
                  <Textarea value={skill.context} onChange={e => upSkill(skill.id, 'context', e.target.value)} placeholder="e.g. Applied across 5 transformation programmes covering 300+ operational staff in regulated environments" rows={2} />
                </Field>
              </div>
            </Card>
          </motion.div>
        ))}
      </AnimatePresence>

      <button onClick={addEntry}
        style={{ width: '100%', padding: '14px', background: '#fff', border: '1.5px dashed #d1d5db', borderRadius: 14, fontSize: 13, fontWeight: 600, color: '#9ca3af', cursor: 'pointer', transition: 'all 0.15s', fontFamily: 'var(--font-sans)', marginTop: 4 }}
        onMouseEnter={e => { (e.currentTarget).style.borderColor = '#16a34a'; (e.currentTarget).style.color = '#16a34a'; (e.currentTarget).style.background = '#f0fdf4' }}
        onMouseLeave={e => { (e.currentTarget).style.borderColor = '#d1d5db'; (e.currentTarget).style.color = '#9ca3af'; (e.currentTarget).style.background = '#fff' }}>
        + Add another skill category
      </button>
    </div>
  )
}

// Re-exports for individual tab files
export { EducationTab as default }
