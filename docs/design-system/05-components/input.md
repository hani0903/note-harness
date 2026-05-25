# 입력 필드

| 항목       | 규칙                                                |
| ---------- | --------------------------------------------------- |
| 배경       | `surface_container_lowest` (`#ffffff`)              |
| 기본 상태  | Ghost Border 1px (`outline_variant` at 15% opacity) |
| Focus 상태 | `tertiary` (`#0053dc`) 1px                          |
| Label      | `label-md`, input 위, `spacing.1` gap               |

## 원칙

- Focus 상태에서만 선이 명확하게 드러난다.
- 기본 상태는 최대한 조용해야 한다.
- Label은 항상 input 위에 위치한다 (placeholder만으로 대체 금지).
