import React, { useState, useEffect } from "react";
import {
  ListTodo,
  Plus,
  ChevronLeft,
  ChevronRight,
  Clock,
  Printer,
  Package,
  Play,
  Check,
  Trash2,
  AlertCircle,
  Thermometer,
  Layers,
  Maximize2,
  Minimize2,
  Monitor,
  Flame,
} from "lucide-react";
import { Filament, Printer as PrinterType, ProductionCard } from "../types";

interface ProductionQueueViewProps {
  cards: ProductionCard[];
  printers: PrinterType[];
  filaments: Filament[];
  onAddCard: (card: Omit<ProductionCard, "id" | "createdAt">) => void;
  onUpdateCardStatus: (cardId: string, status: ProductionCard["status"]) => void;
  onDeleteCard: (cardId: string) => void;
  onNavigateToMachines: () => void;
}

export const ProductionQueueView: React.FC<ProductionQueueViewProps> = ({
  cards,
  printers,
  filaments,
  onAddCard,
  onUpdateCardStatus,
  onDeleteCard,
  onNavigateToMachines,
}) => {
  const [activeTab, setActiveTab] = useState<ProductionCard["status"]>("imprimindo");
  const [showAddModal, setShowAddModal] = useState(false);
  const [printerCarouselIndex, setPrinterCarouselIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Countdown timers state for active machines/jobs (in seconds remaining)
  // Keyed by printer ID or card ID
  const [timers, setTimers] = useState<Record<string, number>>({});

  // Initialize or update timers when cards/printers change
  useEffect(() => {
    const initialTimers: Record<string, number> = {};
    cards.forEach((c) => {
      if (c.status === "imprimindo") {
        const timeHours = c.printTimeHours || 2;
        // Default remaining seconds (e.g. 70% left or based on printTimeHours)
        initialTimers[c.id] = Math.round(timeHours * 3600 * 0.7);
      }
    });
    printers.forEach((p) => {
      if (p.status === "imprimindo" && p.timeLeftMinutes) {
        initialTimers[p.id] = p.timeLeftMinutes * 60;
      }
    });
    setTimers(initialTimers);
  }, [cards, printers]);

  // Tick timers every second
  useEffect(() => {
    const interval = setInterval(() => {
      setTimers((prev) => {
        const updated = { ...prev };
        let hasChanges = false;
        Object.keys(updated).forEach((id) => {
          if (updated[id] > 0) {
            updated[id] -= 1;
            hasChanges = true;
          }
        });
        return hasChanges ? updated : prev;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Format seconds into HH:MM:SS
  const formatCountdown = (totalSeconds: number) => {
    if (isNaN(totalSeconds) || totalSeconds < 0) return "00:00:00";
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return `${hrs.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  // New Card Form State
  const [newTitle, setNewTitle] = useState("");
  const [newProductName, setNewProductName] = useState("");
  const [newClientName, setNewClientName] = useState("");
  const [newOrderNumber, setNewOrderNumber] = useState("");
  const [newOrigin, setNewOrigin] = useState<ProductionCard["origin"]>("Mercado Livre");
  const [newWeightGrams, setNewWeightGrams] = useState(60);
  const [newPrintTimeHours, setNewPrintTimeHours] = useState(3.0);
  const [newPriority, setNewPriority] = useState<ProductionCard["priority"]>("normal");
  const [newPrinterId, setNewPrinterId] = useState(printers[0]?.id || "");
  const [newFilamentId, setNewFilamentId] = useState(filaments[0]?.id || "");

  const aFazerCards = cards.filter((c) => c.status === "a_fazer");
  const imprimindoCards = cards.filter((c) => c.status === "imprimindo");
  const finalizadoCards = cards.filter((c) => c.status === "finalizado");

  const currentCards =
    activeTab === "a_fazer"
      ? aFazerCards
      : activeTab === "imprimindo"
      ? imprimindoCards
      : finalizadoCards;

  const handleCreateCard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    onAddCard({
      title: newTitle,
      productName: newProductName || newTitle,
      clientName: newClientName,
      orderNumber: newOrderNumber,
      origin: newOrigin,
      printerId: newPrinterId || undefined,
      filamentId: newFilamentId || undefined,
      weightGrams: Number(newWeightGrams) || 50,
      printTimeHours: Number(newPrintTimeHours) || 2,
      status: "a_fazer",
      priority: newPriority,
    });

    setNewTitle("");
    setNewProductName("");
    setNewClientName("");
    setNewOrderNumber("");
    setShowAddModal(false);
  };

  return (
    <div className="mx-auto max-w-xl px-4 py-6 text-slate-100 flex flex-col gap-5">
      {/* Title & Subtitle */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600/20 text-blue-400">
              <ListTodo className="h-5 w-5" />
            </div>
            <h1 className="text-2xl font-black tracking-tight text-white">Fila de Produção</h1>
          </div>
          <p className="mt-1 text-xs text-slate-400">
            Gerencie sua produção e monitore suas impressoras em tempo real.
          </p>
        </div>

        {/* Fullscreen Mode Button */}
        <button
          onClick={() => setIsFullscreen(true)}
          className="flex items-center gap-1.5 rounded-xl bg-slate-800 border border-slate-700 px-3 py-2 text-xs font-semibold text-blue-400 hover:bg-slate-700 hover:text-white transition shadow-sm"
          title="Modo Tela Cheia / Estúdio"
        >
          <Maximize2 className="h-4 w-4" />
          <span className="hidden sm:inline">Modo Estúdio</span>
        </button>
      </div>

      {/* Button + Novo Card */}
      <button
        id="btn-new-production-card"
        onClick={() => setShowAddModal(true)}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-sm font-bold text-white shadow-md shadow-blue-600/20 hover:bg-blue-500 active:scale-98 transition"
      >
        <Plus className="h-4 w-4" />
        <span>+ Novo Card</span>
      </button>

      {/* Status das Impressoras */}
      <div className="rounded-2xl border border-slate-800 bg-[#121828] p-4 shadow-sm">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
            <Printer className="h-4 w-4 text-blue-400" />
            <span>STATUS DAS IMPRESSORAS</span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() =>
                setPrinterCarouselIndex((prev) => (prev > 0 ? prev - 1 : printers.length - 1))
              }
              aria-label="Impressora anterior"
              className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#0d1320] text-slate-400 hover:text-white transition"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() =>
                setPrinterCarouselIndex((prev) => (prev < printers.length - 1 ? prev + 1 : 0))
              }
              aria-label="Próxima impressora"
              className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#0d1320] text-slate-400 hover:text-white transition"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {printers.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-500">
            <p>Nenhuma máquina cadastrada.</p>
            <button
              onClick={onNavigateToMachines}
              className="mt-2 text-blue-400 hover:underline font-semibold"
            >
              Vá em "Máquinas" para adicionar.
            </button>
          </div>
        ) : (
          <div className="mt-3">
            {(() => {
              const p = printers[printerCarouselIndex % printers.length];
              if (!p) return null;
              const remainingSecs = timers[p.id] ?? (p.timeLeftMinutes ? p.timeLeftMinutes * 60 : 2700);
              return (
                <div className="flex flex-col gap-2 rounded-xl bg-[#0c1220] p-3 border border-slate-800/60">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-sm">{p.name}</span>
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                            p.status === "imprimindo"
                              ? "bg-blue-500/20 text-blue-400 border border-blue-500/40"
                              : p.status === "livre"
                              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                              : "bg-red-500/20 text-red-400"
                          }`}
                        >
                          {p.status === "imprimindo"
                            ? "Imprimindo"
                            : p.status === "livre"
                            ? "Livre"
                            : "Manutenção"}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400">{p.model}</p>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-slate-400">
                      <div className="flex items-center gap-1">
                        <Thermometer className="h-3.5 w-3.5 text-red-400" />
                        <span>{p.nozzleTemp ?? 210}°C</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Thermometer className="h-3.5 w-3.5 text-amber-400" />
                        <span>{p.bedTemp ?? 60}°C</span>
                      </div>
                    </div>
                  </div>

                  {p.status === "imprimindo" && (
                    <div className="mt-2">
                      <div className="flex items-center justify-between text-xs text-slate-300">
                        <span className="truncate max-w-[200px] text-slate-400 font-medium">
                          {p.currentJob || "Trabalho em andamento"}
                        </span>
                        <span className="font-bold text-blue-400 font-mono text-sm">
                          {formatCountdown(remainingSecs)}
                        </span>
                      </div>
                      <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
                        <div
                          className="h-full rounded-full bg-blue-500 transition-all duration-300"
                          style={{ width: `${p.progressPercent || 50}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        )}
      </div>

      {/* Tabs Filter: A Fazer / Imprimindo / Finalizado */}
      <div className="flex rounded-xl bg-[#121828] p-1 border border-slate-800">
        <button
          onClick={() => setActiveTab("a_fazer")}
          className={`flex-1 rounded-lg py-2 text-xs font-semibold transition ${
            activeTab === "a_fazer"
              ? "bg-purple-600 text-white shadow-sm"
              : "text-slate-400 hover:text-white"
          }`}
        >
          A Fazer <span className="ml-1 opacity-80">({aFazerCards.length})</span>
        </button>
        <button
          onClick={() => setActiveTab("imprimindo")}
          className={`flex-1 rounded-lg py-2 text-xs font-semibold transition ${
            activeTab === "imprimindo"
              ? "bg-blue-600 text-white shadow-sm"
              : "text-slate-400 hover:text-white"
          }`}
        >
          Imprimindo <span className="ml-1 opacity-80">({imprimindoCards.length})</span>
        </button>
        <button
          onClick={() => setActiveTab("finalizado")}
          className={`flex-1 rounded-lg py-2 text-xs font-semibold transition ${
            activeTab === "finalizado"
              ? "bg-emerald-600 text-white shadow-sm"
              : "text-slate-400 hover:text-white"
          }`}
        >
          Finalizado <span className="ml-1 opacity-80">({finalizadoCards.length})</span>
        </button>
      </div>

      {/* Cards List for active status */}
      <div className="flex flex-col gap-3">
        {currentCards.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-800 p-8 text-center text-xs text-slate-500">
            Nenhum card em "{activeTab.replace("_", " ")}" no momento.
          </div>
        ) : (
          currentCards.map((card) => {
            const assignedPrinter = printers.find((p) => p.id === card.printerId);
            const assignedFilament = filaments.find((f) => f.id === card.filamentId);
            const cardTimer = timers[card.id] ?? Math.round((card.printTimeHours || 2) * 3600 * 0.6);

            return (
              <div
                key={card.id}
                className="rounded-2xl border border-slate-800 bg-[#121828] p-4 shadow-sm transition hover:border-slate-700"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span
                      className={`inline-block rounded px-2 py-0.5 text-[10px] font-bold ${
                        card.origin === "Shopee"
                          ? "bg-orange-950/60 text-orange-400 border border-orange-500/30"
                          : card.origin === "Mercado Livre"
                          ? "bg-yellow-950/60 text-yellow-300 border border-yellow-500/30"
                          : "bg-blue-950/60 text-blue-400 border border-blue-500/30"
                      }`}
                    >
                      {card.origin} {card.orderNumber && `• ${card.orderNumber}`}
                    </span>
                    <h3 className="mt-1 text-sm font-bold text-white">{card.title}</h3>
                    {card.clientName && (
                      <p className="text-[11px] text-slate-400">Cliente: {card.clientName}</p>
                    )}
                  </div>

                  <button
                    onClick={() => onDeleteCard(card.id)}
                    aria-label="Excluir card"
                    className="text-slate-500 hover:text-red-400 transition"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                {/* Specs: Weight, Time, Filament, Printer */}
                <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-slate-300">
                  <div className="flex items-center gap-1.5 rounded-lg bg-[#0c1220] p-2">
                    <Package className="h-3.5 w-3.5 text-blue-400" />
                    <span>{card.weightGrams}g filamento</span>
                  </div>
                  <div className="flex items-center gap-1.5 rounded-lg bg-[#0c1220] p-2">
                    <Clock className="h-3.5 w-3.5 text-purple-400" />
                    <span>{card.printTimeHours}h tempo</span>
                  </div>
                </div>

                {card.status === "imprimindo" && (
                  <div className="mt-2.5 rounded-xl bg-blue-950/30 border border-blue-500/20 p-2.5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-blue-400 animate-pulse" />
                      <span className="text-xs text-slate-300 font-medium">Tempo Restante:</span>
                    </div>
                    <span className="font-mono text-sm font-bold text-blue-400">
                      {formatCountdown(cardTimer)}
                    </span>
                  </div>
                )}

                <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
                  <span>
                    Máquina: <strong className="text-slate-200">{assignedPrinter?.name || "Não atribuída"}</strong>
                  </span>
                  <span>
                    Material: <strong className="text-slate-200">{assignedFilament?.name || "PLA"}</strong>
                  </span>
                </div>

                {/* Status Action Buttons */}
                <div className="mt-3.5 flex items-center gap-2 border-t border-slate-800/80 pt-3">
                  {card.status === "a_fazer" && (
                    <button
                      onClick={() => onUpdateCardStatus(card.id, "imprimindo")}
                      className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-blue-600/90 py-2 text-xs font-semibold text-white hover:bg-blue-600 transition"
                    >
                      <Play className="h-3.5 w-3.5" />
                      <span>Iniciar Impressão</span>
                    </button>
                  )}

                  {card.status === "imprimindo" && (
                    <>
                      <button
                        onClick={() => onUpdateCardStatus(card.id, "a_fazer")}
                        className="rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-medium text-slate-300 hover:bg-slate-700 transition"
                      >
                        Pausar / Voltar
                      </button>
                      <button
                        onClick={() => onUpdateCardStatus(card.id, "finalizado")}
                        className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-emerald-600 py-2 text-xs font-semibold text-white hover:bg-emerald-500 transition"
                      >
                        <Check className="h-3.5 w-3.5" />
                        <span>Concluir Impressão (Baixa Estoque)</span>
                      </button>
                    </>
                  )}

                  {card.status === "finalizado" && (
                    <div className="flex w-full items-center justify-between text-xs text-emerald-400 font-semibold">
                      <span className="flex items-center gap-1">
                        <Check className="h-3.5 w-3.5" /> Pronto para embalagem e envio
                      </span>
                      <button
                        onClick={() => onUpdateCardStatus(card.id, "imprimindo")}
                        className="text-[11px] text-slate-400 hover:text-white"
                      >
                        Reabrir
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* FULLSCREEN STUDIO MONITOR MODE */}
      {isFullscreen && (
        <div className="fixed inset-0 z-50 bg-[#070b14] text-white overflow-y-auto p-6 md:p-10 flex flex-col gap-8">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-5">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600/20 text-blue-400 border border-blue-500/30">
                <Monitor className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-2xl md:text-3xl font-black tracking-tight text-white flex items-center gap-3">
                  <span>Modo Estúdio • Monitor em Tempo Real</span>
                  <span className="animate-pulse inline-block h-3 w-3 rounded-full bg-emerald-500" />
                </h2>
                <p className="text-sm text-slate-400 mt-0.5">
                  Painel de monitoramento de máquinas ativas, temperaturas e contagem regressiva de impressão.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="hidden lg:flex flex-col items-end text-xs text-slate-400 font-mono">
                <span>{new Date().toLocaleDateString()}</span>
                <span className="text-white font-bold">{new Date().toLocaleTimeString()}</span>
              </div>
              <button
                onClick={() => setIsFullscreen(false)}
                className="flex items-center gap-2 rounded-xl bg-red-600/20 border border-red-500/30 px-4 py-2.5 text-sm font-bold text-red-400 hover:bg-red-600 hover:text-white transition shadow-lg"
              >
                <Minimize2 className="h-4 w-4" />
                <span>Sair da Tela Cheia</span>
              </button>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="rounded-2xl border border-slate-800 bg-[#101728] p-5">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Máquinas Ativas</span>
              <p className="text-3xl font-black text-blue-400 mt-2">
                {printers.filter((p) => p.status === "imprimindo").length} <span className="text-sm text-slate-500 font-normal">/ {printers.length}</span>
              </p>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-[#101728] p-5">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Impressões na Fila</span>
              <p className="text-3xl font-black text-purple-400 mt-2">{imprimindoCards.length}</p>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-[#101728] p-5">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">A Fazer</span>
              <p className="text-3xl font-black text-amber-400 mt-2">{aFazerCards.length}</p>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-[#101728] p-5">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Finalizados Hoje</span>
              <p className="text-3xl font-black text-emerald-400 mt-2">{finalizadoCards.length}</p>
            </div>
          </div>

          {/* Active Machines & Live Timers Grid */}
          <div>
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Printer className="h-5 w-5 text-blue-400" />
              <span>Status Detalhado das Impressoras e Timers</span>
            </h3>

            {printers.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-800 p-12 text-center text-slate-500">
                Nenhuma máquina cadastrada no estúdio.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {printers.map((p) => {
                  const activeCard = cards.find(
                    (c) => c.printerId === p.id && c.status === "imprimindo"
                  );
                  const timerSecs = timers[p.id] ?? (p.timeLeftMinutes ? p.timeLeftMinutes * 60 : 3600);

                  return (
                    <div
                      key={p.id}
                      className={`rounded-2xl border p-5 flex flex-col justify-between gap-4 transition ${
                        p.status === "imprimindo"
                          ? "border-blue-500/50 bg-gradient-to-b from-[#121c33] to-[#0d1322] shadow-xl shadow-blue-950/20"
                          : "border-slate-800 bg-[#101728]"
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold text-lg text-white">{p.name}</h4>
                          <span
                            className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                              p.status === "imprimindo"
                                ? "bg-blue-500/20 text-blue-400 border border-blue-500/40"
                                : p.status === "livre"
                                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                                : "bg-red-500/20 text-red-400"
                            }`}
                          >
                            {p.status === "imprimindo"
                              ? "Imprimindo"
                              : p.status === "livre"
                              ? "Livre"
                              : "Manutenção"}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">{p.model}</p>
                      </div>

                      {/* Temperatures */}
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="flex items-center gap-2 rounded-xl bg-[#090e18] p-2.5 border border-slate-800">
                          <Thermometer className="h-4 w-4 text-red-400" />
                          <div>
                            <span className="text-[10px] text-slate-500 block">Bico (Nozzle)</span>
                            <span className="font-bold text-white">{p.nozzleTemp ?? 210}°C</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 rounded-xl bg-[#090e18] p-2.5 border border-slate-800">
                          <Thermometer className="h-4 w-4 text-amber-400" />
                          <div>
                            <span className="text-[10px] text-slate-500 block">Mesa (Bed)</span>
                            <span className="font-bold text-white">{p.bedTemp ?? 60}°C</span>
                          </div>
                        </div>
                      </div>

                      {/* Job & Countdown */}
                      {p.status === "imprimindo" ? (
                        <div className="rounded-xl bg-[#090e18] p-4 border border-slate-800 flex flex-col gap-3">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-slate-300 truncate max-w-[180px]">
                              {activeCard?.title || p.currentJob || "Trabalho em andamento"}
                            </span>
                            <span className="text-xs font-bold text-blue-400">
                              {p.progressPercent || 50}%
                            </span>
                          </div>

                          <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800">
                            <div
                              className="h-full rounded-full bg-blue-500 transition-all duration-300"
                              style={{ width: `${p.progressPercent || 50}%` }}
                            />
                          </div>

                          <div className="flex items-center justify-between pt-1 border-t border-slate-800/80">
                            <span className="text-[11px] text-slate-400 flex items-center gap-1">
                              <Clock className="h-3.5 w-3.5 text-blue-400 animate-pulse" />
                              <span>Tempo Restante:</span>
                            </span>
                            <span className="font-mono text-base font-extrabold text-blue-400">
                              {formatCountdown(timerSecs)}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="rounded-xl bg-[#090e18] p-4 text-center text-xs text-slate-500 border border-slate-800">
                          Máquina ociosa aguardando novo trabalho.
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Active Printing Jobs Full Grid */}
          <div className="mt-4">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Layers className="h-5 w-5 text-purple-400" />
              <span>Tarefas em Andamento ({imprimindoCards.length})</span>
            </h3>

            {imprimindoCards.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-800 p-8 text-center text-xs text-slate-500">
                Nenhum trabalho na fila de impressão no momento.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {imprimindoCards.map((card) => {
                  const assignedPrinter = printers.find((p) => p.id === card.printerId);
                  const cardTimerSecs = timers[card.id] ?? 3600;

                  return (
                    <div
                      key={card.id}
                      className="rounded-2xl border border-slate-800 bg-[#101728] p-5 flex flex-col justify-between gap-4"
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="rounded px-2 py-0.5 text-[10px] font-bold bg-blue-950/80 text-blue-400 border border-blue-500/30">
                            {card.origin}
                          </span>
                          <span className="font-mono text-sm font-bold text-blue-400">
                            {formatCountdown(cardTimerSecs)}
                          </span>
                        </div>
                        <h4 className="font-bold text-base text-white mt-2">{card.title}</h4>
                        {card.clientName && (
                          <p className="text-xs text-slate-400">Cliente: {card.clientName}</p>
                        )}
                      </div>

                      <div className="flex items-center justify-between text-xs text-slate-300 border-t border-slate-800 pt-3">
                        <span>Máquina: <strong className="text-white">{assignedPrinter?.name || "N/A"}</strong></span>
                        <span>{card.weightGrams}g</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal: Novo Card */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-[#0e1424] p-5 shadow-2xl text-slate-200">
            <h2 className="text-lg font-bold text-white">+ Novo Pedido na Fila</h2>
            <p className="text-xs text-slate-400 mt-0.5">Cadastre uma nova peça para impressão.</p>

            <form onSubmit={handleCreateCard} className="mt-4 flex flex-col gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-300">Título / Descrição</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Escultura Gato Abstrato Geometrico"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-800 bg-[#141b2d] px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300">Cliente</label>
                  <input
                    type="text"
                    placeholder="Nome do cliente"
                    value={newClientName}
                    onChange={(e) => setNewClientName(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-800 bg-[#141b2d] px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300">Origem</label>
                  <select
                    value={newOrigin}
                    onChange={(e) => setNewOrigin(e.target.value as any)}
                    className="mt-1 w-full rounded-xl border border-slate-800 bg-[#141b2d] px-3 py-2 text-xs text-white focus:border-blue-500 focus:outline-none"
                  >
                    <option value="Mercado Livre">Mercado Livre</option>
                    <option value="Shopee">Shopee</option>
                    <option value="WhatsApp">WhatsApp</option>
                    <option value="Direto">Direto / Loja</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300">Peso Estimado (g)</label>
                  <input
                    type="number"
                    min={1}
                    value={newWeightGrams}
                    onChange={(e) => setNewWeightGrams(Number(e.target.value))}
                    className="mt-1 w-full rounded-xl border border-slate-800 bg-[#141b2d] px-3 py-2 text-xs text-white focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300">Tempo de Impressão (h)</label>
                  <input
                    type="number"
                    step={0.5}
                    min={0.2}
                    value={newPrintTimeHours}
                    onChange={(e) => setNewPrintTimeHours(Number(e.target.value))}
                    className="mt-1 w-full rounded-xl border border-slate-800 bg-[#141b2d] px-3 py-2 text-xs text-white focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300">Impressora</label>
                  <select
                    value={newPrinterId}
                    onChange={(e) => setNewPrinterId(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-800 bg-[#141b2d] px-3 py-2 text-xs text-white focus:border-blue-500 focus:outline-none"
                  >
                    {printers.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300">Filamento</label>
                  <select
                    value={newFilamentId}
                    onChange={(e) => setNewFilamentId(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-800 bg-[#141b2d] px-3 py-2 text-xs text-white focus:border-blue-500 focus:outline-none"
                  >
                    {filaments.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.name} ({f.weightRemainingGrams}g)
                      </option>
                    ))}
                  </select>
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
                  Criar Card
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
