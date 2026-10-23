/* eslint-disable */
/* global WebImporter */

/**
 * Parser for hero-video (Elementor container with background Vimeo video).
 * Row 1: background cell with a Vimeo link (https://vimeo.com/<id>).
 * Row 2: content cell with heading / statement paragraph.
 */
function findVimeoId(element) {
  // 1. Rendered background iframe
  const iframe = element.querySelector('.elementor-background-video-container iframe[src*="vimeo"], iframe[src*="vimeo.com"]');
  if (iframe) {
    const m = (iframe.getAttribute('src') || '').match(/vimeo\.com\/(?:video\/)?(\d+)/);
    if (m) return { id: m[1], title: iframe.getAttribute('title') || '' };
  }
  // 2. Elementor data-settings (background_video_link)
  const settingsEls = [element, ...element.querySelectorAll('[data-settings]')];
  for (const el of settingsEls) {
    const raw = el.getAttribute && el.getAttribute('data-settings');
    if (!raw) continue;
    const m = raw.replace(/\\\//g, '/').match(/vimeo\.com\/(?:video\/)?(\d+)/);
    if (m) return { id: m[1], title: '' };
  }
  return null;
}

export default function parse(element, { document }) {
  const cells = [];

  // Row 1: background video link
  const video = findVimeoId(element);
  if (video) {
    const href = `https://vimeo.com/${video.id}`;
    const a = document.createElement('a');
    a.href = href;
    a.textContent = href;
    if (video.title) a.title = video.title;
    cells.push([a]);
  }

  // Row 2: text content from text-editor widgets
  const content = [];
  element.querySelectorAll('.elementor-widget-text-editor .elementor-widget-container, .elementor-widget-heading .elementor-widget-container')
    .forEach((container) => {
      [...container.children].forEach((child) => {
        if (child.textContent.trim() || child.querySelector('img')) content.push(child);
      });
    });
  cells.push([content]);

  const block = WebImporter.Blocks.createBlock(document, { name: 'hero-video', cells });
  element.replaceWith(block);
}
