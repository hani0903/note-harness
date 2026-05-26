# mermaid-diagram

`src/` 디렉토리를 분석해서 Mermaid 다이어그램으로 프로젝트 아키텍처를 시각화하고 `docs/architecture/index.html`에 저장한 뒤 브라우저로 연다.

## 절차

### 1. src/ 구조 파악
- `src/**/*` glob으로 전체 파일 목록 확인
- 핵심 파일 병렬 Read:
  - `src/main.tsx`
  - `src/App.tsx`
  - `src/context/*.tsx`
  - `src/api/*.ts`
  - `src/components/*.tsx`
  - `src/types/*.ts`

### 2. 의존성 분석

각 파일의 import 문을 기준으로 다음을 추출한다:

| 항목 | 확인 방법 |
|------|----------|
| 컴포넌트 트리 | 어떤 컴포넌트가 어떤 컴포넌트를 렌더링하는가 |
| Context 사용 | `useNotes()` 등 훅을 어디서 호출하는가 |
| API 호출 | Context가 어떤 api 함수를 쓰는가 |
| 상태 위치 | 각 `useState`가 어느 컴포넌트에 있는가 |
| Props 흐름 | 부모 → 자식으로 넘기는 prop과 콜백 |

### 3. HTML 생성

`docs/architecture/` 디렉토리를 생성하고 `index.html`을 작성한다.

#### HTML 구조
- Mermaid CDN (`https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js`) 사용
- 다크 테마 (`theme: 'dark'`)
- 카드 그리드 레이아웃 (wide 카드는 full-width)

#### 포함할 다이어그램 (3개)

**① 컴포넌트 의존성 그래프** (`graph TD`)
- 노드: 모든 파일/모듈
- 엣지: `import` 관계 및 렌더링 관계
- classDef로 레이어별 색상 구분:
  - entry (entry point): `#1d3461` blue
  - comp (component): `#1a2a1a` green
  - ctx (context/hook): `#2d1b69` purple
  - api (api layer): `#2d1a0e` orange
  - server (external): `#1a1a2d` indigo
  - type (type only): `#1e1e1e` gray, dashed edge (`-.->`)

**② 상태 흐름도** (`flowchart TD`)
- subgraph로 상태 소유자 구분 (App / Context / NoteEditor)
- 각 subgraph 안에 해당 `useState` 변수 나열
- 화살표에 label로 전달되는 값/함수 명시

**③ CRUD 시퀀스** (`sequenceDiagram`)
- actor: User
- participants: 주요 컴포넌트 → Context → API → JSON Server
- Note 구분자로 "생성" / "삭제" 시나리오 분리

#### mermaid.initialize 설정
```js
mermaid.initialize({
  startOnLoad: true,
  theme: 'dark',
  themeVariables: {
    primaryColor: '#1d3461',
    primaryTextColor: '#e2e2e8',
    lineColor: '#6b7280',
    background: '#0f0f13',
    mainBkg: '#16161f',
    edgeLabelBackground: '#1e1e2e',
  },
  flowchart: { curve: 'basis', padding: 20 },
  sequence: { actorFontSize: 13, messageFontSize: 12 },
});
```

### 4. 브라우저 실행

파일 생성 후 OS에 맞는 명령으로 브라우저를 연다:

```powershell
# Windows (PowerShell)
Start-Process "docs\architecture\index.html"
```

```bash
# macOS
open docs/architecture/index.html

# Linux
xdg-open docs/architecture/index.html
```

## 출력 규칙

- 저장 경로: `docs/architecture/index.html` (고정)
- 파일 생성 후 반드시 브라우저를 자동으로 연다
- 기존 파일이 있으면 덮어쓴다 (사용자에게 확인 불필요)
- 완료 메시지: 생성된 파일 경로와 포함된 다이어그램 목록을 출력한다
