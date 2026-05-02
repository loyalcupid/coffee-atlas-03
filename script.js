/* ================================================================
   Coffee Atlas — script.js
   Single-file SPA: router + data layer + page renderers
================================================================ */

'use strict';

/* ────────────────────────────────────────────────────────────────
   DATA LAYER  (localStorage mock — mirrors supabase.ts logic)
──────────────────────────────────────────────────────────────── */

const SEED = {
  records: [
    { id: 'rec-001', name: '카페 어니언',   location: '성수',                    rating: 5, atmosphere_images: [], overall_memo: '' },
    { id: 'rec-002', name: '프릳츠 커피',   location: '마포',                    rating: 4, atmosphere_images: [], overall_memo: '' },
    { id: 'rec-003', name: '테라로사',      location: '강릉',                    rating: 4, atmosphere_images: [], overall_memo: '' },
    { id: 'rec-004', name: '제이엠커피',    location: '부산 기장군 대변3길 8',    rating: 3, atmosphere_images: [], overall_memo: '' },
  ],
  visits: [
    { id: 'vis-001', record_id: 'rec-001', date: '2026-02-22' },
    { id: 'vis-002', record_id: 'rec-002', date: '2026-02-20' },
    { id: 'vis-003', record_id: 'rec-003', date: '2026-02-15' },
    { id: 'vis-004', record_id: 'rec-004', date: '2026-03-01' },
  ],
  orders: [
    { id: 'ord-001', visit_id: 'vis-001', drink_name: '아이스 아메리카노', price: 5500, rating: 5, acidity: 3, body: 3, sweetness: 3, memo: '성수동의 힙한 분위기와 맛있는 커피' },
    { id: 'ord-002', visit_id: 'vis-002', drink_name: '플랫 화이트',       price: 6000, rating: 4, acidity: 3, body: 4, sweetness: 3, memo: '레트로한 감성과 훌륭한 블렌딩' },
    { id: 'ord-003', visit_id: 'vis-003', drink_name: '핸드 드립',         price: 7000, rating: 4, acidity: 4, body: 3, sweetness: 2, memo: '강릉 바다와 함께 즐기는 스페셜티 커피' },
    { id: 'ord-004', visit_id: 'vis-004', drink_name: '아리차',            price: 8500, rating: 3, acidity: 4, body: 2, sweetness: 3, memo: '약간의 산미, 플로럴 향' },
  ],
};

const db = {
  get(table) {
    let data = JSON.parse(localStorage.getItem(table) || '[]');
    if (data.length === 0 && SEED[table]) {
      data = SEED[table];
      localStorage.setItem(table, JSON.stringify(data));
    }
    return data;
  },
  set(table, data) {
    localStorage.setItem(table, JSON.stringify(data));
  },
  findAll(table) { return this.get(table); },
  findById(table, id) { return this.get(table).find(r => r.id === id) || null; },
  findWhere(table, field, value) { return this.get(table).filter(r => r[field] === value); },
  insert(table, item) {
    const newItem = { ...item, id: item.id || Math.random().toString(36).slice(2, 11) };
    const data = this.get(table);
    data.unshift(newItem);
    this.set(table, data);
    return newItem;
  },
  update(table, id, changes) {
    const data = this.get(table).map(r => r.id === id ? { ...r, ...changes } : r);
    this.set(table, data);
  },
  delete(table, id) {
    this.set(table, this.get(table).filter(r => r.id !== id));
  },
};

/* image storage via localStorage (base64) */
const imgStore = {
  save(path, file) {
    return new Promise(resolve => {
      const reader = new FileReader();
      reader.onloadend = () => {
        localStorage.setItem('img_' + path, reader.result);
        resolve(reader.result);
      };
      reader.readAsDataURL(file);
    });
  },
  get(path) {
    return localStorage.getItem('img_' + path) || '';
  },
};

/* ────────────────────────────────────────────────────────────────
   ROUTER
──────────────────────────────────────────────────────────────── */

const PAGES = ['home', 'records', 'record-detail', 'order-detail', 'add-record', 'dashboard', 'map'];

function showPage(id) {
  PAGES.forEach(p => {
    const el = document.getElementById('page-' + p);
    if (el) el.classList.toggle('active', p === id);
  });
  window.scrollTo(0, 0);
}

function navigate(hash) {
  location.hash = hash;
}

function parseHash(hash) {
  const path = hash.replace(/^#\/?/, '') || '';
  const parts = path.split('/');
  return parts;
}

function route() {
  const parts = parseHash(location.hash);
  const [p0, p1, , p3] = parts;

  if (!p0 || p0 === '') {
    showPage('home');

  } else if (p0 === 'records' && !p1) {
    showPage('records');
    renderRecords();

  } else if (p0 === 'records' && p1 && !p3) {
    showPage('record-detail');
    renderRecordDetail(p1);

  } else if (p0 === 'records' && p1 && p3) {
    showPage('order-detail');
    renderOrderDetail(p1, p3);

  } else if (p0 === 'add-record') {
    showPage('add-record');
    initAddRecord();

  } else if (p0 === 'dashboard') {
    showPage('dashboard');
    renderDashboard();

  } else if (p0 === 'map') {
    showPage('map');
    renderMap();

  } else {
    navigate('#/');
  }
}

window.addEventListener('hashchange', route);
document.addEventListener('click', e => {
  const btn = e.target.closest('[data-nav]');
  if (btn) {
    e.preventDefault();
    navigate(btn.dataset.nav);
  }
});

/* ────────────────────────────────────────────────────────────────
   SVG ICON HELPER
──────────────────────────────────────────────────────────────── */

const SVG = {
  coffee:     `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 8h1a4 4 0 1 1 0 8h-1"/><path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z"/><line x1="6" x2="6" y1="2" y2="4"/><line x1="10" x2="10" y1="2" y2="4"/><line x1="14" x2="14" y1="2" y2="4"/></svg>`,
  mapPin:     `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>`,
  star:       `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,
  starLg:     `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,
  chevron:    `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>`,
  calendar:   `<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>`,
  edit:       `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>`,
  trash:      `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="m19 6-.867 13.142A2 2 0 0 1 16.138 21H7.862a2 2 0 0 1-1.995-1.858L5 6m5 0V4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v2"/></svg>`,
  save:       `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>`,
  camera:     `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/></svg>`,
  award:      `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/></svg>`,
  trending:   `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>`,
  external:   `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" x2="21" y1="14" y2="3"/></svg>`,
  plus:       `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>`,
  x:          `<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>`,
};

/* ────────────────────────────────────────────────────────────────
   RECORDS LIST  PAGE
──────────────────────────────────────────────────────────────── */

function renderRecords() {
  const list    = document.getElementById('records-list');
  const search  = document.getElementById('records-search');
  const clearBtn = document.getElementById('records-filter-clear');

  const draw = () => {
    const term = search.value.toLowerCase();
    const records = db.findAll('records');
    const visits  = db.findAll('visits');
    const orders  = db.findAll('orders');

    const summaries = records.map(r => {
      const rv = visits.filter(v => v.record_id === r.id).sort((a, b) => b.date > a.date ? 1 : -1);
      const latestVisit = rv[0];
      const latestOrder = latestVisit ? orders.find(o => o.visit_id === latestVisit.id) : null;
      return { ...r, date: latestVisit?.date || '', drink: latestOrder?.drink_name || '' };
    }).filter(r =>
      !term ||
      r.name.toLowerCase().includes(term) ||
      r.location.toLowerCase().includes(term)
    );

    if (summaries.length === 0) {
      list.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">${SVG.coffee}</div>
          <p class="empty-state-text">
            ${term ? `"${esc(term)}" 검색 결과가 없습니다.` : '아직 기록이 없습니다. 첫 커피를 기록해보세요!'}
          </p>
          ${!term ? `<a href="#/add-record" class="empty-state a">첫 카페 기록하기 →</a>` : ''}
        </div>`;
      return;
    }

    list.innerHTML = summaries.map(r => `
      <a href="#/records/${r.id}" class="record-card">
        <div class="record-card-left">
          <div class="record-card-icon">${SVG.coffee}</div>
          <div>
            <div class="record-card-name">
              ${esc(r.name)}
              <span class="rating-badge">${SVG.star} ${r.rating}</span>
            </div>
            <p class="record-card-drink">${esc(r.drink)}</p>
            <div class="record-card-meta">
              <span class="record-card-loc">${SVG.mapPin} ${esc(r.location)}</span>
              <span class="record-card-date">${esc(r.date)}</span>
            </div>
          </div>
        </div>
        ${SVG.chevron}
      </a>`).join('');
  };

  draw();
  search.oninput = draw;
  clearBtn.onclick = () => { search.value = ''; draw(); };
}

/* ────────────────────────────────────────────────────────────────
   RECORD DETAIL  PAGE
──────────────────────────────────────────────────────────────── */

function renderRecordDetail(recordId) {
  const wrap = document.getElementById('record-detail-content');
  const record = db.findById('records', recordId);
  if (!record) { wrap.innerHTML = '<p style="color:var(--brown-50);padding:40px;text-align:center;">기록을 찾을 수 없습니다.</p>'; return; }

  const visits = db.findWhere('visits', 'record_id', recordId)
    .sort((a, b) => b.date > a.date ? 1 : -1);

  let selectedVisitId = visits[0]?.id || null;

  const renderOrders = () => {
    if (!selectedVisitId) return '<p style="color:var(--brown-30);font-size:13px;font-style:italic;padding:8px;">방문 날짜를 선택해주세요.</p>';
    const orders = db.findWhere('orders', 'visit_id', selectedVisitId);
    if (orders.length === 0) return '<p style="color:var(--brown-30);font-size:13px;font-style:italic;padding:8px;">기록된 커피가 없습니다.</p>';

    const totalAmount = orders.reduce((s, o) => s + (o.price || 0), 0);
    const chips = orders.map(o => `
      <a href="#/records/${recordId}/orders/${o.id}" class="order-chip">
        <span class="order-chip-name">${esc(o.drink_name)}</span>
        <div class="order-chip-row">
          <span class="order-chip-price ${o.price ? '' : 'empty'}">${o.price ? '₩' + o.price.toLocaleString() : '가격 미입력'}</span>
          <span class="order-chip-rating">${SVG.star} ${o.rating}</span>
        </div>
        <div class="taste-mini-bars">
          ${['acidity','body','sweetness'].map((k, i) => `
            <div class="taste-mini-bar-wrap">
              <span class="taste-mini-label">${['A','B','S'][i]}</span>
              <div class="taste-mini-track"><div class="taste-mini-fill" style="width:${(o[k]/5)*100}%"></div></div>
            </div>`).join('')}
        </div>
      </a>`).join('');

    const total = totalAmount > 0 ? `
      <div class="total-amount-bar" style="margin-top:8px;">
        <span class="total-amount-label">이번 방문 커피구매 총액</span>
        <span class="total-amount-value">₩${totalAmount.toLocaleString()}</span>
      </div>` : '';

    return chips + total;
  };

  const renderVisitChips = () => visits.map(v => `
    <div class="visit-chip-wrap">
      <button class="visit-chip ${v.id === selectedVisitId ? 'active' : ''}"
        data-visit-id="${v.id}">
        ${SVG.calendar} ${v.date}
      </button>
      <button class="visit-chip-del" data-del-visit="${v.id}">✕</button>
    </div>`).join('');

  const renderImages = () => {
    const imgs = (record.atmosphere_images || []).map(url => `
      <div class="img-thumb">
        <img src="${esc(url)}" alt="분위기">
      </div>`).join('');
    return imgs || '<p style="color:var(--brown-30);font-size:13px;">등록된 사진이 없습니다.</p>';
  };

  const renderStars = (val) => [1,2,3,4,5].map(n =>
    `<span class="star-display ${val >= n ? 'filled' : ''}">${SVG.star}</span>`
  ).join('');

  const draw = (editing = false) => {
    wrap.innerHTML = `
      <div class="detail-card">

        <!-- 기본 정보 -->
        <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:16px;margin-bottom:8px;">
          <div style="flex:1;min-width:0;">
            ${editing ? `<input class="detail-name-input" id="edit-name" value="${esc(record.name)}">` :
              `<h2 class="detail-name">${esc(record.name)}</h2>`}
            <div class="detail-location">
              ${SVG.mapPin}
              ${editing ? `<input id="edit-location" value="${esc(record.location)}" placeholder="위치">` :
                `<span>${esc(record.location)}</span>`}
            </div>
          </div>
          <div style="display:flex;flex-direction:column;align-items:flex-end;gap:8px;flex-shrink:0;">
            <div style="display:flex;align-items:center;color:#d97706;font-weight:700;background:#fefce8;padding:6px 12px;border-radius:20px;border:1px solid #fef08a;gap:4px;">
              ${SVG.star}
              ${editing ? `<select id="edit-rating" style="background:transparent;border:none;outline:none;font-weight:700;font-size:16px;">
                ${[1,2,3,4,5].map(n => `<option value="${n}" ${record.rating===n?'selected':''}>${n}</option>`).join('')}
              </select>` : `<span style="font-size:18px;">${record.rating}</span>`}
            </div>
            <span class="visit-count-badge">방문 ${visits.length}회</span>
          </div>
        </div>

        <hr class="divider">

        <!-- 방문 날짜 -->
        <div style="margin-bottom:24px;">
          <div class="section-label">${SVG.calendar} 방문 날짜</div>
          <div class="visits-area" id="visits-area">
            <button class="btn-add-tag" id="add-visit-btn">${SVG.plus} 날짜 추가</button>
            ${renderVisitChips()}
          </div>
        </div>

        <!-- 주문한 커피 -->
        <div style="margin-bottom:24px;">
          <div class="section-label">${SVG.coffee} 주문한 커피</div>
          <div class="orders-area" id="orders-area">
            <button class="btn-add-tag" id="add-order-btn">${SVG.plus} 커피 추가</button>
            <div id="orders-chips">${renderOrders()}</div>
          </div>
        </div>

        <hr class="divider">

        <!-- 카페 분위기 -->
        <div style="margin-bottom:24px;">
          <div class="section-label">${SVG.camera} 카페 분위기</div>
          <div class="img-grid" id="detail-img-grid">
            ${renderImages()}
            <div class="img-add-btn" id="detail-img-add-btn">
              ${SVG.camera}
              <span id="detail-img-add-label">사진 추가</span>
            </div>
          </div>
          <input type="file" accept="image/*" id="detail-img-input" style="display:none;">
        </div>

        <hr class="divider">

        <!-- 총평 -->
        <div style="margin-bottom:24px;">
          <div class="section-label">${SVG.star} 총평</div>
          <div style="display:flex;align-items:center;gap:12px;margin-bottom:12px;">
            <span style="font-size:14px;color:var(--brown-50);font-weight:500;width:64px;">총평점</span>
            <div class="star-row">${renderStars(record.rating)}</div>
            <span style="font-size:14px;font-weight:700;color:var(--brown-50);">${record.rating}점</span>
          </div>
          ${editing
            ? `<textarea id="edit-memo" class="form-textarea" placeholder="이 카페에 대한 전반적인 인상을 남겨주세요.">${esc(record.overall_memo || '')}</textarea>`
            : `<div class="overall-memo-display ${record.overall_memo ? '' : 'empty'}">${esc(record.overall_memo) || '총평이 없습니다. 수정 버튼을 눌러 추가해보세요.'}</div>`}
        </div>

        <hr class="divider">

        <!-- 액션 버튼 -->
        <div class="action-row">
          ${editing ? `
            <button class="btn-save" id="detail-save-btn">${SVG.save} 저장</button>
            <button class="btn-cancel" id="detail-cancel-btn">취소</button>
          ` : `
            <button class="btn-edit" id="detail-edit-btn">${SVG.edit} 기록 수정하기</button>
            <button class="btn-delete" id="detail-delete-btn">${SVG.trash} 삭제하기</button>
          `}
        </div>

      </div>`;

    /* Event bindings */
    document.getElementById('add-visit-btn')?.addEventListener('click', async () => {
      const date = prompt('방문 날짜를 입력하세요 (YYYY-MM-DD)', new Date().toISOString().split('T')[0]);
      if (!date) return;
      const v = db.insert('visits', { record_id: recordId, date });
      visits.unshift(v);
      selectedVisitId = v.id;
      draw(false);
    });

    document.getElementById('add-order-btn')?.addEventListener('click', () => {
      if (!selectedVisitId) { alert('먼저 방문 날짜를 선택하거나 추가해주세요.'); return; }
      const drink_name = prompt('주문한 커피 이름을 입력하세요');
      if (!drink_name) return;
      db.insert('orders', { visit_id: selectedVisitId, drink_name, price: 0, rating: 3, acidity: 3, body: 3, sweetness: 3, memo: '' });
      document.getElementById('orders-chips').innerHTML = renderOrders();
    });

    wrap.querySelectorAll('[data-visit-id]').forEach(btn => {
      btn.addEventListener('click', () => {
        selectedVisitId = btn.dataset.visitId;
        draw(false);
      });
    });

    wrap.querySelectorAll('[data-del-visit]').forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation();
        if (!confirm('이 방문 기록을 삭제하시겠습니까?')) return;
        const vid = btn.dataset.delVisit;
        db.delete('visits', vid);
        const idx = visits.findIndex(v => v.id === vid);
        if (idx > -1) visits.splice(idx, 1);
        if (selectedVisitId === vid) selectedVisitId = visits[0]?.id || null;
        draw(false);
      });
    });

    document.getElementById('detail-edit-btn')?.addEventListener('click', () => draw(true));
    document.getElementById('detail-cancel-btn')?.addEventListener('click', () => draw(false));

    document.getElementById('detail-save-btn')?.addEventListener('click', () => {
      const name     = document.getElementById('edit-name')?.value.trim();
      const location = document.getElementById('edit-location')?.value.trim();
      const rating   = Number(document.getElementById('edit-rating')?.value);
      const memo     = document.getElementById('edit-memo')?.value;
      if (!name) { alert('카페 이름을 입력해주세요.'); return; }
      db.update('records', recordId, { name, location, rating, overall_memo: memo });
      Object.assign(record, { name, location, rating, overall_memo: memo });
      draw(false);
    });

    document.getElementById('detail-delete-btn')?.addEventListener('click', () => {
      if (!confirm('정말로 이 기록을 삭제하시겠습니까?')) return;
      db.delete('records', recordId);
      navigate('#/records');
    });

    /* Image upload */
    const imgInput = document.getElementById('detail-img-input');
    document.getElementById('detail-img-add-btn')?.addEventListener('click', () => {
      if ((record.atmosphere_images || []).length >= 10) { alert('최대 10장까지 가능합니다.'); return; }
      imgInput.click();
    });
    imgInput?.addEventListener('change', async e => {
      const file = e.target.files?.[0];
      if (!file) return;
      const label = document.getElementById('detail-img-add-label');
      if (label) label.textContent = '업로드 중...';
      const path = `${recordId}/${Math.random().toString(36).slice(2)}`;
      const url  = await imgStore.save(path, file);
      const imgs = [...(record.atmosphere_images || []), url];
      db.update('records', recordId, { atmosphere_images: imgs });
      record.atmosphere_images = imgs;
      imgInput.value = '';
      draw(false);
    });
  };

  draw(false);
}

/* ────────────────────────────────────────────────────────────────
   ORDER DETAIL  PAGE
──────────────────────────────────────────────────────────────── */

function renderOrderDetail(recordId, orderId) {
  const wrap = document.getElementById('order-detail-content');
  const order = db.findById('orders', orderId);
  if (!order) { wrap.innerHTML = '<p style="color:var(--brown-50);padding:40px;text-align:center;">주문 정보를 찾을 수 없습니다.</p>'; return; }

  document.getElementById('order-back-btn').onclick = () => navigate('#/records/' + recordId);

  const state = {
    drinkName: order.drink_name,
    price:     order.price ?? 0,
    rating:    order.rating,
    acidity:   order.acidity,
    body:      order.body,
    sweetness: order.sweetness,
    memo:      order.memo || '',
  };

  const draw = () => {
    wrap.innerHTML = `
      <div class="coffee-card" style="background:rgba(255,255,255,0.8);backdrop-filter:blur(8px);padding:32px;">

        <!-- 이름 -->
        <div style="margin-bottom:24px;">
          <label style="font-size:11px;font-weight:700;color:var(--brown-50);text-transform:uppercase;letter-spacing:0.2em;display:block;margin-bottom:8px;">Coffee Name</label>
          <input class="order-name-input" id="od-name" value="${esc(state.drinkName)}" placeholder="커피 이름을 입력하세요">
        </div>

        <!-- 가격 -->
        <div style="margin-bottom:24px;">
          <label style="font-size:11px;font-weight:700;color:var(--brown-50);text-transform:uppercase;letter-spacing:0.2em;display:block;margin-bottom:12px;">Price</label>
          <div class="price-input-wrap">
            <span class="price-prefix">₩</span>
            <input class="price-input" id="od-price" type="number" min="0" value="${state.price}" placeholder="0">
          </div>
        </div>

        <!-- 평점 -->
        <div style="margin-bottom:24px;">
          <label style="font-size:11px;font-weight:700;color:var(--brown-50);text-transform:uppercase;letter-spacing:0.2em;display:block;margin-bottom:12px;">Rating</label>
          <div class="rating-row" id="od-rating-row">
            ${[1,2,3,4,5].map(n => `
              <button class="rating-btn ${state.rating === n ? 'active' : ''}" data-rating="${n}">
                ${SVG.starLg} ${n}
              </button>`).join('')}
          </div>
        </div>

        <!-- 맛 프로파일 -->
        <div style="margin-bottom:24px;">
          <label style="font-size:11px;font-weight:700;color:var(--brown-50);text-transform:uppercase;letter-spacing:0.2em;display:block;margin-bottom:16px;border-bottom:1px solid var(--brown-5);padding-bottom:8px;">Taste Profile</label>
          ${[
            { key: 'acidity',   label: 'Acidity (산미)' },
            { key: 'body',      label: 'Body (바디감)' },
            { key: 'sweetness', label: 'Sweetness (단맛)' },
          ].map(t => `
            <div style="margin-bottom:24px;">
              <div style="display:flex;justify-content:space-between;align-items:flex-end;margin-bottom:12px;">
                <span style="font-weight:700;color:var(--brown);">${t.label}</span>
                <span style="font-size:12px;color:var(--brown-50);">${state[t.key]}/5</span>
              </div>
              <div class="taste-btn-row" data-taste="${t.key}">
                ${[1,2,3,4,5].map(n => `<button class="taste-btn ${state[t.key] === n ? 'active' : ''}" data-val="${n}">${n}</button>`).join('')}
              </div>
            </div>`).join('')}
        </div>

        <!-- 메모 -->
        <div style="margin-bottom:32px;">
          <label style="font-size:11px;font-weight:700;color:var(--brown-50);text-transform:uppercase;letter-spacing:0.2em;display:block;margin-bottom:16px;border-bottom:1px solid var(--brown-5);padding-bottom:8px;">Memo</label>
          <textarea class="memo-textarea" id="od-memo" placeholder="노트의 향과 맛, 분위기를 기록해보세요...">${esc(state.memo)}</textarea>
        </div>

        <button class="btn-save-order" id="od-save-btn">
          ${SVG.save} 수정 완료
        </button>

      </div>`;

    /* Rating buttons */
    wrap.querySelectorAll('#od-rating-row .rating-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        state.rating = Number(btn.dataset.rating);
        wrap.querySelectorAll('#od-rating-row .rating-btn').forEach(b => b.classList.toggle('active', b === btn));
      });
    });

    /* Taste buttons */
    wrap.querySelectorAll('[data-taste]').forEach(row => {
      row.querySelectorAll('.taste-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          state[row.dataset.taste] = Number(btn.dataset.val);
          row.querySelectorAll('.taste-btn').forEach(b => b.classList.toggle('active', b === btn));
          /* update the /5 label */
          const lbl = row.previousElementSibling?.querySelector('span:last-child');
          if (lbl) lbl.textContent = `${state[row.dataset.taste]}/5`;
        });
      });
    });

    document.getElementById('od-save-btn').addEventListener('click', () => {
      const drinkName = document.getElementById('od-name').value.trim();
      if (!drinkName) { alert('커피 이름을 입력해주세요.'); return; }
      const price     = Number(document.getElementById('od-price').value) || 0;
      const memo      = document.getElementById('od-memo').value;
      db.update('orders', orderId, { drink_name: drinkName, price, rating: state.rating, acidity: state.acidity, body: state.body, sweetness: state.sweetness, memo });
      navigate('#/records/' + recordId);
    });
  };

  draw();
}

/* ────────────────────────────────────────────────────────────────
   ADD RECORD  PAGE
──────────────────────────────────────────────────────────────── */

let addRecordState = null;

function initAddRecord() {
  /* Reset form */
  const form = document.getElementById('add-record-form');
  if (!form) return;

  addRecordState = {
    coffeeOrders: [defaultCoffee()],
    cafeRating:   3,
    images:       [],
  };

  /* Date default */
  document.getElementById('add-date').value = new Date().toISOString().split('T')[0];
  document.getElementById('add-cafe-name').value = '';
  document.getElementById('add-location').value  = '';
  document.getElementById('add-overall-memo').value = '';

  /* Cafe star picker */
  renderStarPicker('cafe-rating-picker', addRecordState.cafeRating, 'yellow', v => { addRecordState.cafeRating = v; });

  /* Coffee orders */
  renderCoffeeOrders();

  /* Add coffee button */
  document.getElementById('add-coffee-btn').onclick = () => {
    addRecordState.coffeeOrders.push(defaultCoffee());
    renderCoffeeOrders();
  };

  /* Image upload */
  renderAtmosphereGrid();
  document.getElementById('img-file-input').addEventListener('change', async e => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (addRecordState.images.length >= 10) { alert('최대 10장까지 가능합니다.'); return; }
    const label = document.getElementById('img-add-label');
    if (label) label.textContent = '업로드 중...';
    const path = `temp-${Date.now()}/${Math.random().toString(36).slice(2)}`;
    const url  = await imgStore.save(path, file);
    addRecordState.images.push(url);
    e.target.value = '';
    renderAtmosphereGrid();
  });

  /* Map search */
  document.getElementById('map-search-btn').onclick = () => {
    const name = document.getElementById('add-cafe-name').value.trim();
    if (!name) { alert('카페 이름을 입력해주세요.'); return; }
    window.open(`https://map.naver.com/v5/search/${encodeURIComponent(name)}`, '_blank');
  };

  /* Submit */
  form.onsubmit = handleAddRecordSubmit;
}

function defaultCoffee() {
  return { drink: '', price: '', coffeeRating: 3, acidity: 3, body: 3, sweetness: 3, memo: '' };
}

function renderCoffeeOrders() {
  const container = document.getElementById('coffee-orders-container');
  container.innerHTML = addRecordState.coffeeOrders.map((o, i) => `
    <div class="coffee-order-card" data-order-idx="${i}">
      <div class="coffee-order-header">
        <span class="coffee-order-label">${SVG.coffee} 커피 ${i + 1}</span>
        ${addRecordState.coffeeOrders.length > 1 ? `
          <button type="button" class="btn-remove-coffee" data-remove-idx="${i}">${SVG.trash}</button>` : ''}
      </div>
      <div class="form-grid-2" style="margin-bottom:20px;">
        <div>
          <label class="field-label">${SVG.coffee} 커피 이름</label>
          <input class="form-input" data-field="drink" data-idx="${i}" type="text"
            placeholder="예: 아이스 아메리카노" value="${esc(o.drink)}">
        </div>
        <div>
          <label class="field-label"><span style="font-size:14px;font-weight:700;line-height:1;">₩</span> 가격</label>
          <input class="form-input" data-field="price" data-idx="${i}" type="number"
            placeholder="예: 5500" value="${o.price}" min="0">
        </div>
      </div>
      <div style="margin-bottom:16px;">
        <p class="field-label" style="margin-bottom:12px;">맛 프로파일 <span style="font-weight:400;font-size:12px;color:var(--brown-30)">(1~5점)</span></p>
        ${renderRangeSlider('산미 (Acidity)',    'acidity',   i, o.acidity)}
        ${renderRangeSlider('바디감 (Body)',      'body',      i, o.body)}
        ${renderRangeSlider('단맛 (Sweetness)',  'sweetness', i, o.sweetness)}
      </div>
      <div style="margin-bottom:16px;">
        <p class="field-label" style="margin-bottom:12px;">커피 평점</p>
        <div class="star-picker" id="coffee-rating-${i}"></div>
      </div>
      <div>
        <p class="field-label" style="margin-bottom:8px;">커피 메모</p>
        <textarea class="form-textarea" data-field="memo" data-idx="${i}"
          placeholder="이 커피의 향, 맛, 느낌을 적어주세요." style="min-height:80px;">${esc(o.memo)}</textarea>
      </div>
    </div>`).join('');

  /* Star pickers for each coffee */
  addRecordState.coffeeOrders.forEach((o, i) => {
    renderStarPicker(`coffee-rating-${i}`, o.coffeeRating, 'brown', v => {
      addRecordState.coffeeOrders[i].coffeeRating = v;
    });
  });

  /* Remove buttons */
  container.querySelectorAll('[data-remove-idx]').forEach(btn => {
    btn.addEventListener('click', () => {
      addRecordState.coffeeOrders.splice(Number(btn.dataset.removeIdx), 1);
      renderCoffeeOrders();
      updateTotalPrice();
    });
  });

  /* Input changes */
  container.querySelectorAll('[data-field][data-idx]').forEach(input => {
    const handler = () => {
      const idx   = Number(input.dataset.idx);
      const field = input.dataset.field;
      addRecordState.coffeeOrders[idx][field] = input.type === 'number'
        ? (input.value === '' ? '' : Number(input.value))
        : input.value;
      if (field === 'price') updateTotalPrice();
    };
    input.addEventListener('input', handler);
    input.addEventListener('change', handler);
  });

  /* Range sliders */
  container.querySelectorAll('input[type="range"]').forEach(slider => {
    const idx   = Number(slider.dataset.idx);
    const field = slider.dataset.field;
    const valEl = document.getElementById(`range-val-${field}-${idx}`);
    slider.addEventListener('input', () => {
      addRecordState.coffeeOrders[idx][field] = Number(slider.value);
      if (valEl) valEl.textContent = slider.value + '점';
    });
  });

  updateTotalPrice();
}

function renderRangeSlider(label, field, idx, value) {
  return `
    <div class="range-wrap">
      <div class="range-header">
        <span class="range-label">${label}</span>
        <span class="range-value" id="range-val-${field}-${idx}">${value}점</span>
      </div>
      <input type="range" min="1" max="5" step="1" value="${value}"
        data-field="${field}" data-idx="${idx}">
      <div class="range-ticks">
        <span>1</span><span>2</span><span>3</span><span>4</span><span>5</span>
      </div>
    </div>`;
}

function renderStarPicker(containerId, current, theme, onChange) {
  const el = document.getElementById(containerId);
  if (!el) return;
  const activeClass = theme === 'yellow' ? 'active-yellow' : 'active-brown';
  el.innerHTML = [1,2,3,4,5].map(n => `
    <button type="button" class="star-btn ${current >= n ? activeClass : ''}" data-val="${n}">
      ${SVG.starLg}
    </button>`).join('');
  let val = current;
  el.querySelectorAll('.star-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      val = Number(btn.dataset.val);
      onChange(val);
      el.querySelectorAll('.star-btn').forEach((b, i) => {
        b.classList.toggle(activeClass, i < val);
      });
    });
  });
}

function renderAtmosphereGrid() {
  const grid = document.getElementById('atmosphere-grid');
  const imgs = addRecordState.images.map((url, i) => `
    <div class="img-thumb">
      <img src="${esc(url)}" alt="분위기 ${i+1}">
      <button type="button" class="img-remove" data-remove-img="${i}">✕</button>
    </div>`).join('');

  const addBtn = addRecordState.images.length < 10 ? `
    <div class="img-add-btn" id="img-add-btn">
      ${SVG.camera}
      <span id="img-add-label">사진 추가</span>
    </div>` : '';

  grid.innerHTML = imgs + addBtn;

  grid.querySelectorAll('[data-remove-img]').forEach(btn => {
    btn.addEventListener('click', () => {
      addRecordState.images.splice(Number(btn.dataset.removeImg), 1);
      renderAtmosphereGrid();
    });
  });

  document.getElementById('img-add-btn')?.addEventListener('click', () => {
    document.getElementById('img-file-input').click();
  });
}

function updateTotalPrice() {
  const total = addRecordState.coffeeOrders.reduce((s, o) => s + (Number(o.price) || 0), 0);
  const box   = document.getElementById('total-price-display');
  const val   = document.getElementById('total-price-value');
  if (box) box.classList.toggle('hidden', total === 0);
  if (val) val.textContent = '₩' + total.toLocaleString();
}

async function handleAddRecordSubmit(e) {
  e.preventDefault();
  const name  = document.getElementById('add-cafe-name').value.trim();
  const loc   = document.getElementById('add-location').value.trim();
  const date  = document.getElementById('add-date').value;
  const memo  = document.getElementById('add-overall-memo').value;

  if (!name) { alert('카페 이름을 입력해주세요.'); return; }
  if (addRecordState.coffeeOrders.some(o => !o.drink.trim())) {
    alert('모든 커피의 이름을 입력해주세요.');
    return;
  }

  const btn = document.getElementById('add-record-submit');
  btn.disabled = true;
  btn.innerHTML = '기록 중...';

  const record = db.insert('records', {
    name, location: loc,
    rating: addRecordState.cafeRating,
    atmosphere_images: addRecordState.images,
    overall_memo: memo,
  });

  const visit = db.insert('visits', { record_id: record.id, date });

  addRecordState.coffeeOrders.forEach(o => {
    db.insert('orders', {
      visit_id:   visit.id,
      drink_name: o.drink,
      price:      Number(o.price) || 0,
      rating:     o.coffeeRating,
      acidity:    o.acidity,
      body:       o.body,
      sweetness:  o.sweetness,
      memo:       o.memo,
    });
  });

  btn.disabled = false;
  navigate('#/records');
}

/* ────────────────────────────────────────────────────────────────
   DASHBOARD  PAGE
──────────────────────────────────────────────────────────────── */

function renderDashboard() {
  const records = db.findAll('records');
  const visits  = db.findAll('visits');
  const orders  = db.findAll('orders');

  const now        = new Date();
  const thisMonth  = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  const totalCafes    = records.length;
  const totalVisits   = visits.length;
  const monthlyVisits = visits.filter(v => v.date?.startsWith(thisMonth)).length;
  const avgRating     = orders.length ? +(orders.reduce((s, o) => s + (o.rating ?? 0), 0) / orders.length).toFixed(1) : 0;
  const avgAcidity    = orders.length ? +(orders.reduce((s, o) => s + (o.acidity   ?? 0), 0) / orders.length).toFixed(1) : 0;
  const avgBody       = orders.length ? +(orders.reduce((s, o) => s + (o.body      ?? 0), 0) / orders.length).toFixed(1) : 0;
  const avgSweetness  = orders.length ? +(orders.reduce((s, o) => s + (o.sweetness ?? 0), 0) / orders.length).toFixed(1) : 0;
  const tasteType     = getTasteType(avgAcidity, avgBody, avgSweetness);

  /* Top drinks */
  const drinkCnt = {};
  orders.forEach(o => { if (o.drink_name) drinkCnt[o.drink_name] = (drinkCnt[o.drink_name] || 0) + 1; });
  const topDrinks = Object.entries(drinkCnt).sort((a, b) => b[1] - a[1]).slice(0, 5);

  /* Best cafe */
  const visitMap = {};
  visits.forEach(v => { (visitMap[v.record_id] ??= []).push(v.id); });
  const bestCafe = records.map(r => {
    const vIds = new Set(visitMap[r.id] || []);
    const ords = orders.filter(o => vIds.has(o.visit_id));
    const avg  = ords.length ? ords.reduce((s, o) => s + (o.rating ?? 0), 0) / ords.length : 0;
    return { ...r, avgRating: avg, visitCount: (visitMap[r.id] || []).length };
  }).filter(r => r.avgRating > 0).sort((a, b) => b.avgRating - a.avgRating)[0] || null;

  /* Monthly data (last 6 months) */
  const monthlyData = Array.from({ length: 6 }, (_, i) => {
    const d   = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    return { label: `${d.getMonth() + 1}월`, count: visits.filter(v => v.date?.startsWith(key)).length };
  });

  /* Recent visits */
  const recentVisits = [...visits].sort((a, b) => b.date > a.date ? 1 : -1).slice(0, 4).map(v => {
    const record = records.find(r => r.id === v.record_id);
    const order  = orders.find(o => o.visit_id === v.id);
    return { visit: v, record, order };
  }).filter(x => x.record);

  /* Rating level */
  const ratingLevel =
    avgRating >= 4.5 ? '엄격한 미식가' :
    avgRating >= 3.5 ? '커피 애호가'   :
    avgRating >  0   ? '커피 입문자'   : '기록 없음';

  /* ── Subtitle ── */
  document.getElementById('dash-subtitle').textContent =
    `총 ${totalCafes}개 카페 · ${totalVisits}번의 방문 기록`;

  /* ── Stats grid ── */
  document.getElementById('dash-stats').innerHTML = [
    { label: '방문한 카페',  value: totalCafes,    unit: '곳', icon: SVG.coffee,   accent: false },
    { label: '총 방문 횟수', value: totalVisits,   unit: '회', icon: SVG.calendar, accent: false },
    { label: '이번 달 방문', value: monthlyVisits, unit: '회', icon: SVG.trending, accent: true  },
    { label: '평균 평점',    value: avgRating,     unit: '점', icon: SVG.star,     accent: false },
  ].map(s => `
    <div class="stat-card ${s.accent ? 'accent' : ''}">
      <div class="stat-card-label">${s.icon} ${s.label}</div>
      <div class="stat-card-value">${s.value}<span class="stat-card-unit">${s.unit}</span></div>
    </div>`).join('');

  /* ── Body ── */
  const maxDrink = topDrinks[0]?.[1] || 1;
  const medals   = ['🥇','🥈','🥉','',''];
  const maxMonth = Math.max(...monthlyData.map(d => d.count), 1);

  document.getElementById('dash-body').innerHTML = `

    <!-- Row 1: Taste DNA + Top Drinks -->
    <div class="dash-row dash-row-2">

      <!-- Taste DNA -->
      <div class="dash-card-dark">
        <p class="dash-eyebrow" style="color:var(--gold);">Taste DNA</p>
        <h2 class="dash-title" style="color:white;margin-bottom:16px;">나의 맛 프로파일</h2>
        ${buildRadarSVG(avgAcidity, avgBody, avgSweetness)}
        <div class="taste-type-badge">
          <span class="taste-type-emoji">${tasteType.emoji}</span>
          <div>
            <p class="taste-type-name">${tasteType.label}</p>
            <p class="taste-type-desc">${tasteType.desc}</p>
          </div>
        </div>
        <div class="taste-bars">
          ${[
            { label: '산미 (Acidity)',   val: avgAcidity,   color: '#7EC8E3' },
            { label: '바디감 (Body)',     val: avgBody,      color: '#C8A97E' },
            { label: '단맛 (Sweetness)', val: avgSweetness, color: '#D4AF37' },
          ].map(t => `
            <div class="taste-bar-row">
              <div class="taste-bar-header">
                <span class="taste-bar-label">${t.label}</span>
                <span class="taste-bar-val">${t.val > 0 ? t.val + ' / 5' : '-'}</span>
              </div>
              <div class="taste-bar-track">
                <div class="taste-bar-fill" style="width:${(t.val/5)*100}%;background:${t.color};"></div>
              </div>
            </div>`).join('')}
        </div>
      </div>

      <!-- Rating Level + Top Drinks -->
      <div style="display:flex;flex-direction:column;gap:16px;">

        <div class="rating-level-card">
          <div class="rating-level-icon">${SVG.award}</div>
          <div>
            <p class="rating-level-label">나의 레벨</p>
            <p class="rating-level-name">${ratingLevel}</p>
            <div class="rating-stars-row">
              ${[1,2,3,4,5].map(n => `<span style="color:${avgRating >= n ? '#D4AF37' : '#e5e7eb'}">${SVG.star}</span>`).join('')}
              <span style="font-size:12px;color:var(--brown-50);margin-left:4px;">평균 ${avgRating}점</span>
            </div>
          </div>
        </div>

        <div class="dash-card" style="flex:1;">
          <div class="row-between" style="margin-bottom:16px;">
            <p class="dash-eyebrow" style="color:var(--brown-50);">자주 마신 음료</p>
            <span style="color:var(--brown-30);">${SVG.coffee}</span>
          </div>
          ${topDrinks.length === 0
            ? `<p style="color:var(--brown-30);font-size:14px;text-align:center;padding:24px 0;">아직 기록이 없어요</p>`
            : `<div class="top-drinks">
                ${topDrinks.map(([name, count], i) => `
                  <div class="top-drink-row">
                    <div class="top-drink-header">
                      <span class="top-drink-name">${medals[i] || (i+1)+'.'} ${esc(name)}</span>
                      <span class="top-drink-count">${count}잔</span>
                    </div>
                    <div class="top-drink-track">
                      <div class="top-drink-fill ${i===0?'gold':'brown'}" style="width:${(count/maxDrink)*100}%;"></div>
                    </div>
                  </div>`).join('')}
               </div>`}
        </div>

      </div>
    </div><!-- /Row 1 -->

    <!-- Row 2: Monthly Chart + Best Cafe -->
    <div class="dash-row dash-row-2">

      <div class="dash-card">
        <div class="row-between" style="margin-bottom:24px;">
          <div>
            <p class="dash-eyebrow" style="color:var(--brown-50);">방문 히스토리</p>
            <h2 class="dash-title" style="color:var(--brown);">월별 카페 방문 횟수</h2>
          </div>
          <div style="width:40px;height:40px;background:var(--cream);border-radius:12px;display:flex;align-items:center;justify-content:center;border:1px solid var(--brown-10);">
            ${SVG.trending}
          </div>
        </div>
        <div class="monthly-bar-chart">
          ${monthlyData.map(d => `
            <div class="month-bar-col">
              <span class="month-bar-count">${d.count}</span>
              <div class="month-bar-track">
                <div class="month-bar-fill" style="height:${d.count > 0 ? Math.max((d.count/maxMonth)*100, 8) : 3}%;background:${d.count > 0 ? 'linear-gradient(180deg,#D4AF37 0%,#3D2B1F 100%)' : 'rgba(61,43,31,0.08)'};border-radius:4px 4px 0 0;"></div>
              </div>
              <span class="month-bar-label">${d.label}</span>
            </div>`).join('')}
        </div>
        <div class="row-between" style="font-size:12px;color:var(--brown-50);margin-top:16px;padding-top:16px;border-top:1px solid var(--brown-5);">
          <span>최근 6개월</span><span>총 ${visits.length}회 방문</span>
        </div>
      </div>

      ${bestCafe
        ? `<div class="best-cafe-card">
            <p style="color:var(--gold);font-size:11px;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;">Best Rated Café</p>
            <h2 class="best-cafe-name">${esc(bestCafe.name)}</h2>
            <div class="best-cafe-location">${SVG.mapPin} ${esc(bestCafe.location)}</div>
            <div style="display:flex;align-items:center;gap:16px;margin-top:16px;">
              <div class="best-cafe-rating-badge">${SVG.star} <span style="font-size:20px;font-weight:900;">${bestCafe.avgRating.toFixed(1)}</span> <span style="font-size:12px;opacity:0.7;">/ 5</span></div>
              <span style="color:rgba(255,255,255,0.5);font-size:14px;"><span style="color:white;font-weight:700;">${bestCafe.visitCount}</span>번 방문</span>
            </div>
            <a href="#/records/${bestCafe.id}" class="best-cafe-link">상세 기록 보기 ${SVG.chevron}</a>
          </div>`
        : `<div class="dash-card" style="display:flex;align-items:center;justify-content:center;">
            <div class="no-best-cafe">
              <div class="no-best-icon">${SVG.award}</div>
              <p class="no-best-text">카페를 기록하면<br>최고 평점 카페가 표시돼요</p>
              <a href="#/add-record" class="no-best-link">첫 기록 남기기 →</a>
            </div>
          </div>`}

    </div><!-- /Row 2 -->

    <!-- Row 3: Recent Visits -->
    <div class="dash-card">
      <div class="row-between" style="margin-bottom:20px;">
        <div>
          <p class="dash-eyebrow" style="color:var(--brown-50);">Recent Activity</p>
          <h2 class="dash-title" style="color:var(--brown);">최근 방문 기록</h2>
        </div>
        <a href="#/records" style="font-size:12px;font-weight:700;color:var(--brown-50);display:flex;align-items:center;gap:4px;">전체 보기 ${SVG.chevron}</a>
      </div>
      ${recentVisits.length === 0
        ? `<div style="text-align:center;padding:40px 0;">
            ${SVG.coffee}
            <p style="color:var(--brown-30);font-size:14px;margin-top:12px;">아직 기록이 없습니다.</p>
            <a href="#/add-record" style="font-size:14px;font-weight:700;color:var(--brown);display:inline-block;margin-top:12px;">첫 카페 기록하기 →</a>
          </div>`
        : recentVisits.map(({ visit, record, order }) => `
          <a href="#/records/${record.id}" class="recent-visit-item">
            <div class="visit-date-badge">
              <span class="visit-date-month">${visit.date?.slice(5,7)}월</span>
              <span class="visit-date-day">${visit.date?.slice(8,10)}</span>
            </div>
            <div class="visit-info">
              <p class="visit-cafe-name">${esc(record.name)}</p>
              <div class="visit-meta">
                ${order?.drink_name ? `<span class="visit-drink">${esc(order.drink_name)}</span><span>·</span>` : ''}
                ${SVG.mapPin} <span>${esc(record.location)}</span>
              </div>
            </div>
            ${order ? `<span class="visit-star-badge">${SVG.star} ${order.rating}</span>` : ''}
            ${SVG.chevron}
          </a>`).join('')}
    </div><!-- /Row 3 -->

    <!-- Row 4: Taste Deep Dive -->
    <div class="dash-card">
      <div style="margin-bottom:20px;">
        <p class="dash-eyebrow" style="color:var(--brown-50);">Taste Deep Dive</p>
        <h2 class="dash-title" style="color:var(--brown);">기록 기반 상세 통계</h2>
      </div>
      <div class="taste-deep-grid">
        ${[
          { label: '산미 (Acidity)',   avg: avgAcidity,   icon: '💧', color: '#7EC8E3', bg: '#EFF8FF', high: orders.filter(o=>o.acidity>=4).length },
          { label: '바디감 (Body)',     avg: avgBody,      icon: '🌊', color: '#C8A97E', bg: '#FBF5EE', high: orders.filter(o=>o.body>=4).length },
          { label: '단맛 (Sweetness)', avg: avgSweetness, icon: '🍯', color: '#D4AF37', bg: '#FDFBEF', high: orders.filter(o=>o.sweetness>=4).length },
        ].map(item => `
          <div class="taste-deep-card" style="background:${item.bg};">
            <div class="taste-deep-top">
              <div class="taste-deep-icon-wrap" style="background:${item.color}25;color:${item.color};">
                <span style="font-size:18px;">${item.icon}</span>
              </div>
              <span class="taste-deep-label">${item.label}</span>
            </div>
            <p class="taste-deep-value">${item.avg > 0 ? item.avg : '-'}${item.avg > 0 ? `<span class="taste-deep-unit">/5</span>` : ''}</p>
            <div class="taste-deep-segments">
              ${[1,2,3,4,5].map(n => `<div class="taste-deep-seg" style="background:${n <= item.avg ? item.color : item.color+'25'};"></div>`).join('')}
            </div>
            <p class="taste-deep-sub">${orders.length ? `${item.high}개 기록이 4점 이상` : '기록 없음'}</p>
          </div>`).join('')}
      </div>
      ${orders.length > 0 ? `
        <div class="taste-summary-bar">
          <span class="taste-summary-emoji">${tasteType.emoji}</span>
          <div>
            <p class="taste-summary-text">${tasteType.label} — ${tasteType.desc}</p>
            <p class="taste-summary-sub">총 ${orders.length}잔의 커피 기록을 바탕으로 분석한 결과입니다.</p>
          </div>
        </div>` : ''}
    </div><!-- /Row 4 -->
  `;
}

function getTasteType(acidity, body, sweetness) {
  if (acidity === 0 && body === 0 && sweetness === 0) return { emoji: '☕', label: '기록 중', desc: '더 많은 커피를 기록해보세요' };
  const diff = Math.max(acidity, body, sweetness) - Math.min(acidity, body, sweetness);
  if (diff < 0.5)                               return { emoji: '⚖️', label: '균형형',       desc: '어떤 커피든 조화롭게 즐기는 타입' };
  if (acidity >= body && acidity >= sweetness)  return { emoji: '🍋', label: '산미 선호형', desc: '밝고 과일향 풍부한 스페셜티 추천' };
  if (body >= acidity && body >= sweetness)     return { emoji: '🌊', label: '바디감 선호형', desc: '묵직하고 진한 에스프레소 베이스 추천' };
  return { emoji: '🍯', label: '단맛 선호형', desc: '달콤하고 부드러운 라떼 계열 추천' };
}

function buildRadarSVG(acidity, body, sweetness) {
  const W = 220, H = 220, cx = 110, cy = 110, R = 80;
  const toRad = d => (d * Math.PI) / 180;
  const axes = [
    { angle: -90, label: '산미',  val: acidity },
    { angle:  30, label: '바디감', val: body },
    { angle: 150, label: '단맛',  val: sweetness },
  ];
  const axisPts  = axes.map(a => ({ x: cx + R * Math.cos(toRad(a.angle)), y: cy + R * Math.sin(toRad(a.angle)) }));
  const scaledPts= axes.map(a => ({ x: cx + R * (a.val/5) * Math.cos(toRad(a.angle)), y: cy + R * (a.val/5) * Math.sin(toRad(a.angle)) }));
  const labelPts = axes.map(a => ({ x: cx + (R+26) * Math.cos(toRad(a.angle)), y: cy + (R+26) * Math.sin(toRad(a.angle)) }));
  const poly = scaledPts.map(p => `${p.x},${p.y}`).join(' ');
  const grid = [0.2,0.4,0.6,0.8,1].map(s =>
    `<polygon points="${axisPts.map(p=>`${cx+(p.x-cx)*s},${cy+(p.y-cy)*s}`).join(' ')}" fill="none" stroke="rgba(255,255,255,0.12)" stroke-width="1"/>`
  ).join('');

  return `<div class="taste-radar-wrap">
    <svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
      ${grid}
      ${axisPts.map(p=>`<line x1="${cx}" y1="${cy}" x2="${p.x}" y2="${p.y}" stroke="rgba(255,255,255,0.2)" stroke-width="1"/>`).join('')}
      <polygon points="${poly}" fill="#D4AF37" fill-opacity="0.35" stroke="#D4AF37" stroke-width="2.5" stroke-linejoin="round"/>
      ${scaledPts.map(p=>`<circle cx="${p.x}" cy="${p.y}" r="5" fill="#D4AF37" stroke="white" stroke-width="1.5"/>`).join('')}
      ${axes.map((a,i)=>`
        <text x="${labelPts[i].x}" y="${labelPts[i].y-6}" text-anchor="middle" font-size="11" font-weight="700" fill="white">${a.label}</text>
        <text x="${labelPts[i].x}" y="${labelPts[i].y+8}" text-anchor="middle" font-size="10" fill="#D4AF37" font-weight="600">${a.val.toFixed(1)}</text>`).join('')}
      <circle cx="${cx}" cy="${cy}" r="3" fill="rgba(255,255,255,0.4)"/>
    </svg>
  </div>`;
}

/* ────────────────────────────────────────────────────────────────
   MAP  PAGE
──────────────────────────────────────────────────────────────── */

function renderMap() {
  const searchInput = document.getElementById('map-search');
  const listEl      = document.getElementById('map-list');

  const draw = () => {
    const term    = searchInput.value.toLowerCase();
    const records = db.findAll('records');
    const visits  = db.findAll('visits');
    const orders  = db.findAll('orders');

    const items = records.map(r => {
      const rv = visits.filter(v => v.record_id === r.id).sort((a, b) => b.date > a.date ? 1 : -1);
      const lv = rv[0];
      const lo = lv ? orders.find(o => o.visit_id === lv.id) : null;
      return { ...r, date: lv?.date || '', drink: lo?.drink_name || '' };
    }).filter(r =>
      !term ||
      r.name.toLowerCase().includes(term) ||
      r.location.toLowerCase().includes(term)
    );

    if (items.length === 0) {
      listEl.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">${SVG.coffee}</div>
          <p class="empty-state-text">
            ${term ? `"${esc(term)}" 검색 결과가 없습니다.` : '아직 기록이 없습니다.'}
          </p>
          ${!term ? `<a href="#/add-record">첫 카페 기록하기 →</a>` : ''}
        </div>`;
      return;
    }

    listEl.innerHTML = items.map(r => `
      <div class="map-cafe-card" data-naver-query="${esc(r.name + ' ' + r.location)}">
        <div style="display:flex;align-items:center;gap:20px;">
          <div class="map-cafe-icon">${SVG.coffee}</div>
          <div>
            <div class="map-cafe-name">
              ${esc(r.name)}
              <span class="rating-badge">${SVG.star} ${r.rating}</span>
            </div>
            <p style="color:var(--brown-60,rgba(61,43,31,0.6));font-size:14px;font-weight:500;margin-top:2px;">${esc(r.drink)}</p>
            <div style="display:flex;align-items:center;gap:12px;font-size:12px;color:var(--brown-50);margin-top:4px;">
              <span style="display:flex;align-items:center;gap:4px;">${SVG.mapPin} ${esc(r.location)}</span>
              <span>•</span>
              <span>${esc(r.date)}</span>
            </div>
          </div>
        </div>
        <div style="display:flex;align-items:center;gap:16px;">
          <span class="map-naver-link hide-sm">네이버 지도 ${SVG.external}</span>
          ${SVG.chevron}
        </div>
      </div>`).join('');

    listEl.querySelectorAll('[data-naver-query]').forEach(card => {
      card.addEventListener('click', () => {
        window.open(`https://map.naver.com/v5/search/${encodeURIComponent(card.dataset.naverQuery)}`, '_blank');
      });
    });
  };

  draw();
  searchInput.oninput = draw;
}

/* ────────────────────────────────────────────────────────────────
   UTILS
──────────────────────────────────────────────────────────────── */

function esc(str) {
  if (str == null) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/* ────────────────────────────────────────────────────────────────
   BOOT
──────────────────────────────────────────────────────────────── */

route();
