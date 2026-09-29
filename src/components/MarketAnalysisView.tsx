import React, { useState } from "react";
import {
  Search,
  Download,
  Bookmark,
  Zap,
  User,
  ShoppingBag,
  Play,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  Sparkles,
  ArrowRight,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { MarketAnalysisItem } from "../types";

export const MarketAnalysisView: React.FC = () => {
  const [platform, setPlatform] = useState<"Mercado Livre" | "Shopee">("Mercado Livre");
  const [creditsUsed, setCreditsUsed] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showSavedList, setShowSavedList] = useState(false);
  const [showTutorialVideo, setShowTutorialVideo] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<MarketAnalysisItem["result"] | null>(null);

  // Form states for user and competitor
  const [userTitle, setUserTitle] = useState("Vaso Decorativo Geométrico 3D 22cm");
  const [userPrice, setUserPrice] = useState("59.90");
  const [userShipping, setUserShipping] = useState("Frete Grátis acima de R$ 79");
  const [userSales, setUserSales] = useState("18");
  const [userRating, setUserRating] = useState("4.8");

  const [competitorTitle, setCompetitorTitle] = useState("Vaso Espiral Minimalista Moderno Pronta Entrega");
  const [competitorPrice, setCompetitorPrice] = useState("49.90");
  const [competitorShipping, setCompetitorShipping] = useState("Envio Full / Imediato");
  const [competitorSales, setCompetitorSales] = useState("320");
  const [competitorRating, setCompetitorRating] = useState("4.9");

  const handleRunAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      const response = await fetch("/api/market-analysis/compare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          platform,
          userListing: {
            title: userTitle,
            price: Number(userPrice),
            shipping: userShipping,
            sales: Number(userSales),
            rating: Number(userRating),
          },
          competitorListing: {
            title: competitorTitle,
            price: Number(competitorPrice),
            shipping: competitorShipping,
            sales: Number(competitorSales),
            rating: Number(competitorRating),
          },
        }),
      });

      const resData = await response.json();
      if (resData.data) {
        setAnalysisResult(resData.data);
        setCreditsUsed((prev) => Math.min(10, prev + 2));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleDownloadExtension = () => {
    // Generate a simple simulated extension manifest/guide download
    const blob = new Blob(
      [
        JSON.stringify(
          {
            name: "MakerFlow 3D Marketplace Extension",
            version: "1.0.0",
            description: "Capture anúncios da Shopee e Mercado Livre com 1 clique.",
            permissions: ["activeTab", "storage"],
          },
          null,
          2
        ),
      ],
      { type: "application/json" }
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "makerflow-extension.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="mx-auto max-w-xl px-4 py-6 text-slate-100 flex flex-col gap-6">
      {/* Title & Subtitle (Screenshot 23) */}
      <div className="text-center sm:text-left">
        <div className="flex items-center justify-center sm:justify-start gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600/20 text-blue-400">
            <Search className="h-5 w-5" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white leading-tight">
            Análise de Mercado
          </h1>
        </div>
        <p className="mt-2 text-xs leading-relaxed text-slate-400 max-w-md mx-auto sm:mx-0">
          Compare seus anúncios com a concorrência em tempo real. Identifique pontos de melhoria no
          preço, logística e conversão para otimizar seus resultados.
        </p>
      </div>

      {/* Platform selector toggle (Screenshot 23) */}
      <div className="flex rounded-xl bg-[#121828] p-1.5 border border-slate-800">
        <button
          id="btn-platform-ml"
          onClick={() => setPlatform("Mercado Livre")}
          className={`flex-1 flex items-center justify-center gap-2 rounded-lg py-2 text-xs font-bold transition ${
            platform === "Mercado Livre"
              ? "bg-[#FFE600] text-slate-950 shadow-md"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <span className="h-2.5 w-2.5 rounded-full bg-[#2D3277]" />
          <span>MERCADO LIVRE</span>
        </button>

        <button
          id="btn-platform-shopee"
          onClick={() => setPlatform("Shopee")}
          className={`flex-1 flex items-center justify-center gap-2 rounded-lg py-2 text-xs font-bold transition ${
            platform === "Shopee"
              ? "bg-[#EE4D2D] text-white shadow-md"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <ShoppingBag className="h-3.5 w-3.5" />
          <span>SHOPEE</span>
        </button>
      </div>

      {/* Action Buttons & Credits (Screenshot 23) */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSavedList(!showSavedList)}
            className="flex items-center gap-1.5 rounded-xl border border-slate-800 bg-[#121828] px-3 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800 transition"
          >
            <Bookmark className="h-3.5 w-3.5" />
            <span>Análises Salvas</span>
          </button>

          <button
            onClick={handleDownloadExtension}
            className="flex items-center gap-1.5 rounded-xl border border-slate-800 bg-[#121828] px-3 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800 transition"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Baixar Extensão</span>
          </button>
        </div>

        <div className="text-right">
          <div className="flex items-center gap-1 text-xs font-bold text-amber-400">
            <Zap className="h-3.5 w-3.5 fill-amber-400" />
            <span>Usados: {creditsUsed}/10</span>
          </div>
          <span className="text-[10px] font-extrabold tracking-widest text-slate-400">
            PLANO TRIAL
          </span>
        </div>
      </div>

      {/* SEU ANÚNCIO (Screenshot 23) */}
      <div className="rounded-2xl border border-slate-800 bg-[#121828] p-5 shadow-sm">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400 pb-3 border-b border-slate-800/80">
          <Sparkles className="h-4 w-4 text-blue-400" />
          <span>SEU ANÚNCIO</span>
        </div>

        <div className="mt-4 flex flex-col gap-3">
          <div>
            <label className="text-[11px] font-semibold text-slate-400">Título do seu anúncio</label>
            <input
              type="text"
              value={userTitle}
              onChange={(e) => setUserTitle(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-800 bg-[#0d1320] px-3 py-2 text-xs text-white focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <label className="text-[11px] font-semibold text-slate-400">Seu Preço (R$)</label>
              <input
                type="number"
                step={0.1}
                value={userPrice}
                onChange={(e) => setUserPrice(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-800 bg-[#0d1320] px-3 py-2 text-xs font-bold text-white focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-400">Vendas Estimadas</label>
              <input
                type="number"
                value={userSales}
                onChange={(e) => setUserSales(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-800 bg-[#0d1320] px-3 py-2 text-xs text-white focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      {/* CONCORRENTE (Screenshot 24) */}
      <div className="rounded-2xl border border-slate-800 bg-[#121828] p-5 shadow-sm">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400 pb-3 border-b border-slate-800/80">
          <span className="text-amber-400">⇄</span>
          <span>CONCORRENTE</span>
        </div>

        <p className="mt-3 text-xs text-slate-400 leading-relaxed">
          Vá até a página do produto concorrente e clique no botão{" "}
          <strong className="text-white">Analisar com MakerFlow</strong> ou preencha abaixo:
        </p>

        <div className="mt-3 flex items-center gap-2">
          <a
            href="https://www.mercadolivre.com.br"
            target="_blank"
            rel="noreferrer"
            className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-slate-800 bg-[#0d1320] py-2 text-xs font-bold text-yellow-300 hover:bg-slate-800 transition"
          >
            <span>Abrir Mercado Livre</span>
            <ExternalLink className="h-3 w-3" />
          </a>
          <a
            href="https://shopee.com.br"
            target="_blank"
            rel="noreferrer"
            className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-slate-800 bg-[#0d1320] py-2 text-xs font-bold text-orange-400 hover:bg-slate-800 transition"
          >
            <span>Abrir Shopee</span>
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>

        <div className="mt-4 flex flex-col gap-3">
          <div>
            <label className="text-[11px] font-semibold text-slate-400">
              Título do concorrente
            </label>
            <input
              type="text"
              value={competitorTitle}
              onChange={(e) => setCompetitorTitle(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-800 bg-[#0d1320] px-3 py-2 text-xs text-white focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <label className="text-[11px] font-semibold text-slate-400">Preço Concorrente (R$)</label>
              <input
                type="number"
                step={0.1}
                value={competitorPrice}
                onChange={(e) => setCompetitorPrice(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-800 bg-[#0d1320] px-3 py-2 text-xs font-bold text-white focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-400">Vendas Concorrente</label>
              <input
                type="number"
                value={competitorSales}
                onChange={(e) => setCompetitorSales(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-800 bg-[#0d1320] px-3 py-2 text-xs text-white focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Button: ANALISAR MERCADO AGORA (Screenshot 24) */}
      <div className="flex flex-col items-center gap-2">
        <button
          id="btn-analyze-market"
          disabled={isAnalyzing}
          onClick={handleRunAnalysis}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-600/30 hover:bg-blue-500 active:scale-98 disabled:opacity-60 transition"
        >
          <Zap className="h-4 w-4" />
          <span>{isAnalyzing ? "Analisando com Inteligência Artificial..." : "⚡ ANALISAR MERCADO AGORA"}</span>
        </button>
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
          CUSTO: 20 CRÉDITOS
        </span>
      </div>

      {/* Analysis Result Output (when generated) */}
      {analysisResult && (
        <div className="rounded-2xl border border-blue-500/40 bg-[#101729] p-5 shadow-xl glow-card flex flex-col gap-4 animate-fade-in">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-blue-400" />
              Diagnóstico de Inteligência Competitiva
            </h3>
            <span className="rounded bg-blue-950 px-2 py-0.5 text-[10px] font-bold text-blue-300 border border-blue-500/30">
              {platform}
            </span>
          </div>

          {/* Scores Comparison */}
          <div className="grid grid-cols-2 gap-3 text-center">
            <div className="rounded-xl bg-[#0c1220] p-3 border border-slate-800">
              <span className="text-[11px] text-slate-400 uppercase font-semibold">Seu Score</span>
              <p className="text-2xl font-black text-blue-400">{analysisResult.scoreUser}/100</p>
            </div>
            <div className="rounded-xl bg-[#0c1220] p-3 border border-slate-800">
              <span className="text-[11px] text-slate-400 uppercase font-semibold">Concorrente</span>
              <p className="text-2xl font-black text-amber-400">{analysisResult.scoreCompetitor}/100</p>
            </div>
          </div>

          {/* Price Gap */}
          <div className="rounded-xl bg-[#0c1220] p-3 border border-slate-800 text-xs">
            <span className="font-bold text-white block mb-1">Diferença de Preço:</span>
            <p className="text-slate-300 leading-relaxed">{analysisResult.priceGap.verdict}</p>
          </div>

          {/* Missing SEO Keywords */}
          <div className="rounded-xl bg-[#0c1220] p-3 border border-slate-800 text-xs">
            <span className="font-bold text-white block mb-1.5">
              Palavras-chave que você está perdendo:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {analysisResult.seoComparison.missingHighVolumeKeywords.map((kw, i) => (
                <span
                  key={i}
                  className="rounded-md bg-red-950/40 border border-red-500/30 px-2 py-0.5 text-[11px] text-red-300 font-medium"
                >
                  +{kw}
                </span>
              ))}
            </div>
          </div>

          {/* Action Plan */}
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300 block mb-2">
              Plano de Ação para Superar o Concorrente:
            </span>
            <div className="space-y-2">
              {analysisResult.actionPlan.map((ap, idx) => (
                <div key={idx} className="rounded-xl bg-[#0d1424] p-3 text-xs border border-slate-800">
                  <span className="font-bold text-blue-300">{ap.step}</span>
                  <p className="mt-0.5 text-slate-300 leading-relaxed">{ap.action}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Suggested New Title */}
          <div className="rounded-xl bg-blue-950/40 border border-blue-500/30 p-3 text-xs">
            <span className="text-[11px] font-bold text-blue-300 uppercase">
              Sugestão de Novo Título Otimizado:
            </span>
            <p className="mt-1 font-bold text-white text-sm">
              "{analysisResult.suggestedNewTitle}"
            </p>
          </div>
        </div>
      )}

      {/* Tutorial: COMO FAZER UMA ANÁLISE DE MERCADO? (Screenshots 24, 25, 26) */}
      <div className="rounded-2xl border border-slate-800 bg-[#121828] p-5 shadow-sm">
        <div className="flex items-center gap-2 pb-4 border-b border-slate-800/80">
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-800 text-xs font-bold text-slate-300">
            ?
          </span>
          <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-300">
            COMO FAZER UMA ANÁLISE DE MERCADO?
          </h2>
        </div>

        {/* 5 Steps (Screenshots 25 & 26) */}
        <div className="mt-4 flex flex-col gap-3">
          {/* Step 1 */}
          <div className="flex items-start gap-3 rounded-xl bg-[#0d1320] p-3 text-xs">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-blue-600 font-bold text-white text-xs">
              1
            </span>
            <div>
              <h4 className="font-bold text-white">Download da Extensão</h4>
              <p className="mt-0.5 text-[11px] text-slate-400 leading-relaxed">
                Baixe o arquivo clicando no botão Baixar Extensão no topo da página.
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex items-start gap-3 rounded-xl bg-[#0d1320] p-3 text-xs">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-blue-600 font-bold text-white text-xs">
              2
            </span>
            <div>
              <h4 className="font-bold text-white">Ativação no Navegador</h4>
              <p className="mt-0.5 text-[11px] text-slate-400 leading-relaxed">
                Acesse chrome://extensions, ative o Modo do Desenvolvedor e carregue a pasta extraída.
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="flex items-start gap-3 rounded-xl bg-[#0d1320] p-3 text-xs">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-blue-600 font-bold text-white text-xs">
              3
            </span>
            <div>
              <h4 className="font-bold text-white">Selecione seu Produto</h4>
              <p className="mt-0.5 text-[11px] text-slate-400 leading-relaxed">
                Acesse a página do seu produto na Shopee/ML e clique em Sincronizar meu Anúncio na extensão.
              </p>
            </div>
          </div>

          {/* Step 4 */}
          <div className="flex items-start gap-3 rounded-xl bg-[#0d1320] p-3 text-xs">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-blue-600 font-bold text-white text-xs">
              4
            </span>
            <div>
              <h4 className="font-bold text-white">Mapeie o Concorrente</h4>
              <p className="mt-0.5 text-[11px] text-slate-400 leading-relaxed">
                Vá até o produto concorrente na Shopee/ML e clique em Analisar com MakerFlow.
              </p>
            </div>
          </div>

          {/* Step 5 */}
          <div className="flex items-start gap-3 rounded-xl bg-[#0d1320] p-3 text-xs">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-blue-600 font-bold text-white text-xs">
              5
            </span>
            <div>
              <h4 className="font-bold text-white">Finalize a Análise</h4>
              <p className="mt-0.5 text-[11px] text-slate-400 leading-relaxed">
                Volte ao sistema e clique em Analisar Mercado Agora para ver todos os detalhes e insights.
              </p>
            </div>
          </div>
        </div>

        {/* TUTORIAL ANÁLISE DE MERCADO Video Player (Screenshot 26) */}
        <div className="mt-6 border-t border-slate-800/80 pt-4">
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 block text-center mb-3">
            TUTORIAL ANÁLISE DE MERCADO
          </span>

          <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-[#090d18] aspect-video flex flex-col justify-between p-4">
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />

            <div className="relative z-10 flex justify-end">
              <span className="rounded bg-blue-600/80 px-2 py-0.5 text-[10px] font-bold text-white">
                HD 1080p
              </span>
            </div>

            {/* Big Play Button in Center */}
            <div className="relative z-10 flex items-center justify-center my-auto">
              <button
                onClick={() => setShowTutorialVideo(!showTutorialVideo)}
                aria-label="Assistir tutorial da análise de mercado"
                className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-slate-950 shadow-xl hover:scale-105 active:scale-95 transition"
              >
                <Play className="h-6 w-6 fill-slate-950 ml-1" />
              </button>
            </div>

            {/* Video Player Timeline Control */}
            <div className="relative z-10">
              <div className="flex items-center justify-between text-[11px] text-slate-300 font-mono">
                <span>0:00 / 1:45</span>
              </div>
              <div className="mt-1 h-1.5 w-full rounded-full bg-slate-700">
                <div className="h-full w-1/4 rounded-full bg-blue-500" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
