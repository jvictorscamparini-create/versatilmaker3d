import React, { useState, useRef } from "react";
import {
  Sparkles,
  Copy,
  Check,
  Wand2,
  Tag,
  FileText,
  Camera,
  Paperclip,
  Image as ImageIcon,
  FileCode,
  X,
  Upload,
  Layers,
  Compass,
} from "lucide-react";
import { CreativeAdResult } from "../types";

interface CreativeStudioViewProps {
  initialProductName?: string;
}

export const CreativeStudioView: React.FC<CreativeStudioViewProps> = ({
  initialProductName = "Escultura Gato Abstrato Geometrico 3D",
}) => {
  const [productName, setProductName] = useState(initialProductName);
  const [category, setCategory] = useState("Decoração e Design de Interiores");
  const [targetPlatform, setTargetPlatform] = useState<"Shopee" | "Mercado Livre" | "Ambos">("Ambos");
  const [colorFinish, setColorFinish] = useState("Preto Fosco Premium / PLA Biodegradável");
  const [tone, setTone] = useState("Elegante e Persuasivo");
  const [selectedAngle, setSelectedAngle] = useState<string>("Todos os Ângulos");
  const [baseImage, setBaseImage] = useState<string | null>(null);
  const [attachedFileName, setAttachedFileName] = useState<string | null>(null);
  const [attachedFileType, setAttachedFileType] = useState<string | null>(null);

  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [generatedAd, setGeneratedAd] = useState<CreativeAdResult>({
    titles: [
      "Escultura Gato Abstrato Decoração Minimalista Moderna 3D",
      "Estatueta Gato Geométrico Sala Escritório Design Luxo",
      "Gato Abstrato Impressão 3D Alta Qualidade Presente Criativo",
    ],
    descriptions: {
      short: "Design exclusivo 3D em PLA Premium com acabamento impecável.",
      full: "Procurando um item exclusivo, moderno e com acabamento impecável? O produto é confeccionado em polímero biodegradável PLA Premium de alta densidade, oferecendo resistência estrutural e detalhes nítidos.\n\n📐 ESPECIFICAÇÕES TÉCNICAS:\n• Material: PLA Premium Eco-friendly\n• Tecnologia: FDM (Modelagem por Fusão e Deposição)\n• Altura de Camada: 0.16mm (acabamento ultra suave)\n\n✨ CUIDADOS:\n• Não expor a temperaturas superiores a 60°C.\n• Limpar com pano levemente umedecido.",
      bulletPoints: [
        "✨ Acabamento refinado sem marcas excessivas de linha",
        "🌱 Material ecológico e durável",
        "📦 Embalagem reforçada anti-impacto",
      ],
      seoTags: ["gato abstrato", "decoracao 3d", "escultura geometrica", "pla premium", "presente criativo"],
    },
    salesConsultant: {
      pricingTip: "Margem recomendada de 40% a 50% para itens de decoração artística 3D.",
      bundleIdeas: ["Kit 2 unidades com 15% de desconto", "Combo com suporte de livro temático"],
      conversionHooks: ["Fabricação artesanal sob encomenda com controle de qualidade individual"],
      marketplaceTips: {
        mercadoLivre: "Ative o Mercado Envios Full para garantir entrega em 24h.",
        shopee: "Cadastre cupons de seguidores e use vídeo real do produto girando.",
      },
    },
    mockupPrompts: [
      "Fotografia comercial de escultura geométrica sobre mesa de carvalho clara, iluminação natural suave, estilo revista de design.",
      "Render realista em estante minimalista de sala de estar com LED embutido e plantas ao fundo.",
      "Close-up macro destacando a textura de alta precisão da impressão 3D em ângulo de 45 graus.",
      "Vista superior cenográfica com acessórios de decoração moderna e paleta de cores neutras.",
    ],
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAttachedFileName(file.name);
    setAttachedFileType(file.type);

    const reader = new FileReader();
    reader.onloadend = () => {
      setBaseImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const removeAttachment = () => {
    setBaseImage(null);
    setAttachedFileName(null);
    setAttachedFileType(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch("/api/creative-studio/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productName,
          niche: category,
          differentials: `${colorFinish} - Tom: ${tone} - Foco no ângulo: ${selectedAngle}`,
          scenario1: "Mesa de escritório moderna ou estante de design",
          scenario2: "Ambiente corporativo ou residencial sofisticado",
          baseImage,
        }),
      });

      const resData = await response.json();
      if (resData.data) {
        setGeneratedAd(resData.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(id);
    setTimeout(() => setCopiedSection(null), 2500);
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 text-slate-100 flex flex-col gap-6">
      <div>
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-600/20 text-purple-400 border border-purple-500/30">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-white leading-tight">
              Estúdio Criativo com IA
            </h1>
            <p className="text-xs text-slate-400">
              Gere anúncios de alta conversão, copys e variação de ângulos a partir de fotos e PDFs do produto.
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-[#121828] p-5 shadow-sm flex flex-col gap-4">
        <div>
          <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Nome do Produto / Peça 3D
          </label>
          <input
            type="text"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            placeholder="Ex: Escultura Gato Abstrato..."
            className="mt-1 w-full rounded-xl border border-slate-800 bg-[#0d1320] px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-purple-500 focus:outline-none"
          />
        </div>

        {/* Attachment Section for Photos / PDFs */}
        <div>
          <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
            <span className="flex items-center gap-1">
              <Paperclip className="h-3.5 w-3.5 text-purple-400" /> Anexar Fotos ou PDF (Blueprint / Especificação)
            </span>
            <span className="text-[10px] text-purple-300 font-normal">Opcional para guiar a IA</span>
          </label>

          {!baseImage ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="mt-1.5 flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-700 bg-[#0d1320] p-4 text-center cursor-pointer hover:border-purple-500 transition group"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-purple-600/10 text-purple-400 group-hover:bg-purple-600/20 transition">
                <Upload className="h-4 w-4" />
              </div>
              <p className="mt-2 text-xs font-semibold text-slate-300">
                Clique para enviar foto, render ou PDF do produto
              </p>
              <p className="mt-0.5 text-[10px] text-slate-500">
                PNG, JPG, WEBP ou PDF até 25MB
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,.pdf"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>
          ) : (
            <div className="mt-1.5 flex items-center justify-between rounded-xl border border-purple-500/30 bg-[#0c1220] p-3">
              <div className="flex items-center gap-3 overflow-hidden">
                {attachedFileType?.includes("pdf") ? (
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-rose-500/20 text-rose-400 border border-rose-500/30">
                    <FileCode className="h-5 w-5" />
                  </div>
                ) : (
                  <img
                    src={baseImage}
                    alt="Preview"
                    className="h-10 w-10 flex-shrink-0 rounded-lg object-cover border border-purple-500/30"
                  />
                )}
                <div className="overflow-hidden">
                  <p className="text-xs font-semibold text-white truncate">{attachedFileName || "Arquivo Anexado"}</p>
                  <p className="text-[10px] text-emerald-400 flex items-center gap-1">
                    <Check className="h-3 w-3" /> Pronto para análise inteligente de ângulos
                  </p>
                </div>
              </div>
              <button
                onClick={removeAttachment}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition"
                title="Remover anexo"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Categoria / Nicho
            </label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-800 bg-[#0d1320] px-3 py-2 text-xs text-white focus:border-purple-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Plataforma Alvo
            </label>
            <select
              value={targetPlatform}
              onChange={(e) => setTargetPlatform(e.target.value as any)}
              className="mt-1 w-full rounded-xl border border-slate-800 bg-[#0d1320] px-3 py-2 text-xs text-white focus:border-purple-500 focus:outline-none"
            >
              <option value="Ambos">Ambos (Shopee + Mercado Livre)</option>
              <option value="Shopee">Shopee</option>
              <option value="Mercado Livre">Mercado Livre</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Cores e Acabamento
            </label>
            <input
              type="text"
              value={colorFinish}
              onChange={(e) => setColorFinish(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-800 bg-[#0d1320] px-3 py-2 text-xs text-white focus:border-purple-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
              <Compass className="h-3.5 w-3.5 text-purple-400" /> Foco de Ângulo / Variação Visual
            </label>
            <select
              value={selectedAngle}
              onChange={(e) => setSelectedAngle(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-800 bg-[#0d1320] px-3 py-2 text-xs text-white focus:border-purple-500 focus:outline-none"
            >
              <option value="Todos os Ângulos">Todos os Ângulos (Mix Completo)</option>
              <option value="Visão Frontal Principal">Visão Frontal Principal (Capa)</option>
              <option value="Vista Lateral 45°">Vista Lateral 45° (Profundidade)</option>
              <option value="Close-up de Textura 3D">Close-up de Textura e Camadas</option>
              <option value="Em Uso / Ambiente Decorado">Em Uso / Ambiente Decorado</option>
              <option value="Vista Superior / Flat Lay">Vista Superior / Flat Lay</option>
            </select>
          </div>
        </div>

        <button
          id="btn-generate-creative"
          disabled={isGenerating}
          onClick={handleGenerate}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-purple-600 py-3 text-sm font-bold text-white shadow-md shadow-purple-600/30 hover:bg-purple-500 active:scale-98 disabled:opacity-60 transition mt-2"
        >
          <Wand2 className="h-4 w-4" />
          <span>{isGenerating ? "Analisando Arquivo e Criando Anúncio..." : "Gerar Anúncio e Variações de Ângulos com IA"}</span>
        </button>
      </div>

      {generatedAd && (
        <div className="flex flex-col gap-4">
          {/* Titles */}
          <div className="rounded-2xl border border-slate-800 bg-[#121828] p-5 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-xs font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
                <Tag className="h-3.5 w-3.5" /> Títulos Otimizados para Busca (SEO)
              </h3>
            </div>

            <div className="mt-3 flex flex-col gap-2">
              {(generatedAd?.titles || []).map((title, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between rounded-xl bg-[#0c1220] p-3 text-xs border border-slate-800/80"
                >
                  <span className="font-semibold text-slate-200">{title}</span>
                  <button
                    onClick={() => copyToClipboard(title, `title-${i}`)}
                    className="ml-2 flex items-center gap-1 text-[11px] font-bold text-purple-400 hover:text-purple-300 flex-shrink-0"
                  >
                    {copiedSection === `title-${i}` ? (
                      <Check className="h-3.5 w-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Description */}
          <div className="rounded-2xl border border-slate-800 bg-[#121828] p-5 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-xs font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
                <FileText className="h-3.5 w-3.5" /> Descrição Completa Formatada
              </h3>
              <button
                onClick={() => copyToClipboard(generatedAd?.descriptions?.full || "", "desc")}
                className="flex items-center gap-1 text-xs font-bold text-purple-400 hover:text-purple-300"
              >
                {copiedSection === "desc" ? (
                  <span className="text-emerald-400 flex items-center gap-1">
                    <Check className="h-3.5 w-3.5" /> Copiado!
                  </span>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    <span>Copiar Tudo</span>
                  </>
                )}
              </button>
            </div>

            <pre className="mt-3 whitespace-pre-wrap font-sans text-xs text-slate-300 leading-relaxed bg-[#0c1220] p-4 rounded-xl border border-slate-800/80">
              {generatedAd?.descriptions?.full}
            </pre>
          </div>

          {/* SEO Tags */}
          <div className="rounded-2xl border border-slate-800 bg-[#121828] p-5 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-xs font-bold uppercase tracking-wider text-purple-400">
                Hashtags e Palavras-Chave de Alto Volume
              </h3>
              <button
                onClick={() => copyToClipboard((generatedAd?.descriptions?.seoTags || []).join(", "), "tags")}
                className="text-xs font-bold text-purple-400 hover:text-purple-300 flex items-center gap-1"
              >
                {copiedSection === "tags" ? (
                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
                <span>Copiar Tags</span>
              </button>
            </div>

            <div className="mt-3 flex flex-wrap gap-1.5">
              {(generatedAd?.descriptions?.seoTags || []).map((t, idx) => (
                <span
                  key={idx}
                  className="rounded-lg bg-purple-950/40 border border-purple-500/30 px-2.5 py-1 text-xs text-purple-300 font-medium"
                >
                  #{t.replace(/\s+/g, "")}
                </span>
              ))}
            </div>
          </div>

          {/* Angle & Mockup Prompts */}
          <div className="rounded-2xl border border-slate-800 bg-[#121828] p-5 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-xs font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
                <Camera className="h-3.5 w-3.5" /> Variações de Ângulos e Prompts de Fotos
              </h3>
              <span className="text-[10px] text-slate-400">Ideal para ensaio fotográfico ou IA de imagem</span>
            </div>
            <div className="mt-3 space-y-2.5">
              {(generatedAd?.mockupPrompts || []).map((prompt, idx) => {
                const angleNames = ["Ângulo Frontal Principal", "Vista Lateral 45°", "Close-up de Textura / Detalhe", "Ambiente Decorado / Contexto"];
                const currentAngleTitle = angleNames[idx] || `Variação ${idx + 1}`;
                return (
                  <div key={idx} className="rounded-xl bg-[#0c1220] p-3 text-xs border border-slate-800/80 flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-purple-300 flex items-center gap-1">
                        <Compass className="h-3 w-3" /> {currentAngleTitle}
                      </span>
                      <button
                        onClick={() => copyToClipboard(prompt, `angle-${idx}`)}
                        className="flex items-center gap-1 text-[11px] font-bold text-purple-400 hover:text-purple-300"
                      >
                        {copiedSection === `angle-${idx}` ? (
                          <Check className="h-3 w-3 text-emerald-400" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                        <span>Copiar Prompt</span>
                      </button>
                    </div>
                    <p className="text-slate-300 font-sans">📸 {prompt}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Slicer Optimization Suggestions by AI */}
          {generatedAd?.slicerOptimization && (
            <div className="rounded-2xl border border-cyan-500/30 bg-cyan-950/10 p-5 shadow-sm">
              <div className="flex items-center justify-between pb-3 border-b border-cyan-500/20">
                <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-300 flex items-center gap-1.5">
                  <Layers className="h-4 w-4" /> Configurações de Fatiador (Slicer) Sugeridas por IA
                </h3>
                <span className="text-[10px] bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded-full font-semibold border border-cyan-500/30">
                  Otimizado para Qualidade & Custo
                </span>
              </div>

              <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="rounded-xl bg-[#0c1220] p-3 border border-slate-800">
                  <p className="text-[10px] uppercase font-bold text-slate-400">Altura de Camada</p>
                  <p className="mt-1 text-xs font-bold text-cyan-200">{generatedAd.slicerOptimization.layerHeight}</p>
                </div>
                <div className="rounded-xl bg-[#0c1220] p-3 border border-slate-800">
                  <p className="text-[10px] uppercase font-bold text-slate-400">Preenchimento</p>
                  <p className="mt-1 text-xs font-bold text-cyan-200">{generatedAd.slicerOptimization.infillDensity} ({generatedAd.slicerOptimization.infillPattern})</p>
                </div>
                <div className="rounded-xl bg-[#0c1220] p-3 border border-slate-800">
                  <p className="text-[10px] uppercase font-bold text-slate-400">Paredes / Perímetros</p>
                  <p className="mt-1 text-xs font-bold text-cyan-200">{generatedAd.slicerOptimization.wallPerimeters} paredes</p>
                </div>
                <div className="rounded-xl bg-[#0c1220] p-3 border border-slate-800">
                  <p className="text-[10px] uppercase font-bold text-slate-400">Temperaturas</p>
                  <p className="mt-1 text-xs font-bold text-cyan-200">{generatedAd.slicerOptimization.printTemperature}</p>
                </div>
              </div>

              <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="rounded-xl bg-[#0c1220] p-3 border border-slate-800">
                  <p className="text-[10px] uppercase font-bold text-slate-400">Suportes</p>
                  <p className="mt-1 text-xs font-semibold text-slate-200">
                    {generatedAd.slicerOptimization.supportNeeded ? `Sim: ${generatedAd.slicerOptimization.supportType || "Sim"}` : "Não necessário"}
                  </p>
                </div>
                <div className="rounded-xl bg-[#0c1220] p-3 border border-slate-800">
                  <p className="text-[10px] uppercase font-bold text-slate-400">Orientação de Impressão</p>
                  <p className="mt-1 text-xs font-semibold text-slate-200">{generatedAd.slicerOptimization.printOrientation}</p>
                </div>
                <div className="rounded-xl bg-[#0c1220] p-3 border border-slate-800">
                  <p className="text-[10px] uppercase font-bold text-slate-400">Estimativas (IA)</p>
                  <p className="mt-1 text-xs font-semibold text-emerald-400">
                    ⏱️ {generatedAd.slicerOptimization.estimatedTimeHours}h | ⚖️ {generatedAd.slicerOptimization.estimatedWeightGrams}g
                  </p>
                </div>
              </div>

              {generatedAd.slicerOptimization.aiTips && generatedAd.slicerOptimization.aiTips.length > 0 && (
                <div className="mt-3 rounded-xl bg-[#0c1220] p-3.5 border border-cyan-500/20">
                  <p className="text-[11px] font-bold text-cyan-300 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                    💡 Dicas de Impressão da IA para esta Geometria:
                  </p>
                  <ul className="space-y-1 text-xs text-slate-300">
                    {generatedAd.slicerOptimization.aiTips.map((tip, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="text-cyan-400 font-bold">•</span>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Sales Consultant Tips */}
          {generatedAd?.salesConsultant && (
            <div className="rounded-2xl border border-purple-500/30 bg-purple-950/10 p-5 shadow-sm">
              <h3 className="text-xs font-bold uppercase tracking-wider text-purple-300 flex items-center gap-1.5 pb-2 border-b border-purple-500/20">
                💡 Consultor de Vendas & Estratégia de Mercado
              </h3>
              <div className="mt-3 space-y-3 text-xs text-slate-300">
                <div>
                  <p className="font-bold text-purple-200">Precificação Estratégica:</p>
                  <p className="mt-0.5 text-slate-400">{generatedAd.salesConsultant.pricingTip}</p>
                </div>
                <div>
                  <p className="font-bold text-purple-200">Ideias de Combos para Aumentar Ticket Médio:</p>
                  <ul className="mt-1 list-disc list-inside space-y-1 text-slate-400">
                    {(generatedAd?.salesConsultant?.bundleIdeas || []).map((b, i) => (
                      <li key={i}>{b}</li>
                    ))}
                  </ul>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div className="rounded-xl bg-[#0c1220] p-3 border border-slate-800">
                    <p className="font-bold text-purple-300">Mercado Livre:</p>
                    <p className="mt-1 text-[11px] text-slate-400">{generatedAd?.salesConsultant?.marketplaceTips?.mercadoLivre}</p>
                  </div>
                  <div className="rounded-xl bg-[#0c1220] p-3 border border-slate-800">
                    <p className="font-bold text-orange-400">Shopee:</p>
                    <p className="mt-1 text-[11px] text-slate-400">{generatedAd?.salesConsultant?.marketplaceTips?.shopee}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
