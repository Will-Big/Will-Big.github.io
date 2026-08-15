// 화면에 가까워진 이미지만 내려받습니다.
//
// 브라우저가 기본으로 주는 loading="lazy" 는 이 사이트에서 동작하지 않습니다.
// 본문을 support.js(React)가 한 번에 그리는데, 그리는 도중에는 문서가 아직
// 짧아서 방금 붙은 이미지가 늘 "화면 근처"로 판정되기 때문입니다. 그래서 맨
// 아래 이미지까지 전부 즉시 받아 버립니다.
//
// 대신 아래쪽 이미지는 src 를 비워 두고 data-src 에 넣어 두었습니다. 이 파일이
// 스크롤을 따라가며 차례가 된 것만 진짜 src 로 옮깁니다. 이미지 태그에 width·height
// 가 있으므로 자리는 미리 잡혀 있고, 늦게 채워져도 글이 밀리지 않습니다.
(function () {
  'use strict';

  // 화면에 들어오기 전에 미리 받아 둘 거리. 스크롤을 빠르게 내려도 빈 칸이
  // 보이지 않을 만큼은 넉넉하게, 첫 화면 요청이 늘어나지 않을 만큼은 좁게.
  var MARGIN = '800px 0px';
  var ATTR = 'data-src';

  function reveal(img) {
    var src = img.getAttribute(ATTR);
    if (!src) return;
    img.removeAttribute(ATTR);
    // 자기 차례가 되어 받는 것이므로 브라우저의 지연 판단은 더 필요하지 않습니다.
    img.removeAttribute('loading');
    img.src = src;
  }

  // IntersectionObserver 가 없는 오래된 브라우저에서는 전부 그냥 받습니다.
  // 느릴지언정 이미지가 안 보이는 쪽보다는 낫습니다.
  if (!('IntersectionObserver' in window)) {
    var revealAll = function () {
      var list = document.querySelectorAll('img[' + ATTR + ']');
      for (var i = 0; i < list.length; i++) reveal(list[i]);
    };
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', revealAll);
    }
    // 본문이 나중에 그려지므로 잠시 더 지켜봅니다.
    var n = 0;
    var t = setInterval(function () {
      revealAll();
      if (++n > 40) clearInterval(t);
    }, 100);
    return;
  }

  var io = new IntersectionObserver(function (entries) {
    for (var i = 0; i < entries.length; i++) {
      if (!entries[i].isIntersecting) continue;
      io.unobserve(entries[i].target);
      reveal(entries[i].target);
    }
  }, { rootMargin: MARGIN });

  function watch(root) {
    if (!root || root.nodeType !== 1) return;
    if (root.tagName === 'IMG') {
      if (root.hasAttribute(ATTR)) io.observe(root);
      return;
    }
    var list = root.querySelectorAll('img[' + ATTR + ']');
    for (var i = 0; i < list.length; i++) io.observe(list[i]);
  }

  // 이 파일은 본문이 그려지기 전에 실행되므로, 나중에 붙는 이미지도 잡아야 합니다.
  new MutationObserver(function (records) {
    for (var i = 0; i < records.length; i++) {
      var added = records[i].addedNodes;
      for (var j = 0; j < added.length; j++) watch(added[j]);
    }
  }).observe(document.documentElement, { childList: true, subtree: true });

  watch(document.body || document.documentElement);

  // 인쇄(Ctrl+P)로 PDF 를 뽑을 때는 아직 안 받은 이미지가 빈 칸으로 남습니다.
  // 인쇄 직전에 남은 것을 모두 채웁니다.
  addEventListener('beforeprint', function () {
    var list = document.querySelectorAll('img[' + ATTR + ']');
    for (var i = 0; i < list.length; i++) {
      io.unobserve(list[i]);
      reveal(list[i]);
    }
  });
})();
