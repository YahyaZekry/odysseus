import uiModule from './ui.js';
import * as Modals from './modalManager.js';
import { makeWindowDraggable } from './windowDrag.js';
import { snapModalToZone } from './tileManager.js';
import { clearDockSide } from './modalSnap.js';

const API_BASE = window.location.origin;
let _open = false;
let _feeds = [];
let _groups = [];
let _articles = [];
let _totalArticles = 0;
let _activeFeedId = null;
let _activeGroupId = null;
let _activeArticleId = null;
let _filter = 'unread';
let _searchQuery = '';
let _pageOffset = 0;
const PAGE_LIMIT = 50;

function _api(path, opts = {}) {
  return fetch(`${API_BASE}/api/feeds${path}`, {
    credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json' },
    ...opts,
  }).then(r => r.json());
}

function _el(id) { return document.getElementById(id); }

function _clearRssSnapStyles(pane) {
  if (!pane) return;
  const hadLeft = pane.classList.contains('modal-left-docked');
  const hadRight = pane.classList.contains('modal-right-docked');
  pane.classList.remove('rss-fullscreen', 'modal-left-docked', 'modal-right-docked');
  if (hadLeft) clearDockSide('left', pane);
  if (hadRight) clearDockSide('right', pane);
  ['position', 'left', 'top', 'right', 'bottom', 'width', 'max-width', 'height',
    'max-height', 'margin', 'transform', 'border-radius']
    .forEach(prop => pane.style.removeProperty(prop));
  delete pane.dataset._tilePreSnap;
  delete pane.dataset._tileZone;
  delete pane._preDockSnapshot;
  delete pane._dockSide;
  delete pane._dockSuspended;
}

function _wireRssWindow(pane) {
  if (!pane || pane.dataset.windowDragWired === '1') return;
  const header = pane.querySelector('.rss-pane-header');
  if (!header) return;
  pane.dataset.windowDragWired = '1';
  makeWindowDraggable(pane, {
    content: pane,
    header,
    fsClass: 'rss-fullscreen',
    skipSelector: 'button, input, select, textarea, label',
    enableDock: true,
    enableLeftDock: true,
    onEnterFullscreen: () => {
      pane.classList.add('rss-fullscreen');
      snapModalToZone(pane, {
        name: 'fullscreen',
        rect: { left: 0, top: 0, width: window.innerWidth, height: window.innerHeight },
      });
    },
    onExitFullscreen: (cx, cy) => {
      _clearRssSnapStyles(pane);
      if (typeof cx === 'number' && typeof cy === 'number') {
        const w = Math.min(880, window.innerWidth * 0.92);
        const h = Math.min(window.innerHeight * 0.85, 820);
        pane.style.position = 'fixed';
        pane.style.left = Math.max(8, cx - w / 2) + 'px';
        pane.style.top = Math.max(8, cy - 30) + 'px';
        pane.style.width = w + 'px';
        pane.style.height = h + 'px';
        pane.style.transform = 'none';
        pane.style.margin = '0';
      }
    },
  });
}

function _openPanel() {
  if (_open) return;
  _open = true;
  const btn = _el('tool-rss-btn');
  if (btn) btn.classList.add('active');

  const backdrop = document.createElement('div');
  backdrop.className = 'rss-pane-backdrop';
  backdrop.id = 'rss-pane-backdrop';
  backdrop.addEventListener('click', (e) => {
    if (e.target === backdrop) closePanel();
  });

  const pane = document.createElement('div');
  pane.id = 'rss-pane';
  pane.className = 'rss-pane';
  pane.innerHTML = `
    <div class="rss-pane-header">
      <h4 class="rss-pane-title">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-2.5px;margin-right:6px">
          <path d="M4 11a9 9 0 0 1 9 9"/>
          <path d="M4 4a16 16 0 0 1 16 16"/>
          <circle cx="5" cy="19" r="1"/>
        </svg>
        Feeds
      </h4>
      <span style="flex:1"></span>
      <button id="rss-refresh-all-btn" class="doc-action-icon-btn" title="Refresh all feeds" style="opacity:0.8;">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
      </button>
      <button id="rss-add-feed-btn" class="doc-action-icon-btn" title="Add feed" style="opacity:0.8;">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
      </button>
      <button id="rss-opml-btn" class="doc-action-icon-btn" title="Import/Export OPML" style="opacity:0.8;">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
      </button>
      <button id="rss-close-btn" class="doc-action-icon-btn" title="Close RSS" style="opacity:0.8;">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
    </div>
    <div class="rss-body">
      <div class="rss-sidebar">
        <div class="rss-sidebar-header">
          <input type="text" id="rss-search" class="memory-search-input" placeholder="Search articles…" autocomplete="off" />
          <div class="rss-filter-bar">
            <button class="rss-filter-btn active" data-filter="unread">Unread</button>
            <button class="rss-filter-btn" data-filter="all">All</button>
            <button class="rss-filter-btn" data-filter="starred">Starred</button>
          </div>
        </div>
        <div class="rss-feed-list" id="rss-feed-list"></div>
      </div>
      <div class="rss-main">
        <div class="rss-article-list" id="rss-article-list">
          <div class="rss-empty-state">Select a feed to view articles</div>
        </div>
        <div class="rss-reader" id="rss-reader" style="display:none">
          <div class="rss-reader-toolbar">
            <button id="rss-reader-back" class="doc-action-icon-btn" title="Back to list">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
            </button>
            <a id="rss-reader-original" href="#" target="_blank" class="doc-action-icon-btn" title="Open original" style="text-decoration:none">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
            </a>
            <button id="rss-reader-star" class="doc-action-icon-btn" title="Toggle star">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
            </button>
            <button id="rss-reader-tts" class="doc-action-icon-btn" title="Read aloud" style="display:none">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>
            </button>
            <button id="rss-reader-summarize" class="doc-action-icon-btn" title="AI Summary" style="opacity:0.8;">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
            </button>
            <button id="rss-reader-full" class="doc-action-icon-btn" title="Fetch full content" style="opacity:0.8;">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            </button>
            <span style="flex:1"></span>
            <button id="rss-reader-mark-read" class="doc-action-icon-btn" title="Mark read">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/></svg>
            </button>
          </div>
          <div class="rss-reader-content" id="rss-reader-content"></div>
        </div>
      </div>
    </div>
  `;

  backdrop.appendChild(pane);
  document.body.appendChild(backdrop);
  _wireRssWindow(pane);
  _wireEvents(pane);
  _loadFeeds();

  if (!Modals.isRegistered('rss-pane')) {
    Modals.register('rss-pane', {
      label: 'Feeds',
      icon: '<path d="M4 11a9 9 0 0 1 9 9"/><path d="M4 4a16 16 0 0 1 16 16"/><circle cx="5" cy="19" r="1"/>',
      closeFn: closePanel,
      restoreFn: () => _openPanel(),
    });
  }
}

function _wireEvents(pane) {
  _el('rss-add-feed-btn')?.addEventListener('click', _showAddFeedModal);
  _el('rss-refresh-all-btn')?.addEventListener('click', _refreshAll);
  _el('rss-opml-btn')?.addEventListener('click', _showOpmlModal);
  _el('rss-close-btn')?.addEventListener('click', (e) => {
    e.preventDefault();
    closePanel();
  });
  _el('rss-reader-back')?.addEventListener('click', _closeReader);
  _el('rss-reader-star')?.addEventListener('click', _toggleReaderStar);
  _el('rss-reader-mark-read')?.addEventListener('click', _markReaderRead);
  _el('rss-reader-summarize')?.addEventListener('click', _summarizeReaderArticle);
  _el('rss-reader-full')?.addEventListener('click', _fetchReaderFullContent);
  _el('rss-reader-original')?.addEventListener('click', (e) => {
    const a = _el('rss-reader-original');
    if (a && a.getAttribute('href') && a.getAttribute('href') !== '#') {
      window.open(a.href, '_blank');
    }
    e.preventDefault();
  });
  _el('rss-search')?.addEventListener('input', (e) => {
    _searchQuery = e.target.value.trim();
    _pageOffset = 0;
    _loadArticles();
  });
  _el('rss-reader-tts')?.addEventListener('click', _playTTS);

  pane.querySelectorAll('.rss-filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      pane.querySelectorAll('.rss-filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      _filter = btn.dataset.filter;
      _pageOffset = 0;
      _loadArticles();
    });
  });

  _el('rss-reader-content')?.addEventListener('click', (e) => {
    const player = e.target.closest('.rss-video-player');
    if (player) {
      _openVideoModal(player.dataset.videoId, player.dataset.videoUrl || player.dataset.videoId);
    }
  });

  document.addEventListener('click', (e) => {
    if (e.target.closest('#rss-video-modal-close') || e.target === _el('rss-video-modal')) {
      _closeVideoModal();
    }
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') _closeVideoModal();
  });
}

function closePanel() {
  _open = false;
  _el('tool-rss-btn')?.classList.remove('active');
  const backdrop = _el('rss-pane-backdrop');
  if (backdrop) backdrop.remove();
  try { Modals.unregister('rss-pane'); } catch {}
}

function togglePanel() {
  if (_open) { closePanel(); return; }
  _openPanel();
}

async function _loadFeeds() {
  const [feedsRes, groupsRes] = await Promise.all([
    _api(''),
    _api('/groups'),
  ]);
  _feeds = feedsRes.feeds || [];
  _groups = groupsRes.groups || [];
  _renderFeedList();
  if (_activeFeedId) {
    _loadArticles();
  }
}

function _renderFeedList() {
  const list = _el('rss-feed-list');
  if (!list) return;
  const groups = {};
  const ungrouped = [];
  for (const f of _feeds) {
    if (f.group_id) {
      if (!groups[f.group_id]) groups[f.group_id] = [];
      groups[f.group_id].push(f);
    } else {
      ungrouped.push(f);
    }
  }
  const groupMap = {};
  for (const g of _groups) groupMap[g.id] = g.name;

  let html = '';
  const totalUnread = _feeds.reduce((s, f) => s + (f.unread || 0), 0);
  html += `<div class="rss-feed-item ${!_activeFeedId && !_activeGroupId ? 'active' : ''}" data-feed-id="" data-group-id="">
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 11a9 9 0 0 1 9 9"/><path d="M4 4a16 16 0 0 1 16 16"/><circle cx="5" cy="19" r="1"/></svg>
    <span class="rss-feed-name">All Feeds</span>
    ${totalUnread > 0 ? `<span class="rss-unread-badge">${totalUnread}</span>` : ''}
  </div>`;

  for (const [gid, gfeeds] of Object.entries(groups)) {
    const gname = groupMap[gid] || 'Unnamed';
    const gUnread = gfeeds.reduce((s, f) => s + (f.unread || 0), 0);
    html += `<div class="rss-group-header" data-group-id="${gid}">
      <span class="rss-group-name">${gname}</span>
      ${gUnread > 0 ? `<span class="rss-unread-badge">${gUnread}</span>` : ''}
    </div>`;
    for (const f of gfeeds) {
      html += _feedItemHtml(f);
    }
  }

  if (ungrouped.length > 0) {
    for (const f of ungrouped) {
      html += _feedItemHtml(f);
    }
  }

  list.innerHTML = html;

  list.querySelectorAll('.rss-feed-item').forEach(el => {
    el.addEventListener('click', () => {
      list.querySelectorAll('.rss-feed-item').forEach(e => e.classList.remove('active'));
      list.querySelectorAll('.rss-group-header').forEach(e => e.classList.remove('active'));
      el.classList.add('active');
      _activeFeedId = el.dataset.feedId || null;
      _activeGroupId = el.dataset.groupId || null;
      _pageOffset = 0;
      _closeReader();
      _loadArticles();
    });
  });

  list.querySelectorAll('.rss-feed-delete').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const feedId = btn.closest('.rss-feed-item').dataset.feedId;
      if (feedId && confirm('Delete this feed and all its articles?')) {
        _api('/' + feedId, { method: 'DELETE' }).then(res => {
          if (res.ok) {
            if (_activeFeedId === feedId) {
              _activeFeedId = null;
              _closeReader();
            }
            _loadFeeds();
          }
        });
      }
    });
  });

  list.querySelectorAll('.rss-group-header').forEach(el => {
    el.addEventListener('click', () => {
      list.querySelectorAll('.rss-feed-item').forEach(e => e.classList.remove('active'));
      list.querySelectorAll('.rss-group-header').forEach(e => e.classList.remove('active'));
      el.classList.add('active');
      _activeFeedId = null;
      _activeGroupId = el.dataset.groupId || null;
      _pageOffset = 0;
      _closeReader();
      _loadArticles();
    });
  });
}

function _feedItemHtml(f) {
  let icon = f.icon || '';
  if (!icon && f.site_url && f.site_url.includes('youtube.com')) {
    icon = 'https://www.youtube.com/favicon.ico';
  }
  const initial = (f.title || '?')[0].toUpperCase();
  return `<div class="rss-feed-item ${_activeFeedId === f.id ? 'active' : ''}" data-feed-id="${f.id}">
    <span class="rss-feed-icon">${icon ? `<img src="${icon}" alt="" width="14" height="14" />` : initial}</span>
    <span class="rss-feed-name">${f.title || 'Untitled'}</span>
    ${(f.unread || 0) > 0 ? `<span class="rss-unread-badge">${f.unread}</span>` : ''}
    <button class="rss-feed-delete" title="Delete feed">&times;</button>
  </div>`;
}

async function _loadArticles() {
  const params = new URLSearchParams();
  params.set('limit', String(PAGE_LIMIT));
  params.set('offset', String(_pageOffset));
  if (_activeFeedId) params.set('feed_id', _activeFeedId);
  if (_activeGroupId) params.set('group_id', _activeGroupId);
  if (_filter === 'unread') params.set('read', 'false');
  if (_filter === 'starred') params.set('starred', 'true');
  if (_searchQuery) params.set('search', _searchQuery);

  const res = await _api(`/articles?${params.toString()}`);
  _articles = res.articles || [];
  _totalArticles = res.total || 0;
  _renderArticleList();
}

function _renderArticleList() {
  const list = _el('rss-article-list');
  if (!list) return;
  if (_articles.length === 0) {
    list.innerHTML = `<div class="rss-empty-state">No articles found</div>`;
    return;
  }
  let html = '';
  for (const a of _articles) {
    const feedTitle = a.feed?.title || '';
    const feedIcon = a.feed?.icon || '';
    const time = a.published_at ? _formatTime(a.published_at) : '';
    const snippet = a.content ? a.content.replace(/<[^>]+>/g, '').slice(0, 150) : '';
    html += `<div class="rss-article-item ${a.is_read ? 'rss-article-read' : ''} ${_activeArticleId === a.id ? 'active' : ''}" data-article-id="${a.id}">
      ${a.image ? `<div class="rss-article-thumb" style="background-image: url('${a.image}')"></div>` : ''}
      <div class="rss-article-body">
        <div class="rss-article-title">${a.title || 'Untitled'}</div>
        <div class="rss-article-meta">
          <span class="rss-article-feed">${feedIcon ? `<img src="${feedIcon}" alt="" width="10" height="10" />` : ''} ${feedTitle}</span>
          ${time ? `<span class="rss-article-time">${time}</span>` : ''}
          ${a.is_starred ? '<span class="rss-starred-indicator">★</span>' : ''}
        </div>
        <div class="rss-article-snippet">${snippet}</div>
      </div>
    </div>`;
  }
  list.innerHTML = html;

  list.querySelectorAll('.rss-article-item').forEach(el => {
    el.addEventListener('click', () => {
      list.querySelectorAll('.rss-article-item').forEach(e => e.classList.remove('active'));
      el.classList.add('active');
      _activeArticleId = el.dataset.articleId;
      _openReader(_activeArticleId);
    });
  });
}

function _openReader(articleId) {
  const article = _articles.find(a => a.id === articleId);
  if (!article) return;
  _el('rss-article-list').style.display = 'none';
  const reader = _el('rss-reader');
  reader.style.display = 'flex';

  const content = _el('rss-reader-content');
  const feedName = article.feed?.title || '';
  const time = article.published_at ? _formatTime(article.published_at) : '';
  const author = article.author ? `By ${article.author}` : '';
  const body = article.content || '<p class="rss-reader-placeholder">No content available. Try fetching full content.</p>';

  const videoUrl = article.url || '';
  const videoId = _getYoutubeVideoId(videoUrl) || _getYoutubeVideoId(article.guid);
  const videoHtml = videoId ? `<div class="rss-video-player" data-video-id="${videoId}" data-video-url="${videoUrl}"${article.image ? ` style="background-image: url('${article.image}')"` : ''}><div class="rss-video-play-btn">▶</div></div>` : '';

  content.innerHTML = `
    ${videoHtml}
    <div class="rss-reader-header">
      <h2 class="rss-reader-title">${article.title || 'Untitled'}</h2>
      <div class="rss-reader-meta">${feedName}${time ? ` · ${time}` : ''}${author ? ` · ${author}` : ''}</div>
    </div>
    <div class="rss-reader-body">${body}</div>
  `;

  _el('rss-reader-original').setAttribute('href', article.url || '#');
  _el('rss-reader-star').classList.toggle('rss-star-active', article.is_starred);
  _el('rss-reader-tts').style.display = window.aiTTSManager ? '' : 'none';

  if (!article.is_read) {
    _api(`/articles/${articleId}/read`, {
      method: 'PUT',
      body: JSON.stringify({ is_read: true }),
    });
    article.is_read = true;
    _loadFeeds();
    _el(`.rss-article-item[data-article-id="${articleId}"]`)?.classList.add('rss-article-read');
  }
}

function _closeReader() {
  _el('rss-article-list').style.display = '';
  _el('rss-reader').style.display = 'none';
  _activeArticleId = null;
}

async function _toggleReaderStar() {
  const article = _articles.find(a => a.id === _activeArticleId);
  if (!article) return;
  const newVal = !article.is_starred;
  await _api(`/articles/${_activeArticleId}/star`, {
    method: 'PUT',
    body: JSON.stringify({ is_starred: newVal }),
  });
  article.is_starred = newVal;
  _el('rss-reader-star').classList.toggle('rss-star-active', newVal);
}

async function _markReaderRead() {
  const article = _articles.find(a => a.id === _activeArticleId);
  if (!article) return;
  await _api(`/articles/${_activeArticleId}/read`, {
    method: 'PUT',
    body: JSON.stringify({ is_read: !article.is_read }),
  });
  article.is_read = !article.is_read;
  _loadFeeds();
}

async function _summarizeReaderArticle() {
  const summaryBtn = _el('rss-reader-summarize');
  if (!summaryBtn) return;
  summaryBtn.textContent = '...';
  const res = await _api(`/articles/${_activeArticleId}/summarize`, { method: 'POST' });
  summaryBtn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>`;
  if (res.ok && res.summary) {
    uiModule.showToast('Summary generated');
    const content = _el('rss-reader-content');
    const existing = content.querySelector('.rss-reader-summary');
    if (existing) existing.remove();
    const div = document.createElement('div');
    div.className = 'rss-reader-summary';
    div.innerHTML = `<h4>AI Summary</h4><p>${res.summary}</p>`;
    content.prepend(div);
  } else {
    uiModule.showError(res.error || 'Summarization failed');
  }
}

async function _fetchReaderFullContent() {
  const res = await _api(`/articles/${_activeArticleId}/full-content`, { method: 'POST' });
  if (res.ok && res.content) {
    uiModule.showToast('Full content fetched');
    const body = _el('rss-reader-content')?.querySelector('.rss-reader-body');
    if (body) body.innerHTML = res.content;
  } else {
    uiModule.showError(res.error || 'Failed to fetch content');
  }
}

async function _refreshAll() {
  _el('rss-refresh-all-btn').classList.add('rss-spinning');
  await _api('/refresh-all', { method: 'POST' });
  uiModule.showToast('Feeds queued for refresh');
  setTimeout(() => {
    _loadFeeds();
    _el('rss-refresh-all-btn').classList.remove('rss-spinning');
  }, 3000);
}

function _playTTS() {
  const article = _articles.find(a => a.id === _activeArticleId);
  if (!article || !window.aiTTSManager) return;
  const content = _el('rss-reader-content')?.querySelector('.rss-reader-body')?.textContent || article.content || '';
  window.aiTTSManager.speak(content, { title: article.title });
}

function _showAddFeedModal() {
  const modal = document.createElement('div');
  modal.className = 'rss-modal-backdrop';
  modal.innerHTML = `
    <div class="rss-modal">
      <div class="rss-modal-header">
        <h3>Add Feed</h3>
        <button class="rss-modal-close" id="rss-modal-close">&times;</button>
      </div>
      <div class="rss-modal-body">
        <label>Feed URL or website URL</label>
        <input type="text" id="rss-add-url" class="memory-search-input" placeholder="https://example.com/feed.xml" autocomplete="off" />
        <div id="rss-discovered-feeds" style="margin-top:8px"></div>
      </div>
      <div class="rss-modal-footer">
        <button id="rss-add-submit" class="primary-btn">Add Feed</button>
        <button id="rss-add-discover" class="secondary-btn">Discover</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);

  const close = () => modal.remove();
  modal.querySelector('#rss-modal-close')?.addEventListener('click', close);
  modal.addEventListener('click', (e) => { if (e.target === modal) close(); });

  modal.querySelector('#rss-add-submit')?.addEventListener('click', async () => {
    const selected = modal.querySelector('input[name="rss-discovered"]:checked');
    const url = selected ? selected.value : document.getElementById('rss-add-url')?.value?.trim();
    if (!url) return;
    const res = await _api('', {
      method: 'POST',
      body: JSON.stringify({ feed_url: url }),
    });
    if (res.ok) {
      uiModule.showToast('Feed added');
      close();
      _loadFeeds();
    } else {
      uiModule.showError(res.error || 'Failed to add feed');
    }
  });

  modal.querySelector('#rss-add-discover')?.addEventListener('click', async () => {
    const url = document.getElementById('rss-add-url')?.value?.trim();
    if (!url) return;
    const res = await _api('/discover', {
      method: 'POST',
      body: JSON.stringify({ url }),
    });
    const container = document.getElementById('rss-discovered-feeds');
    if (!container) return;
    if (res.feeds && res.feeds.length > 0) {
      container.innerHTML = res.feeds.map((f, i) =>
        `<label style="display:flex;align-items:center;gap:6px;margin:4px 0;cursor:pointer">
          <input type="radio" name="rss-discovered" value="${f.url}" ${i === 0 ? 'checked' : ''} />
          ${f.title} (${f.type || 'feed'})
        </label>`
      ).join('');
    } else {
      container.innerHTML = '<p style="opacity:0.6">No feeds found at this URL</p>';
    }
  });
}

function _showOpmlModal() {
  const modal = document.createElement('div');
  modal.className = 'rss-modal-backdrop';
  modal.innerHTML = `
    <div class="rss-modal">
      <div class="rss-modal-header">
        <h3>OPML Import/Export</h3>
        <button class="rss-modal-close" id="rss-opml-close">&times;</button>
      </div>
      <div class="rss-modal-body">
        <button id="rss-opml-export-btn" class="primary-btn" style="margin-bottom:12px;width:100%">📥 Export OPML</button>
        <label>Import OPML</label>
        <textarea id="rss-opml-import-text" class="memory-search-input" rows="6" placeholder="Paste OPML content here..." style="width:100%;resize:vertical;font-size:11px;font-family:monospace"></textarea>
        <button id="rss-opml-import-btn" class="secondary-btn" style="margin-top:8px;width:100%">📤 Import OPML</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);

  const close = () => modal.remove();
  modal.querySelector('#rss-opml-close')?.addEventListener('click', close);
  modal.addEventListener('click', (e) => { if (e.target === modal) close(); });

  modal.querySelector('#rss-opml-export-btn')?.addEventListener('click', async () => {
    const res = await fetch(`${API_BASE}/api/feeds/opml/export`, { credentials: 'same-origin' });
    const text = await res.text();
    const blob = new Blob([text], { type: 'text/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'odysseus-feeds.opml';
    a.click();
    URL.revokeObjectURL(url);
  });

  modal.querySelector('#rss-opml-import-btn')?.addEventListener('click', async () => {
    const text = document.getElementById('rss-opml-import-text')?.value?.trim();
    if (!text) return;
    const res = await _api('/opml/import', {
      method: 'POST',
      body: JSON.stringify({ opml: text }),
    });
    if (res.ok) {
      uiModule.showToast(`Imported ${res.imported} feeds`);
      close();
      _loadFeeds();
    } else {
      uiModule.showError(res.error || 'Import failed');
    }
  });
}



function _getYoutubeVideoId(url) {
  if (!url) return null;
  const m = (url || '').match(/(?:youtube\.com\/(?:watch\?v=|shorts\/)|youtu\.be\/)([\w-]+)/);
  if (m) return m[1];
  const mg = (url || '').match(/^yt:video:([\w-]+)/);
  return mg ? mg[1] : null;
}

function _formatTime(iso) {
  try {
    const d = new Date(iso);
    const now = new Date();
    const diff = now - d;
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    if (diff < 604800000) return `${Math.floor(diff / 86400000)}d ago`;
    return d.toLocaleDateString();
  } catch { return ''; }
}

function _openVideoModal(videoId, videoUrl) {
  let modal = _el('rss-video-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'rss-video-modal';
    modal.innerHTML = `
      <div class="rss-video-modal-content">
        <button id="rss-video-modal-close" class="rss-video-modal-close">&times;</button>
        <div id="rss-video-modal-player" class="rss-video-modal-player"></div>
        <a id="rss-video-modal-link" class="rss-video-modal-link" target="_blank" rel="noopener">Watch on YouTube</a>
      </div>`;
    document.body.appendChild(modal);
  }
  const player = _el('rss-video-modal-player');
  const link = _el('rss-video-modal-link');
  link.href = videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be') ? videoUrl : `https://www.youtube.com/watch?v=${videoId}`;
  player.innerHTML = `<iframe src="https://www.youtube.com/embed/${videoId}?autoplay=1" allow="autoplay; fullscreen" allowfullscreen></iframe>`;
  modal.style.display = 'flex';
  document.body.style.overflow = 'hidden';
}

function _closeVideoModal() {
  const modal = _el('rss-video-modal');
  if (modal) {
    modal.style.display = 'none';
    const player = _el('rss-video-modal-player');
    if (player) player.innerHTML = '';
    document.body.style.overflow = '';
  }
}

const feedReaderModule = { openPanel: _openPanel, closePanel, togglePanel, isOpen: () => _open };
export default feedReaderModule;
export { _openPanel as openPanel, closePanel, togglePanel };
window.feedReaderModule = feedReaderModule;
