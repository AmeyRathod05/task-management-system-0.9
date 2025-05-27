'use client';

import { useSidebar } from "@/context/SidebarContext";
import Backdrop from "@/layout/Backdrop";
import AppHeader from "@/layout/User/AppHeader";
import AppSidebar from "@/layout/User/AppSidebar";

export default function Userlayout({
  children,
}: {
  children: React.ReactNode;
}) {
    const { isExpanded, isHovered, isMobileOpen, isTopNavbar } = useSidebar();
    
      // Dynamic class for main content margin based on sidebar state
      const mainContentMargin = isTopNavbar
        ? "ml-0 mt-[60px]" // Top navbar layout - add top margin
        : isMobileOpen
          ? "ml-0"
          : isExpanded || isHovered
          ? "lg:ml-[290px]"
          : "lg:ml-[90px]";
    
    return (
        <div className="min-h-screen xl:flex">
            {!isTopNavbar && <AppSidebar />}
            <Backdrop />
            <div className={`flex-1 transition-all duration-300 ease-in-out ${mainContentMargin}`}>
            <AppHeader />
            <div className="p-4 mx-auto max-w-(--breakpoint-2xl) md:p-6">{children}</div>
        </div>
        </div>
    );
};
