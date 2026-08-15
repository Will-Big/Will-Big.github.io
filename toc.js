// 오른쪽 여백에 목차를 띄웁니다. 평소에는 짧은 막대만 보이고, 마우스를 올리면
// 제목이 펼쳐집니다. 페이지의 h2 를 그대로 읽어 만들기 때문에 이 파일을 불러오는 것
// 말고 페이지에서 따로 할 일은 없습니다.
// 본문은 support.js 가 나중에 그리므로, 제목이 다 나타난 뒤에 한 번만 만듭니다.
(function () {
  'use strict';

  // 접힌 막대는 폭을 거의 쓰지 않습니다. 본문(1180px) 양옆 여백이 30px 남는
  // 1240px 부터 보여도 본문 글자와 겹치지 않습니다(컨테이너 안쪽 여백 40px).
  var MIN_WIDTH = 1240;
  var GAP = 20; // 고정된 브레드크럼 아래로 띄울 여백

  var CSS = [
    '.toc{position:fixed;right:18px;top:50%;transform:translateY(-50%);z-index:15;display:none;',
    'font-family:"IBM Plex Sans KR","Archivo",system-ui,sans-serif}',
    '@media (min-width:' + MIN_WIDTH + 'px){.toc{display:block}}',
    '@media print{.toc{display:none}}',

    // 접힌 상태 — 막대만
    '.toc-bars{display:flex;flex-direction:column;align-items:flex-end;gap:9px;padding:6px 2px;',
    'transition:opacity .16s ease}',
    '.toc-bar{display:block;width:22px;height:2px;background:rgba(32,30,29,.28);',
    'transition:width .16s ease,background-color .16s ease}',
    '.toc-bar.is-current{width:32px;background:var(--color-accent)}',

    // 펼친 상태 — 제목 목록
    '.toc-panel{position:absolute;right:0;top:50%;width:252px;max-height:70vh;overflow-y:auto;',
    'transform:translateY(-50%) translateX(10px);background:var(--color-bg);',
    'border:1px solid rgba(32,30,29,.25);border-left:2px solid var(--color-text);',
    'box-shadow:0 2px 16px rgba(32,30,29,.10);padding:14px 16px 12px;',
    'opacity:0;pointer-events:none;transition:opacity .16s ease,transform .16s ease}',
    '.toc:hover .toc-panel,.toc:focus-within .toc-panel{opacity:1;pointer-events:auto;',
    'transform:translateY(-50%) translateX(0)}',
    '.toc:hover .toc-bars,.toc:focus-within .toc-bars{opacity:0}',

    '.toc-title{font-family:"IBM Plex Mono",monospace;font-size:10px;letter-spacing:.14em;',
    'color:rgba(32,30,29,.4);padding-bottom:8px;margin-bottom:4px;',
    'border-bottom:1px solid rgba(32,30,29,.15)}',
    '.toc-link{display:flex;align-items:baseline;gap:9px;padding:6px 0;font-size:12.5px;',
    'line-height:1.55;color:rgba(32,30,29,.7);text-decoration:none;border-bottom:none}',
    '.toc-link:hover{color:var(--color-text);border-bottom:none}',
    '.toc-link[aria-current]{color:var(--color-accent)}',
    '.toc-num{flex:none;font-family:"IBM Plex Mono",monospace;font-size:10.5px;',
    'color:rgba(32,30,29,.35)}',
    '.toc-link[aria-current] .toc-num{color:var(--color-accent)}',

    // 스크롤바는 본문 톤에 맞춰 눈에 띄지 않게
    '.toc-panel::-webkit-scrollbar{width:6px}',
    '.toc-panel::-webkit-scrollbar-thumb{background:rgba(32,30,29,.2)}'
  ].join('');

  // "씬 — 상속한 인터페이스가 실행 단계를 결정한다" 처럼 긴 제목은 그대로 두고
  // 패널 안에서 줄바꿈시킵니다. 막대만 보이는 동안에는 어차피 글자가 없습니다.
  function labelOf(h) {
    return (h.textContent || '').trim().replace(/\s+/g, ' ');
  }

  // 제목 옆에 형제로 놓인 01 · 02 번호가 있으면 목차에도 함께 씁니다.
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
    var smooth = !matchMedia('(prefers-reduced-motion: reduce)').matches;

    var style = document.createElement('style');
    style.textContent = CSS;
    document.head.appendChild(style);

    var nav = document.createElement('nav');
    nav.className = 'toc';
    nav.setAttribute('aria-label', '목차');

    var bars = document.createElement('div');
    bars.className = 'toc-bars';
    bars.setAttribute('aria-hidden', 'true');

    var panel = document.createElement('div');
    panel.className = 'toc-panel';
    var title = document.createElement('div');
    title.className = 'toc-title';
    title.textContent = '목차';
    panel.appendChild(title);

    var items = heads.map(function (h, i) {
      var sec = h.closest('section') || h;
      if (!sec.id) sec.id = 'toc-' + (i + 1);
      if (!sec.style.scrollMarginTop) sec.style.scrollMarginTop = offset + 'px';

      var bar = document.createElement('span');
      bar.className = 'toc-bar';
      bars.appendChild(bar);

      var link = document.createElement('a');
      link.className = 'toc-link';
      link.href = '#' + sec.id;

      var num = numberOf(h);
      if (num) {
        var n = document.createElement('span');
        n.className = 'toc-num';
        n.textContent = num;
        link.appendChild(n);
      }
      var text = document.createElement('span');
      text.textContent = labelOf(h);
      link.appendChild(text);

      link.addEventListener('click', function (e) {
        e.preventDefault();
        var from = window.pageYOffset;
        var y = sec.getBoundingClientRect().top + from - offset;
        window.scrollTo({ top: y, behavior: smooth ? 'smooth' : 'auto' });
        if (history.replaceState) history.replaceState(null, '', '#' + sec.id);
        // 부드러운 이동이 동작하지 않는 환경에서는 그대로 옮깁니다. 이동이 시작됐다면
        // 위치가 이미 달라져 있으므로 애니메이션을 끊지 않습니다.
        setTimeout(function () {
          if (window.pageYOffset === from && Math.abs(y - from) > 4) window.scrollTo(0, y);
        }, 350);
      });

      panel.appendChild(link);
      return { section: sec, bar: bar, link: link };
    });

    nav.appendChild(bars);
    nav.appendChild(panel);
    document.body.appendChild(nav);

    // 펼칠 때 지금 보고 있는 항목이 패널 밖에 있으면 그 자리로 옮겨 둡니다.
    nav.addEventListener('mouseenter', function () {
      var current = panel.querySelector('.toc-link[aria-current]');
      if (!current || panel.scrollHeight <= panel.clientHeight) return;
      var top = current.offsetTop - panel.clientHeight / 2;
      panel.scrollTop = top > 0 ? top : 0;
    });

    follow(items, offset);
  }

  // 스크롤에 따라 지금 보고 있는 섹션을 표시합니다.
  //
  // 스크롤 중에는 브라우저에 아무것도 물어보지 않는 것이 중요합니다. 섹션마다
  // getBoundingClientRect 를 부르면 그때마다 배치를 다시 계산하게 만들어, 손가락을
  // 움직이는 내내 프레임이 밀립니다. 그래서 각 섹션의 위치를 한 번 재어 두고
  // 스크롤 중에는 숫자만 비교합니다. 글꼴이나 이미지가 늦게 들어와 문서 길이가
  // 바뀌면 그때만 다시 잽니다.
  function follow(items, offset) {
    var tops = [];
    var docHeight = -1;
    var shown = -1;

    function measure() {
      var y = window.pageYOffset;
      tops = items.map(function (item) {
        return item.section.getBoundingClientRect().top + y;
      });
      docHeight = document.documentElement.scrollHeight;
    }

    function paint(current) {
      if (current === shown) return; // 바뀐 게 없으면 손대지 않습니다
      if (shown >= 0) {
        items[shown].bar.classList.remove('is-current');
        items[shown].link.removeAttribute('aria-current');
      }
      items[current].bar.classList.add('is-current');
      items[current].link.setAttribute('aria-current', 'true');
      shown = current;
    }

    function update() {
      // 문서 길이가 달라졌다면 위치를 다시 잽니다. 스크롤만 하는 동안에는
      // 배치가 이미 최신이라 이 읽기에 비용이 들지 않습니다.
      if (document.documentElement.scrollHeight !== docHeight) measure();

      var line = window.pageYOffset + offset + 8;
      var current = 0;
      for (var i = 0; i < tops.length; i++) {
        if (tops[i] <= line) current = i;
        else break;
      }
      // 페이지 끝에 닿으면 마지막 섹션으로 둡니다.
      if (window.innerHeight + window.pageYOffset >= docHeight - 2) {
        current = items.length - 1;
      }
      paint(current);
    }

    // 그리기 직전에 한 번만 갱신합니다. 화면에 없는 탭에서는 requestAnimationFrame
    // 이 멈추므로, 그 사이 잠금이 걸린 채로 남지 않도록 다시 보일 때 풀어 줍니다.
    var waiting = false;
    function schedule() {
      if (waiting) return;
      waiting = true;
      requestAnimationFrame(function () { waiting = false; update(); });
    }

    addEventListener('scroll', schedule, { passive: true });
    addEventListener('resize', function () { measure(); schedule(); }, { passive: true });
    addEventListener('visibilitychange', function () { waiting = false; schedule(); });
    addEventListener('load', function () { measure(); schedule(); });

    measure();
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
