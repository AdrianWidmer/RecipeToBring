export interface TikTokVideoInfo {
  title: string;
  description: string;
  thumbnail: string;
}

export async function fetchTikTokInfo(url: string): Promise<TikTokVideoInfo> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });

    const html = await response.text();

    // Extract title from meta tags
    const titleMatch = html.match(/<meta property="og:title" content="([^"]*)">/);
    const title = titleMatch ? titleMatch[1] : 'TikTok Recipe';

    // Extract description
    const descMatch = html.match(/<meta property="og:description" content="([^"]*)">/);
    const description = descMatch ? descMatch[1] : '';

    // Extract thumbnail
    const thumbnailMatch = html.match(/<meta property="og:image" content="([^"]*)">/);
    const thumbnail = thumbnailMatch ? thumbnailMatch[1] : '';

    // Try to extract from JSON-LD
    const jsonLdMatch = html.match(/<script[^>]*type="application\/ld\+json"[^>]*>([^<]+)<\/script>/);
    if (jsonLdMatch) {
      try {
        const jsonData = JSON.parse(jsonLdMatch[1]);
        if (jsonData['@type'] === 'VideoObject') {
          return {
            title: jsonData.name || title,
            description: jsonData.description || description,
            thumbnail: jsonData.thumbnailUrl || thumbnail,
          };
        }
      } catch (e) {
        // Continue with scraped data
      }
    }

    if (!title && !description) {
      throw new Error('Could not extract TikTok video information');
    }

    return {
      title,
      description,
      thumbnail,
    };
  } catch (error) {
    console.error('Error fetching TikTok info:', error);
    throw new Error('Failed to fetch TikTok video information');
  }
}

export function isTikTokUrl(url: string): boolean {
  return /tiktok\.com/.test(url);
}
