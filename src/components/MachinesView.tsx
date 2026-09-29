import React, { useState } from "react";
import {
  Printer,
  Plus,
  Thermometer,
  Wrench,
  Clock,
  Zap,
  CheckCircle2,
  Trash2,
  AlertTriangle,
  Play,
  Pause,
} from "lucide-react";
import { Printer as PrinterType } from "../types";

interface MachinesViewProps {
  printers: PrinterType[];
  onAddPrinter: (printer: Omit<PrinterType, "id">) => void;
  onUpdatePrinterStatus: (id: string, status: PrinterType["status"]) => void;
  onDeletePrinter: (id: string) => void;
}

export const MachinesView: React.FC<MachinesViewProps> = ({
  printers,
  onAddPrinter,
  onUpdatePrinterStatus,
  onDeletePrinter,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);

  // New Printer State
  const [name, setName] = useState("");
  const [model, setModel] = useState("Bambu Lab P1S");
  const [nozzleDiameterMm, setNozzleDiameterMm] = useState(0.4);
  const [powerWatts, setPowerWatts] = useState(250);
  const [hourlyCost, setHourlyCost] = useState(1.5);

  const handleCreatePrinter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onAddPrinter({
      name,
      model,
      nozzleDiameterMm: Number(nozzleDiameterMm) || 0.4,
      status: "livre",
      powerWatts: Number(powerWatts) || 200,
      hourlyCost: Number(hourlyCost) || 1.5,
      totalHoursPrinted: 0,
      maintenanceHoursInterval: 250,
      currentJob: undefined,
      progressPercent: 0,
      nozzleTemp: 215,
      bedTemp: 60,
    });

    setName("");
    setShowAddModal(false);
  };

  return (
    <div className="mx-auto max-w-xl px-4 py-6 text-slate-100 flex flex-col gap-5">
      {/* Title & Subtitle */}
      <div>
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600/20 text-blue-400">
            <Printer className="h-5 w-5" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white leading-tight">
            Parque de Máquinas 3D
          </h1>
        </div>
        <p className="mt-1 text-xs text-slate-400">
          Gerencie e monitore impressoras, bicos, consumo e manutenções.
        </p>
      </div>

      {/* Button + Nova Impressora */}
      <button
        id="btn-new-printer"
        onClick={() => setShowAddModal(true)}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-sm font-bold text-white shadow-md shadow-blue-600/20 hover:bg-blue-500 active:scale-98 transition"
      >
        <Plus className="h-4 w-4" />
        <span>+ Cadastrar Impressora 3D</span>
      </button>

      {/* Printer List */}
      <div className="flex flex-col gap-3.5">
        {printers.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-800 p-8 text-center text-xs text-slate-500">
            Nenhuma máquina cadastrada. Adicione sua primeira impressora acima.
          </div>
        ) : (
          printers.map((printer) => {
            return (
              <div
                key={printer.id}
                className="rounded-2xl border border-slate-800 bg-[#121828] p-4 shadow-sm transition hover:border-slate-700"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-white">{printer.name}</h3>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                          printer.status === "imprimindo"
                            ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                            : printer.status === "livre"
                            ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                            : "bg-red-500/20 text-red-400 border border-red-500/30"
                        }`}
                      >
                        {printer.status === "imprimindo"
                          ? "Imprimindo"
                          : printer.status === "livre"
                          ? "Livre"
                          : "Manutenção"}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      {printer.model} • Bico {printer.nozzleDiameterMm}mm • {printer.powerWatts}W
                    </p>
                  </div>

                  <button
                    onClick={() => onDeletePrinter(printer.id)}
                    aria-label="Remover impressora"
                    className="text-slate-500 hover:text-red-400 transition"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                {/* Live Telemetry */}
                <div className="mt-3.5 grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center justify-between rounded-xl bg-[#0c1220] p-2.5">
                    <span className="flex items-center gap-1.5 text-slate-400">
                      <Thermometer className="h-3.5 w-3.5 text-red-400" />
                      Extrusor
                    </span>
                    <span className="font-bold text-white">{printer.nozzleTemp ?? 215}°C</span>
                  </div>
                  <div className="flex items-center justify-between rounded-xl bg-[#0c1220] p-2.5">
                    <span className="flex items-center gap-1.5 text-slate-400">
                      <Thermometer className="h-3.5 w-3.5 text-amber-400" />
                      Mesa
                    </span>
                    <span className="font-bold text-white">{printer.bedTemp ?? 60}°C</span>
                  </div>
                </div>

                {/* Current Job (if printing) */}
                {printer.status === "imprimindo" && (
                  <div className="mt-3 rounded-xl bg-[#0c1220] p-3 border border-blue-500/20">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-200">
                        {printer.currentJob || "Peça em andamento"}
                      </span>
                      <span className="font-bold text-blue-400">
                        {printer.progressPercent || 50}%
                      </span>
                    </div>
                    <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-800">
                      <div
                        className="h-full rounded-full bg-blue-500 transition-all duration-300"
                        style={{ width: `${printer.progressPercent || 50}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Maintenance indicator */}
                <div className="mt-3 flex items-center justify-between border-t border-slate-800/80 pt-2.5 text-[11px] text-slate-400">
                  <span className="flex items-center gap-1">
                    <Wrench className="h-3 w-3 text-slate-500" />
                    Manutenção preventiva em:{" "}
                    <strong className="text-slate-300">
                      {printer.maintenanceHoursInterval - (printer.totalHoursPrinted % printer.maintenanceHoursInterval)}h
                    </strong>
                  </span>

                  <div className="flex items-center gap-1">
                    {printer.status === "livre" ? (
                      <button
                        onClick={() => onUpdatePrinterStatus(printer.id, "imprimindo")}
                        className="rounded-lg bg-blue-600/20 px-2 py-1 text-blue-400 font-semibold hover:bg-blue-600/30 transition"
                      >
                        Iniciar Job
                      </button>
                    ) : (
                      <button
                        onClick={() => onUpdatePrinterStatus(printer.id, "livre")}
                        className="rounded-lg bg-emerald-600/20 px-2 py-1 text-emerald-400 font-semibold hover:bg-emerald-600/30 transition"
                      >
                        Liberar Máquina
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal: Cadastrar Impressora */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-[#0e1424] p-5 shadow-2xl text-slate-200">
            <h2 className="text-lg font-bold text-white">+ Adicionar Impressora 3D</h2>
            <p className="text-xs text-slate-400 mt-0.5">Cadastre para alocar cards e calcular energia.</p>

            <form onSubmit={handleCreatePrinter} className="mt-4 flex flex-col gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-300">Apelido da Máquina</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Bambu P1S #01 Oficina"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-800 bg-[#141b2d] px-3 py-2 text-xs text-white focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300">Modelo</label>
                  <input
                    type="text"
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-800 bg-[#141b2d] px-3 py-2 text-xs text-white focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300">Bico Instalado (mm)</label>
                  <select
                    value={nozzleDiameterMm}
                    onChange={(e) => setNozzleDiameterMm(Number(e.target.value))}
                    className="mt-1 w-full rounded-xl border border-slate-800 bg-[#141b2d] px-3 py-2 text-xs text-white focus:border-blue-500 focus:outline-none"
                  >
                    <option value={0.2}>0.2 mm (Alta Resolução)</option>
                    <option value={0.4}>0.4 mm (Padrão)</option>
                    <option value={0.6}>0.6 mm (Rápido)</option>
                    <option value={0.8}>0.8 mm (Ultra Rápido)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300">Consumo Médio (W)</label>
                  <input
                    type="number"
                    value={powerWatts}
                    onChange={(e) => setPowerWatts(Number(e.target.value))}
                    className="mt-1 w-full rounded-xl border border-slate-800 bg-[#141b2d] px-3 py-2 text-xs text-white focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300">Custo Hora Depreciação (R$)</label>
                  <input
                    type="number"
                    step={0.1}
                    value={hourlyCost}
                    onChange={(e) => setHourlyCost(Number(e.target.value))}
                    className="mt-1 w-full rounded-xl border border-slate-800 bg-[#141b2d] px-3 py-2 text-xs text-white focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="mt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-500"
                >
                  Adicionar Impressora
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
