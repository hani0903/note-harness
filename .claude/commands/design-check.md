아래 대상을 디자인 시스템 규칙으로 검토한다.

대상: $ARGUMENTS
(경로가 없으면 `git diff HEAD`의 변경된 .tsx/.css 파일 전체를 대상으로 한다.)

참조 파일:

- @docs/design-system/dont.md
- @docs/design-system/do.md
- @docs/design-system/01-tokens-color.md
- @docs/design-system/04-elevation.md

검토 방법:

1. 대상 파일을 읽는다.
2. `dont.md`의 각 규칙과 대조한다.
3. 위반 항목을 `파일경로:줄번호 — 위반 규칙 — 수정 제안` 형식으로 나열한다.
4. 위반 없으면 "✅ 디자인 시스템 규칙 통과" 한 줄만 출력한다.
