/**
 * 게시물 목록 조회 API
 *
 * GET /api/posts
 *
 * Instagram 스타일 홈 피드에서 게시물 목록을 조회합니다.
 * post_stats 뷰를 활용하여 좋아요/댓글 수를 포함하고,
 * 작성자 정보, 좋아요 상태, 댓글 미리보기를 함께 제공합니다.
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClerkSupabaseClient } from '@/lib/supabase/server';
import type { PostFeedResponse, PostWithAuthor, CommentPreview, CreatePostResponse } from '@/types/post';

/**
 * GET /api/posts
 *
 * 게시물 목록을 조회합니다.
 *
 * 쿼리 파라미터:
 * - page: 페이지 번호 (기본값: 1)
 * - limit: 페이지당 게시물 수 (기본값: 10)
 * - userId: 특정 사용자의 게시물만 조회 (선택)
 */
export async function GET(request: NextRequest) {
  console.log('GET /api/posts - 게시물 목록 조회 시작');

  try {
    const supabase = createClerkSupabaseClient();

    // 쿼리 파라미터 파싱
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '10', 10))); // 최대 50개 제한
    const userId = searchParams.get('userId'); // 특정 사용자 게시물 필터링용

    const offset = (page - 1) * limit;

    console.log('쿼리 파라미터:', { page, limit, offset, userId });

    // 1. 게시물 목록 조회 (posts + users JOIN + 통계 계산)
    let query = supabase
      .from('posts')
      .select(`
        id,
        user_id,
        image_url,
        caption,
        created_at
      `)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // userId 필터 적용 (선택적)
    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { data: postsData, error: postsError } = await query;

    if (postsError) {
      console.error('게시물 조회 에러:', postsError);
      return NextResponse.json(
        { error: '게시물을 불러오는 중 오류가 발생했습니다.' },
        { status: 500 }
      );
    }

    if (!postsData || postsData.length === 0) {
      console.log('게시물 없음');
      return NextResponse.json({
        posts: [],
        commentsByPostId: {},
        hasMore: false,
        nextPage: null
      } as PostFeedResponse);
    }

    // 게시물 ID와 사용자 ID 목록 추출
    const postIds = postsData.map(item => item.id);
    const userIds = [...new Set(postsData.map(item => item.user_id))]; // 중복 제거

    // 사용자 정보 조회
    const { data: usersData } = await supabase
      .from('users')
      .select('id, name, clerk_id')
      .in('id', userIds);

    // 사용자 정보를 Map으로 변환
    const usersMap: Record<string, { name: string; clerk_id: string }> = {};
    usersData?.forEach(user => {
      usersMap[user.id] = { name: user.name, clerk_id: user.clerk_id };
    });

    // 좋아요 수 계산
    const { data: likesData } = await supabase
      .from('likes')
      .select('post_id')
      .in('post_id', postIds);

    // 댓글 수 계산
    const { data: commentsData } = await supabase
      .from('comments')
      .select('post_id')
      .in('post_id', postIds);

    // 통계 계산
    const likesCount: Record<string, number> = {};
    const commentsCount: Record<string, number> = {};

    likesData?.forEach(like => {
      likesCount[like.post_id] = (likesCount[like.post_id] || 0) + 1;
    });

    commentsData?.forEach(comment => {
      commentsCount[comment.post_id] = (commentsCount[comment.post_id] || 0) + 1;
    });

    // 응답 데이터 변환
    const posts: PostWithAuthor[] = postsData.map(item => ({
      id: item.id,
      user_id: item.user_id,
      image_url: item.image_url,
      caption: item.caption,
      created_at: item.created_at,
      likes_count: likesCount[item.id] || 0,
      comments_count: commentsCount[item.id] || 0,
      author_name: usersMap[item.user_id]?.name || 'Unknown',
      author_clerk_id: usersMap[item.user_id]?.clerk_id || '',
    }));

    console.log(`${posts.length}개 게시물 조회됨`);

    // 2. 현재 사용자 좋아요 여부 확인 (로그인한 경우)
    const { userId: clerkUserId } = await auth();

    if (clerkUserId) {
      console.log('로그인 사용자 좋아요 상태 확인:', clerkUserId);

      // users 테이블에서 clerk_id로 user_id 조회
      const { data: currentUser } = await supabase
        .from('users')
        .select('id')
        .eq('clerk_id', clerkUserId)
        .single();

      if (currentUser) {

        // likes 테이블에서 각 게시물별 좋아요 여부 확인
        const { data: likedPosts } = await supabase
          .from('likes')
          .select('post_id')
          .eq('user_id', currentUser.id)
          .in('post_id', postIds);

        // isLiked 필드 설정
        posts.forEach(post => {
          post.isLiked = likedPosts?.some(
            like => like.post_id === post.id
          ) ?? false;
        });

        console.log(`${likedPosts?.length || 0}개 게시물에 좋아요 표시됨`);
      }
    }

    // 3. 댓글 미리보기 조회 (각 게시물별 최신 2개)
    const commentsByPostId: Record<string, CommentPreview[]> = {};

    console.log('댓글 미리보기 조회 시작');

    // 모든 댓글 조회 (한 번에 조회하여 성능 개선)
    const { data: allCommentsData } = await supabase
      .from('comments')
      .select(`
        id,
        content,
        created_at,
        post_id,
        user_id
      `)
      .in('post_id', postIds)
      .order('created_at', { ascending: false });

    // 댓글을 게시물별로 그룹화하고 최신 2개씩만 선택
    const commentsByPostIdTemp: Record<string, typeof allCommentsData> = {};
    allCommentsData?.forEach(comment => {
      if (!commentsByPostIdTemp[comment.post_id]) {
        commentsByPostIdTemp[comment.post_id] = [];
      }
      if (commentsByPostIdTemp[comment.post_id].length < 2) {
        commentsByPostIdTemp[comment.post_id].push(comment);
      }
    });

    // 댓글 작성자 정보 조회
    const commentUserIds = [...new Set(allCommentsData?.map(c => c.user_id) || [])];
    const { data: commentUsersData } = await supabase
      .from('users')
      .select('id, name, clerk_id')
      .in('id', commentUserIds);

    const commentUsersMap: Record<string, { name: string; clerk_id: string }> = {};
    commentUsersData?.forEach(user => {
      commentUsersMap[user.id] = { name: user.name, clerk_id: user.clerk_id };
    });

    // commentsByPostId 객체 생성
    postIds.forEach(postId => {
      const comments = commentsByPostIdTemp[postId] || [];
      commentsByPostId[postId] = comments.map(c => ({
        id: c.id,
        content: c.content,
        created_at: c.created_at,
        author_name: commentUsersMap[c.user_id]?.name || 'Unknown',
        author_clerk_id: commentUsersMap[c.user_id]?.clerk_id || ''
      }));
    });

    console.log(`${Object.values(commentsByPostId).flat().length}개 댓글 미리보기 조회됨`);

    // 4. 페이지네이션 정보 계산
    const hasMore = posts.length === limit;
    const nextPage = hasMore ? page + 1 : null;

    const response: PostFeedResponse = {
      posts,
      commentsByPostId,
      hasMore,
      nextPage
    };

    console.log('응답 완료:', {
      postsCount: posts.length,
      hasMore,
      nextPage,
      commentsPreviewCount: Object.values(commentsByPostId).flat().length
    });

    return NextResponse.json(response);

  } catch (error) {
    console.error('게시물 목록 조회 중 예기치 않은 에러:', error);

    // 에러 로깅 (스택 트레이스 포함)
    if (error instanceof Error) {
      console.error('에러 상세:', {
        message: error.message,
        stack: error.stack
      });
    }

    return NextResponse.json(
      { error: '게시물을 불러오는 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/posts
 *
 * 게시물을 생성합니다.
 *
 * 요청 본문 (FormData):
 * - image: File (이미지 파일)
 * - caption: string (선택, 최대 2,200자)
 *
 * 응답:
 * - 성공 (200): CreatePostResponse 타입
 * - 실패 (400/401/404/413/500): { error: string }
 */
export async function POST(request: NextRequest) {
  console.log('[POST /api/posts] 게시물 작성 API 호출됨');
  
  try {
    // 1. 인증 확인
    const authResult = await auth();
    console.log('[POST /api/posts] auth() 결과:', { 
      userId: authResult?.userId, 
      sessionId: authResult?.sessionId,
      hasAuth: !!authResult 
    });
    
    const clerkUserId = authResult?.userId;
    
    if (!clerkUserId) {
      console.error('[POST /api/posts] 인증 실패: 사용자 ID 없음', { authResult });
      return NextResponse.json(
        { error: '로그인이 필요합니다.' },
        { status: 401 }
      );
    }
    
    console.log('[POST /api/posts] 인증 성공:', { clerkUserId });

    // 2. 요청 데이터 파싱
    const formData = await request.formData();
    const file = formData.get('image') as File;
    const caption = formData.get('caption') as string | null;

    console.log('[POST /api/posts] FormData 파싱 완료:', {
      hasFile: !!file,
      fileName: file?.name,
      captionLength: caption?.length
    });

    // 3. 파일 검증
    if (!file || !(file instanceof File)) {
      console.error('[POST /api/posts] 파일 없음');
      return NextResponse.json(
        { error: '파일 크기 또는 형식이 올바르지 않습니다.' },
        { status: 400 }
      );
    }

    // 파일 크기 검증 (5MB)
    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
    if (file.size > MAX_FILE_SIZE) {
      console.error('[POST /api/posts] 파일 크기 초과:', { size: file.size, maxSize: MAX_FILE_SIZE });
      return NextResponse.json(
        { error: '파일이 너무 큽니다. (최대 5MB)' },
        { status: 413 }
      );
    }

    // 파일 형식 검증
    const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!ALLOWED_TYPES.includes(file.type)) {
      console.error('[POST /api/posts] 파일 형식 불일치:', { type: file.type, allowedTypes: ALLOWED_TYPES });
      return NextResponse.json(
        { error: '파일 크기 또는 형식이 올바르지 않습니다.' },
        { status: 400 }
      );
    }

    // 파일 확장자 검증
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    const ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp'];
    if (!fileExtension || !ALLOWED_EXTENSIONS.includes(fileExtension)) {
      console.error('[POST /api/posts] 파일 확장자 불일치:', { extension: fileExtension, allowedExtensions: ALLOWED_EXTENSIONS });
      return NextResponse.json(
        { error: '파일 크기 또는 형식이 올바르지 않습니다.' },
        { status: 400 }
      );
    }

    // 4. 캡션 검증
    const MAX_CAPTION_LENGTH = 2200;
    if (caption && caption.length > MAX_CAPTION_LENGTH) {
      console.error('[POST /api/posts] 캡션 길이 초과:', { length: caption.length, maxLength: MAX_CAPTION_LENGTH });
      return NextResponse.json(
        { error: '파일 크기 또는 형식이 올바르지 않습니다.' },
        { status: 400 }
      );
    }

    console.log('[POST /api/posts] 파일 검증 완료:', {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      fileExtension,
      captionLength: caption?.length
    });

    // 5. Clerk User ID → Supabase User ID 변환
    const supabase = createClerkSupabaseClient();

    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('clerk_id', clerkUserId)
      .single();

    if (userError || !userData) {
      console.error('[POST /api/posts] 사용자 조회 실패:', { clerkUserId, error: userError });
      return NextResponse.json(
        { error: '사용자 정보를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    const supabaseUserId = userData.id;
    console.log('[POST /api/posts] 사용자 ID 변환 완료:', { clerkUserId, supabaseUserId });

    // 6. 이미지 업로드 (Supabase Storage)
    // 파일명 생성: 구체적인 형식 사용
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);
    const ext = file.name.split('.').pop()?.toLowerCase();
    const filename = `${timestamp}-${random}.${ext}`;

    const filePath = `${clerkUserId}/${filename}`;

    console.log('[POST /api/posts] Storage 업로드 시작:', { filePath });

    const { error: uploadError } = await supabase.storage
      .from('uploads')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,  // 중복 파일 덮어쓰기 방지
        contentType: file.type,  // MIME type 명시
      });

    if (uploadError) {
      console.error('[POST /api/posts] Storage 업로드 실패:', { error: uploadError, filePath });
      return NextResponse.json(
        { error: '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.' },
        { status: 500 }
      );
    }

    // 7. Public URL 생성
    const { data: urlData } = supabase.storage
      .from('uploads')
      .getPublicUrl(filePath);

    const imageUrl = urlData.publicUrl;
    console.log('[POST /api/posts] Storage 업로드 완료:', { publicUrl: imageUrl });

    // 8. 게시물 데이터베이스 저장
    const { data: postData, error: postError } = await supabase
      .from('posts')
      .insert({
        user_id: supabaseUserId,
        image_url: imageUrl,
        caption: caption,
      })
      .select('id, user_id, image_url, caption, created_at')
      .single();

    if (postError || !postData) {
      console.error('[POST /api/posts] 게시물 저장 실패:', { error: postError, supabaseUserId, imageUrl });

      // 업로드된 파일 삭제 (rollback)
      await supabase.storage
        .from('uploads')
        .remove([filePath]);

      return NextResponse.json(
        { error: '게시물 작성에 실패했습니다.' },
        { status: 500 }
      );
    }

    const postId = postData.id;
    console.log('[POST /api/posts] 게시물 저장 완료:', { postId });

    // 9. 성공 응답
    const response: CreatePostResponse = {
      success: true,
      post: {
        id: postData.id,
        user_id: postData.user_id,
        image_url: postData.image_url,
        caption: postData.caption,
        created_at: postData.created_at,
      },
    };

    console.log('[POST /api/posts] 게시물 작성 완료:', { postId });
    return NextResponse.json(response, { status: 200 });

  } catch (error) {
    console.error('[POST /api/posts] 예외 발생:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });

    return NextResponse.json(
      { error: '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.' },
      { status: 500 }
    );
  }
}
