# 작업 규칙

저장소 구조·이미지·`support.js` 주의사항은 [README.md](README.md) 의 "저장소 구조" 를 먼저 보세요.
이 파일은 그것만으로는 알기 어려운 규칙을 적어 둡니다.

**본문 문장을 쓰거나 고칠 때는 [STYLE.md](STYLE.md) 를 먼저 읽으세요.** 문장 길이·제목 형식·서술
순서에 대한 기준이며, 아래 규칙들이 겉모습을 다루는 것과 달리 그쪽은 글 자체를 다룹니다.

## 글꼴 — 맥과 윈도우에서 같게 보이도록

**웹폰트 스택은 반드시 한글 폰트로 끝나야 합니다.**

`Archivo` 와 `IBM Plex Mono` 에는 한글 글리프가 없습니다. 스택에 한글 웹폰트가
없으면 한글만 OS 기본 폰트로 떨어져서, 같은 페이지가 맥에서는 Apple SD Gothic Neo,
윈도우에서는 맑은 고딕(`monospace` 자리는 굴림체)으로 보입니다. 실제로 2026-08 이전까지
모든 제목과 478곳의 모노 표기가 이 상태였습니다.

쓸 수 있는 스택은 이 셋뿐입니다.

```
본문   'IBM Plex Sans KR','Archivo',system-ui,sans-serif
제목   var(--font-heading)  →  "Archivo","IBM Plex Sans KR",system-ui,sans-serif
모노   'IBM Plex Mono','IBM Plex Sans KR',monospace
```

영문·숫자는 앞의 서체가, 한글은 `IBM Plex Sans KR` 이 맡습니다. 셋 다 페이지가 이미
불러오는 폰트라 요청이 늘지 않습니다.

두 겹으로 막아 두었습니다. 토큰은 `_ds/modernist-.../styles.css` 의 `--font-heading`
· `--font-body` 이고, 그 아래 `[style*="IBM Plex Mono"]` 규칙이 인라인 style 로 적힌
모노 지정에 한글 폰트를 `!important` 로 덧붙입니다. 그래서 새 페이지에서 습관대로
`font-family:'IBM Plex Mono',monospace` 라고 적어도 결과는 같습니다 — 다만 **직접 셋
중 하나로 적는 것을 기본으로 하고, 안전장치는 그물로만 여기세요.**

맥과 윈도우를 완전히 같게 만들 수는 없습니다. 렌더러가 CoreText / DirectWrite 로 달라
윈도우 쪽이 조금 더 두껍게 보이고(`-webkit-font-smoothing` 은 맥 전용), 이모지는 OS 가
그리는 그림 자체가 다릅니다. 통일이 꼭 필요한 이모지는 SVG 로 바꾸세요.

## 새 페이지를 추가할 때

`<head>` 에 이 세 줄이 **모두** 있어야 합니다. 깊이에 맞춰 `../` 를 맞추세요.

```html
<link rel="stylesheet" href="../_ds/modernist-ae998351-d810-43b9-b194-f261b8babc31/styles.css">
<link rel="stylesheet" href="../mobile.css">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Archivo:wght@400;500;600;700;800&amp;family=IBM+Plex+Sans+KR:wght@300;400;500;600;700&amp;family=IBM+Plex+Mono:wght@400;500&amp;display=swap">
```

- `styles.css` 가 빠지면 글꼴 토큰과 위 안전장치가 통째로 빠집니다.
- `mobile.css` 가 빠지면 좁은 화면에서 그리드가 무너지지 않아 가로로 넘칩니다.
  이 파일은 900px 이하에서만 동작하므로 넓은 화면 모양은 그대로입니다.
- 폰트 링크가 빠지면 한글이 다시 OS 폰트로 떨어집니다.

좁은 화면 대응은 `mobile.css` 가 **인라인 style 문자열을 선택자로** 잡아서 합니다
(`[style*="font-size:32px"]` 처럼). 그러므로 새 페이지도 기존 페이지가 쓰는 값을
그대로 쓰면 자동으로 대응됩니다. 새로운 크기·그리드를 쓰려면 `mobile.css` 에 규칙을
추가해야 합니다.

## 코드 블록에 camelCase 를 적을 때

`support.js` 는 페이지 원문 전체에 아래 정규식을 걸어 camelCase 속성명을 인코딩합니다
(`support.js` 365행).

```
/(\s)([a-z]+[A-Z][A-Za-z0-9]*)(\s*=)/g
```

`<pre>` 안인지 태그 안인지 가리지 않으므로 코드 블록도 함께 바뀝니다. 실제로
`var baselineScenario = …` 가 화면에서 `var sc-camel-baseline-scenario = …` 로 나왔습니다
(2026-08-18, rogue-deck).

등호를 `&#61;` 로 적으면 정규식에 걸리지 않고 화면에는 `=` 로 나옵니다.

```html
<pre>    var baselineScenario &#61; WithoutInterventionPlays(scenario);</pre>
```

걸리는 것은 **공백 바로 뒤에 오는 소문자 시작 camelCase 이름에 `=` 가 이어지는 경우**뿐입니다.
대문자로 시작하는 이름(`Id = 1`)과 점이 낀 이름(`ctx.State.Foo = 1`), `=>` 나 `!=` 처럼 등호 앞에
다른 글자가 있는 것은 그대로 나옵니다. `viewBox="…"` 같은 진짜 속성은 이 변환을 거쳐 원래
이름으로 되돌아가므로 손대지 않습니다.

새 코드 블록을 넣었으면 이렇게 확인합니다.

```bash
python3 -c "import io,re;s=io.open('site/rogue-deck/index.html',encoding='utf-8').read();print(re.findall(r'\s[a-z]+[A-Z][A-Za-z0-9]*\s*=',s))"
```

## 확인 방법

```bash
python3 -m http.server 8765 --directory site
```

`http://localhost:8765` 를 띄우고, 320 · 375 · 900 · 1280px 에서 확인합니다.
글꼴이 OS 로 떨어졌는지는 한글 렌더 폭으로 판별할 수 있습니다 — 40px 기준으로
`IBM Plex Sans KR` 은 "팀원들이" 가 142.72px, OS 폰트로 떨어지면 138.4px 입니다.
