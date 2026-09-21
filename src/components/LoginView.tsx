import React, { useState } from 'react';
import { Lock, Mail, ArrowRight, Sun, Moon } from 'lucide-react';
import { BRAND_LOGO_BASE64 } from '../data/logo';

interface LoginViewProps {
  onLogin: (email: string) => void;
  defaultEmail?: string;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

export const LoginView: React.FC<LoginViewProps> = ({
  onLogin,
  defaultEmail = 'comercial@krolik.com.br',
  theme,
  onToggleTheme,
}) => {
  const [email, setEmail] = useState(defaultEmail);
  const [password, setPassword] = useState('••••••••');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setError('Informe o e-mail de acesso corporativo.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      onLogin(cleanEmail);
    }, 450);
  };

  return (
    <div className="min-h-screen w-full bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col justify-between p-6 transition-colors duration-150">
      {/* Top Bar with theme toggle */}
      <div className="w-full max-w-6xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2">
          <img
            src={BRAND_LOGO_BASE64}
            alt="PropostasFlow"
            className="h-7 w-auto object-contain"
          />
          <span className="text-sm font-semibold tracking-tight text-zinc-800 dark:text-zinc-200">
            PropostasFlow
          </span>
        </div>

        <button
          type="button"
          onClick={onToggleTheme}
          className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition flex items-center gap-1.5 text-xs font-medium"
          title={theme === 'dark' ? 'Modo Claro' : 'Modo Escuro'}
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          <span>{theme === 'dark' ? 'Claro' : 'Escuro'}</span>
        </button>
      </div>

      {/* Main Login Card */}
      <div className="w-full max-w-md mx-auto my-auto">
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-8 shadow-xs">
          <div className="mb-6">
            <h1 className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
              Acesso ao Sistema
            </h1>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
              Painel de Gestão e Emissão de Propostas
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1.5">
                E-mail corporativo
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="usuario@empresa.com.br"
                  required
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/60 text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:border-[#5b0250] focus:ring-1 focus:ring-[#5b0250] transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1.5">
                Senha
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Senha de acesso"
                  required
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/60 text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:border-[#5b0250] focus:ring-1 focus:ring-[#5b0250] transition"
                />
              </div>
            </div>

            {error && (
              <div className="p-2.5 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 text-xs">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-2.5 px-4 rounded-xl bg-[#5b0250] hover:bg-[#47013e] text-white font-medium text-xs transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {isLoading ? (
                <span>Autenticando...</span>
              ) : (
                <>
                  <span>Entrar no Sistema</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-zinc-100 dark:border-zinc-800/70 flex items-center justify-between text-[11px] text-zinc-400">
            <span>Ambiente Seguro</span>
            <button
              type="button"
              onClick={() => {
                setEmail('comercial@krolik.com.br');
                setPassword('••••••••');
              }}
              className="text-[#5b0250] dark:text-pink-400 hover:underline"
            >
              Usar dados padrão
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="w-full max-w-6xl mx-auto text-center text-[11px] text-zinc-400 py-2">
        <span>PropostasFlow &bull; Sistema de Gestão Comercial</span>
      </div>
    </div>
  );
};
