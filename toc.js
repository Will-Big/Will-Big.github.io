// 오른쪽 여백에 목차를 띄웁니다. 페이지의 h2 를 그대로 읽어 만들기 때문에
// 이 파일을 불러오는 것 말고 페이지에서 따로 할 일은 없습니다.
// 본문은 support.js 가 나중에 그리므로, 제목이 다 나타난 뒤에 한 번만 만듭니다.
(function () {
  'use strict';

  // 본문(1180px) 옆에 목차가 들어갈 수 있는 최소 폭입니다. 미디어 쿼리는 스크롤바를 뺀
  // 폭을 보기 때문에, 1600px 창에서도 보이도록 1580 으로 잡았습니다.
  // 1580 기준 본문 오른쪽 여백은 200px, 목차가 차지하는 폭은 184px 입니다.
  var MIN_WIDTH = 1580;
  var GAP = 20; // 고정된 브레드크럼 아래로 띄울 여백

  var CSS = [
    '.toc{position:fixed;right:20px;top:50%;transform:translateY(-50%);width:164px;z-index:15;',
    'font-family:"IBM Plex Mono",monospace;font-size:10.5px;line-height:1.5;display:none}',
    '@media (min-width:' + MIN_WIDTH + 'px){.toc{display:block}}',
    '@media print{.toc{display:none}}',
    '.toc-label{letter-spacing:.14em;color:rgba(32,30,29,.35);padding:0 0 8px 11px;',
    'border-bottom:1px solid rgba(32,30,29,.18);margin-bottom:6px}',
    '.toc a{display:flex;gap:8px;padding:5px 0 5px 9px;border-left:2px solid transparent;',
    'color:rgba(32,30,29,.5);text-decoration:none;border-bottom:none}',
    '.toc a:hover{color:var(--color-text);border-bottom:none}',
    '.toc a[aria-current]{color:var(--color-accent);border-left-color:var(--color-accent)}',
    '.toc-num{flex:none;color:rgba(32,30,29,.3)}',
    '.toc a[aria-current] .toc-num{color:var(--color-accent)}',
    '.toc-text{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}'
  ].join('');

  // "씬 — 상속한 인터페이스가 실행 단계를 결정한다" 처럼 긴 제목은 앞부분만 씁니다.
  function shortLabel(h) {
    var t = (h.textContent || '').trim().replace(/\s+/g, ' ');
    var dash = t.indexOf(' — ');
    return dash > 0 ? t.slice(0, dash) : t;
  }

  // 제목 옆에 01 · 02 같은 번호가 형제로 놓여 있으면 목차에도 함께 씁니다.
  function numberOf(h) {
    var prev = h.previousElementSibling;
    if (prev && prev.tagName === 'SPAN' && /^\d{1,2}$/.test(prev.textContent.trim())) {
      return prev.textContent.trim();
    }
    return '';
  }

  function build() {
    var heads = [].slice.call(document.querySelectorAll('h2'));
    if (heads.length < 2) return; // 섹션이 하나뿐인 페이지는 목차를 만들지 않습니다

    // 브레드크럼이 상단에 고정된 페이지에서는 그 높이만큼 더 내려야 제목이 가리지 않습니다.
    var crumb = document.querySelector('.crumb');
    var offset = (crumb ? Math.round(crumb.getBoundingClientRect().height) : 0) + GAP;

    var style = document.createElement('style');
    style.textContent = CSS;
    document.head.appendChild(style);

    var nav = document.createElement('nav');
    nav.className = 'toc';
    nav.setAttribute('aria-label', '목차');

    var label = document.createElement('div');
    label.className = 'toc-label';
    label.textContent = '목차';
    nav.appendChild(label);

    var items = heads.map(function (h, i) {
      var sec = h.closest('section') || h;
      if (!sec.id) sec.id = 'toc-' + (i + 1);
      if (!sec.style.scrollMarginTop) sec.style.scrollMarginTop = offset + 'px';

      var a = document.createElement('a');
      a.href = '#' + sec.id;
      a.title = (h.textContent || '').trim();

      var num = numberOf(h);
      if (num) {
        var n = document.createElement('span');
        n.className = 'toc-num';
        n.textContent = num;
        a.appendChild(n);
      }
      var text = document.createElement('span');
      text.className = 'toc-text';
      text.textContent = shortLabel(h);
      a.appendChild(text);

      nav.appendChild(a);
      return { section: sec, link: a };
    });

    document.body.appendChild(nav);
    follow(items, offset);
  }

  // 스크롤에 따라 지금 보고 있는 섹션을 표시합니다.
  function follow(items, offset) {
    function update() {
      var line = offset + 8;
      var current = 0;
      for (var i = 0; i < items.length; i++) {
        if (items[i].section.getBoundingClientRect().top <= line) current = i;
        else break;
      }
      // 페이지 끝에 닿으면 마지막 섹션으로 둡니다.
      if (window.innerHeight + window.scrollY >= document.body.scrollHeight - 2) {
        current = items.length - 1;
      }
      items.forEach(function (item, i) {
        if (i === current) item.link.setAttribute('aria-current', 'true');
        else item.link.removeAttribute('aria-current');
      });
    }

    // requestAnimationFrame 은 탭이 화면에 없으면 멈춰서 잠금이 풀리지 않습니다.
    // 타이머로 묶어 두면 어떤 상태에서도 다음 갱신이 보장됩니다.
    var waiting = false;
    addEventListener('scroll', function () {
      if (waiting) return;
      waiting = true;
      setTimeout(function () { waiting = false; update(); }, 80);
    }, { passive: true });
    addEventListener('resize', update, { passive: true });
    update();
  }

  // 제목 개수가 두 번 연속 같으면 렌더가 끝난 것으로 봅니다.
  var seen = -1, stable = 0, tries = 0;
  var timer = setInterval(function () {
    var n = document.querySelectorAll('h2').length;
    stable = (n > 0 && n === seen) ? stable + 1 : 0;
    seen = n;
    if (stable >= 2) { clearInterval(timer); build(); }
    else if (++tries > 80) clearInterval(timer);
  }, 50);
})();
