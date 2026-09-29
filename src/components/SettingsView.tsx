import React, { useState } from "react";
import {
  Settings,
  Save,
  CheckCircle2,
  Store,
  Phone,
  QrCode,
  MapPin,
  Bell,
  RefreshCw,
} from "lucide-react";

export const SettingsView: React.FC = () => {
  const [storeName, setStoreName] = useState("Versátil Maker");
  const [whatsapp, setWhatsapp] = useState("(11) 98765-4321");
  const [pixKey, setPixKey] = useState("contato@versatilmaker.com.br");
  const [cep, setCep] = useState("01310-100");
  const [cityState, setCityState] = useState("São Paulo - SP");
  const [notifyWhatsApp, setNotifyWhatsApp] = useState(true);
  const [notifyLowFilament, setNotifyLowFilament] = useState(true);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="mx-auto max-w-xl px-4 py-6 text-slate-100 flex flex-col gap-6">
      {/* Title */}
      <div>
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600/20 text-blue-400">
            <Settings className="h-5 w-5" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white leading-tight">
            Configurações da Loja
          </h1>
        </div>
        <p className="mt-1 text-xs text-slate-400">
          Dados operacionais da sua loja de impressão 3D e preferências do sistema.
        </p>
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
              <p className="text-[11px] text-slate-400">Receber link de impressão finalizada automaticamente.</p>
            </div>
            <input
              type="checkbox"
              checked={notifyWhatsApp}
              onChange={(e) => setNotifyWhatsApp(e.target.checked)}
              className="h-4 w-4 rounded border-slate-700 bg-slate-800 text-blue-600 focus:ring-0"
            />
          </label>
        </div>

        {savedSuccess && (
          <div className="flex items-center gap-2 rounded-xl border border-emerald-500/40 bg-emerald-950/40 p-3 text-xs font-semibold text-emerald-300">
            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
            <span>Configurações salvas com sucesso!</span>
          </div>
        )}

        <button
          type="submit"
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-sm font-bold text-white shadow-md shadow-blue-600/20 hover:bg-blue-500 transition"
        >
          <Save className="h-4 w-4" />
          <span>Salvar Configurações</span>
        </button>
      </form>
    </div>
  );
};
