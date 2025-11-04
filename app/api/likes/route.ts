/**
 * 좋아요 API 라우트
 *
 * POST /api/likes - 좋아요 추가
 * DELETE /api/likes - 좋아요 취소
 *
 * Clerk 인증을 사용하여 사용자의 좋아요 상태를 관리합니다.
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClerkSupabaseClient } from '@/lib/supabase/server';

/**
 * POST /api/likes
 *
 * 게시물에 좋아요를 추가합니다.
 * 요청 본문: { postId: string }
 */
export async function POST(request: NextRequest) {
  console.log('POST /api/likes - 좋아요 추가 시작');

  try {
    // Clerk 인증 확인
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      console.log('인증 실패: Clerk user ID 없음');
      return NextResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    // 요청 본문 파싱
    const { postId }: { postId: string } = await request.json();
    if (!postId) {
      console.log('요청 데이터 누락: postId');
      return NextResponse.json(
        { error: '게시물 ID가 필요합니다.' },
        { status: 400 }
      );
    }

    console.log('좋아요 추가 요청:', { clerkUserId, postId });

    const supabase = createClerkSupabaseClient();

    // Clerk user ID로 Supabase user_id 조회
    const { data: currentUser, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('clerk_id', clerkUserId)
      .single();

    if (userError || !currentUser) {
      console.error('사용자 조회 실패:', userError);
      return NextResponse.json(
        { error: '사용자 정보를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 게시물 존재 확인
    const { data: post, error: postError } = await supabase
      .from('posts')
      .select('id')
      .eq('id', postId)
      .single();

    if (postError || !post) {
      console.error('게시물 조회 실패:', postError);
      return NextResponse.json(
        { error: '게시물을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // likes 테이블에 레코드 추가
    const { error: insertError } = await supabase
      .from('likes')
      .insert({
        post_id: postId,
        user_id: currentUser.id,
      });

    if (insertError) {
      // UNIQUE 제약 위반 (이미 좋아요한 경우)
      if (insertError.code === '23505') {
        console.log('이미 좋아요한 게시물:', postId);
        return NextResponse.json(
          { error: '이미 좋아요한 게시물입니다.' },
          { status: 409 }
        );
      }

      console.error('좋아요 추가 실패:', insertError);
      return NextResponse.json(
        { error: '좋아요 추가에 실패했습니다.' },
        { status: 500 }
      );
    }

    // 업데이트된 좋아요 수 조회
    const { count: likesCount, error: countError } = await supabase
      .from('likes')
      .select('*', { count: 'exact', head: true })
      .eq('post_id', postId);

    if (countError) {
      console.error('좋아요 수 조회 실패:', countError);
      // 좋아요는 추가되었으므로 성공으로 처리
    }

    console.log('좋아요 추가 성공:', { postId, likesCount });

    return NextResponse.json({
      success: true,
      likesCount: likesCount || 0,
    });

  } catch (error) {
    console.error('좋아요 추가 중 예기치 않은 에러:', error);

    // 에러 로깅
    if (error instanceof Error) {
      console.error('에러 상세:', {
        message: error.message,
        stack: error.stack
      });
    }

    return NextResponse.json(
      { error: '좋아요 추가 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/likes
 *
 * 게시물의 좋아요를 취소합니다.
 * 쿼리 파라미터: ?postId=xxx
 */
export async function DELETE(request: NextRequest) {
  console.log('DELETE /api/likes - 좋아요 취소 시작');

  try {
    // Clerk 인증 확인
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      console.log('인증 실패: Clerk user ID 없음');
      return NextResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    // 쿼리 파라미터에서 postId 추출
    const { searchParams } = new URL(request.url);
    const postId = searchParams.get('postId');

    if (!postId) {
      console.log('쿼리 파라미터 누락: postId');
      return NextResponse.json(
        { error: '게시물 ID가 필요합니다.' },
        { status: 400 }
      );
    }

    console.log('좋아요 취소 요청:', { clerkUserId, postId });

    const supabase = createClerkSupabaseClient();

    // Clerk user ID로 Supabase user_id 조회
    const { data: currentUser, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('clerk_id', clerkUserId)
      .single();

    if (userError || !currentUser) {
      console.error('사용자 조회 실패:', userError);
      return NextResponse.json(
        { error: '사용자 정보를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // likes 테이블에서 레코드 삭제
    const { error: deleteError } = await supabase
      .from('likes')
      .delete()
      .eq('post_id', postId)
      .eq('user_id', currentUser.id);

    if (deleteError) {
      console.error('좋아요 취소 실패:', deleteError);
      return NextResponse.json(
        { error: '좋아요 취소에 실패했습니다.' },
        { status: 500 }
      );
    }

    // 업데이트된 좋아요 수 조회
    const { count: likesCount, error: countError } = await supabase
      .from('likes')
      .select('*', { count: 'exact', head: true })
      .eq('post_id', postId);

    if (countError) {
      console.error('좋아요 수 조회 실패:', countError);
      // 좋아요는 취소되었으므로 성공으로 처리
    }

    console.log('좋아요 취소 성공:', { postId, likesCount });

    return NextResponse.json({
      success: true,
      likesCount: likesCount || 0,
    });

  } catch (error) {
    console.error('좋아요 취소 중 예기치 않은 에러:', error);

    // 에러 로깅
    if (error instanceof Error) {
      console.error('에러 상세:', {
        message: error.message,
        stack: error.stack
      });
    }

    return NextResponse.json(
      { error: '좋아요 취소 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
