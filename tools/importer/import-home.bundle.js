/* eslint-disable */
var CustomImportScript = (() => {
  var __defProp = Object.defineProperty;
  var __defProps = Object.defineProperties;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __spreadValues = (a, b) => {
    for (var prop in b || (b = {}))
      if (__hasOwnProp.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    if (__getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(b)) {
        if (__propIsEnum.call(b, prop))
          __defNormalProp(a, prop, b[prop]);
      }
    return a;
  };
  var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // tools/importer/import-home.js
  var import_home_exports = {};
  __export(import_home_exports, {
    default: () => import_home_default
  });

  // tools/importer/parsers/hero-video.js
  function findVimeoId(element) {
    const iframe = element.querySelector('.elementor-background-video-container iframe[src*="vimeo"], iframe[src*="vimeo.com"]');
    if (iframe) {
      const m = (iframe.getAttribute("src") || "").match(/vimeo\.com\/(?:video\/)?(\d+)/);
      if (m) return { id: m[1], title: iframe.getAttribute("title") || "" };
    }
    const settingsEls = [element, ...element.querySelectorAll("[data-settings]")];
    for (const el of settingsEls) {
      const raw = el.getAttribute && el.getAttribute("data-settings");
      if (!raw) continue;
      const m = raw.replace(/\\\//g, "/").match(/vimeo\.com\/(?:video\/)?(\d+)/);
      if (m) return { id: m[1], title: "" };
    }
    return null;
  }
  function parse(element, { document: document2 }) {
    const cells = [];
    const video = findVimeoId(element);
    if (video) {
      const href = `https://vimeo.com/${video.id}`;
      const a = document2.createElement("a");
      a.href = href;
      a.textContent = href;
      if (video.title) a.title = video.title;
      cells.push([a]);
    }
    const content = [];
    element.querySelectorAll(".elementor-widget-text-editor .elementor-widget-container, .elementor-widget-heading .elementor-widget-container").forEach((container) => {
      [...container.children].forEach((child) => {
        if (child.textContent.trim() || child.querySelector("img")) content.push(child);
      });
    });
    cells.push([content]);
    const block = WebImporter.Blocks.createBlock(document2, { name: "hero-video", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-segment.js
  var BG_FALLBACK = {
    "9c67a4b": "https://bradescobank.com/wp-content/uploads/2024/05/desk-thumb-discovery-2.jpg",
    "109f75e": "https://bradescobank.com/wp-content/uploads/2024/05/desk-thumb-discovery-1.jpg",
    "a6eeed4": "https://bradescobank.com/wp-content/uploads/2024/05/desk-thumb-discovery-4.jpg",
    "a264488": "https://bradescobank.com/wp-content/uploads/2024/05/desk-thumb-discovery-3.jpg"
  };
  function getBackgroundUrl(el, document2) {
    const extract = (value) => {
      const m = (value || "").match(/url\(\s*["']?([^"')]+)["']?\s*\)/);
      return m ? m[1] : null;
    };
    let url = extract(el.style && el.style.backgroundImage);
    if (!url) {
      try {
        const view = document2.defaultView || (typeof window !== "undefined" ? window : null);
        if (view && view.getComputedStyle) url = extract(view.getComputedStyle(el).backgroundImage);
      } catch (e) {
      }
    }
    if (!url) {
      const idClass = [...el.classList].find((c) => /^elementor-element-[0-9a-f]{7}$/.test(c));
      if (idClass) url = BG_FALLBACK[idClass.replace("elementor-element-", "")] || null;
    }
    return url;
  }
  function parse2(element, { document: document2 }) {
    const cells = [];
    const tiles = [...element.querySelectorAll(":scope > a.e-con, :scope > .e-con-inner > a.e-con")];
    tiles.forEach((tile) => {
      const labelEl = tile.querySelector(".title-services .elementor-widget-container, .elementor-widget-text-editor .elementor-widget-container");
      const labelText = (labelEl ? labelEl.textContent : tile.textContent).trim();
      const imgCell = [];
      const existingImg = tile.querySelector("img");
      const bg = getBackgroundUrl(tile, document2);
      if (existingImg) {
        imgCell.push(existingImg);
      } else if (bg) {
        const img = document2.createElement("img");
        img.src = bg;
        img.alt = labelText;
        imgCell.push(img);
      }
      const a = document2.createElement("a");
      a.href = tile.getAttribute("href") || "";
      a.textContent = labelText;
      const p = document2.createElement("p");
      p.append(a);
      cells.push([imgCell, [p]]);
    });
    const block = WebImporter.Blocks.createBlock(document2, { name: "cards-segment", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-product.js
  var BG_FALLBACK2 = {
    e274826: "https://bradescobank.com/wp-content/uploads/2024/10/desk-thumb-home-investments-2.jpg",
    "1391f39": "https://bradescobank.com/wp-content/uploads/2024/10/desk-thumb-produto-3.jpg",
    f9193f1: "https://bradescobank.com/wp-content/uploads/2026/08/thumb-bradesco-credit-home-1.webp",
    "3618faf": "https://bradescobank.com/wp-content/uploads/2025/12/home-zelle-2.webp"
  };
  function getBackgroundUrl2(el, document2) {
    const extract = (value) => {
      const m = (value || "").match(/url\(\s*["']?([^"')]+)["']?\s*\)/);
      return m ? m[1] : null;
    };
    let url = extract(el.style && el.style.backgroundImage);
    if (!url) {
      try {
        const view = document2.defaultView || (typeof window !== "undefined" ? window : null);
        if (view && view.getComputedStyle) url = extract(view.getComputedStyle(el).backgroundImage);
      } catch (e) {
      }
    }
    if (!url) {
      const idClass = [...el.classList].find((c) => /^elementor-element-[0-9a-f]{7}$/.test(c));
      if (idClass) url = BG_FALLBACK2[idClass.replace("elementor-element-", "")] || null;
    }
    return url;
  }
  function widgetContent(container, document2) {
    const out = [];
    let loose = null;
    [...container.childNodes].forEach((node) => {
      const isBlockEl = node.nodeType === 1 && /^(P|H[1-6]|UL|OL|DIV|TABLE|BLOCKQUOTE)$/.test(node.tagName);
      if (isBlockEl) {
        loose = null;
        if (node.textContent.trim() || node.querySelector("img")) out.push(node);
        return;
      }
      if (node.nodeType === 3 && !node.textContent.trim()) {
        if (loose) loose.append(node);
        return;
      }
      if (!loose) {
        loose = document2.createElement("p");
        out.push(loose);
      }
      loose.append(node);
    });
    return out.filter((el) => el.textContent.trim() || el.querySelector("img"));
  }
  function parse3(element, { document: document2 }) {
    const cells = [];
    const cards = [...element.querySelectorAll(":scope > .e-con.e-child")];
    cards.forEach((card) => {
      const imgCell = [];
      const directImg = card.querySelector(":scope > img");
      if (directImg) {
        imgCell.push(directImg);
      } else {
        const bg = getBackgroundUrl2(card, document2);
        if (bg) {
          const img = document2.createElement("img");
          img.src = bg;
          img.alt = "";
          imgCell.push(img);
        }
      }
      const textCell = [];
      const textWrap = card.querySelector(".discovery-product");
      if (textWrap) {
        textWrap.querySelectorAll(".elementor-widget").forEach((widget) => {
          const container = widget.querySelector(".elementor-widget-container") || widget;
          if (widget.classList.contains("elementor-widget-image")) {
            const img = container.querySelector("img");
            if (img) {
              const p = document2.createElement("p");
              p.append(img);
              textCell.push(p);
            }
            return;
          }
          textCell.push(...widgetContent(container, document2));
        });
      }
      const btn = card.querySelector(":scope > .elementor-widget-button a[href], :scope > .elementor-widget-button a");
      if (btn) {
        const a = document2.createElement("a");
        a.href = btn.getAttribute("href") || "";
        a.textContent = btn.textContent.trim();
        const p = document2.createElement("p");
        p.append(a);
        textCell.push(p);
      }
      card.querySelectorAll(":scope > .elementor-widget-text-editor").forEach((widget) => {
        const container = widget.querySelector(".elementor-widget-container") || widget;
        textCell.push(...widgetContent(container, document2));
      });
      if (!imgCell.length && !textCell.length) return;
      cells.push([imgCell, textCell]);
    });
    const block = WebImporter.Blocks.createBlock(document2, { name: "cards-product", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/hero-promo.js
  var BG_FALLBACK3 = {
    f4e421d: "https://bradescobank.com/wp-content/uploads/2024/10/bg-Exclusive-1.jpg"
  };
  function getBackgroundUrl3(el, document2) {
    const extract = (value) => {
      const m = (value || "").match(/url\(\s*["']?([^"')]+)["']?\s*\)/);
      return m ? m[1] : null;
    };
    let url = extract(el.style && el.style.backgroundImage);
    if (!url) {
      try {
        const view = document2.defaultView || (typeof window !== "undefined" ? window : null);
        if (view && view.getComputedStyle) url = extract(view.getComputedStyle(el).backgroundImage);
      } catch (e) {
      }
    }
    if (!url) {
      const idClass = [...el.classList].find((c) => /^elementor-element-[0-9a-f]{7}$/.test(c));
      if (idClass) url = BG_FALLBACK3[idClass.replace("elementor-element-", "")] || null;
    }
    return url;
  }
  function parse4(element, { document: document2 }) {
    const cells = [];
    const directImg = element.querySelector(":scope > img");
    let bgImg = null;
    if (directImg) {
      bgImg = directImg;
    } else {
      const bg = getBackgroundUrl3(element, document2);
      if (bg) {
        bgImg = document2.createElement("img");
        bgImg.src = bg;
        bgImg.alt = "";
      }
    }
    if (bgImg) cells.push([bgImg]);
    const content = [];
    element.querySelectorAll(".elementor-widget-text-editor .elementor-widget-container, .elementor-widget-heading .elementor-widget-container").forEach((container) => {
      [...container.children].forEach((child) => {
        if (child.textContent.trim()) content.push(child);
      });
    });
    element.querySelectorAll(".elementor-widget-button a").forEach((btn) => {
      const a = document2.createElement("a");
      a.href = btn.getAttribute("href") || "";
      a.textContent = btn.textContent.trim();
      const p = document2.createElement("p");
      p.append(a);
      content.push(p);
    });
    cells.push([content]);
    const block = WebImporter.Blocks.createBlock(document2, { name: "hero-promo", cells });
    element.replaceWith(block);
  }

  // tools/importer/transformers/bradescobank-cleanup.js
  function transform(hookName, element, payload) {
    if (hookName === "beforeTransform") {
      WebImporter.DOMUtils.remove(element, [
        "#cookie-notice",
        "div.ct-drawer-canvas",
        "#offcanvas",
        "a.skip-link",
        "access-widget-ui",
        "a.acsb-sr-only",
        ".acsb-trigger",
        ".otgs-development-site-front-end"
      ]);
      WebImporter.DOMUtils.remove(element, [
        ".elementor-element-df3b3d3",
        ".elementor-element-1191c87"
      ]);
      WebImporter.DOMUtils.remove(element, [".elementor-element-b9a3d24"]);
      element.querySelectorAll(".elementor-hidden-desktop.elementor-hidden-laptop.elementor-hidden-tablet.elementor-hidden-mobile").forEach((el) => el.remove());
    }
    if (hookName === "afterTransform") {
      WebImporter.DOMUtils.remove(element, [
        "#header",
        "header.ct-header",
        "footer.elementor",
        "footer.elementor-location-footer",
        "nav.mobile-menu",
        "script",
        "style",
        "noscript",
        "link",
        "iframe:not([src])"
      ]);
      [...element.querySelectorAll("p, span, div")].filter((el) => !el.children.length && /^Press Option\+1 for screen-reader mode/.test(el.textContent.trim())).forEach((el) => el.remove());
      element.querySelectorAll("[data-elementor-id], [data-id], [data-element_type], [data-settings], [data-widget_type], [onclick], [data-track]").forEach((el) => {
        ["data-elementor-id", "data-id", "data-element_type", "data-settings", "data-widget_type", "onclick", "data-track"].forEach((attr) => el.removeAttribute(attr));
      });
    }
  }

  // tools/importer/transformers/bradescobank-sections.js
  var MARKER = "data-excat-section-id";
  function findSectionElement(root, section) {
    const selectors = Array.isArray(section.selector) ? section.selector : [section.selector];
    for (const sel of selectors) {
      if (!sel) continue;
      try {
        const el = root.querySelector(sel);
        if (el) return el;
      } catch (e) {
      }
    }
    return null;
  }
  function transform2(hookName, element, payload) {
    const sections = payload && payload.template && payload.template.sections;
    if (!sections || sections.length < 2) return;
    const doc = element.ownerDocument || document;
    if (hookName === "beforeTransform") {
      for (let i = sections.length - 1; i >= 0; i -= 1) {
        const section = sections[i];
        const el = findSectionElement(element, section);
        if (!el || !el.parentNode) continue;
        if (i === 0 && !section.style) continue;
        const hr = doc.createElement("hr");
        if (section.style) hr.setAttribute(MARKER, section.id);
        if (i === 0) hr.setAttribute("data-excat-first-section", "true");
        el.parentNode.insertBefore(hr, el);
      }
    }
    if (hookName === "afterTransform") {
      for (let i = sections.length - 1; i >= 0; i -= 1) {
        const section = sections[i];
        if (!section.style) continue;
        const marker = element.querySelector(`hr[${MARKER}="${section.id}"]`);
        if (!marker) continue;
        let end = marker.nextElementSibling;
        let last = marker;
        while (end && end.tagName !== "HR") {
          last = end;
          end = end.nextElementSibling;
        }
        const meta = WebImporter.Blocks.createBlock(doc, {
          name: "Section Metadata",
          cells: { style: section.style }
        });
        if (last.nextSibling) {
          last.parentNode.insertBefore(meta, last.nextSibling);
        } else {
          last.parentNode.appendChild(meta);
        }
        if (marker.hasAttribute("data-excat-first-section")) {
          marker.remove();
        } else {
          marker.removeAttribute(MARKER);
        }
      }
    }
  }

  // tools/importer/import-home.js
  var PAGE_TEMPLATE = {
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
  var parsers = {
    "hero-video": parse,
    "cards-segment": parse2,
    "cards-product": parse3,
    "hero-promo": parse4
  };
  var transformers = [transform, transform2];
  function executeTransformers(hookName, element, payload) {
    const enhancedPayload = __spreadProps(__spreadValues({}, payload), { template: PAGE_TEMPLATE });
    transformers.forEach((fn) => {
      try {
        fn(hookName, element, enhancedPayload);
      } catch (e) {
        console.error(`Transformer failed at ${hookName}:`, e);
      }
    });
  }
  function findBlocksOnPage(document2, template) {
    const pageBlocks = [];
    template.blocks.forEach((blockDef) => {
      blockDef.instances.forEach((selector) => {
        document2.querySelectorAll(selector).forEach((element) => {
          if (pageBlocks.some((b) => b.element === element)) return;
          pageBlocks.push({ name: blockDef.name, selector, element });
        });
      });
    });
    return pageBlocks;
  }
  var import_home_default = {
    transform: (payload) => {
      const { document: document2, url, params } = payload;
      const main = document2.body;
      executeTransformers("beforeTransform", main, payload);
      const pageBlocks = findBlocksOnPage(document2, PAGE_TEMPLATE);
      pageBlocks.forEach((block) => {
        if (!block.element.parentNode) return;
        const parser = parsers[block.name];
        if (!parser) return;
        try {
          parser(block.element, { document: document2, url, params });
        } catch (e) {
          console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
        }
      });
      executeTransformers("afterTransform", main, payload);
      main.appendChild(document2.createElement("hr"));
      WebImporter.rules.createMetadata(main, document2);
      WebImporter.rules.transformBackgroundImages(main, document2);
      WebImporter.rules.adjustImageUrls(main, url, params.originalURL);
      const { pathname } = new URL(params.originalURL);
      const rawPath = pathname.endsWith("/") ? `${pathname}index` : pathname.replace(/\.html?$/, "");
      const path = WebImporter.FileUtils.sanitizePath(rawPath);
      return [{
        element: main,
        path,
        report: { title: document2.title, template: PAGE_TEMPLATE.name, blocks: pageBlocks.map((b) => b.name) }
      }];
    }
  };
  return __toCommonJS(import_home_exports);
})();
