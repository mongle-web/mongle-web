# MONGLE Web Convention

> [2026 신촌 연합 SW 창업 경진 대회] **몽글(MONGLE)** Web Frontend Repository

몽글은 사용자가 잠에서 깬 직후 꿈을 텍스트 또는 음성으로 기록하고,  
AI가 꿈의 인물, 장소, 사건, 감정, 분위기 등의 요소를 분석하여 하나의 작품으로 시각화하는 서비스이다.

단순히 매번 새로운 이미지를 생성하는 것이 아니라 과거 꿈에서 등장했던 장소, 인물, 분위기 등의 맥락을 이어가며 사용자의 **Dream World**를 만들어가는 것을 목표로 한다.

---

# Frontend Team

| 이름 | 역할 |
| --- | --- |
| 이남혁 | Frontend |
| 안정규 | Frontend |
| 강기명 | Frontend |

현재 세부 역할은 고정하지 않으며 Sprint 시작 시 화면과 기능 단위로 작업을 분배한다.

특정 기능이 한 명에게 완전히 종속되지 않도록 코드 리뷰와 작업 공유를 통해 전체 구조를 함께 이해하는 것을 원칙으로 한다.

---

# Tech Stack

## Core

- React
- TypeScript
- Vite

## Styling & Interaction

- Tailwind CSS
- Framer Motion

## State & Data

- TanStack Query
- Zustand
- Axios

## Form

- React Hook Form
- Zod

## Voice

- Web MediaRecorder API
- wavesurfer.js

## PWA

- vite-plugin-pwa

## Code Quality

- ESLint
- Prettier

## Monitoring

- Sentry

> Sentry는 출시 단계에서 적용한다.

---

# 기술 선택 이유

| 기술 | 사용하는 이유 |
| --- | --- |
| React | 컴포넌트 단위로 화면을 분리하여 프론트엔드 3명이 병렬로 개발하기 위해 사용한다. |
| TypeScript | Props와 Spring Boot API 응답 타입을 명확하게 관리하고 협업 중 발생할 수 있는 오류를 줄이기 위해 사용한다. |
| Vite | 빠른 개발 서버와 빌드 환경을 구성하기 위해 사용한다. |
| Tailwind CSS | 공통 색상, 간격, Radius 등 디자인 규칙을 통일하고 UI 구현 속도를 높이기 위해 사용한다. |
| TanStack Query | 꿈 목록, 꿈 상세, AI 분석 결과 등 서버 데이터의 요청, 캐싱, 로딩, 에러 상태를 관리한다. |
| Zustand | 꿈 작성 과정처럼 여러 화면에서 유지되어야 하는 클라이언트 상태를 관리한다. |
| Axios | Spring Boot REST API와 통신하고 Base URL, 인증 Header, Error Handling 등을 공통화한다. |
| React Hook Form | 로그인, 회원가입, 꿈 기록 등 Form 상태를 관리한다. |
| Zod | 입력값 Validation과 TypeScript 타입 안정성을 확보한다. |
| Framer Motion | 화면 전환, 이미지 등장 등 몽글의 몽환적인 인터랙션을 구현한다. |
| Web MediaRecorder API | 사용자가 잠에서 깬 직후 텍스트 대신 음성으로 꿈을 기록할 수 있도록 한다. |
| wavesurfer.js | 녹음된 음성의 파형과 재생 UI를 구현한다. |
| vite-plugin-pwa | 웹서비스를 모바일 홈 화면에 설치하고 앱처럼 실행할 수 있도록 한다. |
| ESLint | 코드에서 잠재적인 오류와 일관되지 않은 패턴을 검사한다. |
| Prettier | 들여쓰기, 줄바꿈, 따옴표 등 코드 스타일을 통일한다. |
| Sentry | 실제 서비스 운영 중 발생하는 프론트엔드 오류를 확인하고 대응한다. |

---

# Package Manager

```bash
pnpm
```

패키지 매니저는 **pnpm으로 통일한다.**

- `pnpm-lock.yaml`은 반드시 커밋한다.
- npm, yarn, pnpm을 혼용하지 않는다.
- 패키지 설치는 반드시 `mongle-web` 디렉터리 안에서 진행한다.
- `package-lock.json`, `yarn.lock`을 생성하지 않는다.

패키지 설치:

```bash
pnpm add 패키지명
```

개발 의존성 설치:

```bash
pnpm add -D 패키지명
```

패키지 제거:

```bash
pnpm remove 패키지명
```

---

# Local Setup

처음 프로젝트에 참여하는 팀원은 아래 순서대로 개발 환경을 구성한다.

## 1. Repository Clone

```bash
git clone <repository-url>
```

프로젝트 디렉터리로 이동한다.

```bash
cd Web/mongle-web
```

---

## 2. develop Branch 이동

```bash
git checkout develop
```

최신 코드 확인:

```bash
git pull origin develop
```

---

## 3. pnpm 설치

pnpm이 설치되어 있지 않은 경우:

```bash
npm install -g pnpm
```

설치 확인:

```bash
pnpm -v
```

---

## 4. Dependency 설치

```bash
pnpm install
```

`pnpm-lock.yaml`을 기준으로 필요한 패키지가 설치된다.

---

## 5. 환경 변수 설정

```bash
cp .env.example .env
```

현재 기본 환경 변수:

```env
VITE_API_BASE_URL=http://localhost:8080
```

실제 개발 서버 주소가 확정되면 팀에서 공유된 값을 사용한다.

`.env` 파일은 Git에 커밋하지 않는다.

---

## 6. 개발 서버 실행

```bash
pnpm dev
```

터미널에 표시되는 Local 주소로 접속한다.

기본적으로 다음과 같은 주소가 사용된다.

```text
http://localhost:5173
```

---

## 7. 초기 실행 확인

처음 프로젝트를 받은 경우 아래 명령이 정상적으로 동작하는지 확인한다.

```bash
pnpm format:check
pnpm lint
pnpm build
```

모두 정상적으로 완료되면 개발 환경 구성이 완료된 것이다.

---

# Scripts

현재 사용할 수 있는 주요 명령어이다.

## 개발 서버

```bash
pnpm dev
```

Vite 개발 서버를 실행한다.

---

## Production Build

```bash
pnpm build
```

다음 과정을 진행한다.

```text
TypeScript Type Check
↓
Vite Production Build
```

실제 배포 가능한 상태인지 확인할 때 사용한다.

---

## ESLint

```bash
pnpm lint
```

코드에서 잠재적인 오류와 규칙 위반을 검사한다.

자동 수정 가능한 항목까지 수정하려면:

```bash
pnpm lint:fix
```

---

## Prettier

전체 코드를 프로젝트 스타일에 맞게 정리한다.

```bash
pnpm format
```

포맷이 올바른지만 확인한다.

```bash
pnpm format:check
```

---

## Production Preview

```bash
pnpm preview
```

`pnpm build`로 생성된 결과물을 로컬에서 확인한다.

---

# Folder Structure

```text
src/
├── api/
│   └── client.ts
│
├── assets/
│   ├── icons/
│   └── images/
│
├── components/
│   ├── common/
│   └── layout/
│
├── constants/
│
├── features/
│   ├── auth/
│   ├── home/
│   ├── dream-record/
│   ├── dream-detail/
│   ├── calendar/
│   └── dream-world/
│
├── hooks/
│
├── mocks/
│
├── routes/
│
├── schemas/
│
├── stores/
│
├── styles/
│
├── types/
│
├── utils/
│
├── App.tsx
└── main.tsx
```

| Directory | 역할 |
| --- | --- |
| `api` | Axios Instance 및 공통 API 설정 |
| `assets` | 이미지, 아이콘 등 정적 파일 |
| `components/common` | Button, Modal, Input 등 공통 UI |
| `components/layout` | AppLayout, Header 등 Layout 관련 컴포넌트 |
| `constants` | 공통 상수 |
| `features` | 기능 단위 코드 관리 |
| `hooks` | 공통 Custom Hook |
| `mocks` | 개발용 Mock Data |
| `routes` | Routing 설정 |
| `schemas` | Zod Schema |
| `stores` | Zustand Store |
| `styles` | 전역 스타일 및 디자인 토큰 |
| `types` | 공통 TypeScript Type / Interface |
| `utils` | 공통 Utility 함수 |

---

# Feature Structure

기능 규모가 커지는 경우 해당 Feature 내부에서 관련 코드를 함께 관리한다.

예시:

```text
features/
└── dream-record/
    ├── api/
    ├── components/
    ├── hooks/
    ├── pages/
    ├── types/
    └── utils/
```

모든 Feature에 위 디렉터리를 강제로 만들 필요는 없다.

필요한 구조만 생성한다.

---

# Naming Convention

## Component

PascalCase를 사용한다.

```tsx
DreamCard.tsx
DreamRecordPage.tsx
VoiceRecorder.tsx
DreamDetailPage.tsx
```

---

## Function / Variable

camelCase를 사용한다.

```ts
const dreamList = [];
const selectedEmotion = '';

function handleSubmit() {}

function fetchDreamDetail() {}
```

---

## Constant

UPPER_SNAKE_CASE를 사용한다.

```ts
const MAX_RECORD_TIME = 300;
const DEFAULT_PAGE_SIZE = 10;
```

---

## Type / Interface

PascalCase를 사용한다.

```ts
interface Dream {
  id: number;
  title: string;
}

type DreamStatus = 'READY' | 'PROCESSING' | 'DONE';
```

---

## Boolean

`is`, `has`, `can`, `should` 등을 사용한다.

```ts
const isLoading = false;
const hasDream = true;
const canSubmit = true;
```

---

# Component Convention

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

예시:

```text
Button
Modal
Input
Loading
ErrorMessage
PageHeader
```

특정 기능에서만 사용되는 컴포넌트는 해당 Feature 내부에 위치시킨다.

예:

```text
features/dream-record/components/VoiceRecorder.tsx
features/dream-record/components/EmotionSelector.tsx
```

---

# API Convention

API 요청은 페이지나 UI 컴포넌트 내부에 직접 작성하지 않는다.

```tsx
// X

axios.get('/dreams');
```

공통 Axios Instance를 사용한다.

```ts
import apiClient from '@/api/client';
```

기능별 API 함수는 해당 기능의 API 파일에 분리한다.

```ts
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

# State Management Convention

상태의 성격에 따라 관리 방식을 구분한다.

## Server State

TanStack Query를 사용한다.

```text
꿈 목록
꿈 상세
캘린더 데이터
AI 분석 결과
사용자 정보
```

---

## Global Client State

여러 화면에서 공유되어야 하는 클라이언트 상태는 Zustand를 사용한다.

```text
꿈 작성 단계
작성 중인 꿈 내용
선택한 감정
선택한 이미지 스타일
공통 UI 상태
```

---

## Local State

하나의 컴포넌트 내부에서만 사용하는 값은 `useState`를 사용한다.

모든 상태를 Zustand에 넣지 않는다.

---

# Voice Recording

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

프론트엔드는 다음 역할을 담당한다.

```text
마이크 권한 요청
음성 녹음
Blob 생성
미리 듣기
재녹음
음성 파일 서버 전달
STT 결과 표시
```

STT 처리는 백엔드와 API 구조를 협의하여 진행한다.

반드시 고려해야 하는 상태:

- 마이크 권한 허용
- 마이크 권한 거부
- 녹음 중
- 녹음 완료
- 재생
- 재녹음
- 업로드 중
- 변환 중
- 변환 실패

---

# PWA

몽글은 PWA 설치를 지원한다.

사용 라이브러리:

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

특히 아래 환경을 확인한다.

```text
Android Chrome
iOS Safari
홈 화면 설치
Standalone 실행
새로고침
네트워크 변경
```

---

# Image Convention

몽글은 AI 생성 이미지를 중심으로 하는 서비스이기 때문에 이미지 성능을 중요하게 관리한다.

- WebP / AVIF 우선 사용
- `loading="lazy"` 적용
- 목록에서는 Thumbnail 사용
- 상세 화면에서만 고해상도 이미지 로드
- 불필요하게 큰 원본 이미지 사용 금지
- 이미지 Loading 상태 제공
- 이미지 생성 중 Skeleton 또는 Loading UI 제공

```tsx
<img src={imageUrl} alt="꿈 작품" loading="lazy" />
```

이미지 생성 시간이 길어질 수 있으므로 사용자에게 현재 상태를 명확하게 보여준다.

```text
생성 요청
↓
생성 중
↓
완료
```

실패한 경우 재시도할 수 있는 UI를 제공한다.

---

# Error / Loading Convention

모든 서버 요청 화면은 최소한 아래 상태를 고려한다.

```text
Loading
Success
Empty
Error
```

AI 이미지 생성이나 음성 변환처럼 시간이 오래 걸리는 기능은 별도의 진행 상태를 제공한다.

사용자가 다시 시도할 수 있는 요청에는 Retry UI를 제공한다.

---

# Git Convention

## Branch

```text
main
develop
feat/*
fix/*
refactor/*
chore/*
```

예시:

```text
feat/home
feat/dream-record
feat/calendar
feat/voice-record
feat/pwa

fix/dream-detail
fix/calendar-date

refactor/dream-query

chore/code-style
chore/pwa-setting
```

### main

실제 배포 가능한 코드만 유지한다.

### develop

프론트엔드 개발 기준 브랜치이다.

모든 기능 개발은 최신 `develop`에서 시작한다.

### 작업 Branch

기능 또는 작업 단위로 Branch를 생성한다.

```bash
git checkout develop
git pull origin develop

git checkout -b feat/dream-record
```

작업 완료 후 `develop`을 대상으로 Pull Request를 생성한다.

---

# Issue Convention

개발 작업은 가능한 경우 Issue를 먼저 생성하고 진행한다.

Issue 하나에는 하나의 명확한 작업을 작성한다.

예:

```text
[Feat] 꿈 기록 화면 구현
[Feat] 음성 녹음 기능 구현
[Design] 홈 화면 UI 구현
[Fix] 캘린더 날짜 선택 오류 수정
```

Issue에는 다음 내용을 작성한다.

```text
작업 내용
구현 범위
완료 조건
관련 화면 또는 디자인
```

작업 시작 시 담당자를 지정하고 적절한 Label을 설정한다.

---

# Commit Convention

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
[Test] : 꿈 등록 API 테스트 추가
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

# Pull Request Convention

작업 완료 후 `develop`을 대상으로 Pull Request를 생성한다.

PR 생성 전 아래 명령을 실행한다.

```bash
pnpm format
pnpm lint
pnpm build
```

모두 정상적으로 통과한 후 Commit / Push한다.

```bash
git add .
git commit -m "[Feat] : 꿈 기록 화면 구현"
git push -u origin feat/dream-record
```

PR 제목은 Commit Convention과 동일한 형식을 사용한다.

```text
[Feat] : 꿈 기록 화면 구현
```

PR에는 다음 내용을 포함한다.

```text
작업 내용
주요 변경 사항
관련 Issue
확인 사항
스크린샷
리뷰 요청 사항
```

관련 Issue가 있는 경우:

```text
Closes #12
```

형태로 연결한다.

PR은 최소 한 명 이상의 리뷰를 받은 후 `develop`에 병합한다.

---

# 개발 Flow

기본 개발 흐름은 다음과 같다.

```text
Issue 생성
↓
develop 최신화
↓
작업 Branch 생성
↓
개발
↓
pnpm format
↓
pnpm lint
↓
pnpm build
↓
Commit
↓
Push
↓
Pull Request
↓
Code Review
↓
develop Merge
```

---

# 작업 시작 방법

매 작업 시작 전:

```bash
git checkout develop
git pull origin develop
```

새 브랜치 생성:

```bash
git checkout -b feat/작업명
```

예:

```bash
git checkout -b feat/home
```

---

# 작업 완료 방법

코드 정리:

```bash
pnpm format
```

코드 검사:

```bash
pnpm lint
```

빌드 확인:

```bash
pnpm build
```

Git 상태 확인:

```bash
git status
```

Commit:

```bash
git add .
git commit -m "[Feat] : 작업 내용"
```

Push:

```bash
git push -u origin feat/작업명
```

이후 GitHub에서 `develop`을 대상으로 Pull Request를 생성한다.

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
10/30 런칭
```

시험 기간인 `10/19 ~ 10/25`에는 큰 기능 개발을 진행하기 어렵기 때문에 실질적인 핵심 기능 개발 마감은 **10/18**로 설정한다.

---

# Sprint 0 — 개발 환경 세팅

## 09/26 ~ 09/28

세 명이 동시에 개발을 시작할 수 있도록 기본 개발 환경과 프로젝트 구조를 구성한다.

### 진행 사항

- React + TypeScript + Vite 초기 세팅
- pnpm 환경 구성
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

프론트엔드 3명이 동일한 환경에서 프로젝트를 실행하고 각각 기능 개발을 시작할 수 있는 상태.

---

# Sprint 1 — 주요 화면 구현

## 09/29 ~ 10/05

디자인을 기준으로 핵심 화면을 우선 구현한다.

### 주요 범위

- 로그인
- 회원가입
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
캘린더 / 꿈 상세
```

---

# Sprint 2 — API 연동 및 핵심 기능

## 10/06 ~ 10/12

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

# Sprint 3 — 서비스 핵심 경험 완성

## 10/13 ~ 10/18

시험 기간 전에 주요 기능 개발을 완료한다.

### 주요 범위

- Dream World 관련 화면
- 과거 꿈 연결 UI
- 반복 장소 / 인물 표현
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

# Exam Period — 최소 작업 기간

## 10/19 ~ 10/25

시험 기간으로 신규 기능 개발은 최소화한다.

가능한 작업:

- 치명적인 버그 수정
- 간단한 UI 수정
- 코드 리뷰
- Merge Conflict 해결
- 문서 정리

큰 기능 추가나 구조 변경은 진행하지 않는다.

---

# Sprint 4 — Release Candidate

## 10/26 ~ 10/29

신규 기능 개발보다 안정화와 출시 준비에 집중한다.

### 주요 범위

- 전체 사용자 Flow QA
- 실제 모바일 환경 테스트
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

## 10/29

Release Candidate를 확정한다.

이후에는 새로운 기능 추가를 중단하고 런칭 버전을 고정한다.

---

# Launch

## 10/30

`10/30`에는 개발 중인 상태가 아니라 실제 사용자가 사용할 수 있는 서비스 상태를 목표로 한다.

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

# Frontend 업무 분배 원칙

프론트엔드 인원은 총 3명이다.

```text
이남혁
안정규
강기명
```

현재 세부 기능 담당은 고정하지 않는다.

Sprint 시작 시 구현해야 하는 화면과 기능을 기준으로 작업량을 확인한 후 세 명이 분배한다.

업무 분배 시 아래 원칙을 따른다.

- 한 명에게 특정 도메인의 모든 작업이 몰리지 않도록 한다.
- 공통 컴포넌트와 프로젝트 구조는 세 명이 함께 확인한다.
- 작업 완료 후 최소 한 명 이상의 코드 리뷰를 진행한다.
- API 명세 변경 사항은 즉시 공유한다.
- 본인이 담당하지 않은 영역도 수정할 수 있도록 구조와 코드를 공유한다.
- 작업량이 예상보다 큰 경우 Sprint 중간에도 재분배할 수 있다.

---

# 개발 우선순위

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

# 개발 원칙

- API 연동 전에는 Mock Data로 화면 개발을 진행할 수 있다.
- Mock Data는 실제 API Response 구조와 최대한 동일하게 작성한다.
- API 요청은 컴포넌트 내부에 직접 작성하지 않는다.
- 공통 컴포넌트를 중복 구현하지 않는다.
- 서버 데이터와 클라이언트 상태를 구분해서 관리한다.
- Loading / Empty / Error 상태를 반드시 구현한다.
- 모바일 환경을 우선으로 구현한다.
- 이미지 성능을 항상 고려한다.
- 음성 녹음과 PWA는 실제 모바일 환경에서 테스트한다.
- 환경 변수와 Secret은 Git에 커밋하지 않는다.
- npm, yarn, pnpm을 혼용하지 않는다.
- 작업 시작 전 `develop`을 최신 상태로 맞춘다.
- PR 전 `pnpm format`, `pnpm lint`, `pnpm build`를 확인한다.
- 시험 기간 전에 핵심 기능 개발을 완료한다.
- 10/26 이후에는 새로운 기능보다 안정화를 우선한다.
- 10/30에는 개발 완료가 아니라 실제 런칭이 이루어져야 한다.
