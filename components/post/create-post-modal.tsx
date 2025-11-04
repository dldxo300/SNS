/**
 * 게시물 작성 모달 컴포넌트
 *
 * Instagram 스타일의 게시물 작성 모달을 제공합니다.
 * 이미지 선택/미리보기, 캡션 입력, 파일 검증 기능을 포함합니다.
 */

"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import type { CreatePostResponse } from "@/types/post";

interface CreatePostModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * CreatePostModal 컴포넌트
 *
 * 게시물 작성 모달을 렌더링합니다.
 */
export default function CreatePostModal({ isOpen, onOpenChange }: CreatePostModalProps) {
  const { userId, isLoaded } = useAuth();
  const router = useRouter();

  // 상태 관리
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [caption, setCaption] = useState<string>('');
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // 파일 input ref
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 파일 검증 함수
  const validateFile = (file: File): string | null => {
    // 파일 크기 검증 (최대 5MB)
    const MAX_SIZE = 5 * 1024 * 1024; // 5MB
    if (file.size > MAX_SIZE) {
      const errorMsg = '파일 크기는 5MB를 초과할 수 없습니다.';
      console.error('[CreatePostModal] 파일 검증 실패:', errorMsg);
      return errorMsg;
    }

    // 파일 형식 검증
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      const errorMsg = '지원하지 않는 파일 형식입니다. (JPG, PNG, WEBP만 가능)';
      console.error('[CreatePostModal] 파일 검증 실패:', errorMsg);
      return errorMsg;
    }

    return null;
  };

  // 파일 처리 함수
  const handleFileSelect = (file: File) => {
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);
    setSelectedFile(file);

    const url = URL.createObjectURL(file);
    setPreviewUrl(url);

    console.log('[CreatePostModal] 이미지 선택됨:', file.name);
  };

  // 드래그 앤 드롭 핸들러
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
    console.log('[CreatePostModal] 드래그 앤 드롭 이벤트: drop');
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
    console.log('[CreatePostModal] 드래그 이벤트: dragOver');
  };

  const handleDragLeave = () => {
    setIsDragging(false);
    console.log('[CreatePostModal] 드래그 이벤트: dragLeave');
  };

  // 파일 선택 클릭 핸들러
  const handleFileInputClick = () => {
    fileInputRef.current?.click();
  };

  // 파일 입력 변경 핸들러
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  // 이미지 제거 핸들러
  const handleRemoveImage = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setSelectedFile(null);
    setPreviewUrl(null);
    setError(null);
    console.log('[CreatePostModal] 이미지 제거됨');
  };

  // 캡션 변경 핸들러
  const handleCaptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    // 최대 2200자 제한
    if (value.length <= 2200) {
      setCaption(value);
    }
  };

  // 게시물 업로드 핸들러
  const handleSubmit = async () => {
    if (!selectedFile) {
      setError('이미지를 선택해주세요.');
      return;
    }

    if (!userId) {
      setError('로그인이 필요합니다. 로그인 후 다시 시도해주세요.');
      // 로그인 페이지로 이동
      setTimeout(() => {
        router.push('/sign-in');
      }, 2000);
      return;
    }

    console.log('[CreatePostModal] 업로드 시작:', { fileName: selectedFile.name, fileSize: selectedFile.size });

    try {
      setIsUploading(true);
      setError(null);

      const formData = new FormData();
      formData.append('image', selectedFile);
      formData.append('caption', caption);

      console.log('[CreatePostModal] API 요청 시작');
      const response = await fetch('/api/posts', {
        method: 'POST',
        body: formData,
        // Clerk는 자동으로 쿠키를 통해 인증을 처리합니다.
        // Authorization 헤더는 필요하지 않습니다.
      });
      console.log('[CreatePostModal] API 응답:', { ok: response.ok, status: response.status });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '게시물 작성에 실패했습니다.');
      }

      const data: CreatePostResponse = await response.json();
      console.log('[CreatePostModal] 업로드 성공:', data);

      // 모달 닫기 (상태 초기화는 useEffect에서 처리)
      onOpenChange(false);

      // 피드 새로고침 (router.refresh())
      router.refresh();
    } catch (err) {
      console.error('[CreatePostModal] 업로드 실패:', err);
      setError(err instanceof Error ? err.message : '게시물 작성에 실패했습니다.');
    } finally {
      setIsUploading(false);
    }
  };

  // 모달 열기/닫기 핸들러
  const handleOpenChange = (open: boolean) => {
    if (open && !userId) {
      console.log('[CreatePostModal] 비로그인 사용자 - 모달 열기 차단');
      setError('로그인이 필요합니다. 로그인 후 게시물을 작성할 수 있습니다.');
      // 로그인 페이지로 이동
      setTimeout(() => {
        router.push('/sign-in');
      }, 2000);
      return;
    }

    // 모달이 닫힐 때는 에러 메시지 초기화
    if (!open) {
      setError(null);
    }

    onOpenChange(open);
    console.log('[CreatePostModal] 모달 상태:', open);
  };

  // 모달 닫기 시 상태 초기화
  useEffect(() => {
    if (!isOpen) {
      // 모달이 닫힐 때 상태 초기화
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      setSelectedFile(null);
      setPreviewUrl(null);
      setCaption('');
      setError(null);
      setIsDragging(false);
      setIsUploading(false);
      console.log('[CreatePostModal] 모달 닫힘 - 상태 초기화 완료');
    }
  }, [isOpen, previewUrl]);

  // 컴포넌트 언마운트 시 메모리 정리
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>새 게시물 만들기</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* 이미지 선택 영역 */}
          {!previewUrl ? (
            <div
              className={`
                relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
                ${isDragging
                  ? 'border-blue-400 bg-blue-50'
                  : 'border-gray-300 hover:border-gray-400'
                }
              `}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={handleFileInputClick}
            >
              <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                  <ImageIcon className="w-6 h-6 text-gray-400" />
                </div>
                <div>
                  <p className="text-lg font-medium text-gray-900">
                    사진을 선택하세요
                  </p>
                  <p className="text-sm text-gray-500">
                    드래그 앤 드롭 또는 클릭하여 선택
                  </p>
                </div>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                onChange={handleFileInputChange}
                className="hidden"
              />
            </div>
          ) : (
            // 이미지 미리보기
            <div className="relative">
              <div className="aspect-square relative rounded-lg overflow-hidden bg-gray-100">
                <Image
                  src={previewUrl}
                  alt="게시물 이미지 미리보기"
                  fill
                  className="object-cover"
                />
              </div>

              {/* 이미지 제거 버튼 */}
              <Button
                variant="secondary"
                size="icon"
                className="absolute top-2 right-2 rounded-full"
                onClick={handleRemoveImage}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          )}

          {/* 에러 메시지 */}
          {error && (
            <div className="text-red-500 text-sm text-center bg-red-50 p-2 rounded">
              {error}
            </div>
          )}

          {/* 캡션 입력 */}
          <div className="space-y-2">
            <Textarea
              placeholder="문구 입력..."
              value={caption}
              onChange={handleCaptionChange}
              rows={4}
              className="resize-none"
            />
            <div className="text-right text-sm text-gray-500">
              {caption.length} / 2,200
            </div>
          </div>

          {/* 공유하기 버튼 */}
          <Button
            className="w-full"
            disabled={!selectedFile || isUploading}
            onClick={handleSubmit}
          >
            {isUploading ? (
              "업로드 중..."
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                공유하기
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
