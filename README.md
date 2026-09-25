

# MONGLE Web Convention
[2026 신촌 연합 SW 창업 경진 대회] "몽글" web 레포지토리
## Frontend Team

| 이름 | 역할 |
| --- | --- |
| 이남혁 | Frontend |
| 안정규 | Frontend |
| 강기명 | Frontend |

현재 세부 역할은 확정하지 않았으며, Sprint 시작 시 화면과 기능 단위로 작업을 분배한다.

---

## Tech Stack

### Core
- React
- TypeScript
- Vite

### Styling & Interaction
- Tailwind CSS
- Framer Motion

### State & Data
- TanStack Query
- Zustand
- Axios

### Form
- React Hook Form
- Zod

### Voice
- Web MediaRecorder API
- wavesurfer.js

### PWA
- vite-plugin-pwa

### Monitoring
- Sentry

---

## 기술 선택 이유

| 기술 | 사용하는 이유 |
| --- | --- |
| React | 컴포넌트 단위로 화면을 분리해 프론트엔드 3명이 병렬로 개발하기 위해 사용한다. |
| TypeScript | Props와 Spring Boot API 응답 타입을 명확하게 관리하고 협업 중 발생할 수 있는 오류를 줄이기 위해 사용한다. |
| Vite | 개발 환경을 가볍게 구성하고 빠른 개발 서버와 빌드 속도를 확보하기 위해 사용한다. |
| Tailwind CSS | 공통 색상, 간격, Radius 등 디자인 규칙을 통일하고 UI 구현 속도를 높이기 위해 사용한다. |
| TanStack Query | 꿈 목록, 꿈 상세, AI 분석 결과 등 서버 데이터의 요청, 캐싱, 로딩, 에러 상태를 관리하기 위해 사용한다. |
| Zustand | 꿈 작성 과정의 입력값, 감정, 이미지 스타일 등 여러 화면에서 유지되어야 하는 클라이언트 상태를 관리한다. |
| Axios | Spring Boot REST API와 통신하고 Base URL, 인증 Header, Error Handling 등을 공통화하기 위해 사용한다. |
| React Hook Form | 로그인, 회원가입, 꿈 기록 등 Form 상태를 효율적으로 관리하기 위해 사용한다. |
| Zod | 입력값 Validation 및 TypeScript 타입 안정성을 확보하기 위해 사용한다. |
| Framer Motion | 화면 전환, 이미지 등장 등 몽글의 몽환적인 인터랙션을 구현하기 위해 사용한다. |
| Web MediaRecorder API | 사용자가 잠에서 깬 직후 텍스트 대신 바로 음성으로 꿈을 기록할 수 있도록 한다. |
| wavesurfer.js | 녹음된 음성의 파형과 재생 UI를 구현하기 위해 사용한다. |
| vite-plugin-pwa | 웹서비스를 모바일 홈 화면에 설치하고 앱처럼 바로 실행할 수 있도록 한다. |
| Sentry | 실제 서비스 운영 중 발생하는 프론트엔드 오류를 확인하고 대응하기 위해 사용한다. |

---

## Package Manager

```bash
npm
```

패키지 매니저는 `npm`으로 통일한다.

- `package-lock.json`은 반드시 커밋한다.
- npm, yarn, pnpm을 혼용하지 않는다.

---

## Folder Structure

```text
src/
├── api/
├── assets/
│   ├── icons/
│   └── images/
├── components/
│   ├── common/
│   └── dream/
├── constants/
├── hooks/
├── pages/
├── routes/
├── schemas/
├── stores/
├── styles/
├── types/
├── utils/
├── App.tsx
└── main.tsx
```

| Directory | 역할 |
| --- | --- |
| `api` | Spring Boot API 요청 |
| `assets` | 이미지, 아이콘 등 정적 파일 |
| `components/common` | Button, Modal 등 공통 컴포넌트 |
| `components/dream` | 꿈 관련 기능 컴포넌트 |
| `constants` | 공통 상수 |
| `hooks` | Custom Hook |
| `pages` | 페이지 단위 컴포넌트 |
| `routes` | Routing 설정 |
| `schemas` | Zod Schema |
| `stores` | Zustand Store |
| `styles` | 전역 스타일 |
| `types` | TypeScript Type / Interface |
| `utils` | 공통 Utility 함수 |

---

## Naming Convention

### Component

PascalCase를 사용한다.

```tsx
DreamCard.tsx
DreamRecordPage.tsx
VoiceRecorder.tsx
DreamDetailPage.tsx
```

### Function / Variable

camelCase를 사용한다.

```ts
const dreamList = [];
const selectedEmotion = '';

function handleSubmit() {}
function fetchDreamDetail() {}
```

### Constant

UPPER_SNAKE_CASE를 사용한다.

```ts
const MAX_RECORD_TIME = 300;
const DEFAULT_PAGE_SIZE = 10;
```

### Type / Interface

PascalCase를 사용한다.

```ts
interface Dream {
  id: number;
  title: string;
}

type DreamStatus = 'READY' | 'PROCESSING' | 'DONE';
```

### Boolean

`is`, `has`, `can`, `should` 등을 사용한다.

```ts
const isLoading = false;
const hasDream = true;
const canSubmit = true;
```

---

## Component Convention

컴포넌트는 하나의 역할을 기준으로 분리한다.

```tsx
<DreamRecordPage>
  <VoiceRecorder />
  <DreamTextInput />
  <EmotionSelector />
  <SubmitButton />
</DreamRecordPage>
```

공통으로 사용되는 UI는 `components/common`에 위치시킨다.

```text
Button
Modal
Input
Loading
ErrorMessage
PageHeader
```

페이지 전용 컴포넌트는 해당 기능 디렉터리에 위치시킨다.

---

## API Convention

API 요청은 페이지나 컴포넌트 내부에 직접 작성하지 않는다.

```tsx
// X
axios.get('/dreams');
```

API 함수는 `api` 디렉터리에 분리한다.

```ts
// api/dream.ts

export const getDreamList = async () => {
  return apiClient.get('/dreams');
};
```

Spring Boot에서 전달받는 Request / Response 구조는 TypeScript 타입으로 정의한다.

```ts
export interface DreamResponse {
  id: number;
  title: string;
  content: string;
  imageUrl: string;
  createdAt: string;
}
```

서버 데이터는 기본적으로 TanStack Query를 통해 관리한다.

```ts
const { data, isLoading, isError } = useQuery({
  queryKey: ['dreams'],
  queryFn: getDreamList,
});
```

---

## State Management Convention

상태의 성격에 따라 관리 방식을 구분한다.

### Server State

TanStack Query를 사용한다.

```text
꿈 목록
꿈 상세
캘린더 데이터
AI 분석 결과
사용자 정보
```

### Global Client State

Zustand를 사용한다.

```text
꿈 작성 단계
작성 중인 꿈 내용
선택한 감정
선택한 이미지 스타일
공통 UI 상태
```

### Local State

하나의 컴포넌트 안에서만 사용되는 값은 `useState`를 사용한다.

모든 상태를 Zustand에 넣지 않는다.

---

## Voice Recording

음성 기록은 `Web MediaRecorder API`를 기준으로 구현한다.

```text
녹음 시작
↓
MediaRecorder
↓
Blob 생성
↓
미리 듣기
↓
서버 전송
↓
STT 처리
↓
텍스트 변환 결과 반환
```

프론트에서는 녹음과 음성 파일 전달을 담당한다.

STT 처리는 백엔드와 API 구조를 협의하여 진행한다.

반드시 고려해야 하는 상태:

- 마이크 권한 허용
- 마이크 권한 거부
- 녹음 중
- 녹음 완료
- 재생
- 재녹음
- 업로드 중
- 변환 실패

---

## PWA

몽글은 PWA 설치를 지원한다.

```text
vite-plugin-pwa
```

아래 항목을 구성한다.

- Web App Manifest
- App Icon
- Theme Color
- Service Worker
- 홈 화면 설치
- Standalone 실행
- 기본 정적 리소스 캐싱

사용자의 꿈 내용이나 개인 데이터를 Service Worker에 무분별하게 캐싱하지 않는다.

PWA 기능은 반드시 실제 모바일 환경에서 테스트한다.

---

## Image Convention

몽글은 AI 생성 이미지를 중심으로 하는 서비스이기 때문에 이미지 성능을 고려한다.

- WebP / AVIF 우선 사용
- `loading="lazy"` 적용
- 목록에서는 Thumbnail 사용
- 상세 화면에서만 고해상도 이미지 로드
- 불필요하게 큰 원본 이미지 사용 금지
- 이미지 Loading 상태 제공
- 이미지 생성 중 Skeleton 또는 Loading UI 제공

```tsx
<img
  src={imageUrl}
  alt="꿈 작품"
  loading="lazy"
/>
```

---

## Error / Loading Convention

모든 서버 요청 화면은 최소한 아래 상태를 고려한다.

```text
Loading
Success
Empty
Error
```

AI 이미지 생성이나 음성 변환처럼 시간이 걸리는 기능은 별도의 진행 상태를 보여준다.

사용자가 다시 시도할 수 있는 경우 Retry UI를 제공한다.

---

## Git Convention

### Branch

```text
main
develop
feat/*
fix/*
refactor/*
```

예시:

```text
feat/home
feat/dream-record
feat/calendar
feat/voice-record
feat/pwa
fix/dream-detail
```

`main`은 배포 가능한 코드만 유지한다.

개발 작업은 `develop`을 기준으로 진행한다.

기능 개발 시 `feat/*` 브랜치를 생성하고 작업 완료 후 `develop`에 병합한다.

---

## Commit Convention

```text
[Type] : 설명
```

예시:

```text
[Feat] : 꿈 음성 기록 기능 구현
[Fix] : 캘린더 날짜 선택 오류 수정
[Design] : 홈 화면 UI 구현
[Refactor] : 꿈 조회 로직 분리
[Chore] : PWA 설정 추가
[Docs] : 웹 컨벤션 문서 작성
```

| Type | 설명 |
| --- | --- |
| Feat | 기능 추가 |
| Fix | 버그 수정 |
| Design | UI / 스타일 수정 |
| Refactor | 코드 리팩터링 |
| Chore | 환경 설정 및 기타 작업 |
| Docs | 문서 수정 |
| Test | 테스트 코드 |

---

# Sprint

## 전체 일정

```text
09/26 개발 시작
↓
10/18 핵심 기능 개발 완료
↓
10/19 ~ 10/25 시험 기간
↓
10/26 ~ 10/29 최종 QA 및 배포 준비
↓
10/30 런칭 완료
```

시험 기간인 `10/19 ~ 10/25`에는 큰 기능 개발을 진행하기 어렵기 때문에 실질적인 핵심 기능 개발 마감은 **10/18**로 설정한다.

---

## Sprint 0 — 개발 환경 세팅

### 09/26 ~ 09/28

세 명이 동시에 개발을 시작할 수 있도록 기본 개발 환경과 프로젝트 구조를 맞춘다.

### 진행 사항

- React + TypeScript + Vite 초기 세팅
- Tailwind CSS 적용
- React Router 설정
- Folder Structure 구성
- Path Alias 설정
- Axios Instance 설정
- TanStack Query 설정
- Zustand 기본 구조 설정
- ESLint / Prettier 설정
- Git Branch / Commit Convention 확정
- 디자인 시스템 공통 값 적용
- 공통 Button / Input / Layout 구성
- PWA 기본 설정

### 완료 기준

프론트엔드 3명이 동일한 환경에서 프로젝트를 실행하고 각자의 기능 개발을 시작할 수 있는 상태.

---

## Sprint 1 — 주요 화면 구현

### 09/29 ~ 10/05

디자인을 기준으로 핵심 화면을 우선 구현한다.

### 주요 범위

- 로그인 / 회원가입
- 홈
- 꿈 기록
- 텍스트 입력
- 음성 입력 UI
- AI 분석 결과
- 캘린더
- 꿈 상세
- 기본 Navigation

백엔드 API가 준비되지 않은 부분은 Mock Data를 사용한다.

### 완료 기준

사용자가 주요 화면을 이동할 수 있고 핵심 사용자 흐름을 프론트에서 확인할 수 있는 상태.

```text
홈
↓
꿈 기록
↓
AI 분석
↓
꿈 결과
↓
캘린더 / 상세
```

---

## Sprint 2 — API 연동 및 핵심 기능

### 10/06 ~ 10/12

Spring Boot API와 실제 데이터를 연결한다.

### 주요 범위

- 로그인 / 인증 API
- 꿈 등록 API
- 꿈 목록 API
- 꿈 상세 API
- 캘린더 API
- AI 분석 결과 연동
- 이미지 생성 요청 및 결과 처리
- TanStack Query 적용
- Loading / Error / Empty 처리
- 음성 녹음 기능 구현
- 녹음 파일 서버 전송
- wavesurfer.js 적용

### 완료 기준

Mock Data가 아닌 실제 서버 데이터를 기준으로 핵심 사용자 흐름이 동작하는 상태.

---

## Sprint 3 — 서비스 핵심 경험 완성

### 10/13 ~ 10/18

시험 기간 전에 주요 기능 개발을 완료한다.

### 주요 범위

- Dream World 관련 화면
- 과거 꿈 연결 UI
- AI 생성 이미지 표시
- 이미지 생성 Loading UX
- 꿈 작성 Flow 개선
- Framer Motion 적용
- 모바일 반응형
- PWA 설치 테스트
- 실제 모바일 음성 녹음 테스트
- API 예외 처리
- 주요 버그 수정

### 완료 기준

서비스 핵심 기능이 처음부터 끝까지 동작하고 실제 사용자 테스트가 가능한 상태.

**10/18까지 핵심 기능 개발 완료를 목표로 한다.**

---

## Exam Period — 최소 작업 기간

### 10/19 ~ 10/25

시험 기간으로 신규 기능 개발은 최소화한다.

가능한 작업:

- 치명적인 버그 수정
- 간단한 UI 수정
- 코드 리뷰
- Merge Conflict 해결
- 문서 정리

큰 기능 추가나 구조 변경은 진행하지 않는다.

---

## Sprint 4 — Release Candidate

### 10/26 ~ 10/29

신규 기능 개발보다 안정화와 출시 준비에 집중한다.

### 주요 범위

- 전체 사용자 Flow QA
- 모바일 환경 테스트
- PWA 설치 테스트
- 음성 녹음 테스트
- API 최종 연동 확인
- AI 이미지 생성 테스트
- 이미지 최적화
- Performance 확인
- Sentry 적용
- Production 환경 변수 확인
- 배포 테스트
- 치명적인 버그 수정

### 10/29

Release Candidate를 확정한다.

이후에는 새로운 기능 추가를 중단하고 런칭 버전을 고정한다.

---

# Launch

## 10/30

`10/30`에는 개발 중인 상태가 아니라 실제 사용자가 사용할 수 있는 완성된 서비스 상태를 목표로 한다.

### Launch Checklist

- [ ] Production 배포
- [ ] 로그인 / 회원가입
- [ ] 꿈 텍스트 기록
- [ ] 꿈 음성 기록
- [ ] AI 분석
- [ ] 이미지 생성
- [ ] 꿈 저장
- [ ] 캘린더
- [ ] 꿈 상세
- [ ] Dream World
- [ ] 모바일 반응형
- [ ] PWA 설치
- [ ] Error Handling
- [ ] Loading UI
- [ ] Production API 연결
- [ ] 실제 모바일 테스트
- [ ] Sentry 오류 모니터링

---

## Frontend 업무 분배 원칙

프론트엔드 인원은 총 3명이다.

```text
이남혁
안정규
강기명
```

현재 세부 기능 담당은 확정하지 않는다.

Sprint 시작 시 구현해야 하는 화면과 기능을 기준으로 작업량을 확인한 후 세 명이 분배한다.

업무 분배 시 아래 원칙을 따른다.

- 한 명에게 특정 도메인의 모든 작업이 몰리지 않도록 한다.
- 공통 컴포넌트와 프로젝트 구조는 세 명이 함께 확인한다.
- 작업 완료 후 최소 한 명 이상의 코드 리뷰를 진행한다.
- API 명세 변경 사항은 즉시 공유한다.
- 본인이 담당하지 않은 영역도 수정할 수 있도록 구조와 코드를 공유한다.
- 작업량이 예상보다 큰 경우 Sprint 중간에도 재분배할 수 있다.

---

## 개발 우선순위

```text
1. 핵심 사용자 Flow
2. Spring Boot API 연동
3. 음성 기록
4. AI 분석 / 이미지 생성
5. Dream World
6. PWA
7. 애니메이션 및 UI 디테일
8. 최적화
```

디자인 디테일 때문에 핵심 기능 개발이 지연되지 않도록 한다.

---

## 개발 원칙

- API 연동 전에는 Mock Data로 화면 개발을 진행할 수 있다.
- Mock Data는 실제 API Response 구조와 최대한 동일하게 작성한다.
- API 요청은 컴포넌트 내부에 직접 작성하지 않는다.
- 공통 컴포넌트를 중복 구현하지 않는다.
- 서버 데이터와 클라이언트 상태를 구분해서 관리한다.
- Loading / Empty / Error 상태를 반드시 구현한다.
- 모바일 환경을 우선으로 구현한다.
- 이미지 성능을 항상 고려한다.
- 음성 녹음과 PWA는 실제 모바일 환경에서 테스트한다.
- 시험 기간 전에 핵심 기능 개발을 완료한다.
- 10/26 이후에는 새로운 기능보다 안정화를 우선한다.
- 10/30에는 개발 완료가 아니라 실제 런칭이 이루어져야 한다.
