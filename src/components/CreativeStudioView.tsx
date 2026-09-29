import React, { useState } from "react";
import {
  Sparkles,
  Copy,
  Check,
  Wand2,
  Tag,
  FileText,
  Camera,
  ChevronDown,
  Layers,
  ShoppingBag,
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
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const [generatedAd, setGeneratedAd] = useState<CreativeAdResult>({
    titles: [
      "Escultura Gato Abstrato Decoração Minimalista Moderna 3D",
      "Estatueta Gato Geométrico Sala Escritório Design Luxo",
      "Gato Abstrato Impressão 3D Alta Qualidade Presente Criativo",
    ],
    description: `🐱 ESCULTURA GATO ABSTRATO GEOMÉTRICO - DESIGN MINIMALISTA EXCLUSIVO 3D

Transforme qualquer ambiente com esta obra contemporânea. Perfeito para salas, estantes de livros, mesas de escritório e cabeceiras.

✨ DIFERENCIAIS E QUALIDADE:
• Fabricado em tecnologia de Impressão 3D de alta precisão com acabamento refinado
• Material ecológico PLA premium, resistente, leve e durável
• Design facetado geométrico que reflete a luz com sofisticação
• Ideal para presentear amantes de felinos, arquitetura e design moderno

📏 ESPECIFICAÇÕES TÉCNICAS:
• Altura: 18 cm | Largura: 8 cm | Profundidade: 10 cm
• Peso aproximado: 65 gramas
• Acabamento: Preto Fosco acetinado anti-reflexo

📦 CONTEÚDO DA EMBALAGEM:
• 1x Escultura Gato Abstrato 3D em embalagem reforçada anti-impacto

🚚 ENVIO IMEDIATO: Produto pronto para envio com nota fiscal e garantia!`,
    tags: [
      "gato abstrato",
      "decoracao minimalista",
      "escultura 3d",
      "design geometrico",
      "estatueta sala",
      "decoracao escritorio",
      "presente criativo",
      "impressao 3d brasil",
      "arquitetura interiores",
      "artigos decorativos",
    ],
    photoPrompts: [
      "Gato geométrico preto fosco sobre uma estante de madeira clara com iluminação quente lateral suave",
      "Foto em close do detalhe geométrico em ângulo de 45 graus com fundo desfocado de sala moderna",
    ],
  });

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch("/api/creative-studio/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productName,
          category,
          targetPlatform,
          colorFinish,
          tone,
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
    <div className="mx-auto max-w-xl px-4 py-6 text-slate-100 flex flex-col gap-6">
      {/* Title & Subtitle (Screenshot 27) */}
      <div>
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-600/20 text-purple-400">
            <Sparkles className="h-5 w-5" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white leading-tight">
            Estúdio Criativo
          </h1>
        </div>
        <p className="mt-1 text-xs text-slate-400">
          Geração de criativos e anúncios de alta conversão para o seu produto.
        </p>
      </div>

      {/* Input Form */}
      <div className="rounded-2xl border border-slate-800 bg-[#121828] p-5 shadow-sm flex flex-col gap-4">
        <div>
          <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Q PRODUTO: SELECIONE OU DIGITE O NOME
          </label>
          <input
            type="text"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            placeholder="Ex: Escultura Gato Abstrato..."
            className="mt-1 w-full rounded-xl border border-slate-800 bg-[#0d1320] px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-purple-500 focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              CATEGORIA
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
              PLATAFORMA ALVO
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

        <div>
          <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            CORES E ACABAMENTO DO FILAMENTO
          </label>
          <input
            type="text"
            value={colorFinish}
            onChange={(e) => setColorFinish(e.target.value)}
            className="mt-1 w-full rounded-xl border border-slate-800 bg-[#0d1320] px-3 py-2 text-xs text-white focus:border-purple-500 focus:outline-none"
          />
        </div>

        <button
          id="btn-generate-creative"
          disabled={isGenerating}
          onClick={handleGenerate}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-purple-600 py-3 text-sm font-bold text-white shadow-md shadow-purple-600/30 hover:bg-purple-500 active:scale-98 disabled:opacity-60 transition"
        >
          <Wand2 className="h-4 w-4" />
          <span>{isGenerating ? "Criando Anúncio com Inteligência..." : "Criar Anúncio Novo com IA"}</span>
        </button>
      </div>

      {/* Output Sections */}
      {generatedAd && (
        <div className="flex flex-col gap-4">
          {/* Titles */}
          <div className="rounded-2xl border border-slate-800 bg-[#121828] p-5 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-xs font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
                <Tag className="h-3.5 w-3.5" /> Opções de Títulos Otimizados para Busca (SEO)
              </h3>
            </div>

            <div className="mt-3 flex flex-col gap-2">
              {generatedAd.titles.map((title, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between rounded-xl bg-[#0c1220] p-3 text-xs border border-slate-800/80"
                >
                  <span className="font-semibold text-slate-200">{title}</span>
                  <button
                    onClick={() => copyToClipboard(title, `title-${i}`)}
                    className="ml-2 flex items-center gap-1 text-[11px] font-bold text-purple-400 hover:text-purple-300"
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
                onClick={() => copyToClipboard(generatedAd.description, "desc")}
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
              {generatedAd.description}
            </pre>
          </div>

          {/* Tags */}
          <div className="rounded-2xl border border-slate-800 bg-[#121828] p-5 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-xs font-bold uppercase tracking-wider text-purple-400">
                Hashtags e Palavras-Chave de Alto Volume
              </h3>
              <button
                onClick={() => copyToClipboard(generatedAd.tags.join(", "), "tags")}
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
              {generatedAd.tags.map((t, idx) => (
                <span
                  key={idx}
                  className="rounded-lg bg-purple-950/40 border border-purple-500/30 px-2.5 py-1 text-xs text-purple-300 font-medium"
                >
                  #{t.replace(/\s+/g, "")}
                </span>
              ))}
            </div>
          </div>

          {/* Photo Prompts */}
          <div className="rounded-2xl border border-slate-800 bg-[#121828] p-5 shadow-sm">
            <h3 className="text-xs font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1.5 pb-3 border-b border-slate-800">
              <Camera className="h-3.5 w-3.5" /> Ideias para Cenários Fotográficos de Produto
            </h3>
            <div className="mt-3 space-y-2">
              {generatedAd.photoPrompts.map((prompt, idx) => (
                <div key={idx} className="rounded-xl bg-[#0c1220] p-3 text-xs text-slate-300 border border-slate-800/80">
                  <p>📸 {prompt}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
