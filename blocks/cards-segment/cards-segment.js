import { createOptimizedPicture } from '../../scripts/aem.js';

/**
 * Linked image tiles: one row per tile (image | linked label).
 * The whole tile becomes the link.
 * @param {Element} block
 */
export default function decorate(block) {
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    li.className = 'cards-segment-tile';

    let picture = null;
    const labelParts = [];
    let link = null;
    [...row.children].forEach((cell) => {
      const pic = cell.querySelector('picture');
      if (pic && !picture) picture = pic;
      if (!link) link = cell.querySelector('a[href]');
      if (cell.textContent.trim()) labelParts.push(cell.textContent.trim());
    });
    if (!picture && !labelParts.length) return;

    const container = link ? document.createElement('a') : document.createElement('div');
    container.className = 'cards-segment-inner';
    if (link) {
      container.href = link.href;
      if (link.target) container.target = link.target;
      if (link.title) container.title = link.title;
      const { hostname } = new URL(link.href, window.location.href);
      if (hostname && hostname !== window.location.hostname) {
        container.rel = 'noopener';
      }
    }

    if (picture) {
      const img = picture.querySelector('img');
      const imageWrap = document.createElement('div');
      imageWrap.className = 'cards-segment-image';
      imageWrap.append(img
        ? createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }])
        : picture);
      container.append(imageWrap);
    }

    if (labelParts.length) {
      const label = document.createElement('span');
      label.className = 'cards-segment-label';
      label.textContent = (link && link.textContent.trim()) || labelParts.join(' ');
      container.append(label);
    }

    li.append(container);
    ul.append(li);
  });
  block.replaceChildren(ul);
}
