# 태그 기능 이슈 분해

> **수직 슬라이싱 원칙**: 각 이슈는 독립적으로 사용자 가치를 제공하는 얇은 수직 단면이다.
> 의존 순서: Issue 1 완료 후 → Issue 2, Issue 3 병렬 진행 가능

---

## Issue 1: [태그] 태그 추가 및 저장

### 설명

노트 편집 화면에서 태그를 입력하고 Enter 키로 칩 형태로 확정한 후, 저장 버튼을 눌러 태그를 노트와 함께 서버에 저장한다. 기존 노트를 열면 이미 저장된 태그가 칩으로 복원된다.

이 이슈는 태그 기능 전체의 뼈대로, Note 타입 확장부터 API 연동, 훅, 컴포넌트, NoteEditor 통합까지 전 레이어를 포함한다.

### 구현 범위

- `src/types/note.ts`: `Note` 인터페이스에 `tags: string[]` 추가
- `src/api/notes.ts`: `createNote` / `updateNote`에 `tags` 포함
- `src/hooks/useTagInput.ts`: 태그 배열 상태 + `addTag` + 입력값 상태 관리 (`renderHook`으로 단위 테스트 가능)
- `src/components/TagInput.tsx`: text input + 칩 목록 렌더링 (순수 UI)
- `src/components/NoteEditor.tsx`: `TagInput` 통합, 저장 시 `tags` 포함

### 완료 조건 (Acceptance Criteria)

☐ AC-1 (범위: 통합):
Given 새 노트 편집 화면이 열려 있을 때,
When NoteEditor가 렌더링되면,
Then TagInput이 content textarea 아래에 표시된다.

☐ AC-2 (범위: 통합):
Given 태그가 0개인 노트 편집 화면이 열려 있을 때,
When TagInput의 input을 확인하면,
Then "태그 입력 후 Enter" placeholder가 표시된다.

☐ AC-3 (범위: 통합):
Given 태그 input에 "react"가 입력된 상태일 때,
When Enter 키를 누르면,
Then "react" 칩이 표시되고 input 값이 빈 문자열로 초기화된다.

☐ AC-4 (범위: 통합):
Given tags: ["vue"]가 있는 노트 편집 화면일 때,
When 태그 input에 "react"를 입력하고 Enter를 누르면,
Then "vue", "react" 두 칩이 함께 표시된다.

☐ AC-5 (범위: 통합):
Given "react" 칩이 추가된 노트 편집 화면일 때,
When 저장 버튼을 클릭하면,
Then `createNote` / `updateNote` 호출 payload에 `tags: ["react"]`가 포함된다.

☐ AC-6 (범위: 통합):
Given `tags: ["vue", "typescript"]`가 저장된 노트를 편집 화면에서 열 때,
When NoteEditor가 마운트되면,
Then "vue", "typescript" 두 칩이 TagInput에 표시된다.

☐ AC-7 (범위: 통합):
Given "react" 칩을 추가한 후 저장하지 않은 상태일 때,
When 다른 노트를 선택하면,
Then `updateNote`가 호출되지 않는다.

---

## Issue 2: [태그] 태그 삭제 (X 버튼 · Backspace)

> **의존**: Issue 1 완료 필요

### 설명

추가된 태그 칩을 두 가지 방식으로 삭제한다. 칩에 마우스를 올렸을 때 나타나는 × 버튼 클릭, 또는 input이 비어 있을 때 Backspace 키 입력으로 마지막 태그를 제거한다.

### 구현 범위

- `useTagInput` 훅에 `removeTag(index: number)` 로직 추가 (`renderHook`으로 단위 테스트 가능)
- `TagInput` 내 칩에 hover 시 × 버튼 표시 (CSS hover 또는 상태 기반)
- input이 비어 있을 때 Backspace → 마지막 태그 제거

### 완료 조건 (Acceptance Criteria)

☐ AC-1 (범위: 통합):
Given "react" 칩이 있을 때,
When 해당 칩에 마우스를 올리면,
Then × 버튼이 표시된다.

☐ AC-2 (범위: 통합):
Given "react", "typescript" 두 칩이 있을 때,
When "react" 칩의 × 버튼을 클릭하면,
Then "react" 칩만 제거되고 "typescript" 칩은 유지된다.

☐ AC-3 (범위: 통합):
Given "react", "typescript" 두 칩이 있고 input이 비어 있을 때,
When Backspace 키를 누르면,
Then "typescript" 칩이 제거되고 "react" 칩은 유지된다.

☐ AC-4 (범위: 통합):
Given "react" 칩이 있고 input에 "type"이 입력되어 있을 때,
When Backspace 키를 누르면,
Then 칩 목록은 그대로이고 input 텍스트에서만 마지막 문자가 삭제된다.

☐ AC-5 (범위: 통합):
Given "react" 칩만 남은 상태에서 × 버튼을 클릭했을 때,
When 저장 버튼을 클릭하면,
Then `updateNote` 호출 payload에 `tags: []`가 포함된다.

---

## Issue 3: [태그] 입력 유효성 검사 및 정규화

> **의존**: Issue 1 완료 필요

### 설명

Enter 키 입력 시 태그를 확정하기 전에 `trim() + toLowerCase()` 정규화를 적용한다. 빈 값·15자 초과·10개 초과·중복에 대해 `alert` 없이 조용한 early return으로 처리한다. 모든 검사는 정규화 이후에 수행된다.

### 구현 범위

- `useTagInput`의 `addTag` 함수 내부에 정규화 + 유효성 검사 로직 추가 (`renderHook`으로 단위 테스트 가능)
- 정규화: `value.trim().toLowerCase()`
- 검사 순서: 빈 문자열 → 최대 길이(15자) → 최대 개수(10개) → 중복

### 완료 조건 (Acceptance Criteria)

☐ AC-1 (범위: 단위):
Given `useTagInput`이 초기화된 상태에서,
When `addTag(" React ")`를 호출하면,
Then `tags` 배열에 `"react"`가 추가된다.

☐ AC-2 (범위: 단위):
Given `useTagInput`이 초기화된 상태에서,
When `addTag("   ")`를 호출하면,
Then `tags` 배열의 길이가 0으로 유지된다.

☐ AC-3 (범위: 단위):
Given `useTagInput`이 초기화된 상태에서,
When `addTag("abcdefghijklmnop")` (16자)를 호출하면,
Then `tags` 배열의 길이가 0으로 유지되고 input 값이 `"abcdefghijklmnop"`로 유지된다.

☐ AC-4 (범위: 단위):
Given `tags` 배열에 이미 10개 항목이 있을 때,
When `addTag("new")`를 호출하면,
Then `tags` 배열의 길이가 10으로 유지된다.

☐ AC-5 (범위: 단위):
Given `tags: ["react"]`가 있을 때,
When `addTag(" React ")`를 호출하면,
Then `tags` 배열의 길이가 1로 유지된다.

☐ AC-6 (범위: 단위):
Given `useTagInput`이 초기화된 상태에서,
When 유효하지 않은 값(빈 문자열, 16자, 중복 중 하나)으로 `addTag`를 호출하면,
Then `window.alert`가 호출되지 않고 input 값이 그대로 유지된다.

☐ AC-7 (범위: 단위):
Given `tags: ["react"]`가 있고 input에 `" REACT "` (정규화 후 "react")가 입력된 상태일 때,
When `addTag(" REACT ")`를 호출하면,
Then 최대 길이 검사 이전에 중복 여부가 아닌 trim 결과 빈 문자열 여부부터 순서대로 검사되며, `tags` 배열의 길이가 1로 유지된다.
