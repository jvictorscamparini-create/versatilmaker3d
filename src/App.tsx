import React, { useEffect, useState } from "react";
import { usePersistentState } from "./hooks/usePersistentState";
import { parseRecordDate } from "./utils/dates";
import { Header } from "./components/Header";
import { Sidebar } from "./components/Sidebar";
import { LandingPage } from "./components/LandingPage";
import { DashboardView } from "./components/DashboardView";
import { ProductionQueueView } from "./components/ProductionQueueView";
import { InventoryView } from "./components/InventoryView";
import { CalculatorView } from "./components/CalculatorView";
import { MarketAnalysisView } from "./components/MarketAnalysisView";
import { CreativeStudioView } from "./components/CreativeStudioView";
import { SalesView } from "./components/SalesView";
import { ClientsView } from "./components/ClientsView";
import { FinancialView } from "./components/FinancialView";
import { MachinesView } from "./components/MachinesView";
import { ShopeeIntegrationView } from "./components/ShopeeIntegrationView";
import { MercadoLivreIntegrationView } from "./components/MercadoLivreIntegrationView";
import { SettingsView } from "./components/SettingsView";
import { Generator3DView } from "./components/Generator3DView";

import {
  initialCustomers,
  initialFilaments,
  initialOrders,
  initialPrinters,
  initialProductionCards,
  initialSavedCalculations,
} from "./mockData";
import {
  AppView,
  Customer,
  Filament,
  OrderItem,
  Printer,
  ProductionCard,
  SavedCalculation,
} from "./types";

export default function App() {
  const [currentView, setCurrentView] = useState<AppView>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [storageError, setStorageError] = useState(false);
  useEffect(() => {
    const onStorageError = () => setStorageError(true);
    window.addEventListener("versatilmaker:storage-error", onStorageError);
    return () => window.removeEventListener("versatilmaker:storage-error", onStorageError);
  }, []);

  // Core Application State
  const [orders, setOrders] = usePersistentState<OrderItem[]>("orders", initialOrders.map(order => ({...order, date: parseRecordDate(order.date)?.toLocaleDateString("pt-BR") || order.date})));
  const [filaments, setFilaments] = usePersistentState<Filament[]>("filaments", initialFilaments);
  const [printers, setPrinters] = usePersistentState<Printer[]>("printers", initialPrinters);
  const [productionCards, setProductionCards] = usePersistentState<ProductionCard[]>("productionCards", initialProductionCards.map(card => ({...card, filamentDeducted: card.status === "finalizado"})));
  const [savedCalculations, setSavedCalculations] = usePersistentState<SavedCalculation[]>("savedCalculations", initialSavedCalculations);
  const [customers, setCustomers] = usePersistentState<Customer[]>("customers", initialCustomers);
  const [creativeStudioProduct, setCreativeStudioProduct] = useState("Escultura Gato Abstrato Geometrico 3D");

  // Navigation Helper
  const navigateTo = (view: AppView) => {
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // --- FILAMENT ACTIONS ---
  const handleAddFilament = (newFilament: Omit<Filament, "id">) => {
    const created: Filament = {
      ...newFilament,
      id: "f-" + Date.now(),
    };
    setFilaments((prev) => [created, ...prev]);
  };

  const handleUpdateFilamentGrams = (filamentId: string, gramsDeducted: number) => {
    setFilaments((prev) =>
      prev.map((f) => {
        if (f.id !== filamentId) return f;
        const updatedGrams = Math.max(0, f.weightRemainingGrams - gramsDeducted);
        return { ...f, weightRemainingGrams: updatedGrams };
      })
    );
  };

  const handleDeleteFilament = (filamentId: string) => {
    setFilaments((prev) => prev.filter((f) => f.id !== filamentId));
  };

  // --- PRINTER ACTIONS ---
  const handleAddPrinter = (newPrinter: Omit<Printer, "id">) => {
    const created: Printer = {
      ...newPrinter,
      id: "p-" + Date.now(),
    };
    setPrinters((prev) => [...prev, created]);
  };

  const handleUpdatePrinterStatus = (id: string, status: Printer["status"]) => {
    setPrinters((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status } : p))
    );
  };

  const handleDeletePrinter = (id: string) => {
    setPrinters((prev) => prev.filter((p) => p.id !== id));
  };

  // --- PRODUCTION QUEUE ACTIONS ---
  const handleAddProductionCard = (newCard: Omit<ProductionCard, "id" | "createdAt">) => {
    const created: ProductionCard = {
      ...newCard,
      id: "card-" + Date.now(),
      createdAt: new Date().toLocaleDateString("pt-BR"),
    };
    setProductionCards((prev) => [created, ...prev]);

    // If assigned to a printer and started, update that printer
    if (created.printerId && created.status === "imprimindo") {
      setPrinters((prev) =>
        prev.map((p) =>
          p.id === created.printerId
            ? { ...p, status: "imprimindo", currentJob: created.title, progressPercent: 10 }
            : p
        )
      );
    }
  };

  const handleUpdateCardStatus = (cardId: string, newStatus: ProductionCard["status"]) => {
    const card = productionCards.find((item) => item.id === cardId);
    if (!card || card.status === newStatus) return;
    if (newStatus === "finalizado" && !card.filamentDeducted) {
      const filamentId = card.filamentId || filaments[0]?.id;
      if (filamentId) handleUpdateFilamentGrams(filamentId, card.weightGrams);
    }
    if (card.printerId && (newStatus === "imprimindo" || newStatus === "finalizado")) {
      const printing = newStatus === "imprimindo";
      setPrinters((list) => list.map((printer) => printer.id === card.printerId
        ? { ...printer, status: printing ? "imprimindo" : "livre", currentJob: printing ? card.title : undefined, progressPercent: printing ? 35 : 0 }
        : printer));
    }
    setProductionCards((list) => list.map((item) => item.id === cardId ? { ...item, status: newStatus, completedAt: newStatus === "finalizado" ? new Date().toLocaleDateString("pt-BR") : item.completedAt, filamentDeducted: item.filamentDeducted || newStatus === "finalizado" } : item));
  };

  const handleDeleteCard = (cardId: string) => {
    setProductionCards((prev) => prev.filter((c) => c.id !== cardId));
  };

  // --- SALES & CUSTOMERS ---
  const handleAddOrder = (newOrder: Omit<OrderItem, "id" | "date">) => {
    const clientName = newOrder.clientName || newOrder.customerName || "Cliente";
    const created: OrderItem = {
      ...newOrder,
      id: "ord-" + Date.now(),
      date: new Date().toLocaleDateString("pt-BR"),
    };
    setOrders((prev) => [created, ...prev]);

    // Also automatically create or update customer in CRM
    setCustomers((prev) => {
      const existing = prev.find(
        (cust) => cust.name.toLowerCase() === clientName.toLowerCase()
      );
      if (existing) {
        return prev.map((cust) =>
          cust.id === existing.id
            ? {
                ...cust,
                totalOrders: cust.totalOrders + 1,
                totalSpent: cust.totalSpent + newOrder.totalPrice,
                lastOrderDate: new Date().toLocaleDateString("pt-BR"),
              }
            : cust
        );
      }
      return [
        {
          id: "cust-" + Date.now(),
          name: clientName,
          phone: "",
          city: "",
          totalOrders: 1,
          totalSpent: newOrder.totalPrice,
          lastOrderDate: new Date().toLocaleDateString("pt-BR"),
        },
        ...prev,
      ];
    });

    // Also prompt to add to production queue
    handleAddProductionCard({
      title: `${newOrder.productName} (${clientName})`,
      productName: newOrder.productName,
      clientName,
      orderNumber: newOrder.orderCode || newOrder.code,
      origin: newOrder.platform,
      weightGrams: 55,
      printTimeHours: 3.5,
      status: "a_fazer",
      priority: "normal",
      printerId: printers[0]?.id,
      filamentId: filaments[0]?.id,
    });
  };

  const handleAddCustomer = (newCust: Omit<Customer, "id">) => {
    const created: Customer = {
      ...newCust,
      id: "cust-" + Date.now(),
    };
    setCustomers((prev) => [created, ...prev]);
  };

  // --- CALCULATOR ACTIONS ---
  const handleSaveCalculation = (newCalc: SavedCalculation) => {
    setSavedCalculations((prev) => [newCalc, ...prev]);
  };

  const handleSendFromCalculatorToQueue = (name: string, weight: number, time: number) => {
    handleAddProductionCard({
      title: name,
      productName: name,
      origin: "Direto",
      weightGrams: weight,
      printTimeHours: time,
      status: "a_fazer",
      priority: "normal",
      printerId: printers[0]?.id,
      filamentId: filaments[0]?.id,
    });
    navigateTo("fila-producao");
  };

  const handleSendFromCalculatorToCreativeStudio = (name: string) => {
    setCreativeStudioProduct(name);
    navigateTo("estudio-criativo");
  };

  // Unread badge count (pending cards in queue)
  const pendingCount = productionCards.filter((c) => c.status === "a_fazer").length;

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 antialiased selection:bg-blue-600 selection:text-white">
      {/* If currentView === 'landing', show full presentation landing page */}
      {currentView === "landing" ? (
        <LandingPage onEnterApp={(target) => navigateTo(target || "dashboard")} />
      ) : (
        <div className="flex min-h-screen flex-col">
          {/* Header Navigation */}
          <Header
            currentView={currentView}
            onOpenSidebar={() => setSidebarOpen(true)}
            onNavigate={navigateTo}
            unreadCount={pendingCount}
          />

          {/* Sliding Drawer Sidebar */}
          <Sidebar
            isOpen={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
            currentView={currentView}
            onNavigate={navigateTo}
          />

          {/* Main View Router */}
          <main className="flex-1 pb-16">
            {storageError && <div role="alert" className="mx-auto max-w-xl bg-amber-950 p-3 text-sm text-amber-200">Não foi possível salvar neste navegador. Exporte um backup em Configurações antes de fechar a página.</div>}
            {currentView === "dashboard" && (
              <DashboardView
                orders={orders}
                filaments={filaments}
                printers={printers}
                productionCards={productionCards}
                onNavigate={navigateTo}
              />
            )}

            {currentView === "vendas" && (
              <SalesView orders={orders} onAddOrder={handleAddOrder} />
            )}

            {currentView === "clientes" && (
              <ClientsView customers={customers} onAddCustomer={handleAddCustomer} />
            )}

            {currentView === "fila-producao" && (
              <ProductionQueueView
                cards={productionCards}
                printers={printers}
                filaments={filaments}
                onAddCard={handleAddProductionCard}
                onUpdateCardStatus={handleUpdateCardStatus}
                onDeleteCard={handleDeleteCard}
                onNavigateToMachines={() => navigateTo("maquinas")}
              />
            )}

            {currentView === "estoque" && (
              <InventoryView
                filaments={filaments}
                onAddFilament={handleAddFilament}
                onUpdateFilamentGrams={handleUpdateFilamentGrams}
                onDeleteFilament={handleDeleteFilament}
              />
            )}

            {currentView === "maquinas" && (
              <MachinesView
                printers={printers}
                onAddPrinter={handleAddPrinter}
                onUpdatePrinterStatus={handleUpdatePrinterStatus}
                onDeletePrinter={handleDeletePrinter}
              />
            )}

            {(currentView === "calculadora" || currentView === "calculadora-3d") && (
              <CalculatorView
                savedCalculations={savedCalculations}
                onSaveCalculation={handleSaveCalculation}
                onSendToProductionQueue={handleSendFromCalculatorToQueue}
                onSendToCreativeStudio={handleSendFromCalculatorToCreativeStudio}
              />
            )}

            {currentView === "analise-mercado" && <MarketAnalysisView />}

            {currentView === "estudio-criativo" && (
              <CreativeStudioView initialProductName={creativeStudioProduct} />
            )}

            {currentView === "gerador-3d" && (
              <Generator3DView
                onSendToQueue={(title, weight, time) => {
                  handleAddProductionCard({
                    title,
                    productName: title,
                    origin: "Direto",
                    weightGrams: weight,
                    printTimeHours: time,
                    status: "a_fazer",
                    priority: "normal",
                    printerId: printers[0]?.id,
                    filamentId: filaments[0]?.id,
                  });
                  navigateTo("fila-producao");
                }}
              />
            )}

            {currentView === "financeiro" && <FinancialView orders={orders} />}

            {currentView === "integracao-shopee" && <ShopeeIntegrationView />}

            {currentView === "integracao-ml" && <MercadoLivreIntegrationView />}

            {currentView === "configuracoes" && (
              <SettingsView
                orders={orders}
                filaments={filaments}
                printers={printers}
                productionCards={productionCards}
                savedCalculations={savedCalculations}
                customers={customers}
              />
            )}
          </main>
        </div>
      )}
    </div>
  );
}
