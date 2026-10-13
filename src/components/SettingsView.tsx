import React, { useState, useRef } from "react";
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
  Upload,
  Database,
  ShieldCheck,
  FileJson,
  HardDrive,
  RefreshCw,
  Trash2,
  AlertTriangle,
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
  onResetDatabase?: (mode: 'empty' | 'default') => void;
  onImportDatabase?: (data: any) => boolean;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  orders = initialOrders,
  filaments = initialFilaments,
  printers = initialPrinters,
  productionCards = initialProductionCards,
  savedCalculations = initialSavedCalculations,
  customers = initialCustomers,
  onResetDatabase,
  onImportDatabase,
}) => {
  const [storeName, setStoreName] = useState("Versátil Maker");
  const [whatsapp, setWhatsapp] = useState("(11) 98765-4321");
  const [pixKey, setPixKey] = useState("contato@versatilmaker.com.br");
  const [cep, setCep] = useState("01310-100");
  const [cityState, setCityState] = useState("São Paulo - SP");
  const [notifyWhatsApp, setNotifyWhatsApp] = useState(true);
  const [notifyLowFilament, setNotifyLowFilament] = useState(true);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [backupDownloaded, setBackupDownloaded] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  // Full Database Export to JSON
  const handleDownloadBackup = () => {
    const timestamp = new Date().toISOString();
    const dateFormatted = new Date().toISOString().split("T")[0];

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
      },
      database: {
        orders,
        filaments,
        printers,
        productionCards,
        savedCalculations,
        customers,
      },
    };

    const jsonString = JSON.stringify(databaseBackup, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `backup_banco_dados_versatil_maker_${dateFormatted}.json`;
    document.body.appendChild(link);
    link.click();

    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setBackupDownloaded(true);
    setTimeout(() => setBackupDownloaded(false), 4000);
  };

  // Restore Database from JSON backup
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (onImportDatabase && onImportDatabase(json)) {
          if (json.storeConfig) {
            if (json.storeConfig.storeName) setStoreName(json.storeConfig.storeName);
            if (json.storeConfig.whatsapp) setWhatsapp(json.storeConfig.whatsapp);
            if (json.storeConfig.pixKey) setPixKey(json.storeConfig.pixKey);
            if (json.storeConfig.cep) setCep(json.storeConfig.cep);
            if (json.storeConfig.cityState) setCityState(json.storeConfig.cityState);
          }
          setImportStatus("Backup restaurado com sucesso! Dados atualizados.");
        } else {
          setImportStatus("Erro: Arquivo JSON de backup inválido.");
        }
      } catch (err) {
        setImportStatus("Erro ao ler o arquivo JSON.");
      }
      setTimeout(() => setImportStatus(null), 5000);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    };
    reader.readAsText(file);
  };

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
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600/20 text-blue-400 border border-blue-500/30">
              <Settings className="h-5 w-5" />
            </div>
            <h1 className="text-2xl font-black tracking-tight text-white leading-tight">
              Configurações & Banco de Dados
            </h1>
          </div>
          <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/20 px-2.5 py-1 text-[11px] font-bold text-blue-300 border border-blue-500/30">
            <HardDrive className="h-3 w-3" /> Salvamento Automático Ativo
          </span>
        </div>
        <p className="mt-1 text-xs text-slate-400">
          Gerencie o backup, restauração, modo de salvamento, limpeza para novos cadastros e preferências da oficina 3D.
        </p>
      </div>

      {/* BACKUP, RESTAURAÇÃO & ZERAR DADOS */}
      <div className="rounded-2xl border border-blue-500/30 bg-gradient-to-br from-[#121828] via-[#0f1d38] to-[#121828] p-5 shadow-lg flex flex-col gap-4 relative overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-blue-300 flex items-center gap-2">
            <Database className="h-4 w-4 text-blue-400" /> GERENCIAMENTO DE DADOS E BACKUP (.JSON)
          </h3>
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-300 border border-emerald-500/30">
            <ShieldCheck className="h-3 w-3" /> Armazenamento Local Seguro
          </span>
        </div>

        <p className="text-xs text-slate-300">
          Faça o download de uma cópia de segurança completa ou restaure seus dados via arquivo JSON a qualquer momento.
        </p>

        {/* Database Status Cards */}
        <div className="grid grid-cols-3 gap-2 py-1 text-xs">
          <div className="rounded-xl bg-[#090e1a] p-2.5 border border-slate-800">
            <span className="text-[10px] text-slate-400 block font-semibold">Total Registros</span>
            <span className="text-base font-black text-blue-400">{totalRecords}</span>
          </div>
          <div className="rounded-xl bg-[#090e1a] p-2.5 border border-slate-800">
            <span className="text-[10px] text-slate-400 block font-semibold">Vendas + Fila</span>
            <span className="text-base font-black text-purple-400">
              {productionCards.length + orders.length}
            </span>
          </div>
          <div className="rounded-xl bg-[#090e1a] p-2.5 border border-slate-800">
            <span className="text-[10px] text-slate-400 block font-semibold">Cálculos Salvos</span>
            <span className="text-base font-black text-emerald-400">{savedCalculations.length}</span>
          </div>
        </div>

        {backupDownloaded && (
          <div className="flex items-center gap-2 rounded-xl border border-emerald-500/40 bg-emerald-950/60 p-3 text-xs font-semibold text-emerald-300">
            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
            <div>
              <p>Backup baixado com sucesso!</p>
              <p className="text-[10px] text-emerald-400/80 font-normal">
                {totalRecords} registros exportados em formato JSON.
              </p>
            </div>
          </div>
        )}

        {importStatus && (
          <div className={`flex items-center gap-2 rounded-xl border p-3 text-xs font-semibold ${
            importStatus.includes("sucesso") || importStatus.includes("Sucesso") ? "border-emerald-500/40 bg-emerald-950/60 text-emerald-300" : "border-rose-500/40 bg-rose-950/60 text-rose-300"
          }`}>
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>{importStatus}</span>
          </div>
        )}

        <div className="grid grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={handleDownloadBackup}
            className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 px-3 text-xs font-bold text-white shadow-md hover:bg-blue-500 active:scale-98 transition cursor-pointer"
          >
            <Download className="h-4 w-4 shrink-0" />
            <span>Baixar Backup (.JSON)</span>
          </button>

          <label className="flex items-center justify-center gap-2 rounded-xl bg-indigo-600/80 border border-indigo-500/40 py-3 px-3 text-xs font-bold text-white shadow-md hover:bg-indigo-600 active:scale-98 transition cursor-pointer text-center">
            <Upload className="h-4 w-4 shrink-0" />
            <span>Restaurar Backup</span>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        </div>

        {/* MODO ZERAR / LIMPAR PARA NOVOS CADASTROS */}
        <div className="mt-2 rounded-xl border border-rose-500/30 bg-rose-950/20 p-4 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-rose-300 font-bold text-xs">
              <Trash2 className="h-4 w-4 text-rose-400" />
              <span>Zerar Dados para Novos Cadastros & Cálculos</span>
            </div>
            <span className="text-[10px] text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20 font-semibold">
              Modo Limpeza
            </span>
          </div>
          <p className="text-[11px] text-slate-300 leading-relaxed">
            Limpe todos os registros de vendas, fila de produção, estoque de filamentos, impressoras, clientes e cálculos salvos para começar novos cadastros do zero.
          </p>

          {!showResetConfirm ? (
            <button
              type="button"
              onClick={() => setShowResetConfirm(true)}
              className="flex items-center justify-center gap-2 rounded-xl bg-rose-600/20 border border-rose-500/40 py-2.5 text-xs font-bold text-rose-300 hover:bg-rose-600 hover:text-white transition cursor-pointer"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Zerar Dados e Iniciar do Zero</span>
            </button>
          ) : (
            <div className="flex flex-col gap-2.5 rounded-lg bg-rose-950/80 border border-rose-500/60 p-3">
              <div className="flex items-center gap-2 text-rose-200 text-xs font-bold">
                <AlertTriangle className="h-4 w-4 text-rose-400 shrink-0" />
                <span>Tem certeza? Todos os dados atuais serão apagados!</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    if (onResetDatabase) onResetDatabase('empty');
                    setImportStatus("Banco de dados zerado com sucesso!");
                    setShowResetConfirm(false);
                    setTimeout(() => setImportStatus(null), 4000);
                  }}
                  className="rounded-lg bg-rose-600 py-2 text-xs font-bold text-white hover:bg-rose-500 transition cursor-pointer"
                >
                  Sim, Zerar Tudo
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (onResetDatabase) onResetDatabase('default');
                    setImportStatus("Dados restaurados para o padrão com sucesso!");
                    setShowResetConfirm(false);
                    setTimeout(() => setImportStatus(null), 4000);
                  }}
                  className="rounded-lg bg-slate-800 py-2 text-xs font-bold text-slate-200 hover:bg-slate-700 transition cursor-pointer"
                >
                  Restaurar Padrões
                </button>
              </div>
              <button
                type="button"
                onClick={() => setShowResetConfirm(false)}
                className="text-center text-[11px] text-slate-400 hover:text-white underline cursor-pointer mt-1"
              >
                Cancelar
              </button>
            </div>
          )}
        </div>
      </div>

      <form onSubmit={handleSave} className="flex flex-col gap-4 text-xs">
        {/* Loja & Contato */}
        <div className="rounded-2xl border border-slate-800 bg-[#121828] p-5 shadow-sm flex flex-col gap-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <Store className="h-4 w-4 text-blue-400" /> DADOS DA EMPRESA / OFICINA 3D
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
                className="mt-1 w-full rounded-xl border border-slate-800 bg-[#0d1320] px-3 py-2 text-xs text-white focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-400">Chave PIX (Recebimento)</label>
              <input
                type="text"
                value={pixKey}
                onChange={(e) => setPixKey(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-800 bg-[#0d1320] px-3 py-2 text-xs text-white focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-semibold text-slate-400">CEP de Origem (Frete)</label>
              <input
                type="text"
                value={cep}
                onChange={(e) => setCep(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-800 bg-[#0d1320] px-3 py-2 text-xs text-white focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-400">Cidade - UF</label>
              <input
                type="text"
                value={cityState}
                onChange={(e) => setCityState(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-800 bg-[#0d1320] px-3 py-2 text-xs text-white focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Notificações */}
        <div className="rounded-2xl border border-slate-800 bg-[#121828] p-5 shadow-sm flex flex-col gap-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <Bell className="h-4 w-4 text-blue-400" /> PREFERÊNCIAS DE ALERTAS
          </h3>

          <label className="flex items-center justify-between cursor-pointer py-1">
            <span className="text-slate-300">Alertas de novos pedidos via WhatsApp</span>
            <input
              type="checkbox"
              checked={notifyWhatsApp}
              onChange={(e) => setNotifyWhatsApp(e.target.checked)}
              className="accent-blue-600 h-4 w-4 rounded"
            />
          </label>

          <label className="flex items-center justify-between cursor-pointer py-1 border-t border-slate-800/80 pt-2">
            <span className="text-slate-300">Avisar quando filamento estiver abaixo de 100g</span>
            <input
              type="checkbox"
              checked={notifyLowFilament}
              onChange={(e) => setNotifyLowFilament(e.target.checked)}
              className="accent-blue-600 h-4 w-4 rounded"
            />
          </label>
        </div>

        {savedSuccess && (
          <div className="flex items-center gap-2 rounded-xl border border-emerald-500/40 bg-emerald-950/60 p-3 text-xs font-semibold text-emerald-300">
            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
            <span>Configurações salvas com sucesso!</span>
          </div>
        )}

        <button
          type="submit"
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-sm font-bold text-white shadow-md hover:bg-blue-500 active:scale-98 transition cursor-pointer"
        >
          <Save className="h-4 w-4" />
          <span>Salvar Configurações</span>
        </button>
      </form>
    </div>
  );
};
