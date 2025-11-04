## 1. 홈 피드 페이지

### 1-1. 기본 세팅
- [x] Next.js + TypeScript 프로젝트 생성
- [x] Tailwind CSS 설정 (인스타 컬러 스키마) - 기본 Tailwind는 설정됨, Instagram 색상 변수 추가 필요
- [x] Clerk 인증 연동 (한국어 설정) - middleware.ts, lib/supabase/ 파일들 존재
- [x] Supabase 프로젝트 생성 및 연동 - lib/supabase/ 파일들 존재
- [x] 기본 데이터베이스 테이블 (users, posts, likes, comments, follows) - sns_schema.sql 존재

### 1-2. 레이아웃 구조
- [x] Sidebar 컴포넌트 (Desktop/Tablet 반응형)
- [x] MobileHeader 컴포넌트
- [x] BottomNav 컴포넌트
- [x] (main) Route Group 및 레이아웃 통합

### 1-3. 홈 피드 - 게시물 목록
- [ ] PostCard 컴포넌트 (Header, Image, Actions, Content)
- [ ] PostCardSkeleton 로딩 UI
- [ ] PostFeed 컴포넌트
- [ ] /api/posts GET API (페이지네이션)

### 1-4. 홈 피드 - 좋아요 기능
- [ ] likes 테이블 활용 (이미 생성됨)
- [ ] /api/likes POST/DELETE API
- [ ] 좋아요 버튼 및 애니메이션 (하트 + 더블탭)

## 2. 게시물 작성 & 댓글 기능

### 2-1. 게시물 작성 모달
- [ ] CreatePostModal 컴포넌트 (Dialog)
- [ ] 이미지 미리보기 UI
- [ ] 텍스트 입력 필드

### 2-2. 게시물 작성 - 이미지 업로드
- [ ] Supabase Storage 버킷 생성
- [ ] /api/posts POST API
- [ ] 파일 업로드 로직 및 검증

### 2-3. 댓글 기능 - UI & 작성
- [ ] comments 테이블 활용 (이미 생성됨)
- [ ] CommentList, CommentForm 컴포넌트
- [ ] /api/comments POST API

### 2-4. 댓글 기능 - 삭제 & 무한스크롤
- [ ] /api/comments DELETE API
- [ ] 댓글 삭제 버튼 (본인만)
- [ ] PostFeed 무한 스크롤 (Intersection Observer)

## 3. 프로필 페이지 & 팔로우 기능

### 3-1. 프로필 페이지 - 기본 정보
- [ ] /profile/[userId] 동적 라우트
- [ ] 프로필 헤더 (아바타, 이름, 통계)
- [ ] /api/users/[userId] GET API

### 3-2. 프로필 페이지 - 게시물 그리드
- [ ] 3열 그리드 레이아웃 (반응형)
- [ ] /api/posts에 userId 파라미터 추가
- [ ] 게시물 이미지 썸네일 표시

### 3-3. 팔로우 기능
- [ ] follows 테이블 활용 (이미 생성됨)
- [ ] /api/follows POST/DELETE API
- [ ] 팔로우/언팔로우 버튼 및 상태 관리

### 3-4. 최종 마무리 & 배포
- [ ] 모바일/태블릿 반응형 테스트
- [ ] 에러 핸들링 및 Skeleton UI
- [ ] Vercel 배포
