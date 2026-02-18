import type { MetadataRoute } from 'next'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://www.ssulo.com'

  try {
    const { data: battles } = await supabase
      .from('battles')
      .select('battle_id, created_at')
      .eq('status', 'completed')
      .order('created_at', { ascending: false })
      .limit(500)

    const battleUrls =
      battles?.map((battle) => ({
        url: `${baseUrl}/battle/${battle.battle_id}`,
        lastModified: new Date(battle.created_at),
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      })) ?? []

    return [
      {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 1,
      },
      {
        url: `${baseUrl}/board`,
        lastModified: new Date(),
        changeFrequency: 'hourly',
        priority: 0.9,
      },
      ...battleUrls,
    ]
  } catch (err) {
    console.error('Sitemap error:', err)
    return [
      {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 1,
      },
    ]
  }
}
