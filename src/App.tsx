import React, { useState } from "react";
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

  // Core Application State
  const [orders, setOrders] = useState<OrderItem[]>(initialOrders);
  const [filaments, setFilaments] = useState<Filament[]>(initialFilaments);
  const [printers, setPrinters] = useState<Printer[]>(initialPrinters);
  const [productionCards, setProductionCards] = useState<ProductionCard[]>(initialProductionCards);
  const [savedCalculations, setSavedCalculations] = useState<SavedCalculation[]>(initialSavedCalculations);
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers);
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
    setProductionCards((prev) =>
      prev.map((c) => {
        if (c.id !== cardId) return c;

        // When card is finalized, deduct filament grams from stock automatically!
        if (newStatus === "finalizado" && c.status !== "finalizado") {
          const targetFilamentId = c.filamentId || filaments[0]?.id;
          if (targetFilamentId) {
            handleUpdateFilamentGrams(targetFilamentId, c.weightGrams);
          }

          // If assigned to a printer, release the printer
          if (c.printerId) {
            setPrinters((printersList) =>
              printersList.map((p) =>
                p.id === c.printerId
                  ? { ...p, status: "livre", currentJob: undefined, progressPercent: 0 }
                  : p
              )
            );
          }
        }

        // If moved to printing, set assigned printer as busy
        if (newStatus === "imprimindo" && c.printerId) {
          setPrinters((printersList) =>
            printersList.map((p) =>
              p.id === c.printerId
                ? { ...p, status: "imprimindo", currentJob: c.title, progressPercent: 35 }
                : p
            )
          );
        }

        return { ...c, status: newStatus };
      })
    );
  };

  const handleDeleteCard = (cardId: string) => {
    setProductionCards((prev) => prev.filter((c) => c.id !== cardId));
  };

  // --- SALES & CUSTOMERS ---
  const handleAddOrder = (newOrder: Omit<OrderItem, "id" | "date">) => {
    const created: OrderItem = {
      ...newOrder,
      id: "ord-" + Date.now(),
      date: new Date().toLocaleDateString("pt-BR"),
    };
    setOrders((prev) => [created, ...prev]);

    // Also automatically create or update customer in CRM
    setCustomers((prev) => {
      const existing = prev.find(
        (cust) => cust.name.toLowerCase() === newOrder.clientName.toLowerCase()
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
          name: newOrder.clientName,
          phone: "(11) 99887-6655",
          city: "São Paulo, SP",
          totalOrders: 1,
          totalSpent: newOrder.totalPrice,
          lastOrderDate: new Date().toLocaleDateString("pt-BR"),
        },
        ...prev,
      ];
    });

    // Also prompt to add to production queue
    handleAddProductionCard({
      title: `${newOrder.productName} (${newOrder.clientName})`,
      productName: newOrder.productName,
      clientName: newOrder.clientName,
      orderNumber: newOrder.code,
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
