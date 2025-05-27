"use client";
import React, { useEffect, useRef, useCallback, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSidebar } from "../context/SidebarContext";
import {
  BoxCubeIcon,
  CalenderIcon,
  ChatIcon,
  ChevronDownIcon,
  DocsIcon,
  GridIcon,
  HorizontaLDots,
  ListIcon,
  MailIcon,
  PageIcon,
  PieChartIcon,
  PlugInIcon,
  TableIcon,
  TaskIcon,
  UserCircleIcon,
} from "../icons/index";
import SidebarWidget from "./SidebarWidget";

type NavItem = {
  name: string;
  icon: React.ReactNode;
  path?: string;
  subItems?: { name: string; path: string; pro?: boolean; new?: boolean }[];
};

const navItems: NavItem[] = [
  {
    icon: <GridIcon />,
    name: "Dashboard",
    subItems: [
      { name: "Ecommerce", path: "/", pro: false },
      { name: "Analytics", path: "/analytics", pro: true },
      { name: "Marketing", path: "/marketing", pro: true },
      { name: "CRM", path: "/crm", pro: true },
      { name: "Stocks", path: "/stocks", new: true, pro: true },
      { name: "SaaS", path: "/saas", new: true, pro: true },
    ],
  },
  {
    icon: <CalenderIcon />,
    name: "Calendar",
    path: "/calendar",
  },
  {
    icon: <UserCircleIcon />,
    name: "User Profile",
    path: "/profile",
  },
  {
    name: "Task",
    icon: <TaskIcon />,
    subItems: [
      { name: "List", path: "/task-list", pro: true },
      { name: "Kanban", path: "/task-kanban", pro: true },
    ],
  },
  {
    name: "Forms",
    icon: <ListIcon />,
    subItems: [
      { name: "Form Elements", path: "/form-elements", pro: false },
      { name: "Form Layout", path: "/form-layout", pro: true },
    ],
  },
  {
    name: "Tables",
    icon: <TableIcon />,
    subItems: [
      { name: "Basic Tables", path: "/basic-tables", pro: false },
      { name: "Data Tables", path: "/data-tables", pro: true },
    ],
  },
  {
    name: "Pages",
    icon: <PageIcon />,
    subItems: [
      { name: "File Manager", path: "/file-manager", pro: true },
      { name: "Pricing Tables", path: "/pricing-tables", pro: true },
      { name: "Faqs", path: "/faq", pro: true },
      { name: "Blank Page", path: "/blank", pro: true },
      { name: "404 Error", path: "/error-404", pro: true },
      { name: "500 Error", path: "/error-500", pro: true },
      { name: "503 Error", path: "/error-503", pro: true },
      { name: "Coming Soon", path: "/coming-soon", pro: true },
      { name: "Maintenance", path: "/maintenance", pro: true },
      { name: "Success", path: "/success", pro: true },
    ],
  },
];

const othersItems: NavItem[] = [
  {
    icon: <PieChartIcon />,
    name: "Charts",
    subItems: [
      { name: "Line Chart", path: "/line-chart", pro: true },
      { name: "Bar Chart", path: "/bar-chart", pro: true },
      { name: "Pie Chart", path: "/pie-chart", pro: true },
    ],
  },
  {
    icon: <BoxCubeIcon />,
    name: "UI Elements",
    subItems: [
      { name: "Alerts", path: "/alerts", pro: true },
      { name: "Avatar", path: "/avatars", pro: true },
      { name: "Badge", path: "/badge", pro: true },
      { name: "Breadcrumb", path: "/breadcrumb", pro: true },
      { name: "Buttons", path: "/buttons", pro: true },
      { name: "Buttons Group", path: "/buttons-group", pro: true },
      { name: "Cards", path: "/cards", pro: true },
      { name: "Carousel", path: "/carousel", pro: true },
      { name: "Dropdowns", path: "/dropdowns", pro: true },
      { name: "Images", path: "/images", pro: true },
      { name: "Links", path: "/links", pro: true },
      { name: "List", path: "/list", pro: true },
      { name: "Modals", path: "/modals", pro: true },
      { name: "Notification", path: "/notifications", pro: true },
      { name: "Pagination", path: "/pagination", pro: true },
      { name: "Popovers", path: "/popovers", pro: true },
      { name: "Progressbar", path: "/progress-bar", pro: true },
      { name: "Ribbons", path: "/ribbons", pro: true },
      { name: "Spinners", path: "/spinners", pro: true },
      { name: "Tabs", path: "/tabs", pro: true },
      { name: "Tooltips", path: "/tooltips", pro: true },
      { name: "Videos", path: "/videos", pro: true },
    ],
  },
  {
    icon: <PlugInIcon />,
    name: "Authentication",
    subItems: [
      { name: "Sign In", path: "/signin", pro: false },
      { name: "Sign Up", path: "/signup", pro: false },
      { name: "Reset Password", path: "/reset-password", pro: true },
      {
        name: "Two Step Verification",
        path: "/two-step-verification",
        pro: true,
      },
    ],
  },
];

const supportItems: NavItem[] = [
  {
    icon: <ChatIcon />,
    name: "Chat",
    path: "/chat",
  },
  {
    icon: <MailIcon />,
    name: "Email",
    subItems: [
      { name: "Inbox", path: "/inbox" },
      { name: "Details", path: "/inbox-details" },
    ],
  },
  {
    icon: <DocsIcon />,
    name: "Invoice",
    path: "/invoice",
  },
];

const AppSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const pathname = usePathname();

  const renderMenuItems = (
    navItems: NavItem[],
    menuType: "main" | "support" | "others"
  ) => (
    <ul className="flex flex-col gap-1 px-2">
      {navItems.map((nav, index) => (
        <li key={nav.name}>
          {nav.subItems ? (
            <button
              onClick={() => handleSubmenuToggle(index, menuType)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-200 ${
                openSubmenu?.type === menuType && openSubmenu?.index === index
                  ? "bg-blue-600 text-white"
                  : "text-gray-200 hover:bg-gray-900 hover:text-white"
              }`}
            >
              <span
                className={`flex-shrink-0 flex items-center justify-center w-6 h-6 ${
                  openSubmenu?.type === menuType && openSubmenu?.index === index
                    ? "text-white"
                    : "text-gray-400 group-hover:text-white"
                }`}
              >
                {nav.icon}
              </span>
              {(isExpanded || isHovered || isMobileOpen) && (
                <span className="flex-1 text-left">{nav.name}</span>
              )}
              {(isExpanded || isHovered || isMobileOpen) && (
                <ChevronDownIcon
                  className={`w-4 h-4 transition-transform duration-200 ${
                    openSubmenu?.type === menuType &&
                    openSubmenu?.index === index
                      ? "rotate-180 text-white"
                      : "text-gray-500 group-hover:text-white"
                  }`}
                />
              )}
            </button>
          ) : (
            nav.path && (
              <Link
                href={nav.path}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-200 ${
                  isActive(nav.path)
                    ? "bg-blue-600 text-white"
                    : "text-gray-200 hover:bg-gray-900 hover:text-white"
                }`}
              >
                <span
                  className={`flex-shrink-0 flex items-center justify-center w-6 h-6 ${
                    isActive(nav.path) 
                      ? "text-white" 
                      : "text-gray-400 group-hover:text-white"
                  }`}
                >
                  {nav.icon}
                </span>
                {(isExpanded || isHovered || isMobileOpen) && (
                  <span className="flex-1">{nav.name}</span>
                )}
              </Link>
            )
          )}
          {nav.subItems && (isExpanded || isHovered || isMobileOpen) && (
            <div
              ref={(el) => {
                subMenuRefs.current[`${menuType}-${index}`] = el;
              }}
              className="overflow-hidden transition-all duration-300 ml-9 mt-1"
              style={{
                height:
                  openSubmenu?.type === menuType && openSubmenu?.index === index
                    ? `${subMenuHeight[`${menuType}-${index}`]}px`
                    : "0px",
              }}
            >
              <ul className="space-y-1 py-1">
                {nav.subItems.map((subItem) => (
                  <li key={subItem.name}>
                    <Link
                      href={subItem.path}
                      className={`flex items-center px-3 py-2 text-sm rounded-md transition-colors duration-200 ${
                        isActive(subItem.path)
                          ? "bg-blue-600/20 text-blue-400 font-medium"
                          : "text-gray-400 hover:bg-gray-900 hover:text-gray-200"
                      }`}
                    >
                      <span className="truncate">{subItem.name}</span>
                      <span className="flex items-center gap-1 ml-auto">
                        {subItem.new && (
                          <span
                            className={`text-[10px] px-1.5 py-0.5 rounded ${
                              isActive(subItem.path)
                                ? "bg-blue-500 text-white"
                                : "bg-blue-500/20 text-blue-400"
                            }`}
                          >
                            new
                          </span>
                        )}
                        {subItem.pro && (
                          <span
                            className={`text-[10px] px-1.5 py-0.5 rounded ${
                              isActive(subItem.path)
                                ? "bg-purple-500 text-white"
                                : "bg-purple-500/20 text-purple-400"
                            }`}
                          >
                            pro
                          </span>
                        )}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </li>
      ))}
    </ul>
  );

  const [openSubmenu, setOpenSubmenu] = useState<{
    type: "main" | "support" | "others";
    index: number;
  } | null>(null);
  const [subMenuHeight, setSubMenuHeight] = useState<Record<string, number>>(
    {}
  );
  const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // const isActive = (path: string) => path === pathname;

  const isActive = useCallback((path: string) => path === pathname, [pathname]);

  useEffect(() => {
    // Check if the current path matches any submenu item
    let submenuMatched = false;
    ["main", "support", "others"].forEach((menuType) => {
      const items =
        menuType === "main"
          ? navItems
          : menuType === "support"
          ? supportItems
          : othersItems;
      items.forEach((nav, index) => {
        if (nav.subItems) {
          nav.subItems.forEach((subItem) => {
            if (isActive(subItem.path)) {
              setOpenSubmenu({
                type: menuType as "main" | "support" | "others",
                index,
              });
              submenuMatched = true;
            }
          });
        }
      });
    });

    // If no submenu item matches, close the open submenu
    if (!submenuMatched) {
      setOpenSubmenu(null);
    }
  }, [pathname, isActive]);

  useEffect(() => {
    // Set the height of the submenu items when the submenu is opened
    if (openSubmenu !== null) {
      const key = `${openSubmenu.type}-${openSubmenu.index}`;
      if (subMenuRefs.current[key]) {
        setSubMenuHeight((prevHeights) => ({
          ...prevHeights,
          [key]: subMenuRefs.current[key]?.scrollHeight || 0,
        }));
      }
    }
  }, [openSubmenu]);

  const handleSubmenuToggle = (
    index: number,
    menuType: "main" | "support" | "others"
  ) => {
    setOpenSubmenu((prevOpenSubmenu) => {
      if (
        prevOpenSubmenu &&
        prevOpenSubmenu.type === menuType &&
        prevOpenSubmenu.index === index
      ) {
        return null;
      }
      return { type: menuType, index };
    });
  };

  return (
    <aside
      className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-4 left-0 bg-black text-white h-full transition-all duration-300 ease-in-out z-50 border-r border-gray-800 
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
        className={`py-6 flex ${
          !isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
        }`}
      >
        <Link href="/" className="hover:opacity-80 transition-opacity">
          {isExpanded || isHovered || isMobileOpen ? (
            <>
              <Image
                className="dark:hidden"
                src="/images/logo/logo.svg"
                alt="Logo"
                width={150}
                height={40}
              />
              <Image
                className="hidden dark:block"
                src="/images/logo/logo-dark.svg"
                alt="Logo"
                width={150}
                height={40}
              />
            </>
          ) : (
            <Image
              src="/images/logo/logo-icon.svg"
              alt="Logo"
              width={32}
              height={32}
            />
          )}
        </Link>
      </div>
      <div className="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar">
        <nav className="mb-6">
          <div className="flex flex-col gap-1">
            <div>
              <h2
                className={`mb-3 text-xs uppercase flex leading-[20px] text-gray-400 font-semibold tracking-wider ${
                  !isExpanded && !isHovered
                    ? "lg:justify-center"
                    : "justify-start px-3"
                }`}
              >
                {isExpanded || isHovered || isMobileOpen ? (
                  "Menu"
                ) : (
                  <HorizontaLDots className="text-gray-400" />
                )}
              </h2>
              {renderMenuItems(navItems, "main")}
            </div>
            <div>
              <h2
                className={`mb-3 text-xs uppercase flex leading-[20px] text-gray-400 font-semibold tracking-wider ${
                  !isExpanded && !isHovered
                    ? "lg:justify-center"
                    : "justify-start px-3"
                }`}
              >
                {isExpanded || isHovered || isMobileOpen ? (
                  "Support"
                ) : (
                  <HorizontaLDots className="text-gray-400" />
                )}
              </h2>
              {renderMenuItems(supportItems, "support")}
            </div>
            <div>
              <h2
                className={`mb-3 text-xs uppercase flex leading-[20px] text-gray-400 font-semibold tracking-wider ${
                  !isExpanded && !isHovered
                    ? "lg:justify-center"
                    : "justify-start px-3"
                }`}
              >
                {isExpanded || isHovered || isMobileOpen ? (
                  "Others"
                ) : (
                  <HorizontaLDots className="text-gray-400" />
                )}
              </h2>
              {renderMenuItems(othersItems, "others")}
            </div>
          </div>
        </nav>
        {isExpanded || isHovered || isMobileOpen ? <SidebarWidget /> : null}
      </div>
    </aside>
  );
};

export default AppSidebar;
