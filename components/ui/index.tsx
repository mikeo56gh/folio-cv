'use client'
import { forwardRef, useState, useRef, useEffect } from 'react'
import { Loader2, ChevronDown, MapPin } from 'lucide-react'
import { clsx } from 'clsx'

// ─── DESIGN TOKENS (inline for reliability) ──────────────────
const T = {
  green: '#16a34a',
  greenDark: '#15803d',
  greenLight: '#dcfce7',
  greenBorder: '#bbf7d0',
  ink: '#111827',
  inkMid: '#374151',
  inkSoft: '#6b7280',
  inkFaint: '#9ca3af',
  border: '#e5e7eb',
  borderFocus: '#16a34a',
  bg: '#f9fafb',
  surface: '#ffffff',
  amber: '#d97706',
  amberBg: '#fffbeb',
  amberBorder: '#fde68a',
  red: '#dc2626',
  redBg: '#fef2f2',
}

// ─── BUTTON ───────────────────────────────────────────────────
type BtnVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline' | 'amber'
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: BtnVariant
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  icon?: React.ReactNode
  fullWidth?: boolean
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading, icon, children, className, disabled, fullWidth, style, ...props }, ref) => {
    const base: React.CSSProperties = {
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 7,
      fontFamily: 'var(--font-sans)', fontWeight: 600, cursor: disabled || loading ? 'not-allowed' : 'pointer',
      opacity: disabled || loading ? 0.55 : 1, border: 'none', transition: 'all 0.15s',
      whiteSpace: 'nowrap', width: fullWidth ? '100%' : undefined,
    }
    const variants: Record<BtnVariant, React.CSSProperties> = {
      primary:   { background: T.green, color: '#fff', boxShadow: '0 1px 2px rgba(0,0,0,0.08), 0 4px 12px rgba(22,163,74,0.25)' },
      secondary: { background: T.surface, color: T.inkMid, border: `1.5px solid ${T.border}` },
      ghost:     { background: 'transparent', color: T.inkSoft },
      danger:    { background: T.redBg, color: T.red, border: `1.5px solid #fecaca` },
      outline:   { background: 'transparent', color: T.inkSoft, border: `1.5px solid ${T.border}` },
      amber:     { background: T.amberBg, color: T.amber, border: `1.5px solid ${T.amberBorder}` },
    }
    const sizes: Record<string, React.CSSProperties> = {
      sm: { fontSize: 12, padding: '6px 14px', borderRadius: 8 },
      md: { fontSize: 13, padding: '9px 18px', borderRadius: 10 },
      lg: { fontSize: 15, padding: '12px 24px', borderRadius: 12 },
    }
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        style={{ ...base, ...variants[variant], ...sizes[size], ...style }}
        className={className}
        {...props}
      >
        {loading ? <Loader2 size={13} style={{ animation: 'spin 0.7s linear infinite' }} /> : icon}
        {children}
      </button>
    )
  }
)
Button.displayName = 'Button'

// ─── CARD ─────────────────────────────────────────────────────
export function Card({ children, className, accent, style }: {
  children: React.ReactNode
  className?: string
  accent?: 'green' | 'amber' | 'red' | 'blue'
  style?: React.CSSProperties
}) {
  const accentStyles: Record<string, React.CSSProperties> = {
    green: { borderLeft: `3px solid ${T.green}` },
    amber: { borderLeft: `3px solid ${T.amber}` },
    red:   { borderLeft: `3px solid ${T.red}` },
    blue:  { borderLeft: '3px solid #3b82f6' },
  }
  return (
    <div
      style={{
        background: T.surface,
        border: `1px solid ${T.border}`,
        borderRadius: 14,
        padding: '20px 22px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        ...(accent ? accentStyles[accent] : {}),
        ...style,
      }}
      className={className}
    >
      {children}
    </div>
  )
}

// ─── FIELD ────────────────────────────────────────────────────
interface FieldProps {
  label?: string
  hint?: string
  error?: string
  required?: boolean
  children: React.ReactNode
  className?: string
}
export function Field({ label, hint, error, required, children, className }: FieldProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }} className={className}>
      {label && (
        <label style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: T.inkSoft }}>
          {label}{required && <span style={{ color: T.green, marginLeft: 2 }}>*</span>}
        </label>
      )}
      {children}
      {hint && !error && <p style={{ fontSize: 11, color: T.inkFaint, lineHeight: 1.5 }}>{hint}</p>}
      {error && <p style={{ fontSize: 11, color: T.red }}>{error}</p>}
    </div>
  )
}

// ─── INPUT ────────────────────────────────────────────────────
const inputStyle: React.CSSProperties = {
  width: '100%', background: T.bg, border: `1.5px solid ${T.border}`,
  borderRadius: 10, padding: '9px 13px', fontFamily: 'var(--font-sans)',
  fontSize: 14, color: T.ink, outline: 'none', transition: 'all 0.15s',
  boxSizing: 'border-box',
}

export const Input = forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ style, onFocus, onBlur, ...props }, ref) => {
    const [focused, setFocused] = useState(false)
    return (
      <input
        ref={ref}
        style={{
          ...inputStyle,
          borderColor: focused ? T.borderFocus : T.border,
          boxShadow: focused ? `0 0 0 3px rgba(22,163,74,0.1)` : 'none',
          background: focused ? T.surface : T.bg,
          ...style,
        }}
        onFocus={e => { setFocused(true); onFocus?.(e) }}
        onBlur={e => { setFocused(false); onBlur?.(e) }}
        {...props}
      />
    )
  }
)
Input.displayName = 'Input'

// ─── TEXTAREA ─────────────────────────────────────────────────
export const Textarea = forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ style, onFocus, onBlur, ...props }, ref) => {
    const [focused, setFocused] = useState(false)
    return (
      <textarea
        ref={ref}
        style={{
          ...inputStyle, resize: 'vertical', lineHeight: 1.6, minHeight: 90,
          borderColor: focused ? T.borderFocus : T.border,
          boxShadow: focused ? `0 0 0 3px rgba(22,163,74,0.1)` : 'none',
          background: focused ? T.surface : T.bg,
          ...style,
        }}
        onFocus={e => { setFocused(true); onFocus?.(e) }}
        onBlur={e => { setFocused(false); onBlur?.(e) }}
        {...props}
      />
    )
  }
)
Textarea.displayName = 'Textarea'

// ─── LOCATION AUTOCOMPLETE ─────────────────────────────────────
const UK_LOCATIONS = [
  'London', 'Manchester', 'Birmingham', 'Leeds', 'Glasgow', 'Liverpool', 'Edinburgh',
  'Bristol', 'Sheffield', 'Cambridge', 'Oxford', 'Nottingham', 'Leicester', 'Coventry',
  'Hull, East Riding Of Yorkshire', 'Hull', 'Reading', 'Brighton', 'Southampton',
  'Portsmouth', 'Cardiff', 'Belfast', 'Newcastle', 'Exeter', 'Norwich', 'York',
  'Dundee', 'Aberdeen', 'Derby', 'Wolverhampton', 'Stoke-on-Trent', 'Plymouth',
  'Sunderland', 'Bolton', 'Bournemouth', 'Middlesbrough', 'Huddersfield', 'Swansea',
  'Ipswich', 'Luton', 'Milton Keynes', 'Northampton', 'Preston', 'Wakefield',
  'Bradford', 'Blackpool', 'Lancaster', 'Carlisle', 'Darlington', 'Durham',
  'Gateshead', 'Grimsby', 'Lincoln', 'Peterborough', 'Chelmsford', 'Colchester',
  'Watford', 'Slough', 'Guildford', 'Woking', 'Crawley', 'Canterbury', 'Maidstone',
  'Bath', 'Swindon', 'Gloucester', 'Cheltenham', 'Worcester', 'Shrewsbury', 'Telford',
  'Remote', 'Remote, UK', 'Hybrid', 'London, UK', 'Manchester, UK', 'Leeds, UK',
]

interface LocationInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  value: string
  onChange: (v: string) => void
}

export function LocationInput({ value, onChange, placeholder, ...props }: LocationInputProps) {
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [open, setOpen] = useState(false)
  const [hi, setHi] = useState(-1)
  const debounce = useRef<NodeJS.Timeout>()
  const wrap = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => { if (wrap.current && !wrap.current.contains(e.target as Node)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  function onInput(val: string) {
    onChange(val)
    setHi(-1)
    clearTimeout(debounce.current)
    if (val.length < 2) { setSuggestions([]); setOpen(false); return }
    debounce.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/jobs/locations?q=${encodeURIComponent(val)}&country=gb`)
        const data = await res.json()
        const list = (data.locations || []).length > 0 ? data.locations : UK_LOCATIONS.filter(l => l.toLowerCase().includes(val.toLowerCase())).slice(0, 8)
        setSuggestions(list)
        setOpen(list.length > 0)
      } catch {
        const fallback = UK_LOCATIONS.filter(l => l.toLowerCase().includes(val.toLowerCase())).slice(0, 8)
        setSuggestions(fallback)
        setOpen(fallback.length > 0)
      }
    }, 200)
  }

  function pick(loc: string) { onChange(loc); setSuggestions([]); setOpen(false) }

  function onKey(e: React.KeyboardEvent) {
    if (!open) return
    if (e.key === 'ArrowDown') { e.preventDefault(); setHi(h => Math.min(h + 1, suggestions.length - 1)) }
    if (e.key === 'ArrowUp')   { e.preventDefault(); setHi(h => Math.max(h - 1, -1)) }
    if (e.key === 'Enter' && hi >= 0) { e.preventDefault(); pick(suggestions[hi]) }
    if (e.key === 'Escape') setOpen(false)
  }

  const [focused, setFocused] = useState(false)

  return (
    <div ref={wrap} style={{ position: 'relative' }}>
      <div style={{ position: 'relative' }}>
        <MapPin size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: T.inkFaint, pointerEvents: 'none' }} />
        <input
          value={value}
          onChange={e => onInput(e.target.value)}
          onKeyDown={onKey}
          onFocus={() => { setFocused(true); if (suggestions.length > 0) setOpen(true) }}
          onBlur={() => setFocused(false)}
          placeholder={placeholder || 'e.g. London, UK'}
          style={{
            ...inputStyle, paddingLeft: 34,
            borderColor: focused ? T.borderFocus : T.border,
            boxShadow: focused ? `0 0 0 3px rgba(22,163,74,0.1)` : 'none',
            background: focused ? T.surface : T.bg,
          }}
          {...props}
        />
      </div>
      {open && suggestions.length > 0 && (
        <div style={{ position: 'absolute', zIndex: 100, left: 0, right: 0, top: '100%', marginTop: 4, background: T.surface, border: `1.5px solid ${T.border}`, borderRadius: 12, boxShadow: '0 8px 32px rgba(0,0,0,0.12)', overflow: 'hidden' }}>
          {suggestions.map((s, i) => (
            <button key={s} type="button" onMouseDown={() => pick(s)}
              style={{ width: '100%', textAlign: 'left', display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', fontSize: 13, background: i === hi ? T.greenLight : 'transparent', color: i === hi ? T.greenDark : T.inkMid, border: 'none', cursor: 'pointer', transition: 'background 0.1s' }}>
              <MapPin size={11} style={{ color: T.inkFaint, flexShrink: 0 }} />
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── DATE PICKER ──────────────────────────────────────────────
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
const YEARS = Array.from({ length: 40 }, (_, i) => String(new Date().getFullYear() - i))

interface DatePickerProps {
  label?: string
  monthVal: string
  yearVal: string
  onChangeMonth: (v: string) => void
  onChangeYear: (v: string) => void
  disabled?: boolean
}

const selectStyle: React.CSSProperties = {
  ...inputStyle, appearance: 'none', paddingRight: 28, flex: 1,
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%239ca3af' strokeWidth='1.5' fill='none' strokeLinecap='round'/%3E%3C/svg%3E")`,
  backgroundRepeat: 'no-repeat', backgroundPosition: 'right 10px center',
}

export function DatePicker({ label, monthVal, yearVal, onChangeMonth, onChangeYear, disabled }: DatePickerProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      {label && <label style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: T.inkSoft }}>{label}</label>}
      <div style={{ display: 'flex', gap: 6 }}>
        <select value={monthVal} onChange={e => onChangeMonth(e.target.value)} disabled={disabled} style={{ ...selectStyle, opacity: disabled ? 0.4 : 1 }}>
          <option value="">Month</option>
          {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
        </select>
        <select value={yearVal} onChange={e => onChangeYear(e.target.value)} disabled={disabled} style={{ ...selectStyle, opacity: disabled ? 0.4 : 1 }}>
          <option value="">Year</option>
          {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>
    </div>
  )
}

// ─── SECTION HEADER ──────────────────────────────────────────
export function SectionHeader({ title, sub, eyebrow, action }: { title: string; sub?: string; eyebrow?: string; action?: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 20 }}>
      <div>
        {eyebrow && <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.14em', textTransform: 'uppercase', color: T.green, marginBottom: 4 }}>{eyebrow}</div>}
        <h2 style={{ fontSize: 20, fontWeight: 800, color: T.ink, letterSpacing: '-0.02em', marginBottom: sub ? 3 : 0, fontFamily: 'var(--font-sans)' }}>{title}</h2>
        {sub && <p style={{ fontSize: 13, color: T.inkSoft, lineHeight: 1.5 }}>{sub}</p>}
      </div>
      {action && <div style={{ flexShrink: 0, display: 'flex', gap: 8, alignItems: 'center' }}>{action}</div>}
    </div>
  )
}

// ─── COMPLETENESS BAR ─────────────────────────────────────────
export function CompletenessBar({ checks }: { checks: { label: string; ok: boolean }[] }) {
  const done = checks.filter(c => c.ok).length
  const pct = Math.round((done / checks.length) * 100)
  const color = pct === 100 ? T.green : pct >= 60 ? '#f59e0b' : '#ef4444'

  return (
    <div style={{ background: T.bg, border: `1px solid ${T.border}`, borderRadius: 12, padding: '14px 18px', marginBottom: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: T.inkMid }}>Profile completeness</span>
        <span style={{ fontSize: 13, fontWeight: 800, color, fontFamily: 'var(--font-sans)' }}>{pct}%</span>
      </div>
      <div style={{ height: 6, background: T.border, borderRadius: 99, marginBottom: 12, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 99, transition: 'width 0.5s ease' }} />
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 12px' }}>
        {checks.map(c => (
          <span key={c.label} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: c.ok ? T.green : T.inkFaint, fontWeight: c.ok ? 600 : 400 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: c.ok ? T.green : T.border, display: 'inline-block', flexShrink: 0 }} />
            {c.label}
          </span>
        ))}
      </div>
    </div>
  )
}

// ─── GUIDANCE ─────────────────────────────────────────────────
export function Guidance({ title, items }: { title: string; items: (string | React.ReactNode)[] }) {
  return (
    <div style={{ background: '#f0fdf4', border: `1px solid ${T.greenBorder}`, borderRadius: 12, padding: '14px 18px', marginBottom: 20 }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: T.greenDark, marginBottom: 8 }}>{title}</div>
      <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 5 }}>
        {items.map((item, i) => (
          <li key={i} style={{ fontSize: 12, color: '#166534', lineHeight: 1.55, display: 'flex', gap: 8 }}>
            <span style={{ flexShrink: 0, marginTop: 2 }}>→</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

// ─── TIP ──────────────────────────────────────────────────────
export function Tip({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ background: T.amberBg, border: `1px solid ${T.amberBorder}`, borderRadius: 10, padding: '10px 14px', marginBottom: 12, fontSize: 12, color: '#92400e', lineHeight: 1.55 }}>
      💡 {children}
    </div>
  )
}

// ─── SKILL TAG INPUT ──────────────────────────────────────────
export function SkillTagInput({ tags, onChange, placeholder }: { tags: string[]; onChange: (t: string[]) => void; placeholder?: string }) {
  const [input, setInput] = useState('')
  const ref = useRef<HTMLInputElement>(null)

  function add(val: string) {
    const v = val.trim()
    if (v && !tags.includes(v)) onChange([...tags, v])
    setInput('')
  }

  function onKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); add(input) }
    if (e.key === 'Backspace' && !input && tags.length) onChange(tags.slice(0, -1))
  }

  return (
    <div
      style={{ ...inputStyle, minHeight: 42, display: 'flex', flexWrap: 'wrap', gap: 6, padding: '7px 10px', cursor: 'text', alignItems: 'center' }}
      onClick={() => ref.current?.focus()}
    >
      {tags.map(t => (
        <span key={t} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: T.greenLight, color: T.greenDark, border: `1px solid ${T.greenBorder}`, borderRadius: 6, padding: '2px 8px', fontSize: 12, fontWeight: 600 }}>
          {t}
          <button type="button" onClick={() => onChange(tags.filter(x => x !== t))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: T.green, fontSize: 14, lineHeight: 1, padding: 0 }}>×</button>
        </span>
      ))}
      <input
        ref={ref}
        value={input}
        onChange={e => setInput(e.target.value)}
        onKeyDown={onKey}
        onBlur={() => input.trim() && add(input)}
        placeholder={tags.length === 0 ? (placeholder || 'Type and press Enter…') : ''}
        style={{ border: 'none', outline: 'none', background: 'transparent', fontSize: 13, color: T.ink, minWidth: 120, flex: 1 }}
      />
    </div>
  )
}

// ─── BADGE ────────────────────────────────────────────────────
export function Badge({ children, variant = 'gray' }: { children: React.ReactNode; variant?: 'green' | 'amber' | 'red' | 'gray' | 'blue' }) {
  const styles: Record<string, React.CSSProperties> = {
    green: { background: T.greenLight, color: T.greenDark, border: `1px solid ${T.greenBorder}` },
    amber: { background: T.amberBg, color: T.amber, border: `1px solid ${T.amberBorder}` },
    red:   { background: T.redBg, color: T.red, border: '1px solid #fecaca' },
    gray:  { background: T.bg, color: T.inkSoft, border: `1px solid ${T.border}` },
    blue:  { background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe' },
  }
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 10px', borderRadius: 99, fontSize: 11, fontWeight: 700, letterSpacing: '0.02em', ...styles[variant] }}>
      {children}
    </span>
  )
}

// ─── SPIN KEYFRAME (inject once) ──────────────────────────────
if (typeof document !== 'undefined') {
  const id = 'folio-spin'
  if (!document.getElementById(id)) {
    const s = document.createElement('style')
    s.id = id
    s.textContent = '@keyframes spin{to{transform:rotate(360deg)}}'
    document.head.appendChild(s)
  }
}
