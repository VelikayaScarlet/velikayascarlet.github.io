---
permalink: /creations/
title: "Creations"
layout: creation-home
author_profile: false
hide_nav: true
---


<main class="creation-folio" lang="zh-CN">
  <header class="folio-hero">
    <img class="folio-scenery" src="{{ '/images/creations-color-print.jpg' | relative_url }}" alt="" fetchpriority="high">
    <div class="folio-hero-inner">
      <div class="folio-tools">
        <span class="folio-imprint" aria-hidden="true">CREATIONS</span>
        <div class="folio-hero-controls">
          <button id="folio-next-background" type="button" aria-label="切换背景" title="切换背景">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 22H6a4 4 0 0 1-4-4V6"/><rect x="6" y="2" width="16" height="16" rx="3"/><circle cx="11" cy="7" r="1"/><path d="m6 14 3-2 3 2 4-4 6 5"/></svg>
          </button>
          {% include creation-theme-control.html %}
        </div>
      </div>
      <div class="folio-title">
        <h1 id="creation-hero-title">重逢初见处，你我尚无诗</h1>
      </div>
      <a class="folio-down" href="#writing" aria-label="查看最新更新"><span aria-hidden="true">↓</span></a>
    </div>
  </header>

  <div class="folio-body">
    <section class="folio-news" id="writing" aria-labelledby="creation-posts-title">
      <header class="folio-updates-head">
        <h2 id="creation-posts-title">最新更新</h2>
        <div class="creation-year-filter" aria-label="按更新年份筛选"></div>
      </header>
      <div class="creation-update-list" aria-live="polite"><p class="creation-update-status">正在加载更新…</p></div>
      <template id="folio-feature-book">
        <span class="folio-book-stage" aria-hidden="true">
          <span class="folio-book-volume">
            <span class="folio-book-page"><span class="folio-book-page-date"></span></span>
            <span class="folio-book-cover">
              <span class="folio-book-front"><span class="folio-book-jacket-title"></span></span>
              <span class="folio-book-verso"></span>
            </span>
          </span>
        </span>
      </template>
      <nav class="creation-pagination" aria-label="更新分页" hidden>
        <span data-creation-page-info></span>
        <div><button type="button" data-creation-page="prev">上一页</button><button type="button" data-creation-page="next">下一页</button></div>
      </nav>
    </section>

    <nav class="folio-contents" aria-label="作品目录">
      <a href="#collections">诗集</a><a href="#library">文库</a><a href="#languages">语言档案</a><a href="#settings">设定</a>
    </nav>

    <section class="folio-chapter folio-chapter--books" id="collections" aria-labelledby="folio-collections-title">
      <header class="folio-chapter-title">
        <span aria-hidden="true">01</span><h2 id="folio-collections-title">诗集</h2>
      </header>
      <div class="folio-chapter-content">
        <ol class="folio-poetry">
          <li><a href="{{ '/creations/poems/觅月集.pdf' | relative_url }}" target="_blank" rel="noopener"><img class="folio-cover-art" src="{{ '/images/creations-book-moon.jpg' | relative_url }}" alt="" width="640" height="800" loading="lazy" decoding="async"><span class="folio-row-index" aria-hidden="true">01</span><b>觅月集</b><span class="folio-arrow" aria-hidden="true">↗</span></a></li>
          <li><a href="{{ '/creations/poems/折光集.pdf' | relative_url }}" target="_blank" rel="noopener"><img class="folio-cover-art" src="{{ '/images/creations-book-light.jpg' | relative_url }}" alt="" width="640" height="800" loading="lazy" decoding="async"><span class="folio-row-index" aria-hidden="true">02</span><b>折光集</b><span class="folio-arrow" aria-hidden="true">↗</span></a></li>
          <li><a href="{{ '/creations/poems/东海集.pdf' | relative_url }}" target="_blank" rel="noopener"><img class="folio-cover-art" src="{{ '/images/creations-book-sea.jpg' | relative_url }}" alt="" width="640" height="800" loading="lazy" decoding="async"><span class="folio-row-index" aria-hidden="true">03</span><b>东海集</b><span class="folio-arrow" aria-hidden="true">↗</span></a></li>
          <li><a href="{{ '/creations/poems/洛上集.pdf' | relative_url }}" target="_blank" rel="noopener"><img class="folio-cover-art" src="{{ '/images/creations-book-kyoto.jpg' | relative_url }}" alt="" width="640" height="800" loading="lazy" decoding="async"><span class="folio-row-index" aria-hidden="true">04</span><b>洛上集</b><span class="folio-arrow" aria-hidden="true">↗</span></a></li>
        </ol>
      </div>
    </section>
    <section class="folio-chapter" id="library" aria-labelledby="folio-library-title">
      <header class="folio-chapter-title">
        <span aria-hidden="true">02</span><h2 id="folio-library-title">文库</h2>
      </header>
      <div class="folio-chapter-content">
        <div class="folio-group">
          <h3>小说</h3>
          <a class="folio-link" href="{{ '/creations/stories/yexing/' | relative_url }}"><b>事物替我们说话</b></a>
          <a class="folio-link" href="{{ '/creations/cmbpre/' | relative_url }}"><b>联合军前传</b></a>
        </div>
        <div class="folio-group">
          <h3>随笔与回忆录</h3>
          <a class="folio-link" href="{{ '/creations/guisui-zaji/' | relative_url }}"><b>归绥杂记</b></a>
          <a class="folio-link" href="{{ '/creations/liubin-memoir/' | relative_url }}"><b>刘彬回忆录——我的大学</b></a>
          <a class="folio-link" href="{{ '/creations/political/' | relative_url }}"><b>玻璃蒂克</b><span>受保护</span></a>
        </div>
        <div class="folio-group">
          <h3>访谈</h3>
          <a class="folio-link" href="{{ '/creations/interviews/xinshi/' | relative_url }}"><b>十年心事付江花</b></a>
          <a class="folio-link" href="{{ '/creations/interviews/atypical/' | relative_url }}"><b>晴岚的非典型恋爱自述</b></a>
        </div>
      </div>
    </section>
    <section class="folio-chapter" id="languages" aria-labelledby="folio-languages-title">
      <header class="folio-chapter-title">
        <span aria-hidden="true">03</span><h2 id="folio-languages-title">语言档案</h2>
      </header>
      <div class="folio-chapter-content">
        <div class="folio-group">
          <h3>红河语</h3>
          <a class="folio-link" href="{{ '/creations/essays/红河语/红河语语法.pdf' | relative_url }}"><b>红河语语法</b><span>PDF</span></a>
          <a class="folio-link" href="{{ '/creations/essays/红河语/红河语发音.pdf' | relative_url }}"><b>红河语音系与拼写</b><span>PDF</span></a>
        </div>
        <div class="folio-group">
          <h3>别利语</h3>
          <a class="folio-link" href="{{ '/creations/essays/别利语/别利语简述%5B18.7.A2%5D.pdf' | relative_url }}"><b>别利语简述</b><span>PDF</span></a>
        </div>
      </div>
    </section>
    <section class="folio-chapter" id="settings" aria-labelledby="folio-settings-title">
      <header class="folio-chapter-title">
        <span aria-hidden="true">04</span><h2 id="folio-settings-title">设定</h2>
      </header>
      <div class="folio-chapter-content">
        <div class="folio-group">
          <a class="folio-link" href="{{ '/creations/settings/identity-number/' | relative_url }}"><b>新版身份证号码设定</b></a>
          <a class="folio-link" href="{{ '/creations/settings/army-organization/' | relative_url }}"><b>陆军编制与军衔</b></a>
        </div>
      </div>
    </section>
    <footer class="folio-footer"><span>Creations · 2014–2026</span><a href="#">回到顶部 <span aria-hidden="true">↑</span></a></footer>
  </div>
</main>

<script>
(function () {
  var folio = document.querySelector('.creation-folio');

  var scenery = folio.querySelector('.folio-scenery');
  var backgrounds = [
    {{ '/images/creations-color-print.jpg' | relative_url | jsonify }},
    {{ '/images/creations-mist-train.jpg' | relative_url | jsonify }},
    {{ '/images/creations-rain-window.jpg' | relative_url | jsonify }},
    {{ '/images/creations-letter-and-grapes.jpg' | relative_url | jsonify }}
  ];
  var previousBackground = -1;
  try {
    var stored = sessionStorage.getItem('creation-hero-background');
    if (stored !== null) previousBackground = Number(stored);
  } catch (error) {}
  var choices = backgrounds.map(function (_, i) { return i; }).filter(function (i) { return i !== previousBackground; });
  var backgroundIndex = choices[Math.floor(Math.random() * choices.length)];

  var pendingImage;
  var sceneryAnimation;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  function showBackground(index, animate) {
    backgroundIndex = index;
    var image = new Image();
    pendingImage = image;
    image.onload = function () {
      if (pendingImage !== image) return;
      scenery.src = image.src;
      try { sessionStorage.setItem('creation-hero-background', String(index)); } catch (error) {}
      if (!animate || reduceMotion.matches || !scenery.animate) return;
      if (sceneryAnimation) sceneryAnimation.cancel();
      sceneryAnimation = scenery.animate([{ opacity: 0.65 }, { opacity: 1 }], { duration: 320, easing: 'ease-out' });
    };
    image.src = backgrounds[index];
  }

  showBackground(backgroundIndex);
  document.getElementById('folio-next-background').addEventListener('click', function () {
    showBackground((backgroundIndex + 1) % backgrounds.length, true);
  });

  if (!reduceMotion.matches && 'IntersectionObserver' in window) {
    var poetry = folio.querySelector('.folio-poetry');
    var shelfObserver = new IntersectionObserver(function (entries) {
      if (entries.some(function (entry) { return entry.isIntersecting; })) {
        poetry.classList.add('is-revealed');
        shelfObserver.disconnect();
      }
    }, { threshold: 0.15 });
    shelfObserver.observe(poetry);
  }

  var heroTitle = document.getElementById('creation-hero-title');
  var heroLines = [
    '千思万绪都为梦，由她来去随缘',
    '往今皆伴水，风雨落花天',
    '倚枕斜看风掠叶，神思遥拾落花声',
    '万般情难了，酒醒泪光莹',
    '欲把前尘归梦里，笔停又念当年意',
    '一笺一页一乾坤',
    '认取河山，刻作星霜记',
    '谁知今夜泪，与雨共稠浓',
    '岁岁东风似旧时',
    '低吟一曲送春词',
    '半世光阴针脚里，织成多少春秋',
    '开时明月满西窗',
    '满城灯火是君留',
    '何时圆月上回廊',
    '看君眉眼是支歌',
    '可渡相思去枕前',
    '一篙烟雨一篙星',
    '浦江灯火渐分明',
    '春风不管前尘事，吹落高枝几片樱',
    '重逢初见处，你我尚无诗'
  ];

  if (heroTitle) {
    var previousIndex = -1;
    try { previousIndex = Number(sessionStorage.getItem('creation-hero-line')); } catch (error) {}
    var lineIndex = Math.floor(Math.random() * heroLines.length);
    if (lineIndex === previousIndex && heroLines.length > 1) lineIndex = (lineIndex + 1) % heroLines.length;
    heroTitle.textContent = heroLines[lineIndex];
    try { sessionStorage.setItem('creation-hero-line', String(lineIndex)); } catch (error) {}
  }


  var list = document.querySelector('.creation-update-list');
  var filters = document.querySelector('.creation-year-filter');
  var pagination = document.querySelector('.creation-pagination');
  var pageInfo = document.querySelector('[data-creation-page-info]');
  var pageButtons = Array.prototype.slice.call(document.querySelectorAll('[data-creation-page]'));
  var updates = [];
  var currentPage = 1;
  var currentYear = 'all';
  var perPage = 5;
  var baseUrl = {{ site.baseurl | default: '' | jsonify }};
  var bookTemplate = document.getElementById('folio-feature-book');
  var coverSources = new Map();
  folio.querySelectorAll('.folio-poetry a').forEach(function (link) {
    var cover = link.querySelector('.folio-cover-art');
    if (cover) coverSources.set(link.href, cover.src);
  });

  function featureUpdate(link, time, heading, arrow) {
    var info = document.createElement('div');
    info.className = 'folio-feature-info';
    var action = document.createElement('span');
    action.className = 'folio-feature-action';
    action.append('阅读作品', arrow);
    info.append(time, heading, action);

    var book = bookTemplate.content.firstElementChild.cloneNode(true);
    book.querySelector('.folio-book-page-date').textContent = time.textContent;
    var jacket = book.querySelector('.folio-book-jacket-title');
    jacket.textContent = heading.textContent;
    var coverSrc = coverSources.get(link.href);
    if (coverSrc) {
      var art = document.createElement('img');
      art.alt = '';
      art.decoding = 'async';
      art.addEventListener('load', function () { jacket.hidden = true; }, { once: true });
      art.src = coverSrc;
      jacket.after(art);
    }
    link.append(info, book);
  }

  function render() {
    var matching = updates.filter(function (item) {
      return currentYear === 'all' || item.date.slice(0, 4) === currentYear;
    });
    var pages = Math.max(1, Math.ceil(matching.length / perPage));
    currentPage = Math.max(1, Math.min(currentPage, pages));
    list.replaceChildren();
    matching.slice((currentPage - 1) * perPage, currentPage * perPage).forEach(function (item, index) {
      var article = document.createElement('article');
      article.className = 'folio-update';
      var time = document.createElement('time');
      time.dateTime = item.date;
      time.textContent = item.date.slice(0, 10).replace(/-/g, '.');
      var link = document.createElement('a');
      link.href = baseUrl + item.url;
      var heading = document.createElement('h3');
      heading.textContent = item.title;
      var arrow = document.createElement('span');
      arrow.className = 'folio-arrow';
      arrow.setAttribute('aria-hidden', 'true');
      arrow.textContent = '→';
      if (index === 0) {
        article.classList.add('folio-update--feature');
        featureUpdate(link, time, heading, arrow);
      } else {
        link.append(time, heading, arrow);
      }
      article.append(link);
      list.append(article);
    });
    if (!matching.length) {
      var empty = document.createElement('p');
      empty.className = 'creation-update-status';
      empty.textContent = '暂无更新';
      list.append(empty);
    }
    pagination.hidden = matching.length <= perPage;
    pageInfo.textContent = '第 ' + currentPage + ' / ' + pages + ' 页';
    pageButtons[0].disabled = currentPage === 1;
    pageButtons[1].disabled = currentPage === pages;
  }

  function setup(data) {
    updates = data.updates.filter(function (item) {
      return typeof item.date === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(item.date) &&
        typeof item.title === 'string' && typeof item.url === 'string' &&
        item.url.indexOf('/creations/') === 0 &&
        item.url.indexOf('/creations/languages/') !== 0 && item.url !== '/creations/bielian/';
    }).sort(function (a, b) { return b.date.localeCompare(a.date); });
    var years = Array.from(new Set(updates.map(function (item) { return item.date.slice(0, 4); })));
    filters.replaceChildren();
    ['all'].concat(years).forEach(function (year) {
      var button = document.createElement('button');
      button.type = 'button';
      button.textContent = year === 'all' ? '全部' : year;
      button.classList.toggle('is-active', year === currentYear);
      button.setAttribute('aria-pressed', String(year === currentYear));
      button.addEventListener('click', function () {
        currentYear = year;
        currentPage = 1;
        Array.prototype.forEach.call(filters.children, function (other) {
          other.classList.toggle('is-active', other === button);
          other.setAttribute('aria-pressed', String(other === button));
        });
        render();
      });
      filters.append(button);
    });
    render();
  }

  pageButtons.forEach(function (button) {
    button.addEventListener('click', function () {
      currentPage += button.getAttribute('data-creation-page') === 'next' ? 1 : -1;
      render();
      document.getElementById('writing').scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  async function getUpdates(url) {
    var response = await fetch(url, { cache: 'no-store' });
    if (!response.ok) throw new Error('Timeline unavailable');
    var data = await response.json();
    if (!Array.isArray(data.updates)) throw new Error('Invalid timeline');
    return data;
  }

  (async function () {
    try {
      setup(await getUpdates('https://raw.githubusercontent.com/VelikayaScarlet/velikayascarlet.github.io/creation-updates/creation-updates.json'));
    } catch (error) {
      try {
        setup(await getUpdates({{ '/assets/data/creation-updates.json' | relative_url | jsonify }}));
      } catch (fallbackError) {
        list.textContent = '更新记录暂时无法加载';
      }
    }
  })();

})();
</script>
