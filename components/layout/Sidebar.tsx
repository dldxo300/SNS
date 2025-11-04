"use client";

import { useAuth } from "@clerk/nextjs";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Home,
  Search,
  Plus,
  User,
  type LucideIcon
} from "lucide-react";

interface MenuItem {
  id: string;
  label: string;
  href: string;
  icon: LucideIcon;
  requiresAuth?: boolean;
}

const menuItems: MenuItem[] = [
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
    id: "profile",
    label: "프로필",
    href: "#", // 프로필 페이지는 아직 구현되지 않음 (3-1에서 구현 예정)
    icon: User,
    requiresAuth: true,
  },
];

export default function Sidebar() {
  const { userId, isLoaded } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  // 메뉴 아이템 렌더링 (인증 필요 항목 필터링)
  const renderMenuItem = (item: MenuItem) => {
    const isActive = pathname === item.href || (item.id === "profile" && pathname.startsWith("/profile/"));
    const isDisabled = item.requiresAuth && !userId;

    // 프로필 항목은 아직 구현되지 않았으므로 button으로 처리
    if (item.id === "profile") {
      return (
        <button
          key={item.id}
          onClick={() => {
            if (userId) {
              // 프로필 페이지가 아직 구현되지 않았으므로 임시로 alert 표시
              alert("프로필 페이지는 아직 개발 중입니다. (3-1. 프로필 페이지 구현 예정)");
              // 추후 구현 시: router.push(`/profile/${userId}`);
            }
          }}
          disabled={isDisabled}
          className={`
            w-full group flex items-center gap-4 px-4 py-3 rounded-lg transition-colors text-left
            ${isActive
              ? "bg-gray-100 font-semibold"
              : "hover:bg-gray-50"
            }
            ${isDisabled ? "pointer-events-none opacity-50" : ""}
          `}
        >
          <item.icon
            className={`w-6 h-6 flex-shrink-0 ${
              isActive ? "text-black" : "text-gray-700 group-hover:text-black"
            }`}
          />
          {/* Desktop에서만 텍스트 표시 (lg: 이상) */}
          <span className="hidden lg:block text-sm">
            {item.label}
          </span>
        </button>
      );
    }

    return (
      <Link
        key={item.id}
        href={item.href}
        className={`
          group flex items-center gap-4 px-4 py-3 rounded-lg transition-colors
          ${isActive
            ? "bg-gray-100 font-semibold"
            : "hover:bg-gray-50"
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
          className={`w-6 h-6 flex-shrink-0 ${
            isActive ? "text-black" : "text-gray-700 group-hover:text-black"
          }`}
        />
        {/* Desktop에서만 텍스트 표시 (lg: 이상) */}
        <span className="hidden lg:block text-sm">
          {item.label}
        </span>
      </Link>
    );
  };

  return (
    <div className="h-full bg-white border-r border-gray-200 py-8">
      {/* 로고 */}
      <div className="px-4 mb-8">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">IG</span>
          </div>
          {/* Desktop에서만 로고 텍스트 표시 */}
          <span className="hidden lg:block text-xl font-bold">
            Instagram
          </span>
        </Link>
      </div>

      {/* 메뉴 */}
      <nav className="space-y-1">
        {menuItems.map(renderMenuItem)}
      </nav>

      {/* 로딩 상태 */}
      {!isLoaded && (
        <div className="px-4 mt-8 space-y-3">
          <div className="h-12 bg-gray-100 rounded-lg animate-pulse" />
          <div className="h-12 bg-gray-100 rounded-lg animate-pulse" />
          <div className="h-12 bg-gray-100 rounded-lg animate-pulse" />
          <div className="h-12 bg-gray-100 rounded-lg animate-pulse" />
        </div>
      )}
    </div>
  );
}
