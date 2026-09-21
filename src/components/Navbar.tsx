import React from 'react';
import { 
  LayoutDashboard, 
  PlusCircle, 
  FileCheck2, 
  Users, 
  Building, 
  Files, 
  Boxes, 
  LogOut, 
  Sparkles,
  Sun,
  Moon
} from 'lucide-react';
import { BRAND_LOGO_BASE64 } from '../data/logo';

export type NavTab = 'dashboard' | 'nova' | 'propostas' | 'clientes' | 'emissores' | 'templates' | 'catalogo';

interface NavbarProps {
  currentTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  userEmail: string;
  onLogout: () => void;
  proposalsCount: number;
  productsCount?: number;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onTabChange,
  userEmail,
  onLogout,
  proposalsCount,
  productsCount = 113,
  theme,
  onToggleTheme
}) => {
  const tabs: { key: NavTab; label: string; icon: React.ReactNode; badge?: number }[] = [
    { key: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { key: 'nova', label: '+ Nova Proposta', icon: <PlusCircle className="w-4 h-4" /> },
    { key: 'propostas', label: 'Propostas', icon: <FileCheck2 className="w-4 h-4" />, badge: proposalsCount },
    { key: 'clientes', label: 'Clientes', icon: <Users className="w-4 h-4" /> },
    { key: 'emissores', label: 'Emissores', icon: <Building className="w-4 h-4" /> },
    { key: 'templates', label: 'Templates PDF', icon: <Files className="w-4 h-4" /> },
    { key: 'catalogo', label: `Produtos (${productsCount})`, icon: <Boxes className="w-4 h-4" /> },
  ];

  return (
    <header className="sticky top-0 z-40 backdrop-blur-xl bg-white/90 dark:bg-zinc-900/90 border-b border-zinc-200 dark:border-white/10 shadow-xs">
      <div className="max-w-[1440px] mx-auto px-4 md:px-6 h-[68px] flex items-center justify-between gap-4">
        {/* Brand identity */}
        <div className="flex items-center gap-3 shrink-0">
          <div 
            onClick={() => onTabChange('dashboard')} 
            className="cursor-pointer flex items-center gap-3 group"
          >
            <div className="w-10 h-10 rounded-xl bg-[#5b0250] flex items-center justify-center p-2 shadow-md transition group-hover:scale-105">
              <img 
                src={BRAND_LOGO_BASE64} 
                alt="propostasflow logo" 
                className="w-full h-full object-contain" 
              />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-black text-xl tracking-tight text-[#5b0250] dark:text-pink-300">
                  propostasflow
                </span>
                <span className="hidden sm:inline-flex text-[10px] px-2 py-0.5 rounded-full bg-[#5b0250]/10 text-[#5b0250] border border-[#5b0250]/20 font-bold uppercase tracking-wider dark:bg-[#5b0250]/30 dark:text-pink-300">
                  Telecom & VoIP
                </span>
              </div>
              <p className="text-[10px] text-zinc-400 font-medium hidden md:block">
                Gestão comercial premium • Krolik
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1 overflow-x-auto no-scrollbar py-1">
          {tabs.map((tab) => {
            const isActive = currentTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => onTabChange(tab.key)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-[#5b0250] text-white shadow-md'
                    : 'text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-white/10'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ml-0.5 ${
                    isActive 
                      ? 'bg-white/20 text-white' 
                      : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300'
                  }`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* User Session & Logout */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Light / Dark Mode Toggle */}
          <button
            type="button"
            onClick={onToggleTheme}
            className="p-2 rounded-xl border border-zinc-200 dark:border-white/10 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-white/10 transition flex items-center gap-1.5 text-xs font-semibold"
            title={theme === 'dark' ? 'Alternar para Modo Claro' : 'Alternar para Modo Escuro'}
          >
            {theme === 'dark' ? (
              <>
                <Sun className="w-4 h-4 text-amber-400" />
                <span className="hidden md:inline">Claro</span>
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 text-zinc-600" />
                <span className="hidden md:inline">Escuro</span>
              </>
            )}
          </button>

          <div className="hidden lg:flex flex-col text-right">
            <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 truncate max-w-[160px]">
              {userEmail}
            </span>
            <span className="text-[10px] text-emerald-600 font-medium">
              Sessão ativa
            </span>
          </div>

          <button
            type="button"
            onClick={onLogout}
            className="p-2 rounded-xl border border-zinc-200 dark:border-white/10 text-zinc-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition text-xs font-semibold flex items-center gap-1.5"
            title="Sair do sistema"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Sair</span>
          </button>
        </div>
      </div>
    </header>
  );
};
