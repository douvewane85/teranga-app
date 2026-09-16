"use client";

import React, { useState } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { usePathname } from "next/navigation";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigation = [
    { name: "Dashboard", href: "/admin/dashboard", icon: "📊" },
    { name: "Membres", href: "/admin/members", icon: "👥" },
    { name: "Adhésions", href: "/admin/memberships", icon: "📝" },
    { name: "Cotisations", href: "/admin/finances/campaigns", icon: "💰" },
    { name: "Paiements", href: "/admin/finances/history", icon: "🧾" },
    { name: "Impayés", href: "/admin/finances/debts", icon: "⚠️" },
    { name: "Validations", href: "/admin/finances/validations", icon: "✅" },
    { name: "Notifications", href: "/admin/communications/alerts", icon: "🔔" },
    { name: "Communications", href: "/admin/communications", icon: "📢" },
    { name: "Événements", href: "/admin/events", icon: "📅" },
    { name: "Rapports", href: "/admin/reports", icon: "📈" },
    { name: "Réclamations", href: "/admin/support", icon: "🎫" },
    { name: "Paramètres", href: "/admin/settings", icon: "⚙️" },
  ];

  return (
    <div className="min-h-full flex flex-col md:flex-row bg-background">
      {/* Mobile top bar */}
      <div className="md:hidden flex items-center justify-between bg-secondary p-4 text-white z-30 sticky top-0">
        <div className="font-bold flex items-center">
          <div className="h-8 w-8 bg-white text-primary flex justify-center items-center rounded-lg font-bold text-sm shadow-sm mr-2">TA</div>
          Teranga
        </div>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 -mr-2 text-[#A3C5B5] hover:text-white">
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {isMobileMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"} fixed inset-y-0 left-0 z-40 w-64 flex flex-col transition-transform duration-300 ease-in-out md:translate-x-0 md:fixed md:inset-y-0`}>
        <div className="flex-1 flex flex-col min-h-0 bg-secondary">
          <div className="flex-1 flex flex-col pt-6 pb-4 overflow-y-auto">
            <div className="flex items-center flex-shrink-0 px-6 mb-8">
              <div className="h-10 w-10 bg-white text-primary flex justify-center items-center rounded-lg font-bold text-lg shadow-sm mr-3">TA</div>
              <div>
                <h1 className="text-white text-base font-bold tracking-tight leading-tight">Teranga Alliance</h1>
                <p className="text-[#A3C5B5] text-[10px] uppercase tracking-widest font-semibold mt-0.5">Admin System</p>
              </div>
            </div>
            
            <nav className="flex-1 px-4 space-y-6">
              {/* TABLEAU DE BORD */}
              <div>
                <p className="px-3 text-[11px] font-semibold text-[#8baf9f] uppercase tracking-widest mb-3">Pilotage</p>
                <div className="space-y-1">
                  <Link onClick={() => setIsMobileMenuOpen(false)} href="/admin/dashboard" className={`${pathname === "/admin/dashboard" ? "bg-white/10 text-white font-semibold" : "text-[#A3C5B5] hover:bg-white/5 hover:text-white font-normal"} group flex items-center px-3 py-2.5 text-sm rounded-lg transition-all duration-200`}>
                    <svg className={`mr-3 h-5 w-5 ${pathname === "/admin/dashboard" ? "text-white" : "text-[#8baf9f] group-hover:text-white"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z" /></svg>
                    Vue consolidée
                  </Link>
                </div>
              </div>

              {/* GESTION MEMBRES */}
              <div>
                <p className="px-3 text-[11px] font-semibold text-[#8baf9f] uppercase tracking-widest mb-3">Gestion Membre</p>
                <div className="space-y-1">
                  <Link onClick={() => setIsMobileMenuOpen(false)} href="/admin/members" className={`${pathname.startsWith("/admin/members") && !pathname.includes("memberships") ? "bg-white/10 text-white font-semibold" : "text-[#A3C5B5] hover:bg-white/5 hover:text-white font-normal"} group flex items-center px-3 py-2.5 text-sm rounded-lg transition-all duration-200`}>
                    <svg className={`mr-3 h-5 w-5 ${pathname.startsWith("/admin/members") && !pathname.includes("memberships") ? "text-white" : "text-[#8baf9f] group-hover:text-white"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                    Membre
                  </Link>
                  <Link onClick={() => setIsMobileMenuOpen(false)} href="/admin/memberships" className={`${pathname.startsWith("/admin/memberships") ? "bg-white/10 text-white font-semibold" : "text-[#A3C5B5] hover:bg-white/5 hover:text-white font-normal"} group flex items-center px-3 py-2.5 text-sm rounded-lg transition-all duration-200`}>
                    <svg className={`mr-3 h-5 w-5 ${pathname.startsWith("/admin/memberships") ? "text-white" : "text-[#8baf9f] group-hover:text-white"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9.5a2.5 2.5 0 00-2.5-2.5H15M9 11l3 3L22 4" /></svg>
                    Classes
                  </Link>
                </div>
              </div>

              {/* FINANCES */}
              <div>
                <p className="px-3 text-[11px] font-semibold text-[#8baf9f] uppercase tracking-widest mb-3">Finances</p>
                <div className="space-y-1">
                  <Link onClick={() => setIsMobileMenuOpen(false)} href="/admin/finances/campaigns" className={`${pathname.startsWith("/admin/finances/campaigns") ? "bg-white/10 text-white font-semibold" : "text-[#A3C5B5] hover:bg-white/5 hover:text-white font-normal"} group flex items-center px-3 py-2.5 text-sm rounded-lg transition-all duration-200`}>
                    <svg className={`mr-3 h-5 w-5 ${pathname.startsWith("/admin/finances/campaigns") ? "text-white" : "text-[#8baf9f] group-hover:text-white"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    Cotisations
                  </Link>
                  <Link onClick={() => setIsMobileMenuOpen(false)} href="/admin/finances/validations" className={`${pathname.startsWith("/admin/finances/validations") ? "bg-white/10 text-white font-semibold" : "text-[#A3C5B5] hover:bg-white/5 hover:text-white font-normal"} group flex items-center px-3 py-2.5 text-sm rounded-lg transition-all duration-200`}>
                    <svg className={`mr-3 h-5 w-5 ${pathname.startsWith("/admin/finances/validations") ? "text-white" : "text-[#8baf9f] group-hover:text-white"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    Validations
                  </Link>
                  <Link onClick={() => setIsMobileMenuOpen(false)} href="/admin/finances/history" className={`${pathname.startsWith("/admin/finances/history") ? "bg-white/10 text-white font-semibold" : "text-[#A3C5B5] hover:bg-white/5 hover:text-white font-normal"} group flex items-center px-3 py-2.5 text-sm rounded-lg transition-all duration-200`}>
                    <svg className={`mr-3 h-5 w-5 ${pathname.startsWith("/admin/finances/history") ? "text-white" : "text-[#8baf9f] group-hover:text-white"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
                    Historique
                  </Link>
                  <Link onClick={() => setIsMobileMenuOpen(false)} href="/admin/finances/debts" className={`${pathname.startsWith("/admin/finances/debts") ? "bg-white/10 text-white font-semibold" : "text-[#A3C5B5] hover:bg-white/5 hover:text-white font-normal"} group flex items-center px-3 py-2.5 text-sm rounded-lg transition-all duration-200`}>
                    <svg className={`mr-3 h-5 w-5 ${pathname.startsWith("/admin/finances/debts") ? "text-white" : "text-[#8baf9f] group-hover:text-white"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                    Impayés
                  </Link>
                </div>
              </div>

              {/* ADMINISTRATION */}
              <div>
                <p className="px-3 text-[11px] font-semibold text-[#8baf9f] uppercase tracking-widest mb-3">Administration</p>
                <div className="space-y-1">
                  <Link onClick={() => setIsMobileMenuOpen(false)} href="/admin/communications" className={`${pathname.startsWith("/admin/communications") ? "bg-white/10 text-white font-semibold" : "text-[#A3C5B5] hover:bg-white/5 hover:text-white font-normal"} group flex items-center px-3 py-2.5 text-sm rounded-lg transition-all duration-200`}>
                    <svg className={`mr-3 h-5 w-5 ${pathname.startsWith("/admin/communications") ? "text-white" : "text-[#8baf9f] group-hover:text-white"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" /></svg>
                    Communications
                  </Link>

                  <Link onClick={() => setIsMobileMenuOpen(false)} href="/admin/reports" className={`${pathname.startsWith("/admin/reports") ? "bg-white/10 text-white font-semibold" : "text-[#A3C5B5] hover:bg-white/5 hover:text-white font-normal"} group flex items-center px-3 py-2.5 text-sm rounded-lg transition-all duration-200`}>
                    <svg className={`mr-3 h-5 w-5 ${pathname.startsWith("/admin/reports") ? "text-white" : "text-[#8baf9f] group-hover:text-white"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    Rapports
                  </Link>

                  <Link onClick={() => setIsMobileMenuOpen(false)} href="/admin/settings" className={`${pathname.startsWith("/admin/settings") ? "bg-white/10 text-white font-semibold" : "text-[#A3C5B5] hover:bg-white/5 hover:text-white font-normal"} group flex items-center px-3 py-2.5 text-sm rounded-lg transition-all duration-200`}>
                    <svg className={`mr-3 h-5 w-5 ${pathname.startsWith("/admin/settings") ? "text-white" : "text-[#8baf9f] group-hover:text-white"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    Paramètres
                  </Link>
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
