// lib/db.ts
// Shared Neon database client for all API routes
// Uses @neondatabase/serverless for HTTP-based queries (works in edge + serverless)

import { neon } from '@neondatabase/serverless'

// Lazy getter — only initialises when called, not at module load time
export const getDb = () => neon(process.env.DATABASE_URL!)

// Helper: run a query and return rows
export async function query<T = any>(sql: string, params: any[] = []): Promise<T[]> {
  const db = getDb()
  const rows = await db(sql, params)
  return rows as T[]
}

// Helper: run a query and return first row or null
export async function queryOne<T = any>(sql: string, params: any[] = []): Promise<T | null> {
  const rows = await query<T>(sql, params)
  return rows[0] ?? null
}

// Helper: run a query and return nothing (INSERT/UPDATE/DELETE)
export async function execute(sql: string, params: any[] = []): Promise<void> {
  const db = getDb()
  await db(sql, params)
}
