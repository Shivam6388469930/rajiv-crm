// app/admin/layout.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { clearToken, getCurrentUser } from "@/app/services/auth.service";
import {
  HomeIcon,
  UsersIcon,
  CalendarIcon,
  ShoppingBagIcon,
  EyeIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  ArrowLeftOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
  UserCircleIcon,
  BellIcon,
  MagnifyingGlassIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChatBubbleLeftRightIcon,
  ArrowTopRightOnSquareIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";

interface NavItem {
  name: string;
  href: string;
  icon: React.ForwardRefExoticComponent<any>;
}

const navigation: NavItem[] = [
  { name: "Dashboard", href: "/client", icon: HomeIcon },
  { name: "Categories", href: "/client/categories", icon: UsersIcon },
   { name: "Add Brands", href: "/client/brand", icon: UsersIcon },
     { name: "Add Frame Shape", href: "/client/frame-shapes", icon: UsersIcon },
       { name: "Add lens Indics", href: "/client/lens-indices", icon: UsersIcon },
        { name: "Add lens Type", href: "/client/lens-types", icon: UsersIcon },
         { name: "Add Box Materials", href: "/client/box-materials", icon: UsersIcon },

         { name: "Add Box Print Type", href: "/client/box-prints", icon: UsersIcon },
          { name: "Suppliers", href: "/client/suppliers", icon: UsersIcon },
  { name: "Products", href: "/client/products", icon: CalendarIcon },
  { name: "Customers", href: "/client/customers", icon: ShoppingBagIcon },
  { name: "Invoice", href: "/client/invoice", icon: EyeIcon },
  { name: "Customer Chats", href: "/client/chat", icon: ChatBubbleLeftRightIcon },
  { name: "Stock Shortage", href: "/client/stock-shortage", icon: ExclamationTriangleIcon },
  { name: "Customer Storefront", href: "/customer", icon: ArrowTopRightOnSquareIcon },
  { name: "Orders", href: "/client/orders", icon: ChartBarIcon },
  { name: "Settings", href: "/client/settings", icon: Cog6ToothIcon },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    const user = getCurrentUser();
    if (user) setCurrentUser(user);
  }, []);

  const handleLogout = () => {
    clearToken();
    router.push("/login");
  };

  // Load collapsed state from localStorage
  useEffect(() => {
    const savedState = localStorage.getItem("sidebarCollapsed");
    if (savedState !== null) {
      setIsCollapsed(JSON.parse(savedState));
    }
  }, []);

  // Save collapsed state
  const toggleCollapse = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    localStorage.setItem("sidebarCollapsed", JSON.stringify(newState));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 bg-white border-r border-gray-200 transform transition-all duration-300 ease-in-out ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 ${
          isCollapsed ? "lg:w-20" : "lg:w-72"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className={`flex items-center h-16 px-4 border-b border-gray-200 ${
            isCollapsed ? "justify-center" : "justify-between"
          }`}>
            {!isCollapsed ? (
              <>
                <div className="flex items-center gap-2">
                  <div className="bg-indigo-600 p-1.5 rounded-lg flex-shrink-0">
                    <EyeIcon className="h-6 w-6 text-white" />
                  </div>
                  <span className="text-xl font-bold text-gray-800 tracking-tight whitespace-nowrap">
                    Optic<span className="text-indigo-600">CRM</span>
                  </span>
                </div>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
                >
                  <XMarkIcon className="h-5 w-5 text-gray-600" />
                </button>
              </>
            ) : (
              <div className="bg-indigo-600 p-2 rounded-lg">
                <EyeIcon className="h-6 w-6 text-white" />
              </div>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-6 overflow-y-auto">
            <div className="space-y-1">
              {navigation.map((item) => {
                const isActive = pathname === item.href || 
                  (item.href !== "/admin" && pathname?.startsWith(item.href));
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`
                      flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                      ${isCollapsed ? "justify-center" : ""}
                      ${
                        isActive
                          ? "bg-indigo-50 text-indigo-700"
                          : "text-gray-700 hover:bg-gray-100"
                      }
                    `}
                    title={isCollapsed ? item.name : ""}
                  >
                    <item.icon
                      className={`h-5 w-5 flex-shrink-0 ${
                        isActive ? "text-indigo-600" : "text-gray-400"
                      }`}
                    />
                    {!isCollapsed && <span>{item.name}</span>}
                  </Link>
                );
              })}
            </div>

            {/* Bottom section */}
            <div className={`pt-6 mt-6 border-t border-gray-200 ${
              isCollapsed ? "flex flex-col items-center" : ""
            }`}>
              <Link
                href="/admin/profile"
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors ${
                  isCollapsed ? "justify-center" : ""
                }`}
                title={isCollapsed ? "Profile" : ""}
              >
                <UserCircleIcon className="h-5 w-5 flex-shrink-0 text-gray-400" />
                {!isCollapsed && <span>Profile</span>}
              </Link>
              <button
                onClick={handleLogout}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors ${
                  isCollapsed ? "justify-center" : ""
                }`}
                title={isCollapsed ? "Logout" : ""}
              >
                <ArrowLeftOnRectangleIcon className="h-5 w-5 flex-shrink-0" />
                {!isCollapsed && <span>Logout</span>}
              </button>
            </div>
          </nav>

          {/* Sidebar Footer */}
          {!isCollapsed && (
            <div className="px-4 py-4 border-t border-gray-200">
              <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-gray-50">
                <div className="h-9 w-9 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-semibold text-indigo-700 uppercase">
                    {currentUser?.name ? currentUser.name.slice(0, 2) : "SA"}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">
                    {currentUser?.name || "Super Admin"}
                  </p>
                  <p className="text-xs text-gray-500 truncate capitalize">
                    {currentUser?.email || "admin@gmail.com"}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Collapse Toggle Button - Desktop only */}
          <button
            onClick={toggleCollapse}
            className="hidden lg:flex items-center justify-center h-12 border-t border-gray-200 hover:bg-gray-50 transition-colors w-full"
          >
            {isCollapsed ? (
              <ChevronRightIcon className="h-5 w-5 text-gray-500" />
            ) : (
              <ChevronLeftIcon className="h-5 w-5 text-gray-500" />
            )}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className={`flex-1 transition-all duration-300 ${
        isCollapsed ? "lg:ml-20" : "lg:ml-72"
      }`}>
        {/* Top Navigation Bar */}
        <header className="sticky top-0 z-30 bg-white border-b border-gray-200 h-16">
          <div className="flex items-center justify-between h-full px-4 sm:px-6">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
              >
                <Bars3Icon className="h-5 w-5 text-gray-600" />
              </button>
              <h1 className="text-lg font-semibold text-gray-800 hidden sm:block">
                {navigation.find(item => item.href === pathname)?.name || "Dashboard"}
              </h1>
            </div>

            <div className="flex items-center gap-3">
              {/* Search */}
              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-lg border border-gray-200">
                <MagnifyingGlassIcon className="h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="bg-transparent border-none outline-none text-sm text-gray-700 w-40 focus:w-56 transition-all duration-200"
                />
              </div>

              {/* Notifications */}
              <button className="relative p-2 rounded-lg hover:bg-gray-100 transition">
                <BellIcon className="h-5 w-5 text-gray-600" />
                <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full ring-2 ring-white"></span>
              </button>

              {/* User dropdown */}
              <div className="hidden sm:flex items-center gap-3 pl-3 border-l border-gray-200">
                <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center">
                  <span className="text-sm font-semibold text-indigo-700">JD</span>
                </div>
                <div className="hidden lg:block text-left">
                  <p className="text-sm font-medium text-gray-800">John Doe</p>
                  <p className="text-xs text-gray-500">Admin</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}