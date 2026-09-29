import React, { useState } from "react";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Plus,
  Calendar,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  Receipt,
  FileText,
  Download,
  CheckCircle2,
  Filter,
  Sparkles,
  Printer,
  ChevronDown,
  Building2,
  Trash2,
  X,
  Layers,
} from "lucide-react";
import { OrderItem } from "../types";
import { generateMonthlyFinancialPdf, ExpenseItem } from "../utils/financialPdfGenerator";

interface FinancialViewProps {
  orders: OrderItem[];
}

export const FinancialView: React.FC<FinancialViewProps> = ({ orders }) => {
  const [selectedMonth, setSelectedMonth] = useState<string>("Setembro");
  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [workshopName, setWorkshopName] = useState<string>("Oficina 3D Maker & Prototipagem");
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"todos" | "vendas" | "despesas">("todos");

  const [expenses, setExpenses] = useState<ExpenseItem[]>([
    { id: "e1", desc: "3x Rolos Filamento PLA Silk Voolt3D", category: "Insumos", amount: 390.0, date: "12/09/2026" },
    { id: "e2", desc: "Lote 50 Caixas de Envio Papelão Reforçado", category: "Embalagens", amount: 125.0, date: "10/09/2026" },
    { id: "e3", desc: "Conta de Energia Elétrica (Oficina)", category: "Energia", amount: 184.5, date: "05/09/2026" },
    { id: "e4", desc: "Bicos de Latão 0.4mm Hardened Steel", category: "Manutenção", amount: 48.0, date: "02/09/2026" },
    { id: "e5", desc: "Fita Adesiva Kraft & Plástico Bolha", category: "Embalagens", amount: 62.0, date: "14/09/2026" },
    { id: "e6", desc: "1x Rolo Filamento PETG Preto 1kg", category: "Insumos", amount: 110.0, date: "18/09/2026" },
  ]);

  const [newDesc, setNewDesc] = useState("");
  const [newCat, setNewCat] = useState("Insumos");
  const [newAmount, setNewAmount] = useState(90);

  // Financial Calculations
  const grossRevenue = orders.reduce((sum, o) => sum + o.totalPrice, 0);
  const totalOrdersCount = orders.length;
  const marketplaceOrders = orders.filter(
    (o) => o.platform === "Mercado Livre" || o.platform === "Shopee"
  );
  const marketplaceRevenue = marketplaceOrders.reduce((sum, o) => sum + o.totalPrice, 0);
  const marketplaceFees = Number((marketplaceRevenue * 0.175).toFixed(2));
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const netProfit = grossRevenue - marketplaceFees - totalExpenses;
  const marginPercent = grossRevenue > 0 ? ((netProfit / grossRevenue) * 100).toFixed(1) : "0.0";
  const averageTicket = totalOrdersCount > 0 ? (grossRevenue / totalOrdersCount).toFixed(2) : "0.00";

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDesc.trim()) return;

    const newExpense: ExpenseItem = {
      id: "e-" + Date.now(),
      desc: newDesc,
      category: newCat,
      amount: Number(newAmount) || 0,
      date: new Date().toLocaleDateString("pt-BR"),
    };

    setExpenses([newExpense, ...expenses]);
    setNewDesc("");
    setShowAddExpense(false);
    showToast("Despesa adicionada com sucesso!");
  };

  const handleDeleteExpense = (id: string) => {
    setExpenses(expenses.filter((e) => e.id !== id));
    showToast("Despesa removida.");
  };

  // PDF Generation with jsPDF
  const handleDownloadPdf = () => {
    try {
      setIsGeneratingPdf(true);
      const doc = generateMonthlyFinancialPdf({
        monthName: selectedMonth,
        year: selectedYear,
        orders,
        expenses,
        workshopName,
      });

      const fileName = `relatorio_financeiro_${selectedMonth.toLowerCase()}_${selectedYear}.pdf`;
      doc.save(fileName);
      showToast(`Relatório PDF mensal baixado com sucesso! (${fileName})`);
    } catch (err) {
      console.error("Erro ao gerar PDF:", err);
      showToast("Houve um problema ao gerar o PDF. Tente novamente.");
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-6 text-slate-100 flex flex-col gap-6">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2 rounded-xl border border-emerald-500/40 bg-emerald-950/95 px-4 py-3 text-xs font-bold text-emerald-200 shadow-2xl backdrop-blur-md animate-in slide-in-from-top-3">
          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          <span>{notification}</span>
        </div>
      )}

      {/* Header & Main Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600/20 text-emerald-400 border border-emerald-500/30">
              <Wallet className="h-5 w-5" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white leading-tight">
              Gestão Financeira & DRE
            </h1>
          </div>
          <p className="mt-1 text-xs text-slate-400">
            Controle de lucros líquidos reais, taxas de marketplaces e exportação de relatórios contábeis em PDF.
          </p>
        </div>

        {/* Action Buttons: Download PDF Report & Add Expense */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Period Selection */}
          <div className="flex items-center rounded-xl border border-slate-700 bg-[#121828] px-3 py-1.5 text-xs text-slate-200">
            <Calendar className="mr-2 h-3.5 w-3.5 text-blue-400" />
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-transparent font-bold text-white focus:outline-none cursor-pointer"
            >
              <option value="Janeiro" className="bg-slate-900">Janeiro</option>
              <option value="Fevereiro" className="bg-slate-900">Fevereiro</option>
              <option value="Março" className="bg-slate-900">Março</option>
              <option value="Abril" className="bg-slate-900">Abril</option>
              <option value="Maio" className="bg-slate-900">Maio</option>
              <option value="Junho" className="bg-slate-900">Junho</option>
              <option value="Julho" className="bg-slate-900">Julho</option>
              <option value="Agosto" className="bg-slate-900">Agosto</option>
              <option value="Setembro" className="bg-slate-900">Setembro</option>
              <option value="Outubro" className="bg-slate-900">Outubro</option>
              <option value="Novembro" className="bg-slate-900">Novembro</option>
              <option value="Dezembro" className="bg-slate-900">Dezembro</option>
            </select>
            <span className="mx-1 text-slate-500">/</span>
            <span className="font-bold text-slate-300">{selectedYear}</span>
          </div>

          {/* jsPDF Monthly Report Generator Button */}
          <button
            id="btn-generate-financial-pdf"
            onClick={handleDownloadPdf}
            disabled={isGeneratingPdf}
            className="flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-500 active:scale-98 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-blue-600/20 transition disabled:opacity-50"
            title="Gerar e baixar relatório executivo em PDF com jsPDF"
          >
            <FileText className="h-4 w-4" />
            <span>{isGeneratingPdf ? "Gerando Relatório..." : "Gerar Relatório PDF"}</span>
          </button>

          {/* Add Expense Button */}
          <button
            onClick={() => setShowAddExpense(true)}
            className="flex items-center gap-1.5 rounded-xl border border-red-500/30 bg-red-950/30 hover:bg-red-900/40 active:scale-98 px-3.5 py-2.5 text-xs font-bold text-red-300 transition"
          >
            <Plus className="h-4 w-4" />
            <span>+ Lançar Custo</span>
          </button>
        </div>
      </div>

      {/* Main KPI Highlight Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* 1. Receita Bruta */}
        <div className="relative overflow-hidden rounded-2xl border border-blue-500/20 bg-gradient-to-br from-[#121828] to-[#0d1c33] p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-300">
              Receita Bruta Total
            </span>
            <ArrowUpRight className="h-4 w-4 text-blue-400" />
          </div>
          <p className="mt-2 text-2xl sm:text-3xl font-black tracking-tight text-white">
            R$ {grossRevenue.toFixed(2)}
          </p>
          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-800/80 pt-2">
            <span>{totalOrdersCount} pedidos faturados</span>
            <span>Ticket: R$ {averageTicket}</span>
          </div>
        </div>

        {/* 2. Taxas & Deduções */}
        <div className="relative overflow-hidden rounded-2xl border border-amber-500/20 bg-gradient-to-br from-[#121828] to-[#22180d] p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-300">
              Taxas Marketplaces
            </span>
            <ArrowDownRight className="h-4 w-4 text-amber-400" />
          </div>
          <p className="mt-2 text-2xl sm:text-3xl font-black tracking-tight text-amber-400">
            -R$ {marketplaceFees.toFixed(2)}
          </p>
          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-800/80 pt-2">
            <span>Mercado Livre + Shopee</span>
            <span className="font-semibold text-amber-300">~17.5% médio</span>
          </div>
        </div>

        {/* 3. Despesas da Oficina */}
        <div className="relative overflow-hidden rounded-2xl border border-red-500/20 bg-gradient-to-br from-[#121828] to-[#241118] p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-red-300">
              Despesas & Insumos
            </span>
            <TrendingDown className="h-4 w-4 text-red-400" />
          </div>
          <p className="mt-2 text-2xl sm:text-3xl font-black tracking-tight text-red-400">
            -R$ {totalExpenses.toFixed(2)}
          </p>
          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-800/80 pt-2">
            <span>{expenses.length} custos lançados</span>
            <span className="text-red-300">Filamento, energia, caixas</span>
          </div>
        </div>

        {/* 4. Lucro Líquido Real (Destaque Principal) */}
        <div className="relative overflow-hidden rounded-2xl border border-emerald-500/40 bg-gradient-to-br from-[#121828] via-[#0d221a] to-[#0a2e20] p-5 shadow-lg shadow-emerald-950/40">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-emerald-300">
              LUCRO LÍQUIDO REAL
            </span>
            <span className="rounded-full bg-emerald-500/20 border border-emerald-500/40 px-2 py-0.5 text-[10px] font-bold text-emerald-300">
              Margem {marginPercent}%
            </span>
          </div>
          <p className="mt-2 text-2xl sm:text-3xl font-black tracking-tight text-emerald-400">
            R$ {netProfit.toFixed(2)}
          </p>
          <div className="mt-2 flex items-center justify-between text-[11px] text-emerald-300/90 border-t border-emerald-500/20 pt-2">
            <span>Valor livre no caixa</span>
            <span className="font-bold">100% auditado</span>
          </div>
        </div>
      </div>

      {/* DRE Sintético Card & PDF Quick Export Banner */}
      <div className="rounded-2xl border border-slate-800 bg-[#121828] p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Receipt className="h-4 w-4 text-blue-400" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              Demonstrativo de Resultado do Exercício (DRE 3D)
            </h2>
          </div>
          <button
            onClick={handleDownloadPdf}
            className="flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 font-semibold hover:underline"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Exportar este DRE em PDF (jsPDF)</span>
          </button>
        </div>

        {/* DRE Summary Table */}
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-semibold">
                <th className="py-2 px-3">Estrutura de Resultados</th>
                <th className="py-2 px-3">Origem / Referência</th>
                <th className="py-2 px-3 text-right">Valor Consolidado</th>
                <th className="py-2 px-3 text-right">% Receita</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              <tr className="bg-blue-950/10 font-bold text-white">
                <td className="py-2 px-3 text-blue-300">(+) RECEITA BRUTA DE VENDAS</td>
                <td className="py-2 px-3 text-slate-400">{totalOrdersCount} pedidos faturados</td>
                <td className="py-2 px-3 text-right text-emerald-400">R$ {grossRevenue.toFixed(2)}</td>
                <td className="py-2 px-3 text-right text-slate-300">100.0%</td>
              </tr>
              <tr className="text-slate-300">
                <td className="py-2 px-3">(-) Taxas e Comissões de Marketplaces</td>
                <td className="py-2 px-3 text-slate-400">Mercado Livre e Shopee</td>
                <td className="py-2 px-3 text-right text-red-400">-R$ {marketplaceFees.toFixed(2)}</td>
                <td className="py-2 px-3 text-right text-slate-400">
                  {grossRevenue > 0 ? ((marketplaceFees / grossRevenue) * 100).toFixed(1) : 0}%
                </td>
              </tr>
              <tr className="bg-slate-800/20 font-semibold text-slate-200">
                <td className="py-2 px-3">(=) RECEITA OPERACIONAL LÍQUIDA</td>
                <td className="py-2 px-3 text-slate-400">Pós-comissões de vendas</td>
                <td className="py-2 px-3 text-right text-slate-100">
                  R$ {(grossRevenue - marketplaceFees).toFixed(2)}
                </td>
                <td className="py-2 px-3 text-right text-slate-400">
                  {grossRevenue > 0
                    ? (((grossRevenue - marketplaceFees) / grossRevenue) * 100).toFixed(1)
                    : 0}
                  %
                </td>
              </tr>
              <tr className="text-slate-300">
                <td className="py-2 px-3">(-) Custos de Insumos (Filamento/Resina)</td>
                <td className="py-2 px-3 text-slate-400">Rolos utilizados na manufatura</td>
                <td className="py-2 px-3 text-right text-red-400">
                  -R${" "}
                  {expenses
                    .filter((e) => e.category === "Insumos")
                    .reduce((s, e) => s + e.amount, 0)
                    .toFixed(2)}
                </td>
                <td className="py-2 px-3 text-right text-slate-400">
                  {grossRevenue > 0
                    ? (
                        (expenses
                          .filter((e) => e.category === "Insumos")
                          .reduce((s, e) => s + e.amount, 0) /
                          grossRevenue) *
                        100
                      ).toFixed(1)
                    : 0}
                  %
                </td>
              </tr>
              <tr className="text-slate-300">
                <td className="py-2 px-3">(-) Custos Operacionais (Energia, Embalagens, Peças)</td>
                <td className="py-2 px-3 text-slate-400">Despesas gerais da oficina</td>
                <td className="py-2 px-3 text-right text-red-400">
                  -R${" "}
                  {expenses
                    .filter((e) => e.category !== "Insumos")
                    .reduce((s, e) => s + e.amount, 0)
                    .toFixed(2)}
                </td>
                <td className="py-2 px-3 text-right text-slate-400">
                  {grossRevenue > 0
                    ? (
                        (expenses
                          .filter((e) => e.category !== "Insumos")
                          .reduce((s, e) => s + e.amount, 0) /
                          grossRevenue) *
                        100
                      ).toFixed(1)
                    : 0}
                  %
                </td>
              </tr>
              <tr className="bg-emerald-950/40 font-black text-white border-t-2 border-emerald-500/50">
                <td className="py-3 px-3 text-emerald-300 text-sm">
                  (=) LUCRO LÍQUIDO REAL DO PERÍODO
                </td>
                <td className="py-3 px-3 text-emerald-400/80">Saldo livre final apurado</td>
                <td className="py-3 px-3 text-right text-emerald-400 text-base font-black">
                  R$ {netProfit.toFixed(2)}
                </td>
                <td className="py-3 px-3 text-right text-emerald-300 text-sm font-bold">
                  {marginPercent}%
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Extrato de Lançamentos com Filtros */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Lançamentos & Movimentações
            </h2>
            <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[10px] text-slate-400 font-bold">
              {orders.length + expenses.length} itens
            </span>
          </div>

          <div className="flex items-center gap-1 bg-[#121828] p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setActiveTab("todos")}
              className={`rounded-lg px-3 py-1 font-semibold transition ${
                activeTab === "todos"
                  ? "bg-slate-700 text-white"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setActiveTab("vendas")}
              className={`rounded-lg px-3 py-1 font-semibold transition ${
                activeTab === "vendas"
                  ? "bg-emerald-600 text-white"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Entradas (+{orders.length})
            </button>
            <button
              onClick={() => setActiveTab("despesas")}
              className={`rounded-lg px-3 py-1 font-semibold transition ${
                activeTab === "despesas"
                  ? "bg-red-600 text-white"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Saídas (-{expenses.length})
            </button>
          </div>
        </div>

        {/* List of Entries */}
        <div className="flex flex-col gap-2">
          {/* Orders / Sales entries */}
          {(activeTab === "todos" || activeTab === "vendas") &&
            orders.map((o) => (
              <div
                key={o.id}
                className="flex items-center justify-between rounded-xl border border-slate-800/80 bg-[#121828] p-3 text-xs shadow-xs transition hover:border-slate-700"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
                    <ArrowUpRight className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-bold text-white">{o.productName}</p>
                    <p className="text-[11px] text-slate-400">
                      Venda {o.platform} • {o.orderCode || o.code || o.id} • {o.customerName || "Cliente"}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-black text-emerald-400">+R$ {o.totalPrice.toFixed(2)}</span>
                  <p className="text-[10px] text-slate-500">{o.quantity} un.</p>
                </div>
              </div>
            ))}

          {/* Expenses entries */}
          {(activeTab === "todos" || activeTab === "despesas") &&
            expenses.map((e) => (
              <div
                key={e.id}
                className="flex items-center justify-between rounded-xl border border-slate-800/80 bg-[#121828] p-3 text-xs shadow-xs transition hover:border-slate-700 group"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-500/10 text-red-400">
                    <ArrowDownRight className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-bold text-white">{e.desc}</p>
                    <p className="text-[11px] text-slate-400">
                      {e.category} • {e.date}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-black text-red-400">-R$ {e.amount.toFixed(2)}</span>
                  <button
                    onClick={() => handleDeleteExpense(e.id)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-slate-500 hover:text-red-400 transition"
                    title="Excluir despesa"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Modal: Lançar Despesa */}
      {showAddExpense && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-[#0e1424] p-5 shadow-2xl text-slate-200">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h2 className="text-lg font-bold text-white">+ Nova Despesa Operacional</h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Registre custos para calcular seu lucro líquido exato.
                </p>
              </div>
              <button
                onClick={() => setShowAddExpense(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAddExpense} className="mt-4 flex flex-col gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-300">Descrição do Custo</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: 2x Rolos de PETG Preto 1kg"
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-800 bg-[#141b2d] px-3 py-2 text-xs text-white focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300">Categoria</label>
                  <select
                    value={newCat}
                    onChange={(e) => setNewCat(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-800 bg-[#141b2d] px-3 py-2 text-xs text-white focus:border-blue-500 focus:outline-none font-medium"
                  >
                    <option value="Insumos">Insumos (Filamento/Resina)</option>
                    <option value="Embalagens">Embalagens & Caixas</option>
                    <option value="Energia">Energia Elétrica</option>
                    <option value="Manutenção">Manutenção / Nozzles</option>
                    <option value="Outros">Outras Despesas</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300">Valor (R$)</label>
                  <input
                    type="number"
                    step={0.5}
                    min={0.1}
                    value={newAmount}
                    onChange={(e) => setNewAmount(Number(e.target.value))}
                    className="mt-1 w-full rounded-xl border border-slate-800 bg-[#141b2d] px-3 py-2 text-xs text-white focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="mt-4 flex items-center justify-end gap-2 border-t border-slate-800 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddExpense(false)}
                  className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-red-600 px-5 py-2 text-xs font-bold text-white hover:bg-red-500 shadow-md shadow-red-600/20"
                >
                  Salvar Despesa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
