import React, { useState } from "react";
import {
  ShoppingBag,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  Link2,
} from "lucide-react";

export const ShopeeIntegrationView: React.FC = () => {
  const [isConnected, setIsConnected] = useState(true);
  const [shopId, setShopId] = useState("892184918");
  const [partnerId, setPartnerId] = useState("makerflow_partner_br");
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSync, setLastSync] = useState("Hoje às 14:32");

  const handleSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      setLastSync("Agora mesmo");
    }, 1500);
  };

  return (
    <div className="mx-auto max-w-xl px-4 py-6 text-slate-100 flex flex-col gap-6">
      {/* Title */}
      <div>
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-600/20 text-orange-400">
            <ShoppingBag className="h-5 w-5" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white leading-tight">
            Integração Shopee
          </h1>
        </div>
        <p className="mt-1 text-xs text-slate-400">
          Sincronização automática de pedidos, estoque de produtos e cálculo de comissões 2026.
        </p>
      </div>

      {/* Connection Status Card */}
      <div className="rounded-2xl border border-orange-500/30 bg-gradient-to-br from-[#121828] to-[#261510] p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-600 font-black text-white text-lg">
              S
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Shopee Open Platform API</h2>
              <p className="text-[11px] text-slate-400">Loja ID: {shopId} • Brasil (BR)</p>
            </div>
          </div>

          <span
            className={`rounded-full px-2.5 py-0.5 text-xs font-bold border ${
              isConnected
                ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40"
                : "bg-red-500/20 text-red-400 border-red-500/40"
            }`}
          >
            {isConnected ? "Conectado" : "Desconectado"}
          </span>
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-slate-800/80 pt-3 text-xs text-slate-300">
          <span>Última sincronização: {lastSync}</span>
          <button
            onClick={handleSync}
            disabled={isSyncing}
            className="flex items-center gap-1.5 rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-bold text-slate-200 hover:bg-slate-700 transition"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isSyncing ? "animate-spin text-orange-400" : ""}`} />
            <span>{isSyncing ? "Sincronizando..." : "Sincronizar Agora"}</span>
          </button>
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
            Suas credenciais são criptografadas localmente. O MakerFlow 3D utiliza a API oficial da Shopee para importação de pedidos e baixa automática de estoque.
          </p>
        </div>

        <button
          onClick={() => setIsConnected(true)}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-orange-600 py-3 text-xs font-bold text-white hover:bg-orange-500 transition"
        >
          <Link2 className="h-4 w-4" />
          <span>Salvar e Autenticar Conexão</span>
        </button>
      </div>
    </div>
  );
};
