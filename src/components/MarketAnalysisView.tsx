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
import { usePersistentState } from "../hooks/usePersistentState";

export const MarketAnalysisView: React.FC = () => {
  const [platform, setPlatform] = useState<"Mercado Livre" | "Shopee">("Mercado Livre");
  const [creditsUsed, setCreditsUsed] = useState(0);
  const [resultSource, setResultSource] = useState<string>("");
  const [requestError, setRequestError] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showSavedList, setShowSavedList] = useState(false);
  const [savedAnalyses, setSavedAnalyses] = usePersistentState<Array<{id: string; title: string; date: string; source: string; result: MarketAnalysisItem["result"]}>>("marketAnalyses", []);
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
    setRequestError("");
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
      if (!response.ok || !resData.success) throw new Error(resData.error || "Não foi possível analisar os anúncios.");
      setResultSource(resData.source || "");
      if (resData.data) {
        setAnalysisResult(resData.data);
        setCreditsUsed((prev) => prev + 1);
        setSavedAnalyses((previous) => [{ id: crypto.randomUUID(), title: userTitle, date: new Date().toLocaleString("pt-BR"), source: resData.source || "local", result: resData.data }, ...previous].slice(0,50));
      }
    } catch (err) {
      setRequestError(err instanceof Error ? err.message : "Não foi possível analisar os anúncios.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="mx-auto max-w-xl px-4 py-6 text-slate-100 flex flex-col gap-6">
      {requestError && <p role="alert" className="rounded-xl bg-red-950/40 p-3 text-xs text-red-200">{requestError}</p>}
      {resultSource === "local" && <p role="status" className="rounded-xl bg-amber-950/40 p-3 text-xs text-amber-200">Resultado de modelo local, sem consulta à IA ou aos marketplaces. Revise preços, especificações e sugestões antes de usar.</p>}
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


        </div>

        <div className="text-right">
          <div className="flex items-center gap-1 text-xs font-bold text-amber-400">
            <Zap className="h-3.5 w-3.5 fill-amber-400" />
            <span>Análises: {creditsUsed}</span>
          </div>
          <span className="text-[10px] font-extrabold tracking-widest text-slate-400">
            NESTA SESSÃO
          </span>
        </div>
      </div>

      {showSavedList && <section aria-label="Análises salvas" className="rounded-2xl border border-slate-800 bg-[#121828] p-4 flex flex-col gap-2">
        <h2 className="font-bold">Análises salvas neste navegador</h2>
        {savedAnalyses.length === 0 && <p className="text-xs text-slate-400">Execute uma análise para salvá-la automaticamente.</p>}
        {savedAnalyses.map(item => <button key={item.id} className="rounded-lg bg-slate-800 p-3 text-left text-xs" onClick={() => { setAnalysisResult(item.result); setResultSource(item.source); }}><span className="font-bold">{item.title}</span> • {item.date}</button>)}
      </section>}

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

      <section className="rounded-2xl border border-slate-800 bg-[#121828] p-5 text-xs text-slate-300">
        <h2 className="font-bold text-white mb-3">Como fazer uma análise</h2>
        <ol className="list-decimal pl-4 space-y-2">
          <li>Abra seu anúncio e o concorrente no marketplace e confira os dados.</li>
          <li>Preencha manualmente título, preço, frete, vendas e avaliação nos dois formulários.</li>
          <li>Clique em Analisar Mercado Agora e revise as sugestões. A análise fica salva neste navegador.</li>
        </ol>
        <p className="mt-3 text-slate-400">A captura automática por extensão e o vídeo tutorial ainda não estão disponíveis.</p>
      </section>
    </div>
  );
};
