import React, { useState } from "react";
import {
  X,
  LayoutDashboard,
  ShoppingCart,
  Users,
  Clock,
  Package,
  Printer,
  Calculator,
  Search,
  Sparkles,
  Box,
  CircleDollarSign,
  ChevronDown,
  ChevronUp,
  ShoppingBag,
  Settings,
  Layers,
  ExternalLink,
} from "lucide-react";
import { AppView } from "../types";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  currentView: AppView;
  onNavigate: (view: AppView) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  currentView,
  onNavigate,
}) => {
  const [integrationsOpen, setIntegrationsOpen] = useState(true);

  if (!isOpen) return null;

  const handleItemClick = (view: AppView) => {
    onNavigate(view);
    onClose();
  };

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, view: "dashboard" as AppView },
    { id: "vendas", label: "Vendas", icon: ShoppingCart, view: "vendas" as AppView },
    { id: "clientes", label: "Clientes", icon: Users, view: "clientes" as AppView },
    { id: "fila-producao", label: "Fila de Produção", icon: Clock, view: "fila-producao" as AppView },
    { id: "estoque", label: "Estoque", icon: Package, view: "estoque" as AppView },
    { id: "maquinas", label: "Máquinas", icon: Printer, view: "maquinas" as AppView },
    { id: "calculadora-3d", label: "Calculadora 3D", icon: Calculator, view: "calculadora-3d" as AppView },
    { id: "analise-mercado", label: "Análise de Mercado", icon: Search, view: "analise-mercado" as AppView },
    {
      id: "estudio-criativo",
      label: "Estúdio Criativo",
      icon: Sparkles,
      view: "estudio-criativo" as AppView,
      badge: "NOVO",
      badgeColor: "bg-purple-900/60 text-purple-300 border border-purple-500/40",
    },
    { id: "gerador-3d", label: "Gerador 3D", icon: Box, view: "gerador-3d" as AppView },
    { id: "financeiro", label: "Financeiro", icon: CircleDollarSign, view: "financeiro" as AppView },
  ];

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Drawer panel */}
      <div className="relative z-10 flex h-full w-72 flex-col border-r border-slate-800 bg-[#0a0f1d] p-4 text-slate-200 shadow-2xl overflow-y-auto">
        {/* Header with Close */}
        <div className="flex items-center justify-between pb-5 border-b border-slate-800/80">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white shadow-sm shadow-blue-500/30">
              <Layers className="h-4 w-4" />
            </div>
            <div className="flex items-baseline">
              <span className="text-xl font-bold tracking-tight text-white">Versátil</span>
              <span className="ml-1 text-xl font-extrabold text-blue-500">Maker</span>
            </div>
          </div>
          <button
            id="btn-close-sidebar"
            onClick={onClose}
            aria-label="Fechar menu"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation List */}
        <nav className="mt-4 flex flex-1 flex-col gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.view;
            return (
              <button
                key={item.id}
                id={`nav-${item.id}`}
                onClick={() => handleItemClick(item.view)}
                className={`group flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                  isActive
                    ? "bg-blue-600/15 text-blue-400 border border-blue-500/30 font-semibold"
                    : "text-slate-300 hover:bg-slate-800/60 hover:text-white"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`h-4 w-4 transition-colors ${
                      isActive ? "text-blue-400" : "text-slate-400 group-hover:text-slate-200"
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`rounded px-1.5 py-0.5 text-[10px] font-bold tracking-wider ${item.badgeColor}`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}

          {/* Integrações Collapsible */}
          <div className="pt-2">
            <button
              id="nav-integracoes-group"
              onClick={() => setIntegrationsOpen(!integrationsOpen)}
              className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-xs font-semibold uppercase tracking-wider text-slate-400 hover:text-slate-200 transition"
            >
              <div className="flex items-center gap-3">
                <ShoppingBag className="h-4 w-4 text-slate-400" />
                <span>Integrações</span>
              </div>
              {integrationsOpen ? (
                <ChevronUp className="h-3.5 w-3.5" />
              ) : (
                <ChevronDown className="h-3.5 w-3.5" />
              )}
            </button>

            {integrationsOpen && (
              <div className="mt-1 ml-4 flex flex-col gap-1 border-l border-slate-800 pl-2">
                <button
                  id="nav-integracao-ml"
                  onClick={() => handleItemClick("integracao-ml")}
                  className={`flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium transition ${
                    currentView === "integracao-ml"
                      ? "bg-yellow-500/15 text-yellow-300 font-semibold border border-yellow-500/30"
                      : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-200"
                  }`}
                >
                  <span className="h-2 w-2 rounded-full bg-[#FFE600]" />
                  <span>Mercado Livre</span>
                </button>
                <button
                  id="nav-integracao-shopee"
                  onClick={() => handleItemClick("integracao-shopee")}
                  className={`flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium transition ${
                    currentView === "integracao-shopee"
                      ? "bg-orange-500/15 text-orange-400 font-semibold border border-orange-500/30"
                      : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-200"
                  }`}
                >
                  <span className="h-2 w-2 rounded-full bg-[#EE4D2D]" />
                  <span>Shopee</span>
                </button>
              </div>
            )}
          </div>

          <div className="my-2 border-t border-slate-800/80" />

          {/* Configurações */}
          <button
            id="nav-configuracoes"
            onClick={() => handleItemClick("configuracoes")}
            className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
              currentView === "configuracoes"
                ? "bg-blue-600/15 text-blue-400 border border-blue-500/30"
                : "text-slate-300 hover:bg-slate-800/60 hover:text-white"
            }`}
          >
            <Settings className="h-4 w-4 text-slate-400" />
            <span>Configurações</span>
          </button>

          {/* Ver Apresentação */}
          <button
            id="nav-apresentacao"
            onClick={() => handleItemClick("landing")}
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-400 hover:bg-slate-800/60 hover:text-slate-200 transition"
          >
            <ExternalLink className="h-4 w-4 text-slate-400" />
            <span>Página Inicial</span>
          </button>
        </nav>

        {/* Footer info: Uso Pessoal */}
        <div className="mt-4 border-t border-slate-800 pt-3 text-[11px] text-slate-400 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-blue-400" />
            <span>Uso Pessoal</span>
          </div>
          <span className="text-emerald-500 font-semibold">● Online</span>
        </div>
      </div>
    </div>
  );
};
