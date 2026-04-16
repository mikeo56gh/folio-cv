// app/api/jobs/titles/route.ts
// Returns Adzuna job title suggestions as user types

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const q = searchParams.get('q')?.trim()
  const country = searchParams.get('country') || 'gb'

  if (!q || q.length < 2) {
    return new Response(JSON.stringify({ titles: [] }), { status: 200 })
  }

  try {
    const params = new URLSearchParams({
      app_id: process.env.ADZUNA_APP_ID!,
      app_key: process.env.ADZUNA_API_KEY!,
    })

    const res = await fetch(
      `https://api.adzuna.com/v1/api/jobs/${country}/title_count?${params}&title=${encodeURIComponent(q)}`,
      { headers: { 'Content-Type': 'application/json' } }
    )

    if (!res.ok) {
      const fallback = JOB_TITLES.filter(t =>
        t.toLowerCase().includes(q.toLowerCase())
      ).slice(0, 8)
      return new Response(JSON.stringify({ titles: fallback }), { status: 200 })
    }

    const data = await res.json()

    // Adzuna title_count returns { title: string, count: number }[]
    const titles = (data || [])
      .sort((a: any, b: any) => b.count - a.count)
      .map((item: any) => item.title)
      .filter(Boolean)
      .slice(0, 8)

    if (!titles.length) {
      const fallback = JOB_TITLES.filter(t =>
        t.toLowerCase().includes(q.toLowerCase())
      ).slice(0, 8)
      return new Response(JSON.stringify({ titles: fallback }), { status: 200 })
    }

    return new Response(JSON.stringify({ titles }), { status: 200 })
  } catch {
    const fallback = JOB_TITLES.filter(t =>
      t.toLowerCase().includes(q.toLowerCase())
    ).slice(0, 8)
    return new Response(JSON.stringify({ titles: fallback }), { status: 200 })
  }
}

// Common job titles — fallback if Adzuna API is unavailable
const JOB_TITLES = [
  'Software Engineer', 'Senior Software Engineer', 'Lead Software Engineer',
  'Frontend Developer', 'Backend Developer', 'Full Stack Developer',
  'React Developer', 'Node.js Developer', 'Python Developer', 'Java Developer',
  'DevOps Engineer', 'Cloud Engineer', 'Site Reliability Engineer',
  'Data Engineer', 'Data Scientist', 'Data Analyst', 'Machine Learning Engineer',
  'Product Manager', 'Senior Product Manager', 'Product Director', 'Head of Product',
  'Project Manager', 'Programme Manager', 'PMO Manager', 'Scrum Master',
  'Business Analyst', 'Systems Analyst', 'Solutions Architect', 'Technical Architect',
  'Engineering Manager', 'Head of Engineering', 'VP of Engineering', 'CTO',
  'UX Designer', 'UI Designer', 'Product Designer', 'UX Researcher',
  'Marketing Manager', 'Digital Marketing Manager', 'Head of Marketing', 'CMO',
  'Sales Manager', 'Account Manager', 'Business Development Manager',
  'Finance Manager', 'Financial Analyst', 'FP&A Manager', 'Finance Director', 'CFO',
  'HR Manager', 'HR Business Partner', 'Talent Acquisition Manager', 'CHRO',
  'Operations Manager', 'Operations Director', 'COO',
  'Customer Success Manager', 'Customer Experience Manager',
  'Legal Counsel', 'Solicitor', 'Compliance Manager',
  'Civil Engineer', 'Mechanical Engineer', 'Electrical Engineer', 'Structural Engineer',
  'Chemical Engineer', 'Process Engineer', 'Project Engineer',
  'Site Manager', 'Site Director', 'Facilities Manager',
  'Health & Safety Manager', 'HSEQ Manager', 'EHS Manager',
  'Procurement Manager', 'Supply Chain Manager', 'Logistics Manager',
  'Quantity Surveyor', 'Commercial Manager', 'Contracts Manager',
  'Nurse', 'Doctor', 'GP', 'Consultant', 'Pharmacist', 'Physiotherapist',
  'Teacher', 'Lecturer', 'Headteacher', 'Teaching Assistant',
  'Accountant', 'Management Accountant', 'Finance Business Partner',
  'Graphic Designer', 'Content Manager', 'Copywriter', 'Social Media Manager',
  'IT Manager', 'IT Director', 'Head of IT', 'IT Support Engineer',
  'Cybersecurity Analyst', 'Information Security Manager', 'CISO',
  'Network Engineer', 'Infrastructure Engineer', 'Systems Administrator',
  'Head of Operations', 'General Manager', 'Managing Director', 'CEO',
]
