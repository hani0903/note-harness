# 컬러 토큰

## Surface 계층

| 역할            | 토큰                        | HEX       | 용도                     |
| --------------- | --------------------------- | --------- | ------------------------ |
| Base            | `surface`                   | `#f8f9fa` | 기본 캔버스              |
| Secondary Zone  | `surface_container_low`     | `#f1f4f6` | 사이드바, 내비 배경      |
| Tonal Layer     | `surface_container`         | `#eaeff1` | 섹션 배경 (카드 아래)    |
| Elevated Zone   | `surface_container_high`    | `#e2e9ec` | Secondary 버튼 배경      |
| Selected / Chip | `surface_container_highest` | `#dbe4e7` | 사이드바 선택 상태, Chip |
| Lifted Paper    | `surface_container_lowest`  | `#ffffff` | 최상위 카드, 입력 필드   |

---

## 텍스트 / 보조 컬러

| 토큰                 | HEX       | 용도                       |
| -------------------- | --------- | -------------------------- |
| `on_surface`         | `#2b3437` | 본문 강조, 헤드라인        |
| `on_surface_variant` | `#586064` | 롱폼 본문, 메타데이터      |
| `outline_variant`    | `#abb3b7` | Ghost Border (15% opacity) |
| `tertiary`           | `#0053dc` | CTA, focus ring, 링크      |
| `tertiary_container` | `#3e76fe` | CTA 그라디언트 종점        |
| `on_tertiary`        | `#faf8ff` | Primary 버튼 텍스트        |

---

## Glass & Gradient

### Glassmorphism

모달, 드롭다운, 플로팅 요소에 사용한다.

```css
background: rgba(248, 249, 250, 0.8);
backdrop-filter: blur(12px);
```

### Primary CTA Gradient

```css
linear-gradient(
  135deg,
  var(--tertiary),
  var(--tertiary_container)
);
```

평면적인 버튼 대신 "보석 같은" 깊이를 만든다.
