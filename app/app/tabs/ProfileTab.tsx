'use client'
import { useState } from 'react'
import { useApp, SENIORITY } from '../context'
import { Card, Field, Input, LocationInput, SectionHeader, Guidance } from '../../../components/ui'

export function ProfileTab() {
  const { profileData, updateProfile } = useApp()
  const [showOptional, setShowOptional] = useState(false)
  const { profile: prof } = profileData


  return (
    <div>
      <SectionHeader eyebrow="Step 1" title="Personal profile" sub="Your contact details and career level. Used on every CV and cover letter." />
      <Card style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#9ca3af', marginBottom: 16 }}>Contact details</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
          <Field label="Full name" required>
            <Input value={prof.name} onChange={e => updateProfile('name', e.target.value)} placeholder="Jane Smith" />
          </Field>
          <Field label="Email address" required>
            <Input type="email" value={prof.email} onChange={e => updateProfile('email', e.target.value)} placeholder="jane@email.com" />
          </Field>
          <Field label="Phone number">
            <Input value={prof.phone} onChange={e => updateProfile('phone', e.target.value)} placeholder="+44 7700 000000" />
          </Field>
          <Field label="Location" hint="City and country — shown on CV">
            <LocationInput value={prof.location} onChange={v => updateProfile('location', v)} placeholder="e.g. London, UK" />
          </Field>
          <div style={{ gridColumn: '1 / -1' }}>
            <Field label="LinkedIn URL">
              <Input value={prof.linkedin} onChange={e => updateProfile('linkedin', e.target.value)} placeholder="https://linkedin.com/in/yourname" />
            </Field>
          </div>
          {(prof.github || prof.website || showOptional) ? (
            <>
              <Field label="GitHub" hint="Optional — only include if it has recent, quality work">
                <Input value={prof.github} onChange={e => updateProfile('github', e.target.value)} placeholder="https://github.com/yourname" />
              </Field>
              <Field label="Portfolio / website" hint="Optional">
                <Input value={prof.website} onChange={e => updateProfile('website', e.target.value)} placeholder="https://yoursite.com" />
              </Field>
            </>
          ) : (
            <div style={{ gridColumn: '1/-1' }}>
              <button type="button" onClick={() => setShowOptional(true)}
                style={{ fontSize: 12, color: '#16a34a', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-sans)', fontWeight: 600, padding: 0 }}>
                + Add GitHub or portfolio URL (optional)
              </button>
            </div>
          )}
        </div>
      </Card>

      <Card style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#9ca3af' }}>Career level</div>
          <span style={{ fontSize: 10, fontWeight: 700, background: '#fffbeb', color: '#d97706', border: '1px solid #fde68a', borderRadius: 99, padding: '3px 10px', letterSpacing: '0.04em' }}>SHAPES AI TONE</span>
        </div>
        <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 14, lineHeight: 1.55 }}>
          Select your current or target level. The AI calibrates tone, language, and emphasis to your career stage.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 10 }}>
          {SENIORITY.map(sen => (
            <button
              key={sen.key}
              type="button"
              onClick={() => updateProfile('seniority', sen.key)}
              style={{
                textAlign: 'left', padding: '12px 14px', borderRadius: 12, border: '1.5px solid',
                cursor: 'pointer', transition: 'all 0.15s', fontFamily: 'var(--font-sans)',
                borderColor: prof.seniority === sen.key ? '#16a34a' : '#e5e7eb',
                background: prof.seniority === sen.key ? '#dcfce7' : '#fff',
              }}
            >
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 2, color: prof.seniority === sen.key ? '#15803d' : '#111827' }}>{sen.label}</div>
              <div style={{ fontSize: 11, color: '#9ca3af', lineHeight: 1.4 }}>{sen.desc}</div>
            </button>
          ))}
        </div>
      </Card>

      <Guidance title="Profile tips" items={[
        'Use a professional email — avoid nicknames or old university addresses',
        'Customise your LinkedIn URL: linkedin.com/in/yourname (Settings → Edit public profile URL)',
        'Location: city and country only — no full address needed',
        'Only include GitHub/portfolio if they contain recent, quality work',
      ]} />
    </div>
  )
}
