/**
 * 게시물 카드 스켈레톤 컴포넌트
 *
 * PostCard와 동일한 레이아웃을 가지지만 로딩 상태를 표시하는 스켈레톤 UI입니다.
 * 회색 박스와 펄스 애니메이션으로 구성됩니다.
 */

/**
 * PostCardSkeleton 컴포넌트
 *
 * Instagram 스타일 게시물 카드의 로딩 상태를 표시합니다.
 * Header, Image, Actions, Content 영역 모두 스켈레톤으로 구성됩니다.
 */
export default function PostCardSkeleton() {
  return (
    <article className="bg-white border border-gray-200 rounded-sm mb-6">
      {/* Header 영역 (60px 높이) */}
      <header className="flex items-center justify-between p-3">
        {/* 프로필 이미지 + 사용자명 + 시간 */}
        <div className="flex items-center space-x-3">
          {/* 프로필 이미지 (32px 원형) */}
          <div className="w-8 h-8 bg-gray-300 rounded-full animate-pulse" />

          {/* 사용자명 + 시간 */}
          <div className="flex flex-col space-y-1">
            <div className="w-20 h-4 bg-gray-300 rounded animate-pulse" />
            <div className="w-16 h-3 bg-gray-300 rounded animate-pulse" />
          </div>
        </div>

        {/* 메뉴 버튼 */}
        <div className="w-6 h-6 bg-gray-300 rounded animate-pulse" />
      </header>

      {/* Image 영역 (정사각형) */}
      <div className="aspect-square bg-gray-300 animate-pulse" />

      {/* Actions 영역 (48px 높이) */}
      <div className="flex items-center justify-between p-3">
        {/* 좌측 액션 버튼들 */}
        <div className="flex items-center space-x-4">
          <div className="w-6 h-6 bg-gray-300 rounded animate-pulse" />
          <div className="w-6 h-6 bg-gray-300 rounded animate-pulse" />
          <div className="w-6 h-6 bg-gray-300 rounded animate-pulse" />
        </div>

        {/* 우측 북마크 버튼 */}
        <div className="w-6 h-6 bg-gray-300 rounded animate-pulse" />
      </div>

      {/* Content 영역 */}
      <div className="px-3 pb-3 space-y-2">
        {/* 좋아요 수 */}
        <div className="w-24 h-4 bg-gray-300 rounded animate-pulse" />

        {/* 캡션 (여러 줄) */}
        <div className="space-y-2">
          <div className="w-full h-4 bg-gray-300 rounded animate-pulse" />
          <div className="w-3/4 h-4 bg-gray-300 rounded animate-pulse" />
          <div className="w-1/2 h-4 bg-gray-300 rounded animate-pulse" />
        </div>

        {/* 댓글 미리보기 */}
        <div className="space-y-1">
          <div className="w-full h-4 bg-gray-300 rounded animate-pulse" />
          <div className="w-4/5 h-4 bg-gray-300 rounded animate-pulse" />
        </div>

        {/* 댓글 모두 보기 */}
        <div className="w-32 h-4 bg-gray-300 rounded animate-pulse" />
      </div>
    </article>
  );
}
