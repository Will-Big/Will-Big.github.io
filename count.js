// 방문 한 건을 셉니다. 경로만 보내고 그 밖에는 아무것도 보내지 않습니다.
// 수집기는 analytics/ 에 있습니다. support.js 는 생성 파일이라 여기 따로 둡니다.
(function () {
  var ENDPOINT = 'https://counter.im-willbig.workers.dev';
  var h = location.hostname;
  if (h === 'localhost' || h === '127.0.0.1') return;
  // 사생활 보호 모드에서 localStorage 가 예외를 던지는 브라우저가 있습니다.
  // 감싸지 않으면 여기서 터져 픽셀까지 안 나갑니다.
  try {
    if (localStorage.getItem('nocount')) return;
  } catch (e) {
    // localStorage 를 못 읽어도 무시하고 계속 진행한다 — 여기서 멈추면 픽셀 자체가
    // 안 나가 집계가 통째로 빠진다. 의도적으로 비워 둔다.
  }
  new Image().src = ENDPOINT + '/c?p=' + encodeURIComponent(location.pathname);
})();
