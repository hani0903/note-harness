# 노트 분류 기능 정의서 (확정)

## 기능 개요

노트에 대분류/소분류를 추가하고 관리할 수 있다.

## 기능 요구사항

- 노트에 대분류/소분류를 추가할 수 있다.
- 대분류는 반드시 존재해야 소분류를 선택할 수 있다.
- 중복 분류는 허용하지 않는다.

---

## 데이터 구조

### db.json — categories 컬렉션 추가

분류는 노트와 독립된 공유 컬렉션으로 관리한다.

```json
{
  "categories": [
    { "id": "1", "name": "개발", "parentId": null },
    { "id": "2", "name": "React", "parentId": "1" },
    { "id": "3", "name": "TypeScript", "parentId": "1" }
  ]
}
```

- `parentId: null` → 대분류
- `parentId: "<id>"` → 해당 대분류의 소분류

### Note 타입

```ts
interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  majorId?: string; // 대분류 id (선택)
  minorId?: string; // 소분류 id (선택, majorId 없으면 설정 불가)
  createdAt: string;
  updatedAt: string;
}
```

### Category 타입

```ts
interface Category {
  id: string;
  name: string;
  parentId: string | null;
}
```

### API

`src/api/categories.ts`를 신규 생성하고, 기존 `src/api/notes.ts` 패턴을 따른다.

```ts
fetchCategories(): Promise<Category[]>
createCategory(name: string, parentId: string | null): Promise<Category>
deleteCategory(id: string): Promise<void>
```

---

## UI

### 배치

NoteEditor 내 제목 입력창 아래, 본문 입력창 위에 위치한다.

```
[ 제목 입력 ]
─────────────────────────────
[ 대분류 ▼ ] [ 소분류 ▼ ]
[ 본문 입력 ]
[ 저장 ] [ 취소 ]
```

### 드롭다운 동작

- 대분류 드롭다운: 전체 대분류 목록 표시
- 소분류 드롭다운: 선택된 대분류의 소분류만 표시, 대분류 미선택 시 비활성화
- 대분류 변경 시 소분류 선택 초기화

### 인라인 분류 생성

드롭다운 목록 맨 아래 **"+ 새 분류 만들기"** 옵션을 제공한다.

- 클릭 시 이름 입력창이 인라인으로 나타남
- Enter 또는 확인 버튼으로 생성
- 생성 즉시 `createCategory` API 호출 후 드롭다운에 반영

---

## 분류 삭제

- 해당 분류를 참조하는 노트가 1개라도 있으면 삭제 불가 (차단)
- 대분류 삭제 시 하위 소분류가 있어도 삭제 불가 (차단)
- 삭제 차단 시 조용히 무시 (alert 없음)

---

## 유효성 검사

| 규칙                    | 내용                                             |
| ----------------------- | ------------------------------------------------ |
| 대분류 없이 소분류 선택 | 불가 (소분류 드롭다운 비활성화)                  |
| 분류명 중복 (대분류)    | 전체 대분류 내에서 동일한 이름 불가, 조용히 무시 |
| 분류명 중복 (소분류)    | 같은 대분류 내에서 동일한 이름 불가, 조용히 무시 |
| 빈 분류명               | 생성하지 않음 (trim 후 빈 값이면 무시)           |
| 분류 없는 노트 저장     | 허용 (분류는 선택 사항)                          |

---

## 저장 시점

- 분류 선택은 로컬 상태에만 반영된다.
- **저장 버튼 클릭 시** 제목, 본문, 태그와 함께 `updateNote`로 일괄 전송한다.
- 분류 생성만 즉시 API 호출 (드롭다운 반영을 위해).

---

## 분류 정렬

- 생성 순서를 유지한다 (별도 정렬 없음).

---

## db.json 마이그레이션

- 기존 노트에 별도 필드 추가 불필요 (`majorId`, `minorId`는 `?` 선택 필드).
- `db.json`에 `"categories": []` 컬렉션을 추가한다.

---

## 이번 스펙 범위 외

- 분류 이름 수정
- 분류 기준 노트 필터링
- 분류 관리 전용 화면
