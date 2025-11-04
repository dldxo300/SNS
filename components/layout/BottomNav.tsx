"use client";

import { useAuth } from "@clerk/nextjs";
import { usePathname } from "next/navigation";
import Link from "next/link";
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
    href: "/profile/[userId]", // 동적 라우트로 변경 예정
    icon: User,
    requiresAuth: true,
  },
];

export default function BottomNav() {
  const { userId } = useAuth();
  const pathname = usePathname();

  // 프로필 링크를 동적으로 생성
  const getProfileHref = (item: NavItem) => {
    if (item.id === "profile" && userId) {
      return `/profile/${userId}`;
    }
    return item.href;
  };

  // 네비 아이템 렌더링 (인증 필요 항목 필터링)
  const renderNavItem = (item: NavItem) => {
    const isActive = pathname === item.href || (item.id === "profile" && pathname.startsWith("/profile/"));
    const isDisabled = item.requiresAuth && !userId;
    const href = getProfileHref(item);

    return (
      <Link
        key={item.id}
        href={href}
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
          if (href === "#") {
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
    <nav className="bg-white border-t border-gray-200 px-2 py-1">
      <div className="flex items-center justify-around max-w-screen-sm mx-auto">
        {navItems.map(renderNavItem)}
      </div>
    </nav>
  );
}
