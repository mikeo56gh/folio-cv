'use client'
import { forwardRef } from 'react'
import { motion } from 'framer-motion'
import { Loader2 } from 'lucide-react'
import { clsx } from 'clsx'

// ─── BUTTON ───────────────────────────────────────────────────
type BtnVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline' | 'amber'
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: BtnVariant
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  icon?: React.ReactNode
}
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading, icon, children, className, disabled, ...props }, ref) => {
    const base = 'inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed'
    const variants: Record<BtnVariant, string> = {
      primary:   'bg-forest-500 text-white hover:bg-forest-600 shadow-sm hover:shadow-md active:scale-[0.98]',
      secondary: 'bg-white text-forest-700 border border-forest-300 hover:bg-forest-50 hover:border-forest-400',
      ghost:     'bg-transparent text-gray-600 hover:bg-parchment-200 hover:text-gray-900',
      danger:    'bg-red-50 text-red-700 border border-red-200 hover:bg-red-100',
      outline:   'bg-transparent border border-parchment-400 text-gray-600 hover:border-parchment-500 hover:text-gray-800',
      amber:     'bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100',
    }
    const sizes = { sm: 'text-xs px-3 py-1.5', md: 'text-sm px-4 py-2.5', lg: 'text-sm px-6 py-3.5' }
    return (
      <button ref={ref} disabled={disabled || loading} className={clsx(base, variants[variant], sizes[size], className)} {...props}>
        {loading ? <Loader2 size={14} className="animate-spin" /> : icon}
        {children}
      </button>
    )
  }
)
Button.displayName = 'Button'

// ─── CARD ─────────────────────────────────────────────────────
export function Card({ children, className, accent }: { children: React.ReactNode, className?: string, accent?: 'green' | 'amber' | 'red' | 'blue' }) {
  const accents = { green: 'border-l-4 border-l-forest-400', amber: 'border-l-4 border-l-amber-400', red: 'border-l-4 border-l-red-400', blue: 'border-l-4 border-l-blue-400' }
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={clsx('bg-white rounded-2xl border border-parchment-300 shadow-card p-5', accent && accents[accent], className)}
    >
      {children}
    </motion.div>
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
    <div className={clsx('flex flex-col gap-1.5', className)}>
      {label && (
        <label className="text-[11px] font-semibold tracking-wide text-gray-500 uppercase">
          {label}{required && <span className="text-forest-500 ml-0.5">*</span>}
        </label>
      )}
      {children}
      {hint && !error && <p className="text-xs text-gray-400">{hint}</p>}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}

// ─── INPUT ────────────────────────────────────────────────────
export const Input = forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={clsx(
        'w-full bg-parchment-100 border border-parchment-300 rounded-lg px-3 py-2.5 text-sm text-gray-900',
        'placeholder:text-gray-400 outline-none',
        'focus:ring-2 focus:ring-forest-400/30 focus:border-forest-400 focus:bg-white',
        'transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed',
        className
      )}
      {...props}
    />
  )
)
Input.displayName = 'Input'

// ─── TEXTAREA ─────────────────────────────────────────────────
export const Textarea = forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={clsx(
        'w-full bg-parchment-100 border border-parchment-300 rounded-lg px-3 py-2.5 text-sm text-gray-900',
        'placeholder:text-gray-400 outline-none resize-vertical leading-relaxed',
        'focus:ring-2 focus:ring-forest-400/30 focus:border-forest-400 focus:bg-white',
        'transition-all duration-200',
        className
      )}
      {...props}
    />
  )
)
Textarea.displayName = 'Textarea'

// ─── SELECT ───────────────────────────────────────────────────
export const Select = forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className, children, ...props }, ref) => (
    <select
      ref={ref}
      className={clsx(
        'w-full bg-parchment-100 border border-parchment-300 rounded-lg px-3 py-2.5 text-sm text-gray-900',
        'outline-none cursor-pointer appearance-none',
        'focus:ring-2 focus:ring-forest-400/30 focus:border-forest-400 focus:bg-white',
        'transition-all duration-200',
        className
      )}
      style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='11' height='7' viewBox='0 0 11 7'%3E%3Cpath d='M1 1l4.5 4.5L10 1' stroke='%239c9b94' stroke-width='1.4' fill='none' stroke-linecap='round'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center', paddingRight: '32px' }}
      {...props}
    >
      {children}
    </select>
  )
)
Select.displayName = 'Select'

// ─── DATE PICKER ──────────────────────────────────────────────
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']
interface DatePickerProps {
  label?: string
  monthVal: string
  yearVal: string
  onChangeMonth: (v: string) => void
  onChangeYear: (v: string) => void
  disabled?: boolean
  className?: string
}
export function DatePicker({ label, monthVal, yearVal, onChangeMonth, onChangeYear, disabled, className }: DatePickerProps) {
  const now = new Date().getFullYear()
  const years = Array.from({ length: now - 1959 }, (_, i) => now - i)
  return (
    <Field label={label} className={className}>
      <div className="flex gap-2">
        <Select value={monthVal} onChange={e => onChangeMonth(e.target.value)} disabled={disabled} className="flex-[1.6]">
          <option value="">Month</option>
          {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
        </Select>
        <Select value={yearVal} onChange={e => onChangeYear(e.target.value)} disabled={disabled} className="flex-1">
          <option value="">Year</option>
          {years.map(y => <option key={y} value={y}>{y}</option>)}
        </Select>
      </div>
    </Field>
  )
}

// ─── BADGE ────────────────────────────────────────────────────
type BadgeVariant = 'green' | 'amber' | 'red' | 'blue' | 'gray'
export function Badge({ children, variant = 'gray' }: { children: React.ReactNode, variant?: BadgeVariant }) {
  const vs: Record<BadgeVariant, string> = {
    green: 'bg-forest-50 text-forest-700 border-forest-200',
    amber: 'bg-amber-50 text-amber-700 border-amber-200',
    red:   'bg-red-50 text-red-700 border-red-200',
    blue:  'bg-blue-50 text-blue-700 border-blue-200',
    gray:  'bg-parchment-200 text-gray-600 border-parchment-300',
  }
  return <span className={clsx('inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold border', vs[variant])}>{children}</span>
}

// ─── CHIP (tone/sector selector) ─────────────────────────────
export function Chip({ label, active, onClick, dashed, onRemove }: { label: string, active: boolean, onClick: () => void, dashed?: boolean, onRemove?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={clsx(
        'inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-150',
        dashed ? 'border-dashed border-parchment-400 text-gray-400 hover:border-forest-300 hover:text-forest-600' : '',
        active && !dashed ? 'bg-forest-50 border-forest-300 text-forest-700' : !dashed ? 'bg-white border-parchment-300 text-gray-500 hover:border-forest-200 hover:text-forest-600' : '',
      )}
    >
      {label}
      {onRemove && (
        <span onClick={e => { e.stopPropagation(); onRemove() }} className="ml-0.5 opacity-50 hover:opacity-100">×</span>
      )}
    </button>
  )
}

// ─── SKILL TAG INPUT ──────────────────────────────────────────
interface SkillTagInputProps {
  tags: string[]
  onAdd: (tag: string) => void
  onRemove: (i: number) => void
  placeholder?: string
}
export function SkillTagInput({ tags, onAdd, onRemove, placeholder }: SkillTagInputProps) {
  const commit = (val: string) => {
    const t = val.replace(/,/g, '').trim()
    if (t && !tags.includes(t)) onAdd(t)
  }

  return (
    <div
      className="bg-parchment-100 border border-parchment-300 rounded-lg p-2 min-h-[42px] flex flex-wrap gap-1.5 items-center cursor-text focus-within:ring-2 focus-within:ring-forest-400/30 focus-within:border-forest-400 focus-within:bg-white transition-all"
      onClick={e => (e.currentTarget.querySelector('input') as HTMLInputElement)?.focus()}
    >
      {tags.map((t, i) => (
        <span key={i} className="inline-flex items-center gap-1 bg-white border border-parchment-300 rounded-md px-2 py-0.5 text-xs font-medium text-gray-700">
          {t}
          <button type="button" onClick={() => onRemove(i)} className="text-gray-400 hover:text-red-500 transition-colors leading-none">×</button>
        </span>
      ))}
      <input
        type="text"
        className="border-none outline-none bg-transparent text-sm text-gray-900 placeholder:text-gray-400 min-w-[100px] flex-1 py-0.5"
        placeholder={tags.length === 0 ? (placeholder || 'Type, then Enter…') : ''}
        onKeyDown={e => {
          if (e.key === 'Enter' || e.key === ',' || e.key === ';') {
            e.preventDefault()
            commit(e.currentTarget.value)
            e.currentTarget.value = ''
          } else if (e.key === 'Backspace' && e.currentTarget.value === '' && tags.length) {
            onRemove(tags.length - 1)
          }
        }}
        onInput={e => {
          const val = e.currentTarget.value
          if (val.includes(',')) {
            val.split(',').slice(0, -1).forEach(p => { const t = p.trim(); if (t) onAdd(t) })
            e.currentTarget.value = val.split(',').pop() || ''
          }
        }}
      />
    </div>
  )
}

// ─── SECTION HEADER ───────────────────────────────────────────
export function SectionHeader({ eyebrow, title, sub, action }: { eyebrow?: string, title: string, sub?: string, action?: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between mb-5">
      <div>
        {eyebrow && <div className="text-[10px] font-bold tracking-[2px] text-forest-600 uppercase mb-1">{eyebrow}</div>}
        <h2 className="font-serif text-[26px] text-gray-900 leading-tight">{title}</h2>
        {sub && <p className="text-sm text-gray-400 mt-1">{sub}</p>}
      </div>
      {action}
    </div>
  )
}

// ─── GUIDANCE BOX ─────────────────────────────────────────────
export function Guidance({ title, items }: { title: string, items: (string | React.ReactNode)[] }) {
  return (
    <div className="bg-forest-50 border border-forest-200 rounded-xl p-4 mb-4">
      <h4 className="text-xs font-bold text-forest-700 mb-2.5">{title}</h4>
      <ul className="space-y-1">
        {items.map((item, i) => (
          <li key={i} className="text-xs text-gray-500 leading-relaxed flex items-start gap-2">
            <span className="text-forest-400 mt-0.5">·</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

// ─── TIP BOX ──────────────────────────────────────────────────
export function Tip({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-800 leading-relaxed mt-3">
      💡 {children}
    </div>
  )
}

// ─── COMPLETENESS BAR ─────────────────────────────────────────
interface CompletenessCheck { label: string; ok: boolean }
export function CompletenessBar({ checks }: { checks: CompletenessCheck[] }) {
  const score = Math.round((checks.filter(c => c.ok).length / checks.length) * 100)
  const col = score >= 80 ? 'bg-forest-500' : score >= 55 ? 'bg-amber-500' : 'bg-red-400'
  const textCol = score >= 80 ? 'text-forest-600' : score >= 55 ? 'text-amber-600' : 'text-red-500'

  return (
    <div className="bg-parchment-200 border border-parchment-300 rounded-xl p-4 mb-5">
      <div className="flex justify-between items-center mb-2">
        <span className="text-xs font-semibold text-gray-700">Profile completeness</span>
        <span className={clsx('font-serif text-lg font-light', textCol)}>{score}%</span>
      </div>
      <div className="h-1.5 bg-parchment-300 rounded-full overflow-hidden mb-3">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className={clsx('h-full rounded-full', col)}
        />
      </div>
      <div className="flex flex-wrap gap-1.5">
        {checks.map(c => (
          <span key={c.label} className={clsx(
            'text-[10px] px-2 py-0.5 rounded-full font-medium border',
            c.ok ? 'bg-forest-50 text-forest-600 border-forest-200' : 'bg-red-50 text-red-600 border-red-200'
          )}>
            {c.ok ? '✓' : '✗'} {c.label}
          </span>
        ))}
      </div>
    </div>
  )
}
