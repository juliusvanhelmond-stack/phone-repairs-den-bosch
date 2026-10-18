/**
 * WordPress turned a YouTube URL on its own line into a player (oEmbed); the imported HTML only has the
 * URL. Replace such paragraphs with a privacy-friendly embed (youtube-nocookie), Shorts in portrait.
 */
const YOUTUBE = /<p>\s*(https?:\/\/(?:www\.|m\.)?(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|shorts\/|embed\/))([\w-]{11})[^<\s]*)\s*<\/p>/g;

export function embedVideos(html: string): string {
  return html.replace(YOUTUBE, (_all, url: string, id: string) => {
    const short = url.includes("/shorts/");
    return `<div class="video${short ? " video-short" : ""}"><iframe src="https://www.youtube-nocookie.com/embed/${id}" title="YouTube-video" loading="lazy" allow="accelerometer; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe></div>`;
  });
}
