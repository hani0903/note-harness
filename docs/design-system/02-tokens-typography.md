# 타이포그래피 토큰

폰트는 `Inter` 하나만 사용한다. 스케일과 무게로 위계를 만든다.

## 스케일

| 스타일        | 크기      | 용도            | 비고                                 |
| ------------- | --------- | --------------- | ------------------------------------ |
| `display-lg`  | `3.5rem`  | 랜딩 모멘트     | `letter-spacing: -0.02em`            |
| `headline-md` | `1.75rem` | TIL 상세 제목   | `line-height: 1.4`                   |
| `body-lg`     | `1rem`    | 기본 본문       | 롱폼은 `on_surface_variant` 사용     |
| `label-md`    | `0.75rem` | 메타데이터 라벨 | UPPERCASE + `letter-spacing: 0.05em` |

## 원칙

- 강조가 필요한 본문만 `on_surface` 사용
- 일반 장문은 `on_surface_variant` 사용
- 눈의 피로를 줄이는 방향으로 설계한다
