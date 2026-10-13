import React, { useState, useRef } from "react";
import {
  Box,
  Sliders,
  Download,
  Send,
  Layers,
  Sparkles,
  RefreshCw,
  Eye,
  Paperclip,
  Check,
  X,
  Upload,
} from "lucide-react";

interface Generator3DViewProps {
  onSendToQueue: (title: string, weight: number, time: number) => void;
}

export const Generator3DView: React.FC<Generator3DViewProps> = ({ onSendToQueue }) => {
  const [modelType, setModelType] = useState<"vaso" | "placa" | "suporte" | "chaveiro" | "custom">("vaso");
  const [customText, setCustomText] = useState("MAKERFLOW 3D");
  const [scaleFactor, setScaleFactor] = useState(100); // 100%
  const [wallThickness, setWallThickness] = useState(2);
  const [rotationAngle, setRotationAngle] = useState(25);
  const [isGenerating, setIsGenerating] = useState(false);
  const [referenceImage, setReferenceImage] = useState<string | null>(null);
  const [referenceImageName, setReferenceImageName] = useState<string | null>(null);
  const [generationSuccess, setGenerationSuccess] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Estimates based on parameters
  const estimatedWeight = Math.round(
    (modelType === "vaso" ? 75 : modelType === "placa" ? 45 : modelType === "suporte" ? 60 : modelType === "chaveiro" ? 20 : 90) *
      (scaleFactor / 100) ** 2.2
  );
  const estimatedTime = (
    (modelType === "vaso" ? 4.5 : modelType === "placa" ? 2.5 : modelType === "suporte" ? 3.5 : modelType === "chaveiro" ? 1.2 : 5.0) *
    (scaleFactor / 100) ** 1.8
  ).toFixed(1);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setReferenceImageName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      setReferenceImage(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const removeReferenceImage = () => {
    setReferenceImage(null);
    setReferenceImageName(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleGenerate3D = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      setGenerationSuccess(true);
      setTimeout(() => setGenerationSuccess(false), 3500);
    }, 1500);
  };

  const handleDownloadSTL = () => {
    const filename = `${modelType}_${customText.toLowerCase().replace(/\s+/g, "_")}_${scaleFactor}pct.stl`;
    const dummyContent = `solid ${filename}\n  facet normal 0 0 1\n    outer loop\n      vertex 0 0 0\n      vertex 1 0 0\n      vertex 0 1 0\n    endloop\n  endfacet\nendsolid ${filename}`;
    const blob = new Blob([dummyContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSend = () => {
    const title = `${
      modelType === "vaso"
        ? "Vaso Decorativo Paramétrico"
        : modelType === "placa"
        ? `Placa 3D "${customText}"`
        : modelType === "suporte"
        ? "Suporte Articulado de Mesa"
        : modelType === "chaveiro"
        ? `Chaveiro Personalizado "${customText}"`
        : `Modelo 3D Personalizado por IA`
    } (${scaleFactor}%)`;
    onSendToQueue(title, estimatedWeight, Number(estimatedTime));
  };

  return (
    <div className="mx-auto max-w-xl px-4 py-6 text-slate-100 flex flex-col gap-6">
      {/* Title */}
      <div>
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
            <Box className="h-5 w-5" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white leading-tight">
            Gerador Paramétrico & IA 3D
          </h1>
        </div>
        <p className="mt-1 text-xs text-slate-400">
          Crie modelos tridimensionais personalizados em segundos com base em parâmetros ou foto de referência.
        </p>
      </div>

      {generationSuccess && (
        <div className="flex items-center gap-2 rounded-xl bg-emerald-950/80 border border-emerald-500/40 p-3 text-xs text-emerald-300 font-bold">
          <Check className="h-4 w-4 text-emerald-400" />
          <span>Modelo 3D gerado com sucesso! Pronto para download e impressão.</span>
        </div>
      )}

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

            {modelType === "custom" && (
              <div className="w-32 h-32 border-2 border-purple-400/80 bg-gradient-to-br from-purple-700/60 to-pink-700/50 rounded-2xl shadow-2xl flex flex-col items-center justify-center text-white backdrop-blur-xs">
                <Sparkles className="h-6 w-6 text-pink-300 mb-1" />
                <span className="text-[10px] font-bold text-purple-200">Modelo IA / Foto</span>
                <span className="text-[9px] text-slate-300 mt-1">{estimatedWeight}g • {estimatedTime}h</span>
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
          PARÂMETROS DE GERAÇÃO & REFERÊNCIA
        </h3>

        {/* Model Type */}
        <div className="grid grid-cols-5 gap-1.5">
          {(
            [
              { id: "vaso", label: "Vaso" },
              { id: "placa", label: "Placa" },
              { id: "suporte", label: "Suporte" },
              { id: "chaveiro", label: "Chaveiro" },
              { id: "custom", label: "IA/Foto" },
            ] as const
          ).map((t) => (
            <button
              key={t.id}
              onClick={() => setModelType(t.id)}
              className={`rounded-xl py-2 font-bold transition text-[11px] ${
                modelType === t.id
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "bg-[#0d1320] border border-slate-800 text-slate-400 hover:text-white"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Reference Image Attachment */}
        <div>
          <label className="text-[11px] font-semibold text-slate-400 flex items-center justify-between">
            <span className="flex items-center gap-1">
              <Paperclip className="h-3.5 w-3.5 text-indigo-400" /> Anexar Imagem de Referência (Esboço / Foto)
            </span>
            <span className="text-[10px] text-indigo-300">Opcional</span>
          </label>

          {!referenceImage ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="mt-1.5 flex items-center justify-center gap-2 rounded-xl border border-dashed border-slate-700 bg-[#0d1320] p-3 text-center cursor-pointer hover:border-indigo-500 transition group"
            >
              <Upload className="h-4 w-4 text-indigo-400 group-hover:scale-110 transition" />
              <span className="text-xs font-medium text-slate-300">Enviar imagem para inspirar geração 3D</span>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>
          ) : (
            <div className="mt-1.5 flex items-center justify-between rounded-xl border border-indigo-500/30 bg-[#0c1220] p-2.5">
              <div className="flex items-center gap-2.5">
                <img
                  src={referenceImage}
                  alt="Referência"
                  className="h-9 w-9 rounded-lg object-cover border border-indigo-500/40"
                />
                <span className="text-xs font-semibold text-white truncate max-w-[200px]">{referenceImageName}</span>
              </div>
              <button
                onClick={removeReferenceImage}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>

        {/* Custom text for signs/keychains */}
        {(modelType === "placa" || modelType === "chaveiro" || modelType === "custom") && (
          <div>
            <label className="text-[11px] font-semibold text-slate-400">
              Texto ou Prompt do Modelo
            </label>
            <input
              type="text"
              value={customText}
              maxLength={30}
              onChange={(e) => setCustomText(e.target.value)}
              placeholder="Ex: Nome da marca ou descrição..."
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
            <p className="text-base font-black text-emerald-400">{estimatedTime}h</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
          <button
            type="button"
            disabled={isGenerating}
            onClick={handleGenerate3D}
            className="flex items-center justify-center gap-1.5 rounded-xl bg-indigo-600 py-3 text-xs font-bold text-white shadow-md shadow-indigo-600/30 hover:bg-indigo-500 active:scale-98 transition disabled:opacity-60 cursor-pointer"
          >
            <Sparkles className="h-4 w-4" />
            <span>{isGenerating ? "Gerando..." : "Gerar Modelo"}</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadSTL}
            className="flex items-center justify-center gap-1.5 rounded-xl bg-slate-800 border border-slate-700 py-3 text-xs font-bold text-slate-200 hover:bg-slate-700 active:scale-98 transition cursor-pointer"
          >
            <Download className="h-4 w-4" />
            <span>Baixar .STL</span>
          </button>

          <button
            type="button"
            onClick={handleSend}
            className="flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 py-3 text-xs font-bold text-white shadow-md shadow-emerald-600/30 hover:bg-emerald-500 active:scale-98 transition cursor-pointer"
          >
            <Send className="h-4 w-4" />
            <span>Enviar à Fila</span>
          </button>
        </div>
      </div>
    </div>
  );
};
