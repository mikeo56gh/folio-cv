import { anthropic } from '@ai-sdk/anthropic'
import { streamText } from 'ai'

export const maxDuration = 60

export async function POST(request: Request) {
  const { jdContext, jdUrl } = await request.json()

  const prompt = `You are a business intelligence analyst. Research the company from this job posting using your knowledge.

JOB CONTEXT:
${jdUrl ? 'URL: ' + jdUrl : ''}
${jdContext ? 'Description: ' + jdContext.substring(0, 1000) : ''}

Return ONLY valid JSON:
{
  "name": "<company name>",
  "industry": "<specific industry>",
  "size": "<employee count>",
  "founded": "<year>",
  "hq": "<city, country>",
  "revenue": "<ARR/revenue/stage>",
  "products": "<what they actually do>",
  "summary": "<3-4 sentence overview>",
  "insights": ["<role-relevant insight>", "<strategic priority>", "<competitive position>"],
  "recentNews": ["<news item>", "<news>", "<news>"],
  "cultureSignals": "<2-3 sentences on culture and values>",
  "talkingPoints": "<2-3 specific things a candidate could reference>"
}

Return ONLY the JSON object.`

  const result = await streamText({
    model: anthropic('claude-sonnet-4-5'),
    prompt,
    maxTokens: 1200,
  })

  return result.toDataStreamResponse()
}
