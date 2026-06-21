---
name: tdd-red
description: TDD의 Red 단계를 수행한다. `test-scenarios` 스킬이 만든 `docs/features/{feature}/issue-{N}.md` 의 승인된 시그니처와 시나리오를 입력으로, 실패하는 테스트 코드를 한 시나리오씩 작성·실행하여 모두 Red(실패) 상태로 만든다. Vitest + React Testing Library 사용. 테스트 파일은 대상 코드와 같은 디렉터리에 `[파일명].test.ts(x)` 로 colocate. import가 항상 성공하도록 대상 모듈의 최소 stub(시그니처 + `throw new Error('not implemented')`)을 먼저 만들고, **실제 동작 로직은 절대 작성하지 않는다.** Use when (1) 사용자가 `/tdd-red <이슈번호>` 명령을 사용할 때, (2) 사용자가 "Red 단계", "실패 테스트 작성", "TDD 시작 (시나리오 확정 후)", "테스트 코드 작성" 등을 언급할 때, (3) `test-scenarios` 로 만든 `issue-{N}.md` 가 존재하고 시나리오가 [GATE] 통과된 직후 단계에서. 구현 코드는 절대 작성하지 않으며, 통과(Green) 코드도 만들지 않는다.
---

# TDD Red

`test-scenarios` 스킬이 산출한 issue-{N}.md 의 **시그니처 + 시나리오** 를 입력으로 받아, 실패하는 테스트 코드를 작성한다. 시나리오를 하나씩 코드화하고, 매번 실행해서 **실패하는 이유 의도한 이유인지** 확인한다.

이 스킬은 **테스트 파일**과, import가 깨지지 않도록 하는 **stub 파일**만 생성/수정한다.
stub은 시그니처(이름·파라미터·반환 타입)만 옮긴 껍데기이며 `throw new Error('not implemented')`
외의 실제 동작 로직은 한 줄도 작성하지 않는다.

# 입력

- `$ARGUMENTS` - GitHub 이슈 번호 (예: `1`)
- 슬래시 호출: `/tdd-red 1`
- 전제: `docs/features/{feature}/issue-{N}.md` 가 이미 존재하고 사용자 승인이 끝난 상태

# 핵심 원칙

1. **Stub은 만들되, 실제 동작은 절대 구현하지 않는다.**
   - vitest는 두 단계로 동작한다: **collect**(테스트 파일을 import해서 `it`/`describe` 목록을 수집) → **run**(각 테스트 본문을 실행).
   - collect 단계에서 에러가 나면(`Cannot find module` 등) 그 파일의 시나리오 전체가 수집조차 안 되어 "몇 개 중 몇 개 실패"를 셀 수 없다 — 이건 **잘못된 Red**다.
   - 그래서 시나리오를 쓰기 전에, 대상 모듈에 **이름·파라미터·반환 타입만 일치하는 stub**을 만들어 import가 항상 성공하게 한다. stub의 본문은 `throw new Error('not implemented')` 뿐이며, 진짜 동작(분기, 상태, 렌더링)은 한 줄도 넣지 않는다. (자세한 내용은 `## Stub 작성법` 참고)
   - 실패는 반드시 **run 단계**(stub이 던지는 에러, 혹은 단언 불일치)에서만 나야 한다.

2. **한 번에 하나씩**
   - 시나리오 1개 작성 → 실행 → 실패 확인 → 다음 시나리오
   - 여러 개를 미리 일괄 작성해서 건너뛰고 실패시키지 않는다.

3. **실패 이유 검증**
   - 정상 Red: stub이 던지는 `not implemented` 에러, 또는 assertion 불일치(`expected ... received ...`).
   - 비정상(잘못된 Red): `"Cannot find module"`, `"is not a function"`, `"is not exported"` 같은 collect 단계 에러.
     stub의 이름·시그니처가 테스트의 import/호출과 다르다는 뜻이므로 stub을 다시 맞춘다 (동작을 구현하는 게 아니라 시그니처만 고친다).

4. **시그니처 준수**
   - `issue-{N}.md` 의 `## 시그니처` 섹션에 적힌 이름·타입을 그대로 사용한다.
   - 임의로 타입을 바꾸지 않는다.

5. **마지막 npm test 검증**
   - 모든 시나리오 작성 후 `npm test` 를 1회 실행하여
   - 전부 빨간색(Red)인지 확인한다.

# 테스트 파일 컨벤션

## 위치

대상 코드와 **같은 디렉터리** 에 co-locate

| 대상 코드                      | 테스트 파일                         |
| ------------------------------ | ----------------------------------- |
| `src/api/tags.ts`              | `src/api/tags.test.ts`              |
| `src/components/TagInput.tsx`  | `src/components/TagInput.test.tsx`  |
| `src/hooks/useTagInput.ts`     | `src/hooks/useTagInput.test.ts`     |
| `src/context/NotesContext.tsx` | `src/context/NotesContext.test.tsx` |

- 대상이 `.tsx` 이면 테스트도 `.test.tsx`
- 대상이 `.ts` 이면 `.test.ts`
- 대상 파일이 아직 존재하지 않으면 (이슈가 신규 생성하는 모듈)
  테스트를 쓰기 전에 같은 경로에 stub 파일부터 만든다 (`## Stub 작성법` 참고).
- `"Cannot find module"` 실패는 stub을 만들기 전 임시 상태일 뿐, 최종적으로 남아 있으면 안 된다.

### 네이밍 - `describe` + `it`

- `describe`: 함수/훅/컴포넌트 단위로 묶는다.
  - `describe('useTagInput', () => { ... })`

- 같은 함수의 메서드는 중첩 describe를 쓴다.
  - `describe('useTagInput', () => {
  describe('commit', () => { ... })
})`

- `it`: **should [기대 동작] when [조건]** 형식 (영문 BDD)
  - 예:
    - `it('should add trimmed tag to tags when input is non-empty')`
    - `it('should not call commit when key is not Enter')`

- issue-{N}.md 의 시나리오 문장에 이미
  `should ... when ...`
  형식이 들어 있으면 거의 그대로 옮긴다.

### 사용 도구

- **Vitest**
  - `import { describe, it, expect, vi, beforeEach } from 'vitest'`

- **React Testing Library** (컴포넌트/훅)
  - `import { render, screen } from '@testing-library/react'`
  - 훅 테스트:
    - `import { renderHook, act } from '@testing-library/react'`

- **user-event** (사용자 입력)
  - `import userEvent from '@testing-library/user-event'`

- **jest-dom matchers**
  - `src/test-setup.ts` 에 이미 글로벌 등록되어 있음
  - `toBeInTheDocument()` 등을 바로 사용

- **API 모킹**
  - 실제 JSON Server에 의존하지 않는다.
  - `global.fetch` 를 `vi.fn()` 으로 교체하거나
  - 모듈 단위로
    - `vi.mock('../api/notes')`
  - 사용

## 파이프라인

docs/features/{feature}/issue-{N}.md
(시그니처 + 시나리오, 승인 완료)

↓ 단계 1 — 사전 검검

- 이슈 파일 존재
- 시나리오 [GATE] 통과 확인

↓ 단계 2 — 시나리오별 Red 루프

각 시나리오:

- 테스트 작성
- 실행
- 실패 확인
- 다음

↓ 단계 3 — 전체 검증

- `npm test`
- 모든 시나리오가 실패(Red) 상태인지 확인

↓
TDD Green 단계로 인계
(다른 스킬/사람이 담당)

## Stub 작성법 — 올바른 Red를 만드는 방법

vitest 실행은 2단계로 나뉜다.

- **collect**: 테스트 파일을 import해서 어떤 테스트가 있는지 목록을 모은다.
- **run**: 모은 테스트 각각의 본문을 실제로 실행한다.

대상 모듈이 아예 없으면 테스트 파일의 import 자체가 깨져서 **collect가 실패**한다.
이 경우 vitest는 그 파일을 "Failed Suites"로 보고하고, 안에 있는 시나리오 개수를
세지도 못한다 — 몇 개 중 몇 개가 실패했는지 알 수 없는, **잘못된 실패**다.

올바른 Red는 collect가 항상 통과하고, run에서만(의도한 이유로) 실패하는 상태다.
이를 위해 대상 모듈에 **stub**을 만든다. stub은 함수/컴포넌트의 이름·파라미터·
반환 타입만 시그니처와 똑같이 맞추고, 본문은 `throw new Error('not implemented')`
하나뿐이다.

```ts
// src/utils/tagValidation.ts - stub (구현 없음)
export function addTag(noteId: string, tagName: string): Promise<Note> {
  throw new Error('not implemented');
}

export function removeTag(noteId: string, tagName: string): Promise<Note> {
  throw new Error('not implemented');
}
```

stub만 있으면:

- collect는 항상 통과한다 (import할 대상이 실제로 존재하므로).
- run에서는 stub이 던지는 에러로 모든 시나리오가 실패한다.
- `npm test` 결과가 "N개 중 N개 실패"로 정확히 집계된다 — 이게 구현(Green)의 출발점이다.

> stub은 구현이 아니다. 이름·파라미터·반환 타입이라는 **사실(fact)** 만 코드로
> 옮긴 것이고, 동작(behavior)은 한 줄도 담지 않는다. 그래서 "실제 동작 로직은
> 작성하지 않는다"는 원칙과 충돌하지 않는다 — 그 원칙이 막는 것은 *동작 로직*이지
> stub의 존재 자체가 아니다.

# 단계 1: 사전 점검

1. **이슈 파일 위치 확인**
   - `docs/features/{feature}/issue-{$ARGUMENTS}.md` 를 찾는다.
   - 이슈 라벨/제목의 prefix(`TAG-*` → `tag/`) 로 `{feature}` 디렉터리를 식별한다.
   - 모호하면 사용자에게 묻는다.

2. **시그니처와 시나리오 읽기**
   - 파일 전체를 읽어 다음을 추출한다.

   - `## 시그니처`
     - 타입
     - 함수명
     - 에러 케이스
     - 컴포넌트 Props

   - 테스트 시나리오
     - `### 정상`
     - `### 경계`
     - `### 예외`
       아래 각 항목

3. **테스트 대상 파일 매핑**
   - 시그니처에 적힌 파일 경로
     - 예: `/src/hooks/useTagInput.ts`
   - 같은 주제의 시나리오는 같은 테스트 파일에 모은다.

4. **사용자 확인**
   - 요약 후 출력

     ```
     다음 순서로 테스트 시나리오 n개를 작성합니다
     ```

   - 한 단락으로 사용자에게 설명
   - 사용자가 `"OK"` 진행을 줄 때까지 작성 시작하지 않는다.
   - (가벼운 게이트, 한 번만)

---

## 단계 2: 시나리오별 Red 루프

### 0. Stub 생성 (대상 파일당 1회)

시나리오를 쓰기 전에, 시그니처에 적힌 대상 파일이 없으면 먼저 만든다.
이름·파라미터·반환 타입은 `issue-{N}.md`의 시그니처와 정확히 같아야 하고,
본문은 `throw new Error('not implemented')` 한 줄뿐이어야 한다.

```ts
// src/hooks/useTagInput.ts - stub (구현 없음)
export function useTagInput(initialTags?: string[]): {
  tags: string[];
  inputValue: string;
  setInputValue: (value: string) => void;
  setTags: (tags: string[]) => void;
  addTag: (value: string) => void;
} {
  throw new Error('not implemented');
}
```

이렇게 하면 테스트가 import할 때 collect는 항상 통과하고, 실제 실패는
stub이 호출되는 순간(run 단계)에만 발생한다. 자세한 설명은 `## Stub 작성법` 참고.

시나리오는 반드시 하나씩 처리한다.

### 1. 시나리오 선택

issue-{N}.md 의 다음 미작성 시나리오를 선택한다.

시나리오 문장의 should ... when ... 부분을 그대로 테스트 이름으로 사용한다.

### 2. 테스트 작성

시그니처에 정의된 이름과 타입을 그대로 사용한다.

- 함수 → describe(함수명)
- 훅 → describe(훅명)
- 컴포넌트 → describe(컴포넌트명)

### 3. 단일 실행

```bash
vitest -t "should ..."
```

또는

```bash
npm test -- <파일경로>
```

### 4. 실패 이유 검증

정상 Red (collect는 통과, run에서만 실패):

- stub이 던지는 `not implemented` 에러
- 구현 미완성에 따른 assertion 실패 (`expected ... received ...`)

비정상 (collect 단계 에러 — stub을 다시 맞춰야 함):

- Cannot find module
- is not a function / is not exported
- 문법 오류, 잘못된 import
- 시그니처 불일치, 오타, 잘못된 selector

### 5. 다음 시나리오

실패 이유가 의도한 Red 임을 확인하면 다음 시나리오를 작성한다.

## 단계 3: 전체 검증

```bash
npm test
```

- 모든 테스트가 Red 상태인지 확인
- AC 시나리오 수와 it(...) 개수 비교
- 누락 없는지 확인
- Green 단계로 인계

### lint는 이 단계에서 실행하지 않는다

stub은 어차피 Green 단계에서 갈아엎힐 껍데기라 `npm run lint`로 스타일을 고치는 건 낭비다.
포맷/스타일은 커밋 시 `pre-commit` 훅(ESLint --fix + Prettier)이 자동 처리하므로 별도 실행이 필요 없다.
대신 stub의 **시그니처가 issue-{N}.md와 타입까지 정확히 일치하는지**는 확인할 가치가 있다 —
틀린 시그니처는 Green 단계의 작업을 헛수고로 만든다.

---

## 테스트 작성 예시

### 훅 테스트 - `useTagInput.test.ts`

```js
import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTagInput } from './useTagInput';

describe('useTagInput', () => {
  it('should expose tags, input, setInput, commit, handleKeyDown when initialized', () => {
    const { result } = renderHook(() => useTagInput([]));

    expect(result.current).toMatchObject({
      tags: expect.any(Array),
      input: expect.any(String),
      setInput: expect.any(Function),
      commit: expect.any(Function),
      handleKeyDown: expect.any(Function),
    });
  });

  describe('commit', () => {
    it('should add trimmed tag to tags when input is non-empty', () => {
      const { result } = renderHook(() => useTagInput([]));

      act(() => result.current.setInput(' work '));
      act(() => result.current.commit());

      expect(result.current.tags).toEqual(['work']);
      expect(result.current.input).toBe('');
    });

    it('should not change tags when input is empty', () => {
      const { result } = renderHook(() => useTagInput(['existing']));

      act(() => result.current.commit());

      expect(result.current.tags).toEqual(['existing']);
    });
  });
});
```

### 컴포넌트 테스트 - `TagChipInput.test.tsx`

```tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TagChipInput } from './TagChipInput';

describe('TagChipInput', () => {
  it('should render each tag as a chip when tags is non-empty', () => {
    render(
      <TagChipInput
        tags={['work', 'study']}
        input=""
        onInputChange={vi.fn()}
        onKeyDown={vi.fn()}
      />,
    );

    expect(screen.getByText('work')).toBeInTheDocument();
    expect(screen.getByText('study')).toBeInTheDocument();
  });

  it('should call onInputChange with new value when user types', async () => {
    const onInputChange = vi.fn();

    render(<TagChipInput tags={[]} input="" onInputChange={onInputChange} onKeyDown={vi.fn()} />);

    await userEvent.type(screen.getByRole('textbox'), 'a');

    expect(onInputChange).toHaveBeenCalledWith('a');
  });
});
```

### API 모킹 테스트 - `notes.test.ts`

```ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fetchNotes } from './notes';

describe('fetchNotes', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('should default tags to [] when API response omits the field', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify([
          {
            id: '1',
            title: 't',
            content: 'c',
            createdAt: '',
            updatedAt: '',
          },
        ]),
        { status: 200 },
      ),
    );

    const notes = await fetchNotes();

    expect(notes[0].tags).toEqual([]);
});
```

---

## 자주 하는 실수 (피할 것)

- **stub에 진짜 동작을 슬쩍 넣기**
  - stub은 이름·파라미터·반환 타입만 맞고 본문은 `throw new Error('not implemented')` 뿐이어야 한다.
  - 분기문 하나, 상태 하나라도 넣으면 그건 Green 단계의 일을 미리 한 것이다.
  - 반대로 stub 자체를 안 만들고 모듈을 비워두는 것도 잘못이다 — `"Cannot find module"`은 collect 단계 에러이지 진짜 Red가 아니다.

- **시나리오 일괄 작성**
  - 23개를 한 번에 써놓고 `npm test` 로 모두 빨간색을 확인하면 안 된다.
  - 한 시나리오의 실패가 다른 테스트의 부수효과인지 분간이 안 된다.
  - 한 개씩 돌린다.

- **`-t` 필터 안 쓰고 매번 전체 실행**
  - 매 시나리오마다 전체 스위트를 돌리면 느리다.
  - `-t "should ... when ..."` 로 좁혀 검증.

- **시그니처 무시하고 작성**
  - 시그니처에 `commit` 이라고 적혀 있는데 테스트에서는 `addTag` 라고 호출하면 작성자가 시그니처를 바꾸어 해석한 것이다.
  - 변경이 필요하면 사용자에게 묻고 `issue-{N}.md` 부터 갱신.

- **테스트가 통과해버림**
  - 의의 more than half 이상이 assertion과 맞아 통과하는 경우.
  - Red 단계에서 통과는 위험 신호.
  - 테스트가 실제 동작을 검증하지 못하고 있다는 뜻.
  - assertion을 더 구체적으로 강화한다.

- **AC 누락**
  - `issue-{N}.md` 의 AC 커버리지 표에 적힌 시나리오 번호와 작성한 `it` 개수를 마지막에 1:1로 대조한다.
  - 표의 시나리오가 하나라도 없으면 누락.

- **전역 테스트 오염**
  - 새 테스트의 모킹이 글로벌 fetch나 모듈 캐시를 오염시키면 다른 테스트가 실패.
  - `beforeEach(() => vi.restoreAllMocks())` 로 격리.

- **src 수정 — stub 범위를 벗어나는 변경**
  - stub(시그니처 + `throw new Error('not implemented')`)을 만들거나 갱신하는 것은 허용된다.
  - 그 이상 — 분기·상태·렌더링 같은 실제 동작을 추가하는 것은 절대 안 된다.
  - 만약 "테스트가 돌려면 동작을 추가해야 합니다" 라는 충동이 든다면
    그건 Green 단계의 일을 미리 하려는 신호다. 멈추고 stub만 남긴다.
  - stub의 시그니처 자체가 issue-{N}.md와 안 맞아서 막힌다면, 사용자에게 보고하고
    `test-scenarios` 로 돌아간다.
