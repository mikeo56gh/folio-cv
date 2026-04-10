// app/api/company-research/route.ts
// Uses Anthropic web search tool for live company data
import { anthropic } from '@ai-sdk/anthropic'
import { streamText } from 'ai'

export const maxDuration = 60

export async function POST(request: Request) {
  const { jdContext, jdUrl } = await request.json()

  const prompt = `Research the company from this job posting. Use web search to find current information.

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
  "products": "<what they actually do — specific>",
  "summary": "<3-4 sentence overview>",
  "insights": ["<role-relevant insight>", "<strategic priority>", "<competitive position or challenge>"],
  "recentNews": ["<news item + approximate date>", "<news>", "<news>"],
  "cultureSignals": "<2-3 sentences on culture and values>",
  "talkingPoints": "<2-3 specific things a candidate could reference to show genuine research>"
}

Use web search to get current, accurate information. Return ONLY the JSON object.`

  const result = await streamText({
    model: anthropic('claude-sonnet-4-5'),
    prompt,
    maxTokens: 1200,
    // Anthropic web search tool
    tools: {
      web_search: anthropic.tools.webSearch_20250305(),
    },
  })

  return result.toDataStreamResponse()
}
