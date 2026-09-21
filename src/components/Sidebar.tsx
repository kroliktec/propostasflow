import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  PlusCircle, 
  FileCheck2, 
  Users, 
  Building, 
  Files, 
  Boxes, 
  LogOut, 
  Sun, 
  Moon,
  Menu,
  X,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { BRAND_LOGO_BASE64 } from '../data/logo';

export type NavTab = 'dashboard' | 'nova' | 'propostas' | 'clientes' | 'emissores' | 'templates' | 'catalogo';

interface SidebarProps {
  currentTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  userEmail: string;
  onLogout: () => void;
  proposalsCount: number;
  productsCount?: number;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onTabChange,
  userEmail,
  onLogout,
  proposalsCount,
  productsCount = 113,
  theme,
  onToggleTheme,
}) => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem('propostasflow_sidebar_collapsed') === 'true';
    } catch {
      return false;
    }
  });

  const toggleCollapse = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('propostasflow_sidebar_collapsed', String(next));
      } catch (e) {
        console.error(e);
      }
      return next;
    });
  };

  const navItems: { key: NavTab; label: string; icon: React.ReactNode; badge?: number; isAction?: boolean }[] = [
    { key: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { key: 'nova', label: 'Nova Proposta', icon: <PlusCircle className="w-4 h-4" />, isAction: true },
    { key: 'propostas', label: 'Propostas', icon: <FileCheck2 className="w-4 h-4" />, badge: proposalsCount },
    { key: 'clientes', label: 'Clientes', icon: <Users className="w-4 h-4" /> },
    { key: 'emissores', label: 'Emissores', icon: <Building className="w-4 h-4" /> },
    { key: 'templates', label: 'Templates PDF', icon: <Files className="w-4 h-4" /> },
    { key: 'catalogo', label: 'Catálogo de Produtos', icon: <Boxes className="w-4 h-4" />, badge: productsCount },
  ];

  const handleSelectTab = (tab: NavTab) => {
    onTabChange(tab);
    setIsMobileOpen(false);
  };

  const sidebarContent = (
    <div className="flex flex-col h-full justify-between bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800/80 shadow-xs">
      {/* Brand Header with Collapse Arrow Button */}
      <div className="p-4 sm:p-5 border-b border-zinc-100 dark:border-zinc-800/60 flex items-center justify-between gap-2">
        <div className="flex items-center gap-3 overflow-hidden">
          <img
            src={BRAND_LOGO_BASE64}
            alt="Krolik Telecom"
            className="h-8 w-auto object-contain shrink-0"
          />
          <div className="flex flex-col overflow-hidden">
            <span className="font-bold text-sm tracking-tight text-zinc-900 dark:text-zinc-100 truncate">
              PropostasFlow
            </span>
            <span className="text-[11px] text-zinc-400 font-medium truncate">
              Krolik Telecom
            </span>
          </div>
        </div>

        {/* Hide Sidebar Arrow Button (Desktop: <-) */}
        <button
          type="button"
          onClick={toggleCollapse}
          className="hidden lg:flex p-1.5 rounded-xl text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition cursor-pointer shrink-0"
          title="Esconder menu lateral (<-)"
          aria-label="Esconder menu lateral"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        {/* Close Drawer Button (Mobile: X) */}
        <button
          type="button"
          onClick={() => setIsMobileOpen(false)}
          className="lg:hidden p-2 rounded-xl text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition shrink-0"
          aria-label="Fechar menu"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation Links with custom scrollbar */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1">
        <div className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
          Módulos
        </div>
        {navItems.map((item) => {
          const isActive = currentTab === item.key;
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => handleSelectTab(item.key)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition cursor-pointer min-h-[40px] sm:min-h-0 ${
                isActive
                  ? item.isAction
                    ? 'bg-[#5b0250] text-white shadow-xs'
                    : 'bg-[#5b0250]/10 dark:bg-[#5b0250]/25 text-[#5b0250] dark:text-pink-300 font-semibold'
                  : item.isAction
                  ? 'text-[#5b0250] dark:text-pink-300 hover:bg-[#5b0250]/5 dark:hover:bg-[#5b0250]/15'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800/60'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span className={isActive ? 'text-inherit' : 'text-zinc-400'}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </div>
              {item.badge !== undefined && (
                <span
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                    isActive
                      ? 'bg-white/20 text-inherit'
                      : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Footer Controls: Theme & User Account */}
      <div className="p-3 border-t border-zinc-100 dark:border-zinc-800/60 space-y-2">
        {/* Theme switch button */}
        <button
          type="button"
          onClick={onToggleTheme}
          className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/60 transition cursor-pointer"
        >
          <div className="flex items-center gap-2.5">
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-zinc-500" />
            )}
            <span>{theme === 'dark' ? 'Modo Claro' : 'Modo Escuro'}</span>
          </div>
          <span className="text-[10px] text-zinc-400 uppercase font-mono">
            {theme === 'dark' ? 'Escuro' : 'Claro'}
          </span>
        </button>

        {/* User profile & Logout */}
        <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800/60 flex items-center justify-between gap-2 px-1">
          <div className="flex flex-col min-w-0">
            <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 truncate" title={userEmail}>
              {userEmail}
            </span>
            <span className="text-[10px] text-zinc-400">
              Conectado
            </span>
          </div>

          <button
            type="button"
            onClick={onLogout}
            className="p-2 rounded-xl text-zinc-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition cursor-pointer"
            title="Sair do sistema"
            aria-label="Sair do sistema"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Topbar */}
      <div className="lg:hidden sticky top-0 z-40 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 px-3.5 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setIsMobileOpen(!isMobileOpen)}
            className="p-2 rounded-xl text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 min-w-[44px] min-h-[44px] flex items-center justify-center transition cursor-pointer"
            aria-label="Abrir menu"
          >
            {isMobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <img
            src={BRAND_LOGO_BASE64}
            alt="Krolik Telecom"
            className="h-7 w-auto object-contain"
          />
          <span className="text-xs font-black text-zinc-900 dark:text-zinc-100 tracking-tight">
            PropostasFlow
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onToggleTheme}
            className="p-2 rounded-xl text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 min-w-[44px] min-h-[44px] flex items-center justify-center transition cursor-pointer"
            aria-label="Alternar tema"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>
          <button
            type="button"
            onClick={onLogout}
            className="p-2 rounded-xl text-zinc-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 min-w-[44px] min-h-[44px] flex items-center justify-center transition cursor-pointer"
            title="Sair"
            aria-label="Sair"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Mobile Drawer Overlay */}
      {isMobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMobileOpen(false)}
          />
          <div className="relative w-72 max-w-[85vw] h-full shadow-2xl z-10 animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}

      {/* Desktop Fixed / Collapsible Sidebar */}
      <aside 
        className={`hidden lg:block shrink-0 h-screen sticky top-0 z-30 transition-all duration-300 ease-in-out ${
          isCollapsed ? 'w-0 overflow-hidden opacity-0 pointer-events-none' : 'w-64 opacity-100'
        }`}
      >
        <div className="w-64 h-full">
          {sidebarContent}
        </div>
      </aside>

      {/* Floating Expand Button (->) when sidebar is collapsed */}
      {isCollapsed && (
        <button
          type="button"
          onClick={toggleCollapse}
          className="hidden lg:flex fixed top-4 left-4 z-40 items-center gap-1.5 px-3 py-2 rounded-xl bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-800 shadow-md hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:border-[#5b0250]/40 transition group cursor-pointer"
          title="Mostrar menu lateral (->)"
          aria-label="Mostrar menu lateral"
        >
          <ChevronRight className="w-4 h-4 text-[#5b0250] dark:text-pink-400 group-hover:translate-x-0.5 transition-transform" />
          <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">Menu</span>
        </button>
      )}
    </>
  );
};
