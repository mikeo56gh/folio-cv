'use client'
import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { authClient } from '@/lib/auth/client'
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
              <div key={plan.key} style={{ border: '1.5px solid #e5e7eb', borderRadius: 14, padding: 16, display: 'flex', flexDirection: 'column' }}>
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
          <button onClick={() => setUpgradeMsg(null)} style={{ display: 'block', width: '100%', textAlign: 'center', fontSize: 13, color
