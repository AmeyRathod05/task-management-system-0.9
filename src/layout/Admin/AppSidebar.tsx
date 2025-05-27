"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSidebar } from "../../context/SidebarContext";
import { UserCircleIcon } from "../../icons/index";
import { HomeIcon } from "@/components/ui/breadcrumb/Breadcrumb";

const navItems = [
  {
    icon: <HomeIcon />,
    name: "Home",
    path: "/admin",
  },
  {
    icon: <UserCircleIcon />,
    name: "Client",
    path: "/admin/client",
  },
];

const AppSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const pathname = usePathname();

  return (
    <aside
      className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 left-0 bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900 h-full transition-all duration-300 ease-in-out z-50 border-r border-gray-200 
        ${
          isExpanded || isMobileOpen
            ? "w-[290px]"
            : isHovered
            ? "w-[290px]"
            : "w-[90px]"
        }
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`py-8 flex  ${
          !isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
        }`}
      >
        <Link href="/admin" className="text-lg font-bold">
          {isExpanded || isHovered || isMobileOpen ? (
            <>Admin Panel</>
          ) : (
            <>A</>
          )}
        </Link>
      </div>
      <div className="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar">
        <nav className="mb-6">
          <ul className="flex flex-col gap-4">
            {navItems.map((nav) => (
              <li key={nav.name}>
                <Link
                  href={nav.path}
                  className={`menu-item group ${
                    pathname === nav.path ? "menu-item-active" : "menu-item-inactive"
                  } cursor-pointer ${
                    !isExpanded && !isHovered ? "lg:justify-center" : "lg:justify-start"
                  }`}
                >
                  <span className="menu-item-icon">{nav.icon}</span>
                  {(isExpanded || isHovered || isMobileOpen) && (
                    <span className="menu-item-text">{nav.name}</span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </aside>
  );
};

export default AppSidebar;
