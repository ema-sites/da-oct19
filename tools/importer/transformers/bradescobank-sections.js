/* eslint-disable */
/* global WebImporter */

/**
 * Sections transformer for bradescobank.com.
 * beforeTransform: inserts <hr> section breaks (marked for styled sections) while
 * original section elements still exist.
 * afterTransform: appends Section Metadata blocks after styled sections.
 */
const MARKER = 'data-excat-section-id';

function findSectionElement(root, section) {
  const selectors = Array.isArray(section.selector) ? section.selector : [section.selector];
  for (const sel of selectors) {
    if (!sel) continue;
    try {
      const el = root.querySelector(sel);
      if (el) return el;
    } catch (e) {
      // invalid selector, try next
    }
  }
  return null;
}

export default function transform(hookName, element, payload) {
  const sections = payload && payload.template && payload.template.sections;
  if (!sections || sections.length < 2) return;
  const doc = element.ownerDocument || document;

  if (hookName === 'beforeTransform') {
    for (let i = sections.length - 1; i >= 0; i -= 1) {
      const section = sections[i];
      const el = findSectionElement(element, section);
      if (!el || !el.parentNode) continue;
      if (i === 0 && !section.style) continue;
      const hr = doc.createElement('hr');
      if (section.style) hr.setAttribute(MARKER, section.id);
      if (i === 0) hr.setAttribute('data-excat-first-section', 'true');
      el.parentNode.insertBefore(hr, el);
    }
  }

  if (hookName === 'afterTransform') {
    for (let i = sections.length - 1; i >= 0; i -= 1) {
      const section = sections[i];
      if (!section.style) continue;
      const marker = element.querySelector(`hr[${MARKER}="${section.id}"]`);
      if (!marker) continue;

      // Find the end of this section: the next <hr> sibling after the marker, or end of parent.
      let end = marker.nextElementSibling;
      let last = marker;
      while (end && end.tagName !== 'HR') {
        last = end;
        end = end.nextElementSibling;
      }

      const meta = WebImporter.Blocks.createBlock(doc, {
        name: 'Section Metadata',
        cells: { style: section.style },
      });
      if (last.nextSibling) {
        last.parentNode.insertBefore(meta, last.nextSibling);
      } else {
        last.parentNode.appendChild(meta);
      }

      if (marker.hasAttribute('data-excat-first-section')) {
        marker.remove();
      } else {
        marker.removeAttribute(MARKER);
      }
    }
  }
}
