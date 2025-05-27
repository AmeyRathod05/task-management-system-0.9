"use client";
import React from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useSidebar } from "@/context/SidebarContext";
import Backdrop from "@/layout/Backdrop";
import AppHeader from "@/layout/Admin/AppHeader";
import AppSidebar from "@/layout/Admin/AppSidebar";
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { NotificationProvider } from '@/context/NotificationContext';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { isExpanded, isHovered, isMobileOpen } = useSidebar();
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  // if (isLoading) {
  //   return (
  //     <div className="flex items-center justify-center min-h-screen">
  //       <LoadingSpinner size="lg" />
  //     </div>
  //   );
  // }

  // if (!isAuthenticated) {
  //   router.push('/login');
  //   return null;
  // }

  // Dynamic class for main content margin based on sidebar state
  const mainContentMargin = isMobileOpen
    ? "ml-0"
    : isExpanded || isHovered
    ? "lg:ml-[290px]"
    : "lg:ml-[90px]";

  return (
    <NotificationProvider>
      <div className="min-h-screen xl:flex">
        <AppSidebar />
        <Backdrop />
        <div className={`flex-1 transition-all duration-300 ease-in-out ${mainContentMargin}`}>
          <AppHeader />
          <div className="p-4 mx-auto max-w-(--breakpoint-2xl) md:p-6">{children}</div>
        </div>
      </div>
    </NotificationProvider>
  );
}
