export interface YouTubeVideoInfo {
  title: string;
  description: string;
  thumbnail: string;
}

export async function fetchYouTubeInfo(url: string): Promise<YouTubeVideoInfo> {
  const videoId = extractYouTubeVideoId(url);
  
  if (!videoId) {
    throw new Error('Invalid YouTube URL');
  }

  const apiKey = process.env.YOUTUBE_API_KEY;
  
  if (!apiKey) {
    // Fallback: scrape from embed page
    return await scrapeYouTubeInfo(videoId);
  }

  try {
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${apiKey}`
    );

    if (!response.ok) {
      throw new Error('YouTube API request failed');
    }

    const data = await response.json();
    
    if (!data.items || data.items.length === 0) {
      throw new Error('Video not found');
    }

    const snippet = data.items[0].snippet;

    return {
      title: snippet.title,
      description: snippet.description,
      thumbnail: snippet.thumbnails.maxres?.url || snippet.thumbnails.high?.url || snippet.thumbnails.default.url,
    };
  } catch (error) {
    console.error('Error fetching YouTube info:', error);
    // Fallback to scraping
    return await scrapeYouTubeInfo(videoId);
  }
}

function extractYouTubeVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/watch\?.*v=([^&\n?#]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      return match[1];
    }
  }

  return null;
}

async function scrapeYouTubeInfo(videoId: string): Promise<YouTubeVideoInfo> {
  try {
    const response = await fetch(`https://www.youtube.com/watch?v=${videoId}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });
    const html = await response.text();

    console.log('[DEBUG YouTube] Starting to parse video:', videoId);

    // Try to extract from ytInitialData JSON (contains FULL description)
    const ytDataMatch = html.match(/var ytInitialData = (\{[\s\S]+?\});/);
    if (ytDataMatch) {
      try {
        const ytData = JSON.parse(ytDataMatch[1]);
        console.log('[DEBUG YouTube] Found ytInitialData JSON');
        
        // Navigate to video details
        const contents = ytData?.contents?.twoColumnWatchNextResults?.results?.results?.contents;
        
        // Get title from primary info
        const videoPrimaryInfo = contents?.find((c: any) => c.videoPrimaryInfoRenderer)?.videoPrimaryInfoRenderer;
        const title = videoPrimaryInfo?.title?.runs?.[0]?.text || 'YouTube Recipe';
        
        // Get description from secondary info (this contains FULL description)
        const videoSecondaryInfo = contents?.find((c: any) => c.videoSecondaryInfoRenderer)?.videoSecondaryInfoRenderer;
        const descriptionRuns = videoSecondaryInfo?.attributedDescription?.content || 
                               videoSecondaryInfo?.description?.runs;
        
        let description = '';
        if (typeof descriptionRuns === 'string') {
          description = descriptionRuns;
        } else if (Array.isArray(descriptionRuns)) {
          description = descriptionRuns.map((run: any) => run.text || '').join('');
        }
        
        const thumbnail = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
        
        console.log('[DEBUG YouTube] Extracted from ytInitialData:', {
          titleLength: title.length,
          descriptionLength: description.length,
          descriptionPreview: description.substring(0, 200) + '...'
        });
        
        if (description.length > 50) {
          return { title, description, thumbnail };
        } else {
          console.log('[DEBUG YouTube] Description too short from ytInitialData, trying fallback');
        }
      } catch (e) {
        console.error('[DEBUG YouTube] Failed to parse ytInitialData:', e);
      }
    } else {
      console.log('[DEBUG YouTube] ytInitialData not found in HTML');
    }

    // Fallback to meta tags (shorter description)
    console.log('[DEBUG YouTube] Using meta tag fallback');
    const titleMatch = html.match(/<meta property="og:title" content="([^"]*)">/);
    const title = titleMatch ? titleMatch[1] : 'YouTube Recipe';

    const descMatch = html.match(/<meta property="og:description" content="([^"]*)">/);
    const description = descMatch ? descMatch[1] : '';

    const thumbnailMatch = html.match(/<meta property="og:image" content="([^"]*)">/);
    const thumbnail = thumbnailMatch ? thumbnailMatch[1] : `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;

    console.log('[DEBUG YouTube] Extracted from meta tags:', {
      titleLength: title.length,
      descriptionLength: description.length,
      descriptionPreview: description.substring(0, 100) + '...'
    });

    return {
      title,
      description,
      thumbnail,
    };
  } catch (error) {
    console.error('Error scraping YouTube info:', error);
    throw new Error('Failed to fetch YouTube video information');
  }
}
