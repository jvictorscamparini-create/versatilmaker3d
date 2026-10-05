import React, { useState } from "react";
import { sameDay } from "../utils/dates";
import {
  TrendingUp,
  AlertTriangle,
  DollarSign,
  ShoppingCart,
  Calculator,
  Tag,
  Box,
  Clock,
  Star,
  CheckCircle2,
  Circle,
  ArrowRight,
  Printer,
  Sparkles,
  Share2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { AppView, Filament, OrderItem, Printer as PrinterType, ProductionCard } from "../types";
import { VisualMetricsDashboard } from "./VisualMetricsDashboard";

interface DashboardViewProps {
  orders: OrderItem[];
  filaments: Filament[];
  printers: PrinterType[];
  productionCards?: ProductionCard[];
  onNavigate: (view: AppView) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  orders,
  filaments,
  printers,
  productionCards = [],
  onNavigate,
}) => {
  const [showSetupGuide, setShowSetupGuide] = useState(false);

  // Compute real metrics
  const todayOrders = orders.filter(order => sameDay(order.date,new Date()));
  const todayRevenue = todayOrders.reduce((acc, o) => acc + o.totalPrice, 0);
  // Assume estimated costs (materials + packaging + platform fees ~ 42%)
  const todayCosts = Number((todayRevenue * 0.42).toFixed(2));
  const todayProfit = Number((todayRevenue - todayCosts).toFixed(2));
  const todaySalesCount = todayOrders.length;
  const mlSales = orders.filter((o) => o.platform === "Mercado Livre").length;
  const shopeeSales = orders.filter((o) => o.platform === "Shopee").length;
  const averageMargin = todayRevenue > 0 ? ((todayProfit / todayRevenue) * 100).toFixed(2) : "0.00";
  const averageTicket = todaySalesCount > 0 ? (todayRevenue / todaySalesCount).toFixed(2) : "0.00";
  const lowStockFilaments = filaments.filter((f) => f.weightRemainingGrams < 200);

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-6 text-slate-100 flex flex-col gap-6">
      {/* Title & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30">
              <span className="text-lg font-black">▦</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Painel Principal & Métricas
            </h1>
          </div>
          <p className="mt-1 text-xs text-slate-400">
            Acompanhe o volume de produção dos últimos 7 dias, total de vendas e saúde financeira da oficina 3D.
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate("vendas")}
            className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white shadow hover:bg-emerald-500 active:scale-98 transition"
          >
            <ShoppingCart className="h-3.5 w-3.5" />
            <span>+ Nova Venda</span>
          </button>
          <button
            onClick={() => onNavigate("fila-producao")}
            className="flex items-center gap-1.5 rounded-xl border border-blue-500/30 bg-blue-950/30 px-3.5 py-2 text-xs font-bold text-blue-300 hover:bg-blue-900/40 active:scale-98 transition"
          >
            <Printer className="h-3.5 w-3.5" />
            <span>Fila de Produção</span>
          </button>
        </div>
      </div>

      {/* VISUAL METRICS DASHBOARD (RECHARTS) */}
      <VisualMetricsDashboard
        orders={orders}
        filaments={filaments}
        printers={printers}
        productionCards={productionCards}
        onNavigate={onNavigate}
      />

      {/* Setup Guide (Collapsible to keep interface clean) */}
      <div className="rounded-2xl border border-slate-800/90 bg-[#121828] p-5 shadow-sm">
        <div
          className="flex items-center justify-between cursor-pointer select-none"
          onClick={() => setShowSetupGuide((prev) => !prev)}
        >
          <div className="flex items-center gap-2 text-slate-300">
            <Star className="h-4 w-4 text-blue-400" />
            <h2 className="text-base font-bold text-white">Guia de Configuração da Oficina</h2>
            <span className="rounded-full bg-blue-500/20 px-2 py-0.5 text-[10px] font-bold text-blue-300">
              2/4 Concluído
            </span>
          </div>
          <button className="text-slate-400 hover:text-white p-1 rounded-lg">
            {showSetupGuide ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
        </div>

        {showSetupGuide && (
          <div className="mt-4 pt-4 border-t border-slate-800/80 animate-in fade-in duration-200">
            <p className="text-xs text-slate-400">
              Siga estes passos para aproveitar o máximo do Versátil Maker.
            </p>

            {/* Progress Bar */}
            <div className="mt-3 flex items-center justify-between text-xs font-medium text-slate-400">
              <span>Progresso</span>
              <span className="text-slate-300 font-bold">50%</span>
            </div>
            <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-slate-800">
              <div className="h-full w-2/4 rounded-full bg-blue-600 transition-all duration-500" />
            </div>

            {/* Checklist Steps */}
            <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
              <div className="flex items-center gap-2.5 rounded-xl border border-slate-800 bg-[#0d1320] p-3 text-xs">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                <div>
                  <p className="font-semibold text-slate-200">Criar Conta</p>
                  <p className="text-[11px] text-slate-400">Você já deu o primeiro passo.</p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 rounded-xl border border-slate-800 bg-[#0d1320] p-3 text-xs">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                <div>
                  <p className="font-semibold text-slate-200">Dados da Loja</p>
                  <p className="text-[11px] text-slate-400">Nome e WhatsApp configurados.</p>
                </div>
              </div>

              <button
                onClick={() => onNavigate("maquinas")}
                className="flex items-center justify-between rounded-xl border border-blue-500/20 bg-blue-950/20 p-3 text-left text-xs transition hover:bg-blue-950/40"
              >
                <div className="flex items-center gap-2.5">
                  <Printer className="h-4 w-4 text-blue-400 shrink-0" />
                  <div>
                    <p className="font-semibold text-blue-300">Cadastrar Impressoras</p>
                    <p className="text-[11px] text-slate-400">{printers.length} máquinas ativas.</p>
                  </div>
                </div>
                <ArrowRight className="h-3.5 w-3.5 text-blue-400" />
              </button>

              <button
                onClick={() => onNavigate("integracao-shopee")}
                className="flex items-center justify-between rounded-xl border border-orange-500/20 bg-orange-950/20 p-3 text-left text-xs transition hover:bg-orange-950/40"
              >
                <div className="flex items-center gap-2.5">
                  <Share2 className="h-4 w-4 text-orange-400 shrink-0" />
                  <div>
                    <p className="font-semibold text-orange-300">Conectar Marketplace</p>
                    <p className="text-[11px] text-slate-400">Shopee ou Mercado Livre.</p>
                  </div>
                </div>
                <ArrowRight className="h-3.5 w-3.5 text-orange-400" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Daily Performance Cards & Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {/* Receita Total (Hoje) */}
        <div className="relative overflow-hidden rounded-2xl border border-blue-500/20 bg-gradient-to-br from-[#121828] to-[#0e1629] p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Receita Total (Hoje)</span>
            <TrendingUp className="h-5 w-5 text-blue-400 opacity-60" />
          </div>
          <p className="mt-2 text-3xl font-black tracking-tight text-white">
            R$ {todayRevenue.toFixed(2)}
          </p>
          <p className="mt-1 text-[11px] text-slate-400">
            {todaySalesCount} pedido(s) faturados hoje
          </p>
        </div>

        {/* Custo Estimado (Hoje) */}
        <div className="relative overflow-hidden rounded-2xl border border-red-500/20 bg-gradient-to-br from-[#121828] to-[#1c1219] p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Custo Total (Hoje)</span>
            <AlertTriangle className="h-5 w-5 text-red-400 opacity-60" />
          </div>
          <p className="mt-2 text-3xl font-black tracking-tight text-white">
            R$ {todayCosts.toFixed(2)}
          </p>
          <p className="mt-1 text-[11px] text-slate-400">
            Estimativa de 42% da receita; confira os custos no Financeiro
          </p>
        </div>

        {/* Lucro Estimado (Hoje) */}
        <div className="relative overflow-hidden rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-[#121828] to-[#0e211b] p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Lucro Líquido Real (Hoje)</span>
            <DollarSign className="h-5 w-5 text-emerald-400 opacity-60" />
          </div>
          <p className="mt-2 text-3xl font-black tracking-tight text-emerald-400">
            R$ {todayProfit.toFixed(2)}
          </p>
          <p className="mt-1 text-[11px] text-emerald-400/80 font-medium">
            Margem estimada: {averageMargin}%
          </p>
        </div>

        {/* Margem Média */}
        <div className="rounded-2xl border border-purple-500/20 bg-gradient-to-br from-[#121828] to-[#17112a] p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Margem Média</span>
            <Calculator className="h-5 w-5 text-purple-400 opacity-60" />
          </div>
          <p className="mt-2 text-3xl font-black text-purple-300">{averageMargin}%</p>
          <p className="mt-1 text-[11px] text-slate-400">Objetivo ideal: &gt; 35%</p>
        </div>

        {/* Ticket Médio */}
        <div className="rounded-2xl border border-amber-500/20 bg-gradient-to-br from-[#121828] to-[#1c1610] p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Ticket Médio</span>
            <Tag className="h-5 w-5 text-amber-400 opacity-60" />
          </div>
          <p className="mt-2 text-3xl font-black text-amber-400">R$ {averageTicket}</p>
          <p className="mt-1 text-[11px] text-slate-400">Média por pedido hoje</p>
        </div>

        {/* Alertas de Estoque */}
        <div
          onClick={() => onNavigate("estoque")}
          className="group cursor-pointer rounded-2xl border border-slate-800 bg-[#121828] p-5 transition hover:border-slate-700 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Alertas de Estoque</span>
            <AlertTriangle className="h-5 w-5 text-amber-500" />
          </div>
          <p className="mt-2 text-xl font-bold text-white">
            {lowStockFilaments.length} Filamento(s)
          </p>
          <p className="mt-0.5 text-xs text-slate-400">Abaixo de 200g</p>
          {lowStockFilaments.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {lowStockFilaments.map((f) => (
                <span
                  key={f.id}
                  className="rounded-md border border-amber-500/30 bg-amber-950/40 px-2 py-0.5 text-[11px] font-medium text-amber-300"
                >
                  {f.name}: {f.weightRemainingGrams}g
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Mais Vendidos & Mais Lucrativos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Mais Vendidos (Hoje) */}
        <div className="rounded-2xl border border-slate-800 bg-[#121828] p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white">Mais Vendidos (Hoje)</h3>
              <p className="text-[11px] text-slate-400">Ranking por volume de unidades</p>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
              <Box className="h-4 w-4" />
            </div>
          </div>

          <div className="mt-4">
            {orders.length === 0 ? (
              <p className="py-6 text-center text-xs text-slate-500">Nenhuma venda hoje ainda.</p>
            ) : (
              <div className="flex flex-col gap-2">
                {orders.slice(0, 3).map((ord, idx) => (
                  <div
                    key={ord.id}
                    className="flex items-center justify-between rounded-xl bg-[#0c1220] p-3 text-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-800 text-[10px] font-bold text-slate-300">
                        {idx + 1}
                      </span>
                      <span className="font-semibold text-slate-200">{ord.productName}</span>
                    </div>
                    <span className="font-bold text-blue-400">{ord.quantity} un.</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Mais Lucrativos (Hoje) */}
        <div className="rounded-2xl border border-slate-800 bg-[#121828] p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white">Mais Lucrativos (Hoje)</h3>
              <p className="text-[11px] text-slate-400">Ranking por margem estimada</p>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
              <DollarSign className="h-4 w-4" />
            </div>
          </div>

          <div className="mt-4">
            {orders.length === 0 ? (
              <p className="py-6 text-center text-xs text-slate-500">Nenhuma venda lucrativa hoje.</p>
            ) : (
              <div className="flex flex-col gap-2">
                {orders.slice(0, 3).map((ord) => (
                  <div
                    key={ord.id}
                    className="flex items-center justify-between rounded-xl bg-[#0c1220] p-3 text-xs"
                  >
                    <span className="font-semibold text-slate-200">{ord.productName}</span>
                    <span className="font-bold text-emerald-400">
                      +R$ {(ord.totalPrice * 0.58).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

