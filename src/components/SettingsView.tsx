import React, { useState } from "react";
import { readStoredValue, writeStoredValue } from "../hooks/usePersistentState";
import {
  Settings,
  Save,
  CheckCircle2,
  Store,
  Phone,
  QrCode,
  MapPin,
  Bell,
  Download,
  Database,
  ShieldCheck,
  FileJson,
  HardDrive,
  RefreshCw,
} from "lucide-react";
import { Customer, Filament, OrderItem, Printer, ProductionCard, SavedCalculation } from "../types";
import {
  initialCustomers,
  initialFilaments,
  initialOrders,
  initialPrinters,
  initialProductionCards,
  initialSavedCalculations,
} from "../mockData";

interface SettingsViewProps {
  orders?: OrderItem[];
  filaments?: Filament[];
  printers?: Printer[];
  productionCards?: ProductionCard[];
  savedCalculations?: SavedCalculation[];
  customers?: Customer[];
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  orders = initialOrders,
  filaments = initialFilaments,
  printers = initialPrinters,
  productionCards = initialProductionCards,
  savedCalculations = initialSavedCalculations,
  customers = initialCustomers,
}) => {
  const [storedConfig] = useState(() => readStoredValue("storeConfig", { storeName: "Versátil Maker", whatsapp: "", pixKey: "", cep: "", cityState: "", notifyWhatsApp: false, notifyLowFilament: true }));
  const [saveError, setSaveError] = useState(false);
  const [storeName, setStoreName] = useState(storedConfig.storeName);
  const [whatsapp, setWhatsapp] = useState(storedConfig.whatsapp);
  const [pixKey, setPixKey] = useState(storedConfig.pixKey);
  const [cep, setCep] = useState(storedConfig.cep);
  const [cityState, setCityState] = useState(storedConfig.cityState);
  const [notifyWhatsApp, setNotifyWhatsApp] = useState(storedConfig.notifyWhatsApp);
  const [notifyLowFilament, setNotifyLowFilament] = useState(storedConfig.notifyLowFilament);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [backupDownloaded, setBackupDownloaded] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const saved = writeStoredValue("storeConfig", { storeName, whatsapp, pixKey, cep, cityState, notifyWhatsApp, notifyLowFilament });
    setSaveError(!saved);
    setSavedSuccess(saved);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  // Full Database Export to JSON
  const handleDownloadBackup = () => {
    const timestamp = new Date().toISOString();
    const dateFormatted = new Date().toISOString().split("T")[0];

    const expenses = readStoredValue("expenses", []);
    const marketAnalyses = readStoredValue("marketAnalyses", []);
    const databaseBackup = {
      app: "Versátil Maker - Gestão 3D",
      version: "1.0.0",
      exportedAt: timestamp,
      storeConfig: {
        storeName,
        whatsapp,
        pixKey,
        cep,
        cityState,
        notifyWhatsApp,
        notifyLowFilament,
      },
      summary: {
        totalOrders: orders.length,
        totalFilaments: filaments.length,
        totalPrinters: printers.length,
        totalProductionCards: productionCards.length,
        totalCalculations: savedCalculations.length,
        totalCustomers: customers.length,
        totalExpenses: expenses.length,
        totalMarketAnalyses: marketAnalyses.length,
      },
      database: {
        orders,
        filaments,
        printers,
        productionCards,
        savedCalculations,
        customers,
        expenses,
        marketAnalyses,
      },
    };

    // Convert to JSON string
    const jsonString = JSON.stringify(databaseBackup, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    // Create temporary download anchor
    const link = document.createElement("a");
    link.href = url;
    link.download = `backup_banco_dados_versatil_maker_${dateFormatted}.json`;
    document.body.appendChild(link);
    link.click();

    // Cleanup
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setBackupDownloaded(true);
    setTimeout(() => setBackupDownloaded(false), 4000);
  };

  // Total record counter
  const totalRecords =
    orders.length +
    filaments.length +
    printers.length +
    productionCards.length +
    savedCalculations.length +
    customers.length;

  return (
    <div className="mx-auto max-w-xl px-4 py-6 text-slate-100 flex flex-col gap-6">
      {/* Title */}
      <div>
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600/20 text-blue-400 border border-blue-500/30">
            <Settings className="h-5 w-5" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white leading-tight">
            Configurações da Loja
          </h1>
        </div>
        <p className="mt-1 text-xs text-slate-400">
          Dados operacionais da sua loja de impressão 3D, preferências e backup do sistema.
        </p>
      </div>

      {/* BACKUP E SEGURANÇA DO BANCO DE DADOS */}
      <div className="rounded-2xl border border-blue-500/30 bg-gradient-to-br from-[#121828] via-[#0f1d38] to-[#121828] p-5 shadow-lg flex flex-col gap-3 relative overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-blue-300 flex items-center gap-2">
            <Database className="h-4 w-4 text-blue-400" /> BACKUP & SEGURANÇA DO BANCO DE DADOS
          </h3>
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-300 border border-emerald-500/30">
            <ShieldCheck className="h-3 w-3" /> Seguro
          </span>
        </div>

        <p className="text-xs text-slate-300">
          Os dados ficam salvos neste navegador e não são sincronizados entre dispositivos. Faça o download de uma cópia completa de segurança com todas as suas vendas, estoque de filamentos, cadastro de impressoras, fila de produção e clientes em arquivo JSON.
        </p>

        {/* Database Status Cards */}
        <div className="grid grid-cols-3 gap-2 py-1 text-xs">
          <div className="rounded-xl bg-[#090e1a] p-2.5 border border-slate-800">
            <span className="text-[10px] text-slate-400 block font-semibold">Total Registros</span>
            <span className="text-base font-black text-blue-400">{totalRecords}</span>
          </div>
          <div className="rounded-xl bg-[#090e1a] p-2.5 border border-slate-800">
            <span className="text-[10px] text-slate-400 block font-semibold">Formato</span>
            <span className="text-xs font-bold text-emerald-400 flex items-center gap-1 mt-0.5">
              <FileJson className="h-3.5 w-3.5" /> JSON (.json)
            </span>
          </div>
          <div className="rounded-xl bg-[#090e1a] p-2.5 border border-slate-800">
            <span className="text-[10px] text-slate-400 block font-semibold">Fila + Vendas</span>
            <span className="text-base font-black text-purple-400">
              {productionCards.length + orders.length}
            </span>
          </div>
        </div>

        {backupDownloaded && (
          <div className="flex items-center gap-2 rounded-xl border border-emerald-500/40 bg-emerald-950/60 p-3 text-xs font-semibold text-emerald-300 animate-in fade-in duration-200">
            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
            <div>
              <p>Download concluído com sucesso!</p>
              <p className="text-[10px] text-emerald-400/80 font-normal">
                Arquivo contendo {totalRecords} registros exportado para sua pasta de Downloads.
              </p>
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={handleDownloadBackup}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 py-3 text-xs font-bold text-white shadow-md hover:from-blue-500 hover:to-indigo-500 active:scale-98 transition cursor-pointer"
        >
          <Download className="h-4 w-4" />
          <span>Baixar Backup Completo do Banco de Dados (.JSON)</span>
        </button>
      </div>

      <form onSubmit={handleSave} className="flex flex-col gap-4 text-xs">
        {/* Loja & Contato */}
        <div className="rounded-2xl border border-slate-800 bg-[#121828] p-5 shadow-sm flex flex-col gap-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <Store className="h-4 w-4 text-blue-400" /> DADOS DA EMPRESA / OFICINA
          </h3>

          <div>
            <label className="text-[11px] font-semibold text-slate-400">Nome da Loja 3D</label>
            <input
              type="text"
              required
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-800 bg-[#0d1320] px-3.5 py-2.5 text-xs text-white focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-semibold text-slate-400">WhatsApp de Notificações</label>
              <input
                type="text"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-800 bg-[#0d1320] px-3.5 py-2.5 text-xs text-white focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-400">Chave PIX Recebimentos</label>
              <input
                type="text"
                value={pixKey}
                onChange={(e) => setPixKey(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-800 bg-[#0d1320] px-3.5 py-2.5 text-xs text-white focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-semibold text-slate-400">CEP de Origem (Fretes)</label>
              <input
                type="text"
                value={cep}
                onChange={(e) => setCep(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-800 bg-[#0d1320] px-3.5 py-2.5 text-xs text-white focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-400">Cidade / UF</label>
              <input
                type="text"
                value={cityState}
                onChange={(e) => setCityState(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-800 bg-[#0d1320] px-3.5 py-2.5 text-xs text-white focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Notificações e Alertas */}
        <div className="rounded-2xl border border-slate-800 bg-[#121828] p-5 shadow-sm flex flex-col gap-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <Bell className="h-4 w-4 text-blue-400" /> ALERTAS E AUTOMAÇÕES
          </h3>

          <label className="flex items-center justify-between rounded-xl bg-[#0d1320] p-3 cursor-pointer">
            <div>
              <p className="font-semibold text-white">Alerta de filamento acabando</p>
              <p className="text-[11px] text-slate-400">Avisar no dashboard quando uma bobina estiver com menos de 200g.</p>
            </div>
            <input
              type="checkbox"
              checked={notifyLowFilament}
              onChange={(e) => setNotifyLowFilament(e.target.checked)}
              className="h-4 w-4 rounded border-slate-700 bg-slate-800 text-blue-600 focus:ring-0"
            />
          </label>

          <label className="flex items-center justify-between rounded-xl bg-[#0d1320] p-3 cursor-pointer">
            <div>
              <p className="font-semibold text-white">Notificar conclusão no WhatsApp</p>
              <p className="text-[11px] text-slate-400">Preferência salva; envio por WhatsApp ainda não integrado.</p>
            </div>
            <input
              type="checkbox"
              checked={notifyWhatsApp}
              onChange={(e) => setNotifyWhatsApp(e.target.checked)}
              className="h-4 w-4 rounded border-slate-700 bg-slate-800 text-blue-600 focus:ring-0"
            />
          </label>
        </div>

        {saveError && <p role="alert" className="text-amber-300">Não foi possível salvar. Verifique o espaço e as permissões do navegador.</p>}
        {savedSuccess && (
          <div className="flex items-center gap-2 rounded-xl border border-emerald-500/40 bg-emerald-950/40 p-3 text-xs font-semibold text-emerald-300">
            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
            <span>Configurações salvas com sucesso!</span>
          </div>
        )}

        <button
          type="submit"
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-sm font-bold text-white shadow-md shadow-blue-600/20 hover:bg-blue-500 transition cursor-pointer"
        >
          <Save className="h-4 w-4" />
          <span>Salvar Configurações</span>
        </button>
      </form>
    </div>
  );
};
