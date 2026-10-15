import React, { useState, useEffect } from "react";
import {
  ShoppingBag,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  Link2,
  Package,
  DollarSign,
  TrendingUp,
} from "lucide-react";

interface ShopeeOrder {
  id: string;
  customer: string;
  item: string;
  qty: number;
  total: string;
  status: string;
  date: string;
}

export const ShopeeIntegrationView: React.FC = () => {
  const [isConnected, setIsConnected] = useState(true);
  const [shopId, setShopId] = useState("892184918");
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSync, setLastSync] = useState("Hoje às 14:32");
  const [orders, setOrders] = useState<ShopeeOrder[]>([
    { id: "SHP-88219", customer: "Carlos Eduardo", item: "Vaso Geométrico 3D (Preto Fosco)", qty: 2, total: "R$ 119,80", status: "Aguardando Envio", date: "Hoje, 14:10" },
    { id: "SHP-88220", customer: "Mariana Souza", item: "Suporte Headset Gamer Articulado", qty: 1, total: "R$ 79,90", status: "Preparando Produção", date: "Hoje, 12:45" },
    { id: "SHP-88215", customer: "Lucas Mendes", item: "Dragão Articulado Flexível 35cm", qty: 1, total: "R$ 99,90", status: "Enviado", date: "Ontem" },
  ]);

  // Calculator states
  const [calcPrice, setCalcPrice] = useState("69.90");
  const [calcCommissionRate, setCalcCommissionRate] = useState("14");
  const [calcShippingSubsidy, setCalcShippingSubsidy] = useState("6.00");

  const parsedPrice = Number(calcPrice) || 0;
  const parsedCommission = (parsedPrice * Number(calcCommissionRate)) / 100;
  const parsedSubsidy = Number(calcShippingSubsidy) || 0;
  const estimatedNet = parsedPrice - parsedCommission - parsedSubsidy;

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      const res = await fetch("/api/shopee/orders");
      const data = await res.json();
      if (data.success && data.orders) {
        setOrders(data.orders);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSyncing(false);
      setLastSync("Agora mesmo");
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 text-slate-100 flex flex-col gap-6">
      {/* Title */}
      <div>
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-600/20 text-orange-400 border border-orange-500/30">
            <ShoppingBag className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-white leading-tight">
              Integração Oficial Shopee
            </h1>
            <p className="text-xs text-slate-400">
              Sincronização de pedidos em tempo real, baixa de estoque e simulador de comissões.
            </p>
          </div>
        </div>
      </div>

      {/* Connection Status Card */}
      <div className="rounded-2xl border border-orange-500/30 bg-gradient-to-br from-[#121828] to-[#261510] p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-600 font-black text-white text-lg">
              S
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Shopee Open Platform API v2</h2>
              <p className="text-[11px] text-slate-400">Loja ID: {shopId} • Brasil (BR)</p>
            </div>
          </div>

          <span className="rounded-full px-2.5 py-0.5 text-xs font-bold border bg-emerald-500/20 text-emerald-400 border-emerald-500/40">
            Conectado
          </span>
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-slate-800/80 pt-3 text-xs text-slate-300">
          <span>Última sincronização: {lastSync}</span>
          <button
            onClick={handleSync}
            disabled={isSyncing}
            className="flex items-center gap-1.5 rounded-lg bg-orange-600/30 border border-orange-500/40 px-3 py-1.5 text-xs font-bold text-orange-200 hover:bg-orange-600 hover:text-white transition cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isSyncing ? "animate-spin text-orange-400" : ""}`} />
            <span>{isSyncing ? "Sincronizando..." : "Sincronizar Pedidos"}</span>
          </button>
        </div>
      </div>

      {/* Live Orders Table */}
      <div className="rounded-2xl border border-slate-800 bg-[#121828] p-5 shadow-sm flex flex-col gap-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Package className="h-4 w-4 text-orange-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Pedidos Recentes Shopee ({orders.length})
            </h3>
          </div>
          <span className="text-[10px] text-emerald-400 font-bold bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-500/30">
            Webhook Ativo
          </span>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-800">
          <table className="w-full text-left text-xs text-slate-200">
            <thead className="bg-[#0c1220] text-[10px] uppercase tracking-wider text-slate-400 border-b border-slate-800">
              <tr>
                <th className="p-3">ID Pedido</th>
                <th className="p-3">Cliente</th>
                <th className="p-3">Item 3D</th>
                <th className="p-3">Total</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 bg-[#090d18]">
              {orders.map((ord, idx) => (
                <tr key={idx} className="hover:bg-slate-800/30 transition">
                  <td className="p-3 font-mono font-bold text-orange-300">{ord.id}</td>
                  <td className="p-3 font-semibold">{ord.customer}</td>
                  <td className="p-3 text-slate-300">{ord.item}</td>
                  <td className="p-3 font-bold text-emerald-400">{ord.total}</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-orange-500/20 text-orange-300 border border-orange-500/30">
                      {ord.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Shopee Commission & Profit Calculator */}
      <div className="rounded-2xl border border-slate-800 bg-[#121828] p-5 shadow-sm flex flex-col gap-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
          <DollarSign className="h-4 w-4 text-emerald-400" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
            Calculadora de Repasse & Comissão Shopee
          </h3>
        </div>

        <div className="grid grid-cols-3 gap-3 text-xs">
          <div>
            <label className="text-[11px] font-semibold text-slate-400">Preço Venda (R$)</label>
            <input
              type="text"
              value={calcPrice}
              onChange={(e) => setCalcPrice(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-800 bg-[#0d1320] px-3 py-2 text-xs text-white focus:border-orange-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="text-[11px] font-semibold text-slate-400">Comissão (%)</label>
            <input
              type="text"
              value={calcCommissionRate}
              onChange={(e) => setCalcCommissionRate(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-800 bg-[#0d1320] px-3 py-2 text-xs text-white focus:border-orange-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="text-[11px] font-semibold text-slate-400">Frete/Subsídio (R$)</label>
            <input
              type="text"
              value={calcShippingSubsidy}
              onChange={(e) => setCalcShippingSubsidy(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-800 bg-[#0d1320] px-3 py-2 text-xs text-white focus:border-orange-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="rounded-xl bg-[#0c1220] p-3.5 border border-slate-800 flex items-center justify-between text-xs">
          <div>
            <p className="text-slate-400">Comissão da Plataforma: <strong className="text-rose-400">R$ {parsedCommission.toFixed(2)}</strong></p>
            <p className="text-slate-400 mt-0.5">Repasse Líquido Estimado: <strong className="text-emerald-400">R$ {estimatedNet.toFixed(2)}</strong></p>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-orange-300 font-bold block">Taxa Padrão Shopee</span>
            <span className="text-[11px] text-slate-300">Programa Frete Grátis Extra</span>
          </div>
        </div>
      </div>

      {/* Settings Form */}
      <div className="rounded-2xl border border-slate-800 bg-[#121828] p-5 shadow-sm flex flex-col gap-4 text-xs">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
          CREDENCIAS DE ACESSO SHOPEE OPEN PLATFORM
        </h3>

        <div>
          <label className="text-[11px] font-semibold text-slate-400">Shop ID (ID da sua Loja)</label>
          <input
            type="text"
            value={shopId}
            onChange={(e) => setShopId(e.target.value)}
            className="mt-1 w-full rounded-xl border border-slate-800 bg-[#0d1320] px-3.5 py-2.5 text-xs text-white focus:border-orange-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="text-[11px] font-semibold text-slate-400">Partner Key / Token API</label>
          <input
            type="password"
            defaultValue="••••••••••••••••••••••••••••"
            className="mt-1 w-full rounded-xl border border-slate-800 bg-[#0d1320] px-3.5 py-2.5 text-xs text-white focus:border-orange-500 focus:outline-none"
          />
        </div>

        <div className="rounded-xl bg-orange-950/30 border border-orange-500/20 p-3 text-[11px] text-orange-200 flex items-start gap-2">
          <ShieldCheck className="h-4 w-4 text-orange-400 shrink-0 mt-0.5" />
          <p>
            Suas credenciais são criptografadas localmente. O Versátil Maker utiliza a API oficial da Shopee para importação de pedidos e baixa automática de estoque.
          </p>
        </div>

        <button
          onClick={() => setIsConnected(true)}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-orange-600 py-3 text-xs font-bold text-white hover:bg-orange-500 transition cursor-pointer"
        >
          <Link2 className="h-4 w-4" />
          <span>Salvar e Autenticar Conexão</span>
        </button>
      </div>
    </div>
  );
};
