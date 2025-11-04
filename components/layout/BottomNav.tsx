"use client";

import { useState } from "react";
import { useAuth, SignOutButton } from "@clerk/nextjs";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import CreatePostModal from "@/components/post/create-post-modal";
import { Button } from "@/components/ui/button";
import {
  Home,
  Search,
  Plus,
  Heart,
  User,
  type LucideIcon
} from "lucide-react";

interface NavItem {
  id: string;
  label: string;
  href: string;
  icon: LucideIcon;
  requiresAuth?: boolean;
}

const navItems: NavItem[] = [
  {
    id: "home",
    label: "홈",
    href: "/",
    icon: Home,
  },
  {
    id: "search",
    label: "검색",
    href: "#", // 1차 제외 - placeholder
    icon: Search,
  },
  {
    id: "create",
    label: "만들기",
    href: "#", // 2-1에서 구현 예정 - placeholder
    icon: Plus,
  },
  {
    id: "activity",
    label: "활동",
    href: "#", // 1차 제외 - placeholder
    icon: Heart,
  },
  {
    id: "profile",
    label: "프로필",
    href: "#", // 프로필 페이지는 아직 구현되지 않음 (3-1에서 구현 예정)
    icon: User,
    requiresAuth: true,
  },
];

export default function BottomNav() {
  const { userId } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  // 모달 상태 관리
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // 네비 아이템 렌더링 (인증 필요 항목 필터링)
  const renderNavItem = (item: NavItem) => {
    const isActive = pathname === item.href || (item.id === "profile" && pathname.startsWith("/profile/"));
    const isDisabled = item.requiresAuth && !userId;

    // 만들기 항목은 모달 열기로 처리
    if (item.id === "create") {
      return (
        <button
          key={item.id}
          onClick={() => setIsCreateModalOpen(true)}
          className={`
            flex-1 flex flex-col items-center justify-center py-2 px-1 min-h-[44px]
            transition-colors relative
            ${isActive
              ? "text-black"
              : "text-gray-500 hover:text-gray-700"
            }
          `}
        >
          <item.icon
            className={`w-6 h-6 mb-1 ${
              isActive ? "fill-current" : ""
            }`}
          />
          <span className="text-xs font-medium">
            {item.label}
          </span>

          {/* Active 인디케이터 */}
          {isActive && (
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-8 h-0.5 bg-black rounded-full" />
          )}
        </button>
      );
    }

    // 프로필 항목 - 로그인 상태에 따라 다르게 표시
    if (item.id === "profile") {
      if (userId) {
        // 로그인된 경우 - 로그아웃 버튼
        return (
          <SignOutButton key={item.id}>
            <button
              className={`
                flex-1 flex flex-col items-center justify-center py-2 px-1 min-h-[44px]
                transition-colors relative text-gray-500 hover:text-gray-700
              `}
            >
              <item.icon className="w-6 h-6 mb-1" />
              <span className="text-xs font-medium">
                로그아웃
              </span>
            </button>
          </SignOutButton>
        );
      } else {
        // 로그인하지 않은 경우 - 로그인 버튼
        return (
          <button
            key={item.id}
            onClick={() => {
              // 로그인 모달 열기 (SignInButton을 사용하기 위해 별도 컴포넌트에서 처리)
              alert("로그인이 필요합니다.");
            }}
            className={`
              flex-1 flex flex-col items-center justify-center py-2 px-1 min-h-[44px]
              transition-colors relative text-gray-500 hover:text-gray-700
            `}
          >
            <item.icon className="w-6 h-6 mb-1" />
            <span className="text-xs font-medium">
              로그인
            </span>
          </button>
        );
      }
    }

    return (
      <Link
        key={item.id}
        href={item.href}
        className={`
          flex-1 flex flex-col items-center justify-center py-2 px-1 min-h-[44px]
          transition-colors relative
          ${isActive
            ? "text-black"
            : "text-gray-500 hover:text-gray-700"
          }
          ${isDisabled ? "pointer-events-none opacity-50" : ""}
        `}
        onClick={(e) => {
          if (isDisabled) {
            e.preventDefault();
          }
          // placeholder 링크들은 클릭 방지
          if (item.href === "#") {
            e.preventDefault();
          }
        }}
      >
        <item.icon
          className={`w-6 h-6 mb-1 ${
            isActive ? "fill-current" : ""
          }`}
        />
        <span className="text-xs font-medium">
          {item.label}
        </span>

        {/* Active 인디케이터 */}
        {isActive && (
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-8 h-0.5 bg-black rounded-full" />
        )}
      </Link>
    );
  };

  return (
    <>
      <nav className="bg-white border-t border-gray-200 px-2 py-1">
        <div className="flex items-center justify-around max-w-screen-sm mx-auto">
          {navItems.map(renderNavItem)}
        </div>
      </nav>

      {/* 게시물 작성 모달 */}
      <CreatePostModal
        isOpen={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
      />
    </>
  );
}
