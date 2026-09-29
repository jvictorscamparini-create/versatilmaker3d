import React from "react";
import { Menu, Layers, ExternalLink, Sparkles, Bell } from "lucide-react";
import { AppView } from "../types";

interface HeaderProps {
  currentView: AppView;
  onOpenSidebar: () => void;
  onNavigate: (view: AppView) => void;
  unreadCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onOpenSidebar,
  onNavigate,
  unreadCount = 2,
}) => {
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-800/80 bg-[#0a0e1a]/90 px-4 py-3 backdrop-blur-md">
      <div className="flex items-center gap-3">
        <button
          id="btn-toggle-menu"
          onClick={onOpenSidebar}
          aria-label="Abrir menu de navegação"
          className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-800 bg-[#121827] text-slate-300 transition-colors hover:bg-slate-800 hover:text-white active:scale-95"
        >
          <Menu className="h-5 w-5" />
        </button>

        <button
          id="btn-header-home"
          onClick={() => onNavigate("dashboard")}
          className="flex items-center gap-2 text-left focus:outline-none"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-sm shadow-blue-500/20">
            <Layers className="h-4 w-4" />
          </div>
          <div className="flex items-baseline">
            <span className="text-lg font-bold tracking-tight text-white">Versátil</span>
            <span className="ml-1 text-lg font-extrabold text-blue-500">Maker</span>
          </div>
        </button>
      </div>

      <div className="flex items-center gap-2">
        {/* Personal Use Indicator */}
        <div className="hidden sm:flex items-center gap-1.5 rounded-lg border border-slate-800 bg-[#121827] px-3 py-1.5 text-xs font-medium text-slate-300">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
          <span>Uso Pessoal</span>
        </div>

        {/* Switch to Landing view */}
        <button
          id="btn-view-landing"
          onClick={() => onNavigate("landing")}
          className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-[#121827] px-2.5 py-1.5 text-xs font-medium text-slate-300 transition hover:bg-slate-800 hover:text-white"
          title="Ver página inicial de apresentação do Versátil Maker"
        >
          <ExternalLink className="h-3.5 w-3.5 text-slate-400" />
          <span className="hidden md:inline">Apresentação</span>
        </button>

        {/* Notification Bell */}
        <button
          id="btn-notifications"
          onClick={() => onNavigate("fila-producao")}
          aria-label="Notificações da fila de produção"
          className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-slate-800 bg-[#121827] text-slate-400 transition hover:bg-slate-800 hover:text-slate-200"
        >
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white">
              {unreadCount}
            </span>
          )}
        </button>

        {/* User avatar */}
        <button
          id="btn-user-settings"
          onClick={() => onNavigate("configuracoes")}
          aria-label="Configurações da Conta"
          className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-tr from-slate-800 to-slate-700 text-xs font-bold text-slate-200 ring-1 ring-slate-700 hover:ring-blue-500 transition"
        >
          JS
        </button>
      </div>
    </header>
  );
};
