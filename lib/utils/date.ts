/**
 * 날짜 관련 유틸리티 함수들
 *
 * Instagram 스타일 SNS에서 상대 시간을 표시하기 위한 함수들을 제공합니다.
 */

import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';

/**
 * 상대 시간을 포맷팅하는 함수
 *
 * @param date - Date 객체 또는 날짜 문자열
 * @returns 한국어 상대 시간 문자열 (예: "3시간 전", "2일 전", "1주 전")
 *
 * @example
 * formatRelativeTime("2024-01-15T10:30:00Z") // "3시간 전"
 * formatRelativeTime(new Date()) // "방금 전"
 */
export function formatRelativeTime(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return formatDistanceToNow(dateObj, {
    addSuffix: true,
    locale: ko
  });
}
