import React, { useState } from "react";
import {
  Users,
  Plus,
  Search,
  MessageCircle,
  ShoppingBag,
  MapPin,
  Calendar,
  DollarSign,
  Phone,
} from "lucide-react";
import { Customer } from "../types";

interface ClientsViewProps {
  customers: Customer[];
  onAddCustomer: (customer: Omit<Customer, "id">) => void;
}

export const ClientsView: React.FC<ClientsViewProps> = ({ customers, onAddCustomer }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);

  // New customer form state
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [city, setCity] = useState("São Paulo, SP");
  const [notes, setNotes] = useState("");

  const filtered = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.phone.includes(searchTerm) ||
      (c.city && c.city.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleCreateCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onAddCustomer({
      name,
      phone,
      email,
      city,
      totalOrders: 0,
      totalSpent: 0,
      lastOrderDate: "",
      notes,
    });

    setName("");
    setPhone("");
    setEmail("");
    setNotes("");
    setShowAddModal(false);
  };

  return (
    <div className="mx-auto max-w-xl px-4 py-6 text-slate-100 flex flex-col gap-5">
      {/* Title & Subtitle */}
      <div>
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600/20 text-blue-400">
            <Users className="h-5 w-5" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white leading-tight">
            Clientes & CRM
          </h1>
        </div>
        <p className="mt-1 text-xs text-slate-400">
          Base de contatos, histórico de pedidos e relacionamento com clientes.
        </p>
      </div>

      {/* Button + Novo Cliente */}
      <button
        id="btn-new-client"
        onClick={() => setShowAddModal(true)}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-sm font-bold text-white shadow-md shadow-blue-600/20 hover:bg-blue-500 active:scale-98 transition"
      >
        <Plus className="h-4 w-4" />
        <span>+ Novo Cliente</span>
      </button>

      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
        <input
          type="text"
          placeholder="Buscar cliente por nome, telefone ou cidade..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full rounded-xl border border-slate-800 bg-[#121828] py-2.5 pl-10 pr-4 text-xs text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
        />
      </div>

      {/* Customers List */}
      <div className="flex flex-col gap-3">
        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-800 p-8 text-center text-xs text-slate-500">
            Nenhum cliente cadastrado ou encontrado nesta busca.
          </div>
        ) : (
          filtered.map((customer) => {
            const cleanPhone = customer.phone.replace(/\D/g, "");
            const whatsappUrl = `https://wa.me/55${cleanPhone}?text=Ol%C3%A1%20${encodeURIComponent(
              customer.name
            )}%2C%20tudo%20bem%3F%20Aqui%20%C3%A9%20da%20Vers%C3%A1til%20Maker!`;

            return (
              <div
                key={customer.id}
                className="rounded-2xl border border-slate-800 bg-[#121828] p-4 shadow-sm transition hover:border-slate-700"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 font-black text-white text-sm">
                      {customer.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white">{customer.name}</h3>
                      <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                        <Phone className="h-3 w-3" />
                        <span>{customer.phone}</span>
                        {customer.city && (
                          <>
                            <span>•</span>
                            <MapPin className="h-3 w-3" />
                            <span>{customer.city}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {cleanPhone && (
                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={`Conversar no WhatsApp com ${customer.name}`}
                      className="flex items-center gap-1 rounded-xl bg-emerald-600/20 border border-emerald-500/30 px-2.5 py-1.5 text-xs font-bold text-emerald-400 hover:bg-emerald-600/30 transition"
                    >
                      <MessageCircle className="h-3.5 w-3.5" />
                      <span>WhatsApp</span>
                    </a>
                  )}
                </div>

                <div className="mt-3.5 grid grid-cols-3 gap-2 border-t border-slate-800/80 pt-3 text-xs">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400">Total Gasto</span>
                    <p className="font-bold text-emerald-400 mt-0.5">
                      R$ {customer.totalSpent.toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400">Pedidos</span>
                    <p className="font-bold text-white mt-0.5">{customer.totalOrders} compras</p>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400">Última Compra</span>
                    <p className="font-bold text-slate-300 mt-0.5">{customer.lastOrderDate}</p>
                  </div>
                </div>

                {customer.notes && (
                  <p className="mt-2.5 rounded-lg bg-[#0c1220] p-2 text-[11px] text-slate-400 border border-slate-800/60">
                    💡 <em>{customer.notes}</em>
                  </p>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Modal: Novo Cliente */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-[#0e1424] p-5 shadow-2xl text-slate-200">
            <h2 className="text-lg font-bold text-white">+ Cadastrar Novo Cliente</h2>
            <p className="text-xs text-slate-400 mt-0.5">Adicione os dados do comprador para fidelização.</p>

            <form onSubmit={handleCreateCustomer} className="mt-4 flex flex-col gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-300">Nome Completo</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: João da Silva"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-800 bg-[#141b2d] px-3 py-2 text-xs text-white focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300">WhatsApp / Telefone</label>
                  <input
                    type="tel"
                    required
                    placeholder="(11) 98765-4321"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-800 bg-[#141b2d] px-3 py-2 text-xs text-white focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300">Cidade / UF</label>
                  <input
                    type="text"
                    placeholder="Curitiba, PR"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-800 bg-[#141b2d] px-3 py-2 text-xs text-white focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300">E-mail (opcional)</label>
                <input
                  type="email"
                  placeholder="cliente@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-800 bg-[#141b2d] px-3 py-2 text-xs text-white focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300">Observações / Preferências</label>
                <textarea
                  rows={2}
                  placeholder="Ex: Prefere peças pretas, cliente de miniaturas RPG..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-800 bg-[#141b2d] px-3 py-2 text-xs text-white focus:border-blue-500 focus:outline-none"
                />
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
                  Salvar Cliente
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
