# Elevation & Depth

## Tonal Layering (기본)

그림자 대신 **톤 레이어**로 떠 있는 느낌을 만든다.

```
surface_container_lowest 카드
  └── surface_container 섹션 위 배치
```

→ 종이가 겹친 듯한 자연스러운 리프트 생성

---

## Ambient Shadow (플로팅 요소 한정)

모달, 드롭다운 등 플로팅 요소에만 허용한다.

| 속성    | 값                             |
| ------- | ------------------------------ |
| Blur    | `24px ~ 40px`                  |
| Opacity | `on_surface 6%`                |
| Tint    | accent 컬러를 아주 약하게 혼합 |

---

## Ghost Border (최후의 수단)

접근성 이유로 꼭 경계선이 필요할 때만 사용한다.

- 색상: `outline_variant` (`#abb3b7`)
- opacity: `15%`
- 선이 아니라 "선의 암시"처럼 보여야 한다

> 일반 섹션 구분에는 절대 사용하지 않는다. Ghost Border는 Input 기본 상태처럼
> 접근성상 경계가 반드시 필요한 경우에만 허용된다.
