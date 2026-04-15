// app/api/jobs/locations/route.ts
// Returns Adzuna location suggestions as user types
// Uses Adzuna's geodata endpoint which returns exact location strings their API accepts

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const q = searchParams.get('q')?.trim()
  const country = searchParams.get('country') || 'gb'

  if (!q || q.length < 2) {
    return new Response(JSON.stringify({ locations: [] }), { status: 200 })
  }

  try {
    const params = new URLSearchParams({
      app_id: process.env.ADZUNA_APP_ID!,
      app_key: process.env.ADZUNA_API_KEY!,
    })

    const res = await fetch(
      `https://api.adzuna.com/v1/api/jobs/${country}/geodata?${params}&location0=UK&location1=${encodeURIComponent(q)}`,
      { headers: { 'Content-Type': 'application/json' } }
    )

    if (!res.ok) {
      // Fallback: return filtered list of common UK locations
      const fallback = UK_LOCATIONS.filter(l =>
        l.toLowerCase().includes(q.toLowerCase())
      ).slice(0, 8)
      return new Response(JSON.stringify({ locations: fallback }), { status: 200 })
    }

    const data = await res.json()

    // Adzuna geodata returns location arrays — flatten to display strings
    const locations = (data.locations || [])
      .map((loc: any) => {
        // Build "City, Region" format from location array
        const parts = loc.location?.area?.filter(Boolean) || []
        if (parts.length >= 2) return `${parts[parts.length - 1]}, ${parts[parts.length - 2]}`
        if (parts.length === 1) return parts[0]
        return loc.display_name || loc.name
      })
      .filter(Boolean)
      .slice(0, 8)

    // If API returns nothing useful, use fallback
    if (!locations.length) {
      const fallback = UK_LOCATIONS.filter(l =>
        l.toLowerCase().includes(q.toLowerCase())
      ).slice(0, 8)
      return new Response(JSON.stringify({ locations: fallback }), { status: 200 })
    }

    return new Response(JSON.stringify({ locations }), { status: 200 })
  } catch {
    // Always fallback gracefully
    const fallback = UK_LOCATIONS.filter(l =>
      l.toLowerCase().includes(q.toLowerCase())
    ).slice(0, 8)
    return new Response(JSON.stringify({ locations: fallback }), { status: 200 })
  }
}

// Comprehensive UK location list matching Adzuna's format — used as fallback
const UK_LOCATIONS = [
  'London', 'Manchester', 'Birmingham', 'Leeds', 'Glasgow', 'Liverpool',
  'Edinburgh', 'Bristol', 'Sheffield', 'Cambridge', 'Oxford', 'Nottingham',
  'Leicester', 'Coventry', 'Hull, East Riding Of Yorkshire', 'Reading',
  'Brighton', 'Southampton', 'Portsmouth', 'Cardiff', 'Belfast', 'Newcastle',
  'Exeter', 'Norwich', 'York', 'Dundee', 'Aberdeen', 'Derby', 'Wolverhampton',
  'Stoke-on-Trent', 'Plymouth', 'Sunderland', 'Bolton', 'Bournemouth',
  'Middlesbrough', 'Huddersfield', 'Swansea', 'Ipswich', 'Luton', 'Milton Keynes',
  'Northampton', 'Preston', 'Wigan', 'Barnsley', 'Doncaster', 'Rotherham',
  'Wakefield', 'Bradford', 'Salford', 'Oldham', 'Rochdale', 'Stockport',
  'Blackpool', 'Blackburn', 'Burnley', 'Lancaster', 'Carlisle', 'Darlington',
  'Durham', 'Hartlepool', 'Gateshead', 'Sunderland', 'Stockton-on-Tees',
  'Teesside', 'Grimsby, Lincolnshire', 'Lincoln', 'Peterborough', 'Chelmsford',
  'Colchester', 'Southend-on-Sea', 'Watford', 'St Albans', 'Slough',
  'Windsor', 'Guildford', 'Woking', 'Crawley', 'Worthing', 'Hastings',
  'Eastbourne', 'Folkestone', 'Canterbury', 'Maidstone', 'Tunbridge Wells',
  'Medway', 'Chatham', 'Bath', 'Swindon', 'Gloucester', 'Cheltenham',
  'Worcester', 'Hereford', 'Shrewsbury', 'Telford', 'Stoke', 'Burton upon Trent',
  'Stafford', 'Lichfield', 'Tamworth', 'Walsall', 'West Bromwich', 'Dudley',
  'Solihull', 'Warwick', 'Coventry', 'Rugby', 'Nuneaton', 'Loughborough',
  'Mansfield', 'Newark', 'Grantham', 'Chesterfield', 'Matlock', 'Buxton',
  'Macclesfield', 'Chester', 'Warrington', 'Runcorn', 'Widnes', 'Birkenhead',
  'Southport', 'Wigan', 'Bury', 'Rochdale', 'Accrington', 'Burnley', 'Nelson',
  'Kendal', 'Barrow-in-Furness', 'Workington', 'Whitehaven', 'Penrith',
  'Inverness', 'Perth', 'Stirling', 'Falkirk', 'Livingston', 'Paisley',
  'Kilmarnock', 'Ayr', 'Dumfries', 'Wrexham', 'Newport', 'Swansea', 'Bridgend',
  'Pontypridd', 'Merthyr Tydfil', 'Cwmbran', 'Newport', 'Llandudno',
  'Remote', 'Remote, UK', 'Work From Home',
]
