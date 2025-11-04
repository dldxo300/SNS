"use client";

import { useAuth } from "@clerk/nextjs";
import { UserButton, SignInButton } from "@clerk/nextjs";
import Link from "next/link";
import { Bell, MessageCircle } from "lucide-react";

export default function MobileHeader() {
  const { userId, isLoaded } = useAuth();

  return (
    <div className="h-16 bg-white border-b border-gray-200 px-4 flex items-center justify-between">
      {/* 좌측: Instagram 로고 */}
      <Link href="/" className="flex items-center gap-2">
        <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
          <span className="text-white font-bold text-sm">IG</span>
        </div>
        <span className="text-xl font-bold">Instagram</span>
      </Link>

      {/* 우측: 아이콘들 */}
      <div className="flex items-center gap-4">
        {/* 알림 (1차 제외 - placeholder) */}
        <button
          className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          disabled
        >
          <Bell className="w-6 h-6 text-gray-700" />
        </button>

        {/* 메시지 (1차 제외 - placeholder) */}
        <button
          className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          disabled
        >
          <MessageCircle className="w-6 h-6 text-gray-700" />
        </button>

        {/* 프로필/로그인 */}
        {isLoaded && userId ? (
          <div className="flex items-center gap-2">
            <UserButton
              afterSignOutUrl="/"
              appearance={{
                elements: {
                  avatarBox: "w-8 h-8",
                  userButtonPopoverCard: "shadow-lg border",
                },
              }}
            />
          </div>
        ) : (
          // 로그인하지 않은 경우 로그인 버튼 표시
          <SignInButton mode="modal">
            <button className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300 transition-colors">
              <span className="text-xs text-gray-600 font-medium">로그인</span>
            </button>
          </SignInButton>
        )}
      </div>
    </div>
  );
}
