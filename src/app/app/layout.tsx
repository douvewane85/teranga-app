"use client";

import React from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { usePathname } from "next/navigation";

export default function MemberLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const navigation = [
    { name: "Accueil", href: "/app/dashboard", icon: "🏠" },
    { name: "Mon profil", href: "/app/profile", icon: "👤" },
    { name: "Cotisations", href: "/app/finances/dues", icon: "💳" },
    { name: "Événements", href: "/app/events", icon: "📅" },
  ];

  return (
    <div className="min-h-full flex flex-col md:flex-row bg-gray-50 pb-16 md:pb-0">
      {/* Sidebar Desktop */}
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 border-r border-gray-200 bg-white">
        <div className="flex-1 flex flex-col min-h-0">
          <div className="flex items-center justify-center h-16 flex-shrink-0 px-4 border-b border-gray-200">
            <h1 className="text-primary text-xl font-bold">Teranga</h1>
          </div>
          <nav className="mt-6 flex-1 px-4 space-y-2 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = pathname === item.href || (item.href !== "/app/dashboard" && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`${
                    isActive
                      ? "bg-primary/10 text-primary font-semibold"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  } group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors`}
                >
                  <span className="mr-3">{item.icon}</span>
                  {item.name}
                </Link>
              );
            })}
          </nav>
          <div className="flex-shrink-0 border-t border-gray-200 p-4">
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="w-full text-left px-3 py-2 text-sm font-medium text-gray-600 hover:text-danger transition-colors rounded-md hover:bg-red-50"
            >
              Déconnexion
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="md:pl-64 flex flex-col flex-1 w-full">
        <main className="flex-1">
          <div className="py-6">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 md:max-w-7xl md:px-8">
              {children}
            </div>
          </div>
        </main>
      </div>

      {/* Bottom Bar Mobile */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-[0_-2px_10px_rgba(0,0,0,0.05)] pb-safe">
        <nav className="flex justify-around items-center h-16 px-2">
          {navigation.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/app/dashboard" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${
                  isActive ? "text-primary" : "text-gray-500 hover:text-gray-900"
                }`}
              >
                <span className="text-xl">{item.icon}</span>
                <span className="text-[10px] font-medium leading-none">{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
