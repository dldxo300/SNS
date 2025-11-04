/**
 * 게시물 피드 컴포넌트
 *
 * Instagram 스타일 홈 피드에서 게시물 목록을 표시합니다.
 * API 호출, 로딩 상태, 에러 처리를 담당합니다.
 */

"use client";

import { useEffect, useState, useCallback } from "react";
import { useUser } from "@clerk/nextjs";
import PostCard from "./post-card";
import PostCardSkeleton from "./post-card-skeleton";
import type { PostWithAuthor, CommentPreview, PostFeedResponse } from "@/types/post";

interface PostFeedProps {
  userId?: string; // 특정 사용자의 게시물만 표시 (프로필 페이지용)
}

/**
 * PostFeed 컴포넌트
 *
 * 게시물 목록을 표시하고 API 호출을 관리합니다.
 */
export default function PostFeed({ userId }: PostFeedProps) {
  const { user } = useUser();

  const [posts, setPosts] = useState<PostWithAuthor[]>([]);
  const [commentsByPostId, setCommentsByPostId] = useState<Record<string, CommentPreview[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * 게시물 목록을 API에서 가져옵니다.
   */
  const fetchPosts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('게시물 목록 조회 시작:', { userId });

      // 쿼리 파라미터 구성
      const params = new URLSearchParams();
      params.set('page', '1');
      params.set('limit', '10');
      if (userId) {
        params.set('userId', userId);
      }

      const response = await fetch(`/api/posts?${params.toString()}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const data: PostFeedResponse = await response.json();

      console.log('게시물 목록 조회 성공:', {
        postsCount: data.posts.length,
        hasMore: data.hasMore
      });

      setPosts(data.posts);
      setCommentsByPostId(data.commentsByPostId);

    } catch (err) {
      console.error('게시물 목록 조회 실패:', err);

      let errorMessage = '게시물을 불러오는 중 오류가 발생했습니다.';

      if (err instanceof Error) {
        if (err.message.includes('네트워크') || err.message.includes('fetch')) {
          errorMessage = '네트워크 오류가 발생했습니다. 다시 시도해주세요.';
        } else if (err.message.includes('500')) {
          errorMessage = '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
        }
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  /**
   * 로딩 상태 렌더링
   */
  if (loading) {
    return (
      <div className="space-y-6">
        {/* 3개의 스켈레톤 표시 */}
        {Array.from({ length: 3 }).map((_, index) => (
          <PostCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  /**
   * 에러 상태 렌더링
   */
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="text-center">
          <div className="text-gray-400 text-6xl mb-4">😵</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            게시물을 불러올 수 없습니다
          </h3>
          <p className="text-gray-600 mb-6 max-w-sm">
            {error}
          </p>
          <button
            onClick={fetchPosts}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  /**
   * 빈 상태 렌더링
   */
  if (posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="text-center">
          <div className="text-gray-400 text-6xl mb-4">📭</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            아직 게시물이 없습니다
          </h3>
          <p className="text-gray-600">
            {userId
              ? '이 사용자가 아직 게시물을 작성하지 않았습니다.'
              : '첫 번째 게시물을 작성해보세요!'
            }
          </p>
        </div>
      </div>
    );
  }

  /**
   * 게시물 목록 렌더링
   */
  return (
    <div className="space-y-6">
      {posts.map((post) => (
        <PostCard
          key={post.id}
          post={post}
          previewComments={commentsByPostId[post.id] || []}
          currentUserId={user?.id}
        />
      ))}
    </div>
  );
}
