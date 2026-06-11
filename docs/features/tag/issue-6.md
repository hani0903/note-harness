# Issue #6: 태그 추가 및 저장

## 확정된 시그니처

### 도메인 타입 (`src/types/note.ts`)

```typescript
export interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[]; // ← 추가
  createdAt: string;
  updatedAt: string;
}
```

### API 레이어 (`src/api/notes.ts`)

시그니처 변경 없음. `Note`에 `tags`가 추가되면:

- `createNote(note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>)` → `tags`가 필수 필드가 됨
- `updateNote(id, updates: Partial<Note>)` → `tags` 선택적으로 포함 가능

### Context (`src/context/NotesContext.tsx`)

```typescript
interface NotesContextType {
  // ...
  createNote: (title: string, content: string, tags: string[]) => Promise<void>; // tags 추가
  updateNote: (id: string, updates: Partial<Note>) => Promise<void>; // 변경 없음
}
```

### 커스텀 훅 (`src/hooks/useTagInput.ts`) — 신규

```typescript
function useTagInput(initialTags?: string[]): {
  tags: string[];
  inputValue: string;
  setInputValue: (value: string) => void;
  setTags: (tags: string[]) => void; // 노트 전환 시 복원/리셋용 (title·content setter와 대칭)
  addTag: (value: string) => void; // 칩 추가 + inputValue 초기화. (정규화·유효성은 Issue 8)
};
```

- **에러 처리**: `addTag`는 throw 하지 않음. Issue 6 범위에서는 append + input 초기화만 수행.
  (빈 값/중복/길이 검사는 Issue 8, `removeTag`는 Issue 7에서 추가)

### 컴포넌트 Props (`src/components/TagInput.tsx`) — 신규, 순수 UI

```typescript
interface TagInputProps {
  tags: string[];
  inputValue: string;
  onInputChange: (value: string) => void;
  onAddTag: (value: string) => void; // Enter 키 입력 시 호출
  placeholder?: string; // 기본값 "태그 입력 후 Enter"
}
```

- Enter 키 감지는 TagInput 내부 `onKeyDown`에서 처리 → `onAddTag(inputValue)` 호출

### NoteEditor 통합 (`src/components/NoteEditor.tsx`)

- `useTagInput` 호출, `useEffect`에서 노트 전환 시 `setTags(selectedNote.tags ?? [])`로 동기화
- `handleSave`에서 `createNote(title, content, tags)` / `updateNote(id, { title, content, tags })`
- `TagInput`을 content textarea 아래에 렌더링

---

## 테스트 시나리오

> Issue 6은 정규화·중복·길이 검사를 명시적으로 Issue 8로 미룬다.
> 따라서 빈 값/중복 거부 시나리오는 여기 포함하지 않고, "전달만 확인"하는 경계 케이스만 둔다.

### 정상

- [정상] useTagInput — should initialize tags with ["vue"] when called with initialTags ["vue"]
- [정상] useTagInput — should append "react" to tags and reset inputValue to "" when addTag("react") is called
- [정상] TagInput — should render "태그 입력 후 Enter" placeholder when tags is []
- [정상] TagInput — should call onAddTag with "react" when Enter is pressed and inputValue is "react"
- [정상] TagInput — should render "vue" and "react" chips when tags is ["vue", "react"]
- [정상] NoteEditor — should render TagInput below the content textarea when the editor is open
- [정상] NoteEditor — should restore "vue" and "typescript" chips when opening a note whose tags is ["vue", "typescript"]
- [정상] NoteEditor — should pass tags ["react"] into createNote/updateNote payload when the save button is clicked

### 경계

- [경계] useTagInput — should initialize tags as [] when initialTags is undefined
- [경계] TagInput — should render zero chips when tags is []
- [경계] TagInput — should call onAddTag with "" when Enter is pressed and inputValue is "" (검증은 Issue 8 책임, 여기선 전달만 확인)

### 예외

- [예외] NoteEditor — should not call updateNote when another note is selected before saving

## AC 커버리지

| AC                                      | 커버하는 시나리오                                                                        |
| --------------------------------------- | ---------------------------------------------------------------------------------------- |
| AC-1 (TagInput이 textarea 아래 표시)    | `[정상] NoteEditor — render TagInput below content textarea`                             |
| AC-2 (placeholder)                      | `[정상] TagInput — placeholder when tags is []`                                          |
| AC-3 (Enter → 칩 + input 초기화)        | `[정상] TagInput — onAddTag on Enter` + `[정상] useTagInput — append & reset inputValue` |
| AC-4 (["vue"] + react → 두 칩)          | `[정상] TagInput — render two chips` + `[정상] useTagInput — append "react"`             |
| AC-5 (저장 → payload tags)              | `[정상] NoteEditor — pass tags into createNote/updateNote payload`                       |
| AC-6 (열면 저장된 태그 복원)            | `[정상] NoteEditor — restore chips`                                                      |
| AC-7 (저장 전 이탈 → updateNote 미호출) | `[예외] NoteEditor — should not call updateNote`                                         |
