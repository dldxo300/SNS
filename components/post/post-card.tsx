/**
 * 게시물 카드 컴포넌트
 *
 * Instagram 스타일의 게시물 카드를 표시합니다.
 * Header, Image, Actions, Content 영역으로 구성됩니다.
 */

"use client";

import Image from "next/image";

import { useState } from "react";
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
  const [showFullCaption, setShowFullCaption] = useState(false);

  // 좋아요 상태에 따른 하트 아이콘 스타일
  const heartIcon = post.isLiked ? (
    <Heart className="w-6 h-6 text-red-500 fill-red-500" />
  ) : (
    <Heart className="w-6 h-6" />
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
      <div className="aspect-square bg-gray-100 relative">
        <Image
          src={post.image_url}
          alt={`게시물 이미지`}
          fill
          className="object-cover"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = "/placeholder-image.jpg"; // 기본 이미지로 대체
          }}
        />
      </div>

      {/* Actions 영역 (48px 높이) */}
      <div className="flex items-center justify-between p-3">
        {/* 좌측 액션 버튼들 */}
        <div className="flex items-center space-x-4">
          {/* 좋아요 버튼 */}
          <button className="text-gray-600 hover:text-gray-800 transition-colors">
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
          좋아요 {formatNumber(post.likes_count)}개
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
