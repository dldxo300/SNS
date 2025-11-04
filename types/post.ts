/**
 * 게시물 관련 TypeScript 타입 정의
 *
 * Instagram 스타일 SNS의 게시물, 댓글, API 응답 타입들을 정의합니다.
 */

/**
 * 게시물 기본 정보 타입
 */
export interface Post {
  id: string; // UUID
  user_id: string;
  image_url: string;
  caption: string | null;
  created_at: string;
  likes_count: number;
  comments_count: number;
}

/**
 * 작성자 정보가 포함된 게시물 타입
 */
export interface PostWithAuthor extends Post {
  author_name: string;
  author_clerk_id: string;
  isLiked?: boolean; // 현재 로그인한 사용자가 좋아요 했는지
}

/**
 * 댓글 미리보기 타입
 */
export interface CommentPreview {
  id: string;
  content: string;
  created_at: string;
  author_name: string;
  author_clerk_id: string;
}

/**
 * 게시물 목록 API 응답 타입
 */
export interface PostFeedResponse {
  posts: PostWithAuthor[];
  commentsByPostId: Record<string, CommentPreview[]>;
  hasMore: boolean;
  nextPage: number | null;
}

/**
 * 게시물 작성 API 응답 타입
 */
export interface CreatePostResponse {
  success: boolean;
  post: {
    id: string;
    user_id: string;
    image_url: string;
    caption: string | null;
    created_at: string;
  };
}