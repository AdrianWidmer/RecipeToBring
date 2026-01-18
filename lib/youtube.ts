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
    const response = await fetch(`https://www.youtube.com/watch?v=${videoId}`);
    const html = await response.text();

    // Extract title from meta tags
    const titleMatch = html.match(/<meta property="og:title" content="([^"]*)">/);
    const title = titleMatch ? titleMatch[1] : 'YouTube Recipe';

    // Extract description
    const descMatch = html.match(/<meta property="og:description" content="([^"]*)">/);
    const description = descMatch ? descMatch[1] : '';

    // Extract thumbnail
    const thumbnailMatch = html.match(/<meta property="og:image" content="([^"]*)">/);
    const thumbnail = thumbnailMatch ? thumbnailMatch[1] : `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;

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
