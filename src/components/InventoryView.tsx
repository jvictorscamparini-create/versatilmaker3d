import React, { useState } from "react";
import {
  Package,
  Plus,
  Search,
  AlertTriangle,
  Boxes,
  Tag,
  Trash2,
  DollarSign,
  TrendingDown,
} from "lucide-react";
import { Filament } from "../types";

interface InventoryViewProps {
  filaments: Filament[];
  onAddFilament: (filament: Omit<Filament, "id">) => void;
  onUpdateFilamentGrams: (filamentId: string, gramsDeducted: number) => void;
  onDeleteFilament: (filamentId: string) => void;
}

export const InventoryView: React.FC<InventoryViewProps> = ({
  filaments,
  onAddFilament,
  onUpdateFilamentGrams,
  onDeleteFilament,
}) => {
  const [activeTab, setActiveTab] = useState<"filamentos" | "produtos" | "marketplace">("filamentos");
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);

  // New Filament Form State
  const [name, setName] = useState("");
  const [brand, setBrand] = useState("Voolt3D");
  const [material, setMaterial] = useState<Filament["material"]>("PLA");
  const [color, setColor] = useState("Preto Fosco");
  const [hexColor, setHexColor] = useState("#1e293b");
  const [weightTotalGrams, setWeightTotalGrams] = useState(1000);
  const [weightRemainingGrams, setWeightRemainingGrams] = useState(1000);
  const [pricePerSpool, setPricePerSpool] = useState(130);

  const filteredFilaments = filaments.filter(
    (f) =>
      f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.material.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.brand.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateFilament = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onAddFilament({
      name,
      brand,
      material,
      color,
      hexColor,
      weightTotalGrams: Number(weightTotalGrams) || 1000,
      weightRemainingGrams: Number(weightRemainingGrams) || 1000,
      pricePerSpool: Number(pricePerSpool) || 130,
      diameterMm: 1.75,
    });

    setName("");
    setShowAddModal(false);
  };

  return (
    <div className="mx-auto max-w-xl px-4 py-6 text-slate-100 flex flex-col gap-5">
      {/* Title & Subtitle (Screenshot 15) */}
      <div>
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600/20 text-blue-400">
            <Package className="h-5 w-5" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white leading-tight">
            Estoque de Filamentos e Produtos
          </h1>
        </div>
        <p className="mt-1 text-xs text-slate-400">Gerencie o Estoque de Filamentos e Produtos</p>
      </div>

      {/* Button + Novo Filamento (Screenshot 15) */}
      <button
        id="btn-new-filament"
        onClick={() => setShowAddModal(true)}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-sm font-bold text-white shadow-md shadow-blue-600/20 hover:bg-blue-500 active:scale-98 transition"
      >
        <Plus className="h-4 w-4" />
        <span>+ Novo Filamento</span>
      </button>

      {/* Tabs: Meus Filamentos / Meus Produtos / Anúncios Marketplace (Screenshot 15) */}
      <div className="flex items-center justify-between border-b border-slate-800 text-xs font-semibold">
        <button
          onClick={() => setActiveTab("filamentos")}
          className={`relative pb-3 font-semibold transition ${
            activeTab === "filamentos"
              ? "text-blue-400 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-blue-500"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          Meus Filamentos
        </button>

        <button
          onClick={() => setActiveTab("produtos")}
          className={`relative pb-3 font-semibold transition ${
            activeTab === "produtos"
              ? "text-blue-400 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-blue-500"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          Meus Produtos
        </button>

        <button
          onClick={() => setActiveTab("marketplace")}
          className={`relative pb-3 font-semibold transition ${
            activeTab === "marketplace"
              ? "text-blue-400 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-blue-500"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          Anúncios Marketplace
        </button>
      </div>

      {/* Search Input (Screenshot 15) */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
        <input
          type="text"
          placeholder="Buscar filamento por nome, marca ou material..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full rounded-xl border border-slate-800 bg-[#121828] py-2.5 pl-10 pr-4 text-xs text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none transition"
        />
      </div>

      {/* Content for Filamentos */}
      {activeTab === "filamentos" && (
        <div className="flex flex-col gap-3">
          {filteredFilaments.length === 0 ? (
            /* Empty State matching Screenshot 15 */
            <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-800/80 bg-[#121828] py-14 px-4 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#0c1220] text-slate-600">
                <Boxes className="h-8 w-8 stroke-1" />
              </div>
              <p className="mt-4 text-xs text-slate-400">
                Nenhum filamento encontrado para esta busca.
              </p>
            </div>
          ) : (
            filteredFilaments.map((filament) => {
              const isLowStock = filament.weightRemainingGrams < 200;
              const percentage = Math.round(
                (filament.weightRemainingGrams / filament.weightTotalGrams) * 100
              );

              return (
                <div
                  key={filament.id}
                  className={`rounded-2xl border p-4 shadow-sm transition ${
                    isLowStock
                      ? "border-amber-500/40 bg-gradient-to-br from-[#121828] to-[#1c1510]"
                      : "border-slate-800 bg-[#121828] hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <span
                        className="h-4 w-4 rounded-full border border-white/20 shadow-xs shrink-0"
                        style={{ backgroundColor: filament.hexColor }}
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-bold text-white">{filament.name}</h3>
                          <span className="rounded bg-slate-800 px-1.5 py-0.5 text-[10px] font-bold text-slate-300">
                            {filament.material}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400">
                          {filament.brand} • R$ {filament.pricePerSpool.toFixed(2)}/rolo
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => onDeleteFilament(filament.id)}
                      aria-label="Excluir filamento"
                      className="text-slate-500 hover:text-red-400 transition"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Weight Progress Bar */}
                  <div className="mt-3.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-300">
                        {filament.weightRemainingGrams}g restantes
                      </span>
                      <span
                        className={`text-xs font-bold ${
                          isLowStock ? "text-amber-400" : "text-blue-400"
                        }`}
                      >
                        {percentage}%
                      </span>
                    </div>
                    <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-slate-800">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          isLowStock ? "bg-amber-500" : "bg-blue-500"
                        }`}
                        style={{ width: `${Math.min(percentage, 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* Warning banner if low stock */}
                  {isLowStock && (
                    <div className="mt-3 flex items-center gap-2 rounded-lg bg-amber-950/40 border border-amber-500/30 p-2 text-[11px] text-amber-300">
                      <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                      <span>Alerta: Menos de 200g restantes. Hora de repor o estoque!</span>
                    </div>
                  )}

                  {/* Quick deduct button */}
                  <div className="mt-3 flex items-center justify-end gap-2 border-t border-slate-800/80 pt-2.5 text-xs">
                    <button
                      onClick={() => onUpdateFilamentGrams(filament.id, 50)}
                      className="flex items-center gap-1 rounded-lg border border-slate-800 bg-[#0d1320] px-2.5 py-1 text-slate-300 hover:bg-slate-800 transition"
                    >
                      <TrendingDown className="h-3 w-3 text-slate-400" />
                      <span>-50g</span>
                    </button>
                    <button
                      onClick={() => onUpdateFilamentGrams(filament.id, 100)}
                      className="flex items-center gap-1 rounded-lg border border-slate-800 bg-[#0d1320] px-2.5 py-1 text-slate-300 hover:bg-slate-800 transition"
                    >
                      <TrendingDown className="h-3 w-3 text-slate-400" />
                      <span>-100g</span>
                    </button>
                    <button
                      onClick={() => onUpdateFilamentGrams(filament.id, -1000)}
                      className="rounded-lg bg-blue-600/20 px-2.5 py-1 text-blue-400 font-semibold hover:bg-blue-600/30 transition"
                    >
                      + Novo Rolo (1kg)
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Content for Meus Produtos */}
      {activeTab === "produtos" && (
        <div className="flex flex-col gap-3">
          <div className="rounded-2xl border border-slate-800 bg-[#121828] p-4 text-xs">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white">Escultura Gato Abstrato</h3>
                <p className="text-[11px] text-slate-400">Pronta Entrega • 4 unidades embaladas</p>
              </div>
              <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 font-bold text-emerald-400 border border-emerald-500/30">
                4 un em estoque
              </span>
            </div>
            <div className="mt-3 flex items-center justify-between border-t border-slate-800 pt-2 text-slate-400">
              <span>Custo Produção: R$ 12,46</span>
              <span className="font-bold text-white">Preço Sugerido: R$ 42,90</span>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-[#121828] p-4 text-xs">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white">Vaso Espiral Minimalista</h3>
                <p className="text-[11px] text-slate-400">Pronta Entrega • 2 unidades</p>
              </div>
              <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 font-bold text-emerald-400 border border-emerald-500/30">
                2 un em estoque
              </span>
            </div>
            <div className="mt-3 flex items-center justify-between border-t border-slate-800 pt-2 text-slate-400">
              <span>Custo Produção: R$ 25,26</span>
              <span className="font-bold text-white">Preço Sugerido: R$ 89,90</span>
            </div>
          </div>
        </div>
      )}

      {/* Content for Anúncios Marketplace */}
      {activeTab === "marketplace" && (
        <div className="flex flex-col gap-3">
          <div className="rounded-2xl border border-slate-800 bg-[#121828] p-4 text-xs">
            <div className="flex items-center justify-between">
              <span className="rounded bg-orange-950/60 text-orange-400 border border-orange-500/30 px-2 py-0.5 font-bold text-[10px]">
                SHOPEE
              </span>
              <span className="text-emerald-400 font-bold">● Sincronizado</span>
            </div>
            <p className="mt-2 text-sm font-bold text-white">
              Escultura Gato Decorativo Minimalista Moderno
            </p>
            <p className="text-[11px] text-slate-400">ID Anúncio: 98124018 • Estoque sincronizado</p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-[#121828] p-4 text-xs">
            <div className="flex items-center justify-between">
              <span className="rounded bg-yellow-950/60 text-yellow-300 border border-yellow-500/30 px-2 py-0.5 font-bold text-[10px]">
                MERCADO LIVRE
              </span>
              <span className="text-emerald-400 font-bold">● Sincronizado</span>
            </div>
            <p className="mt-2 text-sm font-bold text-white">
              Vaso Decorativo Geométrico Design Moderno 22cm
            </p>
            <p className="text-[11px] text-slate-400">ID Anúncio: MLB-294819 • Estoque Full</p>
          </div>
        </div>
      )}

      {/* Modal: Novo Filamento */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-[#0e1424] p-5 shadow-2xl text-slate-200">
            <h2 className="text-lg font-bold text-white">+ Cadastrar Filamento</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Adicione uma bobina ao seu controle inteligente de estoque.
            </p>

            <form onSubmit={handleCreateFilament} className="mt-4 flex flex-col gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-300">Nome do Filamento</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: PLA Preto Fosco Voolt3D"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-800 bg-[#141b2d] px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300">Marca</label>
                  <input
                    type="text"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-800 bg-[#141b2d] px-3 py-2 text-xs text-white focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300">Tipo de Material</label>
                  <select
                    value={material}
                    onChange={(e) => setMaterial(e.target.value as any)}
                    className="mt-1 w-full rounded-xl border border-slate-800 bg-[#141b2d] px-3 py-2 text-xs text-white focus:border-blue-500 focus:outline-none"
                  >
                    <option value="PLA">PLA</option>
                    <option value="PETG">PETG</option>
                    <option value="ABS">ABS</option>
                    <option value="TPU">TPU</option>
                    <option value="Resina">Resina</option>
                    <option value="Nylon">Nylon</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300">Cor</label>
                  <input
                    type="text"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-800 bg-[#141b2d] px-3 py-2 text-xs text-white focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300">Preço do Rolo (R$)</label>
                  <input
                    type="number"
                    min={0}
                    step={0.01}
                    value={pricePerSpool}
                    onChange={(e) => setPricePerSpool(Number(e.target.value))}
                    className="mt-1 w-full rounded-xl border border-slate-800 bg-[#141b2d] px-3 py-2 text-xs text-white focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300">Peso Total (g)</label>
                  <input
                    type="number"
                    value={weightTotalGrams}
                    onChange={(e) => setWeightTotalGrams(Number(e.target.value))}
                    className="mt-1 w-full rounded-xl border border-slate-800 bg-[#141b2d] px-3 py-2 text-xs text-white focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300">Peso Restante (g)</label>
                  <input
                    type="number"
                    value={weightRemainingGrams}
                    onChange={(e) => setWeightRemainingGrams(Number(e.target.value))}
                    className="mt-1 w-full rounded-xl border border-slate-800 bg-[#141b2d] px-3 py-2 text-xs text-white focus:border-blue-500 focus:outline-none"
                  />
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
                  Cadastrar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
