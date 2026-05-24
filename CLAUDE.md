# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 프로젝트 개요

React 19 + TypeScript + Vite 기반 노트 앱 실습 프로젝트. JSON Server를 REST API 백엔드로 사용하며, Tailwind CSS v4로 스타일링한다.

## 개발 명령어

```bash
npm run dev        # Vite 개발 서버 + JSON Server 동시 실행 (concurrently)
npm run build      # TypeScript 컴파일 + Vite 프로덕션 빌드
npm run lint       # ESLint 자동 수정 포함 실행
npm run format     # Prettier 포맷
npm test           # Vitest 단일 실행
npm run test:watch # Vitest 감시 모드
npm run server     # JSON Server만 단독 실행 (포트 3001)
```

- 앱: http://localhost:5173
- API: http://localhost:3001/notes

## 아키텍처

### 데이터 흐름

```
JSON Server (db.json)
    ↕ fetch
src/api/notes.ts          ← 모든 HTTP 호출 집중
    ↕ async calls
src/context/NotesContext.tsx  ← 전역 상태 + CRUD 메서드 제공
    ↕ useNotes()
components/               ← UI만 담당
```

### 핵심 패턴

**API 레이어 (`src/api/notes.ts`)**

- `createNote`와 `updateNote`가 `createdAt` / `updatedAt` 타임스탬프를 자동 주입
- 모든 함수는 `!res.ok` 시 Error를 throw — 컨텍스트에서 catch

**컨텍스트 (`src/context/NotesContext.tsx`)**

- `NotesProvider`가 앱 전체를 감싸고 `notes`, `loading`, `error` 상태를 관리
- CRUD 후 API 응답값으로 로컬 state를 즉시 갱신 (서버 재요청 없음)
- `useNotes()` 훅은 Provider 외부에서 호출 시 에러를 throw

**`App.tsx` 상태 관리**

- `selectedNoteId` + `isCreating` 두 플래그로 NoteEditor 모드(보기 / 편집 / 신규) 결정
- 두 플래그는 상호 배타적으로 관리 (`handleSelectNote`는 isCreating을 false로 리셋)

**NoteEditor**

- `isCreating=true` → 새 노트 작성 모드, `selectedNoteId` 있음 → 편집 모드
- 둘 다 없으면 빈 안내 화면 렌더링

### 타입

`src/types/note.ts`의 `Note` 인터페이스가 유일한 도메인 타입. `tags` 필드는 의도적으로 미구현 상태(강의에서 추가 예정).

## 구현 패턴

### 컴포넌트

- `src/components/` 내 모든 컴포넌트는 **named export** (`export function Foo`) 사용. `App.tsx`만 예외적으로 `export default`.
- Props 타입은 반드시 `<ComponentName>Props` 인터페이스로 선언 후 시그니처에서 구조분해.
- 상태에 따라 JSX를 조기 반환(early return)하는 방식으로 분기 처리 (`loading`, `error`, `empty` 순서로 먼저 반환하고 마지막에 정상 UI 반환).
- `Layout`은 `sidebar`와 `main`을 `ReactNode` prop으로 받아 슬롯 구성 — 레이아웃 컴포넌트 자신은 데이터를 모름.

### 상태 관리

- 서버 데이터(`notes`, `loading`, `error`)는 Context에서만 관리. 컴포넌트는 `useNotes()`로만 접근.
- UI 상태(`selectedNoteId`, `isCreating`, `title`, `content`, `saving`)는 필요한 컴포넌트의 로컬 `useState`로 관리.
- API 응답값으로 state를 직접 갱신 (optimistic update 없음, 재요청도 없음).

### API 호출

- 컴포넌트와 컨텍스트에서 직접 `fetch` 사용 금지. 반드시 `src/api/notes.ts`의 함수를 통해 호출.
- 타임스탬프(`createdAt`, `updatedAt`)는 API 레이어에서만 주입 — 컨텍스트나 컴포넌트에서 `new Date()` 사용 불필요.
- 모든 API 함수는 `!res.ok`이면 Error를 throw. 컨텍스트에서 try/catch로 처리.

### 네이밍

| 구분               | 패턴            | 예시                                                   |
| ------------------ | --------------- | ------------------------------------------------------ |
| 컴포넌트 / 타입    | PascalCase      | `NoteList`, `NoteItemProps`                            |
| 이벤트 prop        | `on` + 동사     | `onSelect`, `onDelete`, `onNewNote`                    |
| 이벤트 핸들러 구현 | `handle` + 동사 | `handleSave`, `handleSelectNote`                       |
| 불리언 상태        | `is` + 형용사   | `isCreating`, `isSelected`                             |
| API 함수           | 동사 + 명사     | `fetchNotes`, `createNote`, `updateNote`, `deleteNote` |
| 커스텀 훅          | `use` + 명사    | `useNotes`                                             |

## 에러 처리 규칙

- `alert()` 사용 금지. 에러는 `console.error(e)`로만 처리.
- 입력값 검증 실패(빈 제목 등)는 조용히 early return — 사용자에게 별도 메시지 없음.

## 일관성 없는 패턴 (주의)

1. **`saving` vs `isCreating`/`isSelected`** — `NoteEditor`의 `saving` 상태는 불리언임에도 `is` 접두어가 없음. 신규 불리언 상태는 `isSaving`처럼 `is` 접두어를 붙이는 것이 일관적.

2. **`onDone` 콜백** — `NoteEditor`의 `onDone`은 저장 성공과 취소 버튼 클릭 두 경우 모두에 호출됨. 의미가 모호하여 `onClose` 또는 `onSaved`/`onCancel`로 분리하는 것이 명확.

## 테스트 환경

- Vitest + jsdom 환경, `@testing-library/react` 사용
- `src/test-setup.ts`에서 `@testing-library/jest-dom` 매처 설정
- 테스트 파일은 컴포넌트/훅 옆에 위치시키는 것이 관례

## 커밋 규칙

### 메시지 형식

```
type: 제목 (필수)

본문 첫 번째 줄 (필수)
본문 두 번째 줄 (필수)
```

### 허용 type

| type       | 용도                        |
| ---------- | --------------------------- |
| `feat`     | 새 기능                     |
| `fix`      | 버그 수정                   |
| `docs`     | 문서                        |
| `style`    | 포맷·공백 등 로직 무관 변경 |
| `refactor` | 리팩토링                    |
| `test`     | 테스트                      |
| `chore`    | 빌드·설정                   |
| `init`     | 초기 세팅                   |

### Git 훅 (husky)

- **pre-commit**: staged `.ts/.tsx` → ESLint --fix + Prettier, `.css/.json/.md` → Prettier
- **commit-msg**: 형식 위반 또는 제목 누락, 본문 2줄 미만이면 커밋 차단

설정 파일: `commitlint.config.js`, `.husky/pre-commit`, `.husky/commit-msg`

## 도구 설정

- **Tailwind CSS v4**: `@tailwindcss/vite` 플러그인 방식 (postcss 설정 없음)
- **ESLint**: Flat config (`eslint.config.js`), react-hooks + react-refresh 플러그인
- **Prettier**: `.prettierrc` 참조
- **데이터 저장소**: `db.json` (JSON Server가 자동 관리, 직접 수정 가능)
