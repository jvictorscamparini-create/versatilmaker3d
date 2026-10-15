import React, { useState, useEffect } from "react";
import {
  Search,
  Download,
  Bookmark,
  Zap,
  ShoppingBag,
  Play,
  ExternalLink,
  Sparkles,
  TrendingUp,
  Table,
  RefreshCw,
  CheckCircle2,
  ArrowUpRight,
} from "lucide-react";
import { MarketAnalysisItem } from "../types";

interface NicheTrendItem {
  name: string;
  monthlySearches: string;
  avgPrice: string;
  competition: string;
  profitMargin: string;
  verdict: string;
}

export const MarketAnalysisView: React.FC = () => {
  const [platform, setPlatform] = useState<"Mercado Livre" | "Shopee">("Mercado Livre");
  const [creditsUsed, setCreditsUsed] = useState(2);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showSavedList, setShowSavedList] = useState(false);
  const [showTutorialVideo, setShowTutorialVideo] = useState(false);

  // Grounding state
  const [groundingInsights, setGroundingInsights] = useState<string | null>(null);
  const [isLoadingGrounding, setIsLoadingGrounding] = useState(false);

  const handleFetchGrounding = async () => {
    setIsLoadingGrounding(true);
    try {
      const res = await fetch("/api/market-analysis/grounding-insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: userTitle })
      });
      const data = await res.json();
      if (data.success) {
        setGroundingInsights(data.insights);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingGrounding(false);
    }
  };

  // Niche trends async state
  const [isLoadingNiches, setIsLoadingNiches] = useState(false);
  const [nicheTrendsData, setNicheTrendsData] = useState<{
    niches: NicheTrendItem[];
    summary: string;
  } | null>({
    niches: [
      {
        name: "Vasos Decorativos & Cachepôs",
        monthlySearches: "48.500",
        avgPrice: "R$ 64,90",
        competition: "Média",
        profitMargin: "45%",
        verdict: "Excelente conversão e alta retenção"
      },
      {
        name: "Geek & Colecionáveis Articulados",
        monthlySearches: "72.000",
        avgPrice: "R$ 89,90",
        competition: "Alta",
        profitMargin: "50%",
        verdict: "Alta demanda orgânica na Shopee"
      },
      {
        name: "Organizadores & Suportes de Mesa",
        monthlySearches: "35.000",
        avgPrice: "R$ 49,90",
        competition: "Baixa",
        profitMargin: "40%",
        verdict: "Ideal para vendas corporativas em lote"
      },
      {
        name: "Abajures & Luminárias Paramétricas",
        monthlySearches: "28.000",
        avgPrice: "R$ 129,90",
        competition: "Baixa",
        profitMargin: "55%",
        verdict: "Ticket médio alto e baixo concorrente"
      },
      {
        name: "Utilidades Cozinha & Gourmet",
        monthlySearches: "31.200",
        avgPrice: "R$ 39,90",
        competition: "Média",
        profitMargin: "38%",
        verdict: "Giro rápido de estoque"
      }
    ],
    summary: "O mercado de impressão 3D no Brasil apresenta forte alta em itens de decoração geométrica e colecionáveis articulados, com margens líquidas superiores a 40% quando combinados com filamentos PLA Premium."
  });

  // Form states for user and competitor tailored for 3D printing
  const [userTitle, setUserTitle] = useState("Vaso Decorativo Geométrico 3D 22cm PLA");
  const [userPrice, setUserPrice] = useState("59.90");
  const [userShipping, setUserShipping] = useState("Frete Grátis acima de R$ 79");
  const [userSales, setUserSales] = useState("18");
  const [userRating, setUserRating] = useState("4.8");

  const [competitorTitle, setCompetitorTitle] = useState("Vaso Espiral Minimalista Moderno Pronta Entrega 3D");
  const [competitorPrice, setCompetitorPrice] = useState("49.90");
  const [competitorShipping, setCompetitorShipping] = useState("Envio Full / Imediato");
  const [competitorSales, setCompetitorSales] = useState("320");
  const [competitorRating, setCompetitorRating] = useState("4.9");

  const [analysisResult, setAnalysisResult] = useState<MarketAnalysisItem["result"] | null>({
    scoreUser: 78,
    scoreCompetitor: 93,
    priceGap: {
      difference: -10.00,
      percentage: -16.7,
      verdict: "O concorrente pratica preço R$ 10,00 menor devido a escala em fazenda 3D (bicos múltiplos), mas seu anúncio possui melhor detalhamento de acabamento e suporte pós-venda.",
    },
    seoComparison: {
      userKeywords: ["vaso geométrico", "decoração 3d", "vaso plantinha"],
      competitorKeywords: ["vaso espiral", "vaso minimalista", "decoração moderna", "vaso impressora 3d", "cachepô"],
      missingHighVolumeKeywords: ["vaso espiral", "cachepô premium", "decoração sala", "presente criativo", "pronta entrega"],
    },
    logisticsAnalysis: "O concorrente utiliza o envio Full (Mercado Livre) / Envio Prioritário (Shopee) com postagem em até 24h. Sua operação atual está com prazo de fabricação de 2 dias exibido, o que reduz a taxa de conversão em 22%.",
    strengthsUser: ["Design exclusivo com polimento manual sem marcas de camadas", "Embalagem reforçada anti-quebra"],
    weaknessesUser: ["Prazo de fabricação muito longo", "Menor volume de vendas acumuladas no algoritmo"],
    actionPlan: [
      {
        step: "Otimização de SEO 3D para Marketplaces",
        action: "Reescreva o título incluindo 'Vaso Espiral' e 'Cachepô Minimalista' que lideram as buscas de impressão 3D no momento.",
      },
      {
        step: "Estratégia de Kit e Margem",
        action: "Crie um anúncio de kit com 2 unidades com 15% de desconto para elevar o ticket médio e absorver o custo de frete grátis.",
      },
      {
        step: "Logística e Estoque de Segurança",
        action: "Mantenha pelo menos 5 peças de cada modelo pronto-entrega para postagem no mesmo dia.",
      },
    ],
    suggestedNewTitle: "Vaso Decorativo Geométrico 3D Exclusivo - Pronta Entrega",
  });

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

  const handleFetchNicheTrends = async () => {
    setIsLoadingNiches(true);
    try {
      const response = await fetch("/api/market-analysis/niches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const resData = await response.json();
      if (resData.success && resData.data) {
        setNicheTrendsData(resData.data);
      }
    } catch (err) {
      console.error("Erro ao buscar tendências de nichos:", err);
    } finally {
      setIsLoadingNiches(false);
    }
  };

  const handleDownloadExtension = () => {
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
      {/* Title & Subtitle */}
      <div className="text-center sm:text-left">
        <div className="flex items-center justify-center sm:justify-start gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600/20 text-blue-400">
            <Search className="h-5 w-5" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white leading-tight">
            Análise de Mercado & Tendências
          </h1>
        </div>
        <p className="mt-2 text-xs leading-relaxed text-slate-400 max-w-md mx-auto sm:mx-0">
          Compare seus anúncios com a concorrência e analise em tabela os nichos mais lucrativos da impressão 3D no Brasil.
        </p>
      </div>

      {/* Platform selector toggle */}
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

      {/* Action Buttons & Credits */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSavedList(!showSavedList)}
            className="flex items-center gap-1.5 rounded-xl border border-slate-800 bg-[#121828] px-3 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800 transition cursor-pointer"
          >
            <Bookmark className="h-3.5 w-3.5" />
            <span>Análises Salvas</span>
          </button>

          <button
            onClick={handleDownloadExtension}
            className="flex items-center gap-1.5 rounded-xl border border-slate-800 bg-[#121828] px-3 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800 transition cursor-pointer"
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

      {/* GOOGLE SEARCH GROUNDING REAL-TIME INSIGHTS */}
      <div className="rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-[#121828] via-[#0d1a18] to-[#121828] p-5 shadow-lg flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-600/20 text-emerald-400 border border-emerald-500/30">
              <Search className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-300">
                Google Search Grounding (Tendências Reais)
              </h3>
              <p className="text-[11px] text-slate-400">
                Consulte dados ao vivo da web para o seu produto em marketplaces brasileiros.
              </p>
            </div>
          </div>
          <button
            type="button"
            disabled={isLoadingGrounding}
            onClick={handleFetchGrounding}
            className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-2 text-xs font-bold text-white hover:bg-emerald-500 transition cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoadingGrounding ? "animate-spin" : ""}`} />
            <span>{isLoadingGrounding ? "Buscando na Web..." : "Buscar Dados Reais"}</span>
          </button>
        </div>

        {groundingInsights && (
          <div className="mt-2 rounded-xl bg-[#091512] p-4 text-xs border border-emerald-500/30 text-emerald-100 leading-relaxed">
            <p className="font-bold text-emerald-300 mb-1">🌐 Insights do Google Search Grounding:</p>
            <p className="whitespace-pre-wrap">{groundingInsights}</p>
          </div>
        )}
      </div>

      {/* ASYNCHRONOUS NICHE TRENDS COMPARISON TABLE SECTION */}
      <div className="rounded-2xl border border-blue-500/30 bg-gradient-to-br from-[#121828] via-[#0d152a] to-[#121828] p-5 shadow-lg flex flex-col gap-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-blue-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-blue-300">
              Tabela Comparativa de Nichos de Mercado 3D (IA)
            </h3>
          </div>
          <button
            type="button"
            disabled={isLoadingNiches}
            onClick={handleFetchNicheTrends}
            className="flex items-center gap-1.5 rounded-xl bg-blue-600/30 border border-blue-500/40 px-3 py-1.5 text-xs font-bold text-blue-200 hover:bg-blue-600 hover:text-white transition cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoadingNiches ? "animate-spin" : ""}`} />
            <span>{isLoadingNiches ? "Processando Tendências..." : "Atualizar Tendências"}</span>
          </button>
        </div>

        {nicheTrendsData?.summary && (
          <p className="text-xs text-slate-300 leading-relaxed bg-[#090e1a] p-3 rounded-xl border border-slate-800">
            💡 <strong className="text-blue-300">Resumo de Tendências:</strong> {nicheTrendsData.summary}
          </p>
        )}

        <div className="overflow-x-auto rounded-xl border border-slate-800">
          <table className="w-full text-left text-xs text-slate-200">
            <thead className="bg-[#0c1220] text-[10px] uppercase tracking-wider text-slate-400 border-b border-slate-800">
              <tr>
                <th className="p-3">Nicho / Categoria 3D</th>
                <th className="p-3">Buscas/Mês</th>
                <th className="p-3">Preço Médio</th>
                <th className="p-3">Concorrência</th>
                <th className="p-3">Margem</th>
                <th className="p-3">Veredito IA</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 bg-[#090d18]">
              {isLoadingNiches ? (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-slate-400">
                    <RefreshCw className="h-5 w-5 animate-spin mx-auto mb-2 text-blue-400" />
                    Processando dados assíncronos de tendências de mercado 3D...
                  </td>
                </tr>
              ) : (
                (nicheTrendsData?.niches || []).map((niche, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/30 transition">
                    <td className="p-3 font-bold text-white flex items-center gap-1.5">
                      <ArrowUpRight className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                      {niche.name}
                    </td>
                    <td className="p-3 text-blue-300 font-mono font-semibold">{niche.monthlySearches}</td>
                    <td className="p-3 font-semibold">{niche.avgPrice}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        niche.competition === "Baixa" ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" :
                        niche.competition === "Média" ? "bg-amber-500/20 text-amber-300 border border-amber-500/30" :
                        "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                      }`}>
                        {niche.competition}
                      </span>
                    </td>
                    <td className="p-3 font-bold text-emerald-400">{niche.profitMargin}</td>
                    <td className="p-3 text-[11px] text-slate-300">{niche.verdict}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* SEU ANÚNCIO */}
      <div className="rounded-2xl border border-slate-800 bg-[#121828] p-5 shadow-sm">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400 pb-3 border-b border-slate-800/80">
          <Sparkles className="h-4 w-4 text-blue-400" />
          <span>SEU ANÚNCIO (IMPRESSÃO 3D)</span>
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
                type="text"
                value={userPrice}
                onChange={(e) => setUserPrice(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-800 bg-[#0d1320] px-3 py-2 text-xs text-white focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-400">Modalidade de Frete</label>
              <input
                type="text"
                value={userShipping}
                onChange={(e) => setUserShipping(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-800 bg-[#0d1320] px-3 py-2 text-xs text-white focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <label className="text-[11px] font-semibold text-slate-400">Vendas Mensais Estimadas</label>
              <input
                type="number"
                value={userSales}
                onChange={(e) => setUserSales(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-800 bg-[#0d1320] px-3 py-2 text-xs text-white focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-400">Avaliação Média (Estrelas)</label>
              <input
                type="text"
                value={userRating}
                onChange={(e) => setUserRating(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-800 bg-[#0d1320] px-3 py-2 text-xs text-white focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      {/* ANÚNCIO DO CONCORRENTE */}
      <div className="rounded-2xl border border-slate-800 bg-[#121828] p-5 shadow-sm">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400 pb-3 border-b border-slate-800/80">
          <ShoppingBag className="h-4 w-4 text-purple-400" />
          <span>ANÚNCIO DO CONCORRENTE (TOP 1)</span>
        </div>

        <div className="mt-4 flex flex-col gap-3">
          <div>
            <label className="text-[11px] font-semibold text-slate-400">Título do Concorrente</label>
            <input
              type="text"
              value={competitorTitle}
              onChange={(e) => setCompetitorTitle(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-800 bg-[#0d1320] px-3 py-2 text-xs text-white focus:border-purple-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <label className="text-[11px] font-semibold text-slate-400">Preço Concorrente (R$)</label>
              <input
                type="text"
                value={competitorPrice}
                onChange={(e) => setCompetitorPrice(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-800 bg-[#0d1320] px-3 py-2 text-xs text-white focus:border-purple-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-400">Frete Concorrente</label>
              <input
                type="text"
                value={competitorShipping}
                onChange={(e) => setCompetitorShipping(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-800 bg-[#0d1320] px-3 py-2 text-xs text-white focus:border-purple-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <label className="text-[11px] font-semibold text-slate-400">Vendas Mensais Concorrente</label>
              <input
                type="number"
                value={competitorSales}
                onChange={(e) => setCompetitorSales(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-800 bg-[#0d1320] px-3 py-2 text-xs text-white focus:border-purple-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-400">Avaliação Concorrente</label>
              <input
                type="text"
                value={competitorRating}
                onChange={(e) => setCompetitorRating(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-800 bg-[#0d1320] px-3 py-2 text-xs text-white focus:border-purple-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        <button
          id="btn-run-market-analysis"
          disabled={isAnalyzing}
          onClick={handleRunAnalysis}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-sm font-bold text-white shadow-md shadow-blue-600/30 hover:bg-blue-500 active:scale-98 transition cursor-pointer disabled:opacity-60"
        >
          <Search className="h-4 w-4" />
          <span>{isAnalyzing ? "Analisando Concorrência..." : "Analisar Mercado Agora"}</span>
        </button>
      </div>

      {/* ANALYSIS RESULT */}
      {analysisResult && (
        <div className="rounded-2xl border border-slate-800 bg-[#121828] p-5 shadow-sm flex flex-col gap-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-blue-400 flex items-center gap-1.5">
              <Sparkles className="h-4 w-4" /> Diagnóstico de Concorrência IA
            </h3>
            <div className="flex items-center gap-3 text-xs font-bold">
              <span className="text-blue-300">Seu Score: {analysisResult.scoreUser}</span>
              <span className="text-purple-300">Top 1 Score: {analysisResult.scoreCompetitor}</span>
            </div>
          </div>

          <div className="rounded-xl bg-[#0c1220] p-3 text-xs border border-slate-800">
            <p className="font-bold text-slate-200">Veredito de Preço & Diferencial:</p>
            <p className="mt-1 text-slate-400 leading-relaxed">{analysisResult.priceGap.verdict}</p>
          </div>

          <div className="rounded-xl bg-[#0c1220] p-3 text-xs border border-slate-800">
            <p className="font-bold text-slate-200">Análise Logística:</p>
            <p className="mt-1 text-slate-400 leading-relaxed">{analysisResult.logisticsAnalysis}</p>
          </div>

          <div>
            <h4 className="text-xs font-bold text-slate-300 mb-2">Palavras-Chave Faltantes (Oportunidade SEO):</h4>
            <div className="flex flex-wrap gap-1.5">
              {(analysisResult?.seoComparison?.missingHighVolumeKeywords || []).map((kw, idx) => (
                <span
                  key={idx}
                  className="rounded-lg bg-blue-950/40 border border-blue-500/30 px-2.5 py-1 text-[11px] text-blue-300 font-medium"
                >
                  +{kw}
                </span>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold text-slate-300 mb-2">Plano de Ação Tático:</h4>
            <div className="space-y-2">
              {(analysisResult?.actionPlan || []).map((item, idx) => (
                <div key={idx} className="rounded-xl bg-[#0c1220] p-3 text-xs border border-slate-800">
                  <p className="font-bold text-blue-300">{item.step}</p>
                  <p className="mt-1 text-slate-300">{item.action}</p>
                </div>
              ))}
            </div>
          </div>

          {analysisResult?.suggestedNewTitle && (
            <div className="rounded-xl bg-blue-950/30 border border-blue-500/30 p-3.5 text-xs">
              <span className="font-bold text-blue-300 block mb-1">
                ✨ Sugestão de Título Matador (SEO):
              </span>
              <p className="mt-1 font-bold text-white text-xs">
                "{analysisResult.suggestedNewTitle}"
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
