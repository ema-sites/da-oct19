/* eslint-disable */
/* global WebImporter */

import heroVideoParser from './parsers/hero-video.js';
import cardsSegmentParser from './parsers/cards-segment.js';
import cardsProductParser from './parsers/cards-product.js';
import heroPromoParser from './parsers/hero-promo.js';
import cleanupTransformer from './transformers/bradescobank-cleanup.js';
import sectionsTransformer from './transformers/bradescobank-sections.js';

const PAGE_TEMPLATE = {
  "name": "home",
  "urls": [
    "https://bradescobank.com/en/"
  ],
  "representativeUrl": "https://bradescobank.com/en/",
  "description": "Bradesco Bank home page: video heroes, client segment tiles, product cards and promo banner",
  "blocks": [
    {
      "name": "hero-video",
      "instances": [
        ".elementor-element-b079a4a",
        ".elementor-element-e5bf88e"
      ]
    },
    {
      "name": "cards-segment",
      "instances": [
        "section.elementor-element-6ff733d",
        "section.services"
      ]
    },
    {
      "name": "cards-product",
      "instances": [
        ".elementor-element-c28d200",
        ".elementor-element-6cab8f9"
      ]
    },
    {
      "name": "hero-promo",
      "instances": [
        ".elementor-element-f4e421d"
      ]
    }
  ],
  "urlPattern": "/*",
  "sections": [
    {
      "id": "rc3",
      "name": "Hero - background video",
      "selector": [
        ".elementor-element-b079a4a"
      ],
      "style": "dark",
      "blocks": [
        "hero-video"
      ],
      "defaultContent": []
    },
    {
      "id": "rc5",
      "name": "Tailored offerings intro",
      "selector": [
        ".elementor-element-c766b99"
      ],
      "style": "centered",
      "blocks": [],
      "defaultContent": [
        ".elementor-element-c766b99 .elementor-widget-text-editor h2"
      ]
    },
    {
      "id": "rc6",
      "name": "Client segments",
      "selector": [
        "section.elementor-element-6ff733d",
        "section.services"
      ],
      "style": null,
      "blocks": [
        "cards-segment"
      ],
      "defaultContent": []
    },
    {
      "id": "rc8",
      "name": "Solutions statement - background video",
      "selector": [
        ".elementor-element-e5bf88e"
      ],
      "style": "dark",
      "blocks": [
        "hero-video"
      ],
      "defaultContent": []
    },
    {
      "id": "rc9",
      "name": "Products intro",
      "selector": [
        ".elementor-element-0faff3c"
      ],
      "style": "centered",
      "blocks": [],
      "defaultContent": [
        ".elementor-element-0faff3c .elementor-widget-text-editor h2"
      ]
    },
    {
      "id": "rc10",
      "name": "Products row 1",
      "selector": [
        ".elementor-element-c28d200"
      ],
      "style": null,
      "blocks": [
        "cards-product"
      ],
      "defaultContent": []
    },
    {
      "id": "rc11",
      "name": "Products row 2",
      "selector": [
        ".elementor-element-6cab8f9"
      ],
      "style": null,
      "blocks": [
        "cards-product"
      ],
      "defaultContent": []
    },
    {
      "id": "rc12",
      "name": "Market trends intro",
      "selector": [
        ".elementor-element-3326291"
      ],
      "style": "centered",
      "blocks": [],
      "defaultContent": [
        ".elementor-element-3326291 .elementor-widget-text-editor h2"
      ]
    },
    {
      "id": "rc13",
      "name": "Exclusive content promo",
      "selector": [
        ".elementor-element-f4e421d"
      ],
      "style": null,
      "blocks": [
        "hero-promo"
      ],
      "defaultContent": []
    }
  ]
};

const parsers = {
  'hero-video': heroVideoParser,
  'cards-segment': cardsSegmentParser,
  'cards-product': cardsProductParser,
  'hero-promo': heroPromoParser,
};

const transformers = [cleanupTransformer, sectionsTransformer];

function executeTransformers(hookName, element, payload) {
  const enhancedPayload = { ...payload, template: PAGE_TEMPLATE };
  transformers.forEach((fn) => {
    try { fn(hookName, element, enhancedPayload); }
    catch (e) { console.error(`Transformer failed at ${hookName}:`, e); }
  });
}

function findBlocksOnPage(document, template) {
  const pageBlocks = [];
  template.blocks.forEach((blockDef) => {
    blockDef.instances.forEach((selector) => {
      document.querySelectorAll(selector).forEach((element) => {
        // the same element can match more than one instance selector
        if (pageBlocks.some((b) => b.element === element)) return;
        pageBlocks.push({ name: blockDef.name, selector, element });
      });
    });
  });
  return pageBlocks;
}

export default {
  transform: (payload) => {
    const { document, url, params } = payload;
    const main = document.body;

    executeTransformers('beforeTransform', main, payload);

    const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);
    pageBlocks.forEach((block) => {
      if (!block.element.parentNode) return;
      const parser = parsers[block.name];
      if (!parser) return;
      try { parser(block.element, { document, url, params }); }
      catch (e) { console.error(`Failed to parse ${block.name} (${block.selector}):`, e); }
    });

    executeTransformers('afterTransform', main, payload);

    main.appendChild(document.createElement('hr'));
    WebImporter.rules.createMetadata(main, document);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    // Directory URLs (trailing slash) map to their index document: / -> /index, /en/ -> /en/index
    const { pathname } = new URL(params.originalURL);
    const rawPath = pathname.endsWith('/')
      ? `${pathname}index`
      : pathname.replace(/\.html?$/, '');
    const path = WebImporter.FileUtils.sanitizePath(rawPath);

    return [{
      element: main,
      path,
      report: { title: document.title, template: PAGE_TEMPLATE.name, blocks: pageBlocks.map((b) => b.name) },
    }];
  },
};
