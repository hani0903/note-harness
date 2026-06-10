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
- `src/hooks/useTagInput.ts`: 태그 배열 상태 + `addTag` + 입력값 상태 관리
- `src/components/TagInput.tsx`: text input + 칩 목록 렌더링 (순수 UI)
- `src/components/NoteEditor.tsx`: `TagInput` 통합, 저장 시 `tags` 포함

### 완료 조건 (Acceptance Criteria)

- [ ] `Note` 인터페이스에 `tags: string[]`가 존재한다
- [ ] `TagInput` 컴포넌트가 `NoteEditor`의 content textarea 아래에 렌더링된다
- [ ] 태그가 0개일 때 input에 `태그 입력 후 Enter` placeholder가 표시된다
- [ ] Enter 키 입력 시 텍스트가 칩으로 변환되고 input이 초기화된다
- [ ] 칩은 태그 문자열을 pill 형태로 표시한다
- [ ] 저장 버튼 클릭 시 tags가 제목·본문과 함께 `createNote` / `updateNote`로 전송된다
- [ ] 기존 노트를 열면 저장된 tags가 칩으로 복원된다
- [ ] 저장 없이 다른 노트를 선택하거나 화면을 벗어나면 태그 변경이 서버에 반영되지 않는다
- [ ] `useTagInput`은 `renderHook`으로 단위 테스트 가능하다

### 시나리오

**Given** 새 노트 작성 화면이 열려 있다  
**When** 태그 input 필드에 "react"를 입력하고 Enter를 누른다  
**Then** "react" 칩이 input 앞에 표시되고 input 값은 비워진다

---

**Given** "react" 칩이 추가된 노트 편집 화면이다  
**When** 저장 버튼을 클릭한다  
**Then** `updateNote` 호출 payload에 `tags: ["react"]`가 포함된다

---

**Given** `tags: ["vue", "typescript"]`가 저장된 노트를 편집 화면에서 연다  
**When** NoteEditor가 마운트된다  
**Then** "vue"와 "typescript" 칩이 TagInput에 표시된다

---

**Given** `tags: ["vue"]`가 있는 노트 편집 화면이다  
**When** 태그 input에 "react"를 입력하고 Enter를 누른다  
**Then** `tags: ["vue", "react"]` 두 칩이 함께 표시된다

---

**Given** 태그를 추가한 후 저장하지 않은 상태이다  
**When** 다른 노트를 선택한다  
**Then** 이전 노트의 태그 변경은 서버에 반영되지 않는다

---

## Issue 2: [태그] 태그 삭제 (X 버튼 · Backspace)

> **의존**: Issue 1 완료 필요

### 설명

추가된 태그 칩을 두 가지 방식으로 삭제한다. 칩에 마우스를 올렸을 때 나타나는 × 버튼 클릭, 또는 input이 비어 있을 때 Backspace 키 입력으로 마지막 태그를 제거한다.

### 구현 범위

- `useTagInput` 훅에 `removeTag(index: number)` 로직 추가
- `TagInput` 내 칩에 hover 시 × 버튼 표시 (CSS hover 또는 상태 기반)
- input이 비어 있을 때 Backspace → 마지막 태그 제거

### 완료 조건 (Acceptance Criteria)

- [ ] 칩에 마우스를 올리면 × 버튼이 나타난다
- [ ] × 버튼을 클릭하면 해당 칩이 태그 목록에서 제거된다
- [ ] input이 비어 있는 상태에서 Backspace를 누르면 마지막 칩이 제거된다
- [ ] input에 텍스트가 있는 상태에서 Backspace를 눌러도 칩이 제거되지 않는다
- [ ] 칩 삭제 후 저장하면 삭제된 태그가 서버에 반영된다
- [ ] `removeTag`와 Backspace 동작은 `renderHook`으로 단위 테스트 가능하다

### 시나리오

**Given** "react", "typescript" 두 칩이 있다  
**When** "react" 칩에 마우스를 올리고 × 버튼을 클릭한다  
**Then** "react" 칩만 제거되고 "typescript" 칩은 유지된다

---

**Given** "react", "typescript" 두 칩이 있고 input이 비어 있다  
**When** Backspace 키를 누른다  
**Then** 마지막 칩 "typescript"가 제거되고 "react" 칩은 유지된다

---

**Given** "react" 칩이 있고 input에 "type"이 입력되어 있다  
**When** Backspace 키를 누른다  
**Then** 칩은 그대로이고 input 텍스트에서만 마지막 문자가 삭제된다

---

**Given** "react" 칩만 남은 상태에서 × 버튼을 클릭한 후 저장한다  
**When** 저장 버튼을 클릭한다  
**Then** `updateNote` 호출 payload에 `tags: []`가 포함된다

---

## Issue 3: [태그] 입력 유효성 검사 및 정규화

> **의존**: Issue 1 완료 필요

### 설명

Enter 키 입력 시 태그를 확정하기 전에 `trim() + toLowerCase()` 정규화를 적용한다. 빈 값·15자 초과·10개 초과·중복에 대해 `alert` 없이 조용한 early return으로 처리한다. 모든 검사는 정규화 이후에 수행된다.

### 구현 범위

- `useTagInput`의 `addTag` 함수 내부에 정규화 + 유효성 검사 로직 추가
- 정규화: `value.trim().toLowerCase()`
- 검사 순서: 빈 문자열 → 최대 길이(15자) → 최대 개수(10개) → 중복

### 완료 조건 (Acceptance Criteria)

- [ ] 입력값에 `trim() + toLowerCase()`가 적용된 값이 칩에 저장된다
- [ ] trim 결과가 빈 문자열이면 칩이 추가되지 않는다
- [ ] 정규화 후 15자를 초과하면 칩이 추가되지 않는다
- [ ] 이미 10개의 칩이 있으면 새 칩이 추가되지 않는다
- [ ] 정규화 후 기존 태그와 동일한 값이면 칩이 추가되지 않는다
- [ ] 유효성 검사 실패 시 `alert()`을 호출하지 않는다
- [ ] 유효성 검사 실패 시 input 값이 유지되어 사용자가 계속 편집할 수 있다
- [ ] 각 검사 케이스를 `renderHook`으로 단위 테스트한다

### 시나리오

**Given** 태그 input이 비어 있다 (또는 공백만 입력되어 있다)  
**When** Enter를 누른다  
**Then** 칩이 추가되지 않는다

---

**Given** 태그 input에 16자 문자열이 입력되어 있다  
**When** Enter를 누른다  
**Then** 칩이 추가되지 않고 input 값이 그대로 유지된다

---

**Given** 이미 10개의 칩이 존재한다  
**When** 새 태그를 입력하고 Enter를 누른다  
**Then** 칩이 추가되지 않는다

---

**Given** "react" 칩이 존재한다  
**When** " React "를 입력하고 Enter를 누른다  
**Then** 정규화 후 "react"와 중복으로 판단되어 칩이 추가되지 않는다

---

**Given** 태그 input에 "TypeScript"가 입력되어 있다  
**When** Enter를 누른다  
**Then** "typescript" 칩이 추가된다 (toLowerCase 적용)

---

**Given** 태그 input에 " vue "가 입력되어 있다  
**When** Enter를 누른다  
**Then** "vue" 칩이 추가된다 (trim 적용)
