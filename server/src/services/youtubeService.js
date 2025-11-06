// YouTube Video Fetching Service
// Uses YouTube Data API to search for educational videos related to lesson topics

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
const YOUTUBE_API_BASE_URL = 'https://www.googleapis.com/youtube/v3';

/**
 * Search for YouTube videos related to a topic
 * @param {string} topic - The topic to search for
 * @param {number} maxResults - Maximum number of results to return
 * @returns {Promise<Array>} Array of video objects with id, title, and thumbnail
 */
export const searchYoutubeVideos = async (topic, maxResults = 3) => {
  if (!YOUTUBE_API_KEY) {
    console.warn('⚠️ YOUTUBE_API_KEY not set. YouTube videos will not be available.');
    return [];
  }

  try {
    console.log(`🔍 Searching YouTube for: "${topic}"`);
    
    const searchParams = new URLSearchParams({
      part: 'snippet',
      q: `${topic} tutorial`,
      type: 'video',
      maxResults: maxResults,
      order: 'relevance',
      key: YOUTUBE_API_KEY
    });

    const response = await fetch(`${YOUTUBE_API_BASE_URL}/search?${searchParams}`);
    
    if (!response.ok) {
      throw new Error(`YouTube API error: ${response.status}`);
    }

    const data = await response.json();
    console.log(`✅ Found ${data.items?.length || 0} videos for "${topic}"`);

    if (!data.items || data.items.length === 0) {
      console.warn(`⚠️ No YouTube videos found for: "${topic}"`);
      return [];
    }

    // Extract video IDs and get details
    const videos = data.items.map(item => ({
      id: item.id.videoId,
      title: item.snippet.title,
      description: item.snippet.description,
      thumbnail: item.snippet.thumbnails.medium.url,
      channelTitle: item.snippet.channelTitle,
      publishedAt: item.snippet.publishedAt
    }));

    return videos;
  } catch (error) {
    console.error('❌ Error searching YouTube:', error.message);
    return [];
  }
};

/**
 * Get the best YouTube video URL for a lesson topic
 * @param {string} lessonTitle - Title of the lesson
 * @returns {Promise<Object>} Object with videoId, videoUrl, title, and thumbnail
 */
export const getYoutubeVideoForLesson = async (lessonTitle) => {
  // Just use lesson title for cleaner search queries
  const searchQuery = lessonTitle.trim();
  
  try {
    const videos = await searchYoutubeVideos(searchQuery, 1);
    
    if (videos.length === 0) {
      // If no results, try searching with fewer keywords (first 5 words)
      const words = lessonTitle.split(' ').slice(0, 5).join(' ');
      console.log(`📺 Fallback: Searching for "${words}" only`);
      const fallbackVideos = await searchYoutubeVideos(words, 1);
      
      if (fallbackVideos.length === 0) {
        console.warn(`⚠️ No videos found for "${lessonTitle}"`);
        return null;
      }
      
      const video = fallbackVideos[0];
      return {
        videoId: video.id,
        videoUrl: `https://www.youtube.com/embed/${video.id}?rel=0&modestbranding=1`,
        title: video.title,
        thumbnail: video.thumbnail
      };
    }

    const video = videos[0];
    return {
      videoId: video.id,
      videoUrl: `https://www.youtube.com/embed/${video.id}?rel=0&modestbranding=1`,
      title: video.title,
      thumbnail: video.thumbnail
    };
  } catch (error) {
    console.error('❌ Error getting YouTube video for lesson:', error.message);
    return null;
  }
};

/**
 * Get YouTube videos for all lessons in a course
 * @param {Array} lessons - Array of lesson objects with title and content
 * @param {string} courseTopic - Topic of the course
 * @returns {Promise<Array>} Array of lessons with videoUrl added
 */
export const getYoutubeVideosForLessons = async (lessons, courseTopic) => {
  if (!YOUTUBE_API_KEY) {
    console.warn('⚠️ YOUTUBE_API_KEY not set. Skipping YouTube video fetching.');
    return lessons;
  }

  try {
    console.log(`🎬 Fetching YouTube videos for ${lessons.length} lessons...`);
    
    const lessonsWithVideos = await Promise.all(
      lessons.map(async (lesson) => {
        try {
          const videoData = await getYoutubeVideoForLesson(lesson.title);
          return {
            ...lesson,
            videoUrl: videoData?.videoUrl || null,
            videoId: videoData?.videoId || null
          };
        } catch (error) {
          console.error(`Error fetching video for lesson "${lesson.title}":`, error.message);
          return lesson;
        }
      })
    );

    console.log(`✅ Completed fetching YouTube videos for lessons`);
    return lessonsWithVideos;
  } catch (error) {
    console.error('❌ Error fetching YouTube videos for lessons:', error.message);
    return lessons;
  }
};
