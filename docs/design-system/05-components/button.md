# 버튼

| 종류             | 배경                                     | 텍스트                    | 비고                            |
| ---------------- | ---------------------------------------- | ------------------------- | ------------------------------- |
| Primary          | `tertiary → tertiary_container` gradient | `on_tertiary` (`#faf8ff`) | `border-radius: md (0.375rem)`  |
| Secondary        | `surface_container_high` (`#e2e9ec`)     | `on_surface`              | 보더 사용 금지                  |
| Tertiary (Ghost) | 없음                                     | `tertiary` (`#0053dc`)    | Hover 시 accent 2% opacity 배경 |

## 원칙

- Primary 버튼에는 반드시 gradient를 사용한다. 평면 단색 금지.
- Secondary 버튼에 border를 추가하지 않는다.
- Ghost 버튼 hover 효과는 배경색 미세 변화로만 표현한다.
