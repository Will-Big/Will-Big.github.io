# 임상학 — Portfolio 2026

Game Client / Engine Programmer

**→ [will-big.github.io](https://will-big.github.io)**

더 좋은 성능을 이끌어내기 위한 설계와 학습을 좋아하는 프로그래머입니다.
자체 엔진을 네 번 만들며 매번 이전 구조의 한계를 짚어 다시 설계했고, 동시에
기획·아트가 직접 쓸 수 있는 툴을 만들고 설명서까지 남기는 일을 제 몫으로 여겨 왔습니다.

`C/C++` · `C#` · `Python` · `DirectX 11` · `PhysX` · `Unity`

## 프로젝트

| | 프로젝트 | 저장소 |
|---|---|---|
| [/midnight-cleanup](https://will-big.github.io/midnight-cleanup) | Midnight Cleanup | [midnight-cleanup](https://github.com/Will-Big/midnight-cleanup) |
| [/tictoc-guardians](https://will-big.github.io/tictoc-guardians) | TicToc Guardians | [TicToc-Guardians](https://github.com/Will-Big/TicToc-Guardians) |
| [/fate-weaver](https://will-big.github.io/fate-weaver) | Fate Weaver | [fate-weaver](https://github.com/Will-Big/fate-weaver) |
| [/my-doll-story](https://will-big.github.io/my-doll-story) | My Doll Story | [STOVE 스토어](https://store.onstove.com/ko/games/2398) |
| [/rogue-deck](https://will-big.github.io/rogue-deck) | Rogue-deck | [rogue-deck](https://github.com/Will-Big/rogue-deck) |
| [/abyssgen](https://will-big.github.io/abyssgen) | AbyssGen | [AbyssGen](https://github.com/Will-Big/AbyssGen) |

## Contact

im.willBig@gmail.com · [github.com/Will-Big](https://github.com/Will-Big)

---

<details>
<summary>저장소 구조</summary>

```
index.html          포트폴리오 본문 (이 파일 하나가 페이지 전체)
support.js          렌더링 런타임 — 반드시 함께 둘 것
lazy-img.js         아래쪽 이미지를 화면에 가까워질 때 불러오는 스크립트
image-slot.js       이미지 슬롯 컴포넌트 (지금은 어느 페이지도 쓰지 않음)
mobile.css          좁은 화면(900px 이하) 대응. 넓은 화면에는 아무 영향이 없음
STYLE.md            본문을 쓸 때 지키는 문장 · 제목 · 구성 기준
_ds/modernist-.../  디자인 토큰 stylesheet + 번들
assets/             WebP · GIF · PNG 자료
.nojekyll           Jekyll 비활성화 — _ds 가 밑줄로 시작해서 필수. 지우면 스타일이 전부 깨짐
mc/ tictoc/ ...     프로젝트별 경로. 지금은 리다이렉트, 나중에 상세 페이지로 교체 예정
```

상세 페이지를 추가할 때는 해당 폴더의 `index.html` 을 덮어쓰면 됩니다. 주소는 그대로
유지됩니다. 포트폴리오를 PDF로 뽑으려면 브라우저에서 인쇄(Ctrl+P) → 대상을 PDF로 저장.

이미지를 새로 넣을 때는 첫 화면에 보이는 한 장만 `src` 로 두고, 나머지는 `src` 대신
`data-src` 로 적어 주세요. `lazy-img.js` 가 스크롤을 따라가며 채웁니다. `width` 와
`height` 도 함께 적어야 그림이 늦게 채워져도 글이 밀리지 않습니다.

`<helmet>` 안에 `<link>` · `<meta>` · `<script>` 를 새로 넣을 때는 **맨 마지막에 두지
마세요.** `support.js` 는 helmet 의 마지막 자식이 이 세 태그 중 하나면 "아직 덜 받은
조각"으로 보고 조용히 버립니다(`<style>` 은 이 검사를 받지 않아서 늘 살아남습니다).
`</helmet>` 바로 앞은 `<style>` 로 두고, 나머지는 그 위에 넣으면 됩니다.

</details>
