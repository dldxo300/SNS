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
- [x] date-fns 라이브러리 설치 (상대 시간 표시용)
- [x] TypeScript 타입 정의 (types/post.ts)
  - Post, PostWithAuthor, CommentPreview, PostFeedResponse 타입
- [x] 날짜 유틸리티 함수 (lib/utils/date.ts - formatRelativeTime)
- [x] /api/posts GET API 구현
  - posts 테이블 + users 테이블 JOIN
  - 좋아요/댓글 수 직접 계산 (likes, comments 테이블 집계)
  - 현재 사용자 좋아요 여부 확인 (isLiked)
  - 댓글 미리보기 조회 (각 게시물별 최신 2개)
  - 페이지네이션 지원 (page, limit, userId 파라미터)
  - 에러 처리 (네트워크/서버/빈 결과 구분)
  - 시간 역순 정렬 (created_at DESC)
- [x] PostCardSkeleton 컴포넌트 (로딩 UI)
  - PostCard와 동일한 레이아웃 구조
  - animate-pulse 애니메이션
- [x] PostCard 컴포넌트 (Instagram 스타일 게시물 카드)
  - Header: 프로필 이미지, 사용자명, 상대 시간, 메뉴 버튼 (MoreHorizontal)
  - Image: 정사각형 비율 (aspect-square), Next.js Image 컴포넌트 사용
  - 더블탭 감지 로직 (300ms 이내 클릭)
  - Actions: 좋아요/댓글/공유/북마크 버튼 (공유/북마크는 UI만)
  - Content: 좋아요 수 (K/M 단위 포맷팅), 캡션 (100자 초과 시 "... 더 보기"), 댓글 미리보기
  - 에러 처리: 이미지 로드 실패 시 기본 이미지로 대체
- [x] PostFeed 컴포넌트 (게시물 목록 관리)
  - API 호출 및 상태 관리 (useState, useEffect)
  - 로딩 상태: 3개의 PostCardSkeleton 표시
  - 에러 상태: 에러 메시지 + "다시 시도" 버튼
  - 빈 상태: 빈 게시물 메시지 표시
  - commentsByPostId 활용하여 각 게시물별 댓글 미리보기 전달
  - userId 파라미터 지원 (프로필 페이지용)
- [x] 홈 페이지 통합 (app/(main)/page.tsx)
  - PostFeed 컴포넌트 사용
  - 임시 콘텐츠 제거
- [x] 빌드 및 배포 준비
  - 타입 에러 해결
  - ESLint warning 수정
  - 프로덕션 빌드 성공

### 1-4. 홈 피드 - 좋아요 기능
- [x] likes 테이블 활용 (이미 생성됨)
- [x] /api/likes POST/DELETE API
  - POST: 좋아요 추가 (Clerk 인증, 중복 방지)
  - DELETE: 좋아요 취소 (쿼리 파라미터로 postId 전달)
  - 좋아요 수 실시간 반영
- [x] 좋아요 버튼 및 애니메이션 (하트 + 더블탭)
  - PostCard 컴포넌트에 구현됨
  - Optimistic update 적용 (즉시 UI 반영)
  - 더블탭 시 큰 하트 애니메이션 표시 (1초)
  - 빈 하트 ↔ 빨간 하트 전환
  - 로그인하지 않은 사용자 처리

## 2. 게시물 작성 & 댓글 기능

### 2-1. 게시물 작성 모달
- [x] CreatePostModal 컴포넌트 (Dialog)
  - shadcn/ui Dialog 컴포넌트 사용
  - 모달 열기/닫기 상태 관리 (useState)
  - 반응형 디자인 (모바일/데스크톱 지원)
- [x] 드래그 앤 드롭 이미지 업로드
  - onDragOver, onDragEnter, onDragLeave, onDrop 핸들러 구현
  - 드래그 중 시각적 피드백 (배경색 변경: bg-blue-50, 테두리: border-blue-400)
  - 파일 선택 영역 명확히 표시 (점선 테두리, 아이콘, 텍스트)
- [x] 이미지 미리보기 UI
  - URL.createObjectURL() 사용한 미리보기 표시
  - 정사각형 비율 유지 (aspect-square)
  - Next.js Image 컴포넌트 사용
  - 이미지 제거 버튼 (X 아이콘) 제공
- [x] 텍스트 입력 필드
  - Textarea 컴포넌트 사용
  - 최대 2,200자 제한 (PRD.md 요구사항)
  - 실시간 글자 수 표시 (2,200 / 2,200 형식)
  - 글자 수 초과 시 입력 방지
- [x] 파일 검증 기능
  - 크기 제한: 최대 5MB
  - 형식 제한: JPG, PNG, WEBP만 허용
  - 검증 실패 시 에러 메시지 표시
- [x] 인증 체크
  - useAuth()로 로그인 상태 확인
  - 비로그인 사용자 모달 열기 차단
  - 로그인 페이지 리다이렉트 (/sign-in)
- [x] 모달 닫기 시 상태 초기화
  - selectedFile, previewUrl, caption, error, isDragging 상태 초기화
  - URL.revokeObjectURL() 호출로 메모리 누수 방지
  - useEffect로 isOpen 변경 감지하여 처리
- [x] 로그 추가
  - 이미지 선택 성공: console.log('[CreatePostModal] 이미지 선택됨:', fileName)
  - 파일 검증 실패: console.error('[CreatePostModal] 파일 검증 실패:', error)
  - 모달 열기/닫기: console.log('[CreatePostModal] 모달 상태:', isOpen)
  - 드래그 이벤트: console.log('[CreatePostModal] 드래그 이벤트:', eventType)
  - 상태 초기화: console.log('[CreatePostModal] 모달 닫힘 - 상태 초기화 완료')
- [x] Sidebar 컴포넌트 연동
  - "만들기" 버튼 클릭 시 CreatePostModal 열림
  - 상태 끌어올리기로 모달 관리
- [x] BottomNav 컴포넌트 연동
  - 모바일 "만들기" 버튼 클릭 시 동일 모달 열림
  - 상태 관리 방식 동일

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
