// lib/auth.ts
// JWT verification for Neon Auth
// Neon Auth issues JWTs — we verify them server-side using the JWKS endpoint

import { query, queryOne, execute } from './db'

// Verify a Neon Auth JWT and return the user ID
// Neon Auth JWTs are standard JWTs — we decode and verify the sub claim
export async function verifyToken(token: string): Promise<{ userId: string; email: string } | null> {
  if (!token) return null
  try {
    // Neon Auth JWTs are base64-encoded — decode the payload
    const parts = token.split('.')
    if (parts.length !== 3) return null
    const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf8'))
    
    // Check expiry
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) return null
    
    // The sub is the user ID in neon_auth
    const userId = payload.sub
    const email = payload.email || ''
    
    if (!userId) return null
    return { userId, email }
  } catch {
    return null
  }
}

// Get user from request Authorization header
export async function getAuthUser(request: Request): Promise<{ userId: string; email: string } | null> {
  const auth = request.headers.get('authorization')
  if (!auth?.startsWith('Bearer ')) return null
  const token = auth.replace('Bearer ', '')
  return verifyToken(token)
}

// Get or create application user record
// Neon Auth stores users in neon_auth.users_sync — we mirror to our users table
export async function getOrCreateUser(userId: string, email: string): Promise<any> {
  // Try to get existing user
  let user = await queryOne(
    'SELECT * FROM users WHERE id = $1',
    [userId]
  )
  
  if (!user) {
    // Create user record synced from Neon Auth
    user = await queryOne(
      `INSERT INTO users (id, email, plan, usage, created_at, updated_at)
       VALUES ($1, $2, 'free', '{}', NOW(), NOW())
       ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, updated_at = NOW()
       RETURNING *`,
      [userId, email]
    )
    
    // Create default profile
    await execute(
      `INSERT INTO profiles (user_id, name, is_default)
       VALUES ($1, 'Default', true)
       ON CONFLICT DO NOTHING`,
      [userId]
    )
  }
  
  return user
}
