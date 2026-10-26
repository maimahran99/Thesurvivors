(() => {
  'use strict';

  const data = window.SITE_DATA;
  const $ = id => document.getElementById(id);
  const english = Object.fromEntries(
    Array.from(document.querySelectorAll('[data-i18n]'), el => [
      el.dataset.i18n,
      el.innerHTML
    ])
  );
  const scene = window.CASE_SCENE;

  const reducedMotion = { matches: false };
  try {
    reducedMotion.matches =
      localStorage.getItem('survivors-motion-v2') === 'off';
  } catch {}

  let conversation = [];
  let stage = 0;
  let receiving = false;
  let typing = false;
  let replyTimer = null;
  let replyRun = 0;
  let galleryIndex = 0;
  let lastTrigger = null;

  const gallery = Array.from(
    document.querySelectorAll('[data-gallery]'),
    button => {
      const img = button.querySelector('img');
      return {
        src: img.getAttribute('src'),
        title: button.querySelector('.gallery-caption strong').textContent,
        alt: img.alt
      };
    }
  );

  function text(key) {
    return english[key] || key;
  }

  function element(tag, className, content) {
    const el = document.createElement(tag);
    if (className) el.className = className;
    if (content !== undefined) el.textContent = content;
    return el;
  }

  function validPercent(value) {
    return typeof value === 'number' &&
      Number.isFinite(value) &&
      value >= 0 &&
      value <= 100;
  }

  function safeUrl(value) {
    try {
      const url = new URL(value);
      return url.protocol === 'https:' ? url.href : null;
    } catch {
      return null;
    }
  }

  function setProgress() {
    $('creator-name').textContent = data.developerName;

    const c = data.chapter5 || data.chapter4;
    const total = $('overall-track').closest('.total-progress');
    const show = validPercent(c.overall);

    total.firstElementChild.hidden = !show;
    $('overall-track').hidden = !show;

    if (show) {
      $('overall-value').textContent = c.overall + '%';
      $('overall-fill').style.width = c.overall + '%';
      $('overall-track').setAttribute('aria-valuenow', c.overall);
      $('overall-track').setAttribute('aria-valuemin', '0');
      $('overall-track').setAttribute('aria-valuemax', '100');
    }

    $('progress-note').textContent = 'Latest development update';

    if (c.updatedAt) {
      const date = new Date(c.updatedAt + 'T12:00:00');
      if (!Number.isNaN(date.valueOf())) {
        $('progress-note').textContent =
          'Last updated · ' +
          new Intl.DateTimeFormat('en-GB', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          }).format(date);
      }
    }

    $('milestones').replaceChildren();

    for (const task of c.milestones) {
      const row = element('div', 'milestone');
      const title = task.en || task.en;

      row.append(element('span', '', title));

      const known = validPercent(task.progress);

      row.append(
        element(
          'span',
          'mono',
          known ? task.progress + '%' : 'Not announced'
        )
      );

      if (known) {
        const track = element('div', 'progress-track');
        track.setAttribute('role', 'progressbar');
        track.setAttribute('aria-label', title);
        track.setAttribute('aria-valuenow', task.progress);
        track.setAttribute('aria-valuemin', '0');
        track.setAttribute('aria-valuemax', '100');

        const fill = element('span');
        fill.style.width = task.progress + '%';
        track.append(fill);
        row.append(track);
      }

      $('milestones').append(row);
    }

    $('release-date').textContent =
      c.releaseDate || text('releasePending');
  }

  function renderDownloads() {
    const parent = $('download-buttons');
    parent.replaceChildren();

    for (const platform of ['android', 'ios']) {
      const url = safeUrl(data.links[platform]);

      const item = element(
        url ? 'a' : 'div',
        'store-link' + (url ? '' : ' pending')
      );

      if (url) {
        item.href = url;
        item.target = '_blank';
        item.rel = 'noopener noreferrer';
      }

      // Use SVG icons instead of text symbols to avoid encoding issues.
      const icon = document.createElementNS(
        'http://www.w3.org/2000/svg',
        'svg'
      );

      icon.setAttribute('class', 'store-icon');
      icon.setAttribute('width', '32');
      icon.setAttribute('height', '32');
      icon.setAttribute('viewBox', '0 0 24 24');
      icon.setAttribute('aria-hidden', 'true');
      icon.setAttribute('focusable', 'false');

      if (platform === 'android') {
        // Google Play-style play triangle
        const triangle = document.createElementNS(
          'http://www.w3.org/2000/svg',
          'path'
        );

        triangle.setAttribute(
          'd',
          'M5 3.5v17l14-8.5z'
        );
        triangle.setAttribute('fill', 'currentColor');
        icon.append(triangle);
      } else {
        // Apple-style logo silhouette
        const apple = document.createElementNS(
          'http://www.w3.org/2000/svg',
          'path'
        );

        apple.setAttribute(
          'd',
          'M16.7 12.8c0-2 1.6-3 1.7-3.1-1-1.4-2.5-1.6-3-1.6-1.3-.1-2.5.8-3.2.8-.7 0-1.7-.8-2.8-.8-1.4 0-2.7.8-3.5 2-1.5 2.5-.4 6.1 1.1 8.1.7 1 1.5 2 2.5 2 1 0 1.4-.6 2.7-.6s1.7.6 2.8.6 1.8-1 2.4-2c.8-1.1 1.1-2.2 1.1-2.3-.1 0-2-.8-2-3.1ZM14.6 6.7c.6-.7 1-1.7.9-2.7-.9 0-2 .6-2.7 1.3-.6.7-1.1 1.7-1 2.6 1 .1 2.1-.5 2.8-1.2Z'
        );
        apple.setAttribute('fill', 'currentColor');
        icon.append(apple);
      }

      item.append(icon);

      const copy = element('span');

      copy.append(
        element('small', '', url ? 'AVAILABLE ON' : 'IN REVIEW'),
        element(
          'strong',
          '',
          platform === 'android' ? 'Google Play' : 'App Store'
        )
      );

      item.append(copy);
      parent.append(item);
    }

    $('download-note').textContent = safeUrl(data.links.ios)
      ? ''
      : 'The iPhone version is under Apple review. The download link will appear when it is available.';
  }

  function renderConversation() {
    const log = $('messages');

    log.replaceChildren(
      element('p', 'message-time mono', scene.time),
      element('div', 'bubble', scene.opening)
    );

    for (const line of conversation) {
      const bubble = element(
        'div',
        'bubble ' + (line.from === 'hazem' ? 'outgoing' : ''),
        line.text
      );

      bubble.append(element('small', 'bubble-time', line.time));
      log.append(bubble);
    }

    const choices = $('message-choices');
    choices.replaceChildren();

    if (!receiving) {
      for (const option of scene.steps[stage]?.choices || []) {
        const button = element('button', '', option.label);
        button.dataset.choice = option.id;
        button.addEventListener('click', () => choose(option.id));
        choices.append(button);
      }
    }

    if (!receiving && stage === scene.steps.length) {
      const end = element('div', 'conversation-end');

      end.append(
        element('span', 'mono', 'THE THREAT IS ONLY THE BEGINNING'),
        element('p', '', 'Someone wants the truth buried. Find out why.')
      );

      const link = element('a', 'button primary', 'Play free on Google Play');
      link.href = safeUrl(data.links.android) || '#download';
      link.target = '_blank';
      link.rel = 'noopener noreferrer';

      end.append(
        link,
        element('small', 'teaser-free', 'Free to play. No paid choices.')
      );

      choices.append(end);
    }

    if (typing) {
      const dots = element('div', 'bubble typing-bubble');
      dots.setAttribute('aria-hidden', 'true');

      for (let i = 0; i < 3; i++) {
        dots.append(element('span'));
      }

      log.append(dots);
    }

    $('typing-status').textContent = typing
      ? 'Unknown Number is typing…'
      : receiving
        ? 'Delivered'
        : stage === scene.steps.length
          ? 'Unknown Number went offline'
          : 'Your turn';

    log.scrollTop = log.scrollHeight;
  }

  function choose(choice) {
    if (receiving) {
      throw new Error('Wait for Unknown Number to finish replying.');
    }

    const selected = scene.steps[stage]?.choices.find(
      c => c.id === choice
    );

    if (!selected) {
      throw new Error('This reply is not available at the current step.');
    }

    const run = ++replyRun;

    conversation.push({
      from: 'hazem',
      text: selected.reply,
      time: scene.time
    });

    receiving = true;
    typing = false;
    renderConversation();

    let index = 0;

    function next() {
      if (run !== replyRun) return;

      const line = selected.messages[index];

      if (!line) {
        receiving = false;
        typing = false;
        stage++;
        renderConversation();
        return;
      }

      typing = true;
      renderConversation();

      const delay = Math.min(
        4800,
        Math.max(2400, line.text.length * 45)
      );

      replyTimer = setTimeout(() => {
        if (run !== replyRun) return;

        typing = false;
        conversation.push({ ...line });
        renderConversation();
        index++;

        replyTimer = setTimeout(next, 1100);
      }, delay);
    }

    replyTimer = setTimeout(next, 800);

    return { step: stage, receiving: true };
  }

  function reset() {
    clearTimeout(replyTimer);
    replyRun++;
    receiving = false;
    typing = false;
    conversation = [];
    stage = 0;
    renderConversation();

    return {
      step: 0,
      availableReplies: scene.steps[0].choices.map(c => c.id)
    };
  }

  window.addEventListener('pagehide', () => {
    clearTimeout(replyTimer);
    replyRun++;
  });

  const dialog = $('media-dialog');

  function openDialog(trigger) {
    lastTrigger = trigger;
    dialog.showModal();
    document.body.style.overflow = 'hidden';
  }

  function showImage(index, trigger) {
    galleryIndex = (index + gallery.length) % gallery.length;

    const selected = gallery[galleryIndex];
    const img = element('img');

    img.src = selected.src;
    img.alt = selected.alt;

    $('media-content').replaceChildren(img);
    $('media-title').textContent = selected.title;
    $('gallery-count').textContent =
      (galleryIndex + 1) + ' / ' + gallery.length;

    $('gallery-controls').hidden = false;

    if (!dialog.open) openDialog(trigger);
  }

  $('watch').addEventListener('click', () => {
    const video = element('video');

    video.controls = true;
    video.preload = 'metadata';
    video.playsInline = true;
    video.src = 'assets/opening.mp4';
    video.setAttribute('aria-label', text('watch'));

    $('media-content').replaceChildren(video);
    $('media-title').textContent = text('watch');
    $('gallery-controls').hidden = true;

    openDialog($('watch'));
  });

  document.querySelectorAll('[data-gallery]').forEach(
    (button, index) => {
      button.addEventListener('click', () => showImage(index, button));
    }
  );

  $('close-dialog').addEventListener('click', () => dialog.close());

  dialog.addEventListener('click', event => {
    if (event.target === dialog) {
      const r = dialog.getBoundingClientRect();

      if (
        event.clientX < r.left ||
        event.clientX > r.right ||
        event.clientY < r.top ||
        event.clientY > r.bottom
      ) {
        dialog.close();
      }
    }
  });

  dialog.addEventListener('close', () => {
    const video = dialog.querySelector('video');
    if (video) video.pause();

    $('media-content').replaceChildren();
    document.body.style.overflow = '';
    lastTrigger?.focus({ preventScroll: true });
  });

  $('previous-image').addEventListener(
    'click',
    () => showImage(galleryIndex - 1)
  );

  $('next-image').addEventListener(
    'click',
    () => showImage(galleryIndex + 1)
  );

  dialog.addEventListener('keydown', event => {
    if ($('gallery-controls').hidden) return;

    if (event.key === 'ArrowRight') {
      event.preventDefault();
      showImage(galleryIndex + 1);
    }

    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      showImage(galleryIndex - 1);
    }
  });

  $('reset-case').addEventListener('click', reset);

  document.documentElement.lang = 'en';
  document.documentElement.dir = 'ltr';
  $('year').textContent = new Date().getFullYear();

  setProgress();
  renderDownloads();
  renderConversation();

  const revealTargets = document.querySelectorAll(
    '.section-label,.story-copy,.memory-photo,.case-copy,' +
    '.message-terminal,.section-heading,.evidence-board,' +
    '.chapter-layout,.creator-layout,.faq-layout'
  );

  if ('IntersectionObserver' in window && !reducedMotion.matches) {
    const observer = new IntersectionObserver(
      entries => entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      }),
      { threshold: 0.08 }
    );

    revealTargets.forEach(el => {
      el.classList.add('reveal');
      observer.observe(el);
    });
  }

  document.querySelectorAll('.faq-list details').forEach(item => {
    item.addEventListener('toggle', () => {
      if (item.open) {
        document.querySelectorAll('.faq-list details').forEach(other => {
          if (other !== item) other.open = false;
        });
      }
    });
  });

  if (document.modelContext?.registerTool) {
    const lifecycle = new AbortController();

    const register = tool => {
      try {
        Promise.resolve(
          document.modelContext.registerTool(tool, {
            signal: lifecycle.signal
          })
        ).catch(() => {});
      } catch {}
    };

    register({
      name: 'select_case_reply',
      title: 'Reply to the unknown sender',
      description:
        'Select one currently available reply in the abridged Unknown Number game conversation. This updates the visible conversation; it sends no message to any real person.',
      inputSchema: {
        type: 'object',
        properties: {
          reply: {
            type: 'string',
            enum: scene.steps.flatMap(s => s.choices.map(c => c.id))
          }
        },
        required: ['reply'],
        additionalProperties: false
      },
      annotations: {
        readOnlyHint: false,
        untrustedContentHint: false
      },
      execute: input => {
        if (
          !input ||
          typeof input.reply !== 'string' ||
          Object.keys(input).some(k => k !== 'reply')
        ) {
          throw new Error('Provide a valid reply.');
        }

        choose(input.reply);

        return {
          step: stage,
          finished: stage === scene.steps.length,
          receiving,
          availableReplies: receiving
            ? []
            : scene.steps[stage]?.choices.map(c => c.id) || []
        };
      }
    });

    register({
      name: 'restart_case_scene',
      title: 'Restart the mini-scene',
      description:
        'Clear the local conversation excerpt and return to its first choice.',
      inputSchema: {
        type: 'object',
        properties: {},
        additionalProperties: false
      },
      annotations: {
        readOnlyHint: false,
        untrustedContentHint: false
      },
      execute: input => {
        if (!input || Object.keys(input).length) {
          throw new Error('No arguments expected.');
        }

        return reset();
      }
    });

    window.addEventListener(
      'pagehide',
      () => lifecycle.abort(),
      { once: true }
    );
  }
})();
