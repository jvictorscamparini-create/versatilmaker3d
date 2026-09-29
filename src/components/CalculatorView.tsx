import React, { useState, useMemo } from "react";
import {
  Calculator,
  Save,
  Plus,
  Minus,
  CheckCircle2,
  HelpCircle,
  Zap,
  Box,
  CreditCard,
  Percent,
  TrendingUp,
  ShieldCheck,
  ChevronDown,
  Trash2,
  Send,
  Sparkles,
} from "lucide-react";
import { AppView, SavedCalculation } from "../types";

interface CalculatorViewProps {
  savedCalculations: SavedCalculation[];
  onSaveCalculation: (calc: SavedCalculation) => void;
  onSendToProductionQueue?: (name: string, weight: number, time: number) => void;
  onSendToCreativeStudio?: (name: string) => void;
}

export const CalculatorView: React.FC<CalculatorViewProps> = ({
  savedCalculations,
  onSaveCalculation,
  onSendToProductionQueue,
  onSendToCreativeStudio,
}) => {
  const [productName, setProductName] = useState("Escultura Gato Abstrato");
  const [selectedSavedId, setSelectedSavedId] = useState("");
  const [saveSuccessMsg, setSaveSuccessMsg] = useState(false);

  // Material 1
  const [spoolPrice, setSpoolPrice] = useState(130);
  const [spoolWeightGrams, setSpoolWeightGrams] = useState(1000);
  const [pieceWeightGrams, setPieceWeightGrams] = useState(50);

  // Additional materials if any
  const [extraMaterials, setExtraMaterials] = useState<
    { id: string; name: string; spoolPrice: number; spoolWeight: number; pieceWeight: number }[]
  >([]);

  // Embalagem e Logística
  const [boxPrice, setBoxPrice] = useState(3.5);
  const [bubbleWrapPrice, setBubbleWrapPrice] = useState(1.2);
  const [tapePrice, setTapePrice] = useState(0);

  // Energia e Tempo
  const [timeHours, setTimeHours] = useState(4);
  const [powerWatts, setPowerWatts] = useState(200);
  const [kwhCost, setKwhCost] = useState(0.95);

  // Configuração de Venda
  const [platform, setPlatform] = useState<"shopee" | "mercadolivre" | "direto" | "personalizado">("shopee");
  const [manualMode, setManualMode] = useState(false);
  const [manualProductCost, setManualProductCost] = useState(11.96);
  const [shippingFixed, setShippingFixed] = useState(4.0);
  const [commissionPercent, setCommissionPercent] = useState(20);
  const [taxPercent, setTaxPercent] = useState(6);
  const [targetMarginPercent, setTargetMarginPercent] = useState(30);

  // Platform rule presets
  const handlePlatformChange = (plat: "shopee" | "mercadolivre" | "direto" | "personalizado") => {
    setPlatform(plat);
    if (plat === "shopee") {
      setShippingFixed(4.0);
      setCommissionPercent(20);
    } else if (plat === "mercadolivre") {
      setShippingFixed(18.5);
      setCommissionPercent(16);
    } else if (plat === "direto") {
      setShippingFixed(0);
      setCommissionPercent(0);
    }
  };

  // Stepper helper
  const step = (setter: React.Dispatch<React.SetStateAction<number>>, delta: number, min = 0) => {
    setter((prev) => Math.max(min, Number((prev + delta).toFixed(2))));
  };

  // Calculations
  const calculations = useMemo(() => {
    // 1. Material 1 Cost
    const mat1Cost = (pieceWeightGrams / (spoolWeightGrams || 1000)) * spoolPrice;

    // Extra materials
    const extraMatCost = extraMaterials.reduce(
      (acc, m) => acc + (m.pieceWeight / (m.spoolWeight || 1000)) * m.spoolPrice,
      0
    );

    const totalFilamentCost = mat1Cost + extraMatCost;

    // 2. Packaging Cost
    const totalPackagingCost = boxPrice + bubbleWrapPrice + tapePrice;

    // 3. Energy Cost
    const totalEnergyCost = ((timeHours * powerWatts) / 1000) * kwhCost;

    // Total Product Cost
    const autoProductCost = totalFilamentCost + totalPackagingCost + totalEnergyCost;
    const effectiveProductCost = manualMode ? manualProductCost : autoProductCost;

    // Reverse Pricing Formula:
    // P * (1 - (comm + tax + targetMargin)) = ProductCost + ShippingFixed
    const totalRate = (commissionPercent + taxPercent + targetMarginPercent) / 100;
    const clampedRate = Math.min(totalRate, 0.88); // prevent division by zero or negative
    const denominator = 1 - clampedRate;

    const baseCostWithShipping = effectiveProductCost + shippingFixed;
    const suggestedPrice = Math.max(0, baseCostWithShipping / denominator);

    // Charges and Taxes at suggested price
    const taxes = (taxPercent / 100) * suggestedPrice;
    const marketplaceFees = shippingFixed + (commissionPercent / 100) * suggestedPrice;
    const totalCharges = taxes + marketplaceFees;
    const netProfit = suggestedPrice - effectiveProductCost - totalCharges;

    // Break-even (lucro zero)
    const breakEvenDenominator = Math.max(0.1, 1 - (commissionPercent + taxPercent) / 100);
    const breakEvenPrice = baseCostWithShipping / breakEvenDenominator;

    return {
      filamentCost: totalFilamentCost,
      packagingCost: totalPackagingCost,
      energyCost: totalEnergyCost,
      productCost: effectiveProductCost,
      suggestedPrice: Number(suggestedPrice.toFixed(2)),
      marketplaceFees: Number(marketplaceFees.toFixed(2)),
      taxes: Number(taxes.toFixed(2)),
      totalCharges: Number(totalCharges.toFixed(2)),
      netProfit: Number(netProfit.toFixed(2)),
      breakEvenPrice: Number(breakEvenPrice.toFixed(2)),
    };
  }, [
    spoolPrice,
    spoolWeightGrams,
    pieceWeightGrams,
    extraMaterials,
    boxPrice,
    bubbleWrapPrice,
    tapePrice,
    timeHours,
    powerWatts,
    kwhCost,
    manualMode,
    manualProductCost,
    shippingFixed,
    commissionPercent,
    taxPercent,
    targetMarginPercent,
  ]);

  // Load Saved Calculation
  const handleLoadSaved = (id: string) => {
    setSelectedSavedId(id);
    const found = savedCalculations.find((c) => c.id === id);
    if (!found) return;

    setProductName(found.productName);
    if (found.filaments[0]) {
      setSpoolPrice(found.filaments[0].spoolPrice);
      setSpoolWeightGrams(found.filaments[0].spoolWeightGrams);
      setPieceWeightGrams(found.filaments[0].pieceWeightGrams);
    }
    setBoxPrice(found.packaging.boxPrice);
    setBubbleWrapPrice(found.packaging.bubbleWrapPrice);
    setTapePrice(found.packaging.tapePrice);
    setTimeHours(found.energy.timeHours);
    setPowerWatts(found.energy.powerWatts);
    setKwhCost(found.energy.kwhCost);
    setPlatform(found.salesConfig.platform);
    setShippingFixed(found.salesConfig.shippingFixed);
    setCommissionPercent(found.salesConfig.marketplaceCommission);
    setTaxPercent(found.salesConfig.taxPercent);
    setTargetMarginPercent(found.salesConfig.targetMarginPercent);
    setManualMode(found.salesConfig.manualMode);
  };

  // Save calculation
  const handleSave = () => {
    const newCalc: SavedCalculation = {
      id: "calc-" + Date.now(),
      productName: productName || "Produto Sem Nome",
      savedAt: new Date().toLocaleDateString("pt-BR") + " " + new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
      filaments: [
        {
          spoolPrice,
          spoolWeightGrams,
          pieceWeightGrams,
        },
      ],
      packaging: {
        boxPrice,
        bubbleWrapPrice,
        tapePrice,
      },
      energy: {
        timeHours,
        powerWatts,
        kwhCost,
      },
      salesConfig: {
        platform,
        shippingFixed,
        marketplaceCommission: commissionPercent,
        taxPercent,
        targetMarginPercent,
        manualMode,
      },
      results: {
        productCost: calculations.productCost,
        suggestedPrice: calculations.suggestedPrice,
        marketplaceFees: calculations.marketplaceFees,
        taxes: calculations.taxes,
        totalCharges: calculations.totalCharges,
        netProfit: calculations.netProfit,
        breakEvenPrice: calculations.breakEvenPrice,
      },
    };

    onSaveCalculation(newCalc);
    setSaveSuccessMsg(true);
    setTimeout(() => setSaveSuccessMsg(false), 3000);
  };

  const addExtraFilament = () => {
    setExtraMaterials((prev) => [
      ...prev,
      {
        id: "mat-" + Date.now(),
        name: `Material ${prev.length + 2}`,
        spoolPrice: 130,
        spoolWeight: 1000,
        pieceWeight: 20,
      },
    ]);
  };

  const removeExtraFilament = (id: string) => {
    setExtraMaterials((prev) => prev.filter((m) => m.id !== id));
  };

  return (
    <div className="mx-auto max-w-xl px-4 py-6 text-slate-100 flex flex-col gap-6">
      {/* Title & Subtitle (Screenshot 16) */}
      <div>
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600/20 text-emerald-400">
            <Calculator className="h-5 w-5" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white leading-tight">
            Calculadora 3D Inteligente
          </h1>
        </div>
        <p className="mt-1 text-xs text-slate-400">
          Precificação avançada baseada em matemática reversa de lucros e markups.
        </p>
      </div>

      {/* Top Controls: Nome Produto, Carregar Salvo, Botão Salvar (Screenshot 16) */}
      <div className="flex flex-col gap-3">
        {/* + NOME DO PRODUTO PARA SALVAR */}
        <div>
          <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            + NOME DO PRODUTO PARA SALVAR
          </label>
          <div className="mt-1 flex items-center rounded-xl border border-slate-800 bg-[#121828] px-3 py-2.5">
            <input
              type="text"
              placeholder="Ex: Escultura Gato Abstrato..."
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              className="w-full bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Q CARREGAR CÁLCULO SALVO */}
        <div>
          <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Q CARREGAR CÁLCULO SALVO
          </label>
          <div className="mt-1 relative">
            <select
              value={selectedSavedId}
              onChange={(e) => handleLoadSaved(e.target.value)}
              className="w-full appearance-none rounded-xl border border-slate-800 bg-[#121828] px-3 py-2.5 pr-10 text-xs text-white focus:border-blue-500 focus:outline-none"
            >
              <option value="">Selecione para carregar</option>
              {savedCalculations.map((calc) => (
                <option key={calc.id} value={calc.id}>
                  {calc.productName} (R$ {calc.results.suggestedPrice.toFixed(2)})
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
          </div>
        </div>

        {/* Salvar Novo Button */}
        <button
          id="btn-save-calculation"
          onClick={handleSave}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 text-sm font-bold text-white shadow-md shadow-emerald-600/20 hover:bg-emerald-500 active:scale-98 transition"
        >
          <Save className="h-4 w-4" />
          <span>Salvar Novo</span>
        </button>

        {saveSuccessMsg && (
          <div className="flex items-center gap-2 rounded-xl border border-emerald-500/40 bg-emerald-950/40 p-2.5 text-xs font-semibold text-emerald-300 animate-fade-in">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
            <span>Cálculo salvo com sucesso no seu perfil!</span>
          </div>
        )}
      </div>

      {/* SECTION 1: CUSTOS DE PRODUÇÃO (Screenshots 16 & 17) */}
      <div className="rounded-2xl border border-slate-800/80 bg-[#121828] p-5 shadow-sm">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800/80">
          <div className="flex items-center gap-2">
            <Box className="h-4 w-4 text-cyan-400" />
            <h2 className="text-xs font-extrabold uppercase tracking-wider text-cyan-400">
              CUSTOS DE PRODUÇÃO
            </h2>
          </div>
          <button
            onClick={addExtraFilament}
            className="flex items-center gap-1 rounded-lg border border-cyan-500/30 bg-cyan-950/30 px-2.5 py-1 text-[11px] font-bold text-cyan-300 hover:bg-cyan-950/50 transition"
          >
            <Plus className="h-3 w-3" />
            <span>ADICIONAR FILAMENTO</span>
          </button>
        </div>

        {/* Material 1 */}
        <div className="mt-4 flex flex-col gap-4">
          <span className="rounded bg-slate-800/80 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-300 w-fit">
            MATERIAL 1
          </span>

          {/* PREÇO DO ROLO */}
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              PREÇO DO ROLO
            </label>
            <div className="mt-1 flex items-center justify-between rounded-xl border border-slate-800 bg-[#0d1320] p-2">
              <div className="flex items-baseline pl-2">
                <span className="text-xs text-slate-400 mr-1">R$</span>
                <input
                  type="number"
                  step={1}
                  value={spoolPrice}
                  onChange={(e) => setSpoolPrice(Number(e.target.value))}
                  className="w-24 bg-transparent text-base font-black text-white focus:outline-none"
                />
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => step(setSpoolPrice, -5, 0)}
                  aria-label="Diminuir preço do rolo"
                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 active:scale-95 transition"
                >
                  <Minus className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => step(setSpoolPrice, 5)}
                  aria-label="Aumentar preço do rolo"
                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 active:scale-95 transition"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
            <p className="mt-1 text-[10px] text-slate-400">MÍNIMO: R$0,00 - MÁXIMO: R$999.999,00</p>
          </div>

          {/* PESO DO ROLO */}
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              PESO DO ROLO
            </label>
            <div className="mt-1 flex items-center justify-between rounded-xl border border-slate-800 bg-[#0d1320] p-2">
              <div className="flex items-baseline pl-2">
                <input
                  type="number"
                  step={50}
                  value={spoolWeightGrams}
                  onChange={(e) => setSpoolWeightGrams(Number(e.target.value))}
                  className="w-24 bg-transparent text-base font-black text-white focus:outline-none"
                />
                <span className="text-xs text-slate-400 ml-1">g</span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => step(setSpoolWeightGrams, -100, 100)}
                  aria-label="Diminuir peso do rolo"
                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 active:scale-95 transition"
                >
                  <Minus className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => step(setSpoolWeightGrams, 100)}
                  aria-label="Aumentar peso do rolo"
                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 active:scale-95 transition"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
            <p className="mt-1 text-[10px] text-slate-400">MÍNIMO: R$0,00 - MÁXIMO: R$999.999,00</p>
          </div>

          {/* PESO DA PEÇA */}
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              PESO DA PEÇA
            </label>
            <div className="mt-1 flex items-center justify-between rounded-xl border border-slate-800 bg-[#0d1320] p-2">
              <div className="flex items-baseline pl-2">
                <input
                  type="number"
                  step={5}
                  value={pieceWeightGrams}
                  onChange={(e) => setPieceWeightGrams(Number(e.target.value))}
                  className="w-24 bg-transparent text-base font-black text-white focus:outline-none"
                />
                <span className="text-xs text-slate-400 ml-1">g</span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => step(setPieceWeightGrams, -5, 1)}
                  aria-label="Diminuir peso da peça"
                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 active:scale-95 transition"
                >
                  <Minus className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => step(setPieceWeightGrams, 5)}
                  aria-label="Aumentar peso da peça"
                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 active:scale-95 transition"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
            <p className="mt-1 text-[10px] text-slate-400">MÍNIMO: R$0,00 - MÁXIMO: R$999.999,00</p>
          </div>

          {/* Render extra materials if any */}
          {extraMaterials.map((mat) => (
            <div key={mat.id} className="rounded-xl border border-slate-800 bg-[#0c1220] p-3 mt-2">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-cyan-300">{mat.name}</span>
                <button
                  onClick={() => removeExtraFilament(mat.id)}
                  aria-label="Remover filamento extra"
                  className="text-red-400 hover:text-red-300 text-xs"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400">Preço Rolo (R$)</span>
                  <input
                    type="number"
                    value={mat.spoolPrice}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setExtraMaterials((prev) =>
                        prev.map((m) => (m.id === mat.id ? { ...m, spoolPrice: val } : m))
                      );
                    }}
                    className="w-full rounded bg-slate-800 p-1 font-bold text-white"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400">Peso Peça (g)</span>
                  <input
                    type="number"
                    value={mat.pieceWeight}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setExtraMaterials((prev) =>
                        prev.map((m) => (m.id === mat.id ? { ...m, pieceWeight: val } : m))
                      );
                    }}
                    className="w-full rounded bg-slate-800 p-1 font-bold text-white"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 2: EMBALAGEM E LOGÍSTICA (Screenshot 18) */}
      <div className="rounded-2xl border border-slate-800/80 bg-[#121828] p-5 shadow-sm">
        <div className="flex items-center gap-2 pb-4 border-b border-slate-800/80">
          <Box className="h-4 w-4 text-cyan-400" />
          <h2 className="text-xs font-extrabold uppercase tracking-wider text-cyan-400">
            EMBALAGEM E LOGÍSTICA
          </h2>
        </div>

        <div className="mt-4 flex flex-col gap-4">
          {/* VALOR DA CAIXA */}
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              VALOR DA CAIXA
            </label>
            <div className="mt-1 flex items-center justify-between rounded-xl border border-slate-800 bg-[#0d1320] p-2">
              <div className="flex items-baseline pl-2">
                <span className="text-xs text-slate-400 mr-1">R$</span>
                <input
                  type="number"
                  step={0.5}
                  value={boxPrice}
                  onChange={(e) => setBoxPrice(Number(e.target.value))}
                  className="w-24 bg-transparent text-base font-black text-white focus:outline-none"
                />
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => step(setBoxPrice, -0.5)}
                  aria-label="Diminuir valor da caixa"
                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 active:scale-95 transition"
                >
                  <Minus className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => step(setBoxPrice, 0.5)}
                  aria-label="Aumentar valor da caixa"
                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 active:scale-95 transition"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
            <p className="mt-1 text-[10px] text-slate-400">MÍNIMO: R$0,00 - MÁXIMO: R$999.999,00</p>
          </div>

          {/* PROTEÇÃO (BOLHA) */}
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              PROTEÇÃO (BOLHA)
            </label>
            <div className="mt-1 flex items-center justify-between rounded-xl border border-slate-800 bg-[#0d1320] p-2">
              <div className="flex items-baseline pl-2">
                <span className="text-xs text-slate-400 mr-1">R$</span>
                <input
                  type="number"
                  step={0.2}
                  value={bubbleWrapPrice}
                  onChange={(e) => setBubbleWrapPrice(Number(e.target.value))}
                  className="w-24 bg-transparent text-base font-black text-white focus:outline-none"
                />
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => step(setBubbleWrapPrice, -0.2)}
                  aria-label="Diminuir proteção bolha"
                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 active:scale-95 transition"
                >
                  <Minus className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => step(setBubbleWrapPrice, 0.2)}
                  aria-label="Aumentar proteção bolha"
                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 active:scale-95 transition"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
            <p className="mt-1 text-[10px] text-slate-400">MÍNIMO: R$0,00 - MÁXIMO: R$999.999,00</p>
          </div>

          {/* CUSTO DA FITA DUREX */}
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              CUSTO DA FITA DUREX
            </label>
            <div className="mt-1 flex items-center justify-between rounded-xl border border-slate-800 bg-[#0d1320] p-2">
              <div className="flex items-baseline pl-2">
                <span className="text-xs text-slate-400 mr-1">R$</span>
                <input
                  type="number"
                  step={0.2}
                  value={tapePrice}
                  onChange={(e) => setTapePrice(Number(e.target.value))}
                  className="w-24 bg-transparent text-base font-black text-white focus:outline-none"
                />
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => step(setTapePrice, -0.2)}
                  aria-label="Diminuir custo fita"
                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 active:scale-95 transition"
                >
                  <Minus className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => step(setTapePrice, 0.2)}
                  aria-label="Aumentar custo fita"
                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 active:scale-95 transition"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
            <p className="mt-1 text-[10px] text-slate-400">MÍNIMO: R$0,00 - MÁXIMO: R$999.999,00</p>
          </div>
        </div>
      </div>

      {/* SECTION 3: ENERGIA E TEMPO (Screenshot 19) */}
      <div className="rounded-2xl border border-slate-800/80 bg-[#121828] p-5 shadow-sm">
        <div className="flex items-center gap-2 pb-4 border-b border-slate-800/80">
          <Zap className="h-4 w-4 text-cyan-400" />
          <h2 className="text-xs font-extrabold uppercase tracking-wider text-cyan-400">
            ENERGIA E TEMPO
          </h2>
        </div>

        <div className="mt-4 flex flex-col gap-4">
          {/* TEMPO (HORAS) */}
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              TEMPO (HORAS)
            </label>
            <div className="mt-1 flex items-center justify-between rounded-xl border border-slate-800 bg-[#0d1320] p-2">
              <div className="flex items-baseline pl-2">
                <input
                  type="number"
                  step={0.5}
                  value={timeHours}
                  onChange={(e) => setTimeHours(Number(e.target.value))}
                  className="w-24 bg-transparent text-base font-black text-white focus:outline-none"
                />
                <span className="text-xs text-slate-400 ml-1">h</span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => step(setTimeHours, -0.5, 0.2)}
                  aria-label="Diminuir tempo em horas"
                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 active:scale-95 transition"
                >
                  <Minus className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => step(setTimeHours, 0.5)}
                  aria-label="Aumentar tempo em horas"
                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 active:scale-95 transition"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
            <p className="mt-1 text-[10px] text-slate-400">MÍNIMO: R$0,00 - MÁXIMO: R$999.999,00</p>
          </div>

          {/* CONSUMO (WATTS) */}
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              CONSUMO (WATTS)
            </label>
            <div className="mt-1 flex items-center justify-between rounded-xl border border-slate-800 bg-[#0d1320] p-2">
              <div className="flex items-baseline pl-2">
                <input
                  type="number"
                  step={20}
                  value={powerWatts}
                  onChange={(e) => setPowerWatts(Number(e.target.value))}
                  className="w-24 bg-transparent text-base font-black text-white focus:outline-none"
                />
                <span className="text-xs text-slate-400 ml-1">W</span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => step(setPowerWatts, -20, 20)}
                  aria-label="Diminuir consumo em watts"
                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 active:scale-95 transition"
                >
                  <Minus className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => step(setPowerWatts, 20)}
                  aria-label="Aumentar consumo em watts"
                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 active:scale-95 transition"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
            <p className="mt-1 text-[10px] text-slate-400">MÍNIMO: R$0,00 - MÁXIMO: R$999.999,00</p>
          </div>

          {/* CUSTO DO KW/H */}
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              CUSTO DO KW/H
            </label>
            <div className="mt-1 flex items-center justify-between rounded-xl border border-slate-800 bg-[#0d1320] p-2">
              <div className="flex items-baseline pl-2">
                <span className="text-xs text-slate-400 mr-1">R$</span>
                <input
                  type="number"
                  step={0.05}
                  value={kwhCost}
                  onChange={(e) => setKwhCost(Number(e.target.value))}
                  className="w-24 bg-transparent text-base font-black text-white focus:outline-none"
                />
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => step(setKwhCost, -0.05, 0.1)}
                  aria-label="Diminuir custo kwh"
                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 active:scale-95 transition"
                >
                  <Minus className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => step(setKwhCost, 0.05)}
                  aria-label="Aumentar custo kwh"
                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 active:scale-95 transition"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
            <p className="mt-1 text-[10px] text-slate-400">MÍNIMO: R$0,00 - MÁXIMO: R$999.999,00</p>
          </div>
        </div>
      </div>

      {/* SECTION 4: CONFIGURAÇÃO DE VENDA (Screenshots 20 & 21) */}
      <div className="rounded-2xl border border-slate-800/80 bg-[#121828] p-5 shadow-sm">
        <div className="flex items-center gap-2 pb-4 border-b border-slate-800/80">
          <CreditCard className="h-4 w-4 text-cyan-400" />
          <h2 className="text-xs font-extrabold uppercase tracking-wider text-cyan-400">
            CONFIGURAÇÃO DE VENDA
          </h2>
        </div>

        <div className="mt-4 flex flex-col gap-4">
          {/* PLATAFORMA */}
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              PLATAFORMA
            </label>
            <div className="mt-1 relative">
              <select
                value={platform}
                onChange={(e) => handlePlatformChange(e.target.value as any)}
                className="w-full appearance-none rounded-xl border border-emerald-500/40 bg-[#0d1320] px-3.5 py-3 pr-10 text-xs font-semibold text-white focus:border-emerald-500 focus:outline-none"
              >
                <option value="shopee">Shopee (CNPJ Cálculo 2026)</option>
                <option value="mercadolivre">Mercado Livre (Clássico / Premium 2026)</option>
                <option value="direto">Venda Direta / Balcão / WhatsApp (Sem Taxas)</option>
                <option value="personalizado">Personalizado</option>
              </select>
              <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-400 pointer-events-none" />
            </div>
          </div>

          {/* CUSTO TOTAL DO PRODUTO */}
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              CUSTO TOTAL DO PRODUTO
            </label>
            <div className="mt-1 flex items-center justify-between rounded-xl border border-slate-800 bg-[#0d1320] p-2">
              <div className="flex items-baseline pl-2">
                <span className="text-xs text-slate-400 mr-1">R$</span>
                <input
                  type="number"
                  disabled={!manualMode}
                  step={0.5}
                  value={manualMode ? manualProductCost : calculations.productCost}
                  onChange={(e) => setManualProductCost(Number(e.target.value))}
                  className="w-28 bg-transparent text-base font-black text-white focus:outline-none disabled:opacity-90"
                />
              </div>
              <div className="flex items-center gap-1">
                <button
                  disabled={!manualMode}
                  onClick={() => step(setManualProductCost, -0.5)}
                  aria-label="Diminuir custo manual do produto"
                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-800 text-slate-300 disabled:opacity-40"
                >
                  <Minus className="h-3.5 w-3.5" />
                </button>
                <button
                  disabled={!manualMode}
                  onClick={() => step(setManualProductCost, 0.5)}
                  aria-label="Aumentar custo manual do produto"
                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-800 text-slate-300 disabled:opacity-40"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* MODO MANUAL (DESATIVA CÁLCULO AUTOMÁTICO) */}
            <label className="mt-2 flex items-center gap-2 text-xs text-slate-400 cursor-pointer">
              <input
                type="checkbox"
                checked={manualMode}
                onChange={(e) => setManualMode(e.target.checked)}
                className="h-3.5 w-3.5 rounded border-slate-700 bg-slate-800 text-blue-600 focus:ring-0"
              />
              <span className="text-[11px] uppercase font-bold tracking-wider">
                MODO MANUAL (DESATIVA CÁLCULO AUTOMÁTICO)
              </span>
            </label>
          </div>

          {/* CUSTO ENVIO FIXO */}
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              CUSTO ENVIO FIXO
            </label>
            <div className="mt-1 flex items-center justify-between rounded-xl border border-slate-800 bg-[#0d1320] p-2">
              <div className="flex items-baseline pl-2">
                <span className="text-xs text-slate-400 mr-1">R$</span>
                <input
                  type="number"
                  step={0.5}
                  value={shippingFixed}
                  onChange={(e) => setShippingFixed(Number(e.target.value))}
                  className="w-24 bg-transparent text-base font-black text-white focus:outline-none"
                />
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => step(setShippingFixed, -0.5)}
                  aria-label="Diminuir custo de envio"
                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700"
                >
                  <Minus className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => step(setShippingFixed, 0.5)}
                  aria-label="Aumentar custo de envio"
                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
            <p className="mt-1 text-[10px] text-slate-400 uppercase tracking-wider">
              DINÂMICO PELO MARKETPLACE
            </p>
          </div>

          {/* COMISSÃO (%) (TAXA DA PLATAFORMA) */}
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              COMISSÃO (%) (TAXA DA PLATAFORMA)
            </label>
            <div className="mt-1 flex items-center justify-between rounded-xl border border-slate-800 bg-[#0d1320] p-2">
              <div className="flex items-baseline pl-2">
                <input
                  type="number"
                  step={1}
                  value={commissionPercent}
                  onChange={(e) => setCommissionPercent(Number(e.target.value))}
                  className="w-24 bg-transparent text-base font-black text-white focus:outline-none"
                />
                <span className="text-xs text-slate-400 ml-1">%</span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => step(setCommissionPercent, -1, 0)}
                  aria-label="Diminuir comissão"
                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700"
                >
                  <Minus className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => step(setCommissionPercent, 1)}
                  aria-label="Aumentar comissão"
                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
            <p className="mt-1 text-[10px] text-slate-400 uppercase tracking-wider">
              DINÂMICO PELA SHOPEE
            </p>
          </div>

          {/* IMPOSTO EMPRESA (%) */}
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              IMPOSTO EMPRESA (%)
            </label>
            <div className="mt-1 flex items-center justify-between rounded-xl border border-slate-800 bg-[#0d1320] p-2">
              <div className="flex items-baseline pl-2">
                <input
                  type="number"
                  step={0.5}
                  value={taxPercent}
                  onChange={(e) => setTaxPercent(Number(e.target.value))}
                  className="w-24 bg-transparent text-base font-black text-white focus:outline-none"
                />
                <span className="text-xs text-slate-400 ml-1">%</span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => step(setTaxPercent, -0.5, 0)}
                  aria-label="Diminuir imposto"
                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700"
                >
                  <Minus className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => step(setTaxPercent, 0.5)}
                  aria-label="Aumentar imposto"
                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
            <p className="mt-1 text-[10px] text-slate-400">MÍNIMO: R$0,00 - MÁXIMO: R$999.999,00</p>
          </div>

          {/* MARGEM DE LUCRO ALVO (Screenshot 21) */}
          <div className="rounded-xl border border-slate-800 bg-[#0d1320] p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Percent className="h-4 w-4 text-emerald-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  MARGEM DE LUCRO ALVO
                </span>
              </div>
              <span className="rounded-lg bg-emerald-950/60 border border-emerald-500/40 px-3 py-1 text-sm font-black text-emerald-400">
                {targetMarginPercent}%
              </span>
            </div>

            <div className="mt-4">
              <input
                type="range"
                min={0}
                max={73}
                value={targetMarginPercent}
                onChange={(e) => setTargetMarginPercent(Number(e.target.value))}
                className="w-full accent-emerald-500 h-2 bg-slate-800 rounded-lg cursor-pointer"
              />
              <div className="mt-2 flex items-center justify-between text-[11px] font-bold text-slate-400">
                <span>MÍN: 0%</span>
                <span className="text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-500/20">
                  ALVO: {targetMarginPercent}%
                </span>
                <span>MÁX: 73%</span>
              </div>
            </div>
          </div>

          {/* Info Banner 2026 (Screenshot 21) */}
          <div className="rounded-xl border border-blue-500/20 bg-blue-950/20 p-3.5 text-xs text-slate-300 flex items-start gap-2.5">
            <HelpCircle className="h-4 w-4 text-blue-400 shrink-0 mt-0.5" />
            <p className="text-[11px] leading-relaxed text-slate-300">
              <strong className="text-white">LÓGICA MARKETPLACE 2026:</strong> FRETE E COMISSÃO (SHOPEE) CALCULADOS AUTOMATICAMENTE COM BASE NO PESO E FAIXA DE PREÇO CONFORME REGRA DAS PLATAFORMAS.
            </p>
          </div>
        </div>
      </div>

      {/* SECTION 5: RESULT CARD (Screenshot 22) */}
      <div className="rounded-2xl border border-emerald-500/40 bg-gradient-to-b from-[#059669] to-[#047857] p-6 shadow-2xl glow-green text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-black uppercase tracking-wider text-emerald-100">
              PREÇO FINAL SUGERIDO
            </span>
            <Zap className="h-4 w-4 text-amber-300 fill-amber-300" />
          </div>
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-400/20 text-white">
            <ShieldCheck className="h-6 w-6" />
          </div>
        </div>

        <p className="mt-2 text-4xl font-black tracking-tight drop-shadow-sm">
          R$ {calculations.suggestedPrice.toFixed(2).replace(".", ",")}
        </p>

        {/* 3 Metrics inside the green card */}
        <div className="mt-6 grid grid-cols-2 gap-4 border-t border-emerald-400/30 pt-4">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-100/80">
              CUSTO DO PRODUTO
            </span>
            <p className="text-lg font-black text-white">
              R$ {calculations.productCost.toFixed(2).replace(".", ",")}
            </p>
          </div>
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-100/80">
              TOTAL DE ENCARGOS
            </span>
            <p className="text-lg font-black text-emerald-100">
              -R$ {calculations.totalCharges.toFixed(2).replace(".", ",")}
            </p>
          </div>
        </div>

        <div className="mt-4 border-t border-emerald-400/30 pt-3">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-100/80">
            LUCRO LÍQUIDO
          </span>
          <p className="text-2xl font-black text-white">
            R$ {calculations.netProfit.toFixed(2).replace(".", ",")}
          </p>
        </div>
      </div>

      {/* DETALHAMENTO OPERACIONAL (Screenshot 22) */}
      <div className="rounded-2xl border border-slate-800 bg-[#121828] p-5 shadow-sm">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-800/80">
          <HelpCircle className="h-4 w-4 text-slate-400" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
            DETALHAMENTO OPERACIONAL
          </h3>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase">TAXAS MARKET:</span>
            <p className="mt-1 font-bold text-red-400">
              -R$ {calculations.marketplaceFees.toFixed(2).replace(".", ",")}
            </p>
          </div>

          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase">IMPOSTOS FISCAIS:</span>
            <p className="mt-1 font-bold text-red-400">
              -R$ {calculations.taxes.toFixed(2).replace(".", ",")}
            </p>
          </div>

          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase">PONTO EQ. (LUCRO ZERO):</span>
            <p className="mt-1 font-bold text-emerald-400">
              R$ {calculations.breakEvenPrice.toFixed(2).replace(".", ",")}
            </p>
          </div>
        </div>

        <div className="mt-5 flex items-center justify-center rounded-xl bg-[#0d1320] py-2.5 px-4 text-center">
          <span className="text-xs font-bold tracking-wider text-emerald-400">
            STATUS: FAIXA IDEAL IDENTIFICADA
          </span>
        </div>

        {/* Quick action buttons to jump directly to other workflows */}
        <div className="mt-4 grid grid-cols-2 gap-2 border-t border-slate-800 pt-3">
          {onSendToProductionQueue && (
            <button
              onClick={() => onSendToProductionQueue(productName, pieceWeightGrams, timeHours)}
              className="flex items-center justify-center gap-1.5 rounded-xl border border-blue-500/30 bg-blue-950/30 py-2.5 px-3 text-xs font-bold text-blue-300 hover:bg-blue-950/50 transition"
            >
              <Send className="h-3.5 w-3.5" />
              <span>Enviar para Fila</span>
            </button>
          )}

          {onSendToCreativeStudio && (
            <button
              onClick={() => onSendToCreativeStudio(productName)}
              className="flex items-center justify-center gap-1.5 rounded-xl border border-purple-500/30 bg-purple-950/30 py-2.5 px-3 text-xs font-bold text-purple-300 hover:bg-purple-950/50 transition"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Criar Anúncio com IA</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
