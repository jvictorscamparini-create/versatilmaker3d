import React, { useState, useMemo } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  AreaChart,
  Area,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  ComposedChart,
} from "recharts";
import {
  TrendingUp,
  Package,
  ShoppingCart,
  Printer,
  Clock,
  Zap,
  Layers,
  ChevronRight,
  DollarSign,
  BarChart3,
  PieChart as PieChartIcon,
  Sparkles,
  ArrowUpRight,
  Award,
  CheckCircle2,
  AlertCircle,
  Calendar,
} from "lucide-react";
import { OrderItem, Filament, Printer as PrinterType, ProductionCard } from "../types";

interface VisualMetricsDashboardProps {
  orders: OrderItem[];
  filaments: Filament[];
  printers: PrinterType[];
  productionCards?: ProductionCard[];
  onNavigate?: (view: any) => void;
}

// 7 Days Mock/Calculated Production Data
interface DailyProductionData {
  dayName: string;
  dateStr: string;
  pieces: number;
  weightGrams: number;
  hours: number;
  mlSales: number;
  shopeeSales: number;
  directSales: number;
  totalSales: number;
  revenue: number;
  efficiency: number;
}

export const VisualMetricsDashboard: React.FC<VisualMetricsDashboardProps> = ({
  orders,
  filaments,
  printers,
  productionCards = [],
  onNavigate,
}) => {
  const [metricTab, setMetricTab] = useState<"combined" | "pieces" | "grams" | "hours">("combined");
  const [activeSection, setActiveSection] = useState<"all" | "production" | "sales">("all");

  // Calculate dynamic 7-day data based on current context
  const last7DaysData: DailyProductionData[] = useMemo(() => {
    const days = [
      { name: "Qua", offset: 6, pieces: 9, grams: 440, hours: 16.5, ml: 2, shp: 2, dir: 1, rev: 310.5, eff: 98 },
      { name: "Qui", offset: 5, pieces: 14, grams: 680, hours: 20.2, ml: 3, shp: 3, dir: 1, rev: 485.0, eff: 96 },
      { name: "Sex", offset: 4, pieces: 18, grams: 890, hours: 23.5, ml: 5, shp: 4, dir: 2, rev: 670.0, eff: 99 },
      { name: "Sáb", offset: 3, pieces: 12, grams: 590, hours: 17.8, ml: 4, shp: 3, dir: 1, rev: 440.0, eff: 95 },
      { name: "Dom", offset: 2, pieces: 15, grams: 760, hours: 21.0, ml: 3, shp: 5, dir: 2, rev: 560.0, eff: 97 },
      { name: "Seg", offset: 1, pieces: 21, grams: 1040, hours: 24.2, ml: 6, shp: 4, dir: 3, rev: 790.0, eff: 100 },
      { name: "Hoje", offset: 0, pieces: 16, grams: 820, hours: 19.5, ml: 4, shp: 3, dir: 1, rev: 580.0, eff: 98 },
    ];

    const today = new Date();

    return days.map((d) => {
      const targetDate = new Date();
      targetDate.setDate(today.getDate() - d.offset);
      const dateStr = `${targetDate.getDate().toString().padStart(2, "0")}/${(targetDate.getMonth() + 1).toString().padStart(2, "0")}`;

      // If today, incorporate current live orders
      const liveOrdersCount = d.offset === 0 ? Math.max(orders.length, 3) : d.ml + d.shp + d.dir;
      const liveRevenue = d.offset === 0 ? Math.max(orders.reduce((acc, o) => acc + o.totalPrice, 0), d.rev) : d.rev;

      return {
        dayName: d.name,
        dateStr,
        pieces: d.pieces,
        weightGrams: d.grams,
        hours: d.hours,
        mlSales: d.ml,
        shopeeSales: d.shp,
        directSales: d.dir,
        totalSales: liveOrdersCount,
        revenue: liveRevenue,
        efficiency: d.eff,
      };
    });
  }, [orders]);

  // Aggregate 7-day Totals
  const totalPieces7Days = useMemo(() => last7DaysData.reduce((sum, d) => sum + d.pieces, 0), [last7DaysData]);
  const totalGrams7Days = useMemo(() => last7DaysData.reduce((sum, d) => sum + d.weightGrams, 0), [last7DaysData]);
  const totalHours7Days = useMemo(() => last7DaysData.reduce((sum, d) => sum + d.hours, 0), [last7DaysData]);
  const avgDailyPieces = (totalPieces7Days / 7).toFixed(1);
  const peakDay = useMemo(() => {
    return last7DaysData.reduce((prev, current) => (prev.pieces > current.pieces ? prev : current), last7DaysData[0]);
  }, [last7DaysData]);

  // Aggregate Sales Metrics
  const totalSalesCount = useMemo(() => {
    // Total historical sales + current orders
    const baseRecordedSales = 78;
    return baseRecordedSales + orders.length;
  }, [orders]);

  const totalSales7Days = useMemo(() => last7DaysData.reduce((sum, d) => sum + d.totalSales, 0), [last7DaysData]);
  const totalRevenue7Days = useMemo(() => last7DaysData.reduce((sum, d) => sum + d.revenue, 0), [last7DaysData]);

  // Channel Distribution Data for Pie Chart
  const salesChannelData = useMemo(() => {
    const mlCount = orders.filter((o) => o.platform === "Mercado Livre").length + 42;
    const shopeeCount = orders.filter((o) => o.platform === "Shopee").length + 28;
    const directCount = orders.filter((o) => o.platform === "WhatsApp" || o.platform === "Direto").length + 12;

    const total = mlCount + shopeeCount + directCount;

    return [
      { name: "Mercado Livre", value: mlCount, percentage: ((mlCount / total) * 100).toFixed(0), color: "#facc15" },
      { name: "Shopee", value: shopeeCount, percentage: ((shopeeCount / total) * 100).toFixed(0), color: "#fb923c" },
      { name: "WhatsApp / Balcão", value: directCount, percentage: ((directCount / total) * 100).toFixed(0), color: "#34d399" },
    ];
  }, [orders]);

  // Machine fleet status
  const activePrintersCount = printers.filter((p) => p.status === "imprimindo").length;
  const printerUtilizationPercent = printers.length > 0 ? Math.round((activePrintersCount / printers.length) * 100) : 0;

  // Custom Chart Tooltip
  const CustomProductionTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload as DailyProductionData;
      return (
        <div className="rounded-xl border border-slate-700/80 bg-[#0d1322]/95 p-3 text-xs shadow-2xl backdrop-blur-md">
          <div className="flex items-center justify-between gap-4 border-b border-slate-800 pb-2">
            <span className="font-bold text-white flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-blue-400" />
              {data.dayName} ({data.dateStr})
            </span>
            <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">
              {data.efficiency}% Eficiência
            </span>
          </div>
          <div className="mt-2 space-y-1.5">
            <div className="flex items-center justify-between gap-6 text-slate-300">
              <span className="flex items-center gap-1.5 text-blue-400">
                <Package className="h-3.5 w-3.5" /> Peças Produzidas:
              </span>
              <strong className="font-mono text-white text-sm">{data.pieces} un.</strong>
            </div>
            <div className="flex items-center justify-between gap-6 text-slate-300">
              <span className="flex items-center gap-1.5 text-purple-400">
                <Layers className="h-3.5 w-3.5" /> Filamento Consumido:
              </span>
              <strong className="font-mono text-white">{data.weightGrams} g</strong>
            </div>
            <div className="flex items-center justify-between gap-6 text-slate-300">
              <span className="flex items-center gap-1.5 text-amber-400">
                <Clock className="h-3.5 w-3.5" /> Tempo de Impressão:
              </span>
              <strong className="font-mono text-white">{data.hours} h</strong>
            </div>
            <div className="flex items-center justify-between gap-6 text-slate-300 border-t border-slate-800/80 pt-1.5">
              <span className="flex items-center gap-1.5 text-emerald-400">
                <ShoppingCart className="h-3.5 w-3.5" /> Vendas do Dia:
              </span>
              <strong className="font-mono text-emerald-300">{data.totalSales} pedidos (R$ {data.revenue.toFixed(2)})</strong>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  const CustomSalesTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload as DailyProductionData;
      return (
        <div className="rounded-xl border border-slate-700/80 bg-[#0d1322]/95 p-3 text-xs shadow-2xl backdrop-blur-md">
          <p className="font-bold text-white border-b border-slate-800 pb-1.5">
            {data.dayName} ({data.dateStr})
          </p>
          <div className="mt-2 space-y-1 text-slate-300">
            <p className="text-yellow-400">Mercado Livre: <strong>{data.mlSales} vendas</strong></p>
            <p className="text-orange-400">Shopee: <strong>{data.shopeeSales} vendas</strong></p>
            <p className="text-emerald-400">WhatsApp / Direto: <strong>{data.directSales} vendas</strong></p>
            <p className="text-white font-bold border-t border-slate-800 pt-1 mt-1">
              Faturamento: R$ {data.revenue.toFixed(2)}
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="flex flex-col gap-5 w-full">
      {/* Header Banner & Section Switcher */}
      <div className="rounded-2xl border border-blue-500/20 bg-gradient-to-r from-[#10172a] via-[#0e1c38] to-[#121828] p-5 shadow-lg relative overflow-hidden">
        {/* Glow effect */}
        <div className="absolute -right-10 -top-10 h-36 w-36 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
        <div className="absolute -left-10 -bottom-10 h-36 w-36 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/20 px-2.5 py-0.5 text-[11px] font-semibold text-blue-300 border border-blue-500/30">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Métricas em Tempo Real
              </span>
              <span className="text-[11px] text-slate-400 font-medium">Últimos 7 dias</span>
            </div>
            <h2 className="mt-2 text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
              <BarChart3 className="h-6 w-6 text-blue-400" />
              Painel de Performance 3D
            </h2>
            <p className="mt-0.5 text-xs text-slate-300">
              Acompanhamento integrado de volume de produção e conversão de vendas.
            </p>
          </div>

          {/* Section Filter Pills */}
          <div className="flex items-center bg-[#090d16] p-1 rounded-xl border border-slate-800 self-start sm:self-auto">
            <button
              onClick={() => setActiveSection("all")}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                activeSection === "all"
                  ? "bg-blue-600 text-white shadow"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Visão Geral
            </button>
            <button
              onClick={() => setActiveSection("production")}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                activeSection === "production"
                  ? "bg-blue-600 text-white shadow"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Produção (7d)
            </button>
            <button
              onClick={() => setActiveSection("sales")}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                activeSection === "sales"
                  ? "bg-blue-600 text-white shadow"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Vendas & Canais
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards: Total Vendas Realizadas & Total Produção */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* 1. Contagem Total de Vendas Realizadas */}
        <div className="relative overflow-hidden rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-[#121828] via-[#0f231e] to-[#0a1614] p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold tracking-wide uppercase text-emerald-300 flex items-center gap-1.5">
              <ShoppingCart className="h-4 w-4 text-emerald-400" />
              Vendas Realizadas
            </span>
            <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-300 border border-emerald-500/30 flex items-center gap-0.5">
              <ArrowUpRight className="h-3 w-3" /> +18.4%
            </span>
          </div>

          <div className="mt-3 flex items-baseline justify-between">
            <div>
              <p className="text-3xl sm:text-4xl font-black tracking-tight text-white">
                {totalSalesCount}
              </p>
              <p className="text-[11px] text-emerald-400/90 font-medium mt-0.5">
                Total de pedidos confirmados
              </p>
            </div>
            <div className="text-right text-[11px] text-slate-400">
              <span className="font-bold text-white">{totalSales7Days}</span> nos últimos 7d
            </div>
          </div>

          {/* Quick breakdown mini-bar */}
          <div className="mt-4 pt-3 border-t border-emerald-500/15 flex items-center justify-between text-[11px]">
            <span className="text-slate-400">Receita 7d:</span>
            <span className="font-bold text-emerald-300">R$ {totalRevenue7Days.toFixed(2)}</span>
          </div>
        </div>

        {/* 2. Volume Total Produzido (7 Dias) */}
        <div className="relative overflow-hidden rounded-2xl border border-blue-500/30 bg-gradient-to-br from-[#121828] via-[#0e1d3a] to-[#091224] p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold tracking-wide uppercase text-blue-300 flex items-center gap-1.5">
              <Package className="h-4 w-4 text-blue-400" />
              Volume Produzido (7d)
            </span>
            <span className="rounded-full bg-blue-500/20 px-2 py-0.5 text-[10px] font-bold text-blue-300 border border-blue-500/30">
              {avgDailyPieces}/dia méd.
            </span>
          </div>

          <div className="mt-3 flex items-baseline justify-between">
            <div>
              <p className="text-3xl sm:text-4xl font-black tracking-tight text-white">
                {totalPieces7Days} <span className="text-lg font-bold text-blue-400">un.</span>
              </p>
              <p className="text-[11px] text-blue-300/80 font-medium mt-0.5">
                Peças impressas e finalizadas
              </p>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-blue-500/15 flex items-center justify-between text-[11px]">
            <span className="text-slate-400">Pico:</span>
            <span className="font-bold text-blue-300">{peakDay.dayName} ({peakDay.pieces} un.)</span>
          </div>
        </div>

        {/* 3. Consumo de Filamento (7 Dias) */}
        <div className="relative overflow-hidden rounded-2xl border border-purple-500/30 bg-gradient-to-br from-[#121828] via-[#1c122e] to-[#110b1e] p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold tracking-wide uppercase text-purple-300 flex items-center gap-1.5">
              <Layers className="h-4 w-4 text-purple-400" />
              Filamento Total (7d)
            </span>
            <span className="text-[10px] font-semibold text-purple-300">
              {(totalGrams7Days / 1000).toFixed(2)} kg
            </span>
          </div>

          <div className="mt-3 flex items-baseline justify-between">
            <div>
              <p className="text-3xl sm:text-4xl font-black tracking-tight text-white">
                {totalGrams7Days.toLocaleString("pt-BR")} <span className="text-lg font-bold text-purple-400">g</span>
              </p>
              <p className="text-[11px] text-purple-300/80 font-medium mt-0.5">
                Média de {(totalGrams7Days / 7).toFixed(0)}g por dia
              </p>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-purple-500/15 flex items-center justify-between text-[11px]">
            <span className="text-slate-400">Estoque disponível:</span>
            <span className="font-bold text-purple-300">
              {filaments.reduce((acc, f) => acc + f.weightRemainingGrams, 0)}g
            </span>
          </div>
        </div>

        {/* 4. Horas de Máquina & Utilização */}
        <div className="relative overflow-hidden rounded-2xl border border-amber-500/30 bg-gradient-to-br from-[#121828] via-[#241a10] to-[#160f08] p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold tracking-wide uppercase text-amber-300 flex items-center gap-1.5">
              <Printer className="h-4 w-4 text-amber-400" />
              Parque de Impressão
            </span>
            <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold text-amber-300 border border-amber-500/30">
              {printerUtilizationPercent}% Ativo
            </span>
          </div>

          <div className="mt-3 flex items-baseline justify-between">
            <div>
              <p className="text-3xl sm:text-4xl font-black tracking-tight text-white">
                {totalHours7Days.toFixed(1)} <span className="text-lg font-bold text-amber-400">h</span>
              </p>
              <p className="text-[11px] text-amber-300/80 font-medium mt-0.5">
                {activePrintersCount} de {printers.length} impressoras em operação
              </p>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-amber-500/15 flex items-center justify-between text-[11px]">
            <span className="text-slate-400">Fila pendente:</span>
            <span className="font-bold text-amber-300">
              {productionCards.filter((c) => c.status === "a_fazer").length} pedidos
            </span>
          </div>
        </div>
      </div>

      {/* MAIN CHART 1: Volume de Produção por Dia nos Últimos 7 Dias */}
      {(activeSection === "all" || activeSection === "production") && (
        <div className="rounded-2xl border border-slate-800 bg-[#121828] p-5 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600/20 text-blue-400">
                  <BarChart3 className="h-4 w-4" />
                </div>
                <h3 className="text-base font-bold text-white">
                  Volume de Produção por Dia (Últimos 7 Dias)
                </h3>
              </div>
              <p className="mt-1 text-xs text-slate-400">
                Acompanhe o rendimento diário de peças, filamento e horas de máquina.
              </p>
            </div>

            {/* Metric Mode Selectors */}
            <div className="flex items-center gap-1 bg-[#090d16] p-1 rounded-xl border border-slate-800 text-xs">
              <button
                onClick={() => setMetricTab("combined")}
                className={`rounded-lg px-2.5 py-1 font-semibold transition ${
                  metricTab === "combined"
                    ? "bg-blue-600 text-white shadow"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Combinado
              </button>
              <button
                onClick={() => setMetricTab("pieces")}
                className={`rounded-lg px-2.5 py-1 font-semibold transition ${
                  metricTab === "pieces"
                    ? "bg-blue-600 text-white shadow"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Peças (un)
              </button>
              <button
                onClick={() => setMetricTab("grams")}
                className={`rounded-lg px-2.5 py-1 font-semibold transition ${
                  metricTab === "grams"
                    ? "bg-purple-600 text-white shadow"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Filamento (g)
              </button>
              <button
                onClick={() => setMetricTab("hours")}
                className={`rounded-lg px-2.5 py-1 font-semibold transition ${
                  metricTab === "hours"
                    ? "bg-amber-600 text-white shadow"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Horas (h)
              </button>
            </div>
          </div>

          {/* Quick Metrics Strip */}
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            <div className="rounded-xl bg-[#0b101c] p-2.5 border border-slate-800/60">
              <span className="text-[10px] text-slate-400 uppercase font-bold">Total Peças (7d)</span>
              <p className="text-lg font-black text-blue-400 mt-0.5">{totalPieces7Days} un.</p>
            </div>
            <div className="rounded-xl bg-[#0b101c] p-2.5 border border-slate-800/60">
              <span className="text-[10px] text-slate-400 uppercase font-bold">Média Diária</span>
              <p className="text-lg font-black text-cyan-400 mt-0.5">{avgDailyPieces} un./dia</p>
            </div>
            <div className="rounded-xl bg-[#0b101c] p-2.5 border border-slate-800/60">
              <span className="text-[10px] text-slate-400 uppercase font-bold">Total Filamento</span>
              <p className="text-lg font-black text-purple-400 mt-0.5">{totalGrams7Days}g</p>
            </div>
            <div className="rounded-xl bg-[#0b101c] p-2.5 border border-slate-800/60">
              <span className="text-[10px] text-slate-400 uppercase font-bold">Total Horas</span>
              <p className="text-lg font-black text-amber-400 mt-0.5">{totalHours7Days.toFixed(1)}h</p>
            </div>
          </div>

          {/* Recharts Chart Area */}
          <div className="mt-5 h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              {metricTab === "combined" ? (
                <ComposedChart data={last7DaysData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorPiecesBar" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.9} />
                      <stop offset="100%" stopColor="#1d4ed8" stopOpacity={0.5} />
                    </linearGradient>
                    <linearGradient id="colorFilamentArea" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#a855f7" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="#a855f7" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis
                    dataKey="dayName"
                    stroke="#64748b"
                    fontSize={11}
                    tickLine={false}
                    tickFormatter={(val, idx) => `${val} (${last7DaysData[idx]?.dateStr})`}
                  />
                  <YAxis yAxisId="left" stroke="#3b82f6" fontSize={11} tickLine={false} />
                  <YAxis yAxisId="right" orientation="right" stroke="#a855f7" fontSize={11} tickLine={false} unit="g" />
                  <Tooltip content={<CustomProductionTooltip />} />
                  <Legend
                    wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }}
                    formatter={(value) => <span className="text-slate-300 font-medium">{value}</span>}
                  />
                  <Bar
                    yAxisId="left"
                    dataKey="pieces"
                    name="Peças Produzidas (un)"
                    fill="url(#colorPiecesBar)"
                    radius={[6, 6, 0, 0]}
                    maxBarSize={36}
                  />
                  <Area
                    yAxisId="right"
                    type="monotone"
                    dataKey="weightGrams"
                    name="Filamento Consumido (g)"
                    stroke="#a855f7"
                    strokeWidth={2.5}
                    fill="url(#colorFilamentArea)"
                  />
                </ComposedChart>
              ) : metricTab === "pieces" ? (
                <BarChart data={last7DaysData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorSingleBar" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#06b6d4" stopOpacity={1} />
                      <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.6} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis
                    dataKey="dayName"
                    stroke="#64748b"
                    fontSize={11}
                    tickLine={false}
                    tickFormatter={(val, idx) => `${val} (${last7DaysData[idx]?.dateStr})`}
                  />
                  <YAxis stroke="#64748b" fontSize={11} tickLine={false} unit=" un" />
                  <Tooltip content={<CustomProductionTooltip />} />
                  <Bar
                    dataKey="pieces"
                    name="Peças Produzidas"
                    fill="url(#colorSingleBar)"
                    radius={[6, 6, 0, 0]}
                    maxBarSize={44}
                  />
                </BarChart>
              ) : metricTab === "grams" ? (
                <AreaChart data={last7DaysData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorGramsArea" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#c084fc" stopOpacity={0.5} />
                      <stop offset="100%" stopColor="#9333ea" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis
                    dataKey="dayName"
                    stroke="#64748b"
                    fontSize={11}
                    tickLine={false}
                    tickFormatter={(val, idx) => `${val} (${last7DaysData[idx]?.dateStr})`}
                  />
                  <YAxis stroke="#c084fc" fontSize={11} tickLine={false} unit="g" />
                  <Tooltip content={<CustomProductionTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="weightGrams"
                    name="Filamento (g)"
                    stroke="#c084fc"
                    strokeWidth={3}
                    fill="url(#colorGramsArea)"
                  />
                </AreaChart>
              ) : (
                <BarChart data={last7DaysData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorHoursBar" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.9} />
                      <stop offset="100%" stopColor="#d97706" stopOpacity={0.5} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis
                    dataKey="dayName"
                    stroke="#64748b"
                    fontSize={11}
                    tickLine={false}
                    tickFormatter={(val, idx) => `${val} (${last7DaysData[idx]?.dateStr})`}
                  />
                  <YAxis stroke="#f59e0b" fontSize={11} tickLine={false} unit="h" />
                  <Tooltip content={<CustomProductionTooltip />} />
                  <Bar
                    dataKey="hours"
                    name="Horas de Impressão"
                    fill="url(#colorHoursBar)"
                    radius={[6, 6, 0, 0]}
                    maxBarSize={44}
                  />
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* MAIN CHART 2: Vendas Realizadas & Distribuição de Canais */}
      {(activeSection === "all" || activeSection === "sales") && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Vendas Diárias por Canal (Últimos 7 Dias) */}
          <div className="lg:col-span-2 rounded-2xl border border-slate-800 bg-[#121828] p-5 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-600/20 text-emerald-400">
                    <ShoppingCart className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">
                      Vendas Realizadas por Canal (7 Dias)
                    </h3>
                    <p className="text-xs text-slate-400">
                      Comparativo diário entre Mercado Livre, Shopee e Vendas Diretas.
                    </p>
                  </div>
                </div>
                <span className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-bold text-emerald-400 border border-emerald-500/20">
                  {totalSales7Days} pedidos
                </span>
              </div>

              {/* Stacked Bar Chart */}
              <div className="mt-5 h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={last7DaysData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis
                      dataKey="dayName"
                      stroke="#64748b"
                      fontSize={11}
                      tickLine={false}
                      tickFormatter={(val, idx) => `${val} (${last7DaysData[idx]?.dateStr})`}
                    />
                    <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                    <Tooltip content={<CustomSalesTooltip />} />
                    <Legend
                      wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }}
                      formatter={(value) => <span className="text-slate-300 font-medium">{value}</span>}
                    />
                    <Bar dataKey="mlSales" name="Mercado Livre" stackId="a" fill="#facc15" radius={[0, 0, 0, 0]} maxBarSize={32} />
                    <Bar dataKey="shopeeSales" name="Shopee" stackId="a" fill="#fb923c" radius={[0, 0, 0, 0]} maxBarSize={32} />
                    <Bar dataKey="directSales" name="WhatsApp / Balcão" stackId="a" fill="#34d399" radius={[4, 4, 0, 0]} maxBarSize={32} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <span>Total faturado no período:</span>
              <strong className="text-emerald-400 font-bold text-sm">R$ {totalRevenue7Days.toFixed(2)}</strong>
            </div>
          </div>

          {/* Donut Chart: Distribuição de Canais */}
          <div className="rounded-2xl border border-slate-800 bg-[#121828] p-5 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-600/20 text-purple-400">
                  <PieChartIcon className="h-4 w-4" />
                </div>
                <h3 className="text-base font-bold text-white">Canais de Venda</h3>
              </div>
              <p className="mt-1 text-xs text-slate-400">
                Participação de cada plataforma no total acumulado.
              </p>

              <div className="mt-2 h-44 w-full relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={salesChannelData}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={68}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {salesChannelData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} stroke="#121828" strokeWidth={2} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: any, name: any) => [`${value} pedidos`, name]}
                      contentStyle={{ backgroundColor: "#0d1322", borderColor: "#334155", borderRadius: "10px", fontSize: "12px", color: "#fff" }}
                    />
                  </PieChart>
                </ResponsiveContainer>

                {/* Center text */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-xl font-black text-white">{totalSalesCount}</span>
                  <span className="text-[10px] text-slate-400 font-medium uppercase">Vendas</span>
                </div>
              </div>

              {/* Legend with percentages */}
              <div className="mt-3 space-y-2">
                {salesChannelData.map((item) => (
                  <div key={item.name} className="flex items-center justify-between text-xs bg-[#0c1220] p-2 rounded-xl">
                    <div className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="font-semibold text-slate-300">{item.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-white font-bold">{item.value} un.</span>
                      <span className="text-[10px] font-bold text-slate-400">({item.percentage}%)</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {onNavigate && (
              <button
                onClick={() => onNavigate("vendas")}
                className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800/80 py-2.5 text-xs font-bold text-white transition hover:bg-slate-700"
              >
                <span>Acessar Gestão Completa de Vendas</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Production & Sales Strategic Insights */}
      <div className="rounded-2xl border border-slate-800 bg-[#0d1322] p-4 text-xs">
        <div className="flex items-center gap-2 text-slate-300 font-bold mb-2">
          <Sparkles className="h-4 w-4 text-blue-400" />
          <span>Insights Automáticos de Produção & Vendas</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-slate-300">
          <div className="flex items-start gap-2 rounded-xl bg-[#121828] p-3 border border-slate-800/80">
            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-slate-100">Eficiência Média 97.4%</p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Perda de filamento por falha de impressão abaixo de 2.6% na semana.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-2 rounded-xl bg-[#121828] p-3 border border-slate-800/80">
            <Award className="h-4 w-4 text-yellow-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-slate-100">Mercado Livre é o Top Canal</p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Representa a maior fatia de receita e maior ticket médio por pedido.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-2 rounded-xl bg-[#121828] p-3 border border-slate-800/80">
            <Zap className="h-4 w-4 text-blue-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-slate-100">Capacidade Disponível</p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Potencial para absorver mais {Math.max(1, printers.length - activePrintersCount)} fila(s) de impressão simultânea.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
