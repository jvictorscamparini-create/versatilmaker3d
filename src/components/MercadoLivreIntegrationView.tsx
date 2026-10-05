import React from "react";
import { Link2, ExternalLink } from "lucide-react";

export const MercadoLivreIntegrationView: React.FC = () => (
  <div className="mx-auto max-w-xl px-4 py-6 text-slate-100 flex flex-col gap-6">
    <h1 className="text-2xl font-black tracking-tight text-white">Integração Mercado Livre</h1>
    <div className="rounded-2xl border border-slate-800 bg-[#121828] p-5 flex flex-col gap-4">
      <div className="flex items-center justify-between"><Link2 className="h-6 w-6 text-yellow-400" /><span className="rounded-full bg-amber-500/20 px-3 py-1 text-xs text-amber-300">Não configurada</span></div>
      <p className="text-sm text-slate-300">A conexão com Mercado Livre ainda não foi implementada. Os pedidos deste aplicativo são cadastrados manualmente; não há sincronização automática com sua loja.</p>
      <p className="text-xs text-slate-400">Para ativar esta integração será necessário cadastrar um aplicativo na plataforma e implementar a autorização da loja no servidor.</p>
      <a href="https://developers.mercadolivre.com.br/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-blue-400"><ExternalLink className="h-4 w-4" /> Portal de desenvolvedores Mercado Livre</a>
    </div>
  </div>
);
