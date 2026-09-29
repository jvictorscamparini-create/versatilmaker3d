import React from "react";
import {
  Layers,
  ArrowRight,
  TrendingUp,
  CreditCard,
  Clock,
  Box,
  LayoutDashboard,
  ShoppingCart,
  Printer,
  Calculator,
  CircleDollarSign,
  Share2,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import { AppView } from "../types";

interface LandingPageProps {
  onEnterApp: (view?: AppView) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onEnterApp }) => {
  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col items-center">
      {/* Navigation Bar (Screenshots 1-8) */}
      <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-[#090d18]/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white shadow-sm shadow-blue-500/30">
              <Layers className="h-5 w-5" />
            </div>
            <div className="flex items-baseline">
              <span className="text-xl font-bold tracking-tight text-white">Versátil</span>
              <span className="ml-1 text-xl font-extrabold text-blue-500">Maker</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="btn-landing-signup"
              onClick={() => onEnterApp("dashboard")}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 active:scale-95 transition"
            >
              Acessar Painel
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Container formatted exactly like mobile/responsive layout */}
      <main className="w-full max-w-md px-4 py-8 flex flex-col items-center sm:max-w-lg md:max-w-xl">
        {/* Hero Section */}
        <section className="w-full text-center pt-2 pb-6">
          <h1 className="text-3xl sm:text-4xl font-extrabold leading-tight tracking-tight text-white">
            Transforme sua impressora 3D em uma máquina de vendas.
          </h1>
          <p className="mt-4 text-base leading-relaxed text-slate-400">
            Sistema completo para gerenciar sua operação 3D. Gerencie suas vendas, estoque,
            financeiro e integrações com Mercado Livre e Shopee, tudo em um só lugar.
          </p>

          <div className="mt-6 flex flex-col gap-3">
            <button
              id="btn-hero-cta"
              onClick={() => onEnterApp("dashboard")}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3.5 text-base font-bold text-white shadow-lg shadow-blue-600/30 hover:bg-blue-500 active:scale-98 transition"
            >
              <span>Acessar Painel Completo</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          {/* Floating Metric Card (from Page 1 screenshot) */}
          <div className="mt-6 mx-auto w-full max-w-xs rounded-2xl border border-slate-800 bg-[#101726]/90 p-4 text-left shadow-xl">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-400">
                <TrendingUp className="h-6 w-6" />
              </div>
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  LUCRO LÍQUIDO
                </span>
                <p className="text-2xl font-black text-white">R$ 9.290,50</p>
              </div>
            </div>
          </div>
        </section>

        {/* Section 2: Modernize sua Produção (Screenshots 2 & 3) */}
        <section className="w-full mt-10">
          <div className="text-left mb-6">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-500">
              MODERNIZE SUA PRODUÇÃO
            </span>
            <h2 className="mt-1 text-2xl font-extrabold uppercase text-white tracking-tight">
              SUA OPERAÇÃO NO PRÓXIMO NÍVEL.
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-300">
              O Versátil Maker transforma sua impressora em uma máquina de lucro previsível.
              Além de organizar seus pedidos, você ganha visão de raio-x sobre cada centavo
              gasto em energia e filamento.
            </p>
          </div>

          <div className="flex flex-col gap-4">
            {/* Card 1: Lucro Real */}
            <div className="rounded-2xl border border-slate-800 bg-[#121828] p-5 shadow-md">
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/15 text-blue-400">
                  <CreditCard className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Lucro Real e Fluxo</h3>
                  <p className="mt-1 text-xs text-slate-400 leading-relaxed">
                    Controle financeiro automático. Saiba a margem exata descontando energia,
                    depreciação e taxas de marketplace.
                  </p>
                </div>
              </div>
            </div>

            {/* Card 2: Gestão Visual de Pedidos */}
            <div className="rounded-2xl border border-slate-800 bg-[#121828] p-5 shadow-md">
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/15 text-blue-400">
                  <Clock className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Gestão Visual de Pedidos</h3>
                  <p className="mt-1 text-xs text-slate-400 leading-relaxed">
                    Fila de impressão 100% visual. Não perca mais prazos e mantenha a máquina
                    rodando sem interrupções.
                  </p>
                </div>
              </div>
            </div>

            {/* Card 3: Baixa de Estoque Inteligente */}
            <div className="rounded-2xl border border-slate-800 bg-[#121828] p-5 shadow-md">
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/15 text-blue-400">
                  <Box className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Baixa de Estoque Inteligente</h3>
                  <p className="mt-1 text-xs text-slate-400 leading-relaxed">
                    Vendeu? O sistema abate os gramas de filamento automaticamente e avisa quando
                    está na hora de comprar mais.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 3: Tudo que você precisa (Screenshots 4 - 7) */}
        <section className="w-full mt-12">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-extrabold text-white">Tudo que você precisa</h2>
            <p className="mt-2 text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
              Ferramentas profissionais desenvolvidas especificamente para resolver as dores dos
              donos de impressão 3D.
            </p>
          </div>

          <div className="flex flex-col gap-4">
            {/* 1. Dashboard */}
            <div
              onClick={() => onEnterApp("dashboard")}
              className="group cursor-pointer rounded-2xl border border-slate-800 bg-[#121828] p-5 transition hover:border-slate-700"
            >
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/15 text-blue-400">
                  <LayoutDashboard className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white group-hover:text-blue-400 transition">
                    Dashboard
                  </h3>
                  <p className="mt-1 text-xs text-slate-400 leading-relaxed">
                    Métricas consolidadas em tempo real para uma visão clara da sua operação.
                  </p>
                </div>
              </div>
            </div>

            {/* 2. Gestão de Vendas */}
            <div
              onClick={() => onEnterApp("vendas")}
              className="group cursor-pointer rounded-2xl border border-slate-800 bg-[#121828] p-5 transition hover:border-slate-700"
            >
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/15 text-blue-400">
                  <ShoppingCart className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white group-hover:text-blue-400 transition">
                    Gestão de Vendas
                  </h3>
                  <p className="mt-1 text-xs text-slate-400 leading-relaxed">
                    Controle completo de todos os seus pedidos de forma centralizada e eficiente.
                  </p>
                </div>
              </div>
            </div>

            {/* 3. Estoque Dinâmico */}
            <div
              onClick={() => onEnterApp("estoque")}
              className="group cursor-pointer rounded-2xl border border-slate-800 bg-[#121828] p-5 transition hover:border-slate-700"
            >
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/15 text-blue-400">
                  <Box className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white group-hover:text-blue-400 transition">
                    Estoque Dinâmico
                  </h3>
                  <p className="mt-1 text-xs text-slate-400 leading-relaxed">
                    Gestão inteligente de rolos e peças com baixa automática e alertas de reposição.
                  </p>
                </div>
              </div>
            </div>

            {/* 4. Fila de Produção */}
            <div
              onClick={() => onEnterApp("fila-producao")}
              className="group cursor-pointer rounded-2xl border border-slate-800 bg-[#121828] p-5 transition hover:border-slate-700"
            >
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/15 text-blue-400">
                  <Clock className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white group-hover:text-blue-400 transition">
                    Fila de Produção
                  </h3>
                  <p className="mt-1 text-xs text-slate-400 leading-relaxed">
                    Organização visual do fluxo de trabalho das suas máquinas sem perder prazos.
                  </p>
                </div>
              </div>
            </div>

            {/* 5. Gestão de Máquinas */}
            <div
              onClick={() => onEnterApp("maquinas")}
              className="group cursor-pointer rounded-2xl border border-slate-800 bg-[#121828] p-5 transition hover:border-slate-700"
            >
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/15 text-blue-400">
                  <Printer className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white group-hover:text-blue-400 transition">
                    Gestão de Máquinas
                  </h3>
                  <p className="mt-1 text-xs text-slate-400 leading-relaxed">
                    Controle individual de cada impressora 3D, tempo de uso e manutenção.
                  </p>
                </div>
              </div>
            </div>

            {/* 6. Calculadora 3D */}
            <div
              onClick={() => onEnterApp("calculadora-3d")}
              className="group cursor-pointer rounded-2xl border border-slate-800 bg-[#121828] p-5 transition hover:border-slate-700"
            >
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/15 text-blue-400">
                  <Calculator className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white group-hover:text-blue-400 transition">
                    Calculadora 3D
                  </h3>
                  <p className="mt-1 text-xs text-slate-400 leading-relaxed">
                    Cálculo exato de custos, filamento, energia e margem de lucro por peça.
                  </p>
                </div>
              </div>
            </div>

            {/* 7. Financeiro Completo */}
            <div
              onClick={() => onEnterApp("financeiro")}
              className="group cursor-pointer rounded-2xl border border-slate-800 bg-[#121828] p-5 transition hover:border-slate-700"
            >
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/15 text-blue-400">
                  <CircleDollarSign className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white group-hover:text-blue-400 transition">
                    Financeiro Completo
                  </h3>
                  <p className="mt-1 text-xs text-slate-400 leading-relaxed">
                    Gestão de despesas, receitas e relatórios de lucratividade detalhados.
                  </p>
                </div>
              </div>
            </div>

            {/* 8. Integração Marketplace */}
            <div
              onClick={() => onEnterApp("integracao-shopee")}
              className="group cursor-pointer rounded-2xl border border-slate-800 bg-[#121828] p-5 transition hover:border-slate-700"
            >
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/15 text-blue-400">
                  <Share2 className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white group-hover:text-blue-400 transition">
                    Integração Marketplace
                  </h3>
                  <p className="mt-1 text-xs text-slate-400 leading-relaxed">
                    Conexão oficial e segura com Mercado Livre e Shopee via OAuth.
                  </p>
                </div>
              </div>
            </div>

            {/* 9. Análise de Mercado */}
            <div
              onClick={() => onEnterApp("analise-mercado")}
              className="group cursor-pointer rounded-2xl border border-slate-800 bg-[#121828] p-5 transition hover:border-slate-700"
            >
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/15 text-blue-400">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white group-hover:text-blue-400 transition">
                    Análise de Mercado
                  </h3>
                  <p className="mt-1 text-xs text-slate-400 leading-relaxed">
                    Compare seus anúncios com a concorrência usando IA e receba um plano de ação para vender mais.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 4: Recursos Integrados */}
        <section className="w-full mt-12 mb-8">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-extrabold text-white">Tudo pronto para sua operação</h2>
            <p className="mt-1 text-xs text-slate-400">
              Todas as ferramentas 100% disponíveis para seu uso pessoal.
            </p>
          </div>

          <div className="rounded-2xl border border-blue-500/30 bg-[#101729] p-6 shadow-xl relative overflow-hidden">
            <div className="absolute -top-12 -right-12 h-32 w-32 rounded-full bg-blue-600/10 blur-2xl" />

            <div className="space-y-3 text-sm">
              {[
                "Dashboard com métricas em tempo real",
                "Gestão completa de vendas e clientes",
                "Gestão completa de estoque de filamentos",
                "Fila de produção visual com telemetria",
                "Gestão individual de máquinas 3D",
                "Calculadora 3D com precificação reversa 2026",
                "Gestão completa de Financeiro e Lucro Líquido",
                "Análise de Mercado e Concorrentes com IA",
                "Estúdio Criativo com IA (Gemini)",
                "Gerador Paramétrico 3D com exportação",
                "Integração com Mercado Livre e Shopee",
                "Baixa automática de gramas de filamento",
                "Alertas inteligentes de bobinas baixas",
              ].map((feature, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
                  <span className="text-xs text-slate-300">{feature}</span>
                </div>
              ))}
            </div>

            <button
              id="btn-plan-subscribe"
              onClick={() => onEnterApp("dashboard")}
              className="mt-6 w-full rounded-xl bg-blue-600 py-3.5 text-center text-sm font-bold text-white shadow-lg shadow-blue-600/30 hover:bg-blue-500 active:scale-95 transition"
            >
              Acessar Painel de Controle
            </button>
          </div>
        </section>
      </main>
    </div>
  );
};
