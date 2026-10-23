import { createOptimizedPicture } from '../../scripts/aem.js';

const VIMEO = /(?:player\.)?vimeo\.com\/(?:video\/)?(\d+)/;
const YOUTUBE = /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([\w-]{11})/;
const FILE = /\.(mp4|webm)(\?|#|$)/i;

function isVideoLink(a) {
  const href = a?.getAttribute('href') || '';
  return VIMEO.test(href) || YOUTUBE.test(href) || FILE.test(href);
}

function buildVideo(href, title) {
  const vimeo = href.match(VIMEO);
  const youtube = href.match(YOUTUBE);
  if (vimeo || youtube) {
    const iframe = document.createElement('iframe');
    iframe.src = vimeo
      ? `https://player.vimeo.com/video/${vimeo[1]}?background=1&autoplay=1&loop=1&muted=1&dnt=1`
      : `https://www.youtube-nocookie.com/embed/${youtube[1]}?autoplay=1&mute=1&loop=1&playlist=${youtube[1]}&controls=0&playsinline=1`;
    iframe.title = title || 'Background video';
    iframe.setAttribute('allow', 'autoplay; fullscreen; picture-in-picture');
    iframe.setAttribute('tabindex', '-1');
    iframe.setAttribute('aria-hidden', 'true');
    return iframe;
  }
  const video = document.createElement('video');
  Object.assign(video, {
    muted: true, autoplay: true, loop: true, playsInline: true,
  });
  video.setAttribute('muted', '');
  video.setAttribute('aria-hidden', 'true');
  const source = document.createElement('source');
  source.src = href;
  source.type = `video/${href.match(FILE)[1].toLowerCase()}`;
  video.append(source);
  return video;
}

/**
 * Hero with a looping, muted background video (Vimeo / YouTube / mp4 link)
 * and optional poster image, overlaid with text content.
 * @param {Element} block
 */
export default function decorate(block) {
  const background = document.createElement('div');
  background.className = 'hero-video-background';
  const content = document.createElement('div');
  content.className = 'hero-video-content';

  let videoHref = '';
  let videoTitle = '';
  let poster = null;

  // Collect cells; a cell holding only a video link and/or a picture is background.
  const cells = [...block.children].flatMap((row) => [...row.children]);
  cells.forEach((cell) => {
    const links = [...cell.querySelectorAll('a')];
    const videoLink = links.find(isVideoLink);
    const pic = cell.querySelector('picture');
    const textOnly = cell.textContent.trim();
    const linkText = videoLink ? videoLink.textContent.trim() : '';
    const isBackground = (videoLink || pic)
      && !cell.querySelector('h1, h2, h3, h4, h5, h6')
      && (textOnly === '' || textOnly === linkText);

    if (isBackground) {
      if (videoLink && !videoHref) {
        videoHref = videoLink.href;
        videoTitle = videoLink.title || '';
      }
      if (pic && !poster) poster = pic;
      return;
    }
    // A stray video link inside a text cell: use it, and drop its paragraph.
    if (videoLink && !videoHref) {
      videoHref = videoLink.href;
      const p = videoLink.closest('p');
      if (p && p.textContent.trim() === videoLink.textContent.trim()) p.remove();
      else videoLink.remove();
    }
    if (cell.textContent.trim() || cell.querySelector('picture, img')) {
      content.append(...cell.childNodes);
    }
  });

  if (poster) {
    const img = poster.querySelector('img');
    if (img) {
      const optimized = createOptimizedPicture(img.src, img.alt, true, [{ width: '2000' }]);
      optimized.classList.add('hero-video-poster');
      background.append(optimized);
    }
  }

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (videoHref && !(reduceMotion && poster)) {
    const media = buildVideo(videoHref, videoTitle);
    media.classList.add('hero-video-media');
    background.append(media);
  }

  block.replaceChildren();
  if (background.children.length) block.append(background);
  else block.classList.add('no-background');
  block.append(content);
}
