---
permalink: /links/
title: "Links"
author_profile: true
---

<style>
.links-page {
  font-family: "Inter", "PingFang SC", "Microsoft YaHei", "Hiragino Sans GB", sans-serif;
  --lk-surface: #ffffff;
  --lk-surface-hover: #fcfaf7;
  --lk-border: #e8e2d8;
  --lk-border-hover: #c8a97e;
  --lk-ink: #2c2620;
  --lk-muted: #7a7066;
  --lk-accent: #8f6b43;
  --lk-accent-soft: rgba(200, 169, 126, 0.14);
  --lk-tool-accent: #3d6386;
  --lk-tool-soft: rgba(91, 122, 154, 0.12);
  --lk-shadow: 0 2px 10px -4px rgba(45, 36, 26, 0.06);
  --lk-shadow-hover: 0 10px 24px -10px rgba(45, 36, 26, 0.14);
}

.links-section {
  margin: 0 0 2.2rem;
}

.links-section__head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 0.75rem;
  margin: 0 0 1rem;
  padding-bottom: 0.45rem;
  border-bottom: 1px solid var(--lk-border);
}

.links-section__title {
  margin: 0 !important;
  padding: 0 !important;
  border: 0 !important;
  font-size: 1.22em !important;
  font-weight: 700;
  color: var(--lk-ink) !important;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.links-section__title::before {
  display: none !important;
}

.links-section__icon {
  display: inline-grid;
  place-items: center;
  width: 28px;
  height: 28px;
  border-radius: 8px;
  background: var(--lk-accent-soft);
  color: var(--lk-accent);
  flex-shrink: 0;
}

.links-section--tools .links-section__icon {
  background: var(--lk-tool-soft);
  color: var(--lk-tool-accent);
}

.links-section__count {
  font-size: 0.76rem;
  font-weight: 600;
  color: var(--lk-muted);
  font-variant-numeric: tabular-nums;
}

.links-grid {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.85rem;
}

.links-grid li {
  margin: 0;
}

.links-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.85rem;
  padding: 0.95rem 1.05rem;
  border-radius: 12px;
  border: 1px solid var(--lk-border);
  background: var(--lk-surface);
  box-shadow: var(--lk-shadow);
  text-decoration: none !important;
  color: var(--lk-ink) !important;
  transition: transform 200ms cubic-bezier(0.22, 1, 0.36, 1),
              border-color 200ms ease,
              box-shadow 200ms ease,
              background-color 200ms ease;
}

.links-card:hover,
.links-card:focus-visible {
  transform: translateY(-2px);
  border-color: var(--lk-border-hover);
  background: var(--lk-surface-hover);
  box-shadow: var(--lk-shadow-hover);
}

.links-section--tools .links-card:hover,
.links-section--tools .links-card:focus-visible {
  border-color: var(--lk-tool-accent);
}

.links-card__body {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.links-card__name {
  font-size: 0.96rem;
  font-weight: 650;
  color: var(--lk-ink);
  line-height: 1.35;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.links-card__meta {
  font-size: 0.77rem;
  color: var(--lk-muted);
  font-family: ui-monospace, "SFMono-Regular", Menlo, Consolas, monospace;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.links-card__arrow {
  flex-shrink: 0;
  width: 28px;
  height: 28px;
  border-radius: 999px;
  display: grid;
  place-items: center;
  background: var(--lk-accent-soft);
  color: var(--lk-accent);
  font-size: 0.86rem;
  transition: transform 200ms cubic-bezier(0.22, 1, 0.36, 1), background-color 200ms ease, color 200ms ease;
}

.links-section--tools .links-card__arrow {
  background: var(--lk-tool-soft);
  color: var(--lk-tool-accent);
}

.links-card:hover .links-card__arrow {
  transform: translateX(3px);
  background: var(--lk-accent);
  color: #ffffff;
}

.links-section--tools .links-card:hover .links-card__arrow {
  background: var(--lk-tool-accent);
  color: #ffffff;
}

.links-empty {
  color: var(--lk-muted);
  font-style: italic;
  padding: 0.75rem 0;
}

@media (max-width: 640px) {
  .links-grid {
    grid-template-columns: minmax(0, 1fr);
  }
}

@media (prefers-color-scheme: dark) {
  .links-page {
    --lk-surface: #232730;
    --lk-surface-hover: #292e39;
    --lk-border: #323846;
    --lk-border-hover: #c8a97e;
    --lk-ink: #e8ecf2;
    --lk-muted: #98a2b3;
    --lk-accent: #d7b98e;
    --lk-accent-soft: rgba(215, 185, 142, 0.14);
    --lk-tool-accent: #8aafce;
    --lk-tool-soft: rgba(138, 175, 206, 0.14);
    --lk-shadow: 0 2px 10px -4px rgba(0, 0, 0, 0.35);
    --lk-shadow-hover: 0 12px 26px -10px rgba(0, 0, 0, 0.55);
  }
}
</style>

<div class="links-page">
  <section class="links-section links-section--people" aria-labelledby="links-people-title">
    <div class="links-section__head">
      <h2 class="links-section__title" id="links-people-title">
        <span class="links-section__icon" aria-hidden="true">
          <svg viewBox="0 0 20 20" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><circle cx="8" cy="7" r="3"/><path d="M2.8 16a5.2 5.2 0 0 1 10.4 0M13.5 5.5a2.5 2.5 0 0 1 0 5M17.2 16a4 4 0 0 0-2.6-3.7"/></svg>
        </span>
        People
      </h2>
      {% if site.data.friends %}<span class="links-section__count">{{ site.data.friends.size }}</span>{% endif %}
    </div>
    {% if site.data.friends %}
    <ul class="links-grid">
      {% for friend in site.data.friends %}
        {% assign host = friend.url | remove: 'https://' | remove: 'http://' | split: '/' | first %}
        <li>
          <a class="links-card" href="{{ friend.url }}" target="_blank" rel="noopener noreferrer">
            <span class="links-card__body">
              <span class="links-card__name">{{ friend.name }}</span>
              <span class="links-card__meta">{{ host }}</span>
            </span>
            <span class="links-card__arrow" aria-hidden="true">↗</span>
          </a>
        </li>
      {% endfor %}
    </ul>
    {% else %}
    <p class="links-empty">暂无友链。</p>
    {% endif %}
  </section>

  <section class="links-section links-section--tools" aria-labelledby="links-useful-title">
    <div class="links-section__head">
      <h2 class="links-section__title" id="links-useful-title">
        <span class="links-section__icon" aria-hidden="true">
          <svg viewBox="0 0 20 20" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M8.5 11.5 11.5 8.5M6.5 13.5l-1.3 1.3a2.5 2.5 0 0 1-3.5-3.5l2.8-2.8a2.5 2.5 0 0 1 3.5 0M13.5 6.5l1.3-1.3a2.5 2.5 0 0 1 3.5 3.5l-2.8 2.8a2.5 2.5 0 0 1-3.5 0"/></svg>
        </span>
        Useful Links
      </h2>
      {% if site.data.useful_links %}<span class="links-section__count">{{ site.data.useful_links.size }}</span>{% endif %}
    </div>
    {% if site.data.useful_links %}
    <ul class="links-grid">
      {% for link in site.data.useful_links %}
        <li>
          {% if link.path %}
          <a class="links-card" href="{{ link.path | relative_url }}">
            <span class="links-card__body">
              <span class="links-card__name">{{ link.name }}</span>
              <span class="links-card__meta">{{ link.path }}</span>
            </span>
            <span class="links-card__arrow" aria-hidden="true">→</span>
          </a>
          {% else %}
          {% assign host = link.url | remove: 'https://' | remove: 'http://' | split: '/' | first %}
          <a class="links-card" href="{{ link.url }}" target="_blank" rel="noopener noreferrer">
            <span class="links-card__body">
              <span class="links-card__name">{{ link.name }}</span>
              <span class="links-card__meta">{{ host }}</span>
            </span>
            <span class="links-card__arrow" aria-hidden="true">↗</span>
          </a>
          {% endif %}
        </li>
      {% endfor %}
    </ul>
    {% else %}
    <p class="links-empty">暂无链接。</p>
    {% endif %}
  </section>
</div>
