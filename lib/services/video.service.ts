/**
 * Video Service Abstraction
 * 
 * Embeds video references, handles playback metadata, ready for AWS IVS, Mux, or YouTube/Vimeo integration.
 */

export interface VideoMetadata {
  embedUrl: string;
  provider: 'MOCK' | 'YOUTUBE' | 'VIMEO' | 'MUX';
  durationSeconds?: number;
}

export class VideoService {
  private static provider = process.env.VIDEO_PROVIDER || 'MOCK';

  /**
   * Converts any raw video URL into a safe embeddable URL format.
   */
  static getEmbedUrl(rawUrl: string | null | undefined): VideoMetadata {
    if (!rawUrl) {
      return {
        embedUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        provider: 'MOCK',
      };
    }

    if (rawUrl.includes('youtube.com') || rawUrl.includes('youtu.be')) {
      const match = rawUrl.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
      const videoId = match ? match[1] : 'dQw4w9WgXcQ';
      return {
        embedUrl: `https://www.youtube.com/embed/${videoId}?autoplay=0`,
        provider: 'YOUTUBE',
      };
    }

    if (rawUrl.includes('vimeo.com')) {
      const match = rawUrl.match(/vimeo\.com\/(\d+)/);
      const videoId = match ? match[1] : '';
      return {
        embedUrl: `https://player.vimeo.com/video/${videoId}`,
        provider: 'VIMEO',
      };
    }

    return {
      embedUrl: rawUrl,
      provider: 'MOCK',
    };
  }
}
