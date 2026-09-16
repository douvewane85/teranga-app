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
    { name: "Vue d'ensemble", href: "/member/dashboard", icon: "📊" },
    { name: "Mes Cotisations", href: "/member/campaigns", icon: "💰" },
  ];

  return (
    <div className="min-h-full flex bg-background">
      {/* Sidebar */}
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
        <div className="flex-1 flex flex-col min-h-0 bg-primary">
          <div className="flex-1 flex flex-col pt-6 pb-4 overflow-y-auto">
            <div className="flex items-center flex-shrink-0 px-6 mb-8">
              <div className="h-10 w-10 bg-white text-primary flex justify-center items-center rounded-lg font-bold text-lg shadow-sm mr-3">TM</div>
              <div>
                <h1 className="text-white text-base font-bold tracking-tight leading-tight">Teranga Alliance</h1>
                <p className="text-[#A3C5B5] text-[10px] uppercase tracking-widest font-semibold mt-0.5">Espace Membre</p>
              </div>
            </div>
            <nav className="mt-4 flex-1 px-4 space-y-6">
              <div>
                <p className="px-3 text-[11px] font-semibold text-[#8baf9f] uppercase tracking-widest mb-3">Mon Espace</p>
                <div className="space-y-1">
                  {navigation.map((item) => {
                    const isActive = pathname === item.href || (item.href !== "/member/dashboard" && pathname.startsWith(item.href));
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        className={`${
                          isActive
                            ? "bg-white/10 text-white font-semibold"
                            : "text-[#A3C5B5] hover:bg-white/5 hover:text-white font-normal"
                        } group flex items-center px-3 py-2.5 text-sm rounded-lg transition-all duration-200`}
                      >
                        {/* We use a generic folder/document SVG here instead of the emoji */}
                        <svg className={`mr-3 h-5 w-5 ${isActive ? "text-white" : "text-[#8baf9f] group-hover:text-white"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        {item.name}
                      </Link>
                    );
                  })}
                </div>
              </div>
            </nav>
          </div>
          <div className="flex-shrink-0 flex p-4 mb-2">
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="flex-shrink-0 w-full group flex items-center justify-between text-[#A3C5B5] hover:text-white transition-colors text-sm font-normal text-left px-4 py-3 rounded-xl hover:bg-white/5 border border-white/5 shadow-sm"
            >
              <div className="flex items-center">
                <div className="h-8 w-8 rounded-full bg-white/10 flex items-center justify-center mr-3">
                  <svg className="h-4 w-4 text-[#8baf9f] group-hover:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                </div>
                <span>Déconnexion</span>
              </div>
              <svg className="h-4 w-4 opacity-40 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="md:pl-64 flex flex-col flex-1">
        <main className="flex-1">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
