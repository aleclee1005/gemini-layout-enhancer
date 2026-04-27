(function () {
  'use strict';

  const state = {
    expanded: true,
    split: false,
    focused: false,
    syncObserver: null,
    expandObserver: null,
    originalMessages: null,
    cloneEl: null,
    extractedInput: null,
  };

  /* ─── BOOT ─────────────────────────────────────────────────── */

  function boot() {
    injectStyle('gem-btn-css', `
      #gem-ext-btns {
        display: flex;
        gap: 8px;
        align-items: center;
      }
      .gem-ext-btn {
        width: 36px;
        height: 36px;
        border-radius: 50%;
        border: none;
        background: transparent;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        color: currentColor;
        transition: all 0.2s ease;
        padding: 0;
      }
      .gem-ext-btn:hover {
        background-color: rgba(255, 255, 255, 0.1);
      }
      .gem-ext-btn.active {
        background-color: rgba(255, 255, 255, 0.2);
      }
      .gem-ext-btn.gem-disabled {
        opacity: 0.35;
        cursor: not-allowed;
        pointer-events: none;
      }
      .gem-ext-btn svg {
        width: 20px;
        height: 20px;
      }
    `);

    scheduleInsert();

    new MutationObserver(debounce(scheduleInsert, 800))
      .observe(document.body, {
        childList: true,
        subtree: false,
      });
  }

  /* ─── BUTTON INSERTION ─────────────────────────────────────── */

  function scheduleInsert() {
    let tries = 0;
    const id = setInterval(() => {
      const preferred = document.querySelector('.enterprise-ogb-wrapper');
      const existing = document.getElementById('gem-ext-btns');
      if (preferred && existing && !preferred.contains(existing)) {
        existing.remove();
      }

      if (document.getElementById('gem-ext-btns')) {
        clearInterval(id);
        return;
      }

      const container = findBtnContainer();
      if (container) {
        clearInterval(id);
        insertButtons(container);
        return;
      }

      if (++tries > 40) {
        clearInterval(id);
      }
    }, 400);
  }

  function findBtnContainer() {
    const wrapper = document.querySelector('.enterprise-ogb-wrapper');
    if (wrapper) return wrapper;

    const rightSection = document.querySelector('top-bar-actions .right-section');
    if (rightSection) return rightSection;

    const link = document.querySelector('a.gb_B');
    if (!link) return null;

    return link.parentElement?.parentElement ?? null;
  }

  function insertButtons(container) {
    if (document.getElementById('gem-ext-btns')) return;

    const wrap = document.createElement('div');
    wrap.id = 'gem-ext-btns';

    const expandBtn = makeBtn('gem-btn-expand', svgExpand(), '宽屏模式',      onExpand);
    const splitBtn  = makeBtn('gem-btn-split',  svgSplit(),  '分割视图',      onSplit);
    const focusBtn  = makeBtn('gem-btn-focus',  svgFocus(),  '聚焦模式',      onFocus);
    const exportBtn = makeBtn('gem-btn-export', svgExport(), '导出 Markdown',  onExport);

    wrap.append(expandBtn, splitBtn, focusBtn, exportBtn);

    const gbD     = document.querySelector('a.gb_B')?.parentElement;
    const refNode = (gbD && container.contains(gbD)) ? gbD : container.firstChild;
    container.insertBefore(wrap, refNode);

    if (state.expanded) {
      expandBtn.classList.add('active');
      applyExpand();
    }

    updateSplitBtnState();

    const chatWinObs = findChatWindow();
    if (chatWinObs) {
      new MutationObserver(() => updateSplitBtnState())
        .observe(chatWinObs, { attributes: true, attributeFilter: ['class'] });
    }
  }

  function makeBtn(id, svg, title, handler) {
    const b = document.createElement('button');
    b.id        = id;
    b.title     = title;
    b.className = 'gem-ext-btn';
    b.appendChild(svg);
    b.addEventListener('click', handler);
    return b;
  }

  /* ─── SVG ICONS ────────────────────────────────────────────── */

  function svgExpand() {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('fill', 'none');
    svg.setAttribute('stroke', 'currentColor');
    svg.setAttribute('stroke-width', '2.2');
    svg.setAttribute('stroke-linecap', 'round');
    svg.setAttribute('stroke-linejoin', 'round');

    const path1 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path1.setAttribute('d', 'M3 12h18');

    const path2 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path2.setAttribute('d', 'M7 8l-4 4 4 4');

    const path3 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path3.setAttribute('d', 'M17 8l4 4-4 4');

    svg.append(path1, path2, path3);
    return svg;
  }

  function svgSplit() {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('fill', 'none');
    svg.setAttribute('stroke', 'currentColor');
    svg.setAttribute('stroke-width', '2.2');
    svg.setAttribute('stroke-linecap', 'round');
    svg.setAttribute('stroke-linejoin', 'round');

    const rect1 = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rect1.setAttribute('x', '2');
    rect1.setAttribute('y', '3');
    rect1.setAttribute('width', '8.5');
    rect1.setAttribute('height', '18');
    rect1.setAttribute('rx', '1.5');

    const rect2 = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rect2.setAttribute('x', '13.5');
    rect2.setAttribute('y', '3');
    rect2.setAttribute('width', '8.5');
    rect2.setAttribute('height', '18');
    rect2.setAttribute('rx', '1.5');

    svg.append(rect1, rect2);
    return svg;
  }

  function svgFocus() {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('fill', 'none');
    svg.setAttribute('stroke', 'currentColor');
    svg.setAttribute('stroke-width', '2.2');
    svg.setAttribute('stroke-linecap', 'round');
    svg.setAttribute('stroke-linejoin', 'round');
    // Four corner brackets (focus/maximize frame)
    for (const [d] of [
      ['M8 3H5a2 2 0 0 0-2 2v3'],
      ['M21 8V5a2 2 0 0 0-2-2h-3'],
      ['M3 16v3a2 2 0 0 0 2 2h3'],
      ['M16 21h3a2 2 0 0 0 2-2v-3'],
    ]) {
      const p = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      p.setAttribute('d', d);
      svg.appendChild(p);
    }
    return svg;
  }

  function svgExport() {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('fill', 'none');
    svg.setAttribute('stroke', 'currentColor');
    svg.setAttribute('stroke-width', '2.2');
    svg.setAttribute('stroke-linecap', 'round');
    svg.setAttribute('stroke-linejoin', 'round');
    // Download arrow + base line
    for (const [tag, attrs] of [
      ['path', { d: 'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4' }],
      ['polyline', { points: '7 10 12 15 17 10' }],
      ['line', { x1: '12', y1: '15', x2: '12', y2: '3' }],
    ]) {
      const el = document.createElementNS('http://www.w3.org/2000/svg', tag);
      for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
      svg.appendChild(el);
    }
    return svg;
  }

  /* ─── WIDESCREEN (LEFT BUTTON) ─────────────────────────────── */

  function onExpand() {
    state.expanded = !state.expanded;
    document.getElementById('gem-btn-expand')
      ?.classList.toggle('active', state.expanded);
    applyExpand();
  }

  function applyExpand() {
    // Clean up previous unlock
    document.querySelectorAll('[data-gem-unlock]').forEach(el => {
      el.style.removeProperty('max-width');
      el.style.removeProperty('width');
      el.removeAttribute('data-gem-unlock');
    });

    removeStyle('gem-expand-css');

    if (state.expandObserver) {
      state.expandObserver.disconnect();
      state.expandObserver = null;
    }

    if (!state.expanded) return;

    // Phase 1: CSS global unlock
    injectStyle('gem-expand-css', `
      #app-root chat-window,
      #app-root chat-window > div,
      #app-root conversation-container,
      #app-root .content-wrapper,
      #app-root .content-wrapper > div,
      #app-root .content-wrapper > div > div {
        max-width: none !important;
        width: 100% !important;
      }

      #app-root bard-sidenav-content {
        max-width: none !important;
      }

      #app-root input-container {
        max-width: none !important;
        width: 100% !important;
        padding-right: 16px !important;
        box-sizing: border-box !important;
      }

      #app-root input-container > fieldset {
        max-width: none !important;
        margin-right: 0 !important;
        box-sizing: border-box !important;
      }

      #app-root .zero-state-block-container,
      #app-root .human-review-disclosure-container,
      #app-root hallucination-disclaimer {
        max-width: none !important;
        width: 100% !important;
        box-sizing: border-box !important;
      }

      #app-root .text-input-field,
      #app-root .text-input-field.with-toolbox-drawer {
        max-width: 100vw !important;
        width: 100% !important;
        min-width: unset !important;
        box-sizing: border-box !important;
      }

      #app-root model-response,
      #app-root response-container,
      #app-root .presented-response-container,
      #app-root .response-container-content {
        max-width: none !important;
        width: 100% !important;
      }

      #app-root .message-content,
      #app-root [data-block-type],
      #app-root .response-item {
        max-width: none !important;
        width: 100% !important;
      }

      #app-root [id^="user-query-content"] {
        max-width: none !important;
        width: 100% !important;
      }

      #app-root .user-query-bubble-with-background {
        max-width: none !important;
        width: 100% !important;
      }

      #app-root .chat-messages,
      #app-root .message-item {
        max-width: 100% !important;
        width: 100% !important;
      }
    `);

    // Phase 2: JS DOM traversal unlock
    applyPhase2();

    // Continuous monitoring: auto-unlock new messages
    const chatWin = findChatWindow();
    if (chatWin) {
      let phase2Pending = false;

      state.expandObserver = new MutationObserver(() => {
        if (phase2Pending) return;
        phase2Pending = true;

        requestAnimationFrame(() => {
          phase2Pending = false;
          if (state.expanded) applyPhase2();
        });
      });

      state.expandObserver.observe(chatWin, {
        childList: true,
        subtree: true,
      });
    }
  }

  function applyPhase2() {
    const chatWin = findChatWindow();
    const vpWidth = window.innerWidth;

    const respElements  = document.querySelectorAll('model-response');
    const queryElements = document.querySelectorAll('.user-query-bubble-with-background');
    const pivots        = [...respElements, ...queryElements];

    const visited = new Set();

    for (const pivot of pivots) {
      let el = pivot.parentElement;

      while (el && el !== chatWin && el !== document.body) {
        if (el.tagName.toLowerCase() === 'bard-sidenav-content') {
          el = el.parentElement;
          continue;
        }

        if (!visited.has(el)) {
          visited.add(el);

          const st  = window.getComputedStyle(el);
          const mxW = parseFloat(st.maxWidth);
          const w   = parseFloat(st.width);

          if (!isNaN(mxW) && mxW > 0 && mxW < vpWidth) {
            el.setAttribute('data-gem-unlock', 'true');
            el.style.setProperty('max-width', 'none', 'important');
          }

          if (!isNaN(w) && w > 0 && w < vpWidth) {
            el.setAttribute('data-gem-unlock', 'true');
            el.style.setProperty('width', '100%', 'important');
          }
        }

        el = el.parentElement;
      }
    }
  }

  /* ─── SPLIT VIEW (RIGHT BUTTON) ────────────────────────────── */

  function findChatWindow() {
    return (
      document.querySelector('chat-window') ||
      document.querySelector('gemini-chat-window') ||
      document.querySelector('[class*="chat-window"]') ||
      null
    );
  }

  function findMessagesContainer(chatWin) {
    // Try explicit element/class names first
    const byName =
      chatWin.querySelector('messages-container') ||
      chatWin.querySelector('conversation-list') ||
      chatWin.querySelector('.messages-container') ||
      chatWin.querySelector('[class*="messages-container"]') ||
      chatWin.querySelector('[class*="conversation-list"]');
    if (byName) return byName;

    // Fallback: find the direct child of chatWin that contains model-response
    const firstMsg = chatWin.querySelector('model-response, .model-response');
    if (!firstMsg) return null;
    let el = firstMsg.parentElement;
    while (el && el.parentElement !== chatWin) {
      el = el.parentElement;
    }
    return el || null;
  }

  function onSplit() {
    const chatWin = findChatWindow();
    if (chatWin?.classList.contains('center-input-layout')) return;

    state.split = !state.split;
    document.getElementById('gem-btn-split')
      ?.classList.toggle('active', state.split);

    if (state.split) {
      enableSplit();
    } else {
      disableSplit();
    }
  }

  function updateSplitBtnState() {
    const chatWin    = findChatWindow();
    const isHomePage = chatWin?.classList.contains('center-input-layout');
    const splitBtn   = document.getElementById('gem-btn-split');
    if (!splitBtn) return;

    if (isHomePage) {
      splitBtn.classList.add('gem-disabled');
      splitBtn.title = '分割视图（请先开始对话）';
      if (state.split) {
        state.split = false;
        splitBtn.classList.remove('active');
        disableSplit();
      }
    } else {
      splitBtn.classList.remove('gem-disabled');
      splitBtn.title = '分割视图';
    }
  }

  function enableSplit() {
    const chatWin = findChatWindow();
    if (!chatWin) {
      console.warn('[GemExt] chat-window not found');
      return;
    }

    const msgContainer = findMessagesContainer(chatWin);
    if (!msgContainer) {
      console.warn('[GemExt] messages-container not found');
      return;
    }

    state.originalMessages = msgContainer;

    // Extract input-container from inside msgContainer → make it a direct
    // child of chatWin so the CSS Grid can stretch it across both columns
    const inputEl = findInputContainer(msgContainer);
    if (inputEl) {
      msgContainer.after(inputEl);   // moves inputEl out, now sibling of msgContainer
      state.extractedInput = inputEl;
    }

    msgContainer.setAttribute('data-gem-orig', 'true');

    const clone = msgContainer.cloneNode(true);
    stripIds(clone);
    clone.id = 'gem-clone';
    purgeInputFromClone(clone);
    state.cloneEl = clone;

    chatWin.setAttribute('data-gem-split', 'true');
    injectStyle('gem-split-css', splitCSS());

    // Insert clone between msgContainer and inputEl
    msgContainer.after(clone);
    startSync(msgContainer);
  }

  function disableSplit() {
    stopSync();

    const chatWin = findChatWindow();
    if (chatWin) chatWin.removeAttribute('data-gem-split');

    if (state.originalMessages) {
      state.originalMessages.removeAttribute('data-gem-orig');
    }

    if (state.cloneEl) {
      state.cloneEl.remove();
      state.cloneEl = null;
    }

    // Put input-container back inside messages-container
    if (state.extractedInput && state.originalMessages) {
      state.originalMessages.appendChild(state.extractedInput);
      state.extractedInput = null;
    }

    state.originalMessages = null;
    removeStyle('gem-split-css');
  }

  function startSync(original) {
    let pending = false;

    state.syncObserver = new MutationObserver(() => {
      if (pending) return;
      pending = true;

      requestAnimationFrame(() => {
        pending = false;

        if (!state.cloneEl || !state.originalMessages) return;

        // Save right column scroll position
        const innerScrollEl = state.cloneEl.querySelector('.chat-history-scroll-container');
        const scrollTop = innerScrollEl
          ? innerScrollEl.scrollTop
          : state.cloneEl.scrollTop;

        // Re-clone with latest content
        const fresh = state.originalMessages.cloneNode(true);
        stripIds(fresh);
        fresh.id = 'gem-clone';
        purgeInputFromClone(fresh);

        state.cloneEl.replaceWith(fresh);
        state.cloneEl = fresh;

        // Restore scroll after paint
        requestAnimationFrame(() => {
          const freshInner = fresh.querySelector('.chat-history-scroll-container');
          if (freshInner) {
            freshInner.scrollTop = scrollTop;
          } else {
            fresh.scrollTop = scrollTop;
          }
        });
      });
    });

    state.syncObserver.observe(original, {
      childList: true,
      subtree: true,
      characterData: true,
    });
  }

  function stopSync() {
    state.syncObserver?.disconnect();
    state.syncObserver = null;
  }

  function splitCSS() {
    return `
      [data-gem-split] {
        display: grid !important;
        grid-template-columns: 1fr 1fr !important;
        grid-template-rows: minmax(0, 1fr) auto !important;
        overflow: hidden;
      }

      [data-gem-orig] {
        grid-column: 1 !important;
        grid-row: 1 !important;
        overflow-y: auto !important;
        min-height: 0 !important;
      }

      #gem-clone {
        grid-column: 2 !important;
        grid-row: 1 !important;
        overflow-y: auto !important;
        min-height: 0 !important;
        border-left: 1px solid rgba(255, 255, 255, 0.12);
      }

      [data-gem-split] > *:not([data-gem-orig]):not(#gem-clone) {
        grid-column: 1 / -1 !important;
        grid-row: 2 !important;
      }

      /* Safety net: hide any input that leaked into the clone */
      #gem-clone input-container,
      #gem-clone .input-container,
      #gem-clone prompt-box,
      #gem-clone .prompt-box,
      #gem-clone input-area,
      #gem-clone .input-area {
        display: none !important;
      }
    `;
  }

  /* ─── FOCUS MODE ────────────────────────────────────────────── */

  function onFocus() {
    state.focused = !state.focused;
    document.getElementById('gem-btn-focus')
      ?.classList.toggle('active', state.focused);
    applyFocus();
  }

  function applyFocus() {
    removeStyle('gem-focus-css');
    document.getElementById('gem-focus-exit')?.remove();

    if (!state.focused) return;

    injectStyle('gem-focus-css', `
      /* Hide sidebar */
      #app-root bard-sidenav,
      #app-root mat-sidenav,
      #app-root side-navigation,
      #app-root nav-drawer,
      #app-root [class*="sidenav"]:not(bard-sidenav-content):not([class*="content"]) {
        display: none !important;
        width: 0 !important;
      }
      /* Hide top bar */
      #app-root top-bar,
      #app-root .top-bar,
      #app-root app-header,
      #app-root mat-toolbar,
      #app-root header:not(#gem-focus-exit) {
        display: none !important;
      }
      /* Reclaim the space */
      #app-root bard-sidenav-content,
      #app-root mat-sidenav-content,
      #app-root .sidenav-content {
        margin-left: 0 !important;
        padding-left: 0 !important;
        margin-top: 0 !important;
        padding-top: 0 !important;
      }
    `);

    // Floating exit button
    const exit = document.createElement('button');
    exit.id = 'gem-focus-exit';
    exit.title = '退出聚焦模式 (Esc)';
    exit.textContent = '✕';
    exit.style.cssText = [
      'position:fixed', 'top:10px', 'right:12px', 'z-index:2147483647',
      'background:rgba(255,255,255,0.12)', 'border:none', 'color:currentColor',
      'border-radius:50%', 'width:32px', 'height:32px', 'cursor:pointer',
      'font-size:14px', 'display:flex', 'align-items:center', 'justify-content:center',
      'transition:background 0.2s',
    ].join(';');
    exit.onmouseenter = () => exit.style.background = 'rgba(255,255,255,0.25)';
    exit.onmouseleave = () => exit.style.background = 'rgba(255,255,255,0.12)';
    exit.addEventListener('click', () => {
      state.focused = false;
      document.getElementById('gem-btn-focus')?.classList.remove('active');
      applyFocus();
    });
    document.body.appendChild(exit);

    // Esc key to exit
    const onKey = (e) => {
      if (e.key === 'Escape' && state.focused) {
        exit.click();
        document.removeEventListener('keydown', onKey);
      }
    };
    document.addEventListener('keydown', onKey);
  }

  /* ─── EXPORT MARKDOWN ───────────────────────────────────────── */

  function onExport() {
    const chatWin = findChatWindow();
    const msgRoot = state.originalMessages || findMessagesContainer(chatWin);
    if (!msgRoot) { showToast('找不到对话内容'); return; }

    const lines = [];
    const title = document.title || 'Gemini 对话';
    lines.push(`# ${title}`, `> 导出时间：${new Date().toLocaleString('zh-CN')}`, '');

    // Walk messages in DOM order
    const nodes = msgRoot.querySelectorAll(
      'model-response, [id^="user-query-content"], .user-query-bubble-with-background'
    );

    for (const node of nodes) {
      const tag = node.tagName.toLowerCase();
      const isUser = tag !== 'model-response';

      if (isUser) {
        lines.push('## You', '');
        lines.push(nodeToMd(node).trim(), '');
      } else {
        lines.push('## Gemini', '');
        const content =
          node.querySelector('.response-container-content, .message-content, [class*="response-content"]')
          || node;
        lines.push(nodeToMd(content).trim(), '');
      }
    }

    if (lines.length <= 3) { showToast('没有找到对话内容'); return; }

    const md = lines.join('\n');
    navigator.clipboard.writeText(md)
      .then(() => showToast('✓ Markdown 已复制到剪贴板'))
      .catch(() => showToast('复制失败，请检查剪贴板权限'));
  }

  function nodeToMd(node) {
    if (node.nodeType === Node.TEXT_NODE) return node.textContent;
    if (node.nodeType !== Node.ELEMENT_NODE) return '';

    const tag = node.tagName.toLowerCase();
    const ch = () => [...node.childNodes].map(nodeToMd).join('');

    switch (tag) {
      case 'h1': return `# ${ch()}\n\n`;
      case 'h2': return `## ${ch()}\n\n`;
      case 'h3': return `### ${ch()}\n\n`;
      case 'h4': return `#### ${ch()}\n\n`;
      case 'h5': return `##### ${ch()}\n\n`;
      case 'h6': return `###### ${ch()}\n\n`;
      case 'strong': case 'b': return `**${ch()}**`;
      case 'em': case 'i': return `*${ch()}*`;
      case 'del': case 's': return `~~${ch()}~~`;
      case 'code':
        if (node.closest('pre')) return ch();
        return `\`${ch()}\``;
      case 'pre': {
        const lang = node.querySelector('code')?.className?.match(/language-(\w+)/)?.[1] ?? '';
        const code = node.querySelector('code')?.textContent ?? ch();
        return `\`\`\`${lang}\n${code}\n\`\`\`\n\n`;
      }
      case 'p': return `${ch()}\n\n`;
      case 'br': return '\n';
      case 'hr': return '\n---\n\n';
      case 'ul': {
        const items = [...node.children].filter(c => c.tagName.toLowerCase() === 'li');
        return items.map(li => `- ${nodeToMd(li).trim()}`).join('\n') + '\n\n';
      }
      case 'ol': {
        const items = [...node.children].filter(c => c.tagName.toLowerCase() === 'li');
        return items.map((li, i) => `${i + 1}. ${nodeToMd(li).trim()}`).join('\n') + '\n\n';
      }
      case 'li': return ch();
      case 'a': {
        const href = node.getAttribute('href');
        return href ? `[${ch()}](${href})` : ch();
      }
      case 'blockquote': return `> ${ch().replace(/\n/g, '\n> ')}\n\n`;
      case 'table': return tablToMd(node) + '\n\n';
      case 'img': return `![${node.alt || ''}](${node.src || ''})`;
      case 'button': case 'svg': case 'style': case 'script': return '';
      default: return ch();
    }
  }

  function tablToMd(table) {
    const rows = [...table.querySelectorAll('tr')];
    if (!rows.length) return '';
    const toRow = (row) => {
      const cells = [...row.querySelectorAll('th,td')]
        .map(c => nodeToMd(c).trim().replace(/\|/g, '\\|').replace(/\n+/g, ' '));
      return '| ' + cells.join(' | ') + ' |';
    };
    const sep = '| ' + [...rows[0].querySelectorAll('th,td')].map(() => '---').join(' | ') + ' |';
    return [toRow(rows[0]), sep, ...rows.slice(1).map(toRow)].join('\n');
  }

  function showToast(msg) {
    const t = document.createElement('div');
    t.textContent = msg;
    t.style.cssText = [
      'position:fixed', 'bottom:28px', 'left:50%', 'transform:translateX(-50%)',
      'background:rgba(30,30,35,0.95)', 'color:#fff', 'padding:10px 22px',
      'border-radius:10px', 'font-size:14px', 'z-index:2147483647',
      'pointer-events:none', 'transition:opacity 0.3s', 'white-space:nowrap',
      'box-shadow:0 4px 16px rgba(0,0,0,0.4)',
    ].join(';');
    document.body.appendChild(t);
    setTimeout(() => { t.style.opacity = '0'; setTimeout(() => t.remove(), 320); }, 2200);
  }

  /* ─── UTILITIES ─────────────────────────────────────────────── */

  function findInputContainer(root) {
    return (
      root.querySelector('input-container') ||
      root.querySelector('.input-container') ||
      root.querySelector('[class*="input-container"]') ||
      root.querySelector('prompt-box') ||
      root.querySelector('.prompt-box') ||
      null
    );
  }

  function purgeInputFromClone(cloneEl) {
    const sel = [
      'input-container', '.input-container',
      'prompt-box',      '.prompt-box',
      'input-area',      '.input-area',
      'footer',          '.input-footer',
    ].join(',');
    cloneEl.querySelectorAll(sel).forEach(el => el.remove());
  }

  function stripIds(root) {
    root.removeAttribute('id');
    root.querySelectorAll('[id]').forEach(el => el.removeAttribute('id'));
  }

  function injectStyle(id, css) {
    removeStyle(id);
    const s = document.createElement('style');
    s.id = id;
    s.textContent = css;
    document.head.appendChild(s);
  }

  function removeStyle(id) {
    document.getElementById(id)?.remove();
  }

  function debounce(fn, ms) {
    let t;
    return (...a) => {
      clearTimeout(t);
      t = setTimeout(() => fn(...a), ms);
    };
  }

  /* ─── STARTUP ───────────────────────────────────────────────── */

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
