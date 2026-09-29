import React, { useState } from "react";
import {
  Box,
  Sliders,
  Download,
  Send,
  Layers,
  Sparkles,
  RefreshCw,
  Eye,
} from "lucide-react";

interface Generator3DViewProps {
  onSendToQueue: (title: string, weight: number, time: number) => void;
}

export const Generator3DView: React.FC<Generator3DViewProps> = ({ onSendToQueue }) => {
  const [modelType, setModelType] = useState<"vaso" | "placa" | "suporte" | "chaveiro">("vaso");
  const [customText, setCustomText] = useState("MAKERFLOW 3D");
  const [scaleFactor, setScaleFactor] = useState(100); // 100%
  const [wallThickness, setWallThickness] = useState(2);
  const [rotationAngle, setRotationAngle] = useState(25);
  const [isGenerating, setIsGenerating] = useState(false);

  // Estimates based on parameters
  const estimatedWeight = Math.round(
    (modelType === "vaso" ? 75 : modelType === "placa" ? 45 : modelType === "suporte" ? 60 : 20) *
      (scaleFactor / 100) ** 2.2
  );
  const estimatedTime = (
    (modelType === "vaso" ? 4.5 : modelType === "placa" ? 2.5 : modelType === "suporte" ? 3.5 : 1.2) *
    (scaleFactor / 100) ** 1.8
  ).toFixed(1);

  const handleSend = () => {
    const title = `${
      modelType === "vaso"
        ? "Vaso Decorativo Paramétrico"
        : modelType === "placa"
        ? `Placa 3D "${customText}"`
        : modelType === "suporte"
        ? "Suporte Articulado de Mesa"
        : `Chaveiro Personalizado "${customText}"`
    }`;
    onSendToQueue(title, estimatedWeight, Number(estimatedTime));
  };

  return (
    <div className="mx-auto max-w-xl px-4 py-6 text-slate-100 flex flex-col gap-6">
      {/* Title */}
      <div>
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600/20 text-indigo-400">
            <Box className="h-5 w-5" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white leading-tight">
            Gerador Paramétrico 3D
          </h1>
        </div>
        <p className="mt-1 text-xs text-slate-400">
          Crie modelos tridimensionais personalizados em segundos para vender nos marketplaces.
        </p>
      </div>

      {/* 3D Visualizer Canvas Sandbox */}
      <div className="relative overflow-hidden rounded-2xl border border-indigo-500/30 bg-gradient-to-b from-[#0e1428] via-[#090d1a] to-[#060810] p-6 text-center shadow-xl">
        <div className="absolute top-3 left-3 flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-indigo-400">
          <Layers className="h-3.5 w-3.5" />
          <span>Viewport 3D em Tempo Real</span>
        </div>

        {/* CSS 3D Model Representation */}
        <div className="my-10 flex items-center justify-center h-48 perspective-1000">
          <div
            className="relative transition-transform duration-300 transform-style-3d cursor-grab active:cursor-grabbing"
            style={{
              transform: `rotateY(${rotationAngle}deg) rotateX(15deg) scale(${scaleFactor / 100})`,
            }}
          >
            {modelType === "vaso" && (
              <div className="relative w-28 h-36 border-2 border-indigo-400/80 bg-gradient-to-t from-indigo-700/60 to-purple-600/40 rounded-t-xl rounded-b-3xl shadow-2xl flex flex-col items-center justify-center text-white backdrop-blur-xs">
                <div className="w-20 h-4 rounded-full border border-indigo-300 bg-indigo-500/30 absolute top-1" />
                <span className="text-[10px] font-bold uppercase opacity-80 mt-4">Vaso 3D</span>
                <span className="text-[9px] text-indigo-200">{estimatedWeight}g • {estimatedTime}h</span>
              </div>
            )}

            {modelType === "placa" && (
              <div className="w-44 h-24 border-2 border-cyan-400/80 bg-gradient-to-r from-cyan-900/60 to-blue-900/60 rounded-xl shadow-2xl flex flex-col items-center justify-center p-3 text-white backdrop-blur-xs">
                <span className="text-xs font-black tracking-wider text-cyan-300 uppercase truncate max-w-[150px]">
                  {customText || "TEXTO 3D"}
                </span>
                <span className="text-[9px] text-slate-300 mt-1">Placa Decorativa Relevo</span>
              </div>
            )}

            {modelType === "suporte" && (
              <div className="w-32 h-32 border-2 border-amber-400/80 bg-gradient-to-br from-amber-700/60 to-orange-700/50 rounded-2xl shadow-2xl flex flex-col items-center justify-center text-white backdrop-blur-xs">
                <div className="w-24 h-4 bg-amber-500/40 rounded-sm mb-2 border border-amber-300" />
                <span className="text-[10px] font-bold text-amber-200">Suporte Celular</span>
                <span className="text-[9px] text-slate-300 mt-1">Grip Antiderrapante</span>
              </div>
            )}

            {modelType === "chaveiro" && (
              <div className="w-36 h-14 border-2 border-emerald-400/80 bg-gradient-to-r from-emerald-800/60 to-teal-800/60 rounded-full shadow-2xl flex items-center justify-between px-4 text-white backdrop-blur-xs">
                <div className="w-4 h-4 rounded-full border-2 border-emerald-300 bg-black/40" />
                <span className="text-xs font-black text-emerald-200 uppercase truncate max-w-[90px]">
                  {customText || "NOME"}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Rotate Slider */}
        <div className="flex items-center justify-between text-xs text-slate-400 max-w-xs mx-auto">
          <span>Girar:</span>
          <input
            type="range"
            min={-180}
            max={180}
            value={rotationAngle}
            onChange={(e) => setRotationAngle(Number(e.target.value))}
            className="w-40 accent-indigo-500"
          />
          <span>{rotationAngle}°</span>
        </div>
      </div>

      {/* Model Parameters Controls */}
      <div className="rounded-2xl border border-slate-800 bg-[#121828] p-5 shadow-sm flex flex-col gap-4 text-xs">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
          PARÂMETROS DE GERAÇÃO
        </h3>

        {/* Model Type */}
        <div className="grid grid-cols-4 gap-2">
          {(
            [
              { id: "vaso", label: "Vaso" },
              { id: "placa", label: "Placa" },
              { id: "suporte", label: "Suporte" },
              { id: "chaveiro", label: "Chaveiro" },
            ] as const
          ).map((t) => (
            <button
              key={t.id}
              onClick={() => setModelType(t.id)}
              className={`rounded-xl py-2 font-bold transition text-xs ${
                modelType === t.id
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "bg-[#0d1320] border border-slate-800 text-slate-400 hover:text-white"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Custom text for signs/keychains */}
        {(modelType === "placa" || modelType === "chaveiro") && (
          <div>
            <label className="text-[11px] font-semibold text-slate-400">
              Texto em Alto Relevo (Nome / Marca)
            </label>
            <input
              type="text"
              value={customText}
              maxLength={24}
              onChange={(e) => setCustomText(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-800 bg-[#0d1320] px-3.5 py-2.5 text-xs text-white focus:border-indigo-500 focus:outline-none"
            />
          </div>
        )}

        {/* Scale Slider */}
        <div>
          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400">
            <span>Escala / Dimensão</span>
            <span className="font-bold text-white">{scaleFactor}%</span>
          </div>
          <input
            type="range"
            min={50}
            max={180}
            value={scaleFactor}
            onChange={(e) => setScaleFactor(Number(e.target.value))}
            className="mt-1.5 w-full accent-indigo-500 h-2 bg-slate-800 rounded-lg"
          />
        </div>

        {/* Estimates Banner */}
        <div className="grid grid-cols-2 gap-3 rounded-xl bg-[#0c1220] p-3 text-xs border border-slate-800">
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Peso Estimado:</span>
            <p className="text-base font-black text-indigo-400">{estimatedWeight}g</p>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Tempo de Impressão:</span>
            <p className="text-base font-black text-white">{estimatedTime}h</p>
          </div>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-2 mt-2">
          <button
            onClick={() => alert("Arquivo STL exportado e pronto para fatiar no Bambu Studio ou Cura!")}
            className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 py-3 text-xs font-bold text-slate-200 hover:bg-slate-700 transition"
          >
            <Download className="h-4 w-4" />
            <span>Baixar STL</span>
          </button>

          <button
            onClick={handleSend}
            className="flex items-center justify-center gap-1.5 rounded-xl bg-indigo-600 py-3 text-xs font-bold text-white hover:bg-indigo-500 transition shadow-md shadow-indigo-600/30"
          >
            <Send className="h-4 w-4" />
            <span>Enviar para Fila</span>
          </button>
        </div>
      </div>
    </div>
  );
};
