import React, { useState, useRef } from "react";
import {
  ShoppingCart,
  Plus,
  Search,
  Filter,
  Package,
  Calendar,
  DollarSign,
  Tag,
  CheckCircle2,
  Clock,
  Send,
  Trash2,
  Download,
  FileSpreadsheet,
  FileText,
  Printer,
  X,
  Share2,
  Check,
  TrendingUp,
  Layers,
  ArrowUpRight,
  Sparkles,
} from "lucide-react";
import { OrderItem } from "../types";

interface SalesViewProps {
  orders: OrderItem[];
  onAddOrder: (order: Omit<OrderItem, "id" | "date">) => void;
}

export const SalesView: React.FC<SalesViewProps> = ({ orders, onAddOrder }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [platformFilter, setPlatformFilter] = useState<string>("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [exportToast, setExportToast] = useState<string | null>(null);

  // New Order State
  const [productName, setProductName] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [platform, setPlatform] = useState<OrderItem["platform"]>("Mercado Livre");
  const [quantity, setQuantity] = useState(1);
  const [totalPrice, setTotalPrice] = useState(45);
  const [orderStatus, setOrderStatus] = useState<OrderItem["status"]>("pago");

  const printAreaRef = useRef<HTMLDivElement>(null);

  // Helpers to normalize OrderItem properties
  const getOrderCode = (ord: OrderItem) => ord.orderCode || ord.code || `PED-${ord.id.slice(0, 6)}`;
  const getCustomer = (ord: OrderItem) => ord.customerName || ord.clientName || "Cliente Direto";
  const getOrderDate = (ord: OrderItem) => ord.date || "Hoje";
  const getStatusLabel = (status: OrderItem["status"]) => {
    switch (status) {
      case "pago":
        return "Pago";
      case "em_impressao":
      case "em_producao":
        return "Em Produção";
      case "pronto_envio":
        return "Pronto para Envio";
      case "enviado":
        return "Enviado";
      case "entregue":
        return "Entregue";
      case "pendente_producao":
        return "Pendente Produção";
      default:
        return status;
    }
  };

  const totalRevenue = orders.reduce((sum, o) => sum + o.totalPrice, 0);
  const mlSales = orders.filter((o) => o.platform === "Mercado Livre").length;
  const shopeeSales = orders.filter((o) => o.platform === "Shopee").length;
  const directSales = orders.filter((o) => o.platform === "WhatsApp" || o.platform === "Direto").length;

  const filteredOrders = orders.filter((o) => {
    const code = getOrderCode(o).toLowerCase();
    const cust = getCustomer(o).toLowerCase();
    const prod = o.productName.toLowerCase();
    const query = searchTerm.toLowerCase();

    const matchesSearch = prod.includes(query) || cust.includes(query) || code.includes(query);
    const matchesPlatform = platformFilter === "all" || o.platform === platformFilter;
    return matchesSearch && matchesPlatform;
  });

  const handleCreateOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!productName.trim() || !customerName.trim()) return;

    onAddOrder({
      orderCode: "PED-" + Math.floor(100000 + Math.random() * 900000),
      customerName,
      productName,
      quantity: Number(quantity) || 1,
      totalPrice: Number(totalPrice) || 0,
      platform,
      status: orderStatus,
    });

    setProductName("");
    setCustomerName("");
    setShowAddModal(false);

    showNotification("Venda registrada com sucesso!");
  };

  const showNotification = (msg: string) => {
    setExportToast(msg);
    setTimeout(() => {
      setExportToast(null);
    }, 4000);
  };

  // CSV EXPORT FUNCTION (RFC 4180 + UTF-8 BOM for Microsoft Excel & Google Sheets compatibility)
  const handleExportCSV = (exportAll = false) => {
    const dataToExport = exportAll ? orders : filteredOrders;

    if (dataToExport.length === 0) {
      showNotification("Nenhum pedido disponível para exportação.");
      return;
    }

    // CSV Headers
    const headers = [
      "Código do Pedido",
      "Data",
      "Cliente",
      "Produto",
      "Canal de Venda",
      "Quantidade",
      "Valor Unitário (R$)",
      "Valor Total (R$)",
      "Peso Estimado (g)",
      "Status",
    ];

    // Escape CSV cell value
    const escapeCsv = (val: any) => {
      if (val === null || val === undefined) return '""';
      const str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    };

    const rows = dataToExport.map((ord) => {
      const unit = ord.unitPrice ?? (ord.quantity ? ord.totalPrice / ord.quantity : ord.totalPrice);
      const weight = ord.weightTotalGrams ?? ord.quantity * 70;

      return [
        escapeCsv(getOrderCode(ord)),
        escapeCsv(getOrderDate(ord)),
        escapeCsv(getCustomer(ord)),
        escapeCsv(ord.productName),
        escapeCsv(ord.platform),
        escapeCsv(ord.quantity),
        escapeCsv(unit.toFixed(2).replace(".", ",")),
        escapeCsv(ord.totalPrice.toFixed(2).replace(".", ",")),
        escapeCsv(weight),
        escapeCsv(getStatusLabel(ord.status)),
      ].join(";"); // Semicolon is standard for Brazilian/European Excel
    });

    // Add UTF-8 BOM (\uFEFF) so Excel respects accents
    const csvContent = "\uFEFF" + [headers.join(";"), ...rows].join("\r\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const dateStr = new Date().toISOString().split("T")[0];
    link.setAttribute("href", url);
    link.setAttribute("download", `historico_vendas_3d_maker_${dateStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showNotification(`CSV exportado com sucesso (${dataToExport.length} pedidos)!`);
  };

  // Trigger browser print dialog for formatted PDF generation
  const handlePrintPdf = () => {
    window.print();
  };

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-6 text-slate-100 flex flex-col gap-6">
      {/* Toast Notification */}
      {exportToast && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2 rounded-xl border border-emerald-500/40 bg-emerald-950/95 px-4 py-3 text-xs font-bold text-emerald-200 shadow-2xl backdrop-blur-md animate-in slide-in-from-top-3">
          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          <span>{exportToast}</span>
        </div>
      )}

      {/* Title & Header Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600/20 text-emerald-400 border border-emerald-500/30">
              <ShoppingCart className="h-5 w-5" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white leading-tight">
              Gestão de Vendas & Pedidos
            </h1>
          </div>
          <p className="mt-1 text-xs text-slate-400">
            Acompanhe pedidos de marketplaces, vendas diretas e exporte dados para controle contábil.
          </p>
        </div>

        {/* Action Buttons: New Sale + CSV + PDF */}
        <div className="flex flex-wrap items-center gap-2">
          {/* CSV Export Button */}
          <button
            id="btn-export-csv"
            onClick={() => handleExportCSV(false)}
            className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-[#121828] hover:bg-slate-800 px-3.5 py-2.5 text-xs font-bold text-slate-200 shadow-sm transition active:scale-98"
            title="Exportar pedidos visíveis para planilha CSV (compatível com Excel e Google Sheets)"
          >
            <FileSpreadsheet className="h-4 w-4 text-emerald-400" />
            <span>Exportar CSV</span>
          </button>

          {/* PDF Report Button */}
          <button
            id="btn-export-pdf"
            onClick={() => setShowPdfModal(true)}
            className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-[#121828] hover:bg-slate-800 px-3.5 py-2.5 text-xs font-bold text-slate-200 shadow-sm transition active:scale-98"
            title="Visualizar e gerar relatório em PDF para impressão ou arquivamento"
          >
            <FileText className="h-4 w-4 text-blue-400" />
            <span>Relatório PDF</span>
          </button>

          {/* New Sale Button */}
          <button
            id="btn-new-sale"
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-emerald-600/20 transition active:scale-98"
          >
            <Plus className="h-4 w-4" />
            <span>+ Nova Venda</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-[#121828] to-[#0e211b] p-4">
          <span className="text-[10px] text-emerald-400/90 font-bold uppercase flex items-center justify-between">
            <span>Faturamento Total</span>
            <DollarSign className="h-3.5 w-3.5 text-emerald-400" />
          </span>
          <p className="mt-1 text-xl sm:text-2xl font-black text-emerald-400">
            R$ {totalRevenue.toFixed(2)}
          </p>
          <span className="text-[10px] text-slate-400 mt-0.5 block">
            {orders.length} pedidos acumulados
          </span>
        </div>

        <div className="rounded-2xl border border-blue-500/20 bg-gradient-to-br from-[#121828] to-[#0d1c33] p-4">
          <span className="text-[10px] text-blue-400/90 font-bold uppercase flex items-center justify-between">
            <span>Ticket Médio</span>
            <TrendingUp className="h-3.5 w-3.5 text-blue-400" />
          </span>
          <p className="mt-1 text-xl sm:text-2xl font-black text-blue-400">
            R$ {orders.length > 0 ? (totalRevenue / orders.length).toFixed(2) : "0.00"}
          </p>
          <span className="text-[10px] text-slate-400 mt-0.5 block">Média por pedido</span>
        </div>

        <div className="rounded-2xl border border-amber-500/20 bg-gradient-to-br from-[#121828] to-[#22180d] p-4">
          <span className="text-[10px] text-amber-400/90 font-bold uppercase flex items-center justify-between">
            <span>Mercado Livre</span>
            <span className="text-[10px] font-bold text-yellow-400">{mlSales} un.</span>
          </span>
          <p className="mt-1 text-xl sm:text-2xl font-black text-amber-400">
            R${" "}
            {orders
              .filter((o) => o.platform === "Mercado Livre")
              .reduce((acc, o) => acc + o.totalPrice, 0)
              .toFixed(2)}
          </p>
          <span className="text-[10px] text-slate-400 mt-0.5 block">Canal principal</span>
        </div>

        <div className="rounded-2xl border border-purple-500/20 bg-gradient-to-br from-[#121828] to-[#1c112e] p-4">
          <span className="text-[10px] text-purple-400/90 font-bold uppercase flex items-center justify-between">
            <span>Shopee & Direto</span>
            <span className="text-[10px] font-bold text-purple-300">
              {shopeeSales + directSales} un.
            </span>
          </span>
          <p className="mt-1 text-xl sm:text-2xl font-black text-purple-300">
            R${" "}
            {orders
              .filter((o) => o.platform !== "Mercado Livre")
              .reduce((acc, o) => acc + o.totalPrice, 0)
              .toFixed(2)}
          </p>
          <span className="text-[10px] text-slate-400 mt-0.5 block">Outros canais</span>
        </div>
      </div>

      {/* Search, Filter & Quick Export Summary Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#121828] p-3 rounded-2xl border border-slate-800">
        <div className="flex flex-1 items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <input
              type="text"
              placeholder="Buscar por produto, cliente ou código do pedido..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-slate-800 bg-[#0c1220] py-2 pl-9 pr-3 text-xs text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white text-xs"
              >
                ✕
              </button>
            )}
          </div>

          <select
            value={platformFilter}
            onChange={(e) => setPlatformFilter(e.target.value)}
            className="rounded-xl border border-slate-800 bg-[#0c1220] px-3 py-2 text-xs text-slate-300 focus:border-blue-500 focus:outline-none font-medium"
          >
            <option value="all">Todas as Plataformas</option>
            <option value="Shopee">Shopee</option>
            <option value="Mercado Livre">Mercado Livre</option>
            <option value="WhatsApp">WhatsApp</option>
            <option value="Direto">Balcão / Direto</option>
          </select>
        </div>

        {/* Counter of matching orders & quick CSV trigger */}
        <div className="flex items-center justify-between sm:justify-end gap-3 text-xs text-slate-400 px-1">
          <span>
            Exibindo <strong className="text-white">{filteredOrders.length}</strong> de{" "}
            <strong className="text-slate-300">{orders.length}</strong> pedidos
          </span>
          <button
            onClick={() => handleExportCSV(false)}
            className="text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1 hover:underline text-[11px]"
          >
            <Download className="h-3 w-3" />
            <span>Baixar CSV filtrado</span>
          </button>
        </div>
      </div>

      {/* Orders List / Cards */}
      <div className="flex flex-col gap-3">
        {filteredOrders.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-800 p-12 text-center text-xs text-slate-500 flex flex-col items-center justify-center gap-2">
            <ShoppingCart className="h-8 w-8 text-slate-600" />
            <p className="font-bold text-slate-300">Nenhum pedido encontrado</p>
            <p className="text-slate-500">Tente ajustar seus termos de busca ou filtros de plataforma.</p>
            {searchTerm && (
              <button
                onClick={() => {
                  setSearchTerm("");
                  setPlatformFilter("all");
                }}
                className="mt-2 text-blue-400 hover:underline"
              >
                Limpar filtros de busca
              </button>
            )}
          </div>
        ) : (
          filteredOrders.map((ord) => {
            const code = getOrderCode(ord);
            const customer = getCustomer(ord);
            const date = getOrderDate(ord);
            const statusLabel = getStatusLabel(ord.status);

            return (
              <div
                key={ord.id}
                className="rounded-2xl border border-slate-800 bg-[#121828] p-4 shadow-sm transition hover:border-slate-700"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`rounded-lg px-2.5 py-0.5 text-[10px] font-bold ${
                          ord.platform === "Shopee"
                            ? "bg-orange-950/60 text-orange-400 border border-orange-500/30"
                            : ord.platform === "Mercado Livre"
                            ? "bg-yellow-950/60 text-yellow-300 border border-yellow-500/30"
                            : "bg-emerald-950/60 text-emerald-400 border border-emerald-500/30"
                        }`}
                      >
                        {ord.platform}
                      </span>
                      <span className="text-[11px] font-mono text-slate-400 font-semibold">{code}</span>
                      <span className="text-[11px] text-slate-500">• {date}</span>
                    </div>

                    <h3 className="mt-2 text-sm font-bold text-white">{ord.productName}</h3>
                    <div className="mt-1 flex flex-wrap items-center gap-3 text-[11px] text-slate-400">
                      <span>
                        Cliente: <strong className="text-slate-200">{customer}</strong>
                      </span>
                      <span>•</span>
                      <span>
                        Qtd: <strong className="text-slate-200">{ord.quantity} un.</strong>
                      </span>
                      {ord.weightTotalGrams && (
                        <>
                          <span>•</span>
                          <span>
                            Peso: <strong className="text-slate-200">{ord.weightTotalGrams}g</strong>
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end justify-between border-t sm:border-t-0 border-slate-800 pt-2 sm:pt-0">
                    <p className="text-base sm:text-lg font-black text-emerald-400">
                      R$ {ord.totalPrice.toFixed(2)}
                    </p>
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold mt-0.5 ${
                        ord.status === "pago" || ord.status === "entregue"
                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                          : ord.status === "em_impressao" || ord.status === "em_producao"
                          ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                          : ord.status === "enviado" || ord.status === "pronto_envio"
                          ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                          : "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                      }`}
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-current" />
                      {statusLabel}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* MODAL: Nova Venda */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-[#0e1424] p-6 shadow-2xl text-slate-200">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h2 className="text-lg font-bold text-white">+ Registrar Nova Venda</h2>
                <p className="text-xs text-slate-400 mt-0.5">Cadastre uma venda balcão ou marketplace.</p>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateOrder} className="mt-4 flex flex-col gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-300">Produto</label>
                <input
                  type="text"
                  required
                  placeholder="Nome do produto vendido (ex: Vaso Poligonal 18cm)"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-800 bg-[#141b2d] px-3 py-2 text-xs text-white focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300">Nome do Cliente</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Carlos Mendes"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-800 bg-[#141b2d] px-3 py-2 text-xs text-white focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300">Canal / Plataforma</label>
                  <select
                    value={platform}
                    onChange={(e) => setPlatform(e.target.value as any)}
                    className="mt-1 w-full rounded-xl border border-slate-800 bg-[#141b2d] px-3 py-2 text-xs text-white focus:border-blue-500 focus:outline-none"
                  >
                    <option value="Mercado Livre">Mercado Livre</option>
                    <option value="Shopee">Shopee</option>
                    <option value="WhatsApp">WhatsApp</option>
                    <option value="Direto">Direto / Balcão</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300">Status</label>
                  <select
                    value={orderStatus}
                    onChange={(e) => setOrderStatus(e.target.value as any)}
                    className="mt-1 w-full rounded-xl border border-slate-800 bg-[#141b2d] px-3 py-2 text-xs text-white focus:border-blue-500 focus:outline-none"
                  >
                    <option value="pago">Pago</option>
                    <option value="em_impressao">Em Impressão</option>
                    <option value="pronto_envio">Pronto para Envio</option>
                    <option value="enviado">Enviado</option>
                    <option value="entregue">Entregue</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300">Quantidade</label>
                  <input
                    type="number"
                    min={1}
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className="mt-1 w-full rounded-xl border border-slate-800 bg-[#141b2d] px-3 py-2 text-xs text-white focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300">Valor Total (R$)</label>
                  <input
                    type="number"
                    min={0}
                    step={0.01}
                    value={totalPrice}
                    onChange={(e) => setTotalPrice(Number(e.target.value))}
                    className="mt-1 w-full rounded-xl border border-slate-800 bg-[#141b2d] px-3 py-2 text-xs text-white focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="mt-4 flex items-center justify-end gap-2 border-t border-slate-800 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-emerald-600 px-5 py-2 text-xs font-bold text-white hover:bg-emerald-500 shadow-md shadow-emerald-600/20"
                >
                  Salvar Venda
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Relatório PDF / Impressão */}
      {showPdfModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-3 sm:p-6 backdrop-blur-md overflow-y-auto">
          <div className="w-full max-w-4xl rounded-2xl border border-slate-700 bg-[#0d1322] shadow-2xl text-slate-100 flex flex-col max-h-[90vh]">
            {/* Modal Actions Header */}
            <div className="flex items-center justify-between border-b border-slate-800 p-4 sm:px-6 bg-[#111827] rounded-t-2xl">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600/20 text-blue-400">
                  <FileText className="h-4 w-4" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white">Relatório Executivo de Vendas (PDF)</h2>
                  <p className="text-[11px] text-slate-400">
                    Pré-visualização do documento pronto para impressão e download em PDF.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleExportCSV(false)}
                  className="hidden sm:flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800/80 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:bg-slate-700"
                >
                  <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-400" />
                  <span>Baixar CSV</span>
                </button>
                <button
                  onClick={handlePrintPdf}
                  className="flex items-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 px-4 py-1.5 text-xs font-bold text-white shadow"
                >
                  <Printer className="h-3.5 w-3.5" />
                  <span>Imprimir / Salvar PDF</span>
                </button>
                <button
                  onClick={() => setShowPdfModal(false)}
                  className="rounded-xl p-1.5 text-slate-400 hover:text-white hover:bg-slate-800"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Printable Report Document Body */}
            <div className="p-6 overflow-y-auto bg-slate-900/50" ref={printAreaRef}>
              <div className="rounded-xl bg-white text-slate-900 p-6 sm:p-8 shadow-md border border-slate-200 print:border-0 print:shadow-none print:p-0">
                {/* Document Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b-2 border-slate-800 pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600 text-white font-black text-sm">
                        VM
                      </span>
                      <span className="text-xl font-black tracking-tight text-slate-900">
                        VERSÁTIL MAKER 3D
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1">
                      Sistema Integrado de Gestão & Manufatura Aditiva
                    </p>
                  </div>

                  <div className="mt-3 sm:mt-0 text-left sm:text-right text-xs text-slate-600">
                    <p className="font-bold text-slate-900 text-sm">RELATÓRIO DE VENDAS</p>
                    <p>Emissão: {new Date().toLocaleDateString("pt-BR")} às {new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</p>
                    <p className="text-[11px] text-slate-500">Período: Histórico Geral</p>
                  </div>
                </div>

                {/* Summary Executive Cards in Document */}
                <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="rounded-lg bg-slate-50 p-3 border border-slate-200">
                    <span className="text-[10px] uppercase font-bold text-slate-500">Total de Pedidos</span>
                    <p className="text-lg font-black text-slate-900">{filteredOrders.length} un.</p>
                  </div>
                  <div className="rounded-lg bg-slate-50 p-3 border border-slate-200">
                    <span className="text-[10px] uppercase font-bold text-slate-500">Faturamento Bruto</span>
                    <p className="text-lg font-black text-emerald-700">
                      R$ {filteredOrders.reduce((acc, o) => acc + o.totalPrice, 0).toFixed(2)}
                    </p>
                  </div>
                  <div className="rounded-lg bg-slate-50 p-3 border border-slate-200">
                    <span className="text-[10px] uppercase font-bold text-slate-500">Ticket Médio</span>
                    <p className="text-lg font-black text-blue-700">
                      R${" "}
                      {filteredOrders.length > 0
                        ? (
                            filteredOrders.reduce((acc, o) => acc + o.totalPrice, 0) /
                            filteredOrders.length
                          ).toFixed(2)
                        : "0.00"}
                    </p>
                  </div>
                  <div className="rounded-lg bg-slate-50 p-3 border border-slate-200">
                    <span className="text-[10px] uppercase font-bold text-slate-500">Canais Principais</span>
                    <p className="text-xs font-bold text-slate-700 mt-1">
                      ML: {filteredOrders.filter((o) => o.platform === "Mercado Livre").length} | SHP:{" "}
                      {filteredOrders.filter((o) => o.platform === "Shopee").length}
                    </p>
                  </div>
                </div>

                {/* Order Table */}
                <div className="mt-6 overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b-2 border-slate-300 bg-slate-100 text-slate-700 font-bold">
                        <th className="py-2.5 px-2">Código</th>
                        <th className="py-2.5 px-2">Data</th>
                        <th className="py-2.5 px-2">Cliente</th>
                        <th className="py-2.5 px-2">Produto</th>
                        <th className="py-2.5 px-2">Canal</th>
                        <th className="py-2.5 px-2 text-center">Qtd</th>
                        <th className="py-2.5 px-2 text-right">Valor Total</th>
                        <th className="py-2.5 px-2 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {filteredOrders.map((ord, idx) => (
                        <tr
                          key={ord.id}
                          className={idx % 2 === 0 ? "bg-white" : "bg-slate-50/70"}
                        >
                          <td className="py-2 px-2 font-mono font-semibold text-slate-800">
                            {getOrderCode(ord)}
                          </td>
                          <td className="py-2 px-2 text-slate-600">{getOrderDate(ord)}</td>
                          <td className="py-2 px-2 font-medium text-slate-900">{getCustomer(ord)}</td>
                          <td className="py-2 px-2 text-slate-800">{ord.productName}</td>
                          <td className="py-2 px-2">
                            <span className="inline-block rounded px-1.5 py-0.5 text-[10px] font-bold bg-slate-200 text-slate-800">
                              {ord.platform}
                            </span>
                          </td>
                          <td className="py-2 px-2 text-center font-bold text-slate-900">
                            {ord.quantity}
                          </td>
                          <td className="py-2 px-2 text-right font-black text-emerald-700">
                            R$ {ord.totalPrice.toFixed(2)}
                          </td>
                          <td className="py-2 px-2 text-center">
                            <span className="inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                              {getStatusLabel(ord.status)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="border-t-2 border-slate-800 bg-slate-100 font-bold text-slate-900">
                        <td colSpan={5} className="py-3 px-2 text-right">
                          TOTAL GERAL DO RELATÓRIO:
                        </td>
                        <td className="py-3 px-2 text-center">
                          {filteredOrders.reduce((sum, o) => sum + o.quantity, 0)} un.
                        </td>
                        <td className="py-3 px-2 text-right text-emerald-800 text-sm">
                          R$ {filteredOrders.reduce((sum, o) => sum + o.totalPrice, 0).toFixed(2)}
                        </td>
                        <td className="py-3 px-2"></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>

                {/* Footer notes */}
                <div className="mt-8 pt-4 border-t border-slate-300 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500">
                  <span>Versátil Maker 3D • Gestão de Custos & E-commerce</span>
                  <span>Documento gerado eletronicamente para fins de controle e auditoria</span>
                </div>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center justify-between border-t border-slate-800 p-4 bg-[#111827] rounded-b-2xl">
              <span className="text-xs text-slate-400">
                Total de {filteredOrders.length} pedido(s) listados.
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowPdfModal(false)}
                  className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Fechar
                </button>
                <button
                  type="button"
                  onClick={handlePrintPdf}
                  className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-5 py-2 text-xs font-bold text-white hover:bg-blue-500 shadow"
                >
                  <Printer className="h-4 w-4" />
                  <span>Imprimir / Salvar PDF</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
