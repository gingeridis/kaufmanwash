/* ============================================================
   CONTENT LOADER — fetches /api/content (edited from /admin) and
   renders it into the page. Falls back to DEFAULT_CONTENT (js/data.js)
   if the request fails, so the site still works without Functions.
   ============================================================ */

function ckGet(obj, path) {
  return path.split('.').reduce((o, k) => (o == null ? undefined : o[k]), obj);
}

const money = n => `$${Number(n).toFixed(0)}`;

function renderContent(content) {
  // ---- generic scalar/indexed text hydration ----
  document.querySelectorAll('[data-ck]').forEach(el => {
    const value = ckGet(content, el.dataset.ck);
    if (value != null) el.textContent = value;
  });

  // ---- hero heading (rebuilt so the highlighted word stays teal) ----
  const heroHeading = document.getElementById('heroHeading');
  if (heroHeading && content.hero) {
    const { heading, highlight } = content.hero;
    if (highlight && heading.includes(highlight)) {
      const idx = heading.indexOf(highlight);
      heroHeading.textContent = '';
      heroHeading.append(
        document.createTextNode(heading.slice(0, idx)),
        Object.assign(document.createElement('span'), { textContent: highlight }),
        document.createTextNode(heading.slice(idx + highlight.length))
      );
    } else {
      heroHeading.textContent = heading;
    }
  }

  // ---- footer email link (text handled by data-ck, href needs updating too) ----
  const footerEmailLink = document.getElementById('footerEmailLink');
  if (footerEmailLink && content.footer) {
    footerEmailLink.href = `mailto:${content.footer.email}`;
  }

  // ---- pricing grid (by vehicle size) ----
  const pricingGrid = document.getElementById('pricingGrid');
  if (pricingGrid) {
    pricingGrid.innerHTML = content.vehicleSizes.map((v, i) => `
      <div class="pkg-card ${i === 0 ? 'featured' : ''}">
        ${i === 0 ? `<span class="pkg-badge">Most booked</span>` : ''}
        <h3>${v.name}</h3>
        <div class="pkg-tag">${v.examples}</div>
        <div class="pkg-price">${money(v.price)}</div>
        <div class="pkg-duration">~${Math.round(v.duration / 60 * 10) / 10} hr appointment</div>
        <ul class="pkg-includes">
          ${content.detailIncludes.map(inc => `<li>${inc}</li>`).join('')}
        </ul>
        <a class="btn ${i === 0 ? 'btn-teal' : 'btn-ghost'} btn-block" href="booking.html?size=${v.id}">Select &amp; book</a>
      </div>
    `).join('');
  }

  // ---- add-ons grid ----
  const addonGrid = document.getElementById('addonGrid');
  if (addonGrid) {
    addonGrid.innerHTML = content.addons.map(a => `
      <div class="addon-card">
        <div>
          <h4>${a.name}</h4>
          <p>${a.desc}</p>
        </div>
        <div class="addon-price">+${money(a.price)}</div>
      </div>
    `).join('');
  }

  // ---- booking-page pricing recap (read-only — Square is the source of truth at checkout) ----
  const recapGrid = document.getElementById('recapGrid');
  if (recapGrid) {
    recapGrid.innerHTML = content.vehicleSizes.map(v => `
      <div class="recap-card">
        <div>
          <div class="name">${v.name}</div>
          <div class="meta">${v.examples}</div>
        </div>
        <div class="price">${money(v.price)}</div>
      </div>
    `).join('');
  }
}

fetch('/api/content', { cache: 'no-store' })
  .then(res => (res.ok ? res.json() : Promise.reject()))
  .then(renderContent)
  .catch(() => renderContent(DEFAULT_CONTENT));
