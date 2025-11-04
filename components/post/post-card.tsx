/**
 * 게시물 카드 컴포넌트
 *
 * Instagram 스타일의 게시물 카드를 표시합니다.
 * Header, Image, Actions, Content 영역으로 구성됩니다.
 */

"use client";

import Image from "next/image";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import {
  Heart,
  MessageCircle,
  Send,
  Bookmark,
  MoreHorizontal
} from "lucide-react";
import { formatRelativeTime } from "@/lib/utils/date";
import type { PostWithAuthor, CommentPreview } from "@/types/post";

interface PostCardProps {
  post: PostWithAuthor;
  previewComments: CommentPreview[];
  currentUserId?: string; // 현재 로그인한 사용자 Clerk ID (향후 프로필 링크 등에 사용)
}

/**
 * PostCard 컴포넌트
 *
 * Instagram 스타일 게시물 카드를 렌더링합니다.
 */
export default function PostCard({ post, previewComments, currentUserId }: PostCardProps) {
  const { user } = useUser();
  const router = useRouter();

  const [showFullCaption, setShowFullCaption] = useState(false);

  // 좋아요 상태 관리
  const [isLiked, setIsLiked] = useState(post.isLiked ?? false);
  const [likesCount, setLikesCount] = useState(post.likes_count);
  const [isLoading, setIsLoading] = useState(false);
  const [showBigHeart, setShowBigHeart] = useState(false);

  // Optimistic update를 위한 이전 값 저장
  const prevIsLikedRef = useRef(isLiked);
  const prevLikesCountRef = useRef(likesCount);

  // 더블탭 감지용 타이머
  const lastTapTimeRef = useRef(0);

  // 좋아요 상태에 따른 하트 아이콘 스타일
  const heartIcon = isLiked ? (
    <Heart className="w-6 h-6 text-red-500 fill-red-500 transition-transform duration-150" />
  ) : (
    <Heart className="w-6 h-6 transition-transform duration-150" />
  );

  // 숫자 포맷팅 함수
  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  // 좋아요 토글 함수
  const handleLikeToggle = async () => {
    console.log('좋아요 토글 시작:', { postId: post.id, currentIsLiked: isLiked });

    // 로그인 확인
    if (!user) {
      console.log('로그인하지 않은 사용자 - 토스트 메시지 표시 및 리다이렉트');
      // 토스트 메시지 표시 (실제로는 toast 라이브러리 사용)
      alert('로그인이 필요합니다.');

      // 2초 후 로그인 페이지로 리다이렉트
      setTimeout(() => {
        router.push('/sign-in');
      }, 2000);
      return;
    }

    // 로딩 상태 설정 및 이전 값 저장
    setIsLoading(true);
    prevIsLikedRef.current = isLiked;
    prevLikesCountRef.current = likesCount;

    // Optimistic update: UI 즉시 업데이트
    const newIsLiked = !isLiked;
    const newLikesCount = newIsLiked ? likesCount + 1 : likesCount - 1;

    setIsLiked(newIsLiked);
    setLikesCount(newLikesCount);

    try {
      console.log('API 호출 시작:', { newIsLiked, endpoint: newIsLiked ? 'POST' : 'DELETE' });

      const endpoint = newIsLiked ? '/api/likes' : `/api/likes?postId=${post.id}`;
      const method = newIsLiked ? 'POST' : 'DELETE';
      const body = newIsLiked ? JSON.stringify({ postId: post.id }) : undefined;

      const response = await fetch(endpoint, {
        method,
        headers: newIsLiked ? { 'Content-Type': 'application/json' } : undefined,
        body,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const result = await response.json();
      console.log('API 호출 성공:', result);

      // API에서 반환된 실제 좋아요 수로 업데이트
      if (result.likesCount !== undefined) {
        setLikesCount(result.likesCount);
      }

    } catch (error) {
      console.error('좋아요 토글 실패:', error);

      // 롤백: 이전 값으로 되돌림
      setIsLiked(prevIsLikedRef.current);
      setLikesCount(prevLikesCountRef.current);

      // 사용자에게 에러 메시지 표시
      let errorMessage = '좋아요 처리 중 오류가 발생했습니다.';
      if (error instanceof Error) {
        if (error.message.includes('네트워크') || error.message.includes('fetch')) {
          errorMessage = '네트워크 오류가 발생했습니다. 다시 시도해주세요.';
        }
      }
      alert(errorMessage);

    } finally {
      setIsLoading(false);
    }
  };

  // 이미지 더블탭 핸들러
  const handleImageDoubleClick = () => {
    console.log('이미지 더블탭 감지:', post.id);

    // 이미 좋아요한 경우 무시
    if (isLiked) {
      console.log('이미 좋아요한 게시물 - 무시');
      return;
    }

    // 큰 하트 애니메이션 표시
    setShowBigHeart(true);

    // 좋아요 추가 (더블탭은 무조건 좋아요 추가)
    handleLikeToggle();

    // 1초 후 큰 하트 숨김
    setTimeout(() => {
      setShowBigHeart(false);
    }, 1000);
  };

  // 이미지 클릭 핸들러 (더블탭 감지)
  const handleImageClick = () => {
    const currentTime = Date.now();
    const timeDiff = currentTime - lastTapTimeRef.current;

    if (timeDiff < 300 && timeDiff > 0) {
      // 더블탭으로 감지됨
      handleImageDoubleClick();
    }

    lastTapTimeRef.current = currentTime;
  };

  return (
    <article className="bg-white border border-gray-200 rounded-sm mb-6 max-w-[630px] mx-auto">
      {/* Header 영역 (60px 높이) */}
      <header className="flex items-center justify-between p-3">
          {/* 프로필 이미지 + 사용자명 + 시간 */}
        <div className="flex items-center space-x-3">
          {/* 프로필 이미지 (32px 원형) */}
          <div className="w-8 h-8 bg-gray-300 rounded-full flex-shrink-0" />

          {/* 사용자명 + 시간 */}
          <div className="flex flex-col">
            <span className="font-semibold text-sm text-black hover:text-gray-600 cursor-pointer">
              {post.author_name}
            </span>
            <span className="text-xs text-gray-500">
              {formatRelativeTime(post.created_at)}
            </span>
          </div>
        </div>

        {/* 메뉴 버튼 (우측) */}
        <button className="text-gray-600 hover:text-gray-800">
          <MoreHorizontal className="w-5 h-5" />
        </button>
      </header>

      {/* Image 영역 (정사각형) */}
      <div className="aspect-square bg-gray-100 relative select-none">
        <Image
          src={post.image_url}
          alt={`게시물 이미지`}
          fill
          className="object-cover cursor-pointer"
          onClick={handleImageClick}
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = "/placeholder-image.jpg"; // 기본 이미지로 대체
          }}
        />

        {/* 더블탭 시 큰 하트 애니메이션 */}
        {showBigHeart && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <Heart
              className="w-24 h-24 text-red-500 fill-red-500 animate-pulse"
              style={{
                animation: 'bigHeart 1s ease-out forwards',
              }}
            />
          </div>
        )}
      </div>

      {/* Actions 영역 (48px 높이) */}
      <div className="flex items-center justify-between p-3">
        {/* 좌측 액션 버튼들 */}
        <div className="flex items-center space-x-4">
          {/* 좋아요 버튼 */}
          <button
            onClick={handleLikeToggle}
            disabled={isLoading}
            className={`transition-colors ${
              isLoading
                ? 'opacity-50 cursor-not-allowed'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            {heartIcon}
          </button>

          {/* 댓글 버튼 */}
          <button className="text-gray-600 hover:text-gray-800 transition-colors">
            <MessageCircle className="w-6 h-6" />
          </button>

          {/* 공유 버튼 (UI만, 기능 제외) */}
          <button className="text-gray-600 hover:text-gray-800 transition-colors opacity-60 cursor-not-allowed">
            <Send className="w-6 h-6" />
          </button>
        </div>

        {/* 우측 북마크 버튼 (UI만, 기능 제외) */}
        <button className="text-gray-600 hover:text-gray-800 transition-colors opacity-60 cursor-not-allowed">
          <Bookmark className="w-6 h-6" />
        </button>
      </div>

      {/* Content 영역 */}
      <div className="px-3 pb-3">
        {/* 좋아요 수 */}
        <div className="font-semibold text-sm mb-2">
          {likesCount === 0
            ? '좋아요 없음'
            : likesCount === 1
            ? '좋아요 1개'
            : `좋아요 ${formatNumber(likesCount)}개`
          }
        </div>

        {/* 캡션 */}
        {post.caption && (
          <div className="mb-2">
            <span className="font-semibold text-sm mr-2">
              {post.author_name}
            </span>
            <span className="text-sm">
              {showFullCaption ? (
                post.caption
              ) : (
                <>
                  {post.caption.length > 100
                    ? `${post.caption.substring(0, 100)}...`
                    : post.caption
                  }
                  {post.caption.length > 100 && (
                    <button
                      onClick={() => setShowFullCaption(true)}
                      className="text-gray-500 hover:text-gray-700 ml-1"
                    >
                      더 보기
                    </button>
                  )}
                </>
              )}
            </span>
          </div>
        )}

        {/* 댓글 미리보기 */}
        {previewComments.map((comment) => (
          <div key={comment.id} className="mb-1">
            <span className="font-semibold text-sm mr-2">
              {comment.author_name}
            </span>
            <span className="text-sm">{comment.content}</span>
          </div>
        ))}

        {/* 댓글 모두 보기 링크 */}
        {post.comments_count > previewComments.length && (
          <button className="text-gray-500 text-sm hover:text-gray-700">
            댓글 {post.comments_count}개 모두 보기
          </button>
        )}
      </div>
    </article>
  );
}
