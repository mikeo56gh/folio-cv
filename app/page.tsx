'use client'
import { ArrowRight, CheckCircle, Zap, Shield, BarChart2, Search, FileText, Mail, Star, ChevronDown, Sparkles } from 'lucide-react'
import Link from 'next/link'

const FEATURES = [
  { icon: FileText, label: 'ATS-optimised CV', desc: 'AI selects and reframes only your most relevant achievements for each specific role' },
  { icon: Mail, label: 'Cover letter', desc: 'Unique narrative tailored to the company — not a template' },
  { icon: BarChart2, label: 'Fit review & score', desc: 'Honest assessment of how well you match — before you waste time applying' },
  { icon: Search, label: 'Company research', desc: 'Live intel on culture, news, and talking points to reference in your application' },
  { icon: Zap, label: 'Interview prep', desc: '10 targeted questions with suggested angles based on your actual experience' },
  { icon: Shield, label: 'Red flag checker', desc: 'Catches what a recruiter would silently reject — before they do' },
]

const PLANS = [
  {
    name: 'Free', price: '£0', period: '',
    desc: 'Try Folio with no commitment',
    features: ['3 CV generations', '1 cover letter', '1 fit review', '5 job searches'],
    cta: 'Start free', href: '/auth', highlight: false,
  },
  {
    name: 'Job Seeker Sprint', price: '£39', period: '/3 months',
    desc: 'Most people find a role in 3 months. Pay once, stop when you land.',
    features: ['Everything in Pro — unlimited', 'LinkedIn profile optimiser', 'Weekly job alerts', 'Company research', 'Interview prep', 'No monthly commitment'],
    cta: 'Start Sprint', href: '/auth?plan=sprint', highlight: true,
  },
  {
    name: 'Pro', price: '£9', period: '/mo',
    desc: 'Unlimited tools, cancel any time',
    features: ['Unlimited CVs & cover letters', 'Unlimited fit reviews', 'Live company research', 'Interview prep & red flag check', 'ATS keyword gap analysis', 'Version history'],
    cta: 'Start Pro', href: '/auth?plan=pro', highlight: false,
  },
  {
    name: 'Career Boost', price: '£19', period: '/mo',
    desc: 'Every advantage, every tool',
    features: ['Everything in Pro', 'LinkedIn profile optimiser', 'Salary negotiation coach', 'Weekly job alerts', 'Unlimited profiles'],
    cta: 'Start Boost', href: '/auth?plan=boost', highlight: false,
  },
]

const TESTIMONIALS = [
  { name: 'Sarah M.', role: 'Product Manager → Director', quote: 'The fit review told me I was a weak match before I wasted 2 hours on an application. Ended up landing a better role through Folio a week later.' },
  { name: 'James K.', role: 'Grad → Software Engineer', quote: 'The keyword gap analysis was a game changer. I was missing 8 key terms from my CV that ATS would filter on. Got 3x more callbacks after fixing it.' },
  { name: 'Rachel T.', role: 'Senior Manager → Director', quote: 'The company research feature is insane. I walked into my interview knowing things about their Q3 strategy that surprised the hiring team.' },
]

const STATS = [
  { num: '3x', label: 'more callbacks' },
  { num: '47%', label: 'faster job search' },
  { num: '£8k', label: 'avg salary increase' },
  { num: '94%', label: 'ATS pass rate' },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-parchment-100 overflow-hidden">

      {/* NAV */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-b border-parchment-300/60">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-serif text-xl text-gray-900">Folio</span>
            <span className="text-[9px] font-bold tracking-[2.5px] text-forest-600 uppercase mt-1">CV Builder</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm text-gray-500">
            <a href="#features" className="hover:text-gray-900 transition-colors">Features</a>
            <a href="#pricing" className="hover:text-gray-900 transition-colors">Pricing</a>
            <a href="#testimonials" className="hover:text-gray-900 transition-colors">Reviews</a>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/auth" className="text-sm text-gray-600 hover:text-gray-900 transition-colors px-3 py-2">Sign in</Link>
            <Link href="/auth?mode=signup" className="text-sm font-semibold bg-forest-500 text-white px-4 py-2 rounded-lg hover:bg-forest-600 transition-colors">
              Get started free
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative pt-36 pb-24 px-6 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 left-1/4 w-96 h-96 bg-forest-100 rounded-full blur-3xl opacity-40" />
          <div className="absolute bottom-10 right-1/4 w-80 h-80 bg-amber-50 rounded-full blur-3xl opacity-60" />
        </div>

        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-forest-50 border border-forest-200 text-forest-700 rounded-full px-4 py-1.5 text-xs font-semibold mb-8">
            <Sparkles size={12} />
            Powered by Claude AI — the most capable model available
          </div>

          <h1 className="font-serif text-5xl md:text-7xl font-light leading-[1.1] text-gray-900 mb-6 text-balance">
            Your career,<br />
            <em className="text-forest-600">perfectly positioned</em>
          </h1>

          <p className="text-lg md:text-xl text-gray-500 leading-relaxed mb-10 max-w-2xl mx-auto text-balance">
            ATS-optimised CVs, intelligent cover letters, live company research,
            and brutally honest fit reviews — tailored to the exact role you want.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/auth" className="group inline-flex items-center gap-2 bg-forest-500 text-white px-8 py-4 rounded-xl font-semibold hover:bg-forest-600 transition-all duration-200 shadow-lg text-sm">
              Start building for free
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link href="#features" className="inline-flex items-center gap-2 bg-white border border-parchment-300 text-gray-600 px-8 py-4 rounded-xl font-semibold hover:border-forest-300 hover:text-forest-700 transition-all duration-200 text-sm">
              See how it works
              <ChevronDown size={16} />
            </Link>
          </div>

          <div className="mt-10 flex items-center justify-center gap-2 text-sm text-gray-400">
            <div className="flex -space-x-2">
              {['#2d5a3d','#4da472','#7fc29a','#b3dbc2','#d9ede0'].map((c, i) => (
                <div key={i} className="w-7 h-7 rounded-full border-2 border-white flex items-center justify-center text-[10px] text-white font-bold" style={{ background: c }}>
                  {String.fromCharCode(65 + i)}
                </div>
              ))}
            </div>
            <span>Join <strong className="text-gray-600">2,400+</strong> professionals landing better roles</span>
          </div>
        </div>

        {/* Preview card */}
        <div className="relative max-w-3xl mx-auto mt-20">
          <div className="bg-white rounded-2xl shadow-card border border-parchment-300 overflow-hidden">
            <div className="bg-parchment-200 px-5 py-3 flex items-center gap-2 border-b border-parchment-300">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-amber-400" />
                <div className="w-3 h-3 rounded-full bg-forest-400" />
              </div>
              <div className="flex-1 bg-white/60 rounded-md py-1 px-3 text-xs text-gray-400 mx-2">folio.cv/app</div>
            </div>
            <div className="p-6 md:p-8">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <div className="text-[10px] font-bold tracking-[2px] text-forest-600 uppercase mb-1">AI-generated · ATS optimised</div>
                  <div className="font-serif text-xl text-gray-900">Senior Product Manager — Stripe</div>
                  <div className="text-sm text-gray-400 mt-1">Fit score: <span className="text-forest-600 font-semibold">87/100</span> · 3 keyword gaps found</div>
                </div>
                <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-forest-50">
                  <svg viewBox="0 0 40 40" width="40" height="40">
                    <circle cx="20" cy="20" r="16" fill="none" stroke="#e8f0eb" strokeWidth="3" />
                    <circle cx="20" cy="20" r="16" fill="none" stroke="#2d5a3d" strokeWidth="3"
                      strokeDasharray="100.5" strokeDashoffset="13" strokeLinecap="round"
                      transform="rotate(-90 20 20)" />
                    <text x="20" y="25" textAnchor="middle" fontSize="10" fontWeight="600" fill="#2d5a3d">87</text>
                  </svg>
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-3 bg-parchment-200 rounded-full w-full" />
                <div className="h-3 bg-parchment-200 rounded-full w-5/6" />
                <div className="h-3 bg-parchment-200 rounded-full w-4/6 mb-4" />
                <div className="h-2.5 bg-forest-100 rounded-full w-full" />
                <div className="h-2.5 bg-forest-100 rounded-full w-11/12" />
                <div className="h-2.5 bg-parchment-200 rounded-full w-full" />
                <div className="h-2.5 bg-parchment-200 rounded-full w-3/4" />
              </div>
              <div className="flex flex-wrap gap-2 mt-6">
                {['✓ ATS keywords matched','✓ Company research added','✓ Achievement selected','⚠ 3 flags to address'].map((t, i) => (
                  <span key={i} className={`text-xs px-3 py-1 rounded-full font-medium ${t.startsWith('⚠') ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-forest-50 text-forest-700 border border-forest-200'}`}>{t}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="py-16 px-6 bg-white border-y border-parchment-300">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          {STATS.map(s => (
            <div key={s.label} className="text-center">
              <div className="font-serif text-4xl md:text-5xl font-light text-forest-600 mb-2">{s.num}</div>
              <div className="text-sm text-gray-400">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <div className="text-[11px] font-bold tracking-[2px] text-forest-600 uppercase mb-4">Everything you need</div>
            <h2 className="font-serif text-4xl md:text-5xl font-light text-gray-900 mb-4">Six tools. One application.</h2>
            <p className="text-lg text-gray-400 max-w-xl mx-auto">Every tool shares the same job description and your profile — no copy-pasting, no context-switching.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((f, i) => (
              <div key={f.label} className="group bg-white rounded-2xl p-6 border border-parchment-300 hover:border-forest-300 hover:shadow-card-hover transition-all duration-300">
                <div className="w-10 h-10 rounded-xl bg-forest-50 flex items-center justify-center mb-4 group-hover:bg-forest-100 transition-colors">
                  <f.icon size={20} className="text-forest-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2 text-[15px]">{f.label}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-24 px-6 bg-forest-500">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="font-serif text-4xl font-light text-white mb-4">From job posting to application in 3 minutes</h2>
            <p className="text-forest-200 text-lg">Most users send tailored applications in under 4 minutes.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { n: '01', title: 'Build your profile', desc: 'Add your experience once. Every achievement becomes part of your permanent pool.' },
              { n: '02', title: 'Paste the job', desc: 'Drop in a URL or paste the description. Folio researches the company live.' },
              { n: '03', title: 'Generate & submit', desc: 'Get a tailored CV, cover letter, and fit score. Know your chances before you apply.' },
            ].map(step => (
              <div key={step.n} className="text-center">
                <div className="font-serif text-5xl font-light text-forest-300 mb-4">{step.n}</div>
                <h3 className="text-white font-semibold text-lg mb-2">{step.title}</h3>
                <p className="text-forest-200 text-sm leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section id="testimonials" className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="font-serif text-4xl md:text-5xl font-light text-gray-900 mb-4">Real results</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map(t => (
              <div key={t.name} className="bg-white rounded-2xl p-6 border border-parchment-300 shadow-card">
                <div className="flex gap-0.5 mb-4">
                  {[...Array(5)].map((_, j) => <Star key={j} size={14} fill="#2d5a3d" className="text-forest-500" />)}
                </div>
                <p className="text-sm text-gray-600 leading-relaxed mb-5 italic">&ldquo;{t.quote}&rdquo;</p>
                <div>
                  <div className="font-semibold text-sm text-gray-900">{t.name}</div>
                  <div className="text-xs text-forest-600 mt-0.5">{t.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="py-24 px-6 bg-parchment-200">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="font-serif text-4xl md:text-5xl font-light text-gray-900 mb-4">Simple pricing</h2>
            <p className="text-gray-400 text-lg">One successful salary negotiation pays for a year of Career Boost.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {PLANS.map(plan => (
              <div key={plan.name} className={`relative rounded-2xl p-7 flex flex-col ${plan.highlight ? 'bg-forest-500 text-white' : 'bg-white border border-parchment-300'}`}>
                {plan.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-amber-400 text-amber-900 text-[11px] font-bold px-3 py-1 rounded-full tracking-wider uppercase">Best value</span>
                  </div>
                )}
                <div className={`text-[11px] font-bold tracking-[2px] uppercase mb-2 ${plan.highlight ? 'text-forest-200' : 'text-gray-400'}`}>{plan.name}</div>
                <div className="flex items-baseline gap-1 mb-1">
                  <span className={`font-serif text-4xl font-light ${plan.highlight ? 'text-white' : 'text-gray-900'}`}>{plan.price}</span>
                  {plan.period && <span className={`text-sm ${plan.highlight ? 'text-forest-200' : 'text-gray-400'}`}>{plan.period}</span>}
                </div>
                <p className={`text-sm mb-6 ${plan.highlight ? 'text-forest-100' : 'text-gray-400'}`}>{plan.desc}</p>
                <ul className="space-y-2.5 mb-8 flex-1">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-center gap-2.5 text-sm">
                      <CheckCircle size={15} className={plan.highlight ? 'text-forest-200' : 'text-forest-500'} />
                      <span className={plan.highlight ? 'text-forest-50' : 'text-gray-600'}>{f}</span>
                    </li>
                  ))}
                </ul>
                <Link href={plan.href} className={`w-full py-3 rounded-xl font-semibold text-sm text-center transition-all duration-200 ${plan.highlight ? 'bg-white text-forest-700 hover:bg-forest-50' : 'bg-forest-500 text-white hover:bg-forest-600'}`}>
                  {plan.cta} <ArrowRight className="inline ml-1" size={14} />
                </Link>
              </div>
            ))}
          </div>
          <p className="text-center text-sm text-gray-400 mt-8">Cancel anytime · No contracts · VAT included</p>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="font-serif text-4xl md:text-5xl font-light text-gray-900 mb-6 text-balance">
            Stop applying blindly.<br /><em className="text-forest-600">Start applying strategically.</em>
          </h2>
          <p className="text-gray-400 text-lg mb-8">Build your profile once. Apply to every role with a tailored CV in under 3 minutes.</p>
          <Link href="/auth" className="group inline-flex items-center gap-2 bg-forest-500 text-white px-10 py-4 rounded-xl font-semibold text-sm hover:bg-forest-600 transition-all duration-200 shadow-lg">
            Get started free
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </Link>
          <p className="text-sm text-gray-400 mt-4">Free forever · No card required</p>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-parchment-300 py-10 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-serif text-lg text-gray-900">Folio</span>
            <span className="text-gray-300">·</span>
            <span className="text-sm text-gray-400">AI-Powered CV Builder</span>
          </div>
          <div className="flex gap-6 text-sm text-gray-400">
            <Link href="/privacy" className="hover:text-gray-700 transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-gray-700 transition-colors">Terms</Link>
            <a href="mailto:hello@folio.cv" className="hover:text-gray-700 transition-colors">Contact</a>
          </div>
          <p className="text-sm text-gray-400">© {new Date().getFullYear()} Folio</p>
        </div>
      </footer>

    </div>
  )
}
