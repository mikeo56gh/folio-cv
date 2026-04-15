'use client'
import { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { toast } from 'sonner'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// ─── TYPES ────────────────────────────────────────────────────
export interface Job {
  id: string; title: string; company: string; location: string
  startMonth: string; startYear: string; endMonth: string; endYear: string
  current: boolean; isGap: boolean; gapReason: string; achievements: string[]
}
export interface Education {
  id: string; degree: string; institution: string; location: string
  startMonth: string; startYear: string; endMonth: string; endYear: string
  grade: string; notes: string
}
export interface Qualification {
  id: string; title: string; body: string; reference: string
  achievedMonth: string; achievedYear: string; expiry: string; notes: string
}
export interface Skill { id: string; category: string; tags: string[]; context: string }
export interface Profile {
  name: string; email: string; phone: string; location: string
  linkedin: string; github: string; website: string; seniority: string
}
export interface ProfileData { profile: Profile; jobs: Job[]; education: Education[]; qualifications: Qualification[]; skills: Skill[] }

export type GenerateType = 'cv' | 'cl' | 'review' | 'interview' | 'flags' | 'keywords' | 'company_research' | 'strengthen_skills' | 'strengthen_ach'

const uid = () => Math.random().toString(36).slice(2)

const EMPTY_JOB = (): Job => ({ id: uid(), title: '', company: '', location: '', startMonth: '', startYear: '', endMonth: '', endYear: '', current: false, isGap: false, gapReason: '', achievements: [''] })
const EMPTY_EDU = (): Education => ({ id: uid(), degree: '', institution: '', location: '', startMonth: '', startYear: '', endMonth: '', endYear: '', grade: '', notes: '' })
const EMPTY_QUAL = (): Qualification => ({ id: uid(), title: '', body: '', reference: '', achievedMonth: '', achievedYear: '', expiry: '', notes: '' })
const EMPTY_SKILL = (): Skill => ({ id: uid(), category: '', tags: [], context: '' })
const EMPTY_PROFILE = (): ProfileData => ({ profile: { name: '', email: '', phone: '', location: '', linkedin: '', github: '', website: '', seniority: 'mid' }, jobs: [EMPTY_JOB()], education: [EMPTY_EDU()], qualifications: [EMPTY_QUAL()], skills: [EMPTY_SKILL()] })

// ─── CONTEXT ──────────────────────────────────────────────────
interface AppCtx {
  session: any; userInfo: any
  profiles: any[]; currentProfileId: string | null
  profileData: ProfileData
  versions: any[]; tracker: any
  jdText: string; setJdText: (v: string) => void
  jdUrl: string; setJdUrl: (v: string) => void
  tone: string; setTone: (v: string) => void
  sector: string; setSector: (v: string) => void
  customSectors: string[]; setCustomSectors: (v: string[]) => void
  companyBrief: string; setCompanyBrief: (v: string) => void
  outputs: Record<string, string>; setOutput: (type: string, val: string) => void
  token: string
  upgradeMsg: string | null; setUpgradeMsg: (v: string | null) => void
  updateProfile: (k: string, v: string) => void
  updateJobs: (jobs: Job[]) => void
  updateEducation: (edu: Education[]) => void
  updateQualifications: (quals: Qualification[]) => void
  updateSkills: (skills: Skill[]) => void
  switchProfile: (id: string) => Promise<void>
  newProfile: () => Promise<void>
  saveVersion: () => Promise<void>
  loadVersions: () => Promise<void>
  updateTracker: (t: any) => void
  signOut: () => Promise<void>
  checkout: (plan: string) => Promise<void>
}

const Ctx = createContext<AppCtx | null>(null)
export const useApp = () => useContext(Ctx)!

// ─── PROVIDER ─────────────────────────────────────────────────
export function AppProvider({ children, session }: { children: React.ReactNode, session: any }) {
  const [userInfo, setUserInfo] = useState<any>(null)
  const [profiles, setProfiles] = useState<any[]>([])
  const [currentProfileId, setCurrentProfileId] = useState<string | null>(null)
  const [profileData, setProfileData] = useState<ProfileData>(EMPTY_PROFILE())
  const [versions, setVersions] = useState<any[]>([])
  const [tracker, setTrackerState] = useState<any>({ applied: [], interview: [], offer: [], rejected: [] })
  const [jdText, setJdText] = useState('')
  const [jdUrl, setJdUrl] = useState('')
  const [tone, setTone] = useState('professional')
  const [sector, setSector] = useState('general')
  const [customSectors, setCustomSectors] = useState<string[]>([])
  const [companyBrief, setCompanyBrief] = useState('')
  const [outputs, setOutputs] = useState<Record<string, string>>({})
  const [upgradeMsg, setUpgradeMsg] = useState<string | null>(null)
  const saveTimer = useRef<NodeJS.Timeout>()

  const token = session?.access_token || ''

  const apiFetch = useCallback(async (path: string, body?: any, method = 'GET') => {
    const res = await fetch(path, {
      method: body ? 'POST' : method,
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      ...(body ? { body: JSON.stringify(body) } : {}),
    })
    const data = await res.json()
    if (!res.ok) {
      if (data.upgrade) setUpgradeMsg(data.error)
      throw new Error(data.error || `HTTP ${res.status}`)
    }
    return data
  }, [token])

  // Load on mount
  useEffect(() => {
    if (!session) return
    apiFetch('/api/user/me').then(setUserInfo).catch(console.error)
    apiFetch('/api/profiles').then(({ profiles: ps }) => {
      setProfiles(ps)
      const def = ps.find((p: any) => p.is_default) || ps[0]
      if (def) { setCurrentProfileId(def.id); loadProfileData(def.id) }
    }).catch(console.error)
    apiFetch('/api/versions').then(({ versions: vs }) => setVersions(vs)).catch(console.error)
    // Load tracker from localStorage as fallback
    try { const t = localStorage.getItem('folio_tracker'); if (t) setTrackerState(JSON.parse(t)) } catch {}
    try { const cs = localStorage.getItem('folio_custom_sectors'); if (cs) setCustomSectors(JSON.parse(cs)) } catch {}
  }, [session])

  async function loadProfileData(id: string) {
    try {
      const { profile } = await apiFetch(`/api/profiles/${id}`)
      if (profile?.profile_data && Object.keys(profile.profile_data).length) {
        setProfileData(profile.profile_data)
      }
    } catch {}
  }

  function queueSave(data: ProfileData) {
    setProfileData(data)
    clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(async () => {
      if (!currentProfileId) return
      try { await fetch(`/api/profiles/${currentProfileId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ profile_data: data }) }) }
      catch {}
    }, 1200)
  }

  const updateProfile = (k: string, v: string) => queueSave({ ...profileData, profile: { ...profileData.profile, [k]: v } })
  const updateJobs = (jobs: Job[]) => queueSave({ ...profileData, jobs })
  const updateEducation = (education: Education[]) => queueSave({ ...profileData, education })
  const updateQualifications = (qualifications: Qualification[]) => queueSave({ ...profileData, qualifications })
  const updateSkills = (skills: Skill[]) => queueSave({ ...profileData, skills })
  const setOutput = (type: string, val: string) => setOutputs(prev => ({ ...prev, [type]: val }))

  async function switchProfile(id: string) {
    if (currentProfileId) {
      try { await fetch(`/api/profiles/${currentProfileId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ profile_data: profileData }) }) } catch {}
    }
    setCurrentProfileId(id)
    await loadProfileData(id)
  }

  async function newProfile() {
    const name = prompt('Profile name (e.g. "Technical Lead", "Product Manager"):')
    if (!name) return
    try {
      const { profile } = await apiFetch('/api/profiles', { name })
      setProfiles(ps => [...ps, profile])
      await switchProfile(profile.id)
    } catch (e: any) { toast.error(e.message) }
  }

  async function saveVersion() {
    if (!outputs.cv && !outputs.cl) { toast.error('Generate a CV first, then save.'); return }
    const name = prompt('Name this version (e.g. "Stripe PM April 2026"):')
    if (!name) return
    try {
      let fitScore = null
      if (outputs.review) { try { fitScore = JSON.parse(outputs.review)?.fitScore } catch {} }
      let companyName = null
      if (companyBrief) { try { companyName = JSON.parse(companyBrief)?.name } catch {} }
      await apiFetch('/api/versions', { name, cv_text: outputs.cv, cover_letter: outputs.cl, jd_snippet: jdText.substring(0, 500), company_name: companyName, fit_score: fitScore, profile_id: currentProfileId })
      await loadVersions()
      toast.success('Version saved!')
    } catch (e: any) { toast.error(e.message) }
  }

  async function loadVersions() {
    try { const { versions: vs } = await apiFetch('/api/versions'); setVersions(vs) } catch {}
  }

  function updateTracker(t: any) {
    setTrackerState(t)
    try { localStorage.setItem('folio_tracker', JSON.stringify(t)) } catch {}
  }

  async function signOut() {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  async function checkout(plan: string) {
    try {
      const { url } = await apiFetch('/api/stripe/checkout', { plan })
      window.location.href = url
    } catch (e: any) { toast.error(e.message) }
  }

  return (
    <Ctx.Provider value={{
      session, userInfo, profiles, currentProfileId, profileData, versions, tracker,
      jdText, setJdText, jdUrl, setJdUrl, tone, setTone, sector, setSector,
      customSectors, setCustomSectors: (cs) => { setCustomSectors(cs); localStorage.setItem('folio_custom_sectors', JSON.stringify(cs)) },
      companyBrief, setCompanyBrief, outputs, setOutput, token,
      upgradeMsg, setUpgradeMsg,
      updateProfile, updateJobs, updateEducation, updateQualifications, updateSkills,
      switchProfile, newProfile, saveVersion, loadVersions, updateTracker, signOut, checkout,
    }}>
      {children}
    </Ctx.Provider>
  )
}

// ─── HELPERS ──────────────────────────────────────────────────
export { uid, EMPTY_JOB, EMPTY_EDU, EMPTY_QUAL, EMPTY_SKILL, EMPTY_PROFILE }

export const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']
export const MS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

export function fmtDate(m: string, y: string, cur: boolean) {
  if (cur) return 'Present'
  if (!m && !y) return ''
  const mi = MONTHS.indexOf(m)
  return mi >= 0 ? `${MS[mi]} ${y || ''}` : y || ''
}

export const SENIORITY = [
  { key: 'junior',    label: 'Junior / Graduate', desc: '0–3 yrs' },
  { key: 'mid',       label: 'Mid-level',          desc: '3–7 yrs' },
  { key: 'senior',    label: 'Senior / Lead',      desc: '7+ yrs' },
  { key: 'manager',   label: 'Manager',            desc: 'Team lead' },
  { key: 'director',  label: 'Director / VP',      desc: 'Strategy & P&L' },
  { key: 'executive', label: 'C-Suite',            desc: 'Org-wide vision' },
]

export const TONES = [
  { key: 'professional', label: 'Professional' },
  { key: 'formal',       label: 'Formal' },
  { key: 'conversational', label: 'Conversational' },
  { key: 'direct',      label: 'Direct & bold' },
  { key: 'academic',    label: 'Academic' },
]

export const SECTORS = [
  { key: 'general',     label: 'General' },
  { key: 'tech',        label: 'Technology' },
  { key: 'finance',     label: 'Finance & Banking' },
  { key: 'legal',       label: 'Legal' },
  { key: 'marketing',   label: 'Marketing' },
  { key: 'healthcare',  label: 'Healthcare' },
  { key: 'consulting',  label: 'Consulting' },
  { key: 'creative',    label: 'Creative' },
  { key: 'public',      label: 'Public Sector' },
  { key: 'engineering', label: 'Engineering' },
]
