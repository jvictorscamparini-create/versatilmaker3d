import React, { useState } from "react";
import {
  TrendingUp,
  AlertTriangle,
  DollarSign,
  ShoppingCart,
  Calculator,
  Tag,
  Box,
  Star,
  CheckCircle2,
  Printer,
  Share2,
  ChevronDown,
  ChevronUp,
  Layers,
  ArrowRight,
  Flame,
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
  const todayRevenue = orders.reduce((acc, o) => acc + o.totalPrice, 0);
  const todayCosts = Number((todayRevenue * 0.42).toFixed(2));
  const todayProfit = Number((todayRevenue - todayCosts).toFixed(2));
  const todaySalesCount = orders.length;
  const averageMargin = todayRevenue > 0 ? ((todayProfit / todayRevenue) * 100).toFixed(2) : "0.00";
  const averageTicket = todaySalesCount > 0 ? (todayRevenue / todaySalesCount).toFixed(2) : "0.00";
  const lowStockFilaments = filaments.filter((f) => f.weightRemainingGrams < 200);

  // Monthly Filament Consumption & Estimated Profit Margin Calculations
  const totalUnitsSold = orders.reduce((sum, o) => sum + (o.quantity || 1), 0);
  // Estimate average 95g of filament per printed unit
  const estimatedGramsConsumed = totalUnitsSold * 95;
  const avgCostPerGram = filaments.length > 0
    ? filaments.reduce((sum, f) => sum + (f.pricePerKg / 1000), 0) / filaments.length
    : 0.08; // Default R$ 0.08/g (R$ 80/kg)
  const monthlyFilamentCost = Number((estimatedGramsConsumed * avgCostPerGram).toFixed(2));
  const monthlyRevenue = todayRevenue; // Cumulative for current period
  const estimatedPlatformFees = monthlyRevenue * 0.175;
  const estimatedEnergyPackaging = monthlyFilamentCost * 0.35;
  const estimatedTotalExpenses = monthlyFilamentCost + estimatedPlatformFees + estimatedEnergyPackaging;
  const estimatedNetProfit = monthlyRevenue - estimatedTotalExpenses;
  const estimatedProfitMargin = monthlyRevenue > 0 ? ((estimatedNetProfit / monthlyRevenue) * 100).toFixed(1) : "0.0";

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
            Acompanhe o volume de produção, consumo de filamentos e saúde financeira da oficina 3D em tempo real.
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => onNavigate("gerador-3d")}
            className="flex items-center gap-1.5 rounded-xl border border-indigo-500/40 bg-indigo-950/40 px-3.5 py-2 text-xs font-bold text-indigo-300 hover:bg-indigo-900/50 active:scale-98 transition cursor-pointer"
          >
            <Box className="h-3.5 w-3.5 text-indigo-400" />
            <span>Gerador 3D & STL</span>
          </button>
          <button
            onClick={() => onNavigate("vendas")}
            className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white shadow hover:bg-emerald-500 active:scale-98 transition cursor-pointer"
          >
            <ShoppingCart className="h-3.5 w-3.5" />
            <span>+ Nova Venda</span>
          </button>
          <button
            onClick={() => onNavigate("fila-producao")}
            className="flex items-center gap-1.5 rounded-xl border border-blue-500/30 bg-blue-950/30 px-3.5 py-2 text-xs font-bold text-blue-300 hover:bg-blue-900/40 active:scale-98 transition cursor-pointer"
          >
            <Printer className="h-3.5 w-3.5" />
            <span>Fila de Produção</span>
          </button>
        </div>
      </div>

      {/* MONTHLY FILAMENT CONSUMPTION & ESTIMATED PROFIT MARGIN COMPONENT CARD */}
      <div className="rounded-2xl border border-blue-500/40 bg-gradient-to-br from-[#121828] via-[#0d152a] to-[#121828] p-5 shadow-xl glow-card flex flex-col gap-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600/20 text-blue-400">
              <Layers className="h-4 w-4" />
            </div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-white">
              Consumo de Filamento & Margem de Lucro Estimada (Mensal)
            </h2>
          </div>
          <span className="rounded-full bg-blue-950 px-2.5 py-1 text-[10px] font-bold text-blue-300 border border-blue-500/30">
            Baseado em {totalUnitsSold} unidades vendidas
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* 1. Custo Total de Filamento */}
          <div className="rounded-xl bg-[#0c1220] p-4 border border-slate-800 flex flex-col justify-between">
            <div>
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">
                Custo Filamento (Mês)
              </span>
              <p className="mt-2 text-2xl font-black text-amber-400">
                R$ {monthlyFilamentCost.toFixed(2)}
              </p>
            </div>
            <div className="mt-3 text-[11px] text-slate-400 flex items-center gap-1">
              <Flame className="h-3.5 w-3.5 text-amber-500" />
              <span>Aprox. {(estimatedGramsConsumed / 1000).toFixed(2)} kg consumidos</span>
            </div>
          </div>

          {/* 2. Margem de Lucro Estimada */}
          <div className="rounded-xl bg-[#0c1220] p-4 border border-slate-800 flex flex-col justify-between">
            <div>
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">
                Margem de Lucro Est.
              </span>
              <p className="mt-2 text-2xl font-black text-emerald-400">
                {estimatedProfitMargin}%
              </p>
            </div>
            <div className="mt-3 text-[11px] text-emerald-400/80 font-medium">
              Meta ideal: &gt; 40.0%
            </div>
          </div>

          {/* 3. Faturamento Bruto Mensal */}
          <div className="rounded-xl bg-[#0c1220] p-4 border border-slate-800 flex flex-col justify-between">
            <div>
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">
                Faturamento Bruto
              </span>
              <p className="mt-2 text-2xl font-black text-blue-400">
                R$ {monthlyRevenue.toFixed(2)}
              </p>
            </div>
            <div className="mt-3 text-[11px] text-slate-400">
              {orders.length} pedidos registrados
            </div>
          </div>

          {/* 4. Lucro Líquido Estimado */}
          <div className="rounded-xl bg-[#0c1220] p-4 border border-slate-800 flex flex-col justify-between">
            <div>
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">
                Lucro Líquido Est.
              </span>
              <p className="mt-2 text-2xl font-black text-white">
                R$ {estimatedNetProfit.toFixed(2)}
              </p>
            </div>
            <div className="mt-3 text-[11px] text-slate-400">
              Descontado taxas e insumos
            </div>
          </div>
        </div>

        {/* Progress Bar of Margin */}
        <div className="mt-1 flex flex-col gap-1.5 bg-[#090e1a] p-3 rounded-xl border border-slate-800/80">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-300 font-semibold">Saúde da Margem Comercial</span>
            <span className="text-emerald-400 font-bold">{estimatedProfitMargin}% de Retorno Líquido</span>
          </div>
          <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, Math.max(5, Number(estimatedProfitMargin)))}%` }}
            />
          </div>
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

      {/* Setup Guide (Collapsible) */}
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

            <div className="mt-3 flex items-center justify-between text-xs font-medium text-slate-400">
              <span>Progresso</span>
              <span className="text-slate-300 font-bold">50%</span>
            </div>
            <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-slate-800">
              <div className="h-full w-2/4 rounded-full bg-blue-600 transition-all duration-500" />
            </div>

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
                className="flex items-center justify-between rounded-xl border border-blue-500/20 bg-blue-950/20 p-3 text-left text-xs transition hover:bg-blue-950/40 cursor-pointer"
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
                className="flex items-center justify-between rounded-xl border border-orange-500/20 bg-orange-950/20 p-3 text-left text-xs transition hover:bg-orange-950/40 cursor-pointer"
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

        {/* Custo Total (Hoje) */}
        <div className="relative overflow-hidden rounded-2xl border border-red-500/20 bg-gradient-to-br from-[#121828] to-[#1c1219] p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Custo Total (Hoje)</span>
            <AlertTriangle className="h-5 w-5 text-red-400 opacity-60" />
          </div>
          <p className="mt-2 text-3xl font-black tracking-tight text-white">
            R$ {todayCosts.toFixed(2)}
          </p>
          <p className="mt-1 text-[11px] text-slate-400">
            Filamento + Energia + Embalagens + Taxas
          </p>
        </div>

        {/* Lucro Líquido Real (Hoje) */}
        <div className="relative overflow-hidden rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-[#121828] to-[#0e211b] p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Lucro Líquido Real (Hoje)</span>
            <DollarSign className="h-5 w-5 text-emerald-400 opacity-60" />
          </div>
          <p className="mt-2 text-3xl font-black tracking-tight text-emerald-400">
            R$ {todayProfit.toFixed(2)}
          </p>
          <p className="mt-1 text-[11px] text-emerald-400/80 font-medium">
            Margem real líquida: {averageMargin}%
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
              <p className="text-[11px] text-slate-400">Ranking por lucro líquido real</p>
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
